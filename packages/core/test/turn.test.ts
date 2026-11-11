import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_UD,
  DeskActionError,
  availableDeskActions,
  beginQuarter,
  closeQuarter,
  createInitialState,
  launchSiteProblem,
  performDeskAction,
  recordKspSnapshot,
  settleCorrection,
  toPlayerView,
  worldDefinitionSchema,
  patternContentSchema,
  type GameContent,
  type GameState,
  type KspSnapshot,
  type LaunchSite,
} from '../src/index.ts';
import { fixtureContent } from './fixture.ts';

function content(): GameContent {
  return {
    ...fixtureContent(),
    world: {
      definition: worldDefinitionSchema.parse({
        regions: [{ id: 'usa', title: 'USA' }],
        variables: [
          { id: 'koniunktura', title: 'Koniunktura', min: 0, max: 10, initial: 6, description: 'Stan gospodarki.' },
        ],
      }),
      threads: [],
      templates: [],
      patterns: [
        patternContentSchema.parse({
          id: 'strajk',
          title: 'Strajk',
          category: 'economic',
          chancePerQuarter: 1,
          cooldownQuarters: 0,
          effects: [{ correction: { units: -0.5, quarters: 2, reason: 'Strajk u dostawcy' } }],
          text: 'Strajk.',
        }),
      ],
      dilemmas: [],
    },
  };
}

function start(): GameState {
  return beginQuarter(createInitialState(content(), { id: 't', seed: 'PACE-1951' }), content()).state;
}

const snapshot: Omit<KspSnapshot, 'quarter'> = {
  file: 'persistent.sfs',
  title: 'PACE (CAREER)',
  ut: 7_000_000,
  date: '1951-03-23',
  funds: 20_000,
  reputation: 10,
  confidence: 300,
  science: 5,
  engineers: 16,
  researchers: 50,
  monthlySalaries: 4000,
  launchSite: 'us_cape_canaveral',
  launches: 2,
  failures: 1,
  contractsCompleted: 1,
  programs: [{ name: 'EarlyXPlanes', status: 'active' }],
  launchesInQuarter: [{ vessel: 'Solstice 1', date: '1951-03-10', site: 'us_cape_canaveral' }],
};

test('otwarcie kwartału: wydarzenia świata i pełna Uwaga Dowódcy', () => {
  const s = start();
  assert.equal(s.currencies.UD, BASE_UD);
  assert.equal(s.world.log.length, 1);
  assert.equal(toPlayerView(s).budget.upcoming.length, 1, 'podgląd Korekty bieżącego kwartału');
});

test('zamknięcie kwartału: Korekty w budżecie, raport, następny kwartał otwarty', () => {
  const c = content();
  const { state, report } = closeQuarter(start(), c);
  assert.deepEqual(state.quarter, { year: 1951, q: 2 });
  assert.equal(report.quarter, '1951-Q1');
  assert.equal(report.correctionUnits, -0.5);
  assert.equal(state.budget.ledger[0]!.unitFunds, null, 'bez migawki KSP wartość jednostki jest nieznana');
  assert.ok(report.notes.some((n) => /Brak migawki kariery KSP/.test(n)));
  assert.equal(state.world.log.filter((e) => e.quarter === '1951-Q2').length, 1, 'nowy kwartał ma już depesze');
  const second = closeQuarter(state, c);
  assert.equal(second.report.correctionUnits, -1, 'dwie Korekty po −0,5 nakładają się w drugim kwartale');
  const settled = settleCorrection(second.state, '1951-Q1');
  assert.ok(settled.budget.ledger[0]!.settled);
});

test('migawka KSP: jednostka Korekty to 20% miesięcznych wynagrodzeń; ostrzeżenia o dacie', () => {
  const c = content();
  const ok = recordKspSnapshot(start(), snapshot);
  assert.deepEqual(ok.warnings, []);
  const closed = closeQuarter(ok.state, c);
  assert.equal(closed.state.budget.ledger[0]!.unitFunds, 800);
  assert.equal(toPlayerView(closed.state).budget.ledger[0]!.funds, -400);
  assert.ok(!closed.report.notes.some((n) => /Brak migawki/.test(n)));
  const late = recordKspSnapshot(start(), { ...snapshot, date: '1951-05-20' });
  assert.match(late.warnings[0]!, /49 dni po końcu kwartału/);
  const early = recordKspSnapshot(closed.state, snapshot);
  assert.match(early.warnings[0]!, /sprzed bieżącego kwartału/);
});

test('przepływ PP → ZW i zegary Cierpliwości frakcji', () => {
  const c = content();
  const s = start();
  s.indicators.PP = 31;
  s.factions.DPO!.disposition = -2;
  const clock = s.clocks.find((x) => x.id === s.factions.DPO!.patienceClockId)!;
  clock.filled = clock.segments - 1;
  const { state, report } = closeQuarter(s, c);
  assert.equal(state.indicators.ZW, s.indicators.ZW - 2, '9 punktów poniżej progu to 2 zaczęte piątki');
  assert.equal(state.factions.DPO!.escalation, 1);
  assert.ok(report.notes.some((n) => /cierpliwość się wyczerpała/.test(n)));
});

test('akcje Biurka: koszty, limity i skutki', () => {
  const c = content();
  let s = start();
  const first = performDeskAction(s, c, { action: 'spotkanie', target: 'DPO' });
  assert.ok(first.state.factions.DPO!.agendaKnown);
  assert.equal(first.state.currencies.UD, BASE_UD - 1);
  assert.throws(() => performDeskAction(first.state, c, { action: 'spotkanie', target: 'DPO' }), DeskActionError);
  s = performDeskAction(first.state, c, { action: 'lobbing' }).state;
  assert.ok(s.indicators.ZW >= 58 && s.indicators.ZW <= 61);
  assert.equal(s.currencies.KP, 2);
  assert.throws(() => performDeskAction(s, c, { action: 'lobbing' }), /Już wykonano/);
  s = performDeskAction(s, c, { action: 'zlecenie-wywiadowcze', target: 'koniunktura' }).state;
  assert.equal(s.knowledge.assessments.length, 1);
  assert.match(s.knowledge.assessments[0]!.text, /poziom/);
  s = performDeskAction(s, c, { action: 'odpoczynek' }).state;
  assert.equal(s.currencies.UD, 0);
  assert.ok(availableDeskActions(s, c).every((a) => !a.enabled));
  assert.equal(toPlayerView(s).deskLog.length, 4);
  const next = closeQuarter(s, c).state;
  assert.equal(next.currencies.UD, BASE_UD + 1, 'premia po Odpoczynku');
  const second = performDeskAction(next, c, { action: 'spotkanie', target: 'DPO' });
  assert.equal(second.state.factions.DPO!.disposition, 1, 'drugie spotkanie poprawia Nastawienie');
});

test('zakończenie: Zaufanie Waszyngtonu 0 odwołuje Andersona i blokuje kolejne kwartały', () => {
  const c = content();
  const s = start();
  s.indicators.ZW = 1;
  s.indicators.PP = 20;
  const { state } = closeQuarter(s, c);
  assert.equal(state.status, 'dismissed');
  assert.throws(() => closeQuarter(state, c), /zakończona/);
  assert.throws(() => performDeskAction(state, c, { action: 'konferencja' }), /zakończona/);
});

test('determinizm pętli kwartału', () => {
  const c = content();
  const play = () => {
    let s = start();
    for (let i = 0; i < 6; i++) {
      s = performDeskAction(s, c, { action: 'konferencja' }).state;
      s = closeQuarter(s, c).state;
    }
    return JSON.stringify(s);
  };
  assert.equal(play(), play());
});

const sites: LaunchSite[] = [
  { id: 'us_cape_canaveral', name: 'Cape Canaveral', country: 'US', role: 'west', from: '1950-Q3', host: 'USA' },
  {
    id: 'fr_hammaguir',
    name: 'Hammaguir',
    country: 'FR',
    role: 'west',
    from: '1952-Q2',
    until: '1967-Q2',
    host: 'Francja',
  },
  { id: 'kz_baikonur', name: 'Bajkonur', country: 'KZ', role: 'east', from: '1957-Q1', host: 'ZSRR' },
  { id: 'nz_mahia', name: 'Mahia', country: 'NZ', role: 'out_of_period', from: '2017-Q1', host: 'Nowa Zelandia' },
];

test('miejsca startu: strona, okres działania i miejsca spoza listy', () => {
  const q = (year: number, quarter: 1 | 2 | 3 | 4) => ({ year, q: quarter });
  assert.equal(launchSiteProblem(sites, 'us_cape_canaveral', q(1951, 1)), null);
  assert.match(launchSiteProblem(sites, 'fr_hammaguir', q(1951, 1))!, /jeszcze nie działa/);
  assert.equal(launchSiteProblem(sites, 'fr_hammaguir', q(1967, 2)), null, 'ostatni kwartał jeszcze dozwolony');
  assert.match(launchSiteProblem(sites, 'fr_hammaguir', q(1967, 3))!, /nie jest już dostępne/);
  assert.match(launchSiteProblem(sites, 'kz_baikonur', q(1960, 1))!, /drugiej strony/);
  assert.match(launchSiteProblem(sites, 'nz_mahia', q(1960, 1))!, /po okresie gry/);
  assert.match(launchSiteProblem(sites, 'xx_nieznane', q(1960, 1))!, /nie jest na liście/);
});

test('migawka KSP: start z miejsca drugiej strony trafia do Kroniki jako naruszenie', () => {
  const clean = recordKspSnapshot(start(), snapshot, sites);
  assert.equal(clean.warnings.length, 0);
  const cheat = recordKspSnapshot(
    start(),
    { ...snapshot, launchesInQuarter: [{ vessel: 'Wostok', date: '1951-03-10', site: 'kz_baikonur' }] },
    sites,
  );
  assert.equal(cheat.warnings.length, 1);
  assert.match(cheat.warnings[0]!, /Wostok/);
  assert.ok(cheat.state.chronicle.some((c) => c.tags.includes('naruszenie')));
});

test('raport kwartału liczy zmiany od otwarcia kwartału, razem z akcjami Biurka', () => {
  const opened = start();
  const opening = opened.desk.opening;
  const acted = performDeskAction(opened, content(), { action: 'lobbing' }).state;
  assert.notEqual(acted.indicators.ZW, opening.ZW, 'lobbing zmienił Zaufanie Waszyngtonu');
  const { report, state } = closeQuarter(acted, content());
  assert.deepEqual(report.before, { ZW: opening.ZW, SO: opening.SO, PP: opening.PP, WF: opening.WF, NG: opening.NG });
  assert.deepEqual(
    state.desk.opening,
    { ...report.after, KP: state.currencies.KP },
    'nowy kwartał ma nowy punkt odniesienia',
  );
});

test('bilans lotów: kontrakty i awarie z migawki zmieniają wskaźniki przy zamknięciu kwartału', () => {
  const c = content();
  const plain = closeQuarter(start(), c);
  const flown = closeQuarter(recordKspSnapshot(start(), { ...snapshot, contractsCompleted: 5, failures: 3 }).state, c);
  // Te same ziarna i ta sama treść: różnica to wyłącznie bilans lotów (+3 PP za kontrakty, −2 PP za awarie).
  assert.equal(flown.report.after.PP - plain.report.after.PP, 1);
  assert.equal(flown.report.after.ZW - plain.report.after.ZW, 1);
  assert.ok(flown.report.notes.some((n) => /ukończone kontrakty \(5\)/.test(n)));
  assert.ok(flown.report.notes.some((n) => /awarie w locie \(3\)/.test(n)));

  // Następny kwartał liczy tylko przyrost względem poprzedniej migawki.
  const next = recordKspSnapshot(flown.state, { ...snapshot, date: '1951-06-20', contractsCompleted: 5, failures: 3 });
  const quiet = closeQuarter(next.state, c);
  assert.ok(!quiet.report.notes.some((n) => /Bilans lotów/.test(n)));
});
