// Zostaví index pre vyhľadávanie HomeSystem.sk z XML exportu Shoptetu.
// Spúšťa ho GitHub Actions každých 15 minút. Odkaz na export je v tajomstve EXPORT_URL.
import { writeFileSync, mkdirSync } from 'node:fs';

const EXPORT_URL = process.env.EXPORT_URL;
const SHOP = (process.env.SHOP_URL || 'https://obchod.homesystem.sk').replace(/\/$/, '');
const OUT = process.env.OUT_DIR || 'public';

/* ---------- mini XML parser (bez závislostí) ---------- */
const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, '&');

export function parseXml(s) {
  const root = { n: '#', c: [], t: '' };
  const st = [root];
  let i = 0;
  while (i < s.length) {
    const lt = s.indexOf('<', i);
    const top = st[st.length - 1];
    if (lt < 0) { top.t += decode(s.slice(i)); break; }
    if (lt > i) top.t += decode(s.slice(i, lt));
    if (s.startsWith('<![CDATA[', lt)) { const e = s.indexOf(']]>', lt); top.t += s.slice(lt + 9, e); i = e + 3; continue; }
    if (s.startsWith('<!--', lt)) { i = s.indexOf('-->', lt) + 3; continue; }
    if (s[lt + 1] === '?' || s[lt + 1] === '!') { i = s.indexOf('>', lt) + 1; continue; }
    const gt = s.indexOf('>', lt);
    let tag = s.slice(lt + 1, gt);
    i = gt + 1;
    if (tag[0] === '/') { if (st.length > 1) st.pop(); continue; }
    const self = tag.endsWith('/');
    if (self) tag = tag.slice(0, -1);
    const node = { n: tag.trim().split(/\s/)[0], c: [], t: '' };
    top.c.push(node);
    if (!self) st.push(node);
  }
  return root;
}
const kid = (n, name) => (n ? n.c.find((x) => x.n === name) : undefined);
const kids = (n, name) => (n ? n.c.filter((x) => x.n === name) : []);
const txt = (n) => (n ? n.t.trim() : '');
const at = (n, ...path) => { for (const p of path) n = kid(n, p); return txt(n); };

/* ---------- produkty ---------- */
export function productsFromXml(xml, today = new Date().toISOString().slice(0, 10)) {
  const out = [], ext = [];
  const re = /<SHOPITEM(?:\s[^>]*)?>([\s\S]*?)<\/SHOPITEM>/g;
  let mm;
  while ((mm = re.exec(xml))) {
    const e = parseXml('<SHOPITEM>' + mm[1] + '</SHOPITEM>').c[0];
    if (!e) continue;
    // produkty s variantmi majú kód, cenu, sklad a viditeľnosť len pri jednotlivých variantoch
    const V = kids(kid(e, 'VARIANTS'), 'VARIANT').filter((v) => at(v, 'VISIBLE') !== '0');
    if (at(e, 'VISIBILITY') !== 'visible') continue;
    if (V.length ? false : at(e, 'VISIBLE') !== '1') continue;
    if (!V.length && kid(e, 'VARIANTS')) continue;
    const name = at(e, 'NAME'), url = at(e, 'ORIG_URL');
    if (!name || !url) continue;
    let price = +at(e, 'PRICE_VAT') || 0, std = +at(e, 'STANDARD_PRICE') || 0;
    const act = +at(e, 'ACTION_PRICE') || 0, af = at(e, 'ACTION_PRICE_FROM'), au = at(e, 'ACTION_PRICE_UNTIL');
    let stock = +at(e, 'STOCK', 'AMOUNT') || 0, from = false, avail = at(e, 'AVAILABILITY_OUT_OF_STOCK');
    let old = 0, until = '';
    if (V.length) {
      // najnižšia cena zo všetkých variantov (aj s akciou pri variante)
      stock = 0; let mp = Infinity, mo = 0, mu = ''; const prices = new Set();
      for (const v of V) {
        let vp = +at(v, 'PRICE_VAT') || 0, vo = +at(v, 'STANDARD_PRICE') || 0, vu = '';
        const va = +at(v, 'ACTION_PRICE') || 0, vaf = at(v, 'ACTION_PRICE_FROM'), vau = at(v, 'ACTION_PRICE_UNTIL');
        if (va && va < vp && (!vaf || vaf <= today) && (!vau || vau >= today)) { vo = vp; vp = va; vu = vau; }
        const vs = +at(v, 'STOCK', 'AMOUNT') || 0;
        stock += Math.max(0, vs); if (vp) prices.add(vp);
        if (vp && vp < mp) { mp = vp; mo = vo > vp ? vo : 0; mu = vu; }
        if (!avail) avail = at(v, 'AVAILABILITY_OUT_OF_STOCK');
      }
      if (mp < Infinity) { price = mp; old = mo; until = mu; from = prices.size > 1; }
    } else if (act && act < price && (!af || af <= today) && (!au || au >= today)) { old = price; price = act; until = au; }
    else if (std > price) old = std;
    const flags = kids(kid(e, 'FLAGS'), 'FLAG').filter((f) => at(f, 'ACTIVE') === '1').map((f) => at(f, 'CODE'));
    const clean = (t) => { const seg = t.replace(/>>/g, '>').split('>').map((x) => x.trim()).filter(Boolean); if (seg.length > 1) seg.shift(); return seg.join(' > '); };
    const C = kid(e, 'CATEGORIES');
    const cats = kids(C, 'CATEGORY').map((c) => clean(txt(c)));
    const dc = clean(at(C, 'DEFAULT_CATEGORY'));
    const isExt = flags.includes('externy-sklad') || /^centr/i.test(avail.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    if (isExt) { ext.push(dc); continue; }
    const prm = new Set(), proto = [];
    for (const p of kids(kid(e, 'INFORMATION_PARAMETERS'), 'INFORMATION_PARAMETER')) {
      const n = at(p, 'NAME');
      for (const v of kids(p, 'VALUE')) {
        const t = txt(v); if (!t) continue; prm.add(t);
        if (/^(Protokol|Podporované v systéme)$/.test(n)) proto.push(t);
      }
    }
    const sd = at(e, 'SHORT_DESCRIPTION').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    const o = {
      c: at(e, 'CODE') || (V[0] ? at(V[0], 'CODE') : ''), n: name, u: url.replace(/^https?:\/\/[^/]+/, ''), i: txt(kid(kid(e, 'IMAGES'), 'IMAGE')),
      p: price, s: stock, a: avail, m: at(e, 'MANUFACTURER'), cat: cats, dc, pr: proto.join(' | '), fl: flags
    };
    const ean = at(e, 'EAN') || V.map((v) => at(v, 'EAN')).filter(Boolean).join(' '); if (ean) o.ean = ean;
    if (old) o.o = old;
    if (from) o.f = 1;
    if (V.length) o.v = V.length;
    if (until) o.un = until;
    const al = kids(kid(e, 'ALTERNATIVE_PRODUCTS'), 'CODE').map(txt).filter(Boolean); if (al.length) o.al = al;
    const tp = [...prm].join(' '); if (tp) o.tp = tp;
    if (sd) o.sd = sd;
    out.push(o);
  }
  return { products: out, extCount: ext.length };
}

/* ---------- pomocné stiahnutie ---------- */
const UA = 'HomeSystem-search-index/1.1';
const label = (url) => url === EXPORT_URL ? 'export' : url.replace(/[?#].*$/, '');
async function get(url, tries = 3, headers = {}) {
  for (let t = 1; ; t++) {
    let status = 0;
    try {
      const r = await fetch(url, { headers: Object.assign({ 'User-Agent': UA }, headers) });
      status = r.status;
      if (!r.ok) {
        const body = (await r.text().catch(() => '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
        throw new Error('HTTP ' + r.status + ' pri ' + label(url) + (r.headers.get('retry-after') ? ' (retry-after ' + r.headers.get('retry-after') + ')' : '') + (body ? ' – ' + body : ''));
      }
      return await r.text();
    } catch (err) {
      if (t >= tries) throw err;
      // pri zamietnutí (403/429) počkať dlhšie
      await new Promise((r) => setTimeout(r, (status === 403 || status === 429 ? 20000 : 3000) * t));
    }
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function previous(pages, file) {
  if (!pages) return null;
  try { return JSON.parse(await get(pages + file + '?t=' + Date.now(), 2)); } catch (e) { return null; }
}
const spaced = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const slug = (s) => '/' + (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '/';
const slugRaw = (s) => '/' + (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-') + '/';
const stripTags = (h) => decode(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// Shoptet posiela export v jazyku, ktorý má nastavená relácia -> pre každý jazyk vlastná relácia s cookies.
async function langSession(lang) {
  const jar = new Map();
  const take = (r) => {
    const list = typeof r.headers.getSetCookie === 'function' ? r.headers.getSetCookie() : [];
    for (const c of list) { const kv = c.split(';')[0]; const i = kv.indexOf('='); if (i > 0) jar.set(kv.slice(0, i).trim(), kv.slice(i + 1)); }
  };
  const cookie = () => [...jar].map(([k, v]) => k + '=' + v).join('; ');
  let r = await fetch(SHOP + '/', { redirect: 'manual', headers: { 'User-Agent': UA } }); take(r);
  r = await fetch(SHOP + '/action/Language/changeLanguage/?language=' + lang, { redirect: 'manual', headers: { 'User-Agent': UA, Cookie: cookie() } }); take(r);
  return { Cookie: cookie() };
}

const LANGS = [
  { code: 'sk', prefix: '', file: 'index.json', news: /Novinky v ponuke|Novinky v nabídce|New Arrivals/i },
  { code: 'cs', prefix: '/cs', file: 'index-cs.json', news: /Novinky v ponuke|Novinky v nabídce|New Arrivals/i },
  { code: 'en', prefix: '/en', file: 'index-en.json', news: /Novinky v ponuke|Novinky v nabídce|New Arrivals/i }
];

function menuMap(home) {
  const menu = new Map();
  for (const m of home.matchAll(/<a\s[^>]*href="([^"#]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    let h = m[1]; const t = spaced(stripTags(m[2]));
    if (!t || t.length > 80) continue;
    if (/^https?:\/\//.test(h)) { if (!h.startsWith(SHOP)) continue; h = h.slice(SHOP.length) || '/'; }
    if (!h.startsWith('/') || h.startsWith('/action/')) continue;
    if (!menu.has(t)) menu.set(t, h);
  }
  return menu;
}
const lastSeg = (c) => c.split('>').pop().trim();

async function buildLang(L, sitemap, smap, base, prev) {
  const t0 = Date.now();
  const headers = await langSession(L.code);
  const xml = await get(EXPORT_URL, 3, headers);
  const { products } = productsFromXml(xml);
  if (products.length < 100) throw new Error(L.code + ': podozrivo málo produktov (' + products.length + ')');
  const wrong = products.filter((p) => L.prefix ? !p.u.startsWith(L.prefix + '/') : /^\/(cs|en)\//.test(p.u)).length;
  if (wrong > products.length * 0.1) throw new Error(L.code + ': export neprišiel v správnom jazyku (' + wrong + ' adries nesedí)');
  const home = await get(SHOP + (L.prefix || '') + '/', 2, headers).catch(() => '');
  const menu = menuMap(home);

  // kategórie -> odkaz (menu jazyka, sitemap, alebo SK odkaz s predponou jazyka)
  const catLinks = {};
  const skByCode = base ? new Map(base.products.map((p) => [p.c, p])) : null;
  const viaSk = new Map();
  if (base) {
    for (const p of products) {
      const sk = skByCode.get(p.c); if (!sk) continue;
      const a = p.cat.concat(p.dc), b = sk.cat.concat(sk.dc);
      if (a.length !== b.length) continue;
      a.forEach((c, i) => { const n = lastSeg(c), l = base.catLinks[lastSeg(b[i])]; if (n && l && !viaSk.has(n)) viaSk.set(n, L.prefix + l); });
    }
  }
  for (const p of products) for (const c of p.cat.concat(p.dc)) {
    const n = lastSeg(c); if (!n || catLinks[n]) continue;
    const l = menu.get(spaced(n)) || (base ? viaSk.get(n) : (smap.has(slugRaw(n)) ? slugRaw(n) : smap.has(slug(n)) ? slug(n) : null));
    if (l) catLinks[n] = l;
  }
  // riadiace jednotky pre upozornenie na bránu
  let hubs;
  if (base) hubs = { zigbee: base.hubs.zigbee && L.prefix + base.hubs.zigbee, zwave: base.hubs.zwave && L.prefix + base.hubs.zwave };
  else {
    const f = (n) => menu.get(spaced(n)) || (smap.has(slug(n)) ? slug(n) : null);
    hubs = { zigbee: f('Riadiace jednotky ZigBee'), zwave: f('Riadiace jednotky Z-Wave') };
  }
  const contact = menu.get('kontakty') || menu.get('kontakt') || menu.get('contacts') || menu.get('contact') || (L.prefix + '/kontakty/');

  // novinky z hlavnej stránky jazyka
  const byUrl = new Map(products.map((p) => [p.u, p]));
  // sekcia na titulke: nadpis s triedou homepage-group-title (rovnaký text je aj v menu, ten preskočíme)
  let news = [];
  const titles = [...home.matchAll(/<[a-z0-9]+[^>]*class="[^"]*homepage-group-title[^"]*"[^>]*>([\s\S]*?)<\/(?:h\d|div|span|p)>/gi)];
  for (let k = 0; k < titles.length; k++) {
    if (!L.news.test(stripTags(titles[k][1]))) continue;
    const start = titles[k].index, end = k + 1 < titles.length ? titles[k + 1].index : start + 80000;
    const seen = [];
    for (const mm of home.slice(start, end).matchAll(/href="(?:https?:\/\/[^/"]+)?(\/[^"#?]+\/)"/g)) {
      const p = byUrl.get(mm[1]); if (p && !seen.includes(p.c)) seen.push(p.c); if (seen.length >= 12) break;
    }
    if (seen.length) { news = seen; break; }
  }
  if (!news.length) console.log('::warning::' + L.code + ': sekcia noviniek na titulke sa nenašla');

  // články z blogu jazyka
  const blogRe = new RegExp('<loc>https?:\\/\\/[^/<]+(' + (L.prefix ? L.prefix.replace('/', '\\/') : '') + '\\/blog\\/[^<]+)<\\/loc>', 'g');
  const blogUrls = [...new Set([...sitemap.matchAll(blogRe)].map((m) => m[1]))].filter((u) => !/\/blog\/(strana|page)-?\d/.test(u));
  // články, ktoré už poznáme z predchádzajúceho indexu, znovu nesťahujeme (šetrnosť k Shoptetu)
  const known = new Map(((prev && prev.a) || []).map((a) => [a.u, a]));
  const articles = blogUrls.filter((u) => known.has(u)).map((u) => known.get(u));
  const todo = blogUrls.filter((u) => !known.has(u));
  let bi = 0;
  const worker = async () => {
    while (bi < todo.length) {
      const u = todo[bi++];
      await sleep(300);
      try {
        const h = await get(SHOP + u, 2);
        const t = stripTags((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
        const d = decode(((h.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1] || '').trim());
        if (t) articles.push({ u, t, d });
      } catch (e) { /* jeden článok nevadí */ }
    }
  };
  await Promise.all(Array.from({ length: 2 }, worker));
  articles.sort((a, b) => a.u.localeCompare(b.u));

  // Karlik: odkazy z menu jazyka
  let kAll = null; const series = [];
  for (const m of home.matchAll(/<a\s[^>]*href="([^"#]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const h = m[1].replace(/^https?:\/\/[^/]+/, ''), t = stripTags(m[2]);
    if (!kAll && /vypinace_karlik/.test(h)) kAll = h;
    if (/^(DECO|ICON|MINI)$/.test(t) && !series.some((s) => s[0] === t) && h.startsWith((L.prefix || '') + '/')) series.push([t, h]);
  }
  const karlik = {
    all: kAll || (L.prefix + '/vypinace_karlik/'),
    series: series.length ? series : (L.code === 'sk' ? [['DECO', '/deco/'], ['ICON', '/icon/'], ['MINI', '/vypinace-karlik-mini/']] : [])
  };

  const index = { v: new Date().toISOString(), lang: L.code, p: products, a: articles, n: news, c: catLinks, h: hubs, k: karlik, ct: contact };
  const json = JSON.stringify(index);
  writeFileSync(OUT + '/' + L.file, json);
  console.log(L.code + ':', products.length, 'produktov,', articles.length, 'článkov,', news.length, 'noviniek,', Object.keys(catLinks).length, 'kategórií,', Math.round(json.length / 1024), 'kB,', Date.now() - t0, 'ms');
  return { products, catLinks, hubs };
}

async function main() {
  if (!EXPORT_URL) throw new Error('Chýba tajomstvo EXPORT_URL.');
  mkdirSync(OUT, { recursive: true });
  const repo = process.env.GITHUB_REPOSITORY || '';
  const pages = process.env.PAGES_URL || (repo ? 'https://' + repo.split('/')[0].toLowerCase() + '.github.io/' + repo.split('/')[1] + '/' : '');
  const sitemap = await get(SHOP + '/sitemap.xml').catch(() => '');
  const smap = new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/<]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]));
  let base = null, fails = 0;
  for (const L of LANGS) {
    const prev = await previous(pages, L.file);
    try {
      if (L.code !== 'sk' && !base) throw new Error('slovenská verzia zlyhala, preskakujem');
      const r = await buildLang(L, sitemap, smap, base, prev);
      if (L.code === 'sk') base = r;
    } catch (err) {
      fails++;
      // nepodarilo sa: ponecháme poslednú zverejnenú verziu, web funguje ďalej
      console.log('::warning::' + L.code + ': ' + err.message);
      if (prev) { writeFileSync(OUT + '/' + L.file, JSON.stringify(prev)); console.log(L.code + ': ponechaný predchádzajúci index z ' + prev.v); }
      else console.log(L.code + ': predchádzajúci index nie je k dispozícii');
    }
    await sleep(15000); // pauza medzi jazykmi
  }
  if (fails === LANGS.length) console.log('::warning::Shoptet tentoraz odmietol všetky exporty – na webe zostávajú posledné funkčné indexy.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error('Chyba:', err.message); process.exit(1); });
}
