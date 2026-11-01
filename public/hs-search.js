/* HomeSystem.sk – nové vyhľadávanie v1.0 | index: index.json vedľa tohto súboru */
(function () {
  'use strict';
  if (window.__HSS_LOADED) return;
  var SRC = (document.currentScript && document.currentScript.src) || '';
  var C = Object.assign({
    exportUrl: null, indexUrl: SRC ? SRC.replace(/[?#].*$/, '').replace(/[^/]+$/, 'index.json') : null,
    test: /[?&]test=1/.test(SRC), track: true, badge: false, debug: false, drop: 8, contact: '/kontakty/'
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
  var money = function (v) { return '€' + v.toLocaleString('sk-SK', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
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
    { n: 'Ovládanie garáže', re: /garaz\w*( bran\w*)?|\bvrat[aiou]?\b/, alt: ['garaz', 'vrata', 'garage'] },
    { n: 'Senzory úniku vody', re: /zaplav\w*|vytop\w*|zatop\w*|flood|leak|unik\w* vod\w*/, alt: ['vytop', 'unik', 'flood', 'leak', 'zaplav'] },
    { n: 'Zavlažovanie', re: /zavlaz\w*|polievan\w*|zahrad\w*|irrigat\w*/, alt: ['zavlaz', 'polievan', 'zahrad', 'irrigat', 'hydro'] },
    { n: 'Štartovacie sady', re: /\bzacat\w*|zaciatok|zaciatocnik\w*|starter\w*|startovac\w*/, alt: ['starter', 'startovac', 'zvyhodnen'] },
    { n: 'Smart zásuvky', re: /\bplug\w*|zasuv\w*|predlzov\w*/, alt: ['zasuv', 'plug', 'predlzov'] },
    { n: 'Radiátorové hlavice', re: /(termostatick\w* )?hlavic\w*|\btrv\b|radiatorov\w*( hlav\w*)?/, alt: ['hlavic', '=trv', 'radiator'] },
    { n: 'Senzory dverí a okien', re: /\bdver\w*|\bokn\w*|\bokien\b|\bdoor\b|\bwindow\b/, alt: ['dver', 'okn', 'okien', '=door', '=window'] },
    { n: 'Senzory pohybu a prítomnosti', re: /pohyb\w*|\bpir\b|motion|pritomn\w*|mmwave|prezenc\w*/, alt: ['pohyb', 'pir', 'motion', 'pritomn', 'mmwave', 'presence'] },
    { n: 'Dymové senzory', re: /\bdym\w*|pozar\w*|smoke/, alt: ['dym', 'smoke', 'pozar'] },
    { n: 'Detektory CO', re: /oxid\w* uhol\w*|\bco\b (senzor\w*|detektor\w*)|(senzor\w*|detektor\w*) co\b/, alt: ['uhol', 'co'] },
    { n: 'Stmievače', re: /stmiev\w*|dimmer\w*/, alt: ['stmiev', 'dimmer'] },
    { n: 'Tienenie', re: /zaluzi\w*|rolet\w*|tienen\w*|\bshade\w*|\bblind\w*|roller\w*|markiz\w*/, alt: ['zaluz', 'rolet', 'shade', 'blind', 'roller', 'tienen', 'markiz'] },
    { n: 'Garniže', re: /garniz\w*|zaves\w*|zaclon\w*|curtain\w*/, alt: ['garniz', 'curtain', 'zaves', 'zaclon'] },
    { n: 'Kamery', re: /kamer\w*|camera\w*/, alt: ['kamer', 'camera', 'cam'] },
    { n: 'Zvončeky', re: /zvonc\w*|zvonek\w*|doorbell\w*|videozvon\w*/, alt: ['zvonc', 'zvonek', 'doorbell', 'videozvon'] },
    { n: 'Smart zámky', re: /zamk\w*|zamok|zamka|smartlock|\block\b/, alt: ['zamk', 'zamok', 'zamka', 'lock', 'smartlock'] },
    { n: 'Termostaty', re: /termostat(?!ick)\w*|thermostat\w*/, alt: ['termostat', 'thermostat'] },
    { n: 'Teplota a vlhkosť', re: /teplot\w*|vlhkost\w*|teplomer\w*|vlhkomer\w*|klimatick\w* senzor\w*/, alt: ['teplot', 'vlhk', 'teplomer', 'climate', 'klimatick'] },
    { n: 'Ovládanie klimatizácie', re: /klimatiz\w*|\bir\b|infra\w*/, alt: ['klimatiz', 'ir', 'infra'] },
    { n: 'Ventily na vodu', re: /ventil\w*|uzaver\w*|valve/, alt: ['ventil', 'uzaver', 'valve'] },
    { n: 'Meranie spotreby', re: /spotreb\w*|elektromer\w*|merac\w* energ\w*|energy|merani\w*/, alt: ['spotreb', 'elektromer', 'energ', 'merac', 'meran'] },
    { n: 'Nabíjanie elektromobilov', re: /elektromobil\w*|wallbox|nabijack\w*|\bev\b/, alt: ['elektromobil', 'wallbox', 'nabijack'] },
    { n: 'Sirény a alarmy', re: /siren\w*|alarm\w*|zabezpec\w*/, alt: ['siren', 'alarm', 'zabezpec', 'ajax'] },
    { n: 'Osvetlenie', re: /osvetlen\w*|svetl\w*|ziarov\w*|zarov\w*|\bbulb\w*|\bled\b/, alt: ['osvetl', 'svetl', 'ziarov', 'zarov', 'bulb', 'led'] },
    { n: 'Riadiace jednotky a brány', re: /\bhub\w*|centraln\w* jednot\w*|riadiac\w* jednot\w*|gateway|bridge|\bbran[aueyo]?\b|dongle|koordinator\w*/, alt: ['hub', 'gateway', 'bridge', 'bran', 'jednotk', 'controller', 'dongle', 'koordinator'] }
  ];
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
  var STOP = new Set('na do pre s so a cez v vo z zo k ku od pri po za ktory ktora ktore ktoru co chcem hladam potrebujem nejaky nejaka nejake nejaku mi moj moja moje ako je to sa by aj alebo ci the for with and of mobil mobilom mobilu telefon telefonom aplikaciu aplikacia appku app navod navody sprievodca tipy porovnanie rozdiel vybrat vyber aky aka ake recenzia'.split(' '));
  var SOFT = /^(senzor|detekt|cidl|smart|inteligent|home$|domac|zariaden|modul|system|ovladani)/;
  var INTENT = /\b(ako|navod\w*|sprievodc\w*|co je|aky|aka|ake|ktory|ktora|porovnan\w*|rozdiel\w*|zacat|zaciatok|tipy|recenzi\w*|vybrat|vyber)\b/;
  var ACC = /^(drziak|kryt|bateri|napajac|adapter|kabel|ramik|montaz|nahradn|prislus|redukc|magnet|nalepk|podlozk|2x|3x|4x)/;
  var POPULAR = ['senzor úniku vody', 'termostatická hlavica', 'zigbee brána', 'smart zámok', 'shelly', 'homey'];

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
      if (g.re.test(s)) { terms.push({ alts: g.alt, group: g.n }); labels.push(g.n); s = s.replace(new RegExp(g.re.source, 'g'), ' '); }
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
    else if (/predaj skoncil/.test(a)) b -= 6;
    else if (p.ext) b -= 1.5;
    else if (/dodanie|objednavk/.test(a)) b += 1;
    else if (/nedostup|vypredan/.test(a)) b -= 3;
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
    '.hss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}' +
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
    if (p.ok) return '<span class="hss-ok">Skladom (' + (p.s > 50 ? '>50' : Math.round(p.s)) + ' ks)</span>';
    if (p.ext) return '<span class="hss-warn">Centrálny sklad</span>';
    var a = norm(p.a);
    if (/dodanie|objednavk/.test(a)) return '<span class="hss-warn">' + esc(p.a) + '</span>';
    return '<span class="hss-no">' + esc(p.a || 'Nedostupné') + '</span>';
  }
  function flagHtml(p) {
    var h = '';
    if (p.fl.indexOf('tip') >= 0) h += '<span class="hss-flag hss-f-tip">Odporúčame</span>';
    if (NEW.indexOf(p) >= 0) h += '<span class="hss-flag hss-f-new">Novinka</span>';
    if (p.un) {
      var d = Math.ceil((new Date(p.un + 'T23:59:59') - new Date()) / 864e5);
      if (d <= 7) h += '<span class="hss-flag hss-f-sale">' + (d <= 1 ? 'Zľava končí dnes' : 'Zľava ešte ' + d + ' dni') + '</span>';
    }
    return h;
  }
  function priceHtml(p) {
    return '<strong>' + (p.f ? 'od ' : '') + money(p.p) + '</strong>' + (p.o ? '<div class="hss-old">' + money(p.o) + '</div>' : '');
  }
  function canCart() { return !!(window.shoptet && shoptet.cartShared && typeof shoptet.cartShared.addToCart === 'function'); }
  function row(p, pq, i) {
    var fl = flagHtml(p), alt = '';
    if (!p.ok && p.al.length) {
      for (var k = 0; k < p.al.length; k++) {
        var a = IX.byCode.get(p.al[k]);
        if (a && a.ok) { alt = '<div class="hss-alt">Skladom je podobný: <a href="' + esc(a.u) + '">' + esc(a.n) + '</a> za ' + money(a.p) + '</div>'; break; }
      }
    }
    var tags = p.proto.slice(0, 3).map(function (x) { return '<span class="hss-tag">' + x + '</span>'; }).join('') +
      (p.fl.indexOf('custom3') >= 0 ? '<span class="hss-tag">Funguje s Homey</span>' : '') +
      (p.fl.indexOf('custom1') >= 0 ? '<span class="hss-tag">Funguje s FIBAROM</span>' : '');
    return '<div class="hss-row" data-i="' + i + '" data-u="' + esc(p.u) + '">' + imgTag(p.i, 'hss-img') +
      '<div class="hss-body">' + (fl ? '<div>' + fl + '</div>' : '') +
      '<a class="hss-name" href="' + esc(p.u) + '">' + hl(p.n, pq) + '</a>' +
      '<div class="hss-meta">' + availHtml(p) + tags + '</div>' + alt + '</div>' +
      '<div class="hss-price">' + priceHtml(p) + (p.ok && !p.f && canCart() ? '<div><button type="button" class="hss-cart" data-c="' + esc(p.c) + '">Do košíka</button></div>' : '') + '</div></div>';
  }
  function karlikHtml() {
    return '<div class="hss-karlik"><div><div class="hss-h" style="margin:0 0 4px">Vypínače a zásuvky Karlik</div><div class="hss-note" style="margin:0">Kompletný sortiment Karlik nájdete v samostatnej kategórii.</div></div><div class="hss-chips" style="margin:8px 0 0">' +
      KARLIK.series.map(function (s) { return '<a class="hss-chip" href="' + esc(s[1]) + '">' + esc(s[0]) + '</a>'; }).join('') +
      '<a class="hss-chip on" href="' + esc(KARLIK.all) + '">Celá ponuka Karlik →</a></div></div>';
  }
  function artHtml(a) { return '<a class="hss-art" href="' + esc(a.u) + '"><span>' + esc(a.t) + '</span>' + (a.d ? '<small>' + esc(a.d) + '</small>' : '') + '</a>'; }

  function emptyHtml() {
    var rec = recent(), h = '<div class="hss-wrap"><div class="hss-main">';
    if (rec.length) h += '<div class="hss-h">Vaše posledné hľadania</div><div class="hss-chips">' + rec.map(function (x) { return '<button type="button" class="hss-chip" data-q="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>';
    h += '<div class="hss-h">Ľudia často hľadajú</div><div class="hss-chips">' + POPULAR.map(function (x) { return '<button type="button" class="hss-chip" data-q="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>';
    var nw = NEW.filter(function (p) { return p.ok; }).slice(0, 4);
    if (nw.length) h += '<div class="hss-h">Novinky v ponuke</div><div class="hss-grid">' + nw.map(function (p) {
      return '<a class="hss-card" href="' + esc(p.u) + '">' + imgTag(p.i, '', 'detail_small') + '<div class="n">' + esc(p.n) + '</div><div class="pr">' + money(p.p) + '</div></a>';
    }).join('') + '</div>';
    h += '</div><div class="hss-side">';
    var sale = IX.P.filter(function (p) { return p.ok && p.un; }).sort(function (a, b) { return a.un < b.un ? -1 : 1; }).slice(0, 4);
    if (sale.length < 3) sale = IX.P.filter(function (p) { return p.ok && p.o; }).sort(function (a, b) { return (b.o - b.p) / b.o - (a.o - a.p) / a.o; }).slice(0, 4);
    if (sale.length) h += '<div class="hss-h">Akcie, ktoré končia</div>' + sale.map(function (p) {
      return '<a class="hss-mini" href="' + esc(p.u) + '">' + imgTag(p.i, '') + '<div><div class="n">' + esc(p.n) + '</div><div class="pr">' + money(p.p) + (p.o ? ' <span class="hss-old" style="display:inline">' + money(p.o) + '</span>' : '') + '</div></div></a>';
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
    if (pq.fixes.length) main += '<div class="hss-note">Zobrazujem výsledky pre <strong>' + esc(pq.fixes.join(', ')) + '</strong></div>';
    if (pq.labels.length) main += '<div class="hss-note">Hľadám: <strong>' + esc(pq.labels.join(', ')) + '</strong></div>';
    if (pq.intent && arts.length) main += '<div class="hss-h">Návody a články</div>' + arts.slice(0, 3).map(artHtml).join('') + '<div class="hss-h">Produkty</div>';
    var pc = {};
    r.res.forEach(function (x) { x.p.proto.forEach(function (k) { pc[k] = (pc[k] || 0) + 1; }); });
    var pk = Object.keys(pc).filter(function (k) { return pc[k] < r.res.length || st.f === k; });
    if (r.res.length > 3 && pk.length) main += '<div class="hss-chips">' + PROTOS.map(function (x) { return x[1]; }).filter(function (k) { return pk.indexOf(k) >= 0; }).map(function (k) {
      return '<button type="button" class="hss-chip' + (st.f === k ? ' on' : '') + '" data-f="' + k + '">' + k + ' <span style="opacity:.7">' + pc[k] + '</span></button>';
    }).join('') + '</div>';
    if (shown.length && shown[0].partial) main += '<div class="hss-note">Presnú zhodu sme nenašli, toto sú najbližšie výsledky.</div>';
    var kq = spaced(q), kStrong = /\b(karlik\w*|deco|icon|ramik\w*|ramcek\w*|ramc\w*)\b/.test(kq), kWeak = /\b(vypinac\w*|zasuvk\w*|dvojzasuvk\w*|zasuvka)\b/.test(kq);
    if (!shown.length && !(KARLIK && kStrong)) main += '<div class="hss-empty">Pre „' + esc(q) + '“ sme nenašli žiadny produkt. Skúste iné slovo alebo <a href="' + esc(CONTACT) + '">nám napíšte</a>, radi poradíme.</div>';
    if (KARLIK && kStrong) main += karlikHtml();
    main += shown.map(function (x, i) { return row(x.p, pq, i); }).join('');
    if (KARLIK && kWeak && !kStrong) main += karlikHtml();
    var top = shown.slice(0, 8).map(function (x) { return x.p; });
    var isHub = pq.labels.indexOf('Riadiace jednotky a brány') >= 0;
    var zb = top.filter(function (p) { return p.proto.indexOf('Zigbee') >= 0 && p.proto.indexOf('Wi-Fi') < 0; }).length;
    var zw = top.filter(function (p) { return p.proto.indexOf('Z-Wave') >= 0; }).length;
    if (!isHub && top.length && (zb >= 2 || zw >= 2)) {
      var zig = zb >= zw, cl = catLink(zig ? 'Riadiace jednotky ZigBee' : 'Riadiace jednotky Z-Wave');
      var lk = cl ? '<a href="' + esc(cl) + '">' : '<a href="#" data-q="' + (zig ? 'zigbee brána' : 'zwave centrálna jednotka') + '">';
      main += '<div class="hss-hint"><span>' + (zig ? 'Zigbee zariadenia potrebujú na fungovanie bránu (hub).' : 'Z-Wave zariadenia sa pripájajú cez centrálnu jednotku, napríklad Homey alebo FIBARO Home Center.') +
        ' Ak ju ešte nemáte, ' + lk + 'pozrite si riadiace jednotky</a>.</span></div>';
    }
    if (list.length > shown.length) main += '<button type="button" class="hss-more" data-more="1">Zobraziť ' + (st.all ? 'ďalšie' : 'všetkých ' + list.length) + ' produkty</button>';
    if (C.debug) main += '<div class="hss-foot">Nové vyhľadávanie · <a href="/vyhladavanie/?string=' + encodeURIComponent(q) + '">porovnať s pôvodným vyhľadávaním</a></div>';
    var cc = {}, cn = {};
    r.res.forEach(function (x) {
      Array.from(new Set(x.p.cat.concat(x.p.dc).map(function (c) { return c.split('>').pop().trim(); }))).forEach(function (c) {
        var last = c.split('>').pop().trim();
        if (/kompatibiln|^ostatn|black friday|dopredaj|^seo|works with|odbalen|zvyhodnen/i.test(last) && !(/homey/i.test(last) && pq.labels.indexOf('Homey') >= 0)) return;
        if (!catLink(last)) return;
        var gm = pq.terms.some(function (t) { return t.group && t.alts.some(function (al) { return toks(last).some(function (x) { return mt(x, al); }); }); });
        cc[last] = (cc[last] || 0) + (gm ? 6 : 1); cn[last] = (cn[last] || 0) + 1;
      });
    });
    var cats = Object.keys(cc).sort(function (a, b) { return cc[b] - cc[a]; });
    if (cats.length && cc[cats[0]] >= 6) cats = cats.filter(function (c) { return cc[c] >= 6; });
    cats = cats.slice(0, 4);
    if (cats.length) side += '<div class="hss-h">Kategórie</div>' + cats.map(function (c) { return '<a class="hss-cat" href="' + esc(catLink(c)) + '"><span>' + esc(c) + '</span><b>' + cn[c] + '</b></a>'; }).join('');
    if (!pq.intent && arts.length) side += '<div class="hss-blogbox"><div class="hss-h">Z blogu</div>' + arts.slice(0, 2).map(artHtml).join('') + '<a class="hss-blogall" href="/blog/">Všetky články</a></div>';
    track(q, r.res.length);
    return side ? '<div class="hss-wrap"><div class="hss-main">' + main + '</div><div class="hss-side">' + side + '</div></div>' : '<div class="hss-main">' + main + '</div>';
  }

  /* ---------- recent searches, tracking ---------- */
  function recent() { try { return JSON.parse(localStorage.getItem('hss_recent') || '[]'); } catch (e) { return []; } }
  function remember(q) {
    q = (q || '').trim(); if (q.length < 2) return;
    try { var r = recent().filter(function (x) { return x !== q; }); r.unshift(q); localStorage.setItem('hss_recent', JSON.stringify(r.slice(0, 5))); } catch (e) {}
  }
  var tTimer = null;
  function track(q, n) {
    if (!C.track) return;
    clearTimeout(tTimer);
    tTimer = setTimeout(function () {
      if (typeof window.gtag !== 'function') return;
      gtag('event', 'search', { search_term: q, results_count: n });
      if (!n) gtag('event', 'search_no_results', { search_term: q });
    }, 1500);
  }

  /* ---------- panel + input wiring ---------- */
  var panel, input, ov, open = false;
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
    if (!IX) { panel.innerHTML = '<div class="hss-main"><div class="hss-empty">Načítavam produkty…</div></div>'; return; }
    st.act = -1;
    panel.innerHTML = spaced(input.value).length < 2 ? emptyHtml() : results();
  }
  function follow() { if (!open) return; place(); requestAnimationFrame(follow); }
  function show() { var was = open; open = true; panel.classList.add('open'); ov.classList.add('on'); render(); if (!was) requestAnimationFrame(follow); }
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
    if (more) { if (st.all) st.lim += 30; st.all = true; render(); return; }
    if (cart) {
      ev.preventDefault();
      try { shoptet.cartShared.addToCart({ productCode: cart.getAttribute('data-c') }); cart.textContent = 'Pridané'; }
      catch (e) { var p = IX.byCode.get(cart.getAttribute('data-c')); if (p) go(p.u); }
      return;
    }
    var a = t.closest('a[href]');
    if (a) { remember(input.value); return; }
    var r = t.closest('.hss-row'); if (r) go(r.getAttribute('data-u'));
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
        e.preventDefault(); e.stopPropagation();
        if (st.act >= 0 && st.list[st.act]) go(st.list[st.act].u);
        else { remember(inp.value); st.all = true; if (!open) show(); else render(); }
      }
    });
    if (inp.form) inp.form.addEventListener('submit', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      input = inp;
      if (spaced(inp.value).length < 2) { inp.focus(); return; }
      remember(inp.value); st.f = null; st.all = true;
      if (!open) show(); else render();
    }, true);
  }
  function init() {
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
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
          CATMAP = j.c || {}; KARLIK = j.k || null; if (j.ct) CONTACT = j.ct;
          render();
        });
      }
      loading.then(function () { window.HSS = { search: search, parse: parse, IX: IX, version: C.indexUrl }; }).catch(function (e) { loading = null; console.warn('HSS', e); });
      return loading;
    };
    document.querySelectorAll('input[name="string"]').forEach(function (i) {
      i.addEventListener('focus', start); i.addEventListener('pointerenter', start); i.addEventListener('touchstart', start, { passive: true });
    });
    if ('requestIdleCallback' in window) requestIdleCallback(function () { setTimeout(start, 2500); }); else setTimeout(start, 4000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
