/**
 * Zapis i odczyt stanu kampanii.
 *
 * Zapis jest kanoniczny: klucze obiektów są sortowane, więc ten sam stan zawsze
 * daje identyczny tekst. Dzięki temu porównanie dwóch zapisów (np. w Git albo
 * w teście determinizmu) pokazuje tylko prawdziwe zmiany.
 */
import { migrateState, StateMigrationError } from './migrate.ts';
import { gameStateSchema, type GameState } from './schema.ts';

export function serializeState(state: GameState): string {
  return JSON.stringify(sortKeys(state), null, 2) + '\n';
}

export class StateLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateLoadError';
  }
}

export function deserializeState(text: string): GameState {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new StateLoadError(`Plik kampanii nie jest poprawnym JSON: ${(e as Error).message}`);
  }
  try {
    raw = migrateState(raw);
  } catch (e) {
    if (e instanceof StateMigrationError) throw new StateLoadError(e.message);
    throw e;
  }
  const result = gameStateSchema.safeParse(raw);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  • ${i.path.join('.') || '(korzeń)'}: ${i.message}`);
    throw new StateLoadError(`Plik kampanii nie przechodzi walidacji:\n${lines.join('\n')}`);
  }
  return result.data;
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = sortKeys(v);
    }
    return out;
  }
  return value;
}
