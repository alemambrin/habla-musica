/* Lo que usa la app de los alumnos: unirse a un grupo, enviar avance, salir. */
const { rcmd, GROUP_RE, ID_RE, cleanName, int, send, body, ip, limited } = require('./_lib');
const MAX_MEMBERS = 200;

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      /* ¿existe este grupo? */
      const g = String(req.query.g || '').toUpperCase();
      if (!GROUP_RE.test(g)) return send(res, 400, { ok: false });
      if (await limited('hm:lj:' + ip(req), 40, 600)) return send(res, 429, { ok: false });
      const ex = await rcmd(['HEXISTS', 'hm:groups', g]);
      return ex ? send(res, 200, { ok: true }) : send(res, 404, { ok: false });
    }
    if (req.method !== 'POST') return send(res, 405, { ok: false });
    const b = body(req);
    if (!b || JSON.stringify(b).length > 6000) return send(res, 400, { ok: false });
    const g = String(b.g || '').toUpperCase(), id = String(b.id || '');
    if (!GROUP_RE.test(g) || !ID_RE.test(id)) return send(res, 400, { ok: false });
    if (await limited('hm:ls:' + id, 40, 60)) return send(res, 429, { ok: false });

    if (b.op === 'leave') {
      await rcmd(['HDEL', 'hm:g:' + g, id]);
      return send(res, 200, { ok: true });
    }

    const ex = await rcmd(['HEXISTS', 'hm:groups', g]);
    if (!ex) return send(res, 404, { ok: false, gone: true });
    const known = await rcmd(['HEXISTS', 'hm:g:' + g, id]);
    if (!known && (await rcmd(['HLEN', 'hm:g:' + g])) >= MAX_MEMBERS) return send(res, 409, { ok: false, full: true });

    const d = {};
    if (b.d && typeof b.d === 'object' && !Array.isArray(b.d)) {
      let n = 0;
      for (const k of Object.keys(b.d)) {
        if (n >= 150) break;
        if (!/^[0-9]{1,2}\.[0-9]{1,2}$/.test(k)) continue;
        d[k] = int(b.d[k], 0, 3, 0); n++;
      }
    }
    const c = Array.isArray(b.c) ? b.c : [];
    const rec = {
      n: cleanName(b.n) || 'Sin nombre',
      d,
      s: int(b.s, 0, 999, 0),
      w: int(b.w, 0, 7, 0),
      nx: String(b.nx == null ? '' : b.nx).replace(/[\u0000-\u001f<>&"'`]/g, '').slice(0, 40),
      tr: b.tr === 'T' ? 'T' : 'R',
      c: [int(c[0], 0, 999, 0), int(c[1], 0, 999, 0), int(c[2], 0, 999, 0), int(c[3], 0, 999, 0)],
      ts: Date.now()
    };
    await rcmd(['HSET', 'hm:g:' + g, id, JSON.stringify(rec)]);
    return send(res, 200, { ok: true });
  } catch (e) {
    return send(res, 500, { ok: false });
  }
};
