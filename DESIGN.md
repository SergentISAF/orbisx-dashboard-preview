# DESIGN.md — UX-designet forklaret

> Dette er hjertet i overdragelsen. Læs den HELE før du implementerer. Skærmenes layout kan kopieres
> fra `.html`-filerne, men det er tankegangen herunder der gør designet godt — den skal overleve
> reimplementeringen. Hvis du er i tvivl under kodning: vælg den løsning der bedst bevarer principperne her.

---

## 1. North star

> **"En kunde åbner OrbisX og forstår på 5 sekunder hvad der bliver skrevet om dem, og hvad de skal gøre."**

Det er hele målestokken. Hver beslutning på skærmen skal kunne forsvares med: gør det dette hurtigere at
forstå for en ikke-teknisk person?

## 2. Hvem bygger vi til

Kommunikations- og presseansvarlige, direktører, marketingfolk i fx kommuner, forsyning, sportsklubber,
partier. **De er ikke teknikere.** De kender ikke ord som "agent", "enhed", "cluster" eller "baseline".
De tænker: *"Hvad skriver pressen om os? Er det positivt? Hvor meget? Skal jeg reagere?"*

## 3. Problemet med det nuværende dashboard (det vi fikser)

1. **Kold, tom start.** Nye brugere mødes af "Ingen virksomhed tilføjet", "Ingen data indlæst" og KPI-kort
   der viser `0`. Det signalerer "tomt/i stykker", ikke "værdifuldt".
2. **Teknisk jargon.** Agenter, enheder, kataloger, samlinger, dækningsvolumen, baseline. Kunden taber
   tråden med det samme.
3. **Tre konkurrerende mentale modeller på én skærm** (Min virksomhed / Sammenlign enheder / Dine agenter)
   uden hierarki. Man ved ikke hvor man skal kigge eller hvad man gør først.
4. **Kerneværdien er begravet.** Det kunden faktisk vil se (deres emner) ligger under to andre koncepter.

## 4. Informationsarkitektur

Fire sektioner, i bevidst rækkefølge fra "hvad sker der" til "gør noget ved det":

| # | Sektion | Brugerens spørgsmål |
|---|---------|---------------------|
| 1 | **Overblik** | "Hvad sker der med mine emner lige nu?" |
| 2 | **Analyse** | "Hvor meget, og hvordan udvikler det sig?" |
| 3 | **Rapporter** | "Send det til mig automatisk." |
| 4 | **Nyheder** | "Hvad er de største historier generelt?" |

Sidebar er altid synlig (mørk navy), så brugeren altid ved hvor de er. Aktivt punkt er fremhævet med
lyseblå. Rækkefølgen er ikke tilfældig: overblik først (default landing), handling (rapporter) i midten,
bredt nyhedsoverblik sidst.

## 5. Designsystem (og hvad farverne BETYDER)

Farver er ikke dekoration — de bærer mening og skal bruges konsistent:

| Token | Værdi | Betydning |
|-------|-------|-----------|
| `--navy` | `#020617` | Sidebar, hero-flader. Ro, autoritet. |
| `--blue` | `#2563eb` | Primær handling (knapper, links, aktiv tilstand). |
| `--sky` | `#60a5fa` | Accent/brand (logo-ring, highlights). |
| `--green` | `#16a34a` | **Positiv tone** + positiv udvikling (▲). |
| `--amber` | `#d97706` | **Neutral tone**. |
| `--red` | `#dc2626` | **Negativ tone** + nedgang (▼) + "nyt"-markør. |
| `--bg` | `#f6f7fb` | Sidebaggrund (blød, ikke ren hvid). |
| `--card` | `#fff` | Kort, med bløde skygger. |

- **Font:** Inter. Store tal og overskrifter i `700`, brødtekst `400–500`.
- **Kort:** hvid, `border-radius:16px`, tynd kant + blød skygge. Hover løfter kortet let (`translateY(-2px)`).
- **Rigeligt luft.** Tæthed er fjenden; whitespace gør det roligt at scanne.
- **Tone vises ALTID som en farvet prik + ord** (grøn "Positiv" / orange "Neutral" / rød "Negativ"),
  aldrig kun farve (tilgængelighed).

## 6. Skærm for skærm

### 6.1 Overblik (`index.html`)

**Formål:** Det første kunden møder. Skal besvare "hvad sker der?" og "hvad gør jeg?" øjeblikkeligt.

Layout fra top til bund — og hvorfor:

1. **Værdi-overskrift:** "Goddag, Dan" + *"Hvad bliver der skrevet om dine emner?"*. Sætter konteksten i
   menneskesprog med det samme. Ikke "Dashboard".
2. **Onboarding-strip (3 trin):** Vælg emner → Vi henter dækningen → Få besked. Trin der er gjort har
   grønt flueben; næste trin har en primær CTA. Dette erstatter den tomme "tilføj virksomhed"-boks og
   giver altid en fornemmelse af fremdrift — også for en erfaren bruger.
3. **24-timers KPIs (4 kort) MED kontekst:** "Nye artikler 38 ▲12% mod i går", "Medier der dækker jer 24",
   "Anslået rækkevidde 1,4 mio.", "Mest omtalte emne". Aldrig et nøgent `0` — altid en sammenligning eller
   en forklarende undertekst, så tallet betyder noget.
4. **"Dine emner" (kerneindholdet, øverst i hovedfladen):** Kort-grid. Hvert kort = ét emne med titel,
   type (Person/Organisation/Tema/Sammenligning), "opdateret kl. …", en **sparkline** (mini-graf der viser
   trend uden tal), antal artikler, en tone-prik, og pills ("1 ny" rød, "Delt" blå). Et "+ Følg et nyt
   emne"-kort afslutter griddet (altid en vej til at tilføje mere).
5. **"Sammenlign aktører" (sidepanel, sekundært):** Flyttet ud til højre i et tydeligt mærket panel med
   undertekst "Se hvordan store emner klarer sig op mod hinanden". Det er en kraftfuld men avanceret
   funktion — den må ikke stjæle opmærksomhed fra punkt 4.

**Hvorfor det virker:** Brugerens egne emner er nu det visuelle centrum. Tallene har betydning. Der er altid
et tydeligt næste skridt.

### 6.2 Analyse (`insights.html`)

**Formål:** Besvar "hvor meget bliver der skrevet, og hvordan udvikler det sig?"

1. **Overskrift som et spørgsmål:** *"Hvor meget bliver der skrevet?"* — ikke "Dækningsvolumen indsigt".
2. **Kompakt filterbar (én række):** Emne · Sammenlign med · Medier · Periode (segment-toggle 7/30 dage/3 mdr.).
   Dette erstatter de gamle 6 store, halvtomme config-bokse. Filtre er små og ude af vejen; data er stjernen.
3. **4 KPI-kort med betydning:** "Artikler i alt 1.284 ▲18% over branchesnit", "Medier der dækker 96",
   "Samlede historier 213", "Anslået rækkevidde 8,9 mio.". Hvert tal har en sammenligning eller forklaring.
4. **Volumen-graf over tid:** Kundens emne (fyldt blå linje) vist mod et stiplet branchegennemsnit. Legende
   forklarer linjerne. Pointen: kontekst — er 1.284 meget eller lidt?
5. **Top-medier (vandrette barer):** Hvor dækningen kommer fra (DR, TV2, Børsen …). Konkret og handlingsrettet.
6. **Tone i omtalen:** En vandret stak-bar (grøn/grå/rød) + procenter for Positiv/Neutral/Negativ. Det
   kommunikationschefen virkelig vil vide: *er omtalen god eller dårlig?*

### 6.3 Rapporter (`comm.html`)

**Formål:** Lad kunden få dækningen i indbakken, uden at det føles teknisk.

1. **Overskrift:** *"Få dækningen sendt til din indbakke"* — værdi, ikke "Opret Email Agent".
2. **Nummereret 3-trins form:** ① Navngiv ② Vælg emner ③ Vælg sendetid. Hvert trin har en lille
   forklarende undertekst. Nummereringen gør det umuligt at fare vild.
   - Emne-valg er klikbare rækker med checkbox + antal artikler (valgte er blå-markeret).
   - Sendetid er klikbare dag-knapper (Man–Søn) + et tidspunkt.
3. **Live e-mail-preview (sidepanel):** Viser præcis hvordan morgendagens mail kommer til at se ud, med
   rigtige emne-grupper og artikel-eksempler. Dette fjerner usikkerheden "hvad er det egentlig jeg opretter?".
   Note nederst: "Sender kun når der er nyt. Tomme dage springes over."

### 6.4 Nyheder (`news.html`)

**Formål:** Det brede mediebillede — de største historier lige nu, ikke kun kundens egne emner.

1. **Overskrift + tids-toggle:** "Største historier lige nu" · Lige nu / I dag / 24 timer.
2. **Medie-filter (venstre panel):** Søg + liste over medier med antal. "Alle medier" er default.
3. **Hero-historie:** Den største historie fremhævet på mørk navy-flade, med antal medier, "på forsiden",
   tone-pill og "dækket af DR, TV2 +27 andre · anslået rækkevidde". Tydeligt visuelt anker.
4. **Historie-grid (2 kolonner):** Hvert kort = en historie samlet på tværs af medier, med antal medier,
   tidsstempel, overskrift, tone-prik og hvilke medier (+N). Kompakt, scanbart.

## 7. Gennemgående UX-mønstre (genbrug overalt)

- **Aldrig et nøgent tal.** Hvert KPI har enten en delta (▲/▼ med farve) eller en forklarende undertekst.
- **Tone = prik + ord**, konsistente farver (grøn/orange/rød).
- **Pills** til status: "1 ny" (rød), "Delt" (blå), "overvåget" (grå), "Gratis/Betalt".
- **Sparklines** viser trend uden at kræve at brugeren læser tal.
- **"X nye"-markør** trækker øjet mod det der er ændret siden sidst.
- **Hover-løft** på interaktive kort signalerer "dette kan klikkes".
- **Spørgsmål som overskrifter** ("Hvor meget bliver der skrevet?") frem for substantiv-jargon.

## 8. Terminologi (gennemfør konsekvent — ingen undtagelser i UI)

| Væk med | Brug | Hvorfor |
|---------|------|---------|
| Agent / Katalog / Enhed | **Emne** | Kunden følger "emner", ikke agenter |
| Dækningsvolumen | **Hvor meget bliver der skrevet** | Spørgsmål, ikke fagterm |
| Samling | **Historie / sagsforløb** | |
| Opret Email Agent | **Få dækningen i din indbakke** | Værdi frem for funktion |
| Nyhedsnavigator | **Nyheder** | |

## 9. Tilstande prototypen IKKE viser — men som SKAL designes

Prototypen viser kun den "fyldte, sunde" tilstand. I produktet skal du også designe:
- **Tom tilstand** for en helt ny bruger uden emner (læn dig op ad onboarding-strippen — gør den til
  hovedindholdet indtil første emne er oprettet).
- **Loading** (skeleton-kort, ikke spinner midt på skærmen).
- **Fejl / "viser cached data"-banner** når backend er nede (cache-first, vis sidst kendte data).
- **Tom-tilstand pr. sektion** ("Ingen nye artikler i dag" frem for et blankt felt).

## 10. Hvad du IKKE må regressere

Disse er præcis det teamet er begejstrede for — bevar dem:
1. Plain-language overalt (test: ville en presseansvarlig forstå hvert ord?).
2. Varm start med kontekst, aldrig nøgne 0-taller.
3. Kundens egne emner som det visuelle centrum på forsiden.
4. Tone gjort synlig og forståelig (positiv/neutral/negativ).
5. Roligt, luftigt, premium udtryk (Linear/Stripe-niveau) — ikke tæt og teknisk.
