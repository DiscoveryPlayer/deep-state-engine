/**
 * dse — narzędzia wiersza poleceń The Deep State Engine.
 *
 *   npm run dse -- waliduj
 *   npm run dse -- nowa-kampania --ziarno PACE-1951 --wyjscie campaigns/pace-1951.json
 *   npm run dse -- stan campaigns/pace-1951.json [--prawda]
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  ContentError,
  StateLoadError,
  createInitialState,
  deserializeState,
  serializeState,
  toPlayerView,
} from '@dse/core';
import { ContentLoadError, loadContent } from '@dse/content';
import { renderStateReport } from './report.ts';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const DEFAULT_DATA_DIR = resolve(REPO_ROOT, 'data');

const HELP = `The Deep State Engine — narzędzia

Polecenia:
  waliduj [--dane <folder>]
      Sprawdza treść gry w folderze data/.
  nowa-kampania --ziarno <tekst> [--wyjscie <plik>] [--dane <folder>]
      Tworzy stan startowy kampanii (I kw. 1951) i zapisuje go do pliku JSON.
  stan <plik-kampanii> [--prawda]
      Pokazuje stan kampanii tak, jak widzi go Anderson.
      --prawda pokazuje warstwę faktyczną (tylko do testów, psuje mgłę wojny).
`;

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  switch (command) {
    case 'waliduj': {
      const { values } = parseArgs({ args: rest, options: { dane: { type: 'string' } } });
      const content = await loadContent(values.dane ?? DEFAULT_DATA_DIR);
      console.log(
        `Treść poprawna: ${content.factions.length} frakcji, ${content.characters.length} postaci, ` +
          `${content.traits.visible.length + content.traits.hidden.length} cech, ${content.registry.length} wpisów Rejestru.`,
      );
      return 0;
    }
    case 'nowa-kampania': {
      const { values } = parseArgs({
        args: rest,
        options: { ziarno: { type: 'string' }, wyjscie: { type: 'string' }, dane: { type: 'string' } },
      });
      if (!values.ziarno) {
        console.error('Podaj ziarno kampanii, np. --ziarno PACE-1951');
        return 2;
      }
      const content = await loadContent(values.dane ?? DEFAULT_DATA_DIR);
      const id = slug(values.ziarno);
      const state = createInitialState(content, { id, seed: values.ziarno });
      const out = resolve(values.wyjscie ?? resolve(REPO_ROOT, 'campaigns', `${id}.json`));
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, serializeState(state), 'utf8');
      console.log(`Utworzono kampanię "${id}" → ${out}`);
      return 0;
    }
    case 'stan': {
      const { values, positionals } = parseArgs({
        args: rest,
        allowPositionals: true,
        options: { prawda: { type: 'boolean', default: false } },
      });
      const file = positionals[0];
      if (!file) {
        console.error('Podaj plik kampanii, np. campaigns/pace-1951.json');
        return 2;
      }
      const state = deserializeState(await readFile(resolve(file), 'utf8'));
      if (values.prawda) {
        console.log('UWAGA: warstwa faktyczna — zawiera informacje ukryte przed Andersonem.\n');
        console.log(serializeState(state));
      } else {
        console.log(renderStateReport(toPlayerView(state)));
      }
      return 0;
    }
    case undefined:
    case 'pomoc':
    case '--help':
    case '-h':
      console.log(HELP);
      return 0;
    default:
      console.error(`Nieznane polecenie: ${command}\n\n${HELP}`);
      return 2;
  }
}

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'kampania'
  );
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err: unknown) => {
    if (err instanceof ContentLoadError || err instanceof ContentError || err instanceof StateLoadError) {
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  },
);
