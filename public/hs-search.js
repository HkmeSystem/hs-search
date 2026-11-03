/* HomeSystem.sk – nové vyhľadávanie v1.1 (SK/CS/EN) | index: index.json, index-cs.json, index-en.json vedľa tohto súboru */
(function () {
  'use strict';
  if (window.__HSS_LOADED) return;
  var SRC = (document.currentScript && document.currentScript.src) || '';
  var LANGS = { sk: { idx: 'index.json', search: '/vyhladavanie/' }, cs: { idx: 'index-cs.json', search: '/cs/vyhledavani/' }, en: { idx: 'index-en.json', search: '/en/search/' } };
  var DL0 = (function () { try { return (window.dataLayer && window.dataLayer[0] && window.dataLayer[0].shoptet) || {}; } catch (e) { return {}; } })();
  var L = (function () {
    var l = String(DL0.language || document.documentElement.lang || '').slice(0, 2).toLowerCase();
    if (!LANGS[l]) l = /^\/cs\//.test(location.pathname) ? 'cs' : /^\/en\//.test(location.pathname) ? 'en' : 'sk';
    return l;
  })();
  var LI = { sk: 0, cs: 1, en: 2 }[L];
  var CUR = (DL0.currencyInfo && +DL0.currencyInfo.exchangeRate) ? DL0.currencyInfo : { exchangeRate: 1, priceDecimalPlaces: 2, symbol: '€', symbolLeft: 1, decimalSeparator: ',', thousandSeparator: ' ' };
  var TT = {
    sk: { recent: 'Vaše posledné hľadania', popular: 'Ľudia často hľadajú', news: 'Novinky v ponuke', sale: 'Akcie, ktoré končia', looking: 'Hľadám:', fixed: 'Zobrazujem výsledky pre',
      partial: 'Presnú zhodu sme nenašli, toto sú najbližšie výsledky.', none1: 'Pre „', none2: '“ sme nenašli žiadny produkt. Skúste iné slovo alebo ', none3: 'nám napíšte', none4: ', radi poradíme.',
      cats: 'Kategórie', blog: 'Z blogu', allArts: 'Všetky články', guides: 'Návody a články', products: 'Produkty', stock: 'Skladom', pcs: 'ks', central: 'Centrálny sklad', unavail: 'Nedostupné',
      tip: 'Odporúčame', isNew: 'Novinka', saleToday: 'Zľava končí dnes', saleDays: function (d) { return 'Zľava ešte ' + d + ' dni'; }, from: 'od ', homey: 'Funguje s Homey', fibaro: 'Funguje s FIBAROM',
      similar: 'Skladom je podobný:', 'for': 'za', cart: 'Do košíka', added: 'Pridané',
      zigHint: 'Zigbee zariadenia potrebujú na fungovanie bránu (hub).', zwHint: 'Z-Wave zariadenia sa pripájajú cez centrálnu jednotku, napríklad Homey alebo FIBARO Home Center.',
      ifNot: ' Ak ju ešte nemáte, ', seeHubs: 'pozrite si riadiace jednotky', zigQ: 'zigbee brána', zwQ: 'zwave centrálna jednotka',
      karTitle: 'Vypínače a zásuvky Karlik', karText: 'Kompletný sortiment Karlik nájdete v samostatnej kategórii.', karAll: 'Celá ponuka Karlik →',
      loading: 'Načítavam produkty…', resFor: 'Výsledky pre', q1: '„', q2: '“', search: 'Vyhľadávanie', searchHint: 'Napíšte, čo hľadáte, alebo skúste niečo z obľúbených hľadaní:',
      onlyStock: 'Len skladom', sort: 'Zoradiť', rel: 'Najrelevantnejšie', asc: 'Najlacnejšie', desc: 'Najdrahšie', more: 'Zobraziť ďalšie', noFilter: 'S týmito filtrami nič nemáme, skúste niektorý vypnúť.',
      lookingLow: 'hľadám:', fixedLow: 'zobrazujem výsledky pre', detail: 'Detail', yourPrice: 'Vaša cena…', priceInDetail: 'Cena v detaile', searching: 'Hľadám…', blogUrl: '/blog/',
      plural: function (n) { return n === 1 ? 'produkt' : (n >= 2 && n <= 4) ? 'produkty' : 'produktov'; },
      showAll: function (n) { return (n >= 2 && n <= 4 ? 'Zobraziť všetky ' : 'Zobraziť všetkých ') + n + ' ' + this.plural(n); },
      popularQ: ['senzor úniku vody', 'termostatická hlavica', 'zigbee brána', 'smart zámok', 'shelly', 'homey'] },
    cs: { recent: 'Vaše poslední hledání', popular: 'Lidé často hledají', news: 'Novinky v nabídce', sale: 'Akce, které končí', looking: 'Hledám:', fixed: 'Zobrazuji výsledky pro',
      partial: 'Přesnou shodu jsme nenašli, toto jsou nejbližší výsledky.', none1: 'Pro „', none2: '“ jsme nenašli žádný produkt. Zkuste jiné slovo nebo ', none3: 'nám napište', none4: ', rádi poradíme.',
      cats: 'Kategorie', blog: 'Z blogu', allArts: 'Všechny články', guides: 'Návody a články', products: 'Produkty', stock: 'Skladem', pcs: 'ks', central: 'Centrální sklad', unavail: 'Nedostupné',
      tip: 'Doporučujeme', isNew: 'Novinka', saleToday: 'Sleva končí dnes', saleDays: function (d) { return 'Sleva ještě ' + d + (d <= 4 ? ' dny' : ' dní'); }, from: 'od ', homey: 'Funguje s Homey', fibaro: 'Funguje s FIBAREM',
      similar: 'Skladem je podobný:', 'for': 'za', cart: 'Do košíku', added: 'Přidáno',
      zigHint: 'Zigbee zařízení potřebují ke svému fungování bránu (hub).', zwHint: 'Z-Wave zařízení se připojují přes centrální jednotku, například Homey nebo FIBARO Home Center.',
      ifNot: ' Pokud ji ještě nemáte, ', seeHubs: 'podívejte se na řídicí jednotky', zigQ: 'zigbee brána', zwQ: 'zwave centrální jednotka',
      karTitle: 'Vypínače a zásuvky Karlik', karText: 'Kompletní sortiment Karlik najdete v samostatné kategorii.', karAll: 'Celá nabídka Karlik →',
      loading: 'Načítám produkty…', resFor: 'Výsledky pro', q1: '„', q2: '“', search: 'Vyhledávání', searchHint: 'Napište, co hledáte, nebo zkuste něco z oblíbených hledání:',
      onlyStock: 'Jen skladem', sort: 'Seřadit', rel: 'Nejrelevantnější', asc: 'Nejlevnější', desc: 'Nejdražší', more: 'Zobrazit další', noFilter: 'S těmito filtry nic nemáme, zkuste některý vypnout.',
      lookingLow: 'hledám:', fixedLow: 'zobrazuji výsledky pro', detail: 'Detail', yourPrice: 'Vaše cena…', priceInDetail: 'Cena v detailu', searching: 'Hledám…', blogUrl: '/cs/blog/',
      plural: function (n) { return n === 1 ? 'produkt' : (n >= 2 && n <= 4) ? 'produkty' : 'produktů'; },
      showAll: function (n) { return (n >= 2 && n <= 4 ? 'Zobrazit všechny ' : 'Zobrazit všech ') + n + ' ' + this.plural(n); },
      popularQ: ['senzor úniku vody', 'termostatická hlavice', 'zigbee brána', 'chytrý zámek', 'shelly', 'homey'] },
    en: { recent: 'Your recent searches', popular: 'Popular searches', news: 'New arrivals', sale: 'Deals ending soon', looking: 'Looking for:', fixed: 'Showing results for',
      partial: 'No exact match found, here are the closest results.', none1: 'We couldn’t find any products for “', none2: '”. Try another word or ', none3: 'contact us', none4: ', we’re happy to help.',
      cats: 'Categories', blog: 'From the blog', allArts: 'All articles', guides: 'Guides & articles', products: 'Products', stock: 'In stock', pcs: 'pcs', central: 'Central warehouse', unavail: 'Unavailable',
      tip: 'Recommended', isNew: 'New', saleToday: 'Sale ends today', saleDays: function (d) { return 'Sale ends in ' + d + ' days'; }, from: 'from ', homey: 'Works with Homey', fibaro: 'Works with FIBARO',
      similar: 'Similar item in stock:', 'for': 'for', cart: 'Add to cart', added: 'Added',
      zigHint: 'Zigbee devices need a gateway (hub) to work.', zwHint: 'Z-Wave devices connect through a controller, such as Homey or FIBARO Home Center.',
      ifNot: ' If you don’t have one yet, ', seeHubs: 'see our controllers', zigQ: 'zigbee gateway', zwQ: 'zwave controller',
      karTitle: 'Karlik switches and sockets', karText: 'You’ll find the full Karlik range in a separate category.', karAll: 'All Karlik products →',
      loading: 'Loading products…', resFor: 'Results for', q1: '“', q2: '”', search: 'Search', searchHint: 'Type what you’re looking for, or try a popular search:',
      onlyStock: 'In stock only', sort: 'Sort', rel: 'Most relevant', asc: 'Lowest price', desc: 'Highest price', more: 'Show more', noFilter: 'Nothing matches these filters, try turning one off.',
      lookingLow: 'looking for:', fixedLow: 'showing results for', detail: 'Details', yourPrice: 'Your price…', priceInDetail: 'Price on product page', searching: 'Searching…', blogUrl: '/en/blog/',
      plural: function (n) { return n === 1 ? 'product' : 'products'; },
      showAll: function (n) { return 'Show all ' + n + ' ' + this.plural(n); },
      popularQ: ['water leak sensor', 'radiator thermostat', 'zigbee gateway', 'smart lock', 'shelly', 'homey'] }
  };
  var T = TT[L], RKEY = L === 'sk' ? 'hss_recent' : 'hss_recent_' + L, HUB = null;
  var CATX = /kompatibiln|^ostatn|^other|black friday|dopredaj|doprodej|^seo|works with|compatible|odbalen|rozbalen|unbox|zvyhodnen|bundle|clearance/;
  var C = Object.assign({
    exportUrl: null, indexUrl: SRC ? SRC.replace(/[?#].*$/, '').replace(/[^/]+$/, LANGS[L].idx) : null,
    test: /[?&]test=1/.test(SRC), track: true, ga: ['G-4L3DHB1QMX', 'G-NVETVR9VP9'], news: 3, badge: false, debug: false, drop: 8, contact: '/kontakty/'
  }, window.HSS_CONFIG || {});
  /* testovací režim: zapne sa len návštevníkovi s ?novehladanie=1 (vypne ?novehladanie=0) */
  if (C.test) {
    try {
      if (/[?&]novehladanie=1/.test(location.search)) localStorage.setItem('hss_on', '1');
      if (/[?&]novehladanie=0/.test(location.search)) localStorage.removeItem('hss_on');
      if (localStorage.getItem('hss_on') !== '1') return;
    } catch (e) { return; }
  }
  window.__HSS_LOADED = true;

  /* ---------- text utilities ---------- */
  var norm = function (s) { return (s == null ? '' : String(s)).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
  var spaced = function (s) {
    return norm(s).replace(/[^a-z0-9]+/g, ' ')
      .replace(/\bwi fi\b/g, 'wifi').replace(/\bz wave\b/g, 'zwave').replace(/\bzig bee\b/g, 'zigbee')
      .replace(/\bhomeassistant\b/g, 'home assistant').replace(/\bhome kit\b/g, 'homekit').replace(/\bsmart things\b/g, 'smartthings')
      .replace(/\s+/g, ' ').trim();
  };
  var toks = function (s) { return spaced(s).split(' ').filter(Boolean); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (v) {
    var d = +CUR.priceDecimalPlaces, x = v * (+CUR.exchangeRate || 1);
    x = Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
    if (d > 0 && x % 1 === 0) d = 0;
    var parts = x.toFixed(d).split('.');
    var num = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, CUR.thousandSeparator || ' ') + (parts[1] ? (CUR.decimalSeparator || ',') + parts[1] : '');
    return +CUR.symbolLeft ? CUR.symbol + num : num + ' ' + CUR.symbol;
  };
  var stem = function (t) { return t.length <= 4 ? t : t.slice(0, Math.max(4, t.length - (t.length >= 8 ? 3 : 2))); };
  var mt = function (tok, a, exact) {
    if (a.charAt(0) === '=') { a = a.slice(1); exact = true; }
    return exact ? tok === a : (tok.indexOf(a) === 0 || (a.length >= 4 && tok.length >= a.length + 4 && tok.indexOf(a) > 0));
  };
  function lev(a, b) {
    var m = a.length, n = b.length, prev = [], cur, i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }

  /* ---------- smart home dictionary ---------- */
  var G = [
    { n: ['Ovládanie garáže', 'Ovládání garáže', 'Garage control'], re: /garaz\w*( bran\w*| vrat\w*)?|\bvrat[aiou]?\b|garage( doors?)?/, alt: ['garaz', 'vrata', 'garage'] },
    { n: ['Senzory úniku vody', 'Senzory úniku vody', 'Water leak sensors'], re: /zaplav\w*|vytop\w*|zatop\w*|flood\w*|leak\w*|unik\w* vod\w*|water sensor\w*/, alt: ['vytop', 'unik', 'flood', 'leak', 'zaplav', 'zatop'] },
    { n: ['Zavlažovanie', 'Zavlažování', 'Irrigation'], re: /zavlaz\w*|polievan\w*|zalevan\w*|zahrad\w*|irrigat\w*|\bgarden\w*|sprinkler\w*/, alt: ['zavlaz', 'polievan', 'zalevan', 'zahrad', 'irrigat', 'garden', 'hydro'] },
    { n: ['Štartovacie sady', 'Startovací sady', 'Starter kits'], re: /\bzacat\w*|\bzacit\w*|zaciatok|zacatek|zaciatocnik\w*|zacatecnik\w*|starter\w*|startovac\w*|getting started|beginner\w*/, alt: ['starter', 'startovac', 'zvyhodnen', 'bundle'] },
    { n: ['Smart zásuvky', 'Chytré zásuvky', 'Smart plugs'], re: /\bplug\w*|zasuv\w*|predlzov\w*|prodluzov\w*|\bsocket\w*|\boutlet\w*/, alt: ['zasuv', 'plug', 'predlzov', 'prodluz', 'socket', 'outlet'] },
    { n: ['Radiátorové hlavice', 'Radiátorové hlavice', 'Radiator thermostats'], re: /(termostatick\w* )?hlavic\w*|\btrv\b|radiatorov\w*( hlav\w*)?|radiator( valves?| thermostats?)?|thermostatic (radiator )?valves?/, alt: ['hlavic', '=trv', 'radiator'] },
    { n: ['Senzory dverí a okien', 'Senzory dveří a oken', 'Door & window sensors'], re: /\bdver\w*|\bokn\w*|\bokien\b|\boken\b|\bdoors?\b|\bwindows?\b|contact sensors?/, alt: ['dver', 'okn', 'okien', 'oken', '=door', '=doors', 'window', 'contact'] },
    { n: ['Senzory pohybu a prítomnosti', 'Senzory pohybu a přítomnosti', 'Motion & presence sensors'], re: /pohyb\w*|\bpir\b|motion|pritomn\w*|mmwave|prezenc\w*|presence|occupancy/, alt: ['pohyb', 'pir', 'motion', 'pritomn', 'mmwave', 'presence', 'occupancy'] },
    { n: ['Dymové senzory', 'Kouřové senzory', 'Smoke detectors'], re: /\bdym\w*|\bkour\w*|pozar\w*|smoke/, alt: ['dym', 'kour', 'smoke', 'pozar'] },
    { n: ['Detektory CO', 'Detektory CO', 'CO detectors'], re: /oxid\w* uhol\w*|oxid\w* uhelnat\w*|carbon monoxide|\bco\b (senzor\w*|detektor\w*|sensors?|detectors?)|(senzor\w*|detektor\w*|sensors?|detectors?) co\b/, alt: ['uhol', 'uhelnat', 'monoxide', 'co'] },
    { n: ['Stmievače', 'Stmívače', 'Dimmers'], re: /stmiev\w*|stmiv\w*|dimmer\w*/, alt: ['stmiev', 'stmiv', 'dimmer'] },
    { n: ['Tienenie', 'Stínění', 'Shading'], re: /zaluzi\w*|rolet\w*|tienen\w*|stinen\w*|\bshade\w*|\bblind\w*|roller\w*|shutter\w*|markiz\w*|awning\w*/, alt: ['zaluz', 'rolet', 'shade', 'blind', 'roller', 'shutter', 'tienen', 'stinen', 'markiz', 'awning'] },
    { n: ['Garniže', 'Garnýže', 'Curtain rails'], re: /garniz\w*|garnyz\w*|zaves\w*|zaclon\w*|curtain\w*/, alt: ['garniz', 'garnyz', 'curtain', 'zaves', 'zaclon'] },
    { n: ['Kamery', 'Kamery', 'Cameras'], re: /kamer\w*|camera\w*/, alt: ['kamer', 'camera', 'cam'] },
    { n: ['Zvončeky', 'Zvonky', 'Doorbells'], re: /zvonc\w*|zvonek\w*|zvonk\w*|doorbell\w*|videozvon\w*|intercom\w*/, alt: ['zvonc', 'zvonek', 'zvonk', 'doorbell', 'videozvon', 'intercom'] },
    { n: ['Smart zámky', 'Chytré zámky', 'Smart locks'], re: /zamk\w*|zamok|zamka|zamek|smartlock|\blocks?\b/, alt: ['zamk', 'zamok', 'zamka', 'zamek', 'lock', 'smartlock'] },
    { n: ['Termostaty', 'Termostaty', 'Thermostats'], re: /termostat(?!ick)\w*|thermostat(?!ic)\w*/, alt: ['termostat', 'thermostat'] },
    { n: ['Teplota a vlhkosť', 'Teplota a vlhkost', 'Temperature & humidity'], re: /teplot\w*|vlhkost\w*|teplomer\w*|vlhkomer\w*|klimatick\w* senzor\w*|temperature|humidity|thermometer\w*|hygrometer\w*/, alt: ['teplot', 'vlhk', 'teplomer', 'climate', 'klimatick', 'temperature', 'humidity', 'thermometer'] },
    { n: ['Ovládanie klimatizácie', 'Ovládání klimatizace', 'Air conditioning control'], re: /klimatiz\w*|\bir\b|infra\w*|air ?condition\w*|aircon\w*/, alt: ['klimatiz', 'ir', 'infra', 'aircon', 'conditioner'] },
    { n: ['Ventily na vodu', 'Ventily na vodu', 'Water valves'], re: /ventil\w*|uzaver\w*|valves?\b/, alt: ['ventil', 'uzaver', 'valve'] },
    { n: ['Meranie spotreby', 'Měření spotřeby', 'Energy metering'], re: /spotreb\w*|elektromer\w*|merac\w* energ\w*|energy\w*|merani\w*|power meters?|consumption/, alt: ['spotreb', 'elektromer', 'energ', 'merac', 'meran', 'consumption'] },
    { n: ['Nabíjanie elektromobilov', 'Nabíjení elektromobilů', 'EV charging'], re: /elektromobil\w*|wallbox|nabijack\w*|nabijec\w*|\bev\b|ev charg\w*|charging stations?/, alt: ['elektromobil', 'wallbox', 'nabijack', 'nabijec', 'charger', 'charging'] },
    { n: ['Sirény a alarmy', 'Sirény a alarmy', 'Sirens & alarms'], re: /siren\w*|alarm\w*|zabezpec\w*|security/, alt: ['siren', 'alarm', 'zabezpec', 'security', 'ajax'] },
    { n: ['Osvetlenie', 'Osvětlení', 'Lighting'], re: /osvetlen\w*|svetl\w*|ziarov\w*|zarov\w*|\bbulbs?\b|\bled\b|lighting|\blights?\b|\blamps?\b/, alt: ['osvetl', 'svetl', 'ziarov', 'zarov', 'bulb', 'led', 'light', 'lamp'] },
    { n: ['Riadiace jednotky a brány', 'Řídicí jednotky a brány', 'Hubs & gateways'], re: /\bhub\w*|centraln\w* jednot\w*|riadiac\w* jednot\w*|ridic\w* jednot\w*|gateways?|bridge|\bbran[aueyo]?\b|dongle|koordinator\w*|coordinators?/, alt: ['hub', 'gateway', 'bridge', 'bran', 'jednotk', 'controller', 'dongle', 'koordinator', 'coordinator'] }
  ];
  var HUBLABEL = G[G.length - 1].n[LI];
  var ECO = [
    { re: /\bhomey\b/, k: 'homey', l: 'Homey' },
    { re: /\bfibaro\b|\bhc3\b|\bhc2\b/, k: 'fibaro', l: 'FIBARO' },
    { re: /home ?assistant|\bha\b/, k: 'home assistant', l: 'Home Assistant' },
    { re: /\btuya\b|smart ?life/, k: 'tuya', l: 'Tuya' },
    { re: /\bgoogle\b/, k: 'google', l: 'Google Home' },
    { re: /\balexa\b|\bamazon\b|\becho\b/, k: 'amazon', l: 'Alexa' },
    { re: /homekit|\bapple\b|\bsiri\b/, k: 'homekit', l: 'Apple HomeKit' },
    { re: /smartthings/, k: 'smartthings', l: 'SmartThings' },
    { re: /\bmatter\b/, k: 'matter', l: 'Matter' },
    { re: /\bzigbe\w*/, k: 'zigbee', l: 'Zigbee' },
    { re: /\bzwave\w*/, k: 'zwave', l: 'Z-Wave' },
    { re: /\bwifi\b/, k: 'wifi', l: 'Wi-Fi' },
    { re: /\bthread\b/, k: 'thread', l: 'Thread' },
    { re: /bluetooth|\bble\b/, k: 'bluetooth', l: 'Bluetooth' }
  ];
  var PROTOS = [['zigbee', 'Zigbee'], ['zwave', 'Z-Wave'], ['wifi', 'Wi-Fi'], ['matter', 'Matter'], ['thread', 'Thread'], ['bluetooth', 'Bluetooth']];
  var STOP = new Set(('na do pre s so a cez v vo z zo k ku od pri po za ktory ktora ktore ktoru co chcem hladam potrebujem nejaky nejaka nejake nejaku mi moj moja moje ako je to sa by aj alebo ci mobil mobilom mobilu telefon telefonom aplikaciu aplikacia appku app navod navody sprievodca tipy porovnanie rozdiel vybrat vyber aky aka ake recenzia ' +
    'pro se ze ke ktery ktera ktere kterou chci hledam potrebuji muj jak nebo zda mobilem telefonem aplikace aplikaci pruvodce porovnani rozdil jaky jaka jake recenze ' +
    'the for with and of an to in on or my me need want looking buy how what which is are works compatible phone guide guides tips review vs best').split(' '));
  var SOFT = /^(senzor|sensor|detekt|cidl|smart|chytr|inteligent|home$|domac|zariaden|zarizen|device|modul|system|ovladani|ovladan|control$)/;
  var INTENT = /\b(ako|jak|how|navod\w*|sprievodc\w*|pruvodc\w*|guides?|co je|what is|aky|aka|ake|jaky|jaka|which|ktory|ktora|ktery|porovnan\w*|compar\w*|rozdiel\w*|rozdil\w*|difference|zacat|zacit|zaciatok|zacatek|getting started|tipy|tips|recenz\w*|reviews?|vybrat|vyber|choose)\b/;
  var ACC = /^(drziak|drzak|kryt|bateri|batter|napajac|napajec|adapter|kabel|cable|ramik|ramec|montaz|mount|holder|bracket|cover|nahradn|spare|replacement|prislus|accessor|redukc|magnet|nalepk|sticker|podlozk|2x|3x|4x)/;
  var POPULAR = T.popularQ;

  /* ---------- index ---------- */
  function fromXML(doc) {
    var today = new Date().toISOString().slice(0, 10), out = [];
    var g = function (e, s) { var x = e.querySelector(':scope > ' + s); return x ? x.textContent.trim() : ''; };
    var items = doc.documentElement.children;
    for (var k = 0; k < items.length; k++) {
      var e = items[k];
      if (g(e, 'VISIBILITY') !== 'visible' || g(e, 'VISIBLE') !== '1') continue;
      var name = g(e, 'NAME'), url = g(e, 'ORIG_URL');
      if (!name || !url) continue;
      var price = +g(e, 'PRICE_VAT') || 0, std = +g(e, 'STANDARD_PRICE') || 0, act = +g(e, 'ACTION_PRICE') || 0;
      var af = g(e, 'ACTION_PRICE_FROM'), au = g(e, 'ACTION_PRICE_UNTIL');
      var stock = +g(e, 'STOCK > AMOUNT') || 0, from = false, avail = g(e, 'AVAILABILITY_OUT_OF_STOCK');
      var V = e.querySelectorAll(':scope > VARIANTS > VARIANT');
      if (V.length) {
        stock = 0; var mp = Infinity, ms = 0, prices = new Set();
        V.forEach(function (v) {
          var vp = +g(v, 'PRICE_VAT') || 0, vs = +g(v, 'STOCK > AMOUNT') || 0;
          stock += Math.max(0, vs); prices.add(vp);
          if (vp && vp < mp) { mp = vp; ms = +g(v, 'STANDARD_PRICE') || 0; }
          if (!avail) avail = g(v, 'AVAILABILITY_OUT_OF_STOCK');
        });
        if (mp < Infinity) { price = mp; std = ms; from = prices.size > 1; }
      }
      var old = 0, until = '';
      if (act && act < price && (!af || af <= today) && (!au || au >= today)) { old = price; price = act; until = au; }
      else if (std > price) old = std;
      var flags = [];
      e.querySelectorAll(':scope > FLAGS > FLAG').forEach(function (f) {
        var a = f.querySelector('ACTIVE'); if (a && a.textContent === '1') flags.push(f.querySelector('CODE').textContent);
      });
      var cats = [], dc = '';
      e.querySelectorAll(':scope > CATEGORIES > *').forEach(function (c) {
        var t = c.textContent.replace(/^Smarthome – inteligentná domácnosť\s*>+\s*/, '').replace(/\s*>>\s*/g, ' > ').trim();
        if (c.nodeName === 'DEFAULT_CATEGORY') dc = t; else cats.push(t);
      });
      var prm = [], proto = [];
      e.querySelectorAll(':scope > INFORMATION_PARAMETERS > INFORMATION_PARAMETER').forEach(function (p) {
        var n = (p.querySelector('NAME') || {}).textContent || '';
        p.querySelectorAll('VALUE').forEach(function (v) {
          var t = v.textContent.trim(); prm.push(t);
          if (/^(Protokol|Podporované v systéme)$/.test(n.trim())) proto.push(t);
        });
      });
      var img = e.querySelector(':scope > IMAGES > IMAGE');
      out.push({
        c: g(e, 'CODE'), ean: g(e, 'EAN'), n: name, u: url.replace(/^https?:\/\/[^/]+/, ''), i: img ? img.textContent.trim() : '',
        p: price, o: old, f: from, un: until, s: stock, a: avail, m: g(e, 'MANUFACTURER'), cat: cats, dc: dc,
        pr: proto.join(' | '), tp: prm.join(' '), fl: flags,
        al: Array.prototype.map.call(e.querySelectorAll(':scope > ALTERNATIVE_PRODUCTS > CODE'), function (x) { return x.textContent.trim(); }),
        sd: g(e, 'SHORT_DESCRIPTION').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').slice(0, 300)
      });
    }
    return out;
  }

  function prep(P) {
    var vocab = new Map(), vx = new Set(), brands = new Set(), byCode = new Map(), byUrl = new Map();
    P.forEach(function (p) {
      p.ext = p.fl.indexOf('externy-sklad') >= 0 || /^centr/.test(norm(p.a));
      p.tn = toks(p.n); p.tm = toks(p.m); p.tc = toks(p.cat.concat(p.dc).join(' '));
      p.tx = toks(p.sd + ' ' + p.tp + ' ' + p.c + ' ' + p.ean);
      p.attr = ' ' + spaced(p.pr + ' ' + p.cat.join(' ') + ' ' + p.n + (p.fl.indexOf('custom1') >= 0 ? ' fibaro' : '') + (p.fl.indexOf('custom3') >= 0 ? ' homey' : '')) + ' ';
      var pa = ' ' + spaced(p.pr + ' ' + p.n + ' ' + p.cat.join(' ')) + ' ';
      p.proto = PROTOS.filter(function (x) { return pa.indexOf(' ' + x[0]) >= 0; }).map(function (x) { return x[1]; });
      p.ok = p.s > 0 && !p.ext;
      p.tn.concat(p.tm, p.tc).forEach(function (t) { if (t.length >= 2) vocab.set(t, (vocab.get(t) || 0) + 1); });
      p.tx.forEach(function (t) { vx.add(t); });
      p.tm.forEach(function (t) { if (t.length >= 3) brands.add(t); });
      byCode.set(p.c, p); byUrl.set(p.u, p);
    });
    return { P: P, vocab: Array.from(vocab), vx: Array.from(vx), brands: brands, byCode: byCode, byUrl: byUrl };
  }

  /* ---------- query understanding ---------- */
  function inVocab(a, exact) {
    for (var i = 0; i < IX.vocab.length; i++) if (mt(IX.vocab[i][0], a, exact)) return true;
    for (var j = 0; j < IX.vx.length; j++) if (mt(IX.vx[j], a, exact)) return true;
    return false;
  }
  function resolve(w) {
    if (w.length <= 2 || /^\d+$/.test(w)) return { alts: [w], exact: true, w: w };
    var a = IX.brands.has(w) ? w : stem(w);
    if (inVocab(a)) return { alts: [a], w: w };
    var md = w.length >= 7 ? 2 : 1, best = null, bd = 9, bf = -1;
    for (var i = 0; i < IX.vocab.length; i++) {
      var v = IX.vocab[i][0];
      if (v.length < 3 || Math.abs(v.length - w.length) > md) continue;
      var d = lev(w, v); if (d > md) continue;
      var f = (IX.brands.has(v) ? 1e6 : 0) + IX.vocab[i][1];
      if (d < bd || (d === bd && f > bf)) { best = v; bd = d; bf = f; }
    }
    if (best) return { alts: [IX.brands.has(best) ? best : stem(best)], w: w, fix: best };
    return { alts: [a], w: w };
  }
  function parse(raw) {
    var s = ' ' + spaced(raw) + ' ', terms = [], labels = [], fixes = [];
    var intent = INTENT.test(s);
    G.forEach(function (g) {
      if (g.re.test(s)) { terms.push({ alts: g.alt, group: g.n[LI] }); labels.push(g.n[LI]); s = s.replace(new RegExp(g.re.source, 'g'), ' '); }
    });
    var ecos = [];
    ECO.forEach(function (e) { if (e.re.test(s)) { ecos.push(e); s = s.replace(new RegExp(e.re.source, 'g'), ' '); } });
    var hasGroup = terms.length > 0;
    s.split(' ').forEach(function (w) {
      if (!w || STOP.has(w)) return;
      var t = resolve(w);
      t.soft = hasGroup && SOFT.test(w);
      if (t.fix) fixes.push(t.fix);
      terms.push(t);
    });
    ecos.forEach(function (e) { terms.push({ alts: [e.k], eco: e.k }); labels.push(e.l); });
    return { raw: raw, terms: terms, labels: labels, fixes: fixes, intent: intent };
  }

  /* ---------- scoring ---------- */
  function termScore(p, t) {
    if (t.eco) {
      if (p.tm.indexOf(t.eco) >= 0 || p.tn.some(function (x) { return x.indexOf(t.eco) === 0; })) return 3;
      return p.attr.indexOf(' ' + t.eco) >= 0 ? 2.5 : 0;
    }
    var best = 0;
    t.alts.forEach(function (a) {
      var f = function (x) { return mt(x, a, t.exact); };
      if (p.tn.some(f)) best = Math.max(best, 3);
      else if (p.tm.some(f)) best = Math.max(best, 2.5);
      else if (p.tc.some(f)) best = Math.max(best, 1.2);
      else if (!t.group && p.tx.some(f)) best = Math.max(best, 0.6);
    });
    return t.soft ? best * 0.3 : best;
  }
  function boost(p, pq) {
    var a = norm(p.a), b = 0;
    if (p.ok) b += 3;
    else if (/predaj skoncil|prodej skoncil|sale ended|discontinued|no longer/.test(a)) b -= 6;
    else if (p.ext) b -= 1.5;
    else if (/dodani|objednavk|deliver|to order|on order|within/.test(a)) b += 1;
    else if (/nedostup|vypredan|vyprodan|unavailable|sold out|out of stock/.test(a)) b -= 3;
    if (p.fl.indexOf('tip') >= 0) b += 1.5;
    if (p.o) b += 0.3;
    if (p.tn.slice(0, 2).some(function (x) { return ACC.test(x); }) &&
        !pq.terms.some(function (t) { return t.alts.some(function (x) { return ACC.test(x); }); })) b -= 3;
    return b;
  }
  function search(q) {
    var pq = parse(q), full = [], part = [];
    if (!pq.terms.length) return { pq: pq, res: [] };
    var req = pq.terms.filter(function (t) { return !t.soft; });
    IX.P.forEach(function (p) {
      var sc = 0, miss = 0;
      pq.terms.forEach(function (t) { var s = termScore(p, t); if (!s && !t.soft) miss++; sc += s; });
      if (!sc) return;
      if (!miss) full.push({ p: p, s: sc + boost(p, pq) });
      else if (miss === 1 && req.length >= 2) part.push({ p: p, s: sc + boost(p, pq) - 4, partial: true });
    });
    var by = function (x, y) { return y.s - x.s; };
    full.sort(by);
    if (full.length < 4) { part.sort(by); full = full.concat(part.slice(0, 16)); }
    return { pq: pq, res: full };
  }
  function searchArticles(pq) {
    if (!ART || !pq.terms.length) return [];
    var out = [], need = Math.max(1, Math.ceil(pq.terms.filter(function (t) { return !t.soft; }).length * 0.6));
    ART.forEach(function (a) {
      var s = 0, m = 0;
      pq.terms.forEach(function (t) {
        var b = 0;
        t.alts.forEach(function (al) {
          if (a.tt.some(function (x) { return mt(x, al, t.exact); })) b = Math.max(b, 3);
          else if (a.td.some(function (x) { return mt(x, al, t.exact); })) b = Math.max(b, 1);
        });
        if (b && !t.soft) m++; s += b;
      });
      if (m >= need && s >= 3) out.push({ a: a, s: s });
    });
    return out.sort(function (x, y) { return y.s - x.s; }).map(function (x) { return x.a; });
  }

  /* ---------- extra data: articles, novinky, category links ---------- */
  var IX = null, ART = null, NEW = [], CATLINK = new Map(), SMAP = new Set(), CONTACT = C.contact, smapP = null, CATMAP = {}, KARLIK = null, loading = null;
  function loadSitemap() {
    if (!smapP) smapP = fetch('/sitemap.xml').then(function (r) { return r.text(); }).then(function (sm) {
      var re = /<loc>https?:\/\/[^/<]+(\/[^<]*)<\/loc>/g, m; while ((m = re.exec(sm))) SMAP.add(m[1]); return sm;
    }).catch(function () { return ''; });
    return smapP;
  }
  function prepArt(list) { return list.map(function (a) { a.tt = toks(a.t); a.td = toks(a.d); return a; }); }
  function loadArticles() {
    try { var c = JSON.parse(localStorage.getItem('hss_art') || 'null'); if (c && Date.now() - c.t < 864e5) { ART = prepArt(c.a); return Promise.resolve(); } } catch (e) {}
    return loadSitemap().then(function (sm) {
      var urls = [], re = /<loc>https?:\/\/[^/<]+(\/blog\/[^<]+)<\/loc>/g, m;
      while ((m = re.exec(sm))) if (!/\/blog\/(strana|page)-?\d/.test(m[1]) && urls.indexOf(m[1]) < 0) urls.push(m[1]);
      var out = [], i = 0;
      var worker = function () {
        if (i >= urls.length) return Promise.resolve();
        var u = urls[i++];
        return fetch(u).then(function (r) { return r.text(); }).then(function (h) {
          var d = new DOMParser().parseFromString(h, 'text/html');
          var t = ((d.querySelector('h1') || {}).textContent || d.title || '').trim();
          var ds = (d.querySelector('meta[name="description"]') || {}).content || '';
          if (t) out.push({ u: u, t: t, d: ds.trim() });
        }).catch(function () {}).then(worker);
      };
      return Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]).then(function () {
        ART = prepArt(out);
        try { localStorage.setItem('hss_art', JSON.stringify({ t: Date.now(), a: out.map(function (a) { return { u: a.u, t: a.t, d: a.d }; }) })); } catch (e) {}
      });
    }).catch(function () {});
  }
  function loadNew() {
    var get = location.pathname === '/' ? Promise.resolve(document.documentElement.innerHTML) : fetch('/').then(function (r) { return r.text(); });
    return get.then(function (h) {
      var i = -1;
      while ((i = h.indexOf('Novinky v ponuke', i + 1)) >= 0) {
        var seg = h.slice(i, i + 40000), re = /href="(?:https?:\/\/[^/"]+)?(\/[^"#?]+\/)"/g, m, seen = [];
        while ((m = re.exec(seg)) && seen.length < 8) { var p = IX.byUrl.get(m[1]); if (p && seen.indexOf(p) < 0) seen.push(p); }
        if (seen.length >= 4) { NEW = seen; return; }
      }
    }).catch(function () {});
  }
  function collectLinks() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href') || '', t = spaced(a.textContent);
      if (!t || t.length > 80) return;
      if (/^https?:\/\//.test(h) && h.indexOf(location.host) < 0) return;
      h = h.replace(/^https?:\/\/[^/]+/, '');
      if (!CATLINK.has(t)) CATLINK.set(t, h);
      if (/^kontakt/.test(t)) CONTACT = h;
    });
  }
  var catLink = function (name) {
    var l = CATLINK.get(spaced(name)) || CATMAP[name]; if (l) return l;
    var a = '/' + norm(name).replace(/[^a-z0-9]/g, '-') + '/', b = '/' + norm(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '/';
    return SMAP.has(a) ? a : SMAP.has(b) ? b : undefined;
  };

  /* ---------- rendering ---------- */
  var css = '' +
    '#hss{position:fixed;z-index:2147483647;background:#fff;border:0;border-radius:10px;box-shadow:0 18px 44px rgba(13,90,143,.24),0 0 0 1px rgba(13,90,143,.10);font-family:"Source Sans 3",system-ui,sans-serif;color:#1f1f1f;font-size:15px;line-height:1.35;overflow:auto;display:none;text-align:left}' +
    '#hss.open{display:block}#hss *{box-sizing:border-box}' +
    '.hss-wrap{display:grid;grid-template-columns:minmax(0,1fr) 270px;min-height:100%}' +
    '.hss-main{padding:10px 18px 16px;min-width:0}' +
    '.hss-side{position:relative;overflow:hidden;padding:8px 20px 90px;background:#1272b3;color:#fff}' +
    '.hss-side:before{content:"";position:absolute;right:-30px;bottom:-34px;width:128px;height:110px;background:#c8f25a;border-radius:58% 42% 55% 45%/48% 60% 40% 52%}' +
    '.hss-side:after{content:"";position:absolute;right:92px;bottom:58px;width:18px;height:18px;background:#f986c5;border-radius:50%}' +
    '.hss-side>*{position:relative;z-index:1}' +
    '@media(max-width:720px){.hss-wrap{grid-template-columns:1fr}.hss-side{padding-bottom:40px}}' +
    '.hss-h{font:700 13px "Exo 2",sans-serif;text-transform:uppercase;letter-spacing:.04em;color:#1272b3;margin:16px 0 8px}' +
    '.hss-side .hss-h{color:#fff}' +
    '.hss-row{display:flex;gap:12px;align-items:center;padding:8px;margin:0 -8px;border-radius:8px;cursor:pointer}' +
    '.hss-row:hover,.hss-row.act{background:#eaf5fd}' +
    '.hss-img{width:58px;height:58px;flex:0 0 58px;object-fit:contain;background:#fff;border-radius:6px}' +
    '.hss-body{flex:1;min-width:0}.hss-name{font-weight:600;font-size:15px;color:#1f1f1f;text-decoration:none!important}' +
    '.hss-name b{color:#1272b3;font-weight:700}' +
    '.hss-meta{font-size:13px;color:#6b7680;margin-top:4px;display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center}' +
    '.hss-ok{color:#1e8e4a;font-weight:600}.hss-warn{color:#b86e00;font-weight:600}.hss-no{color:#c0392b;font-weight:600}' +
    '.hss-tag{font-size:12px;padding:1px 8px;border-radius:999px;background:#eaf5fd;color:#0d5a8f}' +
    '.hss-flag{display:inline-block;font:700 11px "Exo 2",sans-serif;text-transform:uppercase;letter-spacing:.03em;padding:2px 7px;border-radius:4px;margin:0 4px 3px 0}' +
    '.hss-f-tip{background:#c8f25a;color:#1f1f1f}.hss-f-new{background:#f986c5;color:#1f1f1f}.hss-f-sale{background:#ffc807;color:#1f1f1f}' +
    '.hss-price{text-align:right;white-space:nowrap;font-family:"Exo 2",sans-serif}.hss-price strong{font-size:16px;font-weight:700;color:#1f1f1f}' +
    '.hss-old{font-size:12.5px;color:#8a949c;text-decoration:line-through}' +
    '.hss-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}' +
    '.hss-chip{font:14px "Source Sans 3",sans-serif;padding:3px 12px;border:1px solid #cfe3f2;border-radius:999px;background:#fff;color:#0d5a8f;cursor:pointer;line-height:1.4}' +
    '.hss-chip:hover{border-color:#1272b3}.hss-chip.on{background:#1272b3;border-color:#1272b3;color:#fff}' +
    '.hss-note{font-size:14px;color:#4d5862;margin:8px 0 4px}.hss-note strong{color:#1272b3}' +
    '.hss-hint{display:flex;gap:10px;align-items:flex-start;font-size:14px;background:#eaf5fd;color:#0d5a8f;border-radius:8px;padding:10px 12px;margin-top:12px}' +
    '.hss-hint:before{content:"";flex:0 0 12px;height:12px;margin-top:4px;border-radius:50%;background:#ffc807}.hss-hint a{color:#1272b3!important;font-weight:700}' +
    '.hss-cat{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.2);color:#fff!important;text-decoration:none!important;font-size:15px;font-weight:600;line-height:1.25}' +
    '.hss-cat:hover span{text-decoration:underline}' +
    '.hss-cat b{flex:0 0 auto;min-width:28px;height:22px;padding:0 8px;border-radius:999px;background:#ffc807;color:#1f1f1f;font:700 12px/22px "Exo 2",sans-serif;text-align:center}' +
    '.hss-art{display:block;padding:7px 0;text-decoration:none!important}.hss-art span{display:block;color:#1272b3;font-weight:700;font-size:14.5px}' +
    '.hss-art small{color:#6b7680;font-size:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    '.hss-side .hss-art span{color:#fff}.hss-side .hss-art small{color:#cfe6f7}.hss-side .hss-art:hover span{text-decoration:underline}' +
    '.hss-more{display:block;width:100%;margin-top:12px;padding:10px;border:0;border-radius:6px;background:#1272b3;color:#fff;font:700 14px "Exo 2",sans-serif;text-transform:uppercase;letter-spacing:.03em;cursor:pointer}.hss-more:hover{background:#0d5a8f}' +
    '.hss-cart{margin-top:5px;padding:4px 12px;border:0;background:#ffc807;color:#1f1f1f;border-radius:5px;font:700 12px "Exo 2",sans-serif;text-transform:uppercase;cursor:pointer}.hss-cart:hover{background:#1f1f1f;color:#fff}' +
    '.hss-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}' +
    '.hss-card{display:block;text-decoration:none!important;color:inherit!important;border:1px solid #e3eef7;border-radius:8px;padding:8px}.hss-card:hover{border-color:#1272b3}' +
    '.hss-card img{width:100%;height:84px;object-fit:contain}.hss-card .n{font-size:13px;font-weight:600;line-height:1.3;height:51px;overflow:hidden;margin-top:4px}' +
    '.hss-card .pr{font:700 14px "Exo 2",sans-serif;margin-top:4px}' +
    '.hss-alt{font-size:13px;color:#4d5862;margin-top:3px}.hss-alt a{color:#1272b3!important;font-weight:600}' +
    '.hss-mini{display:flex;gap:10px;align-items:center;padding:7px 0;text-decoration:none!important;color:#fff!important}' +
    '.hss-mini img{width:46px;height:46px;flex:0 0 46px;object-fit:contain;background:#fff;border-radius:6px;padding:3px}' +
    '.hss-mini .n{font-size:13px;font-weight:600;line-height:1.25}.hss-mini .pr{font:700 13px "Exo 2",sans-serif;color:#ffc807;margin-top:2px}' +
    '.hss-side .hss-old{color:#cfe6f7}' +
    '.hss-empty{padding:14px 0 4px;font-size:15px}.hss-empty a{color:#1272b3!important;font-weight:700}' +
    '.hss-foot{font-size:12.5px;color:#8a949c;margin-top:12px}.hss-foot a{color:#8a949c!important}' +
    '.hss-badge{position:fixed;left:12px;bottom:12px;z-index:99998;background:#1272b3;color:#fff;font:700 12px "Exo 2",sans-serif;padding:6px 10px;border-radius:5px;pointer-events:none}' +
    '.hss-blogbox{margin-top:24px;background:#fff;border-radius:10px;padding:2px 14px 12px;color:#1f1f1f;box-shadow:0 6px 18px rgba(4,40,70,.18)}' +
    '.hss-blogbox .hss-h{color:#1272b3;display:flex;align-items:center;gap:8px;margin-top:12px}' +
    '.hss-blogbox .hss-h:before{content:"";width:10px;height:10px;border-radius:50%;background:#f986c5}' +
    '.hss-side .hss-blogbox .hss-art span{color:#1f1f1f}.hss-side .hss-blogbox .hss-art small{color:#6b7680}' +
    '.hss-side .hss-blogbox .hss-art:hover span{color:#1272b3;text-decoration:none}.hss-blogbox .hss-art+.hss-art{border-top:1px solid #e3eef7}' +
    '.hss-blogall{display:inline-block;margin-top:6px;font:700 12px "Exo 2",sans-serif;text-transform:uppercase;letter-spacing:.03em;color:#1272b3!important;text-decoration:none!important}.hss-blogall:hover{text-decoration:underline!important}' +
    '.hss-ovp{position:fixed;z-index:2147483646;display:block;background:transparent;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .18s ease}#hss-ov.on .hss-ovp{opacity:1;pointer-events:auto}' +
    '@media (prefers-reduced-motion:reduce){.hss-ovp{transition:none}}' +
    '@media(max-width:520px){#hss .hss-main{padding:6px 12px 14px}.hss-row{align-items:flex-start;gap:10px}.hss-img{width:48px;height:48px;flex-basis:48px}.hss-name{font-size:14.5px}.hss-meta .hss-tag:nth-of-type(n+3){display:none}.hss-price strong{font-size:15px}.hss-cart{padding:4px 9px;font-size:11px}}' +
    '.hss-karlik{border:1px solid #e3eef7;border-radius:10px;padding:12px 14px;margin:10px 0;background:#f7fbfe}.hss-karlik a.hss-chip{text-decoration:none!important;display:inline-block}' +
    '.hsp{font-family:"Source Sans 3",system-ui,sans-serif;color:#1f1f1f;margin-bottom:30px}.hsp-load{padding:40px 0;color:#6b7680;font-size:16px}' +
    '.hsp-title{font:700 26px/1.2 "Exo 2",sans-serif;margin:6px 0 6px;color:#1f1f1f}.hsp-sub{color:#4d5862;font-size:15px;margin-bottom:12px}.hsp-sub strong{color:#1272b3}' +
    '.hsp-cats{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.hsp-cat{display:inline-flex;align-items:center;gap:8px;padding:6px 8px 6px 14px;border-radius:999px;background:#1272b3;color:#fff!important;text-decoration:none!important;font-weight:600;font-size:14px}' +
    '.hsp-cat:hover{background:#0d5a8f}.hsp-cat b{min-width:24px;height:22px;padding:0 7px;border-radius:999px;background:#ffc807;color:#1f1f1f;font:700 12px/22px "Exo 2",sans-serif;text-align:center}' +
    '.hsp-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid #e3eef7;border-bottom:1px solid #e3eef7;margin:14px 0 16px}' +
    '.hsp-sort{font:14px "Source Sans 3",sans-serif;padding:6px 10px;border:1px solid #cfe3f2;border-radius:6px;color:#0d5a8f;background:#fff}' +
    '.hsp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}' +
    '.hsp-card{display:flex;flex-direction:column;border:1px solid #e3eef7;border-radius:10px;padding:12px;background:#fff;cursor:pointer;transition:border-color .15s,box-shadow .15s}.hsp-card:hover{border-color:#1272b3;box-shadow:0 8px 22px rgba(13,90,143,.12)}' +
    '.hsp-flags{min-height:22px}.hsp-img{display:block;width:100%;height:150px;object-fit:contain;margin:2px 0 10px}' +
    '.hsp-name{font-weight:600;font-size:15px;line-height:1.3;color:#1f1f1f!important;text-decoration:none!important}.hsp-name b{color:#1272b3}' +
    '.hsp-card .hss-meta{margin:6px 0 10px}.hsp-bot{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:8px}.hsp-bot .hss-price{text-align:left}' +
    '.hsp-detail{font:700 12px "Exo 2",sans-serif;text-transform:uppercase;color:#1272b3!important;text-decoration:none!important}' +
    '.hsp-arts{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin:8px 0 18px}.hsp-art{display:block;border-radius:10px;background:#1272b3;color:#fff!important;padding:14px 16px;text-decoration:none!important}' +
    '.hsp-art:hover{background:#0d5a8f}.hsp-art span{font-weight:700;display:block;font-size:15px}.hsp-art small{color:#cfe6f7;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:4px;font-size:13px}' +
    '.hsp .hss-more{max-width:360px;margin:20px auto 0}' +
    '@media(max-width:520px){.hsp-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.hsp-img{height:110px}.hsp-card{padding:8px}.hsp-name{font-size:14px}.hsp-bot{flex-direction:column;align-items:stretch}.hsp-title{font-size:21px}.hsp-card .hss-tag:nth-of-type(n+2){display:none}}' +
    'body.hsp-on main.content > *:not(.hsp){display:none!important}' +
    '.hss-pend{font:600 12.5px "Source Sans 3",sans-serif;color:#6b7680}.hss-pulse{animation:hssp 1.2s ease-in-out infinite}@keyframes hssp{50%{opacity:.4}}@media (prefers-reduced-motion:reduce){.hss-pulse{animation:none}}' +
    '.search-whisperer{display:none!important}';

  var thumb = function (u, size) { return u ? u.replace(/\/shop\/(orig|big|detail)\//, '/shop/' + (size || 'related') + '/') : ''; };
  var imgTag = function (u, cls, size) { return '<img class="' + cls + '" loading="lazy" alt="" src="' + esc(thumb(u, size)) + '" onerror="this.onerror=null;this.src=\'' + esc(u) + '\'">'; };

  function hl(name, pq) {
    var alts = [];
    pq.terms.forEach(function (t) { t.alts.forEach(function (a) { alts.push([a, t.exact]); }); });
    return name.split(/(\s+)/).map(function (w) {
      var ts = toks(w);
      var hit = ts.length && ts.some(function (x) { return alts.some(function (a) { return mt(x, a[0], a[1]); }); });
      return hit ? '<b>' + esc(w) + '</b>' : esc(w);
    }).join('');
  }
  function availHtml(p) {
    if (p.ok) return '<span class="hss-ok">' + T.stock + ' (' + (p.s > 50 ? '>50' : Math.round(p.s)) + ' ' + T.pcs + ')</span>';
    if (p.ext) return '<span class="hss-warn">' + T.central + '</span>';
    var a = norm(p.a);
    if (/dodani|objednavk|deliver|to order|on order|within/.test(a)) return '<span class="hss-warn">' + esc(p.a) + '</span>';
    return '<span class="hss-no">' + esc(p.a || T.unavail) + '</span>';
  }
  function flagHtml(p) {
    var h = '';
    if (p.fl.indexOf('tip') >= 0) h += '<span class="hss-flag hss-f-tip">' + T.tip + '</span>';
    if (NEW.indexOf(p) >= 0) h += '<span class="hss-flag hss-f-new">' + T.isNew + '</span>';
    if (p.un && !PL && RATIO === 1) {
      var d = Math.ceil((new Date(p.un + 'T23:59:59') - new Date()) / 864e5);
      if (d <= 7) h += '<span class="hss-flag hss-f-sale">' + (d <= 1 ? T.saleToday : T.saleDays(d)) + '</span>';
    }
    return h;
  }
  /* ---------- ceny pre prihlásených zákazníkov s vlastným cenníkom ----------
     Index obsahuje len verejné ceny. Veľkoobchodné ceny sa nikde nezverejňujú: pre zákazníka
     s vlastným cenníkom si ich načítame priamo zo Shoptetu (zo stránky produktu, len pre zobrazené
     produkty) a uložíme do jeho prehliadača na 30 minút. Pri percentuálnej zľave skupiny len prepočítame. */
  var CU = DL0.customer || {};
  var PL = CU.registered && +CU.priceListId && +CU.priceListId !== 1 ? +CU.priceListId : 0;
  var RATIO = CU.registered && !PL && +CU.priceRatio && +CU.priceRatio !== 1 ? +CU.priceRatio : 1;
  var LP = {}, LPKEY = 'hss_lp_' + PL + '_' + L, lpQ = [], lpRun = 0;
  if (PL) { try { var lpc = JSON.parse(sessionStorage.getItem(LPKEY) || 'null'); if (lpc && Date.now() - lpc.t < 1800000) LP = lpc.d || {}; } catch (e) {} }
  function lpSave() { try { var d = {}; Object.keys(LP).forEach(function (k) { if (typeof LP[k] === 'object') d[k] = LP[k]; }); sessionStorage.setItem(LPKEY, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} }
  function fetchPrice(u) {
    return fetch(u, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok || !r.body) throw new Error('price ' + r.status);
      var rd = r.body.getReader(), dec = new TextDecoder(), buf = '';
      var pump = function () {
        return rd.read().then(function (x) {
          if (!x.done) buf += dec.decode(x.value, { stream: true });
          var i = buf.indexOf('price-final-holder');
          if (!x.done && !(i >= 0 && buf.length > i + 1500)) return pump();
          try { rd.cancel(); } catch (e) {}
          var seg = i >= 0 ? buf.slice(i - 40, i + 1500) : '';
          var f = (seg.match(/class="price-final-holder"[^>]*>([^<]*)</) || [])[1];
          var x2 = (seg.match(/class="price-additional"[^>]*>([^<]*)</) || [])[1];
          if (!f || !/\d/.test(f)) throw new Error('price not found');
          return { f: f.replace(/\s+/g, ' ').trim(), x: x2 ? x2.replace(/\s+/g, ' ').trim() : '' };
        });
      };
      return pump();
    });
  }
  function lpPaint(u) {
    document.querySelectorAll('[data-pu]').forEach(function (el) { if (el.getAttribute('data-pu') === u) el.innerHTML = priceInner(u, el.getAttribute('data-pm') === '1'); });
  }
  function lpNext() {
    while (lpRun < 4 && lpQ.length) {
      var u = lpQ.shift(); lpRun++;
      (function (u) {
        fetchPrice(u).then(function (v) { LP[u] = v; }).catch(function () { LP[u] = 'err'; })
          .then(function () { lpRun--; lpSave(); lpPaint(u); lpNext(); });
      })(u);
    }
  }
  function livePrices(list) {
    if (!PL) return;
    list.forEach(function (p) { if (p && !LP[p.u]) { LP[p.u] = 'pending'; lpQ.push(p.u); } });
    lpNext();
  }
  function priceInner(u, mini) {
    var v = LP[u];
    if (v && typeof v === 'object') return mini ? esc(v.f) : '<strong>' + esc(v.f) + '</strong>' + (v.x ? '<div class="hss-old" style="text-decoration:none">' + esc(v.x) + '</div>' : '');
    if (v === 'err') return '<span class="hss-pend">' + T.priceInDetail + '</span>';
    return '<span class="hss-pend hss-pulse">' + T.yourPrice + '</span>';
  }
  function priceHtml(p) {
    if (PL) return '<div data-pu="' + esc(p.u) + '">' + priceInner(p.u) + '</div>';
    if (RATIO !== 1) return '<strong>' + (p.f ? T.from : '') + money(p.p * RATIO) + '</strong>';
    return '<strong>' + (p.f ? T.from : '') + money(p.p) + '</strong>' + (p.o ? '<div class="hss-old">' + money(p.o) + '</div>' : '');
  }
  function priceText(p) {
    if (PL) return '<span data-pu="' + esc(p.u) + '" data-pm="1">' + priceInner(p.u, true) + '</span>';
    return money(p.p * RATIO) + (RATIO === 1 && p.o ? ' <span class="hss-old" style="display:inline">' + money(p.o) + '</span>' : '');
  }
  function canCart() { return !!(window.shoptet && shoptet.cartShared && typeof shoptet.cartShared.addToCart === 'function'); }
  function row(p, pq, i) {
    var fl = flagHtml(p), alt = '';
    if (!p.ok && p.al.length) {
      for (var k = 0; k < p.al.length; k++) {
        var a = IX.byCode.get(p.al[k]);
        if (a && a.ok) { alt = '<div class="hss-alt">' + T.similar + ' <a href="' + esc(a.u) + '">' + esc(a.n) + '</a>' + (PL ? '' : ' ' + T['for'] + ' ' + money(a.p * RATIO)) + '</div>'; break; }
      }
    }
    var tags = p.proto.slice(0, 3).map(function (x) { return '<span class="hss-tag">' + x + '</span>'; }).join('') +
      (p.fl.indexOf('custom3') >= 0 ? '<span class="hss-tag">' + T.homey + '</span>' : '') +
      (p.fl.indexOf('custom1') >= 0 ? '<span class="hss-tag">' + T.fibaro + '</span>' : '');
    return '<div class="hss-row" data-i="' + i + '" data-u="' + esc(p.u) + '">' + imgTag(p.i, 'hss-img') +
      '<div class="hss-body">' + (fl ? '<div>' + fl + '</div>' : '') +
      '<a class="hss-name" href="' + esc(p.u) + '">' + hl(p.n, pq) + '</a>' +
      '<div class="hss-meta">' + availHtml(p) + tags + '</div>' + alt + '</div>' +
      '<div class="hss-price">' + priceHtml(p) + (p.ok && !p.f && !p.v && canCart() ? '<div><button type="button" class="hss-cart" data-c="' + esc(p.c) + '">' + T.cart + '</button></div>' : '') + '</div></div>';
  }
  function karlikHtml() {
    return '<div class="hss-karlik"><div><div class="hss-h" style="margin:0 0 4px">' + T.karTitle + '</div><div class="hss-note" style="margin:0">' + T.karText + '</div></div><div class="hss-chips" style="margin:8px 0 0">' +
      KARLIK.series.map(function (s) { return '<a class="hss-chip" href="' + esc(s[1]) + '">' + esc(s[0]) + '</a>'; }).join('') +
      '<a class="hss-chip on" href="' + esc(KARLIK.all) + '">' + T.karAll + '</a></div></div>';
  }
  function artHtml(a) { return '<a class="hss-art" href="' + esc(a.u) + '"><span>' + esc(a.t) + '</span>' + (a.d ? '<small>' + esc(a.d) + '</small>' : '') + '</a>'; }

  function emptyHtml() {
    var rec = recent(), h = '<div class="hss-wrap"><div class="hss-main">';
    if (rec.length) h += '<div class="hss-h">' + T.recent + '</div><div class="hss-chips">' + rec.map(function (x) { return '<button type="button" class="hss-chip" data-q="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>';
    h += '<div class="hss-h">' + T.popular + '</div><div class="hss-chips">' + POPULAR.map(function (x) { return '<button type="button" class="hss-chip" data-q="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>';
    var nw = NEW.filter(function (p) { return p.ok; }).slice(0, C.news);
    if (nw.length) h += '<div class="hss-h">' + T.news + '</div><div class="hss-grid">' + nw.map(function (p) {
      return '<a class="hss-card" href="' + esc(p.u) + '">' + imgTag(p.i, '', 'detail_small') + '<div class="n">' + esc(p.n) + '</div><div class="pr">' + priceText(p) + '</div></a>';
    }).join('') + '</div>';
    h += '</div><div class="hss-side">';
    var sale = IX.P.filter(function (p) { return p.ok && p.un; }).sort(function (a, b) { return a.un < b.un ? -1 : 1; }).slice(0, 4);
    if (sale.length < 3) sale = IX.P.filter(function (p) { return p.ok && p.o; }).sort(function (a, b) { return (b.o - b.p) / b.o - (a.o - a.p) / a.o; }).slice(0, 4);
    if (sale.length) h += '<div class="hss-h">' + T.sale + '</div>' + sale.map(function (p) {
      return '<a class="hss-mini" href="' + esc(p.u) + '">' + imgTag(p.i, '') + '<div><div class="n">' + esc(p.n) + '</div><div class="pr">' + priceText(p) + '</div></div></a>';
    }).join('');
    return h + '</div></div>';
  }

  var st = { q: '', f: null, all: false, lim: 30, act: -1, list: [] };
  function results() {
    var q = input.value, r = search(q), pq = r.pq;
    var list = st.f ? r.res.filter(function (x) { return x.p.proto.indexOf(st.f) >= 0; }) : r.res;
    var shown = list.slice(0, st.all ? st.lim : C.drop);
    st.list = shown.map(function (x) { return x.p; });
    var arts = searchArticles(pq), main = '', side = '';
    if (pq.fixes.length) main += '<div class="hss-note">' + T.fixed + ' <strong>' + esc(pq.fixes.join(', ')) + '</strong></div>';
    if (pq.labels.length) main += '<div class="hss-note">' + T.looking + ' <strong>' + esc(pq.labels.join(', ')) + '</strong></div>';
    if (pq.intent && arts.length) main += '<div class="hss-h">' + T.guides + '</div>' + arts.slice(0, 3).map(artHtml).join('') + '<div class="hss-h">' + T.products + '</div>';
    var pc = {};
    r.res.forEach(function (x) { x.p.proto.forEach(function (k) { pc[k] = (pc[k] || 0) + 1; }); });
    var pk = Object.keys(pc).filter(function (k) { return pc[k] < r.res.length || st.f === k; });
    if (r.res.length > 3 && pk.length) main += '<div class="hss-chips">' + PROTOS.map(function (x) { return x[1]; }).filter(function (k) { return pk.indexOf(k) >= 0; }).map(function (k) {
      return '<button type="button" class="hss-chip' + (st.f === k ? ' on' : '') + '" data-f="' + k + '">' + k + ' <span style="opacity:.7">' + pc[k] + '</span></button>';
    }).join('') + '</div>';
    if (shown.length && shown[0].partial) main += '<div class="hss-note">' + T.partial + '</div>';
    var kq = spaced(q), kStrong = /\b(karlik\w*|deco|icon|ramik\w*|ramcek\w*|ramc\w*|ramec\w*|frames?)\b/.test(kq), kWeak = /\b(vypinac\w*|zasuvk\w*|dvojzasuvk\w*|switch\w*|sockets?)\b/.test(kq);
    if (!shown.length && !(KARLIK && kStrong)) main += '<div class="hss-empty">' + T.none1 + esc(q) + T.none2 + '<a href="' + esc(CONTACT) + '">' + T.none3 + '</a>' + T.none4 + '</div>';
    if (KARLIK && kStrong) main += karlikHtml();
    main += shown.map(function (x, i) { return row(x.p, pq, i); }).join('');
    if (KARLIK && kWeak && !kStrong) main += karlikHtml();
    var top = shown.slice(0, 8).map(function (x) { return x.p; });
    var isHub = pq.labels.indexOf(HUBLABEL) >= 0;
    var zb = top.filter(function (p) { return p.proto.indexOf('Zigbee') >= 0 && p.proto.indexOf('Wi-Fi') < 0; }).length;
    var zw = top.filter(function (p) { return p.proto.indexOf('Z-Wave') >= 0; }).length;
    if (!isHub && top.length && (zb >= 2 || zw >= 2)) {
      var zig = zb >= zw, cl = (HUB && HUB[zig ? 'zigbee' : 'zwave']) || catLink(zig ? 'Riadiace jednotky ZigBee' : 'Riadiace jednotky Z-Wave');
      var lk = cl ? '<a href="' + esc(cl) + '">' : '<a href="#" data-q="' + (zig ? T.zigQ : T.zwQ) + '">';
      main += '<div class="hss-hint"><span>' + (zig ? T.zigHint : T.zwHint) +
        T.ifNot + lk + T.seeHubs + '</a>.</span></div>';
    }
    if (list.length > shown.length) main += '<button type="button" class="hss-more" data-more="1">' + T.showAll(list.length) + '</button>';
    if (C.debug) main += '<div class="hss-foot">Nové vyhľadávanie · <a href="/vyhladavanie/?string=' + encodeURIComponent(q) + '">porovnať s pôvodným vyhľadávaním</a></div>';
    var cc = {}, cn = {};
    r.res.forEach(function (x) {
      Array.from(new Set(x.p.cat.concat(x.p.dc).map(function (c) { return c.split('>').pop().trim(); }))).forEach(function (c) {
        var last = c.split('>').pop().trim();
        if (CATX.test(norm(last)) && !(/homey/i.test(last) && pq.labels.indexOf('Homey') >= 0)) return;
        if (!catLink(last)) return;
        var gm = pq.terms.some(function (t) { return t.group && t.alts.some(function (al) { return toks(last).some(function (x) { return mt(x, al); }); }); });
        cc[last] = (cc[last] || 0) + (gm ? 6 : 1); cn[last] = (cn[last] || 0) + 1;
      });
    });
    var cats = Object.keys(cc).sort(function (a, b) { return cc[b] - cc[a]; });
    if (cats.length && cc[cats[0]] >= 6) cats = cats.filter(function (c) { return cc[c] >= 6; });
    cats = cats.slice(0, 4);
    if (cats.length) side += '<div class="hss-h">' + T.cats + '</div>' + cats.map(function (c) { return '<a class="hss-cat" href="' + esc(catLink(c)) + '"><span>' + esc(c) + '</span><b>' + cn[c] + '</b></a>'; }).join('');
    if (!pq.intent && arts.length) side += '<div class="hss-blogbox"><div class="hss-h">' + T.blog + '</div>' + arts.slice(0, 2).map(artHtml).join('') + '<a class="hss-blogall" href="' + T.blogUrl + '">' + T.allArts + '</a></div>';
    track(q, r.res.length);
    return side ? '<div class="hss-wrap"><div class="hss-main">' + main + '</div><div class="hss-side">' + side + '</div></div>' : '<div class="hss-main">' + main + '</div>';
  }

  /* ---------- stránka s výsledkami (/vyhladavanie/?string=...) ---------- */
  var PG = { q: '', f: null, stock: false, sort: 'rel', lim: 24, root: null };
  function plural(n) { return T.plural(n); }
  function isSearchPage() { return location.pathname.replace(/\/?$/, '/') === LANGS[L].search; }
  function pageQuery() { try { return (new URLSearchParams(location.search).get('string') || '').trim(); } catch (e) { return ''; } }
  function goSearch(q) {
    q = (q || '').trim();
    if (spaced(q).length < 2) { if (input) input.focus(); return; }
    remember(q); hide();
    var url = LANGS[L].search + '?string=' + encodeURIComponent(q);
    if (isSearchPage() && PG.root) {
      history.pushState(null, '', url);
      PG.q = q; PG.f = null; PG.lim = 24;
      if (input) input.blur();
      renderPage(); window.scrollTo(0, 0);
    } else location.href = url;
  }
  function catsFor(res, pq) {
    var cc = {}, cn = {};
    res.forEach(function (p) {
      Array.from(new Set(p.cat.concat(p.dc).map(function (c) { return c.split('>').pop().trim(); }))).forEach(function (last) {
        if (!last || CATX.test(norm(last))) return;
        if (!catLink(last)) return;
        var gm = pq.terms.some(function (t) { return t.group && t.alts.some(function (al) { return toks(last).some(function (x) { return mt(x, al); }); }); });
        cc[last] = (cc[last] || 0) + (gm ? 6 : 1); cn[last] = (cn[last] || 0) + 1;
      });
    });
    var cats = Object.keys(cc).sort(function (a, b) { return cc[b] - cc[a]; });
    if (cats.length && cc[cats[0]] >= 6) cats = cats.filter(function (c) { return cc[c] >= 6; });
    return cats.slice(0, 6).map(function (c) { return [c, cn[c]]; });
  }
  function card(p, pq, i) {
    var alt = '';
    if (!p.ok && p.al.length) for (var k = 0; k < p.al.length; k++) { var a = IX.byCode.get(p.al[k]); if (a && a.ok) { alt = '<div class="hss-alt">' + T.similar + ' <a href="' + esc(a.u) + '">' + esc(a.n) + '</a></div>'; break; } }
    var tags = p.proto.slice(0, 2).map(function (x) { return '<span class="hss-tag">' + x + '</span>'; }).join('') +
      (p.fl.indexOf('custom3') >= 0 ? '<span class="hss-tag">' + T.homey + '</span>' : '') + (p.fl.indexOf('custom1') >= 0 ? '<span class="hss-tag">' + T.fibaro + '</span>' : '');
    return '<div class="hsp-card" data-i="' + (i || 0) + '" data-u="' + esc(p.u) + '"><div class="hsp-flags">' + flagHtml(p) + '</div>' +
      '<a href="' + esc(p.u) + '" tabindex="-1">' + imgTag(p.i, 'hsp-img', 'detail_small') + '</a>' +
      '<a class="hsp-name" href="' + esc(p.u) + '">' + hl(p.n, pq) + '</a>' +
      '<div class="hss-meta">' + availHtml(p) + tags + '</div>' + alt +
      '<div class="hsp-bot"><div class="hss-price">' + priceHtml(p) + '</div>' +
      (p.ok && !p.f && !p.v && canCart() ? '<button type="button" class="hss-cart" data-c="' + esc(p.c) + '">' + T.cart + '</button>' : '<a class="hsp-detail" href="' + esc(p.u) + '">' + T.detail + '</a>') + '</div></div>';
  }
  function renderPage() {
    if (!PG.root || !IX) return;
    var q = PG.q, h = '';
    document.querySelectorAll('input[name="string"]').forEach(function (i) { if (document.activeElement !== i) i.value = q; });
    if (spaced(q).length < 2) {
      PG.root.innerHTML = '<h1 class="hsp-title">' + T.search + '</h1><div class="hsp-sub">' + T.searchHint + '</div><div class="hss-chips">' +
        POPULAR.map(function (x) { return '<button type="button" class="hss-chip" data-q="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>';
      return;
    }
    var r = search(q), pq = r.pq, all = r.res.map(function (x) { return x.p; }), partial = r.res.length && r.res[0].partial;
    PG.shown = null;
    var list = all.filter(function (p) { return (!PG.f || p.proto.indexOf(PG.f) >= 0) && (!PG.stock || p.ok); });
    if (PG.sort === 'asc') list = list.slice().sort(function (a, b) { return a.p - b.p; });
    if (PG.sort === 'desc') list = list.slice().sort(function (a, b) { return b.p - a.p; });
    PG.shown = list;
    var arts = searchArticles(pq), cats = catsFor(all.slice(0, 60), pq);
    var kq = spaced(q), kStrong = /\b(karlik\w*|deco|icon|ramik\w*|ramcek\w*|ramc\w*|ramec\w*|frames?)\b/.test(kq), kWeak = /\b(vypinac\w*|zasuvk\w*|dvojzasuvk\w*|switch\w*|sockets?)\b/.test(kq);
    h += '<h1 class="hsp-title">' + T.resFor + ' ' + T.q1 + esc(q) + T.q2 + '</h1><div class="hsp-sub">' + all.length + ' ' + plural(all.length) +
      (pq.fixes.length ? ' · ' + T.fixedLow + ' <strong>' + esc(pq.fixes.join(', ')) + '</strong>' : '') +
      (pq.labels.length ? ' · ' + T.lookingLow + ' <strong>' + esc(pq.labels.join(', ')) + '</strong>' : '') + '</div>';
    if (KARLIK && kStrong) h += karlikHtml();
    if (cats.length) h += '<div class="hsp-cats">' + cats.map(function (c) { return '<a class="hsp-cat" href="' + esc(catLink(c[0])) + '">' + esc(c[0]) + ' <b>' + c[1] + '</b></a>'; }).join('') + '</div>';
    if (pq.intent && arts.length) h += '<div class="hss-h">' + T.guides + '</div><div class="hsp-arts">' + arts.slice(0, 3).map(function (a) { return '<a class="hsp-art" href="' + esc(a.u) + '"><span>' + esc(a.t) + '</span>' + (a.d ? '<small>' + esc(a.d) + '</small>' : '') + '</a>'; }).join('') + '</div>';
    if (all.length) {
      var pc = {}; all.forEach(function (p) { p.proto.forEach(function (k) { pc[k] = (pc[k] || 0) + 1; }); });
      var pk = PROTOS.map(function (x) { return x[1]; }).filter(function (k) { return pc[k] && (pc[k] < all.length || PG.f === k); });
      h += '<div class="hsp-bar"><div class="hss-chips" style="margin:0">' +
        '<button type="button" class="hss-chip' + (PG.stock ? ' on' : '') + '" data-stock="1">' + T.onlyStock + '</button>' +
        pk.map(function (k) { return '<button type="button" class="hss-chip' + (PG.f === k ? ' on' : '') + '" data-pf="' + k + '">' + k + ' <span style="opacity:.7">' + pc[k] + '</span></button>'; }).join('') +
        '</div><select class="hsp-sort" aria-label="' + T.sort + '"><option value="rel"' + (PG.sort === 'rel' ? ' selected' : '') + '>' + T.rel + '</option><option value="asc"' + (PG.sort === 'asc' ? ' selected' : '') + '>' + T.asc + '</option><option value="desc"' + (PG.sort === 'desc' ? ' selected' : '') + '>' + T.desc + '</option></select></div>';
    }
    if (partial) h += '<div class="hss-note">' + T.partial + '</div>';
    if (!all.length && !(KARLIK && kStrong)) h += '<div class="hss-empty">' + T.none1 + esc(q) + T.none2 + '<a href="' + esc(CONTACT) + '">' + T.none3 + '</a>' + T.none4 + '</div><div class="hss-chips">' +
      POPULAR.map(function (x) { return '<button type="button" class="hss-chip" data-q="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>';
    if (all.length && !list.length) h += '<div class="hss-empty">' + T.noFilter + '</div>';
    h += '<div class="hsp-grid">' + list.slice(0, PG.lim).map(function (p, i) { return card(p, pq, i); }).join('') + '</div>';
    if (list.length > PG.lim) h += '<button type="button" class="hss-more" data-pmore="1">' + T.more + ' (' + (list.length - PG.lim) + ')</button>';
    var zb = list.slice(0, 12).filter(function (p) { return p.proto.indexOf('Zigbee') >= 0 && p.proto.indexOf('Wi-Fi') < 0; }).length;
    var zw = list.slice(0, 12).filter(function (p) { return p.proto.indexOf('Z-Wave') >= 0; }).length;
    if (pq.labels.indexOf(HUBLABEL) < 0 && (zb >= 2 || zw >= 2)) {
      var zig = zb >= zw, cl = (HUB && HUB[zig ? 'zigbee' : 'zwave']) || catLink(zig ? 'Riadiace jednotky ZigBee' : 'Riadiace jednotky Z-Wave');
      h += '<div class="hss-hint"><span>' + (zig ? T.zigHint : T.zwHint) +
        T.ifNot + (cl ? '<a href="' + esc(cl) + '">' : '<a href="#" data-q="' + (zig ? T.zigQ : T.zwQ) + '">') + T.seeHubs + '</a>.</span></div>';
    }
    if (KARLIK && kWeak && !kStrong) h += karlikHtml();
    if (!pq.intent && arts.length) h += '<div class="hss-h" style="margin-top:28px">' + T.blog + '</div><div class="hsp-arts">' + arts.slice(0, 3).map(function (a) { return '<a class="hsp-art" href="' + esc(a.u) + '"><span>' + esc(a.t) + '</span>' + (a.d ? '<small>' + esc(a.d) + '</small>' : '') + '</a>'; }).join('') + '</div>';
    PG.root.innerHTML = h;
    if (PL) livePrices(list.slice(0, PG.lim));
    document.title = T.resFor + ' ' + T.q1 + q + T.q2 + ' | HomeSystem';
    track(q, all.length);
  }
  function onPageClick(ev) {
    var t = ev.target, q = t.closest('[data-q]'), pf = t.closest('[data-pf]'), sk = t.closest('[data-stock]'), pm = t.closest('[data-pmore]'), cart = t.closest('[data-c]');
    if (q) { ev.preventDefault(); goSearch(q.getAttribute('data-q')); return; }
    if (pf) { var k = pf.getAttribute('data-pf'); PG.f = PG.f === k ? null : k; PG.lim = 24; renderPage(); return; }
    if (sk) { PG.stock = !PG.stock; PG.lim = 24; renderPage(); return; }
    if (pm) { PG.lim += 24; renderPage(); return; }
    if (cart) {
      ev.preventDefault();
      var cc = cart.closest('.hsp-card');
      if (cc && PG.shown) trackItem(PG.shown[+cc.getAttribute('data-i')], +cc.getAttribute('data-i') + 1, 'page', PG.q, 'search_add_to_cart');
      try { shoptet.cartShared.addToCart({ productCode: cart.getAttribute('data-c') }); cart.textContent = T.added; }
      catch (e) { var p = IX.byCode.get(cart.getAttribute('data-c')); if (p) location.href = p.u; }
      return;
    }
    var c = t.closest('.hsp-card');
    if (c && !t.closest('.hss-alt') && PG.shown) trackItem(PG.shown[+c.getAttribute('data-i')], +c.getAttribute('data-i') + 1, 'page', PG.q);
    else trackLink(t, PG.q, 'page');
    if (t.closest('a[href]')) return;
    if (c) location.href = c.getAttribute('data-u');
  }
  function initPage(start) {
    var main = document.querySelector('main.content') || document.getElementById('content');
    if (!main) return;
    PG.q = pageQuery();
    PG.root = document.createElement('div'); PG.root.className = 'hsp';
    PG.root.innerHTML = '<div class="hsp-load">' + T.searching + '</div>';
    main.insertBefore(PG.root, main.firstChild);
    document.body.classList.add('hsp-on');
    PG.root.addEventListener('click', onPageClick);
    PG.root.addEventListener('change', function (e) { if (e.target.classList.contains('hsp-sort')) { PG.sort = e.target.value; renderPage(); } });
    window.addEventListener('popstate', function () { PG.q = pageQuery(); PG.f = null; PG.lim = 24; renderPage(); });
    var l = start();
    if (!l) { document.body.classList.remove('hsp-on'); PG.root.remove(); PG.root = null; return; }
    l.then(renderPage).catch(function () { document.body.classList.remove('hsp-on'); if (PG.root) PG.root.remove(); PG.root = null; });
  }

  /* ---------- recent searches, tracking ---------- */
  function recent() { try { return JSON.parse(localStorage.getItem(RKEY) || '[]'); } catch (e) { return []; } }
  function remember(q) {
    q = (q || '').trim(); if (q.length < 2) return;
    try { var r = recent().filter(function (x) { return x !== q; }); r.unshift(q); localStorage.setItem(RKEY, JSON.stringify(r.slice(0, 5))); } catch (e) {}
  }
  var tTimer = null;
  function track(q, n) {
    if (!C.track) return;
    clearTimeout(tTimer);
    tTimer = setTimeout(function () {
      if (typeof window.gtag !== 'function') return;
      gtag('event', 'search', { search_term: q, results_count: n, language: L, send_to: C.ga });
      if (!n) gtag('event', 'search_no_results', { search_term: q, language: L, send_to: C.ga });
    }, 1500);
  }
  /* kliknutia z vyhľadávania: na ktorý produkt / kategóriu / článok ľudia klikli a na akej pozícii */
  function ga(name, params) { if (C.track && typeof window.gtag === 'function') { try { params.language = L; params.send_to = C.ga; gtag('event', name, params); } catch (e) {} } }
  function trackItem(p, pos, where, q, ev) {
    if (!p) return;
    ga(ev || 'select_item', { item_list_id: 'hss_' + where, item_list_name: where === 'page' ? 'Vyhľadávanie – stránka' : 'Vyhľadávanie – okno', search_term: q, result_position: pos,
      items: [{ item_id: p.c, item_name: p.n, item_brand: p.m, price: p.p, index: pos, item_list_name: where === 'page' ? 'Vyhľadávanie – stránka' : 'Vyhľadávanie – okno' }] });
  }
  function trackLink(t, q, where) {
    var a = t.closest('a[href]'); if (!a) return;
    var type = a.closest('.hss-cat, .hsp-cat') ? 'kategoria' : a.closest('.hss-art, .hsp-art') ? 'clanok' : a.closest('.hss-karlik') ? 'karlik' : a.closest('.hss-alt') ? 'alternativa' : a.closest('.hss-card, .hss-mini') ? 'novinka_akcia' : a.closest('.hss-hint') ? 'riadiace_jednotky' : null;
    if (type) ga('search_link_click', { link_type: type, link_text: (a.querySelector('span') ? a.querySelector('span').textContent : a.textContent.replace(a.querySelector('b') ? a.querySelector('b').textContent : '', '')).replace(/\s+/g, ' ').trim().slice(0, 100), link_url: a.getAttribute('href'), search_term: q, list: where });
  }

  /* ---------- panel + input wiring ---------- */
  var panel, input, ov, open = false, FAIL = false, styleEl = null;
  function place() {
    var r = input.getBoundingClientRect(), vw = window.innerWidth, w = Math.min(860, vw - 16);
    var left = Math.min(Math.max(8, r.left), vw - w - 8);
    if (vw < 720) { w = vw - 16; left = 8; }
    panel.style.width = w + 'px'; panel.style.left = left + 'px'; panel.style.top = (r.bottom + 6) + 'px';
    panel.style.maxHeight = Math.max(240, window.innerHeight - r.bottom - 16) + 'px';
    var W = window.innerWidth, H = window.innerHeight, ir = r, fr = input.form ? input.form.getBoundingClientRect() : r;
    if (!fr.width || fr.height > 120) fr = ir;
    var hx = Math.min(ir.left, fr.left) - 4, hy = Math.min(ir.top, fr.top) - 4;
    var hw = Math.max(ir.right, fr.right) + 4 - hx, hh = Math.max(ir.bottom, fr.bottom) + 4 - hy;
    var ps = ov.children, R = [[0, 0, W, hy], [0, hy + hh, W, H - hy - hh], [0, hy, hx, hh], [hx + hw, hy, W - hx - hw, hh]];
    for (var k = 0; k < 4; k++) { var sx = ps[k].style; sx.left = R[k][0] + 'px'; sx.top = R[k][1] + 'px'; sx.width = Math.max(0, R[k][2]) + 'px'; sx.height = Math.max(0, R[k][3]) + 'px'; }
  }
  function render() {
    if (!open) return;
    place();
    if (!IX) { panel.innerHTML = '<div class="hss-main"><div class="hss-empty">' + T.loading + '</div></div>'; return; }
    st.act = -1;
    panel.innerHTML = spaced(input.value).length < 2 ? emptyHtml() : results();
    if (PL) { var pus = {}; panel.querySelectorAll('[data-pu]').forEach(function (el) { pus[el.getAttribute('data-pu')] = 1; }); livePrices(Object.keys(pus).map(function (u) { return IX.byUrl.get(u); })); }
  }
  function follow() {
    if (!open) return;
    var rr = input ? input.getBoundingClientRect() : null;
    if (!rr || !rr.width || !rr.height) { hide(); return; }
    place(); requestAnimationFrame(follow);
  }
  function show() { if (FAIL) return; var was = open; open = true; panel.classList.add('open'); ov.classList.add('on'); render(); if (!was) requestAnimationFrame(follow); }
  function hide() { open = false; panel.classList.remove('open'); ov.classList.remove('on'); }
  function go(u) { remember(input.value); location.href = u; }
  function setAct(d) {
    var rows = panel.querySelectorAll('.hss-row'); if (!rows.length) return;
    st.act = (st.act + d + rows.length) % rows.length;
    rows.forEach(function (r, i) { r.classList.toggle('act', i === st.act); });
    rows[st.act].scrollIntoView({ block: 'nearest' });
  }
  function onClick(ev) {
    var t = ev.target, q = t.closest('[data-q]'), f = t.closest('[data-f]'), more = t.closest('[data-more]'), cart = t.closest('[data-c]');
    if (q) { ev.preventDefault(); input.value = q.getAttribute('data-q'); st.f = null; st.all = false; input.focus(); render(); return; }
    if (f) { var k = f.getAttribute('data-f'); st.f = st.f === k ? null : k; render(); return; }
    if (more) { goSearch(input.value); return; }
    if (cart) {
      ev.preventDefault();
      var cr = cart.closest('.hss-row');
      if (cr) trackItem(st.list[+cr.getAttribute('data-i')], +cr.getAttribute('data-i') + 1, 'dropdown', input.value, 'search_add_to_cart');
      try {
        shoptet.cartShared.addToCart({ productCode: cart.getAttribute('data-c') });
        cart.textContent = T.added;
        /* zavrieť okno, aby bolo vidno potvrdenie Shoptetu (a na mobile sa nezasekla obrazovka) */
        hide(); if (input) input.blur();
      }
      catch (e) { var p = IX.byCode.get(cart.getAttribute('data-c')); if (p) go(p.u); }
      return;
    }
    var r = t.closest('.hss-row');
    if (r && !t.closest('.hss-alt')) trackItem(st.list[+r.getAttribute('data-i')], +r.getAttribute('data-i') + 1, 'dropdown', input.value);
    else trackLink(t, input.value, 'dropdown');
    var a = t.closest('a[href]');
    if (a) { remember(input.value); return; }
    if (r) go(r.getAttribute('data-u'));
  }
  function attach(orig) {
    var inp = orig.cloneNode(true);
    inp.classList.remove('js-search-input');
    inp.setAttribute('autocomplete', 'off');
    orig.parentNode.replaceChild(inp, orig);
    var deb = null;
    inp.addEventListener('focus', function () { input = inp; show(); });
    inp.addEventListener('input', function () { input = inp; st.f = null; st.all = false; clearTimeout(deb); deb = setTimeout(function () { if (!open) show(); else render(); }, 60); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setAct(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setAct(-1); }
      else if (e.key === 'Escape') { hide(); inp.blur(); }
      else if (e.key === 'Enter') {
        if (FAIL) return;
        e.preventDefault(); e.stopPropagation();
        if (st.act >= 0 && st.list[st.act]) { trackItem(st.list[st.act], st.act + 1, 'dropdown', inp.value); go(st.list[st.act].u); }
        else { input = inp; goSearch(inp.value); }
      }
    });
    if (inp.form) inp.form.addEventListener('submit', function (e) {
      if (FAIL) return;
      e.preventDefault(); e.stopImmediatePropagation();
      input = inp;
      goSearch(inp.value);
    }, true);
  }
  function init() {
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); styleEl = s;
    panel = document.createElement('div'); panel.id = 'hss'; document.body.appendChild(panel);
    ov = document.createElement('div'); ov.id = 'hss-ov'; ov.innerHTML = '<i class="hss-ovp"></i><i class="hss-ovp"></i><i class="hss-ovp"></i><i class="hss-ovp"></i>'; document.body.appendChild(ov);
    panel.addEventListener('click', onClick);
    panel.addEventListener('mousedown', function (e) { if (!e.target.closest('a,button')) e.preventDefault(); });
    var ins = document.querySelectorAll('input.js-search-input, input[name="string"]');
    if (!ins.length) return;
    ins.forEach(attach);
    input = document.querySelector('#hss ~ * input[name="string"]') || document.querySelectorAll('input[name="string"]')[0];
    document.addEventListener('mousedown', function (e) { if (open && !panel.contains(e.target) && e.target !== input) hide(); });
    window.addEventListener('resize', function () { if (open) place(); });
    window.addEventListener('scroll', function () { if (open) place(); }, { passive: true });
    if (C.badge) { var b = document.createElement('div'); b.className = 'hss-badge'; b.textContent = 'Nové vyhľadávanie (testovací režim)'; document.body.appendChild(b); }
    collectLinks();
    var start = function () {
      if (loading) return loading;
      if (!C.indexUrl && !C.exportUrl && !window.__hsd) return null;
      if (C.exportUrl || window.__hsd) {
        loading = (window.__hsd ? Promise.resolve(fromXML(window.__hsd))
          : fetch(C.exportUrl).then(function (r) { return r.text(); }).then(function (t) { return fromXML(new DOMParser().parseFromString(t, 'text/xml')); }))
          .then(function (P) { IX = prep(P); render(); loadNew().then(render); loadSitemap().then(render); loadArticles().then(render); });
      } else {
        loading = fetch(C.indexUrl).then(function (r) { if (!r.ok) throw new Error('index ' + r.status); return r.json(); }).then(function (j) {
          j.p.forEach(function (p) { p.o = p.o || 0; p.f = !!p.f; p.un = p.un || ''; p.al = p.al || []; p.tp = p.tp || ''; p.sd = p.sd || ''; p.ean = p.ean || ''; p.fl = p.fl || []; p.cat = p.cat || []; p.dc = p.dc || ''; p.pr = p.pr || ''; p.a = p.a || ''; p.m = p.m || ''; });
          IX = prep(j.p);
          ART = prepArt(j.a || []);
          NEW = (j.n || []).map(function (c) { return IX.byCode.get(c); }).filter(Boolean);
          CATMAP = j.c || {}; KARLIK = j.k || null; HUB = j.h || null; if (j.ct) CONTACT = j.ct;
          render();
        });
      }
      loading.then(function () { window.HSS = { search: search, parse: parse, IX: IX, version: C.indexUrl, lang: L }; }).catch(function (e) {
        /* index sa nenačítal: vrátime pôvodné vyhľadávanie Shoptetu */
        console.warn('HSS', e); FAIL = true; hide();
        if (styleEl) styleEl.textContent = styleEl.textContent.replace('.search-whisperer{display:none!important}', '');
      });
      return loading;
    };
    document.querySelectorAll('input[name="string"]').forEach(function (i) {
      i.addEventListener('focus', start); i.addEventListener('pointerenter', start); i.addEventListener('touchstart', start, { passive: true });
    });
    if (isSearchPage()) initPage(start);
    else if ('requestIdleCallback' in window) requestIdleCallback(function () { setTimeout(start, 2500); }); else setTimeout(start, 4000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
