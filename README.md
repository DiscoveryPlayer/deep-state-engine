# The Deep State Engine

*Intermarium History*

Meta-gra strategiczna nałożona na **Kerbal Space Program z modyfikacją RP-1 (wersja 4.8.1)**.
Grasz Eugene'em Andersonem, Dowódcą Operacyjnym **PACE** — *Pan-Atlantic Commission for
Experimentation* — i prowadzisz zachodni program kosmiczny przez zimną wojnę, od 1951 roku.
W KSP budujesz rakiety i latasz. Tutaj płacisz za to polityczną cenę.

> Stan projektu: **da się grać w lata 1951–1955** w przeglądarce. Decyzje mają następstwa, loty z KSP mają Raporty Misji, a narrator dostaje pełny obraz kwartału. Szczegóły w [docs/STATUS.md](docs/STATUS.md).

## Jak zagrać

Potrzebujesz **Node.js w wersji LTS** (22 lub nowszej, instalator ze strony nodejs.org; wystarczy klikać „Dalej”).

1. Pobierz repozytorium: w GitHub Desktop wybierz *Clone repository*, a jeśli już je masz, *Fetch origin* i *Pull*.
2. Otwórz folder `deep-state-engine` i uruchom dwukrotnym kliknięciem plik **`Uruchom-DSE.bat`**.
3. Przy pierwszym uruchomieniu skrypt pobierze potrzebne pakiety (minuta lub dwie). Potem przeglądarka otworzy się sama pod adresem `http://127.0.0.1:4780`.
4. Czarne okno musi zostać otwarte, dopóki grasz. Zamknięcie okna kończy grę. Kampania zapisuje się sama po każdym ruchu.

Na macOS i Linuksie: `npm install`, potem `npm start` w terminalu w folderze projektu.

Gra otwiera się w **menu głównym**: wracasz do kampanii, zakładasz nową albo usuwasz starą. Usunięta kampania trafia do folderu `campaigns/usuniete/`, więc da się ją przywrócić ręcznie.

### Jeden kwartał

1. **Zapis z KSP.** Kwartał zaczyna się od okna z prośbą o plik zapisu kariery z początku tego kwartału, na przykład `C:\Gry\KSP\saves\PACE\persistent.sfs`. Pierwszy kwartał otwiera zapis nowej kariery, każdy następny zapis po rozegraniu poprzedniego kwartału w KSP. Jeśli zapisu nie masz, wybierz „Nie mam zapisu za ten kwartał”; gra odnotuje to w Kronice i pójdzie dalej bez lotów.
2. **Odprawa.** Po wczytaniu zapisu gra pokazuje karty: bilans poprzedniego kwartału, wydarzenia na świecie, następstwa Twoich wcześniejszych decyzji, nowe loty i sprawy do decyzji. Dalej kolejność wybierasz sam.
3. **Raporty Misji** (zakładka *Loty (KSP)*): każdy nowy start z zapisu dostaje formularz. Podajesz wynik, przeznaczenie i klasyfikację lotu. Od tego zależy, co zobaczy prasa, Waszyngton i frakcje. Zatajone niepowodzenie nic nie kosztuje od razu, ale może wrócić jako przeciek.
4. **Sprawy do decyzji** (prawa kolumna): wybierz opcję i zatwierdź. Sprawa zostawiona bez decyzji rozstrzygnie się sama, zwykle z kosztem. Większość wyborów wraca po kilku kwartałach jako następstwo i zostawia ślad w Rejestrze (zakładka *Ludzie*).
5. **Biurko:** wydaj Uwagę Dowódcy (6 punktów na kwartał) na spotkania, lobbing, konferencję prasową albo zlecenie dla wywiadu. Na wszystko nie wystarczy.
6. **Zamknij kwartał.** Okno następnego kwartału poda Korektę budżetu do wpisania w karierze (tryb Honorowy) i poprosi o zapis. Teraz grasz ten kwartał w KSP; zapis z jego końca otwiera następny. Gra kończy się, gdy Zaufanie Waszyngtonu albo Spójność Organizacji spadną do zera.

### Narrator (Claude albo Gemini)

Gra sama nie łączy się z AI. Narrator działa przez kopiuj-wklej:

1. Kliknij **Narrator** u góry ekranu.
2. **Kopiuj pakiet** i wklej go w rozmowę z Claude albo Gemini w przeglądarce. Za pierwszym razem wybierz „Nowa rozmowa”; w kolejnych kwartałach możesz zostać w tej samej rozmowie i wysyłać krótszy pakiet.
3. Skopiuj całą odpowiedź i wklej ją w drugim polu okna. **Wczytaj narrację.**

Są cztery zlecenia:

- **Narracja kwartału:** scena z gabinetu, krótkie sceny do kart wydarzeń, wycinki prasowe i kuluary.
- **Scena od narratora** na karcie wydarzenia: tekst do tej jednej karty.
- **Wysłuchaj doradców** przy sprawie do decyzji: głosy dyrektorów.
- **Rozegraj rozmowę z narratorem** przy sprawie do decyzji: prowadzisz w czacie AI rozmowę jako Anderson, narrator po każdej wypowiedzi daje Ci kilka możliwych odpowiedzi. Na końcu AI wypisuje blok `WYNIK` z jedną z opcji przygotowanych przez grę. Po wklejeniu gra zaznacza tę opcję, a Ty ją zatwierdzasz albo wybierasz inną.

Narracja niczego nie zmienia w grze: liczby i wydarzenia ustala silnik.

**Warstwa ukryta.** Zwykły pakiet zawiera tylko to, co wie Anderson. Pole „Dołącz warstwę ukrytą” dodaje to, czego nie wie: tajne wydarzenia, ukryte wpisy Rejestru, prawdziwe zamiary frakcji i to, co nadchodzi. Narrator używa tego do nastroju i niedopowiedzeń. Taki pakiet jest zapieczętowany: gra nie pokazuje jego treści, tylko kopiuje go do schowka albo zapisuje do pliku w `campaigns/pakiety/`, który załączasz w rozmowie. Nie ma tu hasła. Jeśli otworzysz ten plik, zepsujesz sobie mgłę wojny.

### Zdjęcia do kart wydarzeń

Uruchom raz **`Pobierz-zdjecia.bat`** (potrzebny internet). Skrypt pobierze z Wikimedia Commons zdjęcia z listy `data/images/manifest.yaml` i weźmie tylko te, które są w domenie publicznej. Autor i licencja każdego pliku trafiają do `data/images/pliki/zrodla.json` i są pokazane pod zdjęciem. Czego nie uda się pobrać, tego gra po prostu nie pokaże. Własne pozycje dopisujesz w manifeście: nazwa pliku, tytuł pliku w Commons, podpis i tematy, przy których zdjęcie ma się pojawiać.

### Zbieżność z historią

Przy zakładaniu kampanii wybierasz, jak często świat idzie drogą znaną z historii: około 90%, 70% albo 50% rozstrzygnięć. Wydarzenia-kotwice zdarzają się zawsze. Tego ustawienia nie da się zmienić w trakcie kampanii.

Ustawienia wyglądu (motyw ciemny i jasny, rozmiar tekstu, układ, kontrast, animacje) są pod przyciskiem *Ustawienia*. Powiększanie strony (Ctrl i plus, Ctrl i minus) przestawia układ, zamiast go rozlewać.

Pliki kampanii (`campaigns/`), pobrane zdjęcia i klucze API (`.env`) zostają wyłącznie na Twoim dysku. Repozytorium je ignoruje. Sama gra nie łączy się z internetem; robi to tylko skrypt pobierania zdjęć, kiedy go uruchomisz. Do AI trafia tylko to, co sam skopiujesz i wkleisz.

## Dokumenty

| Dokument | Co zawiera |
|---|---|
| [docs/gdd/GDD_v1.0.md](docs/gdd/GDD_v1.0.md) | Pełny projekt gry: systemy, frakcje, pętla, AI, zakończenia |
| [docs/gdd/Dokument_Decyzyjny_v1.1.md](docs/gdd/Dokument_Decyzyjny_v1.1.md) | Decyzje przed fazą 1 i poprawki do GDD (ma pierwszeństwo przed GDD) |
| [docs/PLAN_BUDOWY.md](docs/PLAN_BUDOWY.md) | Plan Budowy v3: co działa, co dalej, w jakiej kolejności |
| [docs/STATUS.md](docs/STATUS.md) | Co jest zrobione, co jest następne |
| [docs/decisions/](docs/decisions/) | Rejestr decyzji technicznych i projektowych |
| [docs/plan/](docs/plan/) | Wcześniejsze wersje planu, pytania i rozstrzygnięcia |
| [docs/design/](docs/design/) | Projekty systemów: wydarzenia świata, miejsca startu, przemysł i sponsorzy |
| [docs/research/](docs/research/) | Materiał źródłowy: dossier, analizy |
| [CHANGELOG.md](CHANGELOG.md) | Dziennik zmian |
| [docs/GLOSARIUSZ.md](docs/GLOSARIUSZ.md) | Pojęcia z gry i ich nazwy w kodzie |

## Narzędzia w terminalu

Dla sprawdzania treści i strojenia. Do samej gry nie są potrzebne.

```bash
npm run check                                        # sprawdzenie typów i wszystkie testy
npm run dse -- waliduj                               # sprawdza treść gry w data/
npm run dse -- swiat --do 1955-Q4 --prawda           # jedna symulacja świata z warstwą ukrytą
npm run dse -- swiat --serie 300 --do 1955-Q4        # statystyka gałęzi z 300 symulacji
npm run dse -- swiat --serie 300 --wiernosc niska    # to samo dla niższej zbieżności z historią
npm run zdjecia                                      # pobiera zdjęcia do kart wydarzeń (to samo co Pobierz-zdjecia.bat)
npm start -- --port 4790 --bez-przegladarki          # serwer na innym porcie, bez otwierania przeglądarki
```

## Struktura

```
data/                 treść gry w YAML: frakcje, postaci, wydarzenia świata, echa, miejsca startu, manifest zdjęć
packages/core         silnik: stan, świat, pętla kwartału, Biurko (bez plików i sieci)
packages/content      wczytywanie i walidacja treści z data/
packages/ksp-bridge   odczyt zapisów KSP RP-1 (.sfs)
packages/server       lokalny serwer: kampanie na dysku, API, interfejs
packages/ui           interfejs w przeglądarce
packages/narrator     Łącznik AI: pakiet dla narratora i odczyt odpowiedzi
tools/cli             polecenia `npm run dse -- …`
tools/sim             symulator kampanii z profilem gracza (plaster 4)
samples/saves         zapisy RP-1 4.8.1 do testów odczytu
```

## Treść gry

Treść leży w `data/*.yaml` i można ją edytować bez programowania. Po każdej zmianie:

```bash
npm run dse -- waliduj
```

Błędy są zgłaszane po polsku, z nazwą pliku i ścieżką pola, np.
`campaign.yaml [indicators.ZW]: Number must be less than or equal to 100`.
