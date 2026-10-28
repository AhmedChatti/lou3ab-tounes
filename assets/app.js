/* Lou3ab Tounes — game engine. Vanilla JS, no build step. Map data © OpenStreetMap contributors · Map Tunisia by Alaa Taieb */
(function () {
'use strict';
const TN = window.TN, FACTS = window.FACTS, HIST = window.HISTORY;
const GOVS = TN.govs, DELS = TN.dels;
const G = Object.fromEntries(GOVS.map(g => [g.id, g]));
const D = Object.fromEntries(DELS.map(d => [d.id, d]));
const REG = Object.fromEntries(TN.regions.map(r => [r.id, r]));
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');

/* ---------- storage (best effort) ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('l3b:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('l3b:' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- i18n ---------- */
let LANG = LS.get('lang', (navigator.language || 'fr').slice(0, 2) === 'en' ? 'en' : 'fr');
const S = {
  tagline: { en: 'Games about Tunisia, its 24 governorates and 279 delegations.', fr: 'Des jeux sur la Tunisie, ses 24 gouvernorats et 279 délégations.', ar: 'ألعاب حول تونس وولاياتها الأربع والعشرين ومعتمدياتها الـ279.' },
  daily: { en: 'Daily', fr: 'Du jour', ar: 'يومي' }, endless: { en: 'Endless', fr: 'Sans fin', ar: 'بلا نهاية' },
  play: { en: 'Play', fr: 'Jouer', ar: 'العب' }, done: { en: 'Done today', fr: 'Fait aujourd\'hui', ar: 'أُنجز اليوم' },
  best: { en: 'Best', fr: 'Record', ar: 'الأفضل' }, back: { en: 'All games', fr: 'Tous les jeux', ar: 'كل الألعاب' },
  guess: { en: 'Guess', fr: 'Valider', ar: 'خمّن' }, typeGov: { en: 'Type a governorate…', fr: 'Tape un gouvernorat…', ar: 'اكتب اسم ولاية…' },
  share: { en: 'Copy result', fr: 'Copier le résultat', ar: 'انسخ النتيجة' }, copied: { en: 'Copied. Paste it to your friends.', fr: 'Copié. Colle-le à tes amis.', ar: 'تم النسخ. ألصقه لأصدقائك.' },
  again: { en: 'Play again', fr: 'Rejouer', ar: 'العب مجدداً' }, next: { en: 'Next', fr: 'Suivant', ar: 'التالي' },
  won: { en: 'Got it!', fr: 'Trouvé !', ar: 'أحسنت!' }, lost: { en: 'It was', fr: 'C\'était', ar: 'الجواب' },
  archive: { en: 'Archive', fr: 'Archives', ar: 'الأرشيف' }, puzzle: { en: 'Puzzle', fr: 'Grille', ar: 'لغز' },
  pop: { en: 'Population 2024', fr: 'Population 2024', ar: 'السكان 2024' }, area: { en: 'Area', fr: 'Superficie', ar: 'المساحة' },
  region: { en: 'Region', fr: 'Région', ar: 'الإقليم' }, already: { en: 'Already guessed', fr: 'Déjà proposé', ar: 'سبق تخمينه' },
  unknown: { en: 'Not a governorate', fr: 'Ce n\'est pas un gouvernorat', ar: 'ليست ولاية' },
  bonusT: { en: 'Bonus: tap every governorate that borders it', fr: 'Bonus : touche tous les gouvernorats voisins', ar: 'مكافأة: اضغط على كل الولايات المجاورة لها' },
  check: { en: 'Check', fr: 'Vérifier', ar: 'تحقّق' }, skip: { en: 'Skip', fr: 'Passer', ar: 'تخطَّ' },
  confirm: { en: 'Confirm', fr: 'Confirmer', ar: 'أكّد' }, tapMap: { en: 'Tap the map to choose', fr: 'Touche la carte pour choisir', ar: 'اضغط على الخريطة للاختيار' },
  guessesLeft: { en: 'guesses left', fr: 'essais restants', ar: 'محاولات متبقية' },
  score: { en: 'Score', fr: 'Score', ar: 'النتيجة' }, time: { en: 'Time', fr: 'Temps', ar: 'الوقت' }, start: { en: 'Start', fr: 'Commencer', ar: 'ابدأ' },
  find: { en: 'Find', fr: 'Trouve', ar: 'أين' }, more: { en: 'More', fr: 'Plus', ar: 'أكثر' }, less: { en: 'Less', fr: 'Moins', ar: 'أقل' },
  streak: { en: 'Streak', fr: 'Série', ar: 'السلسلة' }, gameover: { en: 'Game over', fr: 'Partie terminée', ar: 'انتهت اللعبة' },
  correct: { en: 'Correct', fr: 'Bonne réponse', ar: 'إجابة صحيحة' }, wrong: { en: 'Wrong', fr: 'Raté', ar: 'خطأ' },
  answer: { en: 'Answer', fr: 'Réponse', ar: 'الجواب' }, players: { en: 'Players', fr: 'Joueurs', ar: 'اللاعبون' },
  addPlayer: { en: 'Add player', fr: 'Ajouter un joueur', ar: 'أضف لاعباً' }, passTo: { en: 'Pass the phone to', fr: 'Passe le téléphone à', ar: 'مرّر الهاتف إلى' },
  ready: { en: 'I\'m ready', fr: 'Je suis prêt·e', ar: 'أنا جاهز' }, wins: { en: 'wins!', fr: 'gagne !', ar: 'يفوز!' },
  timeUp: { en: 'Time\'s up', fr: 'Temps écoulé', ar: 'انتهى الوقت' }, lives: { en: 'Lives', fr: 'Vies', ar: 'الأرواح' },
  placeIt: { en: 'Tap where this event goes in the timeline', fr: 'Touche l\'endroit où placer cet événement', ar: 'اضغط على مكان هذا الحدث في الخط الزمني' },
  here: { en: 'Here', fr: 'Ici', ar: 'هنا' }, earlier: { en: 'Earlier', fr: 'Plus tôt', ar: 'أقدم' }, later: { en: 'Later', fr: 'Plus tard', ar: 'أحدث' },
  depth: { en: 'Depth', fr: 'Profondeur', ar: 'العمق' }, deepest: { en: 'Deepest answer', fr: 'Réponse la plus profonde', ar: 'أعمق إجابة' },
  notValid: { en: 'Valid place, wrong answer: 0 m', fr: 'Lieu valide, mauvaise réponse : 0 m', ar: 'مكان صحيح لكن الإجابة خاطئة: 0 م' },
  notPlace: { en: 'Not recognised. Check the spelling.', fr: 'Inconnu. Vérifie l\'orthographe.', ar: 'غير معروف. تحقّق من الكتابة.' },
  typeAns: { en: 'Type your answer…', fr: 'Tape ta réponse…', ar: 'اكتب إجابتك…' }, dive: { en: 'Dive', fr: 'Plonger', ar: 'غُص' },
  challenge: { en: 'Challenge link', fr: 'Lien défi', ar: 'رابط التحدّي' }, makeChallenge: { en: 'Create a challenge link', fr: 'Créer un lien défi', ar: 'أنشئ رابط تحدٍّ' },
  challengeTxt: { en: 'Same 10 questions for everyone who opens the link. Compare scores.', fr: 'Les mêmes 10 questions pour tous ceux qui ouvrent le lien. Comparez vos scores.', ar: 'نفس الأسئلة العشر لكل من يفتح الرابط. قارنوا النتائج.' },
  passPlay: { en: 'Pass-and-play', fr: 'Chacun son tour', ar: 'كل واحد بدوره' }, copyLink: { en: 'Copy link', fr: 'Copier le lien', ar: 'انسخ الرابط' },
  credit: { en: 'Map data © OpenStreetMap contributors · Map Tunisia by Alaa Taieb · Census figures INS 2024', fr: 'Données cartographiques © contributeurs OpenStreetMap · Map Tunisia par Alaa Taieb · Recensement INS 2024', ar: 'بيانات الخريطة © مساهمو OpenStreetMap · Map Tunisia لعلاء الطيب · تعداد المعهد الوطني للإحصاء 2024' },
  newT: { en: 'New', fr: 'Nouveau', ar: 'جديد' },
  factLang: { en: '', fr: '', ar: 'بعض البطاقات بالفرنسية.' }
};
const t = k => (S[k] && (S[k][LANG] || S[k].fr)) || k;
const t_ = t;
const L = o => o[LANG] || o.fr || o.en;                                    // pick {en,fr,ar}
const LF = (o, base) => o[base + '_' + LANG] || o[base + '_fr'] || o[base + '_en']; // pick field_xx
const nm = o => LANG === 'ar' ? o.ar : LANG === 'fr' ? o.fr : o.en;          // place name
const fmt = n => Math.round(n).toLocaleString(LANG === 'ar' ? 'ar-TN' : LANG === 'fr' ? 'fr-FR' : 'en-GB');
const yearTxt = y => { const v = Math.floor(y); return v < 0 ? (-v) + (LANG === 'ar' ? ' ق.م' : LANG === 'fr' ? ' av. J.-C.' : ' BC') : String(v); };

/* ---------- seeded randomness & days ---------- */
function hash(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return (h ^= h >>> 16) >>> 0; }; }
function rng(seed) { let a = hash(String(seed))(); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
const shuffle = (arr, r = Math.random) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
const LAUNCH = new Date(2026, 9, 28);
const TODAY = Math.max(1, Math.floor((new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - LAUNCH) / 864e5) + 1);
/* ---------- daily content (assets/daily.js, keyed by ISO date) ---------- */
const DAILY = window.DAILY || {};
const isoOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dateOf = day => { const d = new Date(LAUNCH); d.setDate(d.getDate() + day - 1); return isoOf(d); };
const dayOf = iso => { const [y, m, dd] = iso.split('-').map(Number); return Math.round((new Date(y, m - 1, dd) - LAUNCH) / 864e5) + 1; };
const DD = day => DAILY[dateOf(day)] || {};
const PAST = Object.keys(DAILY).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k) && dayOf(k) <= TODAY).sort();
PAST.forEach(k => { const n = dayOf(k), x = DAILY[k];
  (x.mnin || []).forEach(o => FACTS.origins.push(Object.assign({}, o, { day: n })));
  (x.tarikh || []).forEach(h => HIST.push(Object.assign({}, h, { day: n }))); });
window.PEOPLE = (window.PEOPLE || []).map((p, i) => Object.assign({ id: 'p' + i }, p));
PAST.forEach(k => { const x = DAILY[k].persondle; if (x && x.name && !window.PEOPLE.some(p => p.name === x.name)) { const id = 'd' + k.replace(/-/g, ''); x.id = id; window.PEOPLE.push(Object.assign({}, x, { id, day: dayOf(k) })); } });
const isNew = o => o.day && TODAY - o.day < 7;
function dailyItem(list, key, day) { const n = list.length, cyc = Math.floor((day - 1) / n); return shuffle(list, rng(key + ':' + cyc))[(day - 1) % n]; }

/* ---------- geo ---------- */
const rad = x => x * Math.PI / 180;
function km(a, b) { const R = 6371, dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon); const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
function bearing(a, b) { const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat)); const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon)); return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; }
const ARROWS = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
const arrowEmoji = deg => ARROWS[Math.round(deg / 45) % 8];

/* ---------- name matching ---------- */
const ALIAS = { 'TN-33': ['kef', 'el kef', 'le kef'], 'TN-23': ['bizerta', 'benzart', 'binzart'], 'TN-41': ['kairwan', 'qayrawan', 'kerouan', 'kairouane'], 'TN-73': ['kbili', 'gbelli', 'qibili', 'kebilli'], 'TN-42': ['gasrine', 'kasrine', 'qasrin', 'kasserin'], 'TN-83': ['tatawin', 'tataouin', 'tatouine'], 'TN-61': ['sfakes', 'sfaks', 'safaqis'], 'TN-52': ['mestir', 'mnastir', 'monastere'], 'TN-53': ['mehdia', 'mahdiya'], 'TN-21': ['nabel', 'cap bon'], 'TN-22': ['zaghwan', 'zaghuan'], 'TN-34': ['seliana', 'silyana'], 'TN-12': ['aryana', 'ariana'], 'TN-13': ['benarous'], 'TN-14': ['mannouba', 'la manouba', 'manuba'], 'TN-31': ['bja', 'baja', 'beja'], 'TN-32': ['jandouba', 'jendoba'], 'TN-51': ['soussa', 'susa'], 'TN-71': ['qafsa', 'gafssa'], 'TN-72': ['touzer', 'tuzar', 'tozzeur'], 'TN-81': ['qabis', 'gabis', 'gabes'], 'TN-82': ['mednine', 'madanin', 'medenine', 'djerba', 'jerba'], 'TN-43': ['sidibouzid', 'sidi bou zid'], 'TN-11': ['tounes', 'tounis'] };
function norm(s) {
  return String(s).normalize('NFD').replace(/[̀-ًͯ-ٰٟ]/g, '').toLowerCase()
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/['’`\-_.]/g, ' ')
    .replace(/[^a-z0-9ء-ي ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function keys(s) { const n = norm(s); const k = new Set([n, n.replace(/ /g, '')]); const s2 = n.replace(/^(el|le|la|al|l) /, '').replace(/^ال/, ''); k.add(s2); k.add(s2.replace(/ /g, '')); return [...k].filter(Boolean); }
function lev(a, b) { if (Math.abs(a.length - b.length) > 2) return 9; const m = []; for (let i = 0; i <= a.length; i++) { m[i] = [i]; } for (let j = 1; j <= b.length; j++) m[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return m[a.length][b.length]; }
function buildIndex(items, extra) { return items.map(it => ({ id: it.id, k: [...new Set([it.en, it.fr, it.ar, ...(extra && extra[it.id] || []), ...(it.cap ? [it.cap] : [])].flatMap(keys))] })); }
const GIDX = buildIndex(GOVS, ALIAS), DIDX = buildIndex(DELS);
function matchAll(input, idx) {
  const ik = keys(input); if (!ik.length || !ik[0]) return [];
  const exact = idx.filter(e => e.k.some(k => ik.includes(k))).map(e => e.id); if (exact.length) return exact;
  // "Sfax" → Sfax Ville / Sfax Ouest / Sfax Sud (word-prefix match)
  const pre = idx.filter(e => e.k.some(k => ik.some(i => i.length >= 3 && k.startsWith(i + ' ')))).map(e => e.id); if (pre.length) return pre;
  // "Chebbi" → Aboul-Qacem Chebbi (every typed word is a word of the name)
  const iw = (ik[0] || '').split(' ').filter(w => w.length >= 3);
  if (iw.length) { const wd = idx.filter(e => e.k.some(k => { const kw = k.split(' '); return iw.every(w => kw.includes(w)); })).map(e => e.id); if (wd.length) return wd; }
  const c = ik[1] || ik[0]; const tol = c.length >= 8 ? 2 : c.length >= 5 ? 1 : 0; if (!tol) return [];
  let best = 9, out = [];
  idx.forEach(e => e.k.forEach(k => { const d = lev(c, k.replace(/ /g, '')); if (d < best) { best = d; out = [e.id]; } else if (d === best && !out.includes(e.id)) out.push(e.id); }));
  return best <= tol ? out : [];
}

/* ---------- map colours (greedy graph colouring) ---------- */
function colour(items) { const c = {}; items.slice().sort((a, b) => b.nb.length - a.nb.length).forEach(it => { const used = new Set(it.nb.map(n => c[n])); let k = 0; while (used.has(k)) k++; c[it.id] = k; }); return c; }
const GCOL = colour(GOVS), DCOL = colour(DELS);

/* ---------- SVG map ---------- */
const GT = ['TN-11', 'TN-12', 'TN-13', 'TN-14'];
const GTBB = GT.reduce((b, id) => { const g = G[id].bb; return [Math.min(b[0], g[0]), Math.min(b[1], g[1]), Math.max(b[2], g[2]), Math.max(b[3], g[3])]; }, [1e9, 1e9, -1e9, -1e9]);
function mapSVG(o = {}) {
  // o: {level:'gov'|'del', gov: id (del level filter), inset: bool, cls: fn(id)->string, pastel: bool, labels: bool}
  const level = o.level || 'gov';
  let items, vb;
  if (level === 'gov') { items = GOVS; vb = o.inset ? [-2, -2, 462, 744] : [-2, -2, 346, 744]; }
  else { items = DELS.filter(d => !o.gov || d.g === o.gov); const b = o.gov ? G[o.gov].bb : TN.bb; const p = Math.max(b[2] - b[0], b[3] - b[1]) * 0.06; vb = [b[0] - p, b[1] - p, b[2] - b[0] + 2 * p, b[3] - b[1] + 2 * p]; }
  const sw = level === 'gov' ? 0.6 : Math.max(0.15, vb[2] / 500);
  const col = level === 'gov' ? GCOL : DCOL;
  const path = it => `<path class="rg ${o.pastel !== false ? 'c' + col[it.id] : ''} ${o.cls ? o.cls(it.id) : ''}" data-id="${it.id}" d="${it.d}"/>`;
  let s = `<svg class="map" viewBox="${vb.join(' ')}" role="img" aria-label="Map of Tunisia" style="--sw:${sw}">`;
  if (level === 'del' && o.gov) s += `<g class="ctx">${GOVS.filter(g => g.id !== o.gov).map(g => `<path d="${g.d}"/>`).join('')}</g>`;
  s += `<g class="regions">${items.map(path).join('')}</g>`;
  if (o.labels) s += `<g class="lbl">${items.map(it => `<text x="${it.lx}" y="${it.ly}" data-for="${it.id}">${esc(nm(it))}</text>`).join('')}</g>`;
  if (level === 'gov' && o.inset) {
    const [x0, y0, x1, y1] = GTBB, pad = 3, w = x1 - x0 + 2 * pad, sc = 104 / w, X = 350, Y = 40, H = (y1 - y0 + 2 * pad) * sc;
    s += `<g class="inset"><rect x="${X}" y="${Y}" width="104" height="${H}" rx="6"/><text class="inset-t" x="${X + 52}" y="${Y - 6}">${esc(LANG === 'ar' ? 'تونس الكبرى' : LANG === 'fr' ? 'Grand Tunis' : 'Greater Tunis')}</text>
      <clipPath id="gtclip"><rect x="${X}" y="${Y}" width="104" height="${H}" rx="6"/></clipPath>
      <g clip-path="url(#gtclip)"><g transform="translate(${X},${Y}) scale(${sc}) translate(${-(x0 - pad)},${-(y0 - pad)})" style="--sw:${0.6 / sc}">${GOVS.filter(g => g.bb[0] < x1 + 6 && g.bb[2] > x0 - 6 && g.bb[1] < y1 + 6 && g.bb[3] > y0 - 6).map(path).join('')}</g></g>
      <path class="inset-lead" d="M${x1 + 2},${(y0 + y1) / 2} L${X},${Y + H / 2}"/></g>`;
  }
  return s + '</svg>';
}
function setCls(root, id, cls, on = true) { $$(`[data-id="${id}"]`, root).forEach(p => p.classList.toggle(cls, on)); }
function onPick(root, fn) {
  // property handlers (not addEventListener) so re-binding replaces the previous round's handler
  root.onclick = e => { const p = e.target.closest('[data-id]'); if (p) fn(p.dataset.id, p); };
  root.onpointerover = e => { const p = e.target.closest('[data-id]'); if (p) $$(`[data-id="${p.dataset.id}"]`, root).forEach(q => q.classList.add('hov')); };
  root.onpointerout = e => { const p = e.target.closest('[data-id]'); if (p) $$(`[data-id="${p.dataset.id}"]`, root).forEach(q => q.classList.remove('hov')); };
}
function silhouette(g, cls = 'sil') { const [a, b, c, d] = g.bb, w = c - a, h = d - b, p = Math.max(w, h) * 0.08; return `<svg class="${cls}" viewBox="${a - p} ${b - p} ${w + 2 * p} ${h + 2 * p}" aria-label="Mystery shape"><path d="${g.d}"/></svg>`; }
function miniMap(hi) { return `<svg class="mini" viewBox="-2 -2 346 744" aria-hidden="true"><path class="mini-c" d="${TN.country}"/>${(Array.isArray(hi) ? hi : [hi]).filter(Boolean).map(id => (D[id] ? `<path class="mini-g" d="${G[D[id].g].d}"/>` : '') + `<path class="mini-h" d="${(G[id] || D[id]).d}"/>`).join('')}</svg>`; }

/* ---------- UI helpers ---------- */
function toast(msg, kind = '') { const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.classList.add('out'), 1800); setTimeout(() => el.remove(), 2300); }
const SITE = (document.querySelector('meta[name="site-url"]') || {}).content || location.href.split('#')[0];
const link = h => SITE + (h ? '#' + h : '');
function copy(text, btn) {
  const done = () => toast(t('copied'));
  const fallback = () => { const ta = document.createElement('textarea'); ta.className = 'copybox'; ta.value = text; ta.readOnly = true; (btn ? btn.parentNode : app).appendChild(ta); ta.select(); };
  try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
}
function shareBtn(textFn) { return { html: `<button class="btn primary" data-share>${t('share')}</button>`, bind: root => $$('[data-share]', root).forEach(b => b.onclick = () => copy(textFn(), b)) }; }
function shell(id, title, ar, sub, body) {
  app.innerHTML = `<header class="bar"><a class="backlink" href="#">← ${t('back')}</a><div class="bar-r">${langSwitch()}</div></header>
  <section class="game g-${id}"><div class="ghead"><h1>${esc(title)}<span class="ar" lang="ar">${esc(ar)}</span></h1>${sub ? `<p class="gsub">${sub}</p>` : ''}</div><div class="gbody">${body}</div></section>${footer()}`;
  bindLang();
  return $('.gbody');
}
function langSwitch() { return `<div class="seg" role="group" aria-label="Language">${['fr', 'en', 'ar'].map(l => `<button data-lang="${l}" class="${l === LANG ? 'on' : ''}">${l === 'ar' ? 'ع' : l.toUpperCase()}</button>`).join('')}</div>`; }
function bindLang() { $$('[data-lang]').forEach(b => b.onclick = () => { LANG = b.dataset.lang; LS.set('lang', LANG); applyLang(); route(); }); }
function applyLang() { document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr'; }
function footer() { return `<footer class="foot"><p>${t('credit')}</p><p><a href="https://github.com/Alaa-Taieb/map-tunisia" target="_blank" rel="noopener">github.com/Alaa-Taieb/map-tunisia</a></p></footer>`; }
function dayPicker(game, day, max) { return `<div class="daypick"><a class="btn ghost sm ${day <= 1 ? 'dis' : ''}" href="#${game}-${day - 1}">‹</a><span>${t('puzzle')} #${day}</span><a class="btn ghost sm ${day >= max ? 'dis' : ''}" href="#${game}-${day + 1}">›</a></div>`; }
function hearts(n, max) { return `<span class="hearts" aria-label="${n} lives">${'<i class="h on"></i>'.repeat(Math.max(0, n))}${'<i class="h"></i>'.repeat(Math.max(0, max - n))}</span>`; }

/* ---------- autocomplete input ---------- */
function acInput(root, list, onSubmit, placeholder) {
  root.innerHTML = `<form class="ac" autocomplete="off"><input id="ac-in" type="text" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}"><button class="btn primary" type="submit">${t('guess')}</button><ul class="ac-list" hidden></ul></form>`;
  const inp = $('input', root), ul = $('.ac-list', root); let sel = -1, items = [];
  const render = () => { const q = norm(inp.value); items = (q || list().some(x => x.face)) ? list().filter(x => keys(x.label).concat(keys(x.alt || '')).some(k => k.includes(q) || k.replace(/ /g, '').includes(q.replace(/ /g, '')))).slice(0, q ? 6 : 50) : []; ul.hidden = !items.length; ul.innerHTML = items.map((x, i) => `<li data-i="${i}" class="${i === sel ? 'on' : ''}">${x.face || ''}<em>${esc(x.label)}</em>${x.alt && x.alt !== x.label ? `<span>${esc(x.alt)}</span>` : ''}</li>`).join(''); };
  inp.oninput = () => { sel = -1; render(); };
  inp.onfocus = () => { if (list().some(x => x.face)) render(); };
  inp.onblur = () => setTimeout(() => { ul.hidden = true; }, 150);
  inp.onkeydown = e => { if (e.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); render(); e.preventDefault(); } if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); render(); e.preventDefault(); } };
  ul.onpointerdown = e => { const li = e.target.closest('li'); if (li) { e.preventDefault(); inp.value = items[+li.dataset.i].label; ul.hidden = true; $('form', root).requestSubmit(); } };
  $('form', root).onsubmit = e => { e.preventDefault(); let v = inp.value; if (sel >= 0 && items[sel]) v = items[sel].label; if (!v.trim()) return; ul.hidden = true; if (onSubmit(v) !== false) { inp.value = ''; sel = -1; } else inp.parentNode.classList.add('shake'), setTimeout(() => inp.parentNode.classList.remove('shake'), 400); };
  return inp;
}
const govList = () => GOVS.map(g => ({ label: nm(g), alt: LANG === 'ar' ? g.fr : g.ar })).sort((a, b) => a.label.localeCompare(b.label));

/* =========================================================
   HOME
   ========================================================= */
const GAMES = [
  { id: 'wilayadle', name: 'Wilayadle', ar: 'ولايدل', daily: true, d: { en: 'Guess the governorate: region, coast, borders, population, area… green, orange or red.', fr: 'Devine le gouvernorat : région, littoral, frontières, population, superficie… vert, orange ou rouge.', ar: 'خمّن الولاية: الإقليم، الساحل، الحدود، السكان، المساحة… أخضر أو برتقالي أو أحمر.' } },
  { id: 'persondle', name: 'Persondle', ar: 'شخصدل', daily: true, d: { en: 'Guess the Tunisian personality: field, birthplace, birth year… each column gets warmer.', fr: 'Devine la personnalité tunisienne : domaine, lieu et année de naissance… chaque colonne te guide.', ar: 'خمّن الشخصية التونسية: المجال، مكان وسنة الولادة… كل عمود يرشدك.' } },
  { id: 'chkoun', name: 'Chkoun?', ar: 'شكون؟', daily: true, d: { en: 'A mystery person or place. One clue to start, a new one after each wrong guess on the map.', fr: 'Une personne ou un lieu mystère. Un indice au départ, un nouveau après chaque erreur sur la carte.', ar: 'شخصية أو مكان غامض. تلميح واحد في البداية وآخر بعد كل خطأ على الخريطة.' } },
  { id: 'ghouss', name: 'Ghouss', ar: 'غوص', daily: true, d: { en: 'Seven prompts a day. The more obscure your answer, the deeper you dive.', fr: 'Sept questions par jour. Plus ta réponse est rare, plus tu plonges profond.', ar: 'سبعة أسئلة يومياً. كلما كانت إجابتك أندر، غصت أعمق.' } },
  { id: 'tarikh', name: 'Tarikh', ar: 'تاريخ', daily: true, d: { en: 'Put Tunisian history in order, from Carthage to the Quartet, via Louis IX and the Hafsids.', fr: 'Remets l\'histoire de la Tunisie dans l\'ordre, de Carthage au Quartet, en passant par Saint Louis et les Hafsides.', ar: 'رتّب تاريخ تونس من قرطاج إلى الرباعي، مروراً بلويس التاسع والحفصيين.' } },
  { id: 'mnin', name: 'Mnin?', ar: 'منين؟', d: { en: 'Singers, clubs, dishes, monuments: tap where each one comes from.', fr: 'Chanteurs, clubs, plats, monuments : touche d\'où vient chacun.', ar: 'مطربون، نوادٍ، أطباق، معالم: اضغط على أصل كل واحد.' } },
  { id: 'blitz', name: 'Blitz', ar: 'بليتز', d: { en: 'Sixty seconds. Find as many governorates, or delegations, as you can.', fr: 'Soixante secondes. Trouve un max de gouvernorats ou de délégations.', ar: 'ستون ثانية. جد أكبر عدد من الولايات أو المعتمديات.' } },
  { id: 'akthar', name: 'Akthar walla Aqal', ar: 'أكثر ولا أقل', d: { en: 'Higher or lower: population, area and growth from the 2024 census.', fr: 'Plus ou moins : population, superficie et croissance du recensement 2024.', ar: 'أكثر أو أقل: السكان والمساحة والنمو حسب تعداد 2024.' } },
  { id: 'party', name: 'Party', ar: 'لمّة', d: { en: 'Pass the phone around. Lose three lives and you are out. Or send a challenge link.', fr: 'Faites tourner le téléphone. Trois vies perdues et c\'est fini. Ou envoie un lien défi.', ar: 'مرّروا الهاتف. من يخسر ثلاث أرواح يخرج. أو أرسل رابط تحدٍّ.' } }
];
function home() {
  const NEWK = { persondle: 'persondle', wilayadle: 'wilayadle', chkoun: 'chkoun', ghouss: 'ghouss', tarikh: 'tarikh', mnin: 'mnin', akthar: 'akthar' };
  const nw = id => NEWK[id] && DD(TODAY)[NEWK[id]] ? `<span class="chip new">${t('newT')}</span>` : '';
  const st = id => { const daily = LS.get(id + ':' + TODAY); const best = LS.get(id + ':best'); return daily ? `<span class="chip ok">${t('done')}</span>` : best != null ? `<span class="chip">${t('best')} ${best}</span>` : ''; };
  const thumbs = {
    wilayadle: `<div class="thumb tgrid"><i class="ok"></i><i class="part"></i><i class="no"></i><i class="ok"></i></div>`,
    persondle: `<div class="thumb tgrid"><i class="no"></i><i class="ok"></i><i class="part"></i><i class="ok"></i></div>`,
    chkoun: `<div class="thumb q">?</div>`,
    ghouss: `<svg class="thumb" viewBox="0 0 60 60"><path class="t-sea" d="M0 14 Q15 8 30 14 T60 14 V60 H0Z"/><circle class="t-dot" cx="30" cy="44" r="5"/><path class="t-line" d="M30 14 V38"/></svg>`,
    tarikh: `<svg class="thumb" viewBox="0 0 60 60"><path class="t-line" d="M6 30 H54"/><circle class="t-dot" cx="12" cy="30" r="4"/><circle class="t-dot2" cx="30" cy="30" r="4"/><circle class="t-dot" cx="48" cy="30" r="4"/></svg>`,
    mnin: miniMap('TN-61').replace('class="mini"', 'class="thumb mini"'),
    blitz: `<svg class="thumb" viewBox="0 0 60 60"><circle class="t-ring" cx="30" cy="32" r="20"/><path class="t-line" d="M30 32 L30 18 M30 32 L40 38"/></svg>`,
    akthar: `<svg class="thumb" viewBox="0 0 60 60"><rect class="t-dot" x="12" y="22" width="14" height="30" rx="2"/><rect class="t-dot2" x="34" y="10" width="14" height="42" rx="2"/></svg>`,
    party: `<svg class="thumb" viewBox="0 0 60 60"><circle class="t-dot" cx="20" cy="24" r="8"/><circle class="t-dot2" cx="40" cy="24" r="8"/><path class="t-line" d="M8 50 Q20 36 32 50 M28 50 Q40 36 52 50"/></svg>`
  };
  app.innerHTML = `<header class="bar"><span class="brand">Lou3ab <span lang="ar">لعب</span></span><div class="bar-r">${langSwitch()}</div></header>
  <section class="hero">
    <div class="hero-t"><h1>Lou3ab<br><span lang="ar">تونس</span></h1><p>${t('tagline')}</p><p class="day">${t('daily')} · ${t('puzzle')} #${TODAY}</p></div>
    <div class="hero-m">${mapSVG({ level: 'gov' })}</div>
  </section>
  <section class="grid">${GAMES.map(g => `<a class="tile" href="#${g.id}">${thumbs[g.id]}<div class="tile-b"><h2>${g.name} <span lang="ar">${g.ar}</span></h2><p>${L(g.d)}</p><div class="tile-f">${g.daily ? `<span class="chip daily">${t('daily')}</span>` : `<span class="chip">${t('endless')}</span>`}${nw(g.id)}${st(g.id)}</div></div></a>`).join('')}</section>${footer()}`;
  bindLang();
  // idle shimmer: random governorate lights up
  const m = $('.hero-m'); let last; clearInterval(window.__heroT);
  window.__heroT = setInterval(() => { if (!document.body.contains(m)) return clearInterval(window.__heroT); if (last) setCls(m, last, 'lit', false); last = pick(GOVS).id; setCls(m, last, 'lit'); }, 900);
  onPick(m, id => { location.hash = 'wilayadle'; });
}

/* =========================================================
   DLE ENGINE — Loldle-style attribute grid (Wilayadle, Persondle)
   ========================================================= */
const MACRO = { 'grand-tunis': 'N', 'nord-est': 'N', 'nord-ouest': 'N', 'centre-est': 'C', 'centre-ouest': 'C', 'sud-est': 'S', 'sud-ouest': 'S' };
const near = (a, b, pct) => Math.abs(a - b) <= Math.abs(b) * pct;
const cmpNum = (g, t, partOk) => ({ cls: g === t ? 'ok' : partOk ? 'part' : 'no', arrow: g === t ? null : t > g ? 'up' : 'down' });
const LEG = { ok: { en: 'Correct', fr: 'Correct', ar: 'صحيح' }, part: { en: 'Partial', fr: 'Partiel', ar: 'جزئي' }, no: { en: 'Incorrect', fr: 'Incorrect', ar: 'خطأ' }, up: { en: 'Higher', fr: 'Plus haut', ar: 'أعلى' }, down: { en: 'Lower', fr: 'Plus bas', ar: 'أقل' } };
function dle(cfg) {
  const day = Math.min(Math.max(1, cfg.day || TODAY), TODAY);
  const target = cfg.target(day); const key = cfg.id + ':' + day;
  let st = LS.get(key + ':state', { guesses: [], done: false, bonus: null });
  if (st.guesses.some(id => !cfg.byId(id))) st = { guesses: [], done: false, bonus: null };
  const body = shell(cfg.id, cfg.title, cfg.ar, L(cfg.sub), `
    ${dayPicker(cfg.id, day, TODAY)}
    <div class="dle-top"><div class="inbox"></div><p class="dle-count"></p><div class="hints"></div></div>
    <div class="gridwrap"><table class="dle"><thead><tr>${['', ...cfg.cols.map(c => L(c.head))].map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody></tbody></table></div>
    <div class="legend">${['ok', 'part', 'no', 'up', 'down'].map(k => `<span><i class="sw ${k}"></i>${L(LEG[k])}</span>`).join('')}</div>
    <div class="after"></div>`);
  const tb = $('tbody', body), inbox = $('.inbox', body), after = $('.after', body), hints = $('.hints', body), count = $('.dle-count', body);
  const save = () => LS.set(key + ':state', st);
  const cell = (c, g, i, fresh) => { const r = c.cell(g, target); return `<td class="cl ${r.cls} ${r.arrow ? 'ar-' + r.arrow : ''} ${fresh ? 'flip' : ''}" style="--i:${i + 1}"><span>${esc(r.txt)}</span></td>`; };
  function rowHTML(id, fresh) { const g = cfg.byId(id); return `<tr><th scope="row" class="cl who ${id === target.id ? 'ok' : ''} ${fresh ? 'flip' : ''}" style="--i:0">${cfg.face(g)}<span>${esc(cfg.label(g))}</span></th>${cfg.cols.map((c, i) => cell(c, g, i, fresh)).join('')}</tr>`; }
  function drawHints() {
    const n = st.guesses.length;
    hints.innerHTML = cfg.hints.map((h, i) => { const open = st.done || n >= h.at; return `<button class="hint ${open ? 'open' : ''}" data-h="${i}" ${open ? '' : 'disabled'}><b>${L(h.label)}</b><small>${open ? L({ en: 'Tap to show', fr: 'Afficher', ar: 'اعرض' }) : L({ en: `in ${h.at - n} tries`, fr: `dans ${h.at - n} essais`, ar: `بعد ${h.at - n} محاولات` })}</small></button>`; }).join('') + '<div class="hint-out"></div>';
    $$('.hint.open', hints).forEach(b => b.onclick = () => { $('.hint-out', hints).innerHTML = cfg.hints[+b.dataset.h].html(target); });
  }
  function draw(fresh) {
    tb.innerHTML = st.guesses.slice().reverse().map((id, i) => rowHTML(id, fresh && i === 0)).join('');
    count.textContent = st.guesses.length ? `${st.guesses.length} ${L({ en: st.guesses.length > 1 ? 'guesses' : 'guess', fr: 'essai' + (st.guesses.length > 1 ? 's' : ''), ar: 'محاولة' })}` : L({ en: 'Unlimited guesses. Each column tells you how close you are.', fr: 'Essais illimités. Chaque colonne indique si tu chauffes.', ar: 'محاولات غير محدودة. كل عمود يخبرك كم أنت قريب.' });
    drawHints();
    if (st.done) { inbox.innerHTML = ''; setTimeout(end, fresh ? (cfg.cols.length + 1) * 260 : 0); }
  }
  const sq = r => r.cls === 'ok' ? '🟩' : r.cls === 'part' ? '🟧' : r.arrow === 'up' ? '⬆️' : r.arrow === 'down' ? '⬇️' : '🟥';
  function shareText() { const rows = st.guesses.map(id => cfg.cols.map(c => sq(c.cell(cfg.byId(id), target))).join('')); const shown = rows.length > 6 ? [...rows.slice(0, 2), '…', ...rows.slice(-3)] : rows; return `${cfg.title} #${day} · ${st.guesses.length} ${L({ en: 'guesses', fr: 'essais', ar: 'محاولات' })}${st.bonus ? ` · ⭐${st.bonus[0]}/${st.bonus[1]}` : ''}\n${shown.join('\n')}\n${link(cfg.id + '-' + day)}`; }
  function end() {
    if (after.dataset.done) return; after.dataset.done = 1;
    const sh = shareBtn(shareText);
    after.innerHTML = `<div class="result win"><p class="rt">${t('won')} · ${st.guesses.length} ${L({ en: 'guesses', fr: 'essais', ar: 'محاولات' })}</p><h2>${esc(cfg.label(target))} <span lang="ar">${esc(cfg.alt(target))}</span></h2>${cfg.reveal(target, day)}</div>${cfg.bonus ? '<div class="bonusbox"></div>' : ''}<div class="actions">${sh.html}</div>`;
    sh.bind(after); if (cfg.bonus) cfg.bonus($('.bonusbox', after), target, st, save, () => $$('[data-share]', after).forEach(b => b.onclick = () => copy(shareText(), b)));
    after.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  if (!st.done) acInput(inbox, () => cfg.list().filter(x => !st.guesses.includes(x.id)), v => {
    const m = cfg.match(v).filter(id => !st.guesses.includes(id)); if (!m.length) { toast(cfg.match(v).length ? t('already') : L(cfg.unknown), 'bad'); return false; }
    st.guesses.push(m[0]); if (m[0] === target.id) { st.done = true; if (day === TODAY) LS.set(cfg.id + ':' + TODAY, true); const b = LS.get(cfg.id + ':best', null); if (b == null || st.guesses.length < b) LS.set(cfg.id + ':best', st.guesses.length); }
    save(); draw(true);
  }, L(cfg.ph));
  draw(false);
}

/* ---------- Wilayadle ---------- */
const BORD = { DZ: { en: 'Algeria', fr: 'Algérie', ar: 'الجزائر' }, LY: { en: 'Libya', fr: 'Libye', ar: 'ليبيا' } };
const yesno = b => L(b ? { en: 'Yes', fr: 'Oui', ar: 'نعم' } : { en: 'No', fr: 'Non', ar: 'لا' });
const kfmt = n => n >= 1e6 ? (n / 1e6).toFixed(2).replace('.', LANG === 'en' ? '.' : ',') + (LANG === 'ar' ? ' م' : ' M') : n >= 1e3 ? Math.round(n / 1e3) + (LANG === 'ar' ? ' ألف' : ' k') : String(n);
function wilayadle(day) {
  dle({
    id: 'wilayadle', title: 'Wilayadle', ar: 'ولايدل', day,
    sub: { en: 'Guess today\'s governorate. Each guess compares region, coast, borders, population, area and delegations.', fr: 'Devine le gouvernorat du jour. Chaque essai compare région, littoral, frontières, population, superficie et délégations.', ar: 'خمّن ولاية اليوم. كل محاولة تقارن الإقليم والساحل والحدود والسكان والمساحة والمعتمديات.' },
    ph: { en: 'Type a governorate…', fr: 'Tape un gouvernorat…', ar: 'اكتب اسم ولاية…' }, unknown: { en: 'Not a governorate', fr: 'Ce n\'est pas un gouvernorat', ar: 'ليست ولاية' },
    target: d => { const WD = DD(d).wilayadle; return (WD && G[WD.g]) || dailyItem(GOVS, 'wilayadle', d); },
    byId: id => G[id], label: nm, alt: g => LANG === 'ar' ? g.fr : g.ar,
    list: () => GOVS.map(g => ({ id: g.id, label: nm(g), alt: LANG === 'ar' ? g.fr : g.ar })).sort((a, b) => a.label.localeCompare(b.label)),
    match: v => matchAll(v, GIDX),
    face: g => miniMap(g.id),
    cols: [
      { head: { en: 'Region', fr: 'Région', ar: 'الإقليم' }, cell: (g, t) => ({ cls: g.region === t.region ? 'ok' : MACRO[g.region] === MACRO[t.region] ? 'part' : 'no', txt: nm(REG[g.region]) }) },
      { head: { en: 'Coast', fr: 'Littoral', ar: 'ساحلية' }, cell: (g, t) => ({ cls: g.coast === t.coast ? 'ok' : 'no', txt: yesno(g.coast) }) },
      { head: { en: 'Borders', fr: 'Frontière', ar: 'الحدود' }, cell: (g, t) => { const a = g.border.join(), b = t.border.join(); return { cls: a === b ? 'ok' : g.border.some(x => t.border.includes(x)) ? 'part' : 'no', txt: g.border.length ? g.border.map(x => L(BORD[x])).join(' + ') : '—' }; } },
      { head: { en: 'Population', fr: 'Population', ar: 'السكان' }, cell: (g, t) => Object.assign(cmpNum(g.p24, t.p24, near(g.p24, t.p24, .15)), { txt: kfmt(g.p24) }) },
      { head: { en: 'Area km²', fr: 'Superficie km²', ar: 'المساحة كم²' }, cell: (g, t) => Object.assign(cmpNum(g.area, t.area, near(g.area, t.area, .15)), { txt: fmt(g.area) }) },
      { head: { en: 'Delegations', fr: 'Délégations', ar: 'المعتمديات' }, cell: (g, t) => Object.assign(cmpNum(g.ndel, t.ndel, Math.abs(g.ndel - t.ndel) <= 2), { txt: String(g.ndel) }) },
      { head: { en: 'Distance', fr: 'Distance', ar: 'المسافة' }, cell: (g, t) => g.id === t.id ? { cls: 'ok', txt: '0 km' } : { cls: km(g, t) < 120 ? 'part' : 'no', txt: `${arrowEmoji(bearing(g, t))} ${fmt(km(g, t))} km` } }
    ],
    hints: [
      { at: 4, label: { en: 'Outline', fr: 'Silhouette', ar: 'الشكل' }, html: t => silhouette(t, 'sil small') },
      { at: 7, label: { en: 'First letter', fr: 'Première lettre', ar: 'الحرف الأول' }, html: t => `<p class="bigletter">${esc(nm(t)[0])}…</p>` }
    ],
    reveal: (t, d) => { const WD = DD(d).wilayadle; return `<dl class="facts"><div><dt>${t_('pop')}</dt><dd>${fmt(t.p24)}</dd></div><div><dt>${t_('area')}</dt><dd>${fmt(t.area)} km²</dd></div><div><dt>${t_('region')}</dt><dd>${esc(nm(REG[t.region]))}</dd></div></dl>${WD && WD.g === t.id && LF(WD, 'fact') ? `<p class="dfact">${esc(LF(WD, 'fact'))}</p>` : ''}`; },
    bonus: (box, target, st, save, rebind) => {
      box.innerHTML = `<div class="bonus"><p class="bt">${t_('bonusT')}</p><div class="mapwrap">${mapSVG({ level: 'gov', inset: true, cls: id => id === target.id ? 'target' : '' })}</div><div class="brow"></div></div>`;
      const mw = $('.mapwrap', box), brow = $('.brow', box), picked = new Set();
      if (st.bonus) { target.nb.forEach(n => setCls(mw, n, 'good')); brow.innerHTML = `<p class="score">⭐ ${st.bonus[0]}/${st.bonus[1]}</p>`; return; }
      brow.innerHTML = `<button class="btn" id="bonus-check">${t_('check')}</button>`;
      onPick(mw, id => { if (st.bonus || id === target.id) return; picked.has(id) ? picked.delete(id) : picked.add(id); setCls(mw, id, 'sel', picked.has(id)); });
      $('#bonus-check', box).onclick = () => { let good = 0; picked.forEach(id => { const ok = target.nb.includes(id); if (ok) good++; setCls(mw, id, ok ? 'good' : 'bad'); }); target.nb.forEach(n => setCls(mw, n, 'good')); st.bonus = [Math.max(0, good - (picked.size - good)), target.nb.length]; save(); brow.innerHTML = `<p class="score">⭐ ${st.bonus[0]}/${st.bonus[1]}</p>`; rebind(); };
    }
  });
}

/* ---------- Persondle ---------- */
const FIELD = { music: { en: 'Music', fr: 'Musique', ar: 'موسيقى' }, sport: { en: 'Sport', fr: 'Sport', ar: 'رياضة' }, politics: { en: 'Politics', fr: 'Politique', ar: 'سياسة' }, history: { en: 'History', fr: 'Histoire', ar: 'تاريخ' }, literature: { en: 'Literature', fr: 'Littérature', ar: 'أدب' }, cinema: { en: 'Cinema', fr: 'Cinéma', ar: 'سينما' } };
const FGROUP = { music: 'arts', cinema: 'arts', literature: 'arts', politics: 'public', history: 'public', sport: 'sport' };
const pname = p => LANG === 'ar' ? p.ar : p.name;
const slug = n => n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const initials = p => p.name.replace(/^(El|Al|Ibn|Abou?l?)[- ]/i, '').split(/[ -]/).filter(Boolean).map(w => w[0]).slice(0, 2).join('');
const pface = (p, cls = '') => `<i class="avatar f-${p.field} ${cls}" aria-hidden="true"><b>${esc(initials(p))}</b><img src="${esc(p.photo || 'assets/people/' + slug(p.name) + '.jpg')}" alt="" loading="lazy" onerror="this.remove()"></i>`;
function persondle(day) {
  const P = window.PEOPLE; const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const PIDX = buildIndex(P.map(p => ({ id: p.id, en: p.name, fr: p.name, ar: p.ar })));
  dle({
    id: 'persondle', title: 'Persondle', ar: 'شخصدل', day,
    sub: { en: 'Guess today\'s Tunisian personality. Compare field, gender, birthplace, birth year and more.', fr: 'Devine la personnalité tunisienne du jour. Compare domaine, genre, lieu et année de naissance…', ar: 'خمّن الشخصية التونسية لليوم. قارن المجال والجنس ومكان وسنة الولادة…' },
    ph: { en: 'Type a name…', fr: 'Tape un nom…', ar: 'اكتب اسماً…' }, unknown: { en: 'Not in the list', fr: 'Pas dans la liste', ar: 'غير موجود في القائمة' },
    target: d => { const x = DD(d).persondle; return (x && byId[x.id]) || dailyItem(P.filter(p => !p.day), 'persondle', d); },
    byId: id => byId[id], label: pname, alt: p => LANG === 'ar' ? p.name : p.ar,
    list: () => P.filter(p => !p.day || p.day <= TODAY).map(p => ({ id: p.id, label: pname(p), alt: LANG === 'ar' ? p.name : p.ar, face: pface(p, 'sm') })).sort((a, b) => a.label.localeCompare(b.label)),
    match: v => matchAll(v, PIDX),
    face: p => pface(p),
    cols: [
      { head: { en: 'Field', fr: 'Domaine', ar: 'المجال' }, cell: (g, t) => ({ cls: g.field === t.field ? 'ok' : FGROUP[g.field] === FGROUP[t.field] ? 'part' : 'no', txt: L(FIELD[g.field]) }) },
      { head: { en: 'Gender', fr: 'Genre', ar: 'الجنس' }, cell: (g, t) => ({ cls: g.sex === t.sex ? 'ok' : 'no', txt: L(g.sex === 'F' ? { en: 'Woman', fr: 'Femme', ar: 'امرأة' } : { en: 'Man', fr: 'Homme', ar: 'رجل' }) }) },
      { head: { en: 'Born in', fr: 'Né·e à (gouv.)', ar: 'ولاية الولادة' }, cell: (g, t) => ({ cls: g.g === t.g ? 'ok' : G[g.g].region === G[t.g].region ? 'part' : 'no', txt: nm(G[g.g]) }) },
      { head: { en: 'Region', fr: 'Région', ar: 'الإقليم' }, cell: (g, t) => ({ cls: G[g.g].region === G[t.g].region ? 'ok' : MACRO[G[g.g].region] === MACRO[G[t.g].region] ? 'part' : 'no', txt: nm(REG[G[g.g].region]) }) },
      { head: { en: 'Coastal birthplace', fr: 'Gouv. littoral', ar: 'ولاية ساحلية' }, cell: (g, t) => ({ cls: G[g.g].coast === G[t.g].coast ? 'ok' : 'no', txt: yesno(G[g.g].coast) }) },
      { head: { en: 'Born', fr: 'Naissance', ar: 'سنة الولادة' }, cell: (g, t) => Object.assign(cmpNum(g.y, t.y, Math.abs(g.y - t.y) <= 10), { txt: yearTxt(g.y) }) },
      { head: { en: 'Living', fr: 'Vivant·e', ar: 'على قيد الحياة' }, cell: (g, t) => ({ cls: g.alive === t.alive ? 'ok' : 'no', txt: yesno(g.alive) }) }
    ],
    hints: [
      { at: 5, label: { en: 'Known for', fr: 'Connu·e pour', ar: 'اشتهر بـ' }, html: t => `<p class="hinttxt">${esc(t['k_' + LANG] || t.k_fr)}</p>` },
      { at: 8, label: { en: 'Initials', fr: 'Initiales', ar: 'الحروف الأولى' }, html: t => `<p class="bigletter">${esc(t.name.split(/[ -]/).map(w => w[0]).join('. '))}.</p>` }
    ],
    reveal: t => `<p>${esc(t['k_' + LANG] || t.k_fr)} · ${esc(L(FIELD[t.field]))} · ${yearTxt(t.y)} · ${esc(nm(G[t.g]))}</p>${miniMap(t.g)}`
  });
}

/* =========================================================
   CHKOUN? — Originle-style mystery: clues + 3 map guesses
   ========================================================= */
function chkoun(day) {
  day = Math.min(Math.max(1, day || TODAY), TODAY);
  const M = DD(day).chkoun || dailyItem(FACTS.mysteries, 'chkoun', day); const key = 'chkoun:' + day; const MAX = 5;
  let st = LS.get(key + ':state', { guesses: [], done: false, won: false });
  const clues = M['clues_' + LANG] || M.clues_fr || M.clues_en;
  const kindTxt = M.kind === 'person' ? L({ en: 'Mystery person', fr: 'Personnalité mystère', ar: 'شخصية غامضة' }) : L({ en: 'Mystery place', fr: 'Lieu mystère', ar: 'مكان غامض' });
  const body = shell('chkoun', 'Chkoun?', 'شكون؟', L({ en: 'One mystery, five clues. Each wrong guess reveals the next clue. Where is it from?', fr: 'Un mystère, cinq indices. Chaque erreur dévoile l\'indice suivant. D\'où ça vient ?', ar: 'لغز واحد وخمسة تلميحات. كل خطأ يكشف التلميح التالي. من أين أصله؟' }), `
    ${dayPicker('chkoun', day, TODAY)}
    <div class="story"><p class="kind">${kindTxt} #${day}</p><ol class="clues"></ol>${LANG === 'ar' ? `<p class="note">${t('factLang')}</p>` : ''}</div>
    <div class="mapwrap"></div><div class="pickbar"></div><div class="after"></div>`);
  const mw = $('.mapwrap', body), bar = $('.pickbar', body), after = $('.after', body), ol = $('.clues', body);
  let sel = null;
  const save = () => LS.set(key + ':state', st);
  function draw() {
    const shown = st.done ? clues.length : Math.min(clues.length, 1 + st.guesses.length);
    ol.innerHTML = clues.map((c, i) => `<li class="${i < shown ? 'on' : ''}">${i < shown ? esc(c) : '•••'}</li>`).join('');
    mw.innerHTML = mapSVG({ level: 'gov', inset: true, cls: id => (st.guesses.includes(id) ? (id === M.g ? 'good' : 'bad') : '') + (st.done && id === M.g ? ' target' : '') + (id === sel ? ' sel' : '') });
    st.guesses.filter(id => id !== M.g).forEach(id => { const g = G[id]; const p = $(`.map`, mw); p.insertAdjacentHTML('beforeend', `<text class="dist" x="${g.lx}" y="${g.ly}">${fmt(km(g, G[M.g]))} km</text>`); });
    if (st.done) { bar.innerHTML = ''; end(); return; }
    bar.innerHTML = `<span class="sel-n">${sel ? esc(nm(G[sel])) : t('tapMap')}</span><span class="left">${MAX - st.guesses.length} ${t('guessesLeft')}</span><button class="btn primary" id="ck-ok" ${sel ? '' : 'disabled'}>${t('confirm')}</button>`;
    $('#ck-ok', bar).onclick = () => { if (!sel) return; st.guesses.push(sel); if (sel === M.g) st.done = st.won = true; else if (st.guesses.length >= MAX) st.done = true; if (st.done && day === TODAY) LS.set('chkoun:' + TODAY, true); sel = null; save(); draw(); };
    onPick(mw, id => { if (st.guesses.includes(id)) return; sel = id; draw(); });
  }
  function end() {
    const sh = shareBtn(() => `Chkoun? #${day} ${st.won ? st.guesses.length : 'X'}/${MAX}\n${st.guesses.map(id => id === M.g ? '🟩' : '🟥').join('')}${'⬜'.repeat(MAX - st.guesses.length)}\n${link('chkoun-' + day)}`);
    after.innerHTML = `<div class="result ${st.won ? 'win' : 'lose'}"><p class="rt">${st.won ? t('won') : t('lost')}</p><h2>${esc(M.name)}</h2><p>${esc(M['born_' + LANG] || M.born_fr || M.born_en)} · ${esc(nm(G[M.g]))}</p></div><div class="actions">${sh.html}</div>`;
    sh.bind(after);
  }
  draw();
}

/* =========================================================
   GHOUSS — Krillion-style dive: rarer answers go deeper
   ========================================================= */
const KEYWORDS = ['Sidi', 'Menzel', 'Bir', 'Ouled', 'Hammam', 'Ksar', 'Aïn', 'Bou', 'Jebel', 'El Ksour'];
function ghoussPrompts(day) {
  const r = rng('ghouss:' + day); const used = new Set();
  const out = (DD(day).ghouss || []).filter(p => p.valid && p.valid.length).slice(0, 7).map((p, i) => ({ k: 'c' + i, kind: p.kind === 'gov' ? 'gov' : 'del', valid: p.valid.filter(id => G[id] || D[id]), txt: p['txt_' + LANG] || p.txt_fr || p.txt_en, isNew: true }));
  const byPop = ids => ids.slice().sort((a, b) => ((G[b] || D[b]).p24 - (G[a] || D[a]).p24));
  const gens = [
    () => { const g = pick(GOVS.filter(g => DELS.filter(d => d.g === g.id).length >= 6), r); return { k: 'dg' + g.id, kind: 'del', valid: DELS.filter(d => d.g === g.id).map(d => d.id), txt: L({ en: `A delegation of ${g.en}`, fr: `Une délégation de ${g.fr}`, ar: `معتمدية من ولاية ${g.ar}` }) }; },
    () => { const g = pick(GOVS.filter(g => g.nb.length >= 3), r); return { k: 'nb' + g.id, kind: 'gov', valid: g.nb, txt: L({ en: `A governorate bordering ${g.en}`, fr: `Un gouvernorat voisin de ${g.fr}`, ar: `ولاية مجاورة لـ${g.ar}` }) }; },
    () => { const rg = pick(TN.regions.filter(x => x.govs.length >= 3), r); return { k: 'rg' + rg.id, kind: 'gov', valid: rg.govs, txt: L({ en: `A governorate of the ${rg.en} region`, fr: `Un gouvernorat de la région ${rg.fr}`, ar: `ولاية من إقليم ${rg.ar}` }) }; },
    () => { const counts = {}; DELS.forEach(d => { const c = norm(d.fr)[0]; (counts[c] = counts[c] || []).push(d.id); }); const c = pick(Object.keys(counts).filter(c => /[a-z]/.test(c) && counts[c].length >= 6), r); return { k: 'lt' + c, kind: 'del', valid: counts[c], txt: L({ en: `A delegation starting with “${c.toUpperCase()}”`, fr: `Une délégation qui commence par « ${c.toUpperCase()} »`, ar: `معتمدية يبدأ اسمها اللاتيني بحرف ${c.toUpperCase()}` }) }; },
    () => { const w = pick(KEYWORDS.filter(w => DELS.filter(d => norm(d.fr).split(' ').includes(norm(w))).length >= 3), r); return { k: 'kw' + w, kind: 'del', valid: DELS.filter(d => norm(d.fr).split(' ').includes(norm(w))).map(d => d.id), txt: L({ en: `A delegation with “${w}” in its name`, fr: `Une délégation avec « ${w} » dans son nom`, ar: `معتمدية في اسمها كلمة «${w}»` }) }; },
    () => { const d = pick(DELS.filter(d => d.nb.length >= 4 && d.p24 > 60000), r); return { k: 'dn' + d.id, kind: 'del', valid: d.nb, txt: L({ en: `A delegation bordering ${d.en} (${G[d.g].en})`, fr: `Une délégation voisine de ${d.fr} (${G[d.g].fr})`, ar: `معتمدية مجاورة لـ${d.ar} (${G[d.g].ar})` }) }; },
    () => { const th = pick([300000, 400000, 500000], r); return { k: 'pp' + th, kind: 'gov', valid: GOVS.filter(g => g.p24 > th).map(g => g.id), txt: L({ en: `A governorate with more than ${fmt(th)} people (2024)`, fr: `Un gouvernorat de plus de ${fmt(th)} habitants (2024)`, ar: `ولاية يفوق عدد سكانها ${fmt(th)} (2024)` }) }; },
    () => { const g = pick(GOVS.filter(g => DELS.filter(d => d.g === g.id).length >= 9), r); return { k: 'dg' + g.id, kind: 'del', valid: DELS.filter(d => d.g === g.id).map(d => d.id), txt: L({ en: `A delegation of ${g.en}`, fr: `Une délégation de ${g.fr}`, ar: `معتمدية من ولاية ${g.ar}` }) }; }
  ];
  let guard = 0;
  while (out.length < 7 && guard++ < 200) { const p = pick(gens, r)(); if (used.has(p.k)) continue; used.add(p.k); p.order = byPop(p.valid); out.push(p); }
  return out;
}
function depthOf(p, id) { const i = p.order.indexOf(id); if (i < 0) return 0; const n = p.order.length; return n === 1 ? 50 : Math.round(10 + 90 * i / (n - 1)); }
function ghouss(day) {
  day = Math.min(Math.max(1, day || TODAY), TODAY);
  const key = 'ghouss:' + day;
  const P = ghoussPrompts(day);
  let st = LS.get(key + ':state', { ans: [] }); // [{id, depth}|null]
  const body = shell('ghouss', 'Ghouss', 'غوص', L({ en: 'Seven prompts. Common answers stay near the surface, rare ones (smaller populations) take you deeper.', fr: 'Sept questions. Les réponses courantes restent en surface, les rares (moins peuplées) t\'emmènent au fond.', ar: 'سبعة أسئلة. الإجابات الشائعة تبقى قرب السطح، والنادرة (الأقل سكاناً) تأخذك إلى العمق.' }), `
    ${dayPicker('ghouss', day, TODAY)}
    <div class="dive"><div class="gauge"><div class="water"></div><div class="diver"></div><span class="gm"></span></div><div class="dive-main"><div class="prompt"></div><div class="inbox"></div><ol class="log"></ol><div class="after"></div></div></div>`);
  const pr = $('.prompt', body), inbox = $('.inbox', body), log = $('.log', body), after = $('.after', body);
  const total = () => st.ans.reduce((s, a) => s + (a ? a.depth : 0), 0);
  const save = () => LS.set(key + ':state', st);
  function draw() {
    const i = st.ans.length, tot = total();
    $('.diver', body).style.setProperty('--d', Math.min(1, tot / 700));
    $('.gm', body).textContent = tot + ' m';
    log.innerHTML = st.ans.map((a, k) => `<li class="${a ? 'ok' : 'miss'}"><span class="lp">${esc(P[k].txt)}</span><span class="la">${a ? esc(nm(G[a.id] || D[a.id])) : '—'}</span><b>${a ? a.depth : 0} m</b></li>`).join('');
    if (i >= P.length) { pr.innerHTML = ''; inbox.innerHTML = ''; end(); return; }
    pr.innerHTML = `<p class="pn">${i + 1}/7${P[i].isNew ? ` <span class="chip new">${t('newT')}</span>` : ''}</p><h2>${esc(P[i].txt)}</h2>`;
    const inp = acInputPlain(inbox, v => {
      const p = P[i]; const idx = p.kind === 'gov' ? GIDX : DIDX;
      const m = matchAll(v, idx); if (!m.length) { toast(t('notPlace'), 'bad'); return false; }
      const hit = p.order.find(id => m.includes(id)); // if ambiguous, take the most common (shallowest) valid match
      if (hit) { const dep = depthOf(p, hit); st.ans.push({ id: hit, depth: dep }); toast(`${nm(G[hit] || D[hit])} · ${dep} m`, 'good'); }
      else { st.ans.push(null); toast(t('notValid'), 'bad'); }
      if (st.ans.length >= P.length && day === TODAY) LS.set('ghouss:' + TODAY, true);
      const best = LS.get('ghouss:best', 0); if (st.ans.length >= P.length && total() > best) LS.set('ghouss:best', total());
      save(); draw();
    }, () => { st.ans.push(null); save(); draw(); });
    inp.focus({ preventScroll: true });
  }
  function end() {
    const tot = total(); const bars = '▁▂▃▄▅▆▇█';
    const sh = shareBtn(() => `🤿 Ghouss #${day} · ${tot} m\n${st.ans.map(a => a ? bars[Math.min(7, Math.floor(a.depth / 12.6))] : '·').join('')}\n${link('ghouss-' + day)}`);
    after.innerHTML = `<div class="result win"><p class="rt">${t('depth')}</p><h2>${tot} m</h2></div>
      <details class="deep"><summary>${t('deepest')}</summary><ul>${P.map(p => { const id = p.order[p.order.length - 1]; return `<li><span>${esc(p.txt)}</span><b>${esc(nm(G[id] || D[id]))}</b></li>`; }).join('')}</ul></details>
      <div class="actions">${sh.html}</div>`;
    sh.bind(after);
  }
  draw();
}
function acInputPlain(root, onSubmit, onSkip) {
  root.innerHTML = `<form class="ac" autocomplete="off"><input id="gh-in" type="text" placeholder="${esc(t('typeAns'))}" aria-label="${esc(t('typeAns'))}"><button class="btn primary" type="submit">${t('dive')}</button><button class="btn ghost" type="button" data-skip>${t('skip')}</button></form>`;
  const f = $('form', root), inp = $('input', root);
  f.onsubmit = e => { e.preventDefault(); if (!inp.value.trim()) return; if (onSubmit(inp.value) === false) { f.classList.add('shake'); setTimeout(() => f.classList.remove('shake'), 400); } };
  $('[data-skip]', root).onclick = onSkip; return inp;
}

/* =========================================================
   TARIKH — chronology timeline
   ========================================================= */
function tarikh(arg) {
  const mode = arg === 'endless' ? 'endless' : 'daily';
  const day = mode === 'daily' ? Math.min(Math.max(1, +arg || TODAY), TODAY) : 0;
  const r = mode === 'daily' ? rng('tarikh:' + day) : Math.random;
  const avail = HIST.map((h, i) => i).filter(i => mode === 'endless' || (HIST[i].day || 0) <= day);
  const fresh = mode === 'daily' ? avail.filter(i => HIST[i].day === day) : [];
  const rest = shuffle(avail.filter(i => !fresh.includes(i)), r);
  const deck = [rest[0], ...shuffle(fresh, r), ...rest.slice(1)];
  const key = 'tarikh:' + day;
  const N = 10, MAXL = 3;
  let st = mode === 'daily' ? LS.get(key + ':state', null) : null;
  if (!st) st = { line: [deck[0]], idx: 1, marks: [], lives: MAXL, done: false, last: null };
  const body = shell('tarikh', 'Tarikh', 'تاريخ', L({ en: 'Place each event in the right spot. Three mistakes and the timeline closes.', fr: 'Place chaque événement au bon endroit. Trois erreurs et la frise se ferme.', ar: 'ضع كل حدث في مكانه الصحيح. ثلاثة أخطاء وتُغلق الخط الزمني.' }), `
    <div class="tmodes"><a class="btn sm ${mode === 'daily' ? 'primary' : 'ghost'}" href="#tarikh">${t('daily')}</a><a class="btn sm ${mode === 'endless' ? 'primary' : 'ghost'}" href="#tarikh-endless">${t('endless')}</a></div>
    ${mode === 'daily' ? dayPicker('tarikh', day, TODAY) : ''}
    <div class="tstat"></div><div class="card-now"></div><div class="reveal"></div><div class="timeline"></div><div class="after"></div>`);
  const cur = $('.card-now', body), tl = $('.timeline', body), rev = $('.reveal', body), after = $('.after', body), stat = $('.tstat', body);
  const H = i => HIST[i];
  const save = () => mode === 'daily' && LS.set(key + ':state', st);
  const title = h => h[LANG] || h.fr, det = h => h['d_' + LANG] || h.d_fr;
  function draw() {
    stat.innerHTML = `${hearts(st.lives, MAXL)}<span>${t('score')} <b>${st.marks.filter(Boolean).length}</b>${mode === 'daily' ? ' / ' + (N - 1) : ''}</span>`;
    const finished = st.lives <= 0 || (mode === 'daily' && st.idx >= N) || st.idx >= deck.length;
    if (finished && !st.done) { st.done = true; if (mode === 'daily' && day === TODAY) LS.set('tarikh:' + TODAY, true); if (mode === 'endless') { const b = LS.get('tarikh:best', 0); const s = st.marks.filter(Boolean).length; if (s > b) LS.set('tarikh:best', s); } save(); }
    const card = !st.done ? H(deck[st.idx]) : null;
    cur.innerHTML = card ? `<div class="hcard now"><p class="hy">????${card.day === day && day ? ` <span class="chip new">${t('newT')}</span>` : ''}</p><h3>${esc(title(card))}</h3><p class="hint">${t('placeIt')}</p></div>` : '';
    rev.innerHTML = st.last != null ? (() => { const h = H(st.last.i); return `<div class="hcard rv ${st.last.ok ? 'good' : 'bad'}">${h.g ? miniMap(h.g) : ''}<div><p class="hy">${yearTxt(h.y)} · ${st.last.ok ? t('correct') : t('wrong')}</p><h3>${esc(title(h))}</h3><p>${esc(det(h))}</p></div></div>`; })() : '';
    tl.innerHTML = (card ? slot(0) : '') + st.line.map((i, k) => `<div class="hcard in ${st.marks[st.line.indexOf(i)] === false ? 'was-bad' : ''}"><p class="hy">${yearTxt(H(i).y)}</p><h3>${esc(title(H(i)))}</h3></div>` + (card ? slot(k + 1) : '')).join('');
    $$('.slot', tl).forEach(b => b.onclick = () => place(+b.dataset.k));
    if (st.done) end();
  }
  const slot = k => `<button class="slot" data-k="${k}">+ ${t('here')}</button>`;
  function place(k) {
    const i = deck[st.idx], y = Math.floor(H(i).y);
    const lo = k > 0 ? Math.floor(H(st.line[k - 1]).y) : -1e9, hi = k < st.line.length ? Math.floor(H(st.line[k]).y) : 1e9;
    const ok = y >= lo && y <= hi;
    let pos = st.line.findIndex(j => H(j).y > H(i).y); if (pos < 0) pos = st.line.length;
    st.line.splice(ok ? k : pos, 0, i); st.marks.push(ok); if (!ok) st.lives--;
    st.idx++; st.last = { i, ok }; save(); draw();
    rev.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function end() {
    const s = st.marks.filter(Boolean).length;
    const sh = shareBtn(() => `📜 Tarikh ${mode === 'daily' ? '#' + day : '∞'} · ${s}${mode === 'daily' ? '/' + (N - 1) : ''}\n${st.marks.map(m => m ? '🟩' : '🟥').join('')}\n${link(mode === 'daily' ? 'tarikh-' + day : 'tarikh-endless')}`);
    after.innerHTML = `<div class="result ${st.lives > 0 ? 'win' : 'lose'}"><p class="rt">${t('score')}</p><h2>${s}${mode === 'daily' ? ' / ' + (N - 1) : ''}</h2></div><div class="actions">${sh.html}${mode === 'endless' ? `<button class="btn" id="tk-again">${t('again')}</button>` : ''}</div>`;
    sh.bind(after); if (mode === 'endless') $('#tk-again').onclick = () => tarikh('endless');
  }
  draw();
}

/* =========================================================
   MNIN? — origins on the map
   ========================================================= */
const CAT = { music: { en: 'Music', fr: 'Musique', ar: 'موسيقى' }, sport: { en: 'Sport', fr: 'Sport', ar: 'رياضة' }, food: { en: 'Food & crafts', fr: 'Cuisine & artisanat', ar: 'أكل وحِرف' }, place: { en: 'Places', fr: 'Lieux', ar: 'أماكن' }, history: { en: 'History', fr: 'Histoire', ar: 'تاريخ' } };
function mnin(cat) {
  const recent = FACTS.origins.filter(isNew);
  if (!cat && recent.length) cat = 'new';
  const pool = cat === 'new' ? recent : FACTS.origins.filter(o => !cat || cat === 'all' || o.cat === cat);
  let Q = shuffle(pool).slice(0, 10); if (Q.length < 10) Q = Q.concat(shuffle(FACTS.origins.filter(o => !Q.includes(o))).slice(0, 10 - Q.length)); let i = 0, score = 0, res = [];
  const body = shell('mnin', 'Mnin?', 'منين؟', L({ en: 'Where does it come from? Tap the governorate.', fr: 'D\'où ça vient ? Touche le gouvernorat.', ar: 'من أين؟ اضغط على الولاية.' }), `
    <div class="cats">${[...(recent.length ? ['new'] : []), 'all', ...Object.keys(CAT)].map(c => `<a class="btn sm ${(cat || 'all') === c ? 'primary' : 'ghost'}" href="#mnin${c === 'all' ? '' : '-' + c}">${c === 'new' ? '★ ' + t('newT') : c === 'all' ? L({ en: 'All', fr: 'Tout', ar: 'الكل' }) : L(CAT[c])}</a>`).join('')}</div>
    <div class="tstat"></div><div class="qcard"></div><div class="mapwrap"></div><div class="after"></div>`);
  const qc = $('.qcard', body), mw = $('.mapwrap', body), stat = $('.tstat', body), after = $('.after', body);
  let locked = false;
  function draw() {
    stat.innerHTML = `<span>${Math.min(i + 1, Q.length)}/${Q.length}</span><span>${t('score')} <b>${score}</b></span>`;
    if (i >= Q.length) return end();
    const q = Q[i]; locked = false;
    qc.innerHTML = `<div class="ocard"><span class="chip">${esc(L(CAT[q.cat] || CAT.place))}</span>${isNew(q) ? ` <span class="chip new">${t('newT')}</span>` : ''}<h2>${esc(q[LANG] || q.fr || q.en)}</h2><p>${esc(LF(q, 'sub'))}</p></div>`;
    mw.innerHTML = mapSVG({ level: 'gov', inset: true });
    onPick(mw, id => {
      if (locked) return; locked = true;
      const ok = q.g.includes(id); if (ok) score++; res.push(ok);
      setCls(mw, id, ok ? 'good' : 'bad'); q.g.forEach(g => setCls(mw, g, 'target'));
      const d = ok ? 0 : Math.min(...q.g.map(g => km(G[id], G[g])));
      qc.insertAdjacentHTML('beforeend', `<div class="fb ${ok ? 'good' : 'bad'}"><b>${ok ? t('correct') : t('wrong') + ' · ' + fmt(d) + ' km'}</b> ${esc(LF(q, 'why'))}<button class="btn primary sm" id="mn-next">${t('next')}</button></div>`);
      stat.innerHTML = `<span>${i + 1}/${Q.length}</span><span>${t('score')} <b>${score}</b></span>`;
      $('#mn-next').onclick = () => { i++; draw(); }; $('#mn-next').focus({ preventScroll: true });
    });
  }
  function end() {
    qc.innerHTML = ''; mw.innerHTML = '';
    const b = LS.get('mnin:best', 0); if (score > b) LS.set('mnin:best', score);
    const sh = shareBtn(() => `📍 Mnin? ${score}/${Q.length}\n${res.map(r => r ? '🟩' : '🟥').join('')}\n${link('mnin')}`);
    after.innerHTML = `<div class="result win"><p class="rt">${t('score')}</p><h2>${score} / ${Q.length}</h2></div><div class="actions">${sh.html}<button class="btn" id="mn-again">${t('again')}</button></div>`;
    sh.bind(after); $('#mn-again').onclick = () => mnin(cat);
  }
  draw();
}

/* =========================================================
   BLITZ — timed map finding
   ========================================================= */
function blitz(mode) {
  mode = mode === 'del' ? 'del' : 'gov';
  const GOAL = mode === 'gov' ? 24 : 15;
  const body = shell('blitz', 'Blitz', 'بليتز', L(mode === 'gov' ? { en: 'Find all 24 governorates in 60 seconds to win.', fr: 'Trouve les 24 gouvernorats en 60 secondes pour gagner.', ar: 'جد الولايات الأربع والعشرين في 60 ثانية لتفوز.' } : { en: 'Find 15 delegations in 90 seconds to win.', fr: 'Trouve 15 délégations en 90 secondes pour gagner.', ar: 'جد 15 معتمدية في 90 ثانية لتفوز.' }), `
    <div class="tmodes"><a class="btn sm ${mode === 'gov' ? 'primary' : 'ghost'}" href="#blitz">${L({ en: 'Governorates · 60 s', fr: 'Gouvernorats · 60 s', ar: 'الولايات · 60 ث' })}</a><a class="btn sm ${mode === 'del' ? 'primary' : 'ghost'}" href="#blitz-del">${L({ en: 'Delegations · 90 s', fr: 'Délégations · 90 s', ar: 'المعتمديات · 90 ث' })}</a></div>
    <div class="blitzbar"><span class="target-n"></span><span class="clock"></span><span class="bs">0/${GOAL}</span></div>
    <div class="bz-fb" aria-live="assertive"></div><div class="mapwrap"></div><div class="after"></div>`);
  const mw = $('.mapwrap', body), tn = $('.target-n', body), clock = $('.clock', body), bs = $('.bs', body), after = $('.after', body), fb = $('.bz-fb', body);
  const TIME = mode === 'gov' ? 60 : 90; let left = TIME, score = 0, miss = 0, queue = [], target = null, gov = null, timer = null, started = false, lock = false, over = false;
  const found = new Set(), missed = [];
  const nameOf = id => nm(G[id] || D[id]);
  function feedback(ok, txt) { fb.className = 'bz-fb show ' + (ok ? 'good' : 'bad'); fb.innerHTML = txt; clearTimeout(fb._t); fb._t = setTimeout(() => fb.classList.remove('show'), ok ? 700 : 1400); }
  function nextGov() { gov = pick(GOVS).id; queue = shuffle(DELS.filter(d => d.g === gov).map(d => d.id)); mw.innerHTML = mapSVG({ level: 'del', gov }); bindMap(); }
  function next() {
    if (mode === 'gov') { if (!queue.length) queue = shuffle(GOVS.map(g => g.id).filter(id => !found.has(id))); }
    else if (!queue.length) nextGov();
    target = queue.pop();
    tn.innerHTML = `${t('find')} <b>${esc(nameOf(target))}</b>${mode === 'del' ? ` <small>· ${esc(nm(G[gov]))}</small>` : ''}`;
  }
  function bindMap() { onPick(mw, id => {
    if (!started || lock || over) return;
    if (id === target) {
      score++; found.add(id); bs.textContent = `${score}/${GOAL}`; setCls(mw, id, 'done'); setCls(mw, id, 'flash-g'); setTimeout(() => setCls(mw, id, 'flash-g', false), 350);
      feedback(true, `✓ ${esc(nameOf(id))}`);
      if (score >= GOAL) return end(true);
      next();
    } else {
      miss++; lock = true; if (!missed.includes(target)) missed.push(target);
      setCls(mw, id, 'flash-r'); setCls(mw, target, 'target');
      feedback(false, `✗ ${L({ en: 'That\'s', fr: 'Ça, c\'est', ar: 'هذه' })} <b>${esc(nameOf(id))}</b>. <b>${esc(nameOf(target))}</b> ${L({ en: 'is the one flashing.', fr: 'est celui qui clignote.', ar: 'هي التي تومض.' })}`);
      setTimeout(() => { setCls(mw, id, 'flash-r', false); setCls(mw, target, 'target', false); lock = false; if (!over) { queue.unshift(target); next(); } }, 900);
    }
  }); }
  if (mode === 'gov') { mw.innerHTML = mapSVG({ level: 'gov', inset: true }); bindMap(); } else nextGov();
  tn.innerHTML = `<button class="btn primary" id="bz-go">${t('start')}</button>`; clock.textContent = TIME + ' s';
  $('#bz-go').onclick = () => { started = true; next(); timer = setInterval(() => { if (!document.body.contains(clock)) return clearInterval(timer); left--; clock.textContent = left + ' s'; clock.classList.toggle('hot', left <= 10); if (left <= 0) end(false); }, 1000); };
  function end(won) {
    if (over) return; over = true; clearInterval(timer);
    const used = TIME - left;
    tn.innerHTML = won ? `🏆 <b>${L({ en: 'You won!', fr: 'Gagné !', ar: 'فزت!' })}</b>` : `⏱ <b>${L({ en: 'Time\'s up, you lost', fr: 'Temps écoulé, perdu', ar: 'انتهى الوقت، خسرت' })}</b>`;
    const k = 'blitz:best' + (mode === 'del' ? ':del' : ''); const b = LS.get(k, 0); if (score > b) LS.set(k, score); if (mode === 'gov' && score > LS.get('blitz:best', 0)) LS.set('blitz:best', score);
    // show what was left on the map
    if (mode === 'gov') GOVS.filter(g => !found.has(g.id)).forEach(g => setCls(mw, g.id, 'bad'));
    const left_ = mode === 'gov' ? GOVS.filter(g => !found.has(g.id)).map(g => nm(g)) : missed.map(nameOf);
    const sh = shareBtn(() => `⚡ Blitz ${mode === 'gov' ? L({ en: 'governorates', fr: 'gouvernorats', ar: 'ولايات' }) : L({ en: 'delegations', fr: 'délégations', ar: 'معتمديات' })}: ${won ? '🏆' : '⏱'} ${score}/${GOAL}${won ? ` ${L({ en: 'in', fr: 'en', ar: 'في' })} ${used}s` : ''} (${miss} ✗)\n${link(mode === 'gov' ? 'blitz' : 'blitz-del')}`);
    after.innerHTML = `<div class="result ${won ? 'win' : 'lose'}"><p class="rt">${won ? L({ en: 'You won', fr: 'Victoire', ar: 'فوز' }) : L({ en: 'You lost', fr: 'Défaite', ar: 'خسارة' })}</p><h2>${score} / ${GOAL}</h2><p>${won ? L({ en: `All found in ${used} s with ${miss} mistake(s).`, fr: `Tout trouvé en ${used} s avec ${miss} erreur(s).`, ar: `وجدتها كلها في ${used} ث مع ${miss} خطأ.` }) : L({ en: `${GOAL - score} left to find.`, fr: `Il en restait ${GOAL - score} à trouver.`, ar: `بقي ${GOAL - score} لم تجدها.` })} ${t('best')}: ${Math.max(b, score)}</p>${!won && left_.length ? `<p class="missed"><b>${L({ en: mode === 'gov' ? 'Not found (in red on the map):' : 'Missed:', fr: mode === 'gov' ? 'Non trouvés (en rouge sur la carte) :' : 'Ratées :', ar: mode === 'gov' ? 'لم تجدها (بالأحمر على الخريطة):' : 'أخطأتها:' })}</b> ${left_.map(esc).join(' · ')}</p>` : ''}</div><div class="actions">${sh.html}<button class="btn" id="bz-again">${t('again')}</button></div>`;
    sh.bind(after); $('#bz-again').onclick = () => blitz(mode); after.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* =========================================================
   AKTHAR WALLA AQAL — higher / lower
   ========================================================= */
function akthar(mode) {
  const MODES = {
    pop: { lab: { en: 'Population · delegations', fr: 'Population · délégations', ar: 'السكان · المعتمديات' }, items: DELS.filter(d => d.p24 > 0), val: x => x.p24, unit: '', q: { en: 'people', fr: 'habitants', ar: 'نسمة' } },
    area: { lab: { en: 'Area · governorates', fr: 'Superficie · gouvernorats', ar: 'المساحة · الولايات' }, items: GOVS, val: x => x.area, unit: ' km²', q: { en: 'km²', fr: 'km²', ar: 'كم²' } },
    grow: { lab: { en: 'Growth 2014→2024 · governorates', fr: 'Croissance 2014→2024 · gouvernorats', ar: 'النمو 2014←2024 · الولايات' }, items: GOVS, val: x => (x.p24 / x.p14 - 1) * 100, unit: ' %', q: { en: 'growth', fr: 'de croissance', ar: 'نمو' } }
  };
  const AT = DD(TODAY).akthar;
  if (AT && AT.items && AT.items.length >= 4) MODES.theme = { lab: { en: '★ ' + (AT.lab_en || AT.lab_fr), fr: '★ ' + (AT.lab_fr || AT.lab_en), ar: '★ ' + (AT.lab_ar || AT.lab_fr) }, items: AT.items.map((x, i) => ({ id: 'x' + i, en: x.en, fr: x.fr || x.en, ar: x.ar || x.fr || x.en, g: x.g, value: +x.value })), val: x => x.value, unit: AT.unit ? ' ' + AT.unit : '', src: AT.source };
  mode = MODES[mode] ? mode : (MODES.theme && !mode ? 'theme' : 'pop'); const M = MODES[mode];
  const body = shell('akthar', 'Akthar walla Aqal', 'أكثر ولا أقل', L({ en: 'Does the second one have more or less? Figures from the INS 2024 census.', fr: 'Le second en a-t-il plus ou moins ? Chiffres du recensement INS 2024.', ar: 'هل الثاني أكثر أم أقل؟ أرقام تعداد 2024.' }), `
    <div class="tmodes">${Object.keys(MODES).map(k => `<a class="btn sm ${k === mode ? 'primary' : 'ghost'}" href="#akthar-${k}">${L(MODES[k].lab)}</a>`).join('')}</div>
    <div class="tstat"></div><div class="duel"></div>${M.src ? `<p class="src">Source : ${esc(M.src)}</p>` : ''}<div class="after"></div>`);
  const duel = $('.duel', body), stat = $('.tstat', body), after = $('.after', body);
  const show = v => mode === 'grow' ? (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', LANG === 'en' ? '.' : ',') + ' %' : fmt(v) + M.unit;
  let a = pick(M.items), b, streak = 0, best = LS.get('akthar:best:' + mode, 0);
  const sub = x => G[x.id] ? nm(REG[x.region]) : x.g && G[x.g] && nm(G[x.g]) !== nm(x) ? nm(G[x.g]) : '';
  const mm = x => (G[x.id] || D[x.id]) ? miniMap(x.id) : x.g && G[x.g] ? miniMap(x.g) : '';
  function nextB() { do { b = pick(M.items); } while (b.id === a.id || Math.abs(M.val(b) - M.val(a)) < 1e-9); }
  nextB();
  function draw() {
    stat.innerHTML = `<span>${t('streak')} <b>${streak}</b></span><span>${t('best')} <b>${best}</b></span>`;
    duel.innerHTML = `<div class="side">${mm(a)}<h2>${esc(nm(a))}</h2><p class="sub">${esc(sub(a))}</p><p class="val">${show(M.val(a))}</p></div>
      <div class="vs">vs</div>
      <div class="side">${mm(b)}<h2>${esc(nm(b))}</h2><p class="sub">${esc(sub(b))}</p><p class="val q">?</p><div class="hl"><button class="btn primary" data-a="1">▲ ${t('more')}</button><button class="btn primary" data-a="-1">▼ ${t('less')}</button></div></div>`;
    $$('[data-a]', duel).forEach(btn => btn.onclick = () => answer(+btn.dataset.a));
  }
  function answer(dir) {
    const va = M.val(a), vb = M.val(b), ok = dir > 0 ? vb >= va : vb <= va;
    const v = $('.val.q', duel); $$('[data-a]', duel).forEach(x => x.disabled = true);
    let t0 = null; const step = ts => { t0 = t0 || ts; const p = Math.min(1, (ts - t0) / 600); v.textContent = show(vb * (0.4 + 0.6 * p)); if (p < 1) requestAnimationFrame(step); else { v.textContent = show(vb); v.classList.add(ok ? 'good' : 'bad'); setTimeout(() => ok ? (streak++, best = Math.max(best, streak), LS.set('akthar:best:' + mode, best), LS.set('akthar:best', Math.max(best, LS.get('akthar:best', 0))), a = b, nextB(), draw()) : end(), ok ? 650 : 900); } };
    requestAnimationFrame(step);
  }
  function end() {
    const sh = shareBtn(() => `📊 Akthar walla Aqal (${L(M.lab)}): ${streak} ${L({ en: 'in a row', fr: 'd\'affilée', ar: 'متتالية' })}\n${link('akthar' + (mode === 'pop' ? '' : '-' + mode))}`);
    after.innerHTML = `<div class="result lose"><p class="rt">${t('gameover')}</p><h2>${t('streak')}: ${streak}</h2></div><div class="actions">${sh.html}<button class="btn" id="ak-again">${t('again')}</button></div>`;
    sh.bind(after); $('#ak-again').onclick = () => akthar(mode);
  }
  draw();
}

/* =========================================================
   QUESTION FACTORY (party & challenge)
   ========================================================= */
function makeQ(r) {
  const types = ['sil', 'origin', 'deleg', 'hist', 'pop', 'nb', 'origin', 'sil'];
  const ty = pick(types, r);
  const govOpts = (ans, n = 4) => shuffle([ans, ...shuffle(GOVS.map(g => g.id).filter(id => id !== ans), r).slice(0, n - 1)], r);
  if (ty === 'sil') { const g = pick(GOVS, r); return { html: `<p class="qq">${L({ en: 'Which governorate is this?', fr: 'Quel gouvernorat ?', ar: 'ما هذه الولاية؟' })}</p>${silhouette(g, 'sil small')}`, opts: govOpts(g.id).map(id => ({ id, label: nm(G[id]) })), ans: g.id }; }
  if (ty === 'origin') { const o = pick(FACTS.origins, r); const a = o.g[0]; return { html: `<p class="qq">${L({ en: 'Where is it from?', fr: 'D\'où ça vient ?', ar: 'من أين؟' })}</p><h3>${esc(o[LANG] || o.fr || o.en)}</h3><p class="qs">${esc(LF(o, 'sub'))}</p>`, opts: shuffle([a, ...shuffle(GOVS.map(g => g.id).filter(id => !o.g.includes(id)), r).slice(0, 3)], r).map(id => ({ id, label: nm(G[id]) })), ans: a, why: LF(o, 'why') }; }
  if (ty === 'deleg') { const d = pick(DELS, r); return { html: `<p class="qq">${L({ en: 'Which governorate is this delegation in?', fr: 'Dans quel gouvernorat est cette délégation ?', ar: 'في أي ولاية تقع هذه المعتمدية؟' })}</p><h3>${esc(nm(d))}</h3>`, opts: govOpts(d.g).map(id => ({ id, label: nm(G[id]) })), ans: d.g }; }
  if (ty === 'hist') { let [x, y] = shuffle(HIST.map((h, i) => i), r); while (Math.floor(HIST[x].y) === Math.floor(HIST[y].y)) y = (y + 1) % HIST.length; const tl = h => h[LANG] || h.fr; const first = HIST[x].y < HIST[y].y ? x : y; return { html: `<p class="qq">${L({ en: 'Which came first?', fr: 'Lequel est arrivé en premier ?', ar: 'أيهما حدث أوّلاً؟' })}</p>`, opts: [x, y].map(i => ({ id: 'h' + i, label: tl(HIST[i]) })), ans: 'h' + first, why: `${tl(HIST[x])}: ${yearTxt(HIST[x].y)} · ${tl(HIST[y])}: ${yearTxt(HIST[y].y)}` }; }
  if (ty === 'pop') { const [x, y] = shuffle(GOVS, r); const big = x.p24 > y.p24 ? x : y; return { html: `<p class="qq">${L({ en: 'Which has more people (2024)?', fr: 'Lequel est le plus peuplé (2024) ?', ar: 'أيهما أكثر سكاناً (2024)؟' })}</p>`, opts: [x, y].map(g => ({ id: g.id, label: nm(g) })), ans: big.id, why: `${nm(x)}: ${fmt(x.p24)} · ${nm(y)}: ${fmt(y.p24)}` }; }
  const g = pick(GOVS.filter(g => g.nb.length < 6), r); const a = pick(g.nb, r); const wrong = shuffle(GOVS.map(x => x.id).filter(id => id !== g.id && !g.nb.includes(id)), r).slice(0, 3);
  return { html: `<p class="qq">${L({ en: 'Which one borders', fr: 'Lequel est voisin de', ar: 'أيّها يجاور' })}</p><h3>${esc(nm(g))}?</h3>`, opts: shuffle([a, ...wrong], r).map(id => ({ id, label: nm(G[id]) })), ans: a };
}
function askQ(root, q, secs, cb) {
  root.innerHTML = `<div class="qbox">${q.html}<div class="timer"><i style="animation-duration:${secs}s"></i></div><div class="opts">${q.opts.map(o => `<button class="opt" data-id="${o.id}">${esc(o.label)}</button>`).join('')}</div><div class="qfb"></div></div>`;
  let over = false; const to = setTimeout(() => fin(null), secs * 1000);
  function fin(id) {
    if (over) return; over = true; clearTimeout(to); const ok = id === q.ans;
    $$('.opt', root).forEach(b => { b.disabled = true; if (b.dataset.id === q.ans) b.classList.add('good'); else if (b.dataset.id === id) b.classList.add('bad'); });
    $('.timer i', root).style.animationPlayState = 'paused';
    $('.qfb', root).innerHTML = `<b class="${ok ? 'good' : 'bad'}">${id == null ? t('timeUp') : ok ? t('correct') : t('wrong')}</b>${q.why ? ' ' + esc(q.why) : ''}`;
    cb(ok);
  }
  $$('.opt', root).forEach(b => b.onclick = () => fin(b.dataset.id));
}

/* =========================================================
   PARTY — pass and play + challenge links
   ========================================================= */
function party() {
  let names = LS.get('party:names', ['Ahmed', 'Yasmine', 'Karim']);
  const body = shell('party', 'Party', 'لمّة', L({ en: 'Pass the phone. Everyone starts with three lives; the last one standing wins.', fr: 'Faites tourner le téléphone. Trois vies chacun, le dernier en jeu gagne.', ar: 'مرّروا الهاتف. لكل لاعب ثلاث أرواح، وآخر من يبقى يفوز.' }), `
    <div class="pset"><h3>${t('players')}</h3><div class="plist"></div><div class="prow"><button class="btn ghost" id="p-add">+ ${t('addPlayer')}</button><button class="btn primary" id="p-go">${t('start')}</button></div></div>
    <div class="chal"><h3>${t('challenge')}</h3><p>${t('challengeTxt')}</p><button class="btn" id="p-chal">${t('makeChallenge')}</button><div class="chal-out"></div></div>`);
  const pl = $('.plist', body);
  const drawNames = () => { pl.innerHTML = names.map((n, i) => `<div class="pname"><input id="pn-${i}" value="${esc(n)}" maxlength="16" aria-label="${t('players')} ${i + 1}"><button class="btn ghost sm" data-rm="${i}" aria-label="Remove">✕</button></div>`).join(''); $$('[data-rm]', pl).forEach(b => b.onclick = () => { if (names.length > 2) { names.splice(+b.dataset.rm, 1); drawNames(); } }); $$('input', pl).forEach((inp, i) => inp.oninput = () => { names[i] = inp.value; }); };
  drawNames();
  $('#p-add').onclick = () => { if (names.length < 8) { names.push(`${L({ en: 'Player', fr: 'Joueur', ar: 'لاعب' })} ${names.length + 1}`); drawNames(); } };
  $('#p-chal').onclick = () => { const code = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join(''); const url = link('defi-' + code); $('.chal-out').innerHTML = `<p class="code">${code}</p><input class="copybox" id="chal-url" readonly value="${esc(url)}"><div class="actions"><button class="btn primary" id="chal-copy">${t('copyLink')}</button><a class="btn" href="#defi-${code}">${t('play')}</a></div>`; $('#chal-copy').onclick = e => copy(L({ en: `Tunisia quiz challenge ${code}: 10 questions, beat my score!`, fr: `Défi quiz Tunisie ${code} : 10 questions, bats mon score !`, ar: `تحدّي تونس ${code}: عشرة أسئلة، تغلّب على نتيجتي!` }) + '\n' + url, e.target); };
  $('#p-go').onclick = () => { names = names.map(n => n.trim()).filter(Boolean); if (names.length < 2) return toast(L({ en: 'Add at least two players', fr: 'Ajoute au moins deux joueurs', ar: 'أضف لاعبين على الأقل' }), 'bad'); LS.set('party:names', names); runParty(body, names); };
}
function runParty(body, names) {
  const P = names.map(n => ({ n, l: 3 })); let turn = 0, round = 1;
  const alive = () => P.filter(p => p.l > 0);
  const board = () => `<div class="board">${P.map((p, i) => `<span class="pl ${p.l <= 0 ? 'out' : ''} ${i === turn ? 'cur' : ''}">${esc(p.n)} ${hearts(p.l, 3)}</span>`).join('')}</div>`;
  function pass() {
    if (alive().length <= 1) return win();
    while (P[turn].l <= 0) turn = (turn + 1) % P.length;
    body.innerHTML = `${board()}<div class="pass"><p>${t('passTo')}</p><h2>${esc(P[turn].n)}</h2><button class="btn primary big" id="pp-ready">${t('ready')}</button></div>`;
    $('#pp-ready').onclick = ask;
  }
  function ask() {
    body.innerHTML = `${board()}<div class="qwrap"></div>`;
    askQ($('.qwrap', body), makeQ(Math.random), 15, ok => {
      if (!ok) P[turn].l--;
      $('.qwrap', body).insertAdjacentHTML('beforeend', `<div class="actions"><button class="btn primary" id="pp-next">${t('next')}</button></div>`);
      $('.board', body).outerHTML = board();
      $('#pp-next').onclick = () => { turn = (turn + 1) % P.length; pass(); };
    });
  }
  function win() {
    const w = alive()[0];
    body.innerHTML = `${board()}<div class="result win"><p class="rt">🏆</p><h2>${esc(w ? w.n : '—')} ${t('wins')}</h2></div><div class="actions"><button class="btn primary" id="pp-again">${t('again')}</button><a class="btn" href="#">${t('back')}</a></div>`;
    $('#pp-again').onclick = () => runParty(body, names);
  }
  pass();
}
function defi(code) {
  code = String(code || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'TUNS';
  const r = rng('defi:' + code); const Q = Array.from({ length: 10 }, () => makeQ(r));
  const k = 'defi:' + code; const prev = LS.get(k, null);
  const body = shell('party', `${L({ en: 'Challenge', fr: 'Défi', ar: 'تحدٍّ' })} ${code}`, 'تحدّي', t('challengeTxt'), `<div class="tstat"></div><div class="qwrap"></div><div class="after"></div>`);
  const stat = $('.tstat', body), qw = $('.qwrap', body), after = $('.after', body);
  let i = 0, score = 0, res = [], t0 = Date.now();
  const finish = () => { const secs = Math.round((Date.now() - t0) / 1000); LS.set(k, { score, secs }); qw.innerHTML = ''; const sh = shareBtn(() => `🇹🇳 ${L({ en: 'Challenge', fr: 'Défi', ar: 'تحدّي' })} ${code}: ${score}/10 · ${secs}s\n${res.map(x => x ? '🟩' : '🟥').join('')}\n${link('defi-' + code)}`); after.innerHTML = `<div class="result win"><p class="rt">${t('score')}</p><h2>${score} / 10</h2><p>${secs} s</p></div><div class="actions">${sh.html}<button class="btn" id="df-again">${t('again')}</button></div>`; sh.bind(after); $('#df-again').onclick = () => defi(code); };
  const next = () => { stat.innerHTML = `<span>${i + 1}/10</span><span>${t('score')} <b>${score}</b></span>${prev ? `<span>${t('best')} ${prev.score}/10</span>` : ''}`; if (i >= 10) return finish(); askQ(qw, Q[i], 15, ok => { if (ok) score++; res.push(ok); qw.insertAdjacentHTML('beforeend', `<div class="actions"><button class="btn primary" id="df-next">${t('next')}</button></div>`); $('#df-next').onclick = () => { i++; next(); }; }); };
  if (prev) { body.insertAdjacentHTML('afterbegin', ''); }
  next();
}

/* =========================================================
   ROUTER
   ========================================================= */
function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  const [g, a] = [h.split('-')[0], h.split('-').slice(1).join('-')];
  window.scrollTo(0, 0);
  switch (g) {
    case 'wilayadle': return wilayadle(+a || TODAY);
    case 'chkoun': return chkoun(+a || TODAY);
    case 'persondle': return persondle(+a || TODAY);
    case 'ghouss': return ghouss(+a || TODAY);
    case 'tarikh': return tarikh(a || TODAY);
    case 'mnin': return mnin(a);
    case 'blitz': return blitz(a);
    case 'akthar': return akthar(a);
    case 'party': return party();
    case 'defi': return defi(a);
    default: return home();
  }
}
applyLang();
window.addEventListener('hashchange', route);
route();
})();
