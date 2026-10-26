import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInitialState, serializeState, toPlayerView } from '@dse/core';
import { ContentLoadError, loadContent } from '../src/index.ts';

const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../../data');

test('treść w folderze data/ jest poprawna i daje stan startowy 1951', async () => {
  const content = await loadContent(DATA_DIR);
  assert.equal(content.factions.length, 6);
  assert.deepEqual(
    content.factions.map((f) => f.id),
    ['DPO', 'BAS', 'RN', 'BLZ', 'PRZ', 'DOI'],
  );
  const state = createInitialState(content, { id: 'pace-1951', seed: 'PACE-1951' });
  assert.equal(state.organization.fullName, 'Pan-Atlantic Commission for Experimentation');
  assert.equal(state.quarter.year, 1951);
});

test('hak BAS na Brandta i jego przeszłość są ukryte przed graczem', async () => {
  const state = createInitialState(await loadContent(DATA_DIR), { id: 't', seed: 's' });
  const view = JSON.stringify(toPlayerView(state));
  assert.ok(!view.includes('przeszlosc_wojenna'));
  assert.ok(!view.includes('wojenną przeszłość'));
  assert.ok(serializeState(state).includes('przeszlosc_wojenna'), 'w warstwie faktycznej cecha musi istnieć');
});

test('błąd w YAML daje komunikat z nazwą pliku i ścieżką pola', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dse-content-'));
  await cp(DATA_DIR, dir, { recursive: true });
  const original = await readFile(join(DATA_DIR, 'campaign.yaml'), 'utf8');
  await writeFile(join(dir, 'campaign.yaml'), original.replace('ZW: 55', 'ZW: 155'));
  await assert.rejects(loadContent(dir), (e: unknown) => {
    assert.ok(e instanceof ContentLoadError);
    assert.match(e.message, /campaign\.yaml \[indicators\.ZW\]/);
    return true;
  });
});

test('brakujący plik jest zgłaszany', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dse-content-'));
  await assert.rejects(loadContent(dir), /campaign\.yaml \[\(plik\)\]/);
});
