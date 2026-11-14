import type { NarrativeEntry } from '@dse/core';

/** Granice wklejanej odpowiedzi: tekst z zewnątrz traktujemy jako niezaufany. */
export const REPLY_MAX_CHARS = 24_000;
export const REPLY_MAX_SECTIONS = 8;
export const SECTION_MAX_CHARS = 6_000;
const TITLE_MAX_CHARS = 80;

export interface ParsedReply {
  sections: NarrativeEntry['sections'];
  /** Uwagi dla gracza: czego brakowało albo co zostało przycięte. */
  warnings: string[];
}

export class ReplyError extends Error {}

const HEADING = /^\s{0,3}(?:#{1,4}\s*(.+?)\s*#*|\*\*([^*]{2,80})\*\*:?)\s*$/;

function slug(title: string): string {
  const ascii = title.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');
  return (
    ascii
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'sekcja'
  );
}

/** Zostawia czysty tekst: bez znaków sterujących, płotków kodu i znaczników pogrubienia. */
function clean(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f​-‏‪-‮⁦-⁩]/g, '')
    .replace(/^\s*```[a-z]*\s*$/gim, '')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, '$1$2')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function tidyTitle(raw: string): string {
  const title = raw
    .replace(/[*_`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[:.]$/, '');
  if (title === title.toUpperCase()) {
    const lower = title.toLowerCase();
    return (lower.charAt(0).toUpperCase() + lower.slice(1)).slice(0, TITLE_MAX_CHARS);
  }
  return title.slice(0, TITLE_MAX_CHARS);
}

/**
 * Czyta odpowiedź AI: dzieli ją na sekcje według nagłówków „## NAZWA”. Odpowiedź bez nagłówków
 * staje się jedną sekcją. Wynik to wyłącznie tekst do wyświetlenia.
 */
export function parseNarratorReply(raw: string, expected: readonly string[] = []): ParsedReply {
  const warnings: string[] = [];
  let text = raw;
  if (text.length > REPLY_MAX_CHARS) {
    text = text.slice(0, REPLY_MAX_CHARS);
    warnings.push('Odpowiedź była za długa i została przycięta.');
  }
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const found: { title: string; body: string[] }[] = [];
  const preamble: string[] = [];
  for (const line of lines) {
    const match = HEADING.exec(line);
    const title = match ? tidyTitle(match[1] ?? match[2] ?? '') : '';
    if (match && title) found.push({ title, body: [] });
    else if (found.length > 0) found.at(-1)!.body.push(line);
    else preamble.push(line);
  }

  let sections = found
    .map((s) => ({ title: s.title, body: clean(s.body.join('\n')) }))
    .filter((s) => s.body.length > 0);
  if (sections.length === 0) {
    const body = clean(text);
    if (body.length === 0) throw new ReplyError('Odpowiedź jest pusta. Wklej tekst, który napisał narrator.');
    sections = [{ title: 'Narracja', body }];
    if (expected.length > 0) warnings.push('Nie znalazłem nagłówków sekcji, więc cała odpowiedź trafiła do jednej.');
  } else if (clean(preamble.join('\n')).length > 0) {
    warnings.push('Pominąłem wstęp sprzed pierwszej sekcji.');
  }
  if (sections.length > REPLY_MAX_SECTIONS) {
    sections = sections.slice(0, REPLY_MAX_SECTIONS);
    warnings.push(`Odpowiedź miała więcej niż ${REPLY_MAX_SECTIONS} sekcji; dalsze pominąłem.`);
  }

  const used = new Set<string>();
  const result = sections.map((s) => {
    let key = slug(s.title);
    for (let i = 2; used.has(key); i++) key = `${slug(s.title)}-${i}`;
    used.add(key);
    const body = s.body.length > SECTION_MAX_CHARS ? `${s.body.slice(0, SECTION_MAX_CHARS)}…` : s.body;
    return { key, title: s.title, body };
  });
  const missing = expected.filter((e) => !result.some((s) => s.key === slug(e) || s.key.startsWith(`${slug(e)}-`)));
  if (found.length > 0 && missing.length > 0) warnings.push(`Brakuje sekcji: ${missing.join(', ')}.`);
  return { sections: result, warnings };
}

/**
 * Odczytuje wynik rozmowy prowadzącej do decyzji: literę opcji z sekcji WYNIK. Zwraca indeks
 * opcji (A = 0) albo null, gdy sekcji nie ma lub litera jest spoza listy. Wybór i tak
 * zatwierdza gracz; AI tylko wskazuje, dokąd doprowadziła rozmowa.
 */
export function parseConversationResult(sections: ParsedReply['sections'], optionCount: number): number | null {
  const result = sections.find((s) => s.key === 'wynik' || s.key.startsWith('wynik-'));
  const match = result ? /OPCJA\s*[:\-–]?\s*([A-Za-z])\b/.exec(result.body) : null;
  if (!match) return null;
  const index = match[1]!.toUpperCase().charCodeAt(0) - 65;
  return index >= 0 && index < optionCount ? index : null;
}
