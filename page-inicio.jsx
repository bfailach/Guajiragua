// Página de inicio — información para los habitantes de La Guajira
//
// Explica en lenguaje sencillo el estado del agua por municipio y de las
// fuentes cercanas, y qué hacer según el estado. Usa la misma regla de
// clasificación que el resto del sistema (GJ.clasificarEstado / api/calidad.py).

const INI_COLOR = { 'Apta': '#2e8b57', 'Precaución': '#c97a2b', 'Crítico': '#b5403d' };
const INI_TXT   = { 'Apta': '#1d6b3f', 'Precaución': '#8a5118', 'Crítico': '#9a2f2c' };
const INI_SIMPLE = {
  'Apta':       'Sin problemas detectados',
  'Precaución': 'Usar con cuidado',
  'Crítico':    'No apta para beber',
};
const INI_DESC = {
  'Apta':       'La sal y la acidez están dentro de lo aceptable.',
  'Precaución': 'El agua está algo salada o su acidez está fuera de lo normal.',
  'Crítico':    'El agua tiene demasiada sal o acidez para tomarla.',
};
const INI_USOS = {
  'Apta':       [['Beber', 'Sí, después de hervirla'], ['Cocinar', 'Sí'], ['Teteros de bebé', 'Sí, con agua hervida'], ['Bañarse y lavar', 'Sí']],
  'Precaución': [['Beber', 'Mejor otra fuente sin problemas'], ['Cocinar', 'Mejor otra fuente sin problemas'], ['Teteros de bebé', 'No'], ['Bañarse y lavar', 'Sí']],
  'Crítico':    [['Beber', 'No'], ['Cocinar', 'No'], ['Teteros de bebé', 'No'], ['Bañarse y lavar', 'Sí']],
};
const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

// ── Datos ────────────────────────────────────────────────────────────────────
// Una fuente = un lugar de captación; se toma su medición más reciente.
let _iniCache = { src: null, list: [] };
function fuentesActuales() {
  if (_iniCache.src === GJ.ALL_POINTS) return _iniCache.list;
  const porLugar = new Map();
  GJ.ALL_POINTS.forEach(p => {
    const k = p.lat + '|' + p.lon + '|' + p.tipo;
    const prev = porLugar.get(k);
    if (!prev || p.fecha > prev.fecha) porLugar.set(k, p);
  });
  _iniCache = { src: GJ.ALL_POINTS, list: Array.from(porLugar.values()) };
  return _iniCache.list;
}

const iniMesAnio = iso => { if (!iso) return ''; const [y, m] = iso.split('-').map(Number); return `${MESES_ES[m - 1]} de ${y}`; };
const iniFecha   = iso => { if (!iso) return ''; const [y, m, d] = iso.split('-').map(Number); return `${d} de ${MESES_ES[m - 1]} de ${y}`; };
const iniUltima  = list => list.reduce((max, p) => (p.fecha > max ? p.fecha : max), '');

function iniKm(a, b) {
  const R = 6371, rad = x => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function iniFmtKm(km) {
  if (km < 0.1) return 'menos de 100 m';
  if (km < 10) return km.toFixed(1).replace('.', ',') + ' km';
  return Math.round(km).toLocaleString('es-CO') + ' km';
}

// Explicación en lenguaje sencillo, con los mismos umbrales que la regla
function iniMotivo(p) {
  const c = GJ.UMBRALES.critico, w = GJ.UMBRALES.precaucion, m = [];
  const has = v => v != null && !isNaN(v);
  if ((has(p.cond) && p.cond > c.condMax) || (has(p.sal) && p.sal > c.salMax)) m.push('tiene demasiada sal para beberla');
  else if (has(p.cond) && p.cond > w.condMax) m.push('está algo salada: tiene más sal de la recomendada para beberla todos los días');
  if (has(p.ph) && p.ph < c.phMin) m.push('es demasiado ácida');
  else if (has(p.ph) && p.ph < w.phMin) m.push('es algo ácida');
  else if (has(p.ph) && p.ph > c.phMax) m.push('es demasiado alcalina');
  else if (has(p.ph) && p.ph > w.phMax) m.push('es algo alcalina');
  return m.length ? 'El agua ' + m.join(' y ') + '.' : 'La sal y la acidez están dentro de lo aceptable.';
}

// Porcentajes enteros que suman 100 (mayor residuo)
function iniPct(counts, total) {
  const crudos = counts.map(c => 100 * c / Math.max(total, 1));
  const pct = crudos.map(Math.floor);
  let resto = total ? 100 - pct.reduce((a, b) => a + b, 0) : 0;
  crudos.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => { if (resto > 0) { pct[i]++; resto--; } });
  return pct;
}

// ── Componentes ──────────────────────────────────────────────────────────────
const MonoLabel = ({ children, style }) => (
  <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', ...style }}>{children}</span>
);

function EstadoTag({ estado }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: INI_COLOR[estado], flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 500, color: INI_TXT[estado] }}>{INI_SIMPLE[estado]}</span>
    </span>
  );
}

function ResumenMunicipio({ muniId }) {
  const fuentes = fuentesActuales().filter(p => p.muni === muniId);
  const muni = GJ.MUNICIPIOS.find(m => m.id === muniId);
  const n = fuentes.length;
  const c = { 'Apta': 0, 'Precaución': 0, 'Crítico': 0 };
  fuentes.forEach(p => { c[p.estado]++; });
  const pct = iniPct([c['Apta'], c['Precaución'], c['Crítico']], n);
  const k = x => Math.max(1, Math.round(10 * x / Math.max(n, 1)));

  let frase;
  if (c['Crítico'] / n >= 0.25) frase = `${k(c['Crítico'])} de cada 10 fuentes de ${muni.name} no son aptas para beber.`;
  else if ((c['Crítico'] + c['Precaución']) / n >= 0.35) frase = `En ${muni.name}, ${k(c['Crítico'] + c['Precaución'])} de cada 10 fuentes requieren cuidado o no son aptas para beber.`;
  else frase = `En ${muni.name}, ${k(c['Apta'])} de cada 10 fuentes no muestran problemas.`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.3, color: 'var(--text)' }}>{frase}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
          {n.toLocaleString('es-CO')} FUENTES REVISADAS · MEDICIÓN DE {iniMesAnio(iniUltima(fuentes)).toUpperCase()}
        </div>
      </div>
      <StackBar apta={c['Apta']} precaucion={c['Precaución']} critico={c['Crítico']} height={14} />
      <div style={{ display: 'grid', gap: 10 }}>
        {['Apta', 'Precaución', 'Crítico'].map((e, i) => (
          <div key={e} style={{ display: 'grid', gridTemplateColumns: '1fr auto 52px', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <EstadoTag estado={e} />
            <span className="tabular" style={{ fontSize: 15, fontWeight: 500 }}>{c[e].toLocaleString('es-CO')}</span>
            <span className="mono tabular" style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>{pct[i]} %</span>
          </div>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
        Cada fuente es distinta: una puede estar bien y la de al lado no. Busca la que usas en "Fuentes cerca de ti".
      </p>
    </div>
  );
}

function DetalleFuente({ p, km, onClose }) {
  const phNormal = p.ph >= GJ.UMBRALES.precaucion.phMin && p.ph <= GJ.UMBRALES.precaucion.phMax;
  return (
    <Modal title={`${p.tipo} · ${p.muniName}`} crumb={`FUENTE ${p.id}${km != null ? ' · A ' + iniFmtKm(km).toUpperCase() : ''}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ padding: '14px 16px', border: `1px solid ${INI_COLOR[p.estado]}`, borderLeftWidth: 4, borderRadius: 3, background: 'var(--surface-2)' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: INI_TXT[p.estado], marginBottom: 6 }}>{INI_SIMPLE[p.estado]}</div>
          <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text)' }}>{iniMotivo(p)}</div>
        </div>

        <div>
          <MonoLabel>Qué hacer con esta agua</MonoLabel>
          <div style={{ marginTop: 8 }}>
            {INI_USOS[p.estado].map(([uso, resp]) => (
              <div key={uso} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-2)' }}>{uso}</span>
                <b style={{ fontWeight: 500, textAlign: 'right', color: resp === 'No' ? '#9a2f2c' : 'var(--text)' }}>{resp}</b>
              </div>
            ))}
          </div>
          {p.estado !== 'Apta' && (
            <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>Hervir el agua no le quita la sal: al hervir, queda todavía más salada.</p>
          )}
        </div>

        <div>
          <MonoLabel>Valores medidos</MonoLabel>
          <div className="mono tabular" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', marginTop: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--text-3)' }}>CONDUCTIVIDAD (SAL)</span><span>{GJ.fmtMiles(p.cond)} µS/cm</span>
            <span style={{ color: 'var(--text-3)' }}>ACIDEZ (pH)</span><span>{p.ph}{phNormal ? ' · normal' : ''}</span>
            <span style={{ color: 'var(--text-3)' }}>SALINIDAD</span><span>{p.sal != null ? p.sal + ' mS/cm' : '—'}</span>
            <span style={{ color: 'var(--text-3)' }}>TEMPERATURA</span><span>{p.temp != null ? p.temp + ' °C' : '—'}</span>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-3)' }}>
            Medido el {iniFecha(p.fecha)}, en época {p.temporada === 'Seca' ? 'seca' : 'de lluvias'}. El agua puede cambiar con las lluvias.
            {!p.activo && ' Esta fuente figura como fuera de uso en el último registro.'}
          </p>
        </div>
      </div>
    </Modal>
  );
}

function FuentesCercanas() {
  const [pos, setPos] = useState(() => { try { return JSON.parse(sessionStorage.getItem('gj_pos') || 'null'); } catch (e) { return null; } });
  const [estado, setEstado] = useState('inicial');   // inicial | pidiendo | negada | no-disponible
  const [limite, setLimite] = useState(6);
  const [detalle, setDetalle] = useState(null);

  function ubicar() {
    if (!navigator.geolocation) { setEstado('no-disponible'); return; }
    setEstado('pidiendo');
    navigator.geolocation.getCurrentPosition(
      r => {
        const p = { lat: r.coords.latitude, lon: r.coords.longitude };
        try { sessionStorage.setItem('gj_pos', JSON.stringify(p)); } catch (e) {}
        setPos(p); setEstado('inicial');
      },
      () => setEstado('negada'),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  }

  const cercanas = useMemo(() => {
    if (!pos) return [];
    return fuentesActuales().map(p => ({ p, km: iniKm(pos, p) })).sort((a, b) => a.km - b.km);
  }, [pos]);
  const aptaCercana = cercanas.find(x => x.p.estado === 'Apta');

  return (
    <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SecTitle title="Fuentes cerca de ti" sub={pos ? 'ORDENADAS POR DISTANCIA' : null}
                right={pos && <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={ubicar}>Actualizar ubicación</button>} />

      {!pos && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--text-2)' }}>
            Usa la ubicación de tu teléfono para ver el estado de los pozos, aljibes y manantiales más cercanos. Tu ubicación no se guarda ni se envía a ningún servidor.
          </p>
          <button className="btn-primary" onClick={ubicar} disabled={estado === 'pidiendo'} style={{ minHeight: 44 }}>
            {estado === 'pidiendo' ? 'Buscando tu ubicación…' : 'Usar mi ubicación'}
          </button>
          {(estado === 'negada' || estado === 'no-disponible') && (
            <p role="alert" style={{ margin: 0, fontSize: 13, color: '#8a5118', lineHeight: 1.5 }}>
              No pudimos saber dónde estás. Puedes permitir la ubicación en tu teléfono o consultar tu municipio.
            </p>
          )}
        </div>
      )}

      {pos && (
        <>
          {cercanas[0] && cercanas[0].km > 25 && (
            <p style={{ margin: 0, fontSize: 13, color: '#8a5118' }}>
              Estás a {iniFmtKm(cercanas[0].km)} de la fuente medida más cercana. Es posible que tu zona no tenga mediciones.
            </p>
          )}
          {aptaCercana && (
            <div style={{ fontSize: 14, padding: '10px 12px', background: 'rgba(46,139,87,0.08)', border: '1px solid rgba(46,139,87,0.30)', borderRadius: 3, color: '#1d6b3f' }}>
              La fuente sin problemas más cercana está a <b style={{ fontWeight: 600 }}>{iniFmtKm(aptaCercana.km)}</b>.
            </div>
          )}
          <div>
            {cercanas.slice(0, limite).map(({ p, km }, i) => (
              <button key={p.id} onClick={() => setDetalle({ p, km })}
                      style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12, width: '100%', minHeight: 56, padding: '10px 0', background: 'none', border: 'none', borderTop: i ? '1px solid var(--border)' : 'none', textAlign: 'left', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{p.tipo} · a {iniFmtKm(km)}</span>
                  <EstadoTag estado={p.estado} />
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>VER ›</span>
              </button>
            ))}
          </div>
          {cercanas.length > limite && (
            <button className="btn-ghost" style={{ alignSelf: 'flex-start', minHeight: 40 }} onClick={() => setLimite(limite + 6)}>Mostrar más</button>
          )}
        </>
      )}

      {detalle && <DetalleFuente p={detalle.p} km={detalle.km} onClose={() => setDetalle(null)} />}
    </div>
  );
}

// ── Página ───────────────────────────────────────────────────────────────────
function PageInicio({ setPage }) {
  const fuentes = fuentesActuales();
  const conteo = {};
  fuentes.forEach(p => { conteo[p.muni] = (conteo[p.muni] || 0) + 1; });
  const munis = GJ.MUNICIPIOS.filter(m => conteo[m.id]).slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const [muni, setMuni] = useState(() => {
    try { const g = localStorage.getItem('gj_muni'); if (g && conteo[g]) return g; } catch (e) {}
    return 'URI';
  });
  function elegir(id) { setMuni(id); try { localStorage.setItem('gj_muni', id); } catch (e) {} }

  return (
    <>
      <PageHead crumb="GUAJIRAGUA · INFORMACIÓN PARA LA COMUNIDAD"
                title="¿Cómo está el agua de tu fuente?"
                right={<>Fuentes revisadas <b>{fuentes.length.toLocaleString('es-CO')}</b><br />Última medición <b>{iniMesAnio(iniUltima(fuentes))}</b></>} />

      <p style={{ margin: '-12px 0 24px', fontSize: 16, lineHeight: 1.55, color: 'var(--text-2)', maxWidth: 760 }}>
        Resultados de las mediciones hechas en pozos, aljibes y manantiales de La Guajira. Consulta tu municipio o las fuentes cercanas a ti y mira qué hacer con el agua según su estado.
      </p>

      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SecTitle title="Consulta tu municipio" />
          <div className="chip-row" role="group" aria-label="Municipio">
            {munis.map(m => <Chip key={m.id} active={muni === m.id} onClick={() => elegir(m.id)}>{m.name}</Chip>)}
          </div>
          <ResumenMunicipio muniId={muni} />
        </div>
        <FuentesCercanas />
      </div>

      <SecTitle title="Qué significa cada estado y qué hacer" />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, margin: '12px 0 16px' }}>
        {['Apta', 'Precaución', 'Crítico'].map(e => (
          <div key={e} className="card card-pad" style={{ borderTop: `3px solid ${INI_COLOR[e]}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 17, fontWeight: 600, color: INI_TXT[e] }}>{INI_SIMPLE[e]}</span>
                <StatusPill estado={e} />
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--text-2)' }}>{INI_DESC[e]}</p>
            </div>
            <div>
              {INI_USOS[e].map(([uso, resp]) => (
                <div key={uso} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderTop: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-2)' }}>{uso}</span>
                  <b style={{ fontWeight: 500, textAlign: 'right', color: resp === 'No' ? '#9a2f2c' : 'var(--text)' }}>{resp}</b>
                </div>
              ))}
            </div>
            {e === 'Crítico' && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>Hervirla no le quita la sal: al hervir, queda todavía más salada.</p>}
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card card-pad" style={{ background: '#0f0f0f', borderColor: '#0f0f0f', color: '#fff' }}>
          <MonoLabel style={{ color: 'rgba(255,255,255,0.6)' }}>Para cualquier fuente</MonoLabel>
          <div style={{ fontSize: 20, fontWeight: 500, margin: '10px 0 8px', letterSpacing: '-0.01em' }}>Antes de beber, hierve el agua</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
            Estas mediciones revisan la sal y la acidez, no los microbios. Déjala hervir con burbujas durante 1 minuto y guárdala en recipientes limpios y tapados.
          </p>
        </div>
        <div className="card card-pad">
          <MonoLabel>Salud</MonoLabel>
          <div style={{ fontSize: 20, fontWeight: 500, margin: '10px 0 8px', letterSpacing: '-0.01em' }}>Si alguien se enferma</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--text-2)' }}>
            Si alguien tiene diarrea, vómito u otro malestar después de tomar agua, acude al centro de salud más cercano.
          </p>
        </div>
      </div>

      <p className="mono" style={{ margin: '24px 0 0', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.7 }}>
        DATOS: SERVICIO GEOLÓGICO COLOMBIANO Y CORPOGUAJIRA. PARA EL DETALLE TÉCNICO, CONSULTA{' '}
        <button className="mono" onClick={() => setPage('fisico')} style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: 'var(--text)', textDecoration: 'underline', cursor: 'pointer' }}>INFORMACIÓN FISICOQUÍMICA</button>.
      </p>
    </>
  );
}

window.PageInicio = PageInicio;
