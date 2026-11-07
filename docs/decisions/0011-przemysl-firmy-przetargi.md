# 0011 — Przemysł: firmy, sponsorzy, przetargi i partner strategiczny

**Data:** 7.11.2026 · **Status:** przyjęta (odpowiedzi autora z 1.11, 5.11 i 7.11.2026) · **Szczegóły:** [docs/design/przemysl-firmy-sponsorzy.md](../design/przemysl-firmy-sponsorzy.md)

## Firmy

- Katalog łączy firmy **prawdziwe i fikcyjne** (55 pozycji w wersji 2). Nazwy według klucza epoki, bez kolizji z prawdziwymi firmami i programami.
- **Prawdziwe firmy mogą robić „brudne” rzeczy** zgodnie z historycznymi wzorcami, bo historii nie wybielamy. Występek jest faktem silnika, który AI opisuje w dokumencie świata gry. Winną osobą jest postać fikcyjna, a nie prawdziwy człowiek (reguła dla prawdziwych osób zostaje).
- Firmy z krajów członkowskich wchodzą do głównego nurtu warunkowo, np. jeśli ich kraj zainwestuje. Pomoc PACE tworzy Dług w Rejestrze.

## Poziomy przemysłu

| Poziom | Kto |
|---|---|
| I | Integratorzy, czyli główni wykonawcy |
| II | Dostawcy podsystemów |
| III | Producenci części. Poziom bierny: nigdy nie ogranicza wyboru części |

- Części proceduralne zaliczają się integratorowi z nazwy pojazdu („<Firma> <Oznaczenie> <Nazwa>”), a części nazwane ich producentowi.
- Długotrwała koncentracja dostaw u jednej firmy wywołuje skargę o monopol. Odpowiedzi: uzasadnienie techniczne sprawdzane w danych RP-1, drugie źródło (Korekta) albo zignorowanie skargi.

## Sponsorzy

- Program ma cztery role: sponsor, właściciel, płatnik i wykonawca.
- Program może mieć dwóch sponsorów, a ich udziały **się negocjuje**.
- Programy RP-1 mają kandydatów na sponsora. Sponsor może żądać tempa programu, a Anderson też lobbuje, broniąc Doktryny PACE.

## Przetargi

- Tryby jak w latach 50.:
  - zamówienie u jednej firmy, często po jej własnej propozycji (wzór X-1);
  - konkurs kilku oferentów (wzór X-15);
  - studia wstępne i wybór jednej firmy (wzór Dyna-Soar).

  Tryb wybiera Anderson, a każdy ma koszt polityczny.
- **Cena oferty** ustala wielkość finansowania, o które PACE prosi, i szanse na zgodę. Nie tworzy bezpośrednich Korekt, bo faktyczny koszt pojazdu i tak płaci się w RP-1.

## Partner strategiczny (lider Main Contractor w RP-1)

Kod RP-1 4.8.1 (`StrategyRP0.cs`, `LeadersContractors.cfg`):
- odwołanie lidera kosztuje ułamek bieżącej Reputacji: około 20% od razu, około 13% po roku, około 7% po trzech latach i zero po 10 latach (`removePenaltyDuration`);
- tego samego lidera nie można wybrać ponownie przez rok (`reactivateCooldown`).

Dlatego **lider Main Contractor to wieloletni partner strategiczny PACE**, a przetargi na pojazdy toczą się wyłącznie w meta-grze. Zerwanie partnerstwa kosztuje Reputację w RP-1 i Urazę w meta-grze. Zapasowe wyjścia: zwrot części Reputacji Korektą, gdy zerwanie wymusił świat, albo łatka ModuleManager skracająca okres kary.
