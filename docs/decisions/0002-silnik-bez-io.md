# 0002 — Silnik bez dostępu do plików, sieci, KSP i AI

**Data:** 26.10.2026 · **Status:** przyjęta

**Decyzja.** `@dse/core` jest czystą biblioteką: dostaje treść, Migawkę i decyzje, a zwraca stan i zdarzenia. Pliki obsługują `content` i `ksp-bridge`, modele AI obsługuje `narrator`. Losowość idzie wyłącznie przez `Rng` z ziarnem, którego stan jest częścią stanu gry.

**Uzasadnienie.** Testowalność w sekundach, determinizm (GDD 33.3), zmiana wersji RP-1 albo modelu AI bez dotykania reguł gry.
