/* Lou3ab Tounes online Party rooms — Vercel serverless function (no dependencies), Upstash Redis.
   GET  /api/party?code=ABCD                         -> room state
   POST /api/party { op:'create', pid, name, rounds, per }      -> { code }
   POST /api/party { op:'join',   code, pid, name }
   POST /api/party { op:'next',   code, pid }        host: start / next round / new game
   POST /api/party { op:'ans',    code, pid, g, r, n, pts, c }  progress: n answered, pts, c correct
   The first player to answer every question of a round ends that round for everybody. */
const envEnd = suffix => process.env[suffix] || Object.entries(process.env).find(([k, v]) => k.endsWith('_' + suffix) && v)?.[1];
const URL_ = envEnd('KV_REST_API_URL') || envEnd('UPSTASH_REDIS_REST_URL');
const TOKEN = envEnd('KV_REST_API_TOKEN') || envEnd('UPSTASH_REDIS_REST_TOKEN');
const TTL = 60 * 60 * 12;
async function redis(cmds) {
  const r = await fetch(URL_ + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).map(x => x.result);
}
const obj = a => { const o = {}; for (let i = 0; i < (a || []).length; i += 2) o[a[i]] = a[i + 1]; return o; };
const K = c => `l3b:room:${c}`;
const clean = (s, n) => String(s || '').replace(/[<>"&]/g, '').trim().slice(0, n);

async function state(code) {
  const [m, pl] = await redis([['HGETALL', K(code)], ['HGETALL', K(code) + ':pl']]);
  const meta = obj(m); if (!meta.rounds) return null;
  const g = +meta.game || 1, cur = +meta.round || 0, cmds = [];
  for (let r = 1; r <= cur; r++) cmds.push(['HGETALL', `${K(code)}:g${g}:r${r}`]);
  const sc = cmds.length ? await redis(cmds) : [];
  const scores = {};
  sc.forEach((a, i) => { const o = obj(a); scores[i + 1] = Object.fromEntries(Object.entries(o).filter(([k]) => k !== '_').map(([pid, v]) => { const [pts, n, c] = String(v).split('|').map(Number); return [pid, { pts, n, c }]; })); });
  return { code, rounds: +meta.rounds, per: +meta.per, host: meta.host, game: g, round: cur, state: meta.state, start: +meta.start || 0, over: meta.over || null, players: obj(pl), scores, now: Date.now() };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'storage not configured' });
  try {
    const q = req.method === 'GET' ? req.query : (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}));
    const code = String(q.code || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
    const pid = String(q.pid || '').replace(/[^a-z0-9]/gi, '').slice(0, 40);
    if (req.method === 'GET') { const s = code && await state(code); return s ? res.json(s) : res.status(404).json({ error: 'no room' }); }
    if (!pid) return res.status(400).json({ error: 'pid' });
    if (q.op === 'create') {
      const rounds = Math.min(10, Math.max(1, +q.rounds || 3)), per = Math.min(30, Math.max(3, +q.per || 10));
      let c = '';
      for (let k = 0; k < 8; k++) {
        c = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('');
        const [ok] = await redis([['HSETNX', K(c), 'host', pid]]); if (ok === 1) break; c = '';
      }
      if (!c) return res.status(500).json({ error: 'busy' });
      await redis([['HSET', K(c), 'rounds', rounds, 'per', per, 'game', 1, 'round', 0, 'state', 'lobby'], ['HSET', K(c) + ':pl', pid, clean(q.name, 16) || 'Host'], ['EXPIRE', K(c), TTL], ['EXPIRE', K(c) + ':pl', TTL]]);
      return res.json(await state(c));
    }
    const s = code && await state(code); if (!s) return res.status(404).json({ error: 'no room' });
    if (q.op === 'join') {
      await redis([['HSET', K(code) + ':pl', pid, clean(q.name, 16) || 'Player'], ['EXPIRE', K(code) + ':pl', TTL]]);
      return res.json(await state(code));
    }
    if (q.op === 'next') {
      if (pid !== s.host) return res.status(403).json({ error: 'host only' });
      if (s.state === 'play') return res.json(s);
      let game = s.game, round = s.round + 1;
      if (s.round >= s.rounds) { game++; round = 1; }
      const key = `${K(code)}:g${game}:r${round}`;
      await redis([['HDEL', K(code), 'over'], ['HSET', K(code), 'game', game, 'round', round, 'state', 'play', 'start', Date.now()], ['HSET', key, '_', '0|0|0'], ['EXPIRE', key, TTL], ['EXPIRE', K(code), TTL]]);
      return res.json(await state(code));
    }
    if (q.op === 'ans') {
      if (s.state !== 'play' || +q.g !== s.game || +q.r !== s.round || !s.players[pid]) return res.json(s);
      const n = Math.min(s.per, Math.max(0, +q.n | 0)), c = Math.min(n, Math.max(0, +q.c | 0)), pts = Math.min(n * 150, Math.max(0, +q.pts | 0));
      await redis([['HSET', `${K(code)}:g${s.game}:r${s.round}`, pid, `${pts}|${n}|${c}`]]);
      if (n >= s.per) {
        const [first] = await redis([['HSETNX', K(code), 'over', pid]]);
        if (first === 1) await redis([['HSET', K(code), 'state', 'over']]);
      }
      return res.json(await state(code));
    }
    return res.status(400).json({ error: 'bad op' });
  } catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
};
