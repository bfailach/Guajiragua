/**
 * api-client.js — Puente entre el frontend React y el FastAPI backend
 * Guajiragua · Sistema BI Hidrogeológico
 *
 * Flujo:
 *  1. La app se muestra de inmediato con real-data.js
 *  2. Intenta GET /api/health (timeout 35 s) y descarga /api/puntos paginado
 *  3. Si OK → reemplaza window.GJ_REAL_POINTS con datos live de Supabase
 *  4. Si falla → usa real-data.js estático como fallback
 *  5. Resuelve window.GJ_API_READY para que main.jsx reconstruya los datos
 */

(function () {
  // Lee la URL del API desde config.js (auto-detecta local vs. producción)
  const API_BASE = (window.GJ_CONFIG && window.GJ_CONFIG.apiBase) || 'http://localhost:8000';
  window.GJ_API_BASE = API_BASE;
  window.GJ_API_LIVE = false;

  // Mensajes de progreso (solo consola: la app no muestra pantalla de carga)
  function setMsg(msg) {
    console.info('[Guajiragua]', msg);
  }

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
