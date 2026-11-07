/**
 * Schematy TREŚCI systemu wydarzeń świata (decyzja 0015, docs/design/wydarzenia-swiata.md).
 *
 * Zamiast rocznych plików wydarzeń treść opisuje MECHANIZMY, z których silnik sam
 * składa kolejne lata:
 *   - wątki świata (historyczne procesy z etapami i gałęziami),
 *   - szablony wątków (te same mechanizmy z parametrami, na świat po rozejściu z historią),
 *   - wzorce (zdarzenia bez daty, z warunkami),
 *   - dylematy (zdarzenia czekające na decyzję Andersona),
 *   - kotwice (wątki z jedną gałęzią w każdym etapie — rzeczy pewne).
 *
 * Warunki i skutki są USTRUKTURYZOWANE (obiekty YAML), a nie wyrażeniami tekstowymi:
 * zod sprawdza je przy wczytaniu, a silnik nie musi niczego parsować ani wykonywać.
 */
import { z } from 'zod';
import { factionIdSchema } from '../content/schema.ts';

const id = z.string().regex(/^[a-z0-9][a-z0-9_-]*$/, 'identyfikator: małe litery, cyfry, "-" lub "_" (np. "abadan")');
const quarterCode = z.string().regex(/^\d{4}-Q[1-4]$/, 'kod kwartału, np. 1951-Q1');

export const INDICATOR_IDS = ['ZW', 'SO', 'PP', 'WF', 'NG'] as const;
export type IndicatorId = (typeof INDICATOR_IDS)[number];

export const COMPARISON_OPS = ['<', '<=', '>', '>=', '==', '!='] as const;
export type ComparisonOp = (typeof COMPARISON_OPS)[number];

// ── Warunki ─────────────────────────────────────────────────────────────────

/**
 * Warunek. Jeden klucz decyduje o rodzaju:
 *   all / any / not          — logika,
 *   var                      — zmienna świata (data/events/world.yaml),
 *   indicator                — wskaźnik ZW, SO, PP, WF albo NG,
 *   divergence               — Rozbieżność regionu (0–10),
 *   after / before           — okno czasu (after: od kwartału włącznie, before: przed kwartałem),
 *   flag                     — flaga świata ustawiona przez wcześniejszy skutek,
 *   stage                    — wątek przeszedł etap: "wątek.etap",
 *   branch                   — w etapie wybrano gałąź: "wątek.etap.gałąź".
 */
export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { var: string; op: ComparisonOp; value: number }
  | { indicator: IndicatorId; op: ComparisonOp; value: number }
  | { divergence: string; op: ComparisonOp; value: number }
  | { after: string }
  | { before: string }
  | { flag: string }
  | { stage: string }
  | { branch: string };

const op = z.enum(COMPARISON_OPS);

export const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(conditionSchema).min(1) }).strict(),
    z.object({ any: z.array(conditionSchema).min(1) }).strict(),
    z.object({ not: conditionSchema }).strict(),
    z.object({ var: id, op, value: z.number() }).strict(),
    z.object({ indicator: z.enum(INDICATOR_IDS), op, value: z.number() }).strict(),
    z.object({ divergence: id, op, value: z.number() }).strict(),
    z.object({ after: quarterCode }).strict(),
    z.object({ before: quarterCode }).strict(),
    z.object({ flag: id }).strict(),
    z.object({ stage: z.string().regex(/^[a-z0-9_-]+\.[a-z0-9_-]+$/, 'odwołanie do etapu: "wątek.etap"') }).strict(),
    z
      .object({
        branch: z.string().regex(/^[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+$/, 'odwołanie do gałęzi: "wątek.etap.gałąź"'),
      })
      .strict(),
  ]),
);

// ── Skutki ──────────────────────────────────────────────────────────────────

/**
 * Skutek zdarzenia. Każdy przechodzi test trzech dróg (zasada Z2): zmienia świat,
 * stan polityczny albo coś, co wraca do KSP (Korekta).
 */
export const effectSchema = z.union([
  /** Zmiana zmiennej świata (przycinana do min/max ze świata). */
  z.object({ var: id, add: z.number().optional(), set: z.number().optional() }).strict(),
  /** Zmiana wskaźnika (przycinana do zakresu wskaźnika). */
  z.object({ indicator: z.enum(INDICATOR_IDS), add: z.number().int() }).strict(),
  /** Zmiana Rozbieżności regionu. */
  z.object({ divergence: id, add: z.number() }).strict(),
  /** Nastawienie frakcji do Andersona (−3…+3). */
  z.object({ faction: factionIdSchema, disposition: z.number().int() }).strict(),
  /** Kapitał Polityczny. */
  z.object({ currency: z.literal('KP'), add: z.number().int() }).strict(),
  z.object({ flag: id }).strict(),
  z.object({ clearFlag: id }).strict(),
  /**
   * Korekta bieżąca w jednostkach (decyzja 0012: jednostka = 20% miesięcznych wynagrodzeń PACE).
   * Ujemna to koszt. `quarters` > 1 oznacza Korektę powtarzaną co kwartał.
   */
  z
    .object({
      correction: z.object({
        units: z.number(),
        quarters: z.number().int().min(1).default(1),
        reason: z.string().min(1),
      }),
    })
    .strict(),
]);
export type Effect = z.infer<typeof effectSchema>;

const visibility = z.enum(['public', 'secret']);

// ── Wątki i szablony ────────────────────────────────────────────────────────

export const weightModifierSchema = z
  .object({
    when: conditionSchema,
    /** Dodaj do wagi (po mnożeniu). */
    add: z.number().optional(),
    /** Pomnóż wagę. */
    mul: z.number().min(0).optional(),
  })
  .strict();

export type WeightModifier = z.infer<typeof weightModifierSchema>;

export const branchSchema = z
  .object({
    id,
    title: z.string().min(1),
    /** Gałąź zgodna z historią. Rozbieżność regionu działa na wagi gałęzi historycznych i pozostałych. */
    historical: z.boolean().default(false),
    weight: z.number().min(0),
    modifiers: z.array(weightModifierSchema).default([]),
    /** Gałąź dostępna tylko przy spełnionym warunku. */
    requires: conditionSchema.optional(),
    effects: z.array(effectSchema).default([]),
    /** Tekst do Kroniki i dla narratora. Parametry szablonu w nawiasach klamrowych, np. {kraj}. */
    text: z.string().min(1),
    visibility: visibility.optional(),
    /** Następny etap albo "end". Brak = następny etap na liście. */
    next: z.string().optional(),
    /** Opóźnienie: ten sam etap wraca po N kwartałach (gałąź „opóźniona”). */
    delayQuarters: z.number().int().min(1).optional(),
    /** Przyspieszenie: następny etap o N kwartałów wcześniej niż jego data historyczna. */
    advanceNext: z.number().int().min(1).optional(),
  })
  .strict();

export const stageSchema = z
  .object({
    id,
    title: z.string().min(1),
    /** Kwartał, w którym etap rozstrzyga się w historii. Dla szablonów: przesunięcie od startu (`offset`). */
    at: quarterCode.optional(),
    offset: z.number().int().min(0).optional(),
    /** Etap spoza historii (osiągalny tylko przez gałąź alternatywną) — nie potrzebuje gałęzi historycznej. */
    alternative: z.boolean().default(false),
    branches: z.array(branchSchema).min(1),
  })
  .strict();

export const threadContentSchema = z
  .object({
    id,
    title: z.string().min(1),
    /** historical — wątek z historii z gałęziami; anchor — kotwica, w każdym etapie jedna gałąź. */
    kind: z.enum(['historical', 'anchor']),
    region: id,
    summary: z.string().min(1),
    /** Co się wydarzyło naprawdę (dla autora treści i dla narratora). */
    historicalNote: z.string().min(1),
    /** Siły napędowe — dokumentacja: które zmienne przesuwają gałęzie. */
    drivers: z.array(z.string().min(1)).default([]),
    visibility: visibility.default('public'),
    start: z
      .object({
        from: quarterCode,
        conditions: conditionSchema.optional(),
      })
      .strict(),
    stages: z.array(stageSchema).min(1),
  })
  .strict();
export type ThreadContent = z.infer<typeof threadContentSchema>;
export type StageContent = z.infer<typeof stageSchema>;
export type BranchContent = z.infer<typeof branchSchema>;

export const threadTemplateContentSchema = z
  .object({
    id,
    title: z.string().min(1),
    region: id,
    summary: z.string().min(1),
    drivers: z.array(z.string().min(1)).default([]),
    visibility: visibility.default('public'),
    /** Parametry losowane przy uruchomieniu, np. kraj. */
    params: z.record(id, z.array(z.string().min(1)).min(1)).default({}),
    /** Kiedy szablon może się uruchomić. */
    conditions: conditionSchema.optional(),
    chancePerQuarter: z.number().min(0).max(1),
    chanceModifiers: z.array(weightModifierSchema).default([]),
    cooldownQuarters: z.number().int().min(0).default(8),
    maxInstances: z.number().int().min(1).default(3),
    stages: z.array(stageSchema).min(1),
  })
  .strict();
export type ThreadTemplateContent = z.infer<typeof threadTemplateContentSchema>;

// ── Wzorce i dylematy ───────────────────────────────────────────────────────

export const patternContentSchema = z
  .object({
    id,
    title: z.string().min(1),
    category: z.enum(['economic', 'technical', 'social', 'political', 'military']),
    region: id.optional(),
    conditions: conditionSchema.optional(),
    chancePerQuarter: z.number().min(0).max(1),
    chanceModifiers: z.array(weightModifierSchema).default([]),
    cooldownQuarters: z.number().int().min(0).default(4),
    maxTotal: z.number().int().min(1).optional(),
    effects: z.array(effectSchema).default([]),
    text: z.string().min(1),
    visibility: visibility.default('public'),
    /** Źródło w materiałach autora, np. „wydarzenia 1951, nr 21”. */
    source: z.string().optional(),
  })
  .strict();
export type PatternContent = z.infer<typeof patternContentSchema>;

export const dilemmaOptionSchema = z
  .object({
    id,
    title: z.string().min(1),
    effects: z.array(effectSchema).default([]),
    text: z.string().min(1),
  })
  .strict();

export const dilemmaContentSchema = z
  .object({
    id,
    title: z.string().min(1),
    region: id.optional(),
    conditions: conditionSchema.optional(),
    chancePerQuarter: z.number().min(0).max(1),
    cooldownQuarters: z.number().int().min(0).default(8),
    once: z.boolean().default(false),
    /** Treść karty decyzji na Biurku. */
    prompt: z.string().min(1),
    options: z.array(dilemmaOptionSchema).min(2),
    /** Opcja przyjmowana, gdy Anderson nie zdecyduje przed terminem. */
    defaultOption: id,
    expiresAfterQuarters: z.number().int().min(1).default(1),
    source: z.string().optional(),
  })
  .strict();
export type DilemmaContent = z.infer<typeof dilemmaContentSchema>;

// ── Świat ───────────────────────────────────────────────────────────────────

export const worldVariableSchema = z
  .object({
    id,
    title: z.string().min(1),
    min: z.number(),
    max: z.number(),
    initial: z.number(),
    description: z.string().min(1),
  })
  .strict()
  .refine((v) => v.min <= v.initial && v.initial <= v.max, { message: 'wartość początkowa poza zakresem min–max' });

export const worldDefinitionSchema = z
  .object({
    regions: z.array(z.object({ id, title: z.string().min(1) }).strict()).min(1),
    variables: z.array(worldVariableSchema).min(1),
    /** Najwięcej dylematów oczekujących naraz (żeby nie zasypać Biurka). */
    maxPendingDilemmas: z.number().int().min(1).default(2),
  })
  .strict();

export const patternsFileSchema = z.object({ patterns: z.array(patternContentSchema).default([]) }).strict();
export const dilemmasFileSchema = z.object({ dilemmas: z.array(dilemmaContentSchema).default([]) }).strict();

export interface WorldContent {
  definition: z.infer<typeof worldDefinitionSchema>;
  threads: ThreadContent[];
  templates: ThreadTemplateContent[];
  patterns: PatternContent[];
  dilemmas: DilemmaContent[];
}

/**
 * Pliki i foldery treści świata (względem data/).
 * W folderach threads/ i templates/ każdy plik YAML to jeden wątek albo jeden szablon.
 */
export const WORLD_CONTENT_PATHS = {
  definition: 'events/world.yaml',
  threadsDir: 'events/threads',
  templatesDir: 'events/templates',
  patterns: 'events/patterns.yaml',
  dilemmas: 'events/dilemmas.yaml',
} as const;
