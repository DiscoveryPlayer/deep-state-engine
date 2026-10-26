# 0001 — TypeScript w całym projekcie, monorepo npm workspaces

**Data:** 26.10.2026 · **Status:** przyjęta

**Kontekst.** GDD 33.2 zakładał Pythona. Interfejs i tak będzie przeglądarkowy, a wcześniejsze szkice autora (Warstwa Personelu) były pisane w kategoriach TS/JS.

**Decyzja.** Cały projekt w TypeScript, w jednym repozytorium z pakietami `core`, `content`, `ksp-bridge`, `narrator`, `server`, `ui` oraz narzędziami `cli` i `sim`. Kod uruchamiamy bez kroku budowania (`tsx`). Testy piszemy na wbudowanym `node:test`.

**Konsekwencje.** Wspólne typy od silnika do ekranu. Silnik działa w przeglądarce i w terminalu, co umożliwia symulator. Autor potrzebuje Node.js LTS.
