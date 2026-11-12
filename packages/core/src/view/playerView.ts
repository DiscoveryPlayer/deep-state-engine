/**
 * Projekcja stanu na WIEDZĘ ANDERSONA (zasada Z4, GDD 16.1).
 *
 * To jedyna droga, którą dane ze stanu trafiają do interfejsu i do Pakietu
 * Kontekstu dla AI. Projekcja buduje NOWY obiekt z wybranych pól (lista dozwolonych),
 * zamiast usuwać pola ukryte. Nowe pole w stanie domyślnie NIE wycieka do gracza.
 */
import type { GameState } from '../state/schema.ts';
import { quarterCode } from '../time.ts';
import { correctionsForQuarter } from '../turn/quarter.ts';

export type LoyaltyBand = 'oddany' | 'lojalny' | 'neutralny' | 'chłodny' | 'wrogi';

export interface PlayerView {
  organization: GameState['organization'];
  quarter: GameState['quarter'];
  indicators: GameState['indicators'];
  currencies: GameState['currencies'];
  style: GameState['style'];
  factions: {
    id: string;
    influence: number;
    disposition: number;
    /** Agenda tylko wtedy, gdy Anderson ją poznał. */
    agenda: string | null;
    escalation: number;
  }[];
  characters: {
    id: string;
    name: string;
    faction: string;
    role: string;
    status: string;
    competence: number;
    /** Gracz widzi przybliżenie lojalności, nie liczbę (GDD aneks B: „częściowo”). */
    loyaltyBand: LoyaltyBand;
    traits: string[];
    revealedTraits: string[];
  }[];
  registry: {
    id: string;
    type: string;
    title: string;
    weight: number;
    pressure: number | null;
    createdIn: string;
    status: string;
  }[];
  clocks: {
    id: string;
    kind: string;
    label: string;
    /** Dla zegarów częściowo widocznych gracz wie tylko, że zegar istnieje. */
    segments: number | null;
    filled: number | null;
  }[];
  directives: GameState['directives'];
  assessments: GameState['knowledge']['assessments'];
  chronicle: GameState['chronicle'];
  /** Publiczne wpisy dziennika świata. Tajne wpisy, zmienne, flagi, Rozbieżność i stan wątków są ukryte. */
  worldNews: { quarter: string; kind: string; title: string; text: string; actor: string | null }[];
  /** Sytuacje trwające: co kwartał obciążają PACE, dopóki nie wygasną. */
  situations: { id: string; title: string; text: string; startedIn: string }[];
  /** Dylematy czekające na decyzję Andersona. */
  pendingDilemmas: {
    instanceId: string;
    title: string;
    prompt: string;
    options: { id: string; title: string }[];
    expiresIn: string;
    /** Czy sprawa wyrasta z wątku świata (wybór zmieni bieg wydarzeń), czy jest samodzielna. */
    fromThread: boolean;
  }[];
  /** Rozliczenia budżetu: Korekty kwartałów w jednostkach i w funduszach KSP. */
  budget: {
    ledger: {
      quarter: string;
      units: number;
      funds: number | null;
      items: { reason: string; units: number }[];
      settled: boolean;
    }[];
    /** Korekty, które obciążą bieżący kwartał przy zamknięciu (podgląd). */
    upcoming: { reason: string; units: number }[];
  };
  /** Raporty z zamkniętych kwartałów. */
  reports: GameState['reports'];
  /** Akcje Biurka wykonane w bieżącym kwartale. */
  deskLog: { action: string; summary: string }[];
  /** Wskaźniki i Kapitał Polityczny z otwarcia bieżącego kwartału (sprzed jego wydarzeń). */
  quarterStart: GameState['desk']['opening'];
  /** Ostatnia migawka kariery KSP albo null. */
  ksp: GameState['ksp']['snapshots'][number] | null;
  /** Narracja wklejona przez gracza (teksty AI). Jawna w całości, bez skutków mechanicznych. */
  narrative: GameState['narrative']['entries'];
  /** Wierność historii wybrana przy zakładaniu kampanii. */
  historyFidelity: GameState['campaign']['historyFidelity'];
  status: GameState['status'];
}

export function loyaltyBand(loyalty: number): LoyaltyBand {
  if (loyalty >= 3) return 'oddany';
  if (loyalty >= 1) return 'lojalny';
  if (loyalty === 0) return 'neutralny';
  if (loyalty >= -2) return 'chłodny';
  return 'wrogi';
}

export function toPlayerView(state: GameState): PlayerView {
  return {
    organization: { ...state.organization },
    quarter: { ...state.quarter },
    indicators: { ...state.indicators },
    currencies: { ...state.currencies },
    style: { ...state.style },
    factions: orderedFactions(state).map((f) => ({
      id: f.id,
      influence: f.influence,
      disposition: f.disposition,
      agenda: f.agendaKnown ? f.agenda : null,
      escalation: f.escalation,
    })),
    characters: orderedCharacters(state).map((c) => ({
      id: c.id,
      name: c.name,
      faction: c.faction,
      role: c.role,
      status: c.status,
      competence: c.competence,
      loyaltyBand: loyaltyBand(c.loyalty),
      traits: [...c.traits],
      revealedTraits: c.revealedTraits.filter((t) => c.hiddenTraits.includes(t)),
    })),
    registry: state.registry
      .filter((e) => e.visibleToPlayer)
      .map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        weight: e.weight,
        pressure: e.pressure ?? null,
        createdIn: e.createdIn,
        status: e.status,
      })),
    clocks: state.clocks
      .filter((c) => c.visibility !== 'hidden')
      .map((c) => ({
        id: c.id,
        kind: c.kind,
        label: c.label,
        segments: c.visibility === 'visible' ? c.segments : null,
        filled: c.visibility === 'visible' ? c.filled : null,
      })),
    directives: state.directives.map((d) => ({ ...d })),
    assessments: state.knowledge.assessments.map((a) => ({ ...a })),
    chronicle: state.chronicle.map((c) => ({ ...c, tags: [...c.tags] })),
    worldNews: state.world.log
      .filter((e) => e.visibility === 'public')
      .map((e) => ({ quarter: e.quarter, kind: e.kind, title: e.title, text: e.text, actor: e.actor ?? null })),
    situations: state.world.situations.map((s) => ({
      id: s.id,
      title: s.title,
      text: s.text,
      startedIn: s.startedIn,
    })),
    pendingDilemmas: state.world.pendingDilemmas.map((p) => ({
      instanceId: p.instanceId,
      title: p.title,
      prompt: p.prompt,
      options: p.options.map((o) => ({ ...o })),
      expiresIn: p.expiresIn,
      fromThread: p.source !== undefined,
    })),
    budget: {
      ledger: state.budget.ledger.map((e) => ({
        quarter: e.quarter,
        units: e.units,
        funds: e.unitFunds === null ? null : Math.round(e.units * e.unitFunds),
        // Źródło Korekty (identyfikator gałęzi) zostaje ukryte: zdradzałoby tajne wątki.
        items: e.items.map((i) => ({ reason: i.reason, units: i.units })),
        settled: e.settled,
      })),
      upcoming: correctionsForQuarter(state, quarterCode(state.quarter)).map((i) => ({
        reason: i.reason,
        units: i.units,
      })),
    },
    reports: state.reports.map((r) => ({ ...r, before: { ...r.before }, after: { ...r.after }, notes: [...r.notes] })),
    deskLog: state.desk.log
      .filter((r) => r.quarter === quarterCode(state.quarter))
      .map((r) => ({ action: r.action, summary: r.summary })),
    quarterStart: { ...state.desk.opening },
    ksp: state.ksp.snapshots.at(-1) ?? null,
    narrative: state.narrative.entries.map((n) => ({ ...n, sections: n.sections.map((s) => ({ ...s })) })),
    historyFidelity: state.campaign.historyFidelity,
    status: state.status,
  };
}

function orderedFactions(state: GameState) {
  const known = state.factionOrder.flatMap((id) => (state.factions[id] ? [state.factions[id]] : []));
  const rest = Object.values(state.factions).filter((f) => !state.factionOrder.includes(f.id));
  return [...known, ...rest];
}

function orderedCharacters(state: GameState) {
  const rank = (faction: string) => {
    const i = state.factionOrder.indexOf(faction);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return Object.values(state.characters).sort(
    (a, b) => rank(a.faction) - rank(b.faction) || a.name.localeCompare(b.name, 'pl'),
  );
}
