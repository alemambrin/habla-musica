/* Panel docente: requiere la clave del docente (variable TEACHER_KEY) en el encabezado x-key. */
const { rcmd, GROUP_RE, ID_RE, send, body, ip, limited, teacherOk } = require('./_lib');
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const crypto = require('crypto');

module.exports = async (req, res) => {
  try {
    if (await limited('hm:tk:' + ip(req), 60, 600)) return send(res, 429, { ok: false });
    if (!teacherOk(req)) {
      await new Promise(r => setTimeout(r, 700));
      if (await limited('hm:tf:' + ip(req), 12, 900)) return send(res, 429, { ok: false });
      return send(res, 401, { ok: false, cfg: (process.env.TEACHER_KEY || '').length >= 12 });
    }
    if (req.method === 'GET') {
      const g = String(req.query.g || '').toUpperCase();
      if (!g) {
        const raw = (await rcmd(['HGETALL', 'hm:groups'])) || [];
        const out = [];
        for (let i = 0; i < raw.length; i += 2) {
          const n = await rcmd(['HLEN', 'hm:g:' + raw[i]]);
          let meta = {}; try { meta = JSON.parse(raw[i + 1]) } catch (e) {}
          out.push({ g: raw[i], n, created: meta.t || 0, label: meta.l || '' });
        }
        return send(res, 200, { ok: true, groups: out });
      }
      if (!GROUP_RE.test(g)) return send(res, 400, { ok: false });
      const raw = (await rcmd(['HGETALL', 'hm:g:' + g])) || [];
      const members = [];
      for (let i = 0; i < raw.length; i += 2) {
        try { const r = JSON.parse(raw[i + 1]); r.id = raw[i]; members.push(r); } catch (e) {}
      }
      return send(res, 200, { ok: true, g, now: Date.now(), members });
    }
    if (req.method !== 'POST') return send(res, 405, { ok: false });
    const b = body(req);
    if (!b) return send(res, 400, { ok: false });
    const g = String(b.g || '').toUpperCase();
    if (b.op === 'create') {
      let code = g;
      if (!code) { const by = crypto.randomBytes(6); code = Array.from(by, x => CODE_CHARS[x % CODE_CHARS.length]).join(''); }
      if (!GROUP_RE.test(code)) return send(res, 400, { ok: false, msg: 'El código lleva de 4 a 12 letras o números.' });
      if (await rcmd(['HEXISTS', 'hm:groups', code])) return send(res, 409, { ok: false, msg: 'Ese código ya existe.' });
      const label = String(b.label || '').replace(/[\u0000-\u001f<>&"'`]/g, '').slice(0, 40);
      await rcmd(['HSET', 'hm:groups', code, JSON.stringify({ t: Date.now(), l: label })]);
      return send(res, 200, { ok: true, g: code });
    }
    if (!GROUP_RE.test(g)) return send(res, 400, { ok: false });
    if (b.op === 'remove') {
      if (!ID_RE.test(String(b.id || ''))) return send(res, 400, { ok: false });
      await rcmd(['HDEL', 'hm:g:' + g, b.id]);
      return send(res, 200, { ok: true });
    }
    if (b.op === 'delgroup') {
      await rcmd(['DEL', 'hm:g:' + g]);
      await rcmd(['HDEL', 'hm:groups', g]);
      return send(res, 200, { ok: true });
    }
    return send(res, 400, { ok: false });
  } catch (e) {
    return send(res, 500, { ok: false });
  }
};
