import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STATE_SCHEMA_VERSION,
  beginQuarter,
  closeQuarter,
  createInitialState,
  deserializeState,
  dilemmaContentSchema,
  echoContentSchema,
  resolveDilemma,
  serializeState,
  toNarratorSecrets,
  toPlayerView,
  validateWorldContent,
  worldDefinitionSchema,
  type GameContent,
  type GameState,
} from '../src/index.ts';
import { fixtureContent } from './fixture.ts';

/** Świat z jednym dylematem (pewnym w I kwartale) i echami podpiętymi pod jego opcje. */
function content(echoes: object[]): GameContent {
  return {
    ...fixtureContent(),
    world: {
      definition: worldDefinitionSchema.parse({
        regions: [{ id: 'usa', title: 'USA' }],
        variables: [{ id: 'kadry', title: 'Kadry', min: 0, max: 10, initial: 5, description: 'Pula kadr.' }],
      }),
      threads: [],
      templates: [],
      patterns: [],
      dilemmas: [
        dilemmaContentSchema.parse({
          id: 'maszyna',
          title: 'Maszyna licząca',
          chancePerQuarter: 1,
          once: true,
          prompt: 'Kupić?',
          options: [
            { id: 'kupic', title: 'Kupić', text: 'Kupiona.' },
            { id: 'odmowic', title: 'Odmówić', text: 'Zostają suwaki.' },
          ],
          defaultOption: 'odmowic',
          source: 'test',
        }),
      ],
      echoes: echoes.map((e) => echoContentSchema.parse(e)),
    },
  };
}

function decide(c: GameContent, option: string): GameState {
  const opened = beginQuarter(createInitialState(c, { id: 't', seed: 'ECHO' }), c).state;
  const pending = opened.world.pendingDilemmas[0]!;
  return resolveDilemma(opened, c.world!, pending.instanceId, option).state;
}

const advance = (s: GameState, c: GameContent, quarters: number) => {
  let state = s;
  for (let i = 0; i < quarters; i++) state = closeQuarter(state, c).state;
  return state;
};

test('echo decyzji: staje w kolejce, wraca po wyznaczonej liczbie kwartałów i zna swoją przyczynę', () => {
  const c = content([
    {
      id: 'skrzynie',
      on: ['maszyna.kupic'],
      after: 2,
      title: 'Maszyna przyjeżdża',
      text: 'W skrzyniach.',
      effects: [{ var: 'kadry', add: 1 }],
    },
    {
      id: 'suwaki',
      on: ['maszyna.odmowic', 'maszyna.biernosc'],
      after: 1,
      title: 'Matematycy odchodzą',
      text: 'Do konkurencji.',
    },
  ]);
  const bought = decide(c, 'kupic');
  assert.deepEqual(bought.world.echoQueue, [
    { echo: 'skrzynie', due: '1951-Q3', source: 'maszyna.kupic', cause: 'Maszyna licząca: Kupić' },
  ]);
  const q2 = advance(bought, c, 1);
  assert.ok(!q2.world.log.some((e) => e.kind === 'echo'), 'za wcześnie');
  const q3 = advance(q2, c, 1);
  const news = toPlayerView(q3).worldNews.find((n) => n.kind === 'echo')!;
  assert.deepEqual(
    { quarter: news.quarter, title: news.title, cause: news.cause, topic: news.topic },
    { quarter: '1951-Q3', title: 'Maszyna przyjeżdża', cause: 'Maszyna licząca: Kupić', topic: 'maszyna' },
  );
  assert.match(news.card ?? '', /^W\d+$/, 'echo dostaje kartę wydarzenia');
  assert.equal(q3.world.vars.kadry, 6, 'skutki echa zadziałały');
  assert.deepEqual(q3.world.echoQueue, []);

  // Bierność też ma dalszy ciąg: sprawa zostawiona bez decyzji idzie opcją domyślną i źródłem „biernosc”.
  const opened = beginQuarter(createInitialState(c, { id: 't', seed: 'ECHO' }), c).state;
  const ignored = advance(opened, c, 2);
  assert.ok(ignored.world.log.some((e) => e.kind === 'echo' && e.title === 'Matematycy odchodzą'));
});

test('Rejestr Następstw: wpis jawny i ukryty, warunek po kluczu, zamknięcie wpisu', () => {
  const c = content([
    {
      id: 'slad',
      on: ['maszyna.odmowic'],
      after: 0,
      silent: true,
      title: 'Ślad',
      text: 'Ślad.',
      effects: [
        { registry: { key: 'uraza-rady', type: 'grudge', title: 'Rada pamięta odmowę', with: ['RN'], visible: false } },
        { registry: { key: 'obietnica', type: 'promise', title: 'Obietnica: maszyna w przyszłym roku' } },
      ],
    },
    {
      id: 'przypomnienie',
      on: ['maszyna.odmowic'],
      after: 2,
      requires: { registry: 'obietnica' },
      title: 'Rada przypomina o obietnicy',
      text: 'Minął rok.',
      effects: [{ registryClose: 'obietnica' }, { registryClose: 'uraza-rady', as: 'revealed' }],
      otherwise: { title: 'Nikt nie pamięta', text: 'Cisza.' },
    },
  ]);
  assert.deepEqual(validateWorldContent(c.world!, new Set(['RN'])), []);

  const refused = decide(c, 'odmowic');
  assert.ok(!refused.world.log.some((e) => e.kind === 'echo'), 'echo ciche nie daje depeszy');
  const view = toPlayerView(refused);
  assert.deepEqual(
    view.registry.filter((r) => r.source !== null).map((r) => [r.type, r.title, r.source]),
    [['promise', 'Obietnica: maszyna w przyszłym roku', 'Maszyna licząca: Odmówić']],
    'gracz widzi tylko wpis jawny',
  );
  assert.ok(!JSON.stringify(view).includes('Rada pamięta odmowę'), 'wpis ukryty nie wycieka do widoku gracza');
  assert.deepEqual(
    toNarratorSecrets(refused, c)
      .hiddenRegistry.filter((r) => r.source !== null)
      .map((r) => r.title),
    ['Rada pamięta odmowę'],
    'narrator w warstwie ukrytej go zna',
  );
  assert.deepEqual(
    toNarratorSecrets(refused, c).upcomingEchoes.map((e) => [e.title, e.due]),
    [['Rada przypomina o obietnicy', '1951-Q3']],
  );

  const later = advance(refused, c, 2);
  assert.ok(later.world.log.some((e) => e.title === 'Rada przypomina o obietnicy'));
  const status = (key: string) => later.registry.find((r) => r.key === key)!.status;
  assert.deepEqual([status('obietnica'), status('uraza-rady')], ['resolved', 'revealed']);
});

test('walidacja ech: nieistniejące źródło, echo bez kolejki, termin 0 bez „silent”, klucz bez wpisu', () => {
  const c = content([
    { id: 'zle-zrodlo', on: ['maszyna.sprzedac'], title: 'X', text: 'X.' },
    { id: 'sierota', title: 'Y', text: 'Y.' },
    { id: 'glosne-zero', on: ['maszyna.kupic'], after: 0, title: 'Z', text: 'Z.' },
    { id: 'bez-wpisu', on: ['maszyna.kupic'], requires: { registry: 'nie-ma-takiego' }, title: 'W', text: 'W.' },
  ]);
  const messages = validateWorldContent(c.world!, new Set(['RN'])).map((p) => `${p.where}: ${p.message}`);
  assert.equal(messages.length, 4);
  assert.match(messages.join('\n'), /zle-zrodlo: źródło "maszyna.sprzedac" nie istnieje/);
  assert.match(messages.join('\n'), /sierota: żaden skutek nie wstawia tego echa do kolejki/);
  assert.match(messages.join('\n'), /glosne-zero: echo z terminem 0 musi być ciche/);
  assert.match(messages.join('\n'), /żaden skutek nie tworzy wpisu Rejestru o kluczu "nie-ma-takiego"/);
});

test('migracja 4 → 5: kolejka ech, bramka zapisu i loty; stare migawki zachowują starty', () => {
  const c = content([]);
  const raw = JSON.parse(
    serializeState(beginQuarter(createInitialState(c, { id: 't', seed: 'M' }), c).state),
  ) as Record<string, any>;
  raw.schemaVersion = 4;
  delete raw.world.echoQueue;
  raw.ksp = {
    snapshots: [
      {
        quarter: '1951-Q1',
        file: 'persistent.sfs',
        title: 'PACE',
        ut: 1,
        date: '1951-03-05',
        funds: 1,
        reputation: 0,
        confidence: 0,
        science: 0,
        engineers: 1,
        researchers: 1,
        monthlySalaries: 100,
        launchSite: '',
        launches: 1,
        failures: 0,
        contractsCompleted: 0,
        programs: [],
        launchesInQuarter: [{ vessel: 'Solstice 1', date: '1951-03-05', site: null }],
      },
    ],
  };
  const migrated = deserializeState(JSON.stringify(raw));
  assert.equal(migrated.schemaVersion, STATE_SCHEMA_VERSION);
  assert.deepEqual(migrated.world.echoQueue, []);
  assert.deepEqual(migrated.ksp.flights, []);
  assert.deepEqual(migrated.ksp.gate, { quarter: '1951-Q1', status: 'loaded' }, 'zapis z bieżącego kwartału już jest');
  assert.deepEqual(migrated.ksp.snapshots[0]!.newLaunches, [
    { vessel: 'Solstice 1', date: '1951-03-05', site: null, failures: 0 },
  ]);
});
