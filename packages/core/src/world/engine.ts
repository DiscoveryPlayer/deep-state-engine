/**
 * Silnik wydarzeń świata (decyzja 0015, docs/design/wydarzenia-swiata.md).
 *
 * Jeden krok = jeden kwartał. Kolejność:
 *   1. dylematy po terminie rozstrzygają się opcją domyślną,
 *   2. startują wątki historyczne, których czas nadszedł,
 *   3. szablony wątków mogą uruchomić nowe instancje,
 *   4. wątki rozstrzygają etapy, na które przyszła pora (wybór gałęzi),
 *   5. losują się wzorce,
 *   6. na Biurko mogą trafić nowe dylematy.
 *
 * Gałęzie wybiera SILNIK, nie AI (zasada Z3): waga gałęzi zależy od stanu świata,
 * a losowanie idzie przez Rng z ziarnem zapisanym w stanie, więc wynik jest powtarzalny.
 * AI dostaje potem gotowe wpisy dziennika do opisania.
 */
import { Rng } from '../rng.ts';
import type { GameState, ThreadInstance, WorldLogEntry, WorldState } from '../state/schema.ts';
import { parseQuarterCode, quarterCode, quartersBetween, type Quarter } from '../time.ts';
import { DIVERGENCE_MAX, applyEffects, evaluateCondition, shiftQuarter } from './conditions.ts';
import type {
  BranchContent,
  StageContent,
  ThreadContent,
  ThreadTemplateContent,
  WeightModifier,
  WorldContent,
} from './schema.ts';

// ── Stałe mechaniki Rozbieżności (decyzja 0015) ─────────────────────────────

/** Przy Rozbieżności 0 waga gałęzi historycznej jest mnożona przez tę liczbę; przy 10 — przez 1. */
export const HISTORICAL_BIAS_AT_ZERO = 3;
/** Każdy punkt Rozbieżności mnoży wagę gałęzi niehistorycznej przez (1 + ta liczba). */
export const NONHISTORICAL_BOOST_PER_POINT = 0.15;
/** Wybór gałęzi niehistorycznej sam podnosi Rozbieżność regionu wątku o tyle punktów. */
export const DIVERGENCE_PER_NONHISTORICAL_BRANCH = 1;

/** Uzupełnia brakujące zmienne i regiony wartościami startowymi z treści. Mutuje `world`. */
export function ensureWorldState(world: WorldState, content: WorldContent): WorldState {
  for (const v of content.definition.variables) {
    if (world.vars[v.id] === undefined) world.vars[v.id] = v.initial;
  }
  for (const r of content.definition.regions) {
    if (world.divergence[r.id] === undefined) world.divergence[r.id] = 0;
  }
  return world;
}

function applyModifiers(base: number, modifiers: readonly WeightModifier[], state: GameState): number {
  let mul = 1;
  let add = 0;
  for (const m of modifiers) {
    if (!evaluateCondition(m.when, state)) continue;
    if (m.mul !== undefined) mul *= m.mul;
    if (m.add !== undefined) add += m.add;
  }
  return Math.max(0, base * mul + add);
}

/** Mnożnik Rozbieżności dla gałęzi (historycznej albo nie). */
export function divergenceFactor(historical: boolean, divergence: number): number {
  const d = Math.min(DIVERGENCE_MAX, Math.max(0, divergence));
  return historical
    ? 1 + (HISTORICAL_BIAS_AT_ZERO - 1) * (1 - d / DIVERGENCE_MAX)
    : 1 + NONHISTORICAL_BOOST_PER_POINT * d;
}

export interface WeightedBranch {
  branch: BranchContent;
  weight: number;
}

/** Wagi gałęzi etapu w bieżącym stanie (tylko gałęzie, których warunek `requires` jest spełniony). */
export function branchWeights(stage: StageContent, region: string, state: GameState): WeightedBranch[] {
  const d = state.world.divergence[region] ?? 0;
  return stage.branches
    .filter((b) => b.requires === undefined || evaluateCondition(b.requires, state))
    .map((b) => ({
      branch: b,
      weight: applyModifiers(b.weight, b.modifiers, state) * divergenceFactor(b.historical, d),
    }));
}

function pickBranch(weighted: WeightedBranch[], rng: Rng): BranchContent | undefined {
  if (weighted.length === 0) return undefined;
  if (weighted.length === 1) return weighted[0]!.branch;
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  if (total <= 0) return (weighted.find((w) => w.branch.historical) ?? weighted[0]!).branch;
  let roll = rng.next() * total;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll < 0) return w.branch;
  }
  return weighted[weighted.length - 1]!.branch;
}

function fill(text: string, params: Record<string, string>): string {
  return text.replace(/\{([a-z0-9_]+)\}/g, (m, key: string) => params[key] ?? m);
}

const later = (a: Quarter, b: Quarter) => (quartersBetween(a, b) > 0 ? b : a);

interface ThreadDef {
  title: string;
  region: string;
  visibility: 'public' | 'secret';
  stages: StageContent[];
  fromTemplate: boolean;
}

function threadDef(inst: ThreadInstance, content: WorldContent): ThreadDef | undefined {
  const src: ThreadContent | ThreadTemplateContent | undefined = inst.fromTemplate
    ? content.templates.find((t) => t.id === inst.def)
    : content.threads.find((t) => t.id === inst.def);
  if (!src) return undefined;
  return {
    title: src.title,
    region: src.region,
    visibility: src.visibility,
    stages: src.stages,
    fromTemplate: inst.fromTemplate,
  };
}

/** Kwartał, w którym etap powinien się rozstrzygnąć (historyczny albo przesunięty od startu szablonu). */
function stageDue(def: ThreadDef, stageIndex: number, inst: ThreadInstance): Quarter {
  const stage = def.stages[stageIndex]!;
  if (!def.fromTemplate && stage.at) return parseQuarterCode(stage.at);
  const offset = stage.offset ?? stageIndex;
  return shiftQuarter(parseQuarterCode(inst.startedIn), offset);
}

function chance(base: number, modifiers: readonly WeightModifier[], state: GameState): number {
  return Math.min(1, applyModifiers(base, modifiers, state));
}

function cooldownPassed(last: string | undefined, cooldown: number, now: Quarter): boolean {
  return last === undefined || quartersBetween(parseQuarterCode(last), now) > cooldown;
}

export interface WorldStepResult {
  state: GameState;
  /** Wpisy dziennika z tego kwartału (publiczne i tajne) — materiał dla narratora i CLI. */
  entries: WorldLogEntry[];
}

/** Rozlicza świat w bieżącym kwartale stanu (`state.quarter`). Nie zmienia przekazanego stanu. */
export function advanceWorld(input: GameState, content: WorldContent): WorldStepResult {
  const state = structuredClone(input);
  const world = ensureWorldState(state.world, content);
  const rng = Rng.fromState(state.rng);
  const now = state.quarter;
  const q = quarterCode(now);
  const entries: WorldLogEntry[] = [];

  const log = (entry: WorldLogEntry) => {
    entries.push(entry);
    world.log.push(entry);
    if (entry.visibility === 'public') {
      state.chronicle.push({ quarter: q, text: `${entry.title}. ${entry.text}`, tags: ['swiat', entry.kind] });
    }
  };

  // 1. Dylematy po terminie.
  for (const p of [...world.pendingDilemmas]) {
    if (quartersBetween(parseQuarterCode(p.expiresIn), now) >= 0) {
      resolvePending(state, content, p.instanceId, p.defaultOption, log, true);
    }
  }

  // 2. Start wątków historycznych.
  for (const t of [...content.threads].sort((a, b) => a.id.localeCompare(b.id))) {
    if (world.threads[t.id]) continue;
    if (quartersBetween(parseQuarterCode(t.start.from), now) < 0) continue;
    if (t.start.conditions && !evaluateCondition(t.start.conditions, state)) continue;
    const inst: ThreadInstance = {
      def: t.id,
      fromTemplate: false,
      params: {},
      startedIn: q,
      status: 'active',
      stage: t.stages[0]!.id,
      nextCheck: null,
      history: [],
    };
    const def = threadDef(inst, content)!;
    inst.nextCheck = quarterCode(later(now, stageDue(def, 0, inst)));
    world.threads[t.id] = inst;
  }

  // 3. Szablony wątków.
  for (const tpl of [...content.templates].sort((a, b) => a.id.localeCompare(b.id))) {
    const record = world.templateLog[tpl.id];
    if (record && record.count >= tpl.maxInstances) continue;
    if (!cooldownPassed(record?.last, tpl.cooldownQuarters, now)) continue;
    if (tpl.conditions && !evaluateCondition(tpl.conditions, state)) continue;
    const p =
      chance(tpl.chancePerQuarter, tpl.chanceModifiers, state) *
      divergenceFactor(false, world.divergence[tpl.region] ?? 0);
    if (!rng.chance(Math.min(1, p))) continue;
    const params: Record<string, string> = {};
    for (const key of Object.keys(tpl.params).sort()) params[key] = rng.pick(tpl.params[key]!);
    world.seq += 1;
    const instanceId = `${tpl.id}#${world.seq}`;
    const inst: ThreadInstance = {
      def: tpl.id,
      fromTemplate: true,
      params,
      startedIn: q,
      status: 'active',
      stage: tpl.stages[0]!.id,
      nextCheck: null,
      history: [],
    };
    inst.nextCheck = quarterCode(later(now, stageDue(threadDef(inst, content)!, 0, inst)));
    world.threads[instanceId] = inst;
    world.templateLog[tpl.id] = { count: (record?.count ?? 0) + 1, last: q };
  }

  // 4. Etapy wątków.
  for (const instanceId of Object.keys(world.threads).sort()) {
    const inst = world.threads[instanceId]!;
    if (inst.status !== 'active' || inst.nextCheck === null || inst.stage === null) continue;
    if (quartersBetween(parseQuarterCode(inst.nextCheck), now) < 0) continue;
    const def = threadDef(inst, content);
    if (!def) continue;
    const stageIndex = def.stages.findIndex((s) => s.id === inst.stage);
    const stage = def.stages[stageIndex];
    if (!stage) continue;

    const branch = pickBranch(branchWeights(stage, def.region, state), rng);
    if (!branch) continue;

    applyEffects(state, branch.effects, content, `${inst.def}.${stage.id}.${branch.id}`);
    // Rozbieżność rośnie, gdy świat ODCHODZI od historii: w etapie z gałęzią historyczną
    // wypadła inna. W etapie alternatywnym historii już nie ma, więc nie liczy się drugi raz
    // (taki etap może podnieść Rozbieżność jawnie, skutkiem `divergence`).
    if (!branch.historical && !def.fromTemplate && !stage.alternative) {
      world.divergence[def.region] = Math.min(
        DIVERGENCE_MAX,
        (world.divergence[def.region] ?? 0) + DIVERGENCE_PER_NONHISTORICAL_BRANCH,
      );
    }
    inst.history.push({ quarter: q, stage: stage.id, branch: branch.id, historical: branch.historical });
    log({
      quarter: q,
      kind: def.fromTemplate ? 'template' : 'thread',
      ref: `${inst.def}.${stage.id}.${branch.id}`,
      title: fill(`${def.title}: ${stage.title}`, inst.params),
      text: fill(branch.text, inst.params),
      visibility: branch.visibility ?? def.visibility,
      historical: branch.historical,
    });

    if (branch.delayQuarters !== undefined) {
      inst.nextCheck = quarterCode(shiftQuarter(now, branch.delayQuarters));
      continue;
    }
    // Bez `next` wątek idzie do najbliższego etapu, który nie jest alternatywny:
    // do etapów alternatywnych prowadzi tylko jawne `next`.
    const nextId = branch.next ?? def.stages.slice(stageIndex + 1).find((s) => !s.alternative)?.id ?? 'end';
    const nextIndex = def.stages.findIndex((s) => s.id === nextId);
    if (nextId === 'end' || nextIndex === -1) {
      inst.status = 'ended';
      inst.stage = null;
      inst.nextCheck = null;
      continue;
    }
    let due = stageDue(def, nextIndex, inst);
    if (branch.advanceNext !== undefined) due = shiftQuarter(due, -branch.advanceNext);
    inst.stage = nextId;
    inst.nextCheck = quarterCode(later(shiftQuarter(now, 1), due));
  }

  // 5. Wzorce.
  for (const pat of [...content.patterns].sort((a, b) => a.id.localeCompare(b.id))) {
    const record = world.patternLog[pat.id];
    if (pat.maxTotal !== undefined && (record?.count ?? 0) >= pat.maxTotal) continue;
    if (!cooldownPassed(record?.last, pat.cooldownQuarters, now)) continue;
    if (pat.conditions && !evaluateCondition(pat.conditions, state)) continue;
    if (!rng.chance(chance(pat.chancePerQuarter, pat.chanceModifiers, state))) continue;
    applyEffects(state, pat.effects, content, pat.id);
    world.patternLog[pat.id] = { count: (record?.count ?? 0) + 1, last: q };
    log({ quarter: q, kind: 'pattern', ref: pat.id, title: pat.title, text: pat.text, visibility: pat.visibility });
  }

  // 6. Dylematy.
  for (const dil of [...content.dilemmas].sort((a, b) => a.id.localeCompare(b.id))) {
    if (world.pendingDilemmas.length >= content.definition.maxPendingDilemmas) break;
    if (world.pendingDilemmas.some((p) => p.dilemma === dil.id)) continue;
    const record = world.dilemmaLog[dil.id];
    if (dil.once && record) continue;
    if (!cooldownPassed(record?.last, dil.cooldownQuarters, now)) continue;
    if (dil.conditions && !evaluateCondition(dil.conditions, state)) continue;
    if (!rng.chance(dil.chancePerQuarter)) continue;
    world.seq += 1;
    world.pendingDilemmas.push({
      instanceId: `dylemat-${world.seq}`,
      dilemma: dil.id,
      title: dil.title,
      prompt: dil.prompt,
      options: dil.options.map((o) => ({ id: o.id, title: o.title })),
      defaultOption: dil.defaultOption,
      raisedIn: q,
      expiresIn: quarterCode(shiftQuarter(now, dil.expiresAfterQuarters)),
    });
    world.dilemmaLog[dil.id] = { count: (record?.count ?? 0) + 1, last: q };
    log({
      quarter: q,
      kind: 'dilemma',
      ref: dil.id,
      title: dil.title,
      text: 'Sprawa trafia na Biurko Dowódcy Operacyjnego.',
      visibility: 'public',
    });
  }

  state.rng = rng.getState();
  return { state, entries };
}

function resolvePending(
  state: GameState,
  content: WorldContent,
  instanceId: string,
  optionId: string,
  log: (e: WorldLogEntry) => void,
  byDefault: boolean,
): void {
  const world = state.world;
  const pending = world.pendingDilemmas.find((p) => p.instanceId === instanceId);
  if (!pending) throw new Error(`Nie ma oczekującego dylematu "${instanceId}".`);
  const dil = content.dilemmas.find((d) => d.id === pending.dilemma);
  const option = dil?.options.find((o) => o.id === optionId);
  if (!dil || !option) throw new Error(`Dylemat "${pending.dilemma}" nie ma opcji "${optionId}".`);
  applyEffects(state, option.effects, content, `${dil.id}.${option.id}`);
  world.pendingDilemmas = world.pendingDilemmas.filter((p) => p.instanceId !== instanceId);
  log({
    quarter: quarterCode(state.quarter),
    kind: 'dilemma',
    ref: `${dil.id}.${option.id}`,
    title: `${dil.title}: ${option.title}${byDefault ? ' (bez decyzji Dowódcy)' : ''}`,
    text: option.text,
    visibility: 'public',
  });
}

/** Decyzja Andersona w sprawie dylematu. Zwraca nowy stan. */
export function resolveDilemma(
  input: GameState,
  content: WorldContent,
  instanceId: string,
  optionId: string,
): { state: GameState; entry: WorldLogEntry } {
  const state = structuredClone(input);
  let entry: WorldLogEntry | undefined;
  resolvePending(
    state,
    content,
    instanceId,
    optionId,
    (e) => {
      entry = e;
      state.world.log.push(e);
      state.chronicle.push({ quarter: e.quarter, text: `${e.title}. ${e.text}`, tags: ['swiat', 'dilemma'] });
    },
    false,
  );
  return { state, entry: entry! };
}
