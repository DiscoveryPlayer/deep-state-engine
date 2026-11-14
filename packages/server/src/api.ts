/**
 * Kształt danych między serwerem a interfejsem. Do przeglądarki trafia WYŁĄCZNIE widok gracza
 * (toPlayerView, zasada Z4) i dane jawne z treści gry: nazwy frakcji, akcje Biurka, miejsca startu.
 */
import type { DeskActionInfo, LaunchSite, PlayerView } from '@dse/core';

/** Pakiet dla narratora w odpowiedzi serwera: treść do schowka albo ścieżka do zapisanego pliku. */
export interface NarratorPackageResponse {
  title: string;
  /** Czy pakiet zawiera warstwę ukrytą. Interfejs nigdy nie wyświetla treści takiego pakietu. */
  secret: boolean;
  chars: number;
  /** Treść pakietu; null, gdy pakiet został zapisany do pliku. */
  prompt: string | null;
  /** Ścieżka pliku na dysku gracza; null, gdy pakiet idzie przez schowek. */
  file: string | null;
}

/** Zdjęcie do tematu wydarzenia (tylko pliki, które są na dysku). */
export interface TopicImage {
  url: string;
  caption: string;
  /** Autor i licencja z Wikimedia Commons, jeśli skrypt pobierania je zapisał. */
  credit: string | null;
}

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
  /** Tablica sytuacyjna: regiony świata i liczba jawnych depesz z bieżącego kwartału. */
  regions: { id: string; title: string; news: number }[];
  launchSites: LaunchSite[];
  /** Zdjęcia według tematu depeszy (`worldNews[].topic`). */
  images: Record<string, TopicImage>;
  /** Po rozmowie z narratorem: opcja, do której doprowadziła rozmowa. Wybór i tak zatwierdza gracz. */
  suggestion?: { instanceId: string; optionId: string };
  /** Komunikat po ostatniej operacji (np. ostrzeżenia po wczytaniu zapisu KSP). */
  messages: string[];
}

export interface CampaignListItem {
  id: string;
  quarterLabel: string;
  status: string;
  savedAt: string;
  historyFidelity: string;
}

export interface ApiError {
  error: string;
}
