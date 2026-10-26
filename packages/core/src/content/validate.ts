/**
 * Walidacja powiązań między plikami treści.
 *
 * Schematy zod sprawdzają każdy plik osobno. Tutaj sprawdzamy, czy pliki pasują do
 * siebie: czy postać należy do istniejącej frakcji, czy cecha istnieje itd.
 * Komunikaty są po polsku, bo czyta je autor treści, nie programista.
 */
import type { GameContent } from './schema.ts';

export interface ContentProblem {
  file: string;
  where: string;
  message: string;
}

export function validateContentReferences(content: GameContent): ContentProblem[] {
  const problems: ContentProblem[] = [];
  const add = (file: string, where: string, message: string) => problems.push({ file, where, message });

  const factionIds = new Set<string>();
  for (const f of content.factions) {
    if (factionIds.has(f.id)) add('factions.yaml', f.id, `frakcja "${f.id}" występuje dwa razy`);
    factionIds.add(f.id);
  }

  for (const f of content.factions) {
    const agendaIds = new Set(f.agendas.map((a) => a.id));
    if (agendaIds.size !== f.agendas.length) add('factions.yaml', f.id, 'powtórzony identyfikator agendy');
    if (!agendaIds.has(f.startAgenda)) {
      add('factions.yaml', f.id, `agenda startowa "${f.startAgenda}" nie jest na liście agend tej frakcji`);
    }
    for (const r of f.rivals) {
      if (!factionIds.has(r)) add('factions.yaml', f.id, `rywal "${r}" nie jest znaną frakcją`);
      if (r === f.id) add('factions.yaml', f.id, 'frakcja nie może być własnym rywalem');
    }
  }

  const visibleTraits = new Set(content.traits.visible.map((t) => t.id));
  const hiddenTraits = new Set(content.traits.hidden.map((t) => t.id));
  for (const t of visibleTraits) {
    if (hiddenTraits.has(t)) add('traits.yaml', t, `cecha "${t}" jest jednocześnie jawna i ukryta`);
  }

  const characterIds = new Set<string>();
  for (const c of content.characters) {
    if (characterIds.has(c.id)) add('characters.yaml', c.id, `postać "${c.id}" występuje dwa razy`);
    characterIds.add(c.id);
    if (!factionIds.has(c.faction)) add('characters.yaml', c.id, `frakcja "${c.faction}" nie istnieje`);
    for (const t of c.traits) {
      if (!visibleTraits.has(t)) add('characters.yaml', c.id, `cecha jawna "${t}" nie istnieje w traits.yaml`);
    }
    for (const t of c.hiddenTraits) {
      if (!hiddenTraits.has(t)) add('characters.yaml', c.id, `cecha ukryta "${t}" nie istnieje w traits.yaml`);
    }
  }

  // Strony wpisów Rejestru: postać, frakcja, Anderson albo aktor zewnętrzny z listy.
  const externalActors = new Set(['anderson', 'prasa', 'kongres', 'bialy_dom', 'rada_atlantycka', 'zsrr']);
  const isKnownParty = (p: string) => characterIds.has(p) || factionIds.has(p) || externalActors.has(p);
  const registryIds = new Set<string>();
  for (const e of content.registry) {
    if (registryIds.has(e.id)) add('registry.yaml', e.id, `wpis "${e.id}" występuje dwa razy`);
    registryIds.add(e.id);
    for (const p of [...e.knownBy, ...e.hiddenFrom]) {
      if (!isKnownParty(p)) add('registry.yaml', e.id, `nieznana strona wpisu: "${p}"`);
    }
    if (e.type === 'secret' && e.pressure === undefined) {
      add('registry.yaml', e.id, 'tajemnica musi mieć Ciśnienie (pressure: 0–6)');
    }
    if (e.type !== 'secret' && e.pressure !== undefined) {
      add('registry.yaml', e.id, 'Ciśnienie (pressure) mają tylko tajemnice');
    }
  }

  return problems;
}
