/**
 * Kształt danych między serwerem a interfejsem. Do przeglądarki trafia WYŁĄCZNIE widok gracza
 * (toPlayerView, zasada Z4) i dane jawne z treści gry: nazwy frakcji, akcje Biurka, miejsca startu.
 */
import type { DeskActionInfo, LaunchSite, PlayerView } from '@dse/core';

export interface FactionInfo {
  id: string;
  name: string;
  summary: string;
  /** Nazwa bieżącej Agendy, jeśli Anderson ją poznał (inaczej null). */
  agendaTitle: string | null;
}

export interface DeskPayload {
  campaign: { id: string; seed: string; quarterLabel: string; quarterCode: string };
  view: PlayerView;
  actions: DeskActionInfo[];
  factions: FactionInfo[];
  launchSites: LaunchSite[];
  /** Komunikat po ostatniej operacji (np. ostrzeżenia po wczytaniu zapisu KSP). */
  messages: string[];
}

export interface CampaignListItem {
  id: string;
  quarterLabel: string;
  status: string;
  savedAt: string;
}

export interface ApiError {
  error: string;
}
