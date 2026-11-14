# 0019 — Pamięć świata: echa, Rejestr, bramka zapisu, Raporty Misji, warstwa ukryta narratora

**Data:** 13.11.2026 · **Status:** przyjęta

## Kontekst

Po dwóch rozgrywkach próbnych autor napisał, że świat „jeszcze nie ożył”: sprawy do decyzji kończą się na kliknięciu, a narrator (Gemini) nie umiał nic napisać o kupionej maszynie liczącej, bo w pakiecie nie było po niej śladu. 13.11 autor zatwierdził siedem zmian:

1. usuwanie zapisanych kampanii i strona startowa,
2. echa decyzji oraz przekazywanie narratorowi także tego, czego Anderson nie wie (na uczciwość gracza),
3. Rejestr Następstw z podziałem na wpisy jawne i ukryte,
4. pełny pakiet dla narratora,
5. integracja z formularzem postartowym (Raport Misji, GDD 18.3),
6. obowiązkowe wczytanie pliku `.sfs` na początku kwartału,
7. zdjęcia z domeny publicznej i wydarzenia w formie kart, z rozmową prowadzoną przez AI.

## Decyzje

### 1. Echa

Echo to następstwo, które wraca po czasie od wybranej opcji, gałęzi wątku albo wzorca.

- Treść: `data/events/echoes.yaml`. Echo ma `id`, listę źródeł `on`, opóźnienie `after` w kwartałach (domyślnie 2, najwyżej 12), `title`, `text`, `effects` oraz opcjonalnie `requires`, `chance`, `otherwise`, `silent`, `visibility`, `region`.
- Źródła w `on`: `dylemat.opcja`, `dylemat.biernosc`, `wątek.etap.opcja`, `wątek.etap.gałąź`, identyfikator wzorca. Echo można też zakolejkować skutkiem `{ echo, after }`.
- Stan: `world.echoQueue` z polami `echo`, `due`, `source`, `cause`. Kolejkę obsługuje krok „1b” w `advanceWorld`, przed nowymi wątkami.
- Echo, którego warunek `requires` nie jest spełniony, stosuje skutki `otherwise` (jeśli są) i nie zostawia depeszy. Echo `silent` zmienia stan bez depeszy; `after: 0` jest dozwolone tylko dla echa cichego i działa od razu.
- Wpis dziennika ma rodzaj `echo` i pole `cause`, na przykład „Maszyna licząca: Kupić”. Interfejs i pakiet narratora pokazują je jako „następstwo po: …”.
- Losowość (`chance`) idzie przez `Rng` kampanii, więc to samo ziarno i te same decyzje dają te same echa.
- Na start jest 91 ech: do wszystkich opcji sześciu dylematów, do 17 decyzji w wątkach, do trzech wzorców i dwa echa silnika (punkt 5).
- W serii 200 symulacji 1951–1955 wraca średnio 23 echa przy decyzjach losowych i 34 przy domyślnych. Zbieżność z historią na poziomie wysokim wynosi z echami 91%.

### 2. Rejestr Następstw: jawny i ukryty

- Skutek `{ registry: { key, type, title, with, weight, visible, note } }` tworzy wpis (Dług, Obietnica, Tajemnica, Uraza, Hak, Precedens, Zasługa). Skutek `{ registryClose: key, as }` zamyka go jako rozliczony (`resolved`) albo ujawniony (`revealed`). Warunek `{ registry: key }` sprawdza, czy wpis jest czynny.
- `visible: false` daje wpis ukryty. Nie ma go w `PlayerView`, więc gracz nie zobaczy go w żadnym widoku. Trafia tylko do warstwy ukrytej narratora (punkt 4).
- Wpis jawny pokazuje w zakładce Ludzie, z kim jest związany i z czego wynika.
- Walidacja treści odrzuca klucz zamykany albo sprawdzany, którego żaden skutek nie tworzy.

### 3. Bramka zapisu i nowy obieg kwartału

Dotąd gracz wczytywał zapis w dowolnej chwili i mógł o tym zapomnieć. Teraz kwartał zaczyna się od zapisu.

- `ksp.gate = { quarter, status }`, gdzie status to `pending`, `loaded` albo `skipped`. `beginQuarter` ustawia `pending`.
- Kwartał Q otwiera zapis kariery z początku Q, czyli z końca rozegranego w KSP kwartału Q−1. Pierwszy kwartał kampanii otwiera zapis nowej kariery.
- Dopóki bramka czeka, serwer odrzuca (kod 409) decyzje, akcje Biurka, zamknięcie kwartału, pakiet i odpowiedź narratora oraz Raporty Misji. Interfejs pokazuje okno, którego nie da się zamknąć klawiszem Esc; można tylko wrócić do menu.
- Okno daty zapisu: od 15 dni przed początkiem kwartału (`GATE_EARLY_DAYS`) do 30 dni po nim (`QUARTER_TOLERANCE_DAYS`). Poza oknem gra ostrzega, ale zapis przyjmuje. Zapis starszy niż poprzednio wczytany trafia do Kroniki jako naruszenie zasad uczciwości (GDD 22).
- **Obejście:** „Nie mam zapisu za ten kwartał”, z potwierdzeniem i wpisem w Kronice. Twarda blokada zatrzymałaby kampanię przy uszkodzonym pliku albo w kwartale bez gry w KSP, a GDD 22 mówi, że gra nie blokuje, tylko odnotowuje.
- Zapis można wczytać ponownie w tym samym kwartale. Loty o tej samej nazwie pojazdu i dacie zachowują numer i raport.

### 4. Warstwa ukryta narratora (zmiana zasady Z4)

Zasada Z4 mówiła, że do interfejsu i do AI dane idą wyłącznie przez `toPlayerView`. Autor zdecydował, że narrator ma wiedzieć więcej niż Anderson.

- Nowe, drugie wyjście ze stanu: `toNarratorSecrets(state, content)` w `packages/core/src/view/narratorView.ts`. Zawiera tajne wydarzenia kwartału, ukryte wpisy Rejestru, prawdziwe Agendy, Cierpliwość i Eskalację frakcji, ukryte cechy i Lojalność dyrektorów, echa i etapy wątków z najbliższych dwóch kwartałów, zmienne świata i Rozbieżność.
- Wolno go użyć **tylko** w pakiecie narratora i tylko wtedy, gdy gracz zaznaczy „Dołącz warstwę ukrytą”. Do interfejsu nadal trafia wyłącznie `PlayerView`.
- Pakiet z warstwą ukrytą jest „zapieczętowany”: interfejs nie wyświetla jego treści. Gracz kopiuje go do schowka jednym przyciskiem albo zapisuje do pliku `campaigns/pakiety/<kampania>/<kwartał>-<rodzaj>.md` i załącza w rozmowie z AI. Nie ma hasła ani szyfrowania; zabezpieczeniem jest uczciwość gracza, tak jak chciał autor.
- Pakiet mówi modelowi, jak używać tej warstwy: do nastroju, niedopowiedzeń i spójności zachowań postaci. Narrator nie ujawnia faktów ukrytych wprost, nie zapowiada tego, co nadchodzi, i dalej niczego nie rozstrzyga (Z3).

### 5. Raport Misji (GDD 18.3)

- Każdy nowy start z zapisu dostaje wpis `ksp.flights` z numerem `M-RRRR-NN`, datą, miejscem startu i liczbą awarii części, a w dzienniku świata kartę rodzaju `flight`.
- Gracz wypełnia trzy pola i opcjonalną uwagę (do 200 znaków): **wynik** (sukces, częściowy sukces, niepowodzenie), **przeznaczenie** (naukowe, obronne, załogowe, próba techniczna, sojusznicze), **klasyfikacja** (jawny, poufny, tajny). Raport można zmieniać do zamknięcia kwartału. Lot bez raportu gra rozlicza jako jawną próbę techniczną.
- Wyniku lotu gra nie odczytuje z zapisu, bo zapis go nie zawiera. Podaje go gracz; liczba awarii z dziennika kariery stoi obok jako fakt (Z1).
- **Rozliczenie przy zamknięciu kwartału (reguła tymczasowa, liczby nie pochodzą z GDD):**
  - Poparcie Publiczne: jawny sukces +1 (najwyżej +3 w kwartale), jawne niepowodzenie −2 (najwyżej −4), poufne niepowodzenie −1 (najwyżej −2).
  - Zaufanie Waszyngtonu: +1, gdy był choć jeden sukces; −1, gdy niepowodzeń jest więcej niż sukcesów; +1 za ukończone kontrakty.
  - Wiarygodność Fasady: −1 za jawny lot obronny; +1 za udany lot sojuszniczy, który nie jest tajny.
  - Frakcja, na której przeznaczeniu było najwięcej sukcesów, dostaje +1 Nastawienia (naukowe: RN, obronne: DPO, załogowe: BLZ, próba techniczna: DOI). Udane loty sojusznicze dają +1 Kapitału Politycznego.
  - Tajne niepowodzenie nie kosztuje od razu, ale tworzy Tajemnicę „zatajona awaria”. Po dwóch kwartałach z szansą 0,35 wraca jako przeciek; jeśli nie wróci, po sześciu kwartałach sprawa cichnie.
- Ta reguła zastępuje „bilans lotów” z decyzji 0017 (punkt 7). Sama zostanie zastąpiona rozliczaniem Dyrektyw i kart lotów w plastrze 3.

### 6. Pełny pakiet narratora, rozmowa i scena wydarzenia

- Pakiet kwartału zawiera teraz: wydarzenia z kodami kart (W1, W2…) i przyczyną przy następstwach, to, co Anderson postanowił i zrobił w tym kwartale (decyzje, akcje Biurka, Raporty Misji), jawny Rejestr, loty, a na życzenie warstwę ukrytą.
- Cztery zlecenia:
  - **kwartał:** `## SCENA`, od dwóch do czterech sekcji `## W…` do kart wydarzeń, `## PRASA`, `## KULUARY`;
  - **głosy** w sprawie do decyzji (jak dotąd);
  - **rozmowa:** kilka tur w czacie AI, zakończona blokiem `## WYNIK` z linią `OPCJA: <litera>` i sekcją `## SCENA`. Gra zaznacza wskazaną opcję, a gracz ją zatwierdza albo wybiera inną;
  - **scena wydarzenia:** tekst do jednej karty.
- Zasada Z3 zostaje: narrator wskazuje jedną z opcji przygotowanych przez silnik, ale skutki ustala silnik, a decyzję zatwierdza gracz.

### 7. Karty wydarzeń, menu główne, usuwanie kampanii

- Jawne wpisy dziennika rodzaju wątek, szablon, echo, lot, dylemat i wzorzec dostają kod karty w obrębie kwartału. Reakcje stron i komunikaty o sytuacjach dołączają do poprzedniej karty.
- **Odprawa** otwiera się po wczytaniu zapisu: bilans poprzedniego kwartału, potem karty (zdjęcie, rodzaj, przyczyna, treść, reakcje, tekst narratora, przycisk sceny), na końcu sprawy do decyzji. Kolejność dalszych działań wybiera gracz.
- **Menu główne** otwiera grę: powrót do kampanii, lista kampanii, nowa kampania, skrót obiegu kwartału.
- **Usuwanie kampanii** jest dwuetapowe i przenosi plik do `campaigns/usuniete/` z datą w nazwie. Nic nie ginie bezpowrotnie; przywraca się ręcznie.

### 8. Zdjęcia

- `data/images/manifest.yaml`: 19 pozycji z identyfikatorem, nazwą pliku, kandydatami w Wikimedia Commons, podpisem i listą tematów (wątek, dylemat, wzorzec albo `lot`).
- Pliki pobiera na komputerze gracza `Pobierz-zdjecia.bat` (`npm run zdjecia`). Skrypt bierze tylko pliki, które Commons opisuje jako domenę publiczną albo CC0, zapisuje autora i licencję do `data/images/pliki/zrodla.json` i pomija resztę. Gra działa także bez zdjęć.
- `data/images/pliki/` nie trafia do repozytorium.
- **Zasada doboru:** maszyny, miejsca, budynki, wydarzenia. Bez portretów osób publicznych.
- Serwer podaje pod `/obrazy/` wyłącznie pliki wymienione w manifeście.

### 9. Stan kampanii w wersji 5

Migracja 4 → 5: pusta kolejka ech, migawki z polem `newLaunches` w miejsce `launchesInQuarter`, pusta lista lotów i bramka. Bramka jest `loaded`, gdy kampania ma migawkę z bieżącego kwartału; w przeciwnym razie `pending`, więc starsza kampania po aktualizacji poprosi o zapis.

## Odrzucone

- **Wklejane z góry drzewo dialogowe w interfejsie** (pytanie z trzema odpowiedziami, potem trzy na każdą z nich i jeszcze raz). To 39 węzłów na wydarzenie, z których gracz czyta najwyżej trzy ścieżki. Model musiałby pisać wszystko naraz w formacie, który łatwo zepsuć, a gałęzie i tak nie mogłyby mieć własnych skutków, bo liczby ustala silnik (Z3). Rozmowa w czacie AI daje to samo wrażenie wyboru na żywo, a do gry wraca tylko wynik: jedna z opcji silnika.
- **Twarda blokada bez obejścia** (punkt 3).
- **Portrety osób publicznych** na kartach.
- **Zdjęcia w repozytorium.** Sandbox, w którym powstaje kod, nie ma dostępu do Wikimedia Commons, a pliki pobrane u gracza mają sprawdzoną licencję w chwili pobrania.
- **Szyfrowanie warstwy ukrytej.** Autor wybrał uczciwość gracza.
- **Skutki mechaniczne z odpowiedzi narratora.** Bez zmian względem decyzji 0018.

## Konsekwencje

- Zasada Z4 w `CLAUDE.md` ma teraz dwa wyjścia ze stanu. Każde nowe pole stanu nadal domyślnie nie jest widoczne dla gracza; osobno trzeba zdecydować, czy ma je znać narrator.
- Nowa treść (blok 1956–1960) powinna od razu dostawać echa do decyzji. Walidacja wyłapie echo podpięte pod źródło, którego nie ma.
- Liczby rozliczenia lotów i szansa przecieku są do oceny w pilotażu.
- Tytuły plików w manifeście zdjęć pochodzą z wyszukiwania i nie były sprawdzone na Commons z tego środowiska. Część może odpaść przy pobieraniu; wtedy wystarczy dopisać w manifeście innego kandydata.
- Format `## WYNIK` i sekcje `## W…` nie były jeszcze sprawdzone na prawdziwych odpowiedziach Claude i Gemini.
