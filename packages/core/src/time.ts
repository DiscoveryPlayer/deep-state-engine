/**
 * Czas kampanii. Podstawową jednostką jest kwartał (GDD 9.1).
 */

export interface Quarter {
  readonly year: number;
  /** Numer kwartału 1–4. */
  readonly q: 1 | 2 | 3 | 4;
}

const ROMAN = ['I', 'II', 'III', 'IV'] as const;

/** Kod kwartału używany w danych i w Rejestrze, np. "1951-Q1". */
export function quarterCode(t: Quarter): string {
  return `${t.year}-Q${t.q}`;
}

/** Zapis do dokumentów w grze, np. "I kw. 1951". */
export function quarterLabel(t: Quarter): string {
  return `${ROMAN[t.q - 1]} kw. ${t.year}`;
}

export function parseQuarterCode(code: string): Quarter {
  const m = /^(\d{4})-Q([1-4])$/.exec(code);
  if (!m) throw new Error(`Nieprawidłowy kod kwartału: "${code}" (oczekiwano np. 1951-Q1)`);
  return { year: Number(m[1]), q: Number(m[2]) as Quarter['q'] };
}

export function nextQuarter(t: Quarter): Quarter {
  return t.q === 4 ? { year: t.year + 1, q: 1 } : { year: t.year, q: (t.q + 1) as Quarter['q'] };
}

/** Liczba kwartałów od a do b (dodatnia, gdy b jest później). */
export function quartersBetween(a: Quarter, b: Quarter): number {
  return (b.year - a.year) * 4 + (b.q - a.q);
}

/** Kwartał, w którym leży data kalendarzowa w formacie RRRR-MM-DD. */
export function quarterOfDate(isoDate: string): Quarter {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) throw new Error(`Nieprawidłowa data: "${isoDate}" (oczekiwano RRRR-MM-DD)`);
  const month = Number(m[2]);
  if (month < 1 || month > 12) throw new Error(`Nieprawidłowy miesiąc w dacie: "${isoDate}"`);
  return { year: Number(m[1]), q: (Math.floor((month - 1) / 3) + 1) as Quarter['q'] };
}
