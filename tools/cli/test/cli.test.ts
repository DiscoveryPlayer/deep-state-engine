import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const MAIN = join(ROOT, 'tools/cli/src/main.ts');
const TSX = join(ROOT, 'node_modules/tsx/dist/cli.mjs');

async function dse(...args: string[]) {
  return run(process.execPath, [TSX, MAIN, ...args], { cwd: ROOT });
}

test('waliduj: treść z data/ jest poprawna', async () => {
  const { stdout } = await dse('waliduj');
  assert.match(stdout, /Treść poprawna: 6 frakcji/);
  assert.match(stdout, /Świat: \d+ regionów/);
});

test('swiat: symulacja dekady bez --prawda nie pokazuje tajnych wpisów ani znaczników historii', async () => {
  const { stdout } = await dse('swiat', '--do', '1960-Q4', '--ziarno', 'PACE-1951');
  assert.match(stdout, /── 1951-Q2/);
  assert.match(stdout, /Wojna w Korei/);
  assert.doesNotMatch(stdout, /TAJNE|zgodnie z historią|ROZEJŚCIE|Rozbieżność/);
  const truth = await dse('swiat', '--do', '1960-Q4', '--ziarno', 'PACE-1951', '--prawda');
  assert.match(truth.stdout, /zgodnie z historią/);
  assert.match(truth.stdout, /Rozbieżność regionów/);
});

test('swiat --serie: statystyka wielu symulacji', async () => {
  const { stdout } = await dse('swiat', '--serie', '20', '--do', '1955-Q4');
  assert.match(stdout, /SERIA: 20 symulacji/);
  assert.match(stdout, /Kryzys irański/);
});

test('nowa-kampania i stan: pełny obieg bez ujawniania warstwy ukrytej', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dse-cli-'));
  const file = join(dir, 'kampania.json');
  await dse('nowa-kampania', '--ziarno', 'PACE-1951', '--wyjscie', file);
  const saved = await readFile(file, 'utf8');
  assert.match(saved, /"schemaVersion": 4/);

  const { stdout } = await dse('stan', file);
  assert.match(stdout, /PACE — Pan-Atlantic Commission for Experimentation/);
  assert.match(stdout, /I kw\. 1951/);
  assert.match(stdout, /Cierpliwość: Rada Naukowa/);
  assert.doesNotMatch(stdout, /przeszlosc_wojenna|kontakt_cia|wojenną przeszłość/);
});

test('ta sama komenda z tym samym ziarnem daje identyczny plik', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dse-cli-'));
  await dse('nowa-kampania', '--ziarno', 'X', '--wyjscie', join(dir, 'a.json'));
  await dse('nowa-kampania', '--ziarno', 'X', '--wyjscie', join(dir, 'b.json'));
  assert.equal(await readFile(join(dir, 'a.json'), 'utf8'), await readFile(join(dir, 'b.json'), 'utf8'));
});
