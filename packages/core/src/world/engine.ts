/**
 * Silnik wydarzeń świata (decyzja 0015, docs/design/wydarzenia-swiata.md).
 *
 * Jeden krok = jeden kwartał. Kolejność:
 *   1. dylematy i decyzje etapów po terminie rozstrzygają się opcją domyślną,
 *   2. startują wątki historyczne i reaktywne, których czas nadszedł,
 *   3. szablony wątków mogą uruchomić nowe instancje,
 *   4. sytuacje trwające naliczają skutki,
 *   5. wątki: pogłoski wywiadu, punkty decyzyjne, rozstrzygnięcie etapów (wybór gałęzi),
 *   6. losują się wzorce,
 *   7. na Biurko mogą trafić nowe dylematy.
 *
 * Gałęzie wybiera SILNIK, nie AI (zasada Z3): waga gałęzi zależy od stanu świata,
 * a losowanie idzie przez Rng z ziarnem zapisanym w stanie, więc wynik jest powtarzalny.
 * AI dostaje potem gotowe wpisy dziennika do opisania.
 */
import { Rng } from '../rng.ts';
import type { GameState, HistoryFidelity, ThreadInstance, WorldLogEntry, WorldState } from '../state/schema.ts';
import { parseQuarterCode, quarterCode, quartersBetween, type Quarter } from '../time.ts';
import { DIVERGENCE_MAX, applyEffects, evaluateCondition, shiftQuarter } from './conditions.ts';
import { PARAM_PLACEHOLDER } from './schema.ts';
import type {
  BranchContent,
  StageContent,
  StageDecision,
  TemplateParamValue,
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

/**
 * Wierność historii (decyzja 0018): mnożnik wag gałęzi niehistorycznych. Wartości dobrane
 * w seriach 300 symulacji 1951–1955 tak, żeby w etapach, w których jest wybór, gałąź
 * historyczna wygrywała średnio w około 90%, 70% i 50% rozstrzygnięć.
 */
export const HISTORY_FIDELITY_ALT_SCALE: Record<HistoryFidelity, number> = { high: 1.4, medium: 5, low: 10 };

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

/**
 * Wagi gałęzi etapu w bieżącym stanie (tylko gałęzie, których warunek `requires` jest spełniony).
 * `choice` to opcja wybrana przez Andersona w punkcie decyzyjnym etapu: przesuwa wagi gałęzi.
 */
export function branchWeights(
  stage: StageContent,
  region: string,
  state: GameState,
  choice?: string,
): WeightedBranch[] {
  const d = state.world.divergence[region] ?? 0;
  const shifts = stage.decision?.options.find((o) => o.id === choice)?.weights ?? {};
  const altScale = HISTORY_FIDELITY_ALT_SCALE[state.campaign.historyFidelity];
  return stage.branches
    .filter((b) => b.requires === undefined || evaluateCondition(b.requires, state))
    .map((b) => {
      const shift = shifts[b.id];
      const base = applyModifiers(b.weight, b.modifiers, state) * (shift?.mul ?? 1) + (shift?.add ?? 0);
      const fidelity = b.historical ? 1 : altScale;
      return { branch: b, weight: Math.max(0, base) * divergenceFactor(b.historical, d) * fidelity };
    });
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
  return text.replace(PARAM_PLACEHOLDER, (m, key: string) => params[key] ?? m);
}

/** Zapisuje wylosowaną wartość parametru: forma podstawowa pod `key`, pozostałe pod `key.forma`. */
function setParam(params: Record<string, string>, key: string, value: TemplateParamValue): void {
  if (typeof value === 'string') {
    params[key] = value;
    return;
  }
  const forms = Object.keys(value).sort();
  params[key] = value.mian ?? value[forms[0]!]!;
  for (const form of forms) params[`${key}.${form}`] = value[form]!;
}

const later = (a: Quarter, b: Quarter) => (quartersBetween(a, b) > 0 ? b : a);

interface ThreadDef {
  title: string;
  region: string;
  visibility: 'public' | 'secret';
  stages: StageContent[];
  fromTemplate: boolean;
  /** Czy gałąź niehistoryczna sama podnosi Rozbieżność (tylko wątki historyczne). */
  tracksHistory: boolean;
  exclusiveGroup: string | undefined;
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
    tracksHistory: !inst.fromTemplate && (src as ThreadContent).kind === 'historical',
    exclusiveGroup: src.exclusiveGroup,
  };
}

/** Najwięcej etapów jednego wątku rozstrzyganych w jednym kwartale (`sameQuarter`). */
const MAX_STAGES_PER_QUARTER = 8;

function newInstance(def: string, fromTemplate: boolean, params: Record<string, string>, q: string, stage: string) {
  const inst: ThreadInstance = {
    def,
    fromTemplate,
    params,
    startedIn: q,
    status: 'active',
    stage,
    nextCheck: null,
    history: [],
    rumors: [],
    asked: [],
    decisions: {},
  };
  return inst;
}

/** Czy w regionie trwa już wątek albo szablon z tej samej grupy wyłączności. */
function groupBusy(world: WorldState, content: WorldContent, group: string | undefined, region: string): boolean {
  if (!group) return false;
  return Object.values(world.threads).some((inst) => {
    if (inst.status !== 'active') return false;
    const def = threadDef(inst, content);
    return def?.exclusiveGroup === group && def.region === region;
  });
}

/** Kwartał, w którym etap powinien się rozstrzygnąć (historyczny albo przesunięty od startu szablonu). */
function stageDue(def: ThreadDef, stageIndex: number, inst: ThreadInstance): Quarter {
  const stage = def.stages[stageIndex]!;
  if (stage.at) return parseQuarterCode(stage.at);
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
    const inst = newInstance(t.id, false, {}, q, t.stages[0]!.id);
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
    // Bezpieczniki (Dossier III, część I, punkt 4): przypadek historyczny trwa albo grupa zajęta.
    if (tpl.historicalInstances.some((id) => world.threads[id]?.status === 'active')) continue;
    if (groupBusy(world, content, tpl.exclusiveGroup, tpl.region)) continue;
    const p =
      chance(tpl.chancePerQuarter, tpl.chanceModifiers, state) *
      divergenceFactor(false, world.divergence[tpl.region] ?? 0);
    if (!rng.chance(Math.min(1, p))) continue;
    const params: Record<string, string> = {};
    for (const key of Object.keys(tpl.params).sort()) setParam(params, key, rng.pick(tpl.params[key]!));
    world.seq += 1;
    const instanceId = `${tpl.id}#${world.seq}`;
    const inst = newInstance(tpl.id, true, params, q, tpl.stages[0]!.id);
    inst.nextCheck = quarterCode(later(now, stageDue(threadDef(inst, content)!, 0, inst)));
    world.threads[instanceId] = inst;
    world.templateLog[tpl.id] = { count: (record?.count ?? 0) + 1, last: q };
  }

  const endSituation = (sit: WorldState['situations'][number]) => {
    world.situations = world.situations.filter((x) => x.id !== sit.id);
    log({
      quarter: q,
      kind: 'situation',
      ref: `${sit.thread}.${sit.stage}.${sit.branch}`,
      title: `Koniec sytuacji: ${sit.title}`,
      text: 'Sytuacja wygasła i nie obciąża już kolejnych kwartałów.',
      visibility: 'public',
    });
  };

  // 4. Sytuacje trwające: skutki co kwartał, od kwartału po starcie.
  for (const sit of [...world.situations]) {
    const inst = world.threads[sit.thread];
    const def = inst ? threadDef(inst, content) : undefined;
    const ongoing = def?.stages.find((st) => st.id === sit.stage)?.branches.find((b) => b.id === sit.branch)?.ongoing;
    const passed = sit.until !== null && inst?.history.some((h) => h.stage === sit.until);
    const over = !inst || !ongoing || inst.status === 'ended' || passed || sit.remaining <= 0;
    if (over) {
      endSituation(sit);
      continue;
    }
    if (sit.startedIn === q) continue;
    applyEffects(state, ongoing.effects, content, `${sit.thread}.${sit.stage}.${sit.branch}.sytuacja`);
    sit.remaining -= 1;
  }

  // 5. Wątki: pogłoski, punkty decyzyjne, rozstrzygnięcie etapów.
  for (const instanceId of Object.keys(world.threads).sort()) {
    const inst = world.threads[instanceId]!;
    const def = threadDef(inst, content);
    if (!def) continue;

    for (let guard = 0; guard < MAX_STAGES_PER_QUARTER; guard++) {
      if (inst.status !== 'active' || inst.nextCheck === null || inst.stage === null) break;
      const stageIndex = def.stages.findIndex((s) => s.id === inst.stage);
      const stage = def.stages[stageIndex];
      if (!stage) break;
      const wait = quartersBetween(now, parseQuarterCode(inst.nextCheck));

      // Pogłoska wywiadu: wychodzi przed etapem. Gdy etap już nadszedł, jest za późno.
      if (stage.rumor && !inst.rumors.includes(stage.id) && wait <= stage.rumor.quartersBefore) {
        inst.rumors.push(stage.id);
        if (wait > 0) {
          world.seq += 1;
          state.knowledge.assessments.push({
            id: `ocena-${world.seq}`,
            topic: fill(stage.rumor.topic ?? def.title, inst.params),
            text: fill(stage.rumor.text, inst.params),
            source: stage.rumor.source,
            reliability: stage.rumor.reliability,
            credibility: stage.rumor.credibility,
            quarter: q,
          });
        }
      }

      // Punkt decyzyjny: sprawa trafia na Biurko przed etapem. Etap czeka co najmniej kwartał.
      if (stage.decision && !inst.asked.includes(stage.id) && wait <= stage.decision.quartersBefore) {
        inst.asked.push(stage.id);
        const due = later(shiftQuarter(now, 1), parseQuarterCode(inst.nextCheck));
        inst.nextCheck = quarterCode(due);
        raiseStageDecision(world, def, instanceId, inst, stage.id, stage.decision, q, quarterCode(due));
        log({
          quarter: q,
          kind: 'dilemma',
          ref: `${inst.def}.${stage.id}`,
          title: fill(stage.decision.title ?? `${def.title}: decyzja`, inst.params),
          text: 'Sprawa trafia na Biurko Dowódcy Operacyjnego.',
          visibility: 'public',
        });
        break;
      }
      if (wait > 0) break;
      // Decyzja etapu jeszcze czeka (termin nie minął) — etap się nie rozstrzyga.
      if (world.pendingDilemmas.some((p) => p.source?.thread === instanceId && p.source.stage === stage.id)) break;

      const branch = pickBranch(branchWeights(stage, def.region, state, inst.decisions[stage.id]), rng);
      if (!branch) {
        // Żadna gałąź nie spełnia warunków (`requires`): w tym świecie etap nie ma sensu,
        // więc wątek po cichu przechodzi dalej.
        const skipTo = def.stages.slice(stageIndex + 1).find((s) => !s.alternative);
        if (!skipTo) {
          inst.status = 'ended';
          inst.stage = null;
          inst.nextCheck = null;
          break;
        }
        inst.stage = skipTo.id;
        inst.nextCheck = skipTo.sameQuarter
          ? q
          : quarterCode(later(now, stageDue(def, def.stages.indexOf(skipTo), inst)));
        continue;
      }
      const ref = `${inst.def}.${stage.id}.${branch.id}`;

      applyEffects(state, branch.effects, content, ref);
      // Rozbieżność rośnie, gdy świat ODCHODZI od historii: w etapie z gałęzią historyczną
      // wypadła inna. W etapie alternatywnym historii już nie ma, więc nie liczy się drugi raz
      // (taki etap może podnieść Rozbieżność jawnie, skutkiem `divergence`).
      if (!branch.historical && !branch.minor && def.tracksHistory && !stage.alternative) {
        world.divergence[def.region] = Math.min(
          DIVERGENCE_MAX,
          (world.divergence[def.region] ?? 0) + DIVERGENCE_PER_NONHISTORICAL_BRANCH,
        );
      }
      inst.history.push({ quarter: q, stage: stage.id, branch: branch.id, historical: branch.historical });
      // Sytuacje trwające, które miały wygasnąć po tym etapie, kończą się od razu.
      for (const sit of world.situations.filter((x) => x.thread === instanceId && x.until === stage.id)) {
        endSituation(sit);
      }
      const kind = def.fromTemplate ? 'template' : 'thread';
      log({
        quarter: q,
        kind,
        ref,
        title: fill(`${def.title}: ${stage.title}`, inst.params),
        text: fill(branch.text, inst.params),
        visibility: branch.visibility ?? def.visibility,
        historical: branch.historical,
      });
      for (const [i, reaction] of branch.reactions.entries()) {
        applyEffects(state, reaction.effects, content, `${ref}.reakcja-${i + 1}`);
        log({
          quarter: q,
          kind: 'reaction',
          ref: `${ref}.reakcja-${i + 1}`,
          actor: reaction.actor,
          title: fill(`${def.title}: ${reaction.actor}`, inst.params),
          text: fill(reaction.text, inst.params),
          visibility: reaction.visibility ?? branch.visibility ?? def.visibility,
        });
      }
      if (branch.ongoing) {
        world.seq += 1;
        world.situations.push({
          id: `sytuacja-${world.seq}`,
          thread: instanceId,
          stage: stage.id,
          branch: branch.id,
          title: fill(branch.ongoing.title, inst.params),
          text: fill(branch.ongoing.text, inst.params),
          startedIn: q,
          until: branch.ongoing.until ?? null,
          remaining: branch.ongoing.maxQuarters,
        });
        log({
          quarter: q,
          kind: 'situation',
          ref: `${ref}.sytuacja`,
          title: fill(`Sytuacja: ${branch.ongoing.title}`, inst.params),
          text: fill(branch.ongoing.text, inst.params),
          visibility: 'public',
        });
      }

      if (branch.delayQuarters !== undefined) {
        inst.nextCheck = quarterCode(shiftQuarter(now, branch.delayQuarters));
        break;
      }
      // Bez `next` wątek idzie do najbliższego etapu, który nie jest alternatywny:
      // do etapów alternatywnych prowadzi tylko jawne `next`.
      const nextId = branch.next ?? def.stages.slice(stageIndex + 1).find((s) => !s.alternative)?.id ?? 'end';
      const nextIndex = def.stages.findIndex((s) => s.id === nextId);
      if (nextId === 'end' || nextIndex === -1) {
        inst.status = 'ended';
        inst.stage = null;
        inst.nextCheck = null;
        break;
      }
      const nextStage = def.stages[nextIndex]!;
      inst.stage = nextId;
      if (nextStage.sameQuarter) {
        // Kilka depesz w jednym kwartale: następny etap rozstrzyga się od razu.
        inst.nextCheck = q;
        continue;
      }
      let due = stageDue(def, nextIndex, inst);
      if (branch.advanceNext !== undefined) due = shiftQuarter(due, -branch.advanceNext);
      inst.nextCheck = quarterCode(later(shiftQuarter(now, 1), due));
      // Pogłoska i decyzja następnego etapu mogą wyjść jeszcze w tym kwartale.
    }
  }

  // 6. Wzorce.
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

  // 7. Dylematy.
  for (const dil of [...content.dilemmas].sort((a, b) => a.id.localeCompare(b.id))) {
    // Limit dotyczy dylematów samodzielnych; decyzje etapów wątków są poza nim.
    if (world.pendingDilemmas.filter((p) => !p.source).length >= content.definition.maxPendingDilemmas) break;
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

function raiseStageDecision(
  world: WorldState,
  def: ThreadDef,
  instanceId: string,
  inst: ThreadInstance,
  stageId: string,
  decision: StageDecision,
  q: string,
  expiresIn: string,
): void {
  world.seq += 1;
  world.pendingDilemmas.push({
    instanceId: `dylemat-${world.seq}`,
    dilemma: `${inst.def}.${stageId}`,
    title: fill(decision.title ?? `${def.title}: decyzja`, inst.params),
    prompt: fill(decision.prompt, inst.params),
    options: decision.options.map((o) => ({ id: o.id, title: o.title })),
    defaultOption: decision.defaultOption,
    raisedIn: q,
    expiresIn,
    source: { thread: instanceId, stage: stageId },
  });
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

  let title: string;
  let effects: Parameters<typeof applyEffects>[1];
  let inaction: Parameters<typeof applyEffects>[1];
  let text: string;
  let optionTitle: string;
  let params: Record<string, string> = {};
  if (pending.source) {
    // Punkt decyzyjny etapu wątku: wybór zapisuje się w instancji i przesunie wagi gałęzi.
    const inst = world.threads[pending.source.thread];
    const def = inst ? threadDef(inst, content) : undefined;
    const decision = def?.stages.find((s) => s.id === pending.source!.stage)?.decision;
    const option = decision?.options.find((o) => o.id === optionId);
    if (!inst || !decision || !option) throw new Error(`Decyzja "${pending.dilemma}" nie ma opcji "${optionId}".`);
    inst.decisions[pending.source.stage] = option.id;
    params = inst.params;
    title = pending.title;
    effects = option.effects;
    inaction = decision.inactionEffects;
    text = option.text;
    optionTitle = option.title;
  } else {
    const dil = content.dilemmas.find((d) => d.id === pending.dilemma);
    const option = dil?.options.find((o) => o.id === optionId);
    if (!dil || !option) throw new Error(`Dylemat "${pending.dilemma}" nie ma opcji "${optionId}".`);
    title = dil.title;
    effects = option.effects;
    inaction = dil.inactionEffects;
    text = option.text;
    optionTitle = option.title;
  }
  applyEffects(state, effects, content, `${pending.dilemma}.${optionId}`);
  if (byDefault) applyEffects(state, inaction, content, `${pending.dilemma}.biernosc`);
  world.pendingDilemmas = world.pendingDilemmas.filter((p) => p.instanceId !== instanceId);
  log({
    quarter: quarterCode(state.quarter),
    kind: 'dilemma',
    ref: `${pending.dilemma}.${optionId}`,
    title: `${title}: ${optionTitle}${byDefault ? ' (bez decyzji Dowódcy)' : ''}`,
    text: fill(text, params),
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
