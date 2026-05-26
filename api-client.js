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

  /* ── Pantalla de carga ─────────────────────────────────────────────── */
  const loader = document.createElement('div');
  loader.id = 'gj-loader';
  loader.innerHTML = `
    <div style="
      position:fixed;inset:0;z-index:9999;
      background:#0f0f0f;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:'JetBrains Mono',monospace;color:#888;gap:20px;
    ">
      <div style="font-size:13px;letter-spacing:0.2em;color:#ccc;">GUAJIRAGUA</div>
      <div id="gj-loader-msg" style="font-size:11px;letter-spacing:0.12em;">
        CONECTANDO AL DWH · SUPABASE
      </div>
      <div style="display:flex;gap:6px;margin-top:4px;">
        ${[0,1,2].map(i =>
          `<div style="width:6px;height:6px;border-radius:50%;background:#2c5fa6;
            animation:gjpulse 1.2s ease-in-out ${i*0.2}s infinite alternate;"></div>`
        ).join('')}
      </div>
      <style>
        @keyframes gjpulse {
          from { opacity: 0.2; transform: scale(0.8); }
          to   { opacity: 1;   transform: scale(1.1); }
        }
      </style>
    </div>`;
  document.body.appendChild(loader);

  function setMsg(msg) {
    const el = document.getElementById('gj-loader-msg');
    if (el) el.textContent = msg;
  }

  function removeLoader() {
    const el = document.getElementById('gj-loader');
    if (el) el.remove();
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
      const res = await fetch(API_BASE + path, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
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

  /* ── Cargar puntos desde API ────────────────────────────────────────── */
  window.GJ_API_READY = (async () => {
    try {
      // 1. Health check rápido
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
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

      removeLoader();
      return true;

    } catch (err) {
      console.warn('[Guajiragua] API no disponible → usando datos estáticos.', err.message);
      window.GJ_API_LIVE = false;
      removeLoader();
      return false;
    }
  })();

})();
