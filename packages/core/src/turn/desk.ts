/**
 * Biurko Andersona: akcje za Uwagę Dowódcy (GDD 10). Wersja pierwsza — pięć akcji.
 * Pozostałe akcje z GDD 10.2 (Rozmowa, Inspekcja, Śledztwo, Mediacja, Przysługa…)
 * wymagają systemów postaci i intryg i dojdą w kolejnych fazach (Plan Budowy v3).
 *
 * Wyniki liczy silnik przez Rng z ziarnem (zasada Z3). Każda akcja zwraca nowy stan.
 */
import type { GameContent } from '../content/schema.ts';
import { Rng } from '../rng.ts';
import type { GameState } from '../state/schema.ts';
import { quarterCode } from '../time.ts';

/** Koszty i zakresy z GDD 10.2. */
const MEETING_UD = 1;
const LOBBY_UD = 2;
const LOBBY_KP = 1;
/** Lobbing: ZW +3 do +6 (GDD 10.2). */
const LOBBY_ZW_MIN = 3;
const LOBBY_ZW_MAX = 6;
const PRESS_UD = 1;
const REST_UD = 2;
const INTEL_UD = 1;
/** Przy Wiarygodności Fasady poniżej tego progu konferencja prasowa może zaszkodzić. */
const PRESS_RISK_BELOW_WF = 50;
/** Od tego poziomu Poparcia Publicznego konferencja prasowa przestaje pomagać. */
const PRESS_SATURATED_PP = 65;

export const DESK_ACTION_IDS = ['spotkanie', 'lobbing', 'konferencja', 'zlecenie-wywiadowcze', 'odpoczynek'] as const;
export type DeskActionId = (typeof DESK_ACTION_IDS)[number];

export interface DeskActionInfo {
  id: DeskActionId;
  title: string;
  description: string;
  ud: number;
  kp: number;
  /** Czego dotyczy akcja: frakcji, tematu wywiadowczego albo niczego. */
  target: 'faction' | 'topic' | null;
  /** Dozwolone cele z etykietami (puste dla akcji bez celu). */
  targets: { id: string; label: string; enabled: boolean }[];
  enabled: boolean;
  /** Dlaczego akcja jest niedostępna (po polsku) albo null. */
  reason: string | null;
}

export class DeskActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeskActionError';
  }
}

function doneThisQuarter(state: GameState, action: string, target?: string): boolean {
  const q = quarterCode(state.quarter);
  return state.desk.log.some(
    (r) => r.quarter === q && r.action === action && (target === undefined || r.target === target),
  );
}

/** Tematy Zlecenia wywiadowczego: zmienne świata, które BAS umie ocenić. */
function intelTopics(content: GameContent): { id: string; label: string }[] {
  return (content.world?.definition.variables ?? []).map((v) => ({ id: v.id, label: v.title }));
}

/** Lista akcji Biurka z dostępnością w bieżącym stanie (dla interfejsu). */
export function availableDeskActions(state: GameState, content: GameContent): DeskActionInfo[] {
  const { UD, KP } = state.currencies;
  const active = state.status === 'active';
  const gate = (ud: number, kp: number, once: string | null): string | null => {
    if (!active) return 'Kampania jest zakończona.';
    if (once && doneThisQuarter(state, once)) return 'Już wykonano w tym kwartale.';
    if (UD < ud) return `Za mało Uwagi Dowódcy (potrzeba ${ud}, jest ${UD}).`;
    if (KP < kp) return `Za mało Kapitału Politycznego (potrzeba ${kp}, jest ${KP}).`;
    return null;
  };
  const factionName = (id: string) => content.factions.find((f) => f.id === id)?.name ?? id;
  const info = (
    id: DeskActionId,
    title: string,
    description: string,
    ud: number,
    kp: number,
    target: DeskActionInfo['target'],
    targets: DeskActionInfo['targets'],
    once: boolean,
  ): DeskActionInfo => {
    const reason = gate(ud, kp, once ? id : null);
    return { id, title, description, ud, kp, target, targets, enabled: reason === null, reason };
  };
  return [
    info(
      'spotkanie',
      'Spotkanie z dyrektorem frakcji',
      'Pierwsze spotkanie ujawnia bieżącą Agendę frakcji. Kolejne poprawia Nastawienie o 1 i cofa zegar Cierpliwości.',
      MEETING_UD,
      0,
      'faction',
      state.factionOrder.map((id) => ({
        id,
        label: factionName(id),
        enabled: !doneThisQuarter(state, 'spotkanie', id),
      })),
      false,
    ),
    info(
      'lobbing',
      'Lobbing w Waszyngtonie',
      `Zaufanie Waszyngtonu rośnie o ${LOBBY_ZW_MIN}–${LOBBY_ZW_MAX}. Raz na kwartał.`,
      LOBBY_UD,
      LOBBY_KP,
      null,
      [],
      true,
    ),
    info(
      'konferencja',
      'Konferencja prasowa',
      `Poparcie Publiczne zwykle rośnie o 1–4. Przy Wiarygodności Fasady poniżej ${PRESS_RISK_BELOW_WF} może spaść, a powyżej ${PRESS_SATURATED_PP} poparcia niewiele już daje. Raz na kwartał.`,
      PRESS_UD,
      0,
      null,
      [],
      true,
    ),
    info(
      'zlecenie-wywiadowcze',
      'Zlecenie wywiadowcze',
      'BAS ocenia wybrany obszar świata i przynosi Ocenę wywiadowczą. Jej trafność zależy od Nastawienia BAS.',
      INTEL_UD,
      0,
      'topic',
      intelTopics(content).map((t) => ({ ...t, enabled: !doneThisQuarter(state, 'zlecenie-wywiadowcze', t.id) })),
      false,
    ),
    info(
      'odpoczynek',
      'Odpoczynek',
      'W następnym kwartale Anderson ma o 1 punkt Uwagi Dowódcy więcej. Raz na kwartał.',
      REST_UD,
      0,
      null,
      [],
      true,
    ),
  ];
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Opis słowny wartości zmiennej świata (0–10) dla Oceny wywiadowczej. */
function band(value: number, min: number, max: number): string {
  const t = (value - min) / Math.max(1, max - min);
  if (t < 0.2) return 'bardzo niski';
  if (t < 0.4) return 'niski';
  if (t < 0.6) return 'umiarkowany';
  if (t < 0.8) return 'wysoki';
  return 'bardzo wysoki';
}

export interface DeskActionRequest {
  action: DeskActionId;
  target?: string | undefined;
}

/** Wykonuje akcję Biurka. Rzuca DeskActionError, gdy akcja jest niedostępna. */
export function performDeskAction(
  input: GameState,
  content: GameContent,
  request: DeskActionRequest,
): { state: GameState; summary: string } {
  const info = availableDeskActions(input, content).find((a) => a.id === request.action);
  if (!info) throw new DeskActionError(`Nieznana akcja Biurka "${request.action}".`);
  if (!info.enabled) throw new DeskActionError(info.reason ?? 'Akcja niedostępna.');
  if (info.target !== null) {
    const t = info.targets.find((x) => x.id === request.target);
    if (!t) throw new DeskActionError('Ta akcja wymaga wskazania celu.');
    if (!t.enabled) throw new DeskActionError('Ten cel był już wybrany w tym kwartale.');
  }

  const state = structuredClone(input);
  const rng = Rng.fromState(state.rng);
  const q = quarterCode(state.quarter);
  state.currencies.UD -= info.ud;
  state.currencies.KP -= info.kp;
  let summary: string;

  switch (request.action) {
    case 'spotkanie': {
      const f = state.factions[request.target!]!;
      const name = content.factions.find((x) => x.id === f.id)?.name ?? f.id;
      if (!f.agendaKnown) {
        f.agendaKnown = true;
        summary = `Spotkanie: ${name}. Anderson poznaje Agendę frakcji: ${f.agenda}`;
      } else {
        f.disposition = clamp(f.disposition + 1, -3, 3);
        const clock = state.clocks.find((c) => c.id === f.patienceClockId);
        if (clock) clock.filled = Math.max(0, clock.filled - 1);
        summary = `Spotkanie: ${name}. Nastawienie frakcji poprawia się.`;
      }
      break;
    }
    case 'lobbing': {
      const gain = rng.int(LOBBY_ZW_MIN, LOBBY_ZW_MAX);
      state.indicators.ZW = clamp(state.indicators.ZW + gain, 0, 100);
      summary = `Lobbing w Waszyngtonie: Zaufanie Waszyngtonu +${gain}.`;
      break;
    }
    case 'konferencja': {
      const risky = state.indicators.WF < PRESS_RISK_BELOW_WF;
      // Przy wysokim poparciu kolejna konferencja niewiele już daje (prasa jest znudzona).
      const saturated = state.indicators.PP >= PRESS_SATURATED_PP;
      const delta = risky ? rng.int(-2, 3) : saturated ? rng.int(-1, 1) : rng.int(1, 4);
      state.indicators.PP = clamp(state.indicators.PP + delta, 0, 100);
      summary =
        delta >= 0
          ? `Konferencja prasowa: Poparcie Publiczne +${delta}.`
          : `Konferencja prasowa wypada źle: Poparcie Publiczne ${delta}.`;
      break;
    }
    case 'zlecenie-wywiadowcze': {
      const def = content.world?.definition.variables.find((v) => v.id === request.target);
      if (!def) throw new DeskActionError('Nieznany temat zlecenia.');
      const bas = state.factions.BAS?.disposition ?? 0;
      // Trafność: im lepsze Nastawienie BAS, tym rzadziej ocena chybia o jeden stopień.
      const missChance = clamp(0.35 - 0.1 * bas, 0.05, 0.65);
      const truth = state.world.vars[def.id] ?? def.initial;
      const miss = rng.chance(missChance);
      const reported = miss ? clamp(truth + (rng.chance(0.5) ? 2 : -2), def.min, def.max) : truth;
      const reliability = bas >= 2 ? 'B' : bas >= 0 ? 'C' : 'D';
      state.world.seq += 1;
      state.knowledge.assessments.push({
        id: `ocena-${state.world.seq}`,
        topic: def.title,
        text: `BAS ocenia: ${def.title.toLowerCase()} — poziom ${band(reported, def.min, def.max)}. ${def.description}`,
        source: 'humint',
        reliability,
        credibility: miss ? 4 : 2,
        quarter: q,
      });
      summary = `Zlecenie wywiadowcze: BAS przynosi Ocenę „${def.title}” (kod ${reliability}).`;
      break;
    }
    case 'odpoczynek': {
      state.desk.restBonus = 1;
      summary = 'Odpoczynek: w następnym kwartale Anderson ma o 1 punkt Uwagi Dowódcy więcej.';
      break;
    }
  }

  state.rng = rng.getState();
  state.desk.log.push({
    quarter: q,
    action: request.action,
    ...(request.target !== undefined ? { target: request.target } : {}),
    summary,
  });
  state.chronicle.push({ quarter: q, text: summary, tags: ['biurko', request.action] });
  return { state, summary };
}
