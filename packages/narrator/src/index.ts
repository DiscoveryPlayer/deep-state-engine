/**
 * @dse/narrator — Łącznik AI (decyzja 0018).
 *
 * Narrator działa poza grą: gracz kopiuje Pakiet Kontekstu do rozmowy z Claude albo Gemini
 * w przeglądarce i wkleja odpowiedź z powrotem. Ten pakiet buduje Pakiet i czyta odpowiedź.
 *
 * Zasada Z4: Pakiet powstaje WYŁĄCZNIE z widoku gracza (`PlayerView`) i z jawnej obsady.
 * Zasada Z3: odpowiedź AI to tekst do czytania. Parser niczego z niej nie wylicza.
 */
export * from './package.ts';
export * from './reply.ts';
