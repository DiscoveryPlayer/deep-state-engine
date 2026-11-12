/**
 * Zakładki głównego ekranu sali kontroli: Biurko, Depesze, Wywiad, Budżet, Ludzie, KSP, Kronika.
 * Każda funkcja dostaje dane z serwera i zwraca gotowy fragment strony.
 */
import type { DeskPayload } from './api.ts';
import { h, plural, quarterName, signed, type Child } from './dom.ts';

export const TABS = [
  { id: 'biurko', label: 'Biurko' },
  { id: 'depesze', label: 'Depesze' },
  { id: 'wywiad', label: 'Wywiad' },
  { id: 'budzet', label: 'Budżet' },
  { id: 'ludzie', label: 'Ludzie' },
  { id: 'ksp', label: 'Loty (KSP)' },
  { id: 'kronika', label: 'Kronika' },
] as const;
export type TabId = (typeof TABS)[number]['id'];

export interface PanelActions {
  act(action: string, target?: string): void;
  importSave(path: string): void;
  settle(quarter: string): void;
  showQuarter(code: string): void;
}

export interface PanelState {
  /** Kwartał pokazywany w Depeszach. */
  newsQuarter: string;
  busy: boolean;
}

const INDICATOR_NAMES: Record<string, string> = {
  ZW: 'Zaufanie Waszyngtonu',
  SO: 'Spójność Organizacji',
  PP: 'Poparcie Publiczne',
  WF: 'Wiarygodność Fasady',
  NG: 'Napięcie Geopolityczne',
};

const NEWS_KIND: Record<string, string> = {
  thread: 'Świat',
  template: 'Świat',
  pattern: 'Zdarzenie',
  dilemma: 'Decyzja',
  reaction: 'Reakcja',
  situation: 'Sytuacja',
};

function empty(text: string): HTMLElement {
  return h('p', { class: 'empty' }, text);
}

function section(title: string, ...children: (Child | Child[])[]): HTMLElement {
  return h('section', { class: 'block' }, h('h3', null, title), ...children);
}

// ── Biurko ──────────────────────────────────────────────────────────────────

function deskPanel(p: DeskPayload, state: PanelState, on: PanelActions): HTMLElement {
  const { view } = p;
  const actions = p.actions.map((a) => {
    const select =
      a.target === null
        ? null
        : h(
            'select',
            { 'aria-label': `Cel akcji: ${a.title}`, disabled: !a.enabled || state.busy },
            h('option', { value: '' }, a.target === 'faction' ? 'Frakcja…' : 'Temat…'),
            a.targets.map((t) => h('option', { value: t.id, disabled: !t.enabled }, t.label)),
          );
    const cost = [`${a.ud} UD`, a.kp > 0 ? `${a.kp} KP` : null].filter(Boolean).join(' i ');
    const button = h(
      'button',
      {
        class: 'btn',
        disabled: !a.enabled || state.busy,
        onClick: () => {
          if (select && select.value === '') {
            select.focus();
            return;
          }
          on.act(a.id, select?.value || undefined);
        },
      },
      'Wykonaj',
    );
    return h(
      'li',
      { class: `action${a.enabled ? '' : ' is-off'}` },
      h('div', { class: 'action-head' }, h('strong', null, a.title), h('span', { class: 'cost' }, cost)),
      h('p', null, a.description),
      a.reason ? h('p', { class: 'reason' }, a.reason) : null,
      h('div', { class: 'action-row' }, select, button),
    );
  });

  const lastReport = view.reports.at(-1);
  const report = lastReport
    ? section(
        `Raport: ${quarterName(lastReport.quarter)}`,
        h(
          'ul',
          { class: 'deltas' },
          (['ZW', 'SO', 'PP', 'WF', 'NG'] as const).map((k) => {
            const d = lastReport.after[k] - lastReport.before[k];
            return h(
              'li',
              { class: d > 0 ? 'up' : d < 0 ? 'down' : '' },
              h('span', null, INDICATOR_NAMES[k]),
              h('b', null, d === 0 ? 'bez zmian' : signed(d)),
            );
          }),
        ),
        lastReport.notes.length > 0
          ? h(
              'ul',
              { class: 'notes' },
              lastReport.notes.map((n) => h('li', null, n)),
            )
          : empty('Kwartał zamknięty bez uwag.'),
      )
    : null;

  return h(
    'div',
    { class: 'panel-body' },
    section(
      'Akcje Biurka',
      h(
        'p',
        { class: 'lead' },
        `Uwaga Dowódcy: ${view.currencies.UD}. Kapitał Polityczny: ${view.currencies.KP}. ` +
          'Akcji jest mniej niż problemów, więc nie da się zająć wszystkim.',
      ),
      h('ul', { class: 'actions' }, actions),
    ),
    section(
      'Zrobione w tym kwartale',
      view.deskLog.length > 0
        ? h(
            'ul',
            { class: 'notes' },
            view.deskLog.map((r) => h('li', null, r.summary)),
          )
        : empty('Jeszcze nic. Wybierz akcję powyżej albo rozstrzygnij sprawy po prawej.'),
    ),
    report,
  );
}

// ── Depesze ─────────────────────────────────────────────────────────────────

function newsPanel(p: DeskPayload, state: PanelState): HTMLElement {
  const items = p.view.worldNews.filter((n) => n.quarter === state.newsQuarter);
  const isCurrent = state.newsQuarter === p.campaign.quarterCode;
  return h(
    'div',
    { class: 'panel-body' },
    section(
      `Depesze: ${quarterName(state.newsQuarter)}${isCurrent ? '' : ' (archiwum)'}`,
      items.length === 0
        ? empty('W tym kwartale nie nadeszły żadne depesze. Inne kwartały wybierzesz na osi czasu u góry.')
        : h(
            'ol',
            { class: 'news' },
            items.map((n) =>
              h(
                'li',
                { class: `news-item kind-${n.kind}` },
                h('span', { class: 'tag' }, n.actor ?? NEWS_KIND[n.kind] ?? n.kind),
                h('div', null, h('strong', null, n.title), h('p', null, n.text)),
              ),
            ),
          ),
    ),
  );
}

// ── Wywiad ──────────────────────────────────────────────────────────────────

const SOURCE_NAMES: Record<string, string> = {
  open: 'źródła jawne',
  sigint: 'nasłuch',
  humint: 'źródło osobowe',
  imint_air: 'zdjęcia lotnicze',
  imint_sat: 'zdjęcia satelitarne',
  allies: 'sojusznicy',
};
const RELIABILITY: Record<string, string> = {
  A: 'całkowicie wiarygodne',
  B: 'zwykle wiarygodne',
  C: 'dość wiarygodne',
  D: 'zwykle niewiarygodne',
  E: 'niewiarygodne',
  F: 'nie da się ocenić',
};
const CREDIBILITY = [
  '',
  'potwierdzone',
  'prawdopodobnie prawdziwe',
  'możliwe',
  'wątpliwe',
  'nieprawdopodobne',
  'nie da się ocenić',
];

function intelPanel(p: DeskPayload): HTMLElement {
  const list = [...p.view.assessments].reverse();
  return h(
    'div',
    { class: 'panel-body' },
    section(
      'Oceny wywiadowcze',
      h(
        'p',
        { class: 'lead' },
        'Ocena mówi, co wywiad uważa, a nie co jest prawdą. Litera to wiarygodność źródła, cyfra to prawdopodobieństwo informacji.',
      ),
      list.length === 0
        ? empty('Brak ocen. Zleć BAS rozpoznanie w zakładce Biurko albo poczekaj na pogłoski ze świata.')
        : h(
            'ul',
            { class: 'intel' },
            list.map((a) =>
              h(
                'li',
                null,
                h(
                  'span',
                  {
                    class: `code code-${a.reliability}`,
                    title: `Źródło: ${RELIABILITY[a.reliability]}. Informacja: ${CREDIBILITY[a.credibility]}.`,
                  },
                  `${a.reliability}-${a.credibility}`,
                ),
                h(
                  'div',
                  null,
                  h('strong', null, a.topic),
                  h('p', null, a.text),
                  h('p', { class: 'meta' }, `${SOURCE_NAMES[a.source] ?? a.source}, ${quarterName(a.quarter)}`),
                ),
              ),
            ),
          ),
    ),
  );
}

// ── Budżet ──────────────────────────────────────────────────────────────────

function units(n: number): string {
  return `${signed(n, 1)} jedn.`;
}

function budgetPanel(p: DeskPayload, state: PanelState, on: PanelActions): HTMLElement {
  const { budget, ksp } = p.view;
  const upcoming = budget.upcoming.reduce((s, i) => s + i.units, 0);
  const ledger = [...budget.ledger].reverse();
  return h(
    'div',
    { class: 'panel-body' },
    section(
      'Korekty bieżącego kwartału',
      h(
        'p',
        { class: 'lead' },
        'Korekta to pieniądze, które świat dokłada albo zabiera PACE. Jedna jednostka to 20% miesięcznych wynagrodzeń. ' +
          (ksp
            ? `Dziś to około ${Math.round(ksp.monthlySalaries * 0.2)} funduszy w KSP.`
            : 'Kwotę w funduszach KSP poznasz po wczytaniu zapisu kariery.'),
      ),
      budget.upcoming.length === 0
        ? empty('Na ten kwartał nie ma żadnych Korekt.')
        : h(
            'table',
            { class: 'table' },
            h(
              'tbody',
              null,
              budget.upcoming.map((i) =>
                h('tr', null, h('td', null, i.reason), h('td', { class: 'num' }, units(i.units))),
              ),
            ),
            h(
              'tfoot',
              null,
              h(
                'tr',
                null,
                h('th', null, 'Razem przy zamknięciu kwartału'),
                h('th', { class: 'num' }, units(upcoming)),
              ),
            ),
          ),
    ),
    section(
      'Rozliczone kwartały',
      ledger.length === 0
        ? empty('Pierwsze rozliczenie pojawi się po zamknięciu kwartału.')
        : h(
            'table',
            { class: 'table' },
            h(
              'thead',
              null,
              h(
                'tr',
                null,
                h('th', null, 'Kwartał'),
                h('th', { class: 'num' }, 'Korekta'),
                h('th', { class: 'num' }, 'W KSP'),
                h('th', null, 'Stan'),
              ),
            ),
            h(
              'tbody',
              null,
              ledger.map((e) =>
                h(
                  'tr',
                  null,
                  h('td', null, quarterName(e.quarter)),
                  h('td', { class: 'num' }, units(e.units)),
                  h('td', { class: 'num' }, e.funds === null ? 'brak zapisu' : signed(e.funds)),
                  h(
                    'td',
                    null,
                    e.settled
                      ? 'zastosowana'
                      : h(
                          'button',
                          { class: 'btn btn-small', disabled: state.busy, onClick: () => on.settle(e.quarter) },
                          'Oznacz jako zastosowaną w KSP',
                        ),
                  ),
                ),
              ),
            ),
          ),
    ),
  );
}

// ── Ludzie ──────────────────────────────────────────────────────────────────

const REGISTRY_TYPES: Record<string, string> = {
  debt: 'Dług',
  promise: 'Obietnica',
  secret: 'Tajemnica',
  grudge: 'Uraza',
  hook: 'Hak',
  precedent: 'Precedens',
  merit: 'Zasługa',
};

function peoplePanel(p: DeskPayload): HTMLElement {
  const { view } = p;
  const factionName = (id: string) => p.factions.find((f) => f.id === id)?.name ?? id;
  return h(
    'div',
    { class: 'panel-body' },
    section(
      'Gabinet i kadra',
      h(
        'ul',
        { class: 'people' },
        view.characters.map((c) =>
          h(
            'li',
            null,
            h('strong', null, c.name),
            h('span', null, `${c.role}, ${factionName(c.faction)}`),
            h('span', { class: 'meta' }, `kompetencje ${c.competence}/5, stosunek do Andersona: ${c.loyaltyBand}`),
          ),
        ),
      ),
    ),
    section(
      'Rejestr Następstw',
      view.registry.length === 0
        ? empty('Rejestr jest pusty. Długi, obietnice i urazy pojawią się wraz z decyzjami.')
        : h(
            'ul',
            { class: 'notes' },
            view.registry.map((r) => h('li', null, h('b', null, `${REGISTRY_TYPES[r.type] ?? r.type}: `), r.title)),
          ),
    ),
  );
}

// ── Loty (KSP) ──────────────────────────────────────────────────────────────

function kspPanel(p: DeskPayload, state: PanelState, on: PanelActions): HTMLElement {
  const snap = p.view.ksp;
  const input = h('input', {
    type: 'text',
    id: 'save-path',
    placeholder: 'np. D:\\SteamLibrary\\steamapps\\common\\Kerbal Space Program\\saves\\PACE\\persistent.sfs',
    autocomplete: 'off',
    spellcheck: 'false',
  });
  const siteName = (id: string | null) =>
    id === null ? 'nieznane' : (p.launchSites.find((s) => s.id === id)?.name ?? id);
  return h(
    'div',
    { class: 'panel-body' },
    section(
      'Wczytaj zapis kariery',
      h(
        'p',
        { class: 'lead' },
        'Po sesji w KSP zapisz grę, zamknij KSP i podaj tu ścieżkę do pliku zapisu. Gra tylko czyta ten plik i niczego w nim nie zmienia.',
      ),
      h(
        'form',
        {
          class: 'save-form',
          onSubmit: (e: Event) => {
            e.preventDefault();
            if (input.value.trim() !== '') on.importSave(input.value.trim());
          },
        },
        h('label', { for: 'save-path' }, 'Ścieżka do pliku .sfs'),
        h(
          'div',
          { class: 'action-row' },
          input,
          h('button', { class: 'btn', type: 'submit', disabled: state.busy }, 'Wczytaj zapis'),
        ),
      ),
    ),
    snap === null
      ? section(
          'Stan kariery',
          empty('Nie wczytano jeszcze żadnego zapisu. Bez niego gra nie zna Twoich lotów ani funduszy.'),
        )
      : section(
          `Stan kariery na ${snap.date}`,
          h(
            'dl',
            { class: 'facts' },
            ...(
              [
                ['Kariera', snap.title],
                ['Wczytano dla kwartału', quarterName(snap.quarter)],
                ['Fundusze', Math.round(snap.funds).toLocaleString('pl-PL')],
                ['Reputacja', snap.reputation.toFixed(0)],
                ['Zaufanie (Confidence)', snap.confidence.toFixed(0)],
                ['Inżynierowie i naukowcy', `${snap.engineers} i ${snap.researchers}`],
                ['Miesięczne wynagrodzenia', Math.round(snap.monthlySalaries).toLocaleString('pl-PL')],
                ['Miejsce startu', siteName(snap.launchSite || null)],
                [
                  'Starty w karierze',
                  `${snap.launches} (${snap.failures} ${plural(snap.failures, 'awaria', 'awarie', 'awarii')})`,
                ],
                ['Programy', snap.programs.map((x) => x.name).join(', ') || 'brak'],
              ] as const
            ).flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v)]),
          ),
          h('h4', null, 'Starty w tym kwartale'),
          snap.launchesInQuarter.length === 0
            ? empty('W zapisie nie ma startów z bieżącego kwartału.')
            : h(
                'ul',
                { class: 'notes' },
                snap.launchesInQuarter.map((l) => h('li', null, `${l.date}: ${l.vessel} (${siteName(l.site)})`)),
              ),
        ),
  );
}

// ── Kronika ─────────────────────────────────────────────────────────────────

function chroniclePanel(p: DeskPayload, on: PanelActions): HTMLElement {
  const byQuarter = new Map<string, string[]>();
  for (const c of p.view.chronicle) {
    if (c.tags.includes('swiat')) continue; // Depesze mają własną zakładkę.
    byQuarter.set(c.quarter, [...(byQuarter.get(c.quarter) ?? []), c.text]);
  }
  const quarters = [...byQuarter.keys()].reverse();
  return h(
    'div',
    { class: 'panel-body' },
    section(
      'Kronika kampanii',
      h('p', { class: 'lead' }, 'Decyzje Andersona i rozliczenia kwartałów. Wydarzenia świata są w zakładce Depesze.'),
      quarters.map((q) =>
        h(
          'div',
          { class: 'chron' },
          h('button', { class: 'link', onClick: () => on.showQuarter(q) }, quarterName(q)),
          h(
            'ul',
            { class: 'notes' },
            byQuarter.get(q)!.map((t) => h('li', null, t)),
          ),
        ),
      ),
    ),
  );
}

export function renderPanel(tab: TabId, p: DeskPayload, state: PanelState, on: PanelActions): HTMLElement {
  switch (tab) {
    case 'biurko':
      return deskPanel(p, state, on);
    case 'depesze':
      return newsPanel(p, state);
    case 'wywiad':
      return intelPanel(p);
    case 'budzet':
      return budgetPanel(p, state, on);
    case 'ludzie':
      return peoplePanel(p);
    case 'ksp':
      return kspPanel(p, state, on);
    case 'kronika':
      return chroniclePanel(p, on);
  }
}

export { INDICATOR_NAMES };
