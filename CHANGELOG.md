# Dziennik zmian

Najnowsze na górze. Każdy wpis odpowiada jednemu pull requestowi.

## 2026-11-12 — Wierność historii i Łącznik AI (decyzja 0018)

- **Wierność historii:** wybór przy zakładaniu kampanii (wysoka, umiarkowana, niska; około 90%, 70% i 50% rozstrzygnięć historycznych). Polecenie `dse swiat` dostało opcję `--wiernosc` i miarę zbieżności w raporcie serii.
- **Łącznik AI** (`@dse/narrator`): Pakiet Kontekstu z widoku gracza do wklejenia w rozmowę z Claude albo Gemini, odczyt wklejonej odpowiedzi, narracja kwartału i głosy doradców. Bez klucza API i bez połączeń z internetem.
- **Interfejs:** okno „Narrator”, czytnik narracji, odprawa po zamknięciu kwartału, narracja w zakładkach Biurko i Depesze, głosy doradców w sprawach, Tablica sytuacyjna regionów, przebiegi wskaźników, komunikaty znikające same.
- **Stan kampanii w wersji 4** z migracją 3 → 4 (starsze kampanie dostają wierność wysoką i pustą narrację).
- Poprawka: podwójna kropka w uwadze raportu o Korekcie budżetu.
- Testy: 94 (było 81).

## 2026-11-11 — Plaster 1: da się grać, 1951–1955 (decyzja 0017, Plan Budowy v3)

- **Silnik wątków głębokich** (`@dse/core`, `world/`): etapy-kotwice, depesze w tym samym kwartale, pogłoski wywiadu, decyzje etapów z wagami gałęzi, reakcje stron, sytuacje trwające, wątki-echa, gałęzie `minor`, pominięcie etapu bez dostępnej gałęzi, bezpieczniki szablonów, warunek epoki.
- **Pętla kwartału** (`turn/`): otwarcie i zamknięcie kwartału, pięć akcji Biurka (Spotkanie, Lobbing, Konferencja prasowa, Zlecenie wywiadowcze, Odpoczynek), księga Korekt w jednostkach, raport liczony od otwarcia kwartału, dryf Poparcia Publicznego, tymczasowy bilans lotów, zakończenia przy ZW 0 i SO 0.
- **Stan kampanii w wersji 3** z migracją 2 → 3.
- **Odczyt zapisów KSP** (`@dse/ksp-bridge`): parser ConfigNode, Migawka kariery RP-1 4.8.1, przypisanie startów do miejsc przez identyfikator kompleksu, kontrola miejsc startu (`data/launch-sites.yaml`, 31 miejsc). Start z niedozwolonego miejsca trafia do Kroniki jako naruszenie.
- **Serwer** (`@dse/server`): lokalne API na 127.0.0.1:4780, zapis atomowy, kopie przed zamknięciem kwartału, kontrola nagłówków `Host` i `Origin`, polityka CSP.
- **Interfejs** (`@dse/ui`): konsola w stylu Houston z kolorystyką MAGI, motyw ciemny i jasny, ustawienia tekstu, układu, kontrastu i animacji; siedem widoków; decyzje z potwierdzeniem; układ odporny na powiększenie (sprawdzony od 320 do 2560 pikseli).
- **Treść 1951–1955:** 24 wątki głębokie, 15 zmiennych świata (`napiecie_korea` → `napiecie_azja`), 35 wzorców (było 17), 6 dylematów (było 4).
- **Uruchamianie:** `npm start` i `Uruchom-DSE.bat` dla Windows.
- **Dokumenty:** Plan Budowy v3 (wersje 1.0 i 2.0 w `docs/plan/`), decyzja 0017, słowniczek, `docs/design/wydarzenia-swiata.md` (punkt 12), README z instrukcją uruchomienia.
- Zawiera też zmiany z PR #3, #4 i #5, które nie trafiły wcześniej do `main`.
- Testy: 81 (było 46).

## 2026-11-10 — Odpowiedzi do Dossier III, wątki głębokie, miejsca startu (decyzja 0016)

- Dossier III w wersji 1.1:
  - odpowiedzi autora: K12 przyjęta, kandydaci fikcyjni, gałęzie przerwane przy zamachach, Interkosmos w modelu ZSRR, do 10 nowych zmiennych;
  - nowa część VII: wątek głęboki (siedem warstw, docelowa gęstość) i pełny przykład Kryzysu sueskiego ze szkicem YAML i listą zmian w silniku.
- `docs/design/miejsca-startu.md`: 31 miejsc z instalacji autora (KSCSwitcher). 15 dla PACE i Zachodu, 6 dla bloku wschodniego i Chin, 10 poza okresem gry. Korekta DD 4.6 (Andøya jest dostępna).
- Decyzja 0016.

## 2026-11-07 — Dossier III: wątki świata 1951–1980

- `docs/research/dossier-III-watki-swiata-1951-1980.md`:
  - model poziomów pewności i rodzajów gałęzi (H/P/O/X/A);
  - kotwice jako etapy;
  - bezpieczniki szablonów;
  - dylematy jako punkty decyzyjne;
  - palety epok.
- 12 kotwic, 99 wątków (blok A 1951–1960: 43, B 1961–1965: 25, C 1966–1972: 20, D 1973–1980: 11), 16 szablonów, 200 wzorców, przykładowe palety (odkrycia naukowe, wizyty).
- Plan zmian w silniku i pytania do autora.

## 2026-11-07 — Wydarzenia świata (decyzja 0015)

- Silnik wydarzeń świata w `@dse/core` (`world/`): wątki z etapami i gałęziami, etapy alternatywne, kotwice, szablony z parametrami, wzorce, dylematy z opcją domyślną, Rozbieżność regionów, strukturalne warunki i skutki, walidacja treści.
- Stan kampanii w wersji 2 (pole `world`) z migracją z wersji 1; odczyt stanu przechodzi przez `migrateState`.
- Widok gracza: `worldNews` (tylko wpisy publiczne) i `pendingDilemmas` (bez opcji domyślnej).
- Treść w `data/events/`: 6 regionów, 8 zmiennych, 4 wątki (Korea, Abadan, maccartyzm, wybory 1952), 2 szablony, 16 wzorców, 4 dylematy — z pliku wydarzeń 1951.
- CLI: `dse swiat` (symulacja lat, `--prawda`, `--decyzje`, `--serie N`), `waliduj` liczy treść świata.
- Dokumenty: `docs/design/wydarzenia-swiata.md`, decyzja 0015, słowniczek.
- Po odpowiedziach autora: dziewięciu kandydatów na wiceprezydenta (etap na konwencji, 1952-Q3), koszt bierności w dylematach (`inactionEffects`) i opcje „nie angażować się”, odmiana parametrów szablonów przez przypadki (`{kraj.dop}`), wzorzec „nowy rocznik inżynierów”, powrót wątku irańskiego do etapu „los Mosaddegha” po wycofaniu Brytyjczyków.
- Testy: 46 (było 26).

## 2026-11-07 — Domknięcie fazy 1A i decyzje z rund pytań

- Przejście na RP-1 4.8.1: ustawienia domyślne kampanii, README, decyzja 0007 (zastępuje część 0005).
- Decyzje 0008–0014: harmonogram i pilotaż, weryfikacja (kanały, eksperymenty, kontrakty), programy PACE w GameData, przemysł i przetargi, budżet ustawowy, historia otwarta i kotwice, Wnioski Programowe.
- Dokumenty: katalog firm i projekt sponsorów (`docs/design/`), dossier „Szuflada” i analiza pliku wydarzeń 1951 (`docs/research/`), Plan Budowy v2 w wersji roboczej, pytania i rozstrzygnięcia (`docs/plan/`).

## 2026-10-26 — Faza 1A: szkielet

- Monorepo TypeScript, silnik bez I/O, schematy treści i stanu, widok gracza (Z4), CLI, 26 testów.
