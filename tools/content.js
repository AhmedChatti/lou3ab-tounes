#!/usr/bin/env node
/* Lou3ab Tounes content helper.
   node tools/content.js validate          -> checks assets/daily.js (exit 1 on error)
   node tools/content.js govs              -> governorate ids, names, population 2024, area, neighbours
   node tools/content.js dels [TN-xx]      -> delegation ids (optionally for one governorate)
   node tools/content.js used              -> names/titles already used (avoid duplicates)
   node tools/content.js next              -> first date (from tomorrow) with no daily entry */
const fs = require('fs'), path = require('path'), vm = require('vm');
const A = p => path.join(__dirname, '..', 'assets', p);
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['data.js', 'facts.js', 'history.js', 'daily.js']) vm.runInContext(fs.readFileSync(A(f), 'utf8'), ctx, { filename: f });
const { TN, FACTS, HISTORY, DAILY = {} } = ctx.window;
const G = new Set(TN.govs.map(g => g.id)), D = new Set(TN.dels.map(d => d.id));
const cmd = process.argv[2];
if (cmd === 'govs') { TN.govs.forEach(g => console.log([g.id, g.fr, g.ar, g.p24, g.area, g.region, g.nb.join(' ')].join('\t'))); process.exit(0); }
if (cmd === 'dels') { TN.dels.filter(d => !process.argv[3] || d.g === process.argv[3]).forEach(d => console.log([d.id, d.g, d.fr, d.ar, d.p24].join('\t'))); process.exit(0); }
if (cmd === 'used') {
  console.log('# mysteries:', FACTS.mysteries.map(m => m.name).concat(Object.values(DAILY).map(x => x.chkoun && x.chkoun.name).filter(Boolean)).join(' | '));
  console.log('# origins:', FACTS.origins.map(o => o.fr).concat(Object.values(DAILY).flatMap(x => (x.mnin || []).map(o => o.fr))).join(' | '));
  console.log('# history:', HISTORY.map(h => h.y + ' ' + h.fr).concat(Object.values(DAILY).flatMap(x => (x.tarikh || []).map(h => h.y + ' ' + h.fr))).join(' | '));
  console.log('# akthar themes:', Object.values(DAILY).map(x => x.akthar && x.akthar.lab_fr).filter(Boolean).join(' | '));
  console.log('# wilayadle targets by date:', Object.entries(DAILY).map(([k, x]) => x.wilayadle ? k + '=' + x.wilayadle.g : '').filter(Boolean).join(' '));
  process.exit(0);
}
if (cmd === 'next') { const d = new Date(); for (let i = 1; i < 400; i++) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i); const k = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; if (!DAILY[k]) { console.log(k); break; } } process.exit(0); }
// validate
const errs = []; const E = (k, m) => errs.push(`${k}: ${m}`);
const str = (o, f, k) => { if (typeof o[f] !== 'string' || !o[f].trim()) E(k, `missing text "${f}"`); };
const CATS = ['music', 'sport', 'food', 'place', 'history'];
for (const [k, x] of Object.entries(DAILY)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) E(k, 'key must be YYYY-MM-DD');
  if (x.wilayadle) { if (!G.has(x.wilayadle.g)) E(k, 'wilayadle.g not a governorate id'); ['fact_en', 'fact_fr', 'fact_ar'].forEach(f => str(x.wilayadle, f, k + ' wilayadle')); }
  if (x.chkoun) { const m = x.chkoun; if (!G.has(m.g)) E(k, 'chkoun.g invalid'); str(m, 'name', k + ' chkoun'); if (!['person', 'place'].includes(m.kind)) E(k, 'chkoun.kind must be person|place');
    for (const l of ['en', 'fr', 'ar']) { if (!Array.isArray(m['clues_' + l]) || m['clues_' + l].length !== 4) E(k, `chkoun.clues_${l} must have exactly 4 clues`); str(m, 'born_' + l, k + ' chkoun'); }
    const low = (m.clues_fr || []).slice(0, 3).join(' ').toLowerCase(); const gname = TN.govs.find(g => g.id === m.g); if (gname && low.includes(gname.fr.toLowerCase())) E(k, 'chkoun: first 3 clues must not name the governorate'); }
  (x.ghouss || []).forEach((p, i) => { const kk = `${k} ghouss[${i}]`; if (!['gov', 'del'].includes(p.kind)) E(kk, 'kind gov|del'); ['txt_en', 'txt_fr', 'txt_ar'].forEach(f => str(p, f, kk)); if (!Array.isArray(p.valid) || p.valid.length < 2) E(kk, 'valid needs >= 2 ids'); else p.valid.forEach(id => { if (!(p.kind === 'gov' ? G : D).has(id)) E(kk, 'bad id ' + id); }); });
  if ((x.ghouss || []).length > 7) E(k, 'max 7 ghouss prompts');
  (x.tarikh || []).forEach((h, i) => { const kk = `${k} tarikh[${i}]`; if (typeof h.y !== 'number') E(kk, 'y must be a number'); ['en', 'fr', 'ar', 'd_en', 'd_fr', 'd_ar'].forEach(f => str(h, f, kk)); if (h.g && !G.has(h.g)) E(kk, 'g invalid'); if (HISTORY.some(o => o.fr === h.fr)) E(kk, 'duplicate of existing event'); });
  (x.mnin || []).forEach((o, i) => { const kk = `${k} mnin[${i}]`; if (!Array.isArray(o.g) || !o.g.length || o.g.some(id => !G.has(id))) E(kk, 'g must be array of governorate ids'); if (!CATS.includes(o.cat)) E(kk, 'cat must be one of ' + CATS); ['en', 'fr', 'ar', 'sub_en', 'sub_fr', 'sub_ar', 'why_en', 'why_fr', 'why_ar'].forEach(f => str(o, f, kk)); });
  if (x.akthar) { const a = x.akthar; ['lab_en', 'lab_fr', 'lab_ar', 'source'].forEach(f => str(a, f, k + ' akthar')); if (!Array.isArray(a.items) || a.items.length < 6) E(k, 'akthar needs >= 6 items'); else a.items.forEach((it, i) => { if (typeof it.value !== 'number' || !isFinite(it.value)) E(`${k} akthar.items[${i}]`, 'value must be a number'); ['en', 'fr', 'ar'].forEach(f => str(it, f, `${k} akthar.items[${i}]`)); if (it.g && !G.has(it.g)) E(`${k} akthar.items[${i}]`, 'g invalid'); }); }
}
if (errs.length) { console.error('INVALID daily.js\n' + errs.join('\n')); process.exit(1); }
console.log(`daily.js OK: ${Object.keys(DAILY).length} day(s)`);
