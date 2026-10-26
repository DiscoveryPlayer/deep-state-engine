import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rng } from '../src/index.ts';

test('to samo ziarno daje tę samą sekwencję', () => {
  const a = Rng.fromSeed('PACE-1951');
  const b = Rng.fromSeed('PACE-1951');
  for (let i = 0; i < 1000; i++) assert.equal(a.next(), b.next());
});

test('różne ziarna dają różne sekwencje', () => {
  const a = Rng.fromSeed('PACE-1951');
  const b = Rng.fromSeed('PACE-1952');
  const sa = Array.from({ length: 10 }, () => a.next());
  const sb = Array.from({ length: 10 }, () => b.next());
  assert.notDeepEqual(sa, sb);
});

test('generator odtworzony ze stanu kontynuuje dokładnie tę samą sekwencję', () => {
  const a = Rng.fromSeed(42);
  for (let i = 0; i < 37; i++) a.next();
  const saved = JSON.parse(JSON.stringify(a.getState())) as ReturnType<Rng['getState']>;
  const b = Rng.fromState(saved);
  for (let i = 0; i < 500; i++) assert.equal(a.next(), b.next());
});

test('int mieści się w przedziale domkniętym i trafia w oba krańce', () => {
  const r = Rng.fromSeed(7);
  const seen = new Set<number>();
  for (let i = 0; i < 5000; i++) {
    const v = r.int(1, 6);
    assert.ok(v >= 1 && v <= 6);
    seen.add(v);
  }
  assert.deepEqual([...seen].sort(), [1, 2, 3, 4, 5, 6]);
});

test('next zwraca wartości z [0, 1)', () => {
  const r = Rng.fromSeed('x');
  for (let i = 0; i < 10000; i++) {
    const v = r.next();
    assert.ok(v >= 0 && v < 1);
  }
});

test('chance respektuje skrajne prawdopodobieństwa', () => {
  const r = Rng.fromSeed(1);
  for (let i = 0; i < 100; i++) {
    assert.equal(r.chance(0), false);
    assert.equal(r.chance(1), true);
  }
});

test('nieprawidłowe argumenty dają czytelny błąd', () => {
  const r = Rng.fromSeed(1);
  assert.throws(() => r.int(5, 1), /przedział/);
  assert.throws(() => r.pick([]), /pustej/);
});
