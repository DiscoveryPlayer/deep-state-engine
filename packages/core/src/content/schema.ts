/**
 * Schematy TREŚCI gry, czyli tego, co leży w folderze data/ w plikach YAML.
 *
 * Treść to „scenariusz startowy”: frakcje, postaci, cechy, wpisy startowe Rejestru.
 * Stan kampanii (packages/core/src/state) powstaje z treści i potem żyje własnym życiem.
 */
import { z } from 'zod';

const id = z
  .string()
  .regex(/^[a-z0-9][a-z0-9_-]*$/, 'identyfikator: małe litery, cyfry, "-" lub "_" (np. "voss" albo "przeciek_koszty")');

/** Identyfikator frakcji: wielkie litery, jak skróty w GDD (DPO, BAS, RN…). */
export const factionIdSchema = z.string().regex(/^[A-Z]{2,4}$/, 'skrót frakcji: 2–4 wielkie litery (np. DPO)');

const quarterCode = z.string().regex(/^\d{4}-Q[1-4]$/, 'kod kwartału, np. 1951-Q1');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data w formacie RRRR-MM-DD');

// ── Organizacja i parametry startowe ────────────────────────────────────────

export const organizationNameSchema = z.object({
  from: quarterCode,
  full: z.string().min(1),
  fullFr: z.string().optional(),
  note: z.string().optional(),
});

export const campaignContentSchema = z.object({
  organization: z.object({
    acronym: z.string().min(1),
    /** Kolejne rozwinięcia skrótu w czasie (DD 4.2, Plan 2). */
    names: z.array(organizationNameSchema).min(1),
    brand: z.string().min(1),
  }),
  start: z.object({
    date: isoDate,
    era: z.enum(['I', 'II', 'III', 'IV']),
  }),
  indicators: z.object({
    ZW: z.number().int().min(0).max(100),
    SO: z.number().int().min(0).max(100),
    PP: z.number().int().min(0).max(100),
    WF: z.number().int().min(0).max(100),
    NG: z.number().int().min(1).max(5),
  }),
  currencies: z.object({
    UD: z.number().int().min(0).max(8),
    KP: z.number().int().min(0).max(20),
  }),
});

// ── Frakcje ─────────────────────────────────────────────────────────────────

export const agendaSchema = z.object({
  id,
  title: z.string().min(1),
});

export const factionContentSchema = z.object({
  id: factionIdSchema,
  name: z.string().min(1),
  influence: z.number().int().min(1).max(5),
  summary: z.string().min(1),
  wants: z.string().min(1),
  measuresSuccessBy: z.string().min(1),
  levers: z.array(z.string().min(1)).min(1),
  gifts: z.array(z.string().min(1)).min(1),
  agendas: z.array(agendaSchema).min(1),
  /** Agenda na start kampanii; musi być na liście agendas. */
  startAgenda: id,
  paradox: z.string().min(1),
  /** Frakcje rywalizujące na starcie (GDD 8.3). */
  rivals: z.array(factionIdSchema).default([]),
});

export const factionsContentSchema = z.object({
  factions: z.array(factionContentSchema).min(1),
});

// ── Cechy postaci ───────────────────────────────────────────────────────────

export const traitSchema = z.object({
  id,
  name: z.string().min(1),
  effect: z.string().min(1),
});

export const traitsContentSchema = z.object({
  visible: z.array(traitSchema).min(1),
  hidden: z.array(traitSchema).min(1),
});

// ── Postaci ─────────────────────────────────────────────────────────────────

export const voiceCardSchema = z.object({
  register: z.string().min(1),
  habits: z.array(z.string()).default([]),
  neverSays: z.array(z.string()).default([]),
});

export const characterContentSchema = z.object({
  id,
  name: z.string().min(1),
  faction: factionIdSchema,
  role: z.string().min(1),
  competence: z.number().int().min(1).max(5),
  loyalty: z.number().int().min(-3).max(3),
  ambition: z.number().int().min(1).max(5),
  traits: z.array(id).min(1).max(3),
  hiddenTraits: z.array(id).default([]),
  /** Krótki opis dla Mistrza Gry. Nie trafia do widoku gracza. */
  dmNote: z.string().optional(),
  voice: voiceCardSchema,
});

export const charactersContentSchema = z.object({
  characters: z.array(characterContentSchema).min(1),
});

// ── Rejestr Następstw: wpisy startowe ───────────────────────────────────────

export const registryTypeSchema = z.enum(['debt', 'promise', 'secret', 'grudge', 'hook', 'precedent', 'merit']);

export const registryEntryContentSchema = z.object({
  id: z.string().regex(/^R-\d{4}$/, 'identyfikator wpisu Rejestru, np. R-0001'),
  type: registryTypeSchema,
  title: z.string().min(1),
  /** Kto wie (identyfikatory postaci, frakcji albo "anderson"). */
  knownBy: z.array(z.string().min(1)).min(1),
  hiddenFrom: z.array(z.string().min(1)).default([]),
  weight: z.number().int().min(1).max(3),
  /** Ciśnienie Ujawnienia 0–6, tylko dla tajemnic (GDD 12.4). */
  pressure: z.number().int().min(0).max(6).optional(),
  triggers: z.array(z.string().min(1)).default([]),
  visibleToPlayer: z.boolean(),
  dmNote: z.string().optional(),
});

export const registryContentSchema = z.object({
  entries: z.array(registryEntryContentSchema).default([]),
});

// ── Całość ──────────────────────────────────────────────────────────────────

export type CampaignContent = z.infer<typeof campaignContentSchema>;
export type FactionContent = z.infer<typeof factionContentSchema>;
export type TraitContent = z.infer<typeof traitSchema>;
export type CharacterContent = z.infer<typeof characterContentSchema>;
export type RegistryEntryContent = z.infer<typeof registryEntryContentSchema>;

export interface GameContent {
  campaign: CampaignContent;
  factions: FactionContent[];
  traits: z.infer<typeof traitsContentSchema>;
  characters: CharacterContent[];
  registry: RegistryEntryContent[];
}

/** Pliki treści i ich schematy — wspólna lista dla loadera i testów. */
export const CONTENT_FILES = {
  campaign: { file: 'campaign.yaml', schema: campaignContentSchema },
  factions: { file: 'factions.yaml', schema: factionsContentSchema },
  traits: { file: 'traits.yaml', schema: traitsContentSchema },
  characters: { file: 'characters.yaml', schema: charactersContentSchema },
  registry: { file: 'registry.yaml', schema: registryContentSchema },
} as const;
