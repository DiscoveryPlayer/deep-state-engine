# 0015 — Wydarzenia świata: mechanizmy zamiast rocznych plików; stan w wersji 2

**Data:** 7.11.2026 · **Status:** przyjęta (zgoda autora z 7.11.2026: „wątki świata, wzorce i dylematy, w tym mechanika Rozbieżności”)

## Kontekst

Autor przygotował plik 80 wydarzeń na rok 1951. Taki plik na każdy rok kampanii (1951–1980) to 30 plików. Do tego roczny plik zakłada, że świat idzie po historii, a decyzja 0013 mówi, że historia jest otwarta.

## Decyzja

1. Treść wydarzeń opisuje **mechanizmy**: wątki świata (etapy i gałęzie), etapy alternatywne, kotwice, szablony wątków, wzorce i dylematy. Silnik składa z nich kolejne kwartały. Szczegóły: [docs/design/wydarzenia-swiata.md](../design/wydarzenia-swiata.md).
2. **Rozbieżność** regionu (0–10) zmienia wagi gałęzi:
   - historycznej × (1 + 2·(1 − D/10)),
   - niehistorycznej × (1 + 0,15·D).

   Wybór gałęzi niehistorycznej w etapie z gałęzią historyczną podnosi Rozbieżność regionu o 1.
3. Warunki i skutki są strukturalne (YAML + zod). Treść nie zawiera wyrażeń do parsowania ani kodu do wykonania.
4. Gałąź wybiera silnik przez `Rng` z ziarnem (zasady Z3 i GDD 33.3). AI tylko opisuje wynik.
5. Stan świata jest ukryty. Do gracza trafiają wyłącznie publiczne wpisy dziennika i oczekujące dylematy, bez opcji domyślnej (zasada Z4).
6. Wydarzenie świata nie tworzy faktów w KSP. Działa na świat poza PACE albo daje Korektę budżetu (decyzja 0012).
7. Dylemat bez decyzji Andersona rozstrzyga się po terminie opcją domyślną, a silnik dolicza koszt bierności (`inactionEffects`). Świadomy wybór tej samej opcji kosztu bierności nie ponosi.

## Stan kampanii: wersja 2

- `STATE_SCHEMA_VERSION` = 2. Nowe pole `world`: zmienne, Rozbieżność, flagi, instancje wątków, liczniki wzorców, szablonów i dylematów, oczekujące dylematy, Korekty, dziennik, licznik identyfikatorów.
- **Migracja 1 → 2** (`state/migrate.ts`): dodaje pusty stan świata. Zmienne i regiony uzupełnia silnik z treści przy pierwszym kwartale (`ensureWorldState`). Odczyt stanu zawsze przechodzi przez `migrateState`. Plik z wersją nowszą niż silnik daje czytelny błąd.
- Każde kolejne podniesienie wersji dopisuje krok do `STEPS` i test.

## Konsekwencje

- Treść rośnie przez dopisywanie wątków i wzorców, nie lat. Jeden wątek obsługuje zarówno świat historyczny, jak i alternatywny.
- Strojenie odbywa się liczbowo: `dse swiat --serie N` pokazuje rozkład gałęzi, wzorców i Rozbieżności.
- Plik wydarzeń 1951 zostaje materiałem źródłowym (`docs/research/analiza-pliku-wydarzen-1951.md`), a nie treścią gry.
- Otwarte: skutek tworzący wpis Rejestru, podłączenie `advanceWorld` do pętli tury (faza 1D), Korekty w raporcie budżetowym.
