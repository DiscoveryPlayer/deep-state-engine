/**
 * Walidacja powiązań w treści świata: odwołania do etapów, gałęzi, zmiennych,
 * regionów i frakcji. Komunikaty po polsku, z nazwą pliku i miejscem.
 */
import type { ContentProblem } from '../content/validate.ts';
import type { Condition, Effect, StageContent, TemplateParamValue, WorldContent } from './schema.ts';
import { PARAM_PLACEHOLDER, WORLD_CONTENT_PATHS } from './schema.ts';

export function validateWorldContent(world: WorldContent, factionIds: ReadonlySet<string>): ContentProblem[] {
  const problems: ContentProblem[] = [];
  const add = (file: string, where: string, message: string) => problems.push({ file, where, message });

  const regions = new Set(world.definition.regions.map((r) => r.id));
  const vars = new Set(world.definition.variables.map((v) => v.id));

  // Mapa wątek → etap → gałęzie (do sprawdzania odwołań stage/branch).
  const threadStages = new Map<string, Map<string, Set<string>>>();
  for (const t of world.threads) {
    const stages = new Map<string, Set<string>>();
    for (const s of t.stages) stages.set(s.id, new Set(s.branches.map((b) => b.id)));
    threadStages.set(t.id, stages);
  }

  const seen = new Map<string, string>();
  const claim = (id: string, file: string) => {
    const prev = seen.get(id);
    if (prev) add(file, id, `identyfikator "${id}" jest już użyty w ${prev}`);
    else seen.set(id, file);
  };

  const checkCondition = (c: Condition | undefined, file: string, where: string) => {
    if (!c) return;
    if ('all' in c) return c.all.forEach((x, i) => checkCondition(x, file, `${where}.all[${i}]`));
    if ('any' in c) return c.any.forEach((x, i) => checkCondition(x, file, `${where}.any[${i}]`));
    if ('not' in c) return checkCondition(c.not, file, `${where}.not`);
    if ('var' in c && !vars.has(c.var)) add(file, where, `nieznana zmienna świata "${c.var}"`);
    if ('divergence' in c && !regions.has(c.divergence)) add(file, where, `nieznany region "${c.divergence}"`);
    if ('stage' in c) {
      const [t, s] = c.stage.split('.');
      if (!threadStages.get(t ?? '')?.has(s ?? '')) add(file, where, `odwołanie do nieistniejącego etapu "${c.stage}"`);
    }
    if ('branch' in c) {
      const [t, s, b] = c.branch.split('.');
      if (
        !threadStages
          .get(t ?? '')
          ?.get(s ?? '')
          ?.has(b ?? '')
      )
        add(file, where, `odwołanie do nieistniejącej gałęzi "${c.branch}"`);
    }
  };

  const checkEffects = (effects: readonly Effect[], file: string, where: string) => {
    effects.forEach((e, i) => {
      const w = `${where}.effects[${i}]`;
      if ('var' in e) {
        if (!vars.has(e.var)) add(file, w, `nieznana zmienna świata "${e.var}"`);
        if (e.add === undefined && e.set === undefined) add(file, w, 'skutek zmiennej potrzebuje "add" albo "set"');
      }
      if ('divergence' in e && !regions.has(e.divergence)) add(file, w, `nieznany region "${e.divergence}"`);
      if ('faction' in e && !factionIds.has(e.faction)) add(file, w, `nieznana frakcja "${e.faction}"`);
    });
  };

  const checkStages = (
    stages: readonly StageContent[],
    file: string,
    owner: string,
    mode: 'historical' | 'anchor' | 'template',
    params: ReadonlySet<string>,
  ) => {
    const stageIds = new Set<string>();
    for (const s of stages) {
      if (stageIds.has(s.id)) add(file, `${owner}.${s.id}`, 'powtórzony identyfikator etapu');
      stageIds.add(s.id);
    }
    for (const s of stages) {
      const where = `${owner}.${s.id}`;
      if (mode !== 'template' && !s.at) add(file, where, 'etap wątku historycznego potrzebuje daty "at"');
      if (mode !== 'historical' && s.alternative) add(file, where, '"alternative" ma sens tylko w wątku historycznym');
      if (mode === 'template' && s.at) add(file, where, 'etap szablonu używa "offset", nie "at"');
      if (mode === 'anchor' && s.branches.length !== 1) add(file, where, 'kotwica ma dokładnie jedną gałąź w etapie');
      if (mode === 'historical' && !s.alternative && !s.branches.some((b) => b.historical))
        add(file, where, 'etap wątku historycznego potrzebuje gałęzi historycznej');
      if (!s.branches.some((b) => b.requires === undefined))
        add(file, where, 'co najmniej jedna gałąź musi być dostępna bez warunku "requires"');
      const branchIds = new Set<string>();
      for (const b of s.branches) {
        const bw = `${where}.${b.id}`;
        if (branchIds.has(b.id)) add(file, bw, 'powtórzony identyfikator gałęzi');
        branchIds.add(b.id);
        if (b.next !== undefined && b.next !== 'end' && !stageIds.has(b.next))
          add(file, bw, `"next" wskazuje nieistniejący etap "${b.next}"`);
        if (b.delayQuarters !== undefined && b.next !== undefined)
          add(file, bw, 'gałąź opóźniona ("delayQuarters") nie może mieć "next"');
        checkCondition(b.requires, file, `${bw}.requires`);
        b.modifiers.forEach((m, i) => checkCondition(m.when, file, `${bw}.modifiers[${i}]`));
        checkEffects(b.effects, file, bw);
        for (const m of b.text.matchAll(PARAM_PLACEHOLDER)) {
          if (!params.has(m[1]!)) add(file, bw, `tekst używa nieznanego parametru "{${m[1]}}"`);
        }
      }
    }
  };

  for (const t of world.threads) {
    const file = `${WORLD_CONTENT_PATHS.threadsDir}/${t.id}.yaml`;
    claim(t.id, file);
    if (!regions.has(t.region)) add(file, t.id, `nieznany region "${t.region}"`);
    checkCondition(t.start.conditions, file, `${t.id}.start`);
    checkStages(t.stages, file, t.id, t.kind, new Set());
  }

  for (const tpl of world.templates) {
    const file = `${WORLD_CONTENT_PATHS.templatesDir}/${tpl.id}.yaml`;
    claim(tpl.id, file);
    if (!regions.has(tpl.region)) add(file, tpl.id, `nieznany region "${tpl.region}"`);
    checkCondition(tpl.conditions, file, `${tpl.id}.conditions`);
    tpl.chanceModifiers.forEach((m, i) => checkCondition(m.when, file, `${tpl.id}.chanceModifiers[${i}]`));
    const placeholders = templatePlaceholders(tpl.params);
    for (const text of [tpl.title, ...tpl.stages.map((st) => st.title)]) {
      for (const m of text.matchAll(PARAM_PLACEHOLDER)) {
        if (!placeholders.has(m[1]!)) add(file, tpl.id, `tytuł używa nieznanego parametru "{${m[1]}}"`);
      }
    }
    checkStages(tpl.stages, file, tpl.id, 'template', placeholders);
  }

  for (const p of world.patterns) {
    const file = WORLD_CONTENT_PATHS.patterns;
    claim(p.id, file);
    if (p.region !== undefined && !regions.has(p.region)) add(file, p.id, `nieznany region "${p.region}"`);
    checkCondition(p.conditions, file, `${p.id}.conditions`);
    p.chanceModifiers.forEach((m, i) => checkCondition(m.when, file, `${p.id}.chanceModifiers[${i}]`));
    checkEffects(p.effects, file, p.id);
  }

  for (const d of world.dilemmas) {
    const file = WORLD_CONTENT_PATHS.dilemmas;
    claim(d.id, file);
    if (d.region !== undefined && !regions.has(d.region)) add(file, d.id, `nieznany region "${d.region}"`);
    checkCondition(d.conditions, file, `${d.id}.conditions`);
    const optionIds = new Set<string>();
    for (const o of d.options) {
      if (optionIds.has(o.id)) add(file, `${d.id}.${o.id}`, 'powtórzony identyfikator opcji');
      optionIds.add(o.id);
      checkEffects(o.effects, file, `${d.id}.${o.id}`);
    }
    if (!optionIds.has(d.defaultOption)) add(file, d.id, `opcja domyślna "${d.defaultOption}" nie istnieje`);
  }

  return problems;
}

/**
 * Dozwolone miejsca na parametry szablonu. {kraj} działa, gdy każda wartość jest tekstem albo
 * ma formę `mian`; {kraj.dop} — gdy każda wartość jest odmianą z formą `dop`.
 */
function templatePlaceholders(params: Record<string, TemplateParamValue[]>): Set<string> {
  const allowed = new Set<string>();
  for (const [key, values] of Object.entries(params)) {
    if (values.every((v) => typeof v === 'string' || v.mian !== undefined)) allowed.add(key);
    const records = values.filter((v): v is Record<string, string> => typeof v !== 'string');
    if (records.length !== values.length) continue;
    const forms = new Set(Object.keys(records[0] ?? {}));
    for (const form of forms) {
      if (records.every((r) => r[form] !== undefined)) allowed.add(`${key}.${form}`);
    }
  }
  return allowed;
}
