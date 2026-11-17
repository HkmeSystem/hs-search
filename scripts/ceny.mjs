// História cien HomeSystem.sk – v2 (17. 11. 2026)
// v2: navyše zverejní históriu pre graf „Vývoj ceny“ (hs-ceny.js) do public/ceny/NN.json
// Spúšťa build.yml po zostavení indexu. Číta ceny-snap/<jazyk>.json (z build-index.mjs v1.3)
// a do priečinka vetvy „ceny“ (CENY_DIR) zapisuje:
//   stav-<jazyk>.json            posledný známy stav { kód: [účinná cena, cena, štandardná, akčná, od, do, viditeľný] }
//   zmeny-<jazyk>-RRRR-MM.jsonl  každá zmena jeden riadok (čas UTC, kód, ceny) – archív pre SOI
// Účinná cena = akčná, ak platí v daný deň (Europe/Bratislava), inak bežná cena s DPH.
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs';

const SNAP = 'ceny-snap';
const DIR = process.env.CENY_DIR || 'ceny-data';
const now = new Date();
const t = now.toISOString().slice(0, 16) + 'Z';
const dnes = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Bratislava' }).format(now); // RRRR-MM-DD
const mesiac = dnes.slice(0, 7);

const ucinna = ([b, s, a, af, au]) => (a && a < b && (!af || af.slice(0, 10) <= dnes) && (!au || au.slice(0, 10) >= dnes) ? a : b);

mkdirSync(DIR, { recursive: true });
for (const lang of ['sk', 'cs']) {
  const f = SNAP + '/' + lang + '.json';
  if (!existsSync(f)) { console.log(lang + ': snímka cien chýba (export zlyhal) – preskakujem'); continue; }
  const snap = JSON.parse(readFileSync(f, 'utf8'));
  const n = Object.keys(snap).length;
  if (n < 100) { console.log('::warning::' + lang + ': podozrivo málo kódov (' + n + ') – preskakujem'); continue; }
  const sf = DIR + '/stav-' + lang + '.json';
  const stav = existsSync(sf) ? JSON.parse(readFileSync(sf, 'utf8')) : {};
  const prvy = !Object.keys(stav).length;
  const riadky = [];
  for (const [c, r] of Object.entries(snap)) {
    const row = [ucinna(r), ...r];
    const old = stav[c];
    if (old && old.join('|') === row.join('|')) continue;
    riadky.push(JSON.stringify({ t, c, p: row[0], b: r[0], s: r[1], a: r[2], af: r[3], au: r[4], v: r[5] }));
    stav[c] = row;
  }
  // kód zmizol z exportu (zmazaný/premenovaný) – zaznamenať, nie však pri podozrivo veľkom úbytku
  const gone = Object.keys(stav).filter((c) => !(c in snap));
  if (gone.length && gone.length < n * 0.2) for (const c of gone) { riadky.push(JSON.stringify({ t, c, x: 1 })); delete stav[c]; }
  else if (gone.length) console.log('::warning::' + lang + ': chýba ' + gone.length + ' kódov – neodstraňujem');
  if (riadky.length) appendFileSync(DIR + '/zmeny-' + lang + '-' + mesiac + '.jsonl', riadky.join('\n') + '\n');
  writeFileSync(sf, JSON.stringify(stav));
  console.log(lang + ': ' + n + ' kódov, ' + (prvy ? 'prvé uloženie' : riadky.length + ' zmien'));
}

// ---------- v2: história pre graf na webe (GitHub Pages) ----------
// public/ceny/NN.json = { kód: [["RRRR-MM-DD", účinná cena], …] } – len viditeľné kódy, posledných DNI dní,
// v jeden deň posledná cena dňa. Kód patrí do súboru podľa cast(kód) – rovnaká funkcia je v hs-ceny.js.
const DNI = 120, CASTI = 32, PUB = process.env.PUB_DIR || 'public';
const cast = (c) => { let x = 0; for (const ch of c) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return x % CASTI; };
const denBA = (iso) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Bratislava' }).format(new Date(iso));
function historiaPreWeb(lang) {
  const sf = DIR + '/stav-' + lang + '.json';
  if (!existsSync(sf)) return;
  const stav = JSON.parse(readFileSync(sf, 'utf8'));
  const hranica = new Date(now - DNI * 864e5).toISOString().slice(0, 10);
  const subory = readdirSync(DIR).filter((f) => f.startsWith('zmeny-' + lang + '-') && f.endsWith('.jsonl')).sort();
  const h = {};
  for (const f of subory) {
    for (const ln of readFileSync(DIR + '/' + f, 'utf8').split('\n')) {
      if (!ln) continue;
      let z; try { z = JSON.parse(ln); } catch (e) { continue; }
      if (z.x || !(z.p > 0)) continue;
      const d = denBA(z.t), a = h[z.c] || (h[z.c] = []);
      if (a.length && a[a.length - 1][0] === d) a[a.length - 1][1] = z.p; else a.push([d, z.p]);
    }
  }
  const out = Array.from({ length: CASTI }, () => ({}));
  let n = 0;
  for (const [c, a] of Object.entries(h)) {
    if (!stav[c] || stav[c][6] !== 1) continue;
    // staršie body orezať, ale ponechať posledný pred hranicou (cena na začiatku grafu)
    let i = 0; while (i < a.length - 1 && a[i + 1][0] <= hranica) i++;
    const b = a.slice(i).filter((x, k, arr) => k === 0 || x[1] !== arr[k - 1][1]);
    out[cast(c)][c] = b; n++;
  }
  const dir = PUB + '/ceny' + (lang === 'sk' ? '' : '-' + lang);
  mkdirSync(dir, { recursive: true });
  out.forEach((o, k) => writeFileSync(dir + '/' + k + '.json', JSON.stringify(o)));
  const od = Object.values(h).reduce((m, a) => (a[0] && a[0][0] < m ? a[0][0] : m), '9999');
  writeFileSync(dir + '/info.json', JSON.stringify({ v: now.toISOString(), od, kody: n, casti: CASTI }));
  console.log(lang + ': história pre web – ' + n + ' kódov od ' + od);
}
try { historiaPreWeb('sk'); } catch (e) { console.log('::warning::história pre web: ' + e.message); }

const readme = DIR + '/README.md';
if (!existsSync(readme)) writeFileSync(readme, `# História cien obchod.homesystem.sk

Zapisuje automaticky workflow \`build.yml\` (skript \`scripts/ceny.mjs\` vo vetve main) pri každom zostavení indexu (~každých 30 min).
Slúži na výpočet najnižšej ceny za 30 dní (§ 7 zák. 108/2024 Z. z.) a ako archív pre SOI.

- \`stav-sk.json\`, \`stav-cs.json\` – posledný stav: \`{ kód: [účinná cena, cena s DPH, štandardná, akčná, akcia od, akcia do, viditeľný] }\`
- \`zmeny-<jazyk>-RRRR-MM.jsonl\` – každá zmena jeden riadok: \`t\` čas (UTC), \`c\` kód, \`p\` účinná cena, \`b\` cena s DPH, \`s\` štandardná, \`a\` akčná, \`af\`/\`au\` akcia od/do, \`v\` viditeľný; \`x: 1\` = kód zmizol z exportu.
- Účinná cena = akčná cena, ak v daný deň (Europe/Bratislava) platí, inak cena s DPH.
- sk = cenník v EUR, cs = export českej verzie (mena podľa exportu).

Vetvu nemeňte ručne. Zmeny sa do vetvy main nepremietajú a nespúšťajú zostavenie.
`);
