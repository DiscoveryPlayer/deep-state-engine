# Dziennik zmian

Najnowsze na górze. Każdy wpis odpowiada jednemu pull requestowi.

## 2026-11-07 — Wydarzenia świata (decyzja 0015)

- Silnik wydarzeń świata w `@dse/core` (`world/`): wątki z etapami i gałęziami, etapy alternatywne, kotwice, szablony z parametrami, wzorce, dylematy z opcją domyślną, Rozbieżność regionów, strukturalne warunki i skutki, walidacja treści.
- Stan kampanii w wersji 2 (pole `world`) z migracją z wersji 1; odczyt stanu przechodzi przez `migrateState`.
- Widok gracza: `worldNews` (tylko wpisy publiczne) i `pendingDilemmas` (bez opcji domyślnej).
- Treść w `data/events/`: 6 regionów, 8 zmiennych, 4 wątki (Korea, Abadan, maccartyzm, wybory 1952), 2 szablony, 16 wzorców, 4 dylematy — z pliku wydarzeń 1951.
- CLI: `dse swiat` (symulacja lat, `--prawda`, `--decyzje`, `--serie N`), `waliduj` liczy treść świata.
- Dokumenty: `docs/design/wydarzenia-swiata.md`, decyzja 0015, słowniczek.
- Testy: 46 (było 26).

## 2026-11-07 — Domknięcie fazy 1A i decyzje z rund pytań

- Przejście na RP-1 4.8.1: ustawienia domyślne kampanii, README, decyzja 0007 (zastępuje część 0005).
- Decyzje 0008–0014: harmonogram i pilotaż, weryfikacja (kanały, eksperymenty, kontrakty), programy PACE w GameData, przemysł i przetargi, budżet ustawowy, historia otwarta i kotwice, Wnioski Programowe.
- Dokumenty: katalog firm i projekt sponsorów (`docs/design/`), dossier „Szuflada” i analiza pliku wydarzeń 1951 (`docs/research/`), Plan Budowy v2 w wersji roboczej, pytania i rozstrzygnięcia (`docs/plan/`).

## 2026-10-26 — Faza 1A: szkielet

- Monorepo TypeScript, silnik bez I/O, schematy treści i stanu, widok gracza (Z4), CLI, 26 testów.
