// Página de Alertas — fuentes que incumplen la regla de calidad, con filtros

function PageAlertas() {
  const [sev, setSev] = useState('Todas');
  const [muni, setMuni] = useState('Todos');
  const [resolved, setResolved] = useState(() => {
    try {
      const stored = sessionStorage.getItem('gj_resolved_alerts');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  // Alertas reales: una por fuente que incumple la regla de calidad (mock-data.jsx)
  const ALL_ALERTS = GJ.ALERTS;
  const [limite, setLimite] = useState(50);
  useEffect(() => { setLimite(50); }, [sev, muni]);

  const ultimaMedicion = GJ.fechaCorta(GJ.ALL_POINTS.reduce((m, p) => (p.fecha > m ? p.fecha : m), ''));

  function resolve(id, code, muniName) {
    setResolved(prev => {
      const next = new Set([...prev, id]);
      try { sessionStorage.setItem('gj_resolved_alerts', JSON.stringify([...next])); } catch {}
      return next;
    });
    if (window.showToast) window.showToast('Alerta ' + id + ' reconocida · ' + code + ' · ' + muniName, 'success');
  }

  const active = ALL_ALERTS.filter(a => !resolved.has(a.id));

  const filtered = active.filter(a => {
    if (sev !== 'Todas') {
      const map = { 'Críticas':'crit', 'Advertencias':'warn' };
      if (a.sev !== map[sev]) return false;
    }
    if (muni !== 'Todos' && a.muni !== muni) return false;
    return true;
  });

  const counts = {
    crit: active.filter(a => a.sev === 'crit').length,
    warn: active.filter(a => a.sev === 'warn').length,
  };

  return (
    <>
      <PageHead
        crumb="DM_CALIDAD · ALERTAS HÍDRICAS"
        title="Centro de alertas hídricas"
        right={<>
          <div><b>Activas:</b> {active.length}{resolved.size > 0 && <span style={{color:'var(--text-3)', marginLeft:8}}>· {resolved.size} reconocidas</span>}</div>
          <div><b>Críticas:</b> <span style={{color:'#b5403d'}}>{counts.crit}</span></div>
          <div><b>Última medición:</b> {ultimaMedicion}</div>
          <div><b>Datos:</b> {window.GJ_API_LIVE ? 'Supabase en vivo' : 'copia estática'}</div>
        </>}
      />

      {/* Severity summary cards */}
      <div className="grid" style={{gridTemplateColumns:'repeat(2, 1fr)', gap:16, marginBottom:16}}>
        <div className="card card-pad" style={{borderLeft:'3px solid #b5403d'}}>
          <div className="kpi-label">Críticas · fuentes no aptas para beber</div>
          <div className="kpi-value tabular" style={{marginTop:10, color:'#b5403d'}}>{counts.crit.toLocaleString('es-CO')}</div>
          <div className="mono" style={{fontSize:11, color:'var(--text-2)', marginTop:12}}>
            Conductividad &gt; 5.000 µS/cm, salinidad &gt; 4,0 mS/cm o pH fuera de 6,0–9,0
          </div>
        </div>
        <div className="card card-pad" style={{borderLeft:'3px solid #c97a2b'}}>
          <div className="kpi-label">Advertencias · fuentes para usar con cuidado</div>
          <div className="kpi-value tabular" style={{marginTop:10, color:'#c97a2b'}}>{counts.warn.toLocaleString('es-CO')}</div>
          <div className="mono" style={{fontSize:11, color:'var(--text-2)', marginTop:12}}>
            Conductividad &gt; 2.500 µS/cm o pH fuera de 6,5–8,5
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="card card-pad" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:16, flexWrap:'wrap'}}>
        <div className="flex center" style={{gap:18}}>
          <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase'}}>Severidad</span>
          <Seg options={['Todas','Críticas','Advertencias']} value={sev} onChange={setSev} />
        </div>
        <div className="flex center" style={{gap:8, flexWrap:'wrap', flex:1}}>
          <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', marginRight:6}}>Municipio</span>
          <Chip active={muni==='Todos'} onClick={() => setMuni('Todos')}>Todos</Chip>
          {GJ.MUNICIPIOS.map(m => (
            <Chip key={m.id} active={muni===m.name} onClick={() => setMuni(muni===m.name?'Todos':m.name)}>{m.name}</Chip>
          ))}
        </div>
        {filtered.length > 0 && (
          <button
            className="chip"
            style={{padding:'6px 16px', fontSize:11, color:'var(--bad)', borderColor:'var(--bad)', whiteSpace:'nowrap', flexShrink:0}}
            onClick={() => {
              filtered.forEach(a => resolve(a.id, a.code, a.muni));
            }}>
            ✓ Reconocer todas ({filtered.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width:32}}></th>
              <th style={{width:100}}>ID</th>
              <th style={{width:120}}>Severidad</th>
              <th style={{width:130}}>Código</th>
              <th>Descripción</th>
              <th style={{width:130}}>Municipio</th>
              <th style={{width:110}}>Punto</th>
              <th style={{width:130}}>Valor</th>
              <th style={{width:130}}>Medición</th>
              <th style={{width:110}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, limite).map(a => (
              <tr key={a.id}>
                <td><div className={'sev-dot ' + a.sev} style={{marginTop:0}}/></td>
                <td><span className="mono" style={{color:'var(--text-2)', whiteSpace:'nowrap'}}>{a.id}</span></td>
                <td>
                  <span className={'pill ' + (a.sev==='crit'?'bad':a.sev==='warn'?'warn':'good')}>
                    {a.sev==='crit'?'Crítica':'Advertencia'}
                  </span>
                </td>
                <td><span className="mono" style={{color:'var(--ocre)', whiteSpace:'nowrap'}}>{a.code}</span></td>
                <td>{a.body}</td>
                <td>{a.muni}</td>
                <td><span className="mono" style={{color:'var(--text-2)', whiteSpace:'nowrap'}}>{a.point}</span></td>
                <td className="num"><span className="mono" style={{whiteSpace:'nowrap'}}>{a.value}</span></td>
                <td className="mono" style={{color:'var(--text-3)'}}>{a.time}</td>
                <td>
                  <button
                    className="chip"
                    style={{padding:'4px 10px', fontSize:10.5}}
                    onClick={() => resolve(a.id, a.code, a.muni)}>
                    ✓ Reconocer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length > limite && (
          <div style={{padding:16, display:'flex', justifyContent:'center', gap:12, alignItems:'center', borderTop:'1px solid var(--border)'}}>
            <span className="mono" style={{fontSize:11, color:'var(--text-2)'}}>{limite.toLocaleString('es-CO')} DE {filtered.length.toLocaleString('es-CO')}</span>
            <button className="btn-ghost" onClick={() => setLimite(limite + 50)}>Mostrar 50 más</button>
          </div>
        )}
        {filtered.length === 0 && (
          <div style={{padding:60, textAlign:'center', color:'var(--text-3)'}}>
            <div className="mono" style={{fontSize:11}}>
              {active.length === 0 ? '✓ Todas las alertas han sido reconocidas.' : 'Sin alertas que coincidan con el filtro.'}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

window.PageAlertas = PageAlertas;
