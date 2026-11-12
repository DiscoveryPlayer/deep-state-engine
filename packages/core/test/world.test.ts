import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceWorld,
  branchWeights,
  createInitialState,
  deserializeState,
  divergenceFactor,
  dilemmaContentSchema,
  evaluateCondition,
  nextQuarter,
  patternContentSchema,
  resolveDilemma,
  serializeState,
  simulateWorld,
  threadContentSchema,
  threadTemplateContentSchema,
  toPlayerView,
  validateWorldContent,
  worldDefinitionSchema,
  type GameContent,
  type GameState,
  type WorldContent,
} from '../src/index.ts';
import { fixtureContent } from './fixture.ts';

/** Mała treść świata do testów silnika — niezależna od data/events. */
function worldFixture(): WorldContent {
  return {
    definition: worldDefinitionSchema.parse({
      regions: [
        { id: 'usa', title: 'USA' },
        { id: 'bliski_wschod', title: 'Bliski Wschód' },
      ],
      variables: [
        { id: 'popyt', title: 'Popyt', min: 0, max: 10, initial: 6, description: 'd' },
        { id: 'sila', title: 'Siła', min: 0, max: 10, initial: 6, description: 'd' },
      ],
      maxPendingDilemmas: 1,
    }),
    threads: [
      threadContentSchema.parse({
        id: 'kryzys',
        title: 'Kryzys',
        kind: 'historical',
        region: 'bliski_wschod',
        summary: 's',
        historicalNote: 'h',
        start: { from: '1951-Q1' },
        stages: [
          {
            id: 'poczatek',
            title: 'początek',
            at: '1951-Q2',
            branches: [
              {
                id: 'hist',
                title: 'H',
                historical: true,
                weight: 1,
                effects: [{ var: 'popyt', add: 1 }],
                text: 'Historia.',
              },
              {
                id: 'zwloka',
                title: 'Z',
                weight: 0,
                modifiers: [{ when: { flag: 'zwloka' }, add: 1000 }],
                delayQuarters: 2,
                text: 'Zwłoka.',
              },
              {
                id: 'szybko',
                title: 'S',
                weight: 0,
                modifiers: [{ when: { flag: 'szybko' }, add: 1000 }],
                advanceNext: 2,
                text: 'Przyspieszenie.',
              },
              {
                id: 'wojna',
                title: 'W',
                weight: 0,
                modifiers: [{ when: { flag: 'wojna' }, add: 1000 }],
                next: 'wojna',
                effects: [{ correction: { units: -1, quarters: 2, reason: 'Wojna' } }],
                text: 'Wojna.',
              },
            ],
          },
          {
            id: 'wojna',
            title: 'wojna',
            at: '1951-Q3',
            alternative: true,
            branches: [{ id: 'koniec_wojny', title: 'K', weight: 1, next: 'end', text: 'Koniec wojny.' }],
          },
          {
            id: 'final',
            title: 'finał',
            at: '1952-Q1',
            branches: [
              { id: 'final_hist', title: 'F', historical: true, weight: 1, text: 'Finał.', visibility: 'secret' },
            ],
          },
        ],
      }),
    ],
    templates: [
      threadTemplateContentSchema.parse({
        id: 'spor',
        title: 'Spór w kraju {kraj}',
        region: 'bliski_wschod',
        summary: 's',
        params: {
          kraj: [
            { mian: 'Irak', dop: 'Iraku' },
            { mian: 'Kuwejt', dop: 'Kuwejtu' },
          ],
        },
        conditions: { flag: 'szablony' },
        chancePerQuarter: 1,
        cooldownQuarters: 2,
        maxInstances: 2,
        stages: [
          {
            id: 'etap',
            title: 'etap',
            offset: 1,
            branches: [
              { id: 'a', title: 'A', weight: 1, text: 'Spór w kraju {kraj} wygasa. Rząd {kraj.dop} ogłasza sukces.' },
            ],
          },
        ],
      }),
    ],
    patterns: [
      patternContentSchema.parse({
        id: 'tajny',
        title: 'Tajny wzorzec',
        category: 'military',
        conditions: { flag: 'wzorce' },
        chancePerQuarter: 1,
        cooldownQuarters: 1,
        maxTotal: 2,
        visibility: 'secret',
        effects: [{ var: 'sila', add: -1 }],
        text: 'TAJNY TEKST WZORCA',
      }),
    ],
    dilemmas: [
      dilemmaContentSchema.parse({
        id: 'wybor',
        title: 'Wybór',
        conditions: { flag: 'dylematy' },
        chancePerQuarter: 1,
        once: true,
        prompt: 'Co robimy?',
        options: [
          { id: 'tak', title: 'Tak', effects: [{ var: 'sila', add: 2 }], text: 'Tak.' },
          { id: 'nie', title: 'Nie', effects: [{ var: 'sila', add: -2 }], text: 'Nie.' },
        ],
        defaultOption: 'nie',
        inactionEffects: [{ currency: 'KP', add: -1 }],
      }),
    ],
  };
}

function content(world = worldFixture()): GameContent {
  return { ...fixtureContent(), world };
}

function start(flags: string[] = [], world = worldFixture()): GameState {
  const s = createInitialState(content(world), { id: 't', seed: 'PACE-1951' });
  s.world.flags.push(...flags);
  return s;
}

/** Przesuwa świat o n kwartałów (tak jak pętla tury). */
function run(state: GameState, world: WorldContent, n: number): GameState {
  let s = state;
  for (let i = 0; i < n; i++) {
    s = advanceWorld(s, world).state;
    s = { ...s, quarter: nextQuarter(s.quarter) };
  }
  return s;
}

test('treść testowa przechodzi walidację świata', () => {
  assert.deepEqual(validateWorldContent(worldFixture(), new Set(['DPO', 'RN'])), []);
});

test('walidacja łapie złe odwołania, brak gałęzi historycznej i nieznane parametry', () => {
  const w = worldFixture();
  w.threads[0]!.stages[0]!.branches[0]!.historical = false;
  w.threads[0]!.stages[0]!.branches[2]!.next = 'nie_ma';
  w.templates[0]!.stages[0]!.branches[0]!.text = 'Spór w {miasto}, ropa z {kraj.miejsc}.';
  w.dilemmas[0]!.defaultOption = 'moze';
  const problems = validateWorldContent(w, new Set(['DPO', 'RN']))
    .map((p) => p.message)
    .join('\n');
  assert.match(problems, /histor/i);
  assert.match(problems, /nie_ma/);
  assert.match(problems, /miasto/);
  assert.match(problems, /kraj\.miejsc/, 'forma, której nie mają wszystkie wartości');
  assert.match(problems, /moze/);
});

test('warunki: logika, zmienne, okna czasu, flagi i historia wątków', () => {
  const s = start(['f']);
  assert.ok(evaluateCondition({ all: [{ flag: 'f' }, { var: 'popyt', op: '>=', value: 6 }] }, s));
  assert.ok(!evaluateCondition({ any: [{ flag: 'brak' }, { not: { flag: 'f' } }] }, s));
  assert.ok(evaluateCondition({ after: '1951-Q1' }, s));
  assert.ok(!evaluateCondition({ before: '1951-Q1' }, s));
  assert.ok(evaluateCondition({ indicator: 'NG', op: '==', value: 4 }, s));
  const later = run(s, worldFixture(), 2);
  assert.ok(evaluateCondition({ stage: 'kryzys.poczatek' }, later));
  assert.ok(evaluateCondition({ branch: 'kryzys.poczatek.hist' }, later));
  assert.ok(!evaluateCondition({ branch: 'kryzys.poczatek.wojna' }, later));
});

test('Rozbieżność: przy 0 historia ma przewagę ×3, przy 10 znika, gałęzie niehistoryczne rosną', () => {
  assert.equal(divergenceFactor(true, 0), 3);
  assert.equal(divergenceFactor(true, 10), 1);
  assert.equal(divergenceFactor(false, 0), 1);
  assert.equal(divergenceFactor(false, 10), 2.5);
  const w = worldFixture();
  const s = start(['wojna'], w);
  const stage = w.threads[0]!.stages[0]!;
  const calm = branchWeights(stage, 'bliski_wschod', s);
  s.world.divergence.bliski_wschod = 10;
  const wild = branchWeights(stage, 'bliski_wschod', s);
  const weight = (list: typeof calm, id: string) => list.find((x) => x.branch.id === id)!.weight;
  assert.equal(weight(calm, 'hist'), 3);
  assert.equal(weight(wild, 'hist'), 1);
  assert.equal(weight(wild, 'wojna'), 2500);
  assert.equal(weight(wild, 'szybko'), 0, 'modyfikator bez spełnionego warunku nie działa');
});

test('etap rozstrzyga się w swoim kwartale, gałąź historyczna nie podnosi Rozbieżności', () => {
  const w = worldFixture();
  const q1 = advanceWorld(start([], w), w);
  assert.equal(q1.entries.length, 0, 'w I kw. 1951 nic się nie dzieje');
  const s = run(start([], w), w, 2);
  const inst = s.world.threads.kryzys!;
  assert.deepEqual(
    inst.history.map((h) => h.branch),
    ['hist'],
  );
  assert.equal(inst.history[0]!.quarter, '1951-Q2');
  assert.equal(s.world.vars.popyt, 7);
  assert.equal(s.world.divergence.bliski_wschod, 0);
  assert.equal(inst.stage, 'final', 'etap alternatywny jest pomijany na ścieżce historycznej');
  assert.equal(inst.nextCheck, '1952-Q1');
});

test('gałąź niehistoryczna: Rozbieżność +1, skok do etapu alternatywnego i Korekta budżetu', () => {
  const w = worldFixture();
  const s = run(start(['wojna'], w), w, 4);
  const inst = s.world.threads.kryzys!;
  assert.deepEqual(
    inst.history.map((h) => h.branch),
    ['wojna', 'koniec_wojny'],
  );
  assert.equal(inst.status, 'ended');
  assert.equal(s.world.divergence.bliski_wschod, 1);
  assert.equal(s.world.corrections.length, 1);
  assert.equal(s.world.corrections[0]!.from, '1951-Q2');
  assert.equal(s.world.corrections[0]!.source, 'kryzys.poczatek.wojna');
});

test('opóźnienie: etap wraca po delayQuarters i znów losuje gałąź', () => {
  const w = worldFixture();
  let s = run(start(['zwloka'], w), w, 2);
  assert.equal(s.world.threads.kryzys!.nextCheck, '1951-Q4');
  s.world.flags = [];
  s = run(s, w, 2);
  assert.deepEqual(
    s.world.threads.kryzys!.history.map((h) => `${h.quarter}:${h.branch}`),
    ['1951-Q2:zwloka', '1951-Q4:hist'],
  );
});

test('przyspieszenie: advanceNext przesuwa następny etap wcześniej, ale nie przed kolejny kwartał', () => {
  const w = worldFixture();
  const s = run(start(['szybko'], w), w, 2);
  const inst = s.world.threads.kryzys!;
  assert.equal(inst.stage, 'final');
  assert.equal(inst.nextCheck, '1951-Q3', 'finał z 1952-Q1 przesunięty o 2 kwartały');
});

test('szablon: parametry z listy, limit instancji, odstęp i etap przesunięty od startu', () => {
  const w = worldFixture();
  const s = run(start(['szablony'], w), w, 12);
  const instances = Object.entries(s.world.threads).filter(([, t]) => t.fromTemplate);
  assert.equal(instances.length, 2, 'maxInstances');
  const [first, second] = instances.map(([, t]) => t);
  assert.ok(['Irak', 'Kuwejt'].includes(first!.params.kraj!));
  assert.equal(first!.startedIn, '1951-Q1');
  assert.equal(second!.startedIn, '1951-Q4', 'odstęp 2 kwartały po starcie pierwszego');
  assert.equal(first!.history[0]!.quarter, '1951-Q2', 'offset 1');
  const entry = s.world.log.find((e) => e.kind === 'template')!;
  assert.match(entry.title, /Spór w kraju (Irak|Kuwejt)/);
  assert.ok(!entry.text.includes('{'), 'wszystkie parametry wstawione');
  assert.match(entry.text, /Rząd (Iraku|Kuwejtu) ogłasza/);
  assert.equal(s.world.divergence.bliski_wschod, 0, 'szablony nie podnoszą Rozbieżności same z siebie');
});

test('wzorzec: odstęp między wystąpieniami i limit łączny', () => {
  const w = worldFixture();
  const s = run(start(['wzorce'], w), w, 10);
  assert.equal(s.world.patternLog.tajny!.count, 2);
  const quarters = s.world.log.filter((e) => e.ref === 'tajny').map((e) => e.quarter);
  assert.deepEqual(quarters, ['1951-Q1', '1951-Q3']);
  assert.equal(s.world.vars.sila, 4);
});

test('dylemat: trafia na Biurko, a bez decyzji po terminie rozstrzyga się opcją domyślną', () => {
  const w = worldFixture();
  let s = advanceWorld(start(['dylematy'], w), w).state;
  assert.equal(s.world.pendingDilemmas.length, 1);
  assert.equal(s.world.pendingDilemmas[0]!.expiresIn, '1951-Q2');
  s = run({ ...s, quarter: nextQuarter(s.quarter) }, w, 1);
  assert.equal(s.world.pendingDilemmas.length, 0);
  assert.equal(s.world.vars.sila, 4, 'opcja domyślna "nie"');
  assert.equal(s.currencies.KP, 2, 'koszt bierności: przegapiony termin');
  assert.ok(s.world.log.some((e) => e.ref === 'wybor.nie' && e.title.includes('bez decyzji')));
  s = run(s, w, 4);
  assert.equal(s.world.dilemmaLog.wybor!.count, 1, 'once: tylko raz w kampanii');
});

test('dylemat: decyzja Andersona stosuje skutki wybranej opcji', () => {
  const w = worldFixture();
  const s = advanceWorld(start(['dylematy'], w), w).state;
  const { state, entry } = resolveDilemma(s, w, s.world.pendingDilemmas[0]!.instanceId, 'tak');
  assert.equal(state.world.vars.sila, 8);
  const passive = resolveDilemma(s, w, s.world.pendingDilemmas[0]!.instanceId, 'nie').state;
  assert.equal(passive.currencies.KP, s.currencies.KP, 'świadomy wybór opcji domyślnej nie kosztuje bierności');
  assert.equal(entry.ref, 'wybor.tak');
  assert.equal(state.world.pendingDilemmas.length, 0);
  assert.equal(s.world.pendingDilemmas.length, 1, 'stan wejściowy bez zmian');
  assert.throws(() => resolveDilemma(s, w, 'dylemat-999', 'tak'), /dylemat-999/);
});

test('determinizm: to samo ziarno daje ten sam świat, inne ziarno — inny', () => {
  const w = worldFixture();
  w.threads[0]!.stages[0]!.branches[1]!.weight = 1;
  w.threads[0]!.stages[0]!.branches[2]!.weight = 1;
  const go = (seed: string) =>
    serializeState(
      simulateWorld(createInitialState(content(w), { id: 't', seed }), w, { to: '1953-Q4', decisions: 'random' }).state,
    );
  assert.equal(go('A'), go('A'));
  const variants = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(go));
  assert.ok(variants.size > 1);
});

test('stan po symulacji zapisuje się i wczytuje bez strat', () => {
  const w = worldFixture();
  const { state } = simulateWorld(start(['wzorce', 'szablony', 'dylematy'], w), w, { to: '1952-Q4' });
  const text = serializeState(state);
  assert.equal(serializeState(deserializeState(text)), text);
});

test('Z4: tajne wpisy, zmienne, Rozbieżność i wątki nie trafiają do widoku gracza', () => {
  const w = worldFixture();
  const { state } = simulateWorld(start(['wzorce', 'wojna'], w), w, { to: '1952-Q4' });
  assert.ok(state.world.log.some((e) => e.visibility === 'secret'));
  const view = toPlayerView(state);
  const json = JSON.stringify(view);
  assert.ok(!json.includes('TAJNY TEKST WZORCA'));
  assert.ok(!json.includes('Finał.'), 'tajna gałąź wątku');
  assert.ok(!json.includes('divergence') && !json.includes('popyt') && !json.includes('historical'));
  assert.ok(view.worldNews.some((n) => n.text === 'Wojna.'));
  assert.ok(view.chronicle.every((c) => !c.text.includes('TAJNY')));
});

test('migracja: stan w wersji 1 dostaje pusty świat i działa dalej', () => {
  const s = start();
  const raw = JSON.parse(serializeState(s)) as Record<string, unknown>;
  delete raw.world;
  raw.schemaVersion = 1;
  const migrated = deserializeState(JSON.stringify(raw));
  assert.equal(migrated.schemaVersion, 3);
  assert.deepEqual(migrated.budget.ledger, []);
  assert.deepEqual(migrated.world.threads, {});
  const w = worldFixture();
  const after = advanceWorld(migrated, w).state;
  assert.equal(after.world.vars.popyt, 6, 'zmienne uzupełnione z treści przy pierwszym kwartale');
});
