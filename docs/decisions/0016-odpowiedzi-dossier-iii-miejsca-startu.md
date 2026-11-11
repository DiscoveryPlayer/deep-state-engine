# 0016 — Odpowiedzi do Dossier III, wątki głębokie i miejsca startu

**Data:** 10.11.2026 · **Status:** przyjęta (punkty 1–6 i 8), **propozycja** (punkt 7, czeka na zgodę autora)

## Kontekst

Dossier III (`docs/research/dossier-III-watki-swiata-1951-1980.md`) zadało autorowi 6 pytań. Autor odpowiedział 10.11.2026 i przesłał listę miejsc startu ze swojej instalacji (`LaunchSites.cfg`, KSCSwitcher).

## Decyzje

1. **Brak wojny jądrowej między mocarstwami** to kotwica K12 („raczej wykluczamy”). Gałęzie typu „kryzys kubański → wojna” nie istnieją. Najostrzejsza dopuszczalna alternatywa to wojna ograniczona bez użycia broni jądrowej przeciw mocarstwom.
2. **Kandydaci fikcyjni na prezydenta** (od 1968 roku, K7) to postacie fikcyjne dodane do gry, tak jak piloci. Lista powstanie razem z systemem postaci.
3. **Gałęzie przerwane przy zamachach** (Dallas 1963, rok 1968) są dozwolone. Teksty bez teorii spiskowych.
4. **Wątki polskie** mają zwykłą wagę, bez wyróżnienia. Polska działa w Interkosmosie pod egidą ZSRR. Lot polskiego kosmonauty (historycznie Hermaszewski, 1978) i polska aparatura należą do **modelu ZSRR**, nie do wątków świata.
5. **Nowe zmienne świata:** do 10, o ile silnik je obsłuży. Silnik obsługuje dowolną liczbę zmiennych, bo definiuje je plik `data/events/world.yaml`. Przyjmujemy 8 zmiennych z dossier (część I, punkt 11) z zapasem na kolejne 2.
6. **Lista wątków** z dossier jest przyjęta jako kierunek („wątki bardzo mi się podobają”).
7. **Wątki głębokie** (propozycja w odpowiedzi na uwagę „dane wydarzenie po prostu przeleci”):
   - karty z części II to szkielet;
   - właściwy wątek ma siedem warstw: punkty zwrotne, depesze, sytuacje trwające, reakcje stron, pogłoski wywiadu, punkty decyzyjne i echa;
   - w bloku A to 8–15 etapów na wątek.

   Szczegóły i przykład Suezu: dossier, część VII. Wymaga zmian w silniku (`sameQuarter`, `ongoing`, `reactions`, `rumor`, `decision`, `offset` w wątkach).
8. **Miejsca startu:** obowiązuje lista z instalacji autora (31 miejsc), podzielona na trzy grupy: 15 dla PACE i Zachodu, 6 dla bloku wschodniego i Chin, 10 poza okresem gry. Szczegóły: `docs/design/miejsca-startu.md`.
   - Zastępuje tabelę z Dokumentu Decyzyjnego 4.6, która błędnie zakładała, że Andøi nie ma w RSS.
   - Zastrzeżenie DD 4.6 o startach z kilku odległych miejsc w jednej karierze jest zamknięte: autor potwierdził, że w jego instalacji to działa (KSCSwitcher).
   - Dostępność miejsca to warunek z wątków. Start z miejsca niedostępnego trafia do naruszeń zasad uczciwości (GDD 22) i nie jest blokowany.

## Konsekwencje

- PR silnika obejmie zmiany z dossier (część I, punkt 10) i z części VII.
- Pierwszy wątek głęboki w YAML: Kryzys sueski, sprawdzony serią symulacji.
- Faza 1C: `data/launch-sites.yaml` ze schematem. Faza 1B: sprawdzić, czy zapis RP-1 przechowuje miejsce startu lotu.
