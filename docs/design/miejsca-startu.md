# Miejsca startu — lista z instalacji autora i ich miejsce w świecie gry

**Status:** wersja 1 (10.11.2026) · **Źródło:** `LaunchSites.cfg` (KSCSwitcher dla Real Solar System; w paczce Sol działa tak samo, potwierdzone przez autora) · **Decyzja:** [0016](../decisions/0016-odpowiedzi-dossier-iii-miejsca-startu.md) · zastępuje tabelę z Dokumentu Decyzyjnego 4.6

Plik autora zawiera **31 miejsc**. Każde ma w świecie gry jedną z trzech ról:
- **PACE i Zachód:** miejsca, z których gracz może startować, gdy pozwala na to rok i polityka;
- **Blok wschodni i Chiny:** miejsca modelu ZSRR i chińskiego programu. Gracz z nich nie startuje, ale pojawiają się w wywiadzie, w Bilansie i w wątkach;
- **Poza okresem gry:** miejsca, które powstały po 1980 roku. W kampanii nie istnieją.

Daty to pierwsze starty albo uruchomienie poligonu według historii. Przed zapisem do danych gry sprawdzimy je ponownie (pole `historicalNote`).

## 1. PACE i Zachód (15)

| Miejsce (`name`) | Od | Gospodarz w świecie gry | Charakter i wątki |
|---|---|---|---|
| **Cape Canaveral** (`us_cape_canaveral`) | 1950 | PACE, „jasna strona” | Hollywood na Bagnach: prasa, związki, kongresmeni. 150 km od Kuby (A36, B03). Huragany (wzorzec 181) |
| **White Sands** (`us_whitesands`) | 1945 (V-2 od 1946) | DPO, Armia | Nuklearna piaskownica, starty suborbitalne, samoloty doświadczalne |
| **Wallops** (`us_wallops`) | 1945 | RN, NACA | Rakiety sondujące, nauka |
| **Vandenberg** (`us_vandenburg`) | XII 1958 (pierwszy satelita w II 1959) | DPO, BAS | „Czarna Dziura”: orbity polarne i satelity rozpoznawcze (A16, A28) |
| **Omelek / Kwajalein** (`mh_omelek`) | początek lat 60. | DPO (poligon Armii USA) | Odległy atol na Pacyfiku: próby obrony przeciwrakietowej, rakiety sondujące. Dostęp tylko przez DPO |
| **Woomera** (`au_woomera`) | 1947 (LA5 od 1958) | Wielka Brytania i Australia, członek-gospodarz | Brytyjski geniusz bez pieniędzy: Skylark, Black Knight, Blue Streak (A30), Black Arrow (1970–1971). Wątki A06, C08 |
| **Hammaguir** (`dz_hammaguir`) | 1947–1967 | Francja | **Algieria:** wojna (A33), niepodległość i klauzule z Évian (B12). Koniec dostępu w 1967 roku, chyba że świat pójdzie inaczej |
| **Kourou** (`fr_kourou`) | IV 1968 | Francja | Następca Hammaguir. Najlepsza szerokość geograficzna Zachodu. Wybór miejsca w 1964 roku (B12, B13) |
| **Churchill** (`ca_churchill`) | 1956–1957 (Rok Geofizyczny) | Kanada | Arktyka, zorze, łatwe mosty z RN (A21). Kanada jako członek założycielski |
| **Andøya** (`no_andoya`) | VIII 1962 | Norwegia (umowa, nie członek) | Zorze i rakiety sondujące, potem ESRO (B15). **Jest w instalacji autora**, więc korekta DD 4.6, który zakładał, że jej nie ma |
| **Esrange** (`se_esrange`) | XI 1966 | Szwecja, partner | Neutralna Szwecja i nasłuch skierowany na Murmańsk. ESRO (B15) |
| **Uchinoura** (`jp_uchinoura`) | 1962–1963 | Japonia, obserwator | Program naukowy Uniwersytetu Tokijskiego: Kappa, Lambda, Osumi (B21) |
| **Tanegashima** (`jp_tanegashima`) | 1969 | Japonia | Program Sakura i rakiety N (od 1975). Wątki A39, B21 |
| **Sriharikota / Satish Dhawan** (`in_satish_dhawan`) | X 1971 | Indie (możliwy partner) | Tylko przy partnerstwie z Indiami (wzorzec 171, wątek B23) |
| **Palmachim** (`il_palmachim`) | VII 1961 (Shavit 2) | Izrael (możliwy partner) | Rakieta sondująca z 1961 roku. Start na zachód nad Morzem Śródziemnym. Wątki C06, D01 |

## 2. Blok wschodni i Chiny (6)

Gracz z tych miejsc nie startuje. Służą modelowi ZSRR (GDD 15), wywiadowi (GDD 16) i wątkom.

| Miejsce | Od | W grze |
|---|---|---|
| **Bajkonur / Tiuratam** (`kz_baikonur`) | budowa 1955, pierwszy start R-7 V 1957 | Główny kosmodrom ZSRR. U-2 fotografuje go od 1957 roku (A28) i daje Ocenę wywiadowczą |
| **Kapustin Jar** (`ru_kasputin_yar`) | X 1947 | Poligon rakiet i rakiet sondujących; pierwsze radzieckie V-2 |
| **Plesieck** (`ru_plesetsk`) | 1957 (baza R-7), pierwszy start w kosmos III 1966 | Orbity polarne i satelity wojskowe ZSRR |
| **Jasny / Dombarowski** (`ru_yasny`) | lata 60. (baza pocisków) | Tylko jako baza pocisków w ocenach wywiadu. Starty kosmiczne dopiero po 2000 roku |
| **Jiuquan** (`cn_jiuquan`) | 1958, pierwszy start XI 1960 | Chiński program rakietowy: A38, B11, C12 (Dong Fang Hong 1, 1970) |
| **Taiyuan** (`cn_taiyuan`) | założony 1966, działa od 1968 | Chińskie pociski i satelity polarne |

## 3. Poza okresem gry (10)

W kampanii 1951–1980 te miejsca nie istnieją:

| Miejsce | Od |
|---|---|
| Alcântara (`br_alcantara`) | 1983 / 1990 |
| Xichang (`cn_xichang`) | 1984 |
| Wenchang (`cn_wenchang`) | 2014 |
| Semnan (`ir_semnan`) | 2008 |
| Naro (`kr_naro`) | 2009 |
| Mahia (`nz_mahia`) | 2017 |
| Kodiak (`us_kodiak`) | 1998 |
| Brownsville (`us_brownsville`) | lata 2010 |
| Swobodny / Wostocznyj (`ru_svobodny`) | 1996 / 2016 |
| Sohae (`kp_sohae`) | lata 2000 |

## 4. Jak silnik ma z tego korzystać

- **Dostępność to warunek, nie blokada.** DSE nie steruje KSP. Jeśli gracz wystartuje z miejsca, które w świecie gry jeszcze nie istnieje albo zostało utracone, start trafia do **naruszeń zasad uczciwości** (GDD 22). Gra niczego nie cofa.
- **Polityka miejsc.** Każde miejsce zachodnie ma warunek z wątków, np.:
  - Hammaguir: dostęp do 1967 roku albo do gałęzi „bez klauzuli” w B12;
  - Woomera: zależy od stosunków z Australią i Wielką Brytanią;
  - Andøya i Esrange: od zgody Norwegii i Szwecji;
  - Sriharikota i Palmachim: tylko przy partnerstwie.
- **Dane.** W fazie 1C lista trafi do `data/launch-sites.yaml`, ze schematem zod i walidacją: identyfikator z pliku KSCSwitcher, daty, gospodarz, rola, warunki.
- **Do sprawdzenia w fazie 1B (parser zapisu):** czy zapis kariery RP-1 4.8.1 przechowuje miejsce startu każdego lotu (pole pojazdu albo scenariusz KSCSwitchera). Od tego zależy, czy DSE rozpozna miejsce startu automatycznie, czy gracz poda je w raporcie z lotu.
