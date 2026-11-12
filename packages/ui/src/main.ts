/**
 * Sala kontroli PACE — interfejs gry w przeglądarce.
 *
 * Układ jak w sali kontroli misji: u góry oś czasu kampanii, pod nią wskaźniki, po lewej
 * stanowiska frakcji, w środku zakładki pracy, po prawej sprawy do decyzji i zamknięcie kwartału.
 * Strona pokazuje wyłącznie to, co wie Anderson (widok gracza z serwera).
 */
import { ApiFailure, api, type CampaignListItem, type DeskPayload } from './api.ts';
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
  dialog: 'settings' | 'close' | 'campaigns' | null;
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
  dialog: null,
  settings: loadSettings(),
};
let noticeSeq = 0;

// ── Operacje ────────────────────────────────────────────────────────────────

function notify(kind: 'info' | 'error', text: string): void {
  state.notices = [...state.notices.slice(-3), { id: ++noticeSeq, kind, text }];
}

function accept(payload: DeskPayload, followQuarter: boolean): void {
  const previous = state.payload?.campaign.quarterCode;
  state.payload = payload;
  rememberCampaign(payload.campaign.id);
  if (followQuarter || state.newsQuarter === '' || state.newsQuarter === previous) {
    state.newsQuarter = payload.campaign.quarterCode;
  }
  for (const m of payload.messages) notify('info', m);
}

/** Wykonuje operację na serwerze, blokuje przyciski na czas trwania i pokazuje błąd po polsku. */
async function run(operation: () => Promise<DeskPayload>, followQuarter = false): Promise<void> {
  if (state.busy) return;
  state.busy = true;
  render();
  try {
    accept(await operation(), followQuarter);
  } catch (e) {
    notify('error', e instanceof ApiFailure ? e.message : 'Coś poszło nie tak. Spróbuj ponownie.');
  } finally {
    state.busy = false;
    render();
  }
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
      h('button', { class: 'btn btn-quiet', onClick: () => openDialog('campaigns') }, 'Kampanie'),
      h('button', { class: 'btn btn-quiet', onClick: () => openDialog('settings') }, 'Ustawienia'),
    ),
  );
}

function meter(id: 'ZW' | 'SO' | 'PP' | 'WF', value: number, previous: number): HTMLElement {
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
  );
}

function statusRow(p: DeskPayload): HTMLElement {
  const { indicators, currencies, budget } = p.view;
  const before = p.view.quarterStart;
  const upcoming = budget.upcoming.reduce((s, i) => s + i.units, 0);
  const unsettled = budget.ledger.filter((e) => !e.settled).length;
  return h(
    'section',
    { class: 'status', 'aria-label': 'Wskaźniki' },
    meter('ZW', indicators.ZW, before.ZW),
    meter('SO', indicators.SO, before.SO),
    meter('PP', indicators.PP, before.PP),
    meter('WF', indicators.WF, before.WF),
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
        ),
      ),
    ),
    h(
      'div',
      { class: 'panel', role: 'tabpanel', 'data-scroll': `panel-${state.tab}` },
      renderPanel(
        state.tab,
        p,
        { newsQuarter: state.newsQuarter, busy: state.busy },
        {
          act: (action, target) => void run(() => api.act(campaignId(), action, target)),
          importSave: (path) => void run(() => api.importSave(campaignId(), path)),
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

function dialogShell(title: string, body: (HTMLElement | null)[], footer: HTMLElement[]): HTMLDialogElement {
  const dialog = h(
    'dialog',
    {
      class: 'dialog',
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
  const hasSave = p.view.ksp?.quarter === p.campaign.quarterCode;
  const warnings = [
    pending > 0
      ? `${pending} ${plural(pending, 'sprawa czeka', 'sprawy czekają', 'spraw czeka')} na decyzję. Bez niej silnik przyjmie opcję domyślną i doliczy koszt bierności.`
      : null,
    ud > 0
      ? `Zostało ${ud} ${plural(ud, 'punkt', 'punkty', 'punktów')} Uwagi Dowódcy. Niewykorzystane przepadają.`
      : null,
    hasSave ? null : 'Nie wczytano zapisu KSP za ten kwartał. Loty z tego kwartału nie trafią do gry.',
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
        'Zamknięcia nie da się cofnąć w grze. Kopia stanu sprzed zamknięcia trafia do folderu campaigns/kopie.',
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
            state.tab = 'depesze';
            void run(() => api.closeQuarter(campaignId()), true);
          },
        },
        'Zamknij kwartał',
      ),
    ],
  );
}

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
        state.tab = 'depesze';
        void run(() => api.create(name.value.trim().toLowerCase(), seed.value.trim()), true).then(refreshCampaigns);
      },
    },
    h('label', { for: 'c-id' }, 'Nazwa pliku kampanii'),
    name,
    h('p', { class: 'meta' }, 'Małe litery, cyfry i myślniki.'),
    h('label', { for: 'c-seed' }, 'Ziarno losowania'),
    seed,
    h('p', { class: 'meta' }, 'To samo ziarno i te same decyzje dają ten sam świat. Inne ziarno to inna historia.'),
    h(
      'button',
      { class: 'btn btn-primary', type: 'submit', disabled: state.busy },
      'Rozpocznij kampanię od stycznia 1951',
    ),
  );
}

function campaignList(): HTMLElement | null {
  if (state.campaigns.length === 0) return null;
  return h(
    'ul',
    { class: 'campaigns' },
    state.campaigns.map((c) =>
      h(
        'li',
        null,
        h(
          'button',
          {
            class: 'btn',
            disabled: state.busy,
            onClick: () => {
              state.dialog = null;
              void run(() => api.load(c.id), true);
            },
          },
          c.id,
        ),
        h('span', { class: 'meta' }, `${c.quarterLabel}${c.status === 'active' ? '' : ', zakończona'}`),
      ),
    ),
  );
}

function campaignsDialog(): HTMLDialogElement {
  return dialogShell(
    'Kampanie',
    [
      h('h3', null, 'Wczytaj kampanię'),
      campaignList() ?? h('p', { class: 'empty' }, 'Nie ma jeszcze zapisanych kampanii.'),
      h('h3', null, 'Nowa kampania'),
      campaignForm(),
    ],
    [closeButton()],
  );
}

function startScreen(): HTMLElement {
  return h(
    'main',
    { class: 'start' },
    h('p', { class: 'brand-mark' }, 'PACE'),
    h('h1', null, 'Pan-Atlantic Commission for Experimentation'),
    h(
      'p',
      { class: 'lead' },
      'Jest styczeń 1951 roku. Eugene Anderson obejmuje funkcję Dowódcy Operacyjnego. Rakiety budujesz w KSP, a tutaj prowadzisz politykę, budżet i ludzi.',
    ),
    state.campaigns.length > 0
      ? h('section', { class: 'block' }, h('h2', null, 'Wczytaj kampanię'), campaignList())
      : null,
    h('section', { class: 'block' }, h('h2', null, 'Nowa kampania'), campaignForm()),
    h('button', { class: 'btn btn-quiet', onClick: () => openDialog('settings') }, 'Ustawienia'),
  );
}

// ── Rysowanie ───────────────────────────────────────────────────────────────

function notices(): HTMLElement {
  return h(
    'div',
    { class: 'notices', role: 'status', 'aria-live': 'polite' },
    state.notices.map((n) =>
      h(
        'div',
        { class: `notice notice-${n.kind}` },
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

  const p = state.payload;
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
  else if (state.dialog === 'campaigns') dialog = campaignsDialog();
  else if (state.dialog === 'close' && p) dialog = closeDialog(p);
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
    const last = lastCampaign();
    if (last && state.campaigns.some((c) => c.id === last)) accept(await api.load(last), true);
  } catch (e) {
    notify('error', e instanceof ApiFailure ? e.message : 'Nie udało się wczytać gry.');
  }
  state.notices = state.notices.filter((n) => n.kind === 'error');
  render();
}

void boot();
