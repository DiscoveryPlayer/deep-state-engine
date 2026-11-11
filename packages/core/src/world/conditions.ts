/**
 * Ocena warunków i stosowanie skutków systemu wydarzeń świata.
 * Czyste funkcje: dostają stan, zwracają wynik albo nowy fragment stanu.
 */
import type { GameState, WorldState } from '../state/schema.ts';
import { parseQuarterCode, quartersBetween, quarterCode, type Quarter } from '../time.ts';
import { ERA_IDS } from './schema.ts';
import type { ComparisonOp, Condition, Effect, WorldContent } from './schema.ts';

export function compare(a: number, op: ComparisonOp, b: number): boolean {
  switch (op) {
    case '<':
      return a < b;
    case '<=':
      return a <= b;
    case '>':
      return a > b;
    case '>=':
      return a >= b;
    case '==':
      return a === b;
    case '!=':
      return a !== b;
  }
}

/** Czy wątek (po identyfikatorze treści) przeszedł dany etap albo wybrał daną gałąź. */
function threadHistoryMatches(world: WorldState, threadDef: string, stage: string, branch?: string): boolean {
  for (const inst of Object.values(world.threads)) {
    if (inst.def !== threadDef) continue;
    if (inst.history.some((h) => h.stage === stage && (branch === undefined || h.branch === branch))) return true;
  }
  return false;
}

export function evaluateCondition(cond: Condition, state: GameState): boolean {
  const world = state.world;
  if ('all' in cond) return cond.all.every((c) => evaluateCondition(c, state));
  if ('any' in cond) return cond.any.some((c) => evaluateCondition(c, state));
  if ('not' in cond) return !evaluateCondition(cond.not, state);
  if ('var' in cond) return compare(world.vars[cond.var] ?? 0, cond.op, cond.value);
  if ('indicator' in cond) return compare(state.indicators[cond.indicator], cond.op, cond.value);
  if ('divergence' in cond) return compare(world.divergence[cond.divergence] ?? 0, cond.op, cond.value);
  if ('after' in cond) return quartersBetween(parseQuarterCode(cond.after), state.quarter) >= 0;
  if ('before' in cond) return quartersBetween(state.quarter, parseQuarterCode(cond.before)) > 0;
  if ('flag' in cond) return world.flags.includes(cond.flag);
  if ('stage' in cond) {
    const [thread, stage] = cond.stage.split('.') as [string, string];
    return threadHistoryMatches(world, thread, stage);
  }
  if ('era' in cond) return compare(ERA_IDS.indexOf(state.organization.era), cond.op, ERA_IDS.indexOf(cond.era));
  const [thread, stage, branch] = cond.branch.split('.') as [string, string, string];
  return threadHistoryMatches(world, thread, stage, branch);
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Stosuje skutki do stanu (mutuje przekazaną kopię — wywołujący odpowiada za klonowanie).
 * `source` trafia do wpisów Korekt, żeby było wiadomo, skąd się wzięły.
 */
export function applyEffects(
  state: GameState,
  effects: readonly Effect[],
  content: WorldContent,
  source: string,
): void {
  const world = state.world;
  for (const e of effects) {
    if ('var' in e) {
      const def = content.definition.variables.find((v) => v.id === e.var);
      const current = world.vars[e.var] ?? def?.initial ?? 0;
      let next = e.set ?? current;
      if (e.add !== undefined) next += e.add;
      world.vars[e.var] = def ? clamp(next, def.min, def.max) : next;
    } else if ('indicator' in e) {
      const range = e.indicator === 'NG' ? [1, 5] : [0, 100];
      state.indicators[e.indicator] = clamp(state.indicators[e.indicator] + e.add, range[0]!, range[1]!);
    } else if ('divergence' in e) {
      world.divergence[e.divergence] = clamp((world.divergence[e.divergence] ?? 0) + e.add, 0, DIVERGENCE_MAX);
    } else if ('faction' in e) {
      const f = state.factions[e.faction];
      if (f) f.disposition = clamp(f.disposition + e.disposition, -3, 3);
    } else if ('currency' in e) {
      state.currencies.KP = clamp(state.currencies.KP + e.add, 0, 20);
    } else if ('flag' in e) {
      if (!world.flags.includes(e.flag)) world.flags.push(e.flag);
    } else if ('clearFlag' in e) {
      world.flags = world.flags.filter((f) => f !== e.clearFlag);
    } else {
      world.corrections.push({
        from: quarterCode(state.quarter),
        quarters: e.correction.quarters,
        units: e.correction.units,
        reason: e.correction.reason,
        source,
      });
    }
  }
}

/** Rozbieżność regionu ma zakres 0–10 (decyzja 0015). */
export const DIVERGENCE_MAX = 10;

/** Pomocnicze: kwartał przesunięty o n (n może być ujemne). */
export function shiftQuarter(q: Quarter, n: number): Quarter {
  const index = q.year * 4 + (q.q - 1) + n;
  return { year: Math.floor(index / 4), q: ((index % 4) + 1) as Quarter['q'] };
}
