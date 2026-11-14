/**
 * Serwer lokalny The Deep State Engine: API kampanii i pliki interfejsu.
 *
 * Działa wyłącznie na 127.0.0.1. Żądania zmieniające stan muszą pochodzić z tej samej strony
 * (nagłówek Origin), żeby żadna obca witryna otwarta w przeglądarce nie mogła sterować kampanią.
 */
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import { z } from 'zod';
import {
  DESK_ACTION_IDS,
  FLIGHT_CLASSIFICATIONS,
  FLIGHT_NOTE_MAX,
  FLIGHT_OUTCOMES,
  FLIGHT_PURPOSES,
  HISTORY_FIDELITY_LEVELS,
  NARRATIVE_SOURCES,
  DeskActionError,
  QuarterError,
  StateLoadError,
  availableDeskActions,
  beginQuarter,
  closeQuarter,
  createInitialState,
  fileMissionReport,
  formatDatePl,
  kspGatePending,
  performDeskAction,
  quarterCode,
  quarterLabel,
  recordKspSnapshot,
  recordNarrative,
  resolveDilemma,
  settleCorrection,
  skipKspGate,
  toNarratorSecrets,
  toPlayerView,
  type GameContent,
  type GameState,
} from '@dse/core';
import { CareerReadError, ConfigNodeParseError, readCareerFile, toKspSnapshot } from '@dse/ksp-bridge';
import {
  DECISION_SECTION_PREFIX,
  NarratorError,
  QUARTER_SECTIONS,
  REPLY_MAX_CHARS,
  RESULT_SECTION,
  ReplyError,
  buildNarratorPackage,
  parseConversationResult,
  parseNarratorReply,
  type NarratorCast,
} from '@dse/narrator';
import type { ApiError, CampaignListItem, DeskPayload, NarratorPackageResponse, TopicImage } from './api.ts';
import { CAMPAIGN_ID, CampaignStore } from './store.ts';

export interface AppOptions {
  content: GameContent;
  store: CampaignStore;
  /** Pliki interfejsu: ścieżka URL → treść i typ. */
  assets: Map<string, { body: string | Buffer; type: string }>;
  /** Folder z pobranymi zdjęciami (data/images/pliki). Bez niego gra działa bez zdjęć. */
  imagesDir?: string;
}

class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const MAX_BODY_BYTES = 256 * 1024;

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'Zbyt duże żądanie.');
    chunks.push(chunk as Buffer);
  }
  if (size === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Treść żądania nie jest poprawnym JSON.');
  }
}

function parseBody<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new HttpError(
      400,
      `Nieprawidłowe dane: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
    );
  }
  return result.data;
}

const newCampaignBody = z.object({
  id: z.string().regex(CAMPAIGN_ID, 'małe litery, cyfry i myślniki, najwyżej 40 znaków'),
  seed: z.string().trim().min(1).max(80),
  historyFidelity: z.enum(HISTORY_FIDELITY_LEVELS).default('high'),
});
const dilemmaBody = z.object({ instanceId: z.string().min(1).max(60), optionId: z.string().min(1).max(60) });
const actionBody = z.object({ action: z.enum(DESK_ACTION_IDS), target: z.string().min(1).max(60).optional() });
const kspBody = z.object({ path: z.string().trim().min(1).max(1000) });
const packageOptions = {
  mode: z.enum(['full', 'short']),
  /** Dołączyć warstwę ukrytą (to, czego Anderson nie wie). */
  secrets: z.boolean().default(false),
  /** Zapisać pakiet do pliku zamiast zwracać treść. */
  toFile: z.boolean().default(false),
};
const instanceId = z.string().min(1).max(60);
const cardCode = z.string().regex(/^W\d{1,3}$/);
const narratorPackageBody = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('quarter'), ...packageOptions }),
  z.object({ kind: z.literal('decision'), instanceId, ...packageOptions }),
  z.object({ kind: z.literal('conversation'), instanceId, ...packageOptions }),
  z.object({ kind: z.literal('event'), card: cardCode, ...packageOptions }),
]);
const narratorReplyBody = z.object({
  kind: z.enum(['quarter', 'decision', 'conversation', 'event']),
  instanceId: instanceId.optional(),
  card: cardCode.optional(),
  source: z.enum(NARRATIVE_SOURCES),
  // Parser i tak przytnie tekst do REPLY_MAX_CHARS; tu tylko bezpieczny zapas na wklejkę z nadmiarem.
  text: z
    .string()
    .min(1)
    .max(REPLY_MAX_CHARS * 2),
});
const flightBody = z.object({
  flightId: z.string().regex(/^M-\d{4}-\d{2,}$/),
  outcome: z.enum(FLIGHT_OUTCOMES),
  purpose: z.enum(FLIGHT_PURPOSES),
  classification: z.enum(FLIGHT_CLASSIFICATIONS),
  note: z.string().max(FLIGHT_NOTE_MAX).optional(),
});
const deleteBody = z.object({ confirm: z.string() });
const settleBody = z.object({ quarter: z.string().regex(/^\d{4}-Q[1-4]$/) });

export function createApp(options: AppOptions): Server {
  const { content, store, assets, imagesDir } = options;
  const imageFiles = new Set((content.images ?? []).map((i) => i.file));

  /** Jawna obsada dla narratora: nazwy frakcji i karty głosu, bez notatek Mistrza Gry. */
  const cast: NarratorCast = {
    factions: content.factions.map((f) => ({ id: f.id, name: f.name, summary: f.summary })),
    voices: Object.fromEntries(
      content.characters.map((c) => [c.id, { register: c.voice.register, habits: [...c.voice.habits] }]),
    ),
  };

  /** Region depeszy: z wątku albo wzorca, do którego odwołuje się wpis. Bez treści świata: brak. */
  const regionOf = (ref: string): string | undefined => {
    const head = ref.split('.')[0] ?? '';
    return (
      content.world?.threads.find((t) => t.id === head)?.region ??
      content.world?.patterns.find((p) => p.id === head)?.region
    );
  };
  /** Liczba jawnych depesz bieżącego kwartału w każdym regionie (Tablica sytuacyjna). */
  const regionBoard = (state: GameState): DeskPayload['regions'] => {
    const now = quarterCode(state.quarter);
    const counts = new Map<string, number>();
    for (const e of state.world.log) {
      if (e.quarter !== now || e.visibility !== 'public') continue;
      const region = regionOf(e.ref);
      if (region) counts.set(region, (counts.get(region) ?? 0) + 1);
    }
    return (content.world?.definition.regions ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      news: counts.get(r.id) ?? 0,
    }));
  };

  /**
   * Zdjęcia według tematu. Do interfejsu trafiają tylko te z manifestu, których plik jest na dysku;
   * autor i licencja pochodzą z pliku źródeł zapisanego przez skrypt pobierania.
   */
  const topicImages = (): Record<string, TopicImage> => {
    if (!imagesDir || !content.images) return {};
    let credits: Record<string, { artist?: string; license?: string }> = {};
    try {
      credits = JSON.parse(readFileSync(join(imagesDir, 'zrodla.json'), 'utf8')) as typeof credits;
    } catch {
      // Brak pliku źródeł: zdjęcia pokażą się bez linii o autorze.
    }
    const out: Record<string, TopicImage> = {};
    for (const image of content.images) {
      if (!existsSync(join(imagesDir, image.file))) continue;
      const c = credits[image.file];
      const credit = c ? [c.artist, c.license].filter(Boolean).join(', ') || null : null;
      for (const topic of image.for) out[topic] ??= { url: `/obrazy/${image.file}`, caption: image.caption, credit };
    }
    return out;
  };

  const payload = (id: string, state: GameState, messages: string[] = []): DeskPayload => ({
    campaign: {
      id,
      seed: state.campaign.seed,
      quarterLabel: quarterLabel(state.quarter),
      quarterCode: quarterCode(state.quarter),
    },
    view: toPlayerView(state),
    actions: availableDeskActions(state, content),
    factions: content.factions.map((f) => {
      const live = state.factions[f.id];
      const agenda = live?.agendaKnown ? f.agendas.find((a) => a.id === live.agenda) : undefined;
      return { id: f.id, name: f.name, summary: f.summary, agendaTitle: agenda?.title ?? null };
    }),
    regions: regionBoard(state),
    launchSites: content.launchSites ?? [],
    images: topicImages(),
    messages,
  });

  async function handleApi(req: IncomingMessage, url: URL): Promise<unknown> {
    const parts = url.pathname.split('/').filter(Boolean); // ['api', 'campaigns', id?, verb?]
    const method = req.method ?? 'GET';
    if (parts[1] !== 'campaigns') throw new HttpError(404, 'Nie ma takiego zasobu.');

    if (parts.length === 2 && method === 'GET') {
      const list = await store.list();
      return list.map(
        (c): CampaignListItem => ({
          id: c.id,
          quarterLabel: quarterLabel(c.state.quarter),
          status: c.state.status,
          savedAt: c.savedAt.toISOString(),
          historyFidelity: c.state.campaign.historyFidelity,
        }),
      );
    }
    if (parts.length === 2 && method === 'POST') {
      const body = parseBody(newCampaignBody, await readJson(req));
      if (await store.exists(body.id)) throw new HttpError(409, `Kampania „${body.id}” już istnieje.`);
      const fresh = createInitialState(content, {
        id: body.id,
        seed: body.seed,
        settings: { historyFidelity: body.historyFidelity },
      });
      const state = beginQuarter(fresh, content).state;
      await store.save(body.id, state);
      return payload(body.id, state);
    }

    const id = parts[2] ?? '';
    if (!CAMPAIGN_ID.test(id)) throw new HttpError(400, 'Nieprawidłowy identyfikator kampanii.');
    if (!(await store.exists(id))) throw new HttpError(404, `Nie ma kampanii „${id}”.`);
    const state = await store.load(id);
    const verb = parts[3];

    if (verb === undefined && method === 'GET') return payload(id, state);
    if (method !== 'POST') throw new HttpError(405, 'Niedozwolona metoda.');

    // Bramka zapisu: kwartał zaczyna się od wczytania zapisu KSP. Do tego czasu nie da się
    // rozstrzygać spraw, działać na Biurku, zamawiać narracji ani zamknąć kwartału.
    const gated = ['dilemma', 'action', 'close-quarter', 'narrator-package', 'narrator-reply', 'flight'];
    if (kspGatePending(state) && gated.includes(verb ?? '')) {
      throw new HttpError(409, 'Najpierw wczytaj zapis kariery KSP za poprzedni kwartał (albo świadomie go pomiń).');
    }

    switch (verb) {
      case 'dilemma': {
        const body = parseBody(dilemmaBody, await readJson(req));
        const next = resolveDilemma(state, requireWorld(content), body.instanceId, body.optionId).state;
        await store.save(id, next);
        return payload(id, next);
      }
      case 'action': {
        const body = parseBody(actionBody, await readJson(req));
        const result = performDeskAction(state, content, body);
        await store.save(id, result.state);
        return payload(id, result.state, [result.summary]);
      }
      case 'close-quarter': {
        await store.backup(id, state);
        const result = closeQuarter(state, content);
        await store.save(id, result.state);
        return payload(id, result.state, result.report.notes);
      }
      case 'ksp': {
        const body = parseBody(kspBody, await readJson(req));
        const path = body.path.trim().replace(/^"(.*)"$/, '$1');
        if (!/\.sfs$/i.test(path)) throw new HttpError(400, 'Wskaż plik zapisu KSP z rozszerzeniem .sfs.');
        let career;
        try {
          career = await readCareerFile(path);
        } catch (e) {
          if (e instanceof CareerReadError || e instanceof ConfigNodeParseError) throw new HttpError(422, e.message);
          throw new HttpError(404, `Nie udało się odczytać pliku: ${path}`);
        }
        // Nowe starty to te, których nie było w migawce z wcześniejszego kwartału.
        const now = quarterCode(state.quarter);
        const known = state.ksp.snapshots.filter((x) => x.quarter < now).at(-1)?.launches ?? 0;
        if (career.launches.length < known) {
          throw new HttpError(
            422,
            `Ten zapis ma mniej startów (${career.launches.length}) niż poprzednio wczytany (${known}). To wygląda na inną albo cofniętą karierę.`,
          );
        }
        const result = recordKspSnapshot(state, toKspSnapshot(career, known), content.launchSites ?? []);
        await store.save(id, result.state);
        const flights = result.flights.length;
        return payload(id, result.state, [
          `Wczytano zapis „${career.title}” z ${formatDatePl(career.date)}. Nowe starty: ${flights}.`,
          ...result.warnings,
        ]);
      }
      case 'ksp-skip': {
        const next = skipKspGate(state);
        await store.save(id, next);
        return payload(id, next, ['Kwartał otwarty bez zapisu KSP. Odnotowano to w Kronice.']);
      }
      case 'flight': {
        const body = parseBody(flightBody, await readJson(req));
        const { flightId, note, ...report } = body;
        const next = fileMissionReport(
          state,
          flightId,
          { ...report, ...(note ? { note } : {}) },
          content.launchSites ?? [],
        );
        await store.save(id, next);
        return payload(id, next);
      }
      case 'delete': {
        const body = parseBody(deleteBody, await readJson(req));
        if (body.confirm !== id) throw new HttpError(400, 'Usunięcie kampanii wymaga potwierdzenia jej nazwą.');
        const trashed = await store.remove(id);
        return { deleted: id, trashed };
      }
      case 'narrator-package': {
        const { secrets, toFile, ...request } = parseBody(narratorPackageBody, await readJson(req));
        let pkg;
        try {
          pkg = buildNarratorPackage(
            toPlayerView(state),
            cast,
            request,
            // Warstwa ukryta wychodzi ze stanu tylko tutaj i tylko na życzenie gracza (decyzja 0019).
            secrets ? toNarratorSecrets(state, content) : undefined,
          );
        } catch (e) {
          if (e instanceof NarratorError) throw new HttpError(409, e.message);
          throw e;
        }
        let file: string | null = null;
        if (toFile) {
          const ref = request.kind === 'quarter' ? '' : `-${'card' in request ? request.card : request.instanceId}`;
          const names = { quarter: 'kwartal', decision: 'glosy', conversation: 'rozmowa', event: 'scena' } as const;
          file = await store.writePackage(id, `${quarterCode(state.quarter)}-${names[request.kind]}${ref}`, pkg.prompt);
        }
        return {
          title: pkg.title,
          secret: pkg.secret,
          chars: pkg.prompt.length,
          prompt: toFile ? null : pkg.prompt,
          file,
        } satisfies NarratorPackageResponse;
      }
      case 'narrator-reply': {
        const body = parseBody(narratorReplyBody, await readJson(req));
        const forDecision = body.kind === 'decision' || body.kind === 'conversation';
        const dilemma = forDecision
          ? state.world.pendingDilemmas.find((d) => d.instanceId === body.instanceId)
          : undefined;
        if (forDecision && !dilemma) throw new HttpError(409, 'Ta sprawa nie czeka już na decyzję.');
        const view = toPlayerView(state);
        const event =
          body.kind === 'event'
            ? view.worldNews.find((n) => n.quarter === quarterCode(state.quarter) && n.card === body.card)
            : undefined;
        if (body.kind === 'event' && !event) throw new HttpError(409, 'Nie ma takiego wydarzenia w tym kwartale.');

        const expected =
          body.kind === 'quarter'
            ? QUARTER_SECTIONS
            : body.kind === 'decision'
              ? [DECISION_SECTION_PREFIX]
              : body.kind === 'conversation'
                ? [RESULT_SECTION, 'SCENA']
                : ['SCENA'];
        let parsed;
        try {
          parsed = parseNarratorReply(body.text, expected);
        } catch (e) {
          if (e instanceof ReplyError) throw new HttpError(422, e.message);
          throw e;
        }

        // Rozmowa: sekcja WYNIK wskazuje opcję. Do narracji trafia reszta, a wybór zatwierdza gracz.
        let suggestion: DeskPayload['suggestion'];
        let sections = parsed.sections;
        const messages = ['Narracja wczytana.', ...parsed.warnings];
        if (body.kind === 'conversation' && dilemma) {
          const index = parseConversationResult(sections, dilemma.options.length);
          const option = index === null ? undefined : dilemma.options[index];
          sections = sections.filter((x) => !x.key.startsWith('wynik'));
          if (sections.length === 0) throw new HttpError(422, 'W odpowiedzi jest tylko blok WYNIK, bez sceny.');
          if (option) {
            suggestion = { instanceId: dilemma.instanceId, optionId: option.id };
            messages.push(`Rozmowa doprowadziła do opcji: ${option.title}. Zatwierdź ją albo wybierz inną.`);
          } else {
            messages.push('Nie znalazłem w odpowiedzi bloku „## WYNIK” z literą opcji. Wybierz opcję samodzielnie.');
          }
        }
        const titles = {
          quarter: `Narracja: ${quarterLabel(state.quarter)}`,
          decision: `Głosy w sprawie: ${dilemma?.title ?? ''}`,
          conversation: `Rozmowa w sprawie: ${dilemma?.title ?? ''}`,
          event: `Scena: ${event?.title ?? ''}`,
        };
        const ref = dilemma?.instanceId ?? (body.kind === 'event' ? body.card : undefined);
        const next = recordNarrative(state, {
          kind: body.kind,
          ...(ref === undefined ? {} : { ref }),
          title: titles[body.kind],
          source: body.source,
          sections,
        });
        await store.save(id, next);
        return { ...payload(id, next, messages), ...(suggestion ? { suggestion } : {}) };
      }
      case 'settle': {
        const body = parseBody(settleBody, await readJson(req));
        const next = settleCorrection(state, body.quarter);
        await store.save(id, next);
        return payload(id, next);
      }
      default:
        throw new HttpError(404, 'Nie ma takiej operacji.');
    }
  }

  return createServer((req, res) => {
    void respond(req, res);
  });

  async function respond(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    try {
      assertLocalHost(req);
      if (url.pathname.startsWith('/api/')) {
        if (req.method !== 'GET') assertSameOrigin(req);
        send(res, 200, await handleApi(req, url));
        return;
      }
      if (url.pathname.startsWith('/obrazy/') && req.method === 'GET') {
        // Tylko pliki wymienione w manifeście: nazwa z adresu nigdy nie staje się dowolną ścieżką.
        const name = decodeURIComponent(url.pathname.slice('/obrazy/'.length));
        if (!imagesDir || !imageFiles.has(name)) throw new HttpError(404, 'Nie ma takiego zdjęcia.');
        let body: Buffer;
        try {
          body = await readFile(join(imagesDir, name));
        } catch {
          throw new HttpError(404, 'Nie ma takiego zdjęcia.');
        }
        res.writeHead(200, {
          'Content-Type': name.endsWith('.png') ? 'image/png' : 'image/jpeg',
          'Cache-Control': 'max-age=3600',
          'X-Content-Type-Options': 'nosniff',
        });
        res.end(body);
        return;
      }
      const asset = assets.get(url.pathname === '/' ? '/index.html' : url.pathname);
      if (!asset || req.method !== 'GET') throw new HttpError(404, 'Nie ma takiej strony.');
      res.writeHead(200, {
        'Content-Type': asset.type,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:",
      });
      res.end(asset.body);
    } catch (e) {
      const known =
        e instanceof HttpError
          ? e
          : e instanceof DeskActionError || e instanceof QuarterError
            ? new HttpError(409, e.message)
            : e instanceof StateLoadError
              ? new HttpError(500, e.message)
              : e instanceof Error && /Nie ma oczekującego dylematu|nie ma opcji/.test(e.message)
                ? new HttpError(409, e.message)
                : null;
      if (!known) console.error(e);
      send(res, known?.status ?? 500, {
        error: known?.message ?? 'Błąd serwera. Szczegóły są w oknie terminala.',
      } satisfies ApiError);
    }
  }
}

function requireWorld(content: GameContent) {
  if (!content.world) throw new HttpError(500, 'Treść gry nie zawiera wydarzeń świata (data/events).');
  return content.world;
}

/**
 * Każde żądanie musi być skierowane do adresu lokalnego. Chroni to przed stroną, która podstawia
 * własną nazwę domeny pod 127.0.0.1 (DNS rebinding) i próbuje czytać kampanię.
 */
function assertLocalHost(req: IncomingMessage): void {
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host ?? ''))
    throw new HttpError(403, 'Serwer przyjmuje tylko połączenia lokalne.');
}

/** Żądania zmieniające stan przyjmujemy tylko z naszej własnej strony. */
function assertSameOrigin(req: IncomingMessage): void {
  const origin = req.headers.origin;
  const host = req.headers.host ?? '';
  if (origin !== undefined && origin !== `http://${host}`)
    throw new HttpError(403, 'Żądanie z obcej strony zostało odrzucone.');
  if (!(req.headers['content-type'] ?? '').startsWith('application/json'))
    throw new HttpError(415, 'Oczekiwano danych w formacie JSON.');
}

function send(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(text);
}
