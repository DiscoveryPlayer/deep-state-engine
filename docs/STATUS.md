# STATUS

> Ten plik czyta się na początku każdej sesji pracy i aktualizuje na jej końcu.
> Jest pamięcią projektu — historia czatu nią nie jest.

**Ostatnia aktualizacja:** 26.10.2026
**Bieżąca faza:** 1A — szkielet i model danych (Plan Budowy, rozdz. 4)
**Następny kamień milowy:** M1 — „Silnik liczy prawdziwą karierę”

## Zrobione

### Faza 1A — szkielet (26.10.2026)

- Monorepo npm workspaces, TypeScript (strict, tylko składnia wymazywalna), testy na `node:test` przez `tsx`.
- `@dse/core`:
  - generator losowy z ziarnem i zapisywalnym stanem (`Rng`),
  - czas w kwartałach,
  - schematy treści i stanu (zod),
  - walidacja powiązań treści z komunikatami po polsku,
  - stan startowy 1951,
  - kanoniczny zapis i odczyt stanu,
  - projekcja na widok gracza (zasada Z4: lista dozwolonych pól).
- `@dse/content`: wczytywanie `data/*.yaml` ze zbieraniem wszystkich błędów naraz.
- `data/`: kampania (PACE, wskaźniki startowe), 6 frakcji, 18 cech (12 jawnych, 6 ukrytych), 6 dyrektorów, 2 wpisy startowe Rejestru.
- CLI: `waliduj`, `nowa-kampania`, `stan [--prawda]`.
- 26 testów, w tym: determinizm, zapis bit w bit, brak wycieku warstwy ukrytej do widoku gracza.
- Dokumenty: GDD v1.0, Dokument Decyzyjny v1.1, Plan Budowy, rejestr decyzji 0001–0006, słowniczek.

## Następne zadania

1. **Faza 1B — parser .sfs.** Czeka na pliki zapisu RP-1 4.7 od autora (`samples/saves/`):
   - świeża kariera (styczeń 1951),
   - kariera po 2–3 miesiącach,
   - kariera po pierwszym starcie z awarią.
   
   Zakres:
   - parser formatu ConfigNode,
   - ekstrakcja węzłów: `CareerLog`, `ProgramHandler`, `SpaceCenterManagement` (kompleksy, platformy, `launchSiteName`), `Confidence`, `UnlockCreditHandler`, `Funding`, `ResearchAndDevelopment`, `Reputation`,
   - Migawka i różnice między Migawkami.
2. **Faza 0 — pakiet do prototypu papierowego** (może iść równolegle).
3. **Faza 1C — silnik kwartału bez AI.**

## Otwarte kwestie projektowe

- **Korpus Astronautów:** czy roster z Biblii świata (Sterling, Thorne, Cross, Miller…) zastępuje Kowalczyka z GDD. Do decyzji autora.
- **Leonard Haskell** (PRZ) — postać dodana w fazie 1A, bo Konsorcja potrzebują twarzy. Do zatwierdzenia.
- **Kolizje nazw z Dokumentu Decyzyjnego 8.1** — do poprawy w Biblii świata przy przenoszeniu jej do `data/world/`.

## Uwagi środowiskowe (dla sesji Claude)

- W sandboxie Claude rejestr npm jest zablokowany. `node_modules` składa się z dowiązań do `/opt/npm-tools/node_modules` — szczegóły w `CLAUDE.md`.
- Brak `package-lock.json` jest celowy do pierwszego `npm install` u autora. Po nim plik blokady trafia do repozytorium.
