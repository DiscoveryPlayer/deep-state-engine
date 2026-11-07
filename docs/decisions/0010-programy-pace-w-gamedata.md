# 0010 — Programy i kontrakty PACE generowane przez DSE do GameData

**Data:** 7.11.2026 · **Status:** przyjęta (decyzja autora z 7.11.2026)

## Decyzja

Po zatwierdzeniu dużego Wniosku DSE **zapisuje definicję programu RP-1 i jego kontraktów** do folderu `GameData/PACE/` w instalacji autora. Zapis następuje w czasie meta-gry, kiedy KSP jest wyłączone (decyzja 0008). Program finansuje się wtedy natywnie przez RP-1, bez ręcznych Korekt funduszy. To realizacja wariantu B z pytania F5 i nowy kanał zapisu, który nie dotyka pliku zapisu.

## Podstawa techniczna (RP-1 4.8.1)

- Program to węzeł `RP0_PROGRAM` (wzór: `GameData/RP-1/Programs/Programs.cfg`):
  - pola `name`, `title`, `description`, `objectivesPrettyText`;
  - czas i finansowanie: `nominalDurationYears`, `baseFunding`, `fundingCurve`;
  - reputacja: `repDeltaOnCompletePerYearEarly`, `repPenaltyPerYearLate`;
  - `slots`;
  - węzły `OBJECTIVES`, `OPTIONALS`, `CONFIDENCECOSTS`.
- Kontrakty łączą się z programem wymogiem `ProgramActive` w swojej konfiguracji.
- Wzór składni dla samolotów badawczych: RP-1 PR #2828 (Advanced X-Planes: `SustainedCruise`, `Duration`, `ReachState`).
- Kolekcja WithCrow RP-1_Crow v1.1 jest zbudowana na RP-1 4.4, więc służy tylko jako wzór i nie instalujemy jej.

## Zasady bezpieczeństwa

1. **Raz zapisanej definicji nigdy nie usuwamy.** Zapis gry odwołuje się do programu po nazwie. Program zamknięty w meta-grze zostaje w plikach.
2. Nazwy są unikalne i mają prefiks `PACE_`.
3. Wysokość `baseFunding` wynika z ustawy budżetowej meta-gry (decyzja 0012), a nie z decyzji gracza.
4. `slots` to świadoma dźwignia: duży program zajmuje więcej zdolności administracyjnej.
5. Po każdej zmianie ModuleManager przebudowuje pamięć podręczną. U autora ma ona około 85 MB, więc pierwsze uruchomienie potrwa dłużej.
6. Do fazy zapisu (faza 8 Planu) DSE generuje pliki do folderu wyjściowego, a autor kopiuje je ręcznie.
