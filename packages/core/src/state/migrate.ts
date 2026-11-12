/**
 * Migracje stanu kampanii między wersjami schematu (decyzja 0015 i kolejne).
 *
 * Kampania właściwa potrwa miesiące, a aplikacja będzie się w tym czasie zmieniać
 * (Plan Budowy v2, 2.7). Każde podniesienie STATE_SCHEMA_VERSION dopisuje tu jeden krok
 * i test na zamrożonym stanie poprzedniej wersji.
 */
import { STATE_SCHEMA_VERSION, emptyWorldState } from './schema.ts';

type RawState = Record<string, unknown> & { schemaVersion: number };

/** Kroki migracji: klucz to wersja źródłowa, wynik ma wersję o jeden wyższą. */
const STEPS: Record<number, (s: RawState) => RawState> = {
  /** 1 → 2: dodany stan świata. Zmienne i Rozbieżność uzupełni silnik z treści przy pierwszym kwartale. */
  1: (s) => ({ ...s, schemaVersion: 2, world: emptyWorldState() }),
  /**
   * 2 → 3: wątki głębokie, budżet, Biurko, raporty, migawki KSP, status kampanii (decyzja 0017).
   * Istniejące instancje wątków dostają puste listy pogłosek i decyzji.
   */
  2: (s) => {
    const world = { ...((s.world ?? emptyWorldState()) as Record<string, unknown>) };
    const threads: Record<string, unknown> = {};
    for (const [id, inst] of Object.entries((world.threads ?? {}) as Record<string, Record<string, unknown>>)) {
      threads[id] = { rumors: [], asked: [], decisions: {}, ...inst };
    }
    world.threads = threads;
    world.situations ??= [];
    return {
      ...s,
      schemaVersion: 3,
      world,
      budget: { ledger: [] },
      desk: {
        log: [],
        restBonus: 0,
        opening: { ...(s.indicators as object), KP: (s.currencies as { KP: number }).KP },
      },
      reports: [],
      ksp: { snapshots: [] },
      status: 'active',
    };
  },
};

STEPS[3] = (s) => ({
  // 3 → 4: wierność historii w ustawieniach kampanii i narracja (decyzja 0018).
  // Starsze kampanie dostają wierność wysoką, najbliższą dotychczasowemu zachowaniu świata.
  ...s,
  schemaVersion: 4,
  campaign: { historyFidelity: 'high', ...(s.campaign as object) },
  narrative: { entries: [] },
});

export class StateMigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateMigrationError';
  }
}

/** Zwraca stan w bieżącej wersji schematu albo rzuca błąd, gdy migracja jest niemożliwa. */
export function migrateState(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw;
  let s = raw as RawState;
  if (typeof s.schemaVersion !== 'number') return raw;
  if (s.schemaVersion > STATE_SCHEMA_VERSION) {
    throw new StateMigrationError(
      `Plik kampanii ma wersję schematu ${s.schemaVersion}, nowszą niż silnik (${STATE_SCHEMA_VERSION}). Zaktualizuj aplikację.`,
    );
  }
  while (s.schemaVersion < STATE_SCHEMA_VERSION) {
    const step = STEPS[s.schemaVersion];
    if (!step) throw new StateMigrationError(`Brak kroku migracji z wersji ${s.schemaVersion}.`);
    s = step(s);
  }
  return s;
}
