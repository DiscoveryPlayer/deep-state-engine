import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nextQuarter,
  parseQuarterCode,
  quarterCode,
  quarterLabel,
  quarterOfDate,
  quartersBetween,
} from '../src/index.ts';

test('kod i etykieta kwartału', () => {
  assert.equal(quarterCode({ year: 1951, q: 1 }), '1951-Q1');
  assert.equal(quarterLabel({ year: 1959, q: 3 }), 'III kw. 1959');
  assert.deepEqual(parseQuarterCode('1957-Q4'), { year: 1957, q: 4 });
  assert.throws(() => parseQuarterCode('1957-Q5'));
});

test('przejście przez koniec roku', () => {
  assert.deepEqual(nextQuarter({ year: 1951, q: 4 }), { year: 1952, q: 1 });
  assert.deepEqual(nextQuarter({ year: 1951, q: 2 }), { year: 1951, q: 3 });
});

test('odległość w kwartałach — kampania 1951–1975 to 100 kwartałów', () => {
  assert.equal(quartersBetween({ year: 1951, q: 1 }, { year: 1976, q: 1 }), 100);
});

test('kwartał z daty kalendarzowej', () => {
  assert.deepEqual(quarterOfDate('1951-01-01'), { year: 1951, q: 1 });
  assert.deepEqual(quarterOfDate('1957-10-04'), { year: 1957, q: 4 });
  assert.throws(() => quarterOfDate('1957-13-01'));
});
