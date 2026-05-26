/**
 * config.js — Configuración de entorno para Guajiragua
 *
 * En LOCAL:      usa http://localhost:8000  (FastAPI local)
 * En PRODUCCIÓN: usa la URL de Render       (FastAPI en la nube)
 *
 * ⚠ Después de crear el servicio en Render, reemplaza la URL de abajo.
 */
(function () {
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  window.GJ_CONFIG = {
    // ← Reemplaza esta URL con la que te dé Render al crear el servicio
    apiBase: isLocal
      ? 'http://localhost:8000'
      : 'https://guajiragua.onrender.com',
  };
})();
