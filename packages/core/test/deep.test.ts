import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceWorld,
  branchKind,
  createInitialState,
  deserializeState,
  evaluateCondition,
  nextQuarter,
  resolveDilemma,
  serializeState,
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

/** Wątek głęboki w miniaturze: pogłoska, decyzja, depesze w jednym kwartale, reakcje, sytuacja, echo. */
function deepWorld(): WorldContent {
  return {
    definition: worldDefinitionSchema.parse({
      regions: [{ id: 'bliski_wschod', title: 'Bliski Wschód' }],
      variables: [{ id: 'presja', title: 'Presja', min: 0, max: 10, initial: 2, description: 'd' }],
    }),
    threads: [
      threadContentSchema.parse({
        id: 'kanal',
        title: 'Kryzys kanału',
        kind: 'historical',
        region: 'bliski_wschod',
        exclusiveGroup: 'surowce',
        summary: 's',
        historicalNote: 'h',
        start: { from: '1951-Q1' },
        stages: [
          {
            id: 'nacjonalizacja',
            title: 'nacjonalizacja',
            at: '1951-Q2',
            anchor: true,
            branches: [
              {
                id: 'hist',
                title: 'H',
                historical: true,
                weight: 1,
                text: 'Kanał znacjonalizowany.',
                reactions: [
                  { actor: 'Londyn', text: 'Londyn protestuje.', effects: [{ var: 'presja', add: 1 }] },
                  { actor: 'BAS', text: 'BAS wie więcej.', visibility: 'secret' },
                ],
                ongoing: {
                  title: 'Kanał w obcych rękach',
                  text: 'Frachty drożeją.',
                  effects: [{ correction: { units: -0.5, quarters: 1, reason: 'Droższe frachty' } }],
                  until: 'wojna',
                },
              },
            ],
          },
          {
            id: 'konferencja',
            title: 'konferencja',
            sameQuarter: true,
            branches: [{ id: 'hist', title: 'H', historical: true, weight: 1, text: 'Konferencja bez wyniku.' }],
          },
          {
            id: 'wojna',
            title: 'wojna',
            at: '1951-Q4',
            rumor: { quartersBefore: 1, reliability: 'B', text: 'Oficerowie widziani w stolicy sąsiada.' },
            decision: {
              prompt: 'Jak głosuje PACE?',
              options: [
                { id: 'z-usa', title: 'Z Waszyngtonem', effects: [{ indicator: 'ZW', add: 3 }], text: 'PACE z USA.' },
                {
                  id: 'z-sojusznikami',
                  title: 'Z sojusznikami',
                  effects: [{ indicator: 'ZW', add: -4 }],
                  text: 'PACE z sojusznikami.',
                  weights: { interwencja: { mul: 0 }, poparcie: { add: 1000 } },
                },
              ],
              defaultOption: 'z-usa',
              inactionEffects: [{ currency: 'KP', add: -1 }],
            },
            branches: [
              {
                id: 'interwencja',
                title: 'I',
                historical: true,
                weight: 10,
                text: 'Interwencja i odwrót.',
                effects: [{ flag: 'po_kanale' }],
              },
              {
                id: 'poparcie',
                title: 'P',
                weight: 0,
                text: 'USA popierają sojuszników.',
                effects: [{ flag: 'po_kanale' }],
              },
            ],
          },
        ],
      }),
      threadContentSchema.parse({
        id: 'echo',
        title: 'Echo kanału',
        kind: 'reactive',
        region: 'bliski_wschod',
        summary: 's',
        historicalNote: 'h',
        start: { from: '1951-Q1', conditions: { flag: 'po_kanale' } },
        stages: [
          {
            id: 'pierwsze',
            title: 'pierwsze echo',
            offset: 2,
            branches: [{ id: 'a', title: 'A', weight: 1, text: 'Echo po dwóch kwartałach.' }],
          },
        ],
      }),
    ],
    templates: [
      threadTemplateContentSchema.parse({
        id: 'kryzys',
        title: 'Kryzys surowcowy',
        region: 'bliski_wschod',
        summary: 's',
        chancePerQuarter: 1,
        cooldownQuarters: 0,
        maxInstances: 1,
        historicalInstances: ['kanal'],
        exclusiveGroup: 'surowce',
        stages: [{ id: 'e', title: 'e', offset: 0, branches: [{ id: 'a', title: 'A', weight: 1, text: 'Szablon.' }] }],
      }),
    ],
    patterns: [],
    dilemmas: [],
  };
}

function content(world = deepWorld()): GameContent {
  return { ...fixtureContent(), world };
}
function start(world = deepWorld()): GameState {
  return createInitialState(content(world), { id: 't', seed: 'PACE-1951' });
}
/** Rozlicza n kwartałów; `decide` może podjąć decyzję po każdym kwartale. */
function run(state: GameState, world: WorldContent, n: number, decide?: (s: GameState) => GameState): GameState {
  let s = state;
  for (let i = 0; i < n; i++) {
    s = advanceWorld(s, world).state;
    if (decide) s = decide(s);
    s = { ...s, quarter: nextQuarter(s.quarter) };
  }
  return s;
}

test('treść wątku głębokiego przechodzi walidację', () => {
  assert.deepEqual(validateWorldContent(deepWorld(), new Set(['DPO', 'RN', 'BAS'])), []);
});

test('walidacja wątków głębokich: kotwica, rodzaj gałęzi, wagi decyzji, until, wątek reaktywny', () => {
  const w = deepWorld();
  const kanal = w.threads[0]!;
  kanal.stages[0]!.branches.push({ ...kanal.stages[0]!.branches[0]!, id: 'druga', historical: false, reactions: [] });
  delete kanal.stages[0]!.branches[1]!.ongoing;
  kanal.stages[0]!.branches[0]!.ongoing!.until = 'nie_ma';
  kanal.stages[2]!.branches[1]!.kind = 'delayed';
  kanal.stages[2]!.decision!.options[1]!.weights = { brak: { mul: 2 } };
  w.threads[1]!.start = { from: '1951-Q1' };
  w.templates[0]!.historicalInstances = ['nieznany'];
  const text = validateWorldContent(w, new Set(['DPO']))
    .map((p) => p.message)
    .join('\n');
  assert.match(text, /kotwica ma dokładnie jedną gałąź/);
  assert.match(text, /"until" wskazuje nieistniejący etap "nie_ma"/);
  assert.match(text, /rodzaj gałęzi "delayed" nie zgadza się/);
  assert.match(text, /nieistniejącą gałąź "brak"/);
  assert.match(text, /wątek reaktywny potrzebuje warunku startu/);
  assert.match(text, /nieistniejący wątek "nieznany"/);
});

test('rodzaj gałęzi wyprowadza się z mechaniki', () => {
  const b = deepWorld().threads[0]!.stages[2]!.branches;
  assert.equal(branchKind(b[0]!), 'historical');
  assert.equal(branchKind(b[1]!), 'alternative');
  assert.equal(branchKind({ ...b[1]!, delayQuarters: 2 }), 'delayed');
  assert.equal(branchKind({ ...b[1]!, advanceNext: 1 }), 'accelerated');
  assert.equal(branchKind({ ...b[1]!, next: 'end' }), 'interrupted');
});

test('depesze w jednym kwartale, reakcje stron i sytuacja trwająca', () => {
  const w = deepWorld();
  const s = run(start(w), w, 2);
  const q2 = s.world.log.filter((e) => e.quarter === '1951-Q2');
  assert.deepEqual(
    q2.map((e) => e.kind),
    ['thread', 'reaction', 'reaction', 'situation', 'thread'],
    'etap, dwie reakcje, sytuacja i drugi etap w tym samym kwartale',
  );
  assert.equal(q2[1]!.actor, 'Londyn');
  assert.equal(s.world.vars.presja, 3, 'skutek reakcji');
  assert.equal(s.world.situations.length, 1);
  assert.equal(s.world.corrections.length, 0, 'sytuacja nalicza skutki dopiero od następnego kwartału');
  const s3 = run(s, w, 1);
  assert.equal(s3.world.corrections.length, 1);
  assert.equal(s3.world.corrections[0]!.from, '1951-Q3');
});

test('pogłoska wywiadu wychodzi kwartał przed etapem i trafia do Ocen', () => {
  const w = deepWorld();
  const s = run(start(w), w, 3);
  assert.equal(s.knowledge.assessments.length, 1);
  const a = s.knowledge.assessments[0]!;
  assert.equal(a.quarter, '1951-Q3');
  assert.equal(a.reliability, 'B');
  assert.match(a.text, /Oficerowie/);
  assert.equal(run(s, w, 3).knowledge.assessments.length, 1, 'pogłoska wychodzi raz');
});

test('punkt decyzyjny: sprawa na Biurku przed etapem, wybór przesuwa wagi gałęzi', () => {
  const w = deepWorld();
  const s3 = run(start(w), w, 3);
  const pending = s3.world.pendingDilemmas;
  assert.equal(pending.length, 1);
  assert.equal(pending[0]!.expiresIn, '1951-Q4');
  assert.deepEqual(pending[0]!.source, { thread: 'kanal', stage: 'wojna' });
  assert.ok(toPlayerView(s3).pendingDilemmas[0]!.fromThread);

  const chosen = resolveDilemma(s3, w, pending[0]!.instanceId, 'z-sojusznikami').state;
  assert.equal(chosen.indicators.ZW, s3.indicators.ZW - 4);
  const after = run(chosen, w, 1);
  assert.deepEqual(
    after.world.threads.kanal!.history.map((h) => h.branch),
    ['hist', 'hist', 'poparcie'],
    'wybór Andersona wyłączył gałąź historyczną',
  );
  assert.equal(after.world.divergence.bliski_wschod, 1);
  assert.equal(after.world.situations.length, 0, 'sytuacja wygasa po etapie "until"');
});

test('punkt decyzyjny bez decyzji: opcja domyślna i koszt bierności, potem losowanie', () => {
  const w = deepWorld();
  const s = run(start(w), w, 4);
  assert.equal(s.world.pendingDilemmas.length, 0);
  assert.equal(s.currencies.KP, 2, 'koszt bierności');
  assert.equal(s.world.threads.kanal!.decisions.wojna, 'z-usa');
  assert.equal(s.world.threads.kanal!.history.at(-1)!.branch, 'interwencja');
});

test('wątek reaktywny (echo) startuje od flagi i liczy etapy od startu', () => {
  const w = deepWorld();
  const s = run(start(w), w, 7);
  const echo = s.world.threads.echo!;
  assert.equal(echo.startedIn, '1952-Q1', 'flaga ustawiona w 1951-Q4, wątek startuje w następnym kwartale');
  assert.equal(echo.history[0]!.quarter, '1952-Q3');
  assert.equal(s.world.divergence.bliski_wschod, 0, 'wątek reaktywny nie podnosi Rozbieżności');
});

test('bezpieczniki szablonu: milczy, dopóki trwa przypadek historyczny', () => {
  const w = deepWorld();
  const during = run(start(w), w, 3);
  assert.equal(Object.keys(during.world.threads).filter((k) => k.startsWith('kryzys#')).length, 0);
  const after = run(during, w, 3);
  assert.equal(Object.keys(after.world.threads).filter((k) => k.startsWith('kryzys#')).length, 1);
});

test('warunek epoki', () => {
  const s = start();
  assert.ok(evaluateCondition({ era: 'I', op: '==' }, s));
  assert.ok(!evaluateCondition({ era: 'II', op: '>=' }, s));
  s.organization.era = 'III';
  assert.ok(evaluateCondition({ era: 'II', op: '>=' }, s));
});

test('Z4: tajna reakcja nie trafia do widoku; stan wątków głębokich zapisuje się bez strat', () => {
  const w = deepWorld();
  const s = run(start(w), w, 5);
  const view = JSON.stringify(toPlayerView(s));
  assert.ok(!view.includes('BAS wie więcej'));
  assert.ok(view.includes('Londyn protestuje'));
  const text = serializeState(s);
  assert.equal(serializeState(deserializeState(text)), text);
});

test('migracja 2 → 3: instancje wątków dostają pola wątków głębokich', () => {
  const s = run(start(), deepWorld(), 2);
  const raw = JSON.parse(serializeState(s)) as Record<string, any>;
  raw.schemaVersion = 2;
  for (const k of ['budget', 'desk', 'reports', 'ksp', 'status']) delete raw[k];
  delete raw.world.situations;
  for (const inst of Object.values(raw.world.threads) as Record<string, unknown>[]) {
    delete inst.rumors;
    delete inst.asked;
    delete inst.decisions;
  }
  for (const e of raw.world.log) if (e.kind === 'reaction' || e.kind === 'situation') e.kind = 'thread';
  const migrated = deserializeState(JSON.stringify(raw));
  assert.equal(migrated.schemaVersion, 3);
  assert.deepEqual(migrated.world.threads.kanal!.rumors, []);
  assert.equal(migrated.status, 'active');
});
