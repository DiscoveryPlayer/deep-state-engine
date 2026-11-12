import type { CampaignListItem, DeskPayload } from '../../server/src/api.ts';

export type { CampaignListItem, DeskPayload };

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
  create: (id: string, seed: string) => call<DeskPayload>('/api/campaigns', { id, seed }),
  load: (id: string) => call<DeskPayload>(campaign(id)),
  decide: (id: string, instanceId: string, optionId: string) =>
    call<DeskPayload>(`${campaign(id)}/dilemma`, { instanceId, optionId }),
  act: (id: string, action: string, target?: string) =>
    call<DeskPayload>(`${campaign(id)}/action`, target === undefined ? { action } : { action, target }),
  closeQuarter: (id: string) => call<DeskPayload>(`${campaign(id)}/close-quarter`, {}),
  importSave: (id: string, path: string) => call<DeskPayload>(`${campaign(id)}/ksp`, { path }),
  settle: (id: string, quarter: string) => call<DeskPayload>(`${campaign(id)}/settle`, { quarter }),
};
