/* UI-lag: gør prototypens funktioner funktionelle (klik, filtre, formularer).
 * Ren demo-interaktion uden backend — live-data håndteres af js/live.js. */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';

  const css = `
    .story-overlay { position:fixed; inset:0; background:rgba(2,6,23,.5); z-index:200;
      display:flex; align-items:center; justify-content:center; padding:20px; }
    .story-sheet { background:#fff; border-radius:16px; width:min(560px,100%); max-height:84vh;
      overflow:auto; box-shadow:0 24px 64px rgba(2,6,23,.3); }
    .story-sheet .head { padding:18px 22px 14px; border-bottom:1px solid var(--line);
      display:flex; gap:12px; align-items:flex-start; position:sticky; top:0; background:#fff; }
    .story-sheet .head h3 { font-size:16px; font-weight:700; line-height:1.35; flex:1; }
    .story-sheet .head button { border:0; background:none; font-size:18px; cursor:pointer; color:var(--faint); }
    .story-sheet .pubs { padding:10px 22px 20px; }
    .pub-row { display:flex; align-items:center; gap:10px; padding:11px 0; border-bottom:1px solid var(--line); font-size:13.5px; }
    .pub-row:last-child { border-bottom:0; }
    .pub-row b { flex:0 0 110px; }
    .pub-row .t { flex:1; color:var(--muted); }
    .form-success { background:var(--green-soft); color:var(--green); border-radius:12px;
      padding:14px 16px; font-weight:600; font-size:14px; margin:14px 24px 20px; }
    .ctrl-menu { position:absolute; background:#fff; border:1px solid var(--line); border-radius:12px;
      box-shadow:var(--shadow-lg); z-index:120; min-width:200px; overflow:hidden; }
    .ctrl-menu div { padding:10px 14px; font-size:13.5px; cursor:pointer; }
    .ctrl-menu div:hover { background:var(--bg); }
    .kpi-drill { grid-column:1 / -1; padding:6px 8px; }
    .kpi-drill a { display:flex; justify-content:space-between; align-items:center; gap:12px;
      padding:11px 12px; border-radius:10px; text-decoration:none; color:var(--ink); font-size:13.5px; }
    .kpi-drill a:hover { background:var(--bg); }
    .kpi-drill a b { color:var(--blue); font-size:13px; white-space:nowrap; }
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

  function esc(s) { const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; }

  /* Segment-knapper (periode-togglere) virker overalt */
  document.querySelectorAll('.seg').forEach(seg => {
    seg.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      seg.querySelectorAll('button').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
    }));
  });

  /* ---------- Historie-detalje (modal med dækning pr. medie) ---------- */
  const AVAIL = ['gratis', 'gratis', 'betalt', 'gratis', 'betalt', 'gratis'];
  function openStory(title, sitesText, tone) {
    const sites = (sitesText || '').replace(/\+\d+.*/, '').split(/,|·/).map(s => s.trim()).filter(s => s && s.length < 22);
    const extra = Math.max(0, parseInt((sitesText.match(/\+(\d+)/) || [])[1] || 0, 10));
    const rows = sites.map((s, i) => `
      <div class="pub-row"><b>${esc(s)}</b><span class="t">${esc(title.length > 56 ? title.slice(0, 56) + '…' : title)}</span>
        <span class="pill ${AVAIL[i % AVAIL.length] === 'gratis' ? 'green' : 'red'}">${AVAIL[i % AVAIL.length]}</span></div>`).join('');
    const overlay = document.createElement('div');
    overlay.className = 'story-overlay';
    overlay.innerHTML = `
      <div class="story-sheet">
        <div class="head"><h3>${esc(title)}</h3><button aria-label="Luk">✕</button></div>
        <div class="pubs">
          <p class="muted" style="font-size:12.5px;padding:6px 0 4px">${tone ? `Tone: ${esc(tone)} · ` : ''}Dækning pr. medie${extra ? ` · ${extra} flere medier ikke vist i prototypen` : ''}</p>
          ${rows || '<p class="muted">Ingen medier at vise.</p>'}
          <p style="padding:10px 0 4px"><a href="story.html?t=${encodeURIComponent(title)}" style="color:var(--blue);font-weight:600;font-size:13.5px;text-decoration:none">Åbn hele historie-siden →</a></p>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('button').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }

  /* ---------- Overblik ---------- */
  if (page === 'index.html') {
    // Emne-kort → emne-detaljeside
    document.querySelectorAll('.monitor').forEach(card => {
      card.addEventListener('click', () => {
        const t = card.querySelector('h3')?.textContent || 'Emne';
        location.href = `cluster.html?t=${encodeURIComponent(t)}`;
      });
    });
    // Nyt emne (knap + flise)
    document.querySelectorAll('.add-monitor, .section-head .btn-primary').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); location.href = 'new-topic.html'; });
    });

    // KPI "Nye artikler": fold fordelingen pr. emne ud (læser fra emne-kortene,
    // så det virker både med demo-tal og live data)
    const kpis = document.querySelectorAll('.kpi');
    const newKpi = kpis[0];
    newKpi.classList.add('clickable');
    newKpi.addEventListener('click', e => {
      if (e.target.classList.contains('info')) return;
      const existing = document.querySelector('.kpi-drill');
      if (existing) { existing.remove(); return; }
      const rows = [...document.querySelectorAll('.monitor')].map(card => {
        const n = parseInt(card.querySelector('.pill.red')?.textContent, 10);
        return n ? { t: card.querySelector('h3').textContent, n } : null;
      }).filter(Boolean).sort((a, b) => b.n - a.n);
      const panel = document.createElement('div');
      panel.className = 'kpi-drill card';
      panel.innerHTML = rows.length
        ? rows.map(r => `<a href="cluster.html?t=${encodeURIComponent(r.t)}"><span>${esc(r.t)}</span><b>${r.n} nye →</b></a>`).join('')
        : '<p class="muted" style="padding:12px 14px">Ingen nye artikler lige nu.</p>';
      newKpi.after(panel);
    });

    // KPI "Mest omtalte emne" → historie-siden
    const topKpi = kpis[3];
    topKpi.classList.add('clickable');
    topKpi.addEventListener('click', e => {
      if (e.target.classList.contains('info')) return;
      const t = topKpi.querySelector('.val').textContent.trim();
      location.href = `story.html?t=${encodeURIComponent(t)}`;
    });
  }

  /* ---------- Nyheder ---------- */
  if (page === 'news.html') {
    // Medie-filter: vis kun historier hvor mediet optræder
    document.querySelectorAll('.media-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.media-item').forEach(i => i.classList.remove('on'));
        item.classList.add('on');
        const name = item.childNodes[0].textContent.trim();
        const all = name === 'Alle medier';
        document.querySelectorAll('.story').forEach(story => {
          const foot = story.querySelector('.foot')?.textContent || '';
          story.style.display = all || foot.includes(name) ? '' : 'none';
        });
      });
    });
    // Historie-kort + hero → detalje-modal
    document.querySelectorAll('.story').forEach(story => {
      story.addEventListener('click', () => {
        openStory(story.querySelector('h4')?.textContent || '',
          story.querySelector('.foot .m:last-child')?.textContent || '',
          story.querySelector('.foot .m:first-child')?.textContent.trim());
      });
    });
    const hero = document.querySelector('.hero-story');
    hero && hero.addEventListener('click', () => {
      hero.style.cursor = 'pointer';
      openStory(hero.querySelector('h3')?.textContent || '',
        (hero.querySelector('.src')?.textContent || '').replace(/^Dækket af /, '').replace(/·.*/, '').replace(/og (\d+) andre/, '+$1'),
        'Positiv');
    });
    if (hero) hero.style.cursor = 'pointer';
  }

  /* ---------- Rapporter ---------- */
  if (page === 'comm.html') {
    const nameInput = document.querySelector('.form-sec .input');
    const mailHead = document.querySelector('.preview .ph');
    if (nameInput && mailHead) {
      const datePart = (mailHead.textContent.match(/·.*$/) || ['· i morgen'])[0];
      nameInput.addEventListener('input', () => {
        mailHead.textContent = `📨 ${nameInput.value.trim() || 'Din rapport'} ${datePart}`;
      });
    }
    // Emne-vælgere: toggle + opdatér preview-tæller
    const CHECK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4 10-11"/></svg>';
    function refreshCount() {
      let total = 0;
      document.querySelectorAll('.src-row.sel .pill').forEach(p => total += parseInt(p.textContent, 10) || 0);
      const cta = document.querySelector('.preview .pill.blue');
      if (cta) cta.textContent = `Se alle ${total} artikler i Orbis`;
    }
    document.querySelectorAll('.src-row').forEach(row => {
      row.addEventListener('click', () => {
        row.classList.toggle('sel');
        const check = row.querySelector('.check');
        const pill = row.querySelector('.pill');
        check.innerHTML = row.classList.contains('sel') ? CHECK : '';
        pill.className = `pill ${row.classList.contains('sel') ? 'blue' : 'gray'}`;
        refreshCount();
      });
    });
    // Dag-vælgere
    document.querySelectorAll('.day').forEach(d => d.addEventListener('click', () => d.classList.toggle('on')));
    // Aktivér rapport → kvittering
    const activate = document.querySelector('.form-foot .btn-primary');
    activate && activate.addEventListener('click', e => {
      e.preventDefault();
      if (document.querySelector('.form-success')) return;
      const days = document.querySelectorAll('.day.on').length;
      const topics = document.querySelectorAll('.src-row.sel').length;
      const box = document.createElement('div');
      box.className = 'form-success';
      box.innerHTML = `✓ Rapporten er aktiv: ${topics} emne${topics === 1 ? '' : 'r'}, ${days} dag${days === 1 ? '' : 'e'} om ugen kl. 07:00.
        <span class="muted" style="display:block;font-weight:400;font-size:12.5px;margin-top:4px">Prototype: opsætningen gemmes ikke endnu — job_specs-endpointet kobles på af Mikkel.</span>`;
      activate.closest('.form-card').appendChild(box);
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---------- Analyse ---------- */
  if (page === 'insights.html') {
    // Emne-vælger: simpel dropdown der skifter label + legend
    const topicCtrl = document.querySelector('.filterbar .field .ctrl');
    const TOPICS = ['Nova nordisk vs Lego', 'Mette', 'Silkeborg IF', 'Mine startups', 'Vingegaard'];
    topicCtrl && topicCtrl.addEventListener('click', () => {
      if (document.querySelector('.ctrl-menu')) return;
      const menu = document.createElement('div');
      menu.className = 'ctrl-menu';
      menu.innerHTML = TOPICS.map(t => `<div>${t}</div>`).join('');
      const r = topicCtrl.getBoundingClientRect();
      menu.style.left = `${r.left + scrollX}px`;
      menu.style.top = `${r.bottom + scrollY + 4}px`;
      document.body.appendChild(menu);
      menu.querySelectorAll('div').forEach(opt => opt.onclick = () => {
        topicCtrl.childNodes[1].textContent = opt.textContent;
        const legend = document.querySelector('.legend span');
        if (legend) legend.innerHTML = legend.innerHTML.replace(/<\/i>.*/, `</i>${opt.textContent}`);
        menu.remove();
      });
      setTimeout(() => document.addEventListener('click', function close(e) {
        if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); }
      }), 0);
    });
  }
})();
