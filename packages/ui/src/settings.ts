/**
 * Ustawienia wyglądu. Zapisują się w przeglądarce (localStorage); gdy to niemożliwe,
 * działają do zamknięcia karty.
 */
export interface Settings {
  theme: 'dark' | 'light' | 'system';
  text: 's' | 'm' | 'l' | 'xl';
  density: 'compact' | 'comfortable';
  contrast: 'normal' | 'high';
  motion: 'on' | 'off';
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  text: 'm',
  density: 'comfortable',
  contrast: 'normal',
  motion: 'on',
};

const KEY = 'dse.ustawienia';
const LAST_CAMPAIGN = 'dse.kampania';

export const SETTING_CHOICES: {
  [K in keyof Settings]: { label: string; options: { value: Settings[K]; label: string }[] };
} = {
  theme: {
    label: 'Motyw',
    options: [
      { value: 'dark', label: 'Ciemny' },
      { value: 'light', label: 'Jasny' },
      { value: 'system', label: 'Jak w systemie' },
    ],
  },
  text: {
    label: 'Rozmiar tekstu',
    options: [
      { value: 's', label: 'Mały' },
      { value: 'm', label: 'Standardowy' },
      { value: 'l', label: 'Duży' },
      { value: 'xl', label: 'Bardzo duży' },
    ],
  },
  density: {
    label: 'Układ',
    options: [
      { value: 'comfortable', label: 'Wygodny' },
      { value: 'compact', label: 'Zwarty' },
    ],
  },
  contrast: {
    label: 'Kontrast',
    options: [
      { value: 'normal', label: 'Zwykły' },
      { value: 'high', label: 'Wysoki' },
    ],
  },
  motion: {
    label: 'Animacje',
    options: [
      { value: 'on', label: 'Włączone' },
      { value: 'off', label: 'Wyłączone' },
    ],
  },
};

export function loadSettings(): Settings {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    const out = { ...DEFAULT_SETTINGS };
    if (raw && typeof raw === 'object') {
      for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
        const candidate = (raw as Record<string, unknown>)[key];
        if (SETTING_CHOICES[key].options.some((o) => o.value === candidate)) {
          (out as Record<string, string>)[key] = candidate as string;
        }
      }
    }
    return out;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Przeglądarka nie pozwala zapisywać — ustawienia zostają do zamknięcia karty.
  }
}

/** Przenosi ustawienia na atrybuty elementu <html>; reszta dzieje się w CSS. */
export function applySettings(settings: Settings): void {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.text = settings.text;
  root.dataset.density = settings.density;
  root.dataset.contrast = settings.contrast;
  root.dataset.motion = settings.motion;
}

export function rememberCampaign(id: string | null): void {
  try {
    if (id === null) localStorage.removeItem(LAST_CAMPAIGN);
    else localStorage.setItem(LAST_CAMPAIGN, id);
  } catch {
    // Bez pamięci przeglądarki gracz wybierze kampanię z listy.
  }
}

export function lastCampaign(): string | null {
  try {
    return localStorage.getItem(LAST_CAMPAIGN);
  } catch {
    return null;
  }
}
