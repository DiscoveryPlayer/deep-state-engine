# THE DEEP STATE ENGINE

## Dokument Decyzyjny przed Fazą 1 — uzupełnienie GDD do wersji 1.1

| | |
|---|---|
| **Dotyczy** | Pięciu kwestii otwartych z rozdziału 34.3 GDD v1.0 oraz materiałów przekazanych 25.10.2026 |
| **Materiały wejściowe** | Poradnik RO & RP-1 (v0.2), mapa zmiennych RP-1, „Część II — Biblia świata”, „Warstwa Personelu”, kod źródłowy RP-1 (repozytorium KSP-RO/RP-1, stan na 25.10.2026), lista miejsc startowych Real Solar System |
| **Status** | Rekomendacje do zatwierdzenia. Po akceptacji wchodzą do GDD jako wersja 1.1 |
| **Zasada** | Tam, gdzie mogłem sprawdzić coś w kodzie RP-1, piszę „potwierdzone w kodzie”. Tam, gdzie opieram się na Twoim poradniku, piszę „wg poradnika”. Wszystko inne oznaczam **[DO WERYFIKACJI]** |

---

## 0. Streszczenie decyzji

| # | Kwestia | Rekomendacja | Pewność |
|---|---|---|---|
| 1 | Wersja RP-1 | Nowa kampania od 1951 roku na **RP-1 4.7** (najnowsze wydanie, wrzesień 2026), z zamrożeniem instalacji na cały czas trwania kampanii. Prototyp papierowy można zacząć od razu na Twojej obecnej wersji 3.21. | Wysoka |
| 2 | Edycja zapisu | Biała lista pięciu wartości walutowych (fundusze, nauka, reputacja, zaufanie, kredyt odblokowań). Wszystkie efekty czasowe przekładamy na **natywne dźwignie RP-1** (tempo programu, rush, zatrudnienie, liderzy, przydział kompleksów), a nie na edycję czasów w pliku. Głównym kanałem odczytu zostaje **Career Log** RP-1. | Wysoka |
| 3 | Nazwa i lore | Skrót NA-AXO zostaje, ale w 1951 roku ma rozwinięcie zgodne z epoką: **North Atlantic Aeronautical eXperimental Organization**. W 1958 roku, po szoku orbitalnym, ten sam skrót dostaje nowe rozwinięcie: **North Atlantic Aerospace and Exploration Organization**. Słowo „aerospace” pojawia się w angielszczyźnie dopiero w 1958 roku, więc anachronizm staje się wydarzeniem fabularnym. | Wysoka co do zasady, średnia co do brzmienia |
| 4 | Prawdziwe kontra fikcyjne osoby | **Model trzech pierścieni**: im bliżej biurka Andersona, tym bardziej fikcyjnie. Prawdziwi politycy i generałowie stanowią tło i działają zgodnie z udokumentowanym zapisem historycznym. Ludzie, których Anderson zatrudnia, zwalnia i szantażuje, są fikcyjni lub są postaciami-kompozytami. Liderzy RP-1 dostają w lore własne odpowiedniki. | Wysoka |
| 5 | Model AI i budżet | Architektura dwóch ról (Narrator i Kancelista) z wymiennym adapterem i zapasowymi szablonami. Pełna kampania to około 6 mln tokenów wejścia i 1,5 mln tokenów wyjścia, czyli **kilkadziesiąt dolarów za całą kampanię** nawet na modelach z górnej półki. O wyborze decyduje jakość polszczyzny i dyscyplina kontraktu, nie cena. Wybór warto oprzeć na **ślepym teście** 2–3 modeli na tym samym pakiecie. | Wysoka co do architektury, średnia co do cen |

Dodatkowo ten dokument zawiera:
- ocenę „złota” z Biblii świata i z Warstwy Personelu (rozdział 7),
- listę kolizji nazw i anachronizmów (rozdział 8),
- jedną nową zasadę projektową, **Z11** (rozdział 9),
- listę zmian do GDD (rozdział 9),
- pytania, na które potrzebuję Twojej odpowiedzi (rozdział 10).

---

## 1. Jak potraktowałem przekazane materiały

Każdy element z notatek dostał jeden z trzech statusów. Dzięki temu wiadomo, co trafia do GDD, a co nie.

| Status | Znaczenie |
|---|---|
| **KANON** | Wchodzi do GDD bez zmian albo z kosmetyczną korektą |
| **KANON PO PRZERÓBCE** | Pomysł zostaje, mechanika zostaje przebudowana tak, żeby spełniała zasady Z1–Z11 |
| **ODRZUCONE** | Kłóci się z zasadami projektu. Uzasadnienie podaję zawsze |

Najważniejsze spostrzeżenie ogólne: **Biblia świata i Warstwa Personelu pochodzą z dwóch różnych filozofii projektowych.**

- **Biblia** opisuje świat. Jest w niej dużo trafnych napięć, miejsc i postaci, a jej główny problem to ton i prawdziwe nazwiska (rozdział 5).
- **Warstwa Personelu** opisuje gotowe mechaniki. Część jest bardzo dobra, ale całość opiera się na dwóch rozwiązaniach, przed którymi przestrzega GDD:
  - AI dostaje pełną prawdę o stanie gry,
  - AI może swobodnie wydawać komendy zmieniające liczby.
  
  Poza tym warstwa ta dokłada trzy kolejne waluty i kilkanaście procentowych mnożników, które dublują system liderów RP-1. Szczegóły w rozdziale 7.2.

---

## 2. Decyzja 1 — wersja RP-1 i zakres weryfikacji

### 2.1. Stan faktyczny

| | Wersja | Data wydania |
|---|---|---|
| Twoja instalacja (wg poradnika) | KSP 1.12.5, **RP-1 3.21.0.0**, instalator RSS-Reborn 1.2.2 | kwiecień 2025 |
| Najnowsze wydanie RP-1 | **4.7.0.0** | wrzesień 2026 |

Dzieli je siedemnaście wydań, w tym przejście na serię 4.x (październik 2025). Daty podaję z repozytorium RP-1.

Zmiany istotne dla meta-gry, wybrane z oficjalnego dziennika zmian:

| Wydanie | Zmiana | Znaczenie dla The Deep State Engine |
|---|---|---|
| 3.22 | Usunięto przymusowe odchodzenie liderów na emeryturę | Liderzy są trwalsi, więc decyzje kadrowe mają dłuższe skutki |
| 3.23 | Ominięcie stockowego limitu reputacji 1000 przy bezpośrednim ustawianiu reputacji | Ważne dla edycji reputacji w zapisie (rozdział 3) |
| 4.0 | Dyski danych w sondach, przebudowa nauki, przebudowa liderów, załogowy program marsjański | Liderzy działają inaczej niż w Twoich notatkach, więc mapowanie trzeba robić na wersji docelowej |
| 4.4 | Wybór startowego KSC w scenariuszach, lepsza obsługa miejsc startowych Kerbal Konstructs | Bezpośrednio dotyczy pomysłu „baz jako terytoriów” z Biblii |
| 4.5 | Modyfikator programu „Early X-Planes”, nowe kamienie milowe w gazecie | Biblia mocno opiera Epokę I na X-Planes |
| 4.6 | Programy **Operational i Advanced Earth Observation**, konfigurowalne scenariusze startowe | Gotowe programy pod agendę DPO i BAS (rozpoznanie, obserwacja Ziemi) |
| 4.7 | Kolejkowanie szkoleń, poprawki nauki i scenariuszy | Wygoda |

### 2.2. Rekomendacja

**Kampanię meta-gry zacznij na nowym zapisie RP-1 4.7 (albo na najnowszym stabilnym wydaniu w dniu startu) i zamroź instalację do końca kampanii.**

Uzasadnienie:

1. Postanowiłeś, że kampania startuje w 1951 roku. Oznacza to nowy zapis kariery, więc koszt aktualizacji jest teraz najniższy, jaki kiedykolwiek będzie.
2. Kampania RP-1 trwa miesiące realnego czasu. Aktualizacja w połowie grozi zepsuciem zapisu, a parser i mapowania meta-gry trzeba by przepisywać pod ruchomy cel.
3. Wydania 4.x zawierają rzeczy, które meta-gra wykorzystuje bezpośrednio: programy obserwacji Ziemi, nowy system liderów i obsługę miejsc startowych.

Jak zamrozić instalację:
- wyeksportuj listę modów z CKAN (funkcja eksportu modpacka),
- zablokuj aktualizacje,
- zrób kopię całego folderu gry przed pierwszym startem kampanii.

**Wyjątek:** prototyp papierowy (faza 0) nie zależy od wersji. Możesz go rozgrywać choćby jutro na 3.21, na istniejącej instalacji. Wersja docelowa ma znaczenie dopiero przy parserze (faza 1).

**Ryzyko:** Twój poradnik opisuje 3.21. Podstawy (kompleksy startowe, tooling, programy, liderzy, symulacje) w 4.x działają tak samo, ale konkretne liczby, bonusy liderów i część kontraktów się zmieniły. Mapowania meta-gry trzeba robić na podstawie wersji, na której grasz, a nie na podstawie poradnika.

### 2.3. Weryfikacja miejsc oznaczonych w GDD

| Miejsce w GDD | Wynik | Źródło |
|---|---|---|
| Model finansowania RP-1 (6.3) | Programy z krzywą wypłat, trzy tempa (Normal/Fast/Breakneck) kupowane za Confidence, subwencja zależna od daty i reputacji, utrata reputacji w czasie | Wg poradnika i mapy zmiennych; spójne z kodem |
| Struktura zapisu (18.1) | Dane RP-1 leżą w modułach scenariusza: `SpaceCenterManagement` (dawne KCT), `ProgramHandler`, `Confidence`, `UnlockCreditHandler`, `CareerLog`, `MaintenanceHandler`, `CrewHandler`, `ToolingManager`, `MilestoneHandler` | Potwierdzone w kodzie |
| System zatrudnienia (8.1) | Badacze w puli wspólnej, inżynierowie przypisywani do konkretnego kompleksu startowego, limit inżynierów zależny od udźwigu kompleksu, automatyczne zatrudnianie | Wg poradnika; struktura potwierdzona w kodzie |
| Edytowalne parametry (19.2) | Rozdział 3 tego dokumentu | Częściowo potwierdzone |
| Liderzy (20.2) | Sześć kategorii, wybór w budynku administracji, usunięcie kosztuje reputację, przerwa roczna przed ponownym zatrudnieniem | Wg mapy zmiennych; **wartości bonusów trzeba sprawdzić na 4.7**, bo 4.0 przebudowało liderów |
| Mapowanie producentów (20.3) | Do zrobienia na wersji docelowej | **[DO WERYFIKACJI]** |
| Startowanie z odległych miejsc (Vandenberg, Woomera) w jednej karierze | Lista miejsc RSS istnieje (rozdział 4.6). Nie sprawdziłem, czy w jednej karierze można mieć kompleksy startowe w kilku odległych miejscach naraz, czy trzeba przenosić całe KSC | **[DO WERYFIKACJI]** — kluczowe dla rozdziału 4.6 |
| Koszt symulacji | W kodzie RP-1 nie znalazłem żadnego kosztu symulacji; symulacje są darmowe | Kod |

### 2.4. Odkrycie 1 — Career Log jako gotowy kanał odczytu

RP-1 prowadzi własny **dziennik kariery** (`CareerLog`), zapisywany w pliku zapisu i eksportowalny z gry do CSV. W gałęzi rozwojowej jest już także eksport do JSON, ale nie ma go w wydaniu 4.7. Dziennik zawiera dokładnie te dane, które GDD planowało wyciągać z porównywania migawek:

| Rekord dziennika | Pola (potwierdzone w kodzie) | Zastosowanie w meta-grze |
|---|---|---|
| **Okres** (domyślnie miesiąc) | Stan funduszy, nauki i kredytu; wypłaty programów; subwencja; pensje inżynierów, badaczy i załóg; koszty startów, toolingu, utrzymania, budów i zatrudnienia; liczba inżynierów i badaczy; **liczba zabitych astronautów**; Confidence; reputacja | Raport Sytuacyjny i Analiza Spójności Wydatków (GDD 18.4) w jednym miejscu |
| **Start** | Nazwa i identyfikator pojazdu, budynek, **identyfikator kompleksu startowego** | Prefiksy frakcyjne z nazw, Udziały PRZ, patronat nad kompleksami (rozdział 7.3) |
| **Awaria** | Pojazd, **część**, **typ awarii** | Komisja Badania Wypadku (GDD 21.2) dostaje prawdziwe dane: „zawór paliwowy silnika X” zamiast ogólnika |
| **Kontrakt** | Nazwa, zmiana reputacji, typ zdarzenia | Mapowanie na kamienie milowe i Dyrektywy |
| **Lider** | Kto, koszt, dodanie lub usunięcie | Decyzje kadrowe w Rejestrze |
| **Kompleks startowy** | Nazwa, udźwig, wymiary, typ, **przystosowanie do lotów załogowych** | Dyrektywy infrastrukturalne, wymogi BLZ |
| **Badania i budowy** | Węzeł technologiczny, budowy i modernizacje obiektów | Agendy RN i DOI |

**Konsekwencja:** parser meta-gry czyta przede wszystkim węzeł dziennika kariery w pliku zapisu, a dopiero potem resztę stanu. Jest to znacznie prostsze, znacznie stabilniejsze między wersjami i od razu podzielone na miesiące.

W prototypie papierowym wystarczy eksport CSV z okna dziennika kariery. Ten przycisk jest dostępny także w Twojej wersji 3.21. CSV zawiera dla każdego miesiąca finanse, Confidence, reputację oraz listy startów, kontraktów, technologii, budów i liderów. Szczegółów awarii i identyfikatorów kompleksów w CSV nie ma: te dane są tylko w pliku zapisu. Trzy miesięczne okresy dziennika składają się na jeden kwartał meta-gry.

### 2.5. Odkrycie 2 — kalibracja zegara radzieckiego

Twój poradnik zawiera zdanie, które ma duże znaczenie dla balansu: *„Orbitę osiągamy 26 kwietnia 1955 roku. Półtora roku przed Rosjanami. Jednakże jest to poziom łatwy, dodatkowo nie realizuję tutaj misji X-plane”.*

Oznacza to, że **sprawny gracz na niskim poziomie trudności RP-1 wyprzedza historię o rok do dwóch.** Model ZSRR z GDD w trybie Historycznym przegrałby więc każdy wyścig, mechanizm Szoku (GDD 31.3) nigdy by się nie uruchomił, a cała Epoka II straciłaby sens.

Jednocześnie RP-1 ma własny mechanizm „doganiania i spowalniania” badań: technologie badane po swojej dacie historycznej idą szybciej, a badane przed nią wolniej. Ogranicza to skrajności, ale nie zamyka luki.

**Rekomendacja — jednorazowa kalibracja zamiast ciągłego gumowania:**

1. Poziom trudności RP-1 i tryb przeciwnika meta-gry są ze sobą powiązane w tabeli startowej. Przykładowo: łatwy RP-1 daje ZSRR przyspieszenie +4 kwartały względem kotwic, normalny +2, trudny 0. Wartości do strojenia.
2. Po ośmiu kwartałach kampanii (koniec 1952 roku) silnik porównuje tempo gracza z historią. Mierniki to linia Kármána, zasięg 3000 km i postęp w drzewku. Na tej podstawie raz ustala modyfikator tempa ZSRR na całą kampanię.
3. Modyfikator się nie zmienia. Gracz, który potem przyspiesza, naprawdę zyskuje przewagę.

Taka kalibracja dopasowuje wyścig do umiejętności gracza, nie karząc go za każdy sukces. Ciągłe dopasowywanie tempa przeciwnika do gracza psuje poczucie, że decyzje mają znaczenie.

---

## 3. Decyzja 2 — kanał zapisu: biała lista i dźwignie natywne

### 3.1. Zasada nadrzędna

**Najbezpieczniejsza edycja pliku zapisu to ta, której nie trzeba robić.**

RP-1 ma własne dźwignie, które gracz ustawia w grze jednym kliknięciem. Meta-gra może je nakazywać, a dziennik kariery i plik zapisu pozwalają sprawdzić, czy gracz się podporządkował. Każdy efekt meta-gry, który da się wyrazić dźwignią natywną, wyrażamy dźwignią natywną.

| Dźwignia natywna RP-1 | Przykładowe użycie w meta-grze | Weryfikacja |
|---|---|---|
| **Tempo programu** (Normal / Fast / Breakneck) | Waszyngton po Szoku żąda tempa Breakneck dla programu załogowego; Komisja Środków zakazuje Breakneck w roku cięć | Stan programów w zapisie |
| **Rush kompleksu** (+50% tempa, ×2 koszt, brak wzrostu wydajności) | Dyrektywa terminowa „z przyzwoleniem na rush”; DOI zakazuje rushu po wypadku naziemnym | Pole rushu kompleksu w zapisie |
| **Zatrudnianie i limity personelu** | Cięcia budżetowe: zakaz zatrudniania przez kwartał; strajk: limit inżynierów na konkretnym kompleksie | Liczby w dzienniku kariery |
| **Liderzy** | Nominacje polityczne (rozdział 5.5) | Zdarzenia liderów w dzienniku |
| **Główny wykonawca i podwykonawcy** | Kontrakty PRZ jako wybór wykonawcy w RP-1 | Stan liderów |
| **Przydział pojazdu do kompleksu i lokalizacja platformy** | Patronat frakcji nad kompleksami (rozdział 7.3) | Identyfikator kompleksu przy starcie |
| **Wybór programów** | Sponsor frakcyjny programu (GDD 20.2) | Stan programów |

### 3.2. Biała lista edycji (tryb Zapisu)

**Poziom A — dozwolone, tylko jako przyrosty, zawsze z wpisem do Rejestru Korekt**

| Wartość | Gdzie w zapisie | Uwagi |
|---|---|---|
| Fundusze | scenariusz `Funding`, pole `funds` | Główny nośnik Korekt Budżetowych |
| Nauka | scenariusz `ResearchAndDevelopment`, pole `sci` | Tylko w wyjątkowych zdarzeniach, np. odejście naukowców lub przejęte dane |
| Reputacja | scenariusz `Reputation`, pole `rep` | Na 3.21 obowiązuje jeszcze stockowy limit 1000 przy bezpośrednim ustawianiu; poprawione w 3.23. **[DO WERYFIKACJI]** zachowania przy edycji pliku |
| Confidence | scenariusz `Confidence`, pole `confidence` | Nie ruszać pola `confidenceEarned`, czyli sumy historycznej |
| Kredyt odblokowań | scenariusz `UnlockCreditHandler`, pole `_totalCredit` | Najlepsza „nagroda technologiczna”, bo nie zaburza tempa badań |

Nazwy scenariuszy RP-1 i ich pól potwierdziłem w kodzie. Nazwy scenariuszy stockowych (`Funding`, `ResearchAndDevelopment`, `Reputation`) to standard KSP, ale i tak warto je sprawdzić w Twoim zapisie.

**Poziom B — tylko w trybie Modu, w przyszłości:** postęp projektów w kolejkach (budowy, badania, szkolenia, modernizacje).

Twoja mapa zmiennych słusznie zauważa, że czasy budowy, integracji, przetaczania, szkolenia i modernizacji „da się zmienić”. Odradzam jednak edytowanie ich w pliku, z dwóch powodów:
- RP-1 przelicza te wartości na bieżąco z wydajności kompleksu, liczby inżynierów i bonusów liderów, więc ręczna zmiana może zostać nadpisana albo stworzyć niespójność,
- każda taka edycja jest niewidoczna dla dziennika kariery.

Jeśli meta-gra chce przyspieszyć lub spowolnić prace, robi to przez dźwignie natywne (rush, limity zatrudnienia) albo przez fundusze.

**Poziom C — nigdy:** programy i kontrakty, stan drzewka technologii, definicje kompleksów startowych, liderzy, astronauci i ich statystyki, pojazdy i orbity, tooling, dziennik kariery.

### 3.3. Procedura zapisu

1. KSP musi być zamknięte. Silnik sprawdza to i odmawia pracy, jeśli gra działa.
2. Silnik robi kopię zapasową zapisu z sygnaturą kwartału.
3. Silnik stosuje Korekty z Rejestru Korekt (poziom A) jako przyrosty, nigdy jako nadpisanie wartości.
4. Silnik ponownie parsuje plik i sprawdza, czy zmieniło się wyłącznie to, co miało się zmienić.
5. Korekty trafiają do dziennika meta-gry. Analiza Spójności Wydatków wie, że to „jej” pieniądze, i nie traktuje ich jako niewyjaśnionych.

**Nazewnictwo:** z Warstwy Personelu przejmuję pojęcie `kspOffsets` jako **Rejestr Korekt**. Twoja definicja jest dobra: to jedno miejsce, w którym zbiera się wszystko, co meta-gra „jest winna” grze albo „zabiera” grze w danym okresie. Zmienia się tylko to, kto może do niego pisać: wyłącznie silnik, na podstawie szablonów, a nie AI (rozdział 7.2).

### 3.4. Tryb Honorowy jako stan przejściowy

W fazie 0 i na początku fazy 1 Korekty wprowadzasz ręcznie przez menu debugowania gry. Jest to równoważne trybowi Honorowemu z GDD, bez ryzyka uszkodzenia pliku. **[DO WERYFIKACJI]**, które waluty RP-1 da się ustawić z menu debugowania w Twojej wersji.

---

## 4. Decyzja 3 — nazwa, instytucje i chronologia świata

### 4.1. Diagnoza: dlaczego „NA-AXO” zgrzyta

Twoja intuicja jest trafna, choć problemem jest jedno słowo, a nie skrót.

- **„Aerospace”** pojawia się w angielszczyźnie w **1958 roku**. Do tego czasu mówi się *aeronautical*, *aeronautics*, *rocket*, *guided missile*, a w środowisku entuzjastów *astronautical*. Międzynarodowa Federacja Astronautyczna powstaje właśnie w 1951 roku.
- **„Exploration”** jest poprawne w każdej epoce.
- **Skrót z myślnikiem i literą X** brzmi współcześnie, ale da się go uzasadnić. Litera X była w latach 40. i 50. powszechnym oznaczeniem rzeczy eksperymentalnych: X-1, X-15, XB-70.
- **Wyrazy-klucze epoki** w nazwach instytucji to *Combined* (wojenne instytucje anglo-amerykańskie), *Joint*, *Committee*, *Board*, *Council*, *Organization*, *Agency*, *Administration*.

### 4.2. Rekomendacja: jeden skrót, dwa rozwinięcia

| Okres | Pełna nazwa | Skrót | Jak się o niej mówi |
|---|---|---|---|
| **1951–1958** | *North Atlantic Aeronautical eXperimental Organization* | **NA-AXO** | W prasie „Naxo”. Wersja francuska w dokumentach Paryża: *Organisation Atlantique Nord d'Aéronautique Expérimentale* (OANAE). Francuzi uparcie używają własnego skrótu |
| **od 1958** | *North Atlantic Aerospace and Exploration Organization* | **NA-AXO** | Zmiana rozwinięcia przy zachowaniu skrótu jako akt public relations po szoku orbitalnym. Stara gwardia mówi dalej „Aeronautical” |

Zalety tego rozwiązania:

1. Zachowujesz nazwę, której używasz we wszystkich materiałach.
2. Twoje dotychczasowe rozwinięcie staje się poprawne historycznie dokładnie w roku, w którym pojawia się słowo „aerospace”.
3. **Zmiana nazwy jest zdarzeniem w grze**, a nie przypisem.

Mechanicznie zmiana nazwy to decyzja na początku Epoki II w łańcuchu kryzysu Szok orbitalny:
- **rebranding pozorny**: WF +3, nic się nie zmienia,
- **reorganizacja**: wydzielenie cywilnej twarzy, patrz NAAA w 4.3,
- **odmowa**: Waszyngton odbiera to jako brak reakcji, ZW −4.

Alternatywy, które rozważyłem i odrzuciłem:
- **AARO** (*Atlantic Aeronautical Research Organization*) — koliduje z istniejącym dziś biurem rządu USA o tym samym skrócie;
- **NARAO** i podobne — brzmią poprawnie, ale porzucają Twoją markę bez potrzeby;
- pełna zmiana nazwy na coś w rodzaju *Atlantic Rocket Council* — zbyt wąska, bo program obejmuje też lotnictwo i X-Planes.

### 4.3. Uporządkowana chronologia założycielska

Biblia ma bogatą prehistorię, ale zawiera kilka niespójności. Poniżej wersja uporządkowana, z zaznaczeniem, co zmieniłem i dlaczego.

| Data | Wydarzenie (alt-historia) | Uwagi |
|---|---|---|
| 1943, Quebec | Tajny protokół o wspólnych badaniach. W naszej historii rozszerzony o aneks rakietowy | Historyczny Combined Policy Committee istniał naprawdę (sprawy atomowe), więc rozszerzenie jest wiarygodne |
| 1944, Londyn | Tajne porozumienie o podziale niemieckiej wiedzy — „grzech pierworodny” | Z Biblii, bez zmian |
| XI 1944 | Roosevelt umiera po wygranych wyborach | **Korekta:** jako urzędujący prezydent FDR zostawiłby urząd wiceprezydentowi Wallace'owi. W naszej wersji Wallace pełni urząd przez około dwa miesiące, a 20 stycznia 1945 roku przysięgę składa Byrnes jako wiceprezydent-elekt. Wychodzi mała, smaczna zagadka konstytucyjna, a Byrnes zostaje prezydentem bez naginania faktów |
| 1945 | Byrnes; Hiroszima, Nagasaki, Kobe | Z Biblii |
| 1947, Lyon | Konferencja Hulla, „marzenie o niebiosach”; pakt USA, Wielkiej Brytanii, Kanady, Francji i Holandii | Prawdziwy Hull ustąpił w 1944 roku z powodu choroby. W alt-historii trzeba przyjąć, że wrócił do zdrowia, albo zrobić z niego honorowego patrona, a tekst napisał ktoś inny |
| 1948 | Truman wygrywa wybory | Z Biblii |
| 1949 | Raport o radzieckich rakietach dalekiego zasięgu; powstaje komitet sojuszniczy (USA, Wielka Brytania, Francja, Kanada, Włochy) | **Korekta nazwy:** w Biblii to ARDC (*Allied Research and Development Committee*). Prawdziwe USAF miało od 1950 roku ARDC — *Air Research and Development Command*, czyli dowództwo, któremu podlegał Schriever, a Schriever jest w Biblii postacią. Proponuję **CARC — Combined Aeronautical Research Committee**, z wojennym słowem *Combined* |
| IV 1951 | **Eisenhower jako Naczelny Dowódca Sił Sojuszniczych w Europie (SACEUR)** przeforsowuje przekształcenie CARC w NA-AXO | **Korekta:** Biblia każe Eisenhowerowi zakładać NA-AXO w 1951 roku jako prezydentowi, a prezydentem zostaje dopiero w 1953. Tymczasem od kwietnia 1951 był naprawdę SACEUR, co daje NA-AXO naturalny związek z NATO |
| IX 1951 | Traktat pokojowy z Japonią; Japonia zapowiedziana jako obserwator | Traktat wszedł w życie w kwietniu 1952 roku, więc formalny status obserwatora zaczyna się w 1952 |
| X 1951 | Churchill wraca na urząd premiera | Biblia pomija drugi rząd Churchilla. Szkoda, bo to on rządzi Wielką Brytanią w pierwszych latach kampanii |
| 1952 | Eisenhower wygrywa z Harrimanem | Z Biblii |
| 1955 | RFN odzyskuje suwerenność; znikają ograniczenia okupacyjne dla niemieckiego przemysłu rakietowego | Do 1955 roku niemieccy członkowie NA-AXO działają z ograniczeniami. To dobry generator napięć z Adenauerem |
| 1957–58 | Szok orbitalny; NORAX; zmiana rozwinięcia NA-AXO; ewentualne powstanie NAAA | NAAA z Biblii (*North Allied Aerospace Administration*) jako opcjonalny wynik decyzji „reorganizacja”. Jeśli powstaje, RN i BLZ formalnie przechodzą pod NAAA, a Anderson zostaje dowódcą operacyjnym obu struktur. Jest to wyjście kryzysu, nie stały element świata |

### 4.4. Członkowie — propozycja kanoniczna

W materiałach są trzy różne listy członków: Lyon 1947 (z Holandią), „finansowanie” (z RFN, Japonią i Szwecją) oraz „Rada Naczelna” w Warstwie Personelu (z Australią). Proponuję jedną:

| Status | Państwa | Funkcja mechaniczna |
|---|---|---|
| **Członkowie założyciele** | USA, Wielka Brytania, Francja, Kanada, Włochy | Pełne prawo głosu w Radzie Atlantyckiej; każdy ma jedno żądanie rocznie (GDD 9.5) |
| **Członkowie przyjęci w 1951** | RFN (z ograniczeniami do 1955), Holandia | RFN generuje napięcia „Paperclip kontra Adenauer” |
| **Członek-gospodarz** | Australia (poligon Woomera, wspólny projekt z Wielką Brytanią od 1947 roku) | Głos w Radzie, dostęp do Woomery |
| **Obserwator** | Japonia (od 1952) | Program Sakura: łączność i telemetria nad Pacyfikiem |
| **Partner stowarzyszony** | Szwecja | Neutralność wyklucza członkostwo w organizacji o wojskowym dnie. Szwecja handluje „na własnych warunkach”, dokładnie tak jak SAAB w Biblii |

Weto w Radzie Atlantyckiej, pomysł z Warstwy Personelu, przyjmuję. Mają je wyłącznie członkowie założyciele i tylko w sprawach finansowania wspólnego. Dzięki temu Wielka Brytania i Francja mają realną dźwignię, a Włochy i Kanada mogą być języczkiem u wagi.

### 4.5. Instytucje wewnętrzne — nazwy zgodne z rokiem 1951

Warstwa Personelu używa nazw frakcji USAF, NRO, NASA, AEC i DARPA zgrupowanych w „EXCOMM-A”. Trzy z tych pięciu instytucji w 1951 roku nie istnieją, a EXCOMM to nazwa z kryzysu kubańskiego (1962).

| Instytucja | Kiedy powstaje naprawdę | Co istnieje w 1951 roku | Frakcja GDD |
|---|---|---|---|
| NASA | 1958 | **NACA** (od 1915), laboratoria uniwersyteckie, JPL | Rada Naukowa (RN) |
| NRO | 1961 (istnienie ujawnione dopiero w 1992) | **CIA** (od 1947) | Biuro Analiz Specjalnych (BAS) |
| ARPA / DARPA | 1958 / 1972 | — | Brak odpowiednika w 1951 roku |
| AEC | 1946 | **AEC** | Opcjonalnie: patron programu atomowego w Epoce III |
| USAF | 1947 | **USAF** (ARDC, Strategic Air Command), a obok niego **Armia** (Redstone Arsenal, zespół rakietowy w Huntsville od 1950) i **Marynarka** (NRL, rakieta Viking) | Dyrektoriat Programów Obronnych (DPO) |
| EXCOMM | 1962 | — | Zastępuję **Komitetem Nadzorczym Rady Atlantyckiej** |

**Złoto historyczne:** w latach 50. największym konfliktem amerykańskiego programu rakietowego nie była rywalizacja wojska z naukowcami, tylko **rywalizacja trzech rodzajów sił zbrojnych**. Armia, Lotnictwo i Marynarka miały własne rakiety i własne programy satelitarne (historycznie: Vanguard Marynarki przeciw Explorerowi Armii). Proponuję, żeby DPO miało w środku trzy **Służby** jako podfrakcje bez osobnych zegarów, tylko z polem „która Służba przewodzi”. Agendy i Dyrektywy DPO zmieniają się w zależności od tego, która Służba aktualnie dominuje. Dodaje to dużo historycznej faktury bez nowych wskaźników.

Pozostałe nazwy z Biblii:
- **NORAX** (*North Atlantic Radar Exchange*) jest dobry i dobrze umieszczony w czasie, bo prawdziwy NORAD powstaje w 1958 roku;
- **Skyshield** jako fikcyjny program Trumana jest w porządku. Historyczne „Sky Shield” to były ćwiczenia obrony powietrznej w latach 1960–62, więc kolizja jest łagodna.

### 4.6. Miejsca startowe — „Twierdze i Bagna” zgodne z RSS i z epoką

Pomysł z Biblii, że każda baza to „państwo w państwie”, jest świetny. Lista baz wymaga jednak korekty: Kourou działa od 1968 roku, a Andøya od 1962. Proponuję oprzeć ją na miejscach dostępnych w Real Solar System (lista sprawdzona w repozytorium RSS) i na datach historycznych:

| Miejsce (RSS) | Działa od | Gospodarz w lore | Charakter polityczny |
|---|---|---|---|
| **Cape Canaveral** | 1950 | NA-AXO, „jasna strona” | Hollywood na Bagnach. Prasa, związki zawodowe, kongresmeni |
| **White Sands** | 1945 (starty V-2) | DPO, Armia | Nuklearna piaskownica. Starty suborbitalne, X-Planes |
| **Wallops** | 1945 | RN, NACA | Ośrodek nauki, rakiety sondujące |
| **Woomera** | 1947 | Wielka Brytania i Australia | Pustynia brytyjskiego geniuszu bez pieniędzy: Skylark (1957), Black Knight (1958), Blue Streak (lata 60.) |
| **Hammaguir** | 1947–1967 | Francja | **Algieria.** Wojna 1954–62, porozumienia z Évian w 1962 roku i przymusowa przeprowadzka. Gotowy łańcuch kryzysowy, a zarazem historyczne uzasadnienie późniejszego Kourou |
| **Churchill** | 1954 (rozbudowa w Międzynarodowym Roku Geofizycznym) | Kanada | Arktyka, zorze, łatwe mosty z RN |
| **Vandenberg** | 1958–59 | DPO, BAS | Czarna Dziura. Orbity polarne, ładunki, których „nie miałeś prawa widzieć” |
| **Kourou** | 1968 | Francja | Następca Hammaguir, Epoka IV |
| **Esrange** | 1966 | Szwecja (partner) | Zastępuje Andøyę, której nie ma w RSS. Neutralna Szwecja, nasłuch skierowany na Murmańsk |
| **Uchinoura / Tanegashima** | 1962 / 1969 | Japonia | Program Sakura |

**Krytyczne zastrzeżenie [DO WERYFIKACJI]:** cała ta mechanika ma sens tylko wtedy, gdy w jednej karierze RP-1 da się startować z kilku odległych miejsc. Jeśli RP-1 pozwala wyłącznie na jedno KSC na karierę, z wyborem platform w jego okolicy, miejsca odległe stają się lore bez weryfikacji, a fizyka zawsze dotyczy przylądka. Dla orbit polarnych to duża różnica. Zanim to wejdzie do GDD, trzeba to sprawdzić w Twojej instalacji.

---

## 5. Decyzja 4 — prawdziwe osoby czy fikcyjne

### 5.1. Punkt wyjścia: gra jest już hybrydą

RP-1 samo umieszcza prawdziwe osoby w gabinecie gracza: Korolowa, von Brauna, Głuszkę, Kranza, Gagarina, Van Allena, Katherine Johnson i innych. Biblia świata dodaje prezydentów, senatorów, generałów i dyrektorów służb, opisanych w bardzo ostrym tonie. Pytanie nie brzmi więc „czy prawdziwe osoby”, tylko **„w jakiej roli i z jakim zapisem”**.

### 5.2. Zalety i wady

| | Prawdziwe osoby | Postaci fikcyjne |
|---|---|---|
| **Wiarygodność i ciężar** | Ogromne. Nazwisko LBJ albo LeMaya od razu niesie znaczenie | Trzeba je zbudować. Archetyp pomaga, ale zajmuje to czas |
| **Wiedza gracza** | Zna biografie, więc przewiduje zdarzenia (śmierć Korolowa w 1966, losy Kennedy'ego). **Psuje to mgłę wojny** | Gracz nie wie, co zrobi postać. Mgła wojny działa |
| **Swoboda fabuły** | Ograniczona. Każde odstępstwo od zapisu historycznego trzeba uzasadnić | Pełna. Postać może zdradzić, zginąć, upaść, zostać zwolniona |
| **Sprawczość Andersona** | Nie można wiarygodnie zwolnić senatora ani szantażować dyrektora CIA. Można z nimi grać, ale nie nimi | Wszystko, co przewidują mechaniki Gabinetu, Intryg i Haków, działa bez zgrzytu |
| **Zachowanie AI** | Modele językowe, łącznie ze mną, zwykle łagodzą albo odmawiają, gdy mają przypisać prawdziwej osobie wymyślone przestępstwa, nałogi czy zachowania seksualne. Prowadzi to do **niespójności tonu w połowie kampanii** | Model może prowadzić postać tak mrocznie, jak wymaga tego fabuła |
| **Ryzyko etyczne i prawne** | Przy grze prywatnej niewielkie. Przy publikacji (mod, nagrania, sprzedaż) realne. Nie jestem prawnikiem, ale wiem, że w Polsce pamięć osoby zmarłej podlega ochronie jako dobro osobiste bliskich, a podobne zasady istnieją gdzie indziej | Brak |
| **Wartość edukacyjna** | Wysoka, jeśli zachowania postaci są zgodne z faktami | Niska, chyba że postać jest jawnym kompozytem |

### 5.3. Rekomendacja: trzy pierścienie

> **Im bliżej biurka Andersona, tym bardziej fikcyjnie.**

**Pierścień zewnętrzny — osoby prawdziwe**
- Kto: prezydenci, premierzy, senatorowie, generałowie najwyższego szczebla, szefowie służb, gubernatorzy.
- Jak występują: w dokumentach, przemówieniach, telefonach, przesłuchaniach i żądaniach. Wpływają na wskaźniki (ZW, NG, budżet), ale Anderson nie ma na nich mechanik Gabinetu.
- **Zasada zapisu:** postać działa zgodnie z udokumentowanymi poglądami i stylem. Alt-historia może zmienić jej decyzje, bo inne okoliczności dają inne wybory, ale **narrator nigdy nie przypisuje jej wymyślonych przestępstw, nałogów ani skandali obyczajowych.**
- Kontrowersje udokumentowane wolno wykorzystywać: członkostwo von Brauna w SS i sprawę Mittelwerk, bombardowania LeMaya, teczki Hoovera, metody McCarthy'ego, Johnson Treatment LBJ, „lukę rakietową” Symingtona.
- Ostre oceny („rzeźnik”, „psychopata”) mogą padać **z ust postaci w świecie gry**, na przykład wściekłego dyrektora albo dziennikarza. Narrator ich nie wypowiada.

**Pierścień środkowy — kompozyty z kluczem**
- Kto: ludzie, z którymi Anderson pracuje na co dzień i których może zatrudnić, zwolnić, przekupić albo zniszczyć: dyrektorzy frakcji, łącznicy, przedstawiciele przemysłu.
- Postaci są fikcyjne, ale mogą być czytelnie inspirowane prawdziwymi osobami. Przykłady:
  - gen. Voss to LeMay i Schriever w jednym,
  - Dorothy Ames ma rodowód z wczesnej CIA,
  - dr Brandt i dr Vogel to kompozyty Paperclip.
- To rozwiązuje problem von Brauna: prawdziwy von Braun może istnieć w tle, ale tajemnicę wojenną nosi Brandt.

**Pierścień wewnętrzny — postaci w pełni fikcyjne**
- Kto: astronauci, Gabinet, dziennikarze, technicy, krety.
- Korpus z Biblii (Sterling, Thorne, Cross, Miller i reszta) idealnie pasuje do tego pierścienia.

### 5.4. Firmy

Ta sama logika obowiązuje firmy. Biblia miesza prawdziwe koncerny (Lockheed, Boeing, Martin, McDonnell, Hughes, Dassault, de Havilland, Mitsubishi) z fikcyjnymi i przypisuje prawdziwym korupcję i fuszerki.

**Rekomendacja:**
- **Firmy, które w zdarzeniach będą winne, przekupne albo wadliwe, są fikcyjne.** To prawie wszystkie firmy, z którymi Anderson ma do czynienia.
- Prawdziwe koncerny występują wyłącznie w tle i zgodnie z faktami, np. „katastrofy Cometów” albo „U-2 od Lockheeda”.

Trzy fikcyjne koncerny z GDD połączyłbym z lepiej rozwiniętymi firmami z Biblii:

| Rola w GDD | Proponowany kanon | Uwagi |
|---|---|---|
| Silniki na paliwo ciekłe, duże stopnie | **Liberty Rocket & Motors** (Huntsville) | Z Biblii. Zastępuje Pacific Astrodyne |
| Nosiciele i struktury, kontrakty z lotnictwem wojskowym | **Stratton-Marwick Aviation** | Z Biblii |
| Kapsuły, systemy załogowe | **Ellison-Wright Aircraft** (Long Beach) | Z Biblii. Zastępuje Hollis-Ward; profil „bezpieczne, ale drogie i ciężkie” jest lepszy |
| Paliwa stałe, stopnie górne | **Keystone Propulsion** | Z GDD, zostaje |
| Kartel awioniki | **Fairchild-Rosen** → do przemianowania | Koliduje z prawdziwym Fairchild i z Miltonem Rosenem, liderem w RP-1 (rozdział 8) |

### 5.5. Liderzy RP-1 — zasada „etykiety mechanicznej”

Liderzy RP-1 to prawdziwe osoby z premiami procentowymi. W świecie NA-AXO nie da się wiarygodnie zatrudnić Korolowa, a obecność prawdziwego von Brauna obok fikcyjnego Brandta byłaby myląca.

**Rekomendacja:** nazwisko lidera w RP-1 traktujemy jako **etykietę mechaniczną profilu**, a w lore stanowisko zajmuje postać meta-gry. Plik mapowania przypisuje każdemu liderowi RP-1 odpowiednik w świecie gry:

| Kategoria RP-1 | Stanowisko w lore | Kto decyduje | Uwagi |
|---|---|---|---|
| **Administration** | **Dyrektor Generalny NA-AXO**, mianowany przez Waszyngton | Waszyngton, czyli zdarzenia | Anderson nie wybiera go sam. Zmiana Administracji (GDD 9.5) może wymusić zmianę lidera, a usunięcie kosztuje w RP-1 reputację. Jest to gotowe, mechaniczne odwzorowanie „szefa, który przychodzi z polityki” |
| **Chief Designer** | Główny Inżynier Programu (Gabinet) | Anderson | |
| **Flight Director** | Dyrektor Lotów (Delaney albo jego następca) | Anderson przy wpływie BLZ | |
| **Chief Scientist** | Przewodniczący Rady Naukowej (Brandt albo następca) | Anderson przy wpływie RN | |
| **Main Contractor i Subcontractors** | **Kontrakty PRZ** | Anderson pod presją lobbingu | Najlepsze możliwe odwzorowanie mechaniki Udziałów: wybór wykonawcy w RP-1 to decyzja polityczna |

Pozostałe stanowiska Gabinetu z GDD (Zastępca, Łącznik z Kongresem, Rzecznik, Szef Gabinetu, Dyrektor Bezpieczeństwa Misji) nie mają odpowiednika w RP-1. Działają wyłącznie w meta-grze, przez UD, KP, zegary i Rejestr, **bez żadnych procentowych premii do ekonomii KSP.** Dzięki temu nie dublujemy liderów RP-1 (rozdział 7.2).

**Liderzy radzieccy i spoza sojuszu** (Korolow, Czełomiej, Jangel, Głuszko, Barmin, Gagarin, Gurewicz i biura OKB jako wykonawcy) są **domyślnie zakazani**. Tu przydaje się pomysł z Warstwy Personelu, czyli **Grupa Wschodnia**. Radzieckiego lidera można wybrać tylko wtedy, gdy BAS przeprowadziło operację przejęcia uciekiniera. Wtedy w lore jest to „konsultant ze Wschodu” w tajnym statusie: Tajemnica w Rejestrze, wysokie Ciśnienie, ryzyko afery szpiegowskiej. Liderzy z Indii i Chin działają na podobnej zasadzie, jako konsultanci zagraniczni.

Szczególny przypadek to **Qian Xuesen**, który jest historycznym złotem. Był w USA do 1955 roku, w 1950 roku stracił poświadczenie bezpieczeństwa, a w 1955 roku został deportowany do Chin. Jeśli gracz wybierze go na Chief Scientist przed 1955 rokiem, silnik ma gotowe zdarzenie z epoki maccartyzmu z realnym kosztem w RP-1: usunięcie lidera to utrata reputacji.

### 5.6. Uwaga o tonie Biblii

Głos „Raportu DM” jest bardzo żywy i dobrze oddaje cynizm świata. Jest to jednak **głos dla Mistrza Gry, a nie głos dokumentów w świecie gry.** Proponuję trzy zasady:

1. Biblia zostaje dokumentem dla AI z sekcjami „Fasada” i „Rzeczywistość”. AI może z niej czerpać fakty i napięcia, ale nie styl.
2. Dokumenty w grze mówią językiem instytucji z lat 50. (GDD 29). Wulgaryzmy pojawiają się wyłącznie w ustach konkretnych postaci, w stenogramach, notatkach odręcznych i podsłuchach, a nie w narracji.
3. Uprzedzenia epoki (wobec Japończyków, Niemców, kobiet, Afroamerykanów) istnieją w świecie jako postawy postaci i są źródłem konfliktów. Narrator ich nie podziela i nie używa obraźliwych określeń; w Biblii takie się zdarzają. Takie podejście jest uczciwe wobec historii, a model nie zaczyna nagle łagodzić tekstu w połowie kampanii.

---

## 6. Decyzja 5 — model AI i budżet wywołań

### 6.1. Architektura: dwie role i plan awaryjny

| Rola | Zadania | Wymagania | Klasa modelu |
|---|---|---|---|
| **Narrator** | Teczka Kwartalna, dokumenty zdarzeń, kryzysy, stenogramy przesłuchań, epilog | Bardzo dobra polszczyzna i rejestr epoki, utrzymanie głosu postaci, dyscyplina kontraktu JSON | Model z górnej półki |
| **Kancelista** | Streszczenia roczne i epokowe, aktualizacje Kart Głosu, poprawki odpowiedzi odrzuconych przez walidator, Teczki Pojazdów (rozdział 7.1) | Poprawność, krótkie wyjścia, tani i szybki | Model średni lub mały |
| **Szablony** | Każdy dokument, gdy AI zawiedzie dwa razy (GDD 27.4) | Gra działa bez AI | — |

Adapter modeli jest wymienny (GDD 33.2). W fazie 0 nie trzeba żadnego API: wystarczy kopiować Pakiet Kontekstu do Google AI Studio, którego już używasz, albo do dowolnego czatu.

### 6.2. Szacunek zużycia

Założenia na jeden zwykły kwartał:

| Wywołanie | Liczba | Wejście (tokeny) | Wyjście (tokeny) |
|---|---|---|---|
| Teczka Kwartalna (4–6 dokumentów) | 1 | ~12 000 | ~5 000 |
| Następstwa (dokumenty zdarzeń) | 1–2 | ~10 000 | ~3 000 |
| Kancelista (streszczenia, karty, poprawki) | 1–2 | ~6 000 | ~1 000 |
| **Razem, zwykły kwartał** | **3–5** | **~40 000** | **~10 000** |

Polszczyzna zużywa zauważalnie więcej tokenów niż angielszczyzna, co jest już uwzględnione w zapasie.

Kampania 1951–1975 to 100 kwartałów. Doliczając narzut na kryzysy, Sesje Budżetowe i epilog (×1,5), wychodzi około **6 mln tokenów wejścia i 1,5 mln tokenów wyjścia na całą kampanię**.

Orientacyjny koszt całej kampanii przy cenach z cenników zebranych przez serwisy zewnętrzne (sierpień–wrzesień 2026). **Przed decyzją sprawdź oficjalne cenniki**:

| Model (przykład klasy) | Wejście / wyjście za 1 mln tokenów | Koszt całej kampanii (bez cache) |
|---|---|---|
| Claude Opus 5.5 | $4 / $20 | ~$54 |
| Claude Sonnet 5.5 | $2 / $10 | ~$27 |
| Gemini 3.1 Pro | $2 / $12 | ~$30 |
| Gemini 3.6 Flash | $0,75 / $3,75 | ~$10 |

Do tego dochodzi **cache promptu**. Stała część kontekstu (Biblia kompaktowa, styl, Karty Głosu) może iść z cache'a za ułamek ceny wejścia, a to obniża koszty dalej.

**Wniosek: pieniądze nie są tu ograniczeniem.** Nawet najdroższy wariant kosztuje mniej niż jedna gra. Ograniczeniem jest jakość: polszczyzna, konsekwencja postaci przez lata i trzymanie się kontraktu.

### 6.3. Jak wybrać model: ślepy test

Nie będę Ci polecał konkretnego dostawcy na słowo — tym bardziej że sam jestem jednym z kandydatów. Proponuję prosty test, który rozstrzygnie to rzetelnie:

1. Przygotuj jeden Pakiet Kontekstu z prototypu papierowego, na przykład kwartał po nieudanym starcie.
2. Daj go 2–3 modelom z identyczną instrukcją.
3. Wydrukuj wyniki bez nazw modeli i oceń je według pięciu kryteriów:
   - polszczyzna i rejestr epoki,
   - zgodność z faktami z pakietu (zero wymyślonych liczb),
   - głos postaci,
   - poprawność JSON,
   - **czy model coś wyjawił**, czyli zasugerował informację, której nie było w pakiecie.
4. Powtórz test na jednym dokumencie kryzysowym, np. stenogramie przesłuchania.

Wygrywa model, który lepiej wypada w kryzysie. Zwykłe kwartały uniesie każdy przyzwoity model.

### 6.4. Budżet kontekstu — ważniejszy niż budżet pieniędzy

Biblia świata ma około 16 600 słów, czyli kilkadziesiąt tysięcy tokenów. **Nie wkładaj jej w całości do każdego wywołania.** Zamiast tego:

- **Biblia kompaktowa** (do ~3 000 tokenów): ton, zasady świata, lista frakcji i miejsc, zawsze w kontekście, cache'owana.
- **Wpisy Biblii z tagami.** Każda postać, firma, miejsce i program to osobny wpis z tagami. Silnik dołącza do pakietu tylko wpisy powiązane z bieżącym zdarzeniem, np. awaria awioniki prowadzi do wpisów „Fairchild-Rosen”, „Shiden Instruments” i „Cape Canaveral”.
- **Karty Głosu** (GDD 28.3) tylko dla postaci występujących w danym dokumencie.

### 6.5. Dwie poprawki do obecnej praktyki

Twoja Warstwa Personelu opisuje dwa kanały: raport dla gracza (oczyszczony) i raport dla AI (**pełna prawda**, łącznie z `true_is_mole`). Opisuje też komendy, które AI może swobodnie wydawać, np. `[KSP_OFFSET_FUNDS: -50000]`. Oba rozwiązania trzeba zmienić:

1. **AI dostaje warstwę wiedzy, nie warstwę prawdy.** Jeśli kret ma się zdradzić, silnik przekazuje AI konkretny sygnał („widziany na kolacji z łącznikiem”), a nie flagę. Model, który wie, że ktoś jest kretem, prędzej czy później to zasugeruje. Nie chodzi o złą wolę: tak działa generowanie tekstu.
2. **AI proponuje, silnik rozstrzyga.** Komendy w rodzaju `[KSP_OFFSET_FUNDS]` stają się *propozycjami* w polu `propozycje` (GDD 27.2). Silnik przyjmuje je tylko wtedy, gdy mieszczą się w widełkach szablonu zdarzenia, np. kradzież przez kreta to od 2 do 6% kwartalnego budżetu, a nie dowolna kwota.

---

## 7. Złoto z notatek

### 7.1. Z Biblii świata

| Pomysł | Status | Gdzie trafia i w jakiej formie |
|---|---|---|
| **Fasada i Rzeczywistość** jako dwa opisy każdej instytucji | **KANON** | Format każdej karty w Biblii: sekcja „Fasada” trafia do dokumentów w grze, sekcja „Rzeczywistość” jest wyłącznie dla Mistrza Gry. Idealnie realizuje „trzy twarze NA-AXO” (GDD 4.2) |
| **Twierdze i Bagna** — bazy jako państwa w państwie | **KANON PO PRZERÓBCE** | Rozdział 4.6. Lista zgodna z RSS i datami; zależy od weryfikacji startów z odległych miejsc |
| **Zbrojownia** — każdy prawdziwy pojazd z Twojego hangaru dostaje opis „Fasada PR / Rzeczywistość Andersona” | **KANON — najlepszy pomysł w materiałach** | Nowa mechanika **Teczka Pojazdu**: przy pierwszym starcie nowego projektu Kancelista generuje jednostronicową teczkę z danych z KSP (silniki, masa, kompleks, awarie z dziennika) i z jednego zdania od Ciebie. Teczka wraca w śledztwach i przesłuchaniach. Jest tania, łączy KSP z narracją i daje poczucie, że *Twoje* rakiety należą do tego świata |
| **Kryptonimy** — nazwa programu jako sygnał | **KANON PO PRZERÓBCE** | **Słownik kryptonimów** jako małe decyzje. Gracz nadaje misji nazwę z listy kategorii: „pokojowa”, „mitologiczna”, „agresywna”, „romantyczna”. Wojskowy ładunek pod nazwą „Pax” chroni Fasadę, ale podnosi Ciśnienie powiązanej Tajemnicy; nazwa „Kosa” zadowala DPO i drażni Radę Atlantycką. Weryfikacja: prefiks w nazwie pojazdu |
| **Proponowane misje** (Highwind, Firebird, Blackdart, Crimson Eye, Vanguard's Folly, Silent Fall…) | **KANON PO PRZERÓBCE** | Szablony Dyrektyw z ukrytą agendą dla Epoki I i II. Każdą trzeba sprawdzić pod kątem wykonalności w RP-1: **Black Horizon** (przelot nad Kazachstanem) jest fizycznie niewykonalny z przylądka lotem suborbitalnym, więc staje się misją z weryfikacją typu R albo zostaje przeniesiony na satelitę |
| **Doktryna Masy** — ZSRR buduje seryjnie i akceptuje straty | **KANON** | Parametr modelu ZSRR (GDD 15.5): wyższa szansa awarii, krótszy czas odbudowy po awarii |
| **Program Sakura** — japońska telemetria i łączność | **KANON** | Japonia jako dostawca stacji nad Pacyfikiem. Odejście Japonii to kryzys łączności (Dyrektywa: „przeprowadź misję bez łączności pacyficznej”). **[DO WERYFIKACJI]**, czy RealAntennas pozwala to odwzorować w grze |
| **Grzech pierworodny** — Paperclip, nienawiść brytyjsko-niemiecka | **KANON** | Generator zdarzeń kadrowych i kluczowy kontekst dla Brandta i Vogla |
| **Fazy eskalacji** (Mach 1 → stratosfera → orbita → wyścig załogowy) | **KANON** | Dobrze pokrywa się z epokami GDD i z programem X-Planes w RP-1 |
| **Korpus Astronautów** (Holy Five, roster, przydziały polityczne) | **KANON PO PRZERÓBCE** | Pełna fikcja (pierścień wewnętrzny). Dynamika „Trójca przeciw Millerowi” to doskonały silnik intryg. Do poprawki: anachronizmy w życiorysach (rozdział 8) i kolizje nazw |
| **Wskazówka dla AI o rzutach kostką po misji** | **ODRZUCONE** | Kłóci się z Z3. Rzuty wykonuje silnik, a AI dostaje wynik („awaria łączności, część X, dostawca Y”) i go dramatyzuje |

### 7.2. Z Warstwy Personelu — ocena ostrożna

Najpierw diagnoza ogólna. Warstwa Personelu zawiera **dobre mechaniki relacji i podejrzliwości**, ale osadza je na **ekonomii, która rozsadza projekt**:

- **Trzy nowe waluty** (certyfikaty TECH, DIPLO i INTEL) plus pula 200 punktów Zero-Sum, Resolve, stres i lojalność. W sumie około siedmiu nowych liczników w samym module kadr, wbrew Z6.
- **Kilkanaście procentowych mnożników do ekonomii KSP**: −25% kosztu startu, +25% tempa badań, +30% reputacji, darmowe fundusze i darmowy kredyt odblokowań. RP-1 robi już dokładnie to samo przez liderów. Stąd trzy problemy:
  - podwójne liczenie,
  - lawinowy wzrost mocy gracza,
  - konieczność ręcznego cheatowania wartości w KSP co miesiąc.
- **Przycisk „EXTRACT CERTIFICATE”**, czyli nieograniczone źródło waluty za stres, które w praktyce da się „farmić”.
- **AI z pełną prawdą i swobodą komend** (rozdział 6.5).

Szczegółowa ocena:

| Pomysł | Status | Uzasadnienie i forma w GDD |
|---|---|---|
| **Formularz po każdym locie** (Twoja decyzja) | **KANON** | Masz rację: czekanie do końca okresu to chaos. Raport Misji (GDD 18.3) wypełniasz zaraz po locie, 30 sekund, większość pól z dziennika kariery |
| **Formularz przed lotem** (planowanie) | **KANON PO PRZERÓBCE** | Wchłonięty przez Plan Kwartalny (GDD 9.2). Osobny formularz przed każdym lotem byłby za ciężki |
| **Ukryte cechy i pasywna obserwacja z sygnałami** | **KANON** | Idealnie pasuje do sygnałów (GDD 8.4, 27.1). Pula ukrytych cech: szantażowany, kontakt CIA, długi, wypalenie, kret |
| **Dwa typy kretów: Wtyczka i Odwrócony** | **KANON** | Wtyczka to rzadki kret od rekrutacji. Odwrócony powstaje, gdy Lojalność spada do −2 lub niżej: nie pracuje dla KGB, tylko zaczyna wynosić brudy do prasy i Kongresu. Bardzo dobry podział, bo kara wynika z zarządzania, a nie z losu |
| **Ograniczenie dostępu przed zwolnieniem** (żeby kret nie mógł się zemścić) | **KANON** | Nowa akcja „Odcięcie dostępu” (1 UD): Lojalność −2, ale zwolniony kret nie wynosi tajemnic |
| **Wyniki śledztwa: czysto / dowody / niejasne / zatuszowane z góry** | **KANON** | Zastępują prosty wynik akcji „Śledztwo wewnętrzne”. Wariant „zatuszowane przez Waszyngton” to świetne źródło nieufności |
| **Globalne ryzyko przecieku rosnące z liczbą trupów w szafie** | **KANON PO PRZERÓBCE** | Modyfikator **Paranoja Systemu**: każde 4 aktywne Tajemnice dodają +1 do przyrostu Ciśnienia każdej z nich raz na rok. Ten sam sens, bez nowej liczby na ekranie |
| **Jeden aktywny fokus operacji tajnych z czasem odnowienia** | **KANON** | BAS prowadzi jedno Zlecenie wywiadowcze naraz (GDD 16.5). Zmiana celu zrywa trwające zlecenie. Dokładnie Twoje „kto robi wszystko, nie robi nic” |
| **Sabotaż radzieckiego programu** | **KANON PO PRZERÓBCE** | Jako Zlecenie BAS z twardym limitem: najwyżej −1 segment zegara projektu ZSRR. Porażka podnosi NG o 1 i tworzy Tajemnicę o wadze 3. Rzadkie, drogie i niebezpieczne, a nie przycisk |
| **Publiczny proces kontra cicha likwidacja kreta** | **KANON** | Wpisuje się w typy decyzji Ujawnienie i Zatajenie (GDD 23.3). Nagroda za proces, czyli jednorazowe przesunięcie Wpływu, jest dobra |
| **Obrona nie zmienia równowagi** (Ogar blokuje pucz, ale nikt nie traci punktów) | **KANON jako zasada Z11** | Rozdział 8 |
| **Radca Prawny kupuje czas** (audyt odroczony o 1–6 miesięcy) | **KANON PO PRZERÓBCE** | Świetne powiązanie z KSP: polityka daje Ci *dni kalendarza*, żebyś fizycznie zdążył z misją. W GDD jako akcja „Odroczenie” (1 UD + 1 KP): termin Dyrektywy lub zegar Kontroli Kongresu przesuwa się o 1 kwartał, raz na Dyrektywę. Bez nowego stanowiska: robi to Łącznik z Kongresem |
| **Mnożnik złożoności misji M = 1–6** | **KANON** | Skaluje rozgłos i skutki kadrowe (GDD 21.1). Nie będzie tak, że rakieta sondująca z 1952 roku waży tyle co katastrofa załogowa |
| **Oversight Matrix — łącznicy frakcji w budynkach, eksmisje** | **KANON PO PRZERÓBCE** | Zamiast budynków stockowych: **patronat nad kompleksami startowymi** (7.3). Jest weryfikowalny i oparty na prawdziwym obiekcie RP-1 |
| **Grupa Wschodnia** — naukowcy-uciekinierzy | **KANON PO PRZERÓBCE** | Jako aktywo BAS i warunek dostępu do radzieckich liderów RP-1 (5.5). **Bez** darmowych punktów nauki i zwrotu pensji |
| **Rejestr Symulacji** z karą za rozbicie w symulacji (Twój pomysł) | **KANON PO PRZERÓBCE** | Rozdział 6.4 |
| **Mnożniki Resolve do ekonomii KSP** (koszt startu, tempo badań, reputacja, darmowe fundusze i kredyt) | **ODRZUCONE** | Dublują liderów RP-1, wymagają comiesięcznego ręcznego cheatowania i łamią Z1. Gabinet działa przez UD, KP, zegary i Rejestr |
| **Certyfikaty TECH, DIPLO i INTEL** | **ODRZUCONE** | Trzy nowe waluty łamią Z6. Ich funkcję przejmuje KP, a przy operacjach BAS — budżet. „Pasywna dywidenda” od lojalnej, wypoczętej kadry zostaje w formie +1 KP na kwartał, gdy Gabinet jest stabilny |
| **Pula 200 punktów Zero-Sum** | **KANON PO PRZERÓBCE** | Idea „wpływ jest względny” jest dobra, ale 200 punktów to zbyt drobna skala. **Opcja:** Wpływ frakcji w GDD (1–5) sumuje się zawsze do 18. Zysk jednej frakcji to strata innej, z zachowaniem prostoty |
| **Miesięczny tik** | **ODRZUCONE na rzecz kwartału** | Kwartał zostaje (GDD 9). Miesięczne są dziennik kariery i formularz po locie, ale decyzje zapadają co kwartał |
| **Stres i lojalność jako jedna sprzężona para** | **KANON PO PRZERÓBCE** | GDD ma już Lojalność i zegar Zmęczenia. Sprzężenie (spadek stresu podnosi lojalność) przyjmuję jako regułę, bez dodatkowej liczby |

### 7.3. Nowa mechanika z połączenia obu notatek: patronat nad kompleksami startowymi

W RP-1 **kompleks startowy** to prawdziwy obiekt z udźwigiem, typem, przystosowaniem do lotów załogowych, własnymi inżynierami i wydajnością. Dziennik kariery zapisuje, z którego kompleksu wystartował każdy pojazd. Daje to idealny, weryfikowalny „teren” dla frakcji:

- Każdy kompleks ma w meta-grze **patrona**: DPO, RN, BLZ albo „wspólny”. Patrona ustala Anderson przy budowie albo wymusza go zdarzenie.
- Start ładunku frakcji A z kompleksu frakcji B wymaga zgody patrona (akcja Spotkanie albo koszt KP), w przeciwnym razie Cierpliwość patrona +1.
- **Kompleks przystosowany do lotów załogowych** jest z definicji terenem BLZ. Postawienie tam ładunku DPO to spór o bezpieczeństwo.
- **Eksmisja** z Warstwy Personelu zmienia się w zdarzenie: frakcja w Ofensywie żąda przejęcia patronatu nad kompleksem. Ustąpienie zmienia patrona; odmowa oznacza Opór.
- Weryfikacja: identyfikator kompleksu przy starcie plus prefiks w nazwie pojazdu.

To kilka prostych reguł, zero nowych wskaźników, a infrastruktura RP-1, którą i tak budujesz, staje się polityczną mapą organizacji.

### 7.4. Symulacje — kompromis zamiast kary

Twój argument jest słuszny: symulacje w RP-1 są darmowe, więc pozwalają na wszystko, łącznie z lotem nad ZSRR. Kara za każde rozbicie w symulacji ukarałaby jednak zachowanie, które RP-1 słusznie nagradza: testowanie przed budową. Proponuję rozwiązanie z ducha epoki:

- **Czas maszynowy jest rzadki.** W latach 50. godzina pracy maszyny liczącej czy tunelu aerodynamicznego była drogim i reglamentowanym zasobem.
- Co kwartał masz **przydział symulacji**, np. 6 symulacji pełnego lotu. Przydział zależy od Nastawienia RN (laboratoria obliczeniowe) i DOI (tunele i stanowiska).
- Każda symulacja ponad przydział to drobna Korekta Budżetowa („wynajem czasu maszynowego od przemysłu”). Przy Nastawieniu RN ≤ −2 przydział spada, bo „naukowcy nie mają czasu na Wasze obliczenia”.
- **Rozbicie w symulacji nic nie kosztuje**, bo po to jest symulacja.
- **Symulacje nie dają wiedzy wywiadowczej.** Symulowany przelot nad ZSRR nie przynosi żadnych Ocen, bo w lore to tylko obliczenia.

Weryfikacja jest deklaratywna (poziom D), ale stawka jest niska, więc zgodnie z GDD 11.2 jest to akceptowalne.

---

## 8. Kolizje nazw i anachronizmy

### 8.1. Kolizje nazw

| Kolizja | Problem | Propozycja |
|---|---|---|
| **Anderson** | Eugene Anderson (gracz), senator Clinton P. Anderson (prawdziwy, w Biblii), pilot John Anderson, firma Anderson-Lewis Aeronautics | Zmienić nazwisko pilota i nazwę firmy. Senator zostaje, a gra może się tym bawić („żadnego pokrewieństwa, panie senatorze”) |
| **Carter** | dr Evelyn Carter i David Carter — dwoje lekarzy w jednym korpusie | Połączyć w jedną postać albo zmienić jedno nazwisko |
| **Falk / Falkenberg** | Ingrid Falk i Klaus-Dieter Falkenberg — zbyt podobne | Zmienić jedno |
| **ARDC** | Prawdziwe *Air Research and Development Command* USAF (od 1950) | CARC (4.3) |
| **SAC** | W Warstwie Personelu „Rada Naczelna (SAC)”, w Biblii Strategic Air Command | Rada Atlantycka; SAC zostaje dla lotnictwa strategicznego |
| **EXCOMM-A** | Nazwa z 1962 roku | Komitet Nadzorczy |
| **Fairchild-Rosen** | Prawdziwy Fairchild oraz Milton Rosen, lider w RP-1 | Np. „Fairmont-Ross Engineering” |
| **Bell & Ross** | Prawdziwa marka zegarków | Np. „Bellamy & Ross” |
| **Republic Dynamics** | Obok prawdziwego Republic Aviation, wymienionego w tej samej Biblii | Np. „Commonwealth Dynamics” albo „Federal Dynamics” |
| **Kagamine (X-6 Lin i X-7 Ren)** | Nawiązanie do postaci z oprogramowania wokalnego, chronionych znakiem towarowym | Nazwy własne w duchu Słownika kryptonimów |
| **PACE** | W Biblii obok NA-AXO, bez wyjaśnienia | Pytanie do Ciebie (rozdział 10) |

### 8.2. Anachronizmy w życiorysach i opisach

Rozstrzygnięcie dla każdego przypadku: albo postać dołącza później, albo zmieniamy jej przeszłość.

| Element | Data rzeczywista | Problem w 1951 roku | Rozwiązanie |
|---|---|---|---|
| Kessler — „pilot F-4 Phantom II” | oblot 1958 | Nie istnieje | F9F Panther albo F2H Banshee; albo Kessler dołącza w 1960 |
| Hartwell — „pilot English Electric Lightning” | oblot 1954, w służbie od 1959 | Nie istnieje | Gloster Meteor; albo dołącza w 1960 |
| Falk — „as Saab”, Draken | oblot 1955 | Draken nie istnieje | Saab 29 Tunnan (1948) |
| „Lockheed U-2R” | U-2 oblot 1955, wersja R 1967 | Nie istnieje | U-2A od 1956 |
| de Gaulle jako aktor lat 50. | prezydent od 1959 | IV Republika, rządy zmieniają się co kilka miesięcy | De Gaulle od Epoki II; wcześniej zmienność francuskich rządów jako mechanika (żądania Paryża zmieniają się z każdym gabinetem) |
| Gubernator Pat Brown | gubernator od 1959 | W 1951 roku prokurator generalny Kalifornii | Od Epoki II |
| Eden i Macmillan | premierzy 1955–57 i 1957–63 | W 1951 roku premierem zostaje Churchill | Churchill w Epoce I |
| Kourou, Andøya | 1968, 1962 | Nie istnieją | Rozdział 4.6 |
| NASA, NRO, DARPA | 1958, 1961, 1972 | Nie istnieją | Rozdział 4.5 |
| X-15, Mirage III, Boeing 707, CF-105 Arrow | 1959, 1956, 1957, 1958 | Późniejsze | Wszystkie dobre jako materiał dla Epoki II |

---

## 9. Zmiany do GDD (wersja 1.1)

### 9.1. Nowa zasada projektowa

**Z11. Obrona zachowuje status quo.** Akcja, która odpiera atak frakcji lub aktora zewnętrznego, nie przesuwa równowagi sił. Nagrodą za skuteczną obronę jest to, że nic się nie zmieniło, plus ewentualnie Hak albo KP. Kara dla atakującego wymaga osobnej, świadomej decyzji Andersona (typ Siła lub Ujawnienie) i ma swój koszt.

Zasada pochodzi z Twojej analizy puczu USAF w Warstwie Personelu i chroni przed „spiralą śmierci” automatycznych kar.

### 9.2. Lista zmian

| Rozdział GDD | Zmiana |
|---|---|
| Nagłówek, 4.1 | Rozwinięcie NA-AXO zgodne z epoką; chronologia z rozdziału 4.3 tego dokumentu |
| 4.3 | Miejsca startowe z rozdziału 4.6, po weryfikacji |
| 7.2 | DPO dostaje trzy Służby jako podfrakcje (pole „Służba dominująca”) |
| 7.6 | Kanoniczne koncerny z rozdziału 5.4; kontrakty PRZ = Main Contractor i Subcontractors w RP-1 |
| 7.8 | Członkowie z rozdziału 4.4; weto założycieli w sprawach wspólnego finansowania |
| 8.3 | Mapowanie Gabinetu na liderów RP-1 (5.5); zakaz procentowych premii meta-gry do ekonomii KSP |
| 8.4 | Wtyczka i Odwrócony; ukryte cechy; akcja „Odcięcie dostępu” |
| 10.2 | Nowe akcje: „Odroczenie”, „Odcięcie dostępu”; rozszerzone wyniki „Śledztwa wewnętrznego” |
| 12.4 | Modyfikator Paranoja Systemu |
| 15.5–15.6 | Doktryna Masy jako parametr; kalibracja tempa ZSRR po 8 kwartałach (2.5) |
| 16.5 | Jedno aktywne Zlecenie BAS; sabotaż z limitem |
| 18 | Dziennik kariery RP-1 jako główny kanał odczytu; formularz po każdym locie |
| 19.2 | Biała lista z rozdziału 3.2; Rejestr Korekt; pierwszeństwo dźwigni natywnych |
| 20 | Patronat nad kompleksami startowymi (7.3); Teczka Pojazdu (7.1); przydział symulacji (7.4) |
| 21.1 | Mnożnik złożoności misji M = 1–6 |
| 27 | Poprawki z rozdziału 6.5; Biblia kompaktowa i wpisy z tagami |
| 29 | Zasady tonu z rozdziału 5.6 |
| 34.3 | Zamknięte: wersja RP-1, biała lista, nazwa, start od 1951 roku, model AI |

---

## 10. Pytania do Ciebie

Odpowiedzi na nie zmieniają konkretne rozdziały, więc pytam tylko o to, czego nie da się rozstrzygnąć bez Ciebie.

1. **Czy masz trwającą karierę na RP-1 3.21, którą chcesz zachować?** Jeśli tak, faza 0 może rozegrać się na niej, a kampanię właściwą zaczniesz na 4.7. Jeśli nie, od razu przechodzimy na 4.7.
2. **Na jakim poziomie trudności RP-1 chcesz grać kampanię meta-gry?** Od tego zależy tabela kalibracji ZSRR (2.5). Twój poradnik używa poziomu łatwego.
3. **Czy w Twojej instalacji da się mieć kompleksy startowe w kilku odległych miejscach naraz** (np. przylądek i Vandenberg), czy tylko na platformach wokół jednego KSC? Od tego zależy rozdział 4.6.
4. **Czy gra kiedykolwiek ma wyjść poza Twój komputer** (publikacja, nagrania, udostępnienie)? Jeśli tak, model trzech pierścieni jest konieczny. Jeśli nie, możesz świadomie poluzować pierścień zewnętrzny.
5. **Co oznacza „PACE”** obok NA-AXO w Biblii i czym jest „Intermarium History” w stopce Warstwy Personelu? Czy to marka całego projektu?

---

## Źródła

- [Repozytorium RP-1 (KSP-RO/RP-1)](https://github.com/KSP-RO/rp-1) — tagi wydań, dziennik zmian (`GameData/RP-1/changelog.cfg`), kod modułów `CareerLog`, `Confidence`, `UnlockCreditHandler`, `SpaceCenterManagement`, `LaunchComplex`
- [Repozytorium Real Solar System (KSP-RO/RealSolarSystem)](https://github.com/KSP-RO/RealSolarSystem) — lista miejsc startowych (`Localization/LaunchSites/en-us.cfg`)
- [Wiki RP-1](https://github.com/KSP-RO/RP-1/wiki) i [Early Career Tutorial](https://github.com/KSP-RO/RP-1/wiki/Early-Career-Tutorial)
- [Etymonline — „aerospace”](https://www.etymonline.com/fr/word/aerospace) oraz [Wikipedia — Aerospace engineering](https://en.wikipedia.org/wiki/Aerospace_engineering) — data pojawienia się słowa (1958)
- [eesel.ai — cennik Claude Sonnet 5.5 i Opus 5.5 (wrzesień 2026)](https://www.eesel.ai/blog/claude-sonnet-5-5-pricing) — źródło zewnętrzne, do potwierdzenia w oficjalnym cenniku
- [Morph — cennik Gemini API (sierpień 2026)](https://www.morphllm.com/gemini-api-pricing) — źródło zewnętrzne, do potwierdzenia w oficjalnym cenniku
- Materiały własne: Poradnik RO & RP-1 v0.2, mapa zmiennych RP-1, „Część II — Biblia świata”, „Warstwa Personelu”
