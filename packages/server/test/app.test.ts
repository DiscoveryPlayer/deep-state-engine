import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
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

  // Bramka zapisu: dopóki kwartał czeka na zapis KSP, Biurko jest zamknięte.
  assert.equal(desk.view.kspGate.status, 'pending');
  assert.equal((await post(base, '/api/campaigns/proba/action', { action: 'konferencja' })).status, 409);
  assert.equal((await post(base, '/api/campaigns/proba/close-quarter', {})).status, 409);
  const skipped = (await (await post(base, '/api/campaigns/proba/ksp-skip', {})).json()) as DeskPayload;
  assert.equal(skipped.view.kspGate.status, 'skipped');

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
  assert.deepEqual(next.view.kspGate, { quarter: '1951-Q2', status: 'pending' }, 'nowy kwartał znów czeka na zapis');
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
  assert.match(desk.messages[0]!, /Wczytano zapis.*Nowe starty: 1/);
  assert.equal(desk.view.kspGate.status, 'loaded');

  // Start z zapisu dostaje numer misji, depeszę i Raport Misji do wypełnienia.
  assert.deepEqual(
    desk.view.flights.map((f) => [f.id, f.vessel, f.site, f.report ?? null]),
    [['M-1951-01', 'Solstice 1', 'us_cape_canaveral', null]],
  );
  const filed = await post(base, '/api/campaigns/ksp/flight', {
    flightId: 'M-1951-01',
    outcome: 'partial',
    purpose: 'science',
    classification: 'confidential',
    note: 'Telemetria urwała się w 40. sekundzie.',
  });
  assert.equal(filed.status, 200);
  const afterReport = (await filed.json()) as DeskPayload;
  assert.equal(afterReport.view.flights[0]!.report!.purpose, 'science');
  const news = afterReport.view.worldNews.find((n) => n.topic === 'lot')!;
  assert.match(news.text, /częściowy sukces.*naukowe.*lot poufny.*Telemetria/);
  assert.match(news.card ?? '', /^W\d+$/, 'lot jest kartą wydarzenia w tym kwartale');
  assert.equal(
    (
      await post(base, '/api/campaigns/ksp/flight', {
        flightId: 'M-1951-09',
        outcome: 'success',
        purpose: 'test',
        classification: 'public',
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await post(base, '/api/campaigns/ksp/flight', {
        flightId: 'M-1951-01',
        outcome: 'cud',
        purpose: 'test',
        classification: 'public',
      })
    ).status,
    400,
  );

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
  await post(base, '/api/campaigns/proba/ksp-skip', {});
  assert.equal((await post(base, '/api/campaigns/proba/action', { action: 'przewrot' })).status, 400);
  assert.equal((await post(base, '/api/campaigns/proba/dilemma', { instanceId: 'x', optionId: 'y' })).status, 409);
  const page = await fetch(`${base}/`);
  assert.match(page.headers.get('content-security-policy') ?? '', /default-src 'self'/);
});

test('nowa kampania: wierność historii z formularza trafia do widoku', async (t) => {
  const { base } = await startApp(t);
  const low = (await (
    await post(base, '/api/campaigns', { id: 'niska', seed: 'x', historyFidelity: 'low' })
  ).json()) as DeskPayload;
  assert.equal(low.view.historyFidelity, 'low');
  const def = (await (await post(base, '/api/campaigns', { id: 'domyslna', seed: 'x' })).json()) as DeskPayload;
  assert.equal(def.view.historyFidelity, 'high');
  assert.equal((await post(base, '/api/campaigns', { id: 'zla', seed: 'x', historyFidelity: 'zero' })).status, 400);
  assert.ok(def.regions.length >= 5, 'Tablica sytuacyjna ma regiony świata');
});

test('narrator: pakiet do skopiowania i wklejona odpowiedź', async (t) => {
  const { base } = await startApp(t);
  await post(base, '/api/campaigns', { id: 'opowiesc', seed: 'PACE-1951' });
  await post(base, '/api/campaigns/opowiesc/ksp-skip', {});
  const pkgRes = await post(base, '/api/campaigns/opowiesc/narrator-package', { kind: 'quarter', mode: 'full' });
  assert.equal(pkgRes.status, 200);
  const pkg = (await pkgRes.json()) as { title: string; prompt: string };
  assert.match(pkg.prompt, /ZADANIE: NARRACJA KWARTAŁU/);

  const reply = '## SCENA\nDeszcz nad Potomakiem.\n\n## PRASA\nKurier: Nagłówek\nZdanie.\n\n## KULUARY\nCisza.';
  const res = await post(base, '/api/campaigns/opowiesc/narrator-reply', {
    kind: 'quarter',
    source: 'claude',
    text: reply,
  });
  assert.equal(res.status, 200);
  const desk = (await res.json()) as DeskPayload;
  assert.equal(desk.view.narrative.length, 1);
  assert.equal(desk.view.narrative[0]!.sections.length, 3);
  assert.equal(desk.view.narrative[0]!.source, 'claude');
  assert.deepEqual(desk.messages, ['Narracja wczytana.']);
  // Narracja nie zmienia stanu gry (zasada Z3).
  const before = (await (await fetch(`${base}/api/campaigns/opowiesc`)).json()) as DeskPayload;
  assert.deepEqual(before.view.indicators, desk.view.indicators);

  assert.equal(
    (await post(base, '/api/campaigns/opowiesc/narrator-reply', { kind: 'quarter', source: 'claude', text: '  ' }))
      .status,
    422,
  );
  assert.equal(
    (
      await post(base, '/api/campaigns/opowiesc/narrator-reply', {
        kind: 'decision',
        instanceId: 'brak',
        source: 'gemini',
        text: 'x',
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await post(base, '/api/campaigns/opowiesc/narrator-package', {
        kind: 'decision',
        mode: 'short',
        instanceId: 'brak',
      })
    ).status,
    409,
  );
  assert.equal(
    (await post(base, '/api/campaigns/opowiesc/narrator-reply', { kind: 'quarter', source: 'obcy', text: 'x' })).status,
    400,
  );
});

test('usuwanie kampanii: wymaga potwierdzenia nazwą, plik trafia do kosza', async (t) => {
  const { base, dir } = await startApp(t);
  await post(base, '/api/campaigns', { id: 'stara', seed: 'x' });
  await post(base, '/api/campaigns', { id: 'nowa', seed: 'y' });
  assert.equal((await post(base, '/api/campaigns/stara/delete', { confirm: 'nowa' })).status, 400);
  assert.equal(
    (await post(base, '/api/campaigns/stara/delete', { confirm: 'stara' }, { Origin: 'http://obca.example' })).status,
    403,
  );
  const res = await post(base, '/api/campaigns/stara/delete', { confirm: 'stara' });
  assert.equal(res.status, 200);
  const body = (await res.json()) as { deleted: string; trashed: string };
  assert.equal(body.deleted, 'stara');
  const list = (await (await fetch(`${base}/api/campaigns`)).json()) as { id: string; historyFidelity: string }[];
  assert.deepEqual(
    list.map((c) => c.id),
    ['nowa'],
  );
  assert.equal(list[0]!.historyFidelity, 'high');
  assert.deepEqual(await readdir(join(dir, 'usuniete')), [body.trashed]);
  assert.match(body.trashed, /^stara\.\d{8}T\d{6}\.json$/);
  assert.equal((await fetch(`${base}/api/campaigns/stara`)).status, 404);
  assert.equal((await post(base, '/api/campaigns/stara/delete', { confirm: 'stara' })).status, 404);
});

test('narrator: warstwa ukryta tylko na życzenie, zapis do pliku, scena wydarzenia', async (t) => {
  const { base, dir } = await startApp(t);
  await post(base, '/api/campaigns', { id: 'gra', seed: 'PACE-1951' });
  await post(base, '/api/campaigns/gra/ksp-skip', {});
  const ask = async (body: object) =>
    (await (await post(base, '/api/campaigns/gra/narrator-package', body)).json()) as {
      prompt: string | null;
      secret: boolean;
      file: string | null;
      chars: number;
    };

  const open = await ask({ kind: 'quarter', mode: 'full' });
  assert.equal(open.secret, false);
  assert.ok(!open.prompt!.includes('WARSTWA UKRYTA'));
  assert.ok(open.prompt!.includes('[W1]'), 'wydarzenia mają kody kart');

  const sealed = await ask({ kind: 'quarter', mode: 'full', secrets: true });
  assert.equal(sealed.secret, true);
  assert.ok(sealed.prompt!.includes('WARSTWA UKRYTA'));
  assert.match(sealed.prompt!, /Anderson jej nie zna/);

  const saved = await ask({ kind: 'quarter', mode: 'short', secrets: true, toFile: true });
  assert.equal(saved.prompt, null, 'pakiet zapisany do pliku nie wraca do przeglądarki');
  assert.equal(saved.file, join(dir, 'pakiety', 'gra', '1951-Q1-kwartal.md'));
  assert.equal((await readFile(saved.file!, 'utf8')).length, saved.chars);

  // Scena do karty wydarzenia trafia do narracji z kodem karty.
  const scene = await ask({ kind: 'event', mode: 'short', card: 'W1' });
  assert.match(scene.prompt!, /WYDARZENIE \[W1\]/);
  const reply = await post(base, '/api/campaigns/gra/narrator-reply', {
    kind: 'event',
    card: 'W1',
    source: 'gemini',
    text: '## SCENA\nDalekopis stuka od świtu.',
  });
  const desk = (await reply.json()) as DeskPayload;
  assert.deepEqual(
    desk.view.narrative.map((n) => [n.kind, n.ref, n.sections[0]!.body]),
    [['event', 'W1', 'Dalekopis stuka od świtu.']],
  );
  assert.equal(
    (await post(base, '/api/campaigns/gra/narrator-package', { kind: 'event', mode: 'short', card: 'W99' })).status,
    409,
  );
});

test('zdjęcia: tylko pliki z manifestu, które są na dysku', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'dse-zdjecia-'));
  const content = await loadContent(join(ROOT, 'data'));
  const image = {
    id: 'proba',
    file: 'proba.jpg',
    commons: ['File:Proba.jpg'],
    caption: 'Podpis próbny',
    for: ['korea', 'lot'],
  };
  const missing = { ...image, id: 'brak', file: 'brak.jpg', for: ['abadan'] };
  await writeFile(join(dir, 'proba.jpg'), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  await writeFile(
    join(dir, 'zrodla.json'),
    JSON.stringify({ 'proba.jpg': { artist: 'U.S. Army', license: 'Public domain' } }),
  );
  await writeFile(join(dir, 'tajne.txt'), 'nie dla przeglądarki');
  const server = createApp({
    content: { ...content, images: [image, missing] },
    store: new CampaignStore(join(dir, 'kampanie')),
    assets: new Map(),
    imagesDir: dir,
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  t.after(async () => {
    await new Promise((done) => server.close(done));
    await rm(dir, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  const desk = (await (await post(base, '/api/campaigns', { id: 'foto', seed: 'x' })).json()) as DeskPayload;
  assert.deepEqual(desk.images, {
    korea: { url: '/obrazy/proba.jpg', caption: 'Podpis próbny', credit: 'U.S. Army, Public domain' },
    lot: { url: '/obrazy/proba.jpg', caption: 'Podpis próbny', credit: 'U.S. Army, Public domain' },
  });
  const ok = await fetch(`${base}/obrazy/proba.jpg`);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get('content-type'), 'image/jpeg');
  assert.equal((await fetch(`${base}/obrazy/brak.jpg`)).status, 404);
  assert.equal((await fetch(`${base}/obrazy/tajne.txt`)).status, 404, 'plik spoza manifestu nie jest podawany');
  assert.equal((await fetch(`${base}/obrazy/..%2Fzrodla.json`)).status, 404);
});
