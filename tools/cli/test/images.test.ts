import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ImageEntry } from '@dse/core';
import {
  commonsQueryUrl,
  downloadImages,
  isPublicDomain,
  parseCommonsResponse,
  pickCandidate,
  stripHtml,
} from '../src/images.ts';

const entry: ImageEntry = {
  id: 'proba',
  file: 'proba.jpg',
  commons: ['File:Nie ma.jpg', 'File:Cudze.jpg', 'File:Ivy Mike - mushroom cloud.jpg'],
  caption: 'Próba',
  for: ['lot'],
};

/** Odpowiedź API Commons w kształcie formatversion=2: brakujący plik, plik na CC BY-SA i plik rządu USA. */
const response = {
  query: {
    normalized: [{ from: 'File:Ivy Mike - mushroom cloud.jpg', to: 'File:Ivy Mike - mushroom cloud.jpg' }],
    pages: [
      { title: 'File:Nie ma.jpg', missing: true },
      {
        title: 'File:Cudze.jpg',
        imageinfo: [
          {
            thumburl: 'https://upload.wikimedia.org/thumb/cudze.jpg',
            descriptionurl: 'https://commons.wikimedia.org/wiki/File:Cudze.jpg',
            thumbmime: 'image/jpeg',
            extmetadata: { LicenseShortName: { value: 'CC BY-SA 4.0' }, Artist: { value: 'Ktoś' } },
          },
        ],
      },
      {
        title: 'File:Ivy Mike - mushroom cloud.jpg',
        imageinfo: [
          {
            thumburl: 'https://upload.wikimedia.org/thumb/ivy.jpg',
            descriptionurl: 'https://commons.wikimedia.org/wiki/File:Ivy_Mike_-_mushroom_cloud.jpg',
            thumbmime: 'image/jpeg',
            extmetadata: {
              LicenseShortName: { value: 'Public domain' },
              Artist: { value: '<a href="https://example.org">U.S. Department of Energy</a>' },
            },
          },
        ],
      },
    ],
  },
};

test('licencje: tylko domena publiczna i CC0', () => {
  for (const ok of ['Public domain', 'PD', 'PD-USGov', 'CC0', 'CC0 1.0', 'No restrictions'])
    assert.ok(isPublicDomain(ok), ok);
  for (const no of ['CC BY-SA 3.0', 'CC BY 4.0', 'GFDL', 'Fair use', '', 'Copyrighted'])
    assert.ok(!isPublicDomain(no), no);
  assert.equal(stripHtml('<a href="x">NASA</a> &amp; <b>USAF</b>&nbsp;'), 'NASA & USAF');
});

test('wybór pliku: pierwszy tytuł, który istnieje i jest w domenie publicznej', () => {
  const files = parseCommonsResponse(response);
  assert.equal(files.size, 2, 'brakujący plik nie trafia do wyniku');
  const picked = pickCandidate(entry, files);
  assert.ok('file' in picked);
  assert.equal(picked.file.title, 'File:Ivy Mike - mushroom cloud.jpg');
  assert.equal(picked.file.artist, 'U.S. Department of Energy');

  const none = pickCandidate({ ...entry, commons: ['File:Nie ma.jpg', 'File:Cudze.jpg'] }, files);
  assert.ok('reasons' in none);
  assert.match(none.reasons.join('\n'), /nie ma takiego pliku/);
  assert.match(none.reasons.join('\n'), /CC BY-SA 4\.0.*to nie domena publiczna/);
  const png = pickCandidate({ ...entry, file: 'proba.png', commons: ['File:Ivy Mike - mushroom cloud.jpg'] }, files);
  assert.ok('reasons' in png, 'format pliku musi zgadzać się z nazwą w manifeście');
  assert.match(commonsQueryUrl(entry.commons), /titles=File%3ANie\+ma\.jpg%7CFile%3ACudze\.jpg%7C/);
});

test('pobieranie: zapisuje plik i źródła, nie pobiera drugi raz, nie pobiera cudzych licencji', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'dse-zdjecia-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const calls: string[] = [];
  const fake = (async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    if (url.includes('api.php')) return new Response(JSON.stringify(response), { status: 200 });
    return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), { status: 200 });
  }) as typeof fetch;
  const lines: string[] = [];
  const options = { fetch: fake, log: (l: string) => lines.push(l), pauseMs: 0 };
  const blocked: ImageEntry = { ...entry, id: 'cudze', file: 'cudze.jpg', commons: ['File:Cudze.jpg'] };

  const first = await downloadImages(dir, [entry, blocked], options);
  assert.deepEqual(first, { saved: 1, present: 0, skipped: 1 });
  assert.deepEqual((await readdir(join(dir, 'images/pliki'))).sort(), ['proba.jpg', 'zrodla.json']);
  const credits = JSON.parse(await readFile(join(dir, 'images/pliki/zrodla.json'), 'utf8')) as Record<string, object>;
  assert.deepEqual(credits['proba.jpg'], {
    title: 'File:Ivy Mike - mushroom cloud.jpg',
    artist: 'U.S. Department of Energy',
    license: 'Public domain',
    source: 'https://commons.wikimedia.org/wiki/File:Ivy_Mike_-_mushroom_cloud.jpg',
  });
  assert.ok(!calls.includes('https://upload.wikimedia.org/thumb/cudze.jpg'), 'plik z inną licencją nie jest pobierany');
  assert.match(lines.join('\n'), /pominięte\s+cudze\.jpg/);

  const second = await downloadImages(dir, [entry], options);
  assert.deepEqual(second, { saved: 0, present: 1, skipped: 0 });
});
