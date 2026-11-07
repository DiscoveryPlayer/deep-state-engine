# Dossier III — Wątki świata 1951–1980

**The Deep State Engine · materiał projektowy i badawczy · wersja 1 (7.11.2026)**

Dossier zastępuje 30 rocznych plików wydarzeń. Opisuje świat jako bibliotekę **procesów**, czyli wątków, szablonów i wzorców, z których silnik składa każdą kampanię od nowa. Dokument ma dwie warstwy:
- **część I** to model: poziomy pewności, rodzaje gałęzi, kotwice, szablony, dylematy, palety epok i zmiany w silniku;
- **części II–V** to treść: 99 wątków w czterech blokach kalendarzowych, 16 szablonów, 200 wzorców i palety epok;
- **część VI** to kolejność dalszych prac i pytania do autora.

Z dossier będziemy pisać pliki YAML do `data/events/`, wątek po wątku. Daty historyczne są podane według stanu wiedzy. Przed zapisaniem wątku w YAML każdą datę etapu sprawdzamy jeszcze raz (pole `historicalNote`).

---

# Część I. Model

## 1. Poziomy pewności

Każda rzecz w świecie gry ma swój poziom. Im niższy numer, tym trudniej ją ruszyć.

| Poziom | Nazwa | Co to jest | Kto może to zmienić |
|---|---|---|---|
| **0** | Kanon przedświata | Wszystko przed 1.01.1951: historia prawdziwa i poprawki Biblii (punkt 1.1) | Nikt |
| **1** | Kotwice | Etapy z jedną gałęzią: rzeczy pewne | Nikt w trakcie gry; autor przy projektowaniu |
| **2** | Wątki historyczne | Wielkie procesy z datami. Historia „ciąży” (×3 przy Rozbieżności 0) | Silnik przez losowanie z wagami; gracz pośrednio przez stan świata i punkty decyzyjne |
| **3** | Szablony | Mechanizmy bez dat, na świat po rozejściu z historią | Silnik, gdy spełnione są warunki |
| **4** | Wzorce | Tło i codzienność: strajki, przecieki, odkrycia, wizyty | Silnik, losowo z warunkami |
| — | Punkty decyzyjne | Dylematy na Biurku. Mogą wyrastać z każdego poziomu 2–4 | Gracz |
| — | Warstwa opisu | AI zamienia wynik w depeszę, scenę i rozmowę | AI, wyłącznie w granicach wyniku (zasada Z3) |

### 1.1. Kanon przedświata (poziom 0), który wątki muszą uwzględniać

Świat gry różni się od naszego jeszcze przed 1951 rokiem (Dokument Decyzyjny 4.3):
- Roosevelt umiera w listopadzie 1944 roku. Przez około dwa miesiące urząd sprawuje Wallace, a 20.01.1945 przysięgę składa **Byrnes**.
- W 1945 roku spadają bomby na Hiroszimę, Nagasaki i **Kobe**. Trzecia bomba atomowa jest częścią pamięci świata: w Japonii (wątek A39), w ruchu antyatomowym i w debacie o próbach.
- 1947: konferencja w Lyonie i pakt pięciu państw. 1949: komitet CARC. **IV 1951**: Eisenhower jako SACEUR przekształca CARC w PACE.
- **1948**: wygrywa Truman. W 1952 roku rywalem Eisenhowera jest **Harriman**, nie Stevenson. Na rok 1956 to otwiera pole: Harriman naprawdę walczył wtedy o nominację demokratów.
- **RFN** jest członkiem PACE z ograniczeniami do 1955 roku. **Japonia** jest obserwatorem od 1952, **Szwecja** partnerem, **Australia** gospodarzem Woomery.

Wątki piszemy tak, żeby nie przeczyły kanonowi. Teksty o wyborach 1952 nie wymieniają Stevensona, a teksty o Japonii pamiętają o Kobe.

## 2. Rodzaje gałęzi

Każdy etap wątku ma gałąź **historyczną** i zero lub więcej innych. Gałęzie dostają jawny rodzaj (pole `kind`). Walidacja sprawdzi, czy rodzaj zgadza się z mechaniką:

| Rodzaj | Znak | Co robi | Mechanika w YAML |
|---|---|---|---|
| historyczna | **H** | Dzieje się to, co naprawdę | `kind: historical` |
| przyspieszona | **P** | To samo, ale wcześniej, a następny etap przychodzi szybciej | `advanceNext: N` |
| opóźniona | **O** | Etap nie rozstrzyga się teraz i wraca za N kwartałów | `delayQuarters: N` |
| przerwana | **X** | Proces się urywa: wątek kończy się przed czasem | `next: end` przed ostatnim etapem |
| alternatywna | **A** | Świat skręca, często do etapu alternatywnego | `next: <etap alternatywny>` albo skutki niehistoryczne |

**Wagi wyjściowe:** H = 10, P i O = 2–3, X = 1–2, A = 1–3. Modyfikatory zależą od stanu świata. Do tego dochodzi mnożnik Rozbieżności (×3 dla H przy D = 0).

## 3. Kotwice to poziom etapu, a nie osobny byt

Twoje pytanie: czy kotwice to wątki świata? **Kotwica to etap wątku z jedną gałęzią.** Wątek może mieć etapy zakotwiczone i otwarte. Przykład to wybory 1952: wynik jest zakotwiczony (wygrywa Eisenhower), a wiceprezydent i układ sił w Kongresie są otwarte.

Zmiana w silniku: pole `anchor: true` przy etapie zamiast `kind: anchor` przy całym wątku. Walidacja wymaga, żeby etap zakotwiczony miał dokładnie jedną gałąź, historyczną.

**Kotwica warunkowa.** Część pewników ma sens tylko wtedy, gdy świat do nich doszedł. „Wygrywa prawdziwy kandydat” jest pewne zawsze. To, który prawdziwy kandydat wygra, zależy już od stanu świata (punkt 9).

## 4. Szablony: skąd silnik wie, że U-2 to nie kryzys surowcowy

**Silnik niczego nie rozpoznaje.** Nie czyta wydarzeń, nie klasyfikuje ich i nie zgaduje, „co to było”. Lot U-2 to osobny wątek z własnymi etapami i nigdy nie trafia do szablonu kryzysu surowcowego. Szablon to oddzielna maszynka, która działa tylko w czterech twardych ramach:

1. **Warunki uruchomienia** zapisane w danych, np. `popyt_na_rope ≥ 7` i `divergence.bliski_wschod ≥ 2`. Bez nich szablon nie ruszy.
2. **Lista kandydatów** napisana przez nas, np. kraje naftowe: Irak, Kuwejt, Arabia Saudyjska, Wenezuela, Indonezja, Libia (od 1959), Nigeria (od 1960). Silnik nie wymyśli kraju spoza listy. Każdy kandydat może mieć warunek, np. Libia dopiero po odkryciu ropy.
3. **Przypadki historyczne** (`historicalInstances: [abadan, suez]`). Dopóki taki wątek trwa w tym regionie, szablon milczy. Szablon dubluje historię tylko wtedy, gdy świat od niej odszedł.
4. **Grupa wyłączności** (`exclusiveGroup: surowce`). W regionie trwa naraz najwyżej jeden kryzys z danej grupy.

Kategorie nadaje człowiek, nie maszyna. To autor treści zdecydował, że Abadan jest przypadkiem kryzysu surowcowego, a powstanie w NRD przypadkiem „buntu w bloku wschodnim”. Silnik tylko wykonuje to przypisanie.

**Kontrola.** `dse swiat --serie 1000` pokazuje, ile razy, gdzie i kiedy każdy szablon się uruchomił. Jeśli kryzys naftowy w Wenezueli wypada co dekadę, widać to w liczbach i obniżamy szansę.

## 5. Dylematy to punkty decyzyjne, a nie osobny poziom

Dylemat może wyrosnąć z trzech miejsc:
- **z etapu wątku** (nowe pole `decision`). Przed rozstrzygnięciem etapu na Biurko trafia pytanie, a odpowiedź Andersona zmienia wagi gałęzi. Przykład z Dien Bien Phu: „Czy PACE przekaże Francuzom zdjęcia rozpoznawcze?” Odpowiedź „tak” zwiększa wagę gałęzi „Francja utrzymuje twierdzę dłużej” i podnosi NG;
- **ze wzorca.** Wzorzec zamiast natychmiastowego skutku zostawia sprawę na Biurku, np. przeciek do prasy: dementować, potwierdzić czy milczeć;
- **z listy dylematów stałych** (`dilemmas.yaml`), np. „Lotnictwo kontra NACA”.

**Rola AI.** AI ubiera dylemat w scenę: kto przynosi teczkę i kto doradza, Brandt czy Ames. Rozmowę z Andersonem przekłada na jedną z opcji, a jeśli nie jest pewna, dopytuje. AI **nie tworzy nowych opcji ze skutkami liczbowymi**. Gdy gracz wymyśli coś spoza listy, Mistrz Gry (w pilotażu ja) dopisuje opcję jawnie, z uzasadnieniem, i trafia ona do danych.

**Bierność** (decyzja autora z 7.11): opcja „nie angażować się” wybrana świadomie bywa najlepsza, a przegapiony termin kosztuje osobno (`inactionEffects`).

## 6. Palety epok: jak AI „ubiera” wzorzec w realia

Wzorzec „odkrycie naukowe” jest ten sam w 1953 i 1975 roku. Treść odkrycia AI bierze z **palety epoki**, czyli zweryfikowanej listy prawdziwych tematów z datami i warunkami (część V, punkt 2). Zasady:
- **AI nie wymyśla realiów z głowy.** Dostaje kwartał, epokę i dwie lub trzy pasujące pozycje z palety i wybiera jedną.
- **Pozycja palety ma warunki.** Pasy Van Allena odkrywa ten, kto pierwszy wyniesie licznik Geigera na orbitę. W grze może to być PACE, ZSRR albo nikt do 1960 roku, więc pozycja wymaga flagi z modelu wyścigu. Wizyta Gierka w USA (październik 1974) wymaga, żeby Gierek rządził Polską, czyli flagi z wątku C16.
- **Prawdziwe osoby** pojawiają się w paletach tylko w rolach, które pełniły naprawdę, albo w rolach dopuszczonych przez kotwice. Żadnych wymyślonych przestępstw.
- **Brak pasującej pozycji** oznacza, że wzorzec mówi ogólnie: „zespół z laboratorium uniwersyteckiego”, bez nazwisk.

Paleta to dane (`data/palettes/*.yaml`), nie wiedza modelu. Można ją sprawdzić, poprawić i rozszerzać.

## 7. Bloki kalendarzowe i epoki

Epoki z GDD (4.4) mają ruchome granice: Epoka II zaczyna się od pierwszego sukcesu orbitalnego którejkolwiek strony. Do pisania treści potrzebny jest jednak stały podział, więc dossier dzieli czas na **bloki kalendarzowe**:

| Blok | Lata | Wątków | Charakter | Odpowiednik epoki |
|---|---|---|---|---|
| **A** | 1951–1960 | 43 | Rdzeń historii: gęsto, z wieloma etapami | Epoka I i początek II |
| **B** | 1961–1965 | 25 | Przełomy kryzysowej połowy dekady | Koniec II i początek III |
| **C** | 1966–1972 | 20 | Przełomy | III i początek IV |
| **D** | 1973–1980 | 11 | Tylko wielkie przełomy | IV |

Silnik nie zna bloków, zna daty i warunki. Bloki służą tylko do porządku w dossier i w folderach (`threads/a-1951-1960/` itd.). **Epoka** zostaje warunkiem w silniku (nowy warunek `era`), przydatnym głównie dla wzorców: „nieudany start w telewizji” pojawia się dopiero od Epoki II.

**Sputnika nie ma w kalendarzu.** Pierwszy satelita, pierwszy człowiek na orbicie i lądowanie na Księżycu należą do modelu wyścigu (GDD 14–15: Bilans Wyścigu i Model ZSRR) i do Twoich lotów w KSP. Świat ma za to **wątki reaktywne**, które startują od flagi zamiast od daty (`start.conditions: { flag: szok_orbitalny }`): raport Gaithera, ustawa o edukacji obronnej, ARPA (wątek A42).

## 8. Jak czytać kartę wątku

```
### A13. Indochiny: Dien Bien Phu i Genewa
`indochiny-1954` · region: azja · 1953-Q4 – 1954-Q3 · ⚓ brak / ⚓ etap 2
```

- **Historia:** dwa–trzy zdania, co stało się naprawdę.
- **Etapy:** kwartał etapu, potem gałęzie w kolejności H, P, O, X, A. ⚓ oznacza etap zakotwiczony.
- **Siły:** zmienne świata, które przesuwają wagi. Nowe zmienne są oznaczone gwiazdką: `*nowa*`.
- **PACE:** gdzie wątek dotyka organizacji: budżet, frakcje, członkowie, kadry, model ZSRR.
- **Decyzja:** propozycja punktu decyzyjnego dla Andersona.

## 9. Kotwice: lista rzeczy pewnych

Lista jest celowo krótka. Wszystko inne może pójść inaczej.

| # | Kotwica | Etap / wątek | Uwagi |
|---|---|---|---|
| K1 | Kanon przedświata (punkt 1.1) | poziom 0 | — |
| K2 | Wybory 1952: wygrywa Eisenhower | A04, etap „wynik” | Rywal: Harriman (kanon) |
| K3 | Prezydentami do 1960 są wyłącznie prawdziwe osoby | A23, A24, A41 | Dopuszcza Nixona jako następcę po śmierci lub niezdolności Eisenhowera |
| K4 | Wybory 1956: wygrywa prawdziwy kandydat | A24 | Eisenhower, a jeśli nie żyje, Nixon. Kandydat demokratów: Stevenson albo Harriman |
| K5 | Wybory 1960: wygrywa prawdziwy kandydat | A41 | Kennedy albo Nixon. Wynik jest otwarty |
| K6 | Wybory 1964: kandydaci fikcyjni mogą startować, wygrywa prawdziwy | B09 | — |
| K7 | Od 1968 roku może wygrać postać fikcyjna | C03, C04, D05 | — |
| K8 | Wojna koreańska kończy się bez zjednoczenia Korei przed 1955 rokiem | A01 | Otwarte: kiedy i czy rozejmem |
| K9 | ZSRR ma bombę wodorową przed 1956 rokiem | A07 | Otwarta jest tylko data (1953–1955) |
| K10 | Chiny mają bombę atomową przed 1967 rokiem | B11 | Data otwarta (1962–1966) |
| K11 | Konflikt arabsko-izraelski trwa przez cały okres gry | C06, D01 | Otwarte są wojny, daty i wyniki |
| K12 | Brak wojny jądrowej między mocarstwami | wszystkie | **Do decyzji autora.** Bez tej kotwicy gałęzie typu „kryzys kubański → wojna” muszą mieć osobne zakończenie kampanii |

K8–K12 to moje propozycje. Każdą możesz skreślić.

## 10. Zmiany w silniku wynikające z dossier

| Zmiana | Po co | Skala |
|---|---|---|
| `stage.anchor: true` zamiast `kind: anchor` przy wątku | Kotwice jako poziom etapu (punkt 3) | mała |
| `branch.kind` (H/P/O/X/A) z walidacją zgodności z mechaniką | Jawne rodzaje gałęzi, czytelność, statystyka w `--serie` | mała |
| `stage.decision` z wagami zależnymi od odpowiedzi | Punkty decyzyjne w wątkach (punkt 5) | średnia |
| `template.historicalInstances`, `template.exclusiveGroup`, warunek przy kandydacie | Bezpieczniki szablonów (punkt 4) | mała |
| warunek `era` (np. `{ era: '>=II' }`) | Pule wzorców zależne od epoki | mała |
| flagi z modelu wyścigu (`szok_orbitalny`, `pierwszy_satelita_pace` …) | Wątki reaktywne (A42) | mała, gdy powstanie model wyścigu |
| `palette` we wzorcach + `data/palettes/` | Realia epoki bez halucynacji (punkt 6) | średnia |
| podfoldery bloków w `threads/` | Porządek przy ~100 plikach | kosmetyczna |
| nowe zmienne świata (lista w punkcie 11) | Siły napędowe nowych wątków | mała |

## 11. Zmienne świata: obecne i proponowane

Dziś jest 8 zmiennych. Około 100 wątków potrzebuje kilku nowych. Proponuję zestaw 16 zmiennych, wszystkie w skali 0–10:

| Zmienna | Status | Co mierzy |
|---|---|---|
| `koniunktura` | jest | gospodarka Zachodu |
| `pula_kadr` | jest | inżynierowie i naukowcy |
| `popyt_na_rope` | jest | presja surowcowa |
| `sila_wielkiej_brytanii` | jest | Londyn jako mocarstwo |
| `zaangazowanie_usa` | jest | skłonność USA do interwencji i pomocy |
| `antykomunizm` | jest | gorączka antykomunistyczna w USA |
| `napiecie_korea` | jest | po 1953 roku do zastąpienia przez `napiecie_azja` |
| `presja_wyscigu` | jest | odczuwana rywalizacja; połączona z Bilansem Wyścigu |
| `napiecie_azja` | *nowa* | Korea, Indochiny, Cieśnina Tajwańska, Wietnam |
| `jednosc_bloku` | *nowa* | spójność bloku wschodniego (NRD 1953, 1956, 1968, 1980) |
| `jednosc_zachodu` | *nowa* | spójność sojuszu: Francja, RFN, Wielka Brytania, spory o koszty |
| `ambicja_francji` | *nowa* | gaullizm, force de frappe, niezależność (Hammaguir, Diament) |
| `kurs_kremla` | *nowa* | 0 = odwilż, 10 = twardy kurs; napędza NG i model ZSRR |
| `wyscig_atomowy` | *nowa* | intensywność prób i zbrojeń jądrowych |
| `nastroje_spoleczne` | *nowa* | niepokoje w USA: prawa obywatelskie, ruch antywojenny, kontrkultura |
| `dekolonizacja` | *nowa* | tempo rozpadu imperiów; napędza szablony kryzysów peryferyjnych |

---

# Część II. Wątki świata

Znaki gałęzi: **H** historyczna · **P** przyspieszona · **O** opóźniona · **X** przerwana · **A** alternatywna · ⚓ etap zakotwiczony.

## Blok A — 1951–1960: rdzeń historii (43 wątki)

### A01. Wojna w Korei
`korea` · region: azja · 1951-Q1 – 1953-Q3 · **jest w repozytorium** · ⚓ K8 (bez zjednoczenia)

**Historia:** Wiosną 1951 roku kontrofensywa ONZ odzyskuje Seul, a Truman 11.04.1951 odwołuje MacArthura. Od lipca 1951 roku trwają rozmowy rozejmowe w Kaesongu, potem w Panmundżonie, przerywane walkami o wzgórza. Rozejm zostaje podpisany 27.07.1953.

**Etapy:**
1. **1951-Q2 wiosna:** H front koło 38. równoleżnika · A eskalacja (MacArthur zostaje, naloty na Mandżurię).
2. **1951-Q3 rozmowy:** H rozmowy i walki · P szybki przełom · O rozmowy zerwane (+2 kw.).
3. **1953-Q3 rozejm:** H Panmundżom · P rozejm w 1952 roku (gdy wcześniej wypadł przełom) · O wojna trwa (+4 kw.) · A groźba atomowa.

**Siły:** `napiecie_korea` (→ `napiecie_azja`), `antykomunizm`, `koniunktura`. **Śmierć Stalina (A08)** zwiększa wagę rozejmu.

**PACE:** koniunktura zbrojeniowa (Korekty za ceny materiałów), uwaga Waszyngtonu, kadry wojskowe.

**Decyzja:** Lotnictwo prosi PACE o udostępnienie samolotów doświadczalnych do testów bojowych w Korei.

### A02. Kryzys irański i Abadan
`abadan` · region: bliski_wschod · 1951-Q1 – 1953-Q3 · **jest w repozytorium**

**Historia:** Iran nacjonalizuje przemysł naftowy (marzec–maj 1951), a premierem zostaje Mosaddegh. Brytyjczycy rozważają zbrojne zajęcie Abadanu (plan Buccaneer), ale ostatecznie we wrześniu–październiku 1951 roku ewakuują personel. Następuje embargo. W sierpniu 1953 roku CIA i brytyjski wywiad obalają Mosaddegha (operacja Ajax/Boot).

**Etapy:** nacjonalizacja (1951-Q2) → Abadan (1951-Q4: H ewakuacja · A Buccaneer → etap alternatywny „wojna w Zatoce” · A mediacja USA) → los Mosaddegha (1953-Q3: H obalony · A przetrwał · A zwrot na Wschód).

**Siły:** `sila_wielkiej_brytanii`, `zaangazowanie_usa`, `popyt_na_rope`. **PACE:** ceny paliw (Korekty), siła brytyjskiej składki. **Szablon:** przypadek historyczny szablonu S01 „kryzys surowcowy”.

### A03. Maccartyzm
`maccartyzm` · region: usa · 1952-Q1 – 1954-Q4 · **jest w repozytorium**

**Historia:** Przemówienie w Wheeling (luty 1950) otwiera kampanię oskarżeń. Od 1953 roku McCarthy przewodniczy Stałej Podkomisji Śledczej. Przesłuchania w sprawie armii trwają od kwietnia do czerwca 1954 roku. Senat potępia McCarthy'ego 2.12.1954.

**Etapy:** fala przesłuchań (1952-Q1) → pytania o PACE (1953-Q2: H PACE poza uwagą · A PACE na celowniku) → koniec ery (1954-Q4: H potępienie · O fala trwa, +4 kw.).

**Siły:** `antykomunizm`; flagi wiceprezydenta (Smith przyspiesza upadek, Knowland go opóźnia). **PACE:** poświadczenia bezpieczeństwa (Brandt i Paperclip, Qian Xuesen, decyzja DD), WF, nastroje w RN.

**Decyzja (nowa):** Podkomisja żąda list naukowców z zagranicy pracujących w PACE: wydać, odmówić czy przekazać przez BAS.

### A04. Wybory prezydenckie 1952
`wybory-1952` · region: usa · 1952-Q1 – 1953-Q2 · **jest w repozytorium** · ⚓ wynik (K2)

**Historia:** Konwencja republikanów 7–11.07.1952: Eisenhower wygrywa z Taftem i dostaje Nixona za zastępcę. W kanonie gry rywalem z ramienia demokratów jest **Harriman**. Eisenhower wygrywa 4.11.1952.

**Etapy:** kandydat na wiceprezydenta (1952-Q3: H Nixon · A Lodge, Knowland, Stassen, Warren, Driscoll, Thornton, Langlie, Smith) → ⚓ noc wyborcza (1952-Q4: wygrywa Eisenhower; otwarty pozostaje skład Kongresu) → przegląd programów (1953-Q2).

**Uwaga projektowa:** etap „noc wyborcza” dziś ma trzy gałęzie różniące się Kongresem. Po wprowadzeniu `anchor` rozdzielimy go na ⚓ „zwycięstwo Eisenhowera” i otwarty etap „Kongres”.

**PACE:** Anderson to nominat Trumana. Nowa administracja przegląda jego programy (ZW −5).

### A05. Stal: przejęcie hut i wielkie strajki
`stal` · region: usa · 1952-Q1 – 1959-Q4

**Historia:** 8.04.1952 Truman przejmuje huty, żeby uniknąć strajku w czasie wojny. 2.06.1952 Sąd Najwyższy uznaje to za niezgodne z konstytucją (sprawa Youngstown). Wybucha 53-dniowy strajk. W 1959 roku strajk stalowy trwa 116 dni (od lipca do listopada), aż do nakazu sądowego na podstawie ustawy Tafta-Hartleya.

**Etapy:**
1. **1952-Q2 przejęcie hut:** H przejęcie i wyrok Youngstown, potem strajk · A sąd podtrzymuje przejęcie (silna prezydentura, mniej strajków) · X ugoda przed przejęciem.
2. **1952-Q3 strajk:** H 53 dni (Korekta: ceny stali) · O przedłuża się (+1 kw.) · P szybka ugoda.
3. **1959-Q3 wielki strajk:** H 116 dni i nakaz sądu · X ugoda bez strajku · A strajk generalny w przemyśle metalowym (rzadko, przy niskiej `koniunktura`).

**Siły:** `koniunktura`, `nastroje_spoleczne`. **PACE:** ceny i terminy dostaw stali i stopów (Korekty), związki zawodowe u dostawców. **Decyzja:** w 1959 roku dostawca prosi PACE o zgodę na przesunięcie terminów: zgodzić się czy grozić karami umownymi.

### A06. Brytyjska bomba i próby w Australii
`bomba-brytyjska` · region: europa · 1952-Q3 – 1958-Q3

**Historia:** Operacja Hurricane (3.10.1952, Monte Bello) czyni Wielką Brytanię trzecim mocarstwem atomowym. Potem przychodzą próby Totem (1953, Emu Field), Mosaic (1956, Monte Bello) i Buffalo (1956, Maralinga), a w latach 1957–1958 Grapple, bomba wodorowa nad Pacyfikiem (pierwszy pełny sukces Grapple X, listopad 1957). 3.07.1958 Wielka Brytania i USA zawierają porozumienie o współpracy obronnej, które przywraca wymianę informacji jądrowych.

**Etapy:**
1. **1952-Q4 Hurricane:** H udana próba · O opóźnienie o rok (słabsza Wielka Brytania).
2. **1956-Q4 Maralinga:** H próby i protesty Aborygenów, ujawnione dopiero w latach 80. · A skandal skażenia wychodzi od razu (napięcie z Australią, gospodarzem Woomery).
3. **1957-Q4 Grapple:** H bomba wodorowa · O porażka i powtórka.
4. **1958-Q3 porozumienie z USA:** H podpisane · X nie ma porozumienia (Londyn idzie sam: wyższe wydatki, mniej na PACE).

**Siły:** `sila_wielkiej_brytanii`, `wyscig_atomowy`. **PACE:** Woomera, Australia jako członek-gospodarz, brytyjski przemysł rakietowy (Blue Streak, A30). **Decyzja:** Londyn prosi o telemetrię i śledzenie z Woomery dla prób: zgoda (BAS +1, Australia −) czy odmowa.

### A07. Wyścig termojądrowy
`bomba-wodorowa` · region: swiat · 1952-Q4 – 1955-Q4 · ⚓ K9

**Historia:**
- **1.11.1952** Ivy Mike: pierwszy amerykański wybuch termojądrowy.
- **12.08.1953** RDS-6s (Joe-4): ZSRR i spór, czy to „prawdziwa” bomba wodorowa.
- **1.03.1954** Castle Bravo: 15 megaton, skażony kuter Daigo Fukuryū Maru i szok w Japonii.
- **22.11.1955** RDS-37: radziecka dwustopniowa bomba wodorowa.

**Etapy:**
1. **1952-Q4 Mike:** H · O 1953 (mniej presji).
2. **1953-Q3 odpowiedź ZSRR:** H Joe-4 · P już w 1953-Q1 · O 1954.
3. **1954-Q1 Bravo:** H wynik większy od oczekiwanego, skażenie i ofiara wśród rybaków · A próba bez incydentu (słabszy ruch antyatomowy).
4. **1955-Q4 RDS-37:** ⚓ ZSRR ma bombę wodorową najpóźniej w tym etapie (K9) · P wcześniej, gdy wcześniej wypadła gałąź P.

**Siły:** `wyscig_atomowy` (*nowa*), `kurs_kremla`. **PACE:** bomba wodorowa sprawia, że pocisk międzykontynentalny ma sens, bo wystarczy mniejsza celność (zob. A16). Rośnie presja na DPO, a w Japonii nastroje antyatomowe, wzmacniane pamięcią Kobe z kanonu.

### A08. Sukcesja na Kremlu
`sukcesja-1953` · region: zsrr · 1953-Q1 – 1958-Q1

**Historia:**
- Stalin umiera 5.03.1953.
- Beria zostaje aresztowany 26.06.1953 i stracony w grudniu.
- Malenkow ustępuje ze stanowiska premiera w lutym 1955.
- 25.02.1956 Chruszczow wygłasza tajny referat.
- W czerwcu 1957 roku pokonuje „grupę antypartyjną” (Mołotow, Malenkow, Kaganowicz).
- Od marca 1958 roku jest też premierem.

**Etapy:**
1. **1953-Q1 śmierć Stalina:** H · O Stalin żyje do 1954 (+4 kw.; Korea, „sprawa lekarzy”, twardy kurs).
2. **1953-Q2 Beria:** H aresztowany · A Beria wygrywa i wychodzi z ofertą zjednoczenia neutralnych Niemiec (do etapu alternatywnego „nota Berii”).
3. **1955-Q1 Malenkow:** H ustępuje · A zostaje premierem (więcej towarów konsumpcyjnych, mniej rakiet).
4. **1956-Q1 tajny referat:** H · X referat nie pada (odwilż słabsza, brak 1956 roku w Polsce i na Węgrzech w historycznej formie).
5. **1957-Q2 grupa antypartyjna:** H Chruszczow wygrywa · A wygrywa Mołotow (twardy kurs, `kurs_kremla` +3).

**Siły:** `kurs_kremla` (*nowa*), `jednosc_bloku`. **PACE:** kurs Kremla steruje modelem ZSRR (Doktryna, GDD), NG i wątkami A09, A25, A26. **Uwaga:** Główny Konstruktor i jego los należą do modelu ZSRR, nie do tego wątku.

### A09. Powstanie w NRD
`ndr-1953` · region: zsrr · 1953-Q2 – 1953-Q3

**Historia:** 16–17.06.1953 strajk robotników budowlanych w Berlinie Wschodnim przeradza się w powstanie w całej NRD. Stłumiły je radzieckie czołgi. Zachód nie interweniował.

**Etapy:**
1. **1953-Q2 powstanie:** H stłumione · O wybucha później, jesienią · X nie wybucha (Beria wygrał w A08 i władze robią ustępstwa).
2. **1953-Q3 reakcja Zachodu:** H bierność i propaganda (program żywnościowy Eisenhowera) · A rozdawnictwo broni przez służby (rzadko, przy wysokim `antykomunizm`; NG −1, BAS +).

**Siły:** `jednosc_bloku`, `kurs_kremla`. **PACE:** niemieccy członkowie PACE i ich rodziny na Wschodzie; uciekinierzy-inżynierowie (dylemat „Uciekinier” dostaje premię do szansy). **Szablon:** przypadek historyczny S05 „bunt w bloku wschodnim”.

### A10. Uzbrojenie RFN: od EWO do Bundeswehry
`rfn-uzbrojenie` · region: europa · 1952-Q2 – 1955-Q2

**Historia:**
- Traktat o Europejskiej Wspólnocie Obronnej zostaje podpisany 27.05.1952.
- 30.08.1954 francuskie Zgromadzenie Narodowe go odrzuca.
- Układy paryskie z 23.10.1954 przynoszą RFN suwerenność i członkostwo w NATO (9.05.1955).
- Odpowiedzią jest Układ Warszawski (14.05.1955).

**Etapy:**
1. **1952-Q2 traktat:** H podpisany.
2. **1954-Q3 Paryż głosuje:** H odrzucenie · A ratyfikacja (Europejska armia; `jednosc_zachodu` +2, `ambicja_francji` −2) · O głosowanie przesunięte (+2 kw.).
3. **1954-Q4 układy paryskie:** H · O (+2 kw.).
4. **1955-Q2 RFN w NATO:** H · P (jeśli przyspieszono) · A neutralne Niemcy (tylko po etapie alternatywnym „nota Berii” z A08).

**Siły:** `jednosc_zachodu`, `ambicja_francji`. **PACE:** **kanon:** niemieccy członkowie PACE działają z ograniczeniami do 1955 roku. Ten wątek zdejmuje ograniczenia, otwiera niemiecki przemysł rakietowy i wywołuje konflikt „Paperclip kontra Adenauer”. **Decyzja:** czy PACE lobbuje za ratyfikacją EWO (ZW +, Francja −).

### A11. Triest
`triest` · region: europa · 1953-Q4 – 1954-Q4

**Historia:** Spór włosko-jugosłowiański o Wolne Terytorium Triestu. 8.10.1953 Brytyjczycy i Amerykanie zapowiadają przekazanie strefy A Włochom, co wywołuje mobilizację i zamieszki. Memorandum londyńskie z 5.10.1954 dzieli terytorium.

**Etapy:**
1. **1953-Q4 kryzys:** H mobilizacja i zamieszki · A starcie graniczne (NG −1).
2. **1954-Q4 memorandum:** H podział · O kryzys trwa (+4 kw.; Włochy blokują Radę Atlantycką).

**Siły:** `jednosc_zachodu`. **PACE:** Włochy są członkiem założycielskim z prawem weta (DD 4.4). Włoski rząd w kryzysie może użyć weta jako dźwigni. **Decyzja:** Rzym prosi PACE o „gest”, czyli kontrakt dla włoskiego przemysłu, w zamian za zgodę na budżet.

### A12. Atomy dla pokoju
`atomy-dla-pokoju` · region: swiat · 1953-Q4 – 1957-Q3

**Historia:** Przemówienie Eisenhowera w ONZ z 8.12.1953. Konferencja genewska o pokojowym wykorzystaniu atomu (sierpień 1955). Statut MAEA z 1956 roku, agencja działa od lipca 1957.

**Etapy:**
1. **1953-Q4 przemówienie:** H · X nie pada (brak propagandowej kontry dla „tajności”).
2. **1955-Q3 konferencja genewska:** H wymiana nauki, odtajnienie części badań · A Moskwa bojkotuje.
3. **1957-Q3 MAEA:** H powstaje · O.

**Siły:** `wyscig_atomowy`, `kurs_kremla`. **PACE:** to wzór dla „nauki na pokaz”: WF zyskuje, gdy PACE ma cywilną twarz. Precedens dla „Kosmosu dla pokoju” po szoku orbitalnym. **Decyzja:** Biały Dom chce, żeby PACE dołożyła do przemówienia akapit o „pokojowych rakietach badawczych”: zgoda (WF +, DPO −) czy odmowa.

### A13. Indochiny: Dien Bien Phu i Genewa
`indochiny-1954` · region: azja · 1953-Q4 – 1954-Q3

**Historia:** Oblężenie Dien Bien Phu trwa od 13.03 do 7.05.1954. W kwietniu Waszyngton rozważa naloty, a nawet broń atomową (operacja Vulture), ale bez Wielkiej Brytanii i Kongresu nie interweniuje. Porozumienia genewskie z 21.07.1954 dzielą Wietnam wzdłuż 17. równoleżnika.

**Etapy:**
1. **1954-Q1 oblężenie:** H.
2. **1954-Q2 Vulture:** H brak interwencji · A naloty konwencjonalne USA · A naloty atomowe (bardzo rzadko; NG −2, Rozbieżność Azji +2, do etapu alternatywnego „wojna w Indochinach”).
3. **1954-Q2 upadek twierdzy:** H 7 maja · O twierdza trzyma się dłużej (przy gałęzi naloty).
4. **1954-Q3 Genewa:** H podział · A brak porozumienia (wojna trwa, Francja słabnie).

**Siły:** `napiecie_azja`, `zaangazowanie_usa`, `ambicja_francji`. **PACE:** Francja jako członek założycielski płaci za wojnę i tnie składkę. To drugi po Korei sygnał dla zegara „Indochiny → Wietnam” (B04).

**Decyzja:** Francuzi proszą o zdjęcia rozpoznawcze z lotów doświadczalnych PACE. Zgoda zwiększa wagę O w etapie 3 i obniża NG, odmowa podnosi urazę Paryża.

### A14. Gwatemala
`gwatemala-1954` · region: swiat · 1954-Q1 – 1954-Q2

**Historia:** Operacja PBSuccess. 18.06.1954 oddział Castillo Armasa wkracza z Hondurasu, a 27.06.1954 Árbenz ustępuje.

**Etapy:** **1954-Q2:** H Árbenz obalony · X operacja odwołana · A Árbenz się utrzymuje (porażka służb, `zaangazowanie_usa` −1).

**PACE:** pośrednio: pewność siebie służb (BAS), wzór dla szablonu S04 „zamach stanu”. **Szablon:** przypadek historyczny S04.

### A15. Cieśnina Tajwańska
`ciesnina-tajwanska` · region: azja · 1954-Q3 – 1958-Q4

**Historia:**
- **Pierwszy kryzys:** 3.09.1954 ostrzał Kinmen. Rezolucja w sprawie Formozy z 29.01.1955. Ewakuacja wysp Dachen i pogróżki atomowe. Wygaszenie wiosną 1955.
- **Drugi kryzys:** od 23.08.1958 ostrzał Kinmen. Amerykańskie konwoje. Pierwsze bojowe użycie Sidewindera przez lotnictwo Tajwanu.

**Etapy:**
1. **1954-Q3 ostrzał:** H.
2. **1955-Q1 rezolucja:** H · A eskalacja atomowa (rzadko).
3. **1958-Q3 drugi kryzys:** H · X nie wybucha · A blokada skuteczna, Kinmen pada.

**Siły:** `napiecie_azja`, `zaangazowanie_usa`. **PACE:** pociski kierowane jako temat dnia; Rada Naukowa ostrzega przed militaryzacją rakiet. **Szablon:** przypadek historyczny S07 „kryzys w cieśninie”.

### A16. Nowe Spojrzenie i priorytet pocisków
`nowe-spojrzenie` · region: usa · 1953-Q4 – 1955-Q4

**Historia:**
- NSC 162/2 z października 1953 to doktryna „Nowego Spojrzenia”: tańsza obrona oparta na broni jądrowej.
- Dulles ogłasza masowy odwet (styczeń 1954).
- Komitet von Neumanna (Teapot) w lutym 1954 zaleca przyspieszenie pocisku międzykontynentalnego.
- Raport Killiana (Technological Capabilities Panel, luty 1955) ostrzega przed atakiem z zaskoczenia i zaleca rozpoznanie z dużych wysokości oraz satelity.
- We wrześniu 1955 pocisk międzykontynentalny dostaje najwyższy priorytet narodowy.

**Etapy:**
1. **1953-Q4 doktryna:** H · A zostaje drogi model z czasów Korei (więcej pieniędzy na wszystko, wyższe podatki).
2. **1954-Q1 Teapot:** H przyspieszenie pocisków · O raport utknął (+4 kw.).
3. **1955-Q1 Killian:** H zalecenie rozpoznania i satelitów · A raport nie wspomina o satelitach.
4. **1955-Q3 priorytet:** H najwyższy priorytet · O.

**Siły:** `wyscig_atomowy`, `presja_wyscigu`, `koniunktura`. **PACE:** **kluczowy dla budżetu i frakcji.** DPO dostaje argument i pieniądze, a RN słabnie. Raport Killiana otwiera drzwi dla programu satelitarnego PACE (Zlecenie DPO i BAS). Wątek nie tworzy pojazdów: daje frakcjom żądania i budżet.

**Decyzja:** Komitet pyta, czy PACE weźmie na siebie część prac nad satelitą rozpoznawczym. Zgoda: DPO +, BAS +, WF −. Odmowa: zadanie trafia do Lotnictwa.

### A17. Kongres: wybory śródokresowe 1954 i 1958
`kongres-1950s` · region: usa · 1954-Q4 – 1958-Q4

**Historia:** W 1954 roku demokraci odzyskują obie izby (Lyndon Johnson zostaje liderem większości w Senacie). W 1958 roku, po recesji i Sputniku, wygrywają miażdżąco.

**Etapy:**
1. **1954-Q4:** H demokraci przejmują obie izby · A republikanie utrzymują Senat.
2. **1958-Q4:** H miażdżące zwycięstwo demokratów · A równowaga (przy wysokiej `koniunktura` i bez szoku orbitalnego).

**Siły:** `koniunktura`, flaga `szok_orbitalny`. **PACE:** komisje środków zmieniają przewodniczących. Kongres demokratów + szok = pieniądze i nadzór (GDD, Komitet Nadzoru). **Decyzja:** zaprosić nowego przewodniczącego komisji do ośrodka (KP −1, ZW +) czy trzymać dystans.

### A18. Brown i prawa obywatelskie
`prawa-obywatelskie-1` · region: usa · 1954-Q2 – 1960-Q2

**Historia:**
- Wyrok w sprawie Brown przeciwko Radzie Edukacji (17.05.1954).
- Bojkot autobusów w Montgomery (1955–1956).
- Little Rock (wrzesień 1957): Eisenhower wysyła 101. Dywizję.
- Ustawa o prawach obywatelskich z 1957 roku.
- Strajki okupacyjne w Greensboro (luty 1960).

**Etapy:**
1. **1954-Q2 Brown:** H · O wyrok odroczony.
2. **1955-Q4 Montgomery:** H bojkot.
3. **1957-Q3 Little Rock:** H wojsko · A gubernator ustępuje bez wojska · X kryzys nie wybucha.
4. **1960-Q1 Greensboro:** H.

**Siły:** `nastroje_spoleczne` (*nowa*). **PACE:** propaganda radziecka wykorzystuje segregację (WF i Rada Atlantycka). Zakłady na Południu, w Huntsville i na Przylądku, zatrudniają według lokalnych praw. Kadry: inżynierowie i matematyczki („rachmistrzynie”). **Decyzja:** czy PACE wprowadza zakaz segregacji w swoich ośrodkach (RN +, DOI − z powodu lokalnych władz, część Kongresu −, WF + za granicą).

### A19. Szczyt genewski i Otwarte Niebo
`otwarte-niebo` · region: swiat · 1955-Q2 – 1955-Q3

**Historia:** Szczyt Wielkiej Czwórki w Genewie (18–23.07.1955). 21 lipca Eisenhower proponuje wzajemne loty rozpoznawcze („Otwarte Niebo”). Chruszczow odrzuca propozycję. „Duch Genewy” trwa krótko.

**Etapy:**
1. **1955-Q2 traktat austriacki (15.05.1955):** H neutralna Austria · O.
2. **1955-Q3 Otwarte Niebo:** H propozycja i odmowa · A Moskwa przyjmuje w zasadzie (rzadko; NG +1, zmienia logikę rozpoznania i przyszłego „prawa przelotu” satelitów).

**Siły:** `kurs_kremla`. **PACE:** zasada „wolności przestrzeni” dla satelitów rozpoznawczych. Odmowa Moskwy daje Waszyngtonowi argument, że satelita naukowy przetrze szlak prawny dla wojskowych (zob. A21). Na Biurko trafia pytanie do PACE, czy satelita naukowy może być „pierwszy dla zasady”.

### A20. Luka bombowcowa i luka rakietowa
`luki` · region: usa · 1955-Q3 – 1960-Q4

**Historia:**
- W lipcu 1955 roku podczas Dnia Lotnictwa w Tuszynie M-4 Bison przelatują dwa razy, co daje złudzenie floty. Analitycy przewidują 800 bombowców do 1960 roku.
- 9.07.1956 U-2 fotografuje 30 Bisonów, czyli w praktyce całą flotę. Wywiad przez długi czas nie wierzy, że to wszystko.
- Po szoku orbitalnym „luka bombowcowa” zamienia się w „lukę rakietową” (raport Gaithera, kampania 1960).
- Loty U-2 w latach 1959–1960 pokazują, że luki nie ma.

**Etapy:**
1. **1955-Q3 Tuszyno:** H złudzenie floty · X pokaz bez sztuczki (mniejsza panika).
2. **1956-Q3 zdjęcia U-2:** H źle odczytane · A odczytane dobrze (mniejszy budżet obrony, `presja_wyscigu` −1).
3. **od flagi `szok_orbitalny`: luka rakietowa:** H panika i Gaither (A42) · O.
4. **1960-Q2 obalenie luki:** H tajne, nie publiczne · A przeciek w kampanii 1960.

**Siły:** `presja_wyscigu`, `antykomunizm`. **PACE:** Bilans widziany i Bilans faktyczny (wywiad z kodami A–F). To naturalne źródło fałszywych Ocen wywiadowczych dla Andersona. **Decyzja:** BAS ma dane podważające lukę. Ujawnić je (ZW −, budżet −) czy milczeć (WF ryzyko).

### A21. Międzynarodowy Rok Geofizyczny
`mrg` · region: swiat · 1952-Q4 – 1958-Q4

**Historia:**
- Pomysł z 1950 roku (kolacja u Van Allena).
- Międzynarodowa Rada Związków Naukowych (ICSU) zatwierdza go w 1952.
- 4.10.1954 w Rzymie komitet CSAGI zaleca wystrzelenie satelitów.
- 29.07.1955 Biały Dom zapowiada satelitę, a kilka dni później robi to także Moskwa.
- Rok Geofizyczny trwa od 1.07.1957 do 31.12.1958.

**Etapy:**
1. **1952-Q4 ICSU:** H · O.
2. **1954-Q4 Rzym:** H zalecenie satelitów · X bez satelitów (cele naukowe naziemne).
3. **1955-Q3 zapowiedzi:** H obie strony zapowiadają · **punkt decyzyjny PACE** (niżej) · A tylko ZSRR zapowiada.
4. **1957-Q3 start Roku:** H · O.
5. **1958-Q4 zakończenie i współpraca:** H rok przedłużony o współpracę (COSPAR) · A współpraca zerwana (gdy NG ≤ 2).

**Siły:** `presja_wyscigu`, `kurs_kremla`. **PACE:** **najważniejszy wątek bloku A dla PACE.** Ramy dla satelity naukowego, RN na pierwszej linii, prestiż. Sam satelita i wyścig to model wyścigu i Twoje loty, a wątek daje tylko kalendarz i politykę.

**Decyzja (etap 3):** „Czy PACE ogłasza własnego satelitę na Rok Geofizyczny?” Opcje:
- tak, z terminem: zobowiązanie, Obietnica w Rejestrze, RN +2;
- tak, bez terminu: RN +1;
- nie: Lotnictwo albo Marynarka przejmuje temat, DPO +, RN −2.

### A22. Antarktyda
`antarktyda` · region: swiat · 1955-Q4 – 1959-Q4

**Historia:** Wyprawy w ramach Roku Geofizycznego, stacje wielu państw na kontynencie. Traktat antarktyczny z 1.12.1959 demilitaryzuje kontynent i zawiesza roszczenia.

**Etapy:**
1. **1957-Q3 stacje:** H.
2. **1959-Q4 traktat:** H podpisany · O (+4 kw.) · A brak traktatu (roszczenia, wyścig baz; NG −1).

**PACE:** **precedens prawny dla kosmosu.** Bez traktatu antarktycznego Traktat o przestrzeni kosmicznej (C09) jest trudniejszy (waga jego H ×0,5). Australia i Wielka Brytania mają roszczenia, więc pojawia się temat dla Rady Atlantyckiej.

### A23. Zdrowie prezydenta
`zdrowie-eisenhowera` · region: usa · 1955-Q3 – 1957-Q4 · ⚓ K3

**Historia:** Eisenhower przechodzi zawał serca (24.09.1955), operację jelita (czerwiec 1956) i lekki udar (25.11.1957). Za każdym razem wraca do pracy.

**Etapy:**
1. **1955-Q3 zawał:** H powrót do zdrowia · A rezygnacja ze startu w 1956 (Nixon kandydatem) · A śmierć (bardzo rzadko; Nixon prezydentem; Rozbieżność USA +2).
2. **1956-Q2 operacja:** H.
3. **1957-Q4 udar:** H powrót · A niezdolność (Nixon pełni obowiązki).

**Siły:** brak (losowe), Rozbieżność USA. **PACE:** zmienia się, kto podpisuje budżet, i styl Białego Domu. Nixon jest bardziej zainteresowany wyścigiem jako polityką. **Kotwica K3:** prezydentem zostaje tylko prawdziwa osoba.

### A24. Wybory prezydenckie 1956
`wybory-1956` · region: usa · 1956-Q1 – 1956-Q4 · ⚓ K4 (wygrywa prawdziwy kandydat)

**Historia:** Eisenhower i Nixon ponownie pokonują Stevensona (6.11.1956), w cieniu Węgier i Suezu. W kanonie gry demokraci w 1952 roku wystawili Harrimana, więc w 1956 roku kandydatem może być on albo Stevenson.

**Etapy:**
1. **1956-Q1 kandydat republikanów:** H Eisenhower · A Nixon (jeśli A23 wykluczył Eisenhowera).
2. **1956-Q3 wiceprezydent:** H Nixon zostaje (był ruch „rzućmy Nixona” Stassena) · A Herter albo inny, z listy z A04.
3. **1956-Q3 kandydat demokratów:** H Stevenson · A Harriman (kanon) · A Kefauver.
4. **1956-Q4 ⚓ wynik:** wygrywa kandydat republikanów, gdy Eisenhower startuje. Bez Eisenhowera etap jest otwarty, ale wyłącznie między prawdziwymi kandydatami.

**PACE:** ciągłość albo zmiana administracji. Jeśli wygrywa demokrata, zmienia się sekretarz obrony i powtarza się przegląd programów.

### A25. Polski Październik
`polska-1956` · region: zsrr · 1956-Q2 – 1956-Q4

**Historia:** Powstanie poznańskie 28.06.1956 zostaje stłumione. Na VIII Plenum (19–21.10.1956) Gomułka wraca do władzy. Chruszczow przylatuje do Warszawy, radzieckie wojska ruszają i się zatrzymują. Polska wywalcza ograniczoną autonomię.

**Etapy:**
1. **1956-Q2 Poznań:** H stłumiony · X spokój (tajny referat nie padł, A08).
2. **1956-Q4 Październik:** H Gomułka i kompromis · A radziecka interwencja (`jednosc_bloku` +1 na krótko, NG −1, Rozbieżność ZSRR +1) · A Gomułka idzie dalej niż Nagy (bardzo rzadko).

**Siły:** `jednosc_bloku`, `kurs_kremla`. **PACE:** kanał do polskich naukowców (temat dla BAS), pierwsze pęknięcie w bloku. Marka Intermarium: ten wątek zasługuje na staranne teksty. **Szablon:** przypadek historyczny S05.

### A26. Rewolucja węgierska
`wegry-1956` · region: zsrr · 1956-Q4

**Historia:** 23.10.1956 wybucha powstanie. Nagy ogłasza neutralność i wyjście z Układu Warszawskiego. 4.11 następuje druga radziecka interwencja. Zachód, zajęty Suezem, nie reaguje. 200 tysięcy uchodźców.

**Etapy:**
1. **1956-Q4 powstanie:** H stłumione · A Moskwa ustępuje i Węgry stają się „drugą Austrią” (bardzo rzadko; zwykle wymaga X w A27 i wysokiej `zaangazowanie_usa`; Rozbieżność ZSRR +2) · A Zachód dostarcza broń (NG −2).
2. **1957-Q1 uchodźcy:** H fala uchodźców, wśród nich inżynierowie.

**Siły:** `jednosc_bloku`, `kurs_kremla`, flaga Suezu. **PACE:** uchodźcy to kadry (`pula_kadr` +1) i ryzyko szpiegostwa (BAS). Wiarygodność Zachodu. **Decyzja:** czy PACE organizuje program przyjęcia węgierskich inżynierów (RN +, BAS −, WF ryzyko). **Szablon:** S05.

### A27. Kryzys sueski
`suez` · region: bliski_wschod · 1956-Q3 – 1957-Q1

**Historia:**
- 26.07.1956 Naser nacjonalizuje Kanał Sueski.
- 29.10 Izrael atakuje, 5–6.11 lądują Brytyjczycy i Francuzi.
- Presja USA, groźby ZSRR i atak na funta wymuszają rozejm 6/7.11 i wycofanie.
- Eden ustępuje 9.01.1957.

**Etapy:**
1. **1956-Q3 nacjonalizacja:** H · X kompromis konferencji londyńskiej.
2. **1956-Q4 interwencja:** H interwencja i wycofanie pod presją USA · A USA popierają sojuszników (Rozbieżność Bliskiego Wschodu +2, NG −1, `jednosc_zachodu` +1) · A ZSRR wysyła „ochotników” (bardzo rzadko).
3. **1957-Q1 następstwa:** H Eden odchodzi, Macmillan naprawia relacje z USA · A Wielka Brytania zwraca się ku Europie.

**Siły:** `sila_wielkiej_brytanii`, `ambicja_francji`, `zaangazowanie_usa`. **PACE:** **kryzys w samym sercu PACE.** Dwóch członków założycielskich przeciw USA, Rada Atlantycka sparaliżowana, francuska nieufność wobec Waszyngtonu (zalążek gaullizmu, A33), ceny paliw. **Decyzja:** Londyn i Paryż żądają, żeby PACE nie przekazywała Waszyngtonowi danych z Woomery i Hammaguir w czasie kryzysu.

**Szablon:** przypadek historyczny S01 (surowce) i S12 (wojna arabsko-izraelska).

### A28. U-2 nad ZSRR
`u2` · region: zsrr · 1954-Q4 – 1960-Q2

**Historia:**
- Projekt zatwierdzony w listopadzie 1954 roku.
- Pierwszy lot nad ZSRR 4.07.1956.
- 1.05.1960 Powers zostaje zestrzelony koło Swierdłowska. Waszyngton kłamie, Chruszczow pokazuje pilota i szczątki.
- Szczyt paryski (16–17.05.1960) się rozpada.

**Etapy:**
1. **1954-Q4 decyzja:** H · O (+4 kw.).
2. **1956-Q3 pierwsze loty:** H · A loty z Wielkiej Brytanii zablokowane przez Edena (rzadziej i z Turcji).
3. **1960-Q2 zestrzelenie:** H Powers i krach szczytu · O loty zawieszone wcześniej (Eisenhower odwołuje lot przed szczytem) · A zestrzelenie bez schwytania pilota (Waszyngton „wygrywa” propagandowo) · A zestrzelenie wcześniej, w 1958 roku.

**Siły:** `presja_wyscigu`, `kurs_kremla`. **PACE:** **satelity rozpoznawcze zastępują samoloty.** Po zestrzeleniu rośnie presja na program satelitarny DPO i BAS (Zlecenia), zgodnie z GDD (satelity rozpoznawcze jako punkt integracji z KSP). **Decyzja:** czy PACE oferuje „cywilną przykrywkę” dla programu satelitarnego (WF −, DPO +, BAS +; Tajemnica w Rejestrze).

### A29. Doktryna Eisenhowera i rok 1958 na Bliskim Wschodzie
`bliski-wschod-1958` · region: bliski_wschod · 1957-Q1 – 1958-Q4

**Historia:**
- Doktryna Eisenhowera ogłoszona w styczniu 1957 roku.
- Zjednoczona Republika Arabska (Egipt i Syria) powstaje w lutym 1958.
- 14.07.1958 rewolucja w Iraku obala monarchię.
- 15.07 amerykańscy marines lądują w Libanie, a Brytyjczycy w Jordanii.
- Irak wychodzi z paktu bagdadzkiego.

**Etapy:**
1. **1957-Q1 doktryna:** H.
2. **1958-Q1 ZRA:** H · X nie powstaje.
3. **1958-Q3 Irak:** H rewolucja · A zamach się nie udaje (monarchia trwa; `popyt_na_rope` −1).
4. **1958-Q3 Liban:** H lądowanie bez walk · A walki (NG −1) · X bez interwencji.

**Siły:** `zaangazowanie_usa`, `popyt_na_rope`, `dekolonizacja`. **PACE:** ceny paliw, uwaga Waszyngtonu. Wielka Brytania wycofuje się z regionu. **Szablon:** przypadek historyczny S04 (zamach stanu) i S13 (interwencja USA).

### A30. Biała Księga Sandysa i Blue Streak
`sandys-blue-streak` · region: europa · 1955-Q1 – 1960-Q2

**Historia:**
- Blue Streak to brytyjski pocisk balistyczny średniego zasięgu (prace od 1955 roku, licencja na technologię Atlasa).
- Biała Księga Sandysa (4.04.1957) ogłasza, że era samolotów załogowych się kończy. Anulowanych zostaje wiele programów lotniczych.
- 13.04.1960 Blue Streak zostaje anulowany jako broń. Rakieta trafia potem do europejskiej ELDO (B15).

**Etapy:**
1. **1955-Q1 start Blue Streak:** H · O.
2. **1957-Q2 Biała Księga:** H cięcia w lotnictwie (m.in. SR.177 i Avro 730) · A łagodniejsza (programy przetrwają) · A ostrzejsza (anulowany także Lightning, czyli myśliwiec P.1).
3. **1960-Q2 los Blue Streak:** H anulowany jako broń · A ocalony jako broń · **A oddany PACE** (punkt decyzyjny).

**Siły:** `sila_wielkiej_brytanii`, `koniunktura`. **PACE:** **wątek przemysłowy pierwszej wagi.** Brytyjscy inżynierowie lotnictwa tracą pracę, więc pojawia się okazja kadrowa i polityczna (Hawker, de Havilland, Rolls-Royce w katalogu firm).

**Decyzja (1960-Q2):** Londyn proponuje przekazanie Blue Streaka PACE jako „rakiety sojuszniczej”. Zgoda daje nowy program i Dług wobec Londynu, ale amerykańskie Konsorcja Przemysłowe tracą kontrakty (PRZ −2). Odmowa otwiera drogę do ELDO bez PACE (B15).

### A31. Avro Arrow
`avro-arrow` · region: usa (Kanada) · 1953-Q2 – 1959-Q2

**Historia:** Kanadyjski myśliwiec przechwytujący CF-105 Arrow, zamówiony w 1953 roku, oblatany 25.03.1958. W „czarny piątek” (20.02.1959) rząd Diefenbakera anuluje program i każe zniszczyć prototypy. Około 14 tysięcy ludzi traci pracę. Kilkudziesięciu najlepszych inżynierów Avro przechodzi do NASA (Grupa Zadaniowa Lotów Kosmicznych).

**Etapy:**
1. **1953-Q2 zamówienie:** H.
2. **1958-Q1 oblot:** H · O (+2 kw.).
3. **1959-Q1 decyzja:** H anulowanie · A program ocalony (dzięki zamówieniom eksportowym albo PACE).

**Siły:** `koniunktura`, `zaangazowanie_usa` (Bomarc i NORAD jako alternatywa). **PACE:** **Kanada jest członkiem założycielskim.**

**Decyzja (1959-Q1):** po anulowaniu do wzięcia jest zespół inżynierów Avro. Do wyboru:
- zatrudnić ich w PACE (`pula_kadr` +2, RN +, Kanada wdzięczna, koszt);
- zostawić ich USA, gdzie trafiają do konkurencyjnych instytucji;
- lobbować za ocaleniem programu (KP −2, Dług wobec Ottawy).

**Szablon:** przypadek historyczny S11 „anulowanie programu u sojusznika”.

### A32. Traktaty rzymskie i Euratom
`ewg` · region: europa · 1955-Q2 – 1958-Q1

**Historia:** Konferencja w Mesynie (czerwiec 1955). Traktaty rzymskie (25.03.1957) tworzą EWG i Euratom, które działają od 1.01.1958. Wielka Brytania zostaje poza nimi i w 1960 roku tworzy EFTA.

**Etapy:**
1. **1955-Q2 Mesyna:** H · X fiasko.
2. **1957-Q1 traktaty:** H · O · A Wielka Brytania wchodzi od początku (rzadko; po gałęzi „zwrot ku Europie” w A27).

**Siły:** `jednosc_zachodu`, `sila_wielkiej_brytanii`, `ambicja_francji`. **PACE:** europejski kontrapunkt dla PACE. Euratom to wzór wspólnego finansowania nauki, a pytanie „czy Europa potrzebuje własnej agencji?” wraca w B15.

### A33. Francja: Algieria, maj 1958 i force de frappe
`francja-1958` · region: europa · 1954-Q4 – 1960-Q1

**Historia:**
- Wojna w Algierii od 1.11.1954.
- Kryzys majowy 1958 roku (13 maja zamach w Algierze). 1.06.1958 de Gaulle zostaje premierem.
- Konstytucja V Republiki (4.10.1958).
- Pierwsza francuska bomba atomowa, Gerboise Bleue (13.02.1960, Reggane).

**Etapy:**
1. **1954-Q4 wojna algierska:** H.
2. **1958-Q2 kryzys majowy:** H de Gaulle wraca · A zamach wojskowy w Paryżu się udaje (operacja Resurrection; Rozbieżność Europy +2, `ambicja_francji` +3) · O IV Republika trwa (+4 kw.).
3. **1958-Q4 V Republika:** H.
4. **1960-Q1 bomba:** H · P (1959) · O (1961).

**Siły:** `ambicja_francji` (*nowa*), `jednosc_zachodu`. **PACE:** **Hammaguir w Algierii jest poligonem rakietowym w świecie gry.** Wojna i niepodległość Algierii (B12) zagrażają poligonowi. De Gaulle chce francuskiej rakiety, francuskiego satelity i francuskiego weta w PACE.

**Decyzja (1958-Q4):** de Gaulle żąda dyrektoriatu trzech mocarstw (USA, Wielka Brytania, Francja) w PACE. Do wyboru: zgoda (Włochy i Kanada protestują), odmowa (`ambicja_francji` +1, ryzyko wyjścia Francji) albo kompromis.

### A34. Recesje Eisenhowera
`recesje-1950s` · region: usa · 1953-Q3 – 1961-Q1

**Historia:** Gospodarka przechodzi trzy recesje: od lipca 1953 do maja 1954 (koniec wojny koreańskiej), od sierpnia 1957 do kwietnia 1958 (najgłębsza) i od kwietnia 1960 do lutego 1961.

**Etapy:**
1. **1953-Q3:** H recesja · X miękkie lądowanie.
2. **1957-Q3:** H głęboka recesja · O łagodniejsza.
3. **1960-Q2:** H recesja w roku wyborczym (pomaga demokratom) · X brak recesji (pomaga Nixonowi, A41).

**Siły:** `koniunktura` (bezpośrednio). **PACE:** budżet ustawowy i Korekty. Recesja to tańsza praca i łatwiejsza rekrutacja, ale cięcia w Kongresie. Recesja 1960 roku wpływa na wynik wyborów 1960 (modyfikator w A41).

### A35. Kryzys berliński 1958–1960
`berlin-1958` · region: europa · 1958-Q4 – 1960-Q2

**Historia:** Ultimatum Chruszczowa z 27.11.1958: Berlin ma w ciągu sześciu miesięcy stać się „wolnym miastem”. Konferencja ministrów w Genewie (1959). Wizyta Chruszczowa w USA i Camp David (wrzesień 1959). Szczyt paryski (maj 1960) rozpada się po zestrzeleniu U-2.

**Etapy:**
1. **1958-Q4 ultimatum:** H · X brak ultimatum (przy niskim `kurs_kremla`).
2. **1959-Q3 Camp David:** H „duch Camp David” · A Chruszczow nie przyjeżdża.
3. **1960-Q2 szczyt paryski:** H rozpada się (jeśli A28 dał zestrzelenie) · A szczyt się udaje i powstaje tymczasowe porozumienie berlińskie (NG +1, B02 słabnie).

**Siły:** `kurs_kremla`, `jednosc_zachodu`. **PACE:** RFN i Berlin Zachodni, NG, wspólna polityka sojuszu. Dalszy ciąg w B02 (mur).

### A36. Kuba: rewolucja
`kuba-rewolucja` · region: swiat · 1957-Q1 – 1960-Q4

**Historia:** Partyzantka w górach Sierra Maestra. Batista ucieka 1.01.1959. W 1960 roku następują nacjonalizacje, embargo, umowy z ZSRR i zbliżenie z Moskwą. USA zrywają stosunki 3.01.1961.

**Etapy:**
1. **1958-Q4 upadek Batisty:** H · O (+4 kw.) · X Batista przetrwa (rzadko).
2. **1960-Q1 kurs na Moskwę:** H · A Castro neutralny, „drugi Tito” (przy wysokiej `zaangazowanie_usa` i ugodowej polityce USA).
3. **1960-Q4 zerwanie:** H embargo i zerwanie · A napięta, ale trwająca relacja.

**Siły:** `zaangazowanie_usa`, `antykomunizm`, `dekolonizacja`. **PACE:** **Przylądek Canaveral leży 150 km od Kuby.** Przy gałęzi „kurs na Moskwę” rośnie ryzyko dla ośrodków na Florydzie (BAS) i pytanie o drugi kosmodrom. Dalszy ciąg w B01 i B03.

### A37. Moratorium na próby i wybuchy wysokościowe
`moratorium` · region: swiat · 1957-Q2 – 1961-Q3

**Historia:**
- Rośnie ruch przeciw opadowi radioaktywnemu (stront-90 w mleku).
- Konferencja ekspertów w Genewie (lato 1958).
- Seria Hardtack Teak i Orange (sierpień 1958, Johnston) oraz operacja Argus (sierpień–wrzesień 1958, wybuchy w magnetosferze nad Atlantykiem Południowym).
- Moratorium trwa od 31.10.1958 do września 1961, kiedy ZSRR wznawia próby.

**Etapy:**
1. **1958-Q3 Teak, Orange i Argus:** H wybuchy wysokościowe · X Argus odwołany.
2. **1958-Q4 moratorium:** H · O (+2 kw.) · X brak moratorium (`wyscig_atomowy` +2).
3. **1961-Q3 koniec moratorium:** H ZSRR wznawia próby (dalej B06) · O.

**Siły:** `wyscig_atomowy`, `kurs_kremla`, `nastroje_spoleczne`. **PACE:** **Argus wymaga satelitów do pomiaru sztucznych pasów radiacyjnych.** Jeśli PACE ma satelitę naukowego, to naturalne Zlecenie DPO i RN, a zarazem konflikt (nauka kontra broń). Do tego ryzyko dla przyszłych satelitów (B06).

### A38. Rozłam chińsko-radziecki
`rozlam-chiny-zsrr` · region: azja · 1957-Q4 – 1960-Q3

**Historia:** Porozumienie o nowych technologiach obronnych z października 1957 roku obiecywało Chinom prototyp bomby i pociski R-2. Moskwa zrywa je w czerwcu 1959. W lipcu 1960 roku wycofuje doradców. Rozłam staje się publiczny w latach 1960–1963. W tle Wielki Skok Naprzód (1958–1962) i głód.

**Etapy:**
1. **1957-Q4 porozumienie:** H R-2 i obietnica bomby · X brak porozumienia.
2. **1959-Q2 zerwanie:** H · O (+4 kw.; Chiny dostają więcej pomocy) · A Moskwa przekazuje prototyp bomby (bardzo rzadko; przyspiesza B11).
3. **1960-Q3 wycofanie doradców:** H · A pojednanie (blok monolitem, `jednosc_bloku` +2).

**Siły:** `jednosc_bloku`, `kurs_kremla`. **PACE:** model ZSRR musi dzielić zasoby z Chinami albo przestaje. Chiński program rakietowy to późniejszy trzeci gracz (B11, C12).

### A39. Japonia: od suwerenności do Anpo
`japonia-1950s` · region: azja · 1952-Q2 – 1960-Q3

**Historia:**
- Traktat pokojowy wchodzi w życie 28.04.1952.
- Szok Bravo (Daigo Fukuryū Maru, 1954) daje początek ruchowi antyatomowemu.
- W 1955 roku powstaje Partia Liberalno-Demokratyczna.
- Nowy traktat bezpieczeństwa z USA (styczeń 1960) wywołuje masowe protesty Anpo. Wizyta Eisenhowera zostaje odwołana (16.06.1960), a premier Kishi ustępuje w lipcu.

**Kanon gry:** trzy bomby (Hiroszima, Nagasaki, Kobe). Ruch antyatomowy jest silniejszy niż w naszym świecie. Japonia jest obserwatorem w PACE od 1952 roku (program Sakura: łączność i telemetria).

**Etapy:**
1. **1952-Q2 suwerenność i status obserwatora:** H.
2. **1954-Q1 szok Bravo:** H (zob. A07) · A wielki ruch przeciw bazom USA.
3. **1960-Q2 Anpo:** H protesty, odwołana wizyta, Kishi odchodzi · A traktat upada (Japonia neutralna; tracimy stacje telemetryczne Sakura) · X spokój.

**Siły:** `wyscig_atomowy`, `napiecie_azja`, `nastroje_spoleczne`. **PACE:** stacje śledzenia nad Pacyfikiem i japoński wkład technologiczny. **Decyzja:** Tokio prosi o rakietę badawczą PACE na japoński Rok Geofizyczny (jak historyczne Kappa). Zgoda: Japonia +, BAS −, bo przekazywanie technologii.

### A40. Bandung i fala dekolonizacji
`dekolonizacja-1` · region: swiat · 1955-Q2 – 1960-Q4

**Historia:** Konferencja w Bandungu (18–24.04.1955). Niepodległość Ghany (1957). „Rok Afryki” 1960: 17 nowych państw. W tle walka o głosy w ONZ.

**Etapy:**
1. **1955-Q2 Bandung:** H.
2. **1957-Q1 Ghana:** H · O.
3. **1960-Q3 Rok Afryki:** H · O (część kolonii później; Francja i Wielka Brytania silniejsze).

**Siły:** `dekolonizacja` (*nowa*), `sila_wielkiej_brytanii`, `ambicja_francji`. **PACE:** nowe państwa to stacje śledzenia (Afryka, Ocean Indyjski) i głosy w ONZ w sprawach prawa kosmicznego. Napędza szablony S06 i S03.

### A41. Wybory prezydenckie 1960
`wybory-1960` · region: usa · 1960-Q1 – 1961-Q1 · ⚓ K5 (prawdziwy kandydat; wynik otwarty)

**Historia:** Kennedy pokonuje Nixona minimalnie (8.11.1960) po pierwszych debatach telewizyjnych, w czasie recesji i sporu o „lukę rakietową”.

**Etapy:**
1. **1960-Q3 kandydaci:** H Kennedy kontra Nixon · A Johnson albo Symington u demokratów · A Rockefeller u republikanów (rzadko).
2. **1960-Q4 ⚓/otwarty wynik:** H Kennedy · A Nixon.

**Modyfikatory dla Nixona:**
- brak recesji w 1960 roku (A34): ×2;
- „luka rakietowa” obalona publicznie (A20): ×1,5;
- PACE przed ZSRR w wyścigu: ×1,5.

**Modyfikatory dla Kennedy'ego:** szok orbitalny ×1,5, recesja ×1,5.

**PACE:** **Gracz realnie wpływa na wynik.** Twoje sukcesy w KSP przesuwają wagi. Nowa administracja (Kennedy albo Nixon) to inny styl budżetu i inny „wielki cel”.

### A42. Odpowiedź na szok orbitalny (wątek reaktywny)
`odpowiedz-na-szok` · region: usa · start: flaga `szok_orbitalny` · bez stałych dat

**Historia (dla porównania):**
- raport Gaithera (7.11.1957);
- ARPA (luty 1958);
- ustawa o edukacji obronnej NDEA (wrzesień 1958);
- ustawa o NASA (lipiec 1958).

W świecie gry zamiast NASA pojawia się opcjonalna reorganizacja: NAAA z Biblii (DD 4.3).

**Etapy (przesunięcia od startu):**
1. **+1 kw. raport:** H alarmistyczny raport · A raport wyważony.
2. **+2 kw. nowa agencja badań obronnych:** H powstaje (konkurent dla PACE w sprawach wojskowych; DPO −) · X nie powstaje.
3. **+3 kw. ustawa o edukacji:** H (`pula_kadr` +2 w ciągu 4–8 kw.) · O.
4. **+2 kw. reorganizacja PACE:** to już **istniejący łańcuch kryzysu Szok orbitalny z GDD**. Ten wątek nie powtarza go, tylko ustawia mu tło.

**Uwaga:** jeśli PACE pierwsza wyniesie satelitę i szoku nie ma, wątek nie startuje. Zamiast niego może ruszyć wątek „Samozadowolenie” (GDD 31.3), do napisania przy modelu wyścigu.

### A43. Rakiety średniego zasięgu w Europie
`irbm-europa` · region: europa · 1957-Q4 – 1963-Q2

**Historia:**
- Po Sputniku NATO decyduje (grudzień 1957) o rozmieszczeniu pocisków średniego zasięgu w Europie.
- Thor trafia do Wielkiej Brytanii (projekt Emily, 1958–1963).
- Jupiter trafia do Włoch (od 1961) i Turcji (od 1961–1962).
- Wycofanie Jupiterów w 1963 roku to cicha część ugody kubańskiej (B03).

**Etapy:**
1. **1957-Q4 decyzja NATO:** H · A Francja żąda kontroli nad głowicami i odmawia.
2. **1958-Q3 Thor w Wielkiej Brytanii:** H · O.
3. **1961-Q2 Jupiter we Włoszech i Turcji:** H · X Włochy odmawiają (wewnętrzna polityka).
4. **1963-Q2 wycofanie:** H (po B03) · X zostają.

**Siły:** `jednosc_zachodu`, `ambicja_francji`, `kurs_kremla`. **PACE:** Włochy i Wielka Brytania są członkami. Pociski to sprawa DPO, ale ich obecność w Europie zmienia NG i stosunki w Radzie Atlantyckiej. **Decyzja:** czy PACE angażuje swoje ośrodki szkoleniowe w szkolenie załóg (DPO +, RN −, WF −).

## Blok B — 1961–1965: przełomy (25 wątków)

Karty są krótsze. Etapy podaję w jednej linii: kwartał, nazwa i gałęzie.

### B01. Zatoka Świń i operacja Mongoose
`zatoka-swin` · swiat · 1961-Q1 – 1962-Q3 · start: A36 „kurs na Moskwę”

**Historia:** Desant emigrantów (17–20.04.1961) kończy się klęską, bez wsparcia lotnictwa USA. Potem operacja Mongoose, czyli tajna wojna z Castro.

**Etapy:**
- **1961-Q2 desant:** H klęska · A wsparcie lotnicze USA i przyczółek (wojna na Kubie; Rozbieżność +2) · X operacja odwołana przez nową administrację.
- **1961-Q4 Mongoose:** H · X.

**PACE:** prestiż administracji, ryzyko dla Przylądka. Klęska popycha Biały Dom do szukania spektakularnego sukcesu, co historycznie przyspieszyło decyzję o Księżycu. **Modyfikator:** klęska zwiększa skłonność Białego Domu do „wielkiego celu” (zdarzenie modelu wyścigu).

### B02. Mur berliński
`mur-berlinski` · europa · 1961-Q2 – 1963-Q2

**Historia:**
- Szczyt wiedeński (czerwiec 1961): Chruszczow naciska Kennedy'ego.
- 13.08.1961 powstaje mur.
- W październiku 1961 czołgi obu stron stają naprzeciw siebie przy Checkpoint Charlie.
- W czerwcu 1963 Kennedy mówi „Ich bin ein Berliner” (jeśli jest prezydentem).

**Etapy:**
- **1961-Q2 Wiedeń:** H twarda rozmowa · A porozumienie (rzadko; po A35 „szczyt się udaje”).
- **1961-Q3 mur:** H · A blokada Berlina Zachodniego (drugi most powietrzny; NG −2) · X brak muru (masowa ucieczka trwa; `jednosc_bloku` −2).
- **1961-Q4 Checkpoint Charlie:** H wycofanie · A strzały (NG −2).

**PACE:** RFN i Berlin, uciekinierzy-inżynierowie (przed murem), NG.

### B03. Kryzys kubański
`kryzys-kubanski` · swiat · 1962-Q3 – 1963-Q2 · K12

**Historia:** Zdjęcia U-2 z 14.10.1962 pokazują wyrzutnie. Następuje blokada („kwarantanna”). 27.10, „czarna sobota”: zestrzelony U-2 nad Kubą i incydent z okrętem podwodnym B-59. Ugoda z 28.10: rakiety wychodzą z Kuby, Jupitery z Turcji po cichu (A43).

**Etapy:**
- **1962-Q3 rozmieszczenie:** H · X Moskwa rezygnuje (bez Zatoki Świń i Mongoose).
- **1962-Q4 kryzys:** H blokada i ugoda · A naloty na wyrzutnie (NG = 1, wojna ograniczona) · A wojna jądrowa (**tylko jeśli autor skreśli K12; wtedy osobne zakończenie kampanii**) · P rakiety wykryte wcześniej (łagodniejszy kryzys).
- **1963-Q2 następstwa:** H gorąca linia i wycofanie Jupiterów.

**PACE:** **najwyższe NG w grze.** Ośrodki na Florydzie w zasięgu rakiet. Przejściowo rośnie budżet obrony. Po kryzysie przychodzi odprężenie (B07).

**Decyzja:** Pentagon żąda przejęcia wyrzutni i rakiet PACE na czas kryzysu. Zgoda: DPO +2, RN −2, wstrzymane loty. Odmowa: ZW −.

### B04. Laos i Wietnam: doradcy
`indochiny-doradcy` · azja · 1961-Q1 – 1963-Q4

**Historia:** Kryzys laotański i konferencja genewska o neutralności Laosu (23.07.1962). Wzrost liczby amerykańskich doradców w Wietnamie Południowym. Kryzys buddyjski (1963). Zamach na Diema 1–2.11.1963.

**Etapy:**
- **1961-Q2 Laos:** H neutralizacja · A interwencja w Laosie.
- **1962-Q3 Genewa:** H.
- **1963-Q4 Diem:** H obalony i zabity · A Diem przetrwa · X USA wycofują doradców (rzadko; przy niskiej `zaangazowanie_usa`).

**Siły:** `napiecie_azja`, `zaangazowanie_usa`.

### B05. Wietnam: eskalacja
`wietnam-eskalacja` · azja · 1964-Q3 – 1965-Q4

**Historia:** Incydent w Zatoce Tonkińskiej (2 i 4.08.1964) i rezolucja (7.08). Operacja Rolling Thunder od 2.03.1965. 8.03.1965 marines w Da Nang. Do końca roku 184 tysiące żołnierzy.

**Etapy:**
- **1964-Q3 Tonkin:** H rezolucja · X incydent się nie powtarza i rezolucji brak.
- **1965-Q1 bombardowania:** H · O.
- **1965-Q2 wojska lądowe:** H masowa eskalacja · A ograniczony kontyngent (enklawy).

**PACE:** **wojna zjada budżet.** Korekty, cięcia w programach cywilnych, nastroje (`nastroje_spoleczne`) i odpływ zainteresowania Kongresu od kosmosu.

### B06. Wybuchy na dużej wysokości: Starfish Prime
`starfish` · swiat · 1961-Q3 – 1962-Q4

**Historia:**
- ZSRR wznawia próby (wrzesień 1961), a 30.10.1961 detonuje Car-bombę (ok. 50 Mt).
- 9.07.1962 Starfish Prime: 1,4 Mt na wysokości 400 km. Impuls elektromagnetyczny na Hawajach, sztuczny pas radiacyjny, kilka satelitów uszkodzonych w ciągu miesięcy (w tym Telstar).
- Radziecki projekt K (1961–1962).

**Etapy:**
- **1961-Q4 Car-bomba:** H · O.
- **1962-Q3 Starfish:** H · X odwołany · A większa seria.

**PACE:** **bezpośrednie zagrożenie dla Twoich satelitów w KSP.** Silnik nie niszczy pojazdów w grze (zasada wydarzeń). Zamiast tego wątek daje **Korektę** i decyzję gracza: satelity na orbicie z pasa „tracą” część czasu życia, a gracz stosuje to sam albo dostaje Dyrektywę zastąpienia.

**Decyzja:** czy PACE protestuje publicznie (RN +, DPO −, ZW −).

### B07. Traktat o częściowym zakazie prób i gorąca linia
`ltbt` · swiat · 1963-Q2 – 1963-Q4

**Historia:** Przemówienie Kennedy'ego na American University (10.06.1963). Gorąca linia (memorandum z 20.06, działa od 30.08). Traktat moskiewski z 5.08.1963 zakazuje prób w atmosferze, w kosmosie i pod wodą. Francja i Chiny go nie podpisują.

**Etapy:**
- **1963-Q3:** H traktat · O (+4 kw.) · X brak traktatu (`wyscig_atomowy` +2) · A traktat pełny, także pod ziemią (rzadko).

**PACE:** koniec wybuchów w kosmosie, NG +1. Pierwszy krok do prawa kosmicznego (C09).

### B08. Dallas
`dallas` · usa · 1963-Q4 · start: flaga `prezydent_kennedy`

**Historia:** 22.11.1963 Kennedy ginie w zamachu. Prezydentem zostaje Johnson.

**Etapy:**
- **1963-Q4:** H zamach · X zamachu nie ma (Kennedy rządzi do wyborów 1964).

**Uwagi projektowe:** śmierć prawdziwej osoby piszemy z powagą i bez spekulacji spiskowych w tekstach wydarzeń. Wątek startuje tylko wtedy, gdy Kennedy wygrał w A41. Przy Nixonie jako prezydencie wątku nie ma, a w jego miejsce nie wchodzi żaden szablon zamachu.

**PACE:** w historii śmierć Kennedy'ego zamieniła program księżycowy w testament. W grze to modyfikator: ZW programu załogowego +, łatwiejsza obrona budżetu przez 4–6 kw.

### B09. Wybory prezydenckie 1964
`wybory-1964` · usa · 1964-Q3 – 1964-Q4 · ⚓ K6

**Historia:** Johnson miażdży Goldwatera (3.11.1964).

**Etapy:**
- **1964-Q3 kandydaci:** H Johnson kontra Goldwater; kandydaci fikcyjni mogą startować (K6) · A Kennedy kontra Rockefeller (gdy X w B08) · A Nixon na drugą kadencję.
- **1964-Q4 ⚓:** wygrywa prawdziwy kandydat. Który, zależy od stanu świata.

**PACE:** wielki mandat (Wielkie Społeczeństwo, B18), czyli konkurencja o budżet.

### B10. Upadek Chruszczowa
`upadek-chruszczowa` · zsrr · 1964-Q4

**Historia:** Plenum KC 14.10.1964 odsuwa Chruszczowa. Władzę przejmują Breżniew i Kosygin.

**Etapy:**
- **1964-Q4:** H odsunięty · O (+4 kw.) · X Chruszczow przetrwa · P wcześniej, po Kubie (1963).
- Warunek: jeśli w A08 wygrał Mołotow, wątek nie startuje, a w jego miejsce wchodzi szablon S08 „sukcesja na Kremlu”.

**PACE:** zmiana Doktryny w modelu ZSRR, `kurs_kremla`. Mniej spektakli, więcej systematyczności po radzieckiej stronie.

### B11. Chińska bomba
`chinska-bomba` · azja · 1960-Q3 – 1967-Q2 · ⚓ K10

**Historia:** Chiny po odejściu radzieckich doradców kontynuują program. Pierwszy wybuch nastąpił 16.10.1964 (Lop Nur). W 1966 roku próba pocisku z głowicą, w czerwcu 1967 bomba wodorowa.

**Etapy:**
- **1964-Q4 bomba:** H · P (1962–1963; po A38 „prototyp”) · O (1966) · A uderzenie prewencyjne na Lop Nur, rozważane w Waszyngtonie (bardzo rzadko; NG −2).
- **1967-Q2 bomba wodorowa:** H.

**PACE:** trzecie mocarstwo atomowe, Japonia (obserwator) zaniepokojona, NG. Wstęp do chińskiego programu kosmicznego (C12).

### B12. Algieria: pucz generałów i niepodległość
`algieria` · europa · 1961-Q2 – 1962-Q3

**Historia:** Pucz generałów w Algierze (21–26.04.1961) się nie udaje. Terror OAS. Porozumienia z Évian (18.03.1962). Niepodległość 5.07.1962. Francuskie poligony na Saharze działają dzięki klauzulom z Évian do 1967 roku.

**Etapy:**
- **1961-Q2 pucz:** H fiasko · A pucz się udaje (Francja w chaosie; Rozbieżność Europy +2).
- **1962-Q1 Évian:** H z klauzulą poligonów · A bez klauzuli (natychmiastowa utrata poligonu).
- **1962-Q3 niepodległość:** H.

**PACE:** **los Hammaguir.** Poligon PACE i Francji. Termin wyjścia (1967) oznacza Dyrektywę przeniesienia startów, np. do Kourou (DD 4.6).

### B13. De Gaulle kontra Anglosasi
`de-gaulle-nato` · europa · 1963-Q1 – 1966-Q3

**Historia:** 14.01.1963 de Gaulle wetuje wejście Wielkiej Brytanii do EWG. 22.01.1963 traktat elizejski z RFN. W marcu 1966 Francja ogłasza wyjście ze zintegrowanych struktur wojskowych NATO, ze skutkiem od lipca.

**Etapy:**
- **1963-Q1 weto:** H · X Wielka Brytania przyjęta.
- **1966-Q1 wyjście z NATO:** H · A Francja wychodzi także z PACE (`ambicja_francji` ≥ 8) · X zostaje.

**PACE:** **groźba utraty członka założycielskiego.** Weto w Radzie Atlantyckiej staje się narzędziem gaullizmu.

**Decyzja (1966):** dać Francji osobny program narodowy pod szyldem PACE (Diament i satelita Asterix; Dług wobec Paryża, PRZ −) czy pozwolić jej odejść.

### B14. Skybolt i Nassau
`skybolt` · europa · 1962-Q4

**Historia:** USA anulują pocisk lotniczy Skybolt, na którym Wielka Brytania oparła swoje odstraszanie (po rezygnacji z Blue Streaka). Na konferencji w Nassau (18–21.12.1962) Macmillan dostaje Polarisy.

**Etapy:**
- **1962-Q4:** H anulowanie i Polaris · A Skybolt ocalony · A Wielka Brytania bez zamiennika (wraca do własnej rakiety; okazja dla PACE i A30).

**PACE:** wiarygodność USA w oczach Londynu, brytyjski przemysł. Argument de Gaulle'a: „Anglosasi”.

### B15. Europa w kosmosie: ELDO i ESRO
`eldo-esro` · europa · 1960-Q4 – 1964-Q2

**Historia:** Konwencja ELDO z 1962 roku, w mocy od 1964: rakieta Europa z Blue Streakiem jako pierwszym stopniem, francuskim drugim i niemieckim trzecim. Konwencja ESRO z 1962 roku, w mocy od 1964 (satelity naukowe).

**Etapy:**
- **1961-Q1 pomysł:** H.
- **1962-Q1 konwencje:** H · X pomysł umiera.
- **1964-Q1 start organizacji:** H.

**Modyfikatory:**
- duży udział Europy w programach PACE: X ×3;
- Blue Streak oddany PACE (A30): X ×5;
- ignorowanie europejskich wniosków przez Andersona: H ×2.

**PACE:** **wątek lustrzany.** ELDO i ESRO to europejska odpowiedź na PACE. Powstają tym pewniej, im bardziej PACE jest amerykańska. Anderson może je zablokować, wchłonąć albo z nimi konkurować.

### B16. Satelity łączności: Comsat i Intelsat
`comsat` · swiat · 1961-Q3 – 1965-Q2

**Historia:** Telstar (10.07.1962) i pierwsza transatlantycka telewizja na żywo. Ustawa o satelitach łączności (31.08.1962) tworzy Comsat. Intelsat powstaje 20.08.1964. Syncom 3 transmituje igrzyska w Tokio (październik 1964). Early Bird, Intelsat I (1965).

**Etapy:**
- **1962-Q3 ustawa:** H spółka prywatna z udziałem państwa · A monopol AT&T · A monopol państwowy (PACE operatorem!).
- **1964-Q3 Intelsat:** H · O.

**PACE:** **kto wynosi satelity łączności i kto na nich zarabia.** Satelity buduje przemysł, ale rakiety PACE mogą je wynosić. Szansa na przychody z kontraktów komercyjnych i spór z Konsorcjami Przemysłowymi (PRZ), które chcą rynku dla siebie.

**Decyzja:** przy gałęzi „monopol państwowy” Kongres pyta, czy PACE chce być operatorem.

### B17. Prawa obywatelskie: Birmingham, Marsz, ustawy
`prawa-obywatelskie-2` · usa · 1963-Q2 – 1965-Q3

**Historia:** Birmingham (kwiecień–maj 1963). Marsz na Waszyngton (28.08.1963). Ustawa o prawach obywatelskich (2.07.1964). Selma (marzec 1965). Ustawa o prawie wyborczym (6.08.1965). Zamieszki w Watts (sierpień 1965).

**Etapy:**
- **1963-Q3 Marsz:** H · A zamieszki.
- **1964-Q3 ustawa:** H · O (filibuster wygrywa na rok).
- **1965-Q3 Watts:** H · X.

**PACE:** `nastroje_spoleczne`, pytanie „Księżyc czy biedni”, zatrudnienie w ośrodkach na Południu (A18).

### B18. Wielkie Społeczeństwo
`wielkie-spoleczenstwo` · usa · 1964-Q1 – 1966-Q4

**Historia:** Wojna z ubóstwem (ustawa z sierpnia 1964), Medicare i Medicaid (lipiec 1965), programy edukacyjne. Rosnące koszty razem z Wietnamem.

**Etapy:**
- **1964-Q3:** H · X (przy kontynuacji z B09 „Nixon”).
- **1965-Q3:** H rozbudowa · O.

**PACE:** **główny konkurent o budżet w połowie dekady.** Komisje środków dzielą pieniądze między Wietnam, Wielkie Społeczeństwo i kosmos.

### B19. Kongo i Katanga
`kongo` · swiat · 1960-Q2 – 1963-Q1

**Historia:**
- Niepodległość Konga 30.06.1960, bunt armii, secesja Katangi.
- Misja ONZ. Lumumba zostaje zamordowany 17.01.1961.
- 18.09.1961 Hammarskjöld ginie w katastrofie lotniczej.
- Katanga zostaje wcielona w styczniu 1963.

**Etapy:**
- **1960-Q3 kryzys:** H.
- **1961-Q1 Lumumba:** H zamordowany · A Lumumba przetrwa i zwraca się ku Moskwie (wojna zastępcza, szablon S03).
- **1963-Q1 Katanga:** H wcielona · O.

**PACE:** uran z Katangi (Shinkolobwe), stacje śledzenia w Afryce, ONZ. **Szablon:** przypadek historyczny S03 (wojna zastępcza) i S06 (kryzys dekolonizacyjny).

### B20. Dolar i złoto
`dolar-zloto` · swiat · 1960-Q4 – 1965-Q1

**Historia:** Gorączka złota w październiku 1960 roku. Londyńska pula złota (1961). Podatek wyrównawczy od odsetek (1963). Ostrzeżenia de Gaulle'a (1965) i francuskie żądania wymiany dolarów na złoto.

**Etapy:**
- **1960-Q4:** H · X.
- **1965-Q1 atak Francji na dolara:** H · A szybki kryzys dolara (koniunktura −2; P dla C13).

**PACE:** wartość składek w dolarach i walutach członków; to przypadek szablonu S02.

### B21. Japonia: Tokio 1964 i własna rakieta
`japonia-1960s` · azja · 1962-Q1 – 1970-Q1

**Historia:** Igrzyska w Tokio (październik 1964) z transmisją przez Syncom 3. Japoński program rakietowy Uniwersytetu Tokijskiego: rakiety Kappa i Lambda. Osumi, pierwszy japoński satelita (11.02.1970).

**Etapy:**
- **1964-Q4 igrzyska:** H transmisja satelitarna (jeśli PACE ma satelitę łączności, to jej transmisja: PP +, Japonia +).
- **1966-Q1 własna rakieta:** H Japonia buduje sama · A Japonia buduje w ramach PACE.
- **1970-Q1 Osumi:** H · O · P.

**PACE:** **obserwator, który może zostać członkiem albo konkurentem.** Pamięć Kobe i Hiroszimy, opór wobec rakiet wojskowych, dlatego program jest naukowy.

### B22. Wilson i „biały żar technologii”
`wilson` · europa · 1963-Q4 – 1966-Q1

**Historia:**
- Afera Profumo (1963) osłabia konserwatystów.
- Labourzyści Wilsona wygrywają wybory (15.10.1964) z hasłem „białego żaru rewolucji technologicznej”.
- Kryzys funta.
- Anulowanie TSR-2 (kwiecień 1965) i przegląd lotnictwa.
- Concorde ocalony tylko dlatego, że traktat z Francją z 1962 roku nie przewidywał wyjścia.

**Etapy:**
- **1964-Q4 wybory:** H Labour · A konserwatyści (Douglas-Home) zostają.
- **1965-Q2 TSR-2:** H anulowany · A ocalony.
- **1965-Q1 Concorde:** H zostaje · X Wielka Brytania wychodzi.

**PACE:** brytyjski przemysł lotniczy i kadry (S11), składka brytyjska, dylemat „sprzedać się Ameryce czy Europie”.

### B23. Wojna chińsko-indyjska
`chiny-indie` · azja · 1962-Q4

**Historia:** Wojna w Himalajach (20.10–21.11.1962), w cieniu kryzysu kubańskiego. Chiny wygrywają i jednostronnie się wycofują.

**Etapy:**
- **1962-Q4:** H · X · A wojna dłuższa, z udziałem USA.

**PACE:** Indie jako przyszły partner (stacja w Thumbie od 1963) albo partner ZSRR. `napiecie_azja`.

### B24. Indonezja 1965
`indonezja-1965` · azja · 1963-Q1 – 1966-Q1

**Historia:** Konfrontacja z Malezją (1963–1966). Nieudany pucz Ruchu 30 Września (1.10.1965), po nim masakry komunistów i odsunięcie Sukarno. Władzę przejmuje Suharto.

**Etapy:**
- **1965-Q4:** H Suharto i masakry · A pucz się udaje (Indonezja w bloku wschodnim; Rozbieżność Azji +2; kraj wypada z listy szablonu S01 jako „zachodni”).

**PACE:** ropa (S01), szlaki morskie, stacje śledzenia na Pacyfiku. Teksty o masakrach piszemy z powagą i bez szczegółów okrucieństw.

### B25. Dominikana 1965
`dominikana-1965` · swiat · 1965-Q2

**Historia:** Wojna domowa i interwencja 22 tysięcy żołnierzy USA (od 28.04.1965) „przeciw drugiej Kubie”.

**Etapy:**
- **1965-Q2:** H interwencja · X bez interwencji · A interwencja przedłuża się w partyzantkę.

**PACE:** marginalnie: uwaga Waszyngtonu, opinia w Ameryce Łacińskiej, stacje śledzenia na Karaibach (Antigua). **Szablon:** przypadek historyczny S13.

## Blok C — 1966–1972: przełomy (20 wątków)

### C01. Wietnam: Tet i wycofanie
`wietnam-wycofanie` · azja · 1966-Q1 – 1973-Q1

**Historia:**
- Szczyt zaangażowania: ponad 500 tysięcy żołnierzy (1968).
- Ofensywa Tet (30–31.01.1968).
- „Wietnamizacja” od 1969 roku.
- Kambodża (30.04.1970) i strzelanina w Kent State (4.05.1970).
- Ofensywa wielkanocna (1972).
- Porozumienia paryskie (27.01.1973).

**Etapy:**
- **1968-Q1 Tet:** H militarna porażka komunistów, polityczne zwycięstwo · A Tet nie następuje (wojna ciągnie się dłużej, mniejszy szok).
- **1969-Q2 wietnamizacja:** H · O.
- **1970-Q2 Kambodża:** H · X.
- **1973-Q1 Paryż:** H · P (1971) · O (1974).

**PACE:** budżet (Korekty), `nastroje_spoleczne`, kadry (pobór). Antywojenny klimat uderza w „rakiety” jako symbol.

### C02. Rok 1968 w USA
`usa-1968` · usa · 1968-Q1 – 1968-Q3

**Historia:**
- 31.03.1968 Johnson rezygnuje z ubiegania się o reelekcję.
- 4.04 ginie Martin Luther King, a w ponad stu miastach wybuchają zamieszki.
- 5–6.06 zostaje zastrzelony Robert Kennedy.
- W sierpniu konwencja w Chicago i starcia z policją.

**Etapy:**
- **1968-Q1 Johnson:** H rezygnacja · A startuje (przy B09 Johnson).
- **1968-Q2 zabójstwa:** H · X (każde osobno, z osobną wagą; teksty z powagą).
- **1968-Q3 Chicago:** H · X.

**PACE:** `nastroje_spoleczne` na szczycie, PP dla „drogich programów” pod presją. **Uwaga:** śmierci prawdziwych osób to H i X, bez gałęzi spiskowych.

### C03. Wybory prezydenckie 1968
`wybory-1968` · usa · 1968-Q3 – 1968-Q4 · K7 (postać fikcyjna może wygrać)

**Historia:** Nixon pokonuje Humphreya, a Wallace zdobywa pięć stanów.

**Etapy:**
- **1968-Q3 kandydaci:** H Nixon, Humphrey, Wallace · A kandydat fikcyjny (zgodnie z K7; nazwisko z listy autora) · A Robert Kennedy (gdy X w C02).
- **1968-Q4 wynik:** H Nixon · A Humphrey · A kandydat fikcyjny.

**Modyfikatory:** sukces w wyścigu, Wietnam, `nastroje_spoleczne`.

**PACE:** to pierwsze wybory, w których **świat może dostać prezydenta spoza historii**. Lista kandydatów fikcyjnych należy do autora.

### C04. Wybory prezydenckie 1972
`wybory-1972` · usa · 1972-Q3 – 1972-Q4 · K7

**Historia:** Nixon wygrywa miażdżąco z McGovernem.

**Etapy:**
- **1972-Q4:** H urzędujący prezydent wygrywa · A wygrywa opozycja.

Kandydaci zależą od C03.

**PACE:** ciągłość albo zmiana. Nixon historycznie tnie budżet NASA po Apollo, więc w grze rośnie presja na „następstwa”.

### C05. Praska Wiosna
`praga-1968` · zsrr · 1968-Q1 – 1968-Q3

**Historia:** Dubček zostaje pierwszym sekretarzem (styczeń 1968). Reformy, „socjalizm z ludzką twarzą”. Inwazja Układu Warszawskiego 20–21.08.1968. Doktryna Breżniewa.

**Etapy:**
- **1968-Q3 inwazja:** H · X Moskwa toleruje (rzadko; Rozbieżność ZSRR +2) · A opór zbrojny (NG −1).

**PACE:** NG, `jednosc_bloku`, czechosłowaccy uciekinierzy-inżynierowie. Polska bierze udział w inwazji, co łączy się z C16. **Szablon:** S05.

### C06. Wojna sześciodniowa i wojna na wyczerpanie
`izrael-1967` · bliski_wschod · 1967-Q2 – 1970-Q3

**Historia:** Wojna sześciodniowa (5–10.06.1967), po niej arabskie embargo naftowe, które nie działa. Kanał Sueski zamknięty do 1975 roku. Wojna na wyczerpanie wzdłuż kanału (1969–1970), radzieccy piloci w Egipcie.

**Etapy:**
- **1967-Q2:** H szybkie zwycięstwo Izraela · O wojna dłuższa · X wojny brak.
- **1969-Q1 wojna na wyczerpanie:** H · X.

**PACE:** ceny paliw, zamknięty Suez (logistyka morska do Australii i Woomery wydłuża się), NG. **Szablon:** przypadek historyczny S12. ⚓ K11.

### C07. Francja: wyjście z NATO i Maj ’68
`francja-1968` · europa · 1966-Q1 – 1969-Q2

**Historia:** Wyjście ze zintegrowanych struktur wojskowych NATO (1966, zob. B13). Maj ’68: strajki i rewolta studencka. De Gaulle wygrywa wybory w czerwcu, ale ustępuje 28.04.1969, dzień po przegranym referendum.

**Etapy:**
- **1968-Q2 Maj:** H · A rząd upada.
- **1969-Q2 odejście de Gaulle'a:** H · O (zostaje do 1972).

**PACE:** `ambicja_francji` spada po odejściu de Gaulle'a, co otwiera drogę do powrotu albo pogłębienia współpracy.

### C08. Dewaluacja funta i odwrót spod Suezu
`funt-1967` · europa · 1967-Q4 – 1968-Q1

**Historia:** Dewaluacja funta (18.11.1967). Zapowiedź wycofania wojsk „na wschód od Suezu” (16.01.1968).

**Etapy:**
- **1967-Q4:** H · X · P (1966).
- **1968-Q1:** H · O.

**PACE:** składka brytyjska w dolarach spada, `sila_wielkiej_brytanii` −2. Woomera i Australia: mniejsze zaangażowanie Londynu w regionie. **Szablon:** przypadek historyczny S02.

### C09. Prawo kosmiczne
`prawo-kosmiczne` · swiat · 1966-Q2 – 1972-Q4

**Historia:**
- Traktat o przestrzeni kosmicznej podpisany 27.01.1967, w mocy od 10.10.1967: zakaz broni masowego rażenia na orbicie, zakaz zawłaszczania ciał niebieskich, odpowiedzialność państw.
- Porozumienie o ratowaniu astronautów (1968).
- Konwencja o odpowiedzialności za szkody (1972).

**Etapy:**
- **1966-Q4 negocjacje:** H · O.
- **1967-Q1 traktat:** H · O (+4 kw.) · X brak traktatu (bardzo rzadko; NG −1, otwarta militaryzacja orbity) · A traktat z zakazem wszelkiej broni na orbicie.
- **1968-Q2 ratowanie:** H.
- **1972-Q1 odpowiedzialność:** H.

**Modyfikatory:** brak traktatu antarktycznego (A22): H ×0,5. Wysoki `wyscig_atomowy`: X ×2.

**PACE:** **wątek ustrojowy dla PACE.** Kto „odpowiada” za obiekt organizacji międzynarodowej? Militaryzacja orbity to jedno z trzech dziedzictw Epoki IV (GDD 4.4).

**Decyzja (1967-Q1):** PACE może lobbować za traktatem (RN +, DPO −), przeciw niemu (DPO +) albo milczeć.

### C10. Układ o nierozprzestrzenianiu broni jądrowej
`npt` · swiat · 1968-Q2 – 1970-Q1

**Historia:** Układ podpisany 1.07.1968, w mocy od 5.03.1970. RFN, Japonia i Włochy podpisują z wahaniem, Francja i Chiny nie.

**Etapy:**
- **1968-Q3:** H · O · A RFN odmawia (napięcie z ZSRR, `jednosc_zachodu` −1).

**PACE:** ograniczenia w przekazywaniu technologii rakietowych (podwójne zastosowanie) członkom bez broni jądrowej. Przyszłe spory o eksport.

### C11. SALT I i ABM
`salt-1` · swiat · 1969-Q4 – 1972-Q2

**Historia:** Rozmowy od 17.11.1969 (Helsinki, potem Wiedeń). Szczyt moskiewski i podpisanie (26.05.1972): traktat ABM i umowa przejściowa SALT I.

**Etapy:**
- **1969-Q4 rozmowy:** H · O.
- **1972-Q2 podpisanie:** H · O · X rozmowy zerwane (NG −1, `wyscig_atomowy` +2).

**PACE:** odprężenie (NG +1). Ograniczenia obrony przeciwrakietowej zmieniają żądania DPO. „Krajowe środki techniczne weryfikacji” to formalne uznanie satelitów rozpoznawczych, czyli spór o tajność programów BAS.

### C12. Chiny: rewolucja kulturalna, Ussuri i otwarcie
`chiny-1966-1972` · azja · 1966-Q2 – 1972-Q1

**Historia:**
- Rewolucja kulturalna od 1966 roku.
- Starcia nad Ussuri, na wyspie Damanskij/Zhenbao (2.03.1969).
- Dong Fang Hong 1, pierwszy chiński satelita (24.04.1970).
- „Dyplomacja pingpongowa” (1971).
- Nixon w Pekinie (21–28.02.1972).

**Etapy:**
- **1969-Q1 Ussuri:** H starcia · A wojna chińsko-radziecka (rzadko; NG −1, model ZSRR przesuwa zasoby na wschód).
- **1970-Q2 satelita:** H · O · P.
- **1972-Q1 otwarcie:** H (wymaga prezydenta skłonnego do otwarcia; flaga z C03) · O · X.

**PACE:** **Chiny jako trzeci gracz w kosmosie.** Otwarcie na Chiny zmienia NG i model ZSRR.

### C13. Upadek systemu z Bretton Woods
`bretton-woods` · swiat · 1968-Q1 – 1973-Q1

**Historia:** Rozpad puli złota (marzec 1968). „Szok Nixona” (15.08.1971): zawieszenie wymienialności dolara na złoto i 10-procentowe cło. Porozumienie smithsońskie (grudzień 1971). Kursy płynne od 1973 roku.

**Etapy:**
- **1968-Q1 pula złota:** H · O.
- **1971-Q3 zamknięcie okna złota:** H · P · O.
- **1973-Q1 kursy płynne:** H.

**PACE:** wartość składek i Korekty. Spory o to, w jakiej walucie liczyć wkłady członków. **Szablon:** S02.

### C14. Kontrkultura, ruch antywojenny i Dzień Ziemi
`kontrkultura` · usa · 1967-Q1 – 1972-Q2

**Historia:** Lato miłości (1967). Marsze antywojenne. Pierwszy Dzień Ziemi (22.04.1970). Powstaje Agencja Ochrony Środowiska (EPA, grudzień 1970). Kongres ogranicza projekt naddźwiękowego samolotu pasażerskiego SST (marzec 1971).

**Etapy:**
- **1967-Q3:** H.
- **1970-Q2 Dzień Ziemi:** H · A ruch ekologiczny popiera satelity obserwacji Ziemi (PP +).
- **1971-Q1 SST:** H Kongres tnie · A ocalony.

**PACE:** PP zależy od tego, czy PACE pokazuje „pożyteczny kosmos”: zdjęcia Ziemi, meteorologię, łączność. Precedens SST oznacza, że Kongres może zabić wielki program technologiczny.

### C15. Ostpolitik
`ostpolitik` · europa · 1969-Q4 – 1972-Q4

**Historia:** Kanclerz Brandt (od października 1969). Układ moskiewski (sierpień 1970). Układ warszawski (7.12.1970; Brandt klęka w Warszawie). Porozumienie czterech mocarstw w sprawie Berlina (1971). Układ o podstawach stosunków RFN–NRD (1972).

**Etapy:**
- **1970-Q4 układy:** H · O · X (rząd CDU).
- **1971-Q3 Berlin:** H.

**PACE:** RFN prowadzi własną politykę wschodnią, więc rośnie nacisk na „cywilny” charakter PACE. NG +1.

### C16. Polska: Marzec 1968 i Grudzień 1970
`polska-1968-1970` · zsrr · 1968-Q1 – 1971-Q1

**Historia:** Marzec 1968: protesty studenckie i kampania antysemicka, emigracja około 13 tysięcy osób. Polska uczestniczy w inwazji na Czechosłowację. Grudzień 1970: masakra robotników na Wybrzeżu (14–22.12). Gierek zastępuje Gomułkę (20.12.1970).

**Etapy:**
- **1968-Q1 Marzec:** H · X.
- **1970-Q4 Grudzień:** H Gierek · A Gomułka przetrwa · A inny następca.

Flaga `gierek_i_sekretarz` zasila palety (wizyta w USA w 1974 roku, kredyty zachodnie).

**PACE:** emigranci z 1968 roku to naukowcy i inżynierowie (`pula_kadr`), a sprawa ma też wymiar moralny. Marka Intermarium. Teksty o Marcu i Grudniu piszemy z powagą. **Szablon:** S05.

### C17. Era porwań i Monachium
`terroryzm-1968-1972` · swiat · 1968-Q3 – 1972-Q3

**Historia:** Fala porwań samolotów (1968–1972). Porwania na Dawson's Field (wrzesień 1970) i Czarny Wrzesień w Jordanii. Zamach na olimpiadzie w Monachium (5–6.09.1972).

**Etapy:**
- **1970-Q3 Dawson's Field:** H.
- **1972-Q3 Monachium:** H · X.

Zasada: teksty bez szczegółów przemocy.

**PACE:** bezpieczeństwo ośrodków i lotów pracowniczych (BAS). RFN pod presją. Zalążek szablonu S16.

### C18. Odprężenie w kosmosie
`wspolpraca-kosmiczna` · swiat · 1970-Q4 – 1972-Q2

**Historia:** Rozmowy o zgodności systemów cumowania (od października 1970). Porozumienie z 24.05.1972 o wspólnym locie załogowym (późniejszy Apollo–Sojuz, 1975).

**Etapy:**
- **1971-Q1 rozmowy:** H · X (przy NG ≤ 2).
- **1972-Q2 porozumienie:** H · O · X.

**PACE:** **po stronie zachodniej partnerem jest PACE.** Wątek daje politykę: zgodę obu rządów. Sam lot to Twoje KSP i model wyścigu.

**Decyzja (1972-Q2):** przyjąć wspólny lot (RN +, PP +, DPO −, BAS −) czy odmówić.

### C19. Chile
`chile` · swiat · 1970-Q3 – 1973-Q3

**Historia:** Allende wygrywa wybory (4.09.1970). Nacjonalizacja miedzi. Tajne operacje USA. Zamach Pinocheta (11.09.1973).

**Etapy:**
- **1970-Q3 wybory:** H Allende · A przegrywa.
- **1973-Q3 zamach:** H · X Allende kończy kadencję.

**PACE:** marginalnie. Stacje śledzenia w Chile (Santiago) mogą zostać utracone przy zbliżeniu z ZSRR. **Szablon:** przypadek historyczny S04.

### C20. Doktryna Nixona i spór o wojska w Europie
`doktryna-nixona` · usa · 1969-Q3 – 1972-Q4

**Historia:** Doktryna z Guam (25.07.1969): sojusznicy mają sami ponosić ciężar obrony. Poprawki Mansfielda (1966–1971) wzywają do zmniejszenia wojsk USA w Europie. W maju 1971 Senat odrzuca najostrzejszą wersję.

**Etapy:**
- **1969-Q3 doktryna:** H (prezydent Nixon albo podobny) · X.
- **1971-Q2 Mansfield:** H odrzucona · A przyjęta (wycofanie części wojsk; `jednosc_zachodu` −2, Europa płaci więcej także w PACE).

**PACE:** **„dzielenie ciężarów” to sedno sporu o składki w PACE.** Waszyngton żąda, żeby Europa płaciła więcej.

---

## Blok D — 1973–1980: wielkie przełomy (11 wątków)

### D01. Jom Kipur i embargo naftowe
`embargo-1973` · bliski_wschod · 1973-Q4 – 1974-Q1 · ⚓ K11

**Historia:** Wojna Jom Kipur (6–25.10.1973). Amerykański most powietrzny. Alarm DEFCON 3. Arabskie embargo naftowe wobec USA i Holandii (październik 1973 – marzec 1974). Ceny ropy rosną czterokrotnie.

**Etapy:**
- **1973-Q4 wojna:** H · X.
- **1973-Q4 embargo:** H · O · A embargo przedłużone (`koniunktura` −3).

**PACE:** **Holandia jest członkiem PACE i ofiarą embarga.** Paliwa, koniunktura i cięcia. Pierwszy wielki argument za satelitami obserwacji Ziemi w poszukiwaniu surowców. **Szablon:** S01 i S12.

### D02. Watergate
`watergate` · usa · 1972-Q2 – 1974-Q3 · start: flaga `prezydent_nixon`

**Historia:** Włamanie (17.06.1972). Przesłuchania w Senacie (1973). „Masakra sobotniej nocy” (20.10.1973). Rezygnacja Nixona (9.08.1974). Prezydentem zostaje Ford.

**Etapy:**
- **1972-Q2 włamanie:** H · X.
- **1973-Q2 przesłuchania:** H · X sprawa wygasa.
- **1974-Q3 rezygnacja:** H · A impeachment i usunięcie z urzędu · X Nixon dotrwa do końca kadencji.

Bez Nixona jako prezydenta wątek nie startuje. Zamiast niego możliwy jest szablon S15 „skandal w Białym Domu” z postacią fikcyjną.

**PACE:** paraliż Białego Domu i nieufność Kongresu wobec tajnych programów (BAS, WF).

### D03. Upadek Sajgonu
`sajgon-1975` · azja · 1975-Q1 – 1975-Q2

**Historia:** Ofensywa Północy wiosną 1975 roku. Ewakuacja ambasady i upadek Sajgonu (30.04.1975).

**Etapy:**
- **1975-Q2:** H · O · X Południe trwa (przy C01 „O” i wysokiej `zaangazowanie_usa`).

**PACE:** koniec wojny uwalnia budżet, ale nastroje „nigdy więcej” dotykają programów obronnych (DPO −).

### D04. Helsinki
`helsinki` · europa · 1972-Q4 – 1975-Q3

**Historia:** Konferencja Bezpieczeństwa i Współpracy w Europie (od 1972/1973). Akt końcowy (1.08.1975), w tym „trzeci koszyk” praw człowieka.

**Etapy:**
- **1975-Q3:** H · O · X.

**PACE:** odprężenie (NG +1). Prawa człowieka stają się dźwignią dla dysydentów (D09) i dla współpracy naukowej z Wschodem.

### D05. Wybory prezydenckie 1976 i 1980
`wybory-1976-1980` · usa · 1976-Q3 – 1980-Q4 · K7

**Historia:** Carter pokonuje Forda (1976). Reagan pokonuje Cartera (1980), w czasie kryzysu zakładników i inflacji.

**Etapy:**
- **1976-Q4:** H opozycja wygrywa · A urzędujący prezydent wygrywa · A kandydat fikcyjny.
- **1980-Q4:** to samo.

Kandydaci zależą od wcześniejszych wyborów.

**PACE:** w historii Carter był sceptyczny wobec dużych programów, a Reagan przyniósł wzrost wydatków obronnych i program SDI (1983, poza ramami gry).

### D06. Iran: rewolucja i zakładnicy
`iran-1979` · bliski_wschod · 1978-Q1 – 1980-Q4

**Historia:** Protesty od 1978 roku. Szach wyjeżdża (16.01.1979). Chomeini wraca. Zajęcie ambasady (4.11.1979) i 444 dni niewoli zakładników. Nieudana misja ratunkowa (kwiecień 1980). Drugi szok naftowy.

**Etapy:**
- **1979-Q1 rewolucja:** H · X szach przetrwa · A rewolucja lewicowa (bez Chomeiniego).
- **1979-Q4 zakładnicy:** H · X.
- **1980-Q2 misja:** H porażka · A sukces.

**Warunek:** jeśli w A02 Mosaddegh przetrwał, wątek startuje w innej postaci (szablon S04 albo S01).

**PACE:** ceny paliw. Utrata irańskich stacji nasłuchu (Tacksman), w świecie gry ważnych dla weryfikacji radzieckich startów (BAS).

### D07. Afganistan i koniec odprężenia
`afganistan-1979` · zsrr · 1979-Q4 – 1980-Q3

**Historia:** Inwazja ZSRR (24–27.12.1979). Embargo zbożowe. Bojkot igrzysk w Moskwie (1980). SALT II, podpisany 18.06.1979, nie zostaje ratyfikowany.

**Etapy:**
- **1979-Q4 inwazja:** H · X · O.
- **1980-Q3 bojkot:** H · X.

**PACE:** NG −1. Koniec współpracy kosmicznej (C18) i wzrost żądań DPO.

### D08. Stagflacja i Volcker
`stagflacja` · usa · 1973-Q4 – 1980-Q4

**Historia:** Recesja w latach 1973–1975. Inflacja dwucyfrowa. Paul Volcker na czele Fed (sierpień 1979) i zwrot w polityce pieniężnej (6.10.1979). Recesja 1980.

**Etapy:**
- **1974-Q1:** H · O.
- **1979-Q4 Volcker:** H · A łagodniejsza polityka (inflacja trwa).

**PACE:** **„chude lata” Epoki IV.** Cięcia, przegląd programów i walka frakcji o resztki (GDD 4.4).

### D09. Polska: KOR, papież i Sierpień
`polska-1976-1980` · zsrr · 1976-Q2 – 1980-Q3

**Historia:**
- Czerwiec 1976 (Radom, Ursus) i powstanie KOR.
- Wybór Karola Wojtyły na papieża (16.10.1978).
- Pielgrzymka do Polski (2–10.06.1979).
- Strajki sierpniowe i porozumienie gdańskie (31.08.1980), powstaje Solidarność.

**Etapy:**
- **1976-Q2:** H.
- **1978-Q4 papież:** H · A wybrany inny kandydat.
- **1980-Q3 Sierpień:** H porozumienia · A interwencja (NG −2) · O.

**PACE:** NG, `jednosc_bloku` −2. Dla marki Intermarium to finał kampanii o wymiarze symbolicznym.

### D10. Eurorakiety
`eurorakiety` · europa · 1976-Q4 – 1979-Q4

**Historia:** Rozmieszczanie radzieckich SS-20 od 1976–1977. Przemówienie Schmidta (1977). Podwójna decyzja NATO (12.12.1979): rozmieszczenie Pershingów II i pocisków manewrujących oraz jednoczesne rozmowy.

**Etapy:**
- **1977-Q1 SS-20:** H.
- **1979-Q4 decyzja:** H · A Europa odmawia (`jednosc_zachodu` −2).

**PACE:** spory w Radzie Atlantyckiej, nastroje antyrakietowe w RFN i Holandii, czyli WF i PP programów PACE.

### D11. ESA i Ariane
`esa-ariane` · europa · 1973-Q3 – 1979-Q4

**Historia:** Porozumienie pakietowe (1973): Ariane, Spacelab i satelita morski. Europejska Agencja Kosmiczna powstaje 30.05.1975. Pierwszy start Ariane (24.12.1979).

**Etapy:**
- **1973-Q3 pakiet:** H · X (jeśli PACE skutecznie wchłonęła ELDO i ESRO, B15).
- **1975-Q2 ESA:** H · A ESA staje się częścią PACE.
- **1979-Q4 Ariane:** H · O.

**PACE:** **europejski konkurent na rynku startów komercyjnych.** Siła tego wątku zależy od B15.

---

# Część III. Szablony wątków (16)

Szablon uruchamia się, gdy spełnione są **wszystkie** cztery ramy z części I (punkt 4): warunki, lista kandydatów, wolne przypadki historyczne i wolna grupa wyłączności. Szansa na kwartał rośnie z Rozbieżnością regionu (×(1 + 0,15·D)).

| # | Szablon | Przypadki historyczne | Grupa wyłączności | Warunki (zarys) | Kandydaci (parametry) | Etapy (zarys) |
|---|---|---|---|---|---|---|
| S01 | **Kryzys surowcowy** | A02 Abadan, A27 Suez, D01 embargo | `surowce` | `popyt_na_rope ≥ 7` albo D ≥ 2 w regionie | Irak, Kuwejt, Arabia Saudyjska, Wenezuela, Indonezja, Libia (od 1959), Nigeria (od 1960), Algieria (od 1962) | spór → nacjonalizacja / porozumienie → reakcja Zachodu (embargo, interwencja, kompromis) |
| S02 | **Kryzys walutowy sojusznika** | C08 funt 1967, B20 dolar, C13 Bretton Woods | `waluty` | `koniunktura ≤ 5` | Wielka Brytania, Francja, Włochy, Kanada, Holandia, RFN (aprecjacja), USA (od 1965) | ucieczka od waluty → pomoc / cięcia / dewaluacja |
| S03 | **Wojna zastępcza** | A01 Korea, B19 Kongo, B05 Wietnam | `wojny-peryferyjne` | `dekolonizacja ≥ 5` albo `napiecie_azja ≥ 6`; NG ≤ 3 | Laos, Kongo, Angola (od 1961), Jemen (od 1962), Rodezja (od 1965), Róg Afryki (od 1974) | wybuch → zaangażowanie mocarstw (doradcy / ochotnicy) → pat / zwycięstwo / interwencja |
| S04 | **Zamach stanu w państwie trzecim** | A02 (1953), A14 Gwatemala, A29 Irak, C19 Chile | `zamachy` (region) | dowolny region, D ≥ 1 albo `zaangazowanie_usa ≥ 6` | lista na region, np. Ameryka Łacińska: Brazylia (1964), Boliwia, Argentyna, Ekwador; Afryka: Ghana (1966), Nigeria (1966) | spisek → zamach → reżim prozachodni / prowschodni / wojna domowa |
| S05 | **Bunt w bloku wschodnim** | A09 NRD, A25 Polska, A26 Węgry, C05 Praga, D09 Polska | `blok-wschodni` | `jednosc_bloku ≤ 4` albo `kurs_kremla` zmienia się o ≥ 3 | NRD, Polska, Węgry, Czechosłowacja, Rumunia, Bułgaria, Albania | protesty → reakcja Moskwy (ustępstwa / interwencja) → następstwa (uciekinierzy, NG) |
| S06 | **Kryzys dekolonizacyjny** | A40, B19 Kongo, B12 Algieria | `dekolonizacja` (imperium) | `dekolonizacja ≥ 4`; imperium z `sila_*` | brytyjskie: Kenia, Cypr, Aden, Malaje; francuskie: Tunezja, Maroko, Kamerun; portugalskie: Angola, Mozambik; belgijskie | ruch narodowy → represje / negocjacje → niepodległość (szybka / krwawa) |
| S07 | **Kryzys w cieśninie i blokada** | A15 Tajwan, A35 Berlin, B03 Kuba | `blokady` | NG ≤ 3, `kurs_kremla ≥ 6` | Cieśnina Tajwańska, Berlin, Dardanele, Ormuz, Kuba, Korea | groźba → blokada / ostrzał → przełamanie / ugoda / wojna ograniczona |
| S08 | **Sukcesja na Kremlu** | A08, B10 | `kreml` | śmierć albo odsunięcie przywódcy (flaga z modelu ZSRR), `kurs_kremla` | frakcje: reformatorzy, twardogłowi, wojsko | interregnum → walka frakcji → nowy kurs (odwilż / twardy) |
| S09 | **Zmiana rządu w państwie członkowskim** | B22 Wilson, A33 de Gaulle, C15 Brandt | `rzady-czlonkow` (kraj) | kalendarz wyborów kraju; `koniunktura` | Wielka Brytania, Francja, Kanada, Włochy, RFN, Holandia, Australia | kampania → wynik → przegląd zobowiązań wobec PACE |
| S10 | **Afera szpiegowska** | sprawa Rosenbergów (1951–1953), Fuchs (przed 1951), Abel (1957), Profumo (1963) | `szpiedzy` | `antykomunizm ≥ 6` albo flaga `wyciek_do_zsrr` | środowisko: przemysł, nauka, wojsko, służba dyplomatyczna | wykrycie → proces → czystka / wymiana szpiegów |
| S11 | **Anulowanie programu u sojusznika** | A30 Biała Księga, A31 Avro Arrow, B22 TSR-2 | `anulowania` (kraj) | `koniunktura ≤ 5` albo zmiana rządu (S09) | Wielka Brytania, Kanada, Francja, Włochy, RFN, Holandia | przegląd → anulowanie / ocalenie → kadry do wzięcia (punkt decyzyjny: zatrudnić w PACE) |
| S12 | **Wojna arabsko-izraelska** | A27 Suez, C06 1967, D01 1973 | `bliski-wschod-wojna` | NG ≤ 3 albo flaga `kanal_zamkniety`; minęło ≥ 8 kw. od poprzedniej | strony: Egipt, Syria, Jordania, Irak | napięcie → wojna (krótka / długa) → embargo naftowe (S01) |
| S13 | **Interwencja USA na półkuli zachodniej** | A14 Gwatemala, B01 Zatoka Świń, B25 Dominikana | `polkula-zachodnia` | `zaangazowanie_usa ≥ 6`, `antykomunizm ≥ 6` | Gwatemala, Kuba, Dominikana, Panama, Nikaragua, Grenada | rewolucja / wybory → decyzja Waszyngtonu → interwencja (szybka / ugrzęźnięta) |
| S14 | **Incydent jądrowy** | Palomares (1966), Thule (1968) | `incydenty-jadrowe` | `wyscig_atomowy ≥ 5` | sojusznik z bazami USA: Hiszpania, Grenlandia (Dania), Wielka Brytania, Japonia | wypadek bombowca z bronią jądrową → poszukiwania → kryzys z gospodarzem |
| S15 | **Skandal w Białym Domu** | D02 Watergate | `skandale` | administracja fikcyjna (od 1968, K7) albo D(USA) ≥ 3 | wyłącznie postacie fikcyjne (zasada: żadnych wymyślonych przestępstw prawdziwych osób) | przeciek → śledztwo → rezygnacja / przetrwanie |
| S16 | **Terroryzm** | C17 Monachium, porwania 1968–1972 | `terroryzm` | od 1968; `dekolonizacja`, NG | porwanie samolotu, zamach na placówkę, zakładnicy | atak → reakcja → zaostrzenie bezpieczeństwa (BAS) |

**Zasady wspólne:**
- Każdy kandydat ma opcjonalny warunek, np. Libia dopiero od 1959 roku, Algieria od 1962.
- Parametry krajów mają odmianę przez przypadki (`{kraj.dop}`, `{kraj.miejsc}`), wprowadzoną 7.11.2026.
- Szablon nigdy nie dotyczy prawdziwych przywódców z nazwiska, chyba że wynika to z palety i warunków. Domyślnie mówi „rząd {kraj.dop}”, „przywódca puczu”.
- `--serie 1000` raportuje uruchomienia każdego szablonu na dekadę. Cel strojenia: 0,5–2 instancji na dekadę na szablon przy Rozbieżności regionu 2–4.

---

# Część IV. Wzorce (200)

Wzorzec działa zawsze, gdy spełnione są jego warunki. Kolumna **Kiedy** podaje warunki: epokę (I–IV), zmienne, flagi i wskaźniki. Brak wpisu oznacza „zawsze”. Kolumna **Skutek** pokazuje tylko kierunek, a liczby ustalamy przy zapisie do YAML. **Paleta** wskazuje, skąd AI bierze realia epoki (część V).

Znaki: ✓ wzorzec jest już w repozytorium · ◆ zamiast natychmiastowego skutku może zostawić sprawę na Biurku jako punkt decyzyjny · „K−” Korekta budżetu (ujemna).

**Zasada nadrzędna:** wzorzec nie tworzy faktów w KSP. Nie niszczy Twoich rakiet i nie zabija Twoich pilotów. Wypadki u dostawców, w wojsku i w przemyśle dotyczą świata poza Twoimi lotami.

## W1. Waszyngton i Kongres (20)

| # | id | Wzorzec | Kiedy | Skutek | Paleta / uwagi |
|---|---|---|---|---|---|
| 1 | przesluchanie-kosztow ✓ | Przesłuchanie w sprawie kosztów | `koniunktura ≤ 4` ×2 | ZW − | komisje-kongresu |
| 2 | zmeczenie-europa ✓ | Zmęczenie płaceniem za Europę | `koniunktura ≤ 4` ×2 | ZW − | — |
| 3 | wizyta-dygnitarza ✓ | Wizyta dygnitarza | — | PP +, KP + | wizyty |
| 4 | senator-z-okregu ◆ | Senator chce zakładu w swoim stanie | — | KP + albo PRZ −, DOI − | stany-przemyslowe |
| 5 | poprawka-budzetowa | Poprawka tnąca jedną linię budżetu | ZW ≤ 50 | K− | — |
| 6 | sesja-zamknieta | Zamknięta sesja komisji: pytania o tajne programy | flaga programu tajnego | WF −, BAS ± | — |
| 7 | raport-gao | Raport kontrolerów: marnotrawstwo w przetargach | — | ZW −, PRZ − | — |
| 8 | spor-o-siedzibe ◆ | Spór, w którym stanie powstanie nowy ośrodek | rozbudowa DOI | KP ±, DOI ± | stany-przemyslowe |
| 9 | doradca-prezydenta | Nowy doradca naukowy prezydenta | epoka ≥ II | RN ± | doradcy-naukowi |
| 10 | weto-prezydenta | Prezydent wetuje ustawę wydatkową | `koniunktura ≤ 5` | K−, ZW ± | — |
| 11 | lobbysta-firmy | Lobbysta firmy u przewodniczącego komisji | — | PRZ +, ZW − | katalog-firm |
| 12 | kampania-sredniookresowa | Kampania przed wyborami do Kongresu: kosmos jako temat | rok parzysty, Q3 | PP ±, ZW ± | — |
| 13 | przesuniecie-srodkow ◆ | Biuro Budżetu proponuje przeprogramowanie środków | — | Korekta ± | decyzja 0012 |
| 14 | list-otwarty-naukowcow | List otwarty naukowców do Kongresu | `wyscig_atomowy ≥ 6` | RN +, DPO − | — |
| 15 | dzien-otwarty-kongres | Delegacja Kongresu w ośrodku startowym | — | ZW + albo − (zależnie od SO) | — |
| 16 | urzednik-rzadowy | Zmiana na stanowisku sekretarza obrony | zmiana administracji albo losowo | DPO ± | sekretarze-obrony |
| 17 | ustawa-o-tajnosci | Ustawa zaostrzająca klauzule tajności | `antykomunizm ≥ 7` | WF +, RN − | — |
| 18 | sad-najwyzszy | Wyrok Sądu Najwyższego w sprawie lojalności urzędników | era I–II | RN ±, `antykomunizm` − | — |
| 19 | posel-sojuszniczy | Ambasador sojusznika lobbuje na Kapitolu za swoim przemysłem | — | KP −, kraj członkowski + | — |
| 20 | zasada-buy-american ◆ | Poprawka „kupuj amerykańskie” w budżecie PACE | `koniunktura ≤ 5` | PRZ +, członkowie europejscy − | — |

## W2. Pentagon i Służby (20)

| # | id | Wzorzec | Kiedy | Skutek | Paleta / uwagi |
|---|---|---|---|---|---|
| 21 | wojna-podjazdowa-sluzb ✓ | Wojna podjazdowa Lotnictwa i Marynarki | — | DPO − | — |
| 22 | general-z-wizja | Generał z wizją: „rakiety zamiast bombowców” | era I–II | DPO + | dowodcy |
| 23 | zadanie-poligonu ◆ | Wojsko żąda pierwszeństwa na poligonie | — | DOI −, DPO + | poligony |
| 24 | przeciek-z-pentagonu | Przeciek z Pentagonu o „luce” | `presja_wyscigu ≥ 4` | ZW +, budżet +, WF − | — |
| 25 | cwiczenia-obrony-cywilnej | Ćwiczenia obrony cywilnej, syreny w miastach | NG ≤ 3 | PP + dla obrony, RN − | — |
| 26 | marynarka-chce-satelity | Marynarka chce własnego satelity nawigacyjnego | epoka ≥ II | DPO +, Zlecenie ◆ | — |
| 27 | lotnictwo-chce-samolotu | Lotnictwo forsuje nowy samolot doświadczalny | era I–II | DPO +, RN − | programy-x |
| 28 | armia-i-rakiety | Armia nie chce oddać swoich rakieciarzy | era I–II | DPO ±, `pula_kadr` ± | — |
| 29 | przeglad-misji | Przegląd ról i misji Służb | — | DPO ± | — |
| 30 | wypadek-bombowca | Katastrofa bombowca w wojsku (nie PACE) | — | PP − dla lotnictwa | — |
| 31 | alarm-falszywy | Fałszywy alarm radarowy (stada gęsi, księżyc) | od 1958 | NG −1 na kwartał | incydenty-alarmowe |
| 32 | rozkaz-rozproszenia | Rozkaz rozproszenia ośrodków na wypadek ataku | NG ≤ 2 | DOI −, K− | — |
| 33 | weteran-korei | Weterani Korei w zespołach PACE | 1953–1956 | `pula_kadr` + | — |
| 34 | pobor | Zmiana zasad poboru: inżynierowie tracą odroczenia | wojna (A01 / B05 / C01) | `pula_kadr` − | — |
| 35 | dowodca-strategiczny | Dowództwo Strategiczne żąda danych z lotów | — | DPO +, RN − | — |
| 36 | testy-pociskow-wojska | Udana próba pocisku wojskowego (nie PACE) | era ≥ II | ZW −, bo „wojsko robi to taniej” | — |
| 37 | konflikt-o-paliwo | Spór o przydział paliw rakietowych i tlenu | — | DOI −, K− | — |
| 38 | szkolenie-pilotow ◆ | Wojsko oferuje pilotów doświadczalnych za udostępnienie samolotów | — | kadry pilotów +, DPO + | klasy pilotów (decyzja 0013) |
| 39 | odtajnienie | Pentagon odtajnia stary program | — | RN +, WF ± | — |
| 40 | ochrona-osrodka | Żandarmeria przejmuje ochronę ośrodka | NG ≤ 3 | BAS +, RN − | — |

## W3. Sojusz i Rada Atlantycka (20)

| # | id | Wzorzec | Kiedy | Skutek | Paleta / uwagi |
|---|---|---|---|---|---|
| 41 | weto-francji ✓ | Francja grozi wetem | — | KP − | — |
| 42 | zadanie-roczne ◆ | Żądanie roczne członka założycielskiego (GDD 9.5) | Q2 | Dług albo uraza | członkowie |
| 43 | spor-o-udzial | Spór o udział przemysłowy kraju | — | SO −, kraj ± | katalog-firm |
| 44 | delegat-z-rfn | Delegat RFN domaga się zniesienia ograniczeń | przed 1955 | SO −, RFN + | — |
| 45 | wloski-kryzys-rzadowy | Kryzys rządowy we Włoszech blokuje składkę | — | K− | — |
| 46 | kanadyjska-ambicja | Kanada chce własnego satelity w ramach PACE | od 1959 | Kanada + ◆ | (Alouette 1962) |
| 47 | holenderska-elektronika | Holenderski koncern elektroniczny oferuje aparaturę | — | PRZ ±, Holandia + | katalog-firm |
| 48 | woomera-spor | Spór z rządem Australii o koszty Woomery | — | DOI −, Australia ± | — |
| 49 | japonski-obserwator | Japonia pyta o status członka | od 1960 | Japonia ± ◆ | — |
| 50 | szwedzki-handel | Szwecja proponuje transakcję „na własnych warunkach” | — | kadry ± | — |
| 51 | sekretarz-generalny | Nowy przewodniczący Rady Atlantyckiej | — | SO ± | — |
| 52 | konferencja-budzetowa | Nadzwyczajna konferencja budżetowa sojuszu | `koniunktura ≤ 4` | K−, SO − | — |
| 53 | wymiana-naukowcow | Program wymiany naukowców między członkami | — | RN +, BAS − | — |
| 54 | rywalizacja-francusko-brytyjska | Rywalizacja Paryża i Londynu o kierownictwo programu | — | SO − | — |
| 55 | standardizacja | Spór o standardy: cale czy milimetry | — | DOI −, SO − | — |
| 56 | protest-pokojowy-europa | Protest pokojowy pod europejskim ośrodkiem PACE | `wyscig_atomowy ≥ 6` | WF −, PP − | — |
| 57 | dlug-honorowy ◆ | Członek przypomina o niespłaconym Długu z Rejestru | Dług w Rejestrze | SO −, KP − | — |
| 58 | jezyk-dokumentacji | Francja żąda dokumentacji po francusku | `ambicja_francji ≥ 6` | SO −, K− | — |
| 59 | wspolny-poligon | Propozycja wspólnego poligonu w nowym kraju | era ≥ II | DOI + ◆ | poligony |
| 60 | wizyta-szefa-rzadu | Premier państwa członkowskiego odwiedza ośrodek | — | SO +, PP + | wizyty |

## W4. Przemysł i dostawcy (20)

| # | id | Wzorzec | Kiedy | Skutek | Paleta / uwagi |
|---|---|---|---|---|---|
| 61 | strajk-w-przemysle ✓ | Strajk w zakładach dostawcy | `koniunktura ≥ 7` ×1,5 | K− | — |
| 62 | zimny-lut ✓ | Zimny lut | — | K− | — |
| 63 | wybuch-na-stanowisku ✓ | Wybuch na stanowisku prób u dostawcy | — | PP − | — |
| 64 | przekroczenie-kosztow | Dostawca zgłasza przekroczenie kosztów | — | K−, PRZ ± | katalog-firm |
| 65 | fuzja-firm | Fuzja dwóch dostawców | — | PRZ +, mniej ofert w przetargach | katalog-firm |
| 66 | bankructwo-podwykonawcy | Bankructwo podwykonawcy | `koniunktura ≤ 4` | K−, opóźnienie | — |
| 67 | tani-konkurent ◆ | Nieznana firma składa ofertę o połowę tańszą | przetarg | PRZ − albo ryzyko | — |
| 68 | protest-przegranego | Przegrany przetarg: protest i skarga do Kongresu | po przetargu | ZW −, PRZ − | decyzja 0011 |
| 69 | brak-materialu | Brak strategicznego materiału (tytan, nikiel, beryl) | wojna albo `koniunktura ≥ 8` | K− | surowce-strategiczne |
| 70 | nowy-stop | Nowy stop albo materiał z laboratorium przemysłowego | — | RN +, PRZ + | materialy |
| 71 | kontrola-jakosci | Kontrola jakości u dostawcy: sfałszowane protokoły | — | WF −, PRZ − ◆ | — |
| 72 | prezes-z-ambicjami | Prezes koncernu chce rozmowy z Andersonem w cztery oczy | — | PRZ ± ◆ | katalog-firm |
| 73 | europejski-konkurent | Europejski koncern podbija ofertę amerykańskiego | — | PRZ −, członek + | katalog-firm |
| 74 | patent-spor | Spór patentowy między dostawcami | — | K−, opóźnienie | — |
| 75 | przemysl-chce-wiecej | Konsorcja żądają kontraktów wieloletnich | — | PRZ +, BAS − | — |
| 76 | zaklad-zamkniety | Zamknięcie zakładu po zakończeniu kontraktu: bezrobocie w okręgu | — | ZW −, PP − | stany-przemyslowe |
| 77 | komputer-na-sprzedaz | Producent maszyn liczących oferuje nowy model | — | RN + ◆ | komputery |
| 78 | dostawca-z-sojusznika | Dostawca z kraju członkowskiego dostarcza wadliwą partię | — | SO −, K− | — |
| 79 | spadek-cen | Konkurencja obniża ceny podzespołów | `koniunktura ≤ 4` | Korekta + | — |
| 80 | pierwszy-tranzystor | Partia tranzystorów zamiast lamp: lżej, ale niepewnie | od 1954 | RN +, ryzyko | elektronika |

## W5. Kadry i ludzie (20)

| # | id | Wzorzec | Kiedy | Skutek | Paleta / uwagi |
|---|---|---|---|---|---|
| 81 | drenaz-mozgow ✓ | Drenaż mózgów | `pula_kadr ≤ 3` ×2 | `pula_kadr` −, RN − | — |
| 82 | nowy-rocznik ✓ | Nowy rocznik inżynierów | `pula_kadr ≤ 3` ×2 | `pula_kadr` + | — |
| 83 | grypa ✓ | Epidemia grypy | — | K− | (1957: grypa azjatycka; 1968: Hongkong) |
| 84 | geniusz-z-prowincji | Młody inżynier z prowincjonalnej uczelni z genialnym pomysłem | — | RN +, nowa postać tła | — |
| 85 | odejscie-weterana | Weteran programu odchodzi na emeryturę | — | SO −, wiedza − | — |
| 86 | konflikt-osobisty | Konflikt dwóch kierowników zespołów | — | SO − ◆ | postacie |
| 87 | romans-biurowy | Romans w kierownictwie i plotki | — | SO − | postacie |
| 88 | lojalnosc-pytania | Ankieta lojalności dla wszystkich pracowników | `antykomunizm ≥ 6` | RN −, BAS + | — |
| 89 | naukowiec-z-niemiec | Niemiecki specjalista chce dołączyć do PACE | era I, RFN po 1955 | `pula_kadr` +, WF ryzyko ◆ | — |
| 90 | kobiety-w-zespole | Rachmistrzynie i inżynierki domagają się awansów | — | RN +, SO ± ◆ | — |
| 91 | zatrudnienie-weteranow | Program zatrudniania weteranów | po wojnie | `pula_kadr` +, ZW + | — |
| 92 | wypalenie | Zmęczenie zespołów po serii prób | dużo lotów w kwartale | SO −, K− | — |
| 93 | stypendia | Fundacja oferuje stypendia dla studentów fizyki | — | `pula_kadr` + w ciągu 8 kw. | fundacje |
| 94 | ucieczka-na-wschod | Pracownik przemysłu ucieka na Wschód (nie PACE) | — | WF −, BAS + | — |
| 95 | zwiazek-zawodowy-pace | Związek zawodowy w ośrodku PACE | — | SO ±, DOI − | — |
| 96 | pilot-celebryta | Pilot doświadczalny staje się celebrytą | — | PP +, BLZ + | piloci (klasy I–III) |
| 97 | lekarz-ostrzega | Lekarze ostrzegają przed obciążeniami w lotach wysokościowych | era I–II | BLZ −, RN + | medycyna-lotnicza |
| 98 | mieszkania | Brak mieszkań przy ośrodku startowym | rozbudowa DOI | SO −, K− | — |
| 99 | uczelnia-partnerska | Uczelnia proponuje wspólne laboratorium | — | RN +, `pula_kadr` + ◆ | uczelnie |
| 100 | emigranci-z-bloku | Emigranci z bloku wschodniego zgłaszają się do pracy | po A25, A26, C05, C16 | `pula_kadr` +, BAS − | — |

## W6. Nauka i technika (20)

| # | id | Wzorzec | Kiedy | Skutek | Paleta / uwagi |
|---|---|---|---|---|---|
| 101 | przelom-aerodynamiczny ✓ | Przełom w tunelu aerodynamicznym | po 1952-Q3, raz | RN + | (reguła pól, 1952) |
| 102 | odkrycie-naukowe | Odkrycie naukowe roku | — | RN +, PP + | **nauka-odkrycia** |
| 103 | konferencja-naukowa | Wielka konferencja naukowa: PACE zaproszona | — | RN +, BAS − ◆ | konferencje |
| 104 | nagroda-nobla | Nobel dla fizyka lub chemika związanego z tematyką kosmiczną | Q4 | RN +, PP + | nobel |
| 105 | spor-o-priorytet | Spór o pierwszeństwo odkrycia z uczonym z bloku wschodniego | — | RN ±, NG ± | — |
| 106 | nowy-tunel | Otwarcie nowego tunelu aerodynamicznego lub komory próżniowej | — | RN + | — |
| 107 | paliwo-egzotyczne | Raport o paliwach egzotycznych (bor, fluor) | era I–II | RN +, ryzyko | paliwa |
| 108 | teoria-kontrowersyjna | Kontrowersyjna teoria podważa założenia programu | — | RN − ◆ | — |
| 109 | meteoryt | Spadek meteorytu: naukowe poruszenie | rzadko | RN +, PP + | meteoryty |
| 110 | zacmienie | Całkowite zaćmienie Słońca: wyprawy naukowe | daty zaćmień | RN + | zacmienia |
| 111 | kometa | Jasna kometa na niebie | rzadko | PP + | komety |
| 112 | aparatura-z-laboratorium | Laboratorium oferuje nowy przyrząd do satelity | epoka ≥ II | RN + ◆ | — |
| 113 | komputer-przelom | Przełom w obliczeniach: nowy język programowania | od 1957 | RN +, K+ | komputery |
| 114 | laser | Nowa technika laboratoryjna (maser, laser) | od 1958 / 1960 | RN + | nauka-odkrycia |
| 115 | medycyna-kosmiczna | Badania nad nieważkością u zwierząt | epoka ≥ II | BLZ +, RN + | — |
| 116 | geodezja | Nowe pomiary kształtu Ziemi | po pierwszym satelicie | RN + | — |
| 117 | radioastronomia | Odkrycie radioastronomiczne | — | RN + | nauka-odkrycia |
| 118 | sabotaz-teorii | Naukowiec publikuje krytykę bezpieczeństwa lotów załogowych | epoka ≥ II | BLZ −, PP − | — |
| 119 | standard-czasu | Nowy wzorzec czasu (zegar atomowy) | od 1955 | DOI +, RN + | — |
| 120 | nauka-radziecka | Radziecka publikacja naukowa robi wrażenie na Zachodzie | — | `presja_wyscigu` +, RN + | nauka-radziecka |

## W7. Media, kultura i opinia publiczna (20)

| # | id | Wzorzec | Kiedy | Skutek | Paleta / uwagi |
|---|---|---|---|---|---|
| 121 | przeciek-do-prasy ✓ | Przeciek do prasy | WF ≤ 50 ×2 | WF − ◆ | — |
| 122 | boom-science-fiction ✓ | Boom science fiction | — | PP + | **kultura-sf** |
| 123 | fala-ufo ✓ | Fala obserwacji „latających talerzy” | 1952-Q2 – 1954-Q1, raz | PP + | (1952 Waszyngton) |
| 124 | reportaz-tygodnika | Wielki reportaż ilustrowanego tygodnika o PACE | — | PP + albo WF − ◆ | prasa |
| 125 | felietonista | Znany felietonista atakuje „rakietowe marnotrawstwo” | — | PP −, ZW − | — |
| 126 | kronika-filmowa | Kronika filmowa pokazuje start | sukces w kwartale | PP + | — |
| 127 | telewizja-na-zywo | Telewizja chce transmisji startu na żywo | epoka ≥ II | PP ++ albo −− (ryzyko) ◆ | — |
| 128 | film-dokumentalny | Wytwórnia filmowa chce kręcić w ośrodku | — | PP +, BAS − ◆ | — |
| 129 | piosenka-przebój | Przebój radiowy o kosmosie | epoka ≥ II | PP + | kultura-muzyka |
| 130 | zabawki | Zabawki kosmiczne na Gwiazdkę | Q4, epoka ≥ II | PP + | — |
| 131 | kazanie | Kaznodzieja grzmi, że ludzie nie powinni sięgać nieba | — | PP − na krótko | — |
| 132 | sondaz | Sondaż: czy kosmos jest wart pieniędzy? | — | PP ± (pomiar) | — |
| 133 | ksiazka-bestseller | Bestseller o zagrożeniu z kosmosu albo z ZSRR | — | `presja_wyscigu` +, PP + | kultura-ksiazki |
| 134 | dziennikarz-sledczy ◆ | Dziennikarz śledczy grzebie w kontraktach | — | WF −, PRZ − | — |
| 135 | wystawa-swiatowa | Wystawa światowa: pawilon kosmiczny | daty wystaw | PP +, WF + | wystawy (1958 Bruksela, 1962 Seattle, 1967 Montreal, 1970 Osaka) |
| 136 | komiks | Komiks z bohaterem-astronautą | — | PP + | kultura-sf |
| 137 | astronom-amator | Astronomowie amatorzy śledzą obiekt na orbicie | po pierwszym satelicie | PP +, BAS − | — |
| 138 | protest-studencki | Protest studencki przeciw zbrojeniom | `nastroje_spoleczne ≥ 6` | PP −, RN ± | — |
| 139 | ekologia | Organizacja ekologiczna krytykuje paliwa rakietowe | od 1968 | PP − ◆ | — |
| 140 | rocznica | Rocznica historycznego lotu albo wydarzenia | — | PP + | rocznice |

## W8. Wywiad, kontrwywiad i bezpieczeństwo (20)

| # | id | Wzorzec | Kiedy | Skutek | Paleta / uwagi |
|---|---|---|---|---|---|
| 141 | kradziez-dokumentacji ✓ | Kradzież dokumentacji (tajne) | — | WF −, flaga | — |
| 142 | incydent-rozpoznawczy ✓ | Incydent z samolotem rozpoznawczym | `presja_wyscigu ≥ 5` ×1,5 | NG −, `presja_wyscigu` + | — |
| 143 | trawler-szpiegowski | Radziecki trawler obserwuje starty z wód międzynarodowych | po pierwszym starcie z wybrzeża | BAS +, WF − | — |
| 144 | podejrzany-dyplomata | Dyplomata z bloku fotografuje ośrodek | — | BAS + ◆ | — |
| 145 | uciekinier-z-informacjami | Uciekinier z informacjami o radzieckim programie | — | Ocena wywiadowcza (kod B–D) | GDD 16 |
| 146 | dezinformacja | Fałszywa informacja o radzieckim sukcesie | — | Ocena wywiadowcza (kod E–F) | GDD 16 |
| 147 | podsluch | Wykrycie podsłuchu w biurze | — | BAS +, SO − | — |
| 148 | wymiana-szpiegow | Wymiana szpiegów na moście | od 1962 | NG + | (Glienicke 1962) |
| 149 | sprawdzenie-pracownika | BAS kwestionuje poświadczenie kluczowego inżyniera | — | BAS +, RN − ◆ | postacie |
| 150 | kreta-plotka | Plotka o krecie w kierownictwie | — | SO −, BAS + | GDD ukryte cechy |
| 151 | nasluch | Stacja nasłuchowa przechwytuje telemetrię z radzieckiego startu | od 1957 | Ocena wywiadowcza + | stacje-nasluchu |
| 152 | zdjecie-satelitarne | Zdjęcie rozpoznawcze ujawnia nową wyrzutnię w ZSRR | po satelicie rozpoznawczym | Bilans widziany ± | — |
| 153 | atak-na-szyfr | Złamanie szyfru albo wpadka szyfrowa | — | BAS ± | — |
| 154 | sabotaz-podejrzenie | Podejrzenie sabotażu u dostawcy | — | BAS +, PRZ − ◆ | — |
| 155 | zrodlo-w-moskwie | Źródło w Moskwie milknie | — | Ocena wywiadowcza − | (Popow, Pieńkowski) |
| 156 | operacja-dezinformacyjna ◆ | BAS proponuje operację dezinformacyjną wobec ZSRR | — | Tajemnica w Rejestrze | — |
| 157 | wyciek-z-sojusznika | Wyciek ze służb sojusznika | — | SO −, WF − | — |
| 158 | turysta | „Turysta” z Zachodu wraca z fotografiami radzieckiego poligonu | — | Ocena (kod C–E) | — |
| 159 | przesluchanie-kontrwywiadu | Kontrwywiad przesłuchuje cały zespół | flaga `wyciek_do_zsrr` | SO −, BAS + | — |
| 160 | okret-podwodny | Nieznany okręt podwodny koło poligonu morskiego | — | BAS +, NG − | — |

## W9. Świat i blok wschodni (20)

| # | id | Wzorzec | Kiedy | Skutek | Paleta / uwagi |
|---|---|---|---|---|---|
| 161 | parada-w-moskwie | Parada w Moskwie: nowe rakiety na placu Czerwonym | 1.05 / 7.11 | `presja_wyscigu` + | parady |
| 162 | przemowienie-chruszczowa | Groźne przemówienie przywódcy ZSRR | — | NG −, `presja_wyscigu` + | przywodcy-zsrr |
| 163 | oferta-pokojowa | Moskwa składa ofertę pokojową | `kurs_kremla ≤ 4` | NG + ◆ | — |
| 164 | wizyta-z-bloku | Wizyta przywódcy z bloku wschodniego na Zachodzie | — | NG + | **wizyty** (np. Gierek w USA, X 1974) |
| 165 | kryzys-w-onz | Burzliwa sesja Zgromadzenia Ogólnego ONZ | — | NG ± | onz |
| 166 | zamieszki-w-kolonii | Zamieszki w kolonii państwa członkowskiego | `dekolonizacja ≥ 5` | kraj −, SO − | — |
| 167 | pucz-w-afryce | Pucz w jednym z nowych państw | `dekolonizacja ≥ 6` | stacja śledzenia ± | — |
| 168 | trzesienie-ziemi-swiat | Wielka katastrofa naturalna za granicą: pomoc | rzadko | PP +, WF + | katastrofy |
| 169 | igrzyska | Igrzyska olimpijskie: rywalizacja na stadionie | lata olimpijskie | PP ±, NG ± | olimpiady |
| 170 | chiny-prowokacja | Chińska prowokacja na granicy | `napiecie_azja ≥ 6` | NG − | — |
| 171 | indie-neutralne | Indie proponują wspólne badania neutralnym | od 1960 | RN + ◆ | — |
| 172 | rozmowy-rozbrojeniowe | Runda rozmów rozbrojeniowych | — | NG + | — |
| 173 | blokada-dostaw | Kraj trzeci wstrzymuje dostawy surowca | — | K− | surowce-strategiczne |
| 174 | zakladnicy-ambasada | Zajęcie ambasady albo konsulatu | od 1968 | NG −, ZW ± | — |
| 175 | uchodzcy | Fala uchodźców z kraju w kryzysie | po S05 / S06 | `pula_kadr` ± | — |
| 176 | swiatowa-konferencja-telekom | Konferencja telekomunikacyjna o częstotliwościach dla satelitów | od 1959 | DOI ± ◆ | (Genewa 1959, 1963) |
| 177 | radziecki-sukces-sportowy | Radziecki sukces naukowy albo sportowy na pokaz | — | `presja_wyscigu` + | — |
| 178 | zmiana-ambasadora | Nowy ambasador ZSRR w Waszyngtonie | — | NG ± | — |
| 179 | wybory-we-wloszech | Komuniści zyskują w wyborach we Włoszech albo we Francji | — | SO −, `jednosc_zachodu` − | — |
| 180 | zmeczenie-wojna | Zmęczenie społeczeństwa wojną peryferyjną | trwa S03 albo wojna z bloku B–C | `nastroje_spoleczne` + | — |

## W10. Gospodarka, natura i przypadek (20)

| # | id | Wzorzec | Kiedy | Skutek | Paleta / uwagi |
|---|---|---|---|---|---|
| 181 | huragan-floryda | Huragan nad Florydą | Q3, ośrodek na Florydzie | DOI −, K− | (sezon huraganów) |
| 182 | sztorm-na-poligonie | Sztorm nad poligonem morskim | — | DOI −, opóźnienie | — |
| 183 | trzesienie-ziemi-kalifornia | Trzęsienie ziemi w Kalifornii: zakłady przemysłu | rzadko | PRZ −, K− | — |
| 184 | susza | Susza: ceny żywności | — | `koniunktura` − | — |
| 185 | zima-stulecia | Zima stulecia w Europie | Q1, rzadko | członkowie −, K− | — |
| 186 | pozar-osrodka | Pożar w magazynie u dostawcy (nie PACE) | — | K− | — |
| 187 | blackout | Awaria sieci energetycznej | od 1965 | DOI − | (wielki blackout 1965) |
| 188 | gielda | Gwałtowny spadek na giełdzie | `koniunktura ≤ 5` | `koniunktura` −, K− | — |
| 189 | boom-gospodarczy | Kwartał boomu: dochody podatkowe rosną | `koniunktura ≥ 7` | Korekta + | — |
| 190 | inflacja | Inflacja zjada budżet | era ≥ III | K− | — |
| 191 | rekordowe-zbiory | Rekordowe zbiory i sprzedaż zboża za granicę | — | `koniunktura` + | — |
| 192 | cena-tlenu | Wzrost cen ciekłego tlenu i wodoru | — | K− | — |
| 193 | autostrada | Program autostrad konkuruje o budżet i beton | 1956–1960 | K− | (ustawa o autostradach, 1956) |
| 194 | epidemia-polio | Szczepionka przeciw polio: zaufanie do nauki | 1955 | RN +, PP + | (Salk, 1955) |
| 195 | katastrofa-lotnicza | Katastrofa samolotu pasażerskiego | — | PP − dla lotnictwa | (Comet 1954) |
| 196 | odrzutowiec-pasazerski | Początek ery odrzutowców pasażerskich | od 1958 | PP + dla lotnictwa | (Boeing 707) |
| 197 | rekord-predkosci | Nowy rekord prędkości albo wysokości (nie PACE) | — | `presja_wyscigu` ± | rekordy |
| 198 | swieto-narodowe | Święto narodowe: przemówienie o przyszłości | Q3 (4 lipca) | PP + | — |
| 199 | przypadkowe-odkrycie | Przypadkowe odkrycie w laboratorium dostawcy | — | RN +, PRZ + | — |
| 200 | dobry-kwartal | Spokojny, dobry kwartał: wszystko idzie zgodnie z planem | SO ≥ 65 | SO +, K+ | — |

---

# Część V. Palety epok

## 1. Format

Paleta to plik `data/palettes/<nazwa>.yaml`, czyli lista prawdziwych realiów z datami i warunkami. Wzorzec z polem `palette` przekazuje AI dwie lub trzy pozycje pasujące do kwartału i stanu świata. AI wybiera jedną i nie może wyjść poza listę. Przykład:

```yaml
# data/palettes/nauka-odkrycia.yaml
entries:
  - id: dna
    from: 1953-Q2
    until: 1955-Q4          # po tym czasie to już „stara wiadomość”
    text: Struktura podwójnej helisy DNA (Watson, Crick; dane rentgenowskie Franklin i Wilkinsa)
  - id: pasy-radiacyjne
    from: 1958-Q1
    requires: { flag: satelita_z_licznikiem }   # odkrywa ten, kto pierwszy poleci z licznikiem
    text: Pasy radiacyjne wokół Ziemi, wykryte licznikiem Geigera na orbicie
    owner: flag             # silnik podstawia odkrywcę: PACE, ZSRR albo inny
```

**Zasady:**
- Każda pozycja ma `from`, a opcjonalnie `until`, `requires` i `owner`.
- **Odkrycia zależne od lotów** (pasy radiacyjne, źródła promieniowania X, rozbłyski gamma, księżycowe próbki) mają warunek z modelu wyścigu albo z Twoich lotów. W świecie gry może je zrobić PACE, ZSRR albo nikt.
- **Prawdziwe osoby** występują w rolach, które pełniły naprawdę. Jeśli świat to wykluczył (flaga), pozycja wypada.
- Pustą paletę wzorzec zastępuje opisem ogólnym, bez nazwisk.

## 2. Paleta przykładowa: odkrycia naukowe 1951–1980

| Od | Odkrycie | Warunek |
|---|---|---|
| 1953-Q2 | Podwójna helisa DNA (Watson, Crick, Franklin, Wilkins) | — |
| 1953-Q2 | Doświadczenie Millera–Ureya: aminokwasy z „pierwotnej zupy” | — |
| 1954-Q2 | Maser (Townes) | — |
| 1955-Q4 | Antyproton (Segrè, Chamberlain) | — |
| 1956-Q2 | Wykrycie neutrina (Cowan, Reines) | — |
| 1957-Q1 | Łamanie parzystości (Wu; Lee i Yang) | — |
| 1957-Q2 | Teoria nadprzewodnictwa BCS | — |
| 1958-Q1 | **Pasy radiacyjne Ziemi** | flaga `satelita_z_licznikiem`; odkrywca według flagi |
| 1958-Q3 | Układ scalony (Kilby; w 1959 Noyce) | — |
| 1960-Q2 | Laser (Maiman) | — |
| 1962-Q2 | **Pierwsze pozasłoneczne źródło promieniowania X** (Skorpion X-1) | rakieta sondująca z detektorem X |
| 1963-Q1 | Kwazary (Schmidt, 3C 273) | — |
| 1964-Q1 | Kwarki jako hipoteza (Gell-Mann, Zweig); mechanizm Higgsa | — |
| 1965-Q2 | Mikrofalowe promieniowanie tła (Penzias, Wilson) | — |
| 1967-Q4 | Pulsary (Bell Burnell, Hewish) | — |
| 1971-Q4 | **Łabędź X-1: kandydat na czarną dziurę** | satelita rentgenowski (flaga) |
| 1973-Q2 | **Rozbłyski gamma** | satelity wykrywające wybuchy jądrowe (flaga DPO) |
| 1974-Q3 | Pulsar podwójny (Hulse, Taylor); promieniowanie Hawkinga (teoria) | — |
| 1977-Q1 | Pierścienie Urana (obserwacja zakrycia z samolotu) | — |
| 1978-Q2 | Charon, księżyc Plutona | — |
| 1979-Q1 | Pierwsza soczewka grawitacyjna (podwójny kwazar) | — |
| 1980-Q2 | Hipoteza Alvarezów: planetoida i wymarcie dinozaurów | — |

## 3. Paleta przykładowa: wizyty

| Kiedy | Wizyta | Warunek |
|---|---|---|
| 1954-Q2 | Cesarz Etiopii Haile Selassie w USA | — |
| 1957-Q4 | Królowa Elżbieta II w USA | — |
| 1959-Q3 | Chruszczow w USA i Camp David | A35, gałąź H (inaczej wypada) |
| 1959-Q4 | Podróż Eisenhowera dookoła świata | prezydent Eisenhower |
| 1960-Q2 | De Gaulle w USA | de Gaulle u władzy (A33) |
| 1963-Q2 | Kennedy w Berlinie Zachodnim | prezydent Kennedy |
| 1965-Q4 | Papież Paweł VI w ONZ | — |
| 1967-Q2 | Kosygin i spotkanie w Glassboro | — |
| 1972-Q1 | Prezydent USA w Pekinie | C12, gałąź H |
| 1973-Q2 | Breżniew w USA | — |
| 1974-Q4 | **Gierek w USA** (8–13.10.1974) | flaga `gierek_i_sekretarz` (C16) |
| 1976-Q3 | Elżbieta II na dwustuleciu USA | — |
| 1979-Q1 | Deng Xiaoping w USA | C12, gałąź H |
| 1979-Q4 | Jan Paweł II w USA | D09, gałąź H |

Pozostałe palety, do przygotowania przy zapisie wzorców:
- komisje Kongresu, sekretarze obrony, doradcy naukowi;
- kultura SF, książki, muzyka;
- komputery, elektronika, materiały, paliwa;
- wystawy, olimpiady, zaćmienia, komety, katastrofy, rekordy;
- stany przemysłowe i katalog firm (już jest w `docs/design/przemysl-firmy-sponsorzy.md`).

---

# Część VI. Co dalej

## 1. Kolejność prac

1. **Silnik** (jeden PR): `anchor` przy etapie, `kind` gałęzi z walidacją, `decision` w etapach, bezpieczniki szablonów, warunek `era`, palety, nowe zmienne. Wszystko z testami.
2. **Blok A w YAML**, partiami po około 10 wątków. Po każdej partii seria `--serie 1000` i raport, jak często świat odjeżdża i gdzie.
3. **Wzorce w YAML** partiami po 50, z paletami.
4. **Szablony S03–S16.**
5. **Bloki B, C, D.** Później, bo pierwsza kampania i tak zaczyna się w 1951 roku, a do 1961 roku są miesiące gry.

## 2. Pytania do autora

1. **K12: wojna jądrowa.** Czy wykluczamy ją kotwicą, czy dopuszczamy jako zakończenie kampanii (osobny epilog)?
2. **Kandydaci fikcyjni od 1968 roku** (K7): kto? Potrzebna lista nazwisk i profili, tak jak przy pilotach.
3. **Lista wątków:** które skreślasz, które dopisujesz? Proponuję potraktować tę listę jak menu.
4. **Śmierci prawdziwych osób** (Dallas, rok 1968): czy dopuszczasz gałąź „przerwaną”, w której zamach się nie zdarza? Zostawiłem ją, bo historia jest otwarta, ale bez teorii spiskowych w tekstach.
5. **Wątki polskie** (A25, C16, D09): czy chcesz je rozbudować ponad inne wątki, jako wyróżnik marki Intermarium?
6. **Nowe zmienne świata** (część I, punkt 11): czy osiem nowych zmiennych to nie za dużo? Gracz ich nie widzi, ale autor treści musi je pamiętać.

## 3. Źródła i weryfikacja

Daty i przebiegi wydarzeń podane są według wiedzy historycznej autora dossier (Claude). Daty, co do których były wątpliwości, sprawdziłem w źródłach poniżej. **Przed zapisaniem każdego wątku w YAML daty etapów sprawdzamy ponownie** i wpisujemy do pola `historicalNote` razem ze źródłem.

- [Bomber gap — Wikipedia](https://en.wikipedia.org/wiki/Bomber_gap): przelot M-4 w Tuszynie (lipiec 1955), zdjęcia U-2 z 9.07.1956, obalenie luki.
- [FRUS 1969–1976, t. E-15, dok. 50: rozmowa Ford–Gierek, Waszyngton, 8.10.1974](https://history.state.gov/historicaldocuments/frus1969-76ve15p1/d50): wizyta Gierka w USA.
- [Senat USA: Declaration of Conscience Margaret Chase Smith (1.06.1950)](https://www.senate.gov/artandhistory/history/common/generic/Speeches_Smith_Declaration.htm).
- Dokument Decyzyjny v1.1, punkty 4.3–4.6 (kanon przedświata, członkowie, poligony).
- GDD v1.0, punkty 4.4 (epoki), 14–17 (Bilans Wyścigu, Model ZSRR, wywiad, NG), 23–24 (zdarzenia i kryzysy), 31.3 (Szok i Samozadowolenie).
- `docs/research/analiza-pliku-wydarzen-1951.md`: plik wydarzeń autora z 1951 roku.
