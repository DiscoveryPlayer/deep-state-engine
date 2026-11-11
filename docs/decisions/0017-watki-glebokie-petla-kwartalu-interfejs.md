# 0017 — Wątki głębokie, pętla kwartału, serwer i interfejs

**Data:** 11.11.2026 · **Status:** przyjęta

## Kontekst

Autor zatwierdził kierunek z decyzji 0016 (punkt 7) i poprosił, żeby w jednym kroku powstała wersja, w którą da się grać: silnik, treść na lata 1951–1955, interfejs i Plan Budowy v3. Na pytania większe i mniejsze miałem odpowiadać sam, z poprawkami później. Ten plik zbiera te odpowiedzi w jednym miejscu, żeby autor mógł je przejrzeć i zmienić.

## Decyzje

1. **Wątki głębokie są standardem treści.** Silnik obsługuje:
   - etap-kotwicę (`anchor`), depeszę w tym samym kwartale (`sameQuarter`), pogłoskę wywiadu przed etapem (`rumor`), decyzję Andersona przed etapem (`decision`, z wagami przesuwającymi gałęzie tego samego etapu);
   - w gałęzi: reakcje stron (`reactions`), sytuację trwającą (`ongoing`), rodzaj gałęzi H/P/O/X/A (`kind`);
   - wątki-echa (`kind: reactive`), które startują od flagi;
   - warunek epoki (`era`);
   - bezpieczniki szablonów: `historicalInstances` i `exclusiveGroup`.
2. **Okres grywalny to 1951–1955** (decyzja autora). Treść: 24 wątki, 2 szablony, 35 wzorców, 6 dylematów, 15 zmiennych świata. Zmienna `napiecie_korea` nazywa się teraz `napiecie_azja`, bo obsługuje też Indochiny i Cieśninę Tajwańską.
3. **Gałąź `minor`.** Gałąź niehistoryczna oznaczona `minor: true` zmienia szczegół, a nie bieg historii, i nie podnosi Rozbieżności regionu. Bez tego drobne warianty (inny miesiąc, inne nazwisko w komisji) rozpędzały Rozbieżność.
4. **Etap bez dostępnej gałęzi jest pomijany po cichu.** Reguła walidacji „co najmniej jedna gałąź bez `requires`” została usunięta, bo kolidowała z gałęziami, które się wzajemnie wykluczają (na przykład los Berii zależny od tego, kto przejął władzę).
5. **Stan kampanii w wersji 3**, z migracją 2 → 3. Nowe pola: w instancji wątku `rumors`, `asked`, `decisions`; `world.situations`; `budget.ledger`; `desk` (dziennik akcji, premia po Odpoczynku, wskaźniki z otwarcia kwartału); `reports`; `ksp.snapshots`; `status`. Migracja uzupełnia je wartościami pustymi. Kampanii w wersji 3 poza testami jeszcze nie ma, więc pole `desk.opening` weszło do wersji 3 bez osobnego kroku.
6. **Pętla kwartału.**
   - `beginQuarter` otwiera kwartał: świat generuje wydarzenia, Uwaga Dowódcy wraca do 6 (GDD 6.1) plus premia po Odpoczynku.
   - `closeQuarter` rozlicza: Korekty do księgi, zegary Cierpliwości i eskalację frakcji (GDD 7.1), przepływ PP → ZW (GDD 6.2), dryf PP, bilans lotów, raport, zakończenia (ZW 0: odwołanie; SO 0: rozpad), po czym otwiera następny kwartał.
   - Raport kwartału liczy zmiany **od otwarcia kwartału**, czyli razem z wydarzeniami świata i akcjami Biurka.
   - Akcje Biurka w tej wersji: Spotkanie, Lobbing, Konferencja prasowa, Zlecenie wywiadowcze, Odpoczynek (GDD 10.2). Pozostałe dojdą z systemami, których dotyczą.
   - **Dryf Poparcia Publicznego:** powyżej 55 i poniżej 45 PP wraca o 1 punkt na kwartał ku środkowi. Konferencja prasowa przy PP od 65 w górę daje wynik od −1 do +1. Powód: w symulacji konferencja powtarzana co kwartał dawała PP bliskie 100.
7. **Bilans lotów (reguła tymczasowa).** Przy zamknięciu kwartału silnik porównuje Migawkę KSP z poprzednią: każdy ukończony kontrakt daje PP +1 (najwyżej +3) i raz ZW +1; każda awaria w locie PP −1 (najwyżej −2). To zastępcze połączenie KSP z polityką do czasu Dyrektyw i kart lotów (Plan Budowy v3, plaster 3). Liczby są moje, nie z GDD.
8. **Odczyt zapisów KSP.**
   - Parser formatu ConfigNode i Migawka kariery: fundusze, reputacja, Confidence, nauka, personel, wynagrodzenia, programy, starty, awarie, kontrakty.
   - Czas RP-1 to sekundy od 1.01.1951 według prawdziwego kalendarza.
   - Miejsce startu każdego lotu wynika z identyfikatora kompleksu (`LCID`) i nazwy ośrodka, do którego kompleks należy. To rozstrzyga pytanie z fazy 1B, jak przypisać lot do miejsca.
   - Start z miejsca drugiej strony, spoza okresu gry albo jeszcze niedostępnego trafia do Kroniki jako naruszenie zasad uczciwości (GDD 22). Gra niczego nie blokuje.
   - Zapis można wczytać do 30 dni po końcu kwartału; późniejszy daje ostrzeżenie.
   - Jednostka Korekty przelicza się na fundusze według wynagrodzeń z ostatniej Migawki (decyzja 0012). W trybie Honorowym gracz wpisuje kwotę w KSP i oznacza Korektę jako zastosowaną.
9. **Serwer.** `node:http` bez bibliotek, tylko adres 127.0.0.1, port domyślny 4780. Zabezpieczenia przed obcymi stronami otwartymi w tej samej przeglądarce: kontrola nagłówków `Host` i `Origin`, żądania zmieniające stan tylko jako JSON, polityka CSP bez zewnętrznych źródeł, limit wielkości żądania, walidacja danych wejściowych. Kampanie zapisują się atomowo; przed zamknięciem kwartału powstaje kopia w `campaigns/kopie/`.
10. **Interfejs.** TypeScript i CSS bez bibliotek. Zasady stylu są w Planie Budowy v3 (punkt 4.3): jeden styl przez całą grę (Houston z kolorystyką MAGI), spokój, ustawienia jak w grze, odporność na powiększenie, potwierdzanie działań nieodwracalnych.
    - Odporność na powiększenie zapewniają zapytania kontenerowe liczone w `em`. Powiększenie strony zmniejsza szerokość dostępną w jednostkach tekstu, więc układ przechodzi z trzech kolumn w dwie i w jedną, zamiast się rozlewać.
    - Interfejs buduje `esbuild` w pamięci przy starcie serwera. `esbuild` jest nową zależnością deweloperską; `tsx` i tak go używa.
11. **Uruchamianie.** `npm start` albo plik `Uruchom-DSE.bat` (Windows): sprawdza Node.js, przy pierwszym uruchomieniu pobiera pakiety, startuje serwer i otwiera przeglądarkę.

## Odrzucone

- **Interfejs zmieniający się z epokami** (propozycja Claude): autor chce jednego stylu przez całą grę.
- **React albo inna biblioteka interfejsu:** kolejna zależność i krok budowania, a ekranów jest siedem.
- **Blokowanie startów z niedozwolonych miejsc:** DSE nie steruje KSP (zasada Z1), więc tylko odnotowuje.

## Konsekwencje

- Plan Budowy v3 zastępuje wersje 1.0 i 2.0 i układa dalszą pracę plastrami.
- Skutki `faction … disposition` w gałęziach wydarzeń świata (na przykład po próbie bomby wodorowej) zostały i wymagają przeglądu przy pilotażu.
- Bilans lotów (punkt 7) i liczby dryfu PP (punkt 6) to pierwsi kandydaci do zmiany po pilotażu.
