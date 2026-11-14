# THE DEEP STATE ENGINE — Plan Budowy v3

| | |
|---|---|
| **Wersja** | 3.0 (11.11.2026), stan prac uzupełniony 14.11.2026 |
| **Zastępuje** | Plan 1.0 ([plan/plan-budowy-v1.md](plan/plan-budowy-v1.md)) i wersję roboczą 2.0 ([plan/plan-budowy-v2-projekt.md](plan/plan-budowy-v2-projekt.md)) |
| **Podstawa** | GDD v1.0, Dokument Decyzyjny v1.1, decyzje 0001–0019, rozstrzygnięcia autora z listopada 2026 |
| **Cel** | Powiedzieć, co już działa, co budujemy dalej i w jakiej kolejności |

Analiza dziewięciu problemów z planu 2.0 (rozdział 2 tamtego dokumentu) pozostaje aktualna i ten plan jej nie powtarza. Zmienia się kolejność prac.

---

## 1. Co zmienia wersja 3

Plan 2.0 układał budowę warstwami: najpierw cały fundament, potem próby w locie, dopiero w fazie 3 interfejs. Autor zdecydował 11.11.2026, że chce jak najszybciej **grać**, a lata 1951–1955 mają być pierwszym pełnym okresem próbnym: z wyborami 1952, śmiercią Stalina i ich skutkami.

Dlatego wersja 3 buduje **plastrami**. Każdy plaster przechodzi przez wszystkie warstwy (treść, silnik, serwer, interfejs) i kończy się czymś, co da się rozegrać w przeglądarce. Pierwszy plaster jest gotowy.

| | Plan 2.0 | Plan 3.0 |
|---|---|---|
| Kolejność | Fundament → próby w locie → interfejs → narrator | Plastry: każdy dodaje jeden system od danych po ekran |
| Interfejs | Faza 3 | Jest od pierwszego plastra i rośnie z każdym następnym |
| Faza 0 (pilotaż w czacie) | Rozgrywka z AI jako Mistrzem Gry | Zastąpiona pilotażem w aplikacji (plaster 1) |
| Treść | Zdarzenia Epoki I: 20, potem 60 | Wątki głębokie (decyzje 0016 i 0017), blok po bloku |
| Start kampanii właściwej | Po fazie 3 | Po plastrze 4 (rozdział 5) |

---

## 2. Gdzie jesteśmy (14.11.2026)

### 2.1. Co działa

| Obszar | Stan | Gdzie |
|---|---|---|
| Stan gry, losowość z ziarnem, zapis i migracje (wersja 5) | działa, testy | `packages/core/src/state` |
| Widok gracza (zasada Z4) i warstwa ukryta narratora | działa, testy wycieku | `packages/core/src/view` |
| Wydarzenia świata: wątki głębokie, szablony, wzorce, dylematy, Rozbieżność | działa, testy | `packages/core/src/world` |
| Pętla kwartału: otwarcie, akcje Biurka, zamknięcie, raport, zakończenia | działa, testy | `packages/core/src/turn` |
| Budżet: Korekty w jednostkach, księga, rozliczanie w trybie Honorowym | działa | `turn/quarter.ts` |
| Odczyt zapisów KSP (.sfs), Migawka, kontrola miejsc startu | działa na zapisie autora | `packages/ksp-bridge` |
| Echa decyzji i Rejestr Następstw (jawny i ukryty) | działa, testy | `world/`, `data/events/echoes.yaml` |
| Bramka zapisu, loty i Raporty Misji | działa, testy | `turn/flights.ts` |
| Łącznik AI: pełny pakiet, warstwa ukryta, rozmowa, scena wydarzenia | działa, testy; nie sprawdzony na prawdziwych odpowiedziach | `packages/narrator` |
| Lokalny serwer z API | działa, testy | `packages/server` |
| Interfejs w przeglądarce | działa: menu główne, bramka, Odprawa z kartami, 7 widoków | `packages/ui` |
| Treść 1951–1955 | 24 wątki, 2 szablony, 35 wzorców, 6 dylematów, 91 ech, 15 zmiennych świata | `data/events` |
| Miejsca startu | 31 miejsc z okresami dostępności | `data/launch-sites.yaml` |

Testów jest 109. `npm run check` przechodzi.

### 2.2. Czego gra jeszcze nie robi

To lista uczciwa, żeby pilotaż nie rozczarował:

1. **Loty wpływają na politykę tylko przez Raporty Misji.** Od 14.11.2026 każdy start z zapisu ma raport, a jego wynik, przeznaczenie i klasyfikacja zmieniają wskaźniki (decyzja 0019, reguła tymczasowa). Nadal nie ma Dyrektyw, kart lotów ani programów testowych.
2. **Nie ma przeciwnika.** ZSRR istnieje w depeszach i zmiennych świata, ale nie ma własnego programu kosmicznego ani kalendarza.
3. **Narrator działa przez kopiuj-wklej.** Gra buduje pakiet dla Claude albo Gemini w przeglądarce i wczytuje wklejoną odpowiedź (decyzje 0018 i 0019). Depesze nadal pochodzą z plików YAML; narrator dopisuje do nich sceny, prasę, kuluary, głosy doradców i rozmowy.
4. **Ludzie są statyczni.** Sześciu dyrektorów ma cechy i Lojalność, ale nie starzeją się, nie odchodzą i nie mają własnych wątków.
5. **Budżet to tylko Korekty.** Nie ma budżetu rocznego, Sesji Budżetowej ani Wniosków Programowych.
6. **Rejestr Następstw dopiero rusza.** Decyzje tworzą już wpisy jawne i ukryte, a echa je zamykają (decyzja 0019). Wpisów nie da się jeszcze wykorzystać w akcjach Biurka (Przysługa, Śledztwo).
7. **Zapis do KSP nie istnieje.** Korekty wpisujesz w KSP ręcznie (tryb Honorowy).
8. **Po 1955 roku świat cichnie.** Treść kończy się na IV kwartale 1955. Grać da się dalej, ale depesz będzie coraz mniej.

---

## 3. Zasady, które się nie zmieniają

| Zasada | Treść |
|---|---|
| **Z1** | Fakty z KSP są nienaruszalne. DSE je czyta i ocenia, nigdy nie poprawia. |
| **Z3** | Liczby i rozstrzygnięcia ustala silnik. AI tylko opisuje to, co silnik już postanowił. |
| **Z4** | Do interfejsu i do AI dane trafiają wyłącznie przez `toPlayerView`. Nowe pole stanu jest domyślnie ukryte. |
| Determinizm | To samo ziarno i te same decyzje dają tę samą kampanię. Losowość tylko przez `Rng`. |
| Silnik bez I/O | `packages/core` dostaje dane i zwraca dane. Pliki i sieć obsługują inne pakiety. |
| Liczby jako dane | Każda liczba z GDD jest w `data/*.yaml` albo jest nazwaną stałą z komentarzem o źródle. |
| Historia otwarta | Wątki mają gałąź historyczną i alternatywy; 12 kotwic jest pewnych (decyzja 0013, Dossier III). Wojny jądrowej nie ma (K12). |
| Prawdziwe osoby | Bez wymyślonych przestępstw i skandali. Brudne sprawy dostają postacie fikcyjne albo instytucje. |
| Prywatność | Kampanie i klucze API zostają na dysku autora. Repozytorium jest publiczne, gra nie będzie publikowana. |
| Praca przez PR | Każda zmiana to pull request do `main`, z wpisem w CHANGELOG. Scala autor. |

---

## 4. Architektura

### 4.1. Moduły

```
data/                    treść gry (YAML): frakcje, postaci, wydarzenia, miejsca startu
packages/core            silnik: stan, świat, kwartał, Biurko, widok gracza
packages/content         wczytywanie i walidacja data/
packages/ksp-bridge      odczyt plików .sfs → Migawka
packages/server          lokalny serwer HTTP: kampanie na dysku, API, podawanie interfejsu
packages/ui              interfejs w przeglądarce (TypeScript i CSS, bez bibliotek)
packages/narrator        narrator AI (plaster 5)
tools/cli                polecenia `npm run dse -- …` (walidacja, symulacje świata)
tools/sim                symulator kampanii z profilem gracza (plaster 4)
```

Zależności idą w jedną stronę: `ui → server → core, content, ksp-bridge`. Silnik nie wie o serwerze ani o plikach.

### 4.2. Kwartał w aplikacji

```
otwarcie kwartału (silnik)
  świat: dylematy po terminie → echa z kolejki → nowe wątki → szablony → sytuacje trwające
         → etapy wątków (pogłoska, decyzja, rozstrzygnięcie, reakcje) → wzorce → dylematy
  Uwaga Dowódcy: 6 (+ premia po Odpoczynku)
        │
gracz   ▼
  wczytuje zapis kariery (.sfs) z początku kwartału → gra zakłada Raporty Misji nowym startom
  czyta Odprawę: bilans, karty wydarzeń, następstwa, oceny wywiadu
  wypełnia Raporty Misji
  rozstrzyga sprawy do decyzji (albo świadomie je zostawia)
  wydaje Uwagę Dowódcy na akcje Biurka
        │
zamknięcie kwartału (silnik)
  Korekty do księgi → zegary Cierpliwości frakcji → przepływ PP → ZW → dryf PP
  → rozliczenie Raportów Misji → raport → sprawdzenie zakończeń → otwarcie następnego kwartału
        │
gracz   ▼
  wpisuje Korektę do kariery i gra ten kwartał w KSP; zapis z jego końca otwiera następny kwartał
```

Od decyzji 0019 kwartał zaczyna się bramką zapisu: gracz wczytuje plik `.sfs` z początku kwartału, gra wykrywa nowe starty i zakłada im Raporty Misji, a potem pokazuje Odprawę. W kroku „świat” przed nowymi wątkami wracają echa z kolejki.

Kampania zapisuje się po każdej operacji. Przed każdym zamknięciem kwartału serwer robi kopię w `campaigns/kopie/`.

### 4.3. Interfejs: zasady stałe

Ustalone z autorem i obowiązujące we wszystkich plastrach:

- **Jeden styl przez całą grę:** konsola Centrum Kontroli Lotów w Houston, z lekką kolorystyką interfejsu MAGI (bursztyn, zieleń, czerwień, sześciokątne lampki). Interfejs nie zmienia się z epokami.
- **Spokój:** jedyne głośne miejsce na ekranie to „Sprawy do decyzji”. Reszta jest stonowana, bez animacji, które nie odpowiadają na działanie gracza.
- **Ustawienia jak w grze:** motyw ciemny i jasny, rozmiar tekstu, gęstość układu, kontrast, animacje.
- **Odporność na powiększenie:** Ctrl + i Ctrl − nie mogą rozlać ekranu. Układ reaguje na szerokość dostępną w jednostkach tekstu (zapytania kontenerowe w `em`): trzy kolumny, potem dwie, potem jedna. Sprawdzane przy każdej zmianie na szerokościach od 320 do 2560 pikseli.
- **Nieodwracalne działania mają potwierdzenie:** decyzja w sprawie i zamknięcie kwartału wymagają drugiego kliknięcia.
- **Bez bibliotek:** własny kod, żadnych zależności w przeglądarce. Strona nie łączy się z niczym poza lokalnym serwerem.

---

## 5. Plastry

Każdy plaster kończy się wersją, w którą da się zagrać. Numery faz z planu 2.0 podaję w nawiasach dla ciągłości.

### Plaster 1 — „Da się grać: 1951–1955” ✔ (zrobione, PR z 11.11.2026)

Silnik wątków głębokich, pętla kwartału, pięć akcji Biurka, odczyt zapisów KSP, serwer, interfejs, treść na 20 kwartałów (dawne fazy 1B, część 1C, 1D bez Dyrektyw, pierwsza wersja fazy 3).

**Kamień M2a.** Autor uruchamia grę jednym plikiem i rozgrywa kwartał w przeglądarce.

### Plaster 2 — „Pilotaż i poprawki”

Autor gra 1951–1955 na prawdziwej karierze i notuje, co boli, co nudzi i co jest niejasne. Równolegle:

| Zadanie | Opis |
|---|---|
| Poprawki z pilotażu | Balans wskaźników, tempo depesz, czytelność ekranów |
| Różnice między Migawkami | Raport kwartału pokazuje, co się zmieniło w karierze: starty, technologie, kontrakty, personel |
| Wybór pliku zapisu | Zamiast wklejania ścieżki: lista zapisów z folderu KSP ustawionego raz w kampanii |
| Skutek `registry` ✔ | Zrobione 14.11.2026 (decyzja 0019): wpisy jawne w zakładce Ludzie, ukryte tylko dla narratora |
| Pozostałe akcje Biurka | Z GDD 10.2: Rozmowa z postacią, Inspekcja, Mediacja, Przysługa; reszta (Śledztwo, Przetasowanie, Przegląd techniczny) razem z systemami, których dotyczą |
| Kandydaci na wiceprezydenta | Sprawdzenie w grze, czy wybór z 1952 roku jest odczuwalny do 1955 |

**Kryterium:** autor kończy kampanię 1951–1955 i lista poprawek jest zamknięta.

### Plaster 3 — „Loty mają znaczenie” (dawna faza 2 i reszta 1D)

To najważniejszy brak: dziś KSP i meta-gra prawie się nie spotykają.

| Zadanie | Opis |
|---|---|
| Dyrektywy | Frakcje zlecają cele z terminem. Weryfikacja kanałami W, R i D (decyzja 0009) na podstawie Migawek |
| Programy testowe i karty lotów | Schemat, przeniesienie 19 kart autora, Tristar jako pierwszy program |
| Rozkaz Kwartalny | Jedna strona do wydruku: co obiecano, co trzeba zrobić w KSP w tym kwartale, jakie Korekty wpisać |
| Teczka Pojazdu | Historia każdego pojazdu z zapisów: loty, awarie, miejsca startu |
| Dane RP-1 (dawna 1C) | `tools/rp1-extract`: lata technologii, programy, silniki z RP-1 4.8.1 do `data/rp1/` |
| Paczka „PACE Flight Test” (2K) | Jeden kontrakt Contract Configurator do testu u autora. Opcjonalna |

**Zrobione wyprzedzająco (decyzja 0019):** bramka zapisu na początku kwartału, wykrywanie startów i Raport Misji z rozliczeniem tymczasowym. Rozliczanie Dyrektyw zastąpi tę regułę.

**Kamień M1.5.** Lot Tristara rozliczony z prawdziwego zapisu: karta zaliczona albo nie, z uzasadnieniem.

### Plaster 4 — „Budżet i Kongres” (część dawnej fazy 7)

| Zadanie | Opis |
|---|---|
| Budżet roczny | Sesja Budżetowa w III kwartale, zależna od ZW, koniunktury i składu Kongresu (wątek `kongres-1954` już ustawia flagi) |
| Wnioski Programowe | Formularz, recenzje frakcji, przesłuchanie, decyzja (decyzja 0014). Szuflada i Spadek |
| Przemysł | Firmy i przetargi z katalogu (decyzja 0011), sponsorzy programów po rozmowie z autorem (D4) |
| Symulator z profilem gracza | `tools/sim`: tysiące kampanii z automatycznym graczem do strojenia balansu |

**Kamień M2. Start kampanii właściwej.** Od tego miejsca stan kampanii autora musi przechodzić przez migracje bez strat.

### Plaster 5 — „Świat mówi” (dawna faza 4)

**Zrobione (decyzja 0018):** Łącznik AI, czyli Pakiet Kontekstu z widoku gracza, narracja kwartału i głosy doradców przez kopiuj-wklej, bez klucza API.

**Zrobione (decyzja 0019):** pełny pakiet z następstwami i czynami Andersona, warstwa ukryta na życzenie gracza, rozmowa prowadząca do decyzji, sceny do kart wydarzeń, zdjęcia z domeny publicznej.

**Zostaje:** memoranda dyrektorów po akcjach Biurka, referent Wniosków, kronika roku, opcjonalne bezpośrednie połączenie z API. Zasada Z3 bez wyjątków: AI dostaje wynik z silnika i `PlayerView` (a na życzenie gracza warstwę ukrytą), zwraca tekst. Palety epok (Dossier III, część V) jako dane dla wzorców. Ślepy test modeli. Klucz API tylko w lokalnym `.env`.

**Kamień M3.**

### Plaster 6 — „Przeciwnik” (dawna faza 5)

Model programu ZSRR: kalendarz historyczny przesuwany Rozbieżnością, kursem Kremla i presją wyścigu; Interkosmos (z lotem polskiego kosmonauty, decyzja 0016). Wywiad: oceny z kodami wiarygodności już są, dochodzą operacje i błędne oceny. Szok orbitalny jako kryzys wieloetapowy.

### Plaster 7 — „Ludzie” (dawna faza 6)

Postaci starzeją się, awansują i odchodzą. Korpus pilotów i astronautów w trzech klasach (lista do przygotowania z autorem). Cechy ukryte ujawniają się w kryzysach. Kandydaci fikcyjni na prezydenta od 1968 roku.

### Plaster 8 — „Zapis do KSP” (dawna faza 8)

Tryb Zapisu: DSE wpisuje Korekty do pliku kariery według białej listy z DD 3.2, z kopią zapasową i uzgodnieniem z księgą. Do tego czasu obowiązuje tryb Honorowy.

### Plaster 9 — „Pełna kampania” (dawna faza 9)

Epoki II–IV, zakończenia, balans całości.

### Ścieżka krytyczna

```
1 ✔ → 2 pilotaż → 3 loty → 4 budżet → [start kampanii właściwej] → 5 narrator → 6 przeciwnik → 7 ludzie → 8 zapis → 9
              tor Treść biegnie obok przez cały czas
```

---

## 6. Tor Treść

Standard: **wątek głęboki** (Dossier III, część VII). Wątek ma punkty zwrotne, depesze między nimi, sytuacje trwające, reakcje stron, pogłoski wywiadu, decyzje Andersona i echa.

| Zakres | Cel | Stan | Kiedy |
|---|---|---|---|
| Blok A, lata 1951–1955 | 24 wątki | gotowe | plaster 1 |
| Blok A, lata 1956–1960 (Suez, Węgry, Sputnik, Rok Geofizyczny, NASA, U-2…) | 19 wątków | do napisania | plastry 2–3, partiami po około 10 |
| Blok B, 1961–1965 | 25 wątków | karty w dossier | plastry 4–5 |
| Blok C, 1966–1972 | 20 wątków | karty w dossier | plastry 6–7 |
| Blok D, 1973–1980 | 11 wątków | karty w dossier | plaster 9 |
| Wzorce | 200 | 35 | po 30–40 na plaster, z paletami epok od plastra 5 |
| Szablony | 16 | 2 | S03–S16 razem z blokami, których dotyczą |
| Dylematy samodzielne | około 40 | 6 | po kilka na plaster |
| Kotwice | 12 | etapy-kotwice w 4 wątkach 1951–1955 | razem z wątkami |

Każda partia treści przechodzi `dse waliduj`, serię `dse swiat --serie 300` (częstości gałęzi) i lekturę kilku kampanii od początku do końca.

Pozostała treść: frakcje i postaci w wersji ostatecznej (Haskell, postaci firm), Biblia świata po usunięciu kolizji nazw (decyzja 0013), Dossier I i II jako dane.

---

## 7. Tor Strona KSP

| Etap | Zakres | Stan |
|---|---|---|
| K1 | Zamrożenie instalacji: lista modów z CKAN, kopia folderu KSP, ustawienia trudności w `campaign.yaml` | do zrobienia przed plastrem 4 |
| K2 | Konwencje: prefiksy nazw pojazdów, nazwy kompleksów, zapis gry na granicy kwartału | częściowo: okno 30 dni po kwartale działa |
| K3 | Paczka „PACE Flight Test” | plaster 3 |
| K4 | Eksperymenty autora: opis, konfiguracje, mapowanie na warunki | plaster 3 |

---

## 8. Jak pracujemy

- Jedna sesja to jeden plaster albo jego wyraźna część. Kończy się działającym kodem, testami i notą „co sprawdź”.
- Pamięcią projektu jest repozytorium: `docs/STATUS.md`, `docs/decisions/`, `CHANGELOG.md`. Historia czatu nią nie jest.
- Każdy PR opiera się na `main`. Autor czyta opis, sprawdza listę i scala.
- Zmiana kształtu stanu podnosi `STATE_SCHEMA_VERSION` i dostaje migrację z testem. Od kamienia M2 migracje muszą zachowywać kampanię autora.
- Interfejs po każdej zmianie przechodzi przegląd na zrzutach ekranu: ciemny i jasny motyw, szerokości odpowiadające powiększeniu 100–400%.
- W środowisku Claude rejestr npm jest zablokowany. Nową zależność trzeba zgłosić autorowi; nie dodaje się jej na ślepo.

---

## 9. Ryzyka

| Ryzyko | Skutek | Odpowiedź |
|---|---|---|
| Treść rośnie szybciej niż testy jej sensu | Sprzeczne depesze, wątki bez konsekwencji | Walidator powiązań, serie symulacji, lektura kampanii po każdej partii |
| Balans strojony bez gracza | Wskaźniki dryfują do skrajności po 40 kwartałach | Symulator z profilem gracza w plastrze 4; do tego czasu serie krótkie (20 kwartałów) |
| Zapis RP-1 zmienia format | Parser czyta błędne dane | Wersja RP-1 zamrożona (4.8.1); zapisy autora jako dane testowe |
| Kampania autora traci stan przy migracji | Utrata tygodni gry | Kopie przed zamknięciem kwartału; migracje z testami od M2 |
| Narrator łamie Z3 albo Z4 | AI zmyśla liczby lub zdradza tajemnice | AI dostaje tylko `PlayerView` i wynik silnika; test wycieku już istnieje |
| Teksty z YAML nużą przy drugiej kampanii | Mniejsza regrywalność przed plastrem 5 | Warianty tekstów w gałęziach, palety epok |

---

## 10. Czego potrzebuję od autora

1. **Pilotaż 1951–1955** na prawdziwej karierze i notatki: co bolało, co nudziło, co było niejasne.
2. **Sprawdzenie odczytu zapisu** na własnych plikach: czy fundusze, starty i miejsce startu zgadzają się z tym, co widać w KSP.
3. **Decyzje projektowe** odłożone do rozmowy: sponsorzy programów (D4), lista pilotów w trzech klasach, nowa lista nazw w miejsce kolizji z DD 8.1.
4. **Zamrożenie instalacji KSP** (K1) przed startem kampanii właściwej.
