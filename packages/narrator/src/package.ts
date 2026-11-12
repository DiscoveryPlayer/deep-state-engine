import { quarterCode, quarterLabel, type PlayerView } from '@dse/core';

/** Jawna obsada: nazwy frakcji i karty głosu dyrektorów. Notatki Mistrza Gry tu nie trafiają. */
export interface NarratorCast {
  factions: { id: string; name: string; summary: string }[];
  /** Klucz: identyfikator postaci. Tylko rejestr i nawyki mowy (bez `neverSays` i `dmNote`). */
  voices: Record<string, { register: string; habits: string[] }>;
}

export type NarratorRequest =
  | { kind: 'quarter'; mode: PackageMode }
  | { kind: 'decision'; mode: PackageMode; instanceId: string };

/** `full` zaczyna nową rozmowę (zasady, świat, obsada); `short` kontynuuje rozmowę, która je zna. */
export type PackageMode = 'full' | 'short';

export interface NarratorPackage {
  title: string;
  prompt: string;
}

export class NarratorError extends Error {}

/** Nagłówki sekcji, których gra oczekuje w odpowiedzi. */
export const QUARTER_SECTIONS = ['SCENA', 'PRASA', 'KULUARY'] as const;
export const DECISION_SECTION_PREFIX = 'GŁOS';

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
2. Wiesz tylko to, co wie Anderson. Nie zgadujesz, co się stanie, i nie podpowiadasz, którą opcję wybrać.
3. Liczby wskaźników zostają w pakiecie. W narracji pokazujesz je obrazem: tonem rozmowy, miną senatora, nagłówkiem gazety.
4. Dialogi piszesz tylko postaciom fikcyjnym z obsady PACE i postaciom bezimiennym (sekretarka, reporter, kongresman z komisji). Prawdziwe osoby historyczne pojawiają się tylko tak, jak w depeszach, w mowie zależnej. Nie wkładasz im w usta wymyślonych cytatów i nie przypisujesz im wymyślonych przewinień.
5. Świat gry różni się od naszej historii. Jeśli pakiet mówi inaczej niż podręcznik, rację ma pakiet. Nie prostujesz go.
6. Styl: polszczyzna literacka, czas teraźniejszy, zimnowojenny dramat gabinetowy. Konkret zamiast przymiotników: przedmioty z epoki, pogoda, dym, papier. Bez patosu, bez podsumowań i morałów.
7. Format: odpowiadasz samymi sekcjami, każda zaczyna się od linii z nagłówkiem „## NAZWA”. Bez wstępu, bez komentarza po zakończeniu, bez pytań do gracza.`;

function signed(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : 'bez zmian';
}

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

function newsBlock(view: PlayerView): string {
  const code = quarterCode(view.quarter);
  const news = view.worldNews.filter((n) => n.quarter === code);
  if (news.length === 0) return 'DEPESZE TEGO KWARTAŁU\n(brak depesz: spokojny kwartał)';
  const lines = ['DEPESZE TEGO KWARTAŁU'];
  for (const n of news) lines.push(`- ${n.actor ? `[reakcja: ${n.actor}] ` : ''}${n.title}. ${n.text}`);
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
  for (const note of report.notes) if (!/migawk/i.test(note)) lines.push(`- ${note}`);
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

function deskBlock(view: PlayerView): string | null {
  if (view.deskLog.length === 0) return null;
  return ['CO ANDERSON JUŻ ZROBIŁ W TYM KWARTALE', ...view.deskLog.map((d) => `- ${d.summary}`)].join('\n');
}

const QUARTER_TASK = `ZADANIE: NARRACJA KWARTAŁU
Napisz trzy sekcje, dokładnie z tymi nagłówkami:

## SCENA
Jedna scena z gabinetu Andersona albo z korytarzy PACE na otwarcie kwartału, 150–220 słów. Wybierz jedną lub dwie najważniejsze depesze i pokaż, jak docierają do ludzi z obsady. Niech ktoś z dyrektorów powie dwie lub trzy kwestie we własnym rejestrze.

## PRASA
Trzy krótkie wycinki z gazet tego kwartału, oddzielone pustą linią. Każdy ma dwie linie: w pierwszej fikcyjny tytuł gazety i nagłówek, w drugiej dwa zdania tekstu. Co najmniej jeden wycinek spoza USA. Wycinki dotyczą depesz z pakietu.

## KULUARY
Jeden akapit, 60–90 słów: co się mówi na korytarzach PACE o nastrojach frakcji i o sprawach czekających na decyzję. Bez przepowiadania wyniku.`;

const DECISION_TASK = `ZADANIE: GŁOSY W SPRAWIE
Anderson musi rozstrzygnąć sprawę opisaną niżej. Napisz głosy dwóch albo trzech dyrektorów z obsady, tych, których sprawa dotyczy najbardziej. Każdy głos to osobna sekcja:

## GŁOS: imię i nazwisko dyrektora
Notatka służbowa albo kwestia wypowiedziana w drzwiach gabinetu, 60–100 słów, w rejestrze tej postaci. Każdy dyrektor broni interesu swojej frakcji i opowiada się za inną opcją albo ostrzega przed inną. Nikt nie wie, jak się to skończy: żadnych zapowiedzi skutków w liczbach, żadnych pewników.`;

function join(blocks: (string | null)[]): string {
  return blocks.filter((b): b is string => b !== null && b !== '').join('\n\n');
}

/** Buduje Pakiet Kontekstu do wklejenia w rozmowę z AI. */
export function buildNarratorPackage(view: PlayerView, cast: NarratorCast, request: NarratorRequest): NarratorPackage {
  const label = quarterLabel(view.quarter);
  const head =
    request.mode === 'full'
      ? join([
          'Poprowadzisz narrację gry strategicznej. Przeczytaj zasady, świat i pakiet danych, a potem wykonaj zadanie z końca wiadomości.',
          RULES,
          worldBrief(view, cast),
        ])
      : 'Kontynuujemy tę samą grę. Zasady, świat i obsada bez zmian. Nowy pakiet danych:';

  if (request.kind === 'quarter') {
    return {
      title: `Narracja kwartału: ${label}`,
      prompt: join([
        head,
        situationBlock(view),
        lastQuarterBlock(view),
        newsBlock(view),
        intelBlock(view),
        deskBlock(view),
        pendingBlock(view),
        QUARTER_TASK,
      ]),
    };
  }

  const dilemma = view.pendingDilemmas.find((d) => d.instanceId === request.instanceId);
  if (!dilemma) throw new NarratorError('Ta sprawa nie czeka już na decyzję.');
  const options = dilemma.options.map((o, i) => `  ${String.fromCharCode(65 + i)}. ${o.title}`).join('\n');
  return {
    title: `Głosy w sprawie: ${dilemma.title}`,
    prompt: join([
      head,
      situationBlock(view),
      newsBlock(view),
      `SPRAWA DO DECYZJI: ${dilemma.title}\n${dilemma.prompt}\nOpcje:\n${options}`,
      DECISION_TASK,
    ]),
  };
}
