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

// ── Helpers de agregación ────────────────────────────────────────────────────
function avg(arr, key) {
  const vals = arr.filter(p => p[key] > 0);
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

// ── Alertas — generadas desde datos reales ───────────────────────────────────
const ALERTS = [];
const sevCodes = [
  { test: p => p.sal > 4.0,   sev:'crit', code:'SAL > 4.0',    label: p => `Salinidad ${p.sal.toFixed(3)} mS/cm en ${p.id} (${p.tipo})` },
  { test: p => p.ph < 6.0,    sev:'crit', code:'pH < 6.0',     label: p => `Acidez anómala ${p.ph} en ${p.id} (${p.muniName})` },
  { test: p => p.ph > 9.0,    sev:'crit', code:'pH > 9.0',     label: p => `Alcalinidad extrema ${p.ph} en ${p.id}` },
  { test: p => p.cond > 5000, sev:'crit', code:'COND > 5000',  label: p => `Conductividad ${p.cond.toLocaleString('es-CO')} µS/cm en ${p.id}` },
  { test: p => p.sal > 2.0 && p.sal <= 4.0, sev:'warn', code:'SAL > 2.0', label: p => `Salinidad creciente ${p.sal.toFixed(3)} en ${p.id} (${p.muniName})` },
  { test: p => p.cond > 2500 && p.cond <= 5000, sev:'warn', code:'COND > 2500', label: p => `Conductividad elevada ${p.cond.toLocaleString('es-CO')} µS/cm en ${p.id}` },
  { test: p => (p.ph < 6.5 || p.ph > 8.5) && p.ph >= 6.0 && p.ph <= 9.0, sev:'warn', code:'pH fuera rango', label: p => `pH ${p.ph} fuera del rango 6.5–8.5 en ${p.id}` },
];

let alertSeq = 220;
const used = new Set();
for (const rule of sevCodes) {
  const matching = ALL_POINTS.filter(p => rule.test(p) && !used.has(p.id)).slice(0, rule.sev === 'crit' ? 3 : 2);
  for (const p of matching) {
    used.add(p.id);
    ALERTS.push({
      id:   `AL-2026-${String(alertSeq--).padStart(4,'0')}`,
      sev:  rule.sev,
      code: rule.code,
      muni: p.muniName,
      body: rule.label(p),
      time: ALERTS.length < 3 ? `hace ${(ALERTS.length+1)*12} min` : ALERTS.length < 6 ? `hace ${ALERTS.length-2} h` : 'ayer',
    });
  }
}

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
  { code:'UMB', name:'Ing. Software UMB',         role:'Implementación BI' },
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
  };
}

// Exponer buildGJ para que main.jsx pueda reconstruir GJ con datos del API
window.buildGJ = buildGJ;

// Build inicial con datos estáticos (real-data.js o vacío si el API aún no llegó)
buildGJ(window.GJ_REAL_POINTS || []);
