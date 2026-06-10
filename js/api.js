/* API-lag: én funktion pr. v2-endpoint, med faldgruberne indbygget.
 *
 * Generelle gotchas (testet mod live API):
 * - Alle kald: "Authorization: Bearer <id_token>" (IKKE access_token).
 * - user_id i paths SKAL være integer → brug OrbisAuth.ensureUserId().
 * - Datofelter blander ISO, dansk tekst ("28. maj 17:58") og "No Time" → vis som rå streng.
 * - Når Mikkel deployer kan alt give 500 kortvarigt.
 */
window.OrbisAPI = (function () {
  async function request(path, options = {}) {
    const cfg = window.OrbisAuth.config();
    if (!cfg) throw new Error('API-opsætning mangler');
    const token = await window.OrbisAuth.ensureIdToken();
    if (!token) throw new Error('Ikke logget ind');

    const doFetch = async () => fetch(cfg.apiBase + path, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    let r = await doFetch();
    if (r.status === 401) { // token udløbet undervejs → ét refresh-forsøg
      if (await window.OrbisAuth.ensureIdToken()) r = await doFetch();
    }
    if (!r.ok) throw new Error(`API ${r.status} på ${path.split('?')[0]}`);
    return r.json();
  }

  return {
    /* email → {user_id, email}. Bruges af OrbisAuth.ensureUserId — kald den i stedet. */
    lookupUser: (email) => request(`/users/lookup?email=${encodeURIComponent(email)}`),

    /* Brugerens emner. NB: svaret bruger "results" (ikke "clusters") og
       "user_cluster_id" som identifier til alle videre kald. */
    getClusters: (userId) => request(`/users/${userId}/clusters`),

    /* Artikler i et emne. Hvert "Article" er et story-bundle på tværs af medier.
       Brug metadata.total_articles som autoritativ tæller.
       availability: "availabilities" {free:N, paid:N} (grøn=kun free, rød=kun paid, orange=mix). */
    getClusterArticles: (userId, clusterId) => request(`/users/${userId}/clusters/${clusterId}/articles`),

    /* Emnets opsætning. search_text kan være STRING eller ARRAY af {value, strict} — håndtér begge. */
    getClusterForm: (userId, clusterId) => request(`/users/${userId}/clusters/${clusterId}/form`),

    /* Markér emne som set. */
    markClusterSeen: (userId, clusterId, country = 'dk') =>
      request(`/clusters/${clusterId}/seen?user_id=${userId}&country=${country}`, { method: 'POST' }),

    /* Mest omtalte historier. timerange er ENUM: 1=døgn, 2=?, 3=uge (heltal, max 3). */
    getTrending: (timerange = 1, country = 'dk') =>
      request(`/news/stories/trending?timerange=${timerange}&country=${country}`),

    /* Én historie med per-medie URL'er ("articles"-array, availability er STRING her). */
    getThread: (threadId) => request(`/news/threads/${threadId}`),

    /* ALLE publications i en historie uden site-dedup. created er ISO her. 15-min server-cache. */
    getThreadPublications: (threadId, sort = 'views_desc', country = 'dk') =>
      request(`/news/threads/${threadId}/publications?sort=${sort}&country=${country}`),

    /* Sammenligningslister. NB: response-shape er IKKE verificeret endnu — console.log første gang. */
    getComparisonLists: (userId) => request(`/users/${userId}/comparison-lists`),

    /* Fritekst-søgning. GOTCHA: 10s backend-timeout → 500 på meget store søgninger (Novo, Aarhus). */
    searchArticles: (query, country = 'dk', limit = 25) =>
      request(`/search/articles?query=${encodeURIComponent(query)}&country=${country}&limit=${limit}`),

    /* Volumen over tid til grafer. keywords SKAL være array, også med ét ord (string giver 422).
       Samme 10s-timeout-gotcha som searchArticles. */
    platformMetadata: ({ country = 'dk', keywords, timerange = 3 }) =>
      request('/platform/metadata', { method: 'POST', body: JSON.stringify({ country, keywords, timerange }) }),
  };
})();
