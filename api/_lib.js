/* Utilidades del servidor de grupos. Almacenamiento: Redis por REST (Upstash / Vercel KV). */
const crypto = require('crypto');
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

async function rcmd(args) {
  if (!URL_ || !TOKEN) throw new Error('storage-not-configured');
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  const j = await r.json();
  if (j.error) throw new Error('redis: ' + j.error);
  return j.result;
}

const GROUP_RE = /^[A-Z0-9]{4,12}$/;
const ID_RE = /^[a-f0-9]{16,32}$/;
const cleanName = s => String(s == null ? '' : s).replace(/[\u0000-\u001f<>&"'`]/g, '').trim().slice(0, 24);
const int = (v, lo, hi, d) => { v = Math.round(+v); return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

function body(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  return b && typeof b === 'object' && !Array.isArray(b) ? b : null;
}

function ip(req) { return String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x'; }

/* Límite simple por clave: devuelve true si se pasó del máximo en la ventana */
async function limited(key, max, secs) {
  const n = await rcmd(['INCR', key]);
  if (n === 1) await rcmd(['EXPIRE', key, String(secs)]);
  return n > max;
}

function teacherOk(req) {
  const key = process.env.TEACHER_KEY || '';
  const got = String(req.headers['x-key'] || '');
  if (key.length < 12) return false;
  const a = crypto.createHash('sha256').update(got).digest();
  const b = crypto.createHash('sha256').update(key).digest();
  return crypto.timingSafeEqual(a, b);
}

module.exports = { rcmd, GROUP_RE, ID_RE, cleanName, int, send, body, ip, limited, teacherOk };
