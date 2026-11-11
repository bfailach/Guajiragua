// Página de Administración — tabla de los 1.702 puntos + acciones técnicas

// ── CSV Export ───────────────────────────────────────────────
// Un valor ausente se exporta como celda vacía
const csvNum = (v, d) => v == null ? '' : (d == null ? String(v) : Number(v).toFixed(d));

function exportCSV(pts) {
  const headers = ['ID','Municipio','Zona','Tipo','Uso','Metodo',
    'pH','Cond_uS_cm','Sal_mS_cm','Temp_C','STD_mg_L','Prof_m',
    'Temporada','Estado','Activo','Fecha'];
  const rows = pts.map(p => [
    p.id, p.muniName, p.zona, p.tipo, p.uso, p.metodo,
    p.ph, p.cond, csvNum(p.sal, 3), csvNum(p.temp), csvNum(p.std), csvNum(p.prof, 1),
    p.temporada, p.estado, p.activo ? '1' : '0', p.fecha,
  ]);
  const csv = [headers, ...rows].map(r => r.join(';')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const today = new Date().toISOString().slice(0, 10);
  a.download = `guajiragua_puntos_${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  if (window.showToast) window.showToast('CSV exportado · ' + pts.length.toLocaleString('es-CO') + ' filas', 'success');
}

// ── Detail Modal ─────────────────────────────────────────────
function DetailModal({ point, onClose }) {
  const ph = point.ph;
  const phOk = ph >= 6.5 && ph <= 8.5;
  const rows = [
    ['Municipio', point.muniName],
    ['Zona',      point.zona + ' Guajira'],
    ['Tipo',      point.tipo],
    ['Uso',       point.uso],
    ['Método',    point.metodo],
    ['Temporada', point.temporada],
    ['Fecha',     point.fecha],
  ];
  const metrics = [
    { label:'pH',           value: GJ.fmtNum(point.ph), unit:'',       warn: !phOk },
    { label:'Conductividad',value: point.cond.toLocaleString('es-CO'), unit:'µS/cm', warn: point.cond > 2500 },
    { label:'Salinidad',    value: GJ.fmtNum(point.sal, 3), unit:'mS/cm', warn: point.sal > 2.0 },
    { label:'Temperatura',  value: GJ.fmtNum(point.temp), unit:'°C',      warn: false },
    { label:'STD',          value: GJ.fmtMiles(point.std),  unit:'mg/L',  warn: point.std > 5000 },
    { label:'Profundidad',  value: GJ.fmtNum(point.prof, 1), unit:'m',    warn: false },
  ];
  return (
    <Modal
      title={point.id}
      crumb={'DIM_PUNTO_MONITOREO · DETALLE'}
      onClose={onClose}
      size="md"
      footer={
        <button className="btn-ghost" onClick={onClose}>Cerrar</button>
      }>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
        {/* Left: metadata */}
        <div>
          <div className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10}}>IDENTIFICACIÓN</div>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:12}}>
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <td style={{padding:'7px 0', color:'var(--text-3)', fontFamily:'ui-monospace,monospace', fontSize:10.5, letterSpacing:'0.08em', textTransform:'uppercase', borderBottom:'1px solid var(--border)', paddingRight:16, whiteSpace:'nowrap'}}>{k}</td>
                  <td style={{padding:'7px 0', color:'var(--text)', borderBottom:'1px solid var(--border)'}}>{v}</td>
                </tr>
              ))}
              <tr>
                <td style={{padding:'7px 0', color:'var(--text-3)', fontFamily:'ui-monospace,monospace', fontSize:10.5, letterSpacing:'0.08em', textTransform:'uppercase', paddingRight:16}}>Estado</td>
                <td style={{padding:'7px 0'}}><StatusPill estado={point.estado} /></td>
              </tr>
              <tr>
                <td style={{padding:'7px 0', color:'var(--text-3)', fontFamily:'ui-monospace,monospace', fontSize:10.5, letterSpacing:'0.08em', textTransform:'uppercase', paddingRight:16}}>Activo</td>
                <td style={{padding:'7px 0'}}>
                  <span className={'pill ' + (point.activo ? 'good' : 'bad')}>{point.activo ? 'SÍ' : 'NO'}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right: metrics */}
        <div>
          <div className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10}}>MEDICIONES FISICOQUÍMICAS</div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {metrics.map(m => (
              <div key={m.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background: m.warn ? 'rgba(181,64,61,0.04)' : 'var(--bg-2)', border:'1px solid ' + (m.warn ? 'rgba(181,64,61,0.25)' : 'var(--border)'), borderRadius:3}}>
                <span className="mono" style={{fontSize:10.5, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{m.label}</span>
                <span className="mono tabular" style={{fontSize:15, color: m.warn ? '#b5403d' : 'var(--text)', fontWeight:500}}>
                  {m.value}
                  <span style={{fontSize:10, color:'var(--text-3)', marginLeft:4}}>{conMu(m.unit)}</span>
                </span>
              </div>
            ))}
          </div>
          {point.estado !== 'Apta' && (
            <div style={{marginTop:14, padding:'10px 12px', background:'rgba(181,64,61,0.05)', border:'1px solid rgba(181,64,61,0.2)', borderRadius:3}}>
              <div className="mono" style={{fontSize:10, color:'#b5403d', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4}}>CRITERIOS QUE DETERMINAN EL ESTADO</div>
              <div className="mono" style={{fontSize:11, color:'var(--text-2)'}}>
                {GJ.motivosEstado(point).map((m, i) => <div key={i}>· {m.txt} ({m.sev.toLowerCase()})</div>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── Nuevo punto form modal ───────────────────────────────────
function NuevoPuntoModal({ onClose, onSave }) {
  const empty = {
    muni: GJ.MUNICIPIOS[0].id,
    tipo: 'Pozo', uso: 'Doméstico', metodo: 'Sonda multiparámetro',
    temporada: 'Seca',
    ph: '', cond: '', sal: '', temp: '', std: '', prof: '',
  };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: null }));
  }

  function validate() {
    const e = {};
    const ph = parseFloat(form.ph);
    const cond = parseFloat(form.cond);
    const sal = parseFloat(form.sal);
    const temp = parseFloat(form.temp);
    const std = parseFloat(form.std);
    const prof = parseFloat(form.prof);
    if (isNaN(ph)   || ph < 5.0 || ph > 10.0) e.ph   = 'Rango válido: 5.0 – 10.0';
    if (isNaN(cond) || cond <= 0)              e.cond = 'Valor positivo requerido';
    if (isNaN(sal)  || sal < 0)                e.sal  = 'Valor ≥ 0 requerido';
    if (isNaN(temp) || temp < 15 || temp > 45) e.temp = 'Rango válido: 15 – 45 °C';
    if (isNaN(std)  || std <= 0)               e.std  = 'Valor positivo requerido';
    if (isNaN(prof) || prof <= 0)              e.prof = 'Profundidad positiva requerida';
    return e;
  }

  function submit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    // Simulate async save
    setTimeout(() => {
      onSave({
        id: 'GJ-' + String(Math.floor(Math.random() * 9000) + 1000).padStart(5, '0'),
        muni: form.muni,
        muniName: (GJ.MUNICIPIOS.find(m => m.id === form.muni) || {}).name || '',
        zona: (GJ.MUNICIPIOS.find(m => m.id === form.muni) || {}).zona || '',
        tipo: form.tipo, uso: form.uso, metodo: form.metodo, temporada: form.temporada,
        ph: parseFloat(parseFloat(form.ph).toFixed(2)),
        cond: Math.round(parseFloat(form.cond)),
        sal: parseFloat(parseFloat(form.sal).toFixed(3)),
        temp: parseFloat(parseFloat(form.temp).toFixed(1)),
        std: Math.round(parseFloat(form.std)),
        prof: parseFloat(parseFloat(form.prof).toFixed(1)),
        estado: GJ.clasificarEstado({
          ph:   parseFloat(form.ph),
          cond: parseFloat(form.cond),
          sal:  parseFloat(form.sal),
        }),
        activo: true,
        fecha: new Date().toISOString().slice(0, 10),
      });
      setSaving(false);
    }, 900);
  }

  const F = ({ id, label, hint, type = 'number', value, onChange, options, step }) => (
    <div className="field">
      <label>{conMu(label)}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} className={errors[id] ? 'err-field' : ''}>
          {options.map(o => <option key={o.value != null ? o.value : o} value={o.value != null ? o.value : o}>{o.label != null ? o.label : o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} step={step} onChange={e => onChange(e.target.value)} className={errors[id] ? 'err-field' : ''} />
      )}
      {hint && !errors[id] && <div className="hint">{conMu(hint)}</div>}
      {errors[id] && <div className="err-msg">⚠ {errors[id]}</div>}
    </div>
  );

  return (
    <Modal
      title="Nuevo punto de monitoreo"
      crumb="DIM_PUNTO_MONITOREO · INSERTAR"
      onClose={onClose}
      size="md"
      footer={<>
        <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
        <button className="btn-primary" onClick={submit} disabled={saving}>
          {saving ? '↻ Guardando…' : '+ Registrar punto'}
        </button>
      </>}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, columnGap:24}}>
        <F id="muni" label="Municipio" value={form.muni} onChange={v => set('muni', v)}
           options={GJ.MUNICIPIOS.map(m => ({ value: m.id, label: m.name }))} />
        <F id="tipo" label="Tipo de captación" value={form.tipo} onChange={v => set('tipo', v)}
           options={GJ.TIPOS} />
        <F id="uso" label="Uso del agua" value={form.uso} onChange={v => set('uso', v)}
           options={GJ.USOS} />
        <F id="metodo" label="Método de medición" value={form.metodo} onChange={v => set('metodo', v)}
           options={GJ.METODOS} />
        <F id="temporada" label="Época" value={form.temporada} onChange={v => set('temporada', v)}
           options={['Seca', 'Húmeda']} />
      </div>

      <hr style={{border:'none', borderTop:'1px solid var(--border)', margin:'8px 0 16px'}} />
      <div className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12}}>MEDICIONES FISICOQUÍMICAS</div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:0, columnGap:20}}>
        <F id="ph"   label="pH"                value={form.ph}   onChange={v => set('ph', v)}   step="0.01" hint="Rango: 5.0 – 10.0" />
        <F id="cond" label="Conductividad µS/cm" value={form.cond} onChange={v => set('cond', v)} step="1"    hint="µS/cm" />
        <F id="sal"  label="Salinidad mS/cm"   value={form.sal}  onChange={v => set('sal', v)}  step="0.001" hint="mS/cm" />
        <F id="temp" label="Temperatura °C"    value={form.temp} onChange={v => set('temp', v)} step="0.1"   hint="15 – 45 °C" />
        <F id="std"  label="STD mg/L"          value={form.std}  onChange={v => set('std', v)}  step="1"     hint="mg/L" />
        <F id="prof" label="Profundidad m"     value={form.prof} onChange={v => set('prof', v)} step="0.1"   hint="metros" />
      </div>
    </Modal>
  );
}

// ── Page ─────────────────────────────────────────────────────
function PageAdmin() {
  const [subTab, setSubTab] = useState('monitoreo'); // 'monitoreo' | 'reporte'
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('Todos');
  const [zona, setZona] = useState('Todas');
  const [estado, setEstado] = useState('Todos');
  const [page, setPage] = useState(0);
  const [detailPoint, setDetailPoint] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [extraPoints, setExtraPoints] = useState([]);
  const PAGE_SIZE = 18;

  const allPoints = useMemo(() => [...extraPoints, ...GJ.ALL_POINTS], [extraPoints]);

  const filtered = useMemo(() => {
    return allPoints.filter(p => {
      if (tipo !== 'Todos' && p.tipo !== tipo) return false;
      if (zona !== 'Todas' && p.zona !== zona) return false;
      if (estado !== 'Todos' && p.estado !== estado) return false;
      if (q) {
        const Q = q.toLowerCase();
        if (!p.id.toLowerCase().includes(Q) && !p.muniName.toLowerCase().includes(Q)) return false;
      }
      return true;
    });
  }, [tipo, zona, estado, q, allPoints]);

  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  function handleSaveNew(point) {
    setExtraPoints(prev => [point, ...prev]);
    setShowNewForm(false);
    if (window.showToast) window.showToast('Punto ' + point.id + ' registrado · ' + point.muniName, 'success');
  }

  return (
    <>
      <PageHead
        crumb="DWH · ADMINISTRACIÓN"
        title="Administración"
        right={<>
          <div><b>Tabla:</b> fact_medicion</div>
          <div><b>Mediciones:</b> {allPoints.length.toLocaleString('es-CO')}</div>
          <div><b>Datos:</b> {window.GJ_API_LIVE ? 'Supabase en vivo' : 'copia estática'}</div>
        </>}
      />

      {/* Sub-tab bar */}
      <div className="card card-pad" style={{display:'flex', gap:4, marginBottom:16, padding:'8px 12px'}}>
        {[
          { id:'monitoreo', label:'Puntos de monitoreo' },
          { id:'reporte',   label:'Generador de reportes' },
        ].map(t => (
          <button
            key={t.id}
            className={'nav-item' + (subTab === t.id ? ' active' : '')}
            style={{padding:'6px 18px', fontSize:12}}
            onClick={() => setSubTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Generador de reportes ── */}
      {subTab === 'reporte' && <ReportGenerator />}

      {/* ── Puntos de monitoreo ── */}
      {subTab === 'monitoreo' && <>

      {/* Toolbar */}
      <div className="card card-pad" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:16, flexWrap:'wrap'}}>
        <div className="flex center" style={{gap:16, flexWrap:'wrap'}}>
          <div className="search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#888888" strokeWidth="1.2"/><line x1="11" y1="11" x2="14" y2="14" stroke="#888888" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <input placeholder="Buscar por ID o municipio…" value={q} onChange={e => { setQ(e.target.value); setPage(0); }} />
          </div>
          <Seg options={['Todos','Pozo','Aljibe','Manantial']} value={tipo} onChange={(v)=>{setTipo(v); setPage(0);}} />
          <Seg options={['Todas','Alta','Media','Baja']} value={zona} onChange={(v)=>{setZona(v); setPage(0);}} />
          <Seg options={['Todos','Apta','Precaución','Crítico']} value={estado} onChange={(v)=>{setEstado(v); setPage(0);}} />
        </div>
        <div className="flex center" style={{gap:10}}>
          <button className="chip" style={{padding:'7px 14px'}} onClick={() => exportCSV(filtered)}>↓ Exportar CSV</button>
          <button className="chip active" style={{padding:'7px 14px'}} onClick={() => setShowNewForm(true)}>+ Nuevo punto</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid" style={{gridTemplateColumns:'repeat(5, 1fr)', gap:16, marginBottom:16}}>
        <div className="card card-pad" style={{padding:'14px 16px'}}>
          <div className="kpi-label" style={{marginBottom:6}}>Resultado</div>
          <div className="mono tabular" style={{fontSize:22, color:'var(--text)'}}>{filtered.length.toLocaleString('es-CO')}</div>
          <div className="mono" style={{fontSize:10, color:'var(--text-3)', marginTop:4}}>DE {allPoints.length.toLocaleString('es-CO')} TOTAL</div>
        </div>
        <div className="card card-pad" style={{padding:'14px 16px'}}>
          <div className="kpi-label" style={{marginBottom:6}}>Pozos</div>
          <div className="mono tabular" style={{fontSize:22}}>{filtered.filter(p => p.tipo === 'Pozo').length}</div>
        </div>
        <div className="card card-pad" style={{padding:'14px 16px'}}>
          <div className="kpi-label" style={{marginBottom:6}}>Aljibes</div>
          <div className="mono tabular" style={{fontSize:22}}>{filtered.filter(p => p.tipo === 'Aljibe').length}</div>
        </div>
        <div className="card card-pad" style={{padding:'14px 16px'}}>
          <div className="kpi-label" style={{marginBottom:6}}>Manantiales</div>
          <div className="mono tabular" style={{fontSize:22}}>{filtered.filter(p => p.tipo === 'Manantial').length}</div>
        </div>
        <div className="card card-pad" style={{padding:'14px 16px'}}>
          <div className="kpi-label" style={{marginBottom:6}}>Inactivos</div>
          <div className="mono tabular" style={{fontSize:22, color:'#b5403d'}}>{filtered.filter(p => !p.activo).length}</div>
        </div>
      </div>

      {/* Main split: table + Kimball bus matrix sidebar */}
      <div className="grid" style={{gridTemplateColumns:'1.7fr 1fr', gap:16}}>
        <div className="card">
          <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width:110}}>ID</th>
                <th style={{width:140}}>Municipio</th>
                <th style={{width:80}}>Zona</th>
                <th style={{width:100}}>Tipo</th>
                <th>pH</th>
                <th>Cond. <span className="mu">µS/cm</span></th>
                <th>Sal. <span className="mu">mS/cm</span></th>
                <th>Temp. °C</th>
                <th>STD <span className="mu">mg/L</span></th>
                <th>Prof. m</th>
                <th style={{width:80}}>Época</th>
                <th style={{width:120}}>Estado</th>
                <th style={{width:32}}></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(p => (
                <tr key={p.id} style={{cursor:'pointer'}} onClick={() => setDetailPoint(p)}>
                  <td><span className="mono" style={{color:'var(--text-2)', whiteSpace:'nowrap'}}>{p.id}</span></td>
                  <td>{p.muniName}</td>
                  <td><span className="mono" style={{color:'var(--text-3)', fontSize:11}}>{p.zona.toUpperCase()}</span></td>
                  <td>{p.tipo}</td>
                  <td className="num"><span className="mono">{GJ.fmtNum(p.ph)}</span></td>
                  <td className="num"><span className="mono">{p.cond.toLocaleString('es-CO')}</span></td>
                  <td className="num"><span className="mono">{GJ.fmtNum(p.sal, 2)}</span></td>
                  <td className="num"><span className="mono">{GJ.fmtNum(p.temp)}</span></td>
                  <td className="num"><span className="mono">{GJ.fmtMiles(p.std)}</span></td>
                  <td className="num"><span className="mono">{GJ.fmtNum(p.prof)}</span></td>
                  <td><span className="mono" style={{color:'var(--text-2)', fontSize:11}}>{p.temporada}</span></td>
                  <td><StatusPill estado={p.estado} /></td>
                  <td style={{textAlign:'right', color:'var(--text-3)'}}>›</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>{/* /tbl-wrap */}

          {/* Pagination */}
          <div className="flex between center" style={{padding:'14px 16px', borderTop:'1px solid var(--border)'}}>
            <div className="mono" style={{fontSize:11, color:'var(--text-3)'}}>
              Mostrando {(page * PAGE_SIZE + 1).toLocaleString('es-CO')}–{Math.min((page+1) * PAGE_SIZE, filtered.length).toLocaleString('es-CO')} de {filtered.length.toLocaleString('es-CO')}
            </div>
            <div className="flex center" style={{gap:6}}>
              <button className="chip" onClick={()=>setPage(Math.max(0, page-1))} disabled={page===0} style={{padding:'5px 10px'}}>← Anterior</button>
              <span className="mono tabular" style={{fontSize:11, color:'var(--text-2)', padding:'0 10px'}}>{page+1} / {totalPages}</span>
              <button className="chip" onClick={()=>setPage(Math.min(totalPages-1, page+1))} disabled={page>=totalPages-1} style={{padding:'5px 10px'}}>Siguiente →</button>
            </div>
          </div>
        </div>

        {/* Bus matrix sidebar */}
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div className="card card-pad">
            <SecTitle title="Enterprise Bus Matrix" sub="KIMBALL · PROCESOS × DIMS" />
            <table className="tbl" style={{marginTop:6}}>
              <thead>
                <tr>
                  <th style={{width:42}}>P#</th>
                  <th>Proceso</th>
                  {GJ.BUS_MATRIX.dims.map(d => (
                    <th key={d} style={{textAlign:'center', writingMode:'vertical-rl', transform:'rotate(180deg)', padding:'8px 4px', minWidth:24}}>
                      {d.replace('DIM_','')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GJ.BUS_MATRIX.procesos.map((p, i) => (
                  <tr key={p.id}>
                    <td><span className="mono" style={{color:'var(--ocre)', fontSize:11, whiteSpace:'nowrap'}}>{p.id}</span></td>
                    <td style={{fontSize:11}}>{p.name}<div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{p.freq} · {p.actor}</div></td>
                    {GJ.BUS_MATRIX.cells[i].map((c, j) => (
                      <td key={j} style={{textAlign:'center', fontFamily:'SF Mono, ui-monospace, JetBrains Mono, Menlo, Monaco, monospace', color: c==='✓'?'var(--teal)':'var(--text-3)', fontSize:14}}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card card-pad">
            <SecTitle title="Tabla de hechos · fact_medicion" sub="api/schema.sql" />
            <pre className="mono" style={{fontSize:10.5, color:'var(--text-2)', lineHeight:1.5, margin:0, whiteSpace:'pre-wrap'}}>
{`CREATE TABLE fact_medicion (
  id_medicion   VARCHAR(20) PRIMARY KEY,
  id_punto      VARCHAR(20) REFERENCES dim_punto,
  id_municipio  VARCHAR(3)  REFERENCES dim_municipio,
  id_tiempo     INTEGER     REFERENCES dim_tiempo,
  ph            DECIMAL(5,3),
  conductividad DECIMAL(8,1),
  salinidad     DECIMAL(6,3),
  temperatura   DECIMAL(5,2),
  std_mg_l      DECIMAL(8,1),
  estado        VARCHAR(15),  -- Apta | Precaución | Crítico
  created_at    TIMESTAMPTZ DEFAULT NOW()
);`}
            </pre>
          </div>

          <div className="card card-pad">
            <SecTitle title="Origen de los datos" sub={window.GJ_API_LIVE ? 'SUPABASE · EN VIVO' : 'COPIA ESTÁTICA'} />
            <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:4}}>
              {(() => {
                const pts = GJ.ALL_POINTS;
                const seca = pts.filter(p => p.temporada === 'Seca');
                const hum  = pts.filter(p => p.temporada === 'Húmeda');
                const rango = arr => {
                  if (!arr.length) return '—';
                  const f = arr.map(p => p.fecha).sort();
                  return f[0] === f[f.length - 1] ? GJ.fechaCorta(f[0]) : GJ.fechaCorta(f[0]) + ' – ' + GJ.fechaCorta(f[f.length - 1]);
                };
                const filas = [
                  ['Fuente', window.GJ_API_LIVE ? 'API · Supabase' : 'real-data.js (API sin respuesta)'],
                  ['Mediciones cargadas', pts.length.toLocaleString('es-CO')],
                  ['Fuentes distintas', GJ.ULTIMA_POR_FUENTE.length.toLocaleString('es-CO')],
                  ['Campaña época seca', `${seca.length.toLocaleString('es-CO')} · ${rango(seca)}`],
                  ['Campaña época húmeda', `${hum.length.toLocaleString('es-CO')} · ${rango(hum)}`],
                  ['Regla de clasificación', 'api/calidad.py'],
                ];
                return filas.map(([k, v]) => (
                  <div key={k} className="flex between center" style={{fontSize:12, gap:12, paddingBottom:8, borderBottom:'1px solid var(--border)'}}>
                    <span style={{color:'var(--text-2)'}}>{k}</span>
                    <span className="mono" style={{fontSize:11, textAlign:'right'}}>{v}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {detailPoint && <DetailModal point={detailPoint} onClose={() => setDetailPoint(null)} />}
      {showNewForm  && <NuevoPuntoModal onClose={() => setShowNewForm(false)} onSave={handleSaveNew} />}
      </>}
    </>
  );
}

window.PageAdmin = PageAdmin;
