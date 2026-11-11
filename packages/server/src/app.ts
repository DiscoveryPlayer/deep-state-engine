/**
 * Serwer lokalny The Deep State Engine: API kampanii i pliki interfejsu.
 *
 * Działa wyłącznie na 127.0.0.1. Żądania zmieniające stan muszą pochodzić z tej samej strony
 * (nagłówek Origin), żeby żadna obca witryna otwarta w przeglądarce nie mogła sterować kampanią.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { z } from 'zod';
import {
  DESK_ACTION_IDS,
  DeskActionError,
  QuarterError,
  StateLoadError,
  availableDeskActions,
  beginQuarter,
  closeQuarter,
  createInitialState,
  performDeskAction,
  quarterCode,
  quarterLabel,
  recordKspSnapshot,
  resolveDilemma,
  settleCorrection,
  toPlayerView,
  type GameContent,
  type GameState,
} from '@dse/core';
import { CareerReadError, ConfigNodeParseError, readCareerFile, toKspSnapshot } from '@dse/ksp-bridge';
import type { ApiError, CampaignListItem, DeskPayload } from './api.ts';
import { CAMPAIGN_ID, CampaignStore } from './store.ts';

export interface AppOptions {
  content: GameContent;
  store: CampaignStore;
  /** Pliki interfejsu: ścieżka URL → treść i typ. */
  assets: Map<string, { body: string | Buffer; type: string }>;
}

class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const MAX_BODY_BYTES = 64 * 1024;

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
});
const dilemmaBody = z.object({ instanceId: z.string().min(1).max(60), optionId: z.string().min(1).max(60) });
const actionBody = z.object({ action: z.enum(DESK_ACTION_IDS), target: z.string().min(1).max(60).optional() });
const kspBody = z.object({ path: z.string().trim().min(1).max(1000) });
const settleBody = z.object({ quarter: z.string().regex(/^\d{4}-Q[1-4]$/) });

export function createApp(options: AppOptions): Server {
  const { content, store, assets } = options;

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
    launchSites: content.launchSites ?? [],
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
        }),
      );
    }
    if (parts.length === 2 && method === 'POST') {
      const body = parseBody(newCampaignBody, await readJson(req));
      if (await store.exists(body.id)) throw new HttpError(409, `Kampania „${body.id}” już istnieje.`);
      const state = beginQuarter(createInitialState(content, { id: body.id, seed: body.seed }), content).state;
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
        const result = recordKspSnapshot(
          state,
          toKspSnapshot(career, quarterCode(state.quarter)),
          content.launchSites ?? [],
        );
        await store.save(id, result.state);
        return payload(id, result.state, [
          `Wczytano zapis „${career.title}” z dnia ${career.date}.`,
          ...result.warnings,
        ]);
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
