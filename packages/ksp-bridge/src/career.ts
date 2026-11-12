/**
 * Wyciąg faktów z zapisu kariery RP-1 (faza 1B Planu Budowy).
 *
 * Źródła w pliku .sfs (sprawdzone na zapisach autora, RP-1 4.8.1 i 3.21):
 *   GAME.Title, GAME._modVersions
 *   SCENARIO Funding.funds, Reputation.rep, ResearchAndDevelopment.sci, Confidence.confidence
 *   SCENARIO LastKSC.LastLaunchSite            — bieżące miejsce startu (KSCSwitcher)
 *   SCENARIO CareerLog                          — dziennik kariery: okresy miesięczne, starty, awarie, kontrakty
 *   SCENARIO SpaceCenterManagement.KSCs         — kompleksy startowe z nazwą miejsca (KSCName)
 *   SCENARIO ProgramHandler                     — programy aktywne i ukończone
 *   FLIGHTSTATE.UT                              — czas uniwersalny
 *
 * Czas: RP-1 liczy UT w sekundach od 1 stycznia 1951 roku według prawdziwego kalendarza
 * (okresy dziennika mają 31, 28, 31… dni), więc datę liczymy zwykłym kalendarzem.
 */
import { child, children, num, path, value, type ConfigNode } from './confignode.ts';

/** Początek kalendarza RP-1: 1.01.1951 00:00 UTC. */
export const RP1_EPOCH_MS = Date.UTC(1951, 0, 1);

/** Data kalendarzowa RRRR-MM-DD dla czasu uniwersalnego RP-1. */
export function utToDate(ut: number): string {
  return new Date(RP1_EPOCH_MS + ut * 1000).toISOString().slice(0, 10);
}

/** Kod kwartału, np. "1951-Q2", dla czasu uniwersalnego RP-1. */
export function utToQuarter(ut: number): string {
  const d = new Date(RP1_EPOCH_MS + ut * 1000);
  return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
}

export interface CareerLaunch {
  vessel: string;
  ut: number;
  date: string;
  quarter: string;
  builtAt: string;
  /** Miejsce startu (identyfikator KSCSwitchera) albo null, gdy kompleksu nie da się przypisać. */
  site: string | null;
  failures: number;
}

export interface CareerPeriod {
  startUT: number;
  endUT: number;
  quarter: string;
  programFunds: number;
  salaries: number;
  maintenance: number;
  engineers: number;
  researchers: number;
  confidence: number;
  reputation: number;
}

export interface CareerSummary {
  file: string;
  title: string;
  kspVersion: string;
  /** Wersje wybranych modów z nagłówka zapisu, np. { RP0: "4.8.1.0" }. */
  mods: Record<string, string>;
  ut: number;
  date: string;
  quarter: string;
  funds: number;
  reputation: number;
  confidence: number;
  science: number;
  engineers: number;
  researchers: number;
  /** Miesięczne wynagrodzenia z ostatniego pełnego okresu dziennika kariery. */
  monthlySalaries: number;
  launchSite: string;
  launches: CareerLaunch[];
  failures: number;
  contractsCompleted: number;
  programs: { name: string; status: 'active' | 'completed' }[];
  periods: CareerPeriod[];
}

export class CareerReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CareerReadError';
  }
}

const TRACKED_MODS = ['RP0', 'RealismOverhaul', 'ContractConfigurator', 'Kerbalism', 'RealSolarSystem', 'KSCSwitcher'];

function scenario(game: ConfigNode, name: string): ConfigNode | undefined {
  return children(game, 'SCENARIO').find((s) => value(s, 'name') === name);
}

function modVersions(game: ConfigNode): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (value(game, '_modVersions') ?? '').split('|')) {
    const [name, version] = part.split('=');
    if (name && version && TRACKED_MODS.includes(name)) out[name] = version;
  }
  return out;
}

/** Wyciąga fakty z kariery. `root` to wynik parseConfigNode dla pliku .sfs. */
export function summarizeCareer(root: ConfigNode, file: string): CareerSummary {
  const game = child(root, 'GAME');
  if (!game) throw new CareerReadError('To nie jest zapis KSP: brak węzła GAME.');
  if (value(game, 'Mode') !== 'CAREER') {
    throw new CareerReadError(`Zapis jest w trybie „${value(game, 'Mode') ?? '?'}”, a DSE obsługuje tylko karierę.`);
  }
  const log = scenario(game, 'CareerLog');
  if (!log) throw new CareerReadError('W zapisie nie ma dziennika kariery RP-1 (CareerLog). Czy to kariera RP-1?');

  const ut = num(path(game, 'FLIGHTSTATE'), 'UT');
  const scm = scenario(game, 'SpaceCenterManagement');

  // Kompleks startowy → miejsce startu. Dziennik zapisuje identyfikator bez myślników.
  const siteOfLc = new Map<string, string>();
  for (const ksc of children(child(scm, 'KSCs'), 'LCSpaceCenter')) {
    const site = value(ksc, 'KSCName');
    if (!site) continue;
    for (const lc of children(child(ksc, 'LaunchComplexes'), 'LaunchComplex')) {
      const id = value(lc, 'id');
      if (id) siteOfLc.set(id.replaceAll('-', ''), site);
    }
  }

  const failureEvents = children(child(log, '_failures'), 'FailureEvent');
  const failuresByLaunch = new Map<string, number>();
  for (const f of failureEvents) {
    const id = value(f, 'LaunchID') ?? '';
    failuresByLaunch.set(id, (failuresByLaunch.get(id) ?? 0) + 1);
  }

  const launches: CareerLaunch[] = children(child(log, '_launchedVessels'), 'LaunchEvent').map((e) => {
    const launchUT = num(e, 'UT');
    return {
      vessel: value(e, 'VesselName') ?? '(bez nazwy)',
      ut: launchUT,
      date: utToDate(launchUT),
      quarter: utToQuarter(launchUT),
      builtAt: value(e, 'BuiltAt') ?? '',
      site: siteOfLc.get((value(e, 'LCID') ?? '').replaceAll('-', '')) ?? null,
      failures: failuresByLaunch.get(value(e, 'LaunchID') ?? '') ?? 0,
    };
  });

  const periods: CareerPeriod[] = children(path(log, '_periodDict', 'Values'), 'LogPeriod').map((p) => ({
    startUT: num(p, 'StartUT'),
    endUT: num(p, 'EndUT'),
    quarter: utToQuarter(num(p, 'StartUT')),
    programFunds: num(p, 'ProgramFunds'),
    salaries: num(p, 'SalaryEngineers') + num(p, 'SalaryResearchers') + num(p, 'SalaryCrew'),
    maintenance: num(p, 'MaintenanceFees'),
    engineers: num(p, 'NumEngineers'),
    researchers: num(p, 'NumResearchers'),
    confidence: num(p, 'Confidence'),
    reputation: num(p, 'Reputation'),
  }));
  // Ostatni PEŁNY okres: bieżący miesiąc ma niepełne wynagrodzenia.
  const complete = periods.filter((p) => p.endUT <= ut);
  const lastFull = complete.at(-1) ?? periods.at(-1);

  const contractsCompleted = children(child(log, '_contractDict'), 'ContractEvent').filter(
    (c) => value(c, 'Type') === 'Complete',
  ).length;

  const programHandler = scenario(game, 'ProgramHandler');
  const programs: CareerSummary['programs'] = [
    ...children(programHandler, 'ACTIVEPROGRAM').map((p) => ({
      name: value(p, 'name') ?? '?',
      status: 'active' as const,
    })),
    ...children(programHandler, 'COMPLETEDPROGRAM').map((p) => ({
      name: value(p, 'name') ?? '?',
      status: 'completed' as const,
    })),
  ];

  const engineersNow = children(child(scm, 'KSCs'), 'LCSpaceCenter').reduce((sum, k) => sum + num(k, 'Engineers'), 0);

  return {
    file,
    title: value(game, 'Title') ?? '',
    kspVersion: value(game, 'version') ?? '',
    mods: modVersions(game),
    ut,
    date: utToDate(ut),
    quarter: utToQuarter(ut),
    funds: num(scenario(game, 'Funding'), 'funds'),
    reputation: num(scenario(game, 'Reputation'), 'rep'),
    confidence: num(scenario(game, 'Confidence'), 'confidence'),
    science: num(scenario(game, 'ResearchAndDevelopment'), 'sci'),
    engineers: engineersNow || (lastFull?.engineers ?? 0),
    researchers: num(scm, 'Researchers', lastFull?.researchers ?? 0),
    monthlySalaries: lastFull?.salaries ?? 0,
    // KSCSwitcher zapisuje ostatnie miejsce dopiero po pierwszej zmianie; wcześniej bierzemy
    // miejsce pierwszego ośrodka z zarządzania centrum kosmicznym.
    launchSite:
      value(scenario(game, 'LastKSC'), 'LastLaunchSite') ??
      value(children(child(scm, 'KSCs'), 'LCSpaceCenter')[0], 'KSCName') ??
      '',
    launches,
    failures: failureEvents.length,
    contractsCompleted,
    programs,
    periods,
  };
}
