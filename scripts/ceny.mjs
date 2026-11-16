// História cien HomeSystem.sk – v1 (17. 11. 2026)
// Spúšťa build.yml po zostavení indexu. Číta ceny-snap/<jazyk>.json (z build-index.mjs v1.3)
// a do priečinka vetvy „ceny“ (CENY_DIR) zapisuje:
//   stav-<jazyk>.json            posledný známy stav { kód: [účinná cena, cena, štandardná, akčná, od, do, viditeľný] }
//   zmeny-<jazyk>-RRRR-MM.jsonl  každá zmena jeden riadok (čas UTC, kód, ceny) – archív pre SOI
// Účinná cena = akčná, ak platí v daný deň (Europe/Bratislava), inak bežná cena s DPH.
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';

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
