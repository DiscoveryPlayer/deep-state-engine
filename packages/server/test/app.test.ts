import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent } from '@dse/content';
import { CampaignStore, createApp, type DeskPayload } from '../src/index.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SAVE = join(ROOT, 'samples/saves/test-27-10-save3.przyciety.sfs');

/** Serwer na wolnym porcie z prawdziwą treścią gry i pustym folderem kampanii. */
async function startApp(t: TestContext): Promise<{ base: string; dir: string }> {
  const dir = await mkdtemp(join(tmpdir(), 'dse-serwer-'));
  const content = await loadContent(join(ROOT, 'data'));
  const assets = new Map([['/index.html', { body: '<!doctype html><title>DSE</title>', type: 'text/html' }]]);
  const server = createApp({ content, store: new CampaignStore(dir), assets });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  t.after(async () => {
    await new Promise((done) => server.close(done));
    await rm(dir, { recursive: true, force: true });
  });
  return { base: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, dir };
}

async function post(base: string, path: string, body: unknown, headers: Record<string, string> = {}) {
  return fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base, ...headers },
    body: JSON.stringify(body),
  });
}

test('kampania: założenie, akcja Biurka, zamknięcie kwartału i kopia zapasowa', async (t) => {
  const { base, dir } = await startApp(t);
  const created = await post(base, '/api/campaigns', { id: 'proba', seed: 'PACE-1951' });
  assert.equal(created.status, 200);
  const desk = (await created.json()) as DeskPayload;
  assert.equal(desk.campaign.quarterCode, '1951-Q1');
  assert.equal(desk.view.currencies.UD, 6);
  assert.ok(desk.launchSites.length > 20);

  const again = await post(base, '/api/campaigns', { id: 'proba', seed: 'x' });
  assert.equal(again.status, 409, 'kampania o tej nazwie już istnieje');

  const action = await post(base, '/api/campaigns/proba/action', { action: 'konferencja' });
  assert.equal(action.status, 200);
  const afterAction = (await action.json()) as DeskPayload;
  assert.ok(afterAction.view.currencies.UD < 6);
  assert.equal(afterAction.messages.length, 1);

  const closed = await post(base, '/api/campaigns/proba/close-quarter', {});
  assert.equal(closed.status, 200);
  const next = (await closed.json()) as DeskPayload;
  assert.equal(next.campaign.quarterCode, '1951-Q2');
  assert.equal(next.view.reports.length, 1);
  assert.deepEqual(await readdir(join(dir, 'kopie')), ['proba.1951-Q1.json']);

  const list = (await (await fetch(`${base}/api/campaigns`)).json()) as { id: string }[];
  assert.deepEqual(
    list.map((c) => c.id),
    ['proba'],
  );
});

test('zapis KSP: wczytanie pliku .sfs i odmowa dla innych plików', async (t) => {
  const { base } = await startApp(t);
  await post(base, '/api/campaigns', { id: 'ksp', seed: 'PACE-1951' });
  const ok = await post(base, '/api/campaigns/ksp/ksp', { path: SAVE });
  assert.equal(ok.status, 200);
  const desk = (await ok.json()) as DeskPayload;
  assert.ok(desk.view.ksp, 'migawka kariery jest w widoku');
  assert.match(desk.messages[0]!, /Wczytano zapis/);

  assert.equal((await post(base, '/api/campaigns/ksp/ksp', { path: join(ROOT, 'package.json') })).status, 400);
  assert.equal((await post(base, '/api/campaigns/ksp/ksp', { path: join(ROOT, 'nie-ma.sfs') })).status, 404);
});

test('obce strony nie mogą sterować kampanią', async (t) => {
  const { base } = await startApp(t);
  await post(base, '/api/campaigns', { id: 'proba', seed: 'PACE-1951' });

  const foreign = await post(base, '/api/campaigns/proba/close-quarter', {}, { Origin: 'http://zla-strona.example' });
  assert.equal(foreign.status, 403);

  const form = await fetch(`${base}/api/campaigns/proba/close-quarter`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: '{}',
  });
  assert.equal(form.status, 415, 'formularz z obcej strony nie przejdzie bez nagłówka JSON');

  const state = (await (await fetch(`${base}/api/campaigns/proba`)).json()) as DeskPayload;
  assert.equal(state.campaign.quarterCode, '1951-Q1', 'odrzucone żądania niczego nie zmieniły');
});

test('błędne dane: identyfikator, nieznana kampania, nieznana akcja', async (t) => {
  const { base } = await startApp(t);
  assert.equal((await post(base, '/api/campaigns', { id: '../zle', seed: 'x' })).status, 400);
  assert.equal((await fetch(`${base}/api/campaigns/brak`)).status, 404);
  await post(base, '/api/campaigns', { id: 'proba', seed: 'PACE-1951' });
  assert.equal((await post(base, '/api/campaigns/proba/action', { action: 'przewrot' })).status, 400);
  assert.equal((await post(base, '/api/campaigns/proba/dilemma', { instanceId: 'x', optionId: 'y' })).status, 409);
  const page = await fetch(`${base}/`);
  assert.match(page.headers.get('content-security-policy') ?? '', /default-src 'self'/);
});
