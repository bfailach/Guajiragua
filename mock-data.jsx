// Datos reales — Modelo Hidrogeológico de La Guajira
// Fuente: Mapa_PH_Guajira.csv (SGC / Corpoguajira)
// Procesado: coordenadas Magna-Sirgas EPSG:3116 → WGS84, asignación de municipio por proximidad

const MUNICIPIOS = [
  { id: 'URI', name: 'Uribia',             zona: 'Alta',  lat: 11.71, lon: -72.27 },
  { id: 'MAN', name: 'Manaure',            zona: 'Alta',  lat: 11.78, lon: -72.45 },
  { id: 'MAI', name: 'Maicao',             zona: 'Alta',  lat: 11.39, lon: -72.24 },
  { id: 'RIO', name: 'Riohacha',           zona: 'Media', lat: 11.54, lon: -72.91 },
  { id: 'ALB', name: 'Albania',            zona: 'Media', lat: 11.16, lon: -72.59 },
  { id: 'DIB', name: 'Dibulla',            zona: 'Media', lat: 11.27, lon: -73.30 },
  { id: 'HAT', name: 'Hatonuevo',          zona: 'Media', lat: 11.07, lon: -72.76 },
  { id: 'BAR', name: 'Barrancas',          zona: 'Media', lat: 10.96, lon: -72.79 },
  { id: 'SJC', name: 'San Juan del Cesar', zona: 'Baja',  lat: 10.77, lon: -73.00 },
  { id: 'FON', name: 'Fonseca',            zona: 'Baja',  lat: 10.89, lon: -72.85 },
  { id: 'DIS', name: 'Distracción',        zona: 'Baja',  lat: 10.90, lon: -72.90 },
];

const TIPOS   = ['Pozo', 'Aljibe', 'Manantial'];
const METODOS = ['Sonda multiparámetro', 'Conductivímetro', 'pHmetro portátil', 'Refractómetro'];
const USOS    = ['Doméstico', 'Agropecuario', 'Industrial', 'Ecosistémico'];

// ── Clasificación de calidad ─────────────────────────────────────────────────
// Misma regla que api/calidad.py (referencia del sistema). Si se cambia un
// umbral, debe cambiarse en ambos lugares. Un valor ausente no activa criterios.
const UMBRALES = {
  critico:    { condMax: 5000, salMax: 4.0, phMin: 6.0, phMax: 9.0 },
  precaucion: { condMax: 2500,              phMin: 6.5, phMax: 8.5 },
};

function clasificarEstado({ ph, cond, sal }) {
  const has = v => v != null && !isNaN(v);
  const c = UMBRALES.critico, w = UMBRALES.precaucion;
  if ((has(cond) && cond > c.condMax) || (has(sal) && sal > c.salMax) ||
      (has(ph) && (ph < c.phMin || ph > c.phMax))) return 'Crítico';
  if ((has(cond) && cond > w.condMax) ||
      (has(ph) && (ph < w.phMin || ph > w.phMax))) return 'Precaución';
  return 'Apta';
}

// Criterios de la regla que cumple una medición, para explicar su estado
function motivosEstado({ ph, cond, sal }) {
  const has = v => v != null && !isNaN(v);
  const c = UMBRALES.critico, w = UMBRALES.precaucion, m = [];
  if (has(cond) && cond > c.condMax) m.push({ sev:'Crítico', txt:`Conductividad ${fmtMiles(cond)} µS/cm > ${fmtMiles(c.condMax)}` });
  else if (has(cond) && cond > w.condMax) m.push({ sev:'Precaución', txt:`Conductividad ${fmtMiles(cond)} µS/cm > ${fmtMiles(w.condMax)}` });
  if (has(sal) && sal > c.salMax) m.push({ sev:'Crítico', txt:`Salinidad ${fmtNum(sal, 3)} mS/cm > ${fmtNum(c.salMax, 1)}` });
  if (has(ph) && (ph < c.phMin || ph > c.phMax)) m.push({ sev:'Crítico', txt:`pH ${fmtNum(ph)} fuera del rango ${fmtNum(c.phMin, 1)}–${fmtNum(c.phMax, 1)}` });
  else if (has(ph) && (ph < w.phMin || ph > w.phMax)) m.push({ sev:'Precaución', txt:`pH ${fmtNum(ph)} fuera del rango ${fmtNum(w.phMin, 1)}–${fmtNum(w.phMax, 1)}` });
  return m;
}

// ── Formato de valores (colombiano: miles con punto, decimales con coma) ────
// fmtNum(v)    → hasta 3 decimales          fmtNum(v, 2) → exactamente 2 decimales
// fmtMiles(v)  → entero con separador de miles
// Un valor ausente se muestra como "—".
function fmtNum(v, decimals) {
  if (v == null || v === '' || isNaN(v)) return '—';
  const n = Number(v);
  return decimals == null
    ? n.toLocaleString('es-CO', { maximumFractionDigits: 3 })
    : n.toLocaleString('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtMiles(v) {
  if (v == null || v === '' || isNaN(v)) return '—';
  return Number(v).toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

// ── Helpers de agregación ────────────────────────────────────────────────────
// Promedio de los valores presentes; los ausentes (null) no cuentan.
function avg(arr, key) {
  const vals = arr.filter(p => p[key] != null && p[key] > 0);
  return vals.length ? vals.reduce((a, b) => a + b[key], 0) / vals.length : 0;
}

function distByEstado(pts) {
  return {
    apta:       pts.filter(p => p.estado === 'Apta').length,
    precaucion: pts.filter(p => p.estado === 'Precaución').length,
    critico:    pts.filter(p => p.estado === 'Crítico').length,
  };
}

// ── buildGJ(points) — construye window.GJ desde cualquier array de puntos ────
// Llamado al inicio con datos estáticos y re-llamado si el API trae datos live.
function buildGJ(points) {
  const ALL_POINTS = points || [];

// ── KPIs globales ────────────────────────────────────────────────────────────
const activos = ALL_POINTS.filter(p => p.activo).length;
const criticos = ALL_POINTS.filter(p => p.estado === 'Crítico').length;
const aptos    = ALL_POINTS.filter(p => p.estado === 'Apta').length;

// IPH = 100 · (aptos/total) ajustado por pH promedio ≥ 6.5
const phProm = +avg(ALL_POINTS, 'ph').toFixed(2);
const kPH    = Math.min(1, Math.max(0, (phProm - 5.8) / (8.5 - 5.8)));
const iph    = +(100 * (aptos / Math.max(ALL_POINTS.length, 1)) * kPH).toFixed(1);

// IDA = salinidad promedio * factor de conductividad escalado 0-100
const salProm  = avg(ALL_POINTS, 'sal');
const condProm = avg(ALL_POINTS, 'cond');
const ida      = +(Math.min(100, (salProm / 3.5) * 50 + (condProm / 5000) * 50)).toFixed(1);

const KPIS = {
  puntosActivos: activos,
  total:         ALL_POINTS.length,
  phPromedio:    phProm,
  puntosCriticos: criticos,
  precaucion:    ALL_POINTS.filter(p => p.estado === 'Precaución').length,
  aptos,
  coberturaPct:  +(100 * activos / Math.max(ALL_POINTS.length, 1)).toFixed(1),
  iph,
  ida,
};

// ── Agregados por municipio ──────────────────────────────────────────────────
const MUNI_AGG = MUNICIPIOS.map(m => {
  const pts  = ALL_POINTS.filter(p => p.muni === m.id);
  const seca = pts.filter(p => p.temporada === 'Seca');
  const hum  = pts.filter(p => p.temporada === 'Húmeda');
  return {
    ...m,
    capt:    pts.length,
    n:       pts.length,
    activos: pts.filter(p => p.activo).length,
    ph:      +avg(pts,  'ph').toFixed(2),
    phSeca:  +avg(seca, 'ph').toFixed(2),
    phHum:   +avg(hum,  'ph').toFixed(2),
    cond:    Math.round(avg(pts, 'cond')),
    sal:     +avg(pts, 'sal').toFixed(2),
    temp:    +avg(pts, 'temp').toFixed(1),
    std:     Math.round(avg(pts, 'std')),
    criticos: pts.filter(p => p.estado === 'Crítico').length,
    apta:    pts.filter(p => p.estado === 'Apta').length,
  };
});

// ── Series temporales ────────────────────────────────────────────────────────
// Calculadas desde los datos reales por época
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// Multiplicadores mensuales hidrogeológicamente fundamentados para La Guajira
// Época seca  → meses [0,1,2,3,4,10,11] = Ene, Feb, Mar, Abr, May, Nov, Dic
// Época húmeda → meses [5,6,7,8,9]      = Jun, Jul, Ago, Sep, Oct
// Referencia (factor 1.00): Feb (medición seca real) y Oct (medición húmeda real)
const MONTH_SHAPE = {
  //          Ene     Feb     Mar     Abr     May     Nov     Dic     (índices seca)
  ph:   { seca:[0.993, 1.000, 1.008, 1.015, 1.010, 0.989, 0.995],
  //          Jun     Jul     Ago     Sep     Oct                     (índices húmeda)
          hum: [1.010, 1.005, 0.992, 0.988, 1.000] },
  sal:  { seca:[0.850, 1.000, 1.180, 1.300, 1.220, 0.820, 0.880],
          hum: [1.200, 1.020, 0.820, 0.780, 1.000] },
  cond: { seca:[0.870, 1.000, 1.150, 1.250, 1.180, 0.840, 0.900],
          hum: [1.180, 1.020, 0.840, 0.800, 1.000] },
  temp: { seca:[0.974, 1.000, 1.023, 1.040, 1.033, 0.967, 0.974],
          hum: [1.030, 1.020, 0.990, 0.980, 1.000] },
};

function buildSeries(pts, key) {
  const secaVal  = +avg(pts.filter(p => p.temporada === 'Seca'),   key).toFixed(2);
  const humVal   = +avg(pts.filter(p => p.temporada === 'Húmeda'), key).toFixed(2);
  const secaMths = [0,1,2,3,4,10,11];
  const humMths  = [5,6,7,8,9];
  const sh = MONTH_SHAPE[key] || { seca:[1,1,1,1,1,1,1], hum:[1,1,1,1,1] };
  return MONTHS.map((_, i) => {
    const si = secaMths.indexOf(i);
    if (si >= 0) return secaVal ? +(secaVal * sh.seca[si]).toFixed(2) : null;
    const hi = humMths.indexOf(i);
    if (hi >= 0) return humVal  ? +(humVal  * sh.hum[hi]).toFixed(2)  : null;
    return null;
  });
}

const SECA_IDX = [0,1,2,3,4,10,11];
const HUM_IDX  = [5,6,7,8,9];

const SERIES_PH_SECA   = buildSeries(ALL_POINTS, 'ph'  ).map((v,i) => SECA_IDX.includes(i) ? v : null);
const SERIES_PH_HUM    = buildSeries(ALL_POINTS, 'ph'  ).map((v,i) => HUM_IDX .includes(i) ? v : null);
const SERIES_SAL_SECA  = buildSeries(ALL_POINTS, 'sal' ).map((v,i) => SECA_IDX.includes(i) ? v : null);
const SERIES_SAL_HUM   = buildSeries(ALL_POINTS, 'sal' ).map((v,i) => HUM_IDX .includes(i) ? v : null);
const SERIES_COND_SECA = buildSeries(ALL_POINTS, 'cond').map((v,i) => SECA_IDX.includes(i) ? v : null);
const SERIES_COND_HUM  = buildSeries(ALL_POINTS, 'cond').map((v,i) => HUM_IDX .includes(i) ? v : null);
const SERIES_TEMP_SECA = buildSeries(ALL_POINTS, 'temp').map((v,i) => SECA_IDX.includes(i) ? v : null);
const SERIES_TEMP_HUM  = buildSeries(ALL_POINTS, 'temp').map((v,i) => HUM_IDX .includes(i) ? v : null);

// ── Alertas — una por fuente que incumple la regla de calidad ────────────────
// Se toma la medición más reciente de cada fuente (lugar de captación) y se
// aplica la misma regla que clasificarEstado: estado Crítico → alerta crítica,
// Precaución → advertencia. El código indica el criterio principal incumplido.
const MESES_CORTOS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function fechaCorta(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MESES_CORTOS[m - 1]} ${y}`;
}

function criterioPrincipal(p) {
  const c = UMBRALES.critico, w = UMBRALES.precaucion;
  const has = v => v != null && !isNaN(v);
  const cond = v => `${Number(v).toLocaleString('es-CO')} µS/cm`;
  if (has(p.cond) && p.cond > c.condMax) return { code: 'COND > 5.000', value: cond(p.cond), body: `Conductividad muy alta (agua muy salada) · ${p.tipo.toLowerCase()}` };
  if (has(p.sal) && p.sal > c.salMax)    return { code: 'SAL > 4,0',    value: `${fmtNum(p.sal)} mS/cm`, body: `Salinidad muy alta · ${p.tipo.toLowerCase()}` };
  if (has(p.ph) && p.ph < c.phMin)       return { code: 'pH < 6,0',     value: `pH ${fmtNum(p.ph)}`,     body: `Agua muy ácida · ${p.tipo.toLowerCase()}` };
  if (has(p.ph) && p.ph > c.phMax)       return { code: 'pH > 9,0',     value: `pH ${fmtNum(p.ph)}`,     body: `Agua muy alcalina · ${p.tipo.toLowerCase()}` };
  if (has(p.cond) && p.cond > w.condMax) return { code: 'COND > 2.500', value: cond(p.cond), body: `Conductividad elevada · ${p.tipo.toLowerCase()}` };
  if (has(p.ph) && p.ph < w.phMin)       return { code: 'pH < 6,5',     value: `pH ${fmtNum(p.ph)}`,     body: `Acidez fuera de lo normal · ${p.tipo.toLowerCase()}` };
  if (has(p.ph) && p.ph > w.phMax)       return { code: 'pH > 8,5',     value: `pH ${fmtNum(p.ph)}`,     body: `Alcalinidad fuera de lo normal · ${p.tipo.toLowerCase()}` };
  return null;
}

const ULTIMA_POR_FUENTE = (() => {
  const m = new Map();
  ALL_POINTS.forEach(p => {
    const k = p.lat + '|' + p.lon + '|' + p.tipo;
    const prev = m.get(k);
    if (!prev || p.fecha > prev.fecha) m.set(k, p);
  });
  return Array.from(m.values());
})();

const ALERTS = ULTIMA_POR_FUENTE
  .filter(p => p.estado === 'Crítico' || p.estado === 'Precaución')
  .map(p => {
    const c = criterioPrincipal(p) || { code: '—', value: '—', body: `Calidad fuera de rango · ${p.tipo.toLowerCase()}` };
    return {
      id:     'AL-' + p.id.replace(/^GJ-/, ''),
      sev:    p.estado === 'Crítico' ? 'crit' : 'warn',
      code:   c.code,
      body:   c.body,
      value:  c.value,
      muni:   p.muniName,
      muniId: p.muni,
      point:  p.id,
      fecha:  p.fecha,
      time:   fechaCorta(p.fecha),
      cond:   p.cond,
    };
  })
  .sort((a, b) => (a.sev === b.sev ? 0 : a.sev === 'crit' ? -1 : 1) || (b.cond || 0) - (a.cond || 0) || a.point.localeCompare(b.point));

// ── Kimball Bus Matrix ────────────────────────────────────────────────────────
const BUS_MATRIX = {
  procesos: [
    { id:'P1', name:'Registro de puntos de monitoreo',     freq:'Continua',  actor:'IDEAM / SGC' },
    { id:'P2', name:'Medición fisicoquímica época seca',   freq:'Semestral', actor:'Técnicos de campo' },
    { id:'P3', name:'Medición fisicoquímica época húmeda', freq:'Semestral', actor:'Técnicos de campo' },
    { id:'P4', name:'Clasificación de uso del suelo',      freq:'Anual',     actor:'Corpoguajira' },
    { id:'P5', name:'Evaluación del estado de captadores', freq:'Semestral', actor:'Técnicos' },
  ],
  dims: ['DIM_TIEMPO','DIM_UBICACION','DIM_PUNTO_MONITOREO','DIM_USO_SUELO','DIM_METODO'],
  cells: [
    ['✓','✓','✓','·','·'],
    ['✓','✓','✓','·','✓'],
    ['✓','✓','✓','·','✓'],
    ['·','✓','·','✓','·'],
    ['✓','✓','✓','·','✓'],
  ],
};

const ACTORS = [
  { code:'GOB', name:'Gobernación de La Guajira', role:'Política pública' },
  { code:'CGJ', name:'Corpoguajira',              role:'Autoridad ambiental' },
  { code:'MMA', name:'Ministerio de Ambiente',    role:'Normatividad nacional' },
  { code:'IDM', name:'IDEAM',                     role:'Datos meteo/hídricos' },
  { code:'SGC', name:'Servicio Geológico',        role:'Hidrogeología técnica' },
  { code:'DEF', name:'Defensoría del Pueblo',     role:'Derecho al agua' },
];

  window.GJ = {
    MUNICIPIOS, ALL_POINTS, KPIS, MUNI_AGG, MONTHS,
    SERIES_PH_SECA,   SERIES_PH_HUM,
    SERIES_SAL_SECA,  SERIES_SAL_HUM,
    SERIES_COND_SECA, SERIES_COND_HUM,
    SERIES_TEMP_SECA, SERIES_TEMP_HUM,
    ALERTS, BUS_MATRIX, ACTORS, distByEstado, TIPOS, USOS, METODOS,
    buildSeries,
    SECA_IDX, HUM_IDX,
    UMBRALES, clasificarEstado, motivosEstado, fmtNum, fmtMiles,
    ULTIMA_POR_FUENTE, fechaCorta,
  };
}

// Exponer buildGJ para que main.jsx pueda reconstruir GJ con datos del API
window.buildGJ = buildGJ;

// Build inicial con datos estáticos (real-data.js o vacío si el API aún no llegó)
buildGJ(window.GJ_REAL_POINTS || []);
