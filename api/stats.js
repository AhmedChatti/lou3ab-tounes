/* Lou3ab Tounes shared statistics — Vercel serverless function (no dependencies).
   Storage: Upstash Redis (Vercel Marketplace). Reads KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN.
   GET  /api/stats?game=wilayadle&day=12            -> { n, hist: { value: count } }
   POST /api/stats { game, day, v, pid }              -> records one result per player (pid) per game/day */
const GAMES = {
  wilayadle: { max: 200 }, persondle: { max: 200 }, chkoun: { max: 6 },
  ghouss: { max: 800, bucket: 10 }, tarikh: { max: 60 },
  blitz: { max: 24 }, 'blitz-del': { max: 200 },
  'akthar-pop': { max: 300 }, 'akthar-area': { max: 300 }, 'akthar-grow': { max: 300 }, 'akthar-theme': { max: 300 }
};
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const TTL = 60 * 60 * 24 * 400;

async function redis(cmds) {
  const r = await fetch(URL_ + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).map(x => x.result);
}
const keyOf = (game, day) => `l3b:${game}:${day}`;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'stats storage not configured' });
  try {
    const q = req.method === 'GET' ? req.query : (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}));
    const game = String(q.game || ''), day = String(q.day || '');
    if (!GAMES[game] || !/^(all|\d{1,5})$/.test(day)) return res.status(400).json({ error: 'bad game/day' });
    const k = keyOf(game, day);
    if (req.method === 'POST') {
      const pid = String(q.pid || '').replace(/[^a-z0-9]/gi, '').slice(0, 32);
      let v = Math.round(Number(q.v)); const g = GAMES[game];
      if (!pid || !Number.isFinite(v) || v < 0 || v > g.max) return res.status(400).json({ error: 'bad value' });
      if (g.bucket) v = Math.floor(v / g.bucket) * g.bucket;
      const [added] = await redis([['SADD', k + ':p', pid]]);
      if (added === 1) await redis([['HINCRBY', k + ':h', String(v), 1], ['INCR', k + ':n'], ['EXPIRE', k + ':p', TTL], ['EXPIRE', k + ':h', TTL], ['EXPIRE', k + ':n', TTL]]);
    }
    const [n, flat] = await redis([['GET', k + ':n'], ['HGETALL', k + ':h']]);
    const hist = {}; for (let i = 0; i < (flat || []).length; i += 2) hist[flat[i]] = Number(flat[i + 1]);
    return res.status(200).json({ n: Number(n || 0), hist });
  } catch (e) {
    return res.status(500).json({ error: 'stats unavailable' });
  }
};
