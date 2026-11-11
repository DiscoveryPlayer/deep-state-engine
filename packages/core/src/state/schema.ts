/**
 * Schemat STANU KAMPANII — tego, co silnik zapisuje po każdym kwartale.
 *
 * Zasada Z4 (GDD 2): stan zawiera warstwę faktyczną. Gracz i AI widzą tylko to,
 * co przepuści projekcja z pliku view/playerView.ts. Pola oznaczone jako ukryte
 * nigdy nie mogą trafić do interfejsu ani do Pakietu Kontekstu bez tej projekcji.
 *
 * Każda zmiana kształtu stanu wymaga podniesienia STATE_SCHEMA_VERSION
 * i wpisu w docs/decisions/.
 */
import { z } from 'zod';
import { factionIdSchema, registryTypeSchema } from '../content/schema.ts';

/**
 * Wersja 2: dodany stan świata `world` (decyzja 0015).
 * Wersja 3: wątki głębokie (sytuacje, pogłoski, decyzje etapów), budżet, Biurko, raporty,
 * migawki KSP i status kampanii (decyzja 0017). Migracje w migrate.ts.
 */
export const STATE_SCHEMA_VERSION = 3 as const;

const quarterSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  q: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

const pct = z.number().int().min(0).max(100);

export const indicatorsSchema = z.object({
  /** Zaufanie Waszyngtonu. 0 = odwołanie Andersona. */
  ZW: pct,
  /** Spójność Organizacji. 0 = rozpad. */
  SO: pct,
  /** Poparcie Publiczne. */
  PP: pct,
  /** Wiarygodność Fasady. */
  WF: pct,
  /** Napięcie Geopolityczne, skala odwrócona 5 (odprężenie) → 1 (krawędź). */
  NG: z.number().int().min(1).max(5),
});

export const currenciesSchema = z.object({
  /** Uwaga Dowódcy — punkty akcji na bieżący kwartał. */
  UD: z.number().int().min(0).max(8),
  /** Kapitał Polityczny. */
  KP: z.number().int().min(0).max(20),
});

const axis = z.number().int().min(-10).max(10);
export const styleSchema = z.object({
  /** Ostrożny (−) … Hazardzista (+). */
  risk: axis,
  /** Otwarty (−) … Skryty (+). */
  openness: axis,
  /** Opiekun (−) … Bezwzględny (+). */
  loyalty: axis,
  /** Technokrata (−) … Polityk (+). */
  orientation: axis,
});

export const clockSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(['patience', 'crisis', 'intrigue', 'soviet_project', 'press', 'congress', 'fatigue']),
    label: z.string().min(1),
    segments: z.union([z.literal(4), z.literal(6), z.literal(8)]),
    filled: z.number().int().min(0),
    visibility: z.enum(['visible', 'partial', 'hidden']),
    /** Do kogo należy zegar, np. identyfikator frakcji albo postaci. */
    owner: z.string().optional(),
  })
  .refine((c) => c.filled <= c.segments, { message: 'zegar ma więcej wypełnionych segmentów, niż ma segmentów' });

export const factionStateSchema = z.object({
  id: factionIdSchema,
  influence: z.number().int().min(1).max(5),
  /** Nastawienie do Andersona −3…+3. */
  disposition: z.number().int().min(-3).max(3),
  agenda: z.string().min(1),
  /** Czy Anderson zna bieżącą agendę (np. po Spotkaniu). */
  agendaKnown: z.boolean(),
  /** Stopień eskalacji 0 (spokój) … 4 (Bunt), GDD 7.1. */
  escalation: z.number().int().min(0).max(4),
  patienceClockId: z.string().min(1),
});

export const characterStateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  faction: factionIdSchema,
  role: z.string().min(1),
  status: z.enum(['active', 'on_leave', 'departed', 'dead']),
  competence: z.number().int().min(1).max(5),
  loyalty: z.number().int().min(-3).max(3),
  ambition: z.number().int().min(1).max(5),
  traits: z.array(z.string()),
  /** UKRYTE: cechy tajne (Warstwa Personelu, DD 7.2). */
  hiddenTraits: z.array(z.string()),
  /** Ukryte cechy już ujawnione graczowi. */
  revealedTraits: z.array(z.string()),
  /** UKRYTE: notatka dla Mistrza Gry. */
  dmNote: z.string().optional(),
});

export const registryEntryStateSchema = z.object({
  id: z.string().regex(/^R-\d{4}$/),
  type: registryTypeSchema,
  title: z.string().min(1),
  knownBy: z.array(z.string()),
  hiddenFrom: z.array(z.string()),
  weight: z.number().int().min(1).max(3),
  pressure: z.number().int().min(0).max(6).optional(),
  triggers: z.array(z.string()),
  createdIn: z.string().regex(/^\d{4}-Q[1-4]$/),
  visibleToPlayer: z.boolean(),
  status: z.enum(['active', 'resolved', 'revealed']),
  dmNote: z.string().optional(),
});

export const directiveStateSchema = z.object({
  id: z.string().regex(/^D-\d+$/),
  issuer: z.string().min(1),
  goal: z.string().min(1),
  verification: z.enum(['W', 'R', 'D']),
  deadline: z.string().regex(/^\d{4}-Q[1-4]$/),
  status: z.enum(['proposed', 'active', 'completed', 'failed', 'rejected']),
});

/** Ocena wywiadowcza (GDD 16.2) — element WARSTWY WIEDZY. */
export const assessmentSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  text: z.string().min(1),
  source: z.enum(['open', 'sigint', 'humint', 'imint_air', 'imint_sat', 'allies']),
  reliability: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
  credibility: z.number().int().min(1).max(6),
  quarter: z.string().regex(/^\d{4}-Q[1-4]$/),
});

export const chronicleEntrySchema = z.object({
  quarter: z.string().regex(/^\d{4}-Q[1-4]$/),
  text: z.string().min(1),
  tags: z.array(z.string()),
});

const qcode = z.string().regex(/^\d{4}-Q[1-4]$/);

/** Instancja wątku świata (z wątku historycznego albo z szablonu). UKRYTE przed graczem. */
export const threadInstanceSchema = z.object({
  /** Identyfikator wątku albo szablonu w treści. */
  def: z.string().min(1),
  fromTemplate: z.boolean(),
  /** Parametry wylosowane dla szablonu, np. { kraj: "Irak" }. */
  params: z.record(z.string(), z.string()),
  startedIn: qcode,
  status: z.enum(['active', 'ended']),
  /** Bieżący etap; null po zakończeniu. */
  stage: z.string().nullable(),
  /** Kiedy silnik sprawdzi bieżący etap. */
  nextCheck: qcode.nullable(),
  history: z.array(z.object({ quarter: qcode, stage: z.string(), branch: z.string(), historical: z.boolean() })),
  /** Etapy, dla których pogłoska wywiadu już wyszła. */
  rumors: z.array(z.string()),
  /** Etapy, których punkt decyzyjny trafił już na Biurko. */
  asked: z.array(z.string()),
  /** Decyzje Andersona w etapach: etap → opcja. */
  decisions: z.record(z.string(), z.string()),
});

export const worldLogEntrySchema = z.object({
  quarter: qcode,
  kind: z.enum(['thread', 'template', 'pattern', 'dilemma', 'reaction', 'situation']),
  /** Dla reakcji: kto mówi. */
  actor: z.string().optional(),
  /** Odwołanie: "wątek.etap.gałąź", identyfikator wzorca albo dylematu. */
  ref: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
  visibility: z.enum(['public', 'secret']),
  /** Dla gałęzi wątków: czy zgodna z historią. */
  historical: z.boolean().optional(),
});

export const pendingDilemmaSchema = z.object({
  instanceId: z.string().min(1),
  dilemma: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  options: z.array(z.object({ id: z.string().min(1), title: z.string().min(1) })),
  defaultOption: z.string().min(1),
  raisedIn: qcode,
  expiresIn: qcode,
  /** Dla punktu decyzyjnego etapu: instancja wątku i etap. Brak = dylemat samodzielny. */
  source: z.object({ thread: z.string().min(1), stage: z.string().min(1) }).optional(),
});

/** Sytuacja trwająca (skutki co kwartał). Treść skutków silnik bierze z gałęzi wątku. */
export const situationSchema = z.object({
  id: z.string().min(1),
  /** Instancja wątku, etap i gałąź, z której pochodzi sytuacja. */
  thread: z.string().min(1),
  stage: z.string().min(1),
  branch: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
  startedIn: qcode,
  until: z.string().nullable(),
  remaining: z.number().int().min(0),
});

export const correctionEntrySchema = z.object({
  /** Kwartał pierwszego zastosowania. */
  from: qcode,
  quarters: z.number().int().min(1),
  /** Jednostki Korekty na kwartał (decyzja 0012). */
  units: z.number(),
  reason: z.string().min(1),
  source: z.string().min(1),
});

/**
 * Stan świata (decyzja 0015). Prawie wszystko UKRYTE: gracz widzi tylko publiczne wpisy
 * dziennika i oczekujące dylematy (view/playerView.ts).
 */
export const worldStateSchema = z.object({
  vars: z.record(z.string(), z.number()),
  /** Rozbieżność regionów 0–10. */
  divergence: z.record(z.string(), z.number().min(0).max(10)),
  flags: z.array(z.string()),
  threads: z.record(z.string(), threadInstanceSchema),
  patternLog: z.record(z.string(), z.object({ count: z.number().int().min(0), last: qcode })),
  templateLog: z.record(z.string(), z.object({ count: z.number().int().min(0), last: qcode })),
  dilemmaLog: z.record(z.string(), z.object({ count: z.number().int().min(0), last: qcode })),
  pendingDilemmas: z.array(pendingDilemmaSchema),
  situations: z.array(situationSchema),
  corrections: z.array(correctionEntrySchema),
  log: z.array(worldLogEntrySchema),
  /** Licznik do identyfikatorów instancji (szablony, dylematy). */
  seq: z.number().int().min(0),
});

// ── Budżet, Biurko, raporty, KSP (decyzja 0017) ─────────────────────────────

export const budgetLedgerEntrySchema = z.object({
  quarter: qcode,
  /** Suma Korekt kwartału w jednostkach (decyzja 0012). */
  units: z.number(),
  /** Wartość jednostki w funduszach KSP w chwili rozliczenia; null, gdy brak migawki kariery. */
  unitFunds: z.number().nullable(),
  items: z.array(z.object({ reason: z.string().min(1), source: z.string().min(1), units: z.number() })),
  /** Tryb Honorowy: czy gracz potwierdził zastosowanie Korekty w KSP. */
  settled: z.boolean(),
});

export const budgetStateSchema = z.object({
  ledger: z.array(budgetLedgerEntrySchema),
});

export const deskActionRecordSchema = z.object({
  quarter: qcode,
  action: z.string().min(1),
  target: z.string().optional(),
  summary: z.string().min(1),
});

const indicatorSnapshot = z.object({ ZW: z.number(), SO: z.number(), PP: z.number(), WF: z.number(), NG: z.number() });

export const deskStateSchema = z.object({
  /** Akcje Biurka wykonane w kampanii (dziennik). */
  log: z.array(deskActionRecordSchema),
  /** Dodatkowa Uwaga Dowódcy na następny kwartał (po Odpoczynku). */
  restBonus: z.number().int().min(0).max(2),
  /**
   * Wskaźniki i Kapitał Polityczny z chwili otwarcia kwartału, sprzed jego wydarzeń.
   * Od nich raport kwartału i interfejs liczą zmianę „od początku kwartału”.
   */
  opening: indicatorSnapshot.extend({ KP: z.number() }),
});

/** Raport z zamknięcia kwartału: fakty silnika, z których powstaje skrót sekretarza. */
export const quarterReportSchema = z.object({
  quarter: qcode,
  before: indicatorSnapshot,
  after: indicatorSnapshot,
  kpBefore: z.number(),
  kpAfter: z.number(),
  /** Liczba publicznych wiadomości ze świata w tym kwartale. */
  newsCount: z.number().int().min(0),
  /** Uwagi silnika po polsku, np. „Poparcie Publiczne poniżej 40: Zaufanie Waszyngtonu −2”. */
  notes: z.array(z.string()),
  correctionUnits: z.number(),
});

/** Migawka kariery KSP (pakiet @dse/ksp-bridge). Fakty z KSP są nienaruszalne. */
export const kspSnapshotSchema = z.object({
  quarter: qcode,
  file: z.string().min(1),
  title: z.string(),
  /** Czas uniwersalny w sekundach od 1.01.1951 i data kalendarzowa. */
  ut: z.number().min(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  funds: z.number(),
  reputation: z.number(),
  confidence: z.number(),
  science: z.number(),
  engineers: z.number().int().min(0),
  researchers: z.number().int().min(0),
  /** Miesięczne wynagrodzenia z ostatniego pełnego okresu dziennika kariery. */
  monthlySalaries: z.number().min(0),
  launchSite: z.string(),
  launches: z.number().int().min(0),
  failures: z.number().int().min(0),
  contractsCompleted: z.number().int().min(0),
  programs: z.array(z.object({ name: z.string(), status: z.enum(['active', 'completed']) })),
  /** Starty w kwartale migawki. */
  launchesInQuarter: z.array(z.object({ vessel: z.string(), date: z.string(), site: z.string().nullable() })),
});

export const campaignSettingsSchema = z.object({
  id: z.string().min(1),
  seed: z.string().min(1),
  rp1Version: z.string().min(1),
  rp1Difficulty: z.enum(['easy', 'normal', 'hard', 'custom']),
  rp1DifficultyNotes: z.string().optional(),
  opponentMode: z.enum(['historical', 'divergent', 'adaptive']),
  metaDifficulty: z.enum(['confidential', 'secret', 'top_secret']),
  integrationMode: z.enum(['honor', 'save', 'mod']),
  discipline: z.enum(['free', 'standard', 'archival']),
});

export const gameStateSchema = z.object({
  schemaVersion: z.literal(STATE_SCHEMA_VERSION),
  campaign: campaignSettingsSchema,
  organization: z.object({
    acronym: z.string().min(1),
    fullName: z.string().min(1),
    brand: z.string().min(1),
    era: z.enum(['I', 'II', 'III', 'IV']),
  }),
  quarter: quarterSchema,
  rng: z.object({ s: z.number().int().min(0).max(0xffffffff) }),
  indicators: indicatorsSchema,
  currencies: currenciesSchema,
  style: styleSchema,
  factions: z.record(factionIdSchema, factionStateSchema),
  /** Kolejność frakcji do wyświetlania (jak w data/factions.yaml). */
  factionOrder: z.array(factionIdSchema),
  characters: z.record(z.string(), characterStateSchema),
  registry: z.array(registryEntryStateSchema),
  clocks: z.array(clockSchema),
  directives: z.array(directiveStateSchema),
  knowledge: z.object({
    assessments: z.array(assessmentSchema),
  }),
  chronicle: z.array(chronicleEntrySchema),
  world: worldStateSchema,
  budget: budgetStateSchema,
  desk: deskStateSchema,
  reports: z.array(quarterReportSchema),
  ksp: z.object({ snapshots: z.array(kspSnapshotSchema) }),
  /** active — gra trwa; dismissed — Anderson odwołany (ZW 0); collapsed — rozpad organizacji (SO 0). */
  status: z.enum(['active', 'dismissed', 'collapsed']),
});

export type GameState = z.infer<typeof gameStateSchema>;
export type CampaignSettings = z.infer<typeof campaignSettingsSchema>;
export type FactionState = z.infer<typeof factionStateSchema>;
export type CharacterState = z.infer<typeof characterStateSchema>;
export type RegistryEntryState = z.infer<typeof registryEntryStateSchema>;
export type ClockState = z.infer<typeof clockSchema>;
export type Indicators = z.infer<typeof indicatorsSchema>;
export type WorldState = z.infer<typeof worldStateSchema>;
export type ThreadInstance = z.infer<typeof threadInstanceSchema>;
export type WorldLogEntry = z.infer<typeof worldLogEntrySchema>;
export type PendingDilemma = z.infer<typeof pendingDilemmaSchema>;
export type Situation = z.infer<typeof situationSchema>;
export type BudgetLedgerEntry = z.infer<typeof budgetLedgerEntrySchema>;
export type QuarterReport = z.infer<typeof quarterReportSchema>;
export type KspSnapshot = z.infer<typeof kspSnapshotSchema>;
export type DeskActionRecord = z.infer<typeof deskActionRecordSchema>;

/** Pusty stan świata — zmienne i Rozbieżność uzupełnia silnik z treści (ensureWorldState). */
export function emptyWorldState(): WorldState {
  return {
    vars: {},
    divergence: {},
    flags: [],
    threads: {},
    patternLog: {},
    templateLog: {},
    dilemmaLog: {},
    pendingDilemmas: [],
    situations: [],
    corrections: [],
    log: [],
    seq: 0,
  };
}
