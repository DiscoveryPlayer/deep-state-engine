import { quarterCode, quarterLabel, type NarratorSecrets, type PlayerView } from '@dse/core';

/** Jawna obsada: nazwy frakcji i karty głosu dyrektorów. Notatki Mistrza Gry tu nie trafiają. */
export interface NarratorCast {
  factions: { id: string; name: string; summary: string }[];
  /** Klucz: identyfikator postaci. Tylko rejestr i nawyki mowy (bez `neverSays` i `dmNote`). */
  voices: Record<string, { register: string; habits: string[] }>;
}

export type NarratorRequest =
  /** Narracja kwartału: scena, karty wydarzeń, prasa, kuluary. */
  | { kind: 'quarter'; mode: PackageMode }
  /** Głosy doradców w sprawie czekającej na decyzję. */
  | { kind: 'decision'; mode: PackageMode; instanceId: string }
  /** Rozmowa w czacie z AI, która kończy się wyborem jednej z opcji gry (blok WYNIK). */
  | { kind: 'conversation'; mode: PackageMode; instanceId: string }
  /** Scena do jednej karty wydarzenia (kod W1, W2… z bieżącego kwartału). */
  | { kind: 'event'; mode: PackageMode; card: string };

/** `full` zaczyna nową rozmowę (zasady, świat, obsada); `short` kontynuuje rozmowę, która je zna. */
export type PackageMode = 'full' | 'short';

export interface NarratorPackage {
  title: string;
  prompt: string;
  /** Czy pakiet zawiera warstwę ukrytą (wtedy interfejs nie pokazuje jego treści). */
  secret: boolean;
}

export class NarratorError extends Error {}

/** Nagłówki sekcji, których gra oczekuje w odpowiedzi. */
export const QUARTER_SECTIONS = ['SCENA', 'PRASA', 'KULUARY'] as const;
export const DECISION_SECTION_PREFIX = 'GŁOS';
/** Sekcja, którą kończy się rozmowa prowadząca do decyzji. */
export const RESULT_SECTION = 'WYNIK';

const DISPOSITION = ['wrogie', 'niechętne', 'chłodne', 'neutralne', 'życzliwe', 'przychylne', 'oddane'];
const TENSION = ['', 'krawędź wojny', 'kryzys', 'napięcie', 'stan normalny', 'odprężenie'];
const INDICATORS = [
  ['ZW', 'Zaufanie Waszyngtonu'],
  ['SO', 'Spójność Organizacji'],
  ['PP', 'Poparcie Publiczne'],
  ['WF', 'Wiarygodność Fasady'],
] as const;

/** Ile znaków poprzedniej sceny trafia do Pakietu dla ciągłości. */
const PREVIOUS_SCENE_CHARS = 700;

/**
 * Kanon świata gry sprzed 1951 roku (Dokument Decyzyjny 4.3). Bez niego model „poprawia”
 * grę na naszą historię.
 */
const CANON = [
  'Po śmierci Roosevelta prezydentem został James Byrnes (1945–1949). Bomby atomowe spadły na Hiroszimę, Nagasaki i Kobe.',
  'Wybory 1948 wygrał Harry Truman. W wyborach 1952 rywalem Eisenhowera jest Averell Harriman.',
  'PACE (Pan-Atlantic Commission for Experimentation) to wspólna agencja badań rakietowych i lotniczych państw Zachodu, z siedzibą w USA.',
  'RFN należy do PACE z ograniczeniami do 1955 roku, Japonia jest obserwatorem od 1952 roku, Australia udostępnia poligon Woomera.',
];

const RULES = `ZASADY (obowiązują w całej rozmowie)
1. Niczego nie rozstrzygasz. Fakty, liczby i wyniki ustala gra. Opisujesz wyłącznie to, co jest w pakiecie. Nie dodajesz wydarzeń, zgonów, dat, kwot, wyników lotów ani decyzji, których w pakiecie nie ma.
2. Piszesz z punktu widzenia Andersona: to, co widzi i słyszy. Nie przepowiadasz, co się stanie, i nie podpowiadasz, którą opcję wybrać.
3. Liczby wskaźników zostają w pakiecie. W narracji pokazujesz je obrazem: tonem rozmowy, miną senatora, nagłówkiem gazety.
4. Dialogi piszesz tylko postaciom fikcyjnym z obsady PACE i postaciom bezimiennym (sekretarka, reporter, kongresman z komisji). Prawdziwe osoby historyczne pojawiają się tylko tak, jak w depeszach, w mowie zależnej. Nie wkładasz im w usta wymyślonych cytatów i nie przypisujesz im wymyślonych przewinień.
5. Świat gry różni się od naszej historii. Jeśli pakiet mówi inaczej niż podręcznik, rację ma pakiet. Nie prostujesz go.
6. Styl: polszczyzna literacka, czas teraźniejszy, zimnowojenny dramat gabinetowy. Konkret zamiast przymiotników: przedmioty z epoki, pogoda, dym, papier. Bez patosu, bez podsumowań i morałów.
7. Format: odpowiadasz samymi sekcjami, każda zaczyna się od linii z nagłówkiem „## NAZWA”. Bez wstępu, bez komentarza po zakończeniu, bez pytań do gracza.`;

function signed(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : 'bez zmian';
}

const REGISTRY_TYPES: Record<string, string> = {
  debt: 'Dług',
  promise: 'Obietnica',
  secret: 'Tajemnica',
  grudge: 'Uraza',
  hook: 'Hak',
  precedent: 'Precedens',
  merit: 'Zasługa',
};
const NEWS_KINDS: Record<string, string> = {
  thread: 'świat',
  template: 'świat',
  pattern: 'świat',
  dilemma: 'decyzja Andersona',
  echo: 'następstwo',
  flight: 'lot PACE',
};

function worldBrief(view: PlayerView, cast: NarratorCast): string {
  const lines: string[] = [];
  lines.push('ŚWIAT GRY');
  lines.push(
    `Gra „The Deep State Engine”. Gracz jest Eugene'em Andersonem, Dowódcą Operacyjnym ${view.organization.acronym} (${view.organization.fullName}). ` +
      'Rakiety buduje i wystrzeliwuje w osobnej grze; tutaj prowadzi politykę, budżet i ludzi. Kwartał to jedna tura.',
  );
  for (const c of CANON) lines.push(`- ${c}`);
  lines.push('');
  lines.push('OBSADA PACE (postaci fikcyjne)');
  lines.push(
    '- Eugene Anderson, Dowódca Operacyjny. To gracz: nie piszesz jego myśli ani decyzji, najwyżej krótkie, neutralne kwestie.',
  );
  for (const f of cast.factions) {
    const heads = view.characters.filter((c) => c.faction === f.id && c.status === 'active');
    // Odsyłacze do dokumentów projektu („(DD 4.5)”) nic modelowi nie mówią.
    lines.push(`- ${f.id}, ${f.name}: ${f.summary.replace(/\s*\((?:DD|GDD) [^)]*\)/g, '')}`);
    for (const c of heads) {
      const voice = cast.voices[c.id];
      const how = voice ? ` Mówi: ${voice.register}${voice.habits.length ? `; ${voice.habits.join(', ')}` : ''}.` : '';
      lines.push(`  · ${c.name}, ${c.role}.${how}`);
    }
  }
  return lines.join('\n');
}

function situationBlock(view: PlayerView): string {
  const code = quarterCode(view.quarter);
  const lines: string[] = [];
  lines.push(`STAN NA ${quarterLabel(view.quarter).toUpperCase()} (${code})`);
  for (const [id, name] of INDICATORS) {
    const now = view.indicators[id];
    lines.push(`- ${name}: ${now} na 100 (${signed(now - view.quarterStart[id])} od początku kwartału)`);
  }
  lines.push(`- Napięcie Geopolityczne: ${TENSION[view.indicators.NG] ?? view.indicators.NG}`);
  const cast = view.factions.map((f) => `${f.id} ${DISPOSITION[f.disposition + 3] ?? f.disposition}`).join(', ');
  lines.push(`- Nastawienie frakcji do Andersona: ${cast}`);
  if (view.situations.length > 0) {
    lines.push('');
    lines.push('SYTUACJE TRWAJĄCE');
    for (const s of view.situations) lines.push(`- ${s.title}: ${s.text}`);
  }
  return lines.join('\n');
}

/** Wydarzenia kwartału z kodami kart. Reakcje i komunikaty stoją pod kartą, której dotyczą. */
function eventsBlock(view: PlayerView): string {
  const code = quarterCode(view.quarter);
  const news = view.worldNews.filter((n) => n.quarter === code);
  if (news.length === 0) return 'WYDARZENIA TEGO KWARTAŁU\n(brak wydarzeń: spokojny kwartał)';
  const lines = ['WYDARZENIA TEGO KWARTAŁU (kod karty w nawiasie kwadratowym)'];
  for (const n of news) {
    if (n.card) {
      const kind = NEWS_KINDS[n.kind] ?? n.kind;
      const cause = n.cause ? `; wynika z: ${n.cause}` : '';
      lines.push(`[${n.card}] (${kind}${cause}) ${n.title}. ${n.text}`);
    } else {
      lines.push(
        `    ↳ ${n.actor ? `reakcja, ${n.actor}` : 'komunikat'}: ${n.kind === 'reaction' ? '' : `${n.title}. `}${n.text}`,
      );
    }
  }
  return lines.join('\n');
}

function registryBlock(view: PlayerView): string | null {
  const active = view.registry.filter((r) => r.status === 'active');
  if (active.length === 0) return null;
  const lines = ['REJESTR NASTĘPSTW (to, co Anderson wie, że wisi nad PACE)'];
  for (const r of active)
    lines.push(`- ${REGISTRY_TYPES[r.type] ?? r.type}: ${r.title}${r.source ? ` (po: ${r.source})` : ''}`);
  return lines.join('\n');
}

function intelBlock(view: PlayerView): string | null {
  const code = quarterCode(view.quarter);
  const items = view.assessments.filter((a) => a.quarter === code);
  if (items.length === 0) return null;
  const lines = ['OCENY WYWIADU (niepewne; kod: wiarygodność źródła A–F, prawdopodobieństwo informacji 1–6)'];
  for (const a of items) lines.push(`- [${a.reliability}-${a.credibility}] ${a.text}`);
  return lines.join('\n');
}

function pendingBlock(view: PlayerView): string | null {
  if (view.pendingDilemmas.length === 0) return null;
  const lines = ['SPRAWY CZEKAJĄCE NA DECYZJĘ ANDERSONA (jeszcze nierozstrzygnięte)'];
  for (const d of view.pendingDilemmas) lines.push(`- ${d.title}: ${d.prompt}`);
  return lines.join('\n');
}

function lastQuarterBlock(view: PlayerView): string | null {
  const report = view.reports.at(-1);
  if (!report) return null;
  const lines = [`CO ZOSTAŁO PO POPRZEDNIM KWARTALE (${report.quarter})`];
  // Uwagi techniczne o zapisie KSP dotyczą gracza, nie świata przedstawionego.
  for (const note of report.notes) if (!/zapisu kariery|migawk/i.test(note)) lines.push(`- ${note}`);
  const scene = view.narrative
    .filter((n) => n.kind === 'quarter' && n.quarter === report.quarter)
    .at(-1)
    ?.sections.find((s) => s.key === 'scena');
  if (scene) {
    const cut = scene.body.length > PREVIOUS_SCENE_CHARS ? `${scene.body.slice(0, PREVIOUS_SCENE_CHARS)}…` : scene.body;
    lines.push(`- Twoja poprzednia scena (dla ciągłości, nie powtarzaj jej): ${cut}`);
  }
  return lines.length > 1 ? lines.join('\n') : null;
}

/** To, co Anderson sam zrobił w tym kwartale: decyzje w sprawach i akcje Biurka. */
function deedsBlock(view: PlayerView): string | null {
  const code = quarterCode(view.quarter);
  const decisions = view.worldNews.filter((n) => n.quarter === code && n.kind === 'dilemma');
  if (decisions.length === 0 && view.deskLog.length === 0) return null;
  const lines = ['CO ANDERSON POSTANOWIŁ I ZROBIŁ W TYM KWARTALE'];
  for (const d of decisions) lines.push(`- Decyzja [${d.card}]: ${d.title}. ${d.text}`);
  for (const d of view.deskLog) lines.push(`- ${d.summary}`);
  return lines.join('\n');
}

/** Warstwa ukryta: tylko na życzenie gracza, z osobnymi zasadami użycia. */
function secretsBlock(secrets: NarratorSecrets): string {
  const lines = [
    'WARSTWA UKRYTA (tylko dla ciebie)',
    'Tego Anderson NIE wie i gracz nie może się tego dowiedzieć z twojego tekstu. Używasz tej wiedzy jak reżyser:',
    '- wolno: nastrój, niedopowiedzenie, gest, szczegół, który nabierze sensu później; postać z ukrytą cechą zachowuje się zgodnie z nią;',
    '- nie wolno: nazwać ukrytego faktu, zacytować tej sekcji, potwierdzić jej istnienia, zapowiedzieć przyszłego wydarzenia wprost ani rozstrzygać czegokolwiek;',
    '- test: czytelnik, który zna tylko twój tekst, nie potrafi z niego wypisać żadnej pozycji z tej sekcji.',
  ];
  const section = (title: string, items: string[]) => {
    if (items.length === 0) return;
    lines.push('', title);
    for (const i of items) lines.push(`- ${i}`);
  };
  section(
    'Tajne wydarzenia tego kwartału',
    secrets.secretNews.map((n) => `${n.title}. ${n.text}`),
  );
  section(
    'Ukryte wpisy Rejestru Następstw',
    secrets.hiddenRegistry.map(
      (r) =>
        `${REGISTRY_TYPES[r.type] ?? r.type}: ${r.title}${r.source ? ` (po: ${r.source})` : ''}${r.note ? ` — ${r.note}` : ''}`,
    ),
  );
  section(
    'Frakcje: prawdziwe cele i cierpliwość',
    secrets.factions.map(
      (f) =>
        `${f.id}: Agenda „${f.agenda}”${f.agendaKnown ? '' : ' (Anderson jej nie zna)'}` +
        `${f.patience ? `; zegar Cierpliwości ${f.patience}` : ''}; eskalacja ${f.escalation} z 4`,
    ),
  );
  section(
    'Postaci: to, czego nie widać',
    secrets.characters
      .filter((c) => c.hiddenTraits.length > 0 || c.note)
      .map(
        (c) =>
          `${c.name}: Lojalność ${c.loyalty}` +
          `${c.hiddenTraits.length ? `; cechy ukryte: ${c.hiddenTraits.join(', ')}` : ''}${c.note ? `; ${c.note}` : ''}`,
      ),
  );
  section(
    'Echa, które wrócą w najbliższych kwartałach',
    secrets.upcomingEchoes.map((e) => `${e.due}: ${e.title} (po: ${e.cause})`),
  );
  section(
    'Co rozstrzygnie się w następnym kwartale (wynik jeszcze nieznany nawet tobie)',
    secrets.upcomingStages.map((s) => `${s.thread}: ${s.stage}`),
  );
  section(
    'Zmienne świata',
    [secrets.variables.map((v) => `${v.title} ${v.value}`).join('; ')].filter((x) => x !== ''),
  );
  section(
    'Rozbieżność z historią (0 = jak w podręczniku, 10 = inny świat)',
    [secrets.divergence.map((d) => `${d.region} ${d.value}`).join('; ')].filter((x) => x !== ''),
  );
  return lines.join('\n');
}

const QUARTER_TASK = `ZADANIE: NARRACJA KWARTAŁU
Napisz sekcje dokładnie z tymi nagłówkami, w tej kolejności:

## SCENA
Jedna scena z gabinetu Andersona albo z korytarzy PACE na otwarcie kwartału, 150–220 słów. Zacznij od tego, co wynika z decyzji Andersona (wydarzenia oznaczone „następstwo” i „decyzja Andersona”) albo z lotów PACE, jeśli są w pakiecie; dopiero potem wielki świat. Niech ktoś z dyrektorów powie dwie lub trzy kwestie we własnym rejestrze.

## W…
Od dwóch do czterech osobnych sekcji, po jednej na najważniejsze wydarzenia kwartału. Nagłówkiem sekcji jest sam kod karty, na przykład „## W3”. Każda ma 60–100 słów i pokazuje, jak to wydarzenie dociera do PACE: kto przynosi wiadomość, co mówi, co leży na biurku. Pierwszeństwo mają następstwa decyzji i loty. Nie powtarzaj treści depeszy, tylko ją ożyw.

## PRASA
Trzy krótkie wycinki z gazet tego kwartału, oddzielone pustą linią. Każdy ma dwie linie: w pierwszej fikcyjny tytuł gazety i nagłówek, w drugiej dwa zdania tekstu. Co najmniej jeden wycinek spoza USA. Loty oznaczone jako tajne do prasy nie trafiają.

## KULUARY
Jeden akapit, 60–90 słów: co się mówi na korytarzach PACE o nastrojach frakcji, o Rejestrze Następstw i o sprawach czekających na decyzję. Bez przepowiadania wyniku.`;

const DECISION_TASK = `ZADANIE: GŁOSY W SPRAWIE
Anderson musi rozstrzygnąć sprawę opisaną niżej. Napisz głosy dwóch albo trzech dyrektorów z obsady, tych, których sprawa dotyczy najbardziej. Każdy głos to osobna sekcja:

## GŁOS: imię i nazwisko dyrektora
Notatka służbowa albo kwestia wypowiedziana w drzwiach gabinetu, 60–100 słów, w rejestrze tej postaci. Każdy dyrektor broni interesu swojej frakcji i opowiada się za inną opcją albo ostrzega przed inną. Jeśli w Rejestrze Następstw jest wpis, który ich dotyczy, mogą do niego nawiązać. Nikt nie wie, jak się to skończy: żadnych zapowiedzi skutków w liczbach, żadnych pewników.`;

const CONVERSATION_TASK = `ZADANIE: ROZMOWA PROWADZĄCA DO DECYZJI
To zadanie jest wyjątkiem od zasady 7: prowadzisz z graczem rozmowę w kilku turach, a sekcje wypisujesz dopiero na końcu.

Przebieg:
1. Otwierasz scenę (80–120 słów): jeden albo dwóch dyrektorów przychodzi do gabinetu ze sprawą opisaną niżej. Kończysz trzema ponumerowanymi kwestiami Andersona do wyboru (1, 2, 3). Kwestie różnią się kierunkiem i tonem. Gracz odpowiada numerem albo własnymi słowami.
2. Prowadzisz trzy tury. W każdej pokazujesz reakcję rozmówców na to, co powiedział Anderson (60–100 słów), i dajesz trzy nowe kwestie, które wynikają z poprzedniego wyboru. Rozmowa ma się zawężać: po trzeciej turze musi być jasne, którą opcję z listy Anderson wybrał.
3. Nie nazywasz opcji literami w trakcie rozmowy i nie opisujesz skutków żadnej z nich. Skutki ustali gra.
4. Po trzeciej turze (albo gdy gracz napisze „koniec”) nie piszesz już dalszego ciągu. Wypisujesz zakończenie dokładnie w tym formacie:

## WYNIK
OPCJA: jedna litera z listy opcji, do której doprowadziła rozmowa

## SCENA
Streszczenie całej rozmowy w czasie teraźniejszym, 100–150 słów, z jedną albo dwiema najlepszymi kwestiami.`;

const EVENT_TASK = `ZADANIE: SCENA DO JEDNEGO WYDARZENIA
Napisz jedną sekcję:

## SCENA
120–180 słów o wydarzeniu wskazanym niżej, widzianym z gabinetu Andersona albo z miejsca, gdzie pracują ludzie PACE. Jeśli to decyzja Andersona albo jej następstwo, pokaż wykonanie decyzji i pierwszą reakcję ludzi, których dotknęła. Jeśli to lot, pokaż go oczami ludzi z ośrodka, zgodnie z Raportem Misji. Niczego nie dodawaj do faktów z pakietu.`;

function join(blocks: (string | null)[]): string {
  return blocks.filter((b): b is string => b !== null && b !== '').join('\n\n');
}

function decisionBlock(view: PlayerView, instanceId: string): { title: string; block: string } {
  const dilemma = view.pendingDilemmas.find((d) => d.instanceId === instanceId);
  if (!dilemma) throw new NarratorError('Ta sprawa nie czeka już na decyzję.');
  const options = dilemma.options.map((o, i) => `  ${String.fromCharCode(65 + i)}. ${o.title}`).join('\n');
  return {
    title: dilemma.title,
    block: `SPRAWA DO DECYZJI: ${dilemma.title}\n${dilemma.prompt}\nOpcje:\n${options}`,
  };
}

/**
 * Buduje Pakiet Kontekstu do wklejenia w rozmowę z AI. Bez `secrets` pakiet zawiera wyłącznie
 * to, co wie Anderson; z nimi dochodzi warstwa ukryta z osobnymi zasadami użycia.
 */
export function buildNarratorPackage(
  view: PlayerView,
  cast: NarratorCast,
  request: NarratorRequest,
  secrets?: NarratorSecrets,
): NarratorPackage {
  const label = quarterLabel(view.quarter);
  const head =
    request.mode === 'full'
      ? join([
          'Poprowadzisz narrację gry strategicznej. Przeczytaj zasady, świat i pakiet danych, a potem wykonaj zadanie z końca wiadomości.',
          RULES,
          worldBrief(view, cast),
        ])
      : 'Kontynuujemy tę samą grę. Zasady, świat i obsada bez zmian. Nowy pakiet danych:';
  const hidden = secrets ? secretsBlock(secrets) : null;
  const done = (title: string, blocks: (string | null)[]): NarratorPackage => ({
    title,
    prompt: join(blocks),
    secret: secrets !== undefined,
  });

  if (request.kind === 'quarter') {
    return done(`Narracja kwartału: ${label}`, [
      head,
      situationBlock(view),
      lastQuarterBlock(view),
      eventsBlock(view),
      deedsBlock(view),
      registryBlock(view),
      intelBlock(view),
      pendingBlock(view),
      hidden,
      QUARTER_TASK,
    ]);
  }

  if (request.kind === 'event') {
    const code = quarterCode(view.quarter);
    const news = view.worldNews.filter((n) => n.quarter === code);
    const index = news.findIndex((n) => n.card === request.card);
    const event = news[index];
    if (!event) throw new NarratorError('Nie ma takiego wydarzenia w tym kwartale.');
    const follow: string[] = [];
    for (const n of news.slice(index + 1)) {
      if (n.card) break;
      follow.push(`  ↳ ${n.actor ? `reakcja, ${n.actor}` : 'komunikat'}: ${n.text}`);
    }
    const kind = NEWS_KINDS[event.kind] ?? event.kind;
    return done(`Scena: ${event.title}`, [
      head,
      situationBlock(view),
      registryBlock(view),
      hidden,
      `WYDARZENIE [${event.card}] (${kind}${event.cause ? `; wynika z: ${event.cause}` : ''})\n${event.title}. ${event.text}${follow.length ? `\n${follow.join('\n')}` : ''}`,
      EVENT_TASK,
    ]);
  }

  const decision = decisionBlock(view, request.instanceId);
  return done(`${request.kind === 'decision' ? 'Głosy w sprawie' : 'Rozmowa w sprawie'}: ${decision.title}`, [
    head,
    situationBlock(view),
    eventsBlock(view),
    registryBlock(view),
    hidden,
    decision.block,
    request.kind === 'decision' ? DECISION_TASK : CONVERSATION_TASK,
  ]);
}
