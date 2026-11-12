import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import {
  CareerReadError,
  ConfigNodeParseError,
  child,
  children,
  num,
  parseConfigNode,
  readCareerFile,
  serializeConfigNode,
  summarizeCareer,
  toKspSnapshot,
  utToDate,
  utToQuarter,
  value,
} from '../src/index.ts';
import { kspSnapshotSchema } from '@dse/core';

const SAVE = fileURLToPath(new URL('../../../samples/saves/test-27-10-save3.przyciety.sfs', import.meta.url));

test('parser ConfigNode: wartości, węzły zagnieżdżone, powtórzone klucze i komentarze', () => {
  const root = parseConfigNode(`// komentarz
GAME
{
\tTitle = test (CAREER)
\tlinkURL = http://example.org/a//b
\tSCENARIO
\t{
\t\tname = Funding
\t\tfunds = 123.5
\t}
\tSCENARIO
\t{
\t\tname = Pusty
\t}
\tkey = 1
\tkey = 2
}
`);
  const game = child(root, 'GAME')!;
  assert.equal(value(game, 'Title'), 'test (CAREER)');
  assert.equal(value(game, 'linkURL'), 'http://example.org/a//b', '„//” w wartości nie jest komentarzem');
  assert.equal(children(game, 'SCENARIO').length, 2);
  assert.equal(num(children(game, 'SCENARIO')[0], 'funds'), 123.5);
  assert.deepEqual(
    game.values.filter(([k]) => k === 'key').map(([, v]) => v),
    ['1', '2'],
  );
  assert.deepEqual(parseConfigNode(serializeConfigNode(root)), root, 'zapis i ponowny odczyt dają to samo');
});

test('parser ConfigNode: ucięty plik daje błąd z numerem wiersza', () => {
  assert.throws(() => parseConfigNode('GAME\n{\n\tSCENARIO\n\t{\n\t\tname = X\n'), ConfigNodeParseError);
  assert.throws(() => parseConfigNode('}\n'), /bez otwartego węzła \(wiersz 1\)/);
});

test('czas RP-1: sekundy od 1.01.1951 według prawdziwego kalendarza', () => {
  assert.equal(utToDate(0), '1951-01-01');
  assert.equal(utToDate(2_678_400), '1951-02-01');
  assert.equal(utToDate(5_097_600), '1951-03-01', 'luty 1951 ma 28 dni');
  assert.equal(utToQuarter(7_776_000), '1951-Q2');
  assert.equal(utToQuarter(76_696_532), '1953-Q2');
});

test('wyciąg z prawdziwego zapisu kariery RP-1 4.8.1 autora', async () => {
  const c = await readCareerFile(SAVE);
  assert.equal(c.title, 'test-27-10 (CAREER)');
  assert.equal(c.mods.RP0, '4.8.1');
  assert.equal(c.date, '1951-03-09');
  assert.equal(c.quarter, '1951-Q1');
  assert.ok(c.funds > 0 && c.confidence > 0);
  assert.equal(
    c.launchSite,
    'us_cape_canaveral',
    'miejsce startu z zarządzania centrum, gdy KSCSwitcher go nie zapisał',
  );
  assert.ok(c.monthlySalaries > 1000, 'wynagrodzenia z ostatniego pełnego miesiąca');
  assert.deepEqual(
    c.programs.map((p) => p.name),
    ['EarlyXPlanes', 'SuborbRocketResearch'],
  );
  assert.equal(c.launches.length, 1);
  assert.deepEqual(
    { vessel: c.launches[0]!.vessel, date: c.launches[0]!.date, site: c.launches[0]!.site },
    { vessel: 'Solstice 1', date: '1951-03-05', site: 'us_cape_canaveral' },
    'start przypisany do miejsca przez kompleks startowy',
  );
});

test('migawka dla silnika przechodzi schemat stanu i filtruje starty do kwartału', async () => {
  const c = await readCareerFile(SAVE);
  const snap = toKspSnapshot(c, '1951-Q1');
  kspSnapshotSchema.parse({ ...snap, quarter: '1951-Q1' });
  assert.equal(snap.launchesInQuarter.length, 1);
  assert.equal(toKspSnapshot(c, '1951-Q2').launchesInQuarter.length, 0);
});

test('zapis spoza kariery RP-1 daje czytelny błąd', () => {
  assert.throws(() => summarizeCareer(parseConfigNode('GAME\n{\n\tMode = SANDBOX\n}\n'), 'x.sfs'), CareerReadError);
  assert.throws(() => summarizeCareer(parseConfigNode('GAME\n{\n\tMode = CAREER\n}\n'), 'x.sfs'), /dziennika kariery/);
  assert.throws(() => summarizeCareer(parseConfigNode('VESSEL\n{\n}\n'), 'x.craft'), /brak węzła GAME/);
});
