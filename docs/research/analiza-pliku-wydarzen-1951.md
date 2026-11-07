# Wydarzenia świata: analiza Twojego pliku i model „żyjącej historii”

*The Deep State Engine · Intermarium History · wersja 1, 5.11.2026 · materiał do dyskusji*

## 1. Ocena ogólna

W pliku jest 80 numerowanych wydarzeń w pięciu kategoriach, pięć łańcuchów (A–E) i lista około 45 prawdziwych wydarzeń z 1951 roku z wpływem na „mnożniki”. To bardzo dobry surowiec, bo jest gęsty w realia epoki: strajki, maccartyzm, Korea, Paperclip, przecieki, weta sojuszników, przesłuchania w Kongresie o kosztach. Dużo z tego wpisuje się wprost w systemy, które już mamy (Rejestr, frakcje, Rada Atlantycka, Przemysł).

Do przerobienia są trzy rzeczy:

1. **Mnożniki.** Plik ma ich jedenaście (PR, CA, PS, PSR, RP, IC, EC, IO, PSI, DU, PEL). GDD ma pięć wskaźników na ekranie (zasada Z6). Większość mnożników da się przypisać do tego, co już jest, a dwa warto zachować jako ukryte zmienne świata (punkt 4).
2. **Wydarzenia nie mogą fabrykować faktów w KSP.** Na przykład nr 29 („utrata prototypu w KSP”) i nr 49 („test pilotażowy kończy się wypadkiem”). DSE nie może zniszczyć Ci samolotu ani zabić pilota, bo w KSP to się nie wydarzyło. Wydarzenie może tylko reagować na prawdziwy wypadek z dziennika kariery albo dotyczyć świata poza PACE (program Douglasa, nie Twój).
3. **Anachronizmy i stare nazwy:** NA-AXO, NASA i NRO w 1951 roku, kilka dat (punkt 5).

Twoja propozycja, że część wydarzeń się odbędzie, część opóźni, a część nie wydarzy się wcale, pasuje do decyzji z G3. Proponuję dla niej konkretny model.

## 2. Trzy rodzaje wydarzeń

| Rodzaj | Co to jest | Przykłady z Twojego pliku | Jak działa w silniku |
|---|---|---|---|
| **Wątek świata** | Duży, wieloetapowy proces historyczny, który biegnie przez wiele kwartałów i ma rozgałęzienia | Korea (A, 3, 11, 14, 75), Abadan, maccartyzm (B, 52), Plan Marshalla (13, 17, E), rozszerzenie sojuszu (C), testy atomowe (D, 46, 51), Indochiny (74) | Punkty kontrolne co kwartał. Silnik wybiera gałąź według wag zależnych od stanu świata i działań PACE (punkt 3) |
| **Wzorzec** | Zdarzenie powtarzalne bez daty, z warunkami uruchomienia | Strajk (1, 7, 10), drenaż mózgów (4), „zimny lut” (21), wybuch na stanowisku (23, 36), grypa (44), wizyta dygnitarza (58), weto Francji (54) | Wyzwalacz ze stanu (np. firma ma niską kondycję, PACE używa dużo jej części). Prawdopodobieństwo z ziarnem losowania |
| **Dylemat** | Wydarzenie, które wymaga Twojej decyzji | Lotnictwo kontra NACA (9), zakup komputera (15), fundusz transatlantycki (20), Andøya (35), ucieczka naukowca (72) | Karta decyzji na Biurku z kosztami opcji (zasada Z1) |

To ta sama architektura co w GDD 23: wyzwalacz, szablon, wypełnienie przez silnik, opis przez AI, decyzja i skutki. Wątek świata to po prostu łańcuch szablonów z rozgałęzieniami.

## 3. Model wątku świata

**Budowa wątku:**
- **Linia historyczna.** Co się naprawdę wydarzyło, z datami. To punkt odniesienia, nie scenariusz.
- **Siły napędowe.** Zmienne stanu świata, które przesuwają wagi gałęzi, np. siła Wielkiej Brytanii, zaangażowanie USA, popyt na ropę, Napięcie Geopolityczne (NG).
- **Punkty kontrolne.** Kwartały, w których wątek może skręcić.
- **Gałęzie.** Wariant historyczny, przyspieszony, opóźniony, przerwany i alternatywny. Każdy ma warunki i wagę.
- **Haki dla PACE.** Akcje, którymi Anderson może przesunąć wagi, np. operacja BAS, stanowisko Rady Atlantyckiej, przekazanie sprzętu.
- **Skutki dla gry.** Wszystko musi przejść test trzech dróg (Z2): wpływa na KSP (Korekty, koszty, dźwignie), na stan polityczny albo na zakończenie gry.

**Kto wybiera gałąź?** Silnik, nie AI (Z3). Waga gałęzi to funkcja sił napędowych, a sam wybór to rzut z zapisanym ziarnem, więc wynik jest powtarzalny. AI tylko opisuje to, co silnik ustalił, na przykład w depeszy ambasady, artykule czy raporcie BAS.

**Bezwładność i rozbieżność.** Proponuję jedną ukrytą zmienną na wątek albo region: **Rozbieżność**.
- W 1951 roku świat jest bardzo bliski historii, a gałęzie historyczne mają dużą wagę.
- Każda zmiana, którą PACE wprowadza w świecie (inny wynik operacji, inny kontrakt, wcześniejszy satelita), podnosi Rozbieżność w powiązanych wątkach.
- Im większa Rozbieżność, tym większa waga gałęzi niehistorycznych.

Świat, który już się zmienił, zmienia się dalej, a świat, którego nie ruszałeś, płynie blisko historii. Wymaga to od Ciebie sporo uwagi, ale wynik jest logiczny.

**Kotwice twarde.** Kilka rzeczy jest ustalonych na stałe i silnik ich nie losuje:
- pre-lore sprzed 1951 roku;
- zwycięstwo Eisenhowera w 1952 roku (niepewni są wiceprezydent i dokładne wyniki);
- do 1960 roku prezydenci są wyłącznie prawdziwi;
- w 1964 roku fikcyjni kandydaci startują, a wygrywa prawdziwy;
- od 1968 roku może wygrać postać fikcyjna.

## 4. Mnożniki z pliku a wskaźniki DSE

| Mnożnik z pliku | Odpowiednik w DSE | Uwagi |
|---|---|---|
| PR, Presidential Ratio | **ZW** (Zaufanie Waszyngtonu), relacja z Białym Domem | |
| CA, Congress Approval | **ZW** i nastawienie komisji Kongresu w Sesji Budżetowej | Kongres jako aktor w Wnioskach i budżecie |
| PS, Public Support | **PP** (Poparcie Publiczne) | |
| PSR, Public Scandal Risk | **WF** (Wiarygodność Fasady) i **Ciśnienie** w Rejestrze | Skandal to Tajemnica, która wychodzi na jaw |
| RP, Race Pressure | **Bilans Wyścigu** i **NG** (Napięcie Geopolityczne) | |
| IC, International Cooperation | Nastawienie państw w Radzie Atlantyckiej | Bez nowego wskaźnika na ekranie |
| DU, Dual Use | **WF** i zainteresowanie DPO (Dyrektoriat Programów Obronnych) | Wojskowe zastosowanie cywilnego programu |
| PSI, Project Success Index | Niepotrzebny | Sukces programów mierzy samo RP-1: starty, awarie, kontrakty z dziennika kariery |
| **EC, Economic Climate** | **Nowa ukryta zmienna: Koniunktura** | Wpływa na wielkość budżetu, ceny w przetargach i Korekty („paliwo drożeje”) |
| **IO, Industrial Output** | **Kondycja firm** w Przemyśle | Już ją mamy w modelu przemysłu |
| **PEL, Public Education Level** | **Nowa ukryta zmienna: Pula kadr** | Długoterminowa: koszt i dostępność inżynierów, ryzyko drenażu mózgów |

Na ekranie zostaje pięć wskaźników, zgodnie z Z6. Dochodzą dwie zmienne świata (Koniunktura i Pula kadr), które widzisz tylko pośrednio, w raportach i cenach.

## 5. Uwagi do poszczególnych pozycji

Typ: **W** = wątek świata, **Wz** = wzorzec, **Dy** = dylemat.

**Ekonomiczne**

| Nr | Wydarzenie | Typ | Uwagi |
|---|---|---|---|
| 1 | Strajk stalowy | Wz, możliwy W | Prawdziwy wzorzec: wielki strajk stalowy z 1952 roku i próba przejęcia hut przez Trumana. Może być wątkiem na lata 1952–53 |
| 2 | Kryzys funta | Wz | Brytyjskie kryzysy walutowe były realne. Skutek: składka Wielkiej Brytanii w Radzie Atlantyckiej |
| 3, 11, 14 | Inflacja, ceny metali | W (Korea) | Trzy pozycje o tym samym. Proponuję połączyć w jeden etap wątku koreańskiego |
| 4 | Drenaż mózgów | Wz | Kluczowy. Łączy się z Przemysłem (firmy podkupują ludzi PACE) i z Pulą kadr |
| 5 | Niedobór metali ziem rzadkich | Wz, do zmiany | Pozycja niedokończona. „Metale ziem rzadkich” to problem późniejszych dekad. W 1951 roku realne były niedobory kobaltu, niklu i tytanu przez wojnę w Korei **[do sprawdzenia]** |
| 6, 8 | Obligacje, nadwyżka | Wz | Korekta dodatnia. Dobre na uspokojenie po złym kwartale |
| 7 | Strajk dokerów | Wz | Opóźnia dostawy europejskich firm |
| 9 | Lotnictwo kontra NACA | Dy | Bardzo dobry dylemat. XF-104 to anachronizm w 1951 roku (kontrakt z 1953) **[do sprawdzenia]**, więc lepiej ogólnie: „nowy przechwytujący” |
| 10 | Kontraktor wstrzymuje pracę | Wz | Przemysł. Konkretna firma z kondycją i portfelem |
| 12 | Projekt „what-if” od Columbia Aviation | Wz | Wzorzec propozycji niezamówionej. Columbia jest teraz w tle, więc lepiej dowolna firma z niską kondycją, która szuka szansy |
| 13, 17 | Plan Marshalla | W | Realne: Plan Marshalla kończy się w 1951 roku i zastępuje go pomoc wojskowa |
| 15 | Zakup komputera | Dy | Realne: UNIVAC I w 1951 roku. Łączy się z Hale & Ross |
| 16 | Odbudowa RFN | W | Wiąże się z budzeniem się niemieckich firm w 1955 roku |
| 18 | Strajki GM i Forda przeciw militaryzacji | Wz, do zmiany | Motyw mało wiarygodny: związki samochodowe strajkowały o płace, nie przeciw zbrojeniom. Lepiej: strajk płacowy w zakładach zbrojeniowych Midland General |
| 19 | Kryzys jena, dewaluacja | Wz, do zmiany | Anachronizm: w systemie z Bretton Woods jen miał w latach 1949–1971 stały kurs 360 za dolara. Lepiej: recesja po końcu koniunktury koreańskiej **[do sprawdzenia]** |
| 20 | Fundusz transatlantycki | Dy | Dobry dylemat dla Rady Atlantyckiej |

**Techniczne**

| Nr | Wydarzenie | Typ | Uwagi |
|---|---|---|---|
| 21 | „Zimny lut” | Wz | Arroyo Instruments |
| 22 | Przełom w tunelu (reguła pól) | Wz z warunkiem | Odkrycie Whitcomba to 1952 rok, publikacja 1955. Nie wcześniej niż 1952 |
| 23, 36 | Wybuch na stanowisku | Wz | DOI. Nr 36 ma ofiary, więc wymaga ostrożnego tonu. Dotyczy firmy, nie PACE |
| 24, 25, 27, 30, 33 | Błąd w tablicach, synergia, stop, delta, telemetria | Wz | Dobre drobne wydarzenia naukowe dla RN |
| 26 | Awaria UNIVAC | Wz z warunkiem | Tylko jeśli PACE ma komputer (nr 15) |
| 28 | Kradzież własności intelektualnej | Wz | BAS. Łączy się z Rejestrem (Tajemnica) |
| 29 | Awaria Douglas X-3 | Wz, do zmiany | Nie „utrata prototypu w KSP”. Wydarzenie dotyczy programu Douglasa w świecie albo reaguje na Twoją prawdziwą awarię z dziennika |
| 31 | Radzieckie rakiety „Zaria” | Wywiad | Ocena wywiadowcza z modelu ZSRR |
| 32 | Wybuch przy separacji Derwent | Wz z warunkiem | Program z Biblii. Tylko jeśli ten program istnieje w Twojej karierze |
| 34 | U-2 | Wz z warunkiem | W 1951 roku za wcześnie: U-2 zatwierdzono pod koniec 1954. Wzorzec „Lockheed i BAS potrzebują samolotu rozpoznawczego” z warunkiem. NRO zamieniamy na CIA albo BAS, a ARDC na CARC (DD 8.1) |
| 35 | Baza Andøya | Dy | Z Biblii, dobre |
| 37 | Kapsuła Avionique Parisienne | Wz | Propozycja do puli pomysłów |

**Społeczne**

| Nr | Wydarzenie | Typ | Uwagi |
|---|---|---|---|
| 38 | Latające talerze | W z datą | Realna fala obserwacji nad Waszyngtonem to lipiec 1952 roku |
| 40 | Boom science fiction | Wz | Realne: „Destination Moon” (1950). Zamiast „programów NASA”: PACE |
| 41 | Bohater mediów | Wz | Łączy się z klasami pilotów |
| 45 | Skandal obyczajowy | Wz | Wyłącznie postacie fikcyjne |
| 46, 51 | Atomowa gorączka, lęk przed skażeniem | W (atom) | „Atom dla pokoju” to 1953 rok, a duże obawy o opad radioaktywny przychodzą po 1954 |
| 47 | Entuzjazm w Londynie i Paryżu | Jednorazowe | Start kampanii |
| 48 | Dofinansowanie STEM | Wz, do zmiany | „STEM” to termin z XXI wieku. Historycznie: ustawa o kształceniu dla obrony narodowej (NDEA) z 1958 roku, po Sputniku. Warunek: szok wyścigu |
| 49 | Wypadek pilota | Wz, do zmiany | Tylko jako reakcja na prawdziwy wypadek w KSP |
| 39, 42, 43, 44, 50 | Pacyfiści, krytyka religijna, kampania edukacyjna, grypa, pokazy lotnicze | Wz | Drobne, dobre |

**Polityczne**

| Nr | Wydarzenie | Typ | Uwagi |
|---|---|---|---|
| 52 | Maccartyzm | W | Realny wątek 1950–1954. Prawdziwa osoba w zewnętrznym pierścieniu, z udokumentowanymi metodami |
| 55 | Izolacjoniści w Kongresie | W | Realne skrzydło Tafta, później spór o poprawkę Brickera |
| 57 | Wojna podjazdowa Lotnictwa i Marynarki | Wz | Realny precedens: „bunt admirałów” z 1949 roku. Gotowe dla DPO |
| 63 | Przesłuchanie w sprawie kosztów X-Plane | Wz | Łączy się z Wnioskami i z trybami przesłuchań |
| 64 | Komisja ujawnia wydatki ARDC | Wz | ARDC zamieniamy na CARC (DD 8.1) |
| 67 | Przesłuchania niemieckich naukowców | Wz | Hak BAS na Brandta. Bardzo dobre |
| 53, 54, 56, 58, 59, 60, 61, 62, 65, 66 | Pozostałe | Wz | Dobre. Rezolucja ONZ (60) ma realny sens dopiero po 1957 roku |

**Militarne**

| Nr | Wydarzenie | Typ | Uwagi |
|---|---|---|---|
| 68, 78 | Zestrzelenia i przechwycenia samolotów rozpoznawczych | Wz | Realny wzorzec: incydenty z lat 50. nad Bałtykiem i Morzem Japońskim |
| 69 | „Broken Arrow” | Wz | Realny wzorzec wypadków z bronią jądrową |
| 70 | Radziecki bombowiec nad Alaską | Wz | „Rzut kostką” to po prostu losowanie silnika z ziarnem |
| 74 | Indochiny | W | Realna wojna francuska 1946–1954 |
| 75 | Operacja Ripper | W (Korea) | Realna, marzec 1951 |
| 76 | „NRO żąda lotu” | Wz, do zmiany | NRO powstało w 1961 roku. Zamieniamy na BAS albo CIA |
| 79 | Japoński transport wysadzony w porcie | Wz | „Interkosmos” to w Twoim świecie radziecki odpowiednik PACE, więc nazwa jest w porządku. Warto jednak wiedzieć, że prawdziwy program Interkosmos powstał w 1967 roku i AI może je mieszać |
| 71, 72, 73, 77, 80 | Pozostałe | Wz | Dobre. Nr 73 (zaginiony prototyp) tylko jako reakcja na prawdziwą stratę w KSP |

**Prawdziwe wydarzenia z 1951 roku z listy mnożników.** Większość daje się zweryfikować:
- dymisja MacArthura;
- operacja Ripper;
- ucieczka Burgessa i Macleana z „piątki z Cambridge”;
- nacjonalizacja ropy w Iranie;
- wyrok w sprawie Rosenbergów;
- UNIVAC I;
- traktat paryski (Europejska Wspólnota Węgla i Stali);
- operacja Greenhouse (testy jądrowe);
- traktat z San Francisco;
- pierwsza transkontynentalna transmisja telewizyjna;
- pierwszy prąd z reaktora EBR-I;
- bitwa o Heartbreak Ridge.

Wszystkie wpisujemy jako kotwice albo etapy wątków, z datą historyczną jako punktem odniesienia. Pozostałe pozycje z tej listy to elementy świata z Biblii: rozszerzenie sojuszu, Skyshield, NORAX, Interkosmos i konsolidacja programów X-Plane.

**Łańcuchy A–E** to gotowe wątki świata albo kryzysy wieloetapowe (GDD 24):

| Łańcuch | Czym jest |
|---|---|
| A. Boom koreański | Wątek świata |
| B. Przesłuchania McCarthy'ego | Kryzys z Hakiem na kadrze |
| C. Rozszerzenie sojuszu | Wątek polityczny Rady Atlantyckiej |
| D. Operacja Greenhouse | Wątek atomowy |
| E. Zmęczenie płaceniem za Europę i rozmowa z Trumanem | Kryzys z ZW |

## 6. Przykład: kryzys irański jako wątek świata

**Linia historyczna** (daty do weryfikacji przy wpisywaniu do danych):
- **Marzec–maj 1951.** Parlament Iranu nacjonalizuje przemysł naftowy, a Mosaddegh zostaje premierem.
- **1951.** Wielka Brytania stosuje embargo i nacisk na morzu. Rząd brytyjski rozważa plan Buccaneer, czyli zbrojne zajęcie rafinerii w Abadanie, ale go nie wykonuje.
- **Jesień 1951.** Brytyjczycy ewakuują Abadan. Rafineria, wtedy jedna z największych na świecie, staje.
- **Sierpień 1953.** Zamach stanu przygotowany przez CIA i brytyjski wywiad (operacja Ajax, po brytyjskiej stronie Boot) obala Mosaddegha.

**Siły napędowe:**
- siła i determinacja Wielkiej Brytanii (gospodarka, rząd, imperialne ambicje);
- zaangażowanie USA (mediacja albo operacja wywiadu);
- popyt na ropę (wojna w Korei);
- siła irańskiej lewicy i postawa ZSRR;
- Rozbieżność regionu.

**Gałęzie:**

| Gałąź | Warunki, które podnoszą jej wagę | Skutek |
|---|---|---|
| **A. Historyczna** | Domyślna przy niskiej Rozbieżności | Embargo, ewakuacja, zamach w 1953. Ropa drożeje na kilka kwartałów |
| **B. „Buccaneer”** (Twój wariant) | Silna Wielka Brytania, wysoki popyt na ropę, słabsza mediacja USA | Brytyjski desant w Abadanie. Wojna w Zatoce, wysokie NG, ostry spór w Radzie Atlantyckiej (Francja i USA przeciw), Wielka Brytania tnie składkę na PACE, bo płaci za wojnę. Ruch ZSRR w modelu przeciwnika |
| **C. Mediacja udana** | Silne zaangażowanie USA, niskie NG | Mosaddegh zostaje, a ropa wraca na rynek wcześniej. Koniunktura lepsza, BAS traci okazję |
| **D. Zwrot na Wschód** | Silna irańska lewica, nieudany zamach | Iran zbliża się do ZSRR. Wysokie NG i nowe Oceny wywiadu. W długim terminie inna mapa świata |
| **E. Opóźniona** | Rząd brytyjski zajęty innym kryzysem | Ten sam przebieg co A, ale później i inaczej rozłożony w czasie |

**Skutki dla DSE** (test trzech dróg):
- **W KSP.** Koniunktura spada, więc rosną ceny paliw. Jako Korekta to dopłata do każdego startu przez kilka kwartałów, bo w RP-1 nie zmieniamy cen. Do tego mniejsza składka brytyjska w budżecie PACE.
- **W polityce.** NG, Rada Atlantycka (weto, spór o finansowanie), BAS (oferta udziału w operacji: Tajemnica z wysokim Ciśnieniem) i DPO (Marynarka chce zadań w Zatoce).
- **Haki dla PACE.** Anderson może:
  - poprzeć mediację przez Radę Atlantycką (koszt w Kapitale Politycznym, KP);
  - przekazać BAS dane rozpoznawcze, jeśli ma samolot wysokościowy, co realnie łączy się z HAERA „Lone Star”;
  - trzymać się z daleka, co jest tanie, ale Waszyngton zapamięta.

Tak samo można rozpisać Koreę, maccartyzm, Indochiny i rozszerzenie sojuszu. Jeden wątek to praca rzędu jednej sesji, a te pięć wystarczy na całą Epokę I.

## 7. Co proponuję dalej

1. **Schemat danych** dla trzech rodzajów wydarzeń, w etapie T1 toru Treść.
2. **Pięć wątków Epoki I** (Korea, Abadan, maccartyzm, sojusz, atom) i **około 40 wzorców** z Twojego pliku, po scaleniu duplikatów i poprawkach z punktu 5.
3. **Weryfikacja dat** wszystkich prawdziwych wydarzeń w etapie T3, tak jak przy dossier.

## Źródła

- [Intervention at Abadan: Plan Buccaneer (James Cable, 1991)](https://readings.com.au/product/9781349119158/intervention-at-abadan-plan-buccaneer--james-cable--1991--9781349119158), książka o brytyjskim planie zajęcia Abadanu w 1951 roku.
- [„The British decide to evacuate”, Evening Sun, 2.10.1951](https://mohammadmossadegh.com/news/evening-sun-baltimore/the-british-decide-to-evacuate/)
- Pozostałe daty pochodzą z mojej wiedzy ogólnej i wymagają sprawdzenia.
