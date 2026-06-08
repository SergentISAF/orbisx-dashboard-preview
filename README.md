# OrbisX Dashboard — redesign-prototype

Et redesign-forslag til kundedashboardet på `orbisx.ai/dk/da/dashboard`, lavet af Dan (HolmstadIT) til Orbis-teamet. Målet er at gøre fladen nemmere at forstå for nye, ikke-tekniske kunder (kommunikations- og presseansvarlige).

**Live preview:** https://sergentisaf.github.io/orbisx-dashboard-preview/

Det er en **statisk HTML/CSS-prototype med dummy-data** — ingen backend, ingen login, ingen build-step. Tænk på den som en interaktiv design-reference, ikke som produktionskode.

---

## De 4 skærme

| Fil | Skærm | Erstatter i dag |
|-----|-------|-----------------|
| `index.html` | **Overblik** | "Dashboard / Min virksomhed" |
| `insights.html` | **Analyse** | "Analyse og indsigt / Dækningsvolumen indsigt" |
| `comm.html` | **Rapporter** | "Kommunikation / Opret Email Agent" |
| `news.html` | **Nyheder** | "Nyhedsnavigator" |

Navigationen i venstre side linker mellem dem.

---

## Hvad er ændret (og hvorfor)

**1. Plain-language frem for jargon** — den største ændring. Forslag til ny terminologi:

| I dag | Forslag | Hvorfor |
|-------|---------|---------|
| Agenter / Kataloger / Enheder | **Emner** | Kunden tænker i "det jeg følger", ikke i agenter |
| Dækningsvolumen indsigt | **Hvor meget bliver der skrevet?** | Spørgsmål kunden faktisk stiller |
| Samlinger | **Historier / sagsforløb** | |
| Opret Email Agent | **Få dækningen sendt til din indbakke** | Værdi frem for funktion |
| Nyhedsnavigator | **Nyheder** | |

(Terminologien er et forslag — vælg det der passer jeres sprog.)

**2. Varm start i stedet for tomme 0-taller.** Forsiden viser en værdi-overskrift, en 3-trins onboarding-strip ("hvor er jeg i forløbet"), og KPIs med kontekst (▲12% mod i går) frem for bare "0".

**3. Tydeligt hierarki.** Kerneværdien (kundens emner) ligger øverst. "Sammenlign aktører" er flyttet til et tydeligt mærket sidepanel i stedet for at konkurrere om opmærksomheden.

**4. Analyse-siden:** de 6 tomme config-bokse er samlet i én kompakt filterbar. Tilføjet tone-fordeling (positiv/neutral/negativ) og top-medier.

**5. Rapporter:** nummererede trin + live preview af hvordan e-mailen ser ud.

---

## Sådan mapper det til jeres v2 API

Prototypen bruger dummy-data. Når den skal kobles på rigtige data, peger hvert område på jeres eksisterende v2-endpoints (bekræft mod jeres aktuelle API):

- **Overblik → "Dine emner"**: `GET /v2/users/{id}/clusters` (kort = clusters, sparkline + antal artikler pr. cluster)
- **Overblik → "Sammenlign aktører"**: `GET /v2/users/{id}/comparison-lists`
- **Overblik → KPI'er + "Mest dækket"**: `GET /v2/news/stories/trending`
- **Analyse**: `POST /v2/platform/metadata` (volumen over tid) + `GET /v2/entities/{id}` (KPIs, top_sites, sentiment)
- **Rapporter**: jeres email-agent / job_specs-flow
- **Nyheder**: `GET /v2/news/stories/trending` + `GET /v2/news/threads/{id}/publications`

Designet er bygget til at passe på den datastruktur I allerede leverer (cluster-titel, antal artikler, free/paid availability, medier-pr-historie, tone).

---

## Sådan kører / deployer du det

Det er rene statiske filer — ingen afhængigheder.

**Se det lokalt:**
```bash
python3 -m http.server 8000   # åbn http://localhost:8000
```

**Deploy som-det-er** (det er bare 5 filer): læg `*.html` + `style.css` på en hvilken som helst statisk host (Vercel, Netlify, S3, Nginx, jeres egen infra). Ingen build nødvendig.

**Integrér i jeres Next.js-produkt:** Brug skærmene som design-reference og genskab dem som React-komponenter. Designsystemet ligger i `style.css` (CSS-variabler i toppen):

```
--navy #020617   --blue #2563eb   --sky #60a5fa
--green #16a34a  --amber #d97706  --red #dc2626
Font: Inter
```
Farverne matcher jeres eksisterende Orbis-brand (navy + lyseblå accent).

---

## Filstruktur

```
index.html      Overblik
insights.html   Analyse
comm.html       Rapporter
news.html       Nyheder
style.css       Delt designsystem (CSS-variabler + komponenter)
```

## Kontakt

Dan Holmstad — danholmstad@gmail.com / Holmstad@orbisx.ai
