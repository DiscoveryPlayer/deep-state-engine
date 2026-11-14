/**
 * Schematy TREŚCI systemu wydarzeń świata (decyzja 0015, docs/design/wydarzenia-swiata.md).
 *
 * Zamiast rocznych plików wydarzeń treść opisuje MECHANIZMY, z których silnik sam
 * składa kolejne lata:
 *   - wątki świata (historyczne procesy z etapami i gałęziami),
 *   - szablony wątków (te same mechanizmy z parametrami, na świat po rozejściu z historią),
 *   - wzorce (zdarzenia bez daty, z warunkami),
 *   - dylematy (zdarzenia czekające na decyzję Andersona),
 *   - kotwice (etapy z jedną gałęzią — rzeczy pewne).
 *
 * Wątek głęboki (decyzje 0016 i 0017) ma siedem warstw: punkty zwrotne (gałęzie),
 * depesze (etapy z jedną gałęzią, także kilka w kwartale), sytuacje trwające (`ongoing`),
 * reakcje stron (`reactions`), pogłoski wywiadu (`rumor`), decyzje Andersona (`decision`)
 * i echa (flagi oraz wątki reaktywne).
 *
 * Warunki i skutki są USTRUKTURYZOWANE (obiekty YAML), a nie wyrażeniami tekstowymi:
 * zod sprawdza je przy wczytaniu, a silnik nie musi niczego parsować ani wykonywać.
 */
import { z } from 'zod';
import { factionIdSchema, registryTypeSchema } from '../content/schema.ts';

const id = z.string().regex(/^[a-z0-9][a-z0-9_-]*$/, 'identyfikator: małe litery, cyfry, "-" lub "_" (np. "abadan")');
const quarterCode = z.string().regex(/^\d{4}-Q[1-4]$/, 'kod kwartału, np. 1951-Q1');

export const INDICATOR_IDS = ['ZW', 'SO', 'PP', 'WF', 'NG'] as const;
export type IndicatorId = (typeof INDICATOR_IDS)[number];

export const ERA_IDS = ['I', 'II', 'III', 'IV'] as const;
export type EraId = (typeof ERA_IDS)[number];

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
 *   branch                   — w etapie wybrano gałąź: "wątek.etap.gałąź",
 *   era                      — epoka kampanii (GDD 4.4), np. { era: II, op: '>=' }.
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
  | { branch: string }
  | { era: EraId; op: ComparisonOp }
  | { registry: string };

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
    z.object({ era: z.enum(ERA_IDS), op }).strict(),
    /** Czy w Rejestrze Następstw jest aktywny wpis o tym kluczu. */
    z.object({ registry: id }).strict(),
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
  /**
   * Echo: dalszy ciąg, który silnik wywoła za `after` kwartałów (decyzja 0019).
   * Definicje ech są w `events/echoes.yaml`.
   */
  z.object({ echo: id, after: z.number().int().min(1).max(12) }).strict(),
  /**
   * Wpis Rejestru Następstw (GDD 12). `visible: false` tworzy wpis ukryty: gracz go nie widzi,
   * ale warunki i echa mogą się do niego odwołać przez `key`.
   */
  z
    .object({
      registry: z
        .object({
          key: id,
          type: registryTypeSchema,
          title: z.string().min(1),
          /** Kto wie albo kogo wpis dotyczy (postaci, frakcje, „anderson”). */
          with: z.array(z.string().min(1)).default(['anderson']),
          weight: z.number().int().min(1).max(3).default(1),
          visible: z.boolean().default(true),
          note: z.string().optional(),
        })
        .strict(),
    })
    .strict(),
  /** Zamyka aktywny wpis Rejestru o danym kluczu: rozliczony (`resolved`) albo ujawniony (`revealed`). */
  z.object({ registryClose: id, as: z.enum(['resolved', 'revealed']).default('resolved') }).strict(),
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

/** Rodzaje gałęzi (Dossier III, część I, punkt 2). */
export const BRANCH_KINDS = ['historical', 'accelerated', 'delayed', 'interrupted', 'alternative'] as const;
export type BranchKind = (typeof BRANCH_KINDS)[number];

/** Głos jednej ze stron przy etapie: osobna depesza bez rozgałęzienia. */
export const reactionSchema = z
  .object({
    /** Kto mówi, np. „Londyn”, „Moskwa”, „DPO”. */
    actor: z.string().min(1),
    text: z.string().min(1),
    effects: z.array(effectSchema).default([]),
    visibility: visibility.optional(),
  })
  .strict();

/**
 * Sytuacja trwająca: skutki naliczane co kwartał (od kwartału po starcie), dopóki wątek
 * nie przejdzie etapu `until`, nie skończy się albo nie minie `maxQuarters`.
 */
export const ongoingSchema = z
  .object({
    title: z.string().min(1),
    text: z.string().min(1),
    effects: z.array(effectSchema).min(1),
    /** Etap, po którego rozstrzygnięciu sytuacja wygasa. Brak = do końca wątku albo `maxQuarters`. */
    until: z.string().optional(),
    maxQuarters: z.number().int().min(1).max(40).default(8),
  })
  .strict();

export const branchSchema = z
  .object({
    id,
    title: z.string().min(1),
    /** Gałąź zgodna z historią. Rozbieżność regionu działa na wagi gałęzi historycznych i pozostałych. */
    historical: z.boolean().default(false),
    /**
     * Drobne odchylenie od historii (np. krótszy strajk): gałąź niehistoryczna, która
     * NIE podnosi Rozbieżności regionu.
     */
    minor: z.boolean().default(false),
    /** Jawny rodzaj gałęzi. Brak = silnik wyprowadza go z mechaniki (funkcja branchKind). */
    kind: z.enum(BRANCH_KINDS).optional(),
    reactions: z.array(reactionSchema).default([]),
    ongoing: ongoingSchema.optional(),
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

export const RELIABILITY_CODES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export const ASSESSMENT_SOURCES = ['open', 'sigint', 'humint', 'imint_air', 'imint_sat', 'allies'] as const;

/**
 * Pogłoska wywiadu: zanim etap się rozstrzygnie, do Andersona trafia Ocena wywiadowcza
 * (GDD 16.2). Pogłoska mówi to, co wywiad UWAŻA — jeśli wypadnie inna gałąź, okaże się fałszywa.
 */
export const rumorSchema = z
  .object({
    quartersBefore: z.number().int().min(1).max(4).default(1),
    reliability: z.enum(RELIABILITY_CODES).default('C'),
    credibility: z.number().int().min(1).max(6).default(3),
    source: z.enum(ASSESSMENT_SOURCES).default('humint'),
    topic: z.string().min(1).optional(),
    text: z.string().min(1),
  })
  .strict();

const weightShift = z.object({ mul: z.number().min(0).optional(), add: z.number().optional() }).strict();

export const decisionOptionSchema = z
  .object({
    id,
    title: z.string().min(1),
    effects: z.array(effectSchema).default([]),
    text: z.string().min(1),
    /** Jak wybór zmienia wagi gałęzi etapu: identyfikator gałęzi → mnożnik albo dodatek. */
    weights: z.record(id, weightShift).default({}),
  })
  .strict();

/** Punkt decyzyjny etapu: Anderson decyduje PRZED losowaniem gałęzi. */
export const stageDecisionSchema = z
  .object({
    title: z.string().min(1).optional(),
    prompt: z.string().min(1),
    options: z.array(decisionOptionSchema).min(2),
    defaultOption: id,
    inactionEffects: z.array(effectSchema).default([]),
    /** Ile kwartałów przed etapem sprawa trafia na Biurko. */
    quartersBefore: z.number().int().min(1).max(4).default(1),
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
    /** Kotwica: rzecz pewna. Etap ma dokładnie jedną gałąź, historyczną. */
    anchor: z.boolean().default(false),
    /** Etap rozstrzyga się w tym samym kwartale co poprzedni (kilka depesz naraz). */
    sameQuarter: z.boolean().default(false),
    rumor: rumorSchema.optional(),
    decision: stageDecisionSchema.optional(),
    branches: z.array(branchSchema).min(1),
  })
  .strict();

export const threadContentSchema = z
  .object({
    id,
    title: z.string().min(1),
    /**
     * historical — wątek z historii: etapy mają daty (`at`) i gałąź historyczną.
     * reactive — wątek-echo albo wątek reaktywny: startuje od warunku (zwykle flagi),
     *   etapy liczą się od startu (`offset`), a Rozbieżność nie rośnie sama.
     */
    kind: z.enum(['historical', 'reactive']),
    /** Naraz w regionie trwa najwyżej jeden wątek albo szablon z danej grupy. */
    exclusiveGroup: id.optional(),
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
export type StageDecision = z.infer<typeof stageDecisionSchema>;

/** Rodzaj gałęzi: jawny (`kind`) albo wyprowadzony z mechaniki. */
export function branchKind(branch: BranchContent): BranchKind {
  if (branch.kind) return branch.kind;
  if (branch.historical) return 'historical';
  if (branch.delayQuarters !== undefined) return 'delayed';
  if (branch.advanceNext !== undefined) return 'accelerated';
  if (branch.next === 'end') return 'interrupted';
  return 'alternative';
}

/** Wartość parametru szablonu: tekst albo formy (klucz `mian` to forma podstawowa). */
export const templateParamValueSchema = z.union([z.string().min(1), z.record(id, z.string().min(1))]);
export type TemplateParamValue = z.infer<typeof templateParamValueSchema>;

/** Wzorzec miejsca na parametr w tekście: {kraj} albo {kraj.dop}. */
export const PARAM_PLACEHOLDER = /\{([a-z0-9_]+(?:\.[a-z0-9_]+)?)\}/g;

export const threadTemplateContentSchema = z
  .object({
    id,
    title: z.string().min(1),
    region: id,
    summary: z.string().min(1),
    drivers: z.array(z.string().min(1)).default([]),
    visibility: visibility.default('public'),
    /** Parametry losowane przy uruchomieniu, np. kraj. */
    /**
     * Parametry losowane przy starcie instancji. Wartość to tekst albo odmiana przez przypadki,
     * np. { mian: Kuwejt, dop: Kuwejtu, miejsc: Kuwejcie }. W tekstach: {kraj} (mianownik)
     * albo {kraj.dop}, {kraj.miejsc} itd.
     */
    params: z.record(id, z.array(templateParamValueSchema).min(1)).default({}),
    /** Kiedy szablon może się uruchomić. */
    conditions: conditionSchema.optional(),
    chancePerQuarter: z.number().min(0).max(1),
    chanceModifiers: z.array(weightModifierSchema).default([]),
    cooldownQuarters: z.number().int().min(0).default(8),
    maxInstances: z.number().int().min(1).default(3),
    /** Wątki historyczne, które są przypadkami tego szablonu. Dopóki któryś trwa, szablon milczy. */
    historicalInstances: z.array(id).default([]),
    /** Naraz w regionie trwa najwyżej jeden wątek albo szablon z danej grupy. */
    exclusiveGroup: id.optional(),
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
    /**
     * Koszt bierności: skutki doliczane TYLKO wtedy, gdy Anderson przegapi termin.
     * Świadomy wybór tej samej opcji domyślnej ich nie ponosi — bierność bywa rozsądna,
     * zaniedbanie nie (odpowiedź autora z 7.11.2026).
     */
    inactionEffects: z.array(effectSchema).default([]),
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

// ── Echa ────────────────────────────────────────────────────────────────────

/**
 * Echo: krótkie wydarzenie, które wraca po decyzji albo rozstrzygnięciu. Trafia do kolejki
 * skutkiem `echo` i odpala się w wyznaczonym kwartale.
 */
export const echoContentSchema = z
  .object({
    id,
    /**
     * Źródła, po których echo samo staje w kolejce: „dylemat.opcja”, „dylemat.biernosc”,
     * „wątek.etap.opcja” (decyzja etapu), „wątek.etap.gałąź” albo identyfikator wzorca.
     * Puste, gdy echo wstawia do kolejki skutek `echo` albo sam silnik.
     */
    on: z.array(z.string().min(1)).default([]),
    /** Po ilu kwartałach od źródła echo wraca. 0 działa od razu i wymaga `silent`. */
    after: z.number().int().min(0).max(12).default(2),
    /** Echo ciche: stosuje skutki (np. wpis Rejestru) bez depeszy. */
    silent: z.boolean().default(false),
    title: z.string().min(1),
    text: z.string().min(1),
    effects: z.array(effectSchema).default([]),
    visibility: visibility.default('public'),
    /** Warunek sprawdzany w kwartale terminu. Niespełniony: echo przepada albo idzie wariant `otherwise`. */
    requires: conditionSchema.optional(),
    /** Szansa odpalenia (losowana raz, w kwartale terminu). */
    chance: z.number().min(0).max(1).default(1),
    otherwise: z
      .object({ title: z.string().min(1), text: z.string().min(1), effects: z.array(effectSchema).default([]) })
      .strict()
      .optional(),
    region: id.optional(),
    source: z.string().optional(),
  })
  .strict();
export type EchoContent = z.infer<typeof echoContentSchema>;
export const echoesFileSchema = z.object({ echoes: z.array(echoContentSchema).default([]) }).strict();

export interface WorldContent {
  definition: z.infer<typeof worldDefinitionSchema>;
  threads: ThreadContent[];
  templates: ThreadTemplateContent[];
  patterns: PatternContent[];
  dilemmas: DilemmaContent[];
  /** Echa decyzji (opcjonalne: świat bez pliku `echoes.yaml` nie ma ech). */
  echoes?: EchoContent[];
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
  echoes: 'events/echoes.yaml',
} as const;
