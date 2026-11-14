/**
 * Otwarcie kwartału i to, co z niego wynika (decyzja 0019): bramka zapisu KSP, odprawa jako
 * karty wydarzeń ze zdjęciami, Raporty Misji, Rejestr Następstw oraz menu główne.
 *
 * Funkcje tylko budują fragmenty strony. Stan i wywołania serwera zostają w `main.ts`.
 */
import type { CampaignListItem, DeskPayload, Flight, MissionReportInput } from './api.ts';
import { h, plural, quarterName, signed, type Child } from './dom.ts';
import type { NarrativeEntry } from './narrator.ts';

type View = DeskPayload['view'];
type News = View['worldNews'][number];

const MONTHS = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];

/** „1951-03-05” → „5 marca 1951”. */
export function datePl(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[(m ?? 1) - 1] ?? ''} ${y}`;
}

function previousQuarter(code: string): string {
  const year = Number(code.slice(0, 4));
  const q = Number(code.slice(6));
  return q === 1 ? `${year - 1}-Q4` : `${year}-Q${q - 1}`;
}

/** Ostatni dzień kwartału, np. „31 marca 1951”. */
function quarterEnd(code: string): string {
  const year = code.slice(0, 4);
  return ['31 marca', '30 czerwca', '30 września', '31 grudnia'][Number(code.slice(6)) - 1] + ` ${year}`;
}

// ── Bramka zapisu ───────────────────────────────────────────────────────────

export interface GateState {
  path: string;
  /** Gracz kliknął „bez zapisu” i musi to potwierdzić drugim kliknięciem. */
  skipArmed: boolean;
}

export interface GateActions {
  setPath(path: string): void;
  load(): void;
  armSkip(armed: boolean): void;
  skip(): void;
  settle(quarter: string): void;
}

/** Treść obowiązkowego okna na otwarcie kwartału: najpierw zapis KSP, potem reszta. */
export function gateBody(p: DeskPayload, gate: GateState, busy: boolean, on: GateActions): (HTMLElement | null)[] {
  const now = p.campaign.quarterCode;
  const first = p.view.reports.length === 0;
  const prev = previousQuarter(now);
  const due = p.view.budget.ledger.find((e) => e.quarter === prev && !e.settled && e.units !== 0);
  const last = p.view.ksp;

  const input = h('input', {
    type: 'text',
    id: 'gate-path',
    placeholder: 'np. D:\\KSP\\saves\\PACE\\persistent.sfs',
    autocomplete: 'off',
    spellcheck: 'false',
    'data-focus': 'gate-path',
    onInput: (e: Event) => on.setPath((e.currentTarget as HTMLInputElement).value),
  });
  input.value = gate.path;

  const steps: Child[] = first
    ? [
        h('li', null, 'Załóż w KSP nową karierę RP-1 i zapisz grę w styczniu 1951 roku.'),
        h(
          'li',
          null,
          'Wskaż niżej plik zapisu. Gra weźmie z niego wynagrodzenia, po których przelicza Korekty budżetu.',
        ),
      ]
    : [
        due
          ? h(
              'li',
              null,
              `Wpisz w KSP Korektę za ${quarterName(prev)}: ${signed(due.units).replace('.', ',')} jedn.`,
              due.funds === null ? '' : ` (około ${signed(due.funds)} funduszy). `,
              h('button', { class: 'btn btn-small', disabled: busy, onClick: () => on.settle(prev) }, 'Wpisana'),
            )
          : null,
        h('li', null, `Rozegraj w KSP ${quarterName(prev)} do końca (do ${quarterEnd(prev)}).`),
        h('li', null, 'Zapisz grę i wskaż niżej plik zapisu. Gra odczyta z niego starty i założy im Raporty Misji.'),
      ];

  return [
    h(
      'p',
      { class: 'lead' },
      first
        ? 'Kampania zaczyna się od zapisu kariery. Depesze i sprawy poczekają.'
        : `Zanim otworzysz depesze z ${p.campaign.quarterLabel}, gra musi wiedzieć, co się wydarzyło na poligonie.`,
    ),
    h('ol', { class: 'gate-steps' }, steps),
    h(
      'form',
      {
        class: 'save-form',
        onSubmit: (e: Event) => {
          e.preventDefault();
          on.load();
        },
      },
      h('label', { for: 'gate-path' }, 'Ścieżka do pliku .sfs'),
      h(
        'div',
        { class: 'action-row' },
        input,
        h('button', { class: 'btn btn-primary', type: 'submit', disabled: busy }, 'Wczytaj zapis'),
      ),
      h(
        'p',
        { class: 'meta' },
        last
          ? `Poprzednio wczytany: ${last.file}, ${datePl(last.date)}. Gra tylko czyta plik i niczego w nim nie zmienia.`
          : 'W Windows: kliknij plik prawym przyciskiem z wciśniętym Shift i wybierz „Kopiuj jako ścieżkę”. Gra tylko czyta plik.',
      ),
    ),
    h(
      'div',
      { class: 'gate-skip' },
      gate.skipArmed
        ? h(
            'div',
            { class: 'confirm' },
            h('p', null, 'Bez zapisu loty z poprzedniego kwartału nie trafią do gry. Zostanie to zapisane w Kronice.'),
            h(
              'div',
              { class: 'confirm-actions' },
              h('button', { class: 'btn', disabled: busy, onClick: on.skip }, 'Otwórz kwartał bez zapisu'),
              h('button', { class: 'btn btn-quiet', onClick: () => on.armSkip(false) }, 'Jednak wczytam'),
            ),
          )
        : h(
            'button',
            { class: 'btn btn-quiet btn-small', onClick: () => on.armSkip(true) },
            'Nie mam zapisu za ten kwartał',
          ),
    ),
  ];
}

// ── Karty wydarzeń ──────────────────────────────────────────────────────────

const KIND_LABELS: Record<string, string> = {
  thread: 'Depesza',
  template: 'Depesza',
  pattern: 'Zdarzenie',
  dilemma: 'Decyzja Andersona',
  echo: 'Następstwo',
  flight: 'Lot PACE',
};

export interface EventCard {
  code: string;
  news: News;
  /** Reakcje i komunikaty, które w dzienniku stoją zaraz po tym wydarzeniu. */
  follow: News[];
}

/** Karty bieżącego albo wskazanego kwartału, w kolejności dziennika. */
export function eventCards(view: View, quarter: string): EventCard[] {
  const cards: EventCard[] = [];
  for (const n of view.worldNews.filter((x) => x.quarter === quarter)) {
    if (n.card) cards.push({ code: n.card, news: n, follow: [] });
    else cards.at(-1)?.follow.push(n);
  }
  return cards;
}

/** Tekst narratora do karty: osobna scena wydarzenia albo sekcja z narracji kwartału. */
export function cardNarrative(
  narrative: NarrativeEntry[],
  quarter: string,
  code: string,
): { body: string; source: string } | null {
  const own = narrative.find((n) => n.quarter === quarter && n.kind === 'event' && n.ref === code);
  if (own) return { body: own.sections.map((s) => s.body).join('\n\n'), source: own.source };
  const whole = narrative.find((n) => n.quarter === quarter && n.kind === 'quarter');
  const part = whole?.sections.find((s) => s.key === code.toLowerCase());
  return part && whole ? { body: part.body, source: whole.source } : null;
}

function paragraphs(text: string): HTMLElement[] {
  return text
    .split(/\n{2,}/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0)
    .map((x) => h('p', null, x));
}

export interface DeckActions {
  go(index: number): void;
  askScene(code: string): void;
  askQuarter(): void;
  toFlights(): void;
  toDesk(): void;
}

/** Zawartość jednej strony odprawy. Strona 0 to bilans, dalej karty, na końcu sprawy do decyzji. */
export function deckPages(p: DeskPayload, busy: boolean, on: DeckActions): { title: string; body: Child[] }[] {
  const now = p.campaign.quarterCode;
  const pages: { title: string; body: Child[] }[] = [];
  const report = p.view.reports.at(-1);
  const labels = [
    ['ZW', 'Zaufanie Waszyngtonu'],
    ['SO', 'Spójność Organizacji'],
    ['PP', 'Poparcie Publiczne'],
    ['WF', 'Wiarygodność Fasady'],
  ] as const;

  if (report) {
    pages.push({
      title: `Bilans: ${quarterName(report.quarter)}`,
      body: [
        h(
          'ul',
          { class: 'deltas' },
          labels.map(([k, name]) => {
            const d = report.after[k] - report.before[k];
            return h(
              'li',
              { class: d > 0 ? 'up' : d < 0 ? 'down' : '' },
              h('span', null, name),
              h('b', null, d === 0 ? 'bez zmian' : signed(d)),
            );
          }),
        ),
        report.notes.length > 0
          ? h(
              'ul',
              { class: 'notes' },
              report.notes.map((n) => h('li', null, n)),
            )
          : null,
      ],
    });
  }

  const pendingReports = p.view.flights.filter((f) => f.detectedIn === now && !f.report).length;
  for (const card of eventCards(p.view, now)) {
    const image = p.images[card.news.topic];
    const story = cardNarrative(p.view.narrative, now, card.code);
    pages.push({
      title: card.news.title,
      body: [
        image
          ? h(
              'figure',
              { class: 'card-figure' },
              h('img', { src: image.url, alt: image.caption, loading: 'lazy' }),
              h('figcaption', null, image.caption, image.credit ? h('small', null, ` Fot. ${image.credit}`) : null),
            )
          : null,
        h(
          'p',
          { class: `card-kind kind-${card.news.kind}` },
          KIND_LABELS[card.news.kind] ?? card.news.kind,
          card.news.cause ? h('span', null, ` po: ${card.news.cause}`) : null,
        ),
        h('p', { class: 'card-text' }, card.news.text),
        card.follow.length > 0
          ? h(
              'ul',
              { class: 'card-follow' },
              card.follow.map((f) => h('li', null, f.actor ? h('b', null, `${f.actor}: `) : null, f.text)),
            )
          : null,
        story ? h('article', { class: 'sheet' }, ...paragraphs(story.body)) : null,
        h(
          'div',
          { class: 'step-actions' },
          h(
            'button',
            { class: 'btn btn-small', disabled: busy, onClick: () => on.askScene(card.code) },
            story ? 'Nowa scena od narratora' : 'Scena od narratora',
          ),
          card.news.kind === 'flight' && pendingReports > 0
            ? h('button', { class: 'btn btn-small', onClick: on.toFlights }, 'Wypełnij Raport Misji')
            : null,
        ),
      ],
    });
  }

  const pending = p.view.pendingDilemmas;
  pages.push({
    title: pending.length > 0 ? 'Sprawy do decyzji' : 'Biurko czeka',
    body: [
      pending.length > 0
        ? h(
            'ul',
            { class: 'notes' },
            pending.map((d) => h('li', null, h('b', null, d.title), `. ${d.prompt}`)),
          )
        : h('p', null, 'Żadna sprawa nie czeka na decyzję. Zostaje Uwaga Dowódcy do wydania.'),
      pendingReports > 0
        ? h(
            'p',
            { class: 'alert' },
            `${pendingReports} ${plural(pendingReports, 'lot czeka', 'loty czekają', 'lotów czeka')} na Raport Misji.`,
          )
        : null,
      h(
        'div',
        { class: 'step-actions' },
        h('button', { class: 'btn btn-primary', onClick: on.toDesk }, 'Do Biurka'),
        pendingReports > 0 ? h('button', { class: 'btn', onClick: on.toFlights }, 'Do Raportów Misji') : null,
        h('button', { class: 'btn', disabled: busy, onClick: on.askQuarter }, 'Narracja całego kwartału'),
      ),
    ],
  });
  return pages;
}

// ── Raporty Misji ───────────────────────────────────────────────────────────

export const OUTCOMES = [
  ['success', 'Sukces'],
  ['partial', 'Częściowy sukces'],
  ['failure', 'Niepowodzenie'],
] as const;
export const PURPOSES = [
  ['test', 'Próba techniczna'],
  ['science', 'Naukowe'],
  ['defense', 'Obronne'],
  ['crewed', 'Załogowe'],
  ['allied', 'Sojusznicze'],
] as const;
export const CLASSIFICATIONS = [
  ['public', 'Jawny'],
  ['confidential', 'Poufny'],
  ['secret', 'Tajny'],
] as const;

export type FlightDraft = MissionReportInput;

/** Wartości formularza: szkic gracza, złożony raport albo domyślne (jak przy rozliczeniu bez raportu). */
export function draftFor(flight: Flight, drafts: Record<string, FlightDraft>): FlightDraft {
  const saved = flight.report;
  return (
    drafts[flight.id] ??
    (saved
      ? {
          outcome: saved.outcome,
          purpose: saved.purpose,
          classification: saved.classification,
          ...(saved.note ? { note: saved.note } : {}),
        }
      : { outcome: flight.failures > 0 ? 'partial' : 'success', purpose: 'test', classification: 'public' })
  );
}

function select<T extends string>(
  id: string,
  label: string,
  options: readonly (readonly [T, string])[],
  value: T,
  disabled: boolean,
  onChange: (value: T) => void,
): HTMLElement {
  const el = h(
    'select',
    { id, disabled, onChange: (e: Event) => onChange((e.currentTarget as HTMLSelectElement).value as T) },
    options.map(([v, text]) => h('option', { value: v }, text)),
  ) as HTMLSelectElement;
  el.value = value;
  return h('label', { class: 'field', for: id }, h('span', null, label), el);
}

export interface FlightActions {
  edit(flightId: string, draft: FlightDraft): void;
  save(flightId: string): void;
}

/** Formularz po locie (GDD 18.3): trzy wybory i jedno zdanie. Pojazd, datę i miejsce zna zapis. */
export function missionReports(
  p: DeskPayload,
  drafts: Record<string, FlightDraft>,
  busy: boolean,
  on: FlightActions,
): HTMLElement | null {
  const now = p.campaign.quarterCode;
  const flights = p.view.flights.filter((f) => f.detectedIn === now);
  if (flights.length === 0) return null;
  const site = (id: string | null) =>
    id === null ? 'miejsce nieznane' : (p.launchSites.find((s) => s.id === id)?.name ?? id);
  return h(
    'div',
    { class: 'reports' },
    h(
      'p',
      { class: 'lead' },
      'Przeznaczenie i klasyfikacja to wybory polityczne: od nich zależy, co zobaczy prasa, Waszyngton i frakcje. Raport można zmieniać do zamknięcia kwartału. Lot bez raportu gra rozliczy jako jawną próbę techniczną.',
    ),
    flights.map((f) => {
      const d = draftFor(f, drafts);
      const locked = f.settled || busy;
      const note = h('input', {
        type: 'text',
        id: `note-${f.id}`,
        maxlength: 200,
        disabled: locked,
        placeholder: 'Jedno zdanie dla narratora (opcjonalnie)',
        onInput: (e: Event) => {
          const text = (e.currentTarget as HTMLInputElement).value;
          on.edit(f.id, { ...draftFor(f, drafts), ...(text ? { note: text } : { note: '' }) });
        },
      });
      note.value = d.note ?? '';
      return h(
        'fieldset',
        { class: `report${f.report && !f.report.auto ? ' is-filed' : ''}` },
        h(
          'legend',
          null,
          h('b', null, `${f.id} „${f.vessel}”`),
          ` ${datePl(f.date)}, ${site(f.site)}`,
          f.failures > 0 ? h('span', { class: 'meta' }, ` awarie części: ${f.failures}`) : null,
        ),
        h(
          'div',
          { class: 'report-fields' },
          select(`out-${f.id}`, 'Wynik', OUTCOMES, d.outcome, locked, (outcome) =>
            on.edit(f.id, { ...draftFor(f, drafts), outcome }),
          ),
          select(`pur-${f.id}`, 'Przeznaczenie', PURPOSES, d.purpose, locked, (purpose) =>
            on.edit(f.id, { ...draftFor(f, drafts), purpose }),
          ),
          select(`cls-${f.id}`, 'Klasyfikacja', CLASSIFICATIONS, d.classification, locked, (classification) =>
            on.edit(f.id, { ...draftFor(f, drafts), classification }),
          ),
        ),
        h('label', { class: 'field', for: `note-${f.id}` }, h('span', null, 'Uwagi Dowódcy'), note),
        h(
          'div',
          { class: 'step-actions' },
          h(
            'button',
            { class: 'btn btn-small', disabled: locked, onClick: () => on.save(f.id) },
            f.report && !f.report.auto ? 'Popraw raport' : 'Złóż raport',
          ),
          h(
            'span',
            { class: 'meta' },
            f.settled ? 'Rozliczony.' : f.report && !f.report.auto ? 'Raport złożony.' : 'Czeka na raport.',
          ),
        ),
      );
    }),
  );
}

// ── Rejestr Następstw ───────────────────────────────────────────────────────

const REGISTRY_TYPES: Record<string, string> = {
  debt: 'Dług',
  promise: 'Obietnica',
  secret: 'Tajemnica',
  grudge: 'Uraza',
  hook: 'Hak',
  precedent: 'Precedens',
  merit: 'Zasługa',
};
const REGISTRY_STATUS: Record<string, string> = { resolved: 'rozliczony', revealed: 'ujawniony' };

/** Wpisy, o których Anderson wie. Ukryte nie trafiają do interfejsu wcale. */
export function registryList(view: View): HTMLElement | null {
  if (view.registry.length === 0) return null;
  const active = view.registry.filter((r) => r.status === 'active');
  const closed = view.registry.filter((r) => r.status !== 'active');
  const row = (r: View['registry'][number]) =>
    h(
      'li',
      { class: `registry-item type-${r.type}${r.status === 'active' ? '' : ' is-closed'}` },
      h('span', { class: 'tag' }, REGISTRY_TYPES[r.type] ?? r.type),
      h(
        'div',
        null,
        h('strong', null, r.title),
        h(
          'p',
          { class: 'meta' },
          [
            `od: ${quarterName(r.createdIn)}`,
            r.source ? `po: ${r.source}` : null,
            r.status === 'active' ? null : REGISTRY_STATUS[r.status],
          ]
            .filter(Boolean)
            .join('; '),
        ),
      ),
    );
  return h(
    'div',
    null,
    active.length > 0 ? h('ul', { class: 'registry' }, active.map(row)) : null,
    closed.length > 0 ? h('h4', null, 'Zamknięte') : null,
    closed.length > 0 ? h('ul', { class: 'registry' }, closed.map(row)) : null,
  );
}

// ── Menu główne ─────────────────────────────────────────────────────────────

const FIDELITY_NAMES: Record<string, string> = {
  high: 'zbieżność wysoka',
  medium: 'zbieżność umiarkowana',
  low: 'zbieżność niska',
};
const STATUS_NAMES: Record<string, string> = { dismissed: 'Anderson odwołany', collapsed: 'rozpad organizacji' };

export interface MenuActions {
  open(id: string): void;
  armDelete(id: string | null): void;
  remove(id: string): void;
}

/** Lista kampanii z usuwaniem. Usunięcie wymaga drugiego kliknięcia; plik trafia do kosza na dysku. */
export function campaignTable(
  campaigns: CampaignListItem[],
  current: string | null,
  armed: string | null,
  busy: boolean,
  on: MenuActions,
): HTMLElement {
  if (campaigns.length === 0) return h('p', { class: 'empty' }, 'Nie ma jeszcze zapisanych kampanii.');
  return h(
    'ul',
    { class: 'campaigns' },
    campaigns.map((c) =>
      h(
        'li',
        { class: c.id === current ? 'is-current' : '' },
        h(
          'div',
          { class: 'campaign-main' },
          h('button', { class: 'btn', disabled: busy, onClick: () => on.open(c.id) }, c.id),
          h(
            'span',
            { class: 'meta' },
            [
              c.quarterLabel,
              FIDELITY_NAMES[c.historyFidelity] ?? c.historyFidelity,
              STATUS_NAMES[c.status] ?? null,
              `zapis z ${datePl(c.savedAt.slice(0, 10))}`,
            ]
              .filter(Boolean)
              .join(', '),
          ),
          armed === c.id
            ? null
            : h(
                'button',
                { class: 'btn btn-quiet btn-small', disabled: busy, onClick: () => on.armDelete(c.id) },
                'Usuń',
              ),
        ),
        armed === c.id
          ? h(
              'div',
              { class: 'confirm' },
              h(
                'p',
                null,
                `Usunąć kampanię „${c.id}”? Zniknie z listy. Plik trafi do folderu campaigns/usuniete, skąd można go ręcznie przywrócić.`,
              ),
              h(
                'div',
                { class: 'confirm-actions' },
                h(
                  'button',
                  { class: 'btn btn-danger', disabled: busy, onClick: () => on.remove(c.id) },
                  'Usuń kampanię',
                ),
                h('button', { class: 'btn btn-quiet', onClick: () => on.armDelete(null) }, 'Zostaw'),
              ),
            )
          : null,
      ),
    ),
  );
}

/** Krótka instrukcja kwartału na stronie startowej. */
export function howToPlay(): HTMLElement {
  return h(
    'ol',
    { class: 'howto' },
    h(
      'li',
      null,
      h('b', null, 'Zapis KSP. '),
      'Każdy kwartał zaczyna się od wczytania pliku .sfs z końca poprzedniego.',
    ),
    h('li', null, h('b', null, 'Odprawa. '), 'Karty wydarzeń: loty, następstwa Twoich decyzji, depesze ze świata.'),
    h('li', null, h('b', null, 'Raporty Misji. '), 'Po każdym locie trzy wybory: wynik, przeznaczenie, klasyfikacja.'),
    h('li', null, h('b', null, 'Biurko. '), 'Sprawy do decyzji i sześć punktów Uwagi Dowódcy.'),
    h('li', null, h('b', null, 'Narrator. '), 'Pakiet do Claude albo Gemini, odpowiedź z powrotem do gry.'),
    h('li', null, h('b', null, 'Zamknięcie. '), 'Gra rozlicza kwartał i podaje Korektę do wpisania w KSP.'),
  );
}
