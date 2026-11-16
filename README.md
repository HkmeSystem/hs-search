# História cien obchod.homesystem.sk

Zapisuje automaticky workflow `build.yml` (skript `scripts/ceny.mjs` vo vetve main) pri každom zostavení indexu (~každých 30 min).
Slúži na výpočet najnižšej ceny za 30 dní (§ 7 zák. 108/2024 Z. z.) a ako archív pre SOI.

- `stav-sk.json`, `stav-cs.json` – posledný stav: `{ kód: [účinná cena, cena s DPH, štandardná, akčná, akcia od, akcia do, viditeľný] }`
- `zmeny-<jazyk>-RRRR-MM.jsonl` – každá zmena jeden riadok: `t` čas (UTC), `c` kód, `p` účinná cena, `b` cena s DPH, `s` štandardná, `a` akčná, `af`/`au` akcia od/do, `v` viditeľný; `x: 1` = kód zmizol z exportu.
- Účinná cena = akčná cena, ak v daný deň (Europe/Bratislava) platí, inak cena s DPH.
- sk = cenník v EUR, cs = export českej verzie (mena podľa exportu).

Vetvu nemeňte ručne. Zmeny sa do vetvy main nepremietajú a nespúšťajú zostavenie.
