# The Deep State Engine

*Intermarium History*

Meta-gra strategiczna nałożona na **Kerbal Space Program z modyfikacją RP-1 (wersja 4.7)**.
Grasz Eugene'em Andersonem, Dowódcą Operacyjnym **PACE** — *Pan-Atlantic Commission for
Experimentation* — i prowadzisz zachodni program kosmiczny przez zimną wojnę, od 1951 roku.
W KSP budujesz rakiety i latasz. Tutaj płacisz za to polityczną cenę.

> Stan projektu: **faza 1A — szkielet**. Szczegóły w [docs/STATUS.md](docs/STATUS.md).

## Dokumenty

| Dokument | Co zawiera |
|---|---|
| [docs/gdd/GDD_v1.0.md](docs/gdd/GDD_v1.0.md) | Pełny projekt gry: systemy, frakcje, pętla, AI, zakończenia |
| [docs/gdd/Dokument_Decyzyjny_v1.1.md](docs/gdd/Dokument_Decyzyjny_v1.1.md) | Decyzje przed fazą 1 i poprawki do GDD (ma pierwszeństwo przed GDD) |
| [docs/PLAN_BUDOWY.md](docs/PLAN_BUDOWY.md) | Fazy robocze, architektura, sposób pracy |
| [docs/STATUS.md](docs/STATUS.md) | Co jest zrobione, co jest następne |
| [docs/decisions/](docs/decisions/) | Rejestr decyzji technicznych i projektowych |
| [docs/GLOSARIUSZ.md](docs/GLOSARIUSZ.md) | Pojęcia z gry i ich nazwy w kodzie |

## Uruchomienie na Twoim komputerze

Potrzebujesz **Node.js w wersji LTS** (22 lub nowszej, instalator z nodejs.org) i **Git**
(albo GitHub Desktop).

```bash
git clone https://github.com/DiscoveryPlayer/deep-state-engine.git
cd deep-state-engine
npm install
npm run check          # sprawdzenie typów i wszystkie testy
```

Pierwsza kampania:

```bash
npm run dse -- waliduj                               # sprawdza treść gry w data/
npm run dse -- nowa-kampania --ziarno PACE-1951      # tworzy campaigns/pace-1951.json
npm run dse -- stan campaigns/pace-1951.json         # pokazuje stan oczami Andersona
```

Pliki kampanii (`campaigns/`) i klucze API (`.env`) zostają wyłącznie na Twoim dysku —
repozytorium je ignoruje.

## Struktura

```
data/                 treść gry w YAML — frakcje, postaci, cechy, Rejestr startowy
packages/core         silnik: stan, reguły, losowanie z ziarnem (bez plików i sieci)
packages/content      wczytywanie i walidacja treści z data/
packages/ksp-bridge   most do KSP RP-1 (faza 1B)
packages/narrator     narrator AI (faza 3)
packages/server       lokalny serwer (faza 2)
packages/ui           interfejs w przeglądarce (faza 2)
tools/cli             polecenia `npm run dse -- …`
tools/sim             symulator kampanii bez KSP (faza 4)
samples/saves         przykładowe zapisy RP-1 4.7 do testów parsera
```

## Treść gry

Treść leży w `data/*.yaml` i można ją edytować bez programowania. Po każdej zmianie:

```bash
npm run dse -- waliduj
```

Błędy są zgłaszane po polsku, z nazwą pliku i ścieżką pola, np.
`campaign.yaml [indicators.ZW]: Number must be less than or equal to 100`.
