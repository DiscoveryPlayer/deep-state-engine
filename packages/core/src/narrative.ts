/**
 * Narracja w stanie kampanii (decyzja 0018).
 *
 * Teksty pisze AI poza grą, na podstawie pakietu zbudowanego z widoku gracza. Silnik tylko
 * je przechowuje: narracja niczego nie zmienia we wskaźnikach ani w świecie (zasada Z3).
 */
import type { GameState, NarrativeEntry } from './state/schema.ts';
import { quarterCode } from './time.ts';

/** Ile wpisów narracji trzyma kampania. Starsze wypadają, żeby plik zapisu nie rósł bez końca. */
export const NARRATIVE_MAX_ENTRIES = 240;

export type NewNarrative = Omit<NarrativeEntry, 'id' | 'quarter'>;

export function narrativeId(quarter: string, kind: NarrativeEntry['kind'], ref?: string): string {
  return ref === undefined ? `${quarter}:${kind}` : `${quarter}:${kind}:${ref}`;
}

/** Dopisuje narrację do bieżącego kwartału. Ponowny import tego samego rodzaju zastępuje poprzedni. */
export function recordNarrative(input: GameState, entry: NewNarrative): GameState {
  const state = structuredClone(input);
  const quarter = quarterCode(state.quarter);
  const id = narrativeId(quarter, entry.kind, entry.ref);
  const rest = state.narrative.entries.filter((e) => e.id !== id);
  state.narrative.entries = [...rest, { ...entry, id, quarter }].slice(-NARRATIVE_MAX_ENTRIES);
  return state;
}
