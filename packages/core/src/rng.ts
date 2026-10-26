/**
 * Deterministyczny generator liczb losowych (GDD 33.3).
 *
 * Algorytm: mulberry32 — 32-bitowy stan, szybki i w pełni odtwarzalny.
 * Stan generatora jest zwykłą liczbą, więc zapisuje się go w stanie kampanii
 * i po wczytaniu kampania losuje dokładnie to samo, co losowałaby bez przerwy.
 */

export interface RngState {
  /** Bieżący 32-bitowy stan generatora (liczba całkowita bez znaku). */
  readonly s: number;
}

export class Rng {
  private s: number;

  private constructor(state: number) {
    this.s = state >>> 0;
  }

  /** Tworzy generator z ziarna kampanii. Dowolna liczba całkowita lub tekst. */
  static fromSeed(seed: number | string): Rng {
    return new Rng(typeof seed === 'number' ? seed >>> 0 : hashString(seed));
  }

  /** Odtwarza generator z zapisanego stanu. */
  static fromState(state: RngState): Rng {
    return new Rng(state.s);
  }

  /** Stan do zapisania w kampanii. */
  getState(): RngState {
    return { s: this.s };
  }

  /** Liczba z przedziału [0, 1). */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Liczba całkowita z przedziału domkniętego [min, max]. */
  int(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new RangeError(`Nieprawidłowy przedział losowania: [${min}, ${max}]`);
    }
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Zwraca true z prawdopodobieństwem p (0–1). */
  chance(p: number): boolean {
    if (p <= 0) return false;
    if (p >= 1) return true;
    return this.next() < p;
  }

  /** Losowy element niepustej tablicy. */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new RangeError('Nie można losować z pustej listy');
    return items[this.int(0, items.length - 1)] as T;
  }

  /** Mnożnik z przedziału [min, max), np. los(0,6–1,4) z GDD 15.5. */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

/** Skrót tekstu do 32 bitów (FNV-1a), żeby ziarno mogło być słowem, np. "PACE-1951". */
function hashString(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
