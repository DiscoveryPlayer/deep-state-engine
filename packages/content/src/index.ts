/**
 * @dse/content — wczytuje treść gry z folderu data/ i sprawdza ją.
 *
 * Błędy zbieramy wszystkie naraz i podajemy po polsku z nazwą pliku i ścieżką pola,
 * żeby literówka w YAML dawała czytelny komunikat, a nie dziwne zachowanie gry.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  CONTENT_FILES,
  WORLD_CONTENT_PATHS,
  dilemmasFileSchema,
  launchSitesContentSchema,
  patternsFileSchema,
  threadContentSchema,
  threadTemplateContentSchema,
  validateContentReferences,
  worldDefinitionSchema,
  type ContentProblem,
  type GameContent,
  type WorldContent,
} from '@dse/core';
import type { ZodType, ZodTypeDef } from 'zod';

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

/** Miejsca startu (decyzja 0016). Plik opcjonalny. */
const LAUNCH_SITES_FILE = 'launch-sites.yaml';

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

function parseWith<T>(
  schema: ZodType<T, ZodTypeDef, unknown>,
  raw: unknown,
  file: string,
  problems: ContentProblem[],
): T | undefined {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    problems.push({ file, where: issue.path.join('.') || '(korzeń)', message: issue.message });
  }
  return undefined;
}

async function yamlFilesIn(dataDir: string, dir: string): Promise<string[]> {
  try {
    const names = await readdir(join(dataDir, dir));
    return names.filter((n) => n.endsWith('.yaml') || n.endsWith('.yml')).sort();
  } catch {
    return [];
  }
}

/**
 * Wczytuje treść świata z data/events/ (decyzja 0015). Brak pliku world.yaml oznacza
 * kampanię bez systemu wydarzeń (np. w starszych folderach danych) — zwraca undefined.
 */
async function loadWorld(dataDir: string, problems: ContentProblem[]): Promise<WorldContent | undefined> {
  const defFile = WORLD_CONTENT_PATHS.definition;
  try {
    await readFile(join(dataDir, defFile), 'utf8');
  } catch {
    return undefined;
  }
  const definition = parseWith(worldDefinitionSchema, await readYaml(dataDir, defFile, problems), defFile, problems);

  const threads: WorldContent['threads'] = [];
  for (const name of await yamlFilesIn(dataDir, WORLD_CONTENT_PATHS.threadsDir)) {
    const file = `${WORLD_CONTENT_PATHS.threadsDir}/${name}`;
    const t = parseWith(threadContentSchema, await readYaml(dataDir, file, problems), file, problems);
    if (t) threads.push(t);
  }
  const templates: WorldContent['templates'] = [];
  for (const name of await yamlFilesIn(dataDir, WORLD_CONTENT_PATHS.templatesDir)) {
    const file = `${WORLD_CONTENT_PATHS.templatesDir}/${name}`;
    const t = parseWith(threadTemplateContentSchema, await readYaml(dataDir, file, problems), file, problems);
    if (t) templates.push(t);
  }
  const optional = async <T>(file: string, schema: ZodType<T, ZodTypeDef, unknown>): Promise<T | undefined> => {
    try {
      await readFile(join(dataDir, file), 'utf8');
    } catch {
      return undefined;
    }
    return parseWith(schema, await readYaml(dataDir, file, problems), file, problems);
  };
  const patterns = (await optional(WORLD_CONTENT_PATHS.patterns, patternsFileSchema))?.patterns ?? [];
  const dilemmas = (await optional(WORLD_CONTENT_PATHS.dilemmas, dilemmasFileSchema))?.dilemmas ?? [];

  if (!definition) return undefined;
  return { definition, threads, templates, patterns, dilemmas };
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

  const world = await loadWorld(dataDir, problems);
  let launchSites: GameContent['launchSites'];
  try {
    await readFile(join(dataDir, LAUNCH_SITES_FILE), 'utf8');
    const raw = await readYaml(dataDir, LAUNCH_SITES_FILE, problems);
    launchSites = parseWith(launchSitesContentSchema, raw, LAUNCH_SITES_FILE, problems)?.sites;
  } catch {
    launchSites = undefined;
  }
  if (launchSites) {
    const seenSites = new Set<string>();
    for (const site of launchSites) {
      if (seenSites.has(site.id))
        problems.push({ file: LAUNCH_SITES_FILE, where: site.id, message: 'powtórzony identyfikator miejsca startu' });
      seenSites.add(site.id);
    }
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
    ...(world ? { world } : {}),
    ...(launchSites ? { launchSites } : {}),
  };

  const refProblems = validateContentReferences(content);
  if (refProblems.length > 0) throw new ContentLoadError(refProblems);
  return content;
}
