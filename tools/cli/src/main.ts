/**
 * dse — narzędzia wiersza poleceń The Deep State Engine.
 *
 *   npm run dse -- waliduj
 *   npm run dse -- nowa-kampania --ziarno PACE-1951 --wyjscie campaigns/pace-1951.json
 *   npm run dse -- stan campaigns/pace-1951.json [--prawda]
 *   npm run dse -- swiat --do 1960-Q4 --ziarno PACE-1951 [--prawda] [--serie 200]
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
  parseQuarterCode,
  quartersBetween,
  serializeState,
  simulateWorld,
  toPlayerView,
  type DilemmaPolicy,
} from '@dse/core';
import { ContentLoadError, loadContent } from '@dse/content';
import { renderStateReport } from './report.ts';
import { renderWorldRun, renderWorldSeries } from './world.ts';

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
  swiat [--od <kwartał>] [--do <kwartał>] [--ziarno <tekst>] [--decyzje domyslne|losowe]
        [--prawda] [--serie <N>] [--dane <folder>]
      Symuluje wydarzenia świata od I kw. 1951 do kwartału --do (domyślnie 1960-Q4).
      --od ukrywa wpisy sprzed podanego kwartału (symulacja i tak liczy się od 1951).
      --decyzje: domyslne (Anderson nie decyduje, silnik przyjmuje opcję domyślną)
                 albo losowe (Anderson wybiera losowo).
      --prawda pokazuje tajne wpisy, gałęzie historyczne i stan świata na koniec.
      --serie N liczy N symulacji z różnymi ziarnami i pokazuje statystykę.
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
      if (content.world) {
        const w = content.world;
        console.log(
          `Świat: ${w.definition.regions.length} regionów, ${w.definition.variables.length} zmiennych, ` +
            `${w.threads.length} wątków, ${w.templates.length} szablonów, ${w.patterns.length} wzorców, ` +
            `${w.dilemmas.length} dylematów.`,
        );
      }
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
    case 'swiat': {
      const { values } = parseArgs({
        args: rest,
        options: {
          od: { type: 'string' },
          do: { type: 'string', default: '1960-Q4' },
          ziarno: { type: 'string', default: 'PACE-1951' },
          decyzje: { type: 'string', default: 'domyslne' },
          prawda: { type: 'boolean', default: false },
          serie: { type: 'string' },
          dane: { type: 'string' },
        },
      });
      const policies: Record<string, DilemmaPolicy> = { domyslne: 'default', losowe: 'random' };
      const decisions = policies[values.decyzje];
      if (!decisions) {
        console.error('--decyzje przyjmuje "domyslne" albo "losowe"');
        return 2;
      }
      for (const code of [values.do, values.od]) {
        if (code !== undefined && !/^\d{4}-Q[1-4]$/.test(code)) {
          console.error(`Nieprawidłowy kwartał "${code}" — użyj postaci 1951-Q1`);
          return 2;
        }
      }
      const content = await loadContent(values.dane ?? DEFAULT_DATA_DIR);
      if (!content.world) {
        console.error('Brak treści świata (data/events/world.yaml).');
        return 1;
      }
      const world = content.world;
      const run = (seed: string) =>
        simulateWorld(createInitialState(content, { id: slug(seed), seed }), world, { to: values.do, decisions });

      if (values.serie !== undefined) {
        const n = Number.parseInt(values.serie, 10);
        if (!Number.isInteger(n) || n < 1) {
          console.error('--serie wymaga dodatniej liczby całkowitej');
          return 2;
        }
        const finals = Array.from({ length: n }, (_, i) => run(`${values.ziarno}#${i + 1}`).state);
        console.log(renderWorldSeries(finals, world));
        return 0;
      }

      const { state, quarters } = run(values.ziarno);
      const from = values.od ? parseQuarterCode(values.od) : undefined;
      const shown = from ? quarters.filter((q) => quartersBetween(from, parseQuarterCode(q.quarter)) >= 0) : quarters;
      if (values.prawda) console.log('UWAGA: warstwa faktyczna — zawiera informacje ukryte przed Andersonem.\n');
      console.log(`Świat 1951-Q1 – ${values.do} · ziarno "${values.ziarno}" · decyzje: ${values.decyzje}\n`);
      console.log(renderWorldRun(shown, state, world, values.prawda));
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
