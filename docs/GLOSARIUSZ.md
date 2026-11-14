# Słowniczek — pojęcia z gry i ich nazwy w kodzie

| Pojęcie (GDD) | Skrót | W kodzie | Uwagi |
|---|---|---|---|
| Zaufanie Waszyngtonu | ZW | `indicators.ZW` | 0–100; 0 = odwołanie Andersona |
| Spójność Organizacji | SO | `indicators.SO` | 0–100; 0 = rozpad |
| Poparcie Publiczne | PP | `indicators.PP` | 0–100 |
| Wiarygodność Fasady | WF | `indicators.WF` | 0–100 |
| Napięcie Geopolityczne | NG | `indicators.NG` | 1–5, skala odwrócona |
| Uwaga Dowódcy | UD | `currencies.UD` | punkty akcji na kwartał |
| Kapitał Polityczny | KP | `currencies.KP` | 0–20 |
| Reputacja Stylu | — | `style.{risk, openness, loyalty, orientation}` | −10…+10 |
| Frakcja | — | `factions[id]`, `FactionState` | identyfikatory DPO, BAS, RN, BLZ, PRZ, DOI |
| Wpływ | — | `influence` | 1–5 |
| Nastawienie | — | `disposition` | −3…+3 |
| Cierpliwość | — | zegar `kind: 'patience'` | 6 segmentów |
| Eskalacja | — | `escalation` | 0 spokój … 4 bunt |
| Postać | — | `characters[id]`, `CharacterState` | |
| Kompetencja / Lojalność / Ambicja | — | `competence` / `loyalty` / `ambition` | 1–5 / −3…+3 / 1–5 |
| Cechy jawne / ukryte | — | `traits` / `hiddenTraits`, `revealedTraits` | |
| Rejestr Następstw | — | `registry[]`, `RegistryEntryState`, skutki `registry` i `registryClose`, warunek `registry` | wpis `visibleToPlayer: false` zna tylko narrator (decyzja 0019) |
| Dług, Obietnica, Tajemnica, Uraza, Hak, Precedens, Zasługa | — | `type`: `debt`, `promise`, `secret`, `grudge`, `hook`, `precedent`, `merit` | |
| Ciśnienie Ujawnienia | — | `pressure` | 0–6, tylko tajemnice |
| Zegar | — | `clocks`, `ClockState` | 4, 6 lub 8 segmentów |
| Dyrektywa | — | `directives`, `D-<numer>` | weryfikacja W / R / D |
| Ocena wywiadowcza | — | `knowledge.assessments` | kody A–F i 1–6 |
| Kronika | — | `chronicle` | |
| Warstwa faktyczna | — | `GameState` | pełny stan |
| Wiedza Andersona | — | `PlayerView`, `toPlayerView()` | jedyna droga do interfejsu i AI |
| Rejestr Korekt (dawniej `kspOffsets`) | — | faza 7 | zmiany zapisywane do pliku KSP |
| Wątek świata | — | `threads/<id>.yaml`, `world.threads[id]` | etapy z datami, gałąź historyczna i alternatywne (decyzja 0015) |
| Etap alternatywny | — | `alternative: true` | wejście tylko przez `next` |
| Kotwica | — | `anchor: true` w etapie | etap z jedną gałęzią historyczną, bez decyzji |
| Szablon wątku | — | `templates/<id>.yaml`, instancja `<id>#<n>` | parametry, np. `{kraj}` |
| Wzorzec | — | `patterns.yaml`, `world.patternLog` | zdarzenie bez daty |
| Dylemat | — | `dilemmas.yaml`, `world.pendingDilemmas` | bez decyzji: opcja domyślna |
| Zmienne świata | — | `world.vars` | 0–10, ukryte przed graczem |
| Rozbieżność | D | `world.divergence[region]` | 0–10, ukryta |
| Korekta budżetu | — | `world.corrections` | jednostki robocze (decyzja 0012) |
| Wiadomości ze świata | — | `PlayerView.worldNews` | tylko wpisy publiczne |
| Wątek głęboki | — | `rumor`, `decision`, `sameQuarter`, `reactions`, `ongoing` | standard treści (decyzje 0016, 0017) |
| Wątek-echo | — | `kind: reactive` | startuje od flagi, etapy z `offset` |
| Gałęzie H/P/O/X/A | — | `branchKind()` | historyczna, przyspieszona, opóźniona, przerwana, alternatywna |
| Gałąź szczegółu | — | `minor: true` | niehistoryczna, ale nie podnosi Rozbieżności |
| Sytuacja trwająca | — | `world.situations`, `PlayerView.situations` | skutki co kwartał aż do etapu `until` |
| Reakcja strony | — | `reactions`, wpis `kind: reaction` | kto i jak odpowiedział na rozstrzygnięcie |
| Pogłoska | — | `rumor` → `knowledge.assessments` | Ocena wywiadowcza przed etapem |
| Sprawa do decyzji | — | `PlayerView.pendingDilemmas` | dylemat samodzielny albo decyzja etapu (`fromThread`) |
| Uwaga Dowódcy | UD | `currencies.UD`, `BASE_UD` | 6 na kwartał |
| Akcja Biurka | — | `performDeskAction`, `desk.log` | pięć akcji z GDD 10.2 |
| Otwarcie i zamknięcie kwartału | — | `beginQuarter`, `closeQuarter` | pętla tury (decyzja 0017) |
| Raport kwartału | — | `reports`, `QuarterReport` | zmiany od otwarcia kwartału |
| Księga Korekt | — | `budget.ledger`, `settleCorrection` | tryb Honorowy: gracz oznacza Korektę jako zastosowaną |
| Jednostka Korekty | jedn. | `correctionUnitFunds` | 20% miesięcznych wynagrodzeń z ostatniej Migawki |
| Migawka | — | `ksp.snapshots`, `KspSnapshot`, `readCareerFile` | stan kariery KSP wczytany na początku kwartału (koniec poprzedniego) |
| Bilans lotów | — | `closeQuarter` | reguła tymczasowa (decyzja 0017, punkt 7) |
| Miejsce startu | — | `data/launch-sites.yaml`, `launchSiteProblem` | strony: `west`, `east`, `out_of_period` |
| Naruszenie zasad uczciwości | — | wpis Kroniki z tagiem `naruszenie` | GDD 22; gra nie blokuje |
| Wierność historii | — | `campaign.historyFidelity`, `HISTORY_FIDELITY_ALT_SCALE` | wysoka, umiarkowana, niska: około 90%, 70%, 50% (decyzja 0018) |
| Łącznik AI | — | `packages/narrator`, okno „Narrator” | narrator przez kopiuj-wklej, bez klucza API |
| Pakiet Kontekstu | — | `buildNarratorPackage` | tylko z `PlayerView` i jawnej obsady |
| Narracja | — | `narrative.entries`, `recordNarrative` | tekst AI wklejony przez gracza; bez skutków mechanicznych |
| Głosy doradców | — | narracja rodzaju `decision` | sekcje `## GŁOS: …` przy sprawie do decyzji |
| Odprawa | — | okno po wczytaniu zapisu na początku kwartału | bilans, karty wydarzeń, sprawy (decyzja 0019) |
| Tablica sytuacyjna | — | `DeskPayload.regions` | jawne depesze kwartału według regionów |
| Echo (następstwo) | — | `data/events/echoes.yaml`, `world.echoQueue`, wpis dziennika `kind: 'echo'` | wraca po czasie od decyzji, gałęzi albo wzorca; pole `cause` mówi, z czego wynika (decyzja 0019) |
| Bramka zapisu | — | `ksp.gate`, `kspGatePending`, `skipKspGate` | kwartał zaczyna się od wczytania pliku `.sfs`; obejście zostawia wpis w Kronice |
| Lot | — | `ksp.flights[]`, numer `M-RRRR-NN` | każdy nowy start wykryty w zapisie |
| Raport Misji | — | `flight.report`, `fileMissionReport`, `settleFlights` | wynik, przeznaczenie, klasyfikacja; rozliczany przy zamknięciu kwartału (GDD 18.3, reguła tymczasowa) |
| Karta wydarzenia | — | `worldNews[].card` (W1, W2…), `topic`, `cause` | jedna strona Odprawy: zdjęcie, treść, reakcje, scena narratora |
| Warstwa ukryta narratora | — | `toNarratorSecrets`, pakiet „zapieczętowany” | to, czego Anderson nie wie; tylko do AI, na życzenie gracza |
| Rozmowa z narratorem | — | narracja rodzaju `conversation`, `parseConversationResult` | kończy się blokiem `## WYNIK` z linią `OPCJA: <litera>`; decyzję zatwierdza gracz |
| Scena wydarzenia | — | narracja rodzaju `event` | tekst narratora do jednej karty |
| Manifest zdjęć | — | `data/images/manifest.yaml`, `npm run zdjecia` | zdjęcia z Wikimedia Commons, tylko domena publiczna; pliki zostają na dysku gracza |
