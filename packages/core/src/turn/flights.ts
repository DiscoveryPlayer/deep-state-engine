/**
 * Fakty z KSP w pętli kwartału (decyzja 0019): bramka zapisu, loty i Raporty Misji (GDD 18.3).
 *
 * Na otwarciu kwartału gracz wczytuje zapis kariery z końca poprzedniego kwartału. Silnik
 * porównuje go z poprzednią migawką, wykrywa nowe starty i zakłada im Raporty Misji. Fakty
 * z KSP są nienaruszalne (zasada Z1): silnik je czyta i ocenia, ale nie poprawia.
 */
import type { GameContent, LaunchSite } from '../content/schema.ts';
import {
  kspSnapshotSchema,
  missionReportSchema,
  type Flight,
  type GameState,
  type KspSnapshot,
  type MissionReport,
} from '../state/schema.ts';
import { quarterCode, quarterLabel, quarterOfDate } from '../time.ts';
import { applyEffects } from '../world/conditions.ts';
import type { Effect } from '../world/schema.ts';
import { QUARTER_TOLERANCE_DAYS, QuarterError, launchSiteProblem } from './quarter.ts';

/** Zapis starszy niż tyle dni przed początkiem kwartału znaczy, że poprzedni kwartał nie został dograny. */
export const GATE_EARLY_DAYS = 15;

/**
 * Skutki Raportów Misji przy zamknięciu kwartału (reguła tymczasowa, decyzja 0019 punkt 5).
 * Liczby nie pochodzą z GDD; zastąpi je rozliczanie Dyrektyw i kart lotów (GDD 14).
 */
const PUBLIC_SUCCESS_PP = 1;
const PUBLIC_SUCCESS_PP_MAX = 3;
const PUBLIC_FAILURE_PP = 2;
const PUBLIC_FAILURE_PP_MAX = 4;
const CONFIDENTIAL_FAILURE_PP = 1;
const CONFIDENTIAL_FAILURE_PP_MAX = 2;
/** Po tylu kwartałach wraca sprawa zatajonej awarii: przeciek albo ciche wygaśnięcie. */
const SECRET_FAILURE_LEAK_AFTER = 2;
const SECRET_FAILURE_FADE_AFTER = 6;

export const OUTCOME_NAMES: Record<MissionReport['outcome'], string> = {
  success: 'sukces',
  partial: 'częściowy sukces',
  failure: 'niepowodzenie',
};
export const PURPOSE_NAMES: Record<MissionReport['purpose'], string> = {
  science: 'naukowe',
  defense: 'obronne',
  crewed: 'załogowe',
  test: 'próba techniczna',
  allied: 'sojusznicze',
};
export const CLASSIFICATION_NAMES: Record<MissionReport['classification'], string> = {
  public: 'jawny',
  confidential: 'poufny',
  secret: 'tajny',
};
/** Frakcja, której zależy na lotach o danym przeznaczeniu. Loty sojusznicze dają Kapitał Polityczny. */
const PURPOSE_FACTION: Record<MissionReport['purpose'], string | null> = {
  science: 'RN',
  defense: 'DPO',
  crewed: 'BLZ',
  test: 'DOI',
  allied: null,
};

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
export function formatDatePl(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return `${d} ${MONTHS[m - 1] ?? ''} ${y}`;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const flightRef = (id: string) => `lot.${id}`;

export interface KspImportResult {
  state: GameState;
  /** Ostrzeżenia po polsku, np. o dacie zapisu albo o miejscu startu. */
  warnings: string[];
  /** Loty wykryte w tym zapisie: czekają na Raport Misji. */
  flights: Flight[];
}

/** Czy bieżący kwartał czeka jeszcze na zapis KSP. */
export function kspGatePending(state: GameState): boolean {
  return (
    state.status === 'active' &&
    state.ksp.gate.quarter === quarterCode(state.quarter) &&
    state.ksp.gate.status === 'pending'
  );
}

/** Gracz świadomie otwiera kwartał bez zapisu. Trafia to do Kroniki. */
export function skipKspGate(input: GameState): GameState {
  if (!kspGatePending(input)) throw new QuarterError('Ten kwartał nie czeka na zapis KSP.');
  const state = structuredClone(input);
  const q = quarterCode(state.quarter);
  state.ksp.gate = { quarter: q, status: 'skipped' };
  state.chronicle.push({
    quarter: q,
    text: `${quarterLabel(state.quarter)} otwarty bez zapisu kariery KSP (decyzja gracza). Loty z poprzedniego kwartału nie zostały wczytane.`,
    tags: ['ksp', 'bez-zapisu'],
  });
  return state;
}

function describeFlight(flight: Flight, sites: readonly LaunchSite[]): string {
  const site = flight.site === null ? null : (sites.find((s) => s.id === flight.site)?.name ?? flight.site);
  const parts = [`Start ${formatDatePl(flight.date)}${site ? `, ${site}` : ''}.`];
  if (flight.failures > 0) {
    parts.push(`Dziennik kariery odnotował awarie części w tym locie (${flight.failures}).`);
  }
  const r = flight.report;
  if (!r) {
    parts.push('Raport Misji czeka na wypełnienie.');
  } else {
    parts.push(
      `Raport Misji${r.auto ? ' (wypełniony domyślnie)' : ''}: wynik — ${OUTCOME_NAMES[r.outcome]}; ` +
        `przeznaczenie — ${PURPOSE_NAMES[r.purpose]}; lot ${CLASSIFICATION_NAMES[r.classification]}.`,
    );
    if (r.note) parts.push(`Uwagi Dowódcy: ${r.note}`);
  }
  return parts.join(' ');
}

/** Wpis dziennika świata o locie: powstaje przy wykryciu startu i zmienia się po złożeniu raportu. */
function syncFlightEntry(state: GameState, flight: Flight, sites: readonly LaunchSite[]): void {
  const ref = flightRef(flight.id);
  const entry = {
    quarter: flight.detectedIn,
    kind: 'flight' as const,
    ref,
    title: `Lot ${flight.id}: „${flight.vessel}”`,
    text: describeFlight(flight, sites),
    visibility: 'public' as const,
  };
  const index = state.world.log.findIndex((e) => e.ref === ref);
  if (index >= 0) state.world.log[index] = entry;
  else state.world.log.push(entry);
}

/**
 * Wczytuje zapis kariery na otwarciu bieżącego kwartału: zapisuje migawkę, zakłada Raporty Misji
 * nowym startom i otwiera bramkę. Ponowne wczytanie w tym samym kwartale zastępuje poprzednie.
 */
export function recordKspSnapshot(
  input: GameState,
  raw: Omit<KspSnapshot, 'quarter'>,
  sites: readonly LaunchSite[] = [],
): KspImportResult {
  const state = structuredClone(input);
  const q = quarterCode(state.quarter);
  const snapshot = kspSnapshotSchema.parse({ ...raw, quarter: q });
  const warnings: string[] = [];

  // Data zapisu: powinna wypadać na początku kwartału (koniec poprzedniego rozegrany do końca).
  const start = Date.UTC(state.quarter.year, (state.quarter.q - 1) * 3, 1);
  const days = Math.floor((Date.parse(`${snapshot.date}T00:00:00Z`) - start) / 86_400_000);
  if (days < -GATE_EARLY_DAYS) {
    warnings.push(
      `Zapis jest z ${formatDatePl(snapshot.date)}, czyli ${-days} dni przed początkiem kwartału (${quarterLabel(state.quarter)}). ` +
        'Wygląda na to, że poprzedni kwartał nie został w KSP rozegrany do końca.',
    );
  } else if (days > QUARTER_TOLERANCE_DAYS) {
    warnings.push(
      `Zapis jest z ${formatDatePl(snapshot.date)}: ${days} dni po początku kwartału. Dozwolone okno to ${QUARTER_TOLERANCE_DAYS} dni.`,
    );
  }
  const previous = state.ksp.snapshots.filter((x) => x.quarter < q).at(-1);
  if (previous && snapshot.ut < previous.ut) {
    warnings.push(
      `Zapis jest starszy niż poprzednio wczytany (${formatDatePl(previous.date)}). Cofnięcie kariery przez granicę rozliczonego kwartału to naruszenie zasad uczciwości.`,
    );
    state.chronicle.push({
      quarter: q,
      text: `Naruszenie zasad uczciwości: wczytano zapis z ${snapshot.date}, starszy niż poprzedni (${previous.date}).`,
      tags: ['ksp', 'naruszenie'],
    });
  }

  // Loty: ponowne wczytanie w tym samym kwartale zastępuje poprzednie. Lot, który jest w obu
  // zapisach, zachowuje numer, raport i miejsce w dzienniku (kody kart wydarzeń się nie przesuwają).
  const replaced = state.ksp.flights.filter((f) => f.detectedIn === q && !f.settled);
  state.ksp.flights = state.ksp.flights.filter((f) => !replaced.includes(f));
  const reused = new Set<string>();
  const flights: Flight[] = [];
  for (const launch of snapshot.newLaunches) {
    const year = launch.date.slice(0, 4);
    const old = replaced.find((f) => f.vessel === launch.vessel && f.date === launch.date && !reused.has(f.id));
    if (old) reused.add(old.id);
    const numbers = [...state.ksp.flights, ...replaced]
      .filter((f) => f.id.startsWith(`M-${year}-`))
      .map((f) => Number(f.id.slice(7)));
    const flight: Flight = {
      id: old?.id ?? `M-${year}-${String(Math.max(0, ...numbers) + 1).padStart(2, '0')}`,
      vessel: launch.vessel,
      date: launch.date,
      site: launch.site,
      failures: launch.failures,
      detectedIn: q,
      settled: false,
      ...(old?.report ? { report: old.report } : {}),
    };
    state.ksp.flights.push(flight);
    flights.push(flight);
    syncFlightEntry(state, flight, sites);

    // Miejsce startu, które w świecie gry nie działa, to naruszenie zasad uczciwości (GDD 22).
    // Silnik ostrzega i zapisuje, ale niczego nie blokuje ani nie cofa.
    if (launch.site === null || sites.length === 0) continue;
    const problem = launchSiteProblem(sites, launch.site, quarterOfDate(launch.date));
    if (problem) {
      warnings.push(`Start „${launch.vessel}” (${formatDatePl(launch.date)}): ${problem}`);
      state.chronicle.push({
        quarter: q,
        text: `Naruszenie zasad uczciwości: start „${launch.vessel}” — ${problem}`,
        tags: ['ksp', 'naruszenie'],
      });
    }
  }

  const gone = replaced.filter((f) => !reused.has(f.id)).map((f) => flightRef(f.id));
  state.world.log = state.world.log.filter((e) => !gone.includes(e.ref));

  state.ksp.snapshots = [...state.ksp.snapshots.filter((x) => x.quarter !== q), snapshot];
  state.ksp.gate = { quarter: q, status: 'loaded' };
  state.chronicle.push({
    quarter: q,
    text:
      `Wczytano zapis kariery KSP (${formatDatePl(snapshot.date)}): fundusze ${Math.round(snapshot.funds)}, ` +
      `nowe starty ${snapshot.newLaunches.length}.`,
    tags: ['ksp'],
  });
  return { state, warnings, flights };
}

/** Składa albo poprawia Raport Misji. Do zamknięcia kwartału raport można zmieniać. */
export function fileMissionReport(
  input: GameState,
  flightId: string,
  report: Omit<MissionReport, 'auto'>,
  sites: readonly LaunchSite[] = [],
): GameState {
  const state = structuredClone(input);
  const flight = state.ksp.flights.find((f) => f.id === flightId);
  if (!flight) throw new QuarterError(`Nie ma lotu ${flightId}.`);
  if (flight.settled) throw new QuarterError(`Lot ${flightId} jest już rozliczony; raportu nie można zmienić.`);
  const note = report.note?.trim();
  flight.report = missionReportSchema.parse({
    outcome: report.outcome,
    purpose: report.purpose,
    classification: report.classification,
    ...(note ? { note } : {}),
    auto: false,
  });
  syncFlightEntry(state, flight, sites);
  return state;
}

/**
 * Rozlicza loty kwartału przy jego zamknięciu (mutuje przekazany stan, jak reszta `closeQuarter`).
 * Lot bez raportu dostaje raport domyślny: jawna próba techniczna, wynik według dziennika awarii.
 * Zwraca uwagi do raportu kwartału.
 */
export function settleFlights(state: GameState, content: GameContent): string[] {
  const q = quarterCode(state.quarter);
  const flights = state.ksp.flights.filter((f) => f.detectedIn === q && !f.settled);
  if (flights.length === 0) return [];
  const sites = content.launchSites ?? [];
  const notes: string[] = [];

  let auto = 0;
  for (const f of flights) {
    if (!f.report) {
      f.report = {
        outcome: f.failures > 0 ? 'partial' : 'success',
        purpose: 'test',
        classification: 'public',
        auto: true,
      };
      auto += 1;
      syncFlightEntry(state, f, sites);
    }
    f.settled = true;
  }
  if (auto > 0) notes.push(`Raporty Misji wypełnione domyślnie (${auto}): jawna próba techniczna.`);

  const reports = flights.map((f) => f.report!);
  const count = (test: (r: MissionReport) => boolean) => reports.filter(test).length;
  const successes = count((r) => r.outcome === 'success');
  const failures = count((r) => r.outcome === 'failure');

  // Poparcie Publiczne: prasa widzi tylko loty jawne, a o poufnych słyszy, gdy coś wybuchnie.
  const up = Math.min(
    PUBLIC_SUCCESS_PP_MAX,
    count((r) => r.classification === 'public' && r.outcome === 'success') * PUBLIC_SUCCESS_PP,
  );
  const down =
    Math.min(
      PUBLIC_FAILURE_PP_MAX,
      count((r) => r.classification === 'public' && r.outcome === 'failure') * PUBLIC_FAILURE_PP,
    ) +
    Math.min(
      CONFIDENTIAL_FAILURE_PP_MAX,
      count((r) => r.classification === 'confidential' && r.outcome === 'failure') * CONFIDENTIAL_FAILURE_PP,
    );
  if (up - down !== 0) {
    state.indicators.PP = clamp(state.indicators.PP + up - down, 0, 100);
    notes.push(`Loty w oczach prasy: Poparcie Publiczne ${up - down > 0 ? '+' : '−'}${Math.abs(up - down)}.`);
  }

  // Zaufanie Waszyngtonu: Waszyngton zna wszystkie loty, także tajne.
  if (failures > successes) {
    state.indicators.ZW = clamp(state.indicators.ZW - 1, 0, 100);
    notes.push('Więcej niepowodzeń niż sukcesów w lotach: Zaufanie Waszyngtonu −1.');
  } else if (successes > 0) {
    state.indicators.ZW = clamp(state.indicators.ZW + 1, 0, 100);
    notes.push('Udane loty w sprawozdaniu dla Waszyngtonu: Zaufanie Waszyngtonu +1.');
  }

  // Wiarygodność Fasady: jawny lot obronny podważa pokojowy charakter PACE, udany lot sojuszniczy go wzmacnia.
  const facade =
    (reports.some((r) => r.purpose === 'allied' && r.outcome === 'success' && r.classification !== 'secret') ? 1 : 0) -
    (reports.some((r) => r.purpose === 'defense' && r.classification === 'public') ? 1 : 0);
  if (facade !== 0) {
    state.indicators.WF = clamp(state.indicators.WF + facade, 0, 100);
    notes.push(
      facade > 0
        ? 'Udany lot sojuszniczy: Wiarygodność Fasady +1.'
        : 'Jawny lot o przeznaczeniu obronnym: Wiarygodność Fasady −1.',
    );
  }

  // Frakcje: ta, której przeznaczenie zebrało najwięcej sukcesów, zapisuje kwartał na swoje konto.
  const byPurpose = new Map<MissionReport['purpose'], number>();
  for (const r of reports) if (r.outcome === 'success') byPurpose.set(r.purpose, (byPurpose.get(r.purpose) ?? 0) + 1);
  const ranked = [...byPurpose.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked[0] && ranked[0][1] > (ranked[1]?.[1] ?? 0)) {
    const purpose = ranked[0][0];
    const factionId = PURPOSE_FACTION[purpose];
    const faction = factionId ? state.factions[factionId] : undefined;
    if (faction) {
      faction.disposition = clamp(faction.disposition + 1, -3, 3);
      const name = content.factions.find((x) => x.id === factionId)?.name ?? factionId;
      notes.push(`Kwartał lotów o przeznaczeniu „${PURPOSE_NAMES[purpose]}”: ${name}, Nastawienie +1.`);
    } else if (purpose === 'allied') {
      state.currencies.KP = clamp(state.currencies.KP + 1, 0, 20);
      notes.push('Kwartał lotów sojuszniczych: Kapitał Polityczny +1.');
    }
  }

  // Zatajona awaria: Tajemnica w Rejestrze, która może wyciec (echo) albo przycichnąć.
  const hushed = flights.find((f) => f.report!.classification === 'secret' && f.report!.outcome === 'failure');
  if (hushed && content.world) {
    const effects: Effect[] = [
      {
        registry: {
          key: 'zatajona-awaria',
          type: 'secret',
          title: `Zatajona awaria: lot ${hushed.id} („${hushed.vessel}”)`,
          with: ['anderson', 'DOI', 'BAS'],
          weight: 2,
          visible: true,
        },
      },
      { echo: 'przeciek-zatajonej-awarii', after: SECRET_FAILURE_LEAK_AFTER },
      { echo: 'zatajona-awaria-przycicha', after: SECRET_FAILURE_FADE_AFTER },
    ];
    applyEffects(state, effects, content.world, flightRef(hushed.id), `Zatajona awaria lotu ${hushed.id}`);
    notes.push(`Awaria lotu ${hushed.id} została zatajona. W Rejestrze Następstw jest nowa Tajemnica.`);
  }
  return notes;
}

/** Kwartał, w którym lot się odbył (według daty startu), np. do nagłówków. */
export function flightQuarter(flight: Flight): string {
  return quarterCode(quarterOfDate(flight.date));
}
