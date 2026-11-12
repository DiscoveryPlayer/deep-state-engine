import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beginQuarter, createInitialState, recordNarrative, toPlayerView, type GameState } from '@dse/core';
import { loadContent } from '@dse/content';
import {
  NarratorError,
  QUARTER_SECTIONS,
  REPLY_MAX_CHARS,
  REPLY_MAX_SECTIONS,
  ReplyError,
  buildNarratorPackage,
  parseNarratorReply,
  type NarratorCast,
} from '../src/index.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const content = await loadContent(join(ROOT, 'data'));
const cast: NarratorCast = {
  factions: content.factions.map((f) => ({ id: f.id, name: f.name, summary: f.summary })),
  voices: Object.fromEntries(
    content.characters.map((c) => [c.id, { register: c.voice.register, habits: c.voice.habits }]),
  ),
};

function campaign(): GameState {
  return beginQuarter(createInitialState(content, { id: 't', seed: 'PACE-1951' }), content).state;
}

test('pakiet kwartału: zasady, obsada, stan i zadanie z trzema sekcjami', () => {
  const pkg = buildNarratorPackage(toPlayerView(campaign()), cast, { kind: 'quarter', mode: 'full' });
  assert.match(pkg.title, /I kw\. 1951/);
  for (const part of [
    'ZASADY',
    'ŚWIAT GRY',
    'OBSADA PACE',
    'STAN NA',
    'DEPESZE TEGO KWARTAŁU',
    'ZADANIE: NARRACJA KWARTAŁU',
  ]) {
    assert.ok(pkg.prompt.includes(part), `pakiet zawiera część „${part}”`);
  }
  for (const s of QUARTER_SECTIONS) assert.ok(pkg.prompt.includes(`## ${s}`));
  assert.match(pkg.prompt, /gen\. Harlan Voss/);
  assert.match(pkg.prompt, /Zaufanie Waszyngtonu: \d+ na 100/);
});

test('pakiet skrócony pomija zasady i opis świata', () => {
  const view = toPlayerView(campaign());
  const full = buildNarratorPackage(view, cast, { kind: 'quarter', mode: 'full' });
  const short = buildNarratorPackage(view, cast, { kind: 'quarter', mode: 'short' });
  assert.ok(!short.prompt.includes('ZASADY'));
  assert.ok(!short.prompt.includes('OBSADA PACE'));
  assert.ok(short.prompt.includes('DEPESZE TEGO KWARTAŁU'));
  assert.ok(short.prompt.length < full.prompt.length);
});

test('zasada Z4: do pakietu nie trafia nic spoza widoku gracza', () => {
  const state = campaign();
  state.world.log.push({
    quarter: '1951-Q1',
    kind: 'thread',
    ref: 'tajny.etap.galaz',
    title: 'Tajna operacja AJAX',
    text: 'Tylko dla silnika.',
    visibility: 'secret',
  });
  state.world.flags.push('tajna_flaga_swiata');
  state.world.vars.sekretna_zmienna = 9;
  const pkg = buildNarratorPackage(toPlayerView(state), cast, { kind: 'quarter', mode: 'full' });
  for (const secret of ['AJAX', 'Tylko dla silnika', 'tajna_flaga_swiata', 'sekretna_zmienna']) {
    assert.ok(!pkg.prompt.includes(secret), `„${secret}” nie wycieka`);
  }
  // Notatki Mistrza Gry, cechy ukryte i lista „nigdy nie mówi” zostają w treści gry.
  for (const c of content.characters) {
    if (c.dmNote) assert.ok(!pkg.prompt.includes(c.dmNote), `notatka o postaci ${c.id} nie wycieka`);
    for (const never of c.voice.neverSays) assert.ok(!pkg.prompt.includes(never));
    for (const hidden of c.hiddenTraits ?? []) assert.ok(!pkg.prompt.includes(hidden));
  }
  // Agendy frakcji są nieznane na starcie, więc ich nazw też tu nie ma.
  for (const f of content.factions) for (const a of f.agendas) assert.ok(!pkg.prompt.includes(a.id));
});

test('pakiet do sprawy: opcje z literami; nieistniejąca sprawa to błąd', () => {
  const state = campaign();
  state.world.pendingDilemmas.push({
    instanceId: 'd-1',
    dilemma: 'proba',
    title: 'Hala w Ohio',
    prompt: 'Senator czeka na odpowiedź.',
    options: [
      { id: 'tak', title: 'Zgodzić się' },
      { id: 'nie', title: 'Odmówić' },
    ],
    defaultOption: 'nie',
    inactionEffects: [],
    raisedIn: '1951-Q1',
    expiresIn: '1951-Q2',
  } as GameState['world']['pendingDilemmas'][number]);
  const view = toPlayerView(state);
  const pkg = buildNarratorPackage(view, cast, { kind: 'decision', mode: 'short', instanceId: 'd-1' });
  assert.match(pkg.title, /Hala w Ohio/);
  assert.match(pkg.prompt, /A\. Zgodzić się\n\s+B\. Odmówić/);
  assert.match(pkg.prompt, /## GŁOS: imię i nazwisko/);
  assert.throws(
    () => buildNarratorPackage(view, cast, { kind: 'decision', mode: 'short', instanceId: 'brak' }),
    NarratorError,
  );
});

test('poprzednia scena wraca do pakietu dla ciągłości', () => {
  let state = recordNarrative(campaign(), {
    kind: 'quarter',
    title: 'Narracja',
    source: 'gemini',
    sections: [{ key: 'scena', title: 'Scena', body: 'Voss odkłada słuchawkę i długo patrzy w okno.' }],
  });
  state.reports.push({
    quarter: '1951-Q1',
    before: { ...state.indicators },
    after: { ...state.indicators },
    kpBefore: 0,
    kpAfter: 0,
    newsCount: 0,
    correctionUnits: 0,
    notes: ['Kwartał bez uwag.'],
  });
  state = { ...state, quarter: { year: 1951, q: 2 } };
  const pkg = buildNarratorPackage(toPlayerView(state), cast, { kind: 'quarter', mode: 'short' });
  assert.match(pkg.prompt, /Twoja poprzednia scena.*Voss odkłada słuchawkę/);
});

test('odpowiedź: sekcje według nagłówków, bez wstępu i znaczników', () => {
  const reply = [
    'Jasne, oto narracja:',
    '',
    '## SCENA',
    'Deszcz bębni o parapet. **Voss** kładzie teczkę na biurku.',
    '',
    '— Mój zespół potrzebuje decyzji do piątku.',
    '',
    '## PRASA',
    'The Atlantic Courier: *Rakiety nad pustynią*',
    'Dwa zdania.',
    '',
    '**KULUARY**',
    'Na trzecim piętrze mówi się o budżecie.',
  ].join('\n');
  const { sections, warnings } = parseNarratorReply(reply, QUARTER_SECTIONS);
  assert.deepEqual(
    sections.map((s) => [s.key, s.title]),
    [
      ['scena', 'Scena'],
      ['prasa', 'Prasa'],
      ['kuluary', 'Kuluary'],
    ],
  );
  assert.equal(
    sections[0]!.body,
    'Deszcz bębni o parapet. Voss kładzie teczkę na biurku.\n\n— Mój zespół potrzebuje decyzji do piątku.',
  );
  assert.match(sections[1]!.body, /Rakiety nad pustynią\nDwa zdania\./);
  assert.deepEqual(warnings, ['Pominąłem wstęp sprzed pierwszej sekcji.']);
});

test('odpowiedź bez nagłówków trafia do jednej sekcji; brakujące sekcje dają uwagę', () => {
  const plain = parseNarratorReply('Sam tekst bez sekcji.', QUARTER_SECTIONS);
  assert.equal(plain.sections.length, 1);
  assert.equal(plain.sections[0]!.title, 'Narracja');
  assert.equal(plain.warnings.length, 1);
  const partial = parseNarratorReply('## SCENA\nTekst.', QUARTER_SECTIONS);
  assert.match(partial.warnings.join(' '), /Brakuje sekcji: PRASA, KULUARY/);
  const voices = parseNarratorReply('## GŁOS: gen. Harlan Voss\nA.\n\n## GŁOS: Dorothy Ames\nB.', ['GŁOS']);
  assert.deepEqual(
    voices.sections.map((s) => s.title),
    ['GŁOS: gen. Harlan Voss', 'GŁOS: Dorothy Ames'],
  );
  assert.deepEqual(voices.warnings, []);
});

test('odpowiedź jest niezaufana: limity długości i sekcji, znaki sterujące, pusta treść', () => {
  assert.throws(() => parseNarratorReply('   \n  '), ReplyError);
  const long = parseNarratorReply(`## SCENA\n${'a'.repeat(REPLY_MAX_CHARS + 500)}`);
  assert.ok(long.sections[0]!.body.length <= 6001);
  assert.match(long.warnings.join(' '), /za długa/);
  const many = parseNarratorReply(Array.from({ length: 12 }, (_, i) => `## S${i}\ntekst`).join('\n'));
  assert.equal(many.sections.length, REPLY_MAX_SECTIONS);
  const odd = parseNarratorReply('## SCENA\nTekst\u0000 z ‮ukrytym​ znakiem <script>alert(1)</script>');
  assert.equal(
    odd.sections[0]!.body,
    'Tekst z ukrytym znakiem <script>alert(1)</script>',
    'HTML zostaje zwykłym tekstem',
  );
});
