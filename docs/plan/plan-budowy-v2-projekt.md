> **Status:** dokument roboczy z 30.10.2026, zachowany dla analizy problemów (rozdział 2). Obowiązuje [Plan Budowy v3](../PLAN_BUDOWY.md).

# THE DEEP STATE ENGINE — Plan budowy aplikacji

*Intermarium History*

| | |
|---|---|
| **Wersja** | 2.0, projekt do zatwierdzenia (30.10.2026) |
| **Zastępuje** | Plan budowy 1.0 z 25.10.2026 |
| **Podstawa** | GDD 1.0, Dokument Decyzyjny 1.1, rozmowy z 26–30.10.2026, analiza zapisów RP-1 (kariera testowa 4.8.1 i kariera PACE 3.21), kod RP-1 v4.8.1.0, dossier „Próby w locie 1944–1960” i „Szuflada 1944–1960”, Twoje karty kamieni milowych |
| **Status** | Wersja robocza. Ostateczny plan powstanie po odpowiedziach na pytania z dokumentu „Pytania i rekomendacje do Planu Budowy v2”. Miejsca zależne od odpowiedzi oznaczam **[P-xx]**, gdzie xx to numer pytania |

---

## 0. Co się zmieniło od wersji 1.0

| Obszar | Plan 1.0 | Teraz | Skutek dla planu |
|---|---|---|---|
| Wersja RP-1 | 4.7 | **4.8.1**, zamrożona (Twoja decyzja) | Decyzja 0005 do zastąpienia. Od 4.8.0 dziennik kariery eksportuje się też do JSON |
| Wiedza o zapisie | Z kodu RP-1 | Z kodu i z **siedmiu prawdziwych zapisów** | Parser projektujemy na faktach, nie na założeniach (rozdział 2) |
| Ekonomia | Korekty w kwotach bezwzględnych | Kariera PACE pokazała nadwyżkę rzędu 2,5 tys. miesięcznie przy wynagrodzeniach około 11,2 tys. | Korekty muszą być **względne**, inaczej rozjadą się z gospodarką RP-1 (2.3, 4.6) |
| Dane uniwersalne RP-1 | Nie planowane | Parts Browser (4786 rekordów z latami i kosztami), programy, liderzy, wynagrodzenia, lata drzewa | Nowy moduł danych referencyjnych (4.2) |
| Próby w locie | Margines GDD | Twoje karty kamieni milowych, pierwsze dossier, „dobra rutyna”, flightstick | Nowy filar gry i nowa faza (4.4, faza 2) |
| Własne programy gracza | Brak | Wnioski Programowe pisane przez Ciebie od zera, opiniowane przez frakcje i Kongres; „Szuflada” z drugiego dossier | Nowy filar sprawczości Andersona (4.5) |
| Weryfikacja | Poziomy W/R/D | Do poziomów dochodzi **kanał**. Zapis nie przechowuje przebiegu lotu | Architektura weryfikacji (2.2, 4.3) |
| Kontrakty RP-1 | „Programy ograniczają kontrakty” | Kod 4.8.1: kontrakty wiążą się z programami tylko przez własną konfigurację. Rekordy RP-1 działają poza programami. Realne ograniczenie to limit aktywnych kontraktów | Paczka kontraktów PACE jest wykonalna bez zjadania slotów (4.7) |
| Budżet | Linie Budżetowe i Analiza Spójności | Nie da się zaplanować kosztów RP-1 na lata | Nowa filozofia budżetu: rezerwa, klasy szacunku, licznik „miesięcy do zera” (4.6) |
| Stan kodu | Plan | Faza 1A ukończona: 26 testów, PR #1 otwarty | Faza 1A wymaga domknięcia (scalenie, 4.8.1) |

Rozdziały 2 i 3 z wersji 1.0 („PACE — propozycja rozwinięcia”, „Wybór technologii”) są zamknięte decyzjami 0001 i 0004 i nie wracają w tym dokumencie.

---

## 1. Gdzie jesteśmy

### 1.1. Dokumenty

| Dokument | Stan |
|---|---|
| GDD 1.0 (~17 tys. słów) | W repozytorium. Wymaga wersji 1.2 z nowymi filarami (próby w locie, Wnioski, budżet) |
| Dokument Decyzyjny 1.1 | W repozytorium. Część pytań zamknięta |
| Plan budowy 1.0 | W repozytorium. Ten dokument go zastąpi |
| Dossier I „Próby w locie 1944–1960” | Raport z badań, poza repozytorium |
| Dossier II „Szuflada 1944–1960” | Plik Markdown, poza repozytorium |
| Twoje karty kamieni milowych (PDF) | 19 kart w 6 programach: HSERA Mk1 „Tristar”, Mk2 „Southern Cross”, Mk3 „Procyon”, FLSM, HERA V1, HAERA Mk1 „Lone Star” |
| Biblia świata, Warstwa Personelu, poradnik RO/RP-1 | U Ciebie. Biblia ma trafić do `data/world/` po poprawkach kolizji nazw (DD 8.1) |

### 1.2. Kod

- Gałąź `faza-1a-szkielet`, PR #1, CI przechodzi, PR nie jest scalony.
- Monorepo TypeScript, 26 testów, CLI z poleceniami `waliduj`, `nowa-kampania`, `stan`.
- Do poprawy przy domykaniu 1A: `DEFAULT_CAMPAIGN_SETTINGS.rp1Version` ma `4.7.0.0`, decyzja 0005 mówi o 4.7, README też.

### 1.3. Dane

- Kariera testowa 4.8.1 „test-27-10”: trzy zapisy.
- Kariera PACE 3.21: cztery zapisy, od 1951-01 do 1953-06.
- Obie leżą na razie tylko w moim środowisku roboczym, nie w repozytorium **[P-K3]**.
- Lokalny klon RP-1 v4.8.1.0 i fragment RSS służą jako źródło danych referencyjnych.

### 1.4. Otwarte kwestie z poprzednich etapów

Haskell, Korpus Astronautów, kolizje nazw, pakiet kontraktów PACE, kolejność pracy nad próbami w locie. Wszystkie wracają w dokumencie pytań.

---

## 2. Analiza fundamentalna: dziewięć problemów, które kształtują wdrożenie

Każdy punkt ma ten sam układ: na czym polega problem, co z niego wynika i jaką decyzję proponuję.

### 2.1. Dwa zegary: czas KSP i kwartał meta-gry

**Problem.** Grasz w KSP w sposób ciągły. Czas płynie w sekundach od 1951-01-01 (UT 0), a dziennik kariery RP-1 dzieli historię na miesiące. Meta-gra rozlicza się kwartałami, a plik zapisu powstaje wtedy, kiedy go zapiszesz. Rzadko wypada to dokładnie na granicy kwartału.

**Wniosek.** Trzeba ustalić, co jest źródłem prawdy dla jakiej informacji:
- **Przepływy** (fundusze, wydatki, starty, awarie, kontrakty, technologie) liczymy z dziennika kariery, z miesięcy należących do kwartału. Te dane są dokładne niezależnie od momentu zapisu.
- **Stan** (pojazdy na orbicie, kompleksy startowe, personel, waluty) bierzemy z Migawki w chwili zapisu. Ta informacja jest przybliżona.

**Propozycja.**
- Kwartał rozlicza się z zapisu zrobionego po przekroczeniu granicy kwartału, w oknie tolerancji (np. do 30 dni) **[P-B3]**.
- Zapis sprzed granicy silnik odrzuca.
- Zapis zbyt późny daje ostrzeżenie, a przepływy i tak liczy się z właściwych miesięcy.
- Najprostszy nawyk to alarm (np. Kerbal Alarm Clock) na pierwszy dzień kwartału **[P-C3]**.

### 2.2. Granica obserwowalności: co DSE w ogóle może wiedzieć

**Problem.** Zapis przechowuje stan w chwili zapisu i dziennik zdarzeń. Nie przechowuje przebiegu lotu, czyli maksymalnej prędkości, wysokości, czasu utrzymania prędkości ani przeciążeń. Tymczasem Twoje karty prób stoją właśnie na takich warunkach, na przykład „lot powyżej 360 m/s przez trzy minuty”.

**Kanały wiedzy:**

| Kanał | Co widzi | Czego nie widzi | Poziom |
|---|---|---|---|
| Stan zapisu (.sfs) | Pojazdy istniejące w chwili zapisu i ich orbity, załogi, waluty, kompleksy, programy, technologie | Przebieg lotu; pojazdy, które już nie istnieją | W |
| Dziennik kariery | Miesięczne finanse z rozbiciem, starty (pojazd, kompleks, data), awarie części, kontrakty, technologie, budowy, liderzy | Parametry lotu; czy cel lotu został osiągnięty | W |
| Kontrakty RP-1 | Ukończone rekordy i kamienie milowe RP-1 | Warunki spoza konfiguracji RP-1 | W |
| Wyniki eksperymentów | Eksperyment wykonany w danej sytuacji (np. nisko w atmosferze) i biomie | Dokładna wysokość i prędkość | W, zgrubny |
| Kontrakty PACE (paczka Contract Configurator) | Warunki w trakcie lotu: wysokość, prędkość i, do potwierdzenia, czas ich utrzymania | Tylko to, co zdefiniujemy | W, wymaga paczki po stronie KSP |
| Raport Misji i dziennik pilota | Deklaracje gracza | Nic sprawdzalnego samo w sobie | R, jeśli DSE sprawdza spójność z danymi (był start, pojazd wylądował); w przeciwnym razie D |
| Telemetria na żywo (kRPC, tryb Modu) | Wszystko | — | Przyszłość |

**Propozycja.** Każdy warunek w danych gry (Dyrektywa, karta lotu, warunek Wniosku) deklaruje dwie rzeczy: **poziom** (W, R albo D) i **kanał**. Walidator treści pilnuje celu GDD 11.2, czyli co najmniej 70 procent warunków W w puli Dyrektyw, i odrzuca warunek, który deklaruje kanał niezdolny do jego sprawdzenia. Szczegóły w 4.3.

### 2.3. Skala ekonomii: Korekty muszą być względne

**Problem.**
- W karierze PACE (1951–1953) przychód wynosił około 13,7 tys. miesięcznie, a wynagrodzenia około 11,2 tys. Korekta „−5000” to więc dwa miesiące nadwyżki.
- W 1965 roku ta sama liczba nic nie znaczy.
- Twoje karty dają nagrody w kwotach bezwzględnych (3–5 tys. funduszy), co ma sens wcześnie, a później się rozjedzie.

**Propozycja.**
- Silnik liczy z dziennika kariery **wielkości odniesienia**: średnią miesięczną nadwyżkę, średnie miesięczne wynagrodzenia i dotację, liczone z ostatnich trzech miesięcy.
- Korekty i nagrody w danych gry są wyrażone w tych jednostkach, np. „1,5 miesięcznej nadwyżki”. Silnik przelicza je na kwotę w chwili rozliczenia.
- Kwoty bezwzględne dopuszczamy jako wyjątek, z datą ważności **[P-E1]**.

### 2.4. Trzy rodzaje wejścia gracza

**Problem.** Gracz wpływa na grę na trzy sposoby, a każdy wymaga innej walidacji:
1. **Działania w KSP.** Sprawdzane kanałami z punktu 2.2.
2. **Decyzje na Biurku.** Ustrukturyzowane: przyjmij, odrzuć, negocjuj, przydziel. Silnik liczy je wprost.
3. **Swobodny tekst: Wnioski Programowe.** Piszesz je od zera, z argumentami fikcyjnymi i z doświadczenia w grze.

**Wniosek.** Trzeci rodzaj wejścia zderza się z zasadą Z3 („liczby należą do silnika”), bo ocena tekstu wymaga interpretacji.

**Propozycja.**
- AI działa jako **referent**. Wyciąga z tekstu argumenty i przypisuje je do zamkniętej listy kategorii, z cytatem.
- Ty widzisz tę klasyfikację i możesz ją poprawić.
- Silnik liczy opinie z zatwierdzonej klasyfikacji, pól formularza i dowodów wskazanych z kariery.

AI nigdy nie wydaje werdyktu. Szczegóły w 4.5.

### 2.5. Cofnięcia, szybkie zapisy i rozjazd plików

**Problem.**
- RP-1 i KSP pozwalają cofać czas: wczytać szybki zapis albo cofnąć lot.
- W karierze PACE plik `persistent.sfs` nie zawierał strategii von Brauna, która była w szybkim zapisie z tej samej chwili.
- DSE zobaczy więc czas biegnący wstecz, znikające starty i dwa sprzeczne pliki.

**Propozycja.**
- Parser porównuje każdą Migawkę z poprzednią. Wykrywa cofnięcie czasu, zniknięcie startów z dziennika i rozjazd z innymi plikami w folderze zapisu.
- Silnik nie zgaduje, który plik jest prawdziwy. Rozlicza plik wskazany przez Ciebie i pokazuje ostrzeżenie.
- Reguła wobec cofnięć to Twoja decyzja **[P-B4]**. Rekomenduję: cofnięcie lotu w trakcie jest dozwolone, a cofnięcie przez granicę rozliczonego kwartału jest zabronione, bo meta-gra już na nim zbudowała następstwa.

### 2.6. Treść jako wąskie gardło

**Problem.**
- GDD przewiduje około 150 szablonów zdarzeń. Do tego dochodzą Dyrektywy, frakcje, postaci, Biblia świata, dwa dossier, karty prób i teczki z szuflady.
- Kod silnika jest skończony, a treść rośnie bez końca.
- Bez schematów i walidacji treść zaczyna się rozjeżdżać z kodem.

**Propozycja.**
- **Treść jest osobnym torem pracy** (rozdział 5), z własnymi zadaniami i kryteriami.
- Każdy rodzaj treści dostaje schemat zod i walidację odwołań, tak jak w fazie 1A, zanim powstanie choć jeden plik tej treści.
- Ja szkicuję zdarzenia i teczki, Ty decydujesz i piszesz Wnioski.

### 2.7. Długowieczność kampanii

**Problem.** Kampania potrwa miesiące, a aplikacja będzie się w tym czasie zmieniać. Stan kampanii z 1951 roku musi wczytać się w aplikacji z 1957 roku.

**Propozycja.**
- Przed startem kampanii właściwej musi istnieć mechanizm migracji stanu: `STATE_SCHEMA_VERSION`, funkcje migracji i testy na zamrożonych stanach przykładowych.
- Kopia instalacji KSP i lista modów z CKAN są zamrożone na całą kampanię.
- Pytanie, kiedy zacząć kampanię właściwą, jest najważniejszym pytaniem harmonogramu **[P-B1]**.

### 2.8. Granice odpowiedzialności AI w nowych miejscach

**Problem.** Nowe filary dają AI więcej pracy: referent Wniosków, recenzje frakcji, przesłuchania, Teczki Pojazdów.

**Propozycja.** Zasada Z3 zostaje bez wyjątków:
- AI dostaje wyłącznie widok gracza (`toPlayerView`).
- AI proponuje klasyfikację i pisze teksty.
- Silnik liczy wszystko, co ma znaczenie mechaniczne.
- Każdy tekst AI przechodzi przez walidator, który wyłapuje liczby i nazwiska spoza Pakietu Kontekstu.

Wniosek musi dać się rozliczyć także bez AI, przez ręczne oznaczenie argumentów. Dzięki temu Wnioski mogą powstać przed narratorem (faza 3, nie 4).

### 2.9. Ograniczenia środowiska pracy

**Problem.**
- Ja nie uruchomię KSP.
- W moim środowisku rejestr npm jest zablokowany, więc nową zależność mogę dodać tylko wtedy, gdy jest już dostępna lokalnie.
- Każda sesja zaczyna się bez pamięci poprzednich rozmów.

**Wniosek.**
- Wszystko po stronie KSP (paczka kontraktów, eksperymenty, nawyki zapisu) testujesz Ty. Dla każdego takiego elementu przygotowuję krótką procedurę testu.
- Pamięcią projektu jest repozytorium (`STATUS.md`, `decisions/`), jak w planie 1.0.
- Zależności ograniczamy do tych, które już mamy: zod, yaml, tsx, typescript. Potrzebę nowej zgłaszam Tobie, zanim ją dodam.

---

## 3. Architektura v2

### 3.1. Moduły i dane

Zasada nadrzędna z planu 1.0 zostaje: `core` nie wie, że istnieje KSP, AI ani przeglądarka. Zmiany względem wersji 1.0 oznaczam znakiem ★.

```
deep-state-engine/
├─ docs/
│  ├─ gdd/                 GDD, Dokument Decyzyjny
│  ├─ research/          ★ dossier I i II, notatki źródłowe
│  ├─ decisions/           rejestr decyzji (0001–…)
│  └─ STATUS.md, PLAN_BUDOWY.md, GLOSARIUSZ.md
├─ data/                   TREŚĆ GRY (YAML, schematy w core)
│  ├─ campaign.yaml, factions.yaml, traits.yaml, characters.yaml, registry.yaml   (są)
│  ├─ events/              szablony zdarzeń i kryzysów
│  ├─ directives/          szablony Dyrektyw (z poziomem i kanałem weryfikacji)
│  ├─ flight-tests/      ★ programy testowe i karty lotów (Twoje karty + dossier I)
│  ├─ history/           ★ projekty historyczne i teczki z szuflady (dossier II), daty zdarzeń
│  ├─ milestones/          kamienie milowe Bilansu Wyścigu i mapowanie na kontrakty RP-1
│  ├─ soviet/              biura OKB, projekty, doktryna
│  ├─ world/               Biblia kompaktowa, miejsca startowe
│  ├─ mapping/             programy RP-1 → sponsorzy, liderzy → stanowiska, rodziny silników → konsorcja
│  └─ rp1/               ★ DANE REFERENCYJNE RP-1 4.8.1, generowane narzędziem (licencja CC BY-NC-SA 4.0)
├─ packages/
│  ├─ core/                silnik: stan, reguły, zegary, Rejestr, ZSRR, wywiad,
│  │                     ★ weryfikacja (kanały), ★ próby w locie, ★ Wnioski, ★ budżet
│  ├─ content/             wczytywanie i walidacja data/
│  ├─ ksp-bridge/          parser .sfs, ekstrakcja, Migawka, różnice, ★ ostrzeżenia jakości danych,
│  │                       później zapis Korekt (faza 8)
│  ├─ narrator/            Pakiet Kontekstu, adaptery modeli, walidator, ★ referent Wniosków
│  ├─ server/              lokalny serwer
│  └─ ui/                  Biurko, Teczki, ★ Teczka Pojazdu, ★ Wnioski, ★ Szuflada
├─ ksp/                  ★ STRONA KSP: paczka „PACE Flight Test” (Contract Configurator),
│                          konwencje nazw pojazdów, procedury testów dla Ciebie
├─ samples/saves/          zapisy testowe dla parsera (zakres do decyzji [P-K3])
└─ tools/
   ├─ cli/                 polecenia dse
   ├─ sim/                 symulator
   └─ rp1-extract/       ★ generator data/rp1 z klonu repozytorium RP-1
```

### 3.2. Przepływ kwartału v2

```
[KSP] gra do granicy kwartału (+ okno tolerancji) ─► zapis .sfs
                                │
  ksp-bridge: parser → Migawka → różnice → ostrzeżenia (cofnięcie, rozjazd plików, wersja RP-1)
                                │
  core: 1. wielkości odniesienia budżetu z dziennika (nadwyżka, wynagrodzenia, „miesiące do zera”)
        2. uzgodnienie Korekt honorowych z dziennikiem (czy zastosowane)
        3. weryfikacja: Dyrektywy, karty lotów, warunki Wniosków — każdy warunek swoim kanałem
        4. rozliczenie: wskaźniki, frakcje, Rejestr, zegary, ZSRR, wywiad, zdarzenia
                                │
  narrator (od fazy 4): dokumenty, recenzje, Teczki Pojazdów
                                │
  ui: Następstwa → Odprawa → Biurko (decyzje, Wnioski, przydział rezerwy)
                                │
  core: Rozkaz Kwartalny + Korekty (do zastosowania ręcznie, a od fazy 8 automatycznie)
                                │
[KSP] ◄── Rozkaz Kwartalny na drugim monitorze; karty lotów z warunkami
```

**Nowy krok 2: uzgodnienie Korekt.** W trybie Honorowym sam wpisujesz nagrody i kary przez menu debugowania. RP-1 zapisuje je w dzienniku jako „inne przychody” (`OtherFundsEarned`), co widzieliśmy w karierze PACE. Silnik może więc sprawdzić, czy Korekta z Rozkazu została zastosowana i w jakiej wysokości. Tryb Honorowy staje się w ten sposób **honorowym z kontrolą**, i to bez żadnego zapisu do pliku.

---

## 4. Nowe i zmienione podsystemy

### 4.1. Odczyt KSP (`ksp-bridge`)

**Parser ConfigNode.**
- Format `.sfs`: węzły, pary klucz–wartość, powtarzalne klucze.
- Obsługa dużych plików: zapisy kariery mają kilkadziesiąt MB, więc wydajność parsera mierzymy testem.
- Wierny zapis zwrotny jest potrzebny dopiero w fazie 8, ale parser od początku zachowuje kolejność i powtórzenia kluczy, żeby później go nie przepisywać.

**Ekstrakcja do Migawki.** Pola sprawdzone na Twoich zapisach:
- waluty: `Funding.funds`, `ResearchAndDevelopment.sci`, `Reputation.rep`, `Confidence.confidence` i `confidenceEarned`, `UnlockCreditHandler._totalCredit`;
- `SpaceCenterManagement`: ośrodki, kompleksy (nazwa, inżynierowie, rush, platformy z `launchSiteName`, kolejki budowy), lista badań;
- `ProgramHandler`: aktywne programy z tempem, datami, finansowaniem i slotami;
- `CareerLog`: miesięczne okresy finansowe, starty, awarie, kontrakty, budowy, technologie, liderzy;
- `StrategySystem` (liderzy), `ROSTER` (załogi), `TestFlightManagerScenario` (dane niezawodności);
- pojazdy: nazwa, sytuacja, orbita;
- wyniki eksperymentów (podmioty nauki).

**Różnice i ostrzeżenia:**
- cofnięcie czasu;
- zniknięcie startów z dziennika;
- inna wersja RP-1 niż zamrożona;
- inny plik w folderze nowszy niż rozliczany;
- różnice między `persistent` i szybkim zapisem.

**Polecenie `dse kariera <plik>`:** raport kariery bez silnika gry. Zawiera finanse miesiąc po miesiącu, „miesiące do zera”, starty i awarie, kompleksy, programy i ostrzeżenia. To pierwszy użyteczny produkt dla Ciebie, jeszcze przed meta-grą (kamień M1a).

### 4.2. Dane referencyjne RP-1 (`data/rp1/` i `tools/rp1-extract`)

**Co wyciągamy z RP-1 4.8.1:**
- Parts Browser: część, koszt, koszt wejścia, rok, technologia, konfiguracje silników;
- `Programs.cfg`: 40 programów z wymaganiami, slotami i finansowaniem;
- `SpaceCenterSettings.cfg`: wynagrodzenia (inżynier 500, naukowiec 750), koszt zatrudnienia 300, dotacja;
- liderzy;
- `TreeYears.csv`: lata węzłów drzewa;
- `CustomBarnKit.cfg`: limity programów i kontraktów według poziomu budynków;
- `ResourceCosts.cfg`: ceny paliw.

**Do czego służą:**
- ocena przedwczesności Wniosku (rok technologii wobec bieżącego kwartału i wobec Twojego drzewa);
- szacunek kosztu pojazdu;
- mapowanie programów na sponsorów i silników na konsorcja;
- walidacja treści, np. karta lotu, która wymaga technologii z 1959 roku, nie może pojawić się w 1952.

**Licencja.** RP-1 jest na licencji CC BY-NC-SA 4.0 (sprawdzone w `LICENSE.md` klonu). Repozytorium DSE jest publiczne, choć gra nie będzie publikowana. Proponuję dwie zasady:
- `data/rp1/` dostaje własny plik licencji i atrybucję;
- dane trzymamy w postaci pochodnej, czyli tylko pola, których używamy.

Alternatywa: generujemy dane lokalnie i nie wersjonujemy ich **[P-K4]**.

### 4.3. Weryfikacja: kanały i poziomy

**Model danych.** Każdy warunek ma postać:

```yaml
- type: altitude_min          # rodzaj warunku (słownik w core)
  value_km: 13
  level: W                    # W / R / D
  channel: pace_contract      # save_state / career_log / rp1_contract / experiment / pace_contract / report
```

Silnik ma po jednym weryfikatorze na kanał. Warunek z kanałem `pace_contract` jest W tylko wtedy, gdy paczka PACE jest zainstalowana i kontrakt istnieje. W przeciwnym razie warunek automatycznie spada do R, z Raportem Misji i kontrolą spójności, a Ty widzisz to w karcie lotu.

**Rekomendacja etapów:**
1. **Od razu:** kanały `save_state`, `career_log` i `rp1_contract` oraz R z kontrolą spójności. Kontrola sprawdza, że start jest w dzienniku, pojazd o właściwym prefiksie wystartował z właściwego kompleksu i nie ma awarii w trakcie lotu, a pojazd wylądował lub został odzyskany, jeśli to wiadomo.
2. **Faza 2K:** prototyp paczki PACE na jednej karcie (Tristar, lot 2) i Twój test w grze. Decyzja „paczka tak lub nie” zapada po teście **[P-D1]**.
3. **Eksperymenty jako znaczniki:** tam, gdzie wystarczy sytuacja i biom. Potrzebuję Twoich konfiguracji eksperymentów **[P-D3]**.
4. **Telemetria na żywo** zostaje w trybie Modu jako cel długoterminowy, bez terminu.

### 4.4. Próby w locie

**Model:**
- **Program testowy**, np. HSERA Mk1 „Tristar”. Ma kategorię (samolot X, rakieta sondażowa, pojazd zrzucany, balon itd.), sponsora, prefiks pojazdu, kompleks lub pas startowy i opis epoki.
- **Karta lotu**, np. Lot 2. Ma warunki z kanałami, nagrody (w RP-1 i w meta-grze), wymagania wstępne (poprzednie loty) i czas trwania „dobrej rutyny” jako informację dla Ciebie.
- **Teczka Pojazdu.** Historia lotów danego typu, awarie z dziennika i notatki. Od fazy 4 dochodzą komentarze postaci.
- **Dziennik pilota.** Loty astronauty lub pilota z `ROSTER` i dziennika kariery oraz Twoje notatki.
- **Spór o Program.** Zdarzenie, w którym Służba DPO zgłasza roszczenie do programu testowego. Trzy rozwiązania: PACE przejmuje, wspólne MOU na wzór X-15 albo przekazanie Służbie.

**Przykład zapisu Twojej karty.** Klucze są po angielsku zgodnie z decyzją 0003, treść po polsku:

```yaml
program:
  id: HSERA-1
  title: HSERA Mk 1 „Tristar”
  category: x_plane
  sponsor: PACE               # albo DPO.air po Sporze o Program
  vehicle_prefix: "HSERA1-"
flights:
  - id: L2
    title: Lot 2 — wzlot na 13 km, lot powyżej 360 m/s przez trzy minuty
    requires: [L1]
    conditions:
      - { type: launch_recorded, level: W, channel: career_log }
      - { type: altitude_min, value_km: 13, level: W, channel: pace_contract }
      - { type: speed_held, min_ms: 360, duration_s: 180, level: W, channel: pace_contract }
    rewards:
      rp1: { reputation: 10, funds: { surplus_months: 1.2 }, engineers: 3 }
      meta: { disposition: { BLZ: +1 } }
```

Przy przenoszeniu Twoich kart trzeba rozstrzygnąć trzy sprawy:
- **Nagrody w personelu** („3 inżynierów”) nie są na białej liście zapisu (DD 3.2). Rekomenduję zamianę na równowartość kosztu zatrudnienia albo na Korektę funduszy celowych **[P-E2]**.
- **Kwoty bezwzględne** zamieniamy na względne (2.3).
- **Sponsor.** Twoje karty nie mają jeszcze sponsora frakcyjnego. Proponuję przypisanie z dossier I **[P-D4]**.

### 4.5. Wnioski Programowe, Szuflada i Spadek

**Wniosek ma trzy części:**
1. **Nagłówek.** Formularz, który silnik liczy:
   - kryptonim (ze Słownika kryptonimów);
   - cel i rodzaj: naukowy, obronny, załogowy, prestiżowy, sojuszniczy;
   - klauzula: jawny, poufny, tajny;
   - proponowany patron i wykonawcy (konsorcja);
   - kompleks i miejsce startu;
   - szacunek kosztu z klasą „orientacyjny” albo „wiążący” (4.6);
   - harmonogram;
   - udział sojuszników;
   - karty lotów w formacie z 4.4.
2. **Uzasadnienie.** Twój tekst, dowolny, o dowolnej długości.
3. **Dowody.** Wybierane z listy, nie wpisywane: rekordy z Twojej kariery (np. „Tristar: 4 loty, 0 awarii”, „kompleks LC-2 ma udźwig X”) i teczki z szuflady. Silnik je sprawdza, więc mają większą wagę niż argumenty fikcyjne.

**Obieg:**

```
szkic → złożony → opinie frakcji → (przesłuchanie) → decyzja
                                                       ├─ zatwierdzony → program PACE (Dyrektywy z kart lotów, Teczka)
                                                       ├─ zatwierdzony z warunkami → Obietnice w Rejestrze
                                                       └─ odrzucony → czarna droga (BAS) / finansowanie przemysłowe (PRZ) / szuflada
```

**Ocena.** Każdy opiniujący organ (sześć frakcji plus Komisja Środków, Kongres, Biały Dom i Rada Atlantycka, zależnie od skali) liczy swoją opinię jako sumę:
- wag kategorii argumentów (z zatwierdzonej klasyfikacji referenta);
- funkcji pól nagłówka, np. DPO lubi klauzulę tajną, Rada Naukowa jawność, PRZ swoich wykonawców;
- przedwczesności z danych RP-1;
- relacji, czyli Nastawienia i Wpływu;
- precedensów z Rejestru;
- dowodów.

Wynik to poparcie, warunki, sprzeciw albo weto. Weto mają tylko organy wskazane w regułach, np. Biały Dom przy tajnym programie załogowym. To, kto ma ostatnie słowo, zależy od skali kosztu: mały wniosek rozstrzyga Anderson po opiniach, średni Komisja Środków, duży Kongres z Białym Domem, a sojuszniczy Rada Atlantycka **[P-F2]**.

**Limity**, wstępnie:
- jeden wniosek na kwartał;
- wnioski duże tylko w czasie Sesji Budżetowej;
- koszt w Uwadze Dowódcy (UD);
- ponowne złożenie odrzuconego wniosku tego samego typu frakcje odbierają jako upór, co daje precedens w Rejestrze **[P-F1]**.

**Szuflada.** Teczki z dossier II jako dane w `data/history/`. Każda ma datę pojawienia się, przyczynę śmierci (P1–P7), frakcje broniące i zabijające oraz przybliżenie w RP-1. Teczka to surowiec do Twojego Wniosku i zarazem dowód, na który możesz się powołać.

**Spadek.** Kiedy w świecie umiera projekt (Navaho, Arrow, Blue Streak), PACE dostaje ofertę sprzętu, ludzi albo danych. Przyjęcie daje realną korzyść w RP-1 (fundusze celowe, ludzi albo kredyt odblokowań) i wpisy do Rejestru: Dług, Urazę albo Hak.

**Bez AI.** W fazie 3 sam oznaczasz kategorie argumentów w formularzu, a silnik liczy. Referent AI dochodzi w fazie 4 jako pomoc, nie jako warunek.

### 4.6. Budżet

Pięć zasad z rozmowy z 30.10.2026:

1. **Kara tylko za niewypłacalność, nie za niskie saldo.**
2. **Klasa szacunku.** Szacunek „orientacyjny” można przekroczyć bez kary, ale frakcje oceniają taki wniosek ostrożniej. Szacunek „wiążący” daje premię do opinii, ale przekroczenie ponad próg kosztuje Zaufanie Waszyngtonu (ZW).
3. **Rezerwa Operacyjna** jako jawny obiekt. Frakcje i Kongres mogą się o nią upominać.
4. **„Miesiące do zera”**, liczone z dziennika kariery i pokazywane przed każdą decyzją kosztową.
5. **Przekroczenie kosztów** jako zdarzenie „Kto zapłaci” (wzorzec Vanguarda). Opcje to rezerwa, wniosek o środki dodatkowe, współpatron albo cięcie zakresu.

**Pogodzenie z GDD.** Linie Budżetowe i Analiza Spójności Wydatków (GDD 18.4) zostają, ale z dwiema zmianami:
- Linie deklarujesz w procentach wydatków, nie w kwotach.
- Próg rozbieżności (30 procent) liczymy dla całego roku, a przekroczenia uznane w zdarzeniu „Kto zapłaci” nie liczą się jako rozbieżność.

Rekomenduję wersję uproszczoną na start: trzy linie (obrona, nauka, loty załogowe) i rezerwa **[P-E3]**.

### 4.7. Programy RP-1, sloty i kontrakty

**Wyniki sprawdzenia kodu 4.8.1:**
- Sloty ograniczają liczbę jednocześnie aktywnych programów. Limit punktów zależy od poziomu Administracji: 5, 6, …, 13.
- Kontrakty RP-1 wiążą się z programem przez wymóg `ProgramActive` we własnej konfiguracji. Kontrakty rekordów (wysokość, prędkość, rekordy załogowe) go nie mają i działają poza programami.
- Ograniczeniem dla kontraktów PACE jest limit aktywnych kontraktów według poziomu Centrum Kontroli Misji: 3, 5, 7, 10, bez limitu (`CustomBarnKit.cfg`).

**Wnioski dla projektu:**
- **Kontrakt PACE** nie ma wymogu programu i nie daje nagród w walutach RP-1, bo nagrody liczy DSE. Przyjmujesz go tylko na lot, którego dotyczy, więc zajmuje jedno miejsce kontraktu na krótko.
- **Mapowanie programów na sponsorów** (GDD 20.2) robimy na danych z `Programs.cfg`. Zatwierdzony Wniosek może wymagać przyjęcia konkretnego programu RP-1 jako „nośnika finansowania”. Opcjonalnie, bo zjada slot **[P-F5]**.

---

## 5. Fazy robocze v2

### 5.1. Cztery tory pracy

| Tor | Co obejmuje | Kto prowadzi |
|---|---|---|
| **Kod** | Fazy 1–9 | Ja, Ty zatwierdzasz PR |
| **Treść** | Schematy i pliki w `data/`, dossier do danych, Biblia do `data/world/` | Ja szkicuję, Ty decydujesz i piszesz |
| **Strona KSP** | Zamrożenie instalacji, konwencje nazw, paczka kontraktów, eksperymenty | Ja przygotowuję, Ty testujesz w grze |
| **Gra** | Kariery testowe, kampania pilotażowa, kampania właściwa | Ty |

### 5.2. Fazy

**Faza 0. Kampania pilotażowa.** Zastępuje „prototyp papierowy” z wersji 1.0 **[P-B2]**.

| | |
|---|---|
| **Zakres** | Rozgrywka na prawdziwej karierze 4.8.1 w trybie Honorowym. Skrócone zasady (4 frakcje, 15–20 zdarzeń Epoki I, Rejestr ręcznie), Tristar jako pierwszy program testowy, jeden Wniosek. AI w czacie jako Mistrz Gry. Od M1a dochodzą raporty `dse kariera` |
| **Wynik** | Notatki z 4–8 kwartałów: co bolało, co nudziło, co było niejasne. Lista poprawek do reguł |
| **Od Ciebie** | Granie i notatki |

**Faza 1. Fundament**

| Etap | Zakres | Kryterium ukończenia |
|---|---|---|
| **1A — domknięcie** | Scalenie PR #1. Zmiana na 4.8.1 w ustawieniach, decyzji i README. Decyzja 0007 zastępuje 0005 | `npm run check` na `main` |
| **1B — odczyt KSP** | Parser, Migawka, różnice, ostrzeżenia, `dse kariera`, zapisy testowe w `samples/` | Raporty z 7 zapisów zgodne z tym, co widzisz w grze. Wydajność: plik kariery przetworzony w kilka sekund |
| **1C — dane RP-1 i mapowania** | `tools/rp1-extract`, `data/rp1/`, mapowania programów, liderów i silników | Dane wygenerowane powtarzalnie z RP-1 v4.8.1.0. Walidator treści korzysta z lat technologii |
| **1D — silnik kwartału bez AI** | Rozliczenie kwartału (granica i tolerancja), wielkości odniesienia budżetu, uzgodnienie Korekt honorowych, Dyrektywy z kanałami, Rozkaz Kwartalny w Markdown, migracje stanu | `dse kwartal --zapis …` daje raport i Rozkaz. Migracja stanu z testem |

**Kamień M1a, „DSE czyta karierę”** (po 1B): raport `dse kariera` z prawdziwego zapisu.
**Kamień M1, „Silnik liczy prawdziwą karierę”** (po 1D): pierwszy kwartał rozliczony automatycznie.

**Faza 2. Próby w locie (silnik)**

| | |
|---|---|
| **Zakres** | Schematy programów i kart lotów, przeniesienie Twoich 19 kart, weryfikacja R z kontrolą spójności, Teczka Pojazdu i dziennik pilota (tekstowo), nagrody względne, Spór o Program jako szablon zdarzenia |
| **Kryterium** | Lot Tristara rozliczony z prawdziwego zapisu: karta zaliczona albo nie, z uzasadnieniem i Korektą do zastosowania |

**Faza 2K. Paczka „PACE Flight Test”** (tor Strona KSP, równolegle, opcjonalna)

| | |
|---|---|
| **Zakres** | Jeden kontrakt Contract Configurator dla Tristara, lot 2: bez wymogu programu, bez nagród RP-1, z warunkiem wysokości i prędkości oraz, jeśli Contract Configurator pozwala, czasu utrzymania. Procedura testu dla Ciebie |
| **Kryterium** | Kontrakt pojawia się, daje się przyjąć, zalicza się w locie i jest widoczny w zapisie. Decyzja o rozbudowie paczki |

**Kamień M1.5, „Pierwsza karta lotu rozliczona”.**

**Faza 3. Biurko (interfejs)**

| | |
|---|---|
| **Zakres** | Lokalny serwer i interfejs, czyli zakres fazy 2 z planu 1.0, plus: Teczka Pojazdu, formularz Wniosku z ręcznym oznaczaniem argumentów, przegląd Szuflady, Rezerwa i „miesiące do zera” na Biurku |
| **Kryterium** | Cały kwartał, w tym złożenie jednego Wniosku, rozgrywasz w przeglądarce |

**Kamień M2, „Da się grać”.** To proponowany moment startu kampanii właściwej **[P-B1]**.

**Faza 4. Narrator.** Zakres fazy 3 z planu 1.0, plus referent Wniosków, recenzje frakcji, Teczki Pojazdów pisane przez AI i ślepy test modeli. **Kamień M3, „Świat mówi”.**

**Faza 5. Przeciwnik, wywiad i symulator.** Bez zmian względem planu 1.0. Symulator dostaje profil „pilota prób”, który generuje loty testowe, oraz profil „wnioskodawcy”.

**Faza 6. Ludzie.** Bez zmian. Dziennik pilota łączy się z Korpusem Astronautów **[P-H2]**.

**Faza 7. Polityka i kryzysy.** Zakres z planu 1.0, plus pełny obieg Wniosków (przesłuchania, Sesja Budżetowa, weta), Spadek, Spór o Program jako kryzys wieloetapowy i zdarzenia z kalendarza Szuflady.

**Faza 8. Zapis do KSP.** Bez zmian (dawna faza 7). Biała lista DD 3.2 z poziomem A, uzgodnienie z dziennikiem z fazy 1D.

**Kamień M4, „Vertical slice”:** Epoka I (1951–1957) w całości.

**Faza 9. Pełna kampania.** Epoki II–IV, pula zdarzeń, zakończenia, balans.

### 5.3. Tor Treść: etapy

| Etap | Zakres | Najwcześniej |
|---|---|---|
| T1 | Schematy: zdarzenie, Dyrektywa (z kanałem), program testowy i karta lotu, teczka historyczna, Wniosek | Razem z 1D i 2 |
| T2 | Przeniesienie Twoich kart do `data/flight-tests/`, sponsorzy z dossier I | Faza 2 |
| T3 | Dossier II do `data/history/`: 13 teczek i kalendarz zdarzeń | Faza 3 |
| T4 | Frakcje i postaci w wersji ostatecznej (Haskell, Korpus) | Przed M2 |
| T5 | Zdarzenia Epoki I: 20, potem 60 | Faza 0 (papier), potem 1D i 7 |
| T6 | Biblia do `data/world/` po poprawkach kolizji nazw | Przed fazą 4 |

### 5.4. Tor Strona KSP: etapy

| Etap | Zakres |
|---|---|
| K1 | Zamrożenie instalacji: eksport listy modów z CKAN, kopia folderu KSP, zapis ustawień trudności w `campaign.yaml` |
| K2 | Konwencje: prefiksy nazw pojazdów (`DPO-`, `RN-`, `HSERA1-` …), nazwy kompleksów, nawyk zapisu na granicy kwartału |
| K3 | Paczka „PACE Flight Test” (faza 2K) |
| K4 | Twoje eksperymenty: opis, konfiguracje, mapowanie na warunki |

### 5.5. Ścieżka krytyczna

```
1A domknięcie → 1B odczyt → 1D silnik kwartału → 3 Biurko → [start kampanii właściwej]
                  └→ 1C dane RP-1 ┘   └→ 2 próby w locie ┘
```

Faza 0, tor Treść i 2K biegną obok. Faza 4 (narrator) nie jest na ścieżce do startu kampanii, jeśli zgodzisz się zacząć ją z tekstami z szablonów **[P-B1]**.

---

## 6. Proces pracy

Zasady z planu 1.0 (rozdział 5) zostają. Doprecyzowania:

1. **Jedna faza lub etap to jedna gałąź i jeden PR.** Ty scalasz. Ja nie zmieniam niczego w repozytorium bez Twojej zgody na dany etap **[P-K1]**.
2. **Każda sesja** zaczyna się od `docs/STATUS.md`, a kończy jego aktualizacją i, jeśli trzeba, nową decyzją.
3. **Decyzje do zapisania po zatwierdzeniu planu:**

| Nr | Decyzja |
|---|---|
| 0007 | RP-1 4.8.1 zamrożone (zastępuje 0005) |
| 0008 | Dane referencyjne RP-1 w repozytorium: zakres, licencja, atrybucja |
| 0009 | Granica kwartału, okno tolerancji, źródła prawdy (przepływy z dziennika, stan z Migawki) |
| 0010 | Polityka cofnięć i wielu plików zapisu |
| 0011 | Weryfikacja: poziom i kanał w każdym warunku |
| 0012 | Model prób w locie i przeniesienie kart autora |
| 0013 | Wnioski Programowe: referent AI, silnik orzeka, dowody z kariery |
| 0014 | Zasady budżetu: Korekty względne, rezerwa, klasy szacunku, uzgodnienie Korekt honorowych |

4. **GDD 1.2.** Po zatwierdzeniu planu dopisuję do GDD rozdziały o próbach w locie, Wnioskach, Szufladzie i budżecie, a Dokument Decyzyjny dostaje odsyłacze. Kolejność ważności zostaje: decyzje > plan > DD > GDD.
5. **Dossier** trafiają do `docs/research/` jako materiał źródłowy, nie jako kanon. Kanonem są dane w `data/`.

---

## 7. Ryzyka

| Ryzyko | Prawdopodobieństwo | Skutek | Środek zaradczy |
|---|---|---|---|
| Warunki prób w locie niesprawdzalne bez paczki kontraktów | Wysokie | Karty zostają na poziomie R lub D | Kanały i automatyczne spadanie poziomu (4.3), test 2K przed rozbudową |
| Zachowanie Contract Configurator, Kerbalism lub RP-1 inne, niż wynika z kodu | Średnie | Stracony czas na paczkę | Prototyp na jednej karcie, Twój test, decyzja po teście |
| Rozrost zakresu (dwa nowe filary) | Wysokie | Kampania właściwa odsuwa się w nieskończoność | Ścieżka krytyczna (5.5), Wnioski w wersji bez AI, minimalny zakres M2 **[P-L1]** |
| Treść nie nadąża za kodem | Wysokie | Silnik bez zdarzeń jest nudny | Osobny tor Treść, schematy przed treścią, szkice z mojej strony |
| Gospodarka DSE rozjeżdża się z RP-1 | Średnie | Korekty bez znaczenia albo zabójcze | Korekty względne (2.3), symulator w fazie 5 |
| Uszkodzenie zapisu | Niskie do fazy 8 | Utrata kariery | Do fazy 8 brak zapisu do pliku; potem biała lista, kopie i ponowna walidacja |
| Zmiana aplikacji psuje stan trwającej kampanii | Średnie | Utrata kampanii meta-gry | Migracje przed startem kampanii (2.7) |
| Koszt AI | Niskie do średniego | Wydatki | Budżet z DD 6.2, szablony zapasowe, referent tylko na żądanie |
| Twój czas | Wysokie | Przerwy | Z9: kwartał meta-gry do 20 minut; raporty, które pomagają w KSP, nie tylko w meta-grze |
| Publiczne repozytorium | Niskie | Ujawnienie treści, której nie chcesz pokazywać | Zakres tego, co trafia do repo, decydujesz Ty **[P-K3]** |
| Licencja danych RP-1 | Niskie | Niezgodność z CC BY-NC-SA | Atrybucja i dane pochodne albo generowanie lokalne **[P-K4]** |

---

## 8. Czego potrzebuję od Ciebie

1. **Odpowiedzi na pytania** z dokumentu „Pytania i rekomendacje do Planu Budowy v2”. Pytania oznaczone tam jako blokujące zamykają plan.
2. **Zgodę na rozpoczęcie etapu 1A** (domknięcie PR #1) po zatwierdzeniu planu.
3. **Eksport listy modów z CKAN** i informację, na jakim systemie grasz.
4. **Konfiguracje Twoich eksperymentów** (pliki `.cfg`), jeśli chcesz używać ich jako znaczników.
5. **Decyzję o zapisach testowych**: które pliki mogą trafić do publicznego `samples/saves/`.
6. **Biblię świata** w pliku, kiedy zdecydujesz, że jest gotowa do przeniesienia.

---

## 9. Źródła i podstawy tego planu

- GDD 1.0: rozdziały 2 (zasady), 11 (Dyrektywy), 18 (kanał odczytu), 19 (kanał zapisu), 20 (mapowanie RP-1).
- Dokument Decyzyjny 1.1: rozdziały 3 (biała lista), 5 (pierścienie i firmy), 7.3 (patronat), 7.4 (symulacje).
- Kod RP-1 v4.8.1.0:
  - `Source/RP0/Programs/ProgramHandler.cs` (sloty programów);
  - `GameData/RP-1/CustomBarnKit.cfg` (limity programów i kontraktów);
  - `GameData/RP-1/Contracts/Records/*.cfg` (kontrakty poza programami);
  - `Source/CC_RP0/ContractLimitOverrider.cs`;
  - `LICENSE.md`.
- Zapisy: kariera testowa 4.8.1 (3 pliki), kariera PACE 3.21 (4 pliki).
- Dossier I i II oraz Twój plik kart kamieni milowych.
