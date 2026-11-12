/**
 * Symulacja świata przez wiele kwartałów — do testów, do strojenia treści i do polecenia
 * `dse swiat`. W kampanii kwartał przesuwa pętla tury; tu robi to sama symulacja.
 */
import { Rng } from '../rng.ts';
import type { GameState, WorldLogEntry } from '../state/schema.ts';
import { nextQuarter, parseQuarterCode, quarterCode, quartersBetween } from '../time.ts';
import { advanceWorld, resolveDilemma } from './engine.ts';
import type { WorldContent } from './schema.ts';

/**
 * Jak symulacja odpowiada na dylematy:
 *   default — Anderson nie decyduje, więc po terminie silnik przyjmuje opcję domyślną,
 *   random  — Anderson wybiera losowo (osobny generator, żeby nie mieszać losowań świata).
 */
export type DilemmaPolicy = 'default' | 'random';

export interface SimulateOptions {
  /** Ostatni kwartał symulacji włącznie, np. "1960-Q4". */
  to: string;
  decisions?: DilemmaPolicy;
  /** Ziarno generatora decyzji dla polityki `random`. */
  decisionSeed?: string;
}

export interface SimulatedQuarter {
  quarter: string;
  entries: WorldLogEntry[];
}

/**
 * Rozlicza świat od kwartału stanu do `to` włącznie. Po ostatnim kwartale stan wskazuje
 * kwartał następny (tak jak po zamknięciu tury). Nie zmienia przekazanego stanu.
 */
export function simulateWorld(
  input: GameState,
  content: WorldContent,
  options: SimulateOptions,
): { state: GameState; quarters: SimulatedQuarter[] } {
  const end = parseQuarterCode(options.to);
  const policy = options.decisions ?? 'default';
  const decider = Rng.fromSeed(options.decisionSeed ?? `${input.campaign.seed}/decyzje`);
  let state = input;
  const quarters: SimulatedQuarter[] = [];

  while (quartersBetween(state.quarter, end) >= 0) {
    const step = advanceWorld(state, content);
    state = step.state;
    const entries = [...step.entries];
    if (policy === 'random') {
      for (const p of [...state.world.pendingDilemmas]) {
        const option = decider.pick(p.options);
        const res = resolveDilemma(state, content, p.instanceId, option.id);
        state = res.state;
        entries.push(res.entry);
      }
    }
    quarters.push({ quarter: quarterCode(state.quarter), entries });
    state = { ...state, quarter: nextQuarter(state.quarter) };
  }
  return { state, quarters };
}
