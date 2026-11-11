// Página principal — Información fisicoquímica (replica el wireframe Figma en hi-fi)

function PageFisicoquimica() {
  const [tipo, setTipo] = useState('Todos');           // Todos | Pozo | Aljibe | Manantial
  const [temporada, setTemporada] = useState('Seca');  // Seca | Húmeda | Ambas
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [mapFilter, setMapFilter] = useState('estado');// estado | sal | cond
  const [selMuni, setSelMuni] = useState(null);
  const [detailPage, setDetailPage] = useState(0);
  useEffect(() => { setDetailPage(0); }, [selMuni]);

  const pts = useMemo(() => {
    return GJ.ALL_POINTS.filter(p => {
      if (tipo !== 'Todos' && p.tipo !== tipo) return false;
      if (temporada !== 'Ambas' && p.temporada !== temporada) return false;
      if (estadoFilter !== 'Todos' && p.estado !== estadoFilter) return false;
      if (selMuni && p.muni !== selMuni) return false;
      return true;
    });
  }, [tipo, temporada, estadoFilter, selMuni]);

  const dist = GJ.distByEstado(pts);
  const phValues = pts.map(p => p.ph);
  const activos = pts.filter(p => p.activo).length;
  const ph = phValues.length ? +(phValues.reduce((a,b)=>a+b,0) / phValues.length).toFixed(2) : 0;
  const criticos = pts.filter(p => p.estado === 'Crítico').length;
  const cobertura = +(100 * activos / Math.max(pts.length, 1)).toFixed(1);

  // ── Deltas dinámicos: compara época actual vs la otra época ─────────────────
  // Aplica los mismos filtros de tipo, estado y municipio para comparar äperas a peras.
  const epochRef = useMemo(() => {
    const refEpoca = temporada === 'Seca' ? 'Húmeda' : temporada === 'Húmeda' ? 'Seca' : null;
    if (!refEpoca) return null;
    const r = GJ.ALL_POINTS.filter(p => {
      if (p.temporada !== refEpoca) return false;
      if (tipo !== 'Todos' && p.tipo !== tipo) return false;
      if (estadoFilter !== 'Todos' && p.estado !== estadoFilter) return false;
      if (selMuni && p.muni !== selMuni) return false;
      return true;
    });
    if (r.length === 0) return null;   // sin referencia → ocultar delta
    const rAct     = r.filter(p => p.activo).length;
    const rPhV     = r.filter(p => p.ph > 0);
    const rPh      = rPhV.length ? +(rPhV.reduce((a,b) => a + b.ph, 0) / rPhV.length).toFixed(2) : 0;
    const rCrit    = r.filter(p => p.estado === 'Crítico').length;
    const rCob     = +(100 * rAct  / Math.max(r.length, 1)).toFixed(1);
    const rCritPct = +(100 * rCrit / Math.max(r.length, 1)).toFixed(1);
    return { activos: rAct, ph: rPh, criticos: rCrit, cobertura: rCob, critPct: rCritPct,
             label: temporada === 'Seca' ? 'vs húmeda' : 'vs seca' };
  }, [temporada, tipo, estadoFilter, selMuni]);

  const pctDelta = (curr, ref) =>
    ref != null && ref !== 0 ? +((curr - ref) / Math.abs(ref) * 100).toFixed(1) : null;

  // Mini gráfica con los dos valores reales: otra época → época seleccionada
  const makeSpark = (from, to) => [from, to];

  // Comparar TASAS (%) en vez de conteos absolutos: seca tiene 1543 pts y húmeda solo 192,
  // por lo que comparar absolutos produce deltas de 700%+ que son artefactos del muestreo.
  const critSecaPct  = +(100 * criticos / Math.max(pts.length, 1)).toFixed(1);
  const dActivos = epochRef ? pctDelta(cobertura,   epochRef.cobertura) : null;  // % activos seca vs húmeda
  const dPh      = epochRef ? pctDelta(ph,           epochRef.ph)        : null;  // pH promedio (misma unidad)
  const dCrit    = epochRef ? pctDelta(critSecaPct,  epochRef.critPct)   : null;  // % críticos seca vs húmeda
  const dCob     = epochRef ? pctDelta(cobertura,    epochRef.cobertura) : null;
  const eLbl     = epochRef ? epochRef.label : null;

  // ── Panel de detalle por municipio ──────────────────────────────────────────
  const DPSZ        = 15;
  const detailMuni  = selMuni ? GJ.MUNI_AGG.find(m => m.id === selMuni) : null;
  const detailTotal = detailMuni ? Math.max(1, Math.ceil(pts.length / DPSZ)) : 1;
  const detailPts   = selMuni   ? pts.slice(detailPage * DPSZ, (detailPage + 1) * DPSZ) : [];

  const filtroBadges = [
    { id:'tipo', label: 'Tipo captación', value: tipo, options:['Todos','Pozo','Aljibe','Manantial'] },
    { id:'est',  label: 'Estado calidad', value: estadoFilter, options:['Todos','Apta','Precaución','Crítico'] },
    { id:'ep',   label: 'Época',          value: temporada,  options:['Seca','Húmeda','Ambas'] },
    { id:'fis',  label: 'Fisicoquímicas', value: 'pH · COND · SAL', options:['pH · COND · SAL'] },
  ];

  return (
    <>
      {/* Hero — stats compactas */}
      <div className="hero" style={{gridTemplateColumns: '1fr', alignItems: 'center', minHeight: 80, padding: '0 0 0 0'}}>
        <div style={{display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'}}>
          <div className="s" style={{display:'flex', flexDirection:'column', alignItems:'center'}}><span className="mono tabular" style={{fontSize: 20, color:'var(--text)'}}>{GJ.ALL_POINTS.length.toLocaleString('es-CO')}</span><span className="mono" style={{fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:2}}>Puntos</span></div>
          <div className="s" style={{display:'flex', flexDirection:'column', alignItems:'center'}}><span className="mono tabular" style={{fontSize: 20, color:'var(--text)'}}>{GJ.MUNICIPIOS.length}</span><span className="mono" style={{fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:2}}>Municipios</span></div>
          <div className="s" style={{display:'flex', flexDirection:'column', alignItems:'center'}}><span className="mono tabular" style={{fontSize: 20, color:'var(--text)'}}>{['ph','cond','sal','temp','std'].filter(k => GJ.ALL_POINTS.some(p => p[k] > 0)).length}</span><span className="mono" style={{fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:2}}>Variables</span></div>
        </div>
      </div>

      {/* Top KPIs + filters bar */}
      <div className="grid" style={{gridTemplateColumns:'repeat(4, 1fr) 1.4fr', gap:16, marginBottom:16}}>
        <KpiCard label="Puntos activos"
                 value={activos.toLocaleString('es-CO')}
                 unit={'/ ' + pts.length.toLocaleString('es-CO')}
                 delta={dActivos}
                 deltaLabel={eLbl && '% activos ' + eLbl}
                 sparkData={epochRef ? makeSpark(epochRef.cobertura, cobertura) : null}
                 color="#2c5fa6" />
        <KpiCard label="pH promedio"
                 value={GJ.fmtNum(ph, 2)}
                 delta={dPh}
                 deltaLabel={eLbl}
                 sparkData={epochRef ? makeSpark(epochRef.ph, ph) : null}
                 color="#3a8580" />
        <KpiCard label="Puntos críticos" subirEsMalo
                 value={criticos.toLocaleString('es-CO')}
                 delta={dCrit}
                 deltaLabel={eLbl && '% críticos ' + eLbl}
                 sparkData={epochRef ? makeSpark(epochRef.critPct, critSecaPct) : null}
                 color="#b5403d" />
        <KpiCard label="Cobertura hídrica"
                 value={GJ.fmtNum(cobertura, 1)}
                 unit="%"
                 delta={dCob}
                 deltaLabel={eLbl}
                 sparkData={epochRef ? makeSpark(epochRef.cobertura, cobertura) : null}
                 color="#2e8b57" />

        {/* Filter chips */}
        <div className="card card-pad" style={{display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
          <div className="flex between center" style={{marginBottom:10}}>
            <span className="mono" style={{fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em'}}>FILTROS</span>
            <button className="mono" style={{fontSize:10, color:'var(--text-2)', background:'none', border:'none'}} onClick={() => { setTipo('Todos'); setTemporada('Seca'); setEstadoFilter('Todos'); setSelMuni(null); }}>
              REINICIAR ↻
            </button>
          </div>
          {filtroBadges.map(b => (
            <div key={b.id} style={{display:'grid', gridTemplateColumns:'120px 1fr', alignItems:'center', gap:10, marginBottom:6}}>
              <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.06em'}}>{b.label.toUpperCase()}</span>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {b.options.map(o => {
                  const isOn = b.value === o;
                  return (
                    <button key={o}
                      onClick={() => {
                        if (b.id === 'tipo') setTipo(o);
                        if (b.id === 'est')  setEstadoFilter(o);
                        if (b.id === 'ep')   setTemporada(o);
                      }}
                      className={'chip' + (isOn ? ' active' : '')}
                      style={{padding:'4px 10px', fontSize:11}}>
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution / Alerts / Map row (mirrors Figma) */}
      <div className="grid" style={{gridTemplateColumns:'1.35fr 0.85fr 1.5fr', gap:16}}>

        {/* Distribución de puntos de monitoreo */}
        <div className="card card-pad">
          <SecTitle title="Distribución de puntos de monitoreo"
                    sub={`N=${pts.length.toLocaleString('es-CO')}`}
                    right={
                      <Seg
                        options={[{value:'Todos',label:'Todos'},{value:'Pozo',label:'Pozos'},{value:'Aljibe',label:'Aljibes'},{value:'Manantial',label:'Manantiales'}]}
                        value={tipo} onChange={setTipo} />
                    } />

          <div style={{display:'grid', gridTemplateColumns:'1fr', gap:18, marginTop:16}}>
            {/* Histogram */}
            <div>
              <div className="flex between center" style={{marginBottom:8}}>
                <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Histograma de pH</span>
                <span className="mono tabular" style={{fontSize:11, color:'var(--text-2)'}}>µ = {GJ.fmtNum(ph, 2)}</span>
              </div>
              <Histogram data={phValues} />
            </div>

            {/* Stacked bar */}
            <div>
              <div className="flex between center" style={{marginBottom:8}}>
                <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Clasificación por estado</span>
                <div className="legend">
                  <span><span className="sw" style={{background:'#2e8b57'}}/>Apta {dist.apta}</span>
                  <span><span className="sw" style={{background:'#c97a2b'}}/>Precaución {dist.precaucion}</span>
                  <span><span className="sw" style={{background:'#b5403d'}}/>Crítico {dist.critico}</span>
                </div>
              </div>
              <StackBar apta={dist.apta} precaucion={dist.precaucion} critico={dist.critico} height={14}/>
              <div className="mono tabular" style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--text-3)'}}>
                <span>Agua apta</span><span>Precaución</span><span>Crítico</span>
              </div>
            </div>

            {/* per-zona micro chart */}
            <div>
              <div className="flex between center" style={{marginBottom:10}}>
                <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase'}}>pH promedio por municipio</span>
              </div>
              <MuniBars
                rows={GJ.MUNI_AGG.map(r => ({...r}))}
                valueKey="ph"
                max={9.0}
                format={v => GJ.fmtNum(v, 2)}
                selectedId={selMuni}
                onSelect={setSelMuni}
              />
            </div>
          </div>
        </div>

        {/* Alertas activas */}
        <div className="card card-pad">
          <SecTitle title="Alertas activas"
                    sub={GJ.ALERTS.length.toLocaleString('es-CO')} />
          <div style={{maxHeight:520, overflowY:'auto', marginTop:4}} className="scroll-y">
            {GJ.ALERTS.slice(0, 30).map(a => <AlertRow key={a.id} a={a} />)}
          </div>
          {GJ.ALERTS.length > 30 && (
            <div className="mono" style={{fontSize:10, color:'var(--text-2)', marginTop:10, letterSpacing:'0.06em'}}>
              LAS 30 MÁS GRAVES DE {GJ.ALERTS.length.toLocaleString('es-CO')} · LISTA COMPLETA EN LA PESTAÑA ALERTAS
            </div>
          )}
        </div>

        {/* Mapa */}
        <div className="card card-pad">
          <SecTitle title="Cobertura geoespacial"
                    sub={`${GJ.MUNICIPIOS.length} municipios`}
                    right={
                      <div className="flex" style={{gap:6}}>
                        <button className={'chip' + (mapFilter==='estado'?' active':'')} onClick={()=>setMapFilter('estado')} style={{padding:'4px 10px', fontSize:11}}>Estado</button>
                        <button className={'chip' + (mapFilter==='sal'?' active':'')}    onClick={()=>setMapFilter('sal')}    style={{padding:'4px 10px', fontSize:11}}>Salinidad</button>
                        <button className={'chip' + (mapFilter==='cond'?' active':'')}   onClick={()=>setMapFilter('cond')}   style={{padding:'4px 10px', fontSize:11}}>Cond.</button>
                      </div>
                    } />
          <div style={{marginTop:8}}>
            <MapGuajira selected={selMuni} onSelect={setSelMuni} filter={mapFilter} temporada={temporada} />
          </div>
          <div className="flex between" style={{marginTop:8, paddingTop:12, borderTop:'1px solid var(--border)'}}>
            <div className="legend">
              {mapFilter === 'estado' && <>
                <span><span className="sw" style={{background:'rgba(46,139,87,0.45)'}}/>Bajo riesgo</span>
                <span><span className="sw" style={{background:'rgba(181,64,61,0.32)'}}/>Medio</span>
                <span><span className="sw" style={{background:'rgba(181,64,61,0.55)'}}/>Alto</span>
              </>}
              {mapFilter === 'sal' && <>
                <span><span className="sw" style={{background:'rgba(201,122,43,0.18)'}}/>{'< 0.5 mS/cm'}</span>
                <span><span className="sw" style={{background:'rgba(201,122,43,0.40)'}}/>0.5 – 2.0</span>
                <span><span className="sw" style={{background:'rgba(201,122,43,0.65)'}}/>{'> 2.0'}</span>
              </>}
              {mapFilter === 'cond' && <>
                <span><span className="sw" style={{background:'rgba(44,95,166,0.20)'}}/>{'< 1000 µS/cm'}</span>
                <span><span className="sw" style={{background:'rgba(44,95,166,0.45)'}}/>1000 – 2500</span>
                <span><span className="sw" style={{background:'rgba(44,95,166,0.70)'}}/>{'> 2500'}</span>
              </>}
            </div>
            <span className="mono" style={{fontSize:10, color:'var(--text-3)'}}>
              {selMuni ? 'FILTRADO POR ' + (GJ.MUNI_AGG.find(a=>a.id===selMuni)?.name?.toUpperCase()) : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── Panel de detalle por municipio ─────────────────────────────────── */}
      {selMuni && detailMuni && (
        <div className="card" style={{marginTop:16}}>

          {/* Cabecera */}
          <div className="card-pad" style={{borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16}}>
            <div>
              <div className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4}}>
                DIM_PUNTO_MONITOREO · {detailMuni.zona.toUpperCase()} GUAJIRA
              </div>
              <h3 style={{margin:0, fontSize:16, fontWeight:500}}>
                {detailMuni.name}
                <span style={{fontWeight:400, fontSize:13, color:'var(--text-3)', marginLeft:10}}>
                  · {pts.length.toLocaleString('es-CO')} puntos con filtros activos
                </span>
              </h3>
            </div>
            <div style={{display:'flex', gap:28, alignItems:'center', flexWrap:'wrap'}}>
              {[
                { label:'pH prom.',    value: GJ.fmtNum(detailMuni.ph, 2) },
                { label:'Cond µS/cm', value: detailMuni.cond.toLocaleString('es-CO') },
                { label:'Sal mS/cm',  value: GJ.fmtNum(detailMuni.sal, 2) },
                { label:'Críticos',   value: detailMuni.criticos, warn: detailMuni.criticos > 0 },
              ].map(k => (
                <div key={k.label} style={{textAlign:'center'}}>
                  <div className="mono" style={{fontSize:9, color:'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase'}}>{conMu(k.label)}</div>
                  <div className="mono tabular" style={{fontSize:20, color: k.warn ? '#b5403d' : 'var(--text)', marginTop:2}}>{k.value}</div>
                </div>
              ))}
              <button className="chip" style={{padding:'6px 14px', fontSize:12}} onClick={() => setSelMuni(null)}>
                ✕ Cerrar
              </button>
            </div>
          </div>

          {/* Tabla o vacío */}
          {pts.length === 0 ? (
            <div style={{padding:48, textAlign:'center'}}>
              <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase'}}>
                Sin puntos en {detailMuni.name} con los filtros activos
              </span>
            </div>
          ) : (
            <>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{width:110}}>ID</th>
                      <th style={{width:95}}>Tipo</th>
                      <th>Uso</th>
                      <th style={{width:95}}>Época</th>
                      <th style={{width:60}}>pH</th>
                      <th>Cond. <span className="mu">µS/cm</span></th>
                      <th>Sal. <span className="mu">mS/cm</span></th>
                      <th>Temp. °C</th>
                      <th>STD <span className="mu">mg/L</span></th>
                      <th>Prof. m</th>
                      <th style={{width:120}}>Estado</th>
                      <th style={{width:60}}>Activo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailPts.map(p => (
                      <tr key={p.id}>
                        <td><span className="mono" style={{color:'var(--text-2)', whiteSpace:'nowrap'}}>{p.id}</span></td>
                        <td>{p.tipo}</td>
                        <td style={{color:'var(--text-2)', fontSize:11}}>{p.uso}</td>
                        <td><span className="mono" style={{fontSize:11, color:'var(--text-2)'}}>{p.temporada}</span></td>
                        <td className="num"><span className="mono">{GJ.fmtNum(p.ph)}</span></td>
                        <td className="num"><span className="mono">{p.cond.toLocaleString('es-CO')}</span></td>
                        <td className="num"><span className="mono">{GJ.fmtNum(p.sal, 3)}</span></td>
                        <td className="num"><span className="mono">{GJ.fmtNum(p.temp)}</span></td>
                        <td className="num"><span className="mono">{GJ.fmtMiles(p.std)}</span></td>
                        <td className="num"><span className="mono">{GJ.fmtNum(p.prof, 1)}</span></td>
                        <td><StatusPill estado={p.estado} /></td>
                        <td style={{textAlign:'center'}}>
                          <span className={'pill ' + (p.activo ? 'good' : 'neut')}>{p.activo ? 'SÍ' : 'NO'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {detailTotal > 1 && (
                <div className="flex between center" style={{padding:'12px 16px', borderTop:'1px solid var(--border)'}}>
                  <div className="mono" style={{fontSize:11, color:'var(--text-3)'}}>
                    Mostrando {(detailPage * DPSZ + 1).toLocaleString('es-CO')}–{Math.min((detailPage + 1) * DPSZ, pts.length).toLocaleString('es-CO')} de {pts.length.toLocaleString('es-CO')}
                  </div>
                  <div className="flex center" style={{gap:6}}>
                    <button className="chip" onClick={() => setDetailPage(p => Math.max(0, p - 1))} disabled={detailPage === 0} style={{padding:'5px 10px'}}>← Anterior</button>
                    <span className="mono tabular" style={{fontSize:11, color:'var(--text-2)', padding:'0 10px'}}>{detailPage + 1} / {detailTotal}</span>
                    <button className="chip" onClick={() => setDetailPage(p => Math.min(detailTotal - 1, p + 1))} disabled={detailPage >= detailTotal - 1} style={{padding:'5px 10px'}}>Siguiente →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

    </>
  );
}

window.PageFisicoquimica = PageFisicoquimica;
