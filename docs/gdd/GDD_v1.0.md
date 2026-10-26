# THE DEEP STATE ENGINE

## Dokument Projektowy Gry (Game Design Document) — wersja 1.0

| | |
|---|---|
| **Gatunek** | Strategiczno-zarządcza meta-gra narracyjna; warstwa nadrzędna dla Kerbal Space Program z modyfikacją RP-1 |
| **Platforma** | PC — lokalna aplikacja współpracująca z KSP 1.12.x + Realism Overhaul + RP-1 |
| **Tryb** | Jednoosobowy, kampania 1951–1975 (opcjonalne przedłużenie do 1980) |
| **Rola gracza** | Eugene Anderson, Dowódca Operacyjny NA-AXO |
| **Status** | Projekt kompletny, przed prototypem |
| **Klauzula liczbowa** | Wszystkie wartości liczbowe w dokumencie są wartościami startowymi do strojenia w playtestach. Struktura systemów jest wiążąca, liczby nie. |

### Jak czytać ten dokument

Dokument jest podzielony na osiem części. **Część I** opisuje wizję i zasady, które mają pierwszeństwo przed każdym szczegółem: jeśli jakakolwiek mechanika opisana dalej kłóci się z zasadami z rozdziału 2, wygrywają zasady. **Części II–IV** opisują systemy rozgrywki. **Część V** opisuje styk z KSP RP-1, czyli fundament, bez którego projekt traci sens. **Część VI** obejmuje zdarzenia, kryzysy i zakończenia. **Część VII** to kontrakt dla sztucznej inteligencji pełniącej rolę Mistrza Gry. **Część VIII** zawiera interfejs, balans, przykładową turę, architekturę techniczną i plan produkcji. Aneksy zbierają słownik, tabelę zmiennych i listę kamieni milowych.

Fragmenty oznaczone **[DO WERYFIKACJI]** dotyczą zachowania RP-1, które trzeba potwierdzić na konkretnej wersji modyfikacji przed implementacją.

### Spis treści

- **Część I — Wizja**
  1. Wizja i fantazja gracza
  2. Zasady projektowe
  3. Architektura doświadczenia
  4. Świat gry
- **Część II — Gracz i organizacja**
  5. Eugene Anderson
  6. Wskaźniki i zasoby
  7. Frakcje
  8. Kadra i postaci
- **Część III — Pętla i systemy rdzenia**
  9. Pętla rozgrywki
  10. Biurko Andersona
  11. Dyrektywy
  12. Rejestr Następstw
  13. Zegary
- **Część IV — Wyścig, przeciwnik, wywiad**
  14. Bilans Wyścigu
  15. Model ZSRR
  16. Wywiad i mgła wojny
  17. Napięcie geopolityczne
- **Część V — Integracja z KSP RP-1**
  18. Kanał odczytu
  19. Kanał zapisu i tryby integracji
  20. Mapowanie systemów RP-1
  21. Wypadki i śledztwa
  22. Zasady uczciwości
- **Część VI — Zdarzenia, kryzysy, zakończenia**
  23. Architektura zdarzeń i decyzji
  24. Kryzysy
  25. Zakończenia i Ocena Historyczna
- **Część VII — AI jako Mistrz Gry**
  26. Rola AI
  27. Kontrakt AI
  28. Pamięć i ciągłość
  29. Głos, ton i formaty dokumentów
- **Część VIII — Prezentacja, balans, produkcja**
  30. Interfejs
  31. Balans i krzywa trudności
  32. Przykładowa tura
  33. Architektura techniczna
  34. Plan produkcji i ryzyka
- **Aneksy**: A — Słownik, B — Tabela zmiennych, C — Kamienie milowe, D — Wzorce zdarzeń

---

# CZĘŚĆ I — WIZJA

## 1. Wizja i fantazja gracza

### 1.1. High concept

> **Masz wygrać wyścig kosmiczny organizacją, która walczy sama ze sobą.**

The Deep State Engine to gra o człowieku, który stoi między rakietą a gabinetem. W hangarze, czyli w KSP RP-1, gracz projektuje pojazdy, prowadzi badania i wykonuje loty z pełnym ciężarem prawdziwej inżynierii. Na biurku, czyli w meta-grze, ten sam gracz jest Eugene'em Andersonem: dowódcą, który musi wytłumaczyć każdy dolar, uspokoić każdego generała, przekonać każdego senatora i zdecydować, co powiedzieć prasie, kiedy coś wybuchnie na wyrzutni.

### 1.2. Fantazja gracza

Gracz ma poczuć się jak człowiek, który:

- **wie więcej niż inni w budynku, ale mniej, niż potrzebuje** — ma raporty ze wszystkich działów, ale żaden z nich nie jest pełny i nie każdy jest szczery;
- **ma władzę, która kosztuje** — może przeforsować prawie wszystko, ale każde przeforsowanie zużywa zaufanie, które będzie potrzebne później;
- **odpowiada za ludzi** — za astronautów, których wysyła, za inżynierów, których obciąża, i za współpracowników, których kariery zależą od jego decyzji;
- **gra z przeciwnikiem, którego nie widzi** — ZSRR istnieje w grze jako system, nie jako scenariusz, i może zrobić coś, czego gracz się nie spodziewał.

### 1.3. Co wyróżnia projekt

1. **Prawdziwa inżynieria jako fundament.** Żadna inna gra polityczno-zarządcza nie ma pod sobą symulacji technicznej o skali RP-1. Każda decyzja polityczna ma koszt mierzony w realnych tygodniach budowy, realnych tonach paliwa i realnym ryzyku awarii silnika.
2. **Instytucja jako drugi przeciwnik.** ZSRR jest przeciwnikiem zewnętrznym, ale najczęstszą przyczyną porażki jest własna organizacja: wyczerpane zaufanie, rozbite frakcje, ujawnione tajemnice.
3. **Mgła wojny po obu stronach.** Gracz nie zna stanu radzieckiego programu, a frakcje nie znają wszystkich decyzji gracza. Informacja jest zasobem.
4. **Pamięć organizacji.** Długi, tajemnice, urazy i obietnice są jawnymi obiektami gry, które wracają w kryzysach. Organizacja nie zapomina, nawet jeśli gracz zapomniał.
5. **AI jako narrator, nie jako sędzia.** Model językowy nadaje światu głos — memoranda, depesze, stenogramy z przesłuchań — ale nie rozstrzyga faktów. Fakty należą do silnika.

### 1.4. Inspiracje

Projekt świadomie zapożycza rozwiązania z różnych gatunków. Tabela określa, co bierzemy i czego nie bierzemy.

| Źródło | Co bierzemy | Czego nie bierzemy |
|---|---|---|
| *Crusader Kings III* | Postaci z cechami, ambicjami i sekretami; „haki” jako waluta nacisku; intrygi | Skali setek postaci, dynastii, wojny jako głównej pętli |
| *Suzerain* | Decyzje tekstowe osadzone w instytucjach; konsekwencje odroczone; dokumenty jako interfejs | Liniowej fabuły i jednego, autorskiego przebiegu |
| *Twilight Struggle* | Zimnowojenny poziom napięcia; tor wyścigu kosmicznego; przeciwnik, który zmienia pole gry | Kart jako jedynego silnika zdarzeń |
| *Blades in the Dark* | Zegary postępu; gra frakcji, która toczy się poza wzrokiem gracza | Rzutów kośćmi jako głównego rozstrzygnięcia |
| *Buzz Aldrin's Race Into Space*, *Mars Horizon* | Kamienie milowe, prestiż za pierwszeństwo, rywal z własnym programem | Uproszczonej warstwy technicznej — tę dostarcza RP-1 |
| *Frostpunk* | Decyzje z ceną moralną; presja, która rośnie szybciej niż zasoby | Survivalu i zarządzania miastem |
| *XCOM: Enemy Unknown* | Rada finansująca, która cofa poparcie po porażkach | Taktyki turowej |
| *Papers, Please* | Biurokratyczny, diegetyczny interfejs; ciężar rutyny | Mechanik zręcznościowych |
| *Football Manager* | Zarządzanie kadrą przez rozmowy, morale i oczekiwania | Szczegółowych statystyk setek pracowników |
| Gry fabularne z Mistrzem Gry (np. „fronty” z *Dungeon World*) | Struktura zagrożeń, które rozwijają się, jeśli gracz ich nie powstrzyma | Swobodnej improwizacji bez reguł |

## 2. Zasady projektowe

Zasady projektowe są nadrzędne wobec wszystkich mechanik. Każda propozycja nowego elementu musi przejść przez te zasady przed dopisaniem jej do dokumentu.

**Z1. Każda decyzja kosztuje.** W grze nie ma opcji darmowych. Jeśli jakaś opcja dialogowa lub akcja nie ma kosztu — w pieniądzach, zaufaniu, czasie, ryzyku lub relacjach — jest błędem projektowym. Koszt może być ukryty lub odroczony, ale musi istnieć.

**Z2. Test trzech dróg.** Każda zmienna, frakcja, postać i mechanika musi spełnić co najmniej jeden warunek:
- **czyta coś z KSP** (reaguje na stan programu technicznego),
- **zmienia coś w KSP** (wpływa na budżet, dostęp, terminy lub cele misji),
- **wpływa na warunek zakończenia** (przybliża lub oddala porażkę albo zwycięstwo).

Element, który nie spełnia żadnego warunku, jest dekoracją i zostaje usunięty.

**Z3. Liczby należą do silnika, słowa do AI.** Każda wartość, która ma znaczenie mechaniczne, jest liczona przez program. AI może interpretować, dramatyzować i proponować, ale nie może zmienić żadnej wartości ani ustalić faktu, którego silnik nie ustalił.

**Z4. Gracz wie mniej niż świat.** Gra przechowuje dwa stany: stan faktyczny i stan wiedzy Andersona. Interfejs i narracja pokazują wyłącznie ten drugi. Ukrywanie zapewnia architektura danych, nie instrukcja dla modelu.

**Z5. Organizacja pamięta — jawnie.** Każda trwała konsekwencja zostaje zapisana jako obiekt w Rejestrze Następstw. Nie polegamy na pamięci modelu językowego.

**Z6. Mniej wskaźników, więcej znaczenia.** Główny ekran pokazuje najwyżej pięć wskaźników strategicznych. Każdy nowy wskaźnik musi zastąpić istniejący albo udowodnić, że niesie informację niedostępną w żadnym innym.

**Z7. Żadna frakcja nie jest zła.** Każda frakcja ma racjonalne cele i w pewnych sytuacjach ma rację. Gracz, który zawsze ignoruje jedną frakcję, powinien ponieść tego wyraźne konsekwencje.

**Z8. Historia jest kotwicą, nie scenariuszem.** Realia epoki wyznaczają tempo, ograniczenia i rodzaj zagrożeń. Konkretne wydarzenia mogą potoczyć się inaczej — zarówno po stronie gracza, jak i ZSRR.

**Z9. Szacunek dla czasu gracza.** Faza meta-gry jednego kwartału nie powinna przekraczać 20 minut w typowej turze i 40 minut w turze kryzysowej. KSP pozostaje główną aktywnością; meta-gra nadaje jej sens, ale jej nie zastępuje.

**Z10. Porażka jest opowieścią.** Nieudana misja, odwołanie z funkcji czy rozpad organizacji mają generować ciekawe sytuacje, nie tylko ekran końcowy. Gra nagradza przetrwanie kryzysu bardziej niż jego uniknięcie.

## 3. Architektura doświadczenia

### 3.1. Trzy warstwy

| Warstwa | Narzędzie | Pytanie, na które odpowiada | Przykład |
|---|---|---|---|
| **Operacyjna** | KSP RP-1 | *Co rzeczywiście się stało?* | Rakieta z silnikiem z rodziny LR-79 wyniosła satelitę na orbitę 220 × 1400 km |
| **Strategiczna** | Silnik meta-gry (program) | *Co to oznacza w liczbach?* | Kamień milowy „Pierwszy satelita naukowy” zaliczony jako drugi; Rada Naukowa +1; zegar cierpliwości Dyrektoriatu Obronnego −1 segment |
| **Narracyjna** | AI — Mistrz Gry | *Jak reaguje świat?* | Memorandum dyrektora Rady Naukowej, wycinek z prasy, depesza wywiadowcza o reakcji Moskwy |

### 3.2. Źródła prawdy

Każdy rodzaj danych ma dokładnie jedno źródło prawdy. Konflikt między źródłami rozstrzyga się zawsze na korzyść źródła wskazanego w tabeli.

| Dane | Źródło prawdy | Kto czyta | Kto modyfikuje |
|---|---|---|---|
| Stan techniczny: technologie, pojazdy, budowy, fundusze bieżące | Plik zapisu KSP | Silnik | Gracz w KSP; silnik przez Korekty (tryb Zapisu) |
| Wyniki misji | Plik zapisu KSP + Raport Misji | Silnik | Gracz |
| Wskaźniki strategiczne, frakcje, postaci | Baza stanu meta-gry | Silnik, AI (widoczna część) | Wyłącznie silnik |
| Stan ZSRR | Baza stanu — warstwa faktyczna | Wyłącznie silnik | Wyłącznie silnik |
| Wiedza Andersona o ZSRR i frakcjach | Baza stanu — warstwa wiedzy | Silnik, AI, interfejs | Silnik |
| Rejestr Następstw | Baza stanu | Silnik, AI (widoczna część) | Silnik (AI może proponować wpisy) |
| Treść dokumentów narracyjnych | Archiwum | Gracz, AI | AI (raz wygenerowany dokument jest niezmienny) |

### 3.3. Pętla nadrzędna

```
 ┌────────────────────────────────────────────────────────────────┐
 │                         KWARTAŁ                                │
 │                                                                │
 │  [1] ODPRAWA ──► [2] BIURKO ──► [3] HANGAR (KSP) ──► [4] ROZLICZENIE
 │   raporty,        decyzje,        loty, budowy,        import zapisu,
 │   wywiad,         akcje,          badania              weryfikacja,
 │   żądania         budżet                               ruch ZSRR
 │      ▲                                                     │
 │      │                                                     ▼
 │      └────────────── [5] NASTĘPSTWA ◄──────────────────────┘
 │                     zdarzenia, kryzysy, narracja AI,
 │                     wpisy do Rejestru
 └────────────────────────────────────────────────────────────────┘
```

Najważniejsza właściwość pętli: **wynik fazy 3 zmienia treść fazy 1 następnego kwartału, a decyzje fazy 2 zmieniają warunki fazy 3.** Jeśli którekolwiek z tych połączeń jest słabe, gra rozpada się na dwie niezależne aktywności.

### 3.4. Rozkład czasu sesji

Typowa sesja trwa 2–3 godziny i obejmuje 1–2 kwartały. Kwartał to orientacyjnie 45–120 minut w KSP i 15–20 minut w meta-grze. W latach intensywnego wyścigu (1961–1969) kwartały w KSP są dłuższe, więc gra przewiduje możliwość grania „półkwartałami” w sytuacjach, gdy gracz chce zaraportować kluczową misję od razu (szczegóły w rozdziale 9.4).

## 4. Świat gry

### 4.1. Punkt rozbieżności

W alternatywnej historii gry radziecki test rakiety dalekiego zasięgu z 1950 roku zostaje wykryty i nagłośniony wcześniej, niż w rzeczywistości. Pod wpływem paniki Waszyngton i sojusznicy atlantyccy podpisują w 1951 roku traktat powołujący **NA-AXO** (robocze rozwinięcie: *North Atlantic Astronautics and eXploration Organization*). Formalnie to wspólne przedsięwzięcie państw atlantyckich. W praktyce około 85% budżetu, większość infrastruktury i niemal cały przemysł pochodzą ze Stanów Zjednoczonych.

Rok 1951 jest jednocześnie rokiem startu kariery w RP-1, co pozwala zsynchronizować oba kalendarze bez sztuczności.

Fizyka, technologia i realia polityczne pozostają realistyczne. Gra nie wprowadza fikcyjnych technologii. Rozbieżność dotyczy instytucji, nie praw natury.

### 4.2. Natura NA-AXO

NA-AXO ma trzy twarze i każda z nich jest prawdziwa:

- **Twarz publiczna** — organizacja pokojowej eksploracji, nauki i współpracy wolnego świata. Tak opisuje ją prasa, tak przedstawiają ją rządy sojusznicze.
- **Twarz instytucjonalna** — konglomerat rywalizujących dyrektoriatów, z których każdy ma własny budżet, kulturę i patronów w Waszyngtonie.
- **Twarz ukryta** — przykrywka dla programów wojskowych i wywiadowczych, których istnienie zna kilkanaście osób, w tym Anderson.

Napięcie między tymi trzema twarzami jest źródłem większości kryzysów. Każdy satelita rozpoznawczy wystrzelony pod przykrywką „misji naukowej” wzmacnia twarz ukrytą i jednocześnie zagraża twarzy publicznej.

### 4.3. Geografia instytucjonalna

| Miejsce | Funkcja w grze |
|---|---|
| **Waszyngton** | Biały Dom, Kongres, Pentagon, Departament Stanu. Źródło budżetu i zaufania. |
| **Kwatera Główna NA-AXO** | Siedziba Andersona i dyrektoriatów. Miejsce Biurka. |
| **Główny ośrodek startowy** | Odpowiada bazie startowej w KSP. Miejsce inspekcji, wypadków i wizyt polityków. |
| **Zakłady przemysłowe** | Kalifornia, Środkowy Zachód, Wschodnie Wybrzeże. Źródło kontraktów, miejsc pracy i lobbingu. |
| **Stolice sojusznicze** | Londyn, Paryż, Bonn, Rzym, Ottawa, Canberra. Źródło dodatkowych funduszy i legitymacji. |
| **Moskwa i radzieckie biura konstrukcyjne** | Widoczne wyłącznie przez wywiad. |

### 4.4. Epoki kampanii

Kampania dzieli się na cztery epoki. Każda epoka zmienia dominującą presję, dostępne zdarzenia i nastawienie Waszyngtonu.

**Epoka I — Fundament (1951–1957).** Program jest mały, budżet skromny, a uwaga polityków skupiona gdzie indziej. Dominuje presja wojskowa: rakiety mają być przede wszystkim środkiem przenoszenia. Rada Naukowa walczy o to, by sondy i satelity naukowe w ogóle znalazły się w planach. Typowe kryzysy: spory o kontrolę nad rakietami, przecieki o kosztach, konflikty kompetencyjne. Gracz buduje organizację i fundamenty techniczne. To epoka, w której łatwo zaciągnąć długi, które wrócą później.

**Epoka II — Szok (1957–1961).** Pierwszy radziecki sukces orbitalny — kiedykolwiek nastąpi — zmienia wszystko. Budżet gwałtownie rośnie, ale razem z nim rosną oczekiwania i kontrola. Waszyngton chce odpowiedzi, natychmiast. Pojawiają się pierwsze programy załogowe i pierwsze ofiary pośpiechu. Typowe kryzysy: panika polityczna, nieudane starty pokazywane w telewizji, walka o to, kto kieruje programem załogowym.

**Epoka III — Wyścig (1961–1969).** Program osiąga największą skalę. Pieniędzy jest najwięcej, ale ich podział staje się polem bitwy. Program załogowy dominuje wizerunkowo, wojsko i wywiad prowadzą równoległe, ukryte programy, a Rada Naukowa traci wpływy. Typowe kryzysy: śmierć załogi, przesłuchania w Kongresie, konflikt z przemysłem o przekroczenia kosztów, zmiana strategii ZSRR.

**Epoka IV — Następstwa (1969–1975).** Po osiągnięciu (albo utracie) głównego celu wyścigu Waszyngton traci zainteresowanie. Budżet spada, frakcje walczą o resztki, a tajemnice z poprzednich epok zaczynają wychodzić na jaw. To epoka rozliczeń. Gracz musi zdecydować, jakie dziedzictwo zostawi: stacje orbitalne, program naukowy czy militaryzację orbity.

Granice epok są ruchome. Epoka II zaczyna się w kwartale pierwszego orbitalnego sukcesu którejkolwiek strony, nie w ustalonym roku. Epoka IV zaczyna się po rozstrzygnięciu kamienia milowego „Człowiek na Księżycu” albo najpóźniej w 1972 roku.

### 4.5. Ton świata

Świat gry jest szary, rzeczowy i ludzki. Nie ma w nim złoczyńców, są ludzie z konfliktowymi obowiązkami. Język świata to język memorandów, odpraw, depesz i przesłuchań. Humor istnieje, ale jest suchy i biurokratyczny. Tragedia istnieje i nie jest łagodzona. Gra nie moralizuje: przedstawia koszt decyzji i pozwala graczowi samemu go ocenić.

---

# CZĘŚĆ II — GRACZ I ORGANIZACJA

## 5. Eugene Anderson

### 5.1. Postać

Eugene Anderson ma 41 lat w chwili rozpoczęcia kampanii. Jest byłym oficerem inżynierii lotniczej z doświadczeniem w zarządzaniu dużymi projektami produkcyjnymi w czasie wojny, a potem w Pentagonie. Nie jest gwiazdą ani wizjonerem. Został wybrany na Dowódcę Operacyjnego, bo każda z rywalizujących grup uznała go za mniej groźnego niż kandydaci pozostałych.

Ten punkt wyjścia jest ważny mechanicznie: Anderson zaczyna z neutralnymi relacjami ze wszystkimi frakcjami i bez własnego zaplecza. Wszystko, co zbuduje, zbuduje sam.

Gra nie narzuca Andersonowi osobowości. Jego charakter wyłania się z decyzji gracza i jest śledzony przez system **Reputacji Stylu** (5.3).

### 5.2. Uprawnienia i ograniczenia

| Anderson może | Anderson nie może |
|---|---|
| Rozdzielać budżet NA-AXO między dyrektoriaty | Zwiększyć budżetu bez zgody Waszyngtonu |
| Mianować i odwoływać osoby na stanowiskach w Gabinecie | Odwołać dyrektora frakcji bez kosztu politycznego i zgody Rady Nadzorczej przy wysokim Wpływie frakcji |
| Akceptować lub odrzucać Dyrektywy frakcji | Odrzucać Dyrektyw Waszyngtonu bez utraty Zaufania |
| Decydować o treści komunikatów publicznych | Kontrolować tego, co ujawnią inni |
| Zlecać operacje wywiadowcze przez BAS | Bezpośrednio kierować operacjami wywiadu |
| Ustalać harmonogram i priorytety misji | Uniknąć konsekwencji nieudanych misji |

### 5.3. Reputacja Stylu

Anderson nie ma statystyk w stylu RPG. Zamiast tego gra śledzi cztery osie reputacji, które przesuwają się w zależności od typu podejmowanych decyzji. Każda decyzja w grze ma przypisany typ (rozdział 23.3), a typ przesuwa odpowiednie osie.

| Oś | Biegun A | Biegun B | Na co wpływa |
|---|---|---|---|
| **Ryzyko** | Ostrożny | Hazardzista | Reakcje Biura Lotów Załogowych i Waszyngtonu; skłonność frakcji do przedstawiania śmiałych planów |
| **Jawność** | Otwarty | Skryty | Zaufanie prasy; łatwość ukrywania tajemnic; reakcje Rady Naukowej i BAS |
| **Lojalność** | Opiekun | Bezwzględny | Lojalność kadry; skłonność postaci do przyjmowania winy lub zrzucania jej na innych |
| **Orientacja** | Technokrata | Polityk | Skuteczność akcji w Waszyngtonie vs skuteczność akcji wewnątrz organizacji |

Każda oś ma skalę od −10 do +10. Po przekroczeniu progu ±5 Anderson zyskuje **Opinię** — etykietę, którą postaci i frakcje znają i na którą reagują. Przykład: Anderson z Opinią „Hazardzista” otrzymuje od frakcji śmielsze propozycje misji, ale Korpus Astronautów częściej żąda dodatkowych gwarancji bezpieczeństwa, a Komisja Środków bardziej surowo ocenia każdą porażkę.

Opinie nie są dobre ani złe. Każda otwiera jedne możliwości i zamyka inne.

## 6. Wskaźniki i zasoby

### 6.1. Przegląd

Zgodnie z zasadą Z6 gra ma pięć wskaźników strategicznych i dwie waluty działania. Wszystkie inne wartości są lokalne — należą do frakcji, postaci, zegarów lub Rejestru.

**Wskaźniki strategiczne (skala 0–100):**

| Skrót | Nazwa | Co mierzy | Skutek przy 0 |
|---|---|---|---|
| **ZW** | Zaufanie Waszyngtonu | Wiarę Białego Domu i Kongresu, że Anderson jest właściwym człowiekiem na właściwym miejscu | Odwołanie Andersona (koniec kampanii) |
| **SO** | Spójność Organizacji | Zdolność NA-AXO do działania jako jedna instytucja | Rozpad organizacji (zakończenie specjalne) |
| **PP** | Poparcie Publiczne | Nastawienie amerykańskiej opinii publicznej do programu | Brak bezpośredniego zakończenia; silny spadek ZW i budżetu |
| **WF** | Wiarygodność Fasady | Wiarę sojuszników i świata w międzynarodowy, pokojowy charakter NA-AXO | Wycofanie sojuszników; utrata ich funduszy i obiektów |
| **NG** | Napięcie Geopolityczne | Poziom zimnowojennego napięcia — skala odwrócona, 5 stopni (rozdział 17) | Stopień 1 = kryzys globalny |

**Waluty działania:**

| Skrót | Nazwa | Opis |
|---|---|---|
| **UD** | Uwaga Dowódcy | Punkty akcji na kwartał. Bazowo 6. Odnawiają się co kwartał, nie kumulują się. |
| **KP** | Kapitał Polityczny | Waluta perswazji i nacisku. Zdobywana za sukcesy, przysługi i dotrzymane obietnice; wydawana na przeforsowanie decyzji. Maksymalnie 20, kumuluje się. |

Dodatkowo istnieje **Bilans Wyścigu** (rozdział 14), który nie jest wskaźnikiem w skali 0–100, ale torem przewagi nad ZSRR.

### 6.2. Zależności między wskaźnikami

Wskaźniki nie są niezależne. Silnik co kwartał stosuje następujące przepływy:

- **PP → ZW.** Jeśli PP < 40, ZW traci 1 punkt za każde 5 punktów poniżej progu. Jeśli PP > 70, ZW zyskuje 1 punkt.
- **SO → efektywność.** Przy SO < 50 każda akcja Biurka wymagająca współpracy dwóch dyrektoriatów kosztuje +1 UD. Przy SO < 30 dyrektoriaty zaczynają samodzielnie podejmować działania sprzeczne z dyrektywami Andersona (zdarzenia z grupy „Samowola”).
- **WF → fundusze sojusznicze.** Wkład sojuszników do budżetu jest mnożony przez WF/100, zaokrąglone w dół do 10%.
- **NG → priorytety.** Każdy stopień napięcia powyżej bazowego (4) zwiększa Wpływ Dyrektoriatu Programów Obronnych o 1 i zmniejsza Wpływ Rady Naukowej o 1, dopóki napięcie nie opadnie.
- **Bilans Wyścigu → ZW i budżet.** Mechanika „Szoku” i „Samozadowolenia” — rozdział 31.3.

### 6.3. Budżet

Budżet jest jedynym zasobem, który istnieje w obu grach jednocześnie. Dlatego jego model jest szczególnie starannie zdefiniowany.

**Rok budżetowy.** Zgodnie z realiami epoki rok budżetowy rozpoczyna się 1 lipca. W kwartale poprzedzającym (II kwartał roku kalendarzowego) odbywa się **Sesja Budżetowa** — specjalna faza, w której Anderson broni budżetu przed Komisją Środków (rozdział 9.5).

**Składniki budżetu:**

1. **Przydział Kongresu** — główne źródło, ustalane rocznie w Sesji Budżetowej.
2. **Wkład sojuszniczy** — zależny od WF i od tego, czy sojusznicy otrzymują wymierne korzyści (miejsca dla astronautów, ładunki, kontrakty dla własnego przemysłu).
3. **Fundusze celowe** — pieniądze powiązane z konkretną Dyrektywą (np. Pentagon finansuje satelitę rozpoznawczego). Wygasają, jeśli Dyrektywa nie zostanie zrealizowana.
4. **Budżet czarny** — fundusze z programów niejawnych. Nie pojawiają się w raportach publicznych, ale każde ich użycie zwiększa Ciśnienie Ujawnienia powiązanej Tajemnicy.

**Relacja z funduszami RP-1.** RP-1 ma własny model finansowania oparty na programach i reputacji **[DO WERYFIKACJI: aktualny model w wersji docelowej]**. Meta-gra nie zastępuje tego modelu, tylko go obudowuje:

- przychody z programów RP-1 traktowane są jako „bazowy przepływ” Przydziału Kongresu;
- meta-gra nakłada na ten przepływ **Korekty Budżetowe** (dodatnie lub ujemne), wynikające z decyzji i wskaźników;
- w trybie integracji „Zapis” (rozdział 19) Korekty są fizycznie aplikowane do funduszy w pliku zapisu; w trybie „Honorowym” są wyświetlane graczowi jako zobowiązanie.

**Rozdział budżetu.** Anderson co kwartał dzieli dostępne środki na **Linie Budżetowe**, przypisane do dyrektoriatów. Linia Budżetowa nie jest wydawaniem pieniędzy w KSP — jest deklaracją priorytetów, którą frakcje widzą i na którą reagują. Gracz, który przydziela Radzie Naukowej 5% budżetu, a potem wydaje w KSP pieniądze na sondy naukowe, robi coś niespójnego, a silnik to wykrywa (rozdział 18.4: Analiza Spójności Wydatków).

## 7. Frakcje

### 7.1. Model frakcji

NA-AXO składa się z sześciu frakcji wewnętrznych. Każda frakcja ma następujące atrybuty:

| Atrybut | Skala | Opis |
|---|---|---|
| **Wpływ** | 1–5 | Siła frakcji w organizacji i w Waszyngtonie. Wpływ decyduje o tym, jak dotkliwe są jej naciski i jak trudno ją zignorować. |
| **Nastawienie** | −3 do +3 | Stosunek frakcji do Andersona. |
| **Agenda** | karta | Bieżący główny cel frakcji, zmieniający się co 4–8 kwartałów lub po zdarzeniach. |
| **Cierpliwość** | zegar 6-segmentowy | Odlicza, ile frakcja zniesie, zanim przejdzie do eskalacji. |
| **Dźwignie** | lista | Konkretne narzędzia, którymi frakcja może naciskać na Andersona. |
| **Dary** | lista | Co frakcja daje, gdy jest zadowolona. |

**Eskalacja frakcji.** Gdy zegar Cierpliwości się zapełni, frakcja przechodzi do kolejnego stopnia eskalacji:

1. **Napięcie** — oficjalne memorandum z żądaniem; frakcja przestaje oferować Dary.
2. **Opór** — frakcja używa jednej ze swoich Dźwigni.
3. **Ofensywa** — frakcja działa poza organizacją: przeciek do prasy, zawiadomienie Kongresu, interwencja patrona w Waszyngtonie.
4. **Bunt** — frakcja jawnie odmawia współpracy; SO spada o 10 i Anderson musi rozwiązać kryzys przed końcem następnego kwartału.

Zadowolenie frakcji (zrealizowane Dyrektywy, przydziały zgodne z Agendą, dotrzymane obietnice) cofa zegar Cierpliwości i podnosi Nastawienie.

### 7.2. Dyrektoriat Programów Obronnych (DPO)

**Kim są.** Oficerowie sił powietrznych i armii oddelegowani do NA-AXO, z zapleczem w Pentagonie. Kierowani przez **gen. Harlana Vossa** — weterana bombowców strategicznych, chłodnego, rzeczowego i lojalnego wobec instytucji bardziej niż wobec ludzi.

**Czego chcą.** Niezawodnych rakiet, satelitów rozpoznawczych, łączności wojskowej, systemów wczesnego ostrzegania i — przede wszystkim — tego, by żadna przewaga techniczna nie pozostała po stronie ZSRR.

**Jak mierzą sukces.** Niezawodność (liczba udanych startów z rzędu), terminowość, liczba satelitów o przeznaczeniu wojskowym na orbicie.

**Dźwignie:** wycofanie funduszy celowych; zwrócenie się do Pentagonu o przejęcie kontroli nad konkretnym programem; odmowa udostępnienia obiektów wojskowych; wpływ na poziom klauzul tajności.

**Dary:** fundusze celowe; dostęp do danych z testów rakiet wojskowych (bonus do niezawodności określonych rodzin silników); osłona polityczna przy porażkach o charakterze „obronnym”.

**Typowe Agendy:** „Satelita rozpoznawczy na orbicie polarnej”, „Seria startów bez awarii”, „Militarna stacja orbitalna”, „Odpowiedź na radziecki system antysatelitarny”.

**Wewnętrzny paradoks.** DPO jest najbardziej przewidywalną frakcją, ale też najbardziej niebezpieczną dla Fasady. Każdy jej sukces osłabia WF.

### 7.3. Biuro Analiz Specjalnych (BAS)

**Kim są.** Formalnie komórka analityczna NA-AXO, faktycznie łącznik z amerykańskim wywiadem. Kieruje nią **Dorothy Ames** — była analityczka kryptologiczna, inteligentna, cierpliwa i absolutnie nieskłonna do dzielenia się więcej, niż musi.

**Czego chcą.** Tajemnicy, kontroli nad informacją i dostępu do możliwości technicznych NA-AXO (satelity rozpoznawcze, nasłuch, telemetria).

**Jak mierzą sukces.** Brak przecieków, jakość wiedzy o ZSRR, kontrola nad tym, kto wie co.

**Dźwignie:** opóźnianie lub selekcjonowanie raportów wywiadowczych; wszczynanie postępowań sprawdzających wobec kadry; kontrola dostępu do Tajemnic — BAS może sama zwiększyć lub zmniejszyć Ciśnienie Ujawnienia.

**Dary:** lepsze raporty o ZSRR (wyższa wiarygodność, krótsze opóźnienia); możliwość „zamknięcia” przecieku; operacje dezinformacyjne.

**Typowe Agendy:** „Weryfikacja lojalności kadry”, „Zbudować sieć satelitów rozpoznawczych”, „Zatrzymać przeciek”, „Przejąć kontrolę nad telemetrią”.

**Wewnętrzny paradoks.** BAS jest jedynym oknem gracza na ZSRR, ale też jedyną frakcją, która może celowo wprowadzić Andersona w błąd. Niskie Nastawienie BAS oznacza, że raporty wywiadowcze stają się mniej wiarygodne — i gracz nie zawsze o tym wie.

### 7.4. Rada Naukowa (RN)

**Kim są.** Naukowcy z uniwersytetów i laboratoriów państwowych: fizycy, astronomowie, geofizycy, specjaliści od napędu. Przewodniczy im **dr Emil Brandt** — urodzony w Niemczech inżynier napędu, który trafił do USA po wojnie. Genialny, wymagający, pełen pasji i z przeszłością, o której nie lubi mówić.

**Czego chcą.** Czasu, danych, eksperymentów, sond, satelitów naukowych i jawnej publikacji wyników.

**Jak mierzą sukces.** Liczba i jakość eksperymentów naukowych, odkrycia, publikacje, prestiż w środowisku międzynarodowym.

**Dźwignie:** publiczna krytyka programu przez autorytety naukowe (spadek PP i WF); odmowa udziału w programach niejawnych; odejście kluczowych specjalistów (spadek tempa badań w KSP — w trybie Zapisu jako tymczasowa korekta punktów badawczych).

**Dary:** przyspieszenie badań; prestiż międzynarodowy (WF +); naukowe uzasadnienie dla misji, które Waszyngton uważa za zbędne.

**Typowe Agendy:** „Pierwsza sonda planetarna”, „Obserwatorium orbitalne”, „Pełna jawność danych”, „Ochrona budżetu nauki przed cięciami”.

**Wewnętrzny paradoks.** Rada Naukowa jest najsilniejszym sojusznikiem Fasady i najsłabszą frakcją w Waszyngtonie. Jej zadowolenie podnosi WF, ale rzadko podnosi ZW.

**Tajemnica Brandta** (ukryta na starcie): wojenna przeszłość Brandta obejmuje pracę w zakładzie, w którym wykorzystywano pracę przymusową. BAS o tym wie. Anderson się dowie — kiedy i w jakich okolicznościach, zależy od rozgrywki.

### 7.5. Biuro Lotów Załogowych (BLZ)

**Kim są.** Dyrektorzy lotów, specjaliści od systemów podtrzymywania życia, lekarze i Korpus Astronautów. Kieruje nimi **Frank Delaney** — dyrektor lotów, były pilot doświadczalny, perfekcjonista. Nieformalnym liderem Korpusu jest astronauta **Ray Kowalczyk**, popularny w mediach, otwarty i niebezpiecznie szczery.

**Czego chcą.** Bezpieczeństwa, ale też lotów — astronauta, który nie lata, traci sens istnienia. Chcą wpływu na decyzje projektowe i weta wobec misji, które uważają za zbyt ryzykowne.

**Jak mierzą sukces.** Bezpieczny powrót każdej załogi; liczba lotów załogowych; prestiż publiczny.

**Dźwignie:** odmowa lotu (formalna procedura: astronauta lub dyrektor lotu może zakwestionować gotowość misji); wypowiedzi publiczne astronautów; żądanie dodatkowych testów.

**Dary:** Poparcie Publiczne (astronauci są twarzą programu); morale; zdolność do realizacji trudnych misji w krótszym czasie.

**Typowe Agendy:** „Pierwszy Amerykanin na orbicie”, „Prawo weta dla Korpusu”, „Dodatkowy cykl testów przed lotem”, „Program księżycowy”.

**Wewnętrzny paradoks.** BLZ dostarcza najwięcej PP, ale też najbardziej katastrofalnych kryzysów. Śmierć załogi to najcięższe pojedyncze zdarzenie w grze.

### 7.6. Konsorcja Przemysłowe (PRZ)

**Kim są.** Trzy rywalizujące koncerny, reprezentowane w NA-AXO przez wspólne biuro łącznikowe:

- **Pacific Astrodyne** (Kalifornia) — silniki rakietowe na paliwa ciekłe, duże stopnie;
- **Keystone Propulsion** (Pensylwania) — silniki na paliwa stałe, stopnie górne, systemy sterowania;
- **Hollis-Ward Aeronautics** (Missouri) — kapsuły, struktury, systemy załogowe.

Każdy koncern ma swojego przedstawiciela w grze, swoich senatorów i swoje fabryki w konkretnych stanach.

**Czego chcą.** Kontraktów, stabilnych zamówień i zysków. Chcą też, by ich technologie były wybierane zamiast technologii konkurencji.

**Jak mierzą sukces.** Udział w budżecie; liczba pojazdów wykorzystujących ich komponenty.

**Dźwignie:** lobbing w Kongresie (wpływ na Sesję Budżetową); opóźnienia dostaw (dodatkowy czas budowy); przekroczenia kosztów.

**Dary:** wsparcie w Kongresie; rabaty i przyspieszenia; dostęp do prototypów.

**Mechanika specjalna — Udziały.** Dla każdego koncernu silnik śledzi jego **Udział**: procent komponentów w pojazdach wystrzelonych w danym roku, liczony według mapowania rodzin silników i części na producentów (rozdział 20.2). Koncern, którego Udział spada, traci Nastawienie; koncern dominujący zyskuje Wpływ. Gracz, który przez trzy lata korzysta z silników jednej rodziny, tworzy monopol — z jego zaletami i ryzykiem.

**Wewnętrzny paradoks.** Przemysł jest jedyną frakcją, która może bezpośrednio wpłynąć na wysokość budżetu, ale też jedyną, która zarabia na problemach programu.

### 7.7. Dyrektoriat Operacji i Infrastruktury (DOI)

**Kim są.** Ludzie, bez których nic nie startuje: zarządcy ośrodków, logistycy, ekipy wyrzutni, stacje śledzące. Kieruje nimi **Walt Ruskin** — były kierownik budowy, małomówny i bardzo zmęczony.

**Czego chcą.** Realistycznych harmonogramów, inwestycji w infrastrukturę i tego, by ktoś wreszcie zauważył, że oni też istnieją.

**Jak mierzą sukces.** Stan infrastruktury, terminowość przygotowań, brak wypadków naziemnych.

**Dźwignie:** spowolnienie przygotowań; raporty o zagrożeniach bezpieczeństwa (które ktoś będzie musiał podpisać); odmowa wykonania startu w niebezpiecznych warunkach.

**Dary:** przyspieszenie przygotowań do startu i rozbudowy obiektów; ostrzeżenia o problemach, zanim staną się wypadkami.

**Typowe Agendy:** „Modernizacja wyrzutni”, „Nowy ośrodek startowy”, „Ograniczenie nadgodzin”, „Rozbudowa sieci śledzenia”.

**Wewnętrzny paradoks.** DOI jest frakcją najmniej widoczną i najłatwiej ignorowaną. Ignorowana przez dłuższy czas staje się źródłem wypadków na ziemi — najbardziej upokarzających porażek w grze.

### 7.8. Aktorzy zewnętrzni

Aktorzy zewnętrzni nie są frakcjami — nie mają Nastawienia wobec Andersona w tym samym sensie — ale generują presję.

**Waszyngton** jest reprezentowany przez wskaźnik ZW oraz trzy postaci-łączniki: doradcę Białego Domu ds. nauki i bezpieczeństwa, przewodniczącego Senackiej Komisji Środków oraz zastępcę sekretarza obrony. Każda zmiana administracji (wybory co cztery lata, symulowane przez silnik z prawdopodobieństwem zależnym od sytuacji kraju) zmienia priorytety Waszyngtonu i może wymienić łączników.

**Sojusznicy** są reprezentowani przez WF i przez **Radę Atlantycką NA-AXO** — organ zbierający się raz w roku. Każdy sojusznik ma prostą listę oczekiwań (np. Francja: udział własnego przemysłu; Wielka Brytania: dostęp do danych; Australia: wykorzystanie poligonu na swoim terytorium). Spełnienie oczekiwań daje fundusze i obiekty; ignorowanie — groźby wycofania.

**Prasa** jest reprezentowana przez PP i przez kilka postaci dziennikarzy, którzy pamiętają, jak Anderson ich traktował.

**ZSRR** jest opisany w rozdziale 15.

## 8. Kadra i postaci

### 8.1. Zasada skali

Gra nie zarządza setkami pracowników. Liczba nazwanych postaci w aktywnej grze wynosi 15–25 w danym momencie. Masowy personel jest abstrakcją KSP (inżynierowie, naukowcy, astronauci w RP-1 **[DO WERYFIKACJI: system zatrudnienia w wersji docelowej]**). Meta-gra śledzi tylko ludzi, którzy mają znaczenie polityczne.

### 8.2. Atrybuty postaci

| Atrybut | Skala | Znaczenie |
|---|---|---|
| **Kompetencja** | 1–5 | Jak dobrze wykonuje swoją pracę. Wpływa na wielkość premii ze stanowiska. |
| **Lojalność** | −3 do +3 | Wobec Andersona osobiście. Niezależna od Nastawienia frakcji. |
| **Ambicja** | 1–5 | Jak bardzo chce awansu. Wysoka Ambicja przy niskiej Lojalności to przepis na intrygę. |
| **Frakcja macierzysta** | — | Skąd pochodzi. Postać zawsze w pewnym stopniu reprezentuje swoją frakcję. |
| **Cechy** | 2–3 | Z listy poniżej. |
| **Agenda osobista** | — | Czego chce dla siebie. |
| **Sekret** | opcjonalny, ukryty | Coś, co można wykorzystać lub co może wybuchnąć. |
| **Haki** | lista | Kto ma na nią haka i na kogo ona ma haka. |

**Lista cech (wersja startowa):**

| Cecha | Efekt |
|---|---|
| **Pedant** | +1 do niezawodności w obszarze odpowiedzialności; −1 do tempa |
| **Hazardzista** | Proponuje śmielsze plany; zwiększa szansę zarówno na przyspieszenie, jak i na wypadek |
| **Karierowicz** | Lojalność zależy od korzyści; odejdzie, jeśli zobaczy lepszą ofertę |
| **Idealista** | Odmawia udziału w zatajeniach; wysoka motywacja w zgodzie z wartościami |
| **Gaduła** | Zwiększa Ciśnienie Ujawnienia Tajemnic, o których wie |
| **Weteran** | Odporny na presję; mentor dla młodszej kadry |
| **Medialny** | Wzmacnia efekt PP — w obie strony |
| **Paranoik** | Częściej wykrywa przecieki; częściej oskarża niewinnych |
| **Biurokrata** | Stabilizuje SO; spowalnia reakcje kryzysowe |
| **Wizjoner** | Generuje propozycje ambitnych programów; ignoruje koszty |
| **Lojalista instytucji** | Lojalność wobec organizacji ponad osobami; nie kryje Andersona, ale też go nie zdradzi |
| **Wypalony** | Kompetencja spada o 1 co 4 kwartały bez odpoczynku |

### 8.3. Gabinet Andersona

Anderson obsadza sześć stanowisk w swoim Gabinecie. Każde stanowisko daje stałą premię zależną od Kompetencji osoby, która je zajmuje, i od jej cech.

| Stanowisko | Premia bazowa | Ryzyko |
|---|---|---|
| **Zastępca Dowódcy** | +1 UD na kwartał | Jest naturalnym następcą Andersona — przy wysokiej Ambicji i niskiej Lojalności staje się rywalem |
| **Główny Inżynier Programu** | Jakość ocen technicznych w raportach; redukcja ryzyka przy Dyrektywach z terminem | Postać z cechą „Hazardzista” zaniża ryzyko w raportach |
| **Dyrektor Bezpieczeństwa Misji** | Dostęp do pełnej oceny ryzyka przed lotami załogowymi | Może zablokować lot — formalnie, z wpisem do akt |
| **Łącznik z Kongresem** | Bonus do Sesji Budżetowej i akcji „Lobbing” | Zna wszystkie obietnice złożone senatorom |
| **Rzecznik** | Bonus do akcji „Komunikat” i łagodzenie spadków PP | Prasa pamięta, jeśli Rzecznik kłamał |
| **Szef Gabinetu** | Redukcja kosztu UD przy akcjach wewnętrznych | Kontroluje, kto ma dostęp do Andersona |

Obsadzenie stanowiska osobą z danej frakcji podnosi Nastawienie tej frakcji o 1, ale obniża Nastawienie frakcji rywalizującej (DPO–RN, BLZ–DOI, BAS–RN to pary rywalizujące na starcie).

### 8.4. Intrygi postaci

Postaci z Ambicją ≥ 4 i Lojalnością ≤ 0 mogą rozpocząć **Intrygę** — ukryty zegar (6 segmentów), który posuwa się co kwartał. Rodzaje intryg:

- **Przejęcie** — postać zbiera haki i poparcie, by zastąpić przełożonego (w skrajnym przypadku Andersona);
- **Przeciek** — postać przygotowuje ujawnienie Tajemnicy, by zaszkodzić rywalowi;
- **Ucieczka** — postać negocjuje przejście do przemysłu lub innej agencji, zabierając ze sobą wiedzę;
- **Frakcyjny zamach** — postać próbuje przesunąć Wpływ na korzyść swojej frakcji.

Gracz nie widzi Intrygi bezpośrednio. Może ją wykryć przez akcję „Śledztwo wewnętrzne”, przez raporty BAS, przez postaci z cechą „Paranoik” lub przez **sygnały** — drobne zdarzenia, które AI wplata w raporty (np. postać spotyka się z senatorem bez wiedzy Andersona). Sygnały są generowane przez silnik i oznaczone w danych, ale prezentowane w narracji tak, by uważny gracz mógł je zauważyć.

### 8.5. Haki

Hak to obiekt w Rejestrze (rozdział 12), oznaczający, że jedna postać wie o drugiej coś, co może wykorzystać. Hak można:

- **użyć** — wymusić na postaci decyzję wbrew jej woli (jednorazowo; hak znika, postać traci Lojalność wobec użytkownika o 2);
- **utrzymywać** — postać z hakiem na sobie nie rozpocznie Intrygi przeciw jego posiadaczowi;
- **sprzedać** — przekazać hak frakcji w zamian za korzyść.

Anderson może zdobywać haki przez Śledztwa, przez BAS lub przez zdarzenia. Inne postaci mogą zdobywać haki na Andersona — i to jest jeden z najważniejszych mechanizmów długofalowych konsekwencji.

### 8.6. Rotacja kadry

Postaci odchodzą: na emeryturę, do przemysłu, w wyniku skandalu, z powodu wypalenia, a astronauci — także z powodu śmierci. Silnik dba o to, by co 4–6 kwartałów pojawiała się co najmniej jedna nowa postać z potencjałem do objęcia ważnego stanowiska. Nowe postaci generowane są z szablonów frakcyjnych, a AI nadaje im biografię, styl mówienia i wygląd w dokumentach.

---

# CZĘŚĆ III — PĘTLA I SYSTEMY RDZENIA

## 9. Pętla rozgrywki

### 9.1. Trzy skale czasu

| Skala | Jednostka | Co się dzieje |
|---|---|---|
| **Makro** | Epoka (4–8 lat) | Zmiana dominującej presji, nastawienia Waszyngtonu, puli zdarzeń, doktryny ZSRR |
| **Mezo** | Kwartał | Pełna pętla: odprawa → decyzje → KSP → rozliczenie → następstwa |
| **Mikro** | Zdarzenie | Pojedyncza decyzja z 2–4 opcjami |

### 9.2. Fazy kwartału

**Faza 1 — Odprawa** (3–5 minut)

Gracz otrzymuje Teczkę Kwartalną. Zawiera ona:

- **Raport Sytuacyjny** — streszczenie stanu programu, wskaźników i najważniejszych zmian od poprzedniego kwartału, napisany przez Szefa Gabinetu;
- **Przegląd Wywiadowczy** — aktualne oceny BAS dotyczące ZSRR, z oznaczeniem wiarygodności (rozdział 16);
- **Korespondencję** — 2–5 dokumentów od frakcji, Waszyngtonu, sojuszników, prasy i pojedynczych postaci;
- **Listę Dyrektyw** — aktywne zobowiązania i ich terminy oraz nowe propozycje do przyjęcia lub odrzucenia;
- **Stan Zegarów** — widoczne zegary kryzysów i cierpliwości frakcji.

Odprawa jest pasywna, ale nie bezwartościowa: to w niej ukryte są sygnały intryg, sprzeczności między raportami i wskazówki dotyczące planów ZSRR.

**Faza 2 — Biurko** (8–12 minut)

Gracz podejmuje decyzje:

1. **Przyjmuje lub odrzuca nowe Dyrektywy** (rozdział 11).
2. **Rozdziela Linie Budżetowe** między dyrektoriaty.
3. **Wydaje Uwagę Dowódcy** na akcje Biurka (rozdział 10).
4. **Rozstrzyga oczekujące Decyzje** — zdarzenia wymagające odpowiedzi.
5. **Zatwierdza Plan Kwartalny** — deklarację, jakie misje i projekty gracz zamierza zrealizować w KSP. Plan jest widoczny dla frakcji i Waszyngtonu; jego niewykonanie ma koszt, ale mniejszy niż niewykonanie Dyrektywy.

Na końcu fazy silnik generuje **Rozkaz Kwartalny** — jednostronicowy dokument z listą ograniczeń i celów obowiązujących w KSP w tym kwartale. To jedyny dokument, który gracz musi mieć przed oczami podczas gry w KSP.

**Faza 3 — Hangar** (45–120 minut w KSP)

Gracz gra w KSP RP-1, realizując Plan Kwartalny i Dyrektywy w ramach ograniczeń z Rozkazu. Gra w KSP trwa do daty końca kwartału w kalendarzu RP-1. Meta-gra w tej fazie jest nieaktywna, z dwoma wyjątkami:

- **Przerwanie Kryzysowe** — jeśli w KSP zdarzy się coś przełomowego (utrata załogi, pierwszy sukces w kamieniu milowym), gracz może zatrzymać kwartał i natychmiast przejść do rozliczenia (9.4);
- **Raport z Lotu** — gracz może opcjonalnie wypełnić krótki raport po każdej misji, co poprawia jakość narracji, ale nie jest wymagane w trybie Zapisu.

**Faza 4 — Rozliczenie** (automatyczne, 1–2 minuty)

Silnik:

1. importuje plik zapisu i wykrywa zmiany (rozdział 18);
2. weryfikuje Dyrektywy i Plan Kwartalny;
3. aktualizuje Bilans Wyścigu;
4. wykonuje ruch ZSRR (warstwa faktyczna);
5. aktualizuje warstwę wiedzy na podstawie aktywów wywiadowczych;
6. przesuwa wszystkie zegary;
7. stosuje przepływy między wskaźnikami (6.2);
8. wybiera zdarzenia do wygenerowania (rozdział 23);
9. przygotowuje Pakiet Kontekstu dla AI (rozdział 27).

**Faza 5 — Następstwa** (4–8 minut)

AI generuje dokumenty opisujące skutki kwartału. Gracz czyta je i rozstrzyga **Decyzje Natychmiastowe** — te, które nie mogą czekać do następnej fazy Biurka (np. komunikat po katastrofie musi zostać wydany natychmiast). Pozostałe zdarzenia trafiają do Odprawy następnego kwartału.

### 9.3. Zasada jednego dokumentu w hangarze

Doświadczenie z prototypów podobnych systemów pokazuje, że gracz w KSP nie pamięta o meta-grze. Dlatego wszystko, co meta-gra chce wymusić w hangarze, musi zmieścić się na jednej stronie Rozkazu Kwartalnego. Jeśli Rozkaz jest dłuższy niż jedna strona, silnik łączy lub odrzuca ograniczenia o najniższym priorytecie.

**Wzór Rozkazu Kwartalnego:**

```
ROZKAZ KWARTALNY — III KW. 1959          KLAUZULA: TAJNE
Dowódca Operacyjny NA-AXO

CELE OBOWIĄZKOWE (Dyrektywy)
 [D-14] Satelita z ładunkiem DPO na orbicie o nachyleniu ≥ 80° — termin: 31.12.1959
 [D-17] Lot suborbitalny z żywym organizmem — termin: 30.09.1959

OGRANICZENIA
 • Budżet operacyjny kwartału: korekta −180 000 (cięcie po przesłuchaniach)
 • Kontrakt Keystone: stopnie górne tylko z rodziny Keystone (umowa K-3)
 • Klauzula tajności: misje D-14 raportowane publicznie jako „naukowe”

PLAN KWARTALNY (deklaracja)
 • Dwa starty testowe nowego stopnia pierwszego
 • Rozbudowa wyrzutni nr 2

UWAGI
 • Dyrektor Bezpieczeństwa Misji zastrzegł ocenę gotowości przed D-17
```

### 9.4. Przerwanie Kryzysowe i półkwartały

Jeśli gracz zatrzyma kwartał przed jego końcem, silnik wykonuje rozliczenie częściowe: tylko zdarzenia związane z przełomowym wydarzeniem, bez ruchu ZSRR i bez przesuwania zegarów cierpliwości. Po fazie Następstw gracz wraca do KSP i kontynuuje ten sam kwartał. Zapobiega to sytuacji, w której śmierć załogi w lipcu zostaje „omówiona” dopiero w październiku.

### 9.5. Fazy specjalne

**Sesja Budżetowa** (raz w roku, w II kwartale). Anderson broni budżetu przed Komisją Środków. Sesja ma strukturę przesłuchania: trzy rundy pytań od senatorów o różnych interesach (oszczędnościowy, przemysłowy, obronny), przy czym każda runda to decyzja z opcjami. Wynik zależy od ZW, PP, Bilansu Wyścigu, Nastawienia PRZ (lobbing), Kompetencji Łącznika z Kongresem i od tego, czy w odpowiedziach Anderson złożył obietnice. Obietnice trafiają do Rejestru jako zobowiązania z terminem.

**Rada Atlantycka** (raz w roku, w IV kwartale). Spotkanie z sojusznikami. Anderson rozlicza się z korzyści, które dał sojusznikom, i negocjuje wkład na kolejny rok. Każdy sojusznik przedstawia jedno żądanie.

**Zmiana Administracji** (co 4 lata, po wyborach). Nowa administracja może zachować lub wymienić łączników, zmienić priorytety, a w skrajnym przypadku zażądać przeglądu kierownictwa NA-AXO (test ZW: przy ZW < 40 możliwe odwołanie).

## 10. Biurko Andersona

### 10.1. Zasada

Biurko to centrum decyzyjne gry. Anderson ma co kwartał 6 punktów Uwagi Dowódcy (UD), modyfikowanych przez Gabinet, SO i stan zdrowia postaci (zmęczenie w długich kryzysach). Akcje kosztują UD, a niektóre dodatkowo KP lub budżet.

Liczba akcji jest celowo mniejsza niż liczba problemów. Gracz nigdy nie zdąży zająć się wszystkim.

### 10.2. Lista akcji

| Akcja | Koszt | Efekt | Ryzyko |
|---|---|---|---|
| **Spotkanie** z dyrektorem frakcji | 1 UD | Nastawienie +1 lub ujawnienie bieżącej Agendy; możliwość negocjacji Dyrektywy | Brak — chyba że gracz złoży obietnicę |
| **Rozmowa** z postacią | 1 UD | Lojalność +1, poznanie Agendy osobistej, szansa na wykrycie sygnału Intrygi | Postać może poprosić o przysługę |
| **Lobbing w Waszyngtonie** | 2 UD + 1 KP | ZW +3 do +6 zależnie od Łącznika i sytuacji | Nieobecność Andersona: jedna losowa decyzja wewnętrzna podejmowana przez Zastępcę |
| **Konferencja prasowa / Komunikat** | 1 UD | PP ±, kształtowanie narracji po zdarzeniu | Kłamstwo tworzy Tajemnicę; prawda może zaszkodzić frakcji |
| **Inspekcja** | 1 UD | Ujawnienie rzeczywistego stanu danego obszaru (np. przygotowania wyrzutni, przekroczenia kosztów) | Frakcja inspekcjonowana: Nastawienie −1 |
| **Śledztwo wewnętrzne** | 2 UD | Wykrycie Intrygi lub źródła przecieku; możliwość zdobycia haka | SO −3; postaci z cechą „Idealista” obniżają Lojalność |
| **Przetasowanie kadrowe** | 1 UD (+KP przy odwołaniu wpływowej postaci) | Zmiana obsady stanowiska | Reakcja frakcji macierzystej |
| **Zlecenie wywiadowcze** | 1 UD + budżet | Operacja BAS skierowana na konkretną lukę wiedzy o ZSRR (rozdział 16.5) | Ryzyko zdemaskowania; zależy od Nastawienia BAS |
| **Mediacja** | 2 UD | Rozwiązanie konfliktu między dwiema frakcjami; obie Nastawienie +1, jeśli się uda | Porażka mediacji: obie −1 |
| **Przysługa** | 1 UD + koszt zależny | Spełnienie prośby postaci lub frakcji poza Dyrektywą; tworzy Dług na swoją korzyść | Precedens: kolejne prośby będą częstsze |
| **Odpoczynek** | 2 UD | Usuwa zmęczenie Andersona; +1 UD w następnym kwartale | Nieobecność |
| **Przegląd techniczny** | 1 UD | Ujawnia prawdziwe ryzyko planowanej misji (lepsza ocena niż raport frakcji) | Opóźnia decyzję; frakcja-autor oceny może poczuć się urażona |

### 10.3. Akcje zakrzywiające reguły

Kilka akcji pozwala Andersonowi wyjść poza normalne ograniczenia za wysoką cenę:

- **Decyzja wykonawcza** (3 UD + 3 KP) — Anderson narzuca rozwiązanie mimo sprzeciwu frakcji o Wpływie ≥ 4. Frakcja: Nastawienie −2, zegar Cierpliwości +2.
- **Przesunięcie funduszy** (2 UD + 2 KP) — przeniesienie środków z jednej Linii Budżetowej do innej w trakcie kwartału. Każde użycie zostaje odnotowane; trzy użycia w roku uruchamiają kontrolę Komisji Środków.
- **Użycie budżetu czarnego** (1 UD) — dostęp do funduszy z programów niejawnych. Ciśnienie Ujawnienia powiązanej Tajemnicy +1.
- **Apel do Białego Domu** (4 UD + 5 KP, raz na epokę) — rozwiązuje jeden kryzys polityczny w Waszyngtonie, ale ZW przestaje rosnąć przez 4 kwartały („Anderson musiał prosić o ratunek”).

## 11. Dyrektywy

### 11.1. Czym jest Dyrektywa

Dyrektywa to formalne zobowiązanie Andersona wobec frakcji lub Waszyngtonu, z mierzalnym celem i terminem. Dyrektywy są głównym mechanizmem, przez który meta-gra wpływa na to, co gracz robi w KSP.

**Struktura Dyrektywy:**

| Pole | Przykład |
|---|---|
| **ID** | D-14 |
| **Zleceniodawca** | DPO |
| **Cel** | Satelita z ładunkiem DPO na orbicie o nachyleniu ≥ 80° |
| **Warunek weryfikacji** | Plik zapisu: pojazd z oznaczeniem „DPO” na orbicie, nachylenie ≥ 80°, przez ≥ 1 dzień |
| **Poziom weryfikacji** | W (automatyczny) |
| **Termin** | 31.12.1959 |
| **Nagroda** | Fundusze celowe 400 000 (z góry 50%), Nastawienie DPO +2, KP +2 |
| **Kara za niewykonanie** | Nastawienie DPO −2, Cierpliwość +3, ZW −5, utrata pozostałych funduszy celowych |
| **Klauzula** | Tajne — publicznie raportowane jako misja naukowa |
| **Skutki uboczne** | WF −3 przy realizacji (nawet tajnej); Tajemnica „Program rozpoznawczy” +1 Ciśnienia |

### 11.2. Poziomy weryfikacji

- **W — weryfikowalne automatycznie.** Silnik sprawdza warunek w pliku zapisu (orbita, kontrakt RP-1, technologia, liczba startów, stan funduszy).
- **R — weryfikowane raportem.** Warunek wymaga deklaracji gracza w Raporcie Misji, ale silnik sprawdza spójność z danymi z zapisu (np. „lot z zachowaniem dodatkowego cyklu testów”).
- **D — deklaratywne.** Warunek opiera się wyłącznie na uczciwości gracza. Dyrektywy D są dopuszczalne tylko wtedy, gdy nie da się ich zastąpić wersją W lub R, i nigdy nie mogą być warunkiem kamienia milowego ani zakończenia.

Cel projektowy: co najmniej 70% Dyrektyw w puli to Dyrektywy W.

### 11.3. Kategorie Dyrektyw

| Kategoria | Przykład | Typowy zleceniodawca |
|---|---|---|
| **Cel misji** | Osiągnięcie konkretnej orbity, ciała niebieskiego, typu misji | Wszyscy |
| **Termin** | Realizacja przed datą | Waszyngton, DPO |
| **Seria** | N udanych startów z rzędu danej rodziny rakiet | DPO, PRZ |
| **Dostawca** | Użycie komponentów konkretnego koncernu | PRZ, Waszyngton (kontrakty stanowe) |
| **Embargo** | Zakaz użycia określonej rodziny silników lub technologii | BAS (np. po aferze szpiegowskiej), Waszyngton |
| **Limit kosztów** | Pojazd o koszcie poniżej wartości | Waszyngton, Komisja Środków |
| **Niezawodność** | Wymagana liczba udanych testów silnika przed lotem załogowym | BLZ |
| **Nauka** | Zebranie określonych danych naukowych | RN |
| **Infrastruktura** | Rozbudowa obiektu do poziomu | DOI |
| **Sojusznicza** | Ładunek lub astronauta sojusznika na pokładzie | Sojusznicy |

### 11.4. Przyjmowanie i odrzucanie

Nowe Dyrektywy pojawiają się w Odprawie jako propozycje. Gracz może:

- **przyjąć** — Dyrektywa staje się aktywna, otrzymuje się zaliczkę (jeśli przewidziana);
- **negocjować** (wymaga akcji „Spotkanie”) — zmiana terminu, celu lub nagrody; wynik zależy od Nastawienia i KP;
- **odrzucić** — koszt zależny od Wpływu zleceniodawcy: frakcja o Wpływie 1–2 przyjmuje odmowę z Nastawieniem −1; frakcja o Wpływie 4–5 dodaje 2 segmenty do zegara Cierpliwości.

**Dyrektyw Waszyngtonu nie można odrzucić** bez kosztu ZW −8 i KP −3. Można je tylko negocjować.

### 11.5. Konflikty Dyrektyw

Silnik celowo generuje Dyrektywy, które się wykluczają lub konkurują o te same zasoby. Przykład: PRZ żąda użycia stopni Keystone, a BLZ żąda, by lot załogowy wykorzystywał wyłącznie silniki z co najmniej 20 udanymi testami — a stopnie Keystone są nowe. Gracz musi wybrać, kogo rozczarować, albo znaleźć trzecie wyjście (negocjacje, przyspieszone testy, mediacja).

Limit: jednocześnie najwyżej 6 aktywnych Dyrektyw. Pozwala to utrzymać Rozkaz Kwartalny na jednej stronie.

## 12. Rejestr Następstw

### 12.1. Zasada

Rejestr Następstw jest pamięcią organizacji. To w nim zapisane są wszystkie trwałe konsekwencje decyzji, które nie mieszczą się we wskaźnikach. Rejestr jest bazą danych w silniku, nie notatkami AI. AI czyta jego widoczną część i może proponować nowe wpisy, ale to silnik decyduje o ich utworzeniu.

### 12.2. Typy wpisów

| Typ | Opis | Przykład |
|---|---|---|
| **Dług** | Ktoś jest coś winien Andersonowi lub Anderson komuś | Senator Whitfield poparł budżet; Anderson obiecał kontrakt dla zakładów w jego stanie |
| **Obietnica** | Publiczne lub prywatne zobowiązanie z terminem | „Pierwszy Amerykanin na orbicie przed końcem 1961” — powiedziane przed Komisją |
| **Tajemnica** | Fakt ukryty przed częścią świata | Przyczyna wybuchu na wyrzutni 2 została zatajona |
| **Uraza** | Postać lub frakcja pamięta krzywdę | Delaney pamięta, że Anderson zignorował jego zastrzeżenia przed lotem |
| **Hak** | Ktoś wie coś o kimś (8.5) | BAS wie o przeszłości Brandta |
| **Precedens** | Wcześniejsza decyzja tworzy oczekiwanie | Anderson raz ustąpił przed groźbą odejścia astronautów — kolejne groźby są bardziej prawdopodobne |
| **Zasługa** | Pozytywna pamięć | Ruskin uratował start, zgłaszając usterkę — oczekuje uznania |

### 12.3. Struktura wpisu

```yaml
id: R-0042
typ: tajemnica
tytul: "Przyczyna eksplozji na wyrzutni 2 (III kw. 1958)"
strony:
  wiedza: [anderson, ruskin, ames, brandt]
  ukryte_przed: [prasa, kongres, rada_atlantycka]
waga: 3            # 1–3
cisnienie: 2       # 0–6, tylko dla tajemnic
wyzwalacze:
  - "przesłuchanie w Kongresie dotyczące bezpieczeństwa"
  - "odejście dowolnej osoby z listy 'wiedza' z organizacji"
  - "kolejny wypadek naziemny"
skutki_ujawnienia:
  ZW: -12
  PP: -8
  uraza: [ruskin -> anderson]  # jeśli Ruskin zostanie obwiniony
utworzono: 1958-Q3
widocznosc_gracza: pelna
```

### 12.4. Ciśnienie Ujawnienia

Każda Tajemnica ma Ciśnienie od 0 do 6. Co kwartał silnik dodaje Ciśnienie, gdy:

- liczba osób znających Tajemnicę jest większa niż 3 (+1);
- któraś z nich ma cechę „Gaduła” lub Lojalność ≤ −2 (+1);
- powiązany obszar jest przedmiotem zainteresowania prasy lub Kongresu (+1);
- wykorzystano budżet czarny powiązany z Tajemnicą (+1).

Ciśnienie spada, gdy BAS aktywnie chroni Tajemnicę (dar BAS), gdy osoby znające Tajemnicę odchodzą w dobrych relacjach lub gdy minęło 8 kwartałów bez wyzwalaczy.

Przy Ciśnieniu 6 Tajemnica zostaje ujawniona. Przy wystąpieniu wyzwalacza silnik wykonuje test: szansa ujawnienia = Ciśnienie × 15%.

**Dobrowolne ujawnienie.** Anderson może sam ujawnić Tajemnicę. Skutki są wtedy o połowę mniejsze, a Anderson zyskuje Jawność +2. Jest to jeden z najważniejszych wyborów strategicznych gry: zapłacić teraz mniej czy ryzykować zapłacenie więcej później.

### 12.5. Wykorzystanie Rejestru przez silnik zdarzeń

Generator zdarzeń (rozdział 23) przy każdym losowaniu sprawdza wyzwalacze wszystkich aktywnych wpisów. Wpis z aktywnym wyzwalaczem ma pierwszeństwo przed zdarzeniami losowymi. Dzięki temu decyzje z 1954 roku wracają w 1963 roku — nie dlatego, że AI je pamięta, ale dlatego, że silnik je przechowuje.

### 12.6. Widoczność

Gracz widzi w Rejestrze wpisy, o których Anderson wie. Istnieją też wpisy ukryte — np. hak, który postać zdobyła na Andersona, albo uraza, której postać nie okazuje. Ukryte wpisy mogą zostać ujawnione przez Śledztwo, przez BAS lub w momencie ich wykorzystania.

## 13. Zegary

### 13.1. Zasada

Zegar to wizualny licznik postępu podzielony na segmenty (4, 6 lub 8). Zapełnienie zegara wyzwala skutek. Zegary są uniwersalnym językiem gry dla wszystkiego, co narasta w czasie: kryzysów, cierpliwości, intryg, projektów ZSRR, śledztw prasowych.

Mechanika zapożyczona z gier fabularnych sprawdza się tu szczególnie dobrze, bo pokazuje graczowi presję bez ujawniania dokładnych liczb i pozwala silnikowi łatwo łączyć wiele niezależnych procesów.

### 13.2. Typy zegarów

| Typ | Segmenty | Widoczność | Skutek zapełnienia |
|---|---|---|---|
| **Cierpliwość frakcji** | 6 | Widoczny | Eskalacja o jeden stopień |
| **Kryzys** | 4–8 | Widoczny | Kolejny etap kryzysu lub jego katastrofalne zakończenie |
| **Intryga** | 6 | Ukryty | Realizacja intrygi |
| **Projekt ZSRR** | 6–8 | Ukryty (szacowany przez wywiad) | Radziecki kamień milowy lub nowa zdolność |
| **Dochodzenie prasowe** | 6 | Częściowo widoczny („dziennikarz zadaje pytania”) | Publikacja artykułu |
| **Kontrola Kongresu** | 4 | Widoczny | Przesłuchanie |
| **Zmęczenie** | 6 | Widoczny | Kompetencja postaci −1 lub błąd decyzyjny |

### 13.3. Zegary powiązane

Zegary mogą być połączone: zapełnienie jednego dodaje segmenty do innego. Przykład: zapełnienie zegara „Dochodzenie prasowe: koszty programu” dodaje 2 segmenty do „Kontroli Kongresu” i 1 segment do Cierpliwości PRZ (bo prasa pisze o przekroczeniach kosztów u kontraktorów). Sieć powiązań jest zdefiniowana w danych i widoczna w interfejsie jako „łańcuch skutków”, gdy gracz najedzie na zegar — ale tylko dla zegarów widocznych.

### 13.4. Zegary w rękach gracza

Część akcji Biurka cofa segmenty zegarów (Spotkanie: −1 Cierpliwości; Komunikat: −1 do −2 Dochodzenia prasowego). Najważniejsza zasada balansu: **gracz zawsze może cofnąć każdy pojedynczy zegar, ale nigdy wszystkich naraz.** Liczba aktywnych zegarów rośnie szybciej niż UD.

---

# CZĘŚĆ IV — WYŚCIG, PRZECIWNIK, WYWIAD

## 14. Bilans Wyścigu

### 14.1. Zasada

Bilans Wyścigu to tor przewagi w wyścigu kosmicznym, od −30 (zdecydowana przewaga ZSRR) do +30 (zdecydowana przewaga NA-AXO). Każdy kamień milowy osiągnięty przez którąkolwiek stronę przesuwa Bilans. Kolejność ma znaczenie: pierwszeństwo jest warte więcej niż dorównanie przeciwnikowi.

### 14.2. Kategorie kamieni milowych

Kamienie milowe dzielą się na siedem kategorii. Pełna lista znajduje się w Aneksie C.

| Kategoria | Przykłady | Znaczenie |
|---|---|---|
| **Orbita** | Pierwszy satelita, pierwszy satelita naukowy, pierwszy satelita meteorologiczny | Otwiera Epokę II |
| **Człowiek** | Pierwszy organizm w kosmosie, pierwszy człowiek suborbitalnie, pierwszy człowiek na orbicie, pierwsza wielodniowa misja | Największy efekt na PP |
| **Operacje** | Pierwsze wyjście w przestrzeń, pierwsze spotkanie orbitalne, pierwsze cumowanie, pierwsza załoga wieloosobowa | Warunki techniczne do Księżyca |
| **Księżyc** | Przelot, trafienie, miękkie lądowanie bezzałogowe, orbita załogowa, lądowanie załogowe, powrót z próbkami | Kulminacja Epoki III |
| **Stacje** | Pierwsza stacja orbitalna, pierwsza długotrwała obsada | Epoka IV |
| **Planety** | Przelot obok Wenus, przelot obok Marsa, lądowanie | Domena RN |
| **Strategiczne** | Satelita rozpoznawczy, łączności, wczesnego ostrzegania, zdolność antysatelitarna | Ukryta kategoria — część osiągnięć pozostaje tajna |

### 14.3. Punktacja

Każdy kamień milowy ma **Wagę** (1–5). Pierwsza strona, która go osiągnie, otrzymuje pełną Wagę; druga strona otrzymuje połowę (zaokrągloną w dół), jeśli osiągnie go w ciągu 4 kwartałów, i nic, jeśli później.

Przykład: „Człowiek na orbicie” ma Wagę 5. Jeśli ZSRR osiągnie go pierwszy, Bilans przesuwa się o −5. Jeśli NA-AXO osiągnie go 3 kwartały później, Bilans przesuwa się o +2. Netto: −3.

**Kamienie strategiczne** liczą się podwójnie, ale wyłącznie w ukrytym Bilansie Strategicznym, który wpływa na Napięcie Geopolityczne i na Ocenę Historyczną, a nie na PP. Opinia publiczna nie wie o satelitach rozpoznawczych.

### 14.4. Bilans widziany i faktyczny

Gracz widzi Bilans według warstwy wiedzy: znane radzieckie osiągnięcia (ogłoszone publicznie lub wykryte przez wywiad). Rzeczywisty Bilans może się różnić — ZSRR mógł osiągnąć coś tajnego (np. zdolność antysatelitarną), o czym gracz jeszcze nie wie. Rozbieżność ujawnia się, gdy wywiad wykryje tajne osiągnięcie albo gdy ZSRR zdecyduje się je ogłosić.

### 14.5. Pierwszeństwo jako zdarzenie

Kamień milowy osiągnięty jako pierwszy przez którąkolwiek stronę generuje zdarzenie o najwyższym priorytecie. Jeśli to ZSRR, uruchamia się mechanizm **Szoku** (rozdział 31.3). Jeśli NA-AXO, uruchamia się seria zdarzeń triumfalnych: wizyta prezydenta, parada, wywiady, a za kilka kwartałów — pytanie Kongresu, czy ten program nadal potrzebuje takich pieniędzy.

## 15. Model ZSRR

### 15.1. Założenia

ZSRR jest drugim graczem, nie scenariuszem. Ma własne zasoby, własne instytucje, własne rywalizacje i własną strategię, która reaguje na działania gracza. Model jest prostszy niż model NA-AXO, ale zbudowany na tej samej logice — co jest celowe: gracz, który rozumie własną organizację, zaczyna rozumieć przeciwnika.

### 15.2. Instytucje radzieckie

Radziecki program jest modelowany jako zbiór rywalizujących biur konstrukcyjnych, zgodnie z realiami epoki:

| Biuro | Profil | Charakter w grze |
|---|---|---|
| **OKB-1** | Rakiety nośne, programy załogowe, sondy | Biuro „Głównego Konstruktora” — innowacyjne, prestiżowe, uzależnione od jednego człowieka |
| **OKB-52** | Rakiety ciężkie, systemy wojskowe, stacje orbitalne o przeznaczeniu militarnym | Rywal OKB-1 o względy Kremla |
| **OKB-586** | Rakiety wojskowe na paliwa składowane | Zaplecze militarne, mało zainteresowane prestiżem |
| **OKB-456** | Silniki | Dostawca, który może wybrać, komu dostarcza — źródło konfliktów między biurami |

Każde biuro ma atrybuty: **Zasoby** (część radzieckiego budżetu kosmicznego), **Kompetencja**, **Wpływ na Kremlu** i **Projekty** (zegary 6–8 segmentów).

**Główny Konstruktor.** Zgodnie z realiami epoki tożsamość szefa OKB-1 jest państwową tajemnicą. W warstwie wiedzy gracza występuje on jako „Główny Konstruktor”, a jego nazwisko może zostać ustalone przez wywiad. Jego śmierć lub odsunięcie (zdarzenie losowe o niskim prawdopodobieństwie, rosnącym z czasem) jest jednym z najważniejszych punktów zwrotnych w modelu ZSRR.

### 15.3. Doktryna Kremla

Strategia ZSRR wyrażona jest jako **Doktryna** — rozkład wag między pięcioma priorytetami:

| Priorytet | Co oznacza |
|---|---|
| **Prestiż** | Pierwszeństwo w widowiskowych kamieniach milowych |
| **Militaryzacja** | Systemy rozpoznawcze, antysatelitarne, orbitalne systemy przenoszenia |
| **Księżyc** | Program księżycowy załogowy |
| **Stacje** | Długotrwała obecność na orbicie |
| **Planety** | Sondy międzyplanetarne |

Wagi sumują się do 100. Doktryna startowa (1951): Militaryzacja 60, Prestiż 25, Planety 10, Stacje 5, Księżyc 0.

Co 4 kwartały i po kluczowych zdarzeniach Kreml **rewiduje Doktrynę**. Rewizja zależy od:

- **Bilansu Wyścigu** — jeśli ZSRR prowadzi w kategorii, waga Prestiżu w tej kategorii rośnie (eksploatacja przewagi); jeśli przegrywa wyraźnie, rośnie szansa na **zwrot** — przeniesienie wag do innej kategorii, w której NA-AXO nie konkuruje;
- **Napięcia Geopolitycznego** — wyższe napięcie podnosi Militaryzację;
- **Polityki wewnętrznej** — zmiana przywództwa na Kremlu (zdarzenie losowe, z kotwicami historycznymi) może zmienić Doktrynę gwałtownie;
- **Działań gracza widocznych dla ZSRR** — radziecki wywiad również działa. Jeśli NA-AXO buduje satelity rozpoznawcze, ZSRR z pewnym opóźnieniem odpowiada programem antysatelitarnym.

### 15.4. Zwrot strategiczny

Zwrot to najważniejsza mechanika przeciwnika i bezpośrednia realizacja wizji: przeciwnik może przestać ścigać się o ten sam cel.

Przykład: w 1966 roku NA-AXO wyraźnie prowadzi w kategorii Księżyc. Kreml wykonuje Zwrot — wagi Księżyca spadają z 40 do 10, a Militaryzacja i Stacje rosną. Gracz, który wydał trzy lata budżetu na program księżycowy, nadal może wylądować na Księżycu i zdobyć punkty, ale:

- Waszyngton zaczyna pytać, po co to wszystko, skoro Rosjanie zrezygnowali;
- DPO zyskuje Wpływ, bo ZSRR buduje orbitalną stację wojskową;
- BAS raportuje coś, co może być tylko dezinformacją — albo nie.

Zwrot nie jest natychmiast widoczny. Gracz dowiaduje się o nim przez wywiad, z opóźnieniem i z niepewnością (rozdział 16).

### 15.5. Postęp projektów radzieckich

Każdy aktywny projekt to zegar. Co kwartał silnik wykonuje dla każdego projektu test postępu:

```
postęp = baza_projektu × (zasoby_biura / zapotrzebowanie) × modyfikator_kompetencji × los(0,6–1,4)
```

Wynik zaokrąglany jest do pełnych segmentów (0–2 na kwartał). Dodatkowo każdy test ma **szansę awarii** zależną od dojrzałości technologii i presji czasu (Prestiż wysoki = większy pośpiech = więcej awarii). Awaria cofa zegar o 1–3 segmenty i jest **domyślnie tajna** — ZSRR nie ogłasza porażek. Wywiad może ją wykryć.

Zapełniony zegar projektu oznacza próbę osiągnięcia kamienia milowego. Próba ma własny test powodzenia. Sukces jest ogłaszany (dla kamieni prestiżowych) lub utajniany (dla strategicznych).

### 15.6. Kotwice historyczne i tryby przeciwnika

Aby ZSRR nie był ani zbyt przewidywalny, ani absurdalny, model posiada **kotwice historyczne**: przybliżone daty, w których dany kamień milowy był w rzeczywistości osiągalny technicznie. Kotwica nie wymusza zdarzenia, ale modyfikuje prawdopodobieństwo: przed kotwicą postęp projektów jest spowolniony, po kotwicy przyspieszony.

Gracz wybiera tryb przeciwnika na początku kampanii:

| Tryb | Opis |
|---|---|
| **Historyczny** | Wąskie okna wokół kotwic (±2 kwartały); zwroty rzadkie. Dla graczy, którzy chcą znanego rytmu. |
| **Rozbieżny** | Szerokie okna (±6 kwartałów); zwroty normalne. Tryb domyślny. |
| **Adaptacyjny** | Kotwice słabe; Doktryna silnie reaguje na działania gracza; zwroty częste. Dla doświadczonych graczy. |

### 15.7. Czego ZSRR nie robi

- Nie oszukuje: ma tylko te zasoby, które wynikają z modelu, i nie zna stanu NA-AXO lepiej, niż pozwala radziecki wywiad.
- Nie jest sterowany przez AI narracyjną: wszystkie decyzje ZSRR podejmuje silnik.
- Nie reaguje na wiedzę, której nie mógłby mieć: tajne osiągnięcia NA-AXO wpływają na Doktrynę dopiero, gdy radziecki wywiad je wykryje (z opóźnieniem zależnym od WF i NG).

## 16. Wywiad i mgła wojny

### 16.1. Dwie warstwy

Silnik przechowuje dla każdej informacji o ZSRR (i dla części informacji o frakcjach) dwie wartości: **faktyczną** i **szacowaną**. Warstwa szacowana składa się z **Ocen** — jednostek wiedzy, z których każda ma treść, źródło, wiarygodność i datę.

Interfejs, raporty i narracja AI korzystają **wyłącznie z warstwy szacowanej**. Model językowy nigdy nie otrzymuje warstwy faktycznej ZSRR. Ta zasada jest bezwzględna, bo żadna instrukcja „nie zdradzaj” nie jest tak niezawodna jak brak dostępu do danych.

### 16.2. Ocena wywiadowcza

Każda Ocena posiada oznaczenie wiarygodności w dwuczłonowym systemie znanym z praktyki wywiadowczej:

**Wiarygodność źródła** (litera):

| Kod | Znaczenie |
|---|---|
| A | Całkowicie wiarygodne |
| B | Zwykle wiarygodne |
| C | Dość wiarygodne |
| D | Zwykle niewiarygodne |
| E | Niewiarygodne |
| F | Nie da się ocenić |

**Prawdopodobieństwo informacji** (cyfra):

| Kod | Znaczenie |
|---|---|
| 1 | Potwierdzone przez inne źródła |
| 2 | Prawdopodobnie prawdziwe |
| 3 | Możliwe |
| 4 | Wątpliwe |
| 5 | Nieprawdopodobne |
| 6 | Nie da się ocenić |

Przykład Oceny w raporcie: *„OKB-1 prowadzi testy nowego stopnia górnego zdolnego do wyniesienia ładunku na trajektorię księżycową. Szacowany termin gotowości: 1964–1965. [B-2, SIGINT, III kw. 1962]”.*

### 16.3. Jak powstają Oceny

Co kwartał silnik dla każdej faktycznej zmiany w stanie ZSRR wykonuje test wykrycia dla każdego aktywnego **Aktywa wywiadowczego**:

| Aktywo | Jak je zdobyć | Co wykrywa | Typowa wiarygodność |
|---|---|---|---|
| **Źródła otwarte** | Zawsze dostępne | Ogłoszone sukcesy, propaganda | A–B, ale treść selekcjonowana |
| **SIGINT** (nasłuch) | Infrastruktura DOI + BAS | Telemetria startów, w tym nieudanych | B–C |
| **HUMINT** (agentura) | Operacje BAS | Plany, rywalizacje, nazwiska, Doktryna | B–E, duży rozrzut |
| **IMINT lotniczy** | Na starcie od DPO/BAS; ryzykowny (incydent podnosi NG) | Obiekty startowe, budowy | B–C |
| **IMINT satelitarny** | **Gracz musi zbudować i wystrzelić w KSP satelitę rozpoznawczego** | Obiekty, rakiety na wyrzutniach, skala programu | A–B |
| **Sojusznicy** | WF ≥ 50 | Wybrane informacje uzupełniające | C |

**Satelity rozpoznawcze są kluczowym punktem integracji wywiadu z KSP.** Każdy aktywny satelita rozpoznawczy na właściwej orbicie (np. polarnej, w odpowiednim przedziale wysokości — warunki definiuje plik danych) zwiększa szansę wykrycia i wiarygodność Ocen dotyczących infrastruktury. Satelita ma ograniczony czas działania — w modelu epoki zdjęcia trzeba odzyskać, co w KSP może oznaczać powrót kapsuły z filmem. Taki projekt łączy interes DPO i BAS, obciąża WF i daje graczowi lepszy obraz przeciwnika. To wzorcowy przykład zasady Z2.

### 16.4. Błędy i dezinformacja

- **Błąd szacunku.** Każda Ocena ma rozrzut. Termin gotowości radzieckiego projektu jest podawany jako przedział, a przy niskiej wiarygodności przedział może nie zawierać prawdziwej wartości.
- **Dezinformacja ZSRR.** Przy wysokiej wadze Prestiżu lub w czasie Zwrotu ZSRR może generować fałszywe Oceny — np. sugerować, że program księżycowy przyspiesza, gdy w rzeczywistości jest wygaszany. Fałszywe Oceny zawsze pochodzą od źródeł konkretnego typu (HUMINT, źródła otwarte) i nigdy nie mają kodu A-1.
- **Filtrowanie przez BAS.** Przy Nastawieniu BAS ≤ −2 część Ocen jest opóźniana o kwartał, a przy −3 BAS może celowo przesadzać zagrożenie, by uzasadnić własne żądania. Gracz może to wykryć, porównując raporty BAS z IMINT satelitarnym.

### 16.5. Zlecenia wywiadowcze

Akcja Biurka „Zlecenie wywiadowcze” pozwala skierować zasoby na konkretną lukę: „Stan programu księżycowego”, „Tożsamość Głównego Konstruktora”, „Przyczyna radzieckiej awarii z II kw.”, „Zamiary Kremla wobec stacji orbitalnych”. Zlecenie trwa 1–3 kwartały, kosztuje budżet i niesie ryzyko — zdemaskowana operacja podnosi NG i może wywołać aferę.

### 16.6. Mgła wewnętrzna

Mgła dotyczy również własnej organizacji, w mniejszym stopniu:

- raporty frakcji o stanie ich obszarów mogą być zawyżone lub zaniżone zgodnie z interesem frakcji i cechami autora;
- Intrygi są ukryte;
- część wpisów Rejestru jest ukryta;
- akcje Inspekcja i Przegląd techniczny dają dostęp do wartości faktycznych w konkretnym obszarze.

Zasada: **dane z KSP są zawsze prawdziwe** (gracz je widzi w hangarze), ale **interpretacje i oceny ryzyka w raportach frakcji mogą być stronnicze.** Gracz wie, że rakieta poleciała; nie zawsze wie, czy Główny Inżynier mówi prawdę o jej marginesach bezpieczeństwa w kontekście nadchodzącego lotu załogowego.

## 17. Napięcie Geopolityczne

### 17.1. Skala

Napięcie Geopolityczne (NG) ma pięć stopni, odliczanych w dół:

| Stopień | Nazwa | Skutki |
|---|---|---|
| **5** | Odprężenie | Budżet obronny spada; RN zyskuje Wpływ; sojusznicy chętniej współpracują; ZSRR obniża Militaryzację |
| **4** | Stan normalny | Wartości bazowe |
| **3** | Napięcie | DPO Wpływ +1; nowe Dyrektywy obronne; WF −1 na kwartał |
| **2** | Kryzys | DPO Wpływ +2; Dyrektywy Waszyngtonu o priorytecie obronnym; część Linii Budżetowych zamrożona; Ciśnienie Tajemnic militarnych +1 |
| **1** | Krawędź | Faza specjalna: kryzys globalny (rozdział 24.5) |

### 17.2. Co zmienia Napięcie

- **Zdarzenia geopolityczne** — generowane przez silnik z kotwicami epoki (kryzysy berlińskie, kryzysy w regionach peryferyjnych, incydenty lotnicze, zmiany przywództwa). Ich daty i przebiegi są zmienne.
- **Działania NA-AXO** — zdemaskowane operacje wywiadowcze, ujawnione programy wojskowe, testy systemów strategicznych.
- **Działania ZSRR** — ujawnione zdolności militarne na orbicie.
- **Bilans Strategiczny** — wyraźna przewaga którejkolwiek strony w kategorii Strategiczne podnosi Napięcie.

### 17.3. Napięcie jako dylemat

Napięcie zwiększa budżet obronny i dostępność funduszy celowych, więc w krótkim terminie bywa korzystne dla programu. W długim terminie niszczy Fasadę, wzmacnia DPO kosztem RN i zwiększa ryzyko kryzysu globalnego. Gracz może być kuszony, by podsycać napięcie dla pieniędzy — i gra na to pozwala, pamiętając o kosztach w Rejestrze.

---

# CZĘŚĆ V — INTEGRACJA Z KSP RP-1

## 18. Kanał odczytu

### 18.1. Źródła danych

Silnik odczytuje stan programu technicznego z trzech źródeł, w kolejności priorytetu:

1. **Plik zapisu kariery (.sfs)** — główne źródło. Zawiera fundusze, stan drzewa technologii, ukończone kontrakty, stan budów i kolejek, listę pojazdów w locie z ich orbitami, stan astronautów oraz dane modułów RP-1 zapisane w węzłach scenariuszy **[DO WERYFIKACJI: nazwy i struktura węzłów w wersji docelowej]**.
2. **Raport Misji** — krótki formularz wypełniany przez gracza po kluczowych lotach. Uzupełnia informacje, których plik zapisu nie przechowuje albo przechowuje niejednoznacznie (np. przeznaczenie ładunku, przyczyna awarii w ocenie gracza).
3. **Telemetria na żywo (opcjonalnie)** — w trybie Modu, przez istniejące narzędzia zdalnego dostępu do KSP (np. kRPC), zdarzenia takie jak start, awaria silnika czy utrata załogi mogą być rejestrowane w chwili wystąpienia.

### 18.2. Migawki i różnice

Silnik nie interpretuje pliku zapisu w oderwaniu od historii. Na końcu każdego kwartału tworzy **Migawkę** — znormalizowany obraz stanu technicznego — i porównuje ją z poprzednią. Wszystkie zdarzenia meta-gry wynikają z **różnicy między migawkami**:

| Różnica | Zdarzenie w meta-grze |
|---|---|
| Nowy pojazd na orbicie | Sprawdzenie kamieni milowych i Dyrektyw; aktualizacja Udziałów PRZ |
| Pojazd zniszczony podczas wznoszenia | Awaria startowa → test rozgłosu, ewentualne śledztwo |
| Astronauta oznaczony jako zmarły lub zaginiony | Utrata załogi → Przerwanie Kryzysowe (jeśli nie nastąpiło wcześniej) |
| Nowa technologia odblokowana | Aktualizacja możliwości; zainteresowanie frakcji, której dotyczy |
| Ukończony kontrakt lub kamień milowy RP-1 | Mapowanie na kamienie milowe Bilansu Wyścigu |
| Zmiana funduszy niewyjaśniona Korektą | Analiza Spójności Wydatków |
| Nowy obiekt lub rozbudowa budynku | Dyrektywy DOI, Nastawienie DOI |

### 18.3. Raport Misji

Raport Misji jest celowo krótki — maksymalnie siedem pól, z czego większość wypełnia się automatycznie z migawki:

```
RAPORT MISJI — nr M-1959-07
Pojazd: [auto]        Data startu: [auto]       Wynik: [auto: orbita / suborbita / awaria]
Przeznaczenie:  ( ) naukowe  ( ) obronne  ( ) załogowe  ( ) testowe  ( ) sojusznicze
Dyrektywy:      [lista aktywnych do zaznaczenia]
Klasyfikacja:   ( ) jawna  ( ) poufna  ( ) tajna
Uwagi Dowódcy:  [jedno zdanie, opcjonalne — trafia do AI jako kontekst]
```

Pole „Przeznaczenie” jest wyborem politycznym, nie technicznym. Ten sam satelita może zostać zgłoszony jako naukowy albo obronny — i ta decyzja ma konsekwencje dla WF, Nastawienia frakcji i Rejestru.

### 18.4. Analiza Spójności Wydatków

Raz w roku silnik porównuje Linie Budżetowe zadeklarowane przez Andersona z faktycznymi wydatkami w KSP (koszty pojazdów według przeznaczenia, inwestycje w obiekty, badania). Duża rozbieżność ma konsekwencje:

- frakcja, której przydzielono dużo, a wydano mało, nie protestuje — ale Komisja Środków pyta, gdzie są pieniądze;
- frakcja, której przydzielono mało, a w praktyce realizowano jej cele, zyskuje Wpływ (dowód, że jest niezbędna) i Nastawienie;
- rozbieżność powyżej 30% w jednej linii tworzy zegar „Kontrola Kongresu” z 2 segmentami.

Mechanizm nie karze gracza za elastyczność. Karze za rozbieżność między tym, co Anderson mówi, a tym, co robi.

## 19. Kanał zapisu i tryby integracji

Kanał zapisu jest najtrudniejszą częścią projektu, dlatego gra obsługuje trzy tryby. Gracz wybiera tryb na początku kampanii; zmiana trybu w trakcie jest możliwa tylko w stronę wyższego poziomu.

### 19.1. Tryb Honorowy

- Silnik nie modyfikuje pliku zapisu.
- Korekty budżetowe, embarga i inne ograniczenia są wyświetlane w Rozkazie Kwartalnym jako zobowiązania.
- Gracz sam stosuje Korekty, np. przez konsolę lub ustawienia trudności, i potwierdza to w meta-grze.
- Weryfikacja odczytu działa w pełni — silnik wykrywa naruszenia Dyrektyw poziomu W.

Zastosowanie: prototyp, pierwszy kontakt z grą, gracze, którzy nie chcą narzędzi modyfikujących zapis.

### 19.2. Tryb Zapisu (domyślny dla wersji 1.0)

- Między sesjami silnik modyfikuje kopię pliku zapisu: dodaje lub odejmuje fundusze, może zmienić parametry wpływające na tempo budowy lub badań **[DO WERYFIKACJI: które parametry RP-1 są bezpiecznie edytowalne w zapisie]**.
- Każda modyfikacja jest zapisywana w dzienniku i odwracalna przez przywrócenie kopii.
- Przed modyfikacją silnik tworzy kopię zapasową i sprawdza zgodność wersji.
- Embarga i wymagania dostawcy pozostają weryfikowane odczytem (naruszenie jest wykrywane i karane, ale nie blokowane).

Zastosowanie: pełna rozgrywka bez instalowania dodatkowego modu.

### 19.3. Tryb Modu (cel długoterminowy)

- Niewielki mod KSP komunikuje się z meta-grą.
- Mod może wyświetlać Rozkaz Kwartalny w grze, blokować części objęte embargiem w edytorze pojazdów, rejestrować zdarzenia na żywo i oznaczać ładunki przeznaczeniem.
- Meta-gra pozostaje osobnym programem; mod jest tylko interfejsem.

Zastosowanie: wersja docelowa po zweryfikowaniu pętli w trybie Zapisu.

### 19.4. Zasada bezpieczeństwa zapisu

Silnik nigdy nie modyfikuje pliku zapisu, gdy KSP jest uruchomione, nigdy nie modyfikuje pliku bez kopii zapasowej i nigdy nie dotyka danych, których znaczenia nie zna. Lista edytowalnych pól jest białą listą w pliku konfiguracyjnym. Jeśli plik zapisu nie przejdzie walidacji, silnik przechodzi na ten kwartał w tryb Honorowy i informuje gracza.

## 20. Mapowanie systemów RP-1

### 20.1. Zasada „obudowy, nie zastępstwa”

RP-1 posiada już własne systemy zarządcze: programy finansowane w czasie, zaufanie i reputację, liderów administracyjnych, czas budowy, niezawodność silników oraz kontrakty odwzorowujące historyczne kamienie milowe **[DO WERYFIKACJI: aktualny zakres w wersji docelowej]**. Meta-gra nie powiela tych systemów. Każdy z nich zostaje przypisany do elementu meta-gry, który nadaje mu znaczenie polityczne.

### 20.2. Tabela mapowania

| System RP-1 | Element meta-gry | Jak działa połączenie |
|---|---|---|
| **Programy** | Sponsor frakcyjny | Każdy program RP-1 ma w pliku mapowania frakcję-sponsora. Przyjęcie programu = zobowiązanie wobec frakcji; jego zakończenie z sukcesem = Nastawienie +; porzucenie = Uraza. |
| **Kontrakty i kamienie milowe** | Bilans Wyścigu, Dyrektywy | Kontrakty historyczne RP-1 są mapowane na kamienie milowe z Aneksu C. |
| **Reputacja / zaufanie RP-1** | Źródło sygnału dla PP i ZW | Wzrost reputacji RP-1 podnosi PP; meta-gra nie modyfikuje reputacji RP-1 bezpośrednio. |
| **Liderzy administracji** | Gabinet i frakcje | Wybór lidera w RP-1 może być zgłoszony jako decyzja kadrowa; lider o profilu wojskowym wzmacnia DPO itd. (opcjonalne, mapowanie w pliku danych). |
| **Czas budowy i badań** | Linie Budżetowe, Dary DOI i RN | W trybie Zapisu Dary i Dźwignie mogą tymczasowo modyfikować tempo. |
| **Niezawodność silników** | Dyrektywy niezawodności, ocena ryzyka, śledztwa | Dane o testach i awariach silników są wejściem dla BLZ i Dyrektora Bezpieczeństwa Misji. |
| **Konfiguracje silników i części** | Udziały PRZ | Plik mapowania przypisuje rodziny silników i części do trzech koncernów. |
| **Astronauci** | Korpus Astronautów, postaci | Wybrani astronauci RP-1 stają się nazwanymi postaciami meta-gry. |

### 20.3. Mapowanie producentów

Plik `mapping/manufacturers.yaml` przypisuje rodziny silników i typy części do koncernów. Przypisanie jest konfigurowalne, bo zależy od zestawu modów gracza. Przykład:

```yaml
pacific_astrodyne:
  rodziny_silnikow: [LR-79, H-1, LR-87, F-1, J-2]
  typy_czesci: [zbiorniki_duze]
keystone_propulsion:
  rodziny_silnikow: [silniki_stale_*, AJ10]
  typy_czesci: [sterowanie, awionika]
hollis_ward:
  rodziny_silnikow: []
  typy_czesci: [kapsuly, oslony_termiczne, systemy_podtrzymania]
```

### 20.4. Ładunki oznaczone

Aby Dyrektywy mogły odróżnić satelitę DPO od satelity RN, gracz oznacza ładunek przez **konwencję nazewniczą** pojazdu (np. prefiks `DPO-`, `RN-`, `BLZ-`, `ALL-` dla sojuszników). W trybie Modu oznaczenie odbywa się w edytorze. Konwencja jest prosta, sprawdzalna i nie wymaga żadnej modyfikacji KSP.

## 21. Wypadki i śledztwa

### 21.1. Klasyfikacja zdarzeń

| Klasa | Przykład | Rozgłos domyślny |
|---|---|---|
| **Awaria testowa** | Nieudany test silnika, rozpad rakiety bez ładunku | Niski |
| **Awaria misji** | Utrata satelity, nieosiągnięcie orbity | Średni |
| **Wypadek naziemny** | Eksplozja na wyrzutni, pożar w zakładzie | Wysoki |
| **Utrata załogi** | Śmierć astronautów w locie lub podczas testu | Krytyczny |

Rozgłos domyślny jest modyfikowany przez to, czy start był zapowiadany publicznie (każdy start z przeznaczeniem „załogowe” jest publiczny), przez PP i przez aktywne Dochodzenia prasowe.

### 21.2. Komisja Badania Wypadku

Po zdarzeniu klasy Wypadek naziemny lub Utrata załogi Anderson musi powołać Komisję. To specjalna sekwencja decyzji rozłożona na 1–3 kwartały:

1. **Skład komisji** — wewnętrzna (szybka, kontrolowana, mało wiarygodna), mieszana (z udziałem Kongresu) lub niezależna (powolna, wiarygodna, nieprzewidywalna).
2. **Hipoteza wiodąca** — silnik generuje 2–4 możliwe przyczyny na podstawie danych z KSP (np. awaria konkretnego silnika, błąd konstrukcji, pośpiech, zaniedbania infrastruktury). Jedna z nich jest „prawdziwa” w warstwie faktycznej — często jest nią ta, na którą wskazują dane z KSP, ale mogą istnieć przyczyny ukryte, np. zignorowane ostrzeżenie DOI zapisane w Rejestrze.
3. **Odpowiedzialność** — na kogo spada wina: na koncern, na dyrektoriat, na konkretną osobę, na „okoliczności” albo na Andersona.
4. **Raport publiczny** — pełny, częściowy lub zafałszowany. Każda wersja inna niż pełna tworzy Tajemnicę.

### 21.3. Przerwa w lotach

Po Utracie załogi program załogowy jest automatycznie zawieszony do czasu zakończenia prac Komisji. Gracz może skrócić zawieszenie Decyzją wykonawczą, ale BLZ zapamiętuje to jako Urazę, a każdy kolejny problem w tym programie ma podwojony rozgłos. To mechaniczne odwzorowanie realnej presji po katastrofach: przerwa kosztuje czas w wyścigu, a jej skrócenie kosztuje zaufanie ludzi, którzy będą latać.

## 22. Zasady uczciwości

### 22.1. Problem cofania lotów

KSP pozwala cofnąć lot lub wczytać wcześniejszy stan. Meta-gra nie może tego technicznie zablokować w trybach Honorowym i Zapisu. Dlatego gra definiuje jawną umowę z graczem.

### 22.2. Trzy poziomy dyscypliny

| Poziom | Zasada | Nagroda |
|---|---|---|
| **Swobodny** | Cofanie dozwolone | Brak; Ocena Historyczna oznaczona jako „symulacja” |
| **Standardowy** | Cofanie dozwolone wyłącznie przed oderwaniem od wyrzutni (błędy w edytorze, złe ustawienia) | Pełna Ocena Historyczna |
| **Archiwalny** | Brak cofania; jeden zapis kariery | Odznaczenie „Akta zamknięte”; dodatkowe zakończenia epilogu |

### 22.3. Sygnalizowanie rozbieżności

Silnik nie oskarża gracza, ale wykrywa nietypowe wzorce (np. przeskoki daty w zapisie, nagłe zniknięcie pojazdów z historii lotów). W trybie Archiwalnym takie wzorce są wyświetlane jako ostrzeżenie. Zasada projektowa jest prosta: gra traktuje gracza jak dorosłego, który wybrał własny poziom uczciwości, i nie buduje wokół tego mechanik kary.

---

# CZĘŚĆ VI — ZDARZENIA, KRYZYSY, ZAKOŃCZENIA

## 23. Architektura zdarzeń i decyzji

### 23.1. Przepływ zdarzenia

```
WYZWALACZ  ──►  SZABLON ZDARZENIA  ──►  WYPEŁNIENIE (silnik)  ──►  RENDER (AI)  ──►  DECYZJA  ──►  SKUTKI (silnik)
(stan, zegar,     (dane: warunki,        (postaci, liczby,          (dokument,        (wybór        (wskaźniki,
 Rejestr, KSP)     opcje, skutki)          kontekst)                  głosy)            gracza)        Rejestr, zegary)
```

Każde zdarzenie w grze przechodzi przez ten łańcuch. AI uczestniczy tylko w kroku „Render”. Szablon i skutki są danymi.

### 23.2. Źródła zdarzeń

| Źródło | Udział | Przykład |
|---|---|---|
| **Następstwa KSP** | ~35% | Awaria, sukces, kamień milowy, rozbieżność wydatków |
| **Rejestr** | ~20% | Wyzwolona Tajemnica, upomnienie się o Dług, Uraza |
| **Zegary** | ~20% | Eskalacja frakcji, publikacja prasowa, przesłuchanie |
| **Model ZSRR i wywiad** | ~10% | Nowa Ocena, radziecki sukces, Zwrot |
| **Kalendarz i epoka** | ~10% | Sesja Budżetowa, wybory, zdarzenia geopolityczne |
| **Pula tła** | ~5% | Drobne zdarzenia z życia organizacji, budujące postaci |

Udziały są wartościami docelowymi do strojenia. Najważniejsze: **zdarzenia losowe z puli tła nigdy nie przekraczają 10% w kwartale**. Świat ma reagować na gracza, nie generować przypadkowe trudności.

### 23.3. Decyzje

Każda decyzja ma 2–4 opcje. Każda opcja ma:

- **Typ** — jeden z sześciu, wpływający na Reputację Stylu:

| Typ | Opis | Oś Reputacji |
|---|---|---|
| **Kompromis** | Każdy dostaje część | Orientacja → Polityk |
| **Siła** | Anderson narzuca rozwiązanie | Lojalność → Bezwzględny |
| **Zwłoka** | Odroczenie; tworzy lub przesuwa zegar | — |
| **Zatajenie** | Ukrycie informacji; tworzy Tajemnicę | Jawność → Skryty |
| **Ujawnienie** | Prawda za cenę | Jawność → Otwarty |
| **Poświęcenie** | Anderson bierze koszt na siebie | Lojalność → Opiekun |

- **Koszt jawny** — widoczny przed wyborem (UD, KP, budżet, natychmiastowe zmiany wskaźników).
- **Ryzyko opisowe** — przedstawione słowami, nie liczbami („Brandt tego nie zapomni”, „prasa może zacząć pytać”).
- **Skutki ukryte** — znane tylko silnikowi: wpisy Rejestru, zmiany zegarów, wpływ na postaci.

Zasada: gracz zawsze wie, **co** płaci od razu, i zwykle wie, **jakiego rodzaju** ryzyko podejmuje, ale nie zna jego dokładnej wielkości.

### 23.4. Opcja trzecia

W około jednej trzeciej decyzji istnieje opcja dostępna tylko pod warunkiem: posiadania haka, określonej postaci w Gabinecie, wysokiego Nastawienia frakcji, odpowiedniej Opinii Andersona albo technicznego osiągnięcia w KSP. Opcje warunkowe są widoczne jako zablokowane z podanym warunkiem. To główny sposób nagradzania gracza za budowanie zasobów niematerialnych.

### 23.5. Łańcuchy zdarzeń

Szablon może wskazywać następnika: zdarzenie, które pojawi się w kolejnych kwartałach w zależności od wybranej opcji. Łańcuchy mają maksymalną długość 4 ogniw, a każde ogniwo musi mieć wyjście, które zamyka łańcuch. Zapobiega to sytuacji, w której gracz utknie w niekończącym się wątku.

## 24. Kryzysy

### 24.1. Definicja

Kryzys to zdarzenie wieloetapowe z własnym zegarem, które zajmuje uwagę gracza przez 2–6 kwartałów. W danym momencie aktywne mogą być najwyżej dwa kryzysy. Jeśli silnik chce uruchomić trzeci, najsłabszy z kandydatów zamienia się w zwykłe zdarzenie.

### 24.2. Struktura kryzysu

Każdy kryzys ma:

- **Zegar kryzysu** (4–8 segmentów);
- **Etapy** — opisane w szablonie, wyzwalane co 2 segmenty;
- **Wyjścia** — warunki rozwiązania (pozytywne, kompromisowe, katastrofalne);
- **Akcje kryzysowe** — dodatkowe akcje Biurka dostępne tylko w czasie kryzysu.

### 24.3. Katalog kryzysów (wersja startowa)

| Kryzys | Wyzwalacz | Istota dylematu |
|---|---|---|
| **Szok orbitalny** | ZSRR jako pierwszy osiąga kamień milowy o Wadze ≥ 4 | Pieniądze rosną, ale Waszyngton przejmuje kontrolę; szybka odpowiedź kontra solidna odpowiedź |
| **Katastrofa na wyrzutni** | Wypadek naziemny | Prawda o zaniedbaniach kontra osłona ludzi i instytucji |
| **Utrata załogi** | Śmierć astronautów | Przerwa w lotach kontra wyścig; odpowiedzialność; rodziny; Korpus |
| **Przesłuchania w Kongresie** | Zegar Kontroli Kongresu | Co powiedzieć pod przysięgą; Tajemnice wystawione na próbę |
| **Przeciek** | Ujawnienie Tajemnicy lub Intryga typu Przeciek | Szukanie winnego kontra ograniczanie szkód |
| **Afera szpiegowska** | Zdarzenie wywiadowcze; niskie Nastawienie BAS | Polowanie na czarownice kontra ryzyko prawdziwego kreta |
| **Bunt Korpusu** | Cierpliwość BLZ w stadium Buntu | Ustąpienie astronautom (Precedens) kontra autorytet |
| **Wojna kontraktowa** | Dwa koncerny w konflikcie o duży kontrakt | Wybór dostawcy jako decyzja polityczna, nie techniczna |
| **Przewrót w Gabinecie** | Intryga typu Przejęcie | Walka o własne stanowisko |
| **Kryzys globalny** | NG = 1 | Patrz 24.5 |

### 24.4. Przykład: Szok orbitalny

**Etap 1 (wyzwolenie).** ZSRR ogłasza sukces. Teczka zawiera nadzwyczajne memorandum z Białego Domu, nagłówki prasy i depeszę BAS z pytaniem, dlaczego wywiad tego nie przewidział. ZW −10, PP −8. Budżet na następny rok: +30%, ale Waszyngton powołuje **Komitet Nadzoru**, który będzie co kwartał wydawał jedną obowiązkową Dyrektywę.

**Etap 2 (presja).** Każda frakcja przedstawia własną „odpowiedź”: DPO chce satelity wojskowego, RN chce satelity naukowego z jawnymi danymi, BLZ chce przyspieszenia programu załogowego, PRZ chce dużego kontraktu na nową rakietę. Gracz może poprzeć jedną, połączyć dwie (Kompromis) albo przedstawić własną (Siła).

**Etap 3 (odpowiedź).** Pierwsza misja odpowiedzi musi wystartować przed końcem zegara. Jeśli się uda — Szok się kończy, Komitet Nadzoru zostaje rozwiązany po 4 kwartałach. Jeśli się nie uda — publiczna porażka, ZW −10, a Komitet Nadzoru staje się stały.

**Wyjście katastrofalne.** Druga porażka w czasie trwania kryzysu powoduje przesłuchanie Andersona i test odwołania.

### 24.5. Kryzys globalny

Gdy NG spada do 1, gra wchodzi w fazę specjalną trwającą 1–2 kwartały. Program cywilny zostaje zamrożony, DPO przejmuje faktyczną kontrolę nad częścią zasobów, a Anderson dostaje serię decyzji o wysokiej stawce: udostępnienie infrastruktury wojsku, wykorzystanie satelitów rozpoznawczych, komunikaty publiczne. Kryzys kończy się deeskalacją (NG wraca do 3) albo — w bardzo rzadkim przypadku i wyłącznie przy serii decyzji eskalacyjnych gracza — zakończeniem specjalnym „Zimna wojna przestaje być zimna”, które kończy kampanię bez oceny zwycięstwa. Gra nie przedstawia graficznie konfliktu nuklearnego; zakończenie ma formę zamkniętej teczki i krótkiego epilogu.

## 25. Zakończenia i Ocena Historyczna

### 25.1. Hierarchia warunków

Dokument wizji zostawił hierarchię celów otwartą. Ten projekt ustala ją następująco:

1. **Najpierw porażka polityczna.** Odwołanie Andersona kończy kampanię natychmiast, niezależnie od Bilansu Wyścigu. Uzasadnienie: gra jest o zarządzaniu organizacją, a dowódca, który stracił stanowisko, nie ma już organizacji.
2. **Potem stan organizacji.** Rozpad NA-AXO nie kończy kampanii, ale zmienia jej charakter (25.3).
3. **Na końcu wyścig.** Bilans Wyścigu jest oceniany dopiero na końcu kampanii, razem z pozostałymi osiami Oceny Historycznej.

### 25.2. Zakończenia przedwczesne

| Zakończenie | Warunek | Charakter |
|---|---|---|
| **Odwołanie** | ZW = 0 albo negatywny wynik testu odwołania (przesłuchania, Zmiana Administracji, wyjście katastrofalne kryzysu) | Teczka zamknięta; epilog opisuje, co następca zrobił z organizacją |
| **Dymisja honorowa** | Anderson sam rezygnuje (dostępne zawsze) | Epilog zależny od stanu organizacji w chwili odejścia |
| **Zimna wojna przestaje być zimna** | Patrz 24.5 | Bez oceny |

### 25.3. Rozpad organizacji

Przy SO = 0 NA-AXO rozpada się na części. Najsilniejsza frakcja (najwyższy Wpływ) przejmuje rdzeń organizacji, a Anderson zostaje — o ile ZW > 30 — szefem tego, co zostało. Gra toczy się dalej w wariancie **Militaryzacja** (jeśli przejmuje DPO), **Agencja Cywilna** (RN lub BLZ) albo **Państwo Kontraktorów** (PRZ). Każdy wariant ma zmienione wskaźniki startowe, inną pulę zdarzeń i inne możliwe zakończenia. Rozpad jest więc kontynuacją historii, a nie ekranem porażki — zgodnie z zasadą Z10.

### 25.4. Ocena Historyczna

Na końcu kampanii (31 grudnia 1975 roku albo w kwartale dobrowolnej rezygnacji po roku 1969) silnik oblicza Ocenę Historyczną w czterech osiach:

| Oś | Co mierzy | Główne składniki |
|---|---|---|
| **Wyścig** | Wynik rywalizacji z ZSRR | Bilans Wyścigu, Bilans Strategiczny, kamienie milowe kategorii Księżyc i Stacje |
| **Instytucja** | W jakim stanie Anderson zostawia organizację | SO, liczba frakcji w Buncie, stan infrastruktury, ciągłość programów |
| **Ludzie** | Koszt ludzki programu | Utraty załóg, wypalone i zniszczone kariery, dotrzymane obietnice wobec kadry |
| **Prawda** | Stosunek tego, co ukryto, do tego, co ujawniono | Tajemnice ukryte do końca, ujawnione przymusowo, ujawnione dobrowolnie |

Każda oś otrzymuje ocenę od 1 do 5. Kombinacja ocen wybiera tytuł zakończenia z macierzy (np. „Architekt zwycięstwa”, „Zwycięstwo za każdą cenę”, „Uczciwy przegrany”, „Człowiek, który utrzymał wszystko razem”, „Twórca imperium cieni”). Macierz zawiera 20–30 tytułów; żaden nie jest jednoznacznie najlepszy.

### 25.5. Epilog odtajnienia

Po Ocenie Historycznej następuje **Odtajnienie**: sekwencja trzech krótkich dokumentów datowanych na lata 1985, 2000 i 2025. Silnik przegląda Rejestr i dla każdej Tajemnicy, która przetrwała kampanię, wykonuje test ujawnienia zależny od jej wagi i Ciśnienia. Ujawnione po latach Tajemnice mogą zmienić tytuł zakończenia — Anderson, który za życia był bohaterem, może w 2025 roku stać się tematem krytycznej książki historycznej. Albo odwrotnie: kontrowersyjna decyzja, którą podjął samotnie, po odtajnieniu dokumentów okazuje się słuszna.

Epilog jest jedynym miejscem w grze, w którym AI może zobaczyć pełną warstwę faktyczną, bo gra już się skończyła i nie ma czego chronić.

---

# CZĘŚĆ VII — AI JAKO MISTRZ GRY

## 26. Rola AI

AI pełni w grze trzy funkcje:

1. **Narrator** — zamienia zdarzenia i stan gry w dokumenty: memoranda, depesze, stenogramy, wycinki prasowe, notatki odręczne.
2. **Głos postaci** — nadaje każdej nazwanej postaci rozpoznawalny sposób mówienia, zgodny z jej cechami, Lojalnością i historią z Rejestru.
3. **Analityk** — na prośbę gracza może przygotować analizę sytuacji „z perspektywy” wybranej postaci (np. „Jak Ames ocenia ryzyko tej decyzji?”), korzystając wyłącznie z wiedzy, którą ta postać posiada.

AI **nie** pełni funkcji sędziego. Nie rozstrzyga wyników testów, nie zmienia wskaźników, nie decyduje o ruchach ZSRR, nie tworzy samodzielnie faktów, które miałyby znaczenie mechaniczne.

## 27. Kontrakt AI

### 27.1. Wejście: Pakiet Kontekstu

Na każde wywołanie silnik przygotowuje Pakiet Kontekstu o stałej strukturze:

```json
{
  "kwartal": "1959-Q3",
  "epoka": "II",
  "zadanie": "render_zdarzenia",
  "zdarzenie": {
    "szablon": "awaria_startowa_publiczna",
    "fakty": { "pojazd": "RN-Vanguard-3", "przyczyna_wg_danych": "awaria stopnia 2", "publiczny_start": true },
    "opcje_decyzji": [ { "id": "A", "typ": "ujawnienie", "koszt_jawny": "PP -4" }, { "id": "B", "typ": "zatajenie", "koszt_jawny": "brak" } ]
  },
  "stan_widoczny": { "ZW": 54, "SO": 61, "PP": 47, "WF": 58, "NG": 4, "bilans_widziany": -4 },
  "postaci": [ { "id": "brandt", "karta_glosu": "...", "lojalnosc": 1, "cechy": ["wizjoner","pedant"] } ],
  "rejestr_widoczny": [ "R-0031", "R-0042" ],
  "oceny_wywiadu": [ "..." ],
  "kronika_streszczenie": "...",
  "ograniczenia": { "dlugosc_slow": 350, "format": "memorandum", "jezyk": "pl" }
}
```

Pakiet nigdy nie zawiera warstwy faktycznej ZSRR ani ukrytych wpisów Rejestru, z jednym wyjątkiem: **sygnałów**. Gdy silnik chce, by AI wplotło w tekst subtelną wskazówkę dotyczącą Intrygi lub ukrytego wpisu, przekazuje ją jako osobne pole `sygnal` z dokładnie określoną treścią („Kowalczyk widziany na kolacji z senatorem Whitfieldem”). AI może ją ubrać w słowa, ale nie rozszerzyć.

### 27.2. Wyjście: struktura odpowiedzi

AI zwraca odpowiedź w dwóch częściach:

```json
{
  "dokumenty": [
    { "typ": "memorandum", "nadawca": "brandt", "klauzula": "poufne", "tytul": "...", "tresc": "..." }
  ],
  "opisy_opcji": { "A": "...", "B": "..." },
  "propozycje": [
    { "rodzaj": "wpis_rejestru", "typ": "uraza", "strony": ["brandt","anderson"], "uzasadnienie": "..." }
  ]
}
```

Pole `propozycje` pozwala AI zasugerować trwałą konsekwencję, która wynika z narracji (np. postać była wyraźnie urażona w tekście). Silnik waliduje każdą propozycję według reguł: czy jest zgodna z szablonem, czy nie przekracza limitów, czy postaci istnieją. Odrzucona propozycja nie zostawia śladu w tekście, bo dokument nie powinien twierdzić, że coś się wydarzyło, zanim silnik to zatwierdził.

### 27.3. Zakazy twarde

AI nie może:

- podawać liczb wskaźników innych niż przekazane w Pakiecie;
- ogłaszać radzieckich osiągnięć, które nie są w Pakiecie;
- uśmiercać, zwalniać ani awansować postaci;
- tworzyć nowych postaci z imieniem i nazwiskiem bez polecenia silnika (może tworzyć anonimowe tło: „rzecznik Pentagonu”, „korespondent z Chicago”);
- zmieniać treści dokumentów raz już wygenerowanych;
- zwracać się do gracza poza fikcją, chyba że zadaniem jest analiza na prośbę gracza.

### 27.4. Walidacja

Każda odpowiedź przechodzi przez walidator, który sprawdza strukturę, długość, obecność zakazanych elementów (np. liczb niezgodnych z Pakietem, nazwisk spoza listy postaci) i zgodność klauzuli dokumentu z jego treścią. Odpowiedź niezgodna zostaje wygenerowana ponownie, a po dwóch nieudanych próbach silnik używa prostego szablonu tekstowego. Gra działa także bez AI — mniej barwnie, ale poprawnie.

## 28. Pamięć i ciągłość

### 28.1. Trzy warstwy pamięci

| Warstwa | Zawartość | Kto ją utrzymuje |
|---|---|---|
| **Rejestr i stan** | Fakty o znaczeniu mechanicznym | Silnik |
| **Kronika** | Chronologiczny dziennik zdarzeń: jedno–dwa zdania na zdarzenie | Silnik (z szablonów), uzupełniany krótkimi streszczeniami AI |
| **Archiwum** | Pełne teksty wszystkich wygenerowanych dokumentów | Silnik przechowuje, AI tworzy |

### 28.2. Streszczenia epok

Kampania RP-1 trwa dziesiątki lub setki godzin, więc pełna historia nigdy nie zmieści się w kontekście modelu. Silnik przekazuje AI:

- pełną Kronikę bieżącego roku;
- streszczenie każdego zakończonego roku (ok. 150 słów);
- streszczenie każdej zakończonej epoki (ok. 300 słów);
- **Karty Głosu** postaci biorących udział w zdarzeniu, z listą trzech najważniejszych wspomnień tej postaci z Rejestru.

Streszczenia generuje AI na zakończenie roku, ale silnik je zatwierdza i zamraża. Od tej chwili stanowią kanon.

### 28.3. Karta Głosu

Każda nazwana postać ma Kartę Głosu — krótki opis, który utrzymuje spójność jej wypowiedzi przez lata:

```yaml
postac: delaney
rejestr_jezykowy: "krótkie zdania, techniczny żargon lotniczy, zero ozdobników"
nawyki: ["zaczyna od faktów, kończy prośbą", "używa liczb zamiast przymiotników"]
stosunek_do_andersona: "szacunek zawodowy; nieufność od czasu R-0057"
czego_nigdy_nie_powie: ["że lot jest bezpieczny, jeśli nie jest"]
wspomnienia_kluczowe: [R-0057, R-0063, R-0071]
```

## 29. Głos, ton i formaty dokumentów

### 29.1. Ton

Język gry to język instytucji połowy XX wieku: rzeczowy, oszczędny, pełen eufemizmów biurokratycznych tam, gdzie ludzie chcą coś ukryć, i nagle bardzo prosty tam, gdzie chodzi o życie. AI unika patosu, wielkich słów i komentarza moralnego. Napięcie ma wynikać z treści, nie z przymiotników.

### 29.2. Formaty dokumentów

| Format | Zastosowanie | Cechy |
|---|---|---|
| **Memorandum** | Komunikacja frakcji i postaci | Nagłówek DO/OD/DOTYCZY, klauzula, 150–400 słów |
| **Depesza wywiadowcza** | Oceny BAS | Styl telegraficzny, kody wiarygodności, wielkie litery w nagłówku |
| **Stenogram** | Przesłuchania, spotkania | Dialog z oznaczeniami mówców, wtrącenia protokolanta |
| **Wycinek prasowy** | Reakcje mediów | Nagłówek, lead, 100–200 słów; tytuły fikcyjne |
| **Notatka odręczna** | Prywatne sygnały, ostrzeżenia, prośby | 1–3 zdania, bez klauzuli |
| **Raport Sytuacyjny** | Odprawa kwartalna | Struktura punktowa, autor: Szef Gabinetu |
| **Rozkaz Kwartalny** | Wynik fazy Biurka | Generowany przez silnik, nie przez AI |

### 29.3. Przykład dokumentu

```
NA-AXO / RADA NAUKOWA                                   KLAUZULA: POUFNE
DO:      E. Anderson, Dowódca Operacyjny
OD:      dr E. Brandt
DOTYCZY: Start RN-Vanguard-3, 14 sierpnia
DATA:    16 sierpnia 1959

Panie Dowódco,

stopień drugi przestał pracować w 94. sekundzie. Dane telemetryczne nie
pozostawiają wątpliwości co do momentu, choć pozostawiają je co do przyczyny.

Pragnę zwrócić uwagę na jedną okoliczność. Dwa miesiące temu prosiłem
o dodatkowy cykl testów tego stopnia. Odpowiedziano mi, że harmonogram
na to nie pozwala. Nie piszę tego, by kogokolwiek obwiniać. Piszę to,
ponieważ Komisja zapyta, a ja nie zamierzam kłamać.

Proponuję, abyśmy uzgodnili wspólne stanowisko przed czwartkiem.

E.B.
```

Dokument zawiera fakty z Pakietu (pojazd, data, awaria stopnia drugiego), odwołuje się do wpisu z Rejestru (wcześniejsza odmowa dodatkowych testów) i przygotowuje decyzję (wspólne stanowisko — Ujawnienie lub Zatajenie), nie podając przy tym żadnej liczby wskaźnika.

---

# CZĘŚĆ VIII — PREZENTACJA, BALANS, PRODUKCJA

## 30. Interfejs

### 30.1. Zasada diegetyczności

Interfejs udaje fizyczne biuro z lat pięćdziesiątych i sześćdziesiątych: teczki, maszynopisy, pieczątki klauzul, kalendarz ścienny, telefon. Wskaźniki są pokazane jako mierniki na tablicy, zegary jako tarcze z segmentami. Wszystkie elementy diegetyczne mają też tryb czytelny — z jasnymi etykietami i liczbami — włączany jednym przełącznikiem. Estetyka nie może utrudniać decyzji.

### 30.2. Ekrany

| Ekran | Zawartość |
|---|---|
| **Biurko** (hub) | Pięć wskaźników, UD i KP, teczka bieżącego kwartału, telefon (Decyzje Natychmiastowe), przycisk „Zatwierdź kwartał” |
| **Teczki** | Karty frakcji i postaci: Wpływ, Nastawienie, Agenda, Cierpliwość, znane cechy, relacje, wpisy Rejestru |
| **Mapa Wyścigu** | Tor Bilansu, kamienie milowe obu stron, Oceny wywiadowcze z kodami wiarygodności, szacowane zegary projektów ZSRR (jako przedziały) |
| **Rejestr** | Lista wpisów z filtrem typu; Tajemnice z miernikiem Ciśnienia |
| **Zegary** | Wszystkie widoczne zegary i ich powiązania |
| **Archiwum** | Wszystkie dokumenty, przeszukiwalne; Kronika |
| **Kalendarz** | Terminy Dyrektyw, Obietnic, Sesji Budżetowych, wyborów |

### 30.3. Rozkaz Kwartalny poza aplikacją

Rozkaz Kwartalny można wydrukować, wyświetlić na drugim monitorze albo — w trybie Modu — zobaczyć w KSP. To jedyny element meta-gry, który musi być czytelny w trakcie gry w hangarze.

## 31. Balans i krzywa trudności

### 31.1. Cele balansu

1. Gracz nie może jednocześnie zadowolić wszystkich frakcji przez więcej niż 2–3 kwartały.
2. Żadna pojedyncza strategia (np. „zawsze wspieraj DPO”) nie może prowadzić do najwyższej oceny we wszystkich czterech osiach.
3. Gracz o przeciętnej sprawności w KSP może przejść kampanię; gracz o wysokiej sprawności w KSP ma łatwiej, ale nie jest zwolniony z zarządzania.
4. Pojedyncza katastrofa nie kończy kampanii; seria katastrof przy złym zarządzaniu — może.

### 31.2. Poziomy trudności

Poziomy trudności są nazwane jak poziomy dostępu do informacji niejawnych:

| Poziom | Zmiany |
|---|---|
| **Poufny** | UD 7; Cierpliwość frakcji 8 segmentów; Oceny wywiadu o jeden stopień wiarygodniejsze; przeciwnik w trybie Historycznym |
| **Tajny** (domyślny) | Wartości bazowe z dokumentu |
| **Ściśle tajny** | UD 5; Ciśnienie Tajemnic rośnie szybciej; frakcje częściej wchodzą w Intrygi; przeciwnik w trybie Adaptacyjnym; Komisja Środków bardziej surowa |

Poziom trudności meta-gry jest niezależny od ustawień trudności RP-1.

### 31.3. Szok i Samozadowolenie

Krzywa trudności wynika z historycznego mechanizmu reakcji Waszyngtonu na wyścig, a nie ze sztucznego „gumowania” wyniku:

- **Szok** (Bilans widziany < −8 albo radzieckie pierwszeństwo w kamieniu o Wadze ≥ 4): budżet rośnie o 20–40%, ale Waszyngton nakłada Komitet Nadzoru, obowiązkowe Dyrektywy i krótsze terminy. Przegrywający gracz dostaje pieniądze i traci swobodę.
- **Samozadowolenie** (Bilans widziany > +10 przez 4 kolejne kwartały): budżet spada o 10–25%, PP przestaje rosnąć, a Kongres zaczyna pytać o sens wydatków. Wygrywający gracz zachowuje swobodę i traci pieniądze.

W obu przypadkach gracz ma narzędzia przeciwdziałania: w Szoku — szybkie, spektakularne sukcesy, które rozwiązują Komitet; w Samozadowoleniu — nowe cele (Stacje, Planety), ostrzeżenia BAS o radzieckich programach (prawdziwe lub przesadzone) i lobbing.

### 31.4. Strojenie

Każda wartość liczbowa w dokumencie trafia do pliku konfiguracyjnego. Playtesty mają mierzyć przede wszystkim:

- odsetek kwartałów, w których gracz wydał wszystkie UD i nadal miał nierozwiązane ważne sprawy (cel: 70–85%);
- rozkład opcji wybieranych w decyzjach (sygnał alarmowy: jedna opcja wybierana w ponad 60% przypadków danego szablonu);
- czas trwania fazy meta-gry (cel: zgodnie z Z9);
- odsetek Dyrektyw zrealizowanych, odrzuconych i zawalonych (cel orientacyjny: 55 / 25 / 20%).

## 32. Przykładowa tura

**II kwartał 1960. Tryb Zapisu, poziom Tajny.**

**Stan wyjściowy.** ZW 51, SO 58, PP 44, WF 60, NG 3. Bilans widziany −6: ZSRR był pierwszy z satelitą i z organizmem w kosmosie. Trwa kryzys Szok orbitalny, etap 2. Aktywne Dyrektywy: D-14 (satelita DPO na orbicie polarnej, termin XII 1960), D-19 (Komitet Nadzoru: lot suborbitalny z astronautą do IX 1961), D-21 (Keystone: stopnie górne Keystone do końca roku). Zegary: Cierpliwość RN 4/6, Kontrola Kongresu 2/4.

**Faza 1 — Odprawa.** Szef Gabinetu raportuje, że Sesja Budżetowa rozpocznie się za trzy tygodnie. BAS przesyła Ocenę: *„OKB-1 przygotowuje lot załogowy. Termin: 1960–1961. [C-3, HUMINT]”*. Brandt w memorandum przypomina, że od dwóch lat nie wystrzelono żadnego satelity z wyłącznie naukowym ładunkiem. W notatce odręcznej Ruskin pisze, że wyrzutnia nr 2 „wytrzyma jeszcze kilka startów”. Wycinek prasowy: senator Whitfield pyta publicznie, ile kosztuje odpowiedź na radziecki satelita.

**Faza 2 — Biurko.** Gracz ma 7 UD (6 bazowych i +1 od Zastępcy).

- **Spotkanie z Brandtem** (1 UD). Brandt przedstawia propozycję: satelita naukowy z jawnymi danymi. Gracz obiecuje start w tym roku — Obietnica trafia do Rejestru; Cierpliwość RN cofa się o 2.
- **Lobbing w Waszyngtonie** (2 UD + 1 KP) przed Sesją Budżetową. ZW +4. W tym czasie Zastępca podejmuje decyzję wewnętrzną: zgadza się na nadgodziny ekip DOI.
- **Przegląd techniczny** wyrzutni nr 2 (1 UD). Ujawnia, że stan konstrukcji jest gorszy, niż przedstawił Ruskin; modernizacja zajmie dwa miesiące. Ruskin nie kłamał — jest wypalony i nie chciał być tym, który znowu blokuje harmonogram.
- **Rozmowa z Ruskinem** (1 UD). Gracz daje mu dwa tygodnie urlopu po modernizacji. Lojalność Ruskina +1; Zasługa w Rejestrze.
- **Rozmowa z Kowalczykiem** (1 UD). Astronauta jest serdeczny, ale robi się wymijający, gdy pada nazwisko senatora Whitfielda. To sygnał ukrytej Intrygi, który uważny gracz zapamięta.
- Ostatni 1 UD zostaje niewykorzystany: nie wystarcza na Mediację między DPO a RN.

**Decyzja Sesji Budżetowej**, runda 3, pytanie senatora Whitfielda: „Czy satelity NA-AXO mają przeznaczenie wojskowe?”. Opcje: Zatajenie („Program NA-AXO ma charakter pokojowy”), Ujawnienie częściowe („Część danych jest udostępniana Departamentowi Obrony”), opcja warunkowa (wymaga Nastawienia DPO ≥ 2 — niespełnione). Gracz wybiera Zatajenie. Tajemnica R-0049 „Program rozpoznawczy” zyskuje +1 Ciśnienia; Whitfield staje się jej potencjalnym wyzwalaczem.

**Rozkaz Kwartalny:** D-14, D-21, obietnica wobec RN, modernizacja wyrzutni nr 2, Korekta budżetowa +250 000 (efekt Szoku).

**Faza 3 — Hangar.** Gracz w KSP modernizuje wyrzutnię i wykonuje dwa starty z wyrzutni nr 1: satelita `DPO-Corona-2` osiąga orbitę 81°, a satelita `RN-Explorer-4` zostaje utracony z powodu awarii stopnia górnego Keystone.

**Faza 4 — Rozliczenie.** D-14 zrealizowana: Nastawienie DPO +2, KP +2, WF −3. Awaria satelity RN: Obietnica wobec RN nadal niezrealizowana, Cierpliwość RN +1. Udział Keystone rośnie, ale awaria uruchamia test rozgłosu — średni. Ruch ZSRR (ukryty): projekt lotu załogowego +2 segmenty. Test wykrycia: SIGINT wykrywa nieudany radziecki start — nowa Ocena *[B-2]*.

**Faza 5 — Następstwa.** AI generuje: memorandum Vossa (chłodne gratulacje i nowa propozycja Dyrektywy), memorandum Brandta (rozczarowanie, pytanie o stopnie Keystone), depeszę BAS o radzieckiej awarii oraz wycinek prasowy o „kolejnej amerykańskiej rakiecie w oceanie”. Decyzja Natychmiastowa: komunikat prasowy po utracie satelity RN — czy wskazać Keystone jako winnego (PP +2, Nastawienie PRZ −2, Uraza Keystone), czy przyjąć odpowiedzialność organizacji (PP −2, Lojalność → Opiekun).

Kwartał kończy się w sytuacji, w której każdy wybór w następnym kwartale coś kosztuje: Brandt czeka na drugi satelita, Keystone chce zachować kontrakt, Komitet Nadzoru chce astronauty w kosmosie, a Whitfield zaczyna zadawać pytania.

## 33. Architektura techniczna

### 33.1. Moduły

```
┌──────────────┐   ┌──────────────────┐   ┌─────────────────┐
│ Parser zapisu│──►│  Silnik stanu    │──►│ Generator zdarzeń│
│ (.sfs → JSON)│   │ (reguły, zegary, │   │ (szablony,      │
└──────────────┘   │  wskaźniki, ZSRR)│   │  wyzwalacze)    │
                   └────────┬─────────┘   └────────┬────────┘
┌──────────────┐            │                      │
│ Zapis Korekt │◄───────────┤              ┌───────▼────────┐
│ (tryb Zapisu)│            │              │ Warstwa AI     │
└──────────────┘   ┌────────▼─────────┐    │ (Pakiet → API →│
                   │ Baza stanu       │◄───│  walidator)    │
                   │ (SQLite + JSON   │    └────────────────┘
                   │  migawki)        │
                   └────────┬─────────┘
                   ┌────────▼─────────┐
                   │ Interfejs (lokalna│
                   │ aplikacja webowa) │
                   └──────────────────┘
```

### 33.2. Wybory technologiczne

- **Język silnika:** Python — dobre biblioteki do parsowania, prosty rozwój, łatwe testy.
- **Parser zapisu:** własny parser formatu ConfigNode KSP, z testami na prawdziwych plikach zapisu RP-1.
- **Baza stanu:** SQLite dla danych bieżących oraz migawki JSON każdego kwartału, które umożliwiają analizę, debugowanie i odtworzenie przebiegu.
- **Dane projektowe:** YAML — frakcje, postaci, szablony zdarzeń, Dyrektywy, kamienie milowe, mapowania. Projektant może edytować grę bez programowania.
- **AI:** wywołania API modelu językowego z ustrukturyzowanym wyjściem JSON; model wymienny przez warstwę adaptera.
- **Interfejs:** lokalna aplikacja webowa (np. serwer w Pythonie + front-end w przeglądarce), co ułatwia drugi monitor i ewentualny port.

### 33.3. Determinizm

Wszystkie losowania silnika korzystają z ziarna zapisanego w stanie kampanii. Ten sam stan wejściowy i te same decyzje zawsze dają ten sam wynik mechaniczny. Tekst AI może się różnić, ale fakty — nie. To warunek debugowania, testów automatycznych i uczciwości wobec gracza.

### 33.4. Przykładowy schemat szablonu zdarzenia

```yaml
id: przeciek_koszty
zrodlo: zegar
wyzwalacz: "zegar.dochodzenie_prasowe.koszty == pelny"
warunki: ["epoka >= II"]
fakty: ["koszt_najdrozszego_programu", "koncern_dominujacy"]
uczestnicy: ["rzecznik", "przedstawiciel:koncern_dominujacy", "lacznik_kongres"]
format: ["wycinek_prasowy", "memorandum"]
opcje:
  - id: A
    typ: ujawnienie
    koszt_jawny: { PP: -3 }
    skutki: { ZW: +2, rejestr: [ { typ: precedens, tytul: "Jawność kosztów" } ] }
  - id: B
    typ: zatajenie
    koszt_jawny: {}
    skutki: { rejestr: [ { typ: tajemnica, tytul: "Rzeczywiste koszty programu", waga: 2 } ], zegar: { kontrola_kongresu: +1 } }
  - id: C
    typ: kompromis
    warunek: "nastawienie.PRZ >= 1"
    koszt_jawny: { KP: -1 }
    skutki: { nastawienie: { PRZ: -1 }, PP: -1 }
nastepnik: { B: "przeciek_koszty_dowody" }
```

## 34. Plan produkcji i ryzyka

### 34.1. Fazy

| Faza | Zakres | Cel weryfikacji | Kryterium wyjścia |
|---|---|---|---|
| **0. Prototyp papierowy** | Arkusz stanu + dokument reguł + AI w czacie jako MG; 4 frakcje; prosty zegar ZSRR; Rejestr ręczny; tryb Honorowy | Czy pętla KSP ↔ meta daje napięcie? | 8 kwartałów rozegranych; gracz potrafi wskazać 3 decyzje, które bolały |
| **1. Vertical slice** | Epoka I i początek II (1951–1959); parser zapisu; silnik stanu; 30 szablonów zdarzeń; 6 frakcji; Biurko; Dyrektywy W | Czy systemy działają razem automatycznie? | Kampania 1951–1959 bez ręcznych poprawek stanu |
| **2. Alfa** | Wszystkie epoki; model ZSRR z Doktryną i Zwrotami; wywiad z kodami; kryzysy; tryb Zapisu | Czy przeciwnik i mgła wojny tworzą realne decyzje? | 3 pełne kampanie testowe o wyraźnie różnych przebiegach |
| **3. Beta** | Zakończenia, Ocena Historyczna, epilog odtajnienia, pełny interfejs, ~150 szablonów | Balans i długość sesji | Metryki z 31.4 w zakresie docelowym |
| **4. Wersja 1.0** | Szlif, dokumentacja, konfiguracja dla różnych zestawów modów | — | Wydanie |
| **5. Po wydaniu** | Tryb Modu | Głębsza integracja | — |

### 34.2. Główne ryzyka

| Ryzyko | Prawdopodobieństwo | Skutek | Ograniczenie |
|---|---|---|---|
| Zmiany w RP-1 psują parser lub mapowania | Wysokie | Wysoki | Mapowania w danych; testy na plikach zapisu; tryb Honorowy jako zapasowy |
| Meta-gra staje się zbyt czasochłonna | Średnie | Wysoki | Zasada Z9; limity Dyrektyw, kryzysów i dokumentów; pomiar czasu w playtestach |
| AI generuje treści sprzeczne ze stanem | Średnie | Średni | Kontrakt, walidator, brak dostępu do warstwy faktycznej, szablony zastępcze |
| Pętla KSP → meta jest zbyt słaba („dwie oddzielne gry”) | Średnie | Krytyczny | Prototyp papierowy jako pierwszy test; przewaga Dyrektyw W; Rozkaz Kwartalny |
| Rozrost zakresu | Wysokie | Wysoki | Test trzech dróg (Z2); każdy nowy element wymaga usunięcia lub połączenia innego |
| Kampania za długa, by ją ukończyć | Wysokie | Średni | Możliwość startu od późniejszej epoki z wygenerowanym stanem; dobrowolna rezygnacja po 1969 |
| Gracz ignoruje Raport Misji | Wysokie | Niski | Tryb Zapisu działa bez raportu; raport jest dodatkiem |

### 34.3. Decyzje do podjęcia przed fazą 1

1. Wersja docelowa RP-1 i zakres weryfikacji oznaczonych miejsc **[DO WERYFIKACJI]**.
2. Lista pól pliku zapisu bezpiecznych do edycji w trybie Zapisu.
3. Ostateczne rozwinięcie skrótu NA-AXO i nazwy instytucji.
4. Czy wersja 1.0 ma obsługiwać start kampanii od Epoki II.
5. Wybór modelu AI i budżet wywołań na kwartał.

---

# ANEKSY

## Aneks A — Słownik

| Termin | Znaczenie |
|---|---|
| **Biurko** | Faza decyzyjna kwartału i ekran główny |
| **Bilans Wyścigu** | Tor przewagi w kamieniach milowych, −30 do +30 |
| **Bilans Strategiczny** | Ukryty tor dla kamieni o przeznaczeniu wojskowym |
| **Ciśnienie Ujawnienia** | 0–6; prawdopodobieństwo wyjścia Tajemnicy na jaw |
| **Doktryna** | Rozkład priorytetów ZSRR |
| **Dyrektywa** | Formalne zobowiązanie z celem, terminem i weryfikacją |
| **Hak** | Wiedza jednej postaci o drugiej, możliwa do wykorzystania |
| **Intryga** | Ukryty zegar działań postaci |
| **Kronika** | Chronologiczny dziennik zdarzeń |
| **Migawka** | Znormalizowany stan techniczny na koniec kwartału |
| **Ocena** | Jednostka wiedzy wywiadowczej z kodem wiarygodności |
| **Pakiet Kontekstu** | Dane przekazywane AI przy każdym wywołaniu |
| **Rejestr Następstw** | Baza trwałych konsekwencji |
| **Rozkaz Kwartalny** | Jednostronicowy dokument obowiązujący w KSP |
| **Sygnał** | Wskazówka o ukrytym stanie, wpleciona w narrację |
| **Zwrot** | Zmiana strategii ZSRR na inną kategorię wyścigu |

## Aneks B — Tabela zmiennych

| Zmienna | Zakres | Start | Widoczna | Rozdział |
|---|---|---|---|---|
| ZW | 0–100 | 55 | Tak | 6 |
| SO | 0–100 | 60 | Tak | 6 |
| PP | 0–100 | 50 | Tak | 6 |
| WF | 0–100 | 70 | Tak | 6 |
| NG | 1–5 | 4 | Tak | 17 |
| UD | 0–8 | 6 | Tak | 10 |
| KP | 0–20 | 3 | Tak | 6 |
| Bilans Wyścigu | −30 do +30 | 0 | Częściowo | 14 |
| Bilans Strategiczny | −30 do +30 | 0 | Nie | 14 |
| Wpływ frakcji | 1–5 | DPO 4, BAS 3, RN 2, BLZ 1, PRZ 3, DOI 2 | Tak | 7 |
| Nastawienie frakcji | −3 do +3 | 0 | Tak | 7 |
| Reputacja Stylu (4 osie) | −10 do +10 | 0 | Tak | 5 |
| Lojalność / Ambicja / Kompetencja postaci | wg 8.2 | z szablonu | Częściowo | 8 |
| Ciśnienie Tajemnicy | 0–6 | wg zdarzenia | Tak (znane Tajemnice) | 12 |

## Aneks C — Kamienie milowe (wersja startowa)

| Kamień milowy | Kategoria | Waga | Kotwica historyczna (orientacyjna) |
|---|---|---|---|
| Rakieta sondażowa w przestrzeni kosmicznej | Orbita | 1 | wczesne lata 50. |
| Pierwszy sztuczny satelita | Orbita | 5 | 1957 |
| Pierwszy satelita naukowy z danymi | Orbita | 2 | 1958 |
| Pierwszy organizm żywy na orbicie | Człowiek | 3 | 1957 |
| Pierwszy człowiek w locie suborbitalnym | Człowiek | 3 | 1961 |
| Pierwszy człowiek na orbicie | Człowiek | 5 | 1961 |
| Pierwsza misja wielodniowa | Człowiek | 2 | 1962–1963 |
| Pierwsza załoga wieloosobowa | Operacje | 2 | 1964 |
| Pierwsze wyjście w przestrzeń kosmiczną | Operacje | 3 | 1965 |
| Pierwsze spotkanie orbitalne | Operacje | 2 | 1965 |
| Pierwsze cumowanie | Operacje | 3 | 1966 |
| Pierwszy przelot obok Księżyca | Księżyc | 3 | 1959 |
| Pierwsze miękkie lądowanie na Księżycu | Księżyc | 3 | 1966 |
| Pierwsza załoga na orbicie Księżyca | Księżyc | 4 | 1968 |
| Pierwsze lądowanie człowieka na Księżycu | Księżyc | 5 | 1969 |
| Pierwsza stacja orbitalna | Stacje | 4 | 1971 |
| Pierwsza obsada długotrwała (≥ 30 dni) | Stacje | 3 | 1971–1973 |
| Przelot obok Wenus | Planety | 2 | 1962 |
| Przelot obok Marsa | Planety | 2 | 1964–1965 |
| Lądowanie na innej planecie | Planety | 3 | 1970 |
| Satelita rozpoznawczy z odzyskanymi danymi | Strategiczne | 3 | 1960 |
| Satelita łączności | Strategiczne | 2 | 1962 |
| Satelita wczesnego ostrzegania | Strategiczne | 2 | połowa lat 60. |
| Zdolność antysatelitarna | Strategiczne | 3 | koniec lat 60. |

Kotwice są punktami odniesienia dla modelu ZSRR, nie wymaganiami wobec gracza. Mapowanie kamieni na kontrakty RP-1 znajduje się w pliku `mapping/milestones.yaml`.

## Aneks D — Wzorce zdarzeń (próbka)

| ID | Zdarzenie | Źródło | Dylemat |
|---|---|---|---|
| E-01 | **Generał chce wyrzutni na jutro** | Dyrektywa DPO + zajęta wyrzutnia | Przesunąć start RN czy odmówić DPO |
| E-02 | **Wdowa pisze list** | Utrata załogi | Odpowiedź osobista, oficjalna czy przez Rzecznika |
| E-03 | **Senator ma fabrykę** | Sesja Budżetowa | Kontrakt dla jego stanu w zamian za głos |
| E-04 | **Dane, których nie było** | Satelita naukowy + DPO | Czy dane RN mogą trafić do wojska bez wiedzy naukowców |
| E-05 | **Kret czy plotka** | Niskie Nastawienie BAS | Śledztwo wewnętrzne kosztem SO czy zignorowanie |
| E-06 | **Dziennikarz z kopią notatki** | Ciśnienie Tajemnicy ≥ 4 | Dobrowolne ujawnienie czy próba zatrzymania |
| E-07 | **Astronauta mówi za dużo** | Cecha „Medialny” / „Gaduła” | Ukaranie popularnej postaci czy tolerancja |
| E-08 | **Przeszłość Brandta** | Hak BAS | Chronić Brandta, oddać go czy użyć haka samemu |
| E-09 | **Dwie rakiety, jeden budżet** | Wojna kontraktowa | Wybór techniczny kontra polityczny |
| E-10 | **Ruskin składa rezygnację** | Wypalenie DOI | Zatrzymać go (koszt) czy zastąpić (ryzyko) |
| E-11 | **Rosjanie milczą** | Brak Ocen przez 3 kwartały | Kosztowne Zlecenie wywiadowcze czy założenie, że nic się nie dzieje |
| E-12 | **Sojusznik chce miejsca w kapsule** | Rada Atlantycka | WF i fundusze kontra sprzeciw BLZ |
| E-13 | **Prośba o jeszcze jeden test** | Dyrektor Bezpieczeństwa Misji | Opóźnienie lotu załogowego kontra terminy Komitetu |
| E-14 | **Nowa administracja, stare obietnice** | Zmiana Administracji | Których obietnic bronić |

Wersja 1.0 zakłada około 150 szablonów zdarzeń i 10 szablonów kryzysów. Każdy szablon musi przejść test trzech dróg (Z2) i mieć co najmniej jedną opcję, której koszt jest odroczony.

---

*Koniec dokumentu. Wersja 1.0 — dokument żywy; zmiany wprowadza się przez rewizję rozdziału 2 (Zasady projektowe) lub przez zgłoszenie zmiany z uzasadnieniem w odniesieniu do zasad Z1–Z10.*
