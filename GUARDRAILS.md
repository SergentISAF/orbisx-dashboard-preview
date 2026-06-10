# GUARDRAILS.md — regler for AI-assisteret implementering

> Til Mikkel og enhver AI-agent der arbejder på implementeringen af dette redesign i OrbisX-produktet.
> Reglerne her er ikke forslag. De er betingelser for at AI-assistance overhovedet bruges på projektet.
> Hvis en regel og et AI-forslag er i konflikt, vinder reglen.

## 1. Kodekvalitet og overskuelighed

Målet er at kodebasen om seks måneder ser ud som om ét menneske med god smag har skrevet den.

- **Én skærm pr. PR.** Redesignet består af fire skærme (Overblik, Analyse, Rapporter, Nyheder).
  Hver skærm implementeres i sin egen branch og PR. Ingen PR må røre mere end én skærm plus
  eventuelle delte komponenter den introducerer.
- **Max-størrelse på PR'er:** ca. 400 ændrede linjer ekskl. genererede filer og lockfiles. Bliver en
  skærm større end det, splittes den i flere PR'er (fx layout først, derefter datakobling). En PR
  man ikke kan reviewe grundigt på 30 minutter er for stor.
- **Menneskelig review før merge, altid.** AI må aldrig selv-merge, auto-approve eller pushe direkte
  til main. Mikkel (eller en anden udvikler) godkender hver PR manuelt.
- **Forklaringstest:** Den der merger skal kunne forklare hver linje i diffen. Kan du ikke forklare
  en linje, fjernes den eller skrives om indtil du kan. "AI'en foreslog det" er ikke en forklaring.
- **Følg produktets eksisterende mønstre.** Brug de komponentmønstre, mappestruktur, navngivning og
  state-håndtering der allerede findes i dashboardet. AI har en tendens til at opfinde nye
  abstraktioner pr. opgave; det afvises i review. Findes der allerede en knap-komponent, bruges den.
- **Ingen død kode.** Ingen ubrugte props, ingen "kan blive nyttig senere"-helpers, ingen
  udkommenteret kode, ingen wrapper-lag uden mindst to brugere. Slet hellere end at parkere.
- **Ingen nye dependencies uden eksplicit godkendelse.** AI må ikke tilføje npm-pakker på egen hånd.
  Prototypen er bevidst ren CSS/HTML; designet kræver ingen graf- eller UI-biblioteker udover det
  produktet allerede har.

## 2. Datasikkerhed og lækage-forebyggelse

Kunder som Danske Bank stiller skarpe krav. Udgangspunktet er enkelt: redesignet ændrer hvordan
data vises, ikke hvilke data der findes eller flyder.

- **Kun frontend.** Redesignet tilføjer INGEN nye endpoints, ændrer ingen eksisterende endpoints og
  udvider ikke datafladen. Alle skærme bygger på de v2-endpoints der allerede er i drift (se
  CLAUDE.md). Foreslår AI et nyt endpoint "for nemheds skyld", afvises det.
- **Interne ID'er holdes interne.** `user_id` og andre interne backend-identifikatorer må aldrig
  optræde i UI, i URL'er i browseren, i console.log, i fejlbeskeder vist til brugeren eller i
  client-side telemetri. Vis email eller navn hvor en synlig identifier er nødvendig. Dette er
  allerede et acceptkriterie i CLAUDE.md og gælder hver eneste PR.
- **Ingen tredjeparts-scripts, CDN'er, fonts-fra-tredjepart eller analytics** i dashboardet uden
  eksplicit, skriftlig godkendelse fra Mikkel. Alt der loader fra et eksternt domæne kan se
  kundedata i konteksten. Inter self-hostes hvis den ikke allerede gør.
- **Ingen kundedata i prompts.** Når AI-værktøjer bruges under udviklingen, må rigtige kundedata,
  API-svar fra produktion eller kundenavne aldrig indgå i prompts eller kontekst. Brug dummy-data
  (prototypens egne eksempeldata duer). AI-værktøjet skal aldrig have adgang til produktionsmiljøet.
- **Ingen credentials i frontend-koden.** Ingen API-nøgler, pool-ID'er, tokens eller secrets i
  repoet eller i bundlen. Auth-flowet er det eksisterende; det røres ikke af redesignet.
- **Fejlbeskeder er generiske mod brugeren.** Stack traces, endpoint-stier og rå API-svar hører til
  i server-logs, ikke på skærmen.

## 3. Proces

Ét lille loop, gentaget fire gange, en skærm ad gangen:

1. **Branch** fra main, navngivet efter skærmen (fx `redesign/overblik`).
2. **PR** med beskrivelse af hvad der er ændret og hvilke endpoints skærmen bruger.
3. **Menneskelig review** mod reglerne i afsnit 1 og 2 plus acceptkriterierne i CLAUDE.md.
4. **Merge** når og kun når en udvikler har godkendt.

- **AI-output behandles som forslag fra en junior-udvikler.** Ofte nyttigt, aldrig autoritativt,
  altid reviewet med samme skepsis som en ny kollegas første PR'er.
- **Alt kan rulles tilbage pr. skærm.** Fordi hver skærm er sin egen PR, kan en skærm reverten med
  én git revert uden at påvirke de andre. Det er den reelle sikkerhedsline: går noget galt, er
  skaden afgrænset og fortrydbar.
- **Stop-regel:** Hvis en AI-session begynder at omskrive ting den ikke blev bedt om, kasseres
  ændringerne, og opgaven formuleres smallere. Det er billigere end at reviewe sig ud af det.
