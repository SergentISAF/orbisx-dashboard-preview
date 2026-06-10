# CLAUDE.md — implementerings-brief

> Til AI-agenten der skal implementere dette redesign i OrbisX-produktet (Mikkels backend/frontend).
> Dette repo er en **statisk design-prototype** (dummy-data, ingen JS, ingen backend). Din opgave er at
> genskabe disse skærme i det rigtige produkt og koble dem på den eksisterende v2 cloud-backend.

> ## 🟦 LÆS FØRST: `DESIGN.md`
> **Det vigtigste i denne overdragelse er at forstå UX-designet** — det er det teamet er begejstrede for,
> og det skal overleve reimplementeringen. **Læs hele [`DESIGN.md`](./DESIGN.md) før du skriver kode.**
> Den forklarer filosofien, informationsarkitekturen, hver skærm komponent-for-komponent med *hvorfor*,
> designsystemet, og de UX-gevinster du IKKE må regressere. Denne fil (CLAUDE.md) er kun det tekniske
> "hvordan kobler jeg data på" — `DESIGN.md` er "hvad og hvorfor", og det vejer tungest.
>
> **Dernæst: [`GUARDRAILS.md`](./GUARDRAILS.md)** — bindende regler for AI-assisteret implementering
> (kodekvalitet, datasikkerhed/lækage-forebyggelse, proces). Reglerne dér overtrumfer ethvert AI-forslag.

## Hvad det er

Et redesign af kundedashboardet på `orbisx.ai/dk/da/dashboard`. Målet er at gøre fladen forståelig for
ikke-tekniske kunder (kommunikations- og presseansvarlige). Prototypen viser ønsket layout, hierarki,
terminologi og designsystem. Den er IKKE produktionskode — den skal oversættes til produktets stack
(Next.js / React, som det eksisterende dashboard).

Live reference: https://sergentisaf.github.io/orbisx-dashboard-preview/

## Vigtigste designprincipper (bevar disse)

1. **Plain language, ikke jargon.** Brug kundens sprog. Foreslået terminologi:
   - "Agenter/Kataloger/Enheder" → **Emner**
   - "Dækningsvolumen indsigt" → **Hvor meget bliver der skrevet?**
   - "Samlinger" → **Historier**
   - "Opret Email Agent" → **Få dækningen sendt til din indbakke**
   - "Nyhedsnavigator" → **Nyheder**
2. **Varm start, ikke tomme 0-taller.** Onboarding-trin + KPIs med kontekst (▲12% vs i går), ikke bare "0".
3. **Tydeligt hierarki.** Kundens egne emner øverst; "sammenlign aktører" sekundært.
4. **Tomme/loading/fejl-tilstande skal designes** (prototypen viser kun den fyldte tilstand).

## Skærme der skal bygges

| Prototype-fil | Skærm | Kerneindhold |
|---|---|---|
| `index.html` | **Overblik** | Onboarding-strip · 24t KPIs · "Dine emner" (cluster-kort m. sparkline) · "Sammenlign aktører"-panel |
| `insights.html` | **Analyse** | Filterbar (emne/sammenlign/medier/periode) · 4 KPI-kort · volumen-graf · top-medier · tone-fordeling |
| `comm.html` | **Rapporter** | 3-trins form (navn → vælg emner → sendetid) · live e-mail-preview |
| `news.html` | **Nyheder** | Medie-filter · hero-historie · grid af historie-kort (antal medier + tone-prik) |

For hver skærm: åbn den tilsvarende `.html` for det præcise layout, og `style.css` for komponenter/tokens.

## Data hver skærm kræver → v2 endpoints

(Reference fra Dans iOS-integration mod v2 API'et. **Verificér mod din aktuelle backend** — du har ground truth.)

- **Overblik / Dine emner**: `GET /v2/users/{user_id}/clusters` → kort pr. cluster (titel, `total_cluster_articles`, `new_articles`, `is_favorite`). Sparkline = artikler over tid pr. cluster.
- **Overblik / Sammenlign aktører**: `GET /v2/users/{user_id}/comparison-lists`
- **Overblik / KPIs + Mest dækket**: `GET /v2/news/stories/trending`
- **Analyse / volumen + KPIs**: `POST /v2/platform/metadata` (keywords[] + timerange) og `GET /v2/entities/{id}` (KPIs, top_sites, sentiment, trend)
- **Analyse / artikler-drilldown**: `GET /v2/users/{uid}/clusters/{cid}/articles` (har `metadata.total_articles` + `availabilities {free,paid}`)
- **Rapporter**: jeres email-agent / `job_specs`-flow
- **Nyheder**: `GET /v2/news/stories/trending` + `GET /v2/news/threads/{id}/publications` (alle publications, free/paid pr. site)

### Kendte API-gotchas (sparer dig tid)
- `user_id` i URL-paths skal være **integer** — slå op med `GET /v2/users/lookup?email=...` først.
- Auth: `Authorization: Bearer <id_token>` (id_token, IKKE access_token) på alle endpoints.
- Cluster-list-svaret bruger `results` (ikke `clusters`) og `user_cluster_id` som identifier.
- Availability: artikel-niveau er `availabilities {free:N, paid:N}` (object), tråd-niveau er `availability: "free"|"paid"` (string). Vis grøn=gratis / rød=betalt / orange=blandet.
- Datofelter blander ISO og dansk human-readable ("28. maj 17:58") + sentinel "No Time" — behandl som rå string.

### Sikkerhedsregel
`user_id` er en intern backend-værdi. **Vis den aldrig i UI, URL-logs eller fejlbeskeder.** Brug email som synlig identifier hvor muligt.

(Cognito-config, pool-ID'er og credentials er bevidst IKKE i dette public repo — brug jeres egne fra backend.)

## Designsystem (i `style.css`, CSS-variabler i toppen)

```
--navy #020617   --blue #2563eb (primær)   --sky #60a5fa (accent)
--green #16a34a (positiv)  --amber #d97706 (neutral)  --red #dc2626 (negativ)
--bg #f6f7fb   --card #fff   --radius 16px   Font: Inter
```
Mørk navy sidebar, lyse kort med bløde skygger. Matcher eksisterende Orbis-brand.

## Acceptkriterier

- [ ] Alle 4 skærme genskabt i produktets stack med rigtige data
- [ ] Ny terminologi gennemført (ingen "agenter/enheder/samlinger" i UI)
- [ ] Loading-, tom- og fejltilstande håndteret
- [ ] Responsiv (sidebar → bund/hamburger på mobil)
- [ ] Designtokens matcher (farver, font, radius, spacing)
- [ ] `user_id` aldrig eksponeret i UI

## Spørgsmål

Designvalg/intentioner: Dan Holmstad (danholmstad@gmail.com / Holmstad@orbisx.ai).
