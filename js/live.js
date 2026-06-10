/* Live-lag: login-UI + demo/live-mode + Overblik wired som ARBEJDSEKSEMPEL.
 *
 * Uden login viser alle skærme prototypens dummy-data (demo-mode), præcis som før.
 * Efter login hentes rigtige data hvor skærmen er koblet på, og blokke der stadig
 * viser dummy-tal får et lille "demo-tal"-mærke, så ingen forveksler dem med live data.
 *
 * Overblik (index.html) er wired som eksempel — kopiér mønstret til de andre skærme.
 * Se INTEGRATION.md for hele kortet over endpoints ↔ skærm-elementer.
 */
(function () {
  const css = `
    .live-chip { display:flex; align-items:center; gap:8px; font-size:12.5px; color:#475569; }
    .live-chip .mode { background:#fef3c7; color:#92400e; padding:3px 10px; border-radius:999px; font-weight:600; }
    .live-chip .mode.live { background:#dcfce7; color:#166534; }
    .live-chip button { font:600 12.5px Inter,sans-serif; color:#2563eb; background:none; border:0; cursor:pointer; }
    .login-overlay { position:fixed; inset:0; background:rgba(2,6,23,.5); z-index:999;
      display:flex; align-items:center; justify-content:center; }
    .login-box { background:#fff; border-radius:16px; padding:28px; width:min(380px, calc(100vw - 40px));
      font-family:Inter,sans-serif; box-shadow:0 24px 64px rgba(2,6,23,.3); }
    .login-box h2 { font-size:18px; margin:0 0 4px; }
    .login-box p { font-size:13px; color:#64748b; margin:0 0 16px; }
    .login-box form { display:flex; flex-direction:column; gap:10px; }
    .login-box input { font:14px Inter,sans-serif; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; }
    .login-box button[type=submit] { font:600 14px Inter,sans-serif; background:#2563eb; color:#fff;
      border:0; border-radius:8px; padding:11px; cursor:pointer; }
    .login-box .err { color:#dc2626; font-size:13px; min-height:16px; margin:0; }
    .login-box details { font-size:13px; color:#475569; }
    .login-box details input { width:100%; margin-top:6px; }
    .login-box .close { float:right; border:0; background:none; font-size:18px; cursor:pointer; color:#94a3b8; }
    [data-demo] { position:relative; }
    [data-demo]::after { content:"demo-tal"; position:absolute; top:8px; right:8px;
      background:#fef3c7; color:#92400e; font:600 10px Inter,sans-serif; padding:2px 7px; border-radius:999px; }
    .live-error { background:#fef2f2; color:#991b1b; border-radius:10px; padding:10px 14px;
      font:13px Inter,sans-serif; margin-top:12px; }
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

  /* ---------- Status-chip i topbaren ---------- */
  const topbar = document.querySelector('.topbar');
  const chip = document.createElement('div');
  chip.className = 'live-chip';
  topbar && topbar.insertBefore(chip, topbar.querySelector('.bell'));

  function renderChip() {
    const live = window.OrbisAuth.isLoggedIn() && window.OrbisAuth.hasConfig();
    chip.innerHTML = live
      ? `<span class="mode live">Live data</span><button id="liveLogout">Log ud</button>`
      : `<span class="mode">Demo-data</span><button id="liveLogin">Log ind</button>`;
    const out = document.getElementById('liveLogout');
    const inn = document.getElementById('liveLogin');
    if (out) out.onclick = () => { window.OrbisAuth.logout(); location.reload(); };
    if (inn) inn.onclick = showLogin;
  }

  /* ---------- Login-dialog (med API-opsætning hvis config mangler) ---------- */
  function showLogin() {
    const needCfg = !window.OrbisAuth.hasConfig();
    const overlay = document.createElement('div');
    overlay.className = 'login-overlay';
    overlay.innerHTML = `
      <div class="login-box">
        <button class="close" aria-label="Luk">✕</button>
        <h2>Log ind</h2>
        <p>Brug din OrbisX-konto. Intet gemmes andre steder end din egen browser.</p>
        <form>
          ${needCfg ? `
          <details open><summary>API-opsætning (første gang)</summary>
            <input name="clientId" placeholder="Cognito App Client ID" required>
            <input name="apiBase" placeholder="API base-URL (…/v2)" required>
          </details>` : ''}
          <input name="email" type="email" placeholder="Email" autocomplete="username" required>
          <input name="password" type="password" placeholder="Adgangskode" autocomplete="current-password" required>
          <p class="err"></p>
          <button type="submit">Log ind</button>
        </form>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.close').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const err = overlay.querySelector('.err');
      err.textContent = '';
      try {
        if (needCfg) {
          window.OrbisAuth.saveConfig({
            region: 'eu-north-1',
            clientId: fd.get('clientId').trim(),
            apiBase: fd.get('apiBase').trim().replace(/\/$/, ''),
          });
        }
        await window.OrbisAuth.login(fd.get('email').trim(), fd.get('password'));
        location.reload();
      } catch (ex) {
        err.textContent = ex.message;
      }
    });
  }

  /* ---------- Hjælpere ---------- */
  function esc(s) { const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; }
  function markDemo(el) { if (el) el.setAttribute('data-demo', ''); }
  function showError(msg) {
    const box = document.createElement('div');
    box.className = 'live-error';
    box.textContent = `Live data kunne ikke hentes: ${msg}. Viser demo-data i stedet.`;
    document.querySelector('.content')?.prepend(box);
  }

  const TYPE_LABEL = { keyword: 'Søgeord', contextual: 'Kontekst' };

  /* ---------- ARBEJDSEKSEMPEL: Overblik (index.html) ---------- */
  async function loadOverblik() {
    const userId = await window.OrbisAuth.ensureUserId();
    const [clusterData, trending] = await Promise.all([
      window.OrbisAPI.getClusters(userId),
      window.OrbisAPI.getTrending(1, 'dk'),
    ]);
    const clusters = clusterData.results || [];

    // "Dine emner": genbyg kortene fra rigtige clusters (behold "tilføj"-flisen)
    const grid = document.querySelector('.grid-monitors');
    const addTile = grid.querySelector('.add-monitor');
    grid.innerHTML = '';
    for (const c of clusters) {
      const fresh = (c.new_articles || 0) > 0;
      const card = document.createElement('div');
      card.className = 'monitor';
      card.innerHTML = `
        <div class="top"><h3>${esc(c.title)}</h3>
          <span class="pill ${fresh ? 'red' : 'gray'}">${fresh ? `${c.new_articles} ny${c.new_articles > 1 ? 'e' : ''}` : 'overvåget'}</span></div>
        <div class="meta">${TYPE_LABEL[c.cluster_type] || 'Emne'} · sidst aktivitet ${esc(c.cluster_last_seen)}</div>
        <div class="foot"><div class="n">${c.total_cluster_articles ?? 0} <span>artikler</span></div>
          <span class="dot ${fresh ? 'amber' : 'green'}"></span></div>`;
      grid.appendChild(card);
    }
    if (addTile) grid.appendChild(addTile);

    // KPI 1: nye artikler på tværs af emnerne
    const kpis = document.querySelectorAll('.kpi');
    const totalNew = clusters.reduce((sum, c) => sum + (c.new_articles || 0), 0);
    kpis[0].querySelector('.val').textContent = totalNew;
    kpis[0].querySelector('.sub').textContent = `på tværs af ${clusters.length} emne${clusters.length === 1 ? '' : 'r'}`;
    kpis[0].querySelector('.label').textContent = 'Nye artikler siden sidst';

    // KPI 4: mest omtalte historie lige nu (trending, hele DK)
    const top = (trending.results || trending.stories || trending || [])[0];
    if (top && top.headline) {
      // headlines fra feedet slæber ofte medienavn med ("… | Nyheder | DR")
      kpis[3].querySelector('.val').textContent = top.headline.split('|')[0].trim();
      kpis[3].querySelector('.sub').textContent = `${top.total_sites ?? '?'} medier dækker historien`;
    } else { markDemo(kpis[3]); }

    // Endnu ikke koblet på (se INTEGRATION.md) → markér som demo-tal
    markDemo(kpis[1]);                                // medier der dækker jer
    markDemo(kpis[2]);                                // anslået rækkevidde
    markDemo(document.querySelector('.onboard'));     // onboarding-status
    markDemo(document.querySelector('.two-col > .card')); // sammenlign aktører
  }

  /* ---------- Sidevælger: kobl flere skærme på her, samme mønster ---------- */
  const PAGE_LOADERS = {
    'index.html': loadOverblik,
    // 'insights.html': loadAnalyse,   ← platformMetadata + getClusterArticles
    // 'news.html': loadNyheder,       ← getTrending(3) + getThreadPublications
    // 'comm.html': loadRapporter,     ← afventer job_specs-endpoint fra Mikkel
  };

  async function init() {
    renderChip();
    if (!window.OrbisAuth.isLoggedIn() || !window.OrbisAuth.hasConfig()) return; // demo-mode
    const page = location.pathname.split('/').pop() || 'index.html';
    const loader = PAGE_LOADERS[page];
    if (!loader) return;
    try { await loader(); } catch (ex) { showError(ex.message); }
  }

  init();
})();
