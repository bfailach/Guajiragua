// Mapa de La Guajira con Leaflet + tiles reales + POLÍGONOS de los municipios.
// Cargamos un GeoJSON público de Colombia (TakaraDasein/caticoa3) y filtramos
// a los municipios del departamento de La Guajira (código DANE = 44xxx).

// Mapa: id interno → posible nombre en el GeoJSON (UPPERCASE)
const NAME_MAP = {
  URI: ['URIBIA'],
  MAN: ['MANAURE'],
  MAI: ['MAICAO'],
  RIO: ['RIOHACHA'],
  ALB: ['ALBANIA'],
  DIB: ['DIBULLA'],
  HAT: ['HATONUEVO'],
  BAR: ['BARRANCAS'],
  SJC: ['SAN JUAN DEL CESAR'],
  FON: ['FONSECA'],
  DIS: ['DISTRACCIÓN', 'DISTRACCION'],
};

function muniIdFromFeature(feat) {
  const p = feat.properties || {};
  const name = String(p.NOMBRE_MPI || p.NOMBRE || p.MPIO_CNMBR || p.name || p.NAME || '').toUpperCase().trim();
  const code = String(p.MPIO_CCNCT || p.MPIO || p.codigo || p.code || p.id || '').padStart(5, '0');
  for (const [id, names] of Object.entries(NAME_MAP)) {
    if (names.includes(name)) return id;
  }
  // Fallback: match by DANE code if name didn't match
  const CODE_MAP = {
    '44847':'URI', '44560':'MAN', '44430':'MAI', '44001':'RIO',
    '44035':'ALB', '44090':'DIB', '44378':'HAT', '44078':'BAR',
    '44650':'SJC', '44279':'FON', '44098':'DIS',
  };
  return CODE_MAP[code] || null;
}

function isGuajira(feat) {
  const p = feat.properties || {};
  const dpt = String(p.DPTO_CNMBR || p.dpt || p.departamento || p.DPTO || p.NOMBRE_DPT || '').toUpperCase().trim();
  const code = String(p.MPIO_CCNCT || p.MPIO || p.codigo || p.code || p.id || '');
  if (dpt.includes('GUAJIRA')) return true;
  if (code.startsWith('44')) return true;
  return false;
}

function colorForMuni(agg, filter) {
  if (!agg) return { fill: '#cccccc', op: 0.25 };
  if (filter === 'estado') {
    const t = agg.criticos / Math.max(agg.n, 1);
    if (t > 0.18) return { fill: '#b5403d', op: 0.70 };
    if (t > 0.10) return { fill: '#b5403d', op: 0.40 };
    return { fill: '#2e8b57', op: 0.55 };
  }
  if (filter === 'sal') {
    const t = Math.min(1, agg.sal / 3.5);
    return { fill: '#c97a2b', op: 0.20 + t * 0.55 };
  }
  if (filter === 'cond') {
    const t = Math.min(1, agg.cond / 3500);
    return { fill: '#2c5fa6', op: 0.20 + t * 0.55 };
  }
  return { fill: '#888888', op: 0.4 };
}

function tooltipHTML(m, a) {
  return `
    <div class="tt-name">${m.name} · <span style="color:#888">${a.zona} Guajira</span></div>
    <div class="tt-row"><span>Puntos</span><b>${a.n}</b></div>
    <div class="tt-row"><span>Activos</span><b>${a.activos}</b></div>
    <div class="tt-row"><span>pH promedio</span><b>${GJ.fmtNum(a.ph, 2)}</b></div>
    <div class="tt-row"><span>Conductividad</span><b>${GJ.fmtMiles(a.cond)} µS/cm</b></div>
    <div class="tt-row"><span>Salinidad</span><b>${GJ.fmtNum(a.sal, 2)} mS/cm</b></div>
    <div class="tt-row"><span>Críticos</span><b style="color:${a.criticos > 20 ? '#b5403d' : '#0f0f0f'}">${a.criticos}</b></div>
  `;
}

// Candidate GeoJSON sources (try in order)
const GEOJSON_URLS = [
  'https://raw.githubusercontent.com/caticoa3/colombia_mapa/master/colombia_municipios.geojson',
  'https://raw.githubusercontent.com/caticoa3/colombia_mapa/master/mpio.geojson',
  'https://raw.githubusercontent.com/TakaraDasein/JSON-Colombia/main/colombia-por-municipios.geojson',
];

async function fetchFirst(urls) {
  for (const url of urls) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json();
      return { url, data: j };
    } catch (e) { /* try next */ }
  }
  return null;
}

function MapGuajira({ selected, onSelect, filter = 'estado', temporada }) {
  const wrapRef = useRef(null);
  const mapRef = useRef(null);
  const polyLayerRef = useRef({});
  const labelLayerRef = useRef({});
  const selectedFromRef = useRef(selected);
  const [status, setStatus] = useState('loading'); // loading | polygons | circles | error

  const aggByMuni = useMemo(() => {
    const m = {};
    GJ.MUNI_AGG.forEach(a => { m[a.id] = a; });
    return m;
  }, []);

  // Init map once
  useEffect(() => {
    if (mapRef.current) return;
    if (!window.L) { setStatus('error'); return; }

    const map = L.map(wrapRef.current, {
      center: [11.45, -72.55],
      zoom: 8,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OSM · CARTO',
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    // Load GeoJSON polygons asynchronously
    (async () => {
      const fetched = await fetchFirst(GEOJSON_URLS);
      if (!fetched) {
        addCircleFallback(map, aggByMuni, onSelect, selectedFromRef, polyLayerRef, labelLayerRef, filter);
        setStatus('circles');
        return;
      }
      const guajiraFeatures = (fetched.data.features || []).filter(isGuajira);
      if (guajiraFeatures.length === 0) {
        addCircleFallback(map, aggByMuni, onSelect, selectedFromRef, polyLayerRef, labelLayerRef, filter);
        setStatus('circles');
        return;
      }
      addPolygons(map, guajiraFeatures, aggByMuni, onSelect, selectedFromRef, polyLayerRef, labelLayerRef, filter);
      // Fit map bounds to the polygons
      const allBounds = Object.values(polyLayerRef.current).reduce((b, layer) => {
        const lb = layer.getBounds && layer.getBounds();
        return lb ? (b ? b.extend(lb) : lb) : b;
      }, null);
      if (allBounds) map.fitBounds(allBounds, { padding: [10, 10], animate: false });
      setStatus('polygons');
    })();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => { selectedFromRef.current = selected; }, [selected]);

  // Re-style when filter/selected changes
  useEffect(() => {
    if (!mapRef.current) return;
    Object.entries(polyLayerRef.current).forEach(([id, layer]) => {
      const a = aggByMuni[id];
      const { fill, op } = colorForMuni(a, filter);
      const isSel = selected === id;
      if (layer.setStyle) {
        layer.setStyle({
          fillColor: fill,
          fillOpacity: op,
          color: isSel ? '#0f0f0f' : '#404040',
          weight: isSel ? 2.4 : 0.8,
          opacity: 1,
        });
      }
      if (layer.setTooltipContent && a) {
        layer.setTooltipContent(tooltipHTML({ name: a.name }, a));
      }
      if (isSel && layer.bringToFront) layer.bringToFront();
    });
  }, [filter, selected, aggByMuni, status]);

  return (
    <div className="map-wrap" ref={wrapRef}>
      {status === 'loading' && (
        <div style={statusBoxStyle()}>Cargando contornos municipales…</div>
      )}
      {status === 'circles' && (
        <div style={statusBoxStyle()}>Sin contornos GeoJSON · usando posiciones</div>
      )}
      {status === 'error' && (
        <div style={statusBoxStyle()}>Error de inicialización del mapa</div>
      )}
    </div>
  );
}

function statusBoxStyle() {
  return {
    position:'absolute', top:8, right:8, zIndex:1000,
    background:'#ffffff', border:'1px solid #cccccc', borderRadius:3,
    padding:'6px 10px', fontFamily:'SF Mono, ui-monospace, JetBrains Mono, Menlo, Monaco, monospace',
    fontSize:10, color:'#888', letterSpacing:'0.06em',
  };
}

function addPolygons(map, features, aggByMuni, onSelect, selectedFromRef, polyLayerRef, labelLayerRef, filter) {
  features.forEach(feat => {
    const id = muniIdFromFeature(feat);
    if (!id) return;
    const agg = aggByMuni[id];
    const { fill, op } = colorForMuni(agg, filter);
    const layer = L.geoJSON(feat, {
      style: {
        fillColor: fill,
        fillOpacity: op,
        color: '#404040',
        weight: 0.8,
        opacity: 1,
      },
      onEachFeature: (f, lyr) => {
        if (agg) {
          lyr.bindTooltip(tooltipHTML({ name: agg.name }, agg), { sticky: true, direction: 'top' });
        }
        lyr.on('click', () => onSelect(selectedFromRef.current === id ? null : id));
        lyr.on('mouseover', () => lyr.setStyle({ weight: 1.6, color: '#0f0f0f' }));
        lyr.on('mouseout',  () => {
          const sel = selectedFromRef.current === id;
          lyr.setStyle({ weight: sel ? 2.4 : 0.8, color: sel ? '#0f0f0f' : '#404040' });
        });
      },
    }).addTo(map);
    polyLayerRef.current[id] = layer;

    // Permanent label at centroid (approximate)
    if (agg) {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      const labelMarker = L.marker(center, {
        icon: L.divIcon({
          className: 'muni-label-tip',
          html: `<span class="muni-label-inner">${agg.name.toUpperCase()}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
        interactive: false,
        keyboard: false,
      }).addTo(map);
      labelLayerRef.current[id] = labelMarker;
    }
  });
}

function addCircleFallback(map, aggByMuni, onSelect, selectedFromRef, polyLayerRef, labelLayerRef, filter) {
  GJ.MUNICIPIOS.forEach(m => {
    const a = aggByMuni[m.id];
    const r = Math.max(10, Math.sqrt(a?.n || 1) * 1.7);
    const { fill, op } = colorForMuni(a, filter);
    const circle = L.circleMarker([m.lat, m.lon], {
      radius: r,
      fillColor: fill,
      fillOpacity: op,
      color: '#0f0f0f',
      weight: 1,
      opacity: 0.85,
    });
    circle.bindTooltip(tooltipHTML(m, a), { sticky: true, direction: 'top', offset: [0, -r] });
    circle.on('click', () => onSelect(selectedFromRef.current === m.id ? null : m.id));
    circle.addTo(map);
    polyLayerRef.current[m.id] = circle;
  });
}

Object.assign(window, { MapGuajira });
