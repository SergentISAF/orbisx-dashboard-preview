# INTEGRATION.md — sådan kobler du backend på designet

> Til Dan (og enhver der skal forbinde skærmene med v2-API'et). Prototypen har nu et
> integrationslag i `js/`, så hver skærm kan kobles på rigtige data uden at røre designet.
> Login og Overblik-skærmen virker allerede — brug dem som mønster.

## Kom i gang (2 minutter)

1. Kopiér `js/config.example.js` → `js/config.local.js` og udfyld Client ID + API base-URL
   (gitignored, committes aldrig). Alternativ: udfyld "API-opsætning" i login-dialogen,
   så gemmes det i browserens localStorage.
2. Servér mappen lokalt: `python3 -m http.server 8741` → http://localhost:8741/
3. Klik **Log ind** i topbaren. Uden login kører alt videre på demo-data, præcis som før.

CORS er verificeret åbent på både API Gateway og Cognito (testet 2026-06-10), så browseren
kan kalde begge direkte — ingen proxy.

## Lagene

| Fil | Ansvar |
|---|---|
| `js/auth.js` | Cognito-login (USER_PASSWORD_AUTH), auto-refresh, `ensureUserId()` |
| `js/api.js` | Én funktion pr. v2-endpoint, alle kendte faldgruber dokumenteret i koden |
| `js/live.js` | Login-UI, demo/live-chip i topbaren, og side-loaders der fylder DOM'en |

Flow: `OrbisAuth.login()` → id_token (auto-refresh efter 60 min) → `OrbisAuth.ensureUserId()`
(integer-id via `/users/lookup`, holdes kun i memory) → `OrbisAPI.*` med Bearer-header.

## Skærm ↔ endpoint-kortet

| Skærm | Element | Kald i `js/api.js` | Status |
|---|---|---|---|
| Overblik | Dine emner (kort-grid) | `getClusters(userId)` → `results[]`, id = `user_cluster_id` | ✅ wired |
| Overblik | KPI "Nye artikler" | sum af `new_articles` over clusters | ✅ wired |
| Overblik | KPI "Mest omtalte emne" | `getTrending(1)` → `[0].headline` | ✅ wired |
| Overblik | KPI medier/rækkevidde | findes ikke 1:1 i v2 endnu — spørg Mikkel | ⏳ demo-mærket |
| Overblik | Sammenlign aktører | `getComparisonLists(userId)` — **shape uverificeret, console.log først** | ⏳ demo-mærket |
| Analyse | Volumen-graf + KPI'er | `platformMetadata({keywords:[...], timerange})` — keywords SKAL være array | ⏳ |
| Analyse | Artikel-drilldown | `getClusterArticles(userId, clusterId)` — brug `metadata.total_articles` | ⏳ |
| Nyheder | Hero + historie-grid | `getTrending(3)` (3=uge) | ⏳ |
| Nyheder | Medie-liste pr. historie | `getThreadPublications(threadId)` — `created` er ISO her | ⏳ |
| Rapporter | 3-trins form | job_specs-flow — endpoint skal afklares med Mikkel | ⏳ |

Ny skærm kobles på i `js/live.js` → `PAGE_LOADERS`: skriv en `loadXxx()` efter
`loadOverblik()`-mønstret og registrér filnavnet.

## Spilleregler (kort — vigtigst af alt)

- **id_token, aldrig access_token.** API'et afviser access_tokens med 401.
- **user_id er internt:** aldrig i UI, adresselinje, console.log eller fejlbeskeder.
  `ensureUserId()` holder det i memory; lad det blive der.
- **Demo-ærlighed:** blokke der ikke er wired endnu skal `markDemo()`'es i live-mode,
  så ingen i teamet forveksler dummy-tal med rigtige tal.
- **Datofelter er rå strenge** ("28. maj 17:58", "No Time", af og til ISO) — parse ikke.
- 10s-timeout på `searchArticles`/`platformMetadata` ved meget store søgninger → fang fejlen
  og vis "prøv et snævrere søgeord".
- Når Mikkel deployer kan alt give 500 kortvarigt.

## Login-detaljer

- Pool: `eu-north-1`, public client uden secret (samme som iOS-appen, ALLOW_USER_PASSWORD_AUTH).
- id_token 60 min, refresh_token 5 dage → `auth.js` refresher selv; efter 5 dage logges ind igen.
- Tokens ligger i browserens session-/localStorage på brugerens egen maskine. Config uden secrets.
- Testkonto til udvikling: se Claude-memory (`orbisx-content-pipeline`) — aldrig i repoet.
