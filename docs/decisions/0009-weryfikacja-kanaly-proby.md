# 0009 — Weryfikacja: poziom i kanał, eksperymenty i kontrakty, karty prób

**Data:** 7.11.2026 · **Status:** przyjęta (odpowiedzi autora z 1.11 i 7.11.2026)

## Poziom i kanał

Każdy warunek w danych gry (Dyrektywa, karta lotu, warunek Wniosku) deklaruje **poziom** (W, R, D, jak w GDD 11.2) i **kanał**:

| Kanał | Co widzi |
|---|---|
| `save_state` | Stan pojazdów, załóg, walut i kompleksów w chwili zapisu |
| `career_log` | Miesięczne finanse, starty, awarie, kontrakty, technologie, budowy |
| `rp1_contract` | Ukończone kontrakty RP-1 |
| `experiment` | Ukończone eksperymenty Kerbalism (podmioty nauki w zapisie) |
| `pace_contract` | Ukończone kontrakty z paczki PACE (Contract Configurator) |
| `report` | Raport Misji gracza, sprawdzany pod kątem spójności z danymi |

Warunek z kanałem niedostępnym (np. brak paczki PACE) automatycznie spada do poziomu R.

## Warunki w trakcie lotu: eksperymenty i kontrakty

Zapis nie przechowuje przebiegu lotu. Do warunków typu „powyżej 360 m/s przez 3 minuty” służą dwa narzędzia:

- **Eksperymenty Kerbalism** (wzór: pliki RP1ES autora). Kerbalism 3.43 obsługuje wymagania m.in. `SpeedMin/Max`, `SurfaceSpeedMin/Max`, `AltitudeMin/Max`, `AltAboveGroundMin/Max`, `DynamicPressureMin/Max`, `CrewMin`. Czas trwania wynika z `data_rate`. **Eksperyment sumuje czas** spełniania warunków, nie wymaga ciągłości. Nie zajmuje miejsca kontraktu.
- **Kontrakty Contract Configurator** bez wymogu programu RP-1 (wzór: kontrakty rekordów RP-1). Parametr `Duration` z warunkiem `ReachState` wymaga **ciągłości**, jak w RP-1 PR #2828 (Advanced X-Planes). Zajmuje miejsce aktywnego kontraktu: autor przyjmuje kontrakt tuż przed startem, a jedno miejsce zostaje zawsze wolne.

**Prototyp:** lot 2 Tristara (HSERA Mk1) w obu wariantach. Autor testuje w grze, a decyzja o rozbudowie zapada po teście.

## Weryfikacja R

Średnia surowość: start z właściwego kompleksu, właściwy prefiks nazwy, brak awarii w trakcie lotu, odzysk pojazdu, jeśli wiadomo. Do tego kilka pól Raportu Misji, pilnując, żeby formularz nie stał się uciążliwy.

## Karty prób

Karty prób w locie to **osobny strumień, poza limitem 6 Dyrektyw**. To rutyna lotów (nauka latania, lądowania, flightstick), a nie zobowiązanie polityczne. Do kart należą też przeloty między lotniskami (np. KSC → White Sands).

Skróty programów autora:

| Skrót | Rozwinięcie |
|---|---|
| HSERA | High Speed Experimental Research Aircraft |
| HAERA | High Altitude Experimental Research Aircraft |
| HERA | High Experimental Rocketry Aircraft |
| ERCV | Experimental Remote Control Vehicle (dawniej ERCA) |
| FLSV | Flight Launch System Vehicle (dawniej FLSM) |
