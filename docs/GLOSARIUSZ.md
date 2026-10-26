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
| Rejestr Następstw | — | `registry`, `RegistryEntryState` | |
| Dług, Obietnica, Tajemnica, Uraza, Hak, Precedens, Zasługa | — | `type`: `debt`, `promise`, `secret`, `grudge`, `hook`, `precedent`, `merit` | |
| Ciśnienie Ujawnienia | — | `pressure` | 0–6, tylko tajemnice |
| Zegar | — | `clocks`, `ClockState` | 4, 6 lub 8 segmentów |
| Dyrektywa | — | `directives`, `D-<numer>` | weryfikacja W / R / D |
| Ocena wywiadowcza | — | `knowledge.assessments` | kody A–F i 1–6 |
| Kronika | — | `chronicle` | |
| Warstwa faktyczna | — | `GameState` | pełny stan |
| Wiedza Andersona | — | `PlayerView`, `toPlayerView()` | jedyna droga do interfejsu i AI |
| Rejestr Korekt (dawniej `kspOffsets`) | — | faza 7 | zmiany zapisywane do pliku KSP |
| Migawka | — | faza 1B | znormalizowany stan techniczny z KSP |
