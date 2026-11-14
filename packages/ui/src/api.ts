import type { CampaignListItem, DeskPayload, NarratorPackageResponse } from '../../server/src/api.ts';

export type { CampaignListItem, DeskPayload, NarratorPackageResponse };

export type HistoryFidelity = DeskPayload['view']['historyFidelity'];
export type NarratorTarget =
  | { kind: 'quarter' }
  | { kind: 'decision'; instanceId: string }
  | { kind: 'conversation'; instanceId: string }
  | { kind: 'event'; card: string };
export type Flight = DeskPayload['view']['flights'][number];
export type MissionReportInput = Omit<NonNullable<Flight['report']>, 'auto'>;

export class ApiFailure extends Error {}

async function call<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST',
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiFailure('Brak połączenia z grą. Sprawdź, czy okno terminala z The Deep State Engine jest otwarte.');
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data ? String(data.error) : `Błąd ${response.status}`;
    throw new ApiFailure(message);
  }
  return data as T;
}

const campaign = (id: string) => `/api/campaigns/${encodeURIComponent(id)}`;

export const api = {
  campaigns: () => call<CampaignListItem[]>('/api/campaigns'),
  create: (id: string, seed: string, historyFidelity: HistoryFidelity) =>
    call<DeskPayload>('/api/campaigns', { id, seed, historyFidelity }),
  load: (id: string) => call<DeskPayload>(campaign(id)),
  decide: (id: string, instanceId: string, optionId: string) =>
    call<DeskPayload>(`${campaign(id)}/dilemma`, { instanceId, optionId }),
  act: (id: string, action: string, target?: string) =>
    call<DeskPayload>(`${campaign(id)}/action`, target === undefined ? { action } : { action, target }),
  closeQuarter: (id: string) => call<DeskPayload>(`${campaign(id)}/close-quarter`, {}),
  importSave: (id: string, path: string) => call<DeskPayload>(`${campaign(id)}/ksp`, { path }),
  skipGate: (id: string) => call<DeskPayload>(`${campaign(id)}/ksp-skip`, {}),
  fileFlight: (id: string, flightId: string, report: MissionReportInput) =>
    call<DeskPayload>(`${campaign(id)}/flight`, { flightId, ...report }),
  remove: (id: string) => call<{ deleted: string; trashed: string }>(`${campaign(id)}/delete`, { confirm: id }),
  narratorPackage: (
    id: string,
    target: NarratorTarget,
    options: { mode: 'full' | 'short'; secrets: boolean; toFile: boolean },
  ) => call<NarratorPackageResponse>(`${campaign(id)}/narrator-package`, { ...target, ...options }),
  narratorReply: (id: string, target: NarratorTarget, source: string, text: string) =>
    call<DeskPayload>(`${campaign(id)}/narrator-reply`, { ...target, source, text }),
  settle: (id: string, quarter: string) => call<DeskPayload>(`${campaign(id)}/settle`, { quarter }),
};
