/**
 * Sala kontroli PACE — interfejs gry w przeglądarce.
 *
 * Układ jak w sali kontroli misji: u góry oś czasu kampanii, pod nią wskaźniki, po lewej
 * stanowiska frakcji, w środku zakładki pracy, po prawej sprawy do decyzji i zamknięcie kwartału.
 * Strona pokazuje wyłącznie to, co wie Anderson (widok gracza z serwera).
 */
import {
  ApiFailure,
  api,
  type HistoryFidelity,
  type NarratorTarget,
  type CampaignListItem,
  type DeskPayload,
} from './api.ts';
import { h, plural, quarterName, signed } from './dom.ts';
import { INDICATOR_NAMES, TABS, renderPanel, type TabId } from './panels.ts';
import {
  SETTING_CHOICES,
  applySettings,
  lastCampaign,
  loadSettings,
  rememberCampaign,
  saveSettings,
  type Settings,
} from './settings.ts';

import { findNarrative, liaisonBody, quarterNarrative, sparkline, voices, type LiaisonState } from './narrator.ts';
import {
  campaignTable,
  deckPages,
  draftFor,
  gateBody,
  howToPlay,
  type FlightDraft,
  type GateState,
} from './opening.ts';

interface AppState {
  payload: DeskPayload | null;
  campaigns: CampaignListItem[];
  tab: TabId;
  newsQuarter: string;
  openStation: string | null;
  /** Opcja wskazana w sprawie do decyzji; czeka na zatwierdzenie drugim kliknięciem. */
  armed: { instanceId: string; optionId: string } | null;
  busy: boolean;
  notices: { id: number; kind: 'info' | 'error'; text: string }[];
  /** Menu główne albo gra. Menu można otworzyć także w trakcie kampanii. */
  screen: 'menu' | 'game';
  dialog: 'settings' | 'close' | 'liaison' | 'reader' | 'gate' | 'deck' | null;
  /** Bramka zapisu KSP: wpisana ścieżka i potwierdzanie pominięcia. */
  gate: GateState;
  /** Która strona odprawy (kart wydarzeń) jest otwarta. */
  deck: number;
  /** Kampania, której usunięcie czeka na potwierdzenie w menu. */
  deleteArmed: string | null;
  /** Niezapisane zmiany w Raportach Misji: lot → wartości formularza. */
  flightDrafts: Record<string, FlightDraft>;
  /** Okno Łącznika AI: co zamawiamy u narratora i co gracz już wkleił. */
  liaison: LiaisonState | null;
  /** Identyfikator narracji otwartej w czytniku. */
  reader: string | null;
  /** Wierność historii wybrana w formularzu nowej kampanii. */
  fidelity: HistoryFidelity;
  settings: Settings;
}

const root = document.getElementById('app')!;
const state: AppState = {
  payload: null,
  campaigns: [],
  tab: 'biurko',
  newsQuarter: '',
  openStation: null,
  armed: null,
  busy: false,
  notices: [],
  screen: 'menu',
  dialog: null,
  gate: { path: '', skipArmed: false },
  deck: 0,
  deleteArmed: null,
  flightDrafts: {},
  liaison: null,
  reader: null,
  fidelity: 'high',
  settings: loadSettings(),
};
let noticeSeq = 0;

// ── Operacje ────────────────────────────────────────────────────────────────

/** Po tylu milisekundach komunikat informacyjny znika sam. Błędy zostają do zamknięcia. */
const NOTICE_LIFETIME_MS = 7000;

function notify(kind: 'info' | 'error', text: string): void {
  const id = ++noticeSeq;
  state.notices = [...state.notices.slice(-2), { id, kind, text }];
  if (kind === 'info') {
    setTimeout(() => {
      state.notices = state.notices.filter((n) => n.id !== id);
      // Usuwamy sam komunikat, bez przerysowania strony: gracz może właśnie pisać w oknie.
      root.querySelector(`[data-notice="${id}"]`)?.remove();
    }, NOTICE_LIFETIME_MS);
  }
}

function accept(payload: DeskPayload, followQuarter: boolean): void {
  const previous = state.payload?.campaign.quarterCode;
  state.payload = payload;
  rememberCampaign(payload.campaign.id);
  if (followQuarter || state.newsQuarter === '' || state.newsQuarter === previous) {
    state.newsQuarter = payload.campaign.quarterCode;
  }
  // Udana operacja zamyka wcześniejsze błędy: gracz właśnie poprawił to, czego dotyczyły.
  state.notices = state.notices.filter((n) => n.kind !== 'error');
  for (const m of payload.messages) notify('info', m);
  state.screen = 'game';
  // Kwartał zaczyna się od zapisu KSP: dopóki go nie ma, na wierzchu jest okno bramki.
  if (gatePending(payload)) {
    state.dialog = 'gate';
    if (state.gate.path === '') state.gate.path = recall(`dse.zapis.${payload.campaign.id}`);
  }
}

const gatePending = (p: DeskPayload) =>
  p.view.status === 'active' &&
  p.view.kspGate.status === 'pending' &&
  p.view.kspGate.quarter === p.campaign.quarterCode;

/** Drobne wygody zapamiętywane w tej przeglądarce (ścieżka zapisu, wybór warstwy ukrytej). */
function recall(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}
function remember(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Pamięć przeglądarki bywa wyłączona; gra działa bez niej.
  }
}

/** Wykonuje operację na serwerze, blokuje przyciski na czas trwania i pokazuje błąd po polsku. */
async function run(operation: () => Promise<DeskPayload>, followQuarter = false): Promise<boolean> {
  if (state.busy) return false;
  let ok = false;
  state.busy = true;
  render();
  try {
    accept(await operation(), followQuarter);
    ok = true;
  } catch (e) {
    notify('error', e instanceof ApiFailure ? e.message : 'Coś poszło nie tak. Spróbuj ponownie.');
  } finally {
    state.busy = false;
    render();
  }
  return ok;
}

// ── Łącznik AI ──────────────────────────────────────────────────────────────

const SECRETS_KEY = 'dse.narrator.ukryta';

function liaisonTarget(l: LiaisonState): NarratorTarget {
  if (l.kind === 'event' && l.card !== undefined) return { kind: 'event', card: l.card };
  if ((l.kind === 'decision' || l.kind === 'conversation') && l.instanceId !== undefined) {
    return { kind: l.kind, instanceId: l.instanceId };
  }
  return { kind: 'quarter' };
}

/** Pobiera pakiet dla narratora. Wynik trafia do okna, jeśli gracz go w międzyczasie nie zamknął. */
async function loadPackage(): Promise<void> {
  const l = state.liaison;
  if (!l || !state.payload) return;
  try {
    const pkg = await api.narratorPackage(campaignId(), liaisonTarget(l), {
      mode: l.mode,
      secrets: l.secrets,
      toFile: false,
    });
    if (state.liaison !== l) return;
    l.pkg = pkg;
  } catch (e) {
    notify('error', e instanceof ApiFailure ? e.message : 'Nie udało się przygotować pakietu.');
  }
  render();
}

function openLiaison(kind: LiaisonState['kind'], ref?: string): void {
  const p = state.payload;
  if (!p) return;
  const last = p.view.narrative.at(-1);
  state.liaison = {
    kind,
    ...(ref === undefined ? {} : kind === 'event' ? { card: ref } : { instanceId: ref }),
    // Pierwszy pakiet w kampanii niesie zasady i opis świata; kolejne mogą iść do tej samej rozmowy.
    // Rozmowa prowadząca do decyzji jest wieloturowa, więc najlepiej zaczyna się w nowym czacie.
    mode: last && kind !== 'conversation' ? 'short' : 'full',
    source: last?.source ?? 'claude',
    secrets: recall(SECRETS_KEY) === 'tak',
    pkg: null,
    file: null,
    reply: '',
    copied: false,
  };
  state.dialog = 'liaison';
  render();
  void loadPackage();
}

function reloadPackage(l: LiaisonState): void {
  l.pkg = null;
  l.file = null;
  l.copied = false;
  render();
  void loadPackage();
}

async function copyPackage(): Promise<void> {
  const l = state.liaison;
  if (!l?.pkg?.prompt) return;
  try {
    await navigator.clipboard.writeText(l.pkg.prompt);
    l.copied = true;
  } catch {
    if (l.secrets) {
      notify('error', 'Nie mam dostępu do schowka. Użyj przycisku „Zapisz do pliku” i załącz plik w rozmowie.');
    } else {
      // Schowek bywa zablokowany: zaznaczamy tekst, żeby gracz skopiował go sam.
      notify('info', 'Nie mam dostępu do schowka. Zaznaczyłem pakiet: skopiuj go przez Ctrl i C.');
    }
    render();
    if (!l.secrets) root.querySelector<HTMLTextAreaElement>('#liaison-package')?.select();
    return;
  }
  render();
}

async function savePackageFile(): Promise<void> {
  const l = state.liaison;
  if (!l || !state.payload) return;
  try {
    const saved = await api.narratorPackage(campaignId(), liaisonTarget(l), {
      mode: l.mode,
      secrets: l.secrets,
      toFile: true,
    });
    if (state.liaison !== l) return;
    l.file = saved.file;
  } catch (e) {
    notify('error', e instanceof ApiFailure ? e.message : 'Nie udało się zapisać pakietu.');
  }
  render();
}

async function submitReply(): Promise<void> {
  const l = state.liaison;
  if (!l) return;
  if (l.reply.trim() === '') {
    notify('error', 'Najpierw wklej odpowiedź narratora.');
    render();
    return;
  }
  const ok = await run(() => api.narratorReply(campaignId(), liaisonTarget(l), l.source, l.reply));
  const p = state.payload;
  if (!ok || !p) return;
  state.liaison = null;
  // Rozmowa wskazuje opcję: zaznaczamy ją w sprawie, a zatwierdza gracz.
  if (p.suggestion) state.armed = { ...p.suggestion };
  if (l.kind === 'event') {
    // Scena trafia na kartę wydarzenia, więc wracamy do odprawy na tej karcie.
    const cards = p.view.worldNews.filter((n) => n.quarter === p.campaign.quarterCode && n.card !== null);
    const index = cards.findIndex((n) => n.card === l.card);
    state.deck = (p.view.reports.length > 0 ? 1 : 0) + Math.max(0, index);
    state.dialog = 'deck';
  } else {
    const entry = findNarrative(p.view.narrative, p.campaign.quarterCode, l.kind, l.instanceId);
    state.reader = entry?.id ?? null;
    state.dialog = entry ? 'reader' : null;
  }
  render();
}

function openReader(id: string): void {
  state.reader = id;
  state.dialog = 'reader';
  render();
}

function openDeck(index = 0): void {
  state.deck = index;
  state.dialog = 'deck';
  render();
}

const campaignId = () => state.payload!.campaign.id;

// ── Fragmenty ekranu ────────────────────────────────────────────────────────

const DISPOSITION = ['wrogie', 'niechętne', 'chłodne', 'neutralne', 'życzliwe', 'przychylne', 'oddane'];
const ESCALATION = ['', 'Napięcie', 'Opór', 'Ofensywa', 'Bunt'];
const NG_NAMES = ['', 'Krawędź', 'Kryzys', 'Napięcie', 'Stan normalny', 'Odprężenie'];

function lamp(level: 'ok' | 'warn' | 'bad' | 'off', label: string): HTMLElement {
  return h('span', { class: `lamp lamp-${level}`, role: 'img', 'aria-label': label });
}

function timeline(p: DeskPayload): HTMLElement {
  const current = p.campaign.quarterCode;
  const [endYear, endQ] = [Number(current.slice(0, 4)), Number(current.slice(6))];
  const years: HTMLElement[] = [];
  for (let year = 1951; year <= endYear; year++) {
    const quarters = [1, 2, 3, 4]
      .filter((q) => year < endYear || q <= endQ)
      .map((q) => {
        const code = `${year}-Q${q}`;
        return h(
          'button',
          {
            class: `tick${code === current ? ' is-now' : ''}${code === state.newsQuarter ? ' is-shown' : ''}`,
            title: quarterName(code),
            'aria-label': `Pokaż depesze: ${quarterName(code)}`,
            'aria-pressed': code === state.newsQuarter,
            onClick: () => {
              state.newsQuarter = code;
              state.tab = 'depesze';
              render();
            },
          },
          String(q),
        );
      });
    years.push(
      h(
        'div',
        { class: 'year' },
        h('span', { class: 'year-label' }, String(year)),
        h('div', { class: 'ticks' }, quarters),
      ),
    );
  }
  return h('nav', { class: 'timeline', 'aria-label': 'Oś czasu kampanii', 'data-scroll': 'timeline' }, years);
}

function topBar(p: DeskPayload): HTMLElement {
  return h(
    'header',
    { class: 'topbar' },
    h(
      'div',
      { class: 'brand' },
      h('span', { class: 'brand-mark' }, p.view.organization.acronym),
      h('span', { class: 'brand-name' }, p.view.organization.fullName),
    ),
    h(
      'div',
      { class: 'now' },
      h('span', { class: 'now-label' }, 'Kwartał'),
      h('strong', null, p.campaign.quarterLabel),
    ),
    timeline(p),
    h(
      'div',
      { class: 'top-actions' },
      h('button', { class: 'btn btn-quiet', onClick: () => openDeck() }, 'Odprawa'),
      h('button', { class: 'btn btn-quiet', onClick: () => openLiaison('quarter') }, 'Narrator'),
      h(
        'button',
        {
          class: 'btn btn-quiet',
          onClick: () => {
            state.screen = 'menu';
            state.dialog = null;
            void refreshCampaigns();
          },
        },
        'Menu',
      ),
      h('button', { class: 'btn btn-quiet', onClick: () => openDialog('settings') }, 'Ustawienia'),
    ),
  );
}

function meter(id: 'ZW' | 'SO' | 'PP' | 'WF', value: number, previous: number, history: number[]): HTMLElement {
  const level = value < 25 ? 'bad' : value < 40 ? 'warn' : 'ok';
  const delta = value - previous;
  return h(
    'div',
    { class: `meter meter-${level}`, title: `${INDICATOR_NAMES[id]}: ${value} na 100` },
    h(
      'div',
      { class: 'meter-head' },
      h('span', { class: 'meter-name' }, INDICATOR_NAMES[id]),
      h('b', null, String(value)),
    ),
    h(
      'div',
      {
        class: 'meter-track',
        role: 'meter',
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': value,
        'aria-label': INDICATOR_NAMES[id],
      },
      h('div', { class: 'meter-fill', style: `inline-size:${value}%` }),
    ),
    delta === 0
      ? null
      : h('span', { class: `meter-delta ${delta > 0 ? 'up' : 'down'}` }, `${signed(delta)} od początku kwartału`),
    sparkline([...history, value], `Przebieg: ${INDICATOR_NAMES[id]} w ostatnich kwartałach`),
  );
}

function statusRow(p: DeskPayload): HTMLElement {
  const { indicators, currencies, budget } = p.view;
  const before = p.view.quarterStart;
  const upcoming = budget.upcoming.reduce((s, i) => s + i.units, 0);
  const unsettled = budget.ledger.filter((e) => !e.settled).length;
  // Ostatnie trzy lata: stan wskaźnika po zamknięciu każdego kwartału.
  const trail = (id: 'ZW' | 'SO' | 'PP' | 'WF') => p.view.reports.slice(-12).map((r) => r.after[id]);
  return h(
    'section',
    { class: 'status', 'aria-label': 'Wskaźniki' },
    meter('ZW', indicators.ZW, before.ZW, trail('ZW')),
    meter('SO', indicators.SO, before.SO, trail('SO')),
    meter('PP', indicators.PP, before.PP, trail('PP')),
    meter('WF', indicators.WF, before.WF, trail('WF')),
    h(
      'div',
      { class: 'readout', title: 'Napięcie Geopolityczne: od 5 (odprężenie) do 1 (krawędź)' },
      h('span', { class: 'meter-name' }, INDICATOR_NAMES.NG),
      h(
        'div',
        { class: 'ng' },
        [5, 4, 3, 2, 1].map((n) =>
          h('span', {
            class: `ng-step${n >= indicators.NG ? ' is-on' : ''}${n === indicators.NG ? ' is-now' : ''} ng-${n}`,
          }),
        ),
      ),
      h('b', null, NG_NAMES[indicators.NG] ?? ''),
    ),
    h(
      'div',
      { class: 'readout' },
      h('span', { class: 'meter-name' }, 'Uwaga Dowódcy'),
      h(
        'div',
        { class: 'pips', role: 'img', 'aria-label': `${currencies.UD} punktów` },
        Array.from({ length: Math.max(6, currencies.UD) }, (_, i) =>
          h('span', { class: `pip${i < currencies.UD ? ' is-on' : ''}` }),
        ),
      ),
      h('b', null, `${currencies.UD} ${plural(currencies.UD, 'punkt', 'punkty', 'punktów')}`),
    ),
    h(
      'div',
      { class: 'readout' },
      h('span', { class: 'meter-name' }, 'Kapitał Polityczny'),
      h('b', { class: 'big' }, String(currencies.KP)),
    ),
    h(
      'button',
      {
        class: 'readout readout-btn',
        onClick: () => {
          state.tab = 'budzet';
          render();
        },
      },
      h('span', { class: 'meter-name' }, 'Korekta budżetu w tym kwartale'),
      h('b', { class: `big${upcoming < 0 ? ' down' : upcoming > 0 ? ' up' : ''}` }, `${signed(upcoming, 1)} jedn.`),
      unsettled > 0 ? h('span', { class: 'meter-delta down' }, `${unsettled} do zastosowania w KSP`) : null,
    ),
  );
}

function stations(p: DeskPayload): HTMLElement {
  const clocks = new Map(p.view.clocks.map((c) => [c.id, c]));
  return h(
    'aside',
    { class: 'stations', 'aria-label': 'Stanowiska frakcji', 'data-scroll': 'stations' },
    h('h2', null, 'Stanowiska'),
    h(
      'ul',
      null,
      p.view.factions.map((f) => {
        const info = p.factions.find((x) => x.id === f.id);
        const clock = clocks.get(`patience-${f.id}`);
        const level =
          f.escalation >= 2 || f.disposition <= -2 ? 'bad' : f.escalation === 1 || f.disposition < 0 ? 'warn' : 'ok';
        const open = state.openStation === f.id;
        return h(
          'li',
          { class: `station${open ? ' is-open' : ''}` },
          h(
            'button',
            {
              class: 'station-head',
              'aria-expanded': open,
              onClick: () => {
                state.openStation = open ? null : f.id;
                render();
              },
            },
            lamp(level, `Stan: ${DISPOSITION[f.disposition + 3]}`),
            h('span', { class: 'station-id' }, f.id),
            h('span', { class: 'station-name' }, info?.name ?? f.id),
            h(
              'span',
              { class: 'station-mood' },
              f.escalation > 0 ? ESCALATION[f.escalation] : DISPOSITION[f.disposition + 3],
            ),
          ),
          open
            ? h(
                'div',
                { class: 'station-body' },
                h('p', null, info?.summary ?? ''),
                h(
                  'dl',
                  { class: 'facts' },
                  h('dt', null, 'Wpływ'),
                  h('dd', null, `${f.influence} na 5`),
                  h('dt', null, 'Nastawienie'),
                  h('dd', null, `${DISPOSITION[f.disposition + 3]} (${signed(f.disposition)})`),
                  h('dt', null, 'Cierpliwość'),
                  h(
                    'dd',
                    null,
                    clock && clock.segments !== null && clock.filled !== null
                      ? h(
                          'span',
                          {
                            class: 'clock',
                            role: 'img',
                            'aria-label': `Wyczerpane ${clock.filled} z ${clock.segments}`,
                          },
                          Array.from({ length: clock.segments }, (_, i) =>
                            h('span', { class: `seg${i < clock.filled! ? ' is-on' : ''}` }),
                          ),
                        )
                      : 'nieznana',
                  ),
                  h('dt', null, 'Agenda'),
                  h('dd', null, info?.agendaTitle ?? f.agenda ?? 'nieznana, poznasz ją na Spotkaniu'),
                ),
              )
            : null,
        );
      }),
    ),
  );
}

function decisions(p: DeskPayload): HTMLElement {
  const pending = p.view.pendingDilemmas;
  const keys = 'ABCDEF';
  return h(
    'section',
    { class: `decisions${pending.length > 0 ? ' has-pending' : ''}`, 'aria-label': 'Sprawy do decyzji' },
    h(
      'h2',
      null,
      'Sprawy do decyzji',
      pending.length > 0 ? h('span', { class: 'count' }, String(pending.length)) : null,
    ),
    pending.length === 0
      ? h('p', { class: 'empty' }, 'Biurko jest czyste. Nowe sprawy przyjdą z depeszami kolejnych kwartałów.')
      : pending.map((d) =>
          h(
            'article',
            { class: 'decision' },
            h('h3', null, d.title),
            h('p', null, d.prompt),
            h(
              'p',
              { class: 'meta' },
              d.fromThread ? 'Twój wybór zmieni bieg wydarzeń. ' : '',
              `Bez decyzji sprawa rozstrzygnie się sama: ${quarterName(d.expiresIn)}.`,
            ),
            h(
              'div',
              { class: 'options' },
              d.options.map((o, i) => {
                const armed = state.armed?.instanceId === d.instanceId && state.armed.optionId === o.id;
                return h(
                  'button',
                  {
                    class: `option${armed ? ' is-armed' : ''}`,
                    disabled: state.busy,
                    'aria-pressed': armed,
                    'data-focus': `opcja-${d.instanceId}-${o.id}`,
                    onClick: () => {
                      state.armed = armed ? null : { instanceId: d.instanceId, optionId: o.id };
                      render();
                    },
                  },
                  h('span', { class: 'option-key', 'aria-hidden': 'true' }, keys[i] ?? '?'),
                  h('span', null, o.title),
                );
              }),
            ),
            confirmRow(d),
            adviserRow(d),
          ),
        ),
  );
}

/** Głosy doradców: narracja AI do tej sprawy albo przycisk, który ją zamawia. */
function adviserRow(d: DeskPayload['view']['pendingDilemmas'][number]): HTMLElement {
  const p = state.payload!;
  const entry = findNarrative(p.view.narrative, p.campaign.quarterCode, 'decision', d.instanceId);
  const talk = findNarrative(p.view.narrative, p.campaign.quarterCode, 'conversation', d.instanceId);
  return h(
    'div',
    { class: 'advisers' },
    talk
      ? h(
          'article',
          { class: 'sheet sheet-small' },
          h('h4', null, 'Rozmowa w gabinecie'),
          talk.sections.map((x) => h('p', null, x.body)),
        )
      : null,
    entry ? voices(entry) : null,
    h(
      'div',
      { class: 'step-actions' },
      h(
        'button',
        {
          class: 'btn btn-small btn-quiet',
          disabled: state.busy,
          onClick: () => openLiaison('decision', d.instanceId),
        },
        entry ? 'Głosy doradców jeszcze raz' : 'Wysłuchaj doradców',
      ),
      h(
        'button',
        {
          class: 'btn btn-small btn-quiet',
          disabled: state.busy,
          onClick: () => openLiaison('conversation', d.instanceId),
        },
        talk ? 'Rozegraj rozmowę jeszcze raz' : 'Rozegraj rozmowę z narratorem',
      ),
    ),
  );
}

/** Decyzji nie da się cofnąć, więc wybór opcji trzeba zatwierdzić osobnym przyciskiem. */
function confirmRow(d: DeskPayload['view']['pendingDilemmas'][number]): HTMLElement | null {
  const armed = state.armed;
  const option = armed?.instanceId === d.instanceId ? d.options.find((o) => o.id === armed.optionId) : undefined;
  if (!armed || !option) return null;
  return h(
    'div',
    { class: 'confirm' },
    h('p', null, `Wybrano: ${option.title}. Tej decyzji nie da się cofnąć.`),
    h(
      'div',
      { class: 'confirm-actions' },
      h(
        'button',
        {
          class: 'btn btn-primary',
          disabled: state.busy,
          'data-focus': `zatwierdz-${d.instanceId}`,
          onClick: () => {
            state.armed = null;
            void run(() => api.decide(campaignId(), d.instanceId, option.id));
          },
        },
        'Zatwierdź decyzję',
      ),
      h(
        'button',
        {
          class: 'btn',
          disabled: state.busy,
          onClick: () => {
            state.armed = null;
            render();
          },
        },
        'Jeszcze się zastanowię',
      ),
    ),
  );
}

function situations(p: DeskPayload): HTMLElement | null {
  const list = p.view.situations;
  if (list.length === 0) return null;
  return h(
    'section',
    { class: 'situations', 'aria-label': 'Sytuacje trwające' },
    h('h2', null, 'Sytuacje trwające'),
    h(
      'ul',
      null,
      list.map((s) =>
        h(
          'li',
          null,
          h('strong', null, s.title),
          h('p', null, s.text),
          h('p', { class: 'meta' }, `od: ${quarterName(s.startedIn)}`),
        ),
      ),
    ),
  );
}

function rail(p: DeskPayload): HTMLElement {
  const ended = p.view.status !== 'active';
  return h(
    'aside',
    { class: 'rail', 'data-scroll': 'rail' },
    ended
      ? h(
          'section',
          { class: 'ending' },
          h('h2', null, p.view.status === 'dismissed' ? 'Anderson odwołany' : 'Rozpad organizacji'),
          h(
            'p',
            null,
            p.view.status === 'dismissed'
              ? 'Zaufanie Waszyngtonu spadło do zera. Kampania dobiegła końca. Kronikę i depesze możesz nadal przeglądać.'
              : 'Spójność Organizacji spadła do zera. PACE przestała działać jako jedna instytucja.',
          ),
        )
      : null,
    decisions(p),
    situations(p),
    h(
      'div',
      { class: 'close' },
      h(
        'button',
        { class: 'btn btn-primary', disabled: state.busy || ended, onClick: () => openDialog('close') },
        'Zamknij kwartał',
      ),
      h(
        'p',
        { class: 'meta' },
        'Zamknięcie rozlicza budżet i frakcje, a potem otwiera następny kwartał z nowymi depeszami.',
      ),
    ),
  );
}

function workArea(p: DeskPayload): HTMLElement {
  const news = p.view.worldNews.filter((n) => n.quarter === p.campaign.quarterCode).length;
  const reportsDue = p.view.flights.filter((f) => f.detectedIn === p.campaign.quarterCode && !f.report).length;
  return h(
    'main',
    { class: 'main' },
    h(
      'div',
      { class: 'tabs', role: 'tablist', 'aria-label': 'Widoki' },
      TABS.map((t) =>
        h(
          'button',
          {
            role: 'tab',
            class: `tab${state.tab === t.id ? ' is-active' : ''}`,
            'aria-selected': state.tab === t.id,
            'data-focus': `tab-${t.id}`,
            onClick: () => {
              state.tab = t.id;
              if (t.id === 'depesze' && state.newsQuarter === '') state.newsQuarter = p.campaign.quarterCode;
              render();
            },
          },
          t.label,
          t.id === 'depesze' && news > 0 ? h('span', { class: 'count' }, String(news)) : null,
          t.id === 'ksp' && reportsDue > 0 ? h('span', { class: 'count' }, String(reportsDue)) : null,
        ),
      ),
    ),
    h(
      'div',
      { class: 'panel', role: 'tabpanel', 'data-scroll': `panel-${state.tab}` },
      renderPanel(
        state.tab,
        p,
        { newsQuarter: state.newsQuarter, busy: state.busy, flightDrafts: state.flightDrafts },
        {
          editFlight: (flightId, draft) => {
            // Bez przerysowania: gracz właśnie wypełnia formularz.
            state.flightDrafts[flightId] = draft;
          },
          saveFlight: (flightId) => {
            const flight = p.view.flights.find((f) => f.id === flightId);
            if (!flight) return;
            const { note, ...rest } = draftFor(flight, state.flightDrafts);
            const text = note?.trim();
            void run(() => api.fileFlight(campaignId(), flightId, { ...rest, ...(text ? { note: text } : {}) })).then(
              (ok) => {
                if (ok) delete state.flightDrafts[flightId];
              },
            );
          },
          openCard: (code) => {
            const cards = p.view.worldNews.filter((n) => n.quarter === p.campaign.quarterCode && n.card !== null);
            openDeck(
              (p.view.reports.length > 0 ? 1 : 0) +
                Math.max(
                  0,
                  cards.findIndex((n) => n.card === code),
                ),
            );
          },
          act: (action, target) => void run(() => api.act(campaignId(), action, target)),
          importSave: (path) => void run(() => api.importSave(campaignId(), path)),
          askNarrator: () => openLiaison('quarter'),
          readNarrative: openReader,
          settle: (quarter) => void run(() => api.settle(campaignId(), quarter)),
          showQuarter: (code) => {
            state.newsQuarter = code;
            state.tab = 'depesze';
            render();
          },
        },
      ),
    ),
  );
}

// ── Okna dialogowe ──────────────────────────────────────────────────────────

function openDialog(kind: AppState['dialog']): void {
  state.dialog = kind;
  render();
}

function dialogShell(
  title: string,
  body: (HTMLElement | null)[],
  footer: HTMLElement[],
  extraClass = '',
): HTMLDialogElement {
  const dialog = h(
    'dialog',
    {
      class: `dialog ${extraClass}`.trim(),
      'aria-label': title,
      onClose: () => {
        state.dialog = null;
        render();
      },
    },
    h('h2', null, title),
    h('div', { class: 'dialog-body' }, body),
    h('div', { class: 'dialog-foot' }, footer),
  );
  return dialog;
}

const closeButton = (label = 'Zamknij') =>
  h(
    'button',
    { class: 'btn', onClick: (e: Event) => (e.currentTarget as HTMLElement).closest('dialog')?.close() },
    label,
  );

function settingsDialog(): HTMLDialogElement {
  const groups = (Object.keys(SETTING_CHOICES) as (keyof Settings)[]).map((key) => {
    const choice = SETTING_CHOICES[key];
    return h(
      'fieldset',
      { class: 'choice' },
      h('legend', null, choice.label),
      choice.options.map((o) =>
        h(
          'label',
          null,
          h('input', {
            type: 'radio',
            name: key,
            value: o.value,
            checked: state.settings[key] === o.value,
            onChange: () => {
              state.settings = { ...state.settings, [key]: o.value };
              applySettings(state.settings);
              saveSettings(state.settings);
            },
          }),
          h('span', null, o.label),
        ),
      ),
    );
  });
  return dialogShell(
    'Ustawienia',
    [
      ...groups,
      h(
        'p',
        { class: 'meta' },
        'Powiększenie przeglądarki (Ctrl i plus albo minus) działa niezależnie: układ dopasowuje się do miejsca.',
      ),
    ],
    [closeButton('Gotowe')],
  );
}

function closeDialog(p: DeskPayload): HTMLDialogElement {
  const pending = p.view.pendingDilemmas.length;
  const ud = p.view.currencies.UD;
  const reportsDue = p.view.flights.filter((f) => f.detectedIn === p.campaign.quarterCode && !f.report).length;
  const warnings = [
    pending > 0
      ? `${pending} ${plural(pending, 'sprawa czeka', 'sprawy czekają', 'spraw czeka')} na decyzję. Bez niej silnik przyjmie opcję domyślną i doliczy koszt bierności.`
      : null,
    ud > 0
      ? `Zostało ${ud} ${plural(ud, 'punkt', 'punkty', 'punktów')} Uwagi Dowódcy. Niewykorzystane przepadają.`
      : null,
    reportsDue > 0
      ? `${reportsDue} ${plural(reportsDue, 'lot nie ma', 'loty nie mają', 'lotów nie ma')} Raportu Misji. Gra rozliczy je jako jawne próby techniczne.`
      : null,
  ].filter((w): w is string => w !== null);
  return dialogShell(
    `Zamknąć ${p.campaign.quarterLabel}?`,
    [
      warnings.length > 0
        ? h(
            'ul',
            { class: 'notes warn' },
            warnings.map((w) => h('li', null, w)),
          )
        : h('p', null, 'Wszystko rozstrzygnięte. Można zamykać.'),
      h(
        'p',
        { class: 'meta' },
        'Zamknięcia nie da się cofnąć w grze. Kopia stanu sprzed zamknięcia trafia do folderu campaigns/kopie. Następny kwartał zacznie się od wczytania zapisu KSP.',
      ),
    ],
    [
      closeButton('Wróć do Biurka'),
      h(
        'button',
        {
          class: 'btn btn-primary',
          onClick: () => {
            state.dialog = null;
            state.tab = 'biurko';
            state.armed = null;
            state.flightDrafts = {};
            state.gate.skipArmed = false;
            // Po zamknięciu `accept` sam otwiera bramkę zapisu albo, przy końcu kampanii, zostawia ekran.
            void run(() => api.closeQuarter(campaignId()), true);
          },
        },
        'Zamknij kwartał',
      ),
    ],
  );
}

function liaisonDialog(l: LiaisonState): HTMLDialogElement {
  const p = state.payload;
  const dilemma = p?.view.pendingDilemmas.find((d) => d.instanceId === l.instanceId);
  const event = p?.view.worldNews.find((n) => n.quarter === p.campaign.quarterCode && n.card === l.card);
  const titles: Record<LiaisonState['kind'], string> = {
    quarter: 'Narrator: narracja kwartału',
    decision: `Narrator: głosy w sprawie „${dilemma?.title ?? ''}”`,
    conversation: `Narrator: rozmowa w sprawie „${dilemma?.title ?? ''}”`,
    event: `Narrator: scena „${event?.title ?? ''}”`,
  };
  return dialogShell(
    titles[l.kind],
    liaisonBody(l, state.busy, {
      setMode: (mode) => {
        l.mode = mode;
        reloadPackage(l);
      },
      setSource: (source) => {
        l.source = source;
        render();
      },
      setSecrets: (on) => {
        l.secrets = on;
        remember(SECRETS_KEY, on ? 'tak' : 'nie');
        reloadPackage(l);
      },
      setReply: (text) => {
        l.reply = text;
      },
      copy: () => void copyPackage(),
      saveFile: () => void savePackageFile(),
      submit: () => void submitReply(),
    }),
    [closeButton()],
    'dialog-wide',
  );
}

function readerDialog(p: DeskPayload, id: string): HTMLDialogElement | null {
  const entry = p.view.narrative.find((n) => n.id === id);
  if (!entry) return null;
  return dialogShell(
    entry.title,
    [
      entry.kind === 'quarter'
        ? quarterNarrative(entry, false, () => undefined)
        : entry.kind === 'decision'
          ? voices(entry)
          : h(
              'article',
              { class: 'sheet' },
              entry.sections.map((x) => h('p', null, x.body)),
            ),
    ],
    [closeButton()],
    'dialog-wide dialog-reader',
  );
}

/** Obowiązkowe okno na otwarcie kwartału: zapis KSP. Nie da się go zamknąć bez decyzji. */
function gateDialog(p: DeskPayload): HTMLDialogElement {
  const dialog = dialogShell(
    `${p.campaign.quarterLabel}: zapis KSP`,
    gateBody(p, state.gate, state.busy, {
      setPath: (path) => {
        state.gate.path = path;
      },
      load: () => {
        const path = state.gate.path.trim();
        if (path === '') {
          notify('error', 'Podaj ścieżkę do pliku zapisu KSP.');
          render();
          return;
        }
        remember(`dse.zapis.${p.campaign.id}`, path);
        void run(() => api.importSave(campaignId(), path)).then((ok) => {
          if (ok) openDeck(0);
        });
      },
      armSkip: (armed) => {
        state.gate.skipArmed = armed;
        render();
      },
      skip: () => {
        state.gate.skipArmed = false;
        void run(() => api.skipGate(campaignId())).then((ok) => {
          if (ok) openDeck(0);
        });
      },
      settle: (quarter) => void run(() => api.settle(campaignId(), quarter)),
    }),
    [
      h(
        'button',
        {
          class: 'btn btn-quiet',
          onClick: () => {
            state.screen = 'menu';
            state.dialog = null;
            void refreshCampaigns();
          },
        },
        'Menu główne',
      ),
    ],
    'dialog-wide dialog-gate',
  );
  // Klawisz Esc nie zamyka bramki: kwartał zaczyna się od zapisu albo od świadomego pominięcia.
  dialog.addEventListener('cancel', (e) => e.preventDefault());
  return dialog;
}

/** Na wąskim ekranie zakładki leżą pod wskaźnikami: po przejściu z odprawy przewijamy do nich. */
function revealPanel(): void {
  const tabs = root.querySelector('.tabs');
  if (!tabs) return;
  const top = tabs.getBoundingClientRect().top;
  if (top < 0 || top > window.innerHeight * 0.6) tabs.scrollIntoView({ block: 'start' });
}

/** Odprawa: bilans poprzedniego kwartału, karty wydarzeń ze zdjęciami, sprawy do decyzji. */
function deckDialog(p: DeskPayload): HTMLDialogElement {
  const ended = p.view.status !== 'active';
  const pages = deckPages(p, state.busy, {
    go: openDeck,
    askScene: (code) => openLiaison('event', code),
    askQuarter: () => openLiaison('quarter'),
    toFlights: () => {
      state.tab = 'ksp';
      state.dialog = null;
      render();
      revealPanel();
    },
    toDesk: () => {
      state.tab = 'biurko';
      state.dialog = null;
      render();
      revealPanel();
    },
  });
  const index = Math.min(Math.max(0, state.deck), pages.length - 1);
  const page = pages[index]!;
  const dialog = dialogShell(
    ended ? 'Koniec kampanii' : `Odprawa: ${p.campaign.quarterLabel}`,
    [
      ended
        ? h(
            'p',
            { class: 'lead' },
            p.view.status === 'dismissed'
              ? 'Waszyngton stracił zaufanie do Andersona. Biały Dom przyjmuje jego rezygnację, zanim zdąży ją napisać.'
              : 'PACE rozpada się od środka. Dyrektoriaty przestają odpowiadać na pisma z gabinetu Dowódcy Operacyjnego.',
          )
        : null,
      h('article', { class: 'card', 'data-scroll': 'card' }, h('h3', null, page.title), page.body),
    ],
    [
      h('span', { class: 'meta deck-count' }, `${index + 1} z ${pages.length}`),
      h('button', { class: 'btn', disabled: index === 0, onClick: () => openDeck(index - 1) }, 'Poprzednia'),
      h(
        'button',
        {
          class: index === pages.length - 1 ? 'btn' : 'btn btn-primary',
          disabled: index === pages.length - 1,
          'data-focus': 'deck-next',
          onClick: () => openDeck(index + 1),
        },
        'Następna',
      ),
      closeButton(),
    ],
    'dialog-wide dialog-deck',
  );
  dialog.addEventListener('keydown', (e) => {
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);
    if (typing) return;
    if (e.key === 'ArrowRight' && index < pages.length - 1) openDeck(index + 1);
    if (e.key === 'ArrowLeft' && index > 0) openDeck(index - 1);
  });
  return dialog;
}

const FIDELITY_CHOICES: { value: HistoryFidelity; label: string; hint: string }[] = [
  { value: 'high', label: 'Wysoka (około 90%)', hint: 'Świat trzyma się podręcznika. Kilka rozejść na pięć lat.' },
  {
    value: 'medium',
    label: 'Umiarkowana (około 70%)',
    hint: 'Co trzecie rozstrzygnięcie idzie inaczej. Znajome tło, inne zakręty.',
  },
  { value: 'low', label: 'Niska (około 50%)', hint: 'Rzut monetą. Po kilku latach to już inna zimna wojna.' },
];

function campaignForm(): HTMLElement {
  const name = h('input', {
    type: 'text',
    id: 'c-id',
    value: 'pace-1951',
    maxlength: 40,
    autocomplete: 'off',
    spellcheck: 'false',
  });
  const seed = h('input', {
    type: 'text',
    id: 'c-seed',
    value: 'PACE-1951',
    maxlength: 80,
    autocomplete: 'off',
    spellcheck: 'false',
  });
  return h(
    'form',
    {
      class: 'new-campaign',
      onSubmit: (e: Event) => {
        e.preventDefault();
        state.dialog = null;
        state.tab = 'biurko';
        state.flightDrafts = {};
        state.gate = { path: '', skipArmed: false };
        void run(() => api.create(name.value.trim().toLowerCase(), seed.value.trim(), state.fidelity), true).then(
          refreshCampaigns,
        );
      },
    },
    h('label', { for: 'c-id' }, 'Nazwa pliku kampanii'),
    name,
    h('p', { class: 'meta' }, 'Małe litery, cyfry i myślniki.'),
    h('label', { for: 'c-seed' }, 'Ziarno losowania'),
    seed,
    h('p', { class: 'meta' }, 'To samo ziarno i te same decyzje dają ten sam świat. Inne ziarno to inna historia.'),
    h(
      'fieldset',
      { class: 'choice choice-stack' },
      h('legend', null, 'Zbieżność z historią'),
      FIDELITY_CHOICES.map((c) =>
        h(
          'label',
          null,
          h('input', {
            type: 'radio',
            name: 'fidelity',
            value: c.value,
            checked: state.fidelity === c.value,
            // Bez przerysowania: pola formularza zachowują to, co gracz już wpisał.
            onChange: () => {
              state.fidelity = c.value;
            },
          }),
          h('span', null, h('b', null, c.label), h('small', null, c.hint)),
        ),
      ),
      h(
        'p',
        { class: 'meta' },
        'Jak często wydarzenia świata idą drogą znaną z historii. Kotwice (na przykład śmierć Stalina) zdarzają się zawsze. Tego ustawienia nie zmienisz w trakcie kampanii.',
      ),
    ),
    h(
      'button',
      { class: 'btn btn-primary', type: 'submit', disabled: state.busy },
      'Rozpocznij kampanię od stycznia 1951',
    ),
  );
}

/** Menu główne: kontynuacja, lista kampanii z usuwaniem, nowa kampania, instrukcja. */
function startScreen(): HTMLElement {
  const current = state.payload?.campaign ?? null;
  const last = current?.id ?? lastCampaign();
  const resume = state.campaigns.find((c) => c.id === last);
  return h(
    'main',
    { class: 'start' },
    h(
      'header',
      { class: 'start-head' },
      h('p', { class: 'brand-mark' }, 'PACE'),
      h('h1', null, 'The Deep State Engine'),
      h(
        'p',
        { class: 'lead' },
        'Pan-Atlantic Commission for Experimentation, od stycznia 1951 roku. Rakiety budujesz w KSP, a tutaj prowadzisz politykę, budżet i ludzi.',
      ),
      h(
        'div',
        { class: 'step-actions' },
        current
          ? h(
              'button',
              {
                class: 'btn btn-primary',
                onClick: () => {
                  state.screen = 'game';
                  if (gatePending(state.payload!)) state.dialog = 'gate';
                  render();
                },
              },
              `Wróć do gry: ${current.id}, ${current.quarterLabel}`,
            )
          : resume
            ? h(
                'button',
                {
                  class: 'btn btn-primary',
                  disabled: state.busy,
                  onClick: () => void run(() => api.load(resume.id), true),
                },
                `Kontynuuj: ${resume.id}, ${resume.quarterLabel}`,
              )
            : null,
        h('button', { class: 'btn btn-quiet', onClick: () => openDialog('settings') }, 'Ustawienia'),
      ),
    ),
    h(
      'section',
      { class: 'block' },
      h('h2', null, 'Kampanie'),
      campaignTable(state.campaigns, current?.id ?? null, state.deleteArmed, state.busy, {
        open: (id) => {
          state.deleteArmed = null;
          state.flightDrafts = {};
          state.gate = { path: '', skipArmed: false };
          void run(() => api.load(id), true);
        },
        armDelete: (id) => {
          state.deleteArmed = id;
          render();
        },
        remove: (id) => void removeCampaign(id),
      }),
    ),
    h('section', { class: 'block' }, h('h2', null, 'Nowa kampania'), campaignForm()),
    h('section', { class: 'block' }, h('h2', null, 'Jak wygląda kwartał'), howToPlay()),
  );
}

async function removeCampaign(id: string): Promise<void> {
  if (state.busy) return;
  state.busy = true;
  render();
  try {
    await api.remove(id);
    notify('info', `Kampania „${id}” usunięta z listy. Plik jest w folderze campaigns/usuniete.`);
    if (state.payload?.campaign.id === id) state.payload = null;
    state.deleteArmed = null;
    state.campaigns = await api.campaigns();
  } catch (e) {
    notify('error', e instanceof ApiFailure ? e.message : 'Nie udało się usunąć kampanii.');
  } finally {
    state.busy = false;
    render();
  }
}

// ── Rysowanie ───────────────────────────────────────────────────────────────

function notices(): HTMLElement {
  return h(
    'div',
    { class: 'notices', role: 'status', 'aria-live': 'polite' },
    state.notices.map((n) =>
      h(
        'div',
        { class: `notice notice-${n.kind}`, 'data-notice': n.id },
        h('span', null, n.text),
        h(
          'button',
          {
            class: 'notice-x',
            'aria-label': 'Zamknij komunikat',
            onClick: () => {
              state.notices = state.notices.filter((x) => x.id !== n.id);
              render();
            },
          },
          '×',
        ),
      ),
    ),
  );
}

function render(): void {
  // Zapamiętaj przewinięcia i fokus: po przerysowaniu ekran zostaje tam, gdzie był.
  const scroll = new Map<string, number>();
  for (const el of root.querySelectorAll<HTMLElement>('[data-scroll]'))
    scroll.set(el.dataset.scroll!, el.scrollTop + el.scrollLeft * 1e6);
  const focusKey = (document.activeElement as HTMLElement | null)?.dataset?.focus;

  const p = state.screen === 'game' ? state.payload : null;
  // Bramka zapisu wraca na wierzch, dopóki kwartał na nią czeka (wyjątkiem są Ustawienia).
  if (p && gatePending(p) && state.dialog !== 'settings') state.dialog = 'gate';
  const children: (HTMLElement | null)[] = p
    ? [
        h(
          'div',
          { class: `shell${state.busy ? ' is-busy' : ''}` },
          topBar(p),
          statusRow(p),
          h('div', { class: 'work' }, stations(p), workArea(p), rail(p)),
        ),
      ]
    : [startScreen()];
  children.push(notices());

  let dialog: HTMLDialogElement | null = null;
  if (state.dialog === 'settings') dialog = settingsDialog();
  else if (state.dialog === 'close' && p) dialog = closeDialog(p);
  else if (state.dialog === 'liaison' && p && state.liaison) dialog = liaisonDialog(state.liaison);
  else if (state.dialog === 'reader' && p && state.reader) dialog = readerDialog(p, state.reader);
  else if (state.dialog === 'gate' && p) dialog = gateDialog(p);
  else if (state.dialog === 'deck' && p) dialog = deckDialog(p);
  if (dialog) children.push(dialog);

  root.replaceChildren(...children.filter((c): c is HTMLElement => c !== null));
  for (const el of root.querySelectorAll<HTMLElement>('[data-scroll]')) {
    const saved = scroll.get(el.dataset.scroll!);
    if (saved !== undefined) {
      el.scrollTop = saved % 1e6;
      el.scrollLeft = Math.floor(saved / 1e6);
    }
  }
  const timelineEl = root.querySelector<HTMLElement>('.timeline');
  if (timelineEl && !scroll.has('timeline')) timelineEl.scrollLeft = timelineEl.scrollWidth;
  if (dialog) dialog.showModal();
  else if (focusKey) root.querySelector<HTMLElement>(`[data-focus="${focusKey}"]`)?.focus();
}

async function refreshCampaigns(): Promise<void> {
  try {
    state.campaigns = await api.campaigns();
  } catch {
    state.campaigns = [];
  }
  render();
}

async function boot(): Promise<void> {
  applySettings(state.settings);
  try {
    state.campaigns = await api.campaigns();
    // Gra zawsze otwiera się na menu głównym; ostatnią kampanię wczytuje przycisk „Kontynuuj”.
  } catch (e) {
    notify('error', e instanceof ApiFailure ? e.message : 'Nie udało się wczytać gry.');
  }
  state.notices = state.notices.filter((n) => n.kind === 'error');
  render();
}

void boot();
