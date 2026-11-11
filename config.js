/**
 * config.js — Configuración de entorno del frontend
 *
 * Local:      http://localhost:8000 (API ejecutada con uvicorn)
 * Producción: servicio desplegado en Render
 */
(function () {
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  window.GJ_CONFIG = {
    apiBase: isLocal
      ? 'http://localhost:8000'
      : 'https://guajiragua.onrender.com',
  };
})();
