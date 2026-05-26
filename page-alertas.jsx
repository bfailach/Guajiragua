// Página de Alertas — listado completo + filtros

function PageAlertas() {
  const [sev, setSev] = useState('Todas');
  const [muni, setMuni] = useState('Todos');
  const [resolved, setResolved] = useState(() => {
    try {
      const stored = sessionStorage.getItem('gj_resolved_alerts');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  // Tabla de alertas: primero las reales del CSV, luego sintéticas hasta completar 26
  const ALL_ALERTS = useMemo(() => {
    const synth = [
      { code:'IPH < 50',   sev:'crit', body:'Índice de potabilidad bajo umbral mínimo' },
      { code:'pH < 6.0',   sev:'crit', body:'Acidez anómala en captador costero' },
      { code:'pH > 9.0',   sev:'warn', body:'Alcalinidad sobre normativa' },
      { code:'COND > 5000',sev:'crit', body:'Conductividad eléctrica fuera de rango potable' },
      { code:'COND > 2500',sev:'warn', body:'Conductividad elevada en corredor' },
      { code:'SAL > 4.0',  sev:'crit', body:'Intrusión salina detectada' },
      { code:'SAL > 2.0',  sev:'warn', body:'Salinidad creciente respecto a base seca' },
      { code:'STD > 5000', sev:'crit', body:'Sólidos disueltos totales por encima del límite' },
      { code:'IDA ↑',      sev:'warn', body:'Tendencia de deterioro del acuífero' },
      { code:'INACTIVO',   sev:'warn', body:'Captador sin reporte programado' },
      { code:'CAMPAÑA',    sev:'info', body:'Campaña de medición iniciada' },
      { code:'ETL OK',     sev:'info', body:'Carga nocturna pg_cron completada' },
    ];

    // 1. Adaptar alertas reales (generadas desde umbrales del CSV real)
    const realRows = GJ.ALERTS.map(a => {
      const m = GJ.MUNICIPIOS.find(m => m.name === a.muni) || GJ.MUNICIPIOS[0];
      return {
        ...a,
        muniId: m.id,
        point:  'GJ-' + String(parseInt(a.id.split('-')[2] || '100') * 7 % 88000 + 10000).padStart(5,'0'),
        value:  a.code.includes('SAL')  ? a.body.match(/[\d.]+/) && a.body.match(/[\d.]+/)[0] :
                a.code.includes('COND') ? a.body.match(/[\d.]+/) && a.body.match(/[\d.]+/)[0] :
                a.code.includes('pH')   ? a.body.match(/[\d.]+/) && a.body.match(/[\d.]+/)[0] : '—',
      };
    });

    // 2. Completar hasta 26 con filas sintéticas (IDs en rango 199↓ para no colisionar)
    const rows = [...realRows];
    let seq = 199, gi = 0;
    while (rows.length < 26) {
      const m = GJ.MUNICIPIOS[gi % GJ.MUNICIPIOS.length];
      const c = synth[gi % synth.length];
      rows.push({
        id:   'AL-2026-' + String(seq--).padStart(4, '0'),
        sev:  c.sev, code: c.code, body: c.body,
        muni: m.name, muniId: m.id,
        point: 'GJ-' + String(10 + gi * 7).padStart(5, '0'),
        time:  gi < 3 ? `hace ${(gi+1)*12} min` : gi < 6 ? `hace ${gi-2} h` : gi < 10 ? 'ayer' : `hace ${gi-7} d`,
        value: c.code.includes('pH')   ? (5.4 + (gi%5)*0.2).toFixed(2) :
               c.code.includes('SAL')  ? (2.1 + (gi%4)*0.6).toFixed(2) :
               c.code.includes('COND') ? (2600 + gi*180) :
               c.code.includes('STD')  ? (4200 + gi*220) :
               c.code.includes('IPH')  ? (32   + (gi%8)*2) : '—',
      });
      gi++;
    }
    return rows;
  }, []);

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
      const map = { 'Críticas':'crit', 'Advertencia':'warn', 'Informativas':'info' };
      if (a.sev !== map[sev]) return false;
    }
    if (muni !== 'Todos' && a.muni !== muni) return false;
    return true;
  });

  const counts = {
    crit: active.filter(a => a.sev === 'crit').length,
    warn: active.filter(a => a.sev === 'warn').length,
    info: active.filter(a => a.sev === 'info').length,
  };

  return (
    <>
      <PageHead
        crumb="DM_CALIDAD · ALERTAS HÍDRICAS"
        title="Centro de alertas hídricas"
        right={<>
          <div><b>Activas:</b> {active.length}{resolved.size > 0 && <span style={{color:'var(--text-3)', marginLeft:8}}>· {resolved.size} reconocidas</span>}</div>
          <div><b>Críticas:</b> <span style={{color:'#b5403d'}}>{counts.crit}</span></div>
          <div><b>Última sincronización:</b> hace 12 min</div>
        </>}
      />

      {/* Severity summary cards */}
      <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:16}}>
        <div className="card card-pad" style={{borderLeft:'3px solid #b5403d'}}>
          <div className="flex between center">
            <div className="kpi-label">Críticas</div>
            <span className="pill bad">SLA 4H</span>
          </div>
          <div className="kpi-value tabular" style={{marginTop:10, color:'#b5403d'}}>{counts.crit}</div>
          <div className="mono" style={{fontSize:11, color:'var(--text-3)', marginTop:12}}>
            Requieren intervención inmediata · Corpoguajira
          </div>
        </div>
        <div className="card card-pad" style={{borderLeft:'3px solid #c97a2b'}}>
          <div className="flex between center">
            <div className="kpi-label">Advertencia</div>
            <span className="pill warn">SLA 24H</span>
          </div>
          <div className="kpi-value tabular" style={{marginTop:10, color:'#c97a2b'}}>{counts.warn}</div>
          <div className="mono" style={{fontSize:11, color:'var(--text-3)', marginTop:12}}>
            Monitoreo reforzado · Técnicos de campo
          </div>
        </div>
        <div className="card card-pad" style={{borderLeft:'3px solid #2c5fa6'}}>
          <div className="flex between center">
            <div className="kpi-label">Informativas</div>
            <span className="pill good">REGISTRO</span>
          </div>
          <div className="kpi-value tabular" style={{marginTop:10, color:'#2c5fa6'}}>{counts.info}</div>
          <div className="mono" style={{fontSize:11, color:'var(--text-3)', marginTop:12}}>
            Eventos operativos · IDEAM
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="card card-pad" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:16, flexWrap:'wrap'}}>
        <div className="flex center" style={{gap:18}}>
          <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase'}}>Severidad</span>
          <Seg options={['Todas','Críticas','Advertencia','Informativas']} value={sev} onChange={setSev} />
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
              <th style={{width:130}}>ID</th>
              <th style={{width:120}}>Severidad</th>
              <th style={{width:110}}>Código</th>
              <th>Descripción</th>
              <th style={{width:130}}>Municipio</th>
              <th style={{width:110}}>Punto</th>
              <th style={{width:100}}>Valor</th>
              <th style={{width:130}}>Detectada</th>
              <th style={{width:110}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td><div className={'sev-dot ' + a.sev} style={{marginTop:0}}/></td>
                <td><span className="mono" style={{color:'var(--text-2)'}}>{a.id}</span></td>
                <td>
                  <span className={'pill ' + (a.sev==='crit'?'bad':a.sev==='warn'?'warn':'good')}>
                    {a.sev==='crit'?'Crítica':a.sev==='warn'?'Advertencia':'Informativa'}
                  </span>
                </td>
                <td><span className="mono" style={{color:'var(--ocre)'}}>{a.code}</span></td>
                <td>{a.body}</td>
                <td>{a.muni}</td>
                <td><span className="mono" style={{color:'var(--text-2)'}}>{a.point}</span></td>
                <td className="num"><span className="mono">{a.value}</span></td>
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
