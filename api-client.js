/**
 * api-client.js — Puente entre el frontend React y el FastAPI backend
 * Guajiragua · Sistema BI Hidrogeológico
 *
 * Flujo:
 *  1. Muestra pantalla de carga
 *  2. Intenta GET /api/puntos?limit=2000 (timeout 5s)
 *  3. Si OK → reemplaza window.GJ_REAL_POINTS con datos live de Supabase
 *  4. Si falla → usa real-data.js estático como fallback
 *  5. Resuelve window.GJ_API_READY para que main.jsx monte la app
 */

(function () {
  // Lee la URL del API desde config.js (auto-detecta local vs. producción)
  const API_BASE = (window.GJ_CONFIG && window.GJ_CONFIG.apiBase) || 'http://localhost:8000';
  window.GJ_API_BASE = API_BASE;
  window.GJ_API_LIVE = false;

  /* ── Esqueleto de carga ─────────────────────────────────────────────
     Silueta de la app (barra superior, encabezado y tarjetas) mientras
     llegan los datos. Usa los mismos colores y medidas que styles.css. */
  const loader = document.createElement('div');
  loader.id = 'gj-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');
  loader.setAttribute('aria-label', 'Cargando Guajiragua');
  const bar = (w, h, extra) => `<div class="gjs-b" style="width:${w};height:${h}px;${extra || ''}"></div>`;
  const card = (inner, extra) => `<div class="gjs-card" style="${extra || ''}">${inner}</div>`;
  loader.innerHTML = `
    <style>
      #gj-loader { position: fixed; inset: 0; z-index: 9999; background: #f6f6f6; overflow: hidden;
                   font-family: -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif; }
      #gj-loader .gjs-app { max-width: 1600px; margin: 0 auto; padding: 0 56px; }
      #gj-loader .gjs-nav { display: grid; grid-template-columns: 1fr 1fr auto 1fr 1fr; align-items: center;
                            height: 84px; border-bottom: 1px solid #e2e2e2; margin: 0 -56px 32px; padding: 0 56px; gap: 16px; }
      #gj-loader .gjs-nav .gjs-b { margin: 0 auto; }
      #gj-loader .gjs-brand { font-weight: 600; letter-spacing: 0.18em; font-size: 14px; color: #0f0f0f; padding: 0 24px; }
      #gj-loader .gjs-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; margin: 8px 0 28px; }
      #gj-loader .gjs-grid { display: grid; gap: 16px; margin-bottom: 16px; }
      #gj-loader .gjs-g1 { grid-template-columns: 1.6fr 1fr; }
      #gj-loader .gjs-g3 { grid-template-columns: repeat(3, 1fr); }
      #gj-loader .gjs-card { background: #fff; border: 1px solid #e2e2e2; border-radius: 4px; padding: 20px;
                             display: flex; flex-direction: column; gap: 14px; }
      #gj-loader .gjs-b { border-radius: 3px; background: #ececec; max-width: 100%;
                          background-image: linear-gradient(90deg, #ececec 0px, #f7f7f7 120px, #ececec 240px);
                          background-size: 900px 100%; animation: gjs-shimmer 1.4s linear infinite; }
      #gj-loader .gjs-msg { font-family: ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace; font-size: 10px;
                            letter-spacing: 0.14em; color: #6b6b6b; text-transform: uppercase; text-align: right; }
      @keyframes gjs-shimmer { from { background-position: -300px 0; } to { background-position: 600px 0; } }
      @media (prefers-reduced-motion: reduce) { #gj-loader .gjs-b { animation: none; } }
      @media (max-width: 1200px) {
        #gj-loader .gjs-app { padding: 0 32px; }
        #gj-loader .gjs-nav { margin: 0 -32px 24px; padding: 0 32px; }
      }
      @media (max-width: 780px) {
        #gj-loader .gjs-app { padding: 0 16px; }
        #gj-loader .gjs-nav { grid-template-columns: 1fr; height: auto; padding: 14px 16px; margin: 0 -16px 16px; gap: 12px; }
        #gj-loader .gjs-nav .gjs-b { margin: 0; }
        #gj-loader .gjs-nav .gjs-hide-m { display: none; }
        #gj-loader .gjs-brand { order: -1; padding: 0; }
        #gj-loader .gjs-head { flex-direction: column; align-items: flex-start; gap: 12px; }
        #gj-loader .gjs-msg { text-align: left; }
        #gj-loader .gjs-g1, #gj-loader .gjs-g3 { grid-template-columns: 1fr; }
      }
    </style>
    <div class="gjs-app" aria-hidden="true">
      <div class="gjs-nav">
        ${bar('150px', 10)}${bar('130px', 10)}
        <div class="gjs-brand">GUAJIRAGUA</div>
        ${bar('56px', 10)}${bar('110px', 10)}
      </div>
      <div class="gjs-head">
        <div style="display:flex;flex-direction:column;gap:12px;flex:1;min-width:0">
          ${bar('260px', 9)}${bar('420px', 26)}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
          ${bar('170px', 9)}${bar('140px', 9)}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin:-12px 0 24px;max-width:760px">
        ${bar('100%', 12)}${bar('70%', 12)}
      </div>
      <div class="gjs-grid gjs-g1">
        ${card(bar('180px', 11) + '<div style="display:flex;gap:8px;flex-wrap:wrap">' + [64,74,58,80,70,90,66,76,84,120,60].map(w => bar(w + 'px', 26, 'border-radius:999px')).join('') + '</div>' + bar('90%', 20) + bar('40%', 9) + bar('100%', 14) + bar('100%', 12) + bar('100%', 12) + bar('100%', 12))}
        ${card(bar('160px', 11) + bar('100%', 12) + bar('85%', 12) + bar('150px', 40))}
      </div>
      <div class="gjs-grid gjs-g3">
        ${[0,1,2].map(() => card(bar('60%', 14) + bar('100%', 11) + bar('100%', 11) + bar('100%', 11) + bar('100%', 11))).join('')}
      </div>
    </div>
    <div class="gjs-msg" style="position:fixed;right:16px;bottom:16px;background:#f6f6f6;padding:6px 8px;border-radius:3px">
      <span id="gj-loader-msg">CONECTANDO AL DWH · SUPABASE</span>
    </div>`;
  document.body.appendChild(loader);

  function setMsg(msg) {
    const el = document.getElementById('gj-loader-msg');
    if (el) el.textContent = msg;
  }

  // El esqueleto se retira cuando la app ya está dibujada (main.jsx llama
  // a GJ_HIDE_LOADER), para que no quede un instante en blanco entre ambos.
  window.GJ_HIDE_LOADER = function () {
    const el = document.getElementById('gj-loader');
    if (!el) return;
    el.style.transition = 'opacity .25s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 260);
  };

  /* ── Helpers de API (expuestos globalmente para otros módulos) ──────── */
  window.GJ_API = {
    base: API_BASE,

    async get(path) {
      const res = await fetch(API_BASE + path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },

    async post(path, body) {
      const headers = { 'Content-Type': 'application/json' };
      const token = window.GJ_AUTH && window.GJ_AUTH.token();
      if (token) headers['Authorization'] = 'Bearer ' + token;
      const res = await fetch(API_BASE + path, {
        method:  'POST',
        headers,
        body:    JSON.stringify(body),
      });
      if (res.status === 401 && window.GJ_AUTH) window.GJ_AUTH.logout();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },

    async kpis(temporada) {
      const q = temporada ? `?temporada=${temporada}` : '';
      return this.get('/api/kpis' + q);
    },

    async municipios(temporada) {
      const q = temporada ? `?temporada=${temporada}` : '';
      return this.get('/api/municipios' + q);
    },

    async series(variable, zona) {
      let q = zona ? `?zona=${zona}` : '';
      return this.get(`/api/series/${variable}` + q);
    },

    async alertas(limit = 50) {
      return this.get(`/api/alertas?limit=${limit}`);
    },
  };

  /* ── Sesión administrativa ──────────────────────────────────────────── */
  // El token se guarda en sessionStorage: se borra al cerrar la pestaña.
  const AUTH_KEY = 'gj_admin_session';
  const listeners = new Set();

  function readSession() {
    try {
      const s = JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'null');
      if (s && s.token && s.expira * 1000 > Date.now()) return s;
      sessionStorage.removeItem(AUTH_KEY);
    } catch (e) { /* sessionStorage no disponible */ }
    return null;
  }

  function notify() { listeners.forEach(fn => { try { fn(readSession()); } catch (e) {} }); }

  window.GJ_AUTH = {
    session() { return readSession(); },
    token()   { const s = readSession(); return s ? s.token : null; },

    async login(usuario, contrasena) {
      let res;
      try {
        res = await fetch(API_BASE + '/api/auth/login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ usuario, contrasena }),
        });
      } catch (e) {
        throw new Error('No se pudo conectar con el servidor.');
      }
      let data = {};
      try { data = await res.json(); } catch (e) {}
      if (!res.ok) {
        const msg = typeof data.detail === 'string' ? data.detail : 'No se pudo iniciar sesión.';
        throw new Error(msg);
      }
      const s = { token: data.token, usuario: data.usuario, expira: data.expira };
      try { sessionStorage.setItem(AUTH_KEY, JSON.stringify(s)); } catch (e) {}
      notify();
      return s;
    },

    // Confirma con el servidor que el token sigue siendo válido
    async verify() {
      const token = this.token();
      if (!token) return null;
      try {
        const res = await fetch(API_BASE + '/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + token },
        });
        if (res.status === 401 || res.status === 503) { this.logout(); return null; }
        if (!res.ok) return readSession();   // error transitorio: se conserva la sesión local
        return readSession();
      } catch (e) {
        return readSession();
      }
    },

    logout() {
      try { sessionStorage.removeItem(AUTH_KEY); } catch (e) {}
      notify();
    },

    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };

  /* ── Cargar puntos desde API ────────────────────────────────────────── */
  window.GJ_API_READY = (async () => {
    try {
      // 1. Health check rápido
      const ctrl = new AbortController();
      // 35s para dar tiempo al cold start de Render (free tier duerme tras 15 min)
      const timer = setTimeout(() => ctrl.abort(), 35000);
      const health = await fetch(`${API_BASE}/api/health`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!health.ok) throw new Error('API no responde');

      const hData = await health.json();
      if (!hData.mediciones_en_db) throw new Error('DWH vacío');

      // 2. Descargar todos los puntos (paginado, Supabase cap = 1000/req)
      const total = hData.mediciones_en_db;
      setMsg(`CARGANDO ${total.toLocaleString('es-CO')} MEDICIONES DESDE SUPABASE`);

      let allPoints = [];
      const chunkSize = 1000;
      let offset = 0;
      while (true) {
        const res = await fetch(`${API_BASE}/api/puntos?limit=${chunkSize}&offset=${offset}`);
        if (!res.ok) throw new Error('Error al cargar puntos');
        const json = await res.json();
        const chunk = json.data || [];
        allPoints = allPoints.concat(chunk);
        if (chunk.length < chunkSize) break;   // última página
        offset += chunkSize;
        setMsg(`CARGANDO ${allPoints.length.toLocaleString('es-CO')} / ${total.toLocaleString('es-CO')} MEDICIONES…`);
      }

      // 3. Reemplazar datos estáticos
      window.GJ_REAL_POINTS = allPoints;
      window.GJ_API_LIVE    = true;

      console.log(
        `%c[Guajiragua] ${allPoints.length} puntos cargados desde Supabase`,
        'color:#2e8b57;font-weight:bold'
      );

      return true;

    } catch (err) {
      console.warn('[Guajiragua] API no disponible → usando datos estáticos.', err.message);
      window.GJ_API_LIVE = false;
      return false;
    }
  })();

})();
