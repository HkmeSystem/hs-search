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
    if (at(e, 'VISIBILITY') !== 'visible' || at(e, 'VISIBLE') !== '1') continue;
    const name = at(e, 'NAME'), url = at(e, 'ORIG_URL');
    if (!name || !url) continue;
    let price = +at(e, 'PRICE_VAT') || 0, std = +at(e, 'STANDARD_PRICE') || 0;
    const act = +at(e, 'ACTION_PRICE') || 0, af = at(e, 'ACTION_PRICE_FROM'), au = at(e, 'ACTION_PRICE_UNTIL');
    let stock = +at(e, 'STOCK', 'AMOUNT') || 0, from = false, avail = at(e, 'AVAILABILITY_OUT_OF_STOCK');
    const V = kids(kid(e, 'VARIANTS'), 'VARIANT');
    if (V.length) {
      stock = 0; let mp = Infinity, ms = 0; const prices = new Set();
      for (const v of V) {
        const vp = +at(v, 'PRICE_VAT') || 0, vs = +at(v, 'STOCK', 'AMOUNT') || 0;
        stock += Math.max(0, vs); prices.add(vp);
        if (vp && vp < mp) { mp = vp; ms = +at(v, 'STANDARD_PRICE') || 0; }
        if (!avail) avail = at(v, 'AVAILABILITY_OUT_OF_STOCK');
      }
      if (mp < Infinity) { price = mp; std = ms; from = prices.size > 1; }
    }
    let old = 0, until = '';
    if (act && act < price && (!af || af <= today) && (!au || au >= today)) { old = price; price = act; until = au; }
    else if (std > price) old = std;
    const flags = kids(kid(e, 'FLAGS'), 'FLAG').filter((f) => at(f, 'ACTIVE') === '1').map((f) => at(f, 'CODE'));
    const clean = (t) => t.replace(/^Smarthome – inteligentná domácnosť\s*>+\s*/, '').replace(/\s*>>\s*/g, ' > ').trim();
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
      c: at(e, 'CODE'), n: name, u: url.replace(/^https?:\/\/[^/]+/, ''), i: txt(kid(kid(e, 'IMAGES'), 'IMAGE')),
      p: price, s: stock, a: avail, m: at(e, 'MANUFACTURER'), cat: cats, dc, pr: proto.join(' | '), fl: flags
    };
    const ean = at(e, 'EAN'); if (ean) o.ean = ean;
    if (old) o.o = old;
    if (from) o.f = 1;
    if (until) o.un = until;
    const al = kids(kid(e, 'ALTERNATIVE_PRODUCTS'), 'CODE').map(txt).filter(Boolean); if (al.length) o.al = al;
    const tp = [...prm].join(' '); if (tp) o.tp = tp;
    if (sd) o.sd = sd;
    out.push(o);
  }
  return { products: out, extCount: ext.length };
}

/* ---------- pomocné stiahnutie ---------- */
async function get(url, tries = 3) {
  for (let t = 1; ; t++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'HomeSystem-search-index/1.0' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.text();
    } catch (err) {
      if (t >= tries) throw err;
      await new Promise((r) => setTimeout(r, 3000 * t));
    }
  }
}
const spaced = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const slug = (s) => '/' + (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '/';
const slugRaw = (s) => '/' + (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-') + '/';
const stripTags = (h) => decode(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

async function main() {
  if (!EXPORT_URL) throw new Error('Chýba tajomstvo EXPORT_URL.');
  const t0 = Date.now();
  const xml = await get(EXPORT_URL);
  const { products, extCount } = productsFromXml(xml);
  if (products.length < 100) throw new Error('Podozrivo málo produktov (' + products.length + '), index neprepisujem.');
  console.log('Produkty:', products.length, '| Karlik (vynechané):', extCount, '|', Date.now() - t0, 'ms');

  const [sitemap, home] = await Promise.all([get(SHOP + '/sitemap.xml').catch(() => ''), get(SHOP + '/').catch(() => '')]);
  const smap = new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/<]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]));

  // odkazy z menu a hlavnej stránky
  const menu = new Map();
  for (const m of home.matchAll(/<a\s[^>]*href="([^"#]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    let h = m[1]; const t = spaced(stripTags(m[2]));
    if (!t || t.length > 80) continue;
    if (/^https?:\/\//.test(h)) { if (!h.startsWith(SHOP)) continue; h = h.slice(SHOP.length) || '/'; }
    if (!h.startsWith('/')) continue;
    if (!menu.has(t)) menu.set(t, h);
  }
  // kategórie -> odkaz
  const catLinks = {};
  const names = new Set();
  for (const p of products) for (const c of p.cat.concat(p.dc)) names.add(c.split('>').pop().trim());
  for (const n of names) {
    const l = menu.get(spaced(n)) || (smap.has(slugRaw(n)) ? slugRaw(n) : smap.has(slug(n)) ? slug(n) : null);
    if (l) catLinks[n] = l;
  }
  for (const n of ['Riadiace jednotky ZigBee', 'Riadiace jednotky Z-Wave']) {
    const l = menu.get(spaced(n)) || (smap.has(slug(n)) ? slug(n) : null); if (l) catLinks[n] = l;
  }
  const contact = menu.get('kontakty') || menu.get('kontakt') || '/kontakty/';

  // novinky z hlavnej stránky
  const byUrl = new Map(products.map((p) => [p.u, p]));
  let news = [];
  for (let i = home.indexOf('Novinky v ponuke'); i >= 0; i = home.indexOf('Novinky v ponuke', i + 1)) {
    const seg = home.slice(i, i + 40000), seen = [];
    for (const m of seg.matchAll(/href="(?:https?:\/\/[^/"]+)?(\/[^"#?]+\/)"/g)) {
      const p = byUrl.get(m[1]); if (p && !seen.includes(p.c)) seen.push(p.c); if (seen.length >= 8) break;
    }
    if (seen.length >= 4) { news = seen; break; }
  }

  // články z blogu
  const blogUrls = [...new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/<]+(\/blog\/[^<]+)<\/loc>/g)].map((m) => m[1]))]
    .filter((u) => !/\/blog\/(strana|page)-?\d/.test(u));
  const articles = [];
  let bi = 0;
  const worker = async () => {
    while (bi < blogUrls.length) {
      const u = blogUrls[bi++];
      try {
        const h = await get(SHOP + u, 2);
        const t = stripTags((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
        const d = decode(((h.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1] || '').trim());
        if (t) articles.push({ u, t, d });
      } catch (e) { /* jeden článok nevadí */ }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  articles.sort((a, b) => a.u.localeCompare(b.u));

  const karlik = {
    all: smap.has('/vypinace_karlik/') ? '/vypinace_karlik/' : '/karlik/',
    series: [['DECO', '/deco/'], ['ICON', '/icon/'], ['MINI', '/vypinace-karlik-mini/']].filter((s) => smap.size === 0 || smap.has(s[1]))
  };

  const index = { v: new Date().toISOString(), p: products, a: articles, n: news, c: catLinks, k: karlik, ct: contact };
  mkdirSync(OUT, { recursive: true });
  const json = JSON.stringify(index);
  writeFileSync(OUT + '/index.json', json);
  console.log('Hotovo:', products.length, 'produktov,', articles.length, 'článkov,', news.length, 'noviniek,', Object.keys(catLinks).length, 'kategórií,', Math.round(json.length / 1024), 'kB,', Date.now() - t0, 'ms');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error('Chyba:', err.message); process.exit(1); });
}
