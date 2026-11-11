import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInitialState, quarterCode, serializeState, simulateWorld, toPlayerView } from '@dse/core';
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

test('treść świata z data/events wczytuje się i przechodzi dekadę symulacji', async () => {
  const content = await loadContent(DATA_DIR);
  const world = content.world;
  assert.ok(world, 'brak data/events/world.yaml');
  for (const id of ['abadan', 'korea', 'maccartyzm', 'wybory-1952', 'sukcesja-1953', 'mrg', 'nowe-spojrzenie']) {
    assert.ok(
      world.threads.some((t) => t.id === id),
      `brak wątku ${id}`,
    );
  }
  assert.ok(world.threads.length >= 20, 'treść 1951–1955 ma co najmniej 20 wątków');
  assert.ok(content.launchSites && content.launchSites.length === 31, 'lista miejsc startu z instalacji autora');
  assert.ok(world.patterns.length >= 30);
  assert.ok(world.dilemmas.length >= 6);
  for (const seed of ['PACE-1951', 'A', 'B', 'C', 'D']) {
    const start = createInitialState(content, { id: 't', seed });
    const { state } = simulateWorld(start, world, { to: '1960-Q4', decisions: 'random' });
    assert.equal(quarterCode(state.quarter), '1961-Q1');
    assert.ok(state.world.threads.korea?.history.length, 'wątek koreański się rozstrzygnął');
    const view = JSON.stringify(toPlayerView(state));
    for (const e of state.world.log.filter((x) => x.visibility === 'secret')) {
      assert.ok(!view.includes(e.text), `tajny wpis w widoku gracza: ${e.ref}`);
    }
  }
});

test('błąd w pliku wątku daje komunikat z nazwą pliku', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dse-content-'));
  await cp(DATA_DIR, dir, { recursive: true });
  const file = join(dir, 'events/threads/korea.yaml');
  const original = await readFile(file, 'utf8');
  await writeFile(file, original.replace('historical: true', 'historical: tak'));
  await assert.rejects(loadContent(dir), (e: unknown) => {
    assert.ok(e instanceof ContentLoadError);
    assert.match(e.message, /events\/threads\/korea\.yaml/);
    return true;
  });
});
