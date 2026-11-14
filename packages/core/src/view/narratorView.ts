/**
 * Warstwa ukryta dla narratora (decyzja 0019).
 *
 * To drugie i ostatnie wyjście danych ze stanu, obok `toPlayerView`. Zawiera to, czego Anderson
 * nie wie: tajne wydarzenia, ukryte wpisy Rejestru, prawdziwe Agendy, cechy ukryte postaci
 * i to, co nadchodzi. Trafia WYŁĄCZNIE do Pakietu Kontekstu dla AI, na wyraźne życzenie gracza,
 * i nigdy nie jest wyświetlane w interfejsie. Narrator ma z niej budować nastrój i zapowiedzi,
 * a nie zdradzać fakty.
 */
import type { GameContent } from '../content/schema.ts';
import type { GameState } from '../state/schema.ts';
import { nextQuarter, parseQuarterCode, quarterCode, quartersBetween } from '../time.ts';

/** Jak daleko naprzód narrator widzi zaplanowane echa (w kwartałach). */
export const NARRATOR_HORIZON_QUARTERS = 2;

export interface NarratorSecrets {
  /** Tajne wpisy dziennika świata z bieżącego kwartału. */
  secretNews: { title: string; text: string }[];
  /** Ukryte wpisy Rejestru Następstw. */
  hiddenRegistry: { type: string; title: string; with: string[]; source: string | null; note: string | null }[];
  /** Frakcje: Agenda (także nieznana graczowi), zegar Cierpliwości, eskalacja. */
  factions: { id: string; agenda: string; agendaKnown: boolean; patience: string | null; escalation: number }[];
  /** Postaci: cechy ukryte i notatki Mistrza Gry. */
  characters: { name: string; hiddenTraits: string[]; loyalty: number; note: string | null }[];
  /** Echa, które wrócą w najbliższych kwartałach. */
  upcomingEchoes: { title: string; due: string; cause: string }[];
  /** Etapy wątków, które silnik sprawdzi w następnym kwartale (wynik jeszcze nieznany). */
  upcomingStages: { thread: string; stage: string }[];
  /** Zmienne świata i Rozbieżność regionów. */
  variables: { title: string; value: number }[];
  divergence: { region: string; value: number }[];
}

export function toNarratorSecrets(state: GameState, content: GameContent): NarratorSecrets {
  const now = quarterCode(state.quarter);
  const next = quarterCode(nextQuarter(state.quarter));
  const world = content.world;
  const within = (due: string) => quartersBetween(state.quarter, parseQuarterCode(due)) <= NARRATOR_HORIZON_QUARTERS;

  return {
    secretNews: state.world.log
      .filter((e) => e.quarter === now && e.visibility === 'secret')
      .map((e) => ({ title: e.title, text: e.text })),
    hiddenRegistry: state.registry
      .filter((r) => !r.visibleToPlayer && r.status === 'active')
      .map((r) => ({
        type: r.type,
        title: r.title,
        with: [...r.knownBy],
        source: r.source ?? null,
        note: r.dmNote ?? null,
      })),
    factions: state.factionOrder.flatMap((id) => {
      const f = state.factions[id];
      if (!f) return [];
      const def = content.factions.find((x) => x.id === id);
      const clock = state.clocks.find((c) => c.id === f.patienceClockId);
      return [
        {
          id,
          agenda: def?.agendas.find((a) => a.id === f.agenda)?.title ?? f.agenda,
          agendaKnown: f.agendaKnown,
          patience: clock ? `${clock.filled}/${clock.segments}` : null,
          escalation: f.escalation,
        },
      ];
    }),
    characters: Object.values(state.characters)
      .filter((c) => c.status === 'active')
      .map((c) => ({
        name: c.name,
        hiddenTraits: c.hiddenTraits.filter((t) => !c.revealedTraits.includes(t)),
        loyalty: c.loyalty,
        note: c.dmNote ?? null,
      })),
    upcomingEchoes: state.world.echoQueue
      .filter((x) => within(x.due))
      .flatMap((x) => {
        const echo = world?.echoes?.find((e) => e.id === x.echo);
        return echo ? [{ title: echo.title, due: x.due, cause: x.cause }] : [];
      }),
    upcomingStages: Object.values(state.world.threads)
      .filter((t) => t.status === 'active' && t.nextCheck === next && t.stage !== null)
      .flatMap((t) => {
        const def = world?.threads.find((d) => d.id === t.def);
        const stage = def?.stages.find((s) => s.id === t.stage);
        return def && stage ? [{ thread: def.title, stage: stage.title }] : [];
      }),
    variables: (world?.definition.variables ?? []).map((v) => ({
      title: v.title,
      value: state.world.vars[v.id] ?? v.initial,
    })),
    divergence: (world?.definition.regions ?? []).map((r) => ({
      region: r.title,
      value: state.world.divergence[r.id] ?? 0,
    })),
  };
}
