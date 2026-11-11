/**
 * Budowa stanu startowego kampanii z treści gry.
 */
import type { GameContent } from '../content/schema.ts';
import { validateContentReferences } from '../content/validate.ts';
import { Rng } from '../rng.ts';
import { quarterCode, quarterOfDate } from '../time.ts';
import { ensureWorldState } from '../world/engine.ts';
import {
  STATE_SCHEMA_VERSION,
  emptyWorldState,
  gameStateSchema,
  type CampaignSettings,
  type CharacterState,
  type ClockState,
  type FactionState,
  type GameState,
} from './schema.ts';

/** Ustawienia kampanii: decyzje 0005 i 0007 (RP-1 4.8.1, ustawienia trudności autora). */
export const DEFAULT_CAMPAIGN_SETTINGS: Omit<CampaignSettings, 'id' | 'seed'> = {
  rp1Version: '4.8.1.0',
  rp1Difficulty: 'custom',
  rp1DifficultyNotes:
    'Własne: fundusze 50 000, nauka 20, Confidence 750, kredyt odblokowań 60 294, tempo budowy i badań 1,3 (decyzja 0007)',
  opponentMode: 'divergent',
  metaDifficulty: 'secret',
  integrationMode: 'honor',
  discipline: 'standard',
};

/** Cierpliwość frakcji to zegar 6-segmentowy (GDD 7.1). */
const PATIENCE_SEGMENTS = 6 as const;

export class ContentError extends Error {
  readonly problems: { file: string; where: string; message: string }[];

  constructor(problems: { file: string; where: string; message: string }[]) {
    super(
      `Treść gry zawiera błędy (${problems.length}):\n` +
        problems.map((p) => `  • ${p.file} [${p.where}]: ${p.message}`).join('\n'),
    );
    this.name = 'ContentError';
    this.problems = problems;
  }
}

export interface NewCampaignOptions {
  id: string;
  seed: string;
  settings?: Partial<Omit<CampaignSettings, 'id' | 'seed'>>;
}

export function createInitialState(content: GameContent, options: NewCampaignOptions): GameState {
  const problems = validateContentReferences(content);
  if (problems.length > 0) throw new ContentError(problems);

  const startQuarter = quarterOfDate(content.campaign.start.date);
  const startCode = quarterCode(startQuarter);

  const clocks: ClockState[] = [];
  const factions: Record<string, FactionState> = {};
  for (const f of content.factions) {
    const clockId = `patience-${f.id}`;
    clocks.push({
      id: clockId,
      kind: 'patience',
      label: `Cierpliwość: ${f.name}`,
      segments: PATIENCE_SEGMENTS,
      filled: 0,
      visibility: 'visible',
      owner: f.id,
    });
    factions[f.id] = {
      id: f.id,
      influence: f.influence,
      disposition: 0,
      agenda: f.startAgenda,
      agendaKnown: false,
      escalation: 0,
      patienceClockId: clockId,
    };
  }

  const characters: Record<string, CharacterState> = {};
  for (const c of content.characters) {
    characters[c.id] = {
      id: c.id,
      name: c.name,
      faction: c.faction,
      role: c.role,
      status: 'active',
      competence: c.competence,
      loyalty: c.loyalty,
      ambition: c.ambition,
      traits: [...c.traits],
      hiddenTraits: [...c.hiddenTraits],
      revealedTraits: [],
      ...(c.dmNote !== undefined ? { dmNote: c.dmNote } : {}),
    };
  }

  const firstName = content.campaign.organization.names[0];
  if (!firstName)
    throw new ContentError([{ file: 'campaign.yaml', where: 'organization.names', message: 'brak nazwy organizacji' }]);

  const state: GameState = {
    schemaVersion: STATE_SCHEMA_VERSION,
    campaign: { id: options.id, seed: options.seed, ...DEFAULT_CAMPAIGN_SETTINGS, ...options.settings },
    organization: {
      acronym: content.campaign.organization.acronym,
      fullName: firstName.full,
      brand: content.campaign.organization.brand,
      era: content.campaign.start.era,
    },
    quarter: startQuarter,
    rng: Rng.fromSeed(options.seed).getState(),
    indicators: { ...content.campaign.indicators },
    currencies: { ...content.campaign.currencies },
    style: { risk: 0, openness: 0, loyalty: 0, orientation: 0 },
    factions,
    factionOrder: content.factions.map((f) => f.id),
    characters,
    registry: content.registry.map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      knownBy: [...e.knownBy],
      hiddenFrom: [...e.hiddenFrom],
      weight: e.weight,
      ...(e.pressure !== undefined ? { pressure: e.pressure } : {}),
      triggers: [...e.triggers],
      createdIn: startCode,
      visibleToPlayer: e.visibleToPlayer,
      status: 'active' as const,
      ...(e.dmNote !== undefined ? { dmNote: e.dmNote } : {}),
    })),
    clocks,
    directives: [],
    knowledge: { assessments: [] },
    chronicle: [
      {
        quarter: startCode,
        text: `Eugene Anderson obejmuje funkcję Dowódcy Operacyjnego ${content.campaign.organization.acronym}.`,
        tags: ['start'],
      },
    ],
    world: content.world ? ensureWorldState(emptyWorldState(), content.world) : emptyWorldState(),
    budget: { ledger: [] },
    desk: { log: [], restBonus: 0 },
    reports: [],
    ksp: { snapshots: [] },
    status: 'active',
  };

  // Ostatnia linia obrony: stan startowy musi spełniać schemat stanu.
  return gameStateSchema.parse(state);
}
