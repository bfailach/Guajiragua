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
    recGeneralH: 'Antes de beber, hierve el agua',
    recGeneralP: 'Estas mediciones revisan la sal y la acidez, no los microbios. Déjala hervir con burbujas durante 1 minuto.',
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

    tabInicio: 'Inicio',
    tabCerca: 'Cerca',
    tabQueHacer: 'Qué hacer',
    tabReportar: 'Reportar',
    navegacion: 'Navegación principal',
    destacadoEyebrow: 'Cerca de ti',
    destacadoTitulo: 'Encuentra la fuente más cercana',
    municipios: 'Municipios',
    zona_Alta: 'Alta Guajira',
    zona_Media: 'Media Guajira',
    zona_Baja: 'Baja Guajira',
    masInfo: 'Más',
    verEnMapa: 'Ver mapa',
    queHacerCorto: 'Qué hacer',
    porEstado: 'Por estado',
    resumenMuni: '{n} fuentes · {fecha}',
    valoresMedidos: 'Valores medidos',
    noApta: 'No apta',

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


// ── Iconos (trazos propios) ────────────────────────────────────────────────
const Svg = ({ size = 24, color = 'currentColor', sw = 2, children, style, fill = 'none', className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, ...style }}>
    {children}
  </svg>
);
const IcoGota  = p => <Svg {...p}><path d="M12 3c-3.5 4.2-6 7.6-6 10.6a6 6 0 0 0 12 0C18 10.6 15.5 7.2 12 3z"/></Svg>;
const IcoPin   = p => <Svg {...p}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></Svg>;
const IcoCasa  = p => <Svg {...p}><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/></Svg>;
const IcoGuia  = p => <Svg {...p}><path d="M12 3c-3 3.6-5.2 6.5-5.2 9.1a5.2 5.2 0 0 0 10.4 0C17.2 9.5 15 6.6 12 3z"/><path d="M9.6 12.6l1.7 1.6 3.2-3.4"/></Svg>;
const IcoBand  = p => <Svg {...p}><path d="M5 21V4h11l-1.5 4L16 12H5"/></Svg>;
const IcoChev  = p => <Svg size={14} sw={2.6} {...p}><path d="M9 5l7 7-7 7"/></Svg>;
const IcoAtras = p => <Svg size={22} sw={2.4} {...p}><path d="M15 5l-7 7 7 7"/></Svg>;
const IcoTick  = p => <Svg sw={2.6} {...p}><path d="M5 12.5l4.5 4.5L19 7.5"/></Svg>;
const IcoBien  = p => <Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.5L16 9.5"/></Svg>;
const IcoCuid  = p => <Svg {...p}><path d="M12 4l9 16H3z"/><path d="M12 10v4"/><path d="M12 17.5v.01"/></Svg>;
const IcoMal   = p => <Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></Svg>;
const IcoVaso  = p => <Svg {...p}><path d="M6 3h12l-1.5 17a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1z"/><path d="M6.5 8h11"/></Svg>;
const IcoTete  = p => <Svg {...p}><path d="M9 3v3a3 3 0 0 0 6 0V3"/><path d="M8 9h8l-1 11a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/></Svg>;
const IcoLava  = p => <Svg {...p}><path d="M4 12h16"/><path d="M6 12v5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5"/><path d="M9 8c0-1.5 1-2 1-3.5M13 8c0-1.5 1-2 1-3.5"/></Svg>;
const IcoCruz  = p => <Svg {...p}><path d="M12 5v14M5 12h14"/></Svg>;

function IcoEstado({ estado, size, color }) {
  if (estado === 'Crítico') return <IcoMal size={size} color={color} />;
  if (estado === 'Precaución') return <IcoCuid size={size} color={color} />;
  return <IcoBien size={size} color={color} />;
}

const GotaArte = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 2c-4 4.8-7 8.8-7 12.2a7 7 0 0 0 14 0C19 10.8 16 6.8 12 2z"/></svg>
);

// Carátula de un municipio: degradado según la zona (Alta, Media, Baja Guajira)
function Caratula({ muni, label, className = '' }) {
  const idx = GJ.MUNICIPIOS.filter(m => m.zona === muni.zona).findIndex(m => m.id === muni.id);
  return (
    <div className={`pub-art pub-art-zona-${muni.zona} pub-art-hue-${idx % 4} ${className}`}>
      <GotaArte className="pub-art-drop" />
      {label && <div className="pub-art-label">{label}</div>}
    </div>
  );
}

// ── Estructura común ───────────────────────────────────────────────────────
function useScrolled(umbral = 36) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const on = () => setS(window.scrollY > umbral);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [umbral]);
  return s;
}

function PubNav({ titulo, atras, idioma, setIdioma }) {
  const scrolled = useScrolled();
  return (
    <header className={'pub-nav' + (scrolled ? ' is-scrolled' : '')}>
      <div className="pub-nav-left">
        {atras
          ? <a className="pub-navbtn" href={atras.href} onClick={atras.historial ? volverAtras : undefined}><IcoAtras />{atras.label}</a>
          : <a className="pub-brand" href="#/"><span className="pub-brand-mark"><IcoGota size={16} color="#fff" sw={2.4} /></span>{pubT('marca')}</a>}
      </div>
      <div className="pub-nav-title" aria-hidden="true">{titulo}</div>
      <div className="pub-nav-right">
        <div className="pub-lang" role="group" aria-label={pubT('idioma')}>
          <button aria-pressed={idioma === 'es'} onClick={() => setIdioma('es')}>{pubT('idiomaEs')}</button>
          <button aria-pressed={idioma === 'guc'} onClick={() => setIdioma('guc')}>{pubT('idiomaGuc')}</button>
        </div>
      </div>
    </header>
  );
}

function PubTabBar({ activa }) {
  const tabs = [
    ['inicio', '#/', IcoCasa, 'tabInicio'],
    ['cerca', '#/fuentes?cerca=1', IcoPin, 'tabCerca'],
    ['guia', '#/recomendaciones', IcoGuia, 'tabQueHacer'],
    ['reportar', '#/reportar', IcoBand, 'tabReportar'],
  ];
  return (
    <nav className="pub-tabbar" aria-label={pubT('navegacion')}>
      {tabs.map(([id, href, Ico, k]) => (
        <a key={id} className="pub-tab" href={href} aria-current={activa === id ? 'page' : undefined}>
          <Ico sw={activa === id ? 2.3 : 1.8} />{pubT(k)}
        </a>
      ))}
    </nav>
  );
}

function PubPie() {
  const fecha = mesAnio(ultimaFecha(pubFuentes().list));
  return (
    <footer className="pub-stack-sm" style={{ paddingTop: 8 }}>
      <p className="pub-foot">{pubT('pieDatos', { fecha })}</p>
      <a href="#/panel" style={{ fontSize: 15, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>{pubT('accesoInstitucional')}</a>
    </footer>
  );
}

// Miniatura cuadrada con la marca de estado (filas tipo pista)
function MiniEstado({ estado, size = 48 }) {
  return (
    <span className={'pub-thumb pub-soft-' + PUB_CLASE[estado]} style={{ width: size, height: size }}>
      <span className={'pub-mark pub-mark-' + PUB_CLASE[estado]} style={{ width: 16, height: 16 }} />
    </span>
  );
}

// ── Pantallas ──────────────────────────────────────────────────────────────
function PubInicio() {
  const { list } = pubFuentes();
  const conteo = {};
  list.forEach(p => { conteo[p.muni] = (conteo[p.muni] || 0) + 1; });
  const orden = { Alta: 0, Media: 1, Baja: 2 };
  const munis = GJ.MUNICIPIOS.filter(m => conteo[m.id])
    .slice().sort((a, b) => orden[a.zona] - orden[b.zona] || a.name.localeCompare(b.name, 'es'));

  return (
    <>
      <h1 className="pub-largetitle">{pubT('inicioTitulo')}</h1>

      <section className="pub-feature">
        <GotaArte className="pub-feature-drop" />
        <span className="pub-eyebrow">{pubT('destacadoEyebrow')}</span>
        <h2>{pubT('destacadoTitulo')}</h2>
        <p>{pubT('inicioIntro')}</p>
        <a className="pub-btn" href="#/fuentes?cerca=1"><IcoPin size={20} />{pubT('verCerca')}</a>
      </section>

      <section className="pub-stack">
        <div className="pub-section-head"><h2 className="pub-section-title">{pubT('eligeMunicipio')}</h2></div>
        <div className="pub-shelf" role="list">
          {munis.map(m => (
            <a key={m.id} role="listitem" className="pub-shelf-item" href={'#/municipio/' + m.id}>
              <Caratula muni={m} label={m.name} />
              <span className="pub-shelf-meta">
                <b>{pubT('zona_' + m.zona)}</b>
                <span>{pubT('nFuentes', { n: conteo[m.id].toLocaleString('es-CO') })}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="pub-stack">
        <div className="pub-section-head">
          <h2 className="pub-section-title">{pubT('queSignifica')}</h2>
          <a className="pub-section-link" href="#/recomendaciones">{pubT('masInfo')}</a>
        </div>
        <div className="pub-group">
          {['Apta', 'Precaución', 'Crítico'].map(e => (
            <div key={e} className="pub-row" style={{ '--sep-inset': '58px' }}>
              <span className={'pub-row-icon pub-bg-' + PUB_CLASE[e]}><IcoEstado estado={e} size={20} color="#fff" /></span>
              <span className="pub-row-main">
                <span className="pub-row-title" style={{ fontWeight: 600 }}>{pubT('estado_' + e)}</span>
                <span className="pub-row-sub">{pubT('estadoDesc_' + e)}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="pub-group">
        <a className="pub-row" href="#/recomendaciones" style={{ '--sep-inset': '58px' }}>
          <span className="pub-row-icon" style={{ background: 'var(--p-accent)' }}><IcoGuia size={20} color="#fff" /></span>
          <span className="pub-row-main"><span className="pub-row-title">{pubT('recTitulo')}</span></span>
          <IcoChev className="pub-chev" />
        </a>
        <a className="pub-row" href="#/reportar" style={{ '--sep-inset': '58px' }}>
          <span className="pub-row-icon" style={{ background: '#8e5bd8' }}><IcoBand size={20} color="#fff" /></span>
          <span className="pub-row-main"><span className="pub-row-title">{pubT('reportarProblema')}</span></span>
          <IcoChev className="pub-chev" />
        </a>
      </div>

      <PubPie />
    </>
  );
}

function PubMunicipio({ id }) {
  const fuentes = pubFuentes().list.filter(p => p.muni === id);
  const muni = GJ.MUNICIPIOS.find(m => m.id === id);
  if (!fuentes.length || !muni) {
    return <p className="pub-lead" style={{ paddingTop: 24 }}>{pubT('fuenteNoEncontrada')}</p>;
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
  if (c['Crítico'] / n >= 0.25) resumen = pubT('resumenCritico', { k: k(c['Crítico']), muni: muni.name });
  else if ((c['Crítico'] + c['Precaución']) / n >= 0.35) resumen = pubT('resumenCuidado', { k: k(c['Crítico'] + c['Precaución']), muni: muni.name });
  else resumen = pubT('resumenBien', { k: k(c['Apta']), muni: muni.name });

  return (
    <>
      <section className="pub-hero">
        <Caratula muni={muni} />
        <div className="pub-stack-sm" style={{ gap: 2 }}>
          <h1 className="pub-hero-title">{muni.name}</h1>
          <p className="pub-hero-sub">{pubT('zona_' + muni.zona)}</p>
          <p className="pub-small">{pubT('resumenMuni', { n: n.toLocaleString('es-CO'), fecha: mesAnio(ultimaFecha(fuentes)) })}</p>
        </div>
        <div className="pub-btn-row">
          <a className="pub-btn" href={'#/fuentes?m=' + id}><IcoPin size={20} />{pubT('verEnMapa')}</a>
          <a className="pub-btn pub-btn-tinted" href="#/recomendaciones"><IcoGuia size={20} />{pubT('queHacerCorto')}</a>
        </div>
      </section>

      <section className="pub-summary">
        <p>{resumen}</p>
        <div className="pub-bar" role="img" aria-label={pubT('distribucion', { a: pct[0], p: pct[1], c: pct[2] })}>
          <div style={{ flex: c['Apta'] }} /><div style={{ flex: c['Precaución'] }} /><div style={{ flex: c['Crítico'] }} />
        </div>
      </section>

      <section>
        <h2 className="pub-group-title">{pubT('porEstado')}</h2>
        <div className="pub-group pub-track">
          {['Apta', 'Precaución', 'Crítico'].map((e, i) => (
            <a key={e} className="pub-row" href={'#/fuentes?m=' + id + '&e=' + encodeURIComponent(e)}>
              <MiniEstado estado={e} />
              <span className="pub-row-main">
                <span className="pub-row-title">{pubT('estado_' + e)}</span>
                <span className="pub-row-sub">{pct[i]} %</span>
              </span>
              <span className="pub-row-value"><b>{c[e].toLocaleString('es-CO')}</b></span>
              <IcoChev className="pub-chev" />
            </a>
          ))}
        </div>
        <p className="pub-group-foot">{pubT('cadaFuente')}</p>
      </section>
    </>
  );
}

function PubMapa({ puntos, user }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const capaRef = useRef(null);

  useEffect(() => {
    if (!window.L || !ref.current) return;
    const oscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const map = L.map(ref.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false });
    L.tileLayer(`https://{s}.basemaps.cartocdn.com/${oscuro ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`, {
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
      const icon = L.divIcon({ className: '', html: '<span class="pub-mk-user"></span>', iconSize: [22, 22], iconAnchor: [11, 11] });
      L.marker([user.lat, user.lon], { icon, title: pubT('tu'), keyboard: false, zIndexOffset: 1000 }).addTo(capa);
      bounds.push([user.lat, user.lon]);
    }
    if (bounds.length) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
  }, [puntos, user]);

  return <div ref={ref} className="pub-map" role="region" aria-label={pubT('mapaEtiqueta')} />;
}

function ListaMunicipios({ destino }) {
  const munis = GJ.MUNICIPIOS.slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return (
    <div className="pub-group pub-track" style={{ '--sep-inset': '68px' }}>
      {munis.map(m => (
        <a key={m.id} className="pub-row" href={destino(m.id)}>
          <span style={{ width: 40 }}><Caratula muni={m} /></span>
          <span className="pub-row-main"><span className="pub-row-title">{m.name}</span><span className="pub-row-sub">{pubT('zona_' + m.zona)}</span></span>
          <IcoChev className="pub-chev" />
        </a>
      ))}
    </div>
  );
}

function PubFuentes({ query }) {
  const muni = query.m || null;
  const cerca = query.cerca === '1' || !muni;
  const [pos, setPos] = useState(cerca ? posGuardada() : null);
  const [geo, setGeo] = useState(cerca && !posGuardada() ? 'pidiendo' : 'ok');
  const [filtro, setFiltro] = useState(PUB_CLASE[query.e] ? query.e : null);
  const [limite, setLimite] = useState(12);

  function ubicar() {
    setGeo('pidiendo');
    pedirUbicacion().then(p => { setPos(p); setGeo('ok'); }).catch(() => setGeo('negada'));
  }
  useEffect(() => { if (cerca && !pos) ubicar(); }, [cerca]);
  useEffect(() => { setLimite(12); }, [filtro, muni, cerca]);

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

  if (!muni && !pos) {
    return (
      <>
        <h1 className="pub-largetitle">{pubT('fuentesCerca')}</h1>
        {geo === 'pidiendo'
          ? <p className="pub-lead" role="status">{pubT('pidiendoUbicacion')}</p>
          : <>
              <div className="pub-callout pub-callout-warn" role="alert"><IcoCuid size={22} color="var(--p-warn-txt)" /><span>{pubT('ubicacionNegada')}</span></div>
              <button className="pub-btn pub-btn-tinted" onClick={ubicar}><IcoPin size={20} />{pubT('reintentar')}</button>
              <section>
                <h2 className="pub-group-title">{pubT('municipios')}</h2>
                <ListaMunicipios destino={id => '#/fuentes?m=' + id} />
              </section>
            </>}
      </>
    );
  }

  const aptaCercana = pos ? base.find(p => p.estado === 'Apta') : null;
  const masCercana = pos ? base[0] : null;

  return (
    <>
      <h1 className="pub-largetitle">{titulo}</h1>

      {pos && masCercana && masCercana.km > 25 && (
        <div className="pub-callout pub-callout-warn"><IcoCuid size={22} color="var(--p-warn-txt)" /><span>{pubT('lejos', { km: fmtKm(masCercana.km) })}</span></div>
      )}
      {pos && (aptaCercana
        ? <div className="pub-callout pub-callout-ok"><IcoBien size={22} color="var(--p-ok-txt)" /><span>{pubT('aptaMasCercana', { km: fmtKm(aptaCercana.km) })}</span></div>
        : <div className="pub-callout pub-callout-warn"><IcoCuid size={22} color="var(--p-warn-txt)" /><span>{pubT('sinAptaCerca')}</span></div>)}
      {!pos && (
        <button className="pub-btn pub-btn-tinted" onClick={ubicar}>
          <IcoPin size={20} />{geo === 'pidiendo' ? pubT('pidiendoUbicacion') : pubT('usarUbicacion')}
        </button>
      )}
      {geo === 'negada' && muni && (
        <div className="pub-callout pub-callout-warn" role="alert"><IcoCuid size={22} color="var(--p-warn-txt)" /><span>{pubT('ubicacionNegada')}</span></div>
      )}

      <PubMapa puntos={visibles} user={pos} />

      <div className="pub-seg" role="group" aria-label={pubT('filtrar')}>
        <button aria-pressed={filtro === null} onClick={() => setFiltro(null)}>{pubT('todas')}</button>
        {['Apta', 'Precaución', 'Crítico'].map(e => (
          <button key={e} aria-pressed={filtro === e} onClick={() => setFiltro(e)}>
            <span className={'pub-mark pub-mark-' + PUB_CLASE[e]} />{pubT('filtro_' + e)}
          </button>
        ))}
      </div>

      {visibles.length === 0
        ? <p className="pub-lead">{pubT('ningunaFiltro')}</p>
        : <ul className="pub-group pub-track" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {visibles.slice(0, limite).map(p => (
              <li key={p.id} className="pub-row" style={{ padding: 0 }}>
                <a className="pub-row" href={'#/fuente/' + encodeURIComponent(p.id)} style={{ flex: 1 }}>
                  <MiniEstado estado={p.estado} />
                  <span className="pub-row-main">
                    <span className="pub-row-title">{p.tipo}{p.km != null ? ' · ' + pubT('aKm', { km: fmtKm(p.km) }) : ''}</span>
                    <span className={'pub-row-sub pub-txt-' + PUB_CLASE[p.estado]}>{pubT('estado_' + p.estado)}</span>
                    {p.km == null && <span className="pub-row-sub" style={{ fontSize: 13 }}>{p.id}</span>}
                  </span>
                  <IcoChev className="pub-chev" />
                </a>
              </li>
            ))}
          </ul>}
      {visibles.length > limite && (
        <button className="pub-btn pub-btn-tinted pub-btn-block" onClick={() => setLimite(limite + 12)}>{pubT('mostrarMas')}</button>
      )}
    </>
  );
}

function PubFuente({ id }) {
  const p = pubFuentes().porId[id];
  if (!p) return <p className="pub-lead" style={{ paddingTop: 24 }}>{pubT('fuenteNoEncontrada')}</p>;
  const pos = posGuardada();
  const km = pos ? distanciaKm(pos, p) : null;
  const clase = PUB_CLASE[p.estado];
  const phNormal = p.ph >= GJ.UMBRALES.precaucion.phMin && p.ph <= GJ.UMBRALES.precaucion.phMax;
  const hacer = [
    [IcoVaso, 'hacerBeber', 'beber'],
    [IcoTete, 'hacerBebes', 'bebes'],
    [IcoLava, 'hacerLavar', 'lavar'],
  ];

  return (
    <>
      <section className="pub-stack-sm" style={{ gap: 2, paddingTop: 6 }}>
        <span className="pub-eyebrow">{p.muniName}</span>
        <h1 className="pub-largetitle" style={{ paddingTop: 0 }}>{p.tipo}</h1>
        <p className="pub-small">{km != null ? pubT('deTi', { km: fmtKm(km) }) + ' · ' : ''}{p.id}</p>
      </section>

      <section className={'pub-status pub-status-' + clase}>
        <div className="pub-status-title"><IcoEstado estado={p.estado} size={30} color="#fff" />{pubT('estado_' + p.estado)}</div>
        <p>{motivosPublicos(p)}</p>
      </section>

      {!p.activo && <div className="pub-callout pub-callout-info"><IcoCuid size={22} color="var(--p-accent)" /><span>{pubT('inactiva')}</span></div>}

      <section>
        <h2 className="pub-group-title">{pubT('queHacerEsta')}</h2>
        <div className="pub-group">
          {hacer.map(([Ico, t, k]) => (
            <div key={k} className="pub-row" style={{ '--sep-inset': '58px', alignItems: 'flex-start' }}>
              <span className="pub-row-icon" style={{ background: 'var(--p-accent)', marginTop: 2 }}><Ico size={18} color="#fff" /></span>
              <span className="pub-row-main">
                <span className="pub-row-title" style={{ fontWeight: 600 }}>{pubT(t)}</span>
                <span className="pub-row-sub" style={{ color: 'var(--p-text-2)' }}>{pubT('hacer_' + p.estado + '_' + k)}</span>
              </span>
            </div>
          ))}
          <a className="pub-row" href="#/recomendaciones" style={{ '--sep-inset': '16px' }}>
            <span className="pub-row-main"><span className="pub-row-title" style={{ color: 'var(--p-accent)' }}>{pubT('verTodasRec').replace(' →', '')}</span></span>
            <IcoChev className="pub-chev" />
          </a>
        </div>
      </section>

      <section>
        <details className="pub-details">
          <summary>{pubT('valoresMedidos')}<IcoChev className="pub-chev" /></summary>
          <div>
            <div className="pub-row"><span className="pub-row-main"><span className="pub-row-title">{pubT('valCond')}</span></span><span className="pub-row-value">{GJ.fmtMiles(p.cond)} µS/cm</span></div>
            <div className="pub-row"><span className="pub-row-main"><span className="pub-row-title">{pubT('valPh')}</span></span><span className="pub-row-value">{String(p.ph).replace('.', ',')}{phNormal ? ' · ' + pubT('normal') : ''}</span></div>
            <div className="pub-row"><span className="pub-row-main"><span className="pub-row-title">{pubT('valSal')}</span></span><span className="pub-row-value">{p.sal != null ? String(p.sal).replace('.', ',') + ' mS/cm' : pubT('sinDato')}</span></div>
            <div className="pub-row"><span className="pub-row-main"><span className="pub-row-title">{pubT('valTemp')}</span></span><span className="pub-row-value">{p.temp != null ? String(p.temp).replace('.', ',') + ' °C' : pubT('sinDato')}</span></div>
          </div>
        </details>
        <p className="pub-group-foot">{pubT('medidoEl', { fecha: fechaLarga(p.fecha), temporada: p.temporada === 'Seca' ? 'seca' : 'de lluvias' })}</p>
      </section>

      <a className="pub-btn pub-btn-tinted pub-btn-block" href={'#/reportar?f=' + encodeURIComponent(p.id)}><IcoBand size={20} />{pubT('reportarEsta')}</a>
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
      <h1 className="pub-largetitle">{pubT('recTitulo')}</h1>

      <section className="pub-feature">
        <GotaArte className="pub-feature-drop" />
        <span className="pub-eyebrow">{pubT('recGeneralTitulo')}</span>
        <h2>{pubT('recGeneralH')}</h2>
        <p>{pubT('recGeneralP')}</p>
        <p>{pubT('recGeneral2')}</p>
      </section>

      {bloques.map(([estado, filas]) => (
        <section key={estado}>
          <h2 className="pub-group-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={'pub-mark pub-mark-' + PUB_CLASE[estado]} style={{ width: 11, height: 11, borderWidth: 1.5 }} />{pubT('estado_' + estado)}
          </h2>
          <div className="pub-group">
            {filas.map(([a, b]) => (
              <div key={a} className="pub-row">
                <span className="pub-row-main"><span className="pub-row-title">{pubT(a)}</span></span>
                <span className="pub-row-value" style={{ color: b === 'recNo' ? 'var(--p-bad-txt)' : 'var(--p-text)', fontWeight: 600, maxWidth: '55%' }}>{pubT(b)}</span>
              </div>
            ))}
          </div>
          {estado === 'Crítico' && <p className="pub-group-foot">{pubT('recHervirSal')}</p>}
        </section>
      ))}

      <div className="pub-callout pub-callout-info"><IcoCruz size={22} color="var(--p-accent)" /><span>{pubT('recSalud')}</span></div>
    </>
  );
}

function PubReportar({ query }) {
  const p = query.f ? pubFuentes().porId[query.f] : null;
  const [marcadas, setMarcadas] = useState({});
  const opciones = ['olor', 'color', 'salado', 'enfermo', 'seca', 'otro'];

  return (
    <>
      <section className="pub-stack-sm">
        <h1 className="pub-largetitle">{pubT('repTitulo')}</h1>
        <p className="pub-lead">{pubT('repIntro')}</p>
      </section>

      <form className="pub-stack" style={{ gap: 26 }} onSubmit={e => e.preventDefault()}>
        <section>
          <h2 className="pub-group-title">{pubT('repFuente')}</h2>
          <div className="pub-group">
            {p
              ? <div className="pub-row">
                  <MiniEstado estado={p.estado} size={40} />
                  <span className="pub-row-main"><span className="pub-row-title">{p.tipo} · {p.muniName}</span><span className="pub-row-sub">{p.id}</span></span>
                  <a href="#/fuentes?cerca=1" style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}>{pubT('repCambiar')}</a>
                </div>
              : <a className="pub-row" href="#/fuentes?cerca=1">
                  <span className="pub-row-main"><span className="pub-row-title">{pubT('repSinFuente')}</span></span>
                  <span style={{ color: 'var(--p-accent)' }}>{pubT('repElegir')}</span>
                  <IcoChev className="pub-chev" />
                </a>}
          </div>
        </section>

        <fieldset style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
          <legend className="pub-group-title" style={{ padding: '0 16px 6px' }}>{pubT('repQueNotaste')}</legend>
          <div className="pub-group">
            {opciones.map(o => (
              <label key={o} className="pub-row pub-check-row">
                <input type="checkbox" checked={!!marcadas[o]} onChange={() => setMarcadas({ ...marcadas, [o]: !marcadas[o] })} />
                <span className="pub-row-main"><span className="pub-row-title">{pubT('rep_' + o)}</span></span>
                <IcoTick className="pub-tick" />
              </label>
            ))}
          </div>
        </fieldset>

        <section>
          <label htmlFor="rep-detalle" className="pub-group-title" style={{ display: 'block' }}>{pubT('repDetalle')} {pubT('opcional')}</label>
          <div className="pub-group">
            <textarea id="rep-detalle" className="pub-input" rows="4" maxLength={1000} placeholder={pubT('repDetallePh')} />
          </div>
        </section>

        <section>
          <label htmlFor="rep-tel" className="pub-group-title" style={{ display: 'block' }}>{pubT('repTelefono')} {pubT('opcional')}</label>
          <div className="pub-group">
            <input id="rep-tel" className="pub-input" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="300 000 0000" />
          </div>
        </section>

        <div className="pub-stack" style={{ gap: 10 }}>
          <button type="submit" className="pub-btn pub-btn-block" disabled aria-describedby="rep-aviso">{pubT('repEnviar')}</button>
          <p className="pub-foot" id="rep-aviso" style={{ textAlign: 'center', padding: '0 12px' }}>{pubT('repNoDisponible')}</p>
        </div>
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
  let body, tab = 'inicio', titulo = pubT('tabInicio'), atras = null;
  if (!a) {
    body = <PubInicio />;
  } else if (a === 'municipio') {
    body = <PubMunicipio id={b} />;
    titulo = muniNombre(b); atras = { href: '#/', label: pubT('tabInicio') };
  } else if (a === 'fuentes') {
    body = <PubFuentes key={ruta.path + JSON.stringify(ruta.query)} query={ruta.query} />;
    tab = 'cerca';
    titulo = ruta.query.m ? muniNombre(ruta.query.m) : pubT('tabCerca');
    if (ruta.query.m) atras = { href: '#/municipio/' + ruta.query.m, label: muniNombre(ruta.query.m) };
  } else if (a === 'fuente') {
    const p = pubFuentes().porId[decodeURIComponent(b || '')];
    body = <PubFuente id={decodeURIComponent(b || '')} />;
    tab = 'cerca'; titulo = p ? p.tipo : ''; atras = { href: '#/fuentes?cerca=1', label: pubT('volver').replace('← ', ''), historial: true };
  } else if (a === 'recomendaciones') {
    body = <PubRecomendaciones />; tab = 'guia'; titulo = pubT('tabQueHacer');
  } else if (a === 'reportar') {
    body = <PubReportar query={ruta.query} />; tab = 'reportar'; titulo = pubT('tabReportar');
  } else {
    body = <PubInicio />;
  }

  const sinTraduccion = idioma === 'guc' && Object.keys(PUB_TEXTOS.guc).length === 0;

  return (
    <div className="pub pub-grouped-bg">
      <PubNav titulo={titulo} atras={atras} idioma={idioma} setIdioma={setIdioma} />
      {sinTraduccion && <div className="pub-notice-lang" role="status">{pubT('gucPendiente')}</div>}
      <main className="pub-main">{body}</main>
      <PubTabBar activa={tab} />
    </div>
  );
}

window.PublicApp = PublicApp;
window.useRuta = useRuta;
