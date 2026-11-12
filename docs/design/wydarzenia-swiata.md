# Wydarzenia świata — projekt systemu

**Status:** wersja 1.1 (7.11.2026, po odpowiedziach autora) · **Decyzja:** [0015](../decisions/0015-wydarzenia-swiata-model.md) · **Kod:** `packages/core/src/world/` · **Treść:** `data/events/`

## 1. Problem i rozwiązanie

Plik wydarzeń z 1951 roku jest dobry, ale ma dwie wady. Trzydzieści takich plików (1951–1980) to ogrom pracy. Poza tym roczny plik zakłada, że świat idzie po historii: po rozejściu z historią (np. plan Buccaneer w Abadanie) rok 1952 z pliku przestaje pasować.

Dlatego treść nie opisuje lat, tylko **mechanizmy**. Silnik sam składa z nich kolejne kwartały:

| Mechanizm | Co to jest | Przykład | Plik |
|---|---|---|---|
| **Wątek świata** | Proces historyczny rozpisany na etapy z datami. Każdy etap ma gałąź historyczną i gałęzie alternatywne | Kryzys irański: nacjonalizacja → Abadan → los Mosaddegha | `data/events/threads/<id>.yaml` |
| **Etap alternatywny** | Etap, do którego prowadzi tylko gałąź niehistoryczna | „Wojna w Zatoce” po wykonaniu planu Buccaneer | w pliku wątku, `alternative: true` |
| **Kotwica** | Wątek z jedną gałęzią w każdym etapie: rzecz pewna (decyzja 0013) | Wybór Eisenhowera w 1952 roku | `kind: anchor` |
| **Szablon wątku** | Ten sam mechanizm co wątek, ale bez dat i z parametrami. Startuje, gdy pozwala stan świata | Kryzys naftowy w kraju {Irak, Kuwejt, Wenezuela…} | `data/events/templates/<id>.yaml` |
| **Wzorzec** | Pojedyncze zdarzenie bez daty, z warunkami i szansą na kwartał | Strajk u dostawcy, drenaż mózgów, przeciek do prasy | `data/events/patterns.yaml` |
| **Dylemat** | Zdarzenie, które trafia na Biurko i czeka na decyzję Andersona. Bez decyzji silnik przyjmuje opcję domyślną i dolicza koszt bierności | Lotnictwo kontra NACA, zakup maszyny liczącej | `data/events/dilemmas.yaml` |

Do tego dochodzą **zmienne świata** (np. koniunktura, popyt na ropę, siła Wielkiej Brytanii) i **Rozbieżność** każdego regionu (0–10). Zmienne i Rozbieżność są ukryte przed graczem. Gracz widzi ich skutki w depeszach, cenach i raportach.

Jeden wątek zastępuje fragment wielu rocznych plików: Abadan opisuje lata 1951–1953 w obu wersjach świata, historycznej i alternatywnej. Wzorzec, np. strajk, działa tak samo w 1952 jak w 1975 roku.

## 2. Rozbieżność

Rozbieżność mierzy, jak daleko region odjechał od historii. Na starcie wynosi 0 we wszystkich regionach.

**Jak rośnie:**
- +1, gdy w etapie wątku z gałęzią historyczną wypadnie inna gałąź (stała `DIVERGENCE_PER_NONHISTORICAL_BRANCH`);
- jawnie, skutkiem `divergence`, np. brytyjska okupacja Chuzestanu podnosi Rozbieżność Europy;
- etap alternatywny nie dolicza +1 drugi raz: historii w nim już nie ma.

**Co robi:** zmienia wagi gałęzi.

- Gałąź historyczna: waga × (1 + 2 × (1 − D/10)). Przy D = 0 to ×3, przy D = 10 to ×1.
- Gałąź niehistoryczna: waga × (1 + 0,15 × D). Przy D = 10 to ×2,5.
- Szansa uruchomienia szablonu rośnie tak samo jak waga gałęzi niehistorycznej.

Przykład: etap „Abadan” ma wagi bazowe ewakuacja 10 (historyczna), Buccaneer 1, mediacja 2.

| Rozbieżność Bliskiego Wschodu | Ewakuacja | Buccaneer | Mediacja |
|---|---|---|---|
| 0 | 91% | 3% | 6% |
| 3 | 85% | 5% | 10% |
| 5 | 79% | 7% | 14% |
| 10 | 57% | 14% | 29% |

Do tego dochodzą modyfikatory zależne od stanu świata: przy sile Wielkiej Brytanii ≥ 7 waga Buccaneera rośnie trzykrotnie. Historia jest więc „grawitacją”: świat do niej ciąży, ale im dalej odjedzie, tym słabiej.

Stałe mają nazwy i komentarze w `engine.ts`: `HISTORICAL_BIAS_AT_ZERO = 3`, `NONHISTORICAL_BOOST_PER_POINT = 0,15`, `DIVERGENCE_PER_NONHISTORICAL_BRANCH = 1`. To główne pokrętła strojenia (punkt 8).

## 3. Kwartał świata

Silnik rozlicza świat raz na kwartał (`advanceWorld`), w stałej kolejności:

1. Dylematy po terminie rozstrzygają się opcją domyślną (wpis „bez decyzji Dowódcy”). Dochodzi koszt bierności (`inactionEffects`), np. −1 KP.
2. Startują wątki historyczne, których czas nadszedł (`start.from` i opcjonalne `start.conditions`).
3. Szablony mogą uruchomić nowe instancje: warunki, odstęp, limit instancji i szansa × Rozbieżność.
4. Wątki rozstrzygają etapy, na które przyszła pora. Silnik losuje gałąź według wag, stosuje skutki, zapisuje historię i ustala następny etap.
5. Losują się wzorce: warunki, odstęp, limit łączny, szansa.
6. Na Biurko mogą trafić nowe dylematy (najwyżej `maxPendingDilemmas` naraz).

Wszystkie losowania idą przez `Rng` z ziarnem zapisanym w stanie. To samo ziarno daje ten sam świat (test „determinizm”). Gałąź wybiera **silnik**, nie AI (zasada Z3). AI dostaje gotowe wpisy dziennika do opisania.

**Przejścia między etapami:**
- bez `next` wątek idzie do najbliższego etapu, który nie jest alternatywny;
- `next: <etap>` skacze do wskazanego etapu (tylko tak można wejść do etapu alternatywnego);
- `next: end` kończy wątek;
- `delayQuarters: N` zostawia wątek w tym samym etapie i losuje znowu za N kwartałów (np. zerwane rozmowy rozejmowe);
- `advanceNext: N` przyspiesza następny etap o N kwartałów, ale nie wcześniej niż na kolejny kwartał.

## 4. Skutki

Skutki są strukturalne (YAML), a zod sprawdza je przy wczytaniu:

| Skutek | Zapis | Uwagi |
|---|---|---|
| Zmienna świata | `{ var: koniunktura, add: -1 }` albo `set` | przycinana do min–max |
| Wskaźnik | `{ indicator: ZW, add: -3 }` | ZW, SO, PP, WF (0–100), NG (1–5, 1 = krawędź) |
| Rozbieżność | `{ divergence: europa, add: 1 }` | 0–10 |
| Frakcja | `{ faction: RN, disposition: 1 }` | Nastawienie −3…+3 |
| Kapitał Polityczny | `{ currency: KP, add: 1 }` | |
| Flaga | `{ flag: iran_zamach }`, `{ clearFlag: … }` | do warunków w innych wątkach |
| Korekta budżetu | `{ correction: { units: -0.5, quarters: 4, reason: '…' } }` | decyzja 0012; trafia do `world.corrections` |

**Zasada:** wydarzenie świata nie tworzy faktów w KSP. Nie niszczy rakiety i nie zabija pilota. Działa na świat poza PACE albo daje Korektę, którą gracz stosuje w KSP sam.

**Bierność w dylematach** (odpowiedź autora: „bycie biernym kosztuje, ale czasami może być wskazane”). Opcja domyślna to zwykle „nie angażować się”. Wybrana świadomie bywa najrozsądniejsza i nic nie kosztuje poza własnymi skutkami. Przegapiony termin dolicza `inactionEffects`: Dowódca, który nie czyta teczek, traci Kapitał Polityczny, Spójność albo życzliwość frakcji.

## 5. Warunki

Warunek to obiekt YAML z jednym kluczem, który wyznacza jego rodzaj:

```yaml
conditions:
  all:
    - { after: 1953-Q1 }                          # od kwartału włącznie
    - { before: 1960-Q1 }                         # przed kwartałem
    - { var: popyt_na_rope, op: '>=', value: 6 }
    - { indicator: WF, op: '<=', value: 50 }
    - { divergence: bliski_wschod, op: '>', value: 2 }
    - { flag: iran_zamach }
    - { stage: abadan.rafineria }                 # wątek przeszedł etap
    - { branch: abadan.rafineria.buccaneer }      # w etapie wypadła ta gałąź
    - any: [ … ]
    - not: { … }
```

Modyfikatory wag i szans używają tych samych warunków: `{ when: <warunek>, mul: 2 }` albo `add: 1`.

## 6. Co widzi gracz (zasada Z4)

| Warstwa faktyczna (`GameState.world`) | Widok gracza (`toPlayerView`) |
|---|---|
| Zmienne świata, Rozbieżność, flagi | — |
| Instancje wątków, etapy, historia gałęzi | — |
| Informacja, czy gałąź była historyczna | — |
| Wpisy dziennika publiczne | `worldNews`: kwartał, rodzaj, tytuł, tekst |
| Wpisy dziennika tajne (`visibility: secret`) | — (np. kradzież dokumentacji: wie BAS, nie Anderson) |
| Oczekujące dylematy | `pendingDilemmas`: tytuł, treść, opcje, termin. **Bez** opcji domyślnej |
| Korekty | — (trafią do raportu budżetowego w fazie 1D) |

Test `Z4` symuluje świat z tajnymi wpisami i sprawdza, że żaden tajny tekst, zmienna ani znacznik historii nie trafia do widoku.

Gracz nie dostaje znacznika „to się zdarzyło naprawdę”. Pozna go z wiedzy historycznej albo wcale. To celowe: Anderson żyje w 1951 roku i nie zna przyszłości.

## 7. Jak pisać treść

**Nowy wątek historyczny** (jeden plik w `data/events/threads/`):

```yaml
id: suez
title: Kryzys sueski
kind: historical          # albo anchor: jedna gałąź w każdym etapie
region: bliski_wschod
summary: Jedno–dwa zdania dla Mistrza Gry.
historicalNote: Co i kiedy stało się naprawdę (z datami, do weryfikacji).
drivers: [sila_wielkiej_brytanii, zaangazowanie_usa]
start: { from: 1956-Q1, conditions: { not: { flag: abadan_wojna } } }
stages:
  - id: nacjonalizacja
    title: nacjonalizacja kanału
    at: 1956-Q3
    branches:
      - id: historyczna
        title: …
        historical: true
        weight: 10
        effects: [ … ]
        text: Tekst depeszy po polsku, w czasie teraźniejszym.
      - id: inna
        title: …
        weight: 2
        modifiers: [ { when: { var: sila_wielkiej_brytanii, op: '>=', value: 7 }, mul: 2 } ]
        next: wojna            # do etapu alternatywnego tylko przez next
        text: …
```

**Zasady pisania:**
- Etap historyczny ma `at` i dokładnie jedną gałąź `historical: true`. Etap alternatywny (`alternative: true`) nie ma gałęzi historycznej.
- Szablony używają `offset` (kwartały od startu), nie `at`. Parametry wstawia się do tekstów jako `{kraj}`. Polszczyzna wymaga odmiany, więc wartość może mieć formy: `{ mian: Kuwejt, dop: Kuwejtu, miejsc: Kuwejcie }`, a tekst używa `{kraj.dop}` („ropa z Kuwejtu”) albo `{kraj.miejsc}` („w Kuwejcie”). Walidacja sprawdza, czy każda wartość ma użytą formę.
- Co najmniej jedna gałąź etapu nie może mieć `requires`, żeby etap zawsze się rozstrzygnął.
- Teksty piszemy jak depesze: konkretnie, bez oceny, w czasie teraźniejszym.
- Prawdziwe osoby: żadnych wymyślonych przestępstw. Brudne sprawy przypisujemy postaciom fikcyjnym albo instytucjom.
- Wagi: gałąź historyczna 10, alternatywy 1–3. Silnik i tak daje historii ×3 przy Rozbieżności 0.

`npm run dse -- waliduj` sprawdza odwołania, regiony, zmienne, frakcje, parametry, gałęzie historyczne i kotwice. Wszystkie błędy zbiera naraz, z nazwą pliku.

## 8. Narzędzie: `dse swiat`

```bash
npm run dse -- swiat                              # lata 1951–1960, tak jak widzi je Anderson
npm run dse -- swiat --prawda                     # z tajnymi wpisami, znacznikami historii i stanem świata
npm run dse -- swiat --ziarno PACE-2 --do 1955-Q4 --decyzje losowe
npm run dse -- swiat --serie 300                  # statystyka 300 światów do strojenia wag
```

**Wynik serii 300 symulacji (1951–1960) dla obecnej treści:**
- w całości zgodny z historią był co czwarty świat (27% w serii 1000);
- najczęstsze rozejście: wybory 1952 i maccartyzm (Rozbieżność USA średnio 0,74);
- plan Buccaneer wykonano w 7% światów;
- kryzys naftowy z szablonu pojawił się średnio 0,8 raza na dekadę;
- suma Korekt budżetu wyniosła średnio −5,9 jednostki na dekadę.

Im więcej wątków, tym rzadszy świat w pełni historyczny: przy 12 etapach na dekadę prawie każda kampania gdzieś odjedzie. Jeśli to za dużo, podnosimy `HISTORICAL_BIAS_AT_ZERO` (np. do 5).

## 9. Treść w wersji 1

| Rodzaj | Pozycje |
|---|---|
| Wątki | Wojna w Korei (1951–1953), Kryzys irański (1951–1953), Maccartyzm (1952–1954), Wybory prezydenckie 1952 (z dziewięcioma kandydatami na wiceprezydenta) |
| Szablony | Kryzys naftowy (5 krajów), Kryzys walutowy sojusznika (3 kraje) |
| Wzorce (17) | strajk u dostawcy, drenaż mózgów, nowy rocznik inżynierów, zimny lut, wybuch na stanowisku, przełom w tunelu, grypa, wizyta dygnitarza, weto Francji, przeciek do prasy, przesłuchanie w sprawie kosztów, wojna podjazdowa Służb, incydent rozpoznawczy, kradzież dokumentacji (tajna), fala UFO, boom SF, zmęczenie płaceniem za Europę |
| Dylematy (4) | Lotnictwo kontra NACA, maszyna licząca, fundusz transatlantycki, uciekinier ze Wschodu |
| Zmienne (8) | koniunktura, pula kadr, popyt na ropę, siła Wielkiej Brytanii, zaangażowanie USA, gorączka antykomunistyczna, napięcie w Korei, presja wyścigu |

Źródło: plik wydarzeń autora z 1951 roku. Klasyfikacja 80 wydarzeń jest w `docs/research/analiza-pliku-wydarzen-1951.md`.

## 10. Czego jeszcze nie ma

- **Narratora.** Wpisy dziennika są gotowe do opisania przez AI (Plan Budowy v3, plaster 5), ale teksty z YAML wystarczają do gry.
- **Powiązań z Rejestrem.** Decyzja nie tworzy jeszcze wpisu Rejestru (Długu, Urazy). Potrzebny osobny skutek `registry` (plaster 2).
- **Palet epok** dla wzorców (Dossier III, część V).
- **Postaci tła poza kadrem** (decyzja 0013): osobny system, który może korzystać z tych samych warunków.

Pętla tury i Korekty w budżecie, których brakowało w wersji 1, są wdrożone (punkt 12).

## 11. Odpowiedzi autora (7.11.2026)

1. **Siła historii:** zostaje (`HISTORICAL_BIAS_AT_ZERO = 3`).
2. **Wiceprezydent 1952:** etap przeniesiony na konwencję (1952-Q3). Nixon jest gałęzią historyczną. Alternatywy: Henry Cabot Lodge Jr., William F. Knowland, Harold Stassen, Earl Warren, Alfred E. Driscoll, Dan Thornton, Arthur Langlie i Margaret Chase Smith jako zwrot akcji (ok. 1%). Każdy kandydat ustawia flagę `vp_<nazwisko>`. Lodge, Knowland i Smith mają też skutki (zaangażowanie USA, gorączka antykomunistyczna, koniec maccartyzmu).
3. **Kolejne wątki:** autor chce kilkanaście więcej. Podział czasu na epoki opisuje decyzja kolejnej rundy (do ustalenia).
4. **Bierność:** kosztuje, ale bywa wskazana. Wdrożone jako `inactionEffects` (punkt 4).

Poprawki po serii symulacji:
- po wycofaniu Brytyjczyków z Abadanu wątek wraca do etapu „los Mosaddegha”;
- nowy wzorzec „nowy rocznik inżynierów” równoważy drenaż mózgów, który wcześniej potrafił wyzerować pulę kadr.

## 12. Wersja 2: wątki głębokie i pętla kwartału (11.11.2026, decyzja 0017)

Standard wątku głębokiego z Dossier III (część VII) jest wdrożony w silniku i w treści na lata 1951–1955.

**Nowe pola etapu:**

| Pole | Znaczenie |
|---|---|
| `anchor: true` | Etap-kotwica: jedna gałąź historyczna, bez decyzji |
| `sameQuarter: true` | Depesza w tym samym kwartale co poprzedni etap (nie na pierwszym etapie) |
| `rumor` | Pogłoska wywiadu `quartersBefore` kwartałów przed etapem; trafia do Ocen wywiadowczych z kodem wiarygodności |
| `decision` | Sprawa do decyzji Andersona przed etapem. Opcje mają `effects` i `weights`, które przesuwają wagi gałęzi tego samego etapu (`mul`, `add`). Bez decyzji: `defaultOption` i `inactionEffects` |

**Nowe pola gałęzi:**

| Pole | Znaczenie |
|---|---|
| `kind` | Rodzaj gałęzi: `H`, `P`, `O`, `X`, `A`. Walidator sprawdza zgodność z mechaniką (na przykład `O` wymaga `delayQuarters`) |
| `minor: true` | Wariant szczegółu: niehistoryczny, ale bez wzrostu Rozbieżności |
| `reactions` | Reakcje stron jako osobne wpisy dziennika (`actor`, `text`, `effects`) |
| `ongoing` | Sytuacja trwająca: skutki co kwartał od następnego kwartału, do etapu `until` albo przez `maxQuarters` |

**Wątki-echa** (`kind: reactive`) nie mają dat. Startują, gdy spełnią się `start.conditions` (zwykle flaga ustawiona przez inny wątek), a ich etapy liczą czas przez `offset`.

**Kolejność w kwartale** (`advanceWorld`): dylematy po terminie → start wątków → szablony → sytuacje trwające → etapy wątków (pogłoska, decyzja, rozstrzygnięcie, reakcje, sytuacja) → wzorce → dylematy samodzielne. Limit oczekujących dylematów (`maxPendingDilemmas`) liczy tylko dylematy samodzielne; decyzje etapów przychodzą zawsze.

**Etap bez dostępnej gałęzi** (wszystkie mają niespełnione `requires`) jest pomijany bez wpisu.

**Bezpieczniki szablonów:** `historicalInstances` (szablon nie losuje kraju, który ma własny wątek historyczny) i `exclusiveGroup` (jedna instancja z grupy naraz).

**Treść w wersji 2:** 24 wątki 1951–1955, 15 zmiennych świata, 35 wzorców, 6 dylematów. Lista wątków: `data/events/threads/`.

**Strojenie:** `npm run dse -- swiat --serie 300 --do 1955-Q4 --decyzje losowe` pokazuje częstości gałęzi. W serii 300 kampanii z 11.11.2026 gałąź historyczna wygrywa w większości etapów w ponad 90% przypadków, ale etapów jest tyle, że żadna kampania nie przebiegła w całości zgodnie z historią: w każdej coś poszło inaczej.

