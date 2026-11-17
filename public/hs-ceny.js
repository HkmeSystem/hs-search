/* HomeSystem – Vývoj ceny (hs-ceny.js v1 · 17. 11. 2026 · SK/CZ/EN)
   Hostované na GitHub Pages (repozitár hs-search, priečinok public), načítané v Pätičke s defer:
   <script src="https://hkmesystem.github.io/hs-search/hs-ceny.js?v=1" defer></script>
   Čo robí (len detail produktu, len pri mene EUR):
   1) pod rámček ceny pridá odkaz „Vývoj ceny“ → karta s grafom ceny za posledných 90 dní,
   2) graf kreslí len zo skutočne zaznamenaných cien (história sa zbiera od 17. 11. 2026,
      kým nie je 90 dní, graf začína dňom prvého záznamu a je pri ňom poznámka),
   3) od dátumu PRECHOD (keď štandardnú cenu nastavuje automatický import = najnižšia cena za 30 dní)
      premenuje „Bežná cena“ na „Najnižšia cena za 30 dní pred zľavou“ a v grafe ju vyznačí čiarou.
   Dáta: https://hkmesystem.github.io/hs-search/ceny/NN.json (scripts/ceny.mjs, obnova ~každých 30 min). */
(function () {
  'use strict';
  if (window.__HS_CENY) return; window.__HS_CENY = 1;
  var CFG = Object.assign({
    data: 'https://hkmesystem.github.io/hs-search/ceny/',
    prechod: '',             // RRRR-MM-DD: od tohto dňa je štandardná cena = najnižšia za 30 dní (automatický import); prázdne = vypnuté
    dni: 90,
    casti: 32                // musí sedieť so scripts/ceny.mjs
  }, window.HS_CENY || {});

  var L = (document.documentElement.getAttribute('lang') || 'sk').slice(0, 2).toLowerCase();
  if (L === 'cz') L = 'cs';
  var T = ({
    sk: { vyvoj: 'Vývoj ceny', nadpis: 'Vývoj ceny', za: 'za posledných', dni: 'dní', dnes: 'Dnes', min: 'Najnižšia', max: 'Najvyššia',
      min30: 'Najnižšia cena za 30 dní pred zľavou', od: 'Ceny zaznamenávame od', zavriet: 'Zavrieť',
      info: 'Zľavu počítame z najnižšej ceny, za ktorú sme produkt predávali 30 dní pred zľavou (§ 7 zákona č. 108/2024 Z. z.).' },
    cs: { vyvoj: 'Vývoj ceny', nadpis: 'Vývoj ceny', za: 'za posledních', dni: 'dní', dnes: 'Dnes', min: 'Nejnižší', max: 'Nejvyšší',
      min30: 'Nejnižší cena za 30 dní před slevou', od: 'Ceny zaznamenáváme od', zavriet: 'Zavřít',
      info: 'Slevu počítáme z nejnižší ceny, za kterou jsme produkt prodávali 30 dní před slevou.' },
    en: { vyvoj: 'Price history', nadpis: 'Price history', za: 'last', dni: 'days', dnes: 'Today', min: 'Lowest', max: 'Highest',
      min30: 'Lowest price in the 30 days before the discount', od: 'Prices recorded since', zavriet: 'Close',
      info: 'The discount is calculated from the lowest price in the 30 days before the discount.' }
  })[L] || {};

  var DEN = 864e5;
  var dnesStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Bratislava' }).format(new Date());
  var dnes = new Date(dnesStr + 'T00:00:00');
  var poPrechode = !!CFG.prechod && dnesStr >= CFG.prechod;
  var toD = function (s) { return new Date(String(s).slice(0, 10) + 'T00:00:00'); };
  var fmt = function (n) {
    var s = (Math.round(n * 100) / 100).toFixed(2).replace(/,00$/, '');
    s = s.replace('.', L === 'en' ? '.' : ',').replace(/[.,]00$/, '');
    return '€' + s;
  };
  var d2s = function (d) { return d.getDate() + '. ' + (d.getMonth() + 1) + '.'; };
  var cena = function (el) { if (!el) return 0; var m = el.textContent.replace(/\s/g, '').match(/(\d+(?:[.,]\d+)?)/); return m ? parseFloat(m[1].replace(',', '.')) : 0; };
  var cast = function (c) { var x = 0; for (var i = 0; i < c.length; i++) x = (x * 31 + c.charCodeAt(i)) >>> 0; return x % CFG.casti; };

  /* ---------- štýly (farby a písmo podľa hs-akcie.css / hs-dizajn.css) ---------- */
  function css() {
    if (document.getElementById('hs-ceny-css')) return;
    var s = document.createElement('style'); s.id = 'hs-ceny-css';
    s.textContent = [
      'html.hs-ceny-min30 .p-detail .p-final-price-wrapper{--hs-bezna-cena:"' + T.min30 + ' "}',
      'html.hs-ceny-min30 .p-detail .p-final-price-wrapper .price-standard{white-space:normal!important;line-height:18px}',
      '.hs-cv-btn{display:inline-flex;align-items:center;gap:6px;margin:8px 0 0;padding:0;border:0;background:none;color:#1272b3;font:600 14px/20px "Source Sans 3",sans-serif;cursor:pointer}',
      '.hs-cv-btn:hover{text-decoration:underline}',
      '.hs-cv-btn svg{flex:none}',
      '.hs-cv{margin:10px 0 14px;padding:14px 16px 12px;border:1px solid #e3eef7;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(18,114,179,.06)}',
      '.hs-cv-h{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:0 0 8px}',
      '.hs-cv-h strong{font:700 16px/22px "Exo 2",sans-serif;color:#1f1f1f}',
      '.hs-cv-x{border:0;background:none;color:#4d4d4d;font-size:22px;line-height:1;cursor:pointer;padding:0 2px}',
      '.hs-cv-g{position:relative}',
      '.hs-cv-g svg{display:block;width:100%;height:auto;overflow:visible;touch-action:pan-y}',
      '.hs-cv-tip{position:absolute;top:0;transform:translateX(-50%);padding:3px 8px;border-radius:6px;background:#1f1f1f;color:#fff;font:600 12px/16px "Source Sans 3",sans-serif;white-space:nowrap;pointer-events:none;display:none}',
      '.hs-cv-leg{display:flex;flex-wrap:wrap;gap:6px 16px;margin:8px 0 0;font:14px/20px "Source Sans 3",sans-serif;color:#4d4d4d}',
      '.hs-cv-leg b{color:#1f1f1f;font-weight:700}',
      '.hs-cv-leg i{display:inline-block;width:14px;height:0;margin:0 6px 3px 0;border-top:2px dashed #008000;vertical-align:middle}',
      '.hs-cv-leg i.m{border-top:3px solid #1272b3}',
      '.hs-cv-info{margin:8px 0 0;padding:8px 10px;border-radius:8px;background:#f3f9fe;font:13px/18px "Source Sans 3",sans-serif;color:#4d4d4d}',
      '.hs-cv-od{margin:6px 0 0;font:13px/18px "Source Sans 3",sans-serif;color:#4d4d4d}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ---------- dáta ---------- */
  function nacitaj(n) {
    var k = 'hs_ceny_' + n;
    try { var c = JSON.parse(sessionStorage.getItem(k) || 'null'); if (c && Date.now() - c.t < 30 * 6e4) return Promise.resolve(c.d); } catch (e) {}
    return fetch(CFG.data + n + '.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
      try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
      return d;
    });
  }

  /* ---------- graf (SVG, schodovitá čiara) ---------- */
  function body(h) {
    var od = new Date(dnes - CFG.dni * DEN), prvy = toD(h[0][0]);
    if (prvy > od) od = prvy;
    var out = [], j = 0, p = h[0][1];
    for (var t = od; t <= dnes; t = new Date(+t + DEN)) {
      while (j < h.length && toD(h[j][0]) <= t) { p = h[j][1]; j++; }
      out.push({ d: t, p: p });
    }
    if (out.length === 1) out.unshift({ d: out[0].d, p: out[0].p }); // aspoň dva body (čiara)
    return out;
  }
  function graf(b, ref) {
    var W = 600, H = 200, Lx = 58, R = 12, TP = 14, B = 26;
    var ps = b.map(function (x) { return x.p; }).concat(ref ? [ref] : []);
    var mn = Math.min.apply(null, ps), mx = Math.max.apply(null, ps);
    var pad = (mx - mn) * 0.15 || mx * 0.1; mn = Math.max(0, mn - pad); mx = mx + pad;
    var X = function (i) { return Lx + (W - Lx - R) * i / (b.length - 1); };
    var Y = function (p) { return TP + (H - TP - B) * (1 - (p - mn) / (mx - mn)); };
    var d = 'M' + X(0) + ' ' + Y(b[0].p);
    for (var i = 1; i < b.length; i++) d += 'H' + X(i) + 'V' + Y(b[i].p);
    var txt = function (x, y, a, t) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + a + '" font-size="13" fill="#4d4d4d" font-family="Source Sans 3,sans-serif">' + t + '</text>'; };
    var g = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + T.nadpis + '">';
    var ys = mx - mn - 2 * pad > 0.005 ? [mn + pad, (mn + mx) / 2, mx - pad] : [(mn + mx) / 2];
    ys.forEach(function (p) {
      g += '<line x1="' + Lx + '" x2="' + (W - R) + '" y1="' + Y(p) + '" y2="' + Y(p) + '" stroke="#e3eef7"/>' + txt(Lx - 6, Y(p) + 4, 'end', fmt(p));
    });
    var n = b.length - 1, idx = n >= 60 ? [0, Math.round(n / 3), Math.round(2 * n / 3), n] : n >= 2 ? [0, Math.round(n / 2), n] : [0, n];
    idx.forEach(function (i, k) { g += txt(X(i), H - 6, k === 0 ? 'start' : k === idx.length - 1 ? 'end' : 'middle', d2s(b[i].d)); });
    g += '<path d="' + d + 'V' + (H - B) + 'H' + X(0) + 'Z" fill="#f3f9fe"/>';
    if (ref) g += '<line x1="' + Lx + '" x2="' + (W - R) + '" y1="' + Y(ref) + '" y2="' + Y(ref) + '" stroke="#008000" stroke-width="1.5" stroke-dasharray="5 4"/>';
    g += '<path d="' + d + '" fill="none" stroke="#1272b3" stroke-width="2.5" stroke-linejoin="round"/>';
    g += '<circle cx="' + X(n) + '" cy="' + Y(b[n].p) + '" r="5" fill="#ffc807" stroke="#1f1f1f" stroke-width="1.5"/>';
    g += '<line class="hs-cv-cur" x1="0" x2="0" y1="' + TP + '" y2="' + (H - B) + '" stroke="#1f1f1f" stroke-opacity=".25" style="display:none"/>';
    g += '<rect x="' + Lx + '" y="0" width="' + (W - Lx - R) + '" height="' + (H - B) + '" fill="transparent"/></svg>';
    return { svg: g, X: X, W: W, L: Lx, R: R };
  }

  function panel(h, ref, kam) {
    var old = document.querySelector('.hs-cv'); if (old) { old.remove(); return; }
    var b = body(h), gr = graf(b, ref);
    var ps = b.map(function (x) { return x.p; });
    var mn = Math.min.apply(null, ps), mx = Math.max.apply(null, ps), dni = Math.round((dnes - b[0].d) / DEN);
    var el = document.createElement('div'); el.className = 'hs-cv';
    el.innerHTML = '<div class="hs-cv-h"><strong>' + T.nadpis + (dni >= 7 ? ' ' + T.za + ' ' + dni + ' ' + T.dni : '') + '</strong>' +
      '<button type="button" class="hs-cv-x" aria-label="' + T.zavriet + '">×</button></div>' +
      '<div class="hs-cv-g">' + gr.svg + '<div class="hs-cv-tip"></div></div>' +
      '<div class="hs-cv-leg"><span><i class="m"></i>' + T.dnes + ' <b>' + fmt(b[b.length - 1].p) + '</b></span>' +
      (ref ? '<span><i></i>' + T.min30 + ' <b>' + fmt(ref) + '</b></span>' : '') +
      (mn !== mx ? '<span>' + T.min + ' <b>' + fmt(mn) + '</b></span><span>' + T.max + ' <b>' + fmt(mx) + '</b></span>' : '') + '</div>' +
      (ref ? '<div class="hs-cv-info">' + T.info + '</div>' : '') +
      (toD(h[0][0]) > new Date(dnes - CFG.dni * DEN) ? '<div class="hs-cv-od">' + T.od + ' ' + d2s(toD(h[0][0])) + ' ' + toD(h[0][0]).getFullYear() + '.</div>' : '');
    kam.insertAdjacentElement('afterend', el);
    el.querySelector('.hs-cv-x').onclick = function () { el.remove(); };
    var svg = el.querySelector('svg'), tip = el.querySelector('.hs-cv-tip'), cur = el.querySelector('.hs-cv-cur');
    var ukaz = function (ev) {
      var r = svg.getBoundingClientRect(), cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      var i = Math.round((cx * gr.W / r.width - gr.L) / (gr.W - gr.L - gr.R) * (b.length - 1));
      i = Math.max(0, Math.min(b.length - 1, i));
      var x = gr.X(i);
      cur.setAttribute('x1', x); cur.setAttribute('x2', x); cur.style.display = '';
      tip.textContent = d2s(b[i].d) + ' · ' + fmt(b[i].p); tip.style.display = 'block';
      tip.style.left = Math.max(44, Math.min(r.width - 44, x * r.width / gr.W)) + 'px';
    };
    var skry = function () { tip.style.display = 'none'; cur.style.display = 'none'; };
    svg.addEventListener('mousemove', ukaz); svg.addEventListener('touchstart', ukaz, { passive: true }); svg.addEventListener('touchmove', ukaz, { passive: true });
    svg.addEventListener('mouseleave', skry); svg.addEventListener('touchend', function () { setTimeout(skry, 1500); });
  }

  /* ---------- detail produktu ---------- */
  function start() {
    var w = document.querySelector('.p-detail .p-final-price-wrapper'); if (!w) return;
    var dl = (window.dataLayer || []).filter(function (x) { return x && x.shoptet && x.shoptet.product; })[0];
    var pr = dl && dl.shoptet.product; if (!pr) return;
    if ((pr.currency || dl.shoptet.currency || 'EUR') !== 'EUR') return;   // história je v EUR
    css();
    if (poPrechode) document.documentElement.classList.add('hs-ceny-min30');
    var codes = pr.code ? [pr.code] : (pr.codes || []).map(function (c) { return c.code; });
    if (!codes.length) return;
    var casti = codes.map(cast).filter(function (n, i, a) { return a.indexOf(n) === i; });
    Promise.all(casti.map(nacitaj)).then(function (ds) {
      var data = Object.assign.apply(null, [{}].concat(ds));
      // pri variantoch: variant s najnižšou aktuálnou cenou (zodpovedá „od €…“)
      var code = codes.filter(function (c) { return data[c] && data[c].length; })
        .sort(function (a, b) { return data[a][data[a].length - 1][1] - data[b][data[b].length - 1][1]; })[0];
      if (!code || document.querySelector('.hs-cv-btn')) return;
      var h = data[code];
      var ref = poPrechode && w.querySelector('.price-standard') ? cena(w.querySelector('.price-standard .default-variant') || w.querySelector('.price-standard')) : 0;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'hs-cv-btn';
      b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>' + T.vyvoj;
      w.insertAdjacentElement('afterend', b);
      b.onclick = function () { panel(h, ref || 0, b); };
    }).catch(function (e) { /* bez dát sa odkaz neukáže */ });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
