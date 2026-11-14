import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_UD,
  DeskActionError,
  availableDeskActions,
  beginQuarter,
  closeQuarter,
  createInitialState,
  echoContentSchema,
  fileMissionReport,
  kspGatePending,
  launchSiteProblem,
  performDeskAction,
  recordKspSnapshot,
  settleCorrection,
  skipKspGate,
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

function start(c: GameContent = content()): GameState {
  return beginQuarter(createInitialState(c, { id: 't', seed: 'PACE-1951' }), c).state;
}

/** Treść z echami, które silnik sam kolejkuje po zatajonej awarii. */
function contentWithEchoes(): GameContent {
  const c = content();
  const echo = (id: string, extra: object) =>
    echoContentSchema.parse({ id, title: id, text: 'Echo.', requires: { registry: 'zatajona-awaria' }, ...extra });
  return {
    ...c,
    world: {
      ...c.world!,
      echoes: [
        echo('przeciek-zatajonej-awarii', {
          effects: [
            { indicator: 'PP', add: -3 },
            { registryClose: 'zatajona-awaria', as: 'revealed' },
          ],
        }),
        echo('zatajona-awaria-przycicha', { silent: true, effects: [{ registryClose: 'zatajona-awaria' }] }),
      ],
    },
  };
}

const snapshot: Omit<KspSnapshot, 'quarter'> = {
  file: 'persistent.sfs',
  title: 'PACE (CAREER)',
  ut: 7_000_000,
  date: '1951-01-08',
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
  newLaunches: [{ vessel: 'Solstice 1', date: '1951-01-05', site: 'us_cape_canaveral', failures: 0 }],
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
  assert.ok(report.notes.some((n) => /bez zapisu kariery KSP/.test(n)));
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
  assert.ok(!closed.report.notes.some((n) => /bez zapisu/.test(n)));
  // Zapis ma pochodzić z początku kwartału: 30 dni zapasu, potem ostrzeżenie.
  const late = recordKspSnapshot(start(), { ...snapshot, date: '1951-03-20' });
  assert.match(late.warnings[0]!, /78 dni po początku kwartału/);
  // W II kwartale zapis ze stycznia znaczy, że I kwartał nie został dograny...
  const early = recordKspSnapshot(closed.state, { ...snapshot, ut: snapshot.ut + 1, newLaunches: [] });
  assert.match(early.warnings[0]!, /poprzedni kwartał nie został w KSP rozegrany do końca/);
  // ...a zapis starszy niż poprzedni to cofnięcie kariery.
  const rewound = recordKspSnapshot(closed.state, { ...snapshot, ut: snapshot.ut - 1, newLaunches: [] });
  assert.ok(rewound.warnings.some((w) => /naruszenie zasad uczciwości/.test(w)));
  assert.ok(rewound.state.chronicle.some((x) => x.tags.includes('naruszenie')));
});

test('bramka zapisu: kwartał czeka na zapis, wczytanie albo pominięcie ją otwiera', () => {
  const c = content();
  const opened = start();
  assert.ok(kspGatePending(opened));
  const loaded = recordKspSnapshot(opened, snapshot);
  assert.ok(!kspGatePending(loaded.state));
  assert.equal(loaded.state.ksp.gate.status, 'loaded');
  const skipped = skipKspGate(opened);
  assert.equal(skipped.ksp.gate.status, 'skipped');
  assert.ok(skipped.chronicle.some((x) => x.tags.includes('bez-zapisu')));
  assert.throws(() => skipKspGate(skipped), /nie czeka na zapis/);
  // Zamknięcie kwartału otwiera następny i bramka znów czeka.
  const next = closeQuarter(loaded.state, c).state;
  assert.deepEqual(next.ksp.gate, { quarter: '1951-Q2', status: 'pending' });
  assert.ok(kspGatePending(next));
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
    { ...snapshot, newLaunches: [{ vessel: 'Wostok', date: '1951-01-05', site: 'kz_baikonur', failures: 0 }] },
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

const launch = (vessel: string, date: string, failures = 0) => ({ vessel, date, site: 'us_cape_canaveral', failures });

test('Raport Misji: lot z zapisu dostaje numer, depeszę i formularz; raport można poprawiać', () => {
  const loaded = recordKspSnapshot(
    start(),
    { ...snapshot, newLaunches: [launch('A-1', '1951-01-03'), launch('A-2', '1951-01-06', 2)] },
    sites,
  );
  assert.deepEqual(
    loaded.flights.map((f) => f.id),
    ['M-1951-01', 'M-1951-02'],
  );
  const entry = () => toPlayerView(state).worldNews.find((n) => n.topic === 'lot' && /A-2/.test(n.title))!;
  let state = loaded.state;
  assert.equal(entry().kind, 'flight');
  assert.match(entry().text, /Start 6 stycznia 1951, Cape Canaveral\..*awarie części.*\(2\).*czeka na wypełnienie/);

  state = fileMissionReport(
    state,
    'M-1951-02',
    { outcome: 'failure', purpose: 'defense', classification: 'secret', note: ' Pękł zbiornik. ' },
    sites,
  );
  assert.match(
    entry().text,
    /wynik — niepowodzenie; przeznaczenie — obronne; lot tajny\. Uwagi Dowódcy: Pękł zbiornik\./,
  );
  assert.equal(
    state.world.log.filter((e) => e.ref === 'lot.M-1951-02').length,
    1,
    'depesza lotu jest jedna i zmienia treść',
  );
  assert.throws(
    () => fileMissionReport(state, 'M-1951-99', { outcome: 'success', purpose: 'test', classification: 'public' }),
    /Nie ma lotu/,
  );

  // Ponowne wczytanie zapisu w tym samym kwartale zachowuje złożony raport.
  const again = recordKspSnapshot(
    state,
    { ...snapshot, newLaunches: [launch('A-1', '1951-01-03'), launch('A-2', '1951-01-06', 2)] },
    sites,
  );
  assert.equal(again.state.ksp.flights.length, 2);
  assert.equal(again.state.ksp.flights.find((f) => f.vessel === 'A-2')!.report!.outcome, 'failure');
});

test('rozliczenie lotów: prasa, Waszyngton, fasada, frakcje i zatajona awaria', () => {
  const c = contentWithEchoes();
  const base = closeQuarter(
    recordKspSnapshot(start(c), { ...snapshot, contractsCompleted: 0, newLaunches: [] }).state,
    c,
  );
  const fly = (reports: [string, Parameters<typeof fileMissionReport>[2]][]) => {
    let s = recordKspSnapshot(start(c), {
      ...snapshot,
      contractsCompleted: 0,
      newLaunches: reports.map(([v]) => launch(v, '1951-01-04')),
    }).state;
    reports.forEach(([, r], i) => {
      s = fileMissionReport(s, `M-1951-0${i + 1}`, r);
    });
    return closeQuarter(s, c);
  };
  const diff = (r: ReturnType<typeof closeQuarter>, k: 'ZW' | 'PP' | 'WF') => r.report.after[k] - base.report.after[k];

  // Dwa jawne sukcesy naukowe: PP +2, ZW +1, Rada Naukowa +1.
  const science = fly([
    ['S-1', { outcome: 'success', purpose: 'science', classification: 'public' }],
    ['S-2', { outcome: 'success', purpose: 'science', classification: 'public' }],
  ]);
  assert.equal(diff(science, 'PP'), 2);
  assert.equal(diff(science, 'ZW'), 1);
  assert.equal(science.state.factions.RN!.disposition - base.state.factions.RN!.disposition, 1);
  assert.ok(science.state.ksp.flights.every((f) => f.settled));

  // Jawna awaria lotu obronnego: PP −2, ZW −1, WF −1.
  const crash = fly([['D-1', { outcome: 'failure', purpose: 'defense', classification: 'public' }]]);
  assert.deepEqual([diff(crash, 'PP'), diff(crash, 'ZW'), diff(crash, 'WF')], [-2, -1, -1]);

  // Zatajona awaria: prasa nic nie wie, ale w Rejestrze jest Tajemnica i echo w kolejce.
  const hushed = fly([['T-1', { outcome: 'failure', purpose: 'test', classification: 'secret' }]]);
  assert.equal(diff(hushed, 'PP'), 0);
  assert.ok(
    toPlayerView(hushed.state).registry.some(
      (r) => r.type === 'secret' && /Zatajona awaria: lot M-1951-01/.test(r.title),
    ),
  );
  assert.deepEqual(
    hushed.state.world.echoQueue.map((x) => [x.echo, x.due]),
    [
      ['przeciek-zatajonej-awarii', '1951-Q3'],
      ['zatajona-awaria-przycicha', '1952-Q3'],
    ],
  );

  // Lot bez raportu: rozliczony domyślnie jako jawna próba techniczna.
  const lazy = closeQuarter(
    recordKspSnapshot(start(c), { ...snapshot, contractsCompleted: 0, newLaunches: [launch('L-1', '1951-01-04')] })
      .state,
    c,
  );
  assert.ok(lazy.report.notes.some((n) => /wypełnione domyślnie \(1\)/.test(n)));
  assert.equal(lazy.state.ksp.flights[0]!.report!.auto, true);
  assert.equal(diff(lazy, 'PP'), 1);
});
