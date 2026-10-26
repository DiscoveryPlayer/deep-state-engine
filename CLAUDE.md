# Instrukcje dla sesji Claude w tym repozytorium

## Zanim zaczniesz

1. Przeczytaj `docs/STATUS.md` — bieżąca faza, następne zadania, otwarte kwestie.
2. Przy pracy nad systemem gry przeczytaj odpowiedni rozdział `docs/gdd/GDD_v1.0.md`
   i sprawdź, czy `docs/gdd/Dokument_Decyzyjny_v1.1.md` go nie zmienia (DD ma pierwszeństwo).
3. Przejrzyj `docs/decisions/`, żeby nie wracać do rozstrzygniętych spraw.

## Po pracy

- Zaktualizuj `docs/STATUS.md`.
- Nowa decyzja techniczna albo projektowa → nowy plik w `docs/decisions/` (kolejny numer).
- `npm run check` musi przechodzić przed commitem.

## Zasady kodu

- `packages/core` nie importuje `node:fs`, `node:net`, `fetch` ani niczego z KSP i AI. Dostaje dane i zwraca dane.
- Losowość wyłącznie przez `Rng` z ziarnem; stan generatora zapisuje się w stanie gry.
- Każda liczba z GDD to dane (`data/*.yaml`) albo nazwana stała z komentarzem o źródle (np. „GDD 7.1”).
- Do interfejsu i do AI dane ze stanu trafiają WYŁĄCZNIE przez `toPlayerView` (zasada Z4).
  Nowe pole stanu domyślnie nie jest widoczne dla gracza.
- Zmiana kształtu stanu → podnieś `STATE_SCHEMA_VERSION` i dopisz decyzję o migracji.
- Identyfikatory w kodzie po angielsku, komentarze, komunikaty i treść gry po polsku (decyzja 0003).
- TypeScript tylko ze składnią wymazywalną (`erasableSyntaxOnly`): bez `enum`, `namespace` i parametrów-właściwości w konstruktorach.
- Testy: `node:test` + `node:assert/strict`, pliki `*/test/**/*.test.ts`.

## Środowisko sandboxa Claude

Rejestr npm jest tu zablokowany przez politykę sieci. Nie próbuj go obchodzić. Zależności
są dostępne lokalnie w `/opt/npm-tools/node_modules` (zod, yaml, tsx, typescript, @types/node).
Jeśli `node_modules` nie istnieje, odtwórz dowiązania:

```bash
mkdir -p node_modules/@dse node_modules/@types node_modules/.bin
for p in zod yaml tsx typescript esbuild get-tsconfig resolve-pkg-maps @esbuild; do
  [ -e /opt/npm-tools/node_modules/$p ] && ln -sfn /opt/npm-tools/node_modules/$p node_modules/$p
done
ln -sfn /opt/npm-tools/node_modules/@types/node node_modules/@types/node
for p in core content ksp-bridge narrator server ui; do ln -sfn ../../packages/$p node_modules/@dse/$p; done
for p in cli sim; do ln -sfn ../../tools/$p node_modules/@dse/$p; done
ln -sfn ../tsx/dist/cli.mjs node_modules/.bin/tsx
ln -sfn ../typescript/bin/tsc node_modules/.bin/tsc
```

Prettier: `node /opt/node22/lib/node_modules/prettier/bin/prettier.cjs --write …`.
Nowej zależności, której nie ma w `/opt/npm-tools`, nie da się tu przetestować. Taką potrzebę
trzeba zgłosić autorowi zamiast dodawać zależność na ślepo.
