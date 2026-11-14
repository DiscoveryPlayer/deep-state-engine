# STATUS

> Ten plik czyta się na początku każdej sesji pracy i aktualizuje na jej końcu.
> Jest pamięcią projektu — historia czatu nią nie jest.

**Ostatnia aktualizacja:** 14.11.2026
**Bieżący plaster:** 2 „Pilotaż i poprawki”; wyprzedzająco zrobione części plastrów 3 i 5 („Pamięć świata”, PR do zatwierdzenia)
**Plan:** [Plan Budowy v3](PLAN_BUDOWY.md)

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

### Dossier III i miejsca startu (7–10.11.2026, decyzja 0016)

- `docs/research/dossier-III-watki-swiata-1951-1980.md` (wersja 1.1): 12 kotwic, 99 wątków, 16 szablonów, 200 wzorców, standard wątku głębokiego.
- `docs/design/miejsca-startu.md`: 31 miejsc z instalacji autora.

### Plaster 1: „Da się grać: 1951–1955” (11.11.2026, decyzja 0017)

- **Silnik wątków głębokich:** kotwice jako etapy, depesze w tym samym kwartale, pogłoski wywiadu, decyzje etapów z wagami, reakcje stron, sytuacje trwające, wątki-echa, gałęzie `minor`, bezpieczniki szablonów, warunek epoki.
- **Pętla kwartału** (`packages/core/src/turn`): `beginQuarter`, `closeQuarter`, pięć akcji Biurka, księga Korekt, raport kwartału, bilans lotów (tymczasowy), zakończenia ZW 0 i SO 0.
- **Stan w wersji 3** z migracją 2 → 3.
- **Odczyt KSP** (`packages/ksp-bridge`): parser ConfigNode, Migawka kariery, przypisanie startów do miejsc, kontrola miejsc startu. Dane testowe: przycięty zapis autora w `samples/saves/`.
- **Serwer** (`packages/server`): API kampanii, zapis atomowy, kopie przed zamknięciem kwartału, zabezpieczenia przed obcymi stronami. `npm start` albo `Uruchom-DSE.bat`.
- **Interfejs** (`packages/ui`): pasek z osią kwartałów, wskaźniki, stanowiska frakcji, widoki Biurko, Depesze, Wywiad, Budżet, Ludzie, Loty (KSP), Kronika; sprawy do decyzji z potwierdzeniem; ustawienia (motyw, tekst, układ, kontrast, animacje); układ sprawdzony od 320 do 2560 pikseli szerokości.
- **Treść:** 24 wątki 1951–1955, 2 szablony, 35 wzorców, 6 dylematów, 15 zmiennych świata, 31 miejsc startu.
- **Testy:** 81. Rozgrywka próbna przez API i w przeglądarce do 1956 roku.

### Wierność historii i Łącznik AI (12.11.2026, decyzja 0018)

- **Wierność historii** na planszy nowej kampanii: wysoka, umiarkowana, niska. W seriach 300 symulacji daje 90%, 70% i 51% rozstrzygnięć historycznych w etapach z wyborem.
- **Łącznik AI:** okno „Narrator” kopiuje Pakiet Kontekstu do rozmowy z Claude albo Gemini i wczytuje wklejoną odpowiedź. Dwa zlecenia: narracja kwartału (scena, prasa, kuluary) i głosy doradców w sprawie do decyzji.
- **Obraz i okna:** odprawa po zamknięciu kwartału, czytnik narracji, Tablica sytuacyjna regionów, przebiegi wskaźników, komunikaty znikające same.
- **Stan w wersji 4** z migracją 3 → 4. Testów: 94.

### Pamięć świata (13–14.11.2026, decyzja 0019)

- **Echa:** 91 następstw w `data/events/echoes.yaml`, podpiętych pod opcje dylematów, decyzje w wątkach i wzorce. Wracają po kilku kwartałach z informacją, z czego wynikają.
- **Rejestr Następstw:** skutki `registry` i `registryClose`, wpisy jawne (zakładka Ludzie) i ukryte (tylko dla narratora).
- **Bramka zapisu:** kwartał zaczyna się od wczytania pliku `.sfs`; obejście z wpisem w Kronice.
- **Raporty Misji:** każdy nowy start z zapisu dostaje numer i formularz (wynik, przeznaczenie, klasyfikacja); rozliczenie przy zamknięciu kwartału zastąpiło „bilans lotów”.
- **Narrator:** pełny pakiet (wydarzenia z kodami kart, przyczyny następstw, decyzje i akcje Andersona, Rejestr, loty), opcjonalna warstwa ukryta, rozmowa zakończona blokiem `WYNIK`, scena do pojedynczej karty.
- **Interfejs:** menu główne, usuwanie kampanii (do `campaigns/usuniete/`), okno bramki, Odprawa jako karty wydarzeń ze zdjęciami, Raporty Misji w zakładce Loty (KSP).
- **Zdjęcia:** manifest 19 pozycji i skrypt `Pobierz-zdjecia.bat` (Wikimedia Commons, tylko domena publiczna).
- **Stan w wersji 5** z migracją 4 → 5. Testów: 109. Interfejs przejrzany w Chromium od 320 do 2560 pikseli, w motywie ciemnym i jasnym.

## Następne zadania

Kolejność według Planu Budowy v3, rozdział 5.

1. **Pilotaż autora 1951–1955** na prawdziwej karierze. Notatki: co bolało, co nudziło, co było niejasne.
2. **Plaster 2:** poprawki z pilotażu, różnice między Migawkami w raporcie kwartału, wybór pliku zapisu z listy, kolejne akcje Biurka.
3. **Tor Treść:** blok A, lata 1956–1960 (19 wątków: Suez jako pierwszy, potem Węgry, Sputnik, Rok Geofizyczny, NASA, U-2), kolejne wzorce i szablony S03–S16.
4. **Plaster 3 „Loty mają znaczenie”:** Dyrektywy z weryfikacją, programy testowe i karty lotów (Tristar), Rozkaz Kwartalny, Teczka Pojazdu, dane RP-1.

## Do sprawdzenia przy pilotażu

- **Narrator:** czy Claude i Gemini trzymają się zasad z pakietu (nie dopisują faktów, nie podpowiadają opcji) i formatu sekcji. Gra tego nie sprawdza.
- **Nowe formaty narratora** (decyzja 0019): sekcje `## W…` do kart, rozmowa z blokiem `## WYNIK`, zachowanie modelu z warstwą ukrytą (czy nie zdradza wprost tego, czego Anderson nie wie). Nie były sprawdzone na prawdziwych odpowiedziach.
- **Zdjęcia:** `Pobierz-zdjecia.bat` nie był uruchomiony na prawdziwym Wikimedia Commons. Tytuły plików w manifeście mogą wymagać poprawek.
- **Bramka zapisu:** czy okno dat (15 dni przed i 30 dni po początku kwartału) pasuje do tego, jak autor zapisuje karierę.
- **Rozliczenie Raportów Misji** (decyzja 0019, punkt 5): liczby są tymczasowe i nie pochodzą z GDD.
- **Echa:** czy 23–34 następstwa na pięć lat to dobre tempo i czy szansa przecieku zatajonej awarii (0,35) nie jest za wysoka.
- **Niska wierność historii:** czy świat po kilku latach pozostaje spójny w lekturze.
- **Dryf Poparcia Publicznego** i nasycenie konferencji prasowej (decyzja 0017, punkt 6).
- **Skutki wydarzeń świata dla Nastawienia frakcji** (`faction … disposition` w gałęziach, na przykład po próbie bomby wodorowej): czy nie są zbyt częste.
- **Napięcie Geopolityczne** w rozgrywkach próbnych dochodziło w 1955 roku do odprężenia (poziom 5). Do oceny, czy to nie za wcześnie.

## Otwarte kwestie projektowe

- **Lista pilotów w trzech klasach** i **nowa lista nazw** w miejsce kolizji z DD 8.1 (decyzja 0013) — do przygotowania z autorem.
- **Kandydaci fikcyjni na prezydenta** od 1968 roku (decyzja 0016) — razem z systemem postaci.
- **Haskell** — rola łącznika przemysłu przy PACE; postaci firm do dopisania przy katalogu przemysłu.
- **Sponsorzy programów (D4)** — autor chce rozwinąć ten filar w osobnej rozmowie.
- **Dossier I „Próby w locie”** — raport z badań do przeniesienia do `docs/research/`.
- **Pull requesty #3–#5:** ich zawartość jest w całości w PR plastra 1. PR #5 można zamknąć po scaleniu.

## Uwagi środowiskowe (dla sesji Claude)

- W sandboxie Claude rejestr npm jest zablokowany. `node_modules` składa się z dowiązań do `/opt/npm-tools/node_modules` — szczegóły w `CLAUDE.md`.
- Brak `package-lock.json` jest celowy do pierwszego `npm install` u autora. Po nim plik blokady trafia do repozytorium.
- Zmiany w repozytorium wprowadza Claude przez pull requesty; autor zatwierdza i scala. Każdy PR dopisuje wpis do `CHANGELOG.md`.
- Interfejs sprawdza się na zrzutach ekranu z Chromium (Playwright jest w sandboxie, nie jest zależnością projektu).
