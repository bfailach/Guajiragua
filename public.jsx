// Vista pública — habitantes de La Guajira
//
// Rutas (hash):
//   #/                    Inicio
//   #/municipio/URI       Resumen de un municipio
//   #/fuentes?cerca=1     Fuentes cercanas (ubicación del teléfono)
//   #/fuentes?m=URI       Fuentes de un municipio
//   #/fuente/GJ-00001     Detalle de una fuente
//   #/recomendaciones     Qué hacer con el agua
//   #/reportar?f=GJ-...   Reportar un problema
// El panel institucional vive en #/panel (main.jsx).

// ── Textos ─────────────────────────────────────────────────────────────────
// Todos los textos visibles de la vista pública. Para agregar wayuunaiki,
// completar PUB_TEXTOS.guc con las mismas claves (traducción revisada por
// hablantes nativos). Una clave ausente usa el texto en español.
const PUB_TEXTOS = {
  es: {
    marca: 'Guajiragua',
    idioma: 'Idioma',
    idiomaEs: 'Español',
    idiomaGuc: 'Wayuunaiki',
    gucPendiente: 'La versión en wayuunaiki está en preparación. Por ahora el contenido se muestra en español.',
    pieDatos: 'Datos: Servicio Geológico Colombiano y Corpoguajira. Última medición: {fecha}.',
    accesoInstitucional: 'Acceso institucional',
    volverInicio: '← Inicio',
    volver: '← Volver',

    estado_Apta: 'Sin problemas detectados',
    estado_Precaución: 'Usar con cuidado',
    estado_Crítico: 'No apta para beber',
    estadoDesc_Apta: 'Sal y acidez dentro de lo aceptable.',
    estadoDesc_Precaución: 'Algo salada o con acidez fuera de lo normal.',
    estadoDesc_Crítico: 'Demasiada sal o acidez para tomarla.',

    inicioTitulo: '¿Cómo está el agua de tu fuente?',
    inicioIntro: 'Mira los resultados de las mediciones hechas en pozos, aljibes y manantiales de La Guajira.',
    verCerca: 'Ver fuentes cerca de mí',
    eligeMunicipio: 'O elige tu municipio',
    nFuentes: '{n} fuentes',
    queSignifica: 'Qué significa cada color',
    queHacerColor: 'Qué hacer según el color →',
    reportarProblema: 'Reportar un problema con el agua',

    cambiarMunicipio: '← Cambiar municipio',
    revisadas: '{n} fuentes revisadas · medición de {fecha}',
    resumenCritico: '{k} de cada 10 fuentes de {muni} no son aptas para beber.',
    resumenCuidado: 'En {muni}, {k} de cada 10 fuentes requieren cuidado o no son aptas para beber.',
    resumenBien: 'En {muni}, {k} de cada 10 fuentes no muestran problemas.',
    distribucion: 'Sin problemas {a} %, usar con cuidado {p} %, no apta para beber {c} %',
    cadaFuente: 'Cada fuente es distinta: una puede estar bien y la de al lado no. Revisa la que usas.',
    buscarEnMapa: 'Buscar mi fuente en el mapa',
    queHacerTitulo: 'Qué hacer con el agua →',
    queHacerDesc: 'Cómo beber, cocinar y lavar de forma segura según el color de tu fuente.',

    fuentesCerca: 'Fuentes cerca de ti',
    fuentesDe: 'Fuentes de {muni}',
    pidiendoUbicacion: 'Buscando tu ubicación…',
    ubicacionNegada: 'No pudimos saber dónde estás. Puedes permitir la ubicación en tu teléfono o elegir tu municipio.',
    reintentar: 'Intentar de nuevo',
    lejos: 'Estás a {km} de la fuente medida más cercana. Es posible que tu zona no tenga mediciones.',
    aptaMasCercana: 'La fuente sin problemas más cercana está a {km}.',
    sinAptaCerca: 'No hay fuentes sin problemas entre las más cercanas.',
    usarUbicacion: 'Ordenar por cercanía',
    filtrar: 'Filtrar por estado',
    todas: 'Todas',
    filtro_Apta: 'Sin problemas',
    filtro_Precaución: 'Con cuidado',
    filtro_Crítico: 'No apta',
    aKm: 'a {km}',
    mostrarMas: 'Mostrar más',
    ningunaFiltro: 'No hay fuentes con ese estado aquí.',
    mapaEtiqueta: 'Mapa de fuentes',
    tu: 'Tú',

    fuenteNoEncontrada: 'No encontramos esa fuente.',
    deTi: 'A {km} de ti',
    codigoFuente: 'Código de la fuente: {id}',
    queHacerEsta: 'Qué hacer con esta agua',
    verTodasRec: 'Ver todas las recomendaciones →',
    verValores: 'Ver los valores medidos',
    valCond: 'Sal (conductividad)',
    valSal: 'Salinidad',
    valPh: 'Acidez (pH)',
    valTemp: 'Temperatura',
    sinDato: 'Sin dato',
    normal: 'normal',
    medidoEl: 'Medido el {fecha}, en época {temporada}. El agua puede cambiar con las lluvias.',
    inactiva: 'Esta fuente figura como fuera de uso en el último registro.',
    reportarEsta: 'Reportar un problema con esta fuente',

    motivoSalAlta: 'tiene demasiada sal para beberla',
    motivoSalMedia: 'está algo salada: tiene más sal de la recomendada para beberla todos los días',
    motivoAcidaAlta: 'es demasiado ácida',
    motivoAcidaMedia: 'es algo ácida',
    motivoAlcalinaAlta: 'es demasiado alcalina',
    motivoAlcalinaMedia: 'es algo alcalina',
    motivoNinguno: 'La sal y la acidez están dentro de lo aceptable.',
    motivoFrase: 'El agua {motivos}.',
    y: ' y ',

    hacerBeber: 'Para beber',
    hacerBebes: 'Bebés y niños pequeños',
    hacerLavar: 'Bañarse, lavar y limpiar',
    hacer_Apta_beber: 'Sí, después de hervirla.',
    hacer_Apta_bebes: 'Hiérvela antes de preparar teteros.',
    hacer_Apta_lavar: 'Sí puedes usarla.',
    hacer_Precaución_beber: 'Si puedes, toma agua de una fuente sin problemas. Hervirla no le quita la sal.',
    hacer_Precaución_bebes: 'No la uses para preparar teteros.',
    hacer_Precaución_lavar: 'Sí puedes usarla.',
    hacer_Crítico_beber: 'No la bebas ni cocines con ella. Hervirla no le quita la sal: queda todavía más salada.',
    hacer_Crítico_bebes: 'No la uses para preparar teteros.',
    hacer_Crítico_lavar: 'Sí puedes usarla.',

    recTitulo: 'Qué hacer con el agua',
    recGeneralTitulo: 'Para cualquier fuente',
    recGeneral1: 'Estas mediciones revisan la sal y la acidez, no los microbios. Antes de beber, hierve el agua: déjala hervir con burbujas durante 1 minuto.',
    recGeneral2: 'Guárdala en recipientes limpios y tapados.',
    recBeber: 'Beber',
    recCocinar: 'Cocinar',
    recBeberCocinar: 'Beber y cocinar',
    recTeteros: 'Teteros de bebé',
    recLavar: 'Bañarse y lavar',
    recSi: 'Sí',
    recNo: 'No',
    recSiHervida: 'Sí, después de hervirla',
    recMejorOtra: 'Mejor otra fuente sin problemas',
    recHervirSal: 'Hervirla no le quita la sal: al hervir, el agua queda todavía más salada.',
    recSalud: 'Si alguien se enferma después de tomar agua, por ejemplo con diarrea o vómito, acude al centro de salud más cercano.',

    repTitulo: 'Reportar un problema',
    repIntro: 'Avísanos si notas algo raro en el agua. Solo toma un minuto.',
    repFuente: 'Fuente',
    repSinFuente: 'Elige la fuente en el mapa para reportar sobre ella.',
    repElegir: 'Elegir',
    repCambiar: 'Cambiar',
    repQueNotaste: '¿Qué notaste?',
    rep_olor: 'Mal olor',
    rep_color: 'Color extraño o turbia',
    rep_salado: 'Más salada de lo normal',
    rep_enfermo: 'Alguien se enfermó',
    rep_seca: 'La fuente está seca o dañada',
    rep_otro: 'Otra cosa',
    repDetalle: 'Cuéntanos más',
    repDetallePh: 'Desde cuándo, a quién afectó…',
    repTelefono: 'Teléfono para contactarte',
    opcional: '(opcional)',
    repEnviar: 'Enviar reporte',
    repNoDisponible: 'El envío de reportes todavía no está habilitado. Se activará cuando se defina la entidad que los recibe.',
  },
  guc: {},
};

function pubIdioma() {
  try { return localStorage.getItem('gj_idioma') || 'es'; } catch (e) { return 'es'; }
}

function pubT(clave, vars) {
  const idioma = pubIdioma();
  let s = (PUB_TEXTOS[idioma] && PUB_TEXTOS[idioma][clave]) || PUB_TEXTOS.es[clave] || clave;
  if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
  return s;
}

// ── Rutas ──────────────────────────────────────────────────────────────────
function leerRuta() {
  const raw = (window.location.hash || '').replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  const query = {};
  (qs || '').split('&').filter(Boolean).forEach(kv => {
    const [k, v] = kv.split('=');
    query[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return { path: path || '/', parts: (path || '/').split('/').filter(Boolean), query };
}

function useRuta() {
  const [ruta, setRuta] = useState(leerRuta);
  useEffect(() => {
    const on = () => { setRuta(leerRuta()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return ruta;
}

// ── Datos ──────────────────────────────────────────────────────────────────
const PUB_SEV = { 'Apta': 0, 'Precaución': 1, 'Crítico': 2 };
const PUB_CLASE = { 'Apta': 'apta', 'Precaución': 'precaucion', 'Crítico': 'critico' };
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

let _fuentesCache = { src: null, list: [], porId: {} };

// Una fuente = un lugar de captación; se muestra su medición más reciente.
function pubFuentes() {
  const src = (window.GJ && GJ.ALL_POINTS) || [];
  if (_fuentesCache.src === src) return _fuentesCache;
  const porLugar = new Map();
  const porId = {};
  src.forEach(p => {
    const k = p.lat + '|' + p.lon + '|' + p.tipo;
    const prev = porLugar.get(k);
    if (!prev || p.fecha > prev.fecha) porLugar.set(k, p);
  });
  src.forEach(p => { porId[p.id] = porLugar.get(p.lat + '|' + p.lon + '|' + p.tipo); });
  _fuentesCache = { src, list: Array.from(porLugar.values()), porId };
  return _fuentesCache;
}

function fechaLarga(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

function mesAnio(iso) {
  if (!iso) return '';
  const [y, m] = iso.split('-').map(Number);
  return `${MESES[m - 1]} de ${y}`;
}

function ultimaFecha(list) {
  return list.reduce((max, p) => (p.fecha > max ? p.fecha : max), '');
}

function distanciaKm(a, b) {
  const R = 6371, rad = x => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function fmtKm(km) {
  if (km < 0.1) return 'menos de 100 m';
  if (km < 10) return km.toFixed(1).replace('.', ',') + ' km';
  return Math.round(km).toLocaleString('es-CO') + ' km';
}

function muniNombre(id) {
  const m = GJ.MUNICIPIOS.find(x => x.id === id);
  return m ? m.name : id;
}

// Explicación en lenguaje simple, con la misma regla que clasificarEstado
function motivosPublicos(p) {
  const c = GJ.UMBRALES.critico, w = GJ.UMBRALES.precaucion, m = [];
  const has = v => v != null && !isNaN(v);
  if ((has(p.cond) && p.cond > c.condMax) || (has(p.sal) && p.sal > c.salMax)) m.push(pubT('motivoSalAlta'));
  else if (has(p.cond) && p.cond > w.condMax) m.push(pubT('motivoSalMedia'));
  if (has(p.ph) && p.ph < c.phMin) m.push(pubT('motivoAcidaAlta'));
  else if (has(p.ph) && p.ph < w.phMin) m.push(pubT('motivoAcidaMedia'));
  else if (has(p.ph) && p.ph > c.phMax) m.push(pubT('motivoAlcalinaAlta'));
  else if (has(p.ph) && p.ph > w.phMax) m.push(pubT('motivoAlcalinaMedia'));
  return m.length ? pubT('motivoFrase', { motivos: m.join(pubT('y')) }) : pubT('motivoNinguno');
}

// Ubicación del teléfono (se recuerda durante la sesión)
function posGuardada() {
  try { return JSON.parse(sessionStorage.getItem('gj_pos') || 'null'); } catch (e) { return null; }
}

function pedirUbicacion() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('no-disponible'));
    navigator.geolocation.getCurrentPosition(
      r => {
        const pos = { lat: r.coords.latitude, lon: r.coords.longitude };
        try { sessionStorage.setItem('gj_pos', JSON.stringify(pos)); } catch (e) {}
        resolve(pos);
      },
      err => reject(err),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  });
}

function volverAtras(e) {
  if (window.history.length > 1) { e.preventDefault(); window.history.back(); }
}

// ── Iconos ─────────────────────────────────────────────────────────────────
const Svg = ({ size = 24, color = 'currentColor', children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, ...style }}>
    {children}
  </svg>
);
const IcoGota = p => <Svg {...p}><path d="M12 3c-3.5 4.2-6 7.6-6 10.6a6 6 0 0 0 12 0C18 10.6 15.5 7.2 12 3z"/></Svg>;
const IcoPin  = p => <Svg {...p}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></Svg>;
const IcoBien = p => <Svg color="#1e6b44" {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.5L16 9.5"/></Svg>;
const IcoCuid = p => <Svg color="#8a5300" {...p}><path d="M12 4l9 16H3z"/><path d="M12 10v4"/><path d="M12 17.5v.01"/></Svg>;
const IcoMal  = p => <Svg color="#a3231a" {...p}><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></Svg>;
const IcoBand = p => <Svg {...p}><path d="M5 21V4h11l-1.5 4L16 12H5"/></Svg>;
const IcoVaso = p => <Svg color="#0b5566" {...p}><path d="M6 3h12l-1.5 17a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1z"/><path d="M6.5 8h11"/></Svg>;
const IcoTete = p => <Svg color="#0b5566" {...p}><path d="M9 3v3a3 3 0 0 0 6 0V3"/><path d="M8 9h8l-1 11a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/></Svg>;
const IcoLava = p => <Svg color="#0b5566" {...p}><path d="M4 12h16"/><path d="M6 12v5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5"/><path d="M9 8c0-1.5 1-2 1-3.5M13 8c0-1.5 1-2 1-3.5"/></Svg>;
const IcoCruz = p => <Svg color="#0b5566" {...p}><path d="M12 5v14M5 12h14"/></Svg>;

function IcoEstado({ estado, size }) {
  if (estado === 'Crítico') return <IcoMal size={size} />;
  if (estado === 'Precaución') return <IcoCuid size={size} />;
  return <IcoBien size={size} />;
}

// ── Estructura común ───────────────────────────────────────────────────────
function PubHeader({ idioma, setIdioma }) {
  return (
    <header className="pub-header">
      <a className="pub-brand" href="#/"><IcoGota size={22} color="#0b5566" />{pubT('marca')}</a>
      <div className="pub-lang" role="group" aria-label={pubT('idioma')}>
        <button aria-pressed={idioma === 'es'} onClick={() => setIdioma('es')}>{pubT('idiomaEs')}</button>
        <button aria-pressed={idioma === 'guc'} onClick={() => setIdioma('guc')}>{pubT('idiomaGuc')}</button>
      </div>
    </header>
  );
}

function PubFooter() {
  const fecha = mesAnio(ultimaFecha(pubFuentes().list));
  return (
    <footer className="pub-footer">
      <div className="pub-footer-in">
        <span>{pubT('pieDatos', { fecha })}</span>
        <a href="#/panel">{pubT('accesoInstitucional')}</a>
      </div>
    </footer>
  );
}

function EstadoLeyenda({ estado }) {
  return (
    <div className={'pub-legend pub-st-' + PUB_CLASE[estado]}>
      <IcoEstado estado={estado} size={26} />
      <div><b>{pubT('estado_' + estado)}</b><span>{pubT('estadoDesc_' + estado)}</span></div>
    </div>
  );
}

// ── Pantallas ──────────────────────────────────────────────────────────────
function PubInicio() {
  const { list } = pubFuentes();
  const conteo = {};
  list.forEach(p => { conteo[p.muni] = (conteo[p.muni] || 0) + 1; });
  const munis = GJ.MUNICIPIOS.filter(m => conteo[m.id])
    .slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));

  return (
    <>
      <section className="pub-stack" style={{ paddingTop: 10 }}>
        <h1 className="pub-h1">{pubT('inicioTitulo')}</h1>
        <p className="pub-lead">{pubT('inicioIntro')}</p>
        <a className="pub-btn" href="#/fuentes?cerca=1"><IcoPin size={22} />{pubT('verCerca')}</a>
      </section>

      <section className="pub-stack">
        <h2 className="pub-h2">{pubT('eligeMunicipio')}</h2>
        <div className="pub-muni-grid">
          {munis.map(m => (
            <a key={m.id} className="pub-muni" href={'#/municipio/' + m.id}>
              <b>{m.name}</b><span>{pubT('nFuentes', { n: conteo[m.id].toLocaleString('es-CO') })}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="pub-stack">
        <h2 className="pub-h2">{pubT('queSignifica')}</h2>
        <div className="pub-stack-sm" style={{ gap: 8 }}>
          {['Apta', 'Precaución', 'Crítico'].map(e => <EstadoLeyenda key={e} estado={e} />)}
        </div>
        <a className="pub-link-strong" href="#/recomendaciones">{pubT('queHacerColor')}</a>
      </section>

      <a className="pub-btn pub-btn-outline" href="#/reportar"><IcoBand size={20} />{pubT('reportarProblema')}</a>
    </>
  );
}

function PubMunicipio({ id }) {
  const fuentes = pubFuentes().list.filter(p => p.muni === id);
  const nombre = muniNombre(id);
  if (!fuentes.length) {
    return <><a className="pub-back" href="#/">{pubT('volverInicio')}</a><p className="pub-lead">{pubT('fuenteNoEncontrada')}</p></>;
  }
  const n = fuentes.length;
  const c = { 'Apta': 0, 'Precaución': 0, 'Crítico': 0 };
  fuentes.forEach(p => { c[p.estado] = (c[p.estado] || 0) + 1; });
  // Porcentajes enteros que suman 100 (método del mayor residuo)
  const crudos = ['Apta', 'Precaución', 'Crítico'].map(e => 100 * c[e] / n);
  const pct = crudos.map(Math.floor);
  let resto = 100 - pct.reduce((a, b) => a + b, 0);
  crudos.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => { if (resto > 0) { pct[i]++; resto--; } });

  const k = x => Math.max(1, Math.round(10 * x / n));
  let resumen;
  if (c['Crítico'] / n >= 0.25) resumen = pubT('resumenCritico', { k: k(c['Crítico']), muni: nombre });
  else if ((c['Crítico'] + c['Precaución']) / n >= 0.35) resumen = pubT('resumenCuidado', { k: k(c['Crítico'] + c['Precaución']), muni: nombre });
  else resumen = pubT('resumenBien', { k: k(c['Apta']), muni: nombre });

  return (
    <>
      <a className="pub-back" href="#/">{pubT('cambiarMunicipio')}</a>
      <section className="pub-stack-sm">
        <h1 className="pub-h1 pub-h1-xl">{nombre}</h1>
        <p className="pub-small">{pubT('revisadas', { n: n.toLocaleString('es-CO'), fecha: mesAnio(ultimaFecha(fuentes)) })}</p>
      </section>

      <section className="pub-card pub-stack" style={{ gap: 16 }}>
        <p style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 700 }}>{resumen}</p>
        <div className="pub-bar" role="img" aria-label={pubT('distribucion', { a: pct[0], p: pct[1], c: pct[2] })}>
          <div style={{ flex: c['Apta'] }} /><div style={{ flex: c['Precaución'] }} /><div style={{ flex: c['Crítico'] }} />
        </div>
        <div className="pub-stack-sm" style={{ gap: 10 }}>
          {['Apta', 'Precaución', 'Crítico'].map((e, i) => (
            <div key={e} className="pub-dist-row">
              <IcoEstado estado={e} size={24} />
              <span className="lbl">{pubT('estado_' + e)}</span>
              <span className="n">{c[e].toLocaleString('es-CO')}</span>
              <span className="pct">{pct[i]} %</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pub-stack">
        <p className="pub-lead" style={{ color: '#2c3a33' }}>{pubT('cadaFuente')}</p>
        <a className="pub-btn" href={'#/fuentes?m=' + id}><IcoPin size={22} />{pubT('buscarEnMapa')}</a>
      </section>

      <a className="pub-card-link" href="#/recomendaciones">
        <strong>{pubT('queHacerTitulo')}</strong>
        <span>{pubT('queHacerDesc')}</span>
      </a>
    </>
  );
}

function PubMapa({ puntos, user }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const capaRef = useRef(null);

  useEffect(() => {
    if (!window.L || !ref.current) return;
    const map = L.map(ref.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap · CARTO', subdomains: 'abcd', maxZoom: 18,
    }).addTo(map);
    capaRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current, capa = capaRef.current;
    if (!map || !capa) return;
    capa.clearLayers();
    const bounds = [];
    puntos.forEach(p => {
      const icon = L.divIcon({ className: '', html: `<span class="pub-mk pub-mk-${PUB_CLASE[p.estado]}"></span>`, iconSize: [16, 16], iconAnchor: [8, 8] });
      L.marker([p.lat, p.lon], { icon, title: `${p.tipo} · ${pubT('estado_' + p.estado)}`, alt: pubT('estado_' + p.estado) })
        .on('click', () => { window.location.hash = '#/fuente/' + encodeURIComponent(p.id); })
        .addTo(capa);
      bounds.push([p.lat, p.lon]);
    });
    if (user) {
      const icon = L.divIcon({ className: '', html: '<span class="pub-mk-user"></span>', iconSize: [24, 24], iconAnchor: [12, 12] });
      L.marker([user.lat, user.lon], { icon, title: pubT('tu'), keyboard: false, zIndexOffset: 1000 }).addTo(capa);
      bounds.push([user.lat, user.lon]);
    }
    if (bounds.length) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
  }, [puntos, user]);

  return <div ref={ref} className="pub-map" role="region" aria-label={pubT('mapaEtiqueta')} />;
}

function PubFuentes({ query }) {
  const muni = query.m || null;
  const cerca = query.cerca === '1' || !muni;
  const [pos, setPos] = useState(cerca ? posGuardada() : null);
  const [geo, setGeo] = useState(cerca && !posGuardada() ? 'pidiendo' : 'ok');
  const [filtro, setFiltro] = useState(null);
  const [limite, setLimite] = useState(10);

  function ubicar() {
    setGeo('pidiendo');
    pedirUbicacion().then(p => { setPos(p); setGeo('ok'); }).catch(() => setGeo('negada'));
  }
  useEffect(() => { if (cerca && !pos) ubicar(); }, [cerca]);
  useEffect(() => { setLimite(10); }, [filtro, muni, cerca]);

  const { list } = pubFuentes();
  const base = useMemo(() => {
    let xs = muni ? list.filter(p => p.muni === muni) : list;
    if (pos) {
      xs = xs.map(p => ({ ...p, km: distanciaKm(pos, p) })).sort((a, b) => a.km - b.km);
      if (!muni) xs = xs.slice(0, 80);
    } else {
      xs = xs.slice().sort((a, b) => PUB_SEV[b.estado] - PUB_SEV[a.estado] || a.id.localeCompare(b.id));
    }
    return xs;
  }, [list, muni, pos]);

  const visibles = filtro ? base.filter(p => p.estado === filtro) : base;
  const titulo = muni ? pubT('fuentesDe', { muni: muniNombre(muni) }) : pubT('fuentesCerca');
  const volver = muni ? '#/municipio/' + muni : '#/';

  if (!muni && !pos) {
    return (
      <>
        <a className="pub-back" href="#/">{pubT('volverInicio')}</a>
        <h1 className="pub-h1">{pubT('fuentesCerca')}</h1>
        {geo === 'pidiendo'
          ? <p className="pub-lead" role="status">{pubT('pidiendoUbicacion')}</p>
          : <div className="pub-stack">
              <div className="pub-callout pub-callout-warn" role="alert"><IcoCuid size={24} /><span>{pubT('ubicacionNegada')}</span></div>
              <button className="pub-btn pub-btn-outline" onClick={ubicar}><IcoPin size={20} />{pubT('reintentar')}</button>
              <h2 className="pub-h2" style={{ marginTop: 8 }}>{pubT('eligeMunicipio')}</h2>
              <div className="pub-muni-grid">
                {GJ.MUNICIPIOS.slice().sort((a, b) => a.name.localeCompare(b.name, 'es')).map(m => (
                  <a key={m.id} className="pub-muni" href={'#/fuentes?m=' + m.id}><b>{m.name}</b></a>
                ))}
              </div>
            </div>}
      </>
    );
  }

  const aptaCercana = pos ? base.find(p => p.estado === 'Apta') : null;
  const masCercana = pos ? base[0] : null;

  return (
    <>
      <a className="pub-back" href={volver}>{muni ? pubT('volver') : pubT('volverInicio')}</a>
      <h1 className="pub-h1">{titulo}</h1>

      {pos && masCercana && masCercana.km > 25 && (
        <div className="pub-callout pub-callout-warn"><IcoCuid size={24} /><span>{pubT('lejos', { km: fmtKm(masCercana.km) })}</span></div>
      )}
      {pos && (aptaCercana
        ? <div className="pub-callout pub-callout-ok"><IcoBien size={26} /><span>{pubT('aptaMasCercana', { km: fmtKm(aptaCercana.km) })}</span></div>
        : <div className="pub-callout pub-callout-warn"><IcoCuid size={24} /><span>{pubT('sinAptaCerca')}</span></div>)}
      {!pos && (
        <button className="pub-btn pub-btn-outline" onClick={() => { ubicar(); }}>
          <IcoPin size={20} />{geo === 'pidiendo' ? pubT('pidiendoUbicacion') : pubT('usarUbicacion')}
        </button>
      )}
      {geo === 'negada' && muni && (
        <div className="pub-callout pub-callout-warn" role="alert"><IcoCuid size={24} /><span>{pubT('ubicacionNegada')}</span></div>
      )}

      <PubMapa puntos={visibles} user={pos} />

      <div className="pub-chips" role="group" aria-label={pubT('filtrar')}>
        <button className="pub-chip" aria-pressed={filtro === null} onClick={() => setFiltro(null)}>{pubT('todas')}</button>
        {['Apta', 'Precaución', 'Crítico'].map(e => (
          <button key={e} className="pub-chip" aria-pressed={filtro === e} onClick={() => setFiltro(e)}>
            <span className={'pub-mark pub-mark-' + PUB_CLASE[e]} style={{ width: 12, height: 12 }} />{pubT('filtro_' + e)}
          </button>
        ))}
      </div>

      {visibles.length === 0
        ? <p className="pub-lead">{pubT('ningunaFiltro')}</p>
        : <ul className="pub-list">
            {visibles.slice(0, limite).map(p => (
              <li key={p.id}>
                <a className="pub-item" href={'#/fuente/' + encodeURIComponent(p.id)}>
                  <span className={'pub-mark pub-mark-' + PUB_CLASE[p.estado]} />
                  <span className="t">
                    <b>{p.tipo}{p.km != null ? ' · ' + pubT('aKm', { km: fmtKm(p.km) }) : ' · ' + p.id}</b>
                    <span className={'s pub-txt-' + PUB_CLASE[p.estado]}>{pubT('estado_' + p.estado)}</span>
                  </span>
                  <span aria-hidden="true" style={{ fontSize: 20, color: '#556059' }}>›</span>
                </a>
              </li>
            ))}
          </ul>}
      {visibles.length > limite && (
        <button className="pub-btn pub-btn-outline" onClick={() => setLimite(limite + 10)}>{pubT('mostrarMas')}</button>
      )}
    </>
  );
}

function PubQueHacer({ estado }) {
  return (
    <div className="pub-stack">
      <div className="pub-do"><IcoVaso size={26} /><div><b>{pubT('hacerBeber')}</b><span>{pubT('hacer_' + estado + '_beber')}</span></div></div>
      <div className="pub-do"><IcoTete size={26} /><div><b>{pubT('hacerBebes')}</b><span>{pubT('hacer_' + estado + '_bebes')}</span></div></div>
      <div className="pub-do"><IcoLava size={26} /><div><b>{pubT('hacerLavar')}</b><span>{pubT('hacer_' + estado + '_lavar')}</span></div></div>
    </div>
  );
}

function PubFuente({ id }) {
  const p = pubFuentes().porId[id];
  if (!p) {
    return <><a className="pub-back" href="#/">{pubT('volverInicio')}</a><p className="pub-lead">{pubT('fuenteNoEncontrada')}</p></>;
  }
  const pos = posGuardada();
  const km = pos ? distanciaKm(pos, p) : null;
  const clase = PUB_CLASE[p.estado];
  const phNormal = p.ph >= GJ.UMBRALES.precaucion.phMin && p.ph <= GJ.UMBRALES.precaucion.phMax;

  return (
    <>
      <a className="pub-back" href="#/" onClick={volverAtras}>{pubT('volver')}</a>

      <section className="pub-stack-sm" style={{ gap: 4 }}>
        <h1 className="pub-h1">{p.tipo}</h1>
        <p style={{ fontSize: 17, color: '#3d4742' }}>{km != null ? pubT('deTi', { km: fmtKm(km) }) + ' · ' : ''}{p.muniName}</p>
        <p style={{ fontSize: 14, color: '#556059' }}>{pubT('codigoFuente', { id: p.id })}</p>
      </section>

      <section className={'pub-status-card pub-st-' + clase} style={{ background: `var(--p-${clase === 'apta' ? 'ok' : clase === 'precaucion' ? 'warn' : 'bad'}-bg)` }}>
        <div className="pub-status-title"><IcoEstado estado={p.estado} size={30} />{pubT('estado_' + p.estado)}</div>
        <p>{motivosPublicos(p)}</p>
      </section>

      {!p.activo && <div className="pub-callout pub-callout-info"><IcoCuid size={24} /><span>{pubT('inactiva')}</span></div>}

      <section className="pub-stack">
        <h2 className="pub-h2">{pubT('queHacerEsta')}</h2>
        <PubQueHacer estado={p.estado} />
        <a className="pub-link-strong" href="#/recomendaciones">{pubT('verTodasRec')}</a>
      </section>

      <details className="pub-details">
        <summary>{pubT('verValores')}</summary>
        <div className="rows">
          <div><span>{pubT('valCond')}</span><b>{GJ.fmtMiles(p.cond)} µS/cm</b></div>
          <div><span>{pubT('valPh')}</span><b>{String(p.ph).replace('.', ',')}{phNormal ? ' · ' + pubT('normal') : ''}</b></div>
          <div><span>{pubT('valSal')}</span><b>{p.sal != null ? String(p.sal).replace('.', ',') + ' mS/cm' : pubT('sinDato')}</b></div>
          <div><span>{pubT('valTemp')}</span><b>{p.temp != null ? String(p.temp).replace('.', ',') + ' °C' : pubT('sinDato')}</b></div>
        </div>
      </details>

      <p className="pub-small">{pubT('medidoEl', { fecha: fechaLarga(p.fecha), temporada: p.temporada === 'Seca' ? 'seca' : 'de lluvias' })}</p>

      <a className="pub-btn pub-btn-outline" href={'#/reportar?f=' + encodeURIComponent(p.id)}><IcoBand size={20} />{pubT('reportarEsta')}</a>
    </>
  );
}

function PubRecomendaciones() {
  const bloques = [
    ['Apta', [['recBeber', 'recSiHervida'], ['recCocinar', 'recSi'], ['recLavar', 'recSi']]],
    ['Precaución', [['recBeber', 'recMejorOtra'], ['recTeteros', 'recNo'], ['recLavar', 'recSi']]],
    ['Crítico', [['recBeberCocinar', 'recNo'], ['recTeteros', 'recNo'], ['recLavar', 'recSi']]],
  ];
  return (
    <>
      <a className="pub-back" href="#/">{pubT('volverInicio')}</a>
      <h1 className="pub-h1">{pubT('recTitulo')}</h1>

      <section className="pub-callout pub-callout-brand">
        <strong>{pubT('recGeneralTitulo')}</strong>
        <span>{pubT('recGeneral1')}</span>
        <span>{pubT('recGeneral2')}</span>
      </section>

      {bloques.map(([estado, filas]) => (
        <section key={estado} className="pub-card pub-stack" style={{ gap: 8 }}>
          <div className={'pub-rec-head pub-txt-' + PUB_CLASE[estado]}><IcoEstado estado={estado} size={24} />{pubT('estado_' + estado)}</div>
          <div className="pub-rec-grid">
            {filas.map(([a, b]) => <React.Fragment key={a}><span>{pubT(a)}</span><b>{pubT(b)}</b></React.Fragment>)}
          </div>
          {estado === 'Crítico' && <p style={{ fontSize: 15, color: '#3d2422', marginTop: 4 }}>{pubT('recHervirSal')}</p>}
        </section>
      ))}

      <section className="pub-callout pub-callout-info"><IcoCruz size={24} /><span>{pubT('recSalud')}</span></section>
    </>
  );
}

function PubReportar({ query }) {
  const p = query.f ? pubFuentes().porId[query.f] : null;
  const [marcadas, setMarcadas] = useState({});
  const opciones = ['olor', 'color', 'salado', 'enfermo', 'seca', 'otro'];

  return (
    <>
      <a className="pub-back" href="#/" onClick={volverAtras}>{pubT('volver')}</a>
      <section className="pub-stack-sm">
        <h1 className="pub-h1">{pubT('repTitulo')}</h1>
        <p className="pub-lead">{pubT('repIntro')}</p>
      </section>

      <form className="pub-stack" style={{ gap: 20 }} onSubmit={e => e.preventDefault()}>
        <section className="pub-stack-sm" style={{ gap: 8 }}>
          <h2 className="pub-h2" style={{ fontSize: 18 }}>{pubT('repFuente')}</h2>
          {p
            ? <div className="pub-item" style={{ cursor: 'default' }}>
                <span className={'pub-mark pub-mark-' + PUB_CLASE[p.estado]} />
                <span className="t"><b>{p.tipo} · {p.muniName}</b><span style={{ fontSize: 14, color: '#556059' }}>{pubT('codigoFuente', { id: p.id })}</span></span>
                <a href="#/fuentes?cerca=1" className="pub-link-strong" style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}>{pubT('repCambiar')}</a>
              </div>
            : <div className="pub-item" style={{ cursor: 'default' }}>
                <span className="t"><span style={{ fontSize: 16 }}>{pubT('repSinFuente')}</span></span>
                <a href="#/fuentes?cerca=1" className="pub-link-strong" style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}>{pubT('repElegir')}</a>
              </div>}
        </section>

        <fieldset className="pub-fieldset">
          <legend className="pub-legend-title">{pubT('repQueNotaste')}</legend>
          {opciones.map(o => (
            <label key={o} className="pub-check">
              <input type="checkbox" checked={!!marcadas[o]} onChange={() => setMarcadas({ ...marcadas, [o]: !marcadas[o] })} />
              <span>{pubT('rep_' + o)}</span>
            </label>
          ))}
        </fieldset>

        <div className="pub-field">
          <label htmlFor="rep-detalle">{pubT('repDetalle')} <span>{pubT('opcional')}</span></label>
          <textarea id="rep-detalle" rows="3" maxLength={1000} placeholder={pubT('repDetallePh')} />
        </div>

        <div className="pub-field">
          <label htmlFor="rep-tel">{pubT('repTelefono')} <span>{pubT('opcional')}</span></label>
          <input id="rep-tel" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="300 000 0000" />
        </div>

        <div className="pub-callout pub-callout-warn" id="rep-aviso"><IcoCuid size={24} /><span>{pubT('repNoDisponible')}</span></div>
        <button type="submit" className="pub-btn" disabled aria-describedby="rep-aviso">{pubT('repEnviar')}</button>
      </form>
    </>
  );
}

// ── Aplicación pública ─────────────────────────────────────────────────────
function PublicApp({ ruta }) {
  const [idioma, setIdiomaState] = useState(pubIdioma());
  function setIdioma(v) {
    try { localStorage.setItem('gj_idioma', v); } catch (e) {}
    setIdiomaState(v);
  }
  useEffect(() => { document.documentElement.lang = 'es'; }, []);

  const [a, b] = ruta.parts;
  let body;
  if (!a)                          body = <PubInicio />;
  else if (a === 'municipio')      body = <PubMunicipio id={b} />;
  else if (a === 'fuentes')        body = <PubFuentes key={ruta.path + JSON.stringify(ruta.query)} query={ruta.query} />;
  else if (a === 'fuente')         body = <PubFuente id={decodeURIComponent(b || '')} />;
  else if (a === 'recomendaciones') body = <PubRecomendaciones />;
  else if (a === 'reportar')       body = <PubReportar query={ruta.query} />;
  else                             body = <PubInicio />;

  const sinTraduccion = idioma === 'guc' && Object.keys(PUB_TEXTOS.guc).length === 0;

  return (
    <div className="pub">
      <PubHeader idioma={idioma} setIdioma={setIdioma} />
      {sinTraduccion && <div className="pub-notice-lang" role="status">{pubT('gucPendiente')}</div>}
      <main className="pub-main">{body}</main>
      <PubFooter />
    </div>
  );
}

window.PublicApp = PublicApp;
window.useRuta = useRuta;
