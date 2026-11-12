# STATUS

> Ten plik czyta się na początku każdej sesji pracy i aktualizuje na jej końcu.
> Jest pamięcią projektu — historia czatu nią nie jest.

**Ostatnia aktualizacja:** 7.11.2026
**Bieżąca faza:** 1A domknięta; równolegle tor Treść: system wydarzeń świata (decyzja 0015)
**Następny kamień milowy:** M1a — „DSE czyta karierę” (parser .sfs), potem M1

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

### Domknięcie 1A i rundy pytań (1–7.11.2026)

- Przejście na RP-1 4.8.1 (decyzja 0007).
- Decyzje 0008–0014 z odpowiedzi autora; zestawienie w `docs/plan/rozstrzygniecia-2026-11.md`.
- Dokumenty projektowe i badawcze w `docs/design/`, `docs/research/`, `docs/plan/`.

### Wydarzenia świata (7.11.2026, decyzja 0015)

- Silnik `packages/core/src/world/`: wątki, etapy alternatywne, kotwice, szablony, wzorce, dylematy, Rozbieżność; `advanceWorld`, `resolveDilemma`, `simulateWorld`.
- Stan w wersji 2 z migracją 1 → 2 (`state/migrate.ts`).
- Treść `data/events/`: 4 wątki, 2 szablony, 16 wzorców, 4 dylematy, 8 zmiennych.
- CLI `dse swiat` (z `--serie` do strojenia). 46 testów.
- Opis: `docs/design/wydarzenia-swiata.md`; odpowiedzi autora z 7.11 wdrożone (punkt 11).

## Następne zadania

1. **Plan Budowy v3** — ostateczny plan na podstawie rozstrzygnięć (zastąpi `docs/PLAN_BUDOWY.md`).
2. **Faza 1B — parser .sfs.** Zapisy RP-1 4.8.1 autora są już dostępne (kariera testowa „test-27-10”, 3 pliki) i trafią do `samples/saves/`.
   
   Zakres:
   - parser formatu ConfigNode,
   - ekstrakcja węzłów: `CareerLog`, `ProgramHandler`, `SpaceCenterManagement` (kompleksy, platformy, `launchSiteName`), `Confidence`, `UnlockCreditHandler`, `Funding`, `ResearchAndDevelopment`, `Reputation`,
   - Migawka i różnice między Migawkami.
3. **Dossier III** (`docs/research/dossier-III-watki-swiata-1951-1980.md`) czeka na uwagi autora: pytania w części VI. Potem zmiany w silniku (`anchor`, `kind`, `decision`, bezpieczniki szablonów, `era`, palety) i zapis bloku A w YAML partiami po około 10 wątków.
4. **Wydarzenia świata, ciąg dalszy:** zapis bloku A w YAML (blok A, potem 200 wzorców z paletami, szablony S03–S16, bloki B–D); skutek tworzący wpis Rejestru.
5. **Kampania pilotażowa** (zamiast prototypu papierowego, decyzja 0008): skrócony pakiet zasad dla czatu jako Mistrza Gry.
6. **Prototyp weryfikacji Tristara, lot 2** (decyzja 0009): eksperyment Kerbalism i kontrakt CC — do testu u autora.
7. **Faza 1C — dane referencyjne RP-1**, potem **1D — silnik kwartału bez AI** (z `advanceWorld` jako krokiem zamknięcia kwartału i Korektami w raporcie budżetowym).

## Otwarte kwestie projektowe

- **Lista pilotów w trzech klasach** i **nowa lista nazw** w miejsce kolizji z DD 8.1 (decyzja 0013) — do przygotowania z autorem.
- **Haskell** — rola łącznika przemysłu przy PACE; postaci firm do dopisania przy katalogu przemysłu.
- **Miejsca startu w pakiecie Sol** — lista z KSCSwitcher od autora (decyzja 0007).
- **Sponsorzy programów (D4)** — autor chce rozwinąć ten filar w osobnej rozmowie.
- **Dossier I „Próby w locie”** — raport z badań do przeniesienia do `docs/research/`.

## Uwagi środowiskowe (dla sesji Claude)

- W sandboxie Claude rejestr npm jest zablokowany. `node_modules` składa się z dowiązań do `/opt/npm-tools/node_modules` — szczegóły w `CLAUDE.md`.
- Brak `package-lock.json` jest celowy do pierwszego `npm install` u autora. Po nim plik blokady trafia do repozytorium.
- Zmiany w repozytorium wprowadza Claude przez pull requesty; autor zatwierdza i scala. Każdy PR dopisuje wpis do `CHANGELOG.md`.
