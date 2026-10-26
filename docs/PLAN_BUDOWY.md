# THE DEEP STATE ENGINE — Plan budowy aplikacji

| | |
|---|---|
| **Wersja** | 1.0 (25.10.2026) |
| **Podstawa** | GDD v1.0 i Dokument Decyzyjny v1.1, zatwierdzony z odpowiedziami z 25.10.2026 |
| **Cel dokumentu** | Podzielić budowę na fazy robocze. Każda faza kończy się czymś, co działa i co da się sprawdzić na prawdziwej karierze RP-1 |

---

## 1. Decyzje zamknięte

Twoje odpowiedzi zamykają kwestie otwarte z Dokumentu Decyzyjnego. Wpływ na projekt:

| Kwestia | Decyzja | Konsekwencja |
|---|---|---|
| Wersja | **RP-1 4.7**, zamrożona na całą kampanię | Parser i mapowania budujemy wyłącznie pod 4.7. Przed startem kampanii trzeba wyeksportować listę modów z CKAN i zrobić kopię instalacji |
| Trudność | **Normalny**, z podniesionym startowym Confidence i kredytem odblokowań | Więcej Confidence na start oznacza wcześniejsze tempa Fast i Breakneck, czyli szybszy początek. Tabela kalibracji ZSRR startuje od przesunięcia +2 kwartały, a kalibracja po 8 kwartałach dostraja resztę. Dokładne wartości ustawień zapisujemy w konfiguracji kampanii, żeby silnik je znał |
| Starty z odległych miejsc | **Działają** | „Twierdze i Bagna” (DD 4.6) wchodzą do kanonu. Patronat frakcji (DD 7.3) obejmuje zarówno kompleks startowy, jak i miejsce startu |
| Publikacja | **Nigdy** | Ryzyko prawne odpada. Pierścień zewnętrzny można poluzować: prawdziwe osoby mogą mieć ostre, cyniczne portrety i być oceniane przez narratora. **Jedna zasada zostaje z powodów praktycznych:** narrator nie przypisuje prawdziwym osobom wymyślonych przestępstw ani obyczajowych skandali, bo modele językowe często w takich miejscach łagodzą tekst albo odmawiają. Ton zrobiłby się wtedy niespójny w połowie kampanii. Wymyślone występki dajemy postaciom fikcyjnym |
| Marka projektu | **Intermarium History** | Nazwa w stopkach dokumentów, w ekranie tytułowym i w metadanych repozytorium |
| Nazwa organizacji | **PACE** | Rozdział 2 |

---

## 2. PACE — propozycja rozwinięcia

Skrót jest bardzo dobry z jednego powodu, który warto zrobić częścią lore. **„Pace” po włosku znaczy „pokój”**, a łacińskie *pax* czyta każdy wykształcony Europejczyk lat 50. Włochy są członkiem założycielem. Wersja dla prasy brzmi więc sama: *„organizacja, która w samej nazwie nosi pokój”*. Wersja dla Mistrza Gry jest taka, że ktoś w Departamencie Stanu bardzo się postarał, żeby tak wyszło.

Proponuję rozwinięcie, które robi z PACE to, co Dokument Decyzyjny robił z NA-AXO, czyli zmianę jednego słowa w 1958 roku:

| Okres | Rozwinięcie | Uwagi |
|---|---|---|
| **1951–1958** | ***Pan-Atlantic Commission for Experimentation*** | „Commission” i „Experimentation” to słowa zgodne z epoką; obejmują rakiety, X-Planes i badania atmosfery |
| **od 1958** | ***Pan-Atlantic Commission for Exploration*** | Po szoku orbitalnym słowo „Experimentation” brzmi jak przyznanie się do porażki, więc pada propozycja zamiany na „Exploration”. Decyzja należy do Andersona w łańcuchu kryzysu (DD 4.2) |

Wersja francuska: *Commission Pan-Atlantique pour l'Expérimentation* — skrót CPAE. Francuzi oczywiście go używają.

Inne rozwinięcia, jeśli to Ci nie leży:
- *Programme for Atlantic Cooperation in Exploration*,
- *Permanent Atlantic Council for Experimentation*,
- *Pan-Atlantic Council for Exploration*.

**Co z NA-AXO?** Proponuję, żeby NA-AXO przestało być nazwą organizacji. Mam dwie opcje:
- **(a) Usuwamy NA-AXO całkowicie.** Wszystkie dokumenty mówią o PACE. Rekomenduję tę opcję: jedna nazwa to mniej zamieszania dla Ciebie i dla AI.
- **(b) NA-AXO jako nazwa wewnętrzna.** Na przykład kryptonim Dowództwa Operacyjnego, którym kieruje Anderson, używany tylko w dokumentach tajnych.

---

## 3. Jak widzę aplikację

### 3.1. Wybór technologii

Rekomenduję **TypeScript w całym projekcie**, a nie Pythona z GDD 33.2. Zmieniam zdanie z trzech powodów:

1. Twoja Warstwa Personelu jest już pisana w kategoriach TS/JS (`PersonnelEngine.ts`, `ColdWarEngine.ts`). Jeśli masz z tamtego okresu jakikolwiek kod, łatwiej go przenieść.
2. Interfejs i tak będzie przeglądarkowy, a jeden język od silnika do ekranu oznacza wspólne typy danych i mniej błędów na styku.
3. Silnik może działać i w przeglądarce, i w terminalu (symulator bez KSP, rozdział 3.4). Dzięki temu da się go testować bez uruchamiania gry.

Aplikacja działa **lokalnie na Twoim komputerze**: mały serwer czyta i zapisuje pliki KSP i przechowuje klucz API do modelu AI, a interfejs otwierasz w przeglądarce. Wymaga to zainstalowania Node.js w wersji LTS. Nic nie idzie do chmury poza zapytaniami do modelu AI.

### 3.2. Moduły

```
deep-state-engine/
├─ docs/                 GDD, Dokument Decyzyjny, plan, rejestr decyzji, STATUS.md
├─ data/                 TREŚĆ GRY — pliki YAML, edytowalne bez programowania
│  ├─ factions/          frakcje, agendy, dźwignie, dary
│  ├─ characters/        postaci, Karty Głosu, cechy, ukryte cechy
│  ├─ events/            szablony zdarzeń i kryzysów
│  ├─ directives/        szablony Dyrektyw
│  ├─ milestones/        kamienie milowe i mapowanie na kontrakty RP-1
│  ├─ soviet/            biura OKB, projekty, kotwice, doktryna
│  ├─ world/             Biblia kompaktowa, wpisy z tagami, miejsca startowe
│  └─ mapping/           liderzy RP-1, producenci, programy → sponsorzy
├─ packages/
│  ├─ core/              SILNIK — stan, reguły, zegary, Rejestr, ZSRR, wywiad
│  │                     czysty TypeScript, zero dostępu do plików i sieci,
│  │                     losowanie z ziarnem (determinizm, GDD 33.3)
│  ├─ ksp-bridge/        parser plików .sfs, dziennik kariery, Migawka, różnice,
│  │                     zapis Korekt z białej listy, kopie zapasowe
│  ├─ narrator/          Pakiet Kontekstu, adaptery modeli AI, walidator,
│  │                     szablony zapasowe, ślepy test
│  ├─ server/            lokalny serwer: pliki, klucze API, baza kampanii
│  └─ ui/                interfejs: Biurko, Teczki, Rejestr, Zegary, Archiwum, Rozkaz
└─ tools/
   ├─ sim/               SYMULATOR — kampania bez KSP, z syntetycznym graczem
   └─ cli/               narzędzia: import zapisu, podgląd stanu, raport kwartału
```

**Najważniejsza zasada architektury:** `core` nie wie, że istnieje KSP, AI ani przeglądarka. Dostaje Migawkę i decyzje gracza, a zwraca nowy stan i listę zdarzeń. Wszystko inne to adaptery wokół niego. Dzięki temu:
- silnik testujemy automatycznie, w sekundach;
- zmiana wersji RP-1 dotyka tylko `ksp-bridge`;
- zmiana modelu AI dotyka tylko `narrator`;
- treść gry (frakcje, zdarzenia, postaci) jest w plikach YAML, które możesz pisać i poprawiać bez dotykania kodu.

### 3.3. Przepływ jednego kwartału w aplikacji

```
[Ty w KSP] ─ gra do końca kwartału ─► zapis .sfs
                                          │
                     ksp-bridge: parser → Migawka → różnice wobec poprzedniego kwartału
                                          │
                     core: rozliczenie (Dyrektywy, wskaźniki, ZSRR, wywiad, zegary, zdarzenia)
                                          │
                     narrator: Pakiet Kontekstu → model AI → walidator → dokumenty
                                          │
                     ui: Następstwa → Odprawa → Biurko (Twoje decyzje)
                                          │
                     core: Rozkaz Kwartalny + Korekty
                                          │
                     ksp-bridge: kopia zapasowa → zapis Korekt do .sfs
                                          │
[Ty w KSP] ◄──────────── Rozkaz Kwartalny na drugim monitorze
```

### 3.4. Symulator — narzędzie, którego nie ma w GDD, a które bardzo się przyda

Pełna kampania RP-1 to setki godzin, więc nie da się zbalansować meta-gry wyłącznie przez granie. **Symulator** uruchamia silnik z syntetycznym „graczem KSP”. Syntetyczny gracz generuje sztuczne Migawki według prostego profilu, np.:
- „ostrożny inżynier: orbita w 1957, 15% awarii”,
- „hazardzista: orbita w 1955, 35% awarii”.

Do tego dochodzi prosty „gracz Biurka”, który podejmuje decyzje według reguł.

Sto kampanii przeliczy się w kilka sekund, a silnik powie, ile razy Anderson został odwołany, kiedy przeciętnie wypada szok orbitalny i która frakcja najczęściej wpada w bunt. To jedyny realny sposób, żeby sprawdzić metryki z GDD 31.4, zanim zainwestujesz w kampanię dziesiątki godzin.

---

## 4. Fazy robocze

Każda faza ma **zakres**, **wynik**, **kryterium ukończenia** i **to, czego potrzebuję od Ciebie**. Fazy 0 i 1 mogą biec równolegle, bo prototyp papierowy nie wymaga kodu.

### Faza 0 — Prototyp papierowy *(równolegle z fazą 1)*

| | |
|---|---|
| **Zakres** | Rozgrywka meta-gry „na papierze”: arkusz stanu, 4 frakcje (DPO, BAS, RN, BLZ), 15–20 szablonów zdarzeń z Epoki I, uproszczony zegar ZSRR, ręczny Rejestr, instrukcja dla Mistrza Gry. AI w czacie odgrywa narratora, a Ty liczysz według reguł |
| **Wynik** | Pakiet startowy: `stan.md`, `reguly-skrot.md`, `zdarzenia-epoka1.md`, `instrukcja-MG.md` |
| **Kryterium** | Rozegrane 4–8 kwartałów prawdziwej kariery 4.7. Potrafisz wskazać trzy decyzje, które naprawdę bolały, i jeden element, który był nudny |
| **Od Ciebie** | Granie i krótkie notatki po każdym kwartale: co działało, co nudziło, co było niejasne |

Faza 0 jest ważniejsza, niż wygląda. Każda reguła, która w niej nie zadziała, kosztuje w kodzie dziesięć razy więcej.

### Faza 1 — Fundament

**1A. Szkielet i model danych**
| | |
|---|---|
| **Zakres** | Repozytorium, konfiguracja TypeScript, testy, typy stanu (warstwa prawdy i warstwa wiedzy, wskaźniki, frakcje, postaci, Rejestr, zegary, Dyrektywy), losowanie z ziarnem, zapis i odczyt stanu kampanii, wczytywanie YAML z walidacją |
| **Kryterium** | Stan startowy 1951 wczytany z YAML, zapisany i odtworzony bit w bit; testy przechodzą |

**1B. Most do KSP: odczyt**
| | |
|---|---|
| **Zakres** | Parser formatu ConfigNode (.sfs), ekstrakcja dziennika kariery, programów, kompleksów startowych, miejsc startu, liderów, walut; Migawka; różnice między Migawkami |
| **Kryterium** | Z Twoich prawdziwych zapisów 4.7 parser wyciąga poprawne dane. Sprawdzamy to na wydruku porównanym z tym, co widzisz w grze |
| **Od Ciebie** | **Pliki zapisu** (rozdział 6) |

**1C. Silnik kwartału bez AI**
| | |
|---|---|
| **Zakres** | Pełna pętla rozliczenia (GDD 9.2, faza 4): weryfikacja Dyrektyw z poziomem W, wskaźniki i przepływy, frakcje i Cierpliwość, Rejestr i Ciśnienie, zegary; zdarzenia z szablonów; Rozkaz Kwartalny; teksty z szablonów zapasowych |
| **Kryterium** | Komenda `dse kwartal --zapis persistent.sfs` daje raport kwartału i Rozkaz Kwartalny w Markdown |

**Kamień M1 — „Silnik liczy prawdziwą karierę”**: pierwszy kwartał Twojej kariery rozliczony automatycznie, bez AI i bez interfejsu.

### Faza 2 — Biurko (interfejs)

| | |
|---|---|
| **Zakres** | Lokalny serwer i interfejs: ekran Biurka z pięcioma wskaźnikami, UD i KP; Teczka Kwartalna; akcje Biurka; przyjmowanie i odrzucanie Dyrektyw; Linie Budżetowe; formularz po locie; Rozkaz Kwartalny do druku i na drugi monitor; tryb czytelny (GDD 30.1) |
| **Kryterium** | Cały kwartał rozgrywasz w przeglądarce, bez terminala |

**Kamień M2 — „Da się grać”**: meta-gra grywalna od początku do końca kwartału, z tekstami z szablonów.

### Faza 3 — Narrator

| | |
|---|---|
| **Zakres** | Pakiet Kontekstu (GDD 27.1) z warstwą wiedzy, adaptery modeli AI (co najmniej dwóch dostawców), walidator, ponawianie i szablony zapasowe, Kronika i streszczenia, Biblia kompaktowa i wpisy z tagami, Karty Głosu, **ślepy test modeli** (DD 6.3), Teczka Pojazdu |
| **Kryterium** | Dokumenty kwartału generuje AI, walidator łapie wymyślone liczby i nazwiska, a ślepy test wskazał model |
| **Od Ciebie** | Klucze API do wybranych dostawców i ocena próbek w ślepym teście |

**Kamień M3 — „Świat mówi”**: pierwsza Teczka Kwartalna napisana przez AI na podstawie prawdziwego kwartału Twojej kariery.

### Faza 4 — Przeciwnik i wywiad

| | |
|---|---|
| **Zakres** | Model ZSRR (biura OKB, projekty, Doktryna, Zwroty, Doktryna Masy, kotwice), kalibracja po 8 kwartałach, Bilans Wyścigu, aktywa wywiadowcze i Oceny z kodami wiarygodności, Zlecenia BAS, Napięcie Geopolityczne; **pierwsza wersja symulatora** |
| **Kryterium** | Sto kampanii w symulatorze daje rozkład dat szoku orbitalnego zgodny z celem projektowym |

### Faza 5 — Ludzie

| | |
|---|---|
| **Zakres** | Postaci i cechy (jawne i ukryte), Gabinet, mapowanie liderów RP-1, Lojalność i Ambicja, Intrygi, Haki, Wtyczka i Odwrócony, Śledztwo z rozszerzonymi wynikami, Odcięcie dostępu, rotacja kadry, Reputacja Stylu Andersona |
| **Kryterium** | W symulatorze i w grze pojawiają się intrygi z sygnałami do wykrycia, a liderzy RP-1 mają swoje odpowiedniki w lore |

### Faza 6 — Polityka i kryzysy

| | |
|---|---|
| **Zakres** | Kryzysy wieloetapowe, Sesja Budżetowa, Rada Atlantycka z wetem, Zmiana Administracji, Komisja Badania Wypadku na danych o awariach z dziennika kariery, patronat nad kompleksami i miejscami startu, przydział symulacji, Słownik kryptonimów, epoki |
| **Kryterium** | Pełny rok kampanii z jednym kryzysem i Sesją Budżetową rozegrany w grze |

### Faza 7 — Most do KSP: zapis

| | |
|---|---|
| **Zakres** | Rejestr Korekt, zapis z białej listy (DD 3.2), kopie zapasowe, kontrola zamkniętego KSP, ponowna walidacja po zapisie, dziennik zmian; tryb Honorowy jako zapasowy |
| **Kryterium** | Dziesięć cykli zapisu na kopii Twojej kariery bez uszkodzenia pliku, z poprawnym wpływem na fundusze, Confidence i kredyt |

Faza 7 jest celowo późno. Do tego momentu Korekty wpisujesz ręcznie (tryb Honorowy), więc ryzyko uszkodzenia zapisu w trakcie budowy jest zerowe.

**Kamień M4 — „Vertical slice”**: Epoka I (1951–1957) grywalna w całości, ze wszystkimi systemami. Odpowiada fazie 1 z GDD 34.1.

### Faza 8 — Pełna kampania

| | |
|---|---|
| **Zakres** | Epoki II–IV, pełna pula zdarzeń (~150 szablonów), zakończenia, Ocena Historyczna, epilog odtajnienia, balans w symulatorze, szlif interfejsu |
| **Kryterium** | Metryki z GDD 31.4 w zakresie docelowym w symulatorze, a potem w grze |

---

## 5. Jak będziemy pracować razem

### 5.1. Podział ról

| Ty | Ja |
|---|---|
| Autor wizji i ostatnie słowo w sprawach projektu | Implementacja, testy, dokumentacja techniczna |
| Treść gry: frakcje, postaci, zdarzenia (mogę je szkicować, Ty decydujesz) | Przekładanie reguł z GDD na kod i dane |
| Gra w KSP i pliki zapisu | Parser, silnik, interfejs, narrator |
| Testy w praktyce: czy to jest ciekawe | Testy automatyczne: czy to działa |

### 5.2. Rytm pracy

Jedna sesja to jedno zadanie o wyraźnych granicach, na przykład „parser .sfs wyciąga listę kompleksów startowych”. Sesja kończy się działającym kodem z testami i krótką notą, co się zmieniło i co jest następne.

### 5.3. Pamięć projektu jest w repozytorium

To najważniejsza zasada praktyczna. Moje sesje nie dzielą ze sobą pełnej pamięci rozmów, a projekt będzie trwał miesiącami. Dlatego **źródłem prawdy jest repozytorium**, nie historia czatu:

- `docs/STATUS.md` — bieżąca faza, co zrobione, następne zadania, otwarte problemy. Każdą sesję zaczynam od przeczytania tego pliku, a kończę jego aktualizacją.
- `docs/decisions/` — krótkie zapisy decyzji: co postanowiliśmy, dlaczego, jaka była alternatywa. Dzięki nim nie wracamy do rozstrzygniętych sporów.
- `docs/gdd/` — GDD i Dokument Decyzyjny jako żywe dokumenty, poprawiane razem z kodem.

### 5.4. Zasady techniczne

- Każda reguła z GDD ma test, a każda liczba z GDD siedzi w pliku konfiguracyjnym, nie w kodzie.
- Silnik jest deterministyczny: ten sam stan i te same decyzje dają ten sam wynik.
- Żaden moduł nie zapisuje do pliku KSP poza fazą 7 i białą listą.
- Treść gry w YAML ma schemat i walidację, więc literówka w szablonie zdarzenia daje czytelny błąd, a nie dziwne zachowanie w kwartale 37.

---

## 6. Czego potrzebuję od Ciebie na start

1. **Miejsce na kod** — rozdział 7, pytanie 1.
2. **Pliki zapisu z RP-1 4.7** — najlepiej trzy, z jednej nowej kariery:
   - zaraz po utworzeniu kariery (styczeń 1951, przed pierwszym działaniem),
   - po pierwszych 2–3 miesiącach (programy przyjęte, kompleks w budowie),
   - po pierwszym starcie, najlepiej także po jednej awarii.
   
   Plik to `persistent.sfs` z folderu `saves/<nazwa kariery>/` w katalogu KSP. Przydadzą się też eksport CSV z okna dziennika kariery i zrzut ekranu ustawień trudności.
3. **Kod z wcześniejszych prób**, jeśli istnieje, np. aplikacja z AI Studio z `PersonnelEngine.ts`. Nie będę go przepisywał na ślepo, ale mogę z niego wziąć to, co pasuje.

---

## 7. Pytania

1. **Gdzie trzymamy kod?** Najlepiej prywatne repozytorium na GitHubie: zakładasz je, a ja dostaję do niego dostęp z tej sesji. Mam wtedy pełną historię zmian, a Ty możesz wszystko pobrać jednym poleceniem. Alternatywa: wysyłam Ci po każdej sesji spakowany projekt.
2. **TypeScript zamiast Pythona** — akceptujesz?
3. **PACE** — rozwinięcie z rozdziału 2 czy któreś z alternatywnych? NA-AXO usuwamy (a) czy zostawiamy jako nazwę wewnętrzną (b)?
4. **Od czego zaczynamy:** od pakietu do prototypu papierowego (faza 0), od szkieletu i parsera (faza 1), czy od obu równolegle? Rekomenduję oba: pakiet papierowy przygotuję w jednej sesji, a parser czeka i tak na Twoje pliki zapisu.
