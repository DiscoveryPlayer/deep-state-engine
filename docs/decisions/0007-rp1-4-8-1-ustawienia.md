# 0007 — RP-1 4.8.1, ustawienia trudności i zamrożenie instalacji

**Data:** 7.11.2026 · **Status:** przyjęta (decyzja autora z 27.10 i 5.11.2026) · **Zastępuje:** część [0005](0005-rp1-4-7.md)

## Wersja

RP-1 **4.8.1.0** na KSP 1.12.5, zamrożona na całą kampanię. Parser, dane referencyjne (`data/rp1/`) i mapowania budujemy tylko pod tę wersję. Od 4.8.0 dziennik kariery da się też wyeksportować do JSON.

## Ustawienia trudności (zrzuty ekranu autora z 29.10.2026)

| Grupa | Ustawienie | Wartość |
|---|---|---|
| Ogólne | Cofanie lotów, szybkie zapisy | włączone |
| Ogólne | Inne miejsca startu (opcja KSP) | wyłączone; starty z wielu miejsc działają przez KSCSwitcher |
| Kariera | Fundusze, nauka, reputacja na start | 50 000, 20, 0 |
| Kariera | Nagrody: nauka, fundusze, reputacja | 100%, 105%, 105% |
| Kariera | Kary: fundusze, reputacja; kara za odrzucenie | 100%, 95%; 0 |
| Zaawansowane | **Ujemne fundusze i nauka** | **dozwolone** (wpływa na definicję niewypłacalności w DSE, decyzja 0012) |
| Zaawansowane | Limity ciśnienia i przeciążeń, doświadczenie załóg | włączone |
| CommNet | Sygnał do sterowania, zanik w plazmie, dodatkowe stacje | włączone; mnożniki 1,0 |
| Kerbalism | Awarie części, szansa krytyczna, tryb bezpieczny | włączone, 25%, 50% |
| Kerbalism | Natychmiastowa transmisja i analiza nauki | włączone |
| RP-1 | Confidence, kredyt odblokowań na start | 750, 60 294 |
| RP-1 | Tempo budowy i integracji, tempo badań, tempo kredytu | 1,3; 1,3; 1,0 |
| RP-1 | Szkolenie biegłości, szkolenie misyjne | 0,8; 1,0 |
| RP-1 | Wymagane szkolenia, emerytury, przestój po misji | włączone |

**Fundusze startowe:** w kampanii pilotażowej 50 000. DSE zmierzy „miesiące do zera” po 6 i po 12 miesiącach i na tej podstawie dobierzemy fundusze kampanii właściwej (decyzja 0008).

## Zamrożenie instalacji

- Każdy plik zapisu ma w nagłówku pełną listę wersji modów (`_modVersions`). Parser porównuje ją z listą zamrożoną i zgłasza różnice, więc eksport z CKAN nie jest potrzebny.
- Wersje kluczowe z zapisu testowego: RP0 4.8.1.0, RealismOverhaul 18.0.0, ContractConfigurator 2.13.4, CC_RP0 1.11.0, Kerbalism 3.43.0, KerbalAlarmClock 3.14.2.
- **Układ planetarny to Sol, nie Real Solar System.** Listę miejsc startowych z DD 4.6 trzeba sprawdzić na instalacji autora (lista z KSCSwitcher).

## Starty z wielu miejsc i start kampanii

Bez zmian względem 0005: działają, wchodzą do kanonu, a kampania zawsze zaczyna się 1951-01-01.
