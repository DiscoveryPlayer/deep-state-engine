/**
 * Pętla kwartału bez AI (faza 1D Planu Budowy, decyzja 0017).
 *
 *   beginQuarter  — otwiera kwartał: świat generuje wydarzenia, Uwaga Dowódcy się odnawia.
 *   closeQuarter  — rozlicza kwartał (Korekty, frakcje, przepływy wskaźników), zapisuje raport,
 *                   przechodzi do następnego kwartału i od razu go otwiera.
 *
 * Gracz działa MIĘDZY tymi krokami: czyta depesze, rozstrzyga sprawy na Biurku, wydaje
 * Uwagę Dowódcy, gra w KSP i importuje zapis. Silnik niczego nie cofa i niczego nie zgaduje.
 */
import type { GameContent, LaunchSite } from '../content/schema.ts';
import type { BudgetLedgerEntry, GameState, KspSnapshot, QuarterReport, WorldLogEntry } from '../state/schema.ts';
import { kspSnapshotSchema } from '../state/schema.ts';
import { nextQuarter, parseQuarterCode, quarterCode, quarterLabel, quarterOfDate, quartersBetween } from '../time.ts';
import { advanceWorld } from '../world/engine.ts';

/** Uwaga Dowódcy na kwartał (GDD 6.1 i 10.1). */
export const BASE_UD = 6;
/** Jednostka Korekty = 20% miesięcznych wynagrodzeń PACE (decyzja 0012). */
export const CORRECTION_UNIT_SALARY_FRACTION = 0.2;
/** Przepływ PP → ZW (GDD 6.2): poniżej progu ZW traci 1 punkt za każde zaczęte 5 punktów. */
const PP_LOW = 40;
const PP_LOW_STEP = 5;
/** Powyżej tego progu Poparcie Publiczne daje ZW +1 na kwartał (GDD 6.2). */
const PP_HIGH = 70;
/**
 * Dryf Poparcia Publicznego (decyzja 0017): powyżej i poniżej tych progów PP wraca o 1 punkt
 * na kwartał w stronę środka. Bez tego jedna akcja Biurka powtarzana co kwartał dawała PP 100.
 */
const PP_DRIFT_HIGH = 55;
const PP_DRIFT_LOW = 45;
/** Nastawienie frakcji, od którego zegar Cierpliwości rośnie albo się cofa (GDD 7.1). */
const DISPOSITION_ANGRY = -2;
const DISPOSITION_CONTENT = 2;
/** Bunt frakcji: Spójność Organizacji −10 (GDD 7.1). */
const MUTINY_SO_PENALTY = 10;
const MAX_ESCALATION = 4;
const ESCALATION_NAMES = ['spokój', 'Napięcie', 'Opór', 'Ofensywa', 'Bunt'] as const;
/** Okno tolerancji granicy kwartału w dniach (decyzja 0008). */
export const QUARTER_TOLERANCE_DAYS = 30;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export interface QuarterStepResult {
  state: GameState;
  /** Wpisy dziennika świata z otwartego kwartału (publiczne i tajne). */
  entries: WorldLogEntry[];
}

/** Otwiera bieżący kwartał stanu: wydarzenia świata i odnowienie Uwagi Dowódcy. */
export function beginQuarter(input: GameState, content: GameContent): QuarterStepResult {
  let state = structuredClone(input);
  let entries: WorldLogEntry[] = [];
  if (content.world) {
    const step = advanceWorld(state, content.world);
    state = step.state;
    entries = step.entries;
  }
  state.currencies.UD = clamp(BASE_UD + state.desk.restBonus, 0, 8);
  state.desk.restBonus = 0;
  checkEndings(state);
  return { state, entries };
}

function checkEndings(state: GameState): void {
  if (state.status !== 'active') return;
  const q = quarterCode(state.quarter);
  if (state.indicators.ZW <= 0) {
    state.status = 'dismissed';
    state.chronicle.push({
      quarter: q,
      text: 'Zaufanie Waszyngtonu spadło do zera. Eugene Anderson zostaje odwołany ze stanowiska.',
      tags: ['zakonczenie'],
    });
  } else if (state.indicators.SO <= 0) {
    state.status = 'collapsed';
    state.chronicle.push({
      quarter: q,
      text: 'Spójność Organizacji spadła do zera. PACE przestaje działać jako jedna instytucja.',
      tags: ['zakonczenie'],
    });
  }
}

/** Wartość jednej jednostki Korekty w funduszach KSP albo null bez migawki kariery. */
export function correctionUnitFunds(state: GameState): number | null {
  const last = state.ksp.snapshots.at(-1);
  if (!last || last.monthlySalaries <= 0) return null;
  return last.monthlySalaries * CORRECTION_UNIT_SALARY_FRACTION;
}

/** Korekty obowiązujące w danym kwartale (decyzja 0012). */
export function correctionsForQuarter(state: GameState, q: string): BudgetLedgerEntry['items'] {
  const now = parseQuarterCode(q);
  return state.world.corrections
    .filter((c) => {
      const age = quartersBetween(parseQuarterCode(c.from), now);
      return age >= 0 && age < c.quarters;
    })
    .map((c) => ({ reason: c.reason, source: c.source, units: c.units }));
}

export interface CloseQuarterResult extends QuarterStepResult {
  report: QuarterReport;
}

export class QuarterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuarterError';
  }
}

/** Zamyka bieżący kwartał i otwiera następny. Nie zmienia przekazanego stanu. */
export function closeQuarter(input: GameState, content: GameContent): CloseQuarterResult {
  if (input.status !== 'active') throw new QuarterError('Kampania jest zakończona — nie można zamknąć kwartału.');
  const state = structuredClone(input);
  const q = quarterCode(state.quarter);
  const before = { ...state.indicators };
  const kpBefore = state.currencies.KP;
  const notes: string[] = [];

  // 1. Korekty budżetu.
  const items = correctionsForQuarter(state, q);
  const units = Math.round(items.reduce((sum, i) => sum + i.units, 0) * 100) / 100;
  const unitFunds = correctionUnitFunds(state);
  state.budget.ledger.push({ quarter: q, units, unitFunds, items, settled: units === 0 });
  if (units !== 0) {
    const funds = unitFunds === null ? '' : ` (około ${Math.round(units * unitFunds)} funduszy w KSP)`;
    notes.push(`Korekta budżetu kwartału: ${units > 0 ? '+' : ''}${units.toFixed(1)} jedn.${funds}.`);
  }

  // 2. Frakcje: zegary Cierpliwości i eskalacja (GDD 7.1).
  for (const id of state.factionOrder) {
    const f = state.factions[id];
    const clock = f ? state.clocks.find((c) => c.id === f.patienceClockId) : undefined;
    if (!f || !clock) continue;
    const name = content.factions.find((x) => x.id === id)?.name ?? id;
    if (f.disposition <= DISPOSITION_ANGRY) clock.filled += 1;
    else if (f.disposition >= DISPOSITION_CONTENT) clock.filled = Math.max(0, clock.filled - 1);
    if (clock.filled >= clock.segments) {
      clock.filled = 0;
      if (f.escalation < MAX_ESCALATION) f.escalation += 1;
      notes.push(`${name}: cierpliwość się wyczerpała. Stopień eskalacji: ${ESCALATION_NAMES[f.escalation]}.`);
      if (f.escalation === MAX_ESCALATION) {
        state.indicators.SO = clamp(state.indicators.SO - MUTINY_SO_PENALTY, 0, 100);
        notes.push(`${name} jawnie odmawia współpracy: Spójność Organizacji −${MUTINY_SO_PENALTY}.`);
      }
    } else if (f.escalation > 0 && f.disposition >= 1 && clock.filled === 0) {
      f.escalation -= 1;
      notes.push(`${name}: napięcie opada. Stopień eskalacji: ${ESCALATION_NAMES[f.escalation]}.`);
    }
  }

  // 3. Przepływy między wskaźnikami (GDD 6.2).
  if (state.indicators.PP < PP_LOW) {
    const loss = Math.ceil((PP_LOW - state.indicators.PP) / PP_LOW_STEP);
    state.indicators.ZW = clamp(state.indicators.ZW - loss, 0, 100);
    notes.push(`Poparcie Publiczne poniżej ${PP_LOW}: Zaufanie Waszyngtonu −${loss}.`);
  } else if (state.indicators.PP > PP_HIGH) {
    state.indicators.ZW = clamp(state.indicators.ZW + 1, 0, 100);
    notes.push(`Poparcie Publiczne powyżej ${PP_HIGH}: Zaufanie Waszyngtonu +1.`);
  }

  // Opinia publiczna wraca do obojętności: bez nowych powodów Poparcie Publiczne dryfuje ku środkowi.
  if (state.indicators.PP > PP_DRIFT_HIGH) state.indicators.PP -= 1;
  else if (state.indicators.PP < PP_DRIFT_LOW) state.indicators.PP += 1;

  // 4. Migawka KSP: przypomnienie w trybie Honorowym.
  if (!state.ksp.snapshots.some((s) => s.quarter === q)) {
    notes.push('Brak migawki kariery KSP za ten kwartał — fakty z lotów nie zostały wczytane.');
  }

  const newsCount = state.world.log.filter((e) => e.quarter === q && e.visibility === 'public').length;
  const report: QuarterReport = {
    quarter: q,
    before,
    after: { ...state.indicators },
    kpBefore,
    kpAfter: state.currencies.KP,
    newsCount,
    notes,
    correctionUnits: units,
  };
  state.reports.push(report);
  state.chronicle.push({ quarter: q, text: `Zamknięcie kwartału: ${quarterLabel(state.quarter)}.`, tags: ['kwartal'] });

  checkEndings(state);
  state.quarter = nextQuarter(state.quarter);
  if (state.status !== 'active') return { state, entries: [], report };
  const opened = beginQuarter(state, content);
  return { state: opened.state, entries: opened.entries, report };
}

/** Oznacza Korektę kwartału jako zastosowaną w KSP (tryb Honorowy). */
export function settleCorrection(input: GameState, quarter: string): GameState {
  const state = structuredClone(input);
  const entry = state.budget.ledger.find((e) => e.quarter === quarter);
  if (!entry) throw new QuarterError(`Nie ma rozliczenia budżetu za kwartał ${quarter}.`);
  entry.settled = true;
  return state;
}

export interface KspImportResult {
  state: GameState;
  /** Ostrzeżenia po polsku, np. o dacie zapisu poza kwartałem. */
  warnings: string[];
}

/**
 * Zapisuje migawkę kariery KSP dla bieżącego kwartału. Fakty z KSP są nienaruszalne (zasada Z1):
 * silnik ich nie poprawia, tylko ostrzega, gdy data zapisu nie pasuje do kwartału.
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
  const saveQuarter = quarterOfDate(snapshot.date);
  const diff = quartersBetween(state.quarter, saveQuarter);
  if (diff < 0) {
    warnings.push(
      `Zapis jest z ${snapshot.date}, czyli sprzed bieżącego kwartału (${quarterLabel(state.quarter)}). ` +
        'Jeśli to cofnięcie przez granicę rozliczonego kwartału, silnik potraktuje je jako naruszenie zasad uczciwości.',
    );
  } else if (diff > 0) {
    const end = nextQuarter(state.quarter);
    const boundary = Date.UTC(end.year, (end.q - 1) * 3, 1);
    const days = Math.floor((Date.parse(`${snapshot.date}T00:00:00Z`) - boundary) / 86_400_000);
    if (days > QUARTER_TOLERANCE_DAYS) {
      warnings.push(
        `Zapis jest z ${snapshot.date}: ${days} dni po końcu kwartału. Dozwolone okno to ${QUARTER_TOLERANCE_DAYS} dni.`,
      );
    } else if (days > QUARTER_TOLERANCE_DAYS / 2) {
      warnings.push(`Zapis jest z ${snapshot.date}: ${days} dni po końcu kwartału (w oknie tolerancji).`);
    }
  }
  // Miejsca startu: start z miejsca, które w świecie gry nie działa, to naruszenie zasad
  // uczciwości (GDD 22). Silnik ostrzega i zapisuje, ale niczego nie blokuje ani nie cofa.
  for (const launch of snapshot.launchesInQuarter) {
    if (launch.site === null || sites.length === 0) continue;
    const problem = launchSiteProblem(sites, launch.site, state.quarter);
    if (problem) {
      warnings.push(`Start „${launch.vessel}” (${launch.date}): ${problem}`);
      state.chronicle.push({
        quarter: q,
        text: `Naruszenie zasad uczciwości: start „${launch.vessel}” — ${problem}`,
        tags: ['ksp', 'naruszenie'],
      });
    }
  }
  state.ksp.snapshots = [...state.ksp.snapshots.filter((s) => s.quarter !== q), snapshot];
  state.chronicle.push({
    quarter: q,
    text: `Wczytano zapis kariery KSP (${snapshot.date}): fundusze ${Math.round(snapshot.funds)}, starty ${snapshot.launches}.`,
    tags: ['ksp'],
  });
  return { state, warnings };
}

/** Dlaczego z miejsca nie można startować w danym kwartale (po polsku) albo null, gdy można. */
export function launchSiteProblem(
  sites: readonly LaunchSite[],
  siteId: string,
  quarter: GameState['quarter'],
): string | null {
  const site = sites.find((s) => s.id === siteId);
  if (!site) return `miejsce „${siteId}” nie jest na liście miejsc startu.`;
  if (site.role === 'out_of_period') return `${site.name} powstaje dopiero po okresie gry.`;
  if (site.role === 'east') return `${site.name} należy do drugiej strony (${site.host}).`;
  if (quartersBetween(parseQuarterCode(site.from), quarter) < 0)
    return `${site.name} jeszcze nie działa (od ${site.from}).`;
  if (site.until && quartersBetween(quarter, parseQuarterCode(site.until)) < 0)
    return `${site.name} nie jest już dostępne (do ${site.until}).`;
  return null;
}
