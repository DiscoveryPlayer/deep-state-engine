# The Deep State Engine

*Intermarium History*

Meta-gra strategiczna nałożona na **Kerbal Space Program z modyfikacją RP-1 (wersja 4.8.1)**.
Grasz Eugene'em Andersonem, Dowódcą Operacyjnym **PACE** — *Pan-Atlantic Commission for
Experimentation* — i prowadzisz zachodni program kosmiczny przez zimną wojnę, od 1951 roku.
W KSP budujesz rakiety i latasz. Tutaj płacisz za to polityczną cenę.

> Stan projektu: **da się grać w lata 1951–1955** w przeglądarce (plaster 1 Planu Budowy v3). Szczegóły w [docs/STATUS.md](docs/STATUS.md).

## Jak zagrać

Potrzebujesz **Node.js w wersji LTS** (22 lub nowszej, instalator ze strony nodejs.org; wystarczy klikać „Dalej”).

1. Pobierz repozytorium: w GitHub Desktop wybierz *Clone repository*, a jeśli już je masz, *Fetch origin* i *Pull*.
2. Otwórz folder `deep-state-engine` i uruchom dwukrotnym kliknięciem plik **`Uruchom-DSE.bat`**.
3. Przy pierwszym uruchomieniu skrypt pobierze potrzebne pakiety (minuta lub dwie). Potem przeglądarka otworzy się sama pod adresem `http://127.0.0.1:4780`.
4. Czarne okno musi zostać otwarte, dopóki grasz. Zamknięcie okna kończy grę. Kampania zapisuje się sama po każdym ruchu.

Na macOS i Linuksie: `npm install`, potem `npm start` w terminalu w folderze projektu.

### Jeden kwartał

1. **Depesze:** przeczytaj, co się wydarzyło na świecie. Zakładka *Wywiad* pokazuje pogłoski z oceną wiarygodności.
2. **Sprawy do decyzji** (prawa kolumna): wybierz opcję i zatwierdź. Sprawa zostawiona bez decyzji rozstrzygnie się sama, zwykle z kosztem.
3. **Biurko:** wydaj Uwagę Dowódcy (6 punktów na kwartał) na spotkania, lobbing, konferencję prasową albo zlecenie dla wywiadu. Na wszystko nie wystarczy.
4. **KSP:** zagraj kwartał w swojej karierze RP-1. W zakładce *Budżet* znajdziesz Korekty do wpisania w KSP (tryb Honorowy), a w zakładce *Loty (KSP)* wczytasz plik zapisu, podając jego ścieżkę, na przykład `C:\Gry\KSP\saves\PACE\persistent.sfs`.
5. **Zamknij kwartał.** Odprawa pokaże, co się zmieniło i co przyszło na biurko. Gra kończy się, gdy Zaufanie Waszyngtonu albo Spójność Organizacji spadną do zera.

### Narrator (Claude albo Gemini)

Gra sama nie łączy się z AI. Narrator działa przez kopiuj-wklej:

1. Kliknij **Narrator** u góry ekranu (albo „Wysłuchaj doradców” przy sprawie do decyzji).
2. **Kopiuj pakiet** i wklej go w rozmowę z Claude albo Gemini w przeglądarce. Za pierwszym razem wybierz „Nowa rozmowa”; w kolejnych kwartałach możesz zostać w tej samej rozmowie i wysyłać krótszy pakiet.
3. Skopiuj całą odpowiedź i wklej ją w drugim polu okna. **Wczytaj narrację.**

Scena z gabinetu pojawi się na Biurku, wycinki prasowe i kuluary w Depeszach, a głosy dyrektorów przy sprawie. Narracja niczego nie zmienia w grze: liczby i wydarzenia ustala silnik. Pakiet zawiera tylko to, co wie Anderson.

### Zbieżność z historią

Przy zakładaniu kampanii wybierasz, jak często świat idzie drogą znaną z historii: około 90%, 70% albo 50% rozstrzygnięć. Wydarzenia-kotwice zdarzają się zawsze. Tego ustawienia nie da się zmienić w trakcie kampanii.

Ustawienia wyglądu (motyw ciemny i jasny, rozmiar tekstu, układ, kontrast, animacje) są pod przyciskiem *Ustawienia*. Powiększanie strony (Ctrl i plus, Ctrl i minus) przestawia układ, zamiast go rozlewać.

Pliki kampanii (`campaigns/`) i klucze API (`.env`) zostają wyłącznie na Twoim dysku. Repozytorium je ignoruje, a gra nie łączy się z internetem. Do AI trafia tylko to, co sam skopiujesz i wkleisz.

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
npm start -- --port 4790 --bez-przegladarki          # serwer na innym porcie, bez otwierania przeglądarki
```

## Struktura

```
data/                 treść gry w YAML: frakcje, postaci, wydarzenia świata, miejsca startu
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
