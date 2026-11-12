/**
 * Raporty polecenia `dse swiat`: przebieg jednej symulacji świata i statystyka wielu serii.
 */
import type { GameState, SimulatedQuarter, WorldContent } from '@dse/core';

const KIND_LABEL = {
  thread: 'wątek',
  template: 'szablon',
  pattern: 'wzorzec',
  dilemma: 'dylemat',
  reaction: 'reakcja',
  situation: 'sytuacja',
} as const;

function wrap(text: string, indent: string, width = 96): string {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if (line && (indent + line + ' ' + w).length > width) {
      lines.push(indent + line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(indent + line);
  return lines.join('\n');
}

/** Przebieg jednej symulacji. Bez `truth` pokazuje tylko to, co dociera do Andersona. */
export function renderWorldRun(
  quarters: SimulatedQuarter[],
  final: GameState,
  content: WorldContent,
  truth: boolean,
): string {
  const L: string[] = [];
  for (const q of quarters) {
    const entries = truth ? q.entries : q.entries.filter((e) => e.visibility === 'public');
    if (entries.length === 0) continue;
    L.push(`── ${q.quarter} ${'─'.repeat(80)}`);
    for (const e of entries) {
      const tags: string[] = [KIND_LABEL[e.kind]];
      if (truth && e.historical === true) tags.push('zgodnie z historią');
      if (truth && e.historical === false && e.kind === 'thread') tags.push('ROZEJŚCIE');
      if (e.visibility === 'secret') tags.push('TAJNE');
      L.push(`  ${e.title} [${tags.join(', ')}]`);
      L.push(wrap(e.text, '    '));
    }
  }
  if (truth) {
    const w = final.world;
    L.push('');
    L.push('STAN ŚWIATA NA KONIEC (warstwa faktyczna)');
    L.push('  Rozbieżność regionów:');
    for (const r of content.definition.regions) L.push(`    ${r.title.padEnd(26)} ${w.divergence[r.id] ?? 0}/10`);
    L.push('  Zmienne:');
    for (const v of content.definition.variables) {
      const now = w.vars[v.id] ?? v.initial;
      const diff = now - v.initial;
      L.push(`    ${v.title.padEnd(40)} ${now} (start ${v.initial}${diff ? `, ${diff > 0 ? '+' : ''}${diff}` : ''})`);
    }
    L.push(`  Flagi: ${w.flags.length ? w.flags.join(', ') : '(brak)'}`);
    const units = w.corrections.reduce((s, c) => s + c.units * c.quarters, 0);
    L.push(`  Korekty budżetu: ${w.corrections.length} pozycji, razem ${units.toFixed(1)} jedn.`);
    L.push(
      `  Wskaźniki: ZW ${final.indicators.ZW} · SO ${final.indicators.SO} · PP ${final.indicators.PP} · ` +
        `WF ${final.indicators.WF} · NG ${final.indicators.NG}`,
    );
  }
  return L.join('\n');
}

interface Counter {
  [key: string]: number;
}

function inc(c: Counter, key: string, by = 1): void {
  c[key] = (c[key] ?? 0) + by;
}

function pct(n: number, total: number): string {
  return `${Math.round((100 * n) / total)
    .toString()
    .padStart(3)}%`;
}

/** Statystyka wielu symulacji z różnymi ziarnami — do strojenia wag i szans. */
export function renderWorldSeries(runs: GameState[], content: WorldContent): string {
  const n = runs.length;
  const branches: Counter = {};
  const stageSeen: Counter = {};
  const patterns: Counter = {};
  const templates: Counter = {};
  const dilemmas: Counter = {};
  const divergence: Counter = {};
  let allHistorical = 0;
  let choices = 0;
  let choicesHistorical = 0;
  let correctionUnits = 0;

  for (const s of runs) {
    let onTrack = true;
    for (const inst of Object.values(s.world.threads)) {
      if (inst.fromTemplate) {
        inc(templates, `${inst.def} (${Object.values(inst.params).join(', ')})`);
        continue;
      }
      for (const h of inst.history) {
        inc(stageSeen, `${inst.def}.${h.stage}`);
        inc(branches, `${inst.def}.${h.stage}.${h.branch}`);
        if (!h.historical) onTrack = false;
        const stage = content.threads.find((t) => t.id === inst.def)?.stages.find((st) => st.id === h.stage);
        if (stage && !stage.alternative && stage.branches.length > 1) {
          choices += 1;
          if (h.historical) choicesHistorical += 1;
        }
      }
    }
    if (onTrack) allHistorical += 1;
    for (const [id, rec] of Object.entries(s.world.patternLog)) inc(patterns, id, rec.count);
    for (const e of s.world.log) {
      if (e.kind === 'dilemma' && e.ref.includes('.')) inc(dilemmas, e.ref);
    }
    for (const [r, d] of Object.entries(s.world.divergence)) inc(divergence, r, d);
    correctionUnits += s.world.corrections.reduce((sum, c) => sum + c.units * c.quarters, 0);
  }

  const L: string[] = [];
  L.push(`SERIA: ${n} symulacji`);
  L.push(`  Świat w całości zgodny z historią: ${allHistorical}/${n} (${pct(allHistorical, n).trim()})`);
  L.push(
    `  Zbieżność z historią: ${pct(choicesHistorical, Math.max(1, choices)).trim()} rozstrzygnięć w etapach z wyborem ` +
      `(średnio ${(choices / n).toFixed(1)} takich etapów na symulację)`,
  );
  L.push(`  Średnia suma Korekt budżetu: ${(correctionUnits / n).toFixed(2)} jedn.`);
  L.push('');
  L.push('WĄTKI (udział gałęzi w etapie)');
  for (const t of content.threads) {
    L.push(`  ${t.title}`);
    for (const st of t.stages) {
      const seen = stageSeen[`${t.id}.${st.id}`] ?? 0;
      if (seen === 0) {
        L.push(`    ${st.title}: nie wystąpił`);
        continue;
      }
      const parts = st.branches
        .map((b) => ({ b, c: branches[`${t.id}.${st.id}.${b.id}`] ?? 0 }))
        .filter((x) => x.c > 0)
        .map((x) => `${x.b.id}${x.b.historical ? '*' : ''} ${pct(x.c, seen).trim()}`);
      L.push(`    ${st.title} (${seen} rozstrz.): ${parts.join(' · ')}`);
    }
  }
  L.push('  (* gałąź historyczna)');
  L.push('');
  L.push('SZABLONY (uruchomienia na serię)');
  const tpl = Object.entries(templates).sort((a, b) => b[1] - a[1]);
  if (tpl.length === 0) L.push('  (żaden się nie uruchomił)');
  for (const [k, c] of tpl) L.push(`  ${k.padEnd(60)} ${c}`);
  L.push('');
  L.push('WZORCE (średnio na symulację)');
  for (const p of content.patterns) {
    L.push(`  ${p.title.padEnd(50)} ${((patterns[p.id] ?? 0) / n).toFixed(2)}`);
  }
  L.push('');
  L.push('DYLEMATY (rozstrzygnięcia)');
  for (const d of content.dilemmas) {
    const parts = d.options.map((o) => `${o.id} ${dilemmas[`${d.id}.${o.id}`] ?? 0}`);
    L.push(`  ${d.title.padEnd(32)} ${parts.join(' · ')}`);
  }
  L.push('');
  L.push('ROZBIEŻNOŚĆ (średnio na koniec)');
  for (const r of content.definition.regions) {
    L.push(`  ${r.title.padEnd(26)} ${((divergence[r.id] ?? 0) / n).toFixed(2)}`);
  }
  return L.join('\n');
}
