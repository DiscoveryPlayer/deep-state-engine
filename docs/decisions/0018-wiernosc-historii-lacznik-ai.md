# 0018 — Wierność historii i Łącznik AI (narrator przez kopiuj-wklej)

**Data:** 12.11.2026 · **Status:** przyjęta

## Kontekst

Po pierwszej rozgrywce 1951–1955 autor zgłosił dwie uwagi:

1. Zbieżność świata z historią na poziomie około 90% to za dużo jako jedyna możliwość. Na planszy otwierającej ma być wybór: około 90% (domyślnie), 70% i 50%.
2. Najbardziej brakuje narratora. Meta-gra „służy tylko do klikania”. Potrzebne jest okno eksportu i importu danych do przeglądarkowej wersji Claude albo Gemini.

Autor dopuścił też dodatkową warstwę obrazu i okna wyskakujące.

## Decyzje

### 1. Wierność historii

- Nowe ustawienie kampanii `historyFidelity`: `high`, `medium`, `low`. Wybiera się je przy zakładaniu kampanii i potem się nie zmienia, bo zmiana w trakcie mieszałaby dwa różne światy.
- Mechanika: wagi gałęzi **niehistorycznych** mnoży stała `HISTORY_FIDELITY_ALT_SCALE` (1,4 · 5 · 10). Gałęzie historyczne, Rozbieżność regionów i decyzje Andersona działają jak dotąd.
- Miara: udział rozstrzygnięć historycznych w etapach, w których jest wybór (co najmniej dwie gałęzie). Etapy-kotwice mają jedną gałąź i zdarzają się zawsze.
- Kalibracja w seriach 300 symulacji 1951–1955: **90%, 70% i 51%**. Dotychczasowe wagi dawały 93%, więc poziom wysoki jest odrobinę luźniejszy niż wcześniej.
- Polecenie do sprawdzania: `npm run dse -- swiat --serie 300 --do 1955-Q4 --wiernosc niska`.
- Kalibracja dotyczy treści 1951–1955. Po dopisaniu kolejnych bloków trzeba ją powtórzyć.

### 2. Łącznik AI

Narrator działa **poza grą**, w rozmowie z Claude albo Gemini w przeglądarce. Gra nie łączy się z żadnym modelem i nie potrzebuje klucza API.

- **Pakiet Kontekstu** (`packages/narrator`, `buildNarratorPackage`) powstaje wyłącznie z widoku gracza (`PlayerView`, zasada Z4) i z jawnej obsady: nazw frakcji oraz rejestru i nawyków mowy dyrektorów. Notatki Mistrza Gry, cechy ukryte i lista „nigdy nie mówi” do pakietu nie trafiają. Pilnuje tego test.
- Pakiet ma dwa tryby: **nowa rozmowa** (zasady, kanon świata gry, obsada, dane kwartału) i **ta sama rozmowa** (same dane kwartału).
- Dwa zlecenia:
  - **Narracja kwartału:** sekcje `## SCENA` (scena z gabinetu), `## PRASA` (trzy wycinki), `## KULUARY`.
  - **Głosy w sprawie:** dwie albo trzy sekcje `## GŁOS: imię i nazwisko` dla sprawy czekającej na decyzję.
- **Zasady dla modelu** są częścią pakietu: niczego nie rozstrzyga, nie dodaje faktów ani liczb, wie tylko to, co Anderson, nie podpowiada opcji. Dialogi pisze tylko postaciom fikcyjnym; prawdziwe osoby pojawiają się w mowie zależnej, bez wymyślonych cytatów i przewinień. Kanon gry (Dokument Decyzyjny 4.3) ma pierwszeństwo przed podręcznikiem.
- **Odpowiedź** wkleja gracz. `parseNarratorReply` dzieli ją na sekcje i traktuje jako tekst niezaufany: limit 24 000 znaków i 8 sekcji, usuwane znaki sterujące i znaczniki, treść trafia na stronę wyłącznie jako tekst.
- **Zasada Z3:** narracja to stan `narrative.entries`, bez żadnego skutku mechanicznego. Ponowny import tego samego zlecenia w tym samym kwartale zastępuje poprzedni.
- Poprzednia scena wraca w następnym pakiecie (do 700 znaków), żeby narrator trzymał ciągłość także w nowej rozmowie.

### 3. Stan kampanii w wersji 4

Migracja 3 → 4 dodaje `campaign.historyFidelity = 'high'` i pustą narrację. Kampanie założone przed tą zmianą wczytują się bez strat; ich świat od tej chwili losuje z wagami poziomu wysokiego.

### 4. Obraz i okna

- **Odprawa** po zamknięciu kwartału: bilans wskaźników, najważniejsze depesze, liczba spraw do decyzji, przycisk do narratora. Przy końcu kampanii to samo okno pokazuje zakończenie.
- **Czytnik narracji** i narracja w zakładkach Biurko i Depesze w formie maszynopisu i wycinków prasowych.
- **Głosy doradców** w karcie sprawy do decyzji.
- **Tablica sytuacyjna:** sześciokąt na region świata z liczbą jawnych depesz bieżącego kwartału.
- **Przebiegi wskaźników:** cienka linia z ostatnich 12 kwartałów pod każdym licznikiem.
- Komunikaty informacyjne znikają same po 7 sekundach.

## Odrzucone

- **Bezpośrednie połączenie z API modelu.** Wymaga klucza i kosztuje za każde wywołanie; autor chce korzystać z wersji przeglądarkowych. Zostaje jako możliwość na później (Plan Budowy v3, plaster 5), z tym samym Pakietem Kontekstu.
- **Import, który zmienia stan gry** (na przykład AI proponuje skutki). Łamałby zasadę Z3.
- **Zmiana wierności w trakcie kampanii.**
- **Wymuszanie dokładnego udziału** gałęzi historycznej w każdym etapie. Odebrałoby znaczenie wagom z treści i decyzjom Andersona.

## Konsekwencje

- Plaster 5 („Świat mówi”) jest zaczęty: Pakiet Kontekstu i format odpowiedzi są gotowe i przetestowane na ręcznym obiegu.
- Jakość narracji zależy od modelu i od tego, czy trzyma się zasad z pakietu. Gra tego nie sprawdza: nie wie, czy model nie dopisał faktu. To do oceny w pilotażu.
- Przy niskiej wierności świat szybko odchodzi od treści pisanej pod historię. Wątki mają gałęzie alternatywne, ale im dalej, tym więcej etapów zostanie pominiętych z braku pasującej gałęzi.
