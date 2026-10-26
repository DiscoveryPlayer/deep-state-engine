/**
 * Tekstowy raport stanu z perspektywy Andersona (na potrzeby CLI, zanim powstanie interfejs).
 */
import { quarterLabel, type PlayerView } from '@dse/core';

const ESCALATION = ['spokój', 'napięcie', 'opór', 'ofensywa', 'bunt'] as const;
const NG_NAMES: Record<number, string> = {
  5: 'odprężenie',
  4: 'stan normalny',
  3: 'napięcie',
  2: 'kryzys',
  1: 'krawędź',
};

function bar(value: number, max = 100, width = 20): string {
  const n = Math.round((value / max) * width);
  return '█'.repeat(n) + '░'.repeat(width - n);
}

function clockBar(filled: number, segments: number): string {
  return '●'.repeat(filled) + '○'.repeat(segments - filled);
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

export function renderStateReport(view: PlayerView): string {
  const L: string[] = [];
  const { indicators: i, currencies: c } = view;

  L.push(`${view.organization.acronym} — ${view.organization.fullName}`);
  L.push(`${quarterLabel(view.quarter)} · Epoka ${view.organization.era} · ${view.organization.brand}`);
  L.push('');
  L.push('WSKAŹNIKI');
  L.push(`  ZW  Zaufanie Waszyngtonu   ${bar(i.ZW)} ${i.ZW}`);
  L.push(`  SO  Spójność Organizacji   ${bar(i.SO)} ${i.SO}`);
  L.push(`  PP  Poparcie Publiczne     ${bar(i.PP)} ${i.PP}`);
  L.push(`  WF  Wiarygodność Fasady    ${bar(i.WF)} ${i.WF}`);
  L.push(`  NG  Napięcie Geopolityczne ${i.NG} — ${NG_NAMES[i.NG] ?? '?'}`);
  L.push(`  UD ${c.UD} · KP ${c.KP}`);
  L.push('');
  L.push('FRAKCJE');
  for (const f of view.factions) {
    L.push(
      `  ${f.id.padEnd(4)} Wpływ ${f.influence} · Nastawienie ${signed(f.disposition).padStart(2)} · ` +
        `${ESCALATION[f.escalation] ?? '?'} · Agenda: ${f.agenda ?? 'nieznana'}`,
    );
  }
  L.push('');
  L.push('POSTACI');
  for (const ch of view.characters) {
    const traits = [...ch.traits, ...ch.revealedTraits.map((t) => `${t} (ujawniona)`)].join(', ');
    L.push(`  ${ch.name} — ${ch.role} [${ch.faction}] · ${ch.loyaltyBand} · cechy: ${traits}`);
  }
  L.push('');
  L.push('ZEGARY');
  for (const k of view.clocks) {
    L.push(`  ${k.label.padEnd(52)} ${k.segments === null ? '(aktywny)' : clockBar(k.filled ?? 0, k.segments)}`);
  }
  L.push('');
  L.push('REJESTR NASTĘPSTW');
  if (view.registry.length === 0) L.push('  (pusty)');
  for (const r of view.registry) {
    const p = r.pressure === null ? '' : ` · Ciśnienie ${r.pressure}/6`;
    L.push(`  ${r.id} [${r.type}] ${r.title} · waga ${r.weight}${p}`);
  }
  L.push('');
  L.push('KRONIKA');
  for (const e of view.chronicle) L.push(`  ${e.quarter}: ${e.text}`);
  return L.join('\n');
}
