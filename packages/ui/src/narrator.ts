/**
 * Narrator i warstwa obrazu: okno Łącznika AI, czytnik narracji, odprawa po zamknięciu kwartału,
 * Tablica sytuacyjna i wykresy przebiegu wskaźników.
 *
 * Tekst narracji przychodzi spoza gry (wkleja go gracz), więc trafia na stronę wyłącznie
 * jako tekst (`textContent`), nigdy jako HTML.
 */
import type { DeskPayload, NarratorPackage } from './api.ts';
import { h, plural, quarterName, signed, svg, type Child } from './dom.ts';

export type NarrativeEntry = DeskPayload['view']['narrative'][number];
export type NarrativeSource = NarrativeEntry['source'];

export interface LiaisonState {
  kind: 'quarter' | 'decision';
  instanceId?: string;
  mode: 'full' | 'short';
  source: NarrativeSource;
  /** Pakiet pobrany z serwera albo null, gdy jeszcze się ładuje. */
  pkg: NarratorPackage | null;
  reply: string;
  copied: boolean;
}

export interface LiaisonActions {
  setMode(mode: 'full' | 'short'): void;
  setSource(source: NarrativeSource): void;
  setReply(text: string): void;
  copy(): void;
  submit(): void;
}

const SOURCES: { id: NarrativeSource; label: string; url: string | null }[] = [
  { id: 'claude', label: 'Claude', url: 'https://claude.ai/new' },
  { id: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app' },
  { id: 'other', label: 'Inny model', url: null },
];
const SOURCE_NAMES: Record<NarrativeSource, string> = { claude: 'Claude', gemini: 'Gemini', other: 'inny model' };

/** Akapity z tekstu: pusty wiersz dzieli akapity, pojedynczy znak nowej linii zostaje w akapicie. */
function paragraphs(text: string): HTMLElement[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => h('p', null, p));
}

export function findNarrative(
  entries: NarrativeEntry[],
  quarter: string,
  kind: NarrativeEntry['kind'],
  ref?: string,
): NarrativeEntry | undefined {
  return entries.find((e) => e.quarter === quarter && e.kind === kind && e.ref === ref);
}

// ── Narracja na stronie ─────────────────────────────────────────────────────

/** Arkusz maszynopisu z jedną sekcją narracji. */
function sheet(title: string, body: string, extra: Child = null): HTMLElement {
  return h('article', { class: 'sheet' }, h('h4', null, title), ...paragraphs(body), extra);
}

/** Wycinki prasowe: każdy akapit sekcji PRASA to osobny wycinek. */
function clippings(body: string): HTMLElement {
  return h(
    'div',
    { class: 'clippings' },
    body
      .split(/\n{2,}/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .map((c) => {
        const [head, ...rest] = c.split('\n');
        return h(
          'article',
          { class: 'clipping' },
          h('h5', null, (head ?? '').replace(/^[-–•]\s*/, '')),
          rest.length > 0 ? h('p', null, rest.join(' ')) : null,
        );
      }),
  );
}

/** Blok narracji kwartału: scena, prasa, kuluary. `compact` pokazuje tylko scenę. */
export function quarterNarrative(entry: NarrativeEntry, compact: boolean, onRead: () => void): HTMLElement {
  const scene = entry.sections.find((s) => s.key === 'scena') ?? entry.sections[0]!;
  const press = entry.sections.find((s) => s.key === 'prasa');
  const others = entry.sections.filter((s) => s !== scene && s !== press);
  if (compact) {
    return h(
      'div',
      { class: 'narrative' },
      sheet(
        scene.title,
        scene.body,
        entry.sections.length > 1 ? h('button', { class: 'btn btn-small', onClick: onRead }, 'Prasa i kuluary') : null,
      ),
    );
  }
  return h(
    'div',
    { class: 'narrative' },
    sheet(scene.title, scene.body),
    press ? h('div', { class: 'press' }, h('h4', null, press.title), clippings(press.body)) : null,
    ...others.map((s) => sheet(s.title, s.body)),
    h('p', { class: 'meta' }, `Narracja: ${SOURCE_NAMES[entry.source]}. Tekst nie zmienia stanu gry.`),
  );
}

/** Zachęta, gdy kwartał nie ma jeszcze narracji. */
export function narrativeInvite(onAsk: () => void, busy: boolean): HTMLElement {
  return h(
    'div',
    { class: 'invite' },
    h(
      'p',
      null,
      'Ten kwartał nie ma jeszcze narracji. Narrator (Claude albo Gemini w przeglądarce) dopisze scenę z gabinetu, wycinki prasowe i kuluary na podstawie depesz.',
    ),
    h('button', { class: 'btn', disabled: busy, onClick: onAsk }, 'Poproś narratora'),
  );
}

/** Głosy doradców w sprawie do decyzji. */
export function voices(entry: NarrativeEntry): HTMLElement {
  return h(
    'div',
    { class: 'voices' },
    entry.sections.map((s) =>
      h('blockquote', { class: 'voice' }, h('cite', null, s.title.replace(/^Głos:?\s*/i, '')), ...paragraphs(s.body)),
    ),
  );
}

// ── Okna ────────────────────────────────────────────────────────────────────

/** Treść okna Łącznika AI: krok 1 kopiuje pakiet, krok 2 wkleja odpowiedź. */
export function liaisonBody(l: LiaisonState, busy: boolean, on: LiaisonActions): HTMLElement[] {
  const link = SOURCES.find((s) => s.id === l.source)?.url ?? null;
  const reply = h('textarea', {
    id: 'liaison-reply',
    class: 'liaison-text',
    rows: 8,
    spellcheck: 'false',
    placeholder: 'Tu wklej całą odpowiedź narratora (Ctrl i V).',
    'data-focus': 'liaison-reply',
    onInput: (e: Event) => on.setReply((e.currentTarget as HTMLTextAreaElement).value),
  });
  reply.value = l.reply;
  const pkg = h('textarea', {
    id: 'liaison-package',
    class: 'liaison-text',
    rows: 6,
    readonly: true,
    spellcheck: 'false',
    'aria-label': 'Pakiet dla narratora',
    onFocus: (e: Event) => (e.currentTarget as HTMLTextAreaElement).select(),
  });
  pkg.value = l.pkg?.prompt ?? 'Przygotowuję pakiet…';

  return [
    h(
      'p',
      { class: 'lead' },
      'Narrator pracuje poza grą. Kopiujesz pakiet, wklejasz go w rozmowę z AI, a odpowiedź wklejasz tutaj. Pakiet zawiera tylko to, co wie Anderson.',
    ),
    h(
      'section',
      { class: 'step' },
      h('h3', null, '1. Skopiuj pakiet i wklej go w rozmowę'),
      h(
        'fieldset',
        { class: 'choice' },
        h('legend', null, 'Rozmowa'),
        (
          [
            ['full', 'Nowa rozmowa (pakiet z zasadami i opisem świata)'],
            ['short', 'Ta sama rozmowa co poprzednio (sam kwartał)'],
          ] as const
        ).map(([value, label]) =>
          h(
            'label',
            null,
            h('input', {
              type: 'radio',
              name: 'liaison-mode',
              value,
              checked: l.mode === value,
              disabled: busy,
              onChange: () => on.setMode(value),
            }),
            h('span', null, label),
          ),
        ),
      ),
      h(
        'fieldset',
        { class: 'choice' },
        h('legend', null, 'Model'),
        SOURCES.map((s) =>
          h(
            'label',
            null,
            h('input', {
              type: 'radio',
              name: 'liaison-source',
              value: s.id,
              checked: l.source === s.id,
              onChange: () => on.setSource(s.id),
            }),
            h('span', null, s.label),
          ),
        ),
      ),
      pkg,
      h(
        'div',
        { class: 'step-actions' },
        h(
          'button',
          { class: 'btn btn-primary', disabled: l.pkg === null, 'data-focus': 'liaison-copy', onClick: on.copy },
          l.copied ? 'Skopiowano' : 'Kopiuj pakiet',
        ),
        link
          ? h(
              'a',
              { class: 'btn', href: link, target: '_blank', rel: 'noopener noreferrer' },
              `Otwórz ${SOURCE_NAMES[l.source]} w nowej karcie`,
            )
          : null,
        l.pkg ? h('span', { class: 'meta' }, `${l.pkg.prompt.length.toLocaleString('pl-PL')} znaków`) : null,
      ),
    ),
    h(
      'section',
      { class: 'step' },
      h('h3', null, '2. Wklej odpowiedź narratora'),
      h('label', { for: 'liaison-reply', class: 'meta' }, 'Gra wczyta sekcje zaczynające się od „## NAZWA”.'),
      reply,
      h(
        'div',
        { class: 'step-actions' },
        h('button', { class: 'btn btn-primary', disabled: busy, onClick: on.submit }, 'Wczytaj narrację'),
      ),
    ),
  ];
}

/** Odprawa po zamknięciu kwartału: co zostawił stary kwartał i co przynosi nowy. */
export function briefingBody(p: DeskPayload): (HTMLElement | null)[] {
  const report = p.view.reports.at(-1);
  // Najpierw wydarzenia świata, potem reszta; reakcje i komunikaty o sytuacjach zostają w Depeszach.
  const rank = (kind: string) => (kind === 'thread' || kind === 'template' ? 0 : 1);
  const news = p.view.worldNews
    .filter((n) => n.quarter === p.campaign.quarterCode && n.kind !== 'reaction' && n.kind !== 'situation')
    .sort((a, b) => rank(a.kind) - rank(b.kind));
  const pending = p.view.pendingDilemmas.length;
  const labels: [keyof NonNullable<typeof report>['after'], string][] = [
    ['ZW', 'Zaufanie Waszyngtonu'],
    ['SO', 'Spójność Organizacji'],
    ['PP', 'Poparcie Publiczne'],
    ['WF', 'Wiarygodność Fasady'],
  ];
  return [
    report
      ? h(
          'section',
          { class: 'block' },
          h('h3', null, `Bilans: ${quarterName(report.quarter)}`),
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
        )
      : null,
    h(
      'section',
      { class: 'block' },
      h('h3', null, 'Na biurku od rana'),
      news.length > 0
        ? h(
            'ol',
            { class: 'headlines' },
            news.slice(0, 6).map((n) => h('li', null, n.title)),
          )
        : h('p', { class: 'empty' }, 'Żadnych depesz. Rzadki, spokojny kwartał.'),
      news.length > 6 ? h('p', { class: 'meta' }, `i ${news.length - 6} więcej w zakładce Depesze`) : null,
      pending > 0
        ? h(
            'p',
            { class: 'alert' },
            `${pending} ${plural(pending, 'sprawa czeka', 'sprawy czekają', 'spraw czeka')} na Twoją decyzję.`,
          )
        : null,
    ),
  ];
}

// ── Obraz ───────────────────────────────────────────────────────────────────

/** Przebieg wskaźnika w ostatnich kwartałach: cienka linia pod licznikiem. */
export function sparkline(values: number[], label: string): SVGElement | null {
  if (values.length < 3) return null;
  const [w, hgt, pad] = [96, 22, 2];
  const lo = Math.min(...values);
  const span = Math.max(1, Math.max(...values) - lo);
  const points = values.map((v, i) => {
    const x = pad + (i * (w - 2 * pad)) / (values.length - 1);
    const y = hgt - pad - ((v - lo) * (hgt - 2 * pad)) / span;
    return [Number(x.toFixed(1)), Number(y.toFixed(1))] as const;
  });
  const last = points.at(-1)!;
  return svg(
    'svg',
    { class: 'spark', viewBox: `0 0 ${w} ${hgt}`, role: 'img', 'aria-label': label, preserveAspectRatio: 'none' },
    svg('polyline', { points: points.map((p) => p.join(',')).join(' ') }),
    svg('circle', { cx: last[0], cy: last[1], r: 2 }),
  );
}

/** Tablica sytuacyjna: sześciokąt na region, jaśniejszy tam, skąd przyszło więcej depesz. */
export function regionBoard(regions: DeskPayload['regions'], quarterLabel: string): HTMLElement | null {
  if (regions.length === 0) return null;
  return h(
    'div',
    { class: 'board', role: 'group', 'aria-label': `Tablica sytuacyjna: ${quarterLabel}` },
    h(
      'ul',
      { class: 'hexes' },
      regions.map((r) => {
        const level = r.news === 0 ? 'quiet' : r.news <= 2 ? 'active' : 'hot';
        return h(
          'li',
          { class: `hex hex-${level}` },
          h('b', null, String(r.news)),
          h('span', null, r.title),
          h('span', { class: 'sr' }, plural(r.news, 'depesza', 'depesze', 'depesz')),
        );
      }),
    ),
  );
}
