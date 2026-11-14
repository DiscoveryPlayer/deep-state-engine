/**
 * Narrator i warstwa obrazu: okno Łącznika AI, czytnik narracji, odprawa po zamknięciu kwartału,
 * Tablica sytuacyjna i wykresy przebiegu wskaźników.
 *
 * Tekst narracji przychodzi spoza gry (wkleja go gracz), więc trafia na stronę wyłącznie
 * jako tekst (`textContent`), nigdy jako HTML.
 */
import type { DeskPayload, NarratorPackageResponse } from './api.ts';
import { h, plural, svg, type Child } from './dom.ts';

export type NarrativeEntry = DeskPayload['view']['narrative'][number];
export type NarrativeSource = NarrativeEntry['source'];

export interface LiaisonState {
  kind: 'quarter' | 'decision' | 'conversation' | 'event';
  /** Dla głosów i rozmowy: sprawa do decyzji. */
  instanceId?: string;
  /** Dla sceny wydarzenia: kod karty (W1, W2…). */
  card?: string;
  mode: 'full' | 'short';
  source: NarrativeSource;
  /** Czy pakiet ma zawierać warstwę ukrytą (to, czego Anderson nie wie). */
  secrets: boolean;
  /** Pakiet pobrany z serwera albo null, gdy jeszcze się ładuje. */
  pkg: NarratorPackageResponse | null;
  /** Ścieżka pliku, do którego zapisano pakiet (zamiast schowka). */
  file: string | null;
  reply: string;
  copied: boolean;
}

export interface LiaisonActions {
  setMode(mode: 'full' | 'short'): void;
  setSource(source: NarrativeSource): void;
  setSecrets(on: boolean): void;
  setReply(text: string): void;
  copy(): void;
  saveFile(): void;
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
  // Sekcje kart wydarzeń (W1, W2…) pokazują się przy swoich kartach, nie tutaj.
  const others = entry.sections.filter((s) => s !== scene && s !== press && !/^w\d+$/.test(s.key));
  if (compact) {
    return h(
      'div',
      { class: 'narrative' },
      sheet(
        scene.title,
        scene.body,
        entry.sections.some((s) => s !== scene && !/^w\d+$/.test(s.key))
          ? h('button', { class: 'btn btn-small', onClick: onRead }, 'Prasa i kuluary')
          : null,
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
  // Pakiet z warstwą ukrytą nigdy nie jest wyświetlany: gracz kopiuje go albo zapisuje, nie czytając.
  const secret = l.secrets;
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
  const conversation = l.kind === 'conversation';

  return [
    h(
      'p',
      { class: 'lead' },
      conversation
        ? 'Rozmowę prowadzisz w czacie z AI: narrator podaje kwestie do wyboru, Ty odpowiadasz numerem albo własnymi słowami. Po trzech turach wypisze blok WYNIK. Wtedy wklej tu jego ostatnią odpowiedź.'
        : 'Narrator pracuje poza grą. Kopiujesz pakiet, wklejasz go w rozmowę z AI, a odpowiedź wklejasz tutaj.',
    ),
    h(
      'section',
      { class: 'step' },
      h('h3', null, '1. Przekaż pakiet narratorowi'),
      h(
        'fieldset',
        { class: 'choice' },
        h('legend', null, 'Rozmowa'),
        (
          [
            ['full', 'Nowa rozmowa (pakiet z zasadami i opisem świata)'],
            ['short', 'Ta sama rozmowa co poprzednio (same dane)'],
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
      h(
        'label',
        { class: 'check' },
        h('input', {
          type: 'checkbox',
          checked: secret,
          disabled: busy,
          onChange: (e: Event) => on.setSecrets((e.currentTarget as HTMLInputElement).checked),
        }),
        h(
          'span',
          null,
          h('b', null, 'Dołącz warstwę ukrytą'),
          h(
            'small',
            null,
            'Narrator dostanie też to, czego Anderson nie wie: tajne wydarzenia, ukryte urazy, prawdziwe cele frakcji i to, co nadchodzi. Użyje tego do budowania nastroju. Gra nie pokaże Ci treści takiego pakietu; reszta zależy od Twojej uczciwości.',
          ),
        ),
      ),
      secret
        ? h(
            'p',
            { class: 'sealed' },
            l.pkg
              ? `Pakiet zapieczętowany (${l.pkg.chars.toLocaleString('pl-PL')} znaków). Skopiuj go albo zapisz do pliku i przekaż narratorowi bez czytania.`
              : 'Przygotowuję pakiet…',
          )
        : pkg,
      l.file ? h('p', { class: 'sealed' }, `Zapisano do pliku: ${l.file}. Załącz go w rozmowie z AI.`) : null,
      h(
        'div',
        { class: 'step-actions' },
        h(
          'button',
          { class: 'btn btn-primary', disabled: l.pkg === null, 'data-focus': 'liaison-copy', onClick: on.copy },
          l.copied ? 'Skopiowano' : 'Kopiuj pakiet',
        ),
        h('button', { class: 'btn', disabled: l.pkg === null || busy, onClick: on.saveFile }, 'Zapisz do pliku'),
        link
          ? h(
              'a',
              { class: 'btn', href: link, target: '_blank', rel: 'noopener noreferrer' },
              `Otwórz ${SOURCE_NAMES[l.source]} w nowej karcie`,
            )
          : null,
        l.pkg && !secret ? h('span', { class: 'meta' }, `${l.pkg.chars.toLocaleString('pl-PL')} znaków`) : null,
      ),
    ),
    h(
      'section',
      { class: 'step' },
      h('h3', null, conversation ? '2. Wklej ostatnią odpowiedź z blokiem WYNIK' : '2. Wklej odpowiedź narratora'),
      h(
        'label',
        { for: 'liaison-reply', class: 'meta' },
        conversation
          ? 'Gra odczyta z niej literę opcji i streszczenie rozmowy. Decyzję i tak zatwierdzasz sam.'
          : 'Gra wczyta sekcje zaczynające się od „## NAZWA”.',
      ),
      reply,
      h(
        'div',
        { class: 'step-actions' },
        h('button', { class: 'btn btn-primary', disabled: busy, onClick: on.submit }, 'Wczytaj narrację'),
      ),
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
