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

  const echoIds = new Set((world.echoes ?? []).map((e) => e.id));
  /** Klucze Rejestru: tworzone skutkiem `registry` i te, do których ktoś się odwołuje. */
  const registryCreated = new Set<string>(['zatajona-awaria']);
  const registryUsed: { key: string; file: string; where: string }[] = [];
  /** Echa wstawiane do kolejki przez jakikolwiek skutek (plus te, które kolejkuje sam silnik). */
  const echoQueued = new Set<string>(['przeciek-zatajonej-awarii', 'zatajona-awaria-przycicha']);

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
    if ('registry' in c) registryUsed.push({ key: c.registry, file, where });
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
      if ('echo' in e) {
        echoQueued.add(e.echo);
        if (!echoIds.has(e.echo)) add(file, w, `nieznane echo "${e.echo}" (brak w ${WORLD_CONTENT_PATHS.echoes})`);
      }
      if ('registry' in e) registryCreated.add(e.registry.key);
      if ('registryClose' in e) registryUsed.push({ key: e.registryClose, file, where: w });
    });
  };

  const checkStages = (
    stages: readonly StageContent[],
    file: string,
    owner: string,
    mode: 'historical' | 'reactive' | 'template',
    params: ReadonlySet<string>,
  ) => {
    const stageIds = new Set<string>();
    for (const s of stages) {
      if (stageIds.has(s.id)) add(file, `${owner}.${s.id}`, 'powtórzony identyfikator etapu');
      stageIds.add(s.id);
    }
    for (const s of stages) {
      const where = `${owner}.${s.id}`;
      if (mode === 'historical' && !s.at && !s.sameQuarter)
        add(file, where, 'etap wątku historycznego potrzebuje daty "at" (albo "sameQuarter")');
      if (mode !== 'historical' && s.alternative) add(file, where, '"alternative" ma sens tylko w wątku historycznym');
      if (mode !== 'historical' && s.at) add(file, where, 'etap szablonu i wątku reaktywnego używa "offset", nie "at"');
      if (s.anchor && (s.branches.length !== 1 || !s.branches[0]!.historical))
        add(file, where, 'kotwica ma dokładnie jedną gałąź, historyczną');
      if (s.anchor && s.decision) add(file, where, 'kotwica nie może mieć punktu decyzyjnego');
      if (mode === 'historical' && !s.alternative && s.branches.filter((b) => b.historical).length !== 1)
        add(file, where, 'etap wątku historycznego potrzebuje dokładnie jednej gałęzi historycznej');
      if (s.sameQuarter && s === stages[0]) add(file, where, 'pierwszy etap nie może mieć "sameQuarter"');
      if (s.sameQuarter && (s.rumor || s.decision))
        add(file, where, 'etap "sameQuarter" nie może mieć pogłoski ani decyzji (nie ma na nie czasu)');
      if (s.rumor) {
        for (const m of s.rumor.text.matchAll(PARAM_PLACEHOLDER)) {
          if (!params.has(m[1]!)) add(file, where, `pogłoska używa nieznanego parametru "{${m[1]}}"`);
        }
      }
      if (s.decision) {
        const optionIds = new Set<string>();
        const branchIdsOfStage = new Set(s.branches.map((b) => b.id));
        for (const o of s.decision.options) {
          if (optionIds.has(o.id)) add(file, `${where}.decision.${o.id}`, 'powtórzony identyfikator opcji');
          optionIds.add(o.id);
          checkEffects(o.effects, file, `${where}.decision.${o.id}`);
          for (const b of Object.keys(o.weights)) {
            if (!branchIdsOfStage.has(b))
              add(file, `${where}.decision.${o.id}`, `wagi wskazują nieistniejącą gałąź "${b}"`);
          }
        }
        if (!optionIds.has(s.decision.defaultOption))
          add(file, `${where}.decision`, `opcja domyślna "${s.decision.defaultOption}" nie istnieje`);
        checkEffects(s.decision.inactionEffects, file, `${where}.decision.biernosc`);
      }
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
        b.reactions.forEach((x, i) => checkEffects(x.effects, file, `${bw}.reactions[${i}]`));
        if (b.ongoing) {
          checkEffects(b.ongoing.effects, file, `${bw}.ongoing`);
          if (b.ongoing.until !== undefined && !stageIds.has(b.ongoing.until))
            add(file, `${bw}.ongoing`, `"until" wskazuje nieistniejący etap "${b.ongoing.until}"`);
        }
        if (b.kind !== undefined) {
          const mismatch =
            (b.kind === 'historical') !== b.historical ||
            (b.kind === 'delayed' && b.delayQuarters === undefined) ||
            (b.kind === 'accelerated' && b.advanceNext === undefined) ||
            (b.kind === 'interrupted' && b.next !== 'end');
          if (mismatch)
            add(
              file,
              bw,
              `rodzaj gałęzi "${b.kind}" nie zgadza się z mechaniką (historical, delayQuarters, advanceNext, next: end)`,
            );
        }
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
    if (t.kind === 'reactive' && !t.start.conditions)
      add(file, t.id, 'wątek reaktywny potrzebuje warunku startu ("start.conditions")');
    checkStages(t.stages, file, t.id, t.kind, new Set());
  }

  for (const tpl of world.templates) {
    const file = `${WORLD_CONTENT_PATHS.templatesDir}/${tpl.id}.yaml`;
    claim(tpl.id, file);
    if (!regions.has(tpl.region)) add(file, tpl.id, `nieznany region "${tpl.region}"`);
    checkCondition(tpl.conditions, file, `${tpl.id}.conditions`);
    tpl.chanceModifiers.forEach((m, i) => checkCondition(m.when, file, `${tpl.id}.chanceModifiers[${i}]`));
    for (const h of tpl.historicalInstances) {
      if (!threadStages.has(h)) add(file, tpl.id, `"historicalInstances" wskazuje nieistniejący wątek "${h}"`);
    }
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

  // Źródła, pod które można podpiąć echo polem `on`.
  const sources = new Set<string>(world.patterns.map((p) => p.id));
  for (const d of world.dilemmas) {
    sources.add(`${d.id}.biernosc`);
    for (const o of d.options) sources.add(`${d.id}.${o.id}`);
  }
  for (const t of world.threads) {
    for (const s of t.stages) {
      for (const b of s.branches) sources.add(`${t.id}.${s.id}.${b.id}`);
      if (!s.decision) continue;
      sources.add(`${t.id}.${s.id}.biernosc`);
      for (const o of s.decision.options) {
        if (s.branches.some((b) => b.id === o.id)) {
          add(
            `${WORLD_CONTENT_PATHS.threadsDir}/${t.id}.yaml`,
            `${t.id}.${s.id}.decision.${o.id}`,
            'opcja decyzji ma ten sam identyfikator co gałąź etapu; echa by ich nie rozróżniły',
          );
        }
        sources.add(`${t.id}.${s.id}.${o.id}`);
      }
    }
  }

  for (const e of world.echoes ?? []) {
    const file = WORLD_CONTENT_PATHS.echoes;
    claim(`echo:${e.id}`, file);
    for (const on of e.on) {
      echoQueued.add(e.id);
      if (!sources.has(on))
        add(file, e.id, `źródło "${on}" nie istnieje (dylemat.opcja, wątek.etap.opcja albo wątek.etap.gałąź)`);
    }
    if (e.after === 0 && !e.silent)
      add(file, e.id, 'echo z terminem 0 musi być ciche ("silent: true"); depesza w tym samym kwartale to tekst opcji');
    if (e.region !== undefined && !regions.has(e.region)) add(file, e.id, `nieznany region "${e.region}"`);
    checkCondition(e.requires, file, `${e.id}.requires`);
    checkEffects(e.effects, file, e.id);
    if (e.otherwise) {
      checkEffects(e.otherwise.effects, file, `${e.id}.otherwise`);
      if (!e.requires) add(file, e.id, 'wariant "otherwise" ma sens tylko z warunkiem "requires"');
    }
  }
  for (const e of world.echoes ?? []) {
    if (!echoQueued.has(e.id)) add(WORLD_CONTENT_PATHS.echoes, e.id, 'żaden skutek nie wstawia tego echa do kolejki');
  }
  for (const use of registryUsed) {
    if (!registryCreated.has(use.key))
      add(use.file, use.where, `żaden skutek nie tworzy wpisu Rejestru o kluczu "${use.key}"`);
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
