import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ContentError,
  StateLoadError,
  createInitialState,
  deserializeState,
  serializeState,
  toPlayerView,
  validateContentReferences,
} from '../src/index.ts';
import { fixtureContent } from './fixture.ts';

const OPTS = { id: 'test', seed: 'PACE-1951' };

test('stan startowy: I kwartał 1951, wskaźniki z treści, zegar Cierpliwości dla każdej frakcji', () => {
  const s = createInitialState(fixtureContent(), OPTS);
  assert.deepEqual(s.quarter, { year: 1951, q: 1 });
  assert.equal(s.indicators.ZW, 55);
  assert.equal(s.organization.acronym, 'PACE');
  assert.equal(s.campaign.rp1Version, '4.7.0.0');
  for (const f of Object.values(s.factions)) {
    const clock = s.clocks.find((c) => c.id === f.patienceClockId);
    assert.ok(clock, `brak zegara cierpliwości dla ${f.id}`);
    assert.equal(clock.segments, 6);
    assert.equal(clock.filled, 0);
  }
});

test('zapis jest kanoniczny i odtwarza stan bit w bit', () => {
  const s = createInitialState(fixtureContent(), OPTS);
  const text = serializeState(s);
  const again = serializeState(deserializeState(text));
  assert.equal(again, text);
});

test('ta sama treść i to samo ziarno dają identyczny stan', () => {
  const a = serializeState(createInitialState(fixtureContent(), OPTS));
  const b = serializeState(createInitialState(fixtureContent(), OPTS));
  assert.equal(a, b);
});

test('zasada Z4: widok gracza nie zawiera warstwy ukrytej', () => {
  const s = createInitialState(fixtureContent(), OPTS);
  const view = toPlayerView(s);
  const text = JSON.stringify(view);

  assert.ok(!text.includes('TAJNA NOTATKA'), 'notatka Mistrza Gry wyciekła do widoku');
  assert.ok(!text.includes('kret'), 'ukryta cecha wyciekła do widoku');
  assert.ok(!text.includes('Ukryty hak'), 'ukryty wpis Rejestru wyciekł do widoku');
  assert.ok(text.includes('Jawna tajemnica'));
  assert.ok(
    !JSON.stringify(view.characters).includes('"loyalty"'),
    'dokładna lojalność postaci nie powinna być widoczna',
  );
  assert.equal(view.characters[0]?.loyaltyBand, 'wrogi');
  assert.equal(
    view.factions.every((f) => f.agenda === null),
    true,
    'agendy są nieznane na starcie',
  );
});

test('ujawniona cecha ukryta pojawia się w widoku gracza', () => {
  const s = createInitialState(fixtureContent(), OPTS);
  s.characters['brandt']!.revealedTraits.push('kret');
  const view = toPlayerView(s);
  assert.deepEqual(view.characters[0]?.revealedTraits, ['kret']);
});

test('walidacja powiązań wyłapuje błędy treści po polsku', () => {
  const c = fixtureContent();
  c.characters[0]!.faction = 'XYZ';
  c.characters[0]!.traits = ['nie_ma_takiej'];
  c.factions[0]!.startAgenda = 'brak';
  const problems = validateContentReferences(c);
  const msgs = problems.map((p) => p.message).join(' | ');
  assert.match(msgs, /frakcja "XYZ" nie istnieje/);
  assert.match(msgs, /cecha jawna "nie_ma_takiej"/);
  assert.match(msgs, /agenda startowa "brak"/);
  assert.throws(() => createInitialState(c, OPTS), ContentError);
});

test('tajemnica bez Ciśnienia jest błędem treści', () => {
  const c = fixtureContent();
  delete c.registry[1]!.pressure;
  assert.match(
    validateContentReferences(c)
      .map((p) => p.message)
      .join(),
    /Ciśnienie/,
  );
});

test('uszkodzony plik kampanii daje czytelny błąd', () => {
  assert.throws(() => deserializeState('{nie json'), StateLoadError);
  assert.throws(() => deserializeState('{"schemaVersion": 99}'), /wersję schematu 99/);
  const s = JSON.parse(serializeState(createInitialState(fixtureContent(), OPTS))) as Record<string, any>;
  s['indicators'].ZW = 140;
  assert.throws(() => deserializeState(JSON.stringify(s)), /indicators\.ZW/);
});
