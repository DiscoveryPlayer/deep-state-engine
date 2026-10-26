/**
 * @dse/content — wczytuje treść gry z folderu data/ i sprawdza ją.
 *
 * Błędy zbieramy wszystkie naraz i podajemy po polsku z nazwą pliku i ścieżką pola,
 * żeby literówka w YAML dawała czytelny komunikat, a nie dziwne zachowanie gry.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { CONTENT_FILES, validateContentReferences, type ContentProblem, type GameContent } from '@dse/core';

export class ContentLoadError extends Error {
  readonly problems: ContentProblem[];

  constructor(problems: ContentProblem[]) {
    super(
      `Nie udało się wczytać treści gry (${problems.length} problem(ów)):\n` +
        problems.map((p) => `  • ${p.file} [${p.where}]: ${p.message}`).join('\n'),
    );
    this.name = 'ContentLoadError';
    this.problems = problems;
  }
}

type FileKey = keyof typeof CONTENT_FILES;

async function readYaml(dataDir: string, file: string, problems: ContentProblem[]): Promise<unknown> {
  let text: string;
  try {
    text = await readFile(join(dataDir, file), 'utf8');
  } catch {
    problems.push({ file, where: '(plik)', message: 'brak pliku albo nie da się go odczytać' });
    return undefined;
  }
  try {
    return parseYaml(text);
  } catch (e) {
    problems.push({ file, where: '(składnia YAML)', message: (e as Error).message.split('\n')[0] ?? 'błąd składni' });
    return undefined;
  }
}

/** Wczytuje i waliduje całą treść gry. Rzuca ContentLoadError z pełną listą problemów. */
export async function loadContent(dataDir: string): Promise<GameContent> {
  const problems: ContentProblem[] = [];
  const parsed: Partial<Record<FileKey, unknown>> = {};

  for (const key of Object.keys(CONTENT_FILES) as FileKey[]) {
    const { file, schema } = CONTENT_FILES[key];
    const raw = await readYaml(dataDir, file, problems);
    if (raw === undefined) continue;
    const result = schema.safeParse(raw);
    if (!result.success) {
      for (const issue of result.error.issues) {
        problems.push({ file, where: issue.path.join('.') || '(korzeń)', message: issue.message });
      }
      continue;
    }
    parsed[key] = result.data;
  }

  if (problems.length > 0) throw new ContentLoadError(problems);

  const p = parsed as {
    campaign: GameContent['campaign'];
    factions: { factions: GameContent['factions'] };
    traits: GameContent['traits'];
    characters: { characters: GameContent['characters'] };
    registry: { entries: GameContent['registry'] };
  };
  const content: GameContent = {
    campaign: p.campaign,
    factions: p.factions.factions,
    traits: p.traits,
    characters: p.characters.characters,
    registry: p.registry.entries,
  };

  const refProblems = validateContentReferences(content);
  if (refProblems.length > 0) throw new ContentLoadError(refProblems);
  return content;
}
