# HomeSystem.sk – vyhľadávanie

- `scripts/build-index.mjs` každých 15 minút stiahne XML export Shoptetu (tajomstvo `EXPORT_URL`) a zostaví `index.json` len s verejnými údajmi.
- `public/hs-search.js` je samotné vyhľadávanie, ktoré sa vkladá do Shoptetu.
- Zverejnené na GitHub Pages: `https://<meno>.github.io/hs-search/hs-search.js` a `.../index.json`.
- Testovací režim: pridajte `?test=1` k adrese skriptu v Shoptete; vyhľadávanie sa potom zapne len po otvorení webu s `?novehladanie=1` (vypnete `?novehladanie=0`).
