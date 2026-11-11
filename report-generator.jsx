// Generador de reportes — Reportes recientes a la izquierda, generador a la derecha

// ── Constantes de columnas ────────────────────────────────────────────────────
const VAR_COL  = { 'pH':'ph', 'Conductividad':'cond', 'Salinidad':'sal', 'Temperatura':'temp', 'STD':'std', 'Profundidad':'prof' };
const VAR_UNIT = { 'pH':'', 'Conductividad':'µS/cm', 'Salinidad':'mS/cm', 'Temperatura':'°C', 'STD':'mg/L', 'Profundidad':'m' };

function getPeriodRange(periodo) {
  // El dataset tiene dos campañas: seca feb-2026 (1 543 pts) y húmeda oct-2025 (192 pts).
  // Los rangos se anclan a esas fechas reales para garantizar filas en la exportación.
  if (periodo === 'Ciclo seco 2026')   return { start: new Date(2026,1,1),  end: new Date(2026,2,31)  }; // feb-2026
  if (periodo === 'Ciclo húmedo 2025') return { start: new Date(2025,9,1),  end: new Date(2025,10,30) }; // oct-2025
  if (periodo === 'Q1 2026')           return { start: new Date(2026,0,1),  end: new Date(2026,2,31)  }; // ene-mar 2026
  if (periodo === '2025 completo')     return { start: new Date(2025,0,1),  end: new Date(2025,11,31) }; // todo 2025
  return null; // Personalizado → sin filtro de fecha
}

// Escapa texto antes de insertarlo en el HTML del reporte (evita inyección de scripts
// si algún dato de la base contiene etiquetas HTML).
function escHtml(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildPDFHtml({ pts, sample, muniStats, selectedVars, varCols, periodo, tipoObj }) {
  const tagCls = e => e === 'Apta' ? 'apta' : e === 'Crítico' ? 'critico' : 'precaucion';
  const kpis = GJ.KPIS;

  const muniRows = muniStats.map(m =>
    `<tr><td>${escHtml(m.name)}</td><td>${escHtml(m.zona)}</td><td>${escHtml(m.n)}</td>
     <td>${GJ.fmtNum(m.ph, 2)}</td><td>${m.cond.toLocaleString('es-CO')}</td>
     <td>${GJ.fmtNum(m.sal, 2)}</td>
     <td><span class="tag critico">${m.criticos}</span></td>
     <td><span class="tag apta">${m.apta}</span></td></tr>`
  ).join('');

  const dataHeader = selectedVars.map(v =>
    `<th>${v}${VAR_UNIT[v] ? ' (' + '<span style="text-transform:none">' + VAR_UNIT[v] + '</span>' + ')' : ''}</th>`
  ).join('');

  const dataRows = sample.map(p =>
    `<tr>
      <td class="mono">${escHtml(p.id)}</td>
      <td>${escHtml(p.muniName)}</td><td>${escHtml(p.tipo)}</td><td>${escHtml(p.temporada)}</td>
      <td><span class="tag ${tagCls(p.estado)}">${escHtml(p.estado)}</span></td>
      ${varCols.map(c => `<td class="num">${p[c] != null ? escHtml(GJ.fmtNum(p[c])) : '—'}</td>`).join('')}
    </tr>`
  ).join('');

  const overflow = pts.length > 150
    ? `<p class="note">… ${(pts.length - 150).toLocaleString('es-CO')} registros adicionales no mostrados. Use CSV/XLSX para el dataset completo.</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>Guajiragua · ${escHtml(tipoObj.name)} · ${escHtml(periodo)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Helvetica Neue',Arial,sans-serif;color:#111;font-size:10.5pt;line-height:1.5}
  .cover{background:#0f0f0f;color:#fff;padding:52px 48px;page-break-after:always}
  .cover .eyebrow{font-family:monospace;font-size:9pt;color:#888;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px}
  .cover h1{font-size:26pt;font-weight:300;margin-bottom:6px}
  .cover .desc{font-size:11pt;color:#bbb;font-family:monospace;margin-bottom:32px}
  .cover .meta{display:flex;gap:28px;flex-wrap:wrap}
  .cover .meta-cell b{display:block;font-size:16pt;font-family:monospace;font-weight:400;color:#fff}
  .cover .meta-cell span{font-size:9pt;color:#888;text-transform:uppercase;letter-spacing:.08em;font-family:monospace}
  section{padding:24px 32px;page-break-inside:avoid}
  h2{font-size:12pt;font-weight:500;border-bottom:2px solid #e5e5e5;padding-bottom:6px;margin:20px 0 14px;text-transform:uppercase;letter-spacing:.08em;font-family:monospace}
  table{width:100%;border-collapse:collapse;font-size:9pt}
  th{text-align:left;padding:6px 10px;background:#f5f5f5;border-bottom:2px solid #e0e0e0;font-family:monospace;font-size:8pt;text-transform:uppercase;letter-spacing:.08em;color:#666;white-space:nowrap}
  td{padding:5px 10px;border-bottom:1px solid #f0f0f0;vertical-align:middle}
  tr:nth-child(even) td{background:#fafafa}
  .mono{font-family:monospace;font-size:8.5pt}
  .num{font-family:monospace;text-align:right}
  .tag{display:inline-block;padding:1px 7px;border-radius:2px;font-size:8pt;font-family:monospace;font-weight:600}
  .apta{background:#e6f4eb;color:#2e8b57}
  .critico{background:#fde8e8;color:#b5403d}
  .precaucion{background:#fdf3e0;color:#c97a2b}
  .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:14px 0}
  .kpi{border:1px solid #e5e5e5;border-radius:4px;padding:14px 16px}
  .kpi .val{font-size:20pt;font-family:monospace;font-weight:300;color:#111}
  .kpi .lbl{font-size:8pt;text-transform:uppercase;letter-spacing:.1em;color:#6b6b6b;margin-top:4px;font-family:monospace}
  .note{font-size:8.5pt;color:#6b6b6b;font-family:monospace;margin-top:10px;padding:8px 10px;border-left:2px solid #e0e0e0}
  .footer{text-align:center;font-size:8pt;color:#6b6b6b;padding:14px 32px;border-top:1px solid #e5e5e5;font-family:monospace;letter-spacing:.04em}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.cover{page-break-after:always}}
</style>
</head>
<body>

<div class="cover">
  <div class="eyebrow">Guajiragua · Sistema BI Hidrogeológico · SGC / Corpoguajira</div>
  <h1>${escHtml(tipoObj.name)}</h1>
  <div class="desc">${escHtml(tipoObj.desc)}</div>
  <div class="meta">
    <div class="meta-cell"><b>${escHtml(periodo)}</b><span>Periodo</span></div>
    <div class="meta-cell"><b>${pts.length.toLocaleString('es-CO')}</b><span>Registros</span></div>
    <div class="meta-cell"><b>${muniStats.length}/${GJ.MUNICIPIOS.length}</b><span>Municipios</span></div>
    <div class="meta-cell"><b>${selectedVars.length}</b><span>Variables</span></div>
    <div class="meta-cell"><b>${new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})}</b><span>Generado</span></div>
  </div>
</div>

<section>
  <h2>KPIs · Indicadores estratégicos</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="val">${kpis.iph}</div><div class="lbl">IPH · Índice de Potabilidad Hídrica</div></div>
    <div class="kpi"><div class="val">${kpis.ida}</div><div class="lbl">IDA · Deterioro del Acuífero</div></div>
    <div class="kpi"><div class="val">${kpis.phPromedio}</div><div class="lbl">pH promedio global</div></div>
    <div class="kpi"><div class="val">${kpis.puntosCriticos}</div><div class="lbl">Puntos en estado crítico</div></div>
    <div class="kpi"><div class="val">${kpis.coberturaPct}%</div><div class="lbl">Cobertura hídrica activa</div></div>
    <div class="kpi"><div class="val">${kpis.aptos}</div><div class="lbl">Captadores con agua apta</div></div>
  </div>
</section>

<section>
  <h2>Resumen por municipio</h2>
  <table>
    <thead><tr><th>Municipio</th><th>Zona</th><th>N</th><th>pH prom.</th><th>Cond. <span style="text-transform:none">µS/cm</span></th><th>Sal. <span style="text-transform:none">mS/cm</span></th><th>Críticos</th><th>Aptos</th></tr></thead>
    <tbody>${muniRows}</tbody>
  </table>
</section>

<section style="page-break-before:always">
  <h2>Datos de medición · ${sample.length < pts.length ? 'primeros ' + sample.length + ' de ' + pts.length.toLocaleString('es-CO') : pts.length.toLocaleString('es-CO')} registros</h2>
  <table>
    <thead><tr>
      <th>ID</th><th>Municipio</th><th>Tipo</th><th>Época</th><th>Estado</th>
      ${dataHeader}
    </tr></thead>
    <tbody>${dataRows}</tbody>
  </table>
  ${overflow}
</section>

<div class="footer">
  Guajiragua · Sistema BI Hidrogeológico · Fuente: Mapa_PH_Guajira.csv (SGC / Corpoguajira) ·
  Generado ${new Date().toLocaleString('es-CO')}
</div>

<script>window.addEventListener('load', () => setTimeout(() => window.print(), 400));<\/script>
</body>
</html>`;
}

// ── Componente principal ──────────────────────────────────────────────────────
function ReportGenerator() {
  const REPORT_TYPES = [
    { id:'calidad',   name:'Calidad fisicoquímica',    desc:'pH, conductividad, salinidad, STD por municipio',  color:'#2c5fa6', defaultVars:['pH','Conductividad','Salinidad','STD'], kpis:['IPH · Potabilidad','pH por zona'] },
    { id:'sostenib',  name:'Sostenibilidad hídrica',   desc:'IDA, tendencias estacionales, proyecciones',        color:'#3a8580', defaultVars:['Salinidad','Conductividad','Profundidad'], kpis:['IDA · Deterioro','Variación salinidad'] },
    { id:'alertas',   name:'Alertas y puntos críticos',desc:'Umbrales fuera de rango — IPH<50, pH<6, SAL>2',    color:'#b5403d', defaultVars:['pH','Salinidad','STD'], kpis:['Tasa críticos','IPH · Potabilidad'] },
    { id:'cobertura', name:'Cobertura geoespacial',    desc:'Captadores activos y densidad por zona',            color:'#2e8b57', defaultVars:['pH','Temperatura'], kpis:['Cobertura activa','Captadores activos'] },
    { id:'custom',    name:'Personalizado',            desc:'Selecciona variables y KPIs manualmente',           color:'#888888', defaultVars:[], kpis:[] },
  ];
  const PERIODOS    = ['Ciclo seco 2026','Ciclo húmedo 2025','Q1 2026','2025 completo','Personalizado'];
  const FORMATOS    = [
    { id:'pdf',  name:'PDF',  desc:'Ejecutivo · 12–20 pp · con gráficas' },
    { id:'csv',  name:'CSV',  desc:'Tabular crudo · UTF-8 · separador ;' },
    { id:'xlsx', name:'XLSX', desc:'Multi-hoja · dashboards embebidos' },
  ];
  const VARIABLES   = ['pH','Conductividad','Salinidad','Temperatura','STD','Profundidad'];
  const KPIS_ALL    = ['IPH · Potabilidad','IDA · Deterioro','Variación salinidad','Tasa críticos','Cobertura activa','pH por zona'];

  const [tipo, setTipo]               = useState('alertas');
  const [periodo, setPeriodo]         = useState('Q1 2026');
  const [recentFilter, setRecentFilter] = useState('Todos');
  const [municipios, setMunicipios]   = useState(new Set(GJ.MUNICIPIOS.map(m => m.id)));
  const [variables, setVariables]     = useState(new Set(['pH','Conductividad','Salinidad','STD']));
  const [kpis, setKpis]               = useState(new Set(['Tasa críticos','IPH · Potabilidad']));
  const [formato, setFormato]         = useState('pdf');
  const [generating, setGenerating]   = useState(null); // null | 'progress' | 'done' | 'error'

  // Reportes generados en esta sesión (no hay historial guardado en el servidor)
  const [allRecents, setAllRecents] = useState([]);

  const selectedType = REPORT_TYPES.find(t => t.id === tipo);

  function selectType(t) {
    setTipo(t.id);
    if (t.id !== 'custom') {
      setVariables(new Set(t.defaultVars));
      setKpis(new Set(t.kpis));
    }
  }

  function toggle(set, item, setter) {
    const next = new Set(set);
    if (next.has(item)) next.delete(item); else next.add(item);
    setter(next);
  }

  function selectAllMunicipios() {
    if (municipios.size === GJ.MUNICIPIOS.length) setMunicipios(new Set());
    else setMunicipios(new Set(GJ.MUNICIPIOS.map(m => m.id)));
  }



  const muniN     = municipios.size;
  const totalRows = Math.round((muniN / GJ.MUNICIPIOS.length) * GJ.ALL_POINTS.length);
  const pagesEst  = formato === 'pdf' ? Math.max(8, 4 + variables.size * 2 + kpis.size + Math.floor(muniN / 3)) : '—';
  const sizeMb    = formato === 'pdf' ? (1.8 + variables.size * 0.6 + kpis.size * 0.3 + muniN * 0.1).toFixed(1) :
                    formato === 'csv' ? (0.08 + totalRows * 0.00012).toFixed(2) :
                    (1.2 + variables.size * 0.4 + kpis.size * 0.25).toFixed(1);

  // ── Generación real ─────────────────────────────────────────────────────────
  function generate() {
    if (generating === 'progress') return;
    setGenerating('progress');

    // Capturar valores actuales en closures
    const capturedSizeMb   = sizeMb;
    const capturedTipo     = tipo;
    const capturedFormato  = formato;
    const capturedPeriodo  = periodo;
    const capturedMunicipios  = new Set(municipios);
    const capturedVariables   = new Set(variables);
    const capturedSelectedType = { ...selectedType };

    setTimeout(async () => {
      try {
        // 1. Filtrar puntos por municipio y período
        const range = getPeriodRange(capturedPeriodo);
        const pts = GJ.ALL_POINTS.filter(p => {
          if (!capturedMunicipios.has(p.muni)) return false;
          if (range) {
            const d = new Date(p.fecha);
            if (d < range.start || d > range.end) return false;
          }
          return true;
        });

        if (pts.length === 0) {
          if (window.showToast) window.showToast(
            'Sin datos para el período "' + capturedPeriodo + '" — prueba Ciclo seco 2026, Q1 2026 o Personalizado.',
            'warn'
          );
          setGenerating(null);
          return;
        }

        const selectedVars = VARIABLES.filter(v => capturedVariables.has(v));
        const varCols      = selectedVars.map(v => VAR_COL[v]);
        const muniStats    = GJ.MUNI_AGG.filter(m => capturedMunicipios.has(m.id));

        if (capturedFormato === 'csv') {
          // ── CSV real ──────────────────────────────────────────────────────
          const header = [
            'ID','Municipio','Zona','Tipo','Uso','Método','Época','Estado','Fecha',
            ...selectedVars.map(v => v + (VAR_UNIT[v] ? ' (' + VAR_UNIT[v] + ')' : ''))
          ].join(';');
          const rows = pts.map(p => [
            p.id, p.muniName, p.zona, p.tipo, p.uso, p.metodo, p.temporada, p.estado, p.fecha,
            ...varCols.map(c => p[c] != null ? String(p[c]).replace('.', ',') : '')
          ].join(';'));
          const csv  = '﻿' + header + '\r\n' + rows.join('\r\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const a    = document.createElement('a');
          a.href     = URL.createObjectURL(blob);
          a.download = `GJ_${capturedTipo}_${capturedPeriodo.replace(/\s+/g,'_')}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);

        } else if (capturedFormato === 'xlsx') {
          // ── XLSX real (SheetJS) ───────────────────────────────────────────
          const X = await cargarXLSX();

          const dataSheet = pts.map(p => {
            const row = {
              ID: p.id, Municipio: p.muniName, Zona: p.zona,
              Tipo: p.tipo, Uso: p.uso, Método: p.metodo,
              Época: p.temporada, Estado: p.estado, Fecha: p.fecha,
            };
            selectedVars.forEach((v, i) => {
              row[v + (VAR_UNIT[v] ? ' (' + VAR_UNIT[v] + ')' : '')] = p[varCols[i]];
            });
            return row;
          });

          const muniSheet = muniStats.map(m => ({
            Municipio: m.name, Zona: m.zona, 'N puntos': m.n,
            'pH prom.': m.ph, 'Cond. µS/cm': m.cond, 'Sal. mS/cm': m.sal,
            'Temp. °C': m.temp, 'STD mg/L': m.std,
            Críticos: m.criticos, Aptos: m.apta,
          }));

          const kpiSheet = [
            { Indicador: 'IPH · Índice de Potabilidad Hídrica', Valor: GJ.KPIS.iph },
            { Indicador: 'IDA · Deterioro del Acuífero',        Valor: GJ.KPIS.ida },
            { Indicador: 'pH Promedio',                          Valor: GJ.KPIS.phPromedio },
            { Indicador: 'Puntos Críticos',                      Valor: GJ.KPIS.puntosCriticos },
            { Indicador: 'Precaución',                           Valor: GJ.KPIS.precaucion },
            { Indicador: 'Aptos',                                Valor: GJ.KPIS.aptos },
            { Indicador: 'Cobertura Hídrica %',                  Valor: GJ.KPIS.coberturaPct },
            { Indicador: 'Total puntos',                         Valor: GJ.KPIS.total },
          ];

          const wb = X.utils.book_new();
          X.utils.book_append_sheet(wb, X.utils.json_to_sheet(dataSheet),  'Datos');
          X.utils.book_append_sheet(wb, X.utils.json_to_sheet(muniSheet),  'Resumen municipios');
          X.utils.book_append_sheet(wb, X.utils.json_to_sheet(kpiSheet),   'KPIs');
          X.writeFile(wb, `GJ_${capturedTipo}_${capturedPeriodo.replace(/\s+/g,'_')}.xlsx`);

        } else {
          // ── PDF → HTML imprimible en nueva pestaña ────────────────────────
          const sample = pts.slice(0, 150);
          const html = buildPDFHtml({
            pts, sample, muniStats,
            selectedVars, varCols,
            periodo: capturedPeriodo,
            tipoObj: capturedSelectedType,
          });
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          const url  = URL.createObjectURL(blob);
          const win  = window.open(url, '_blank');
          if (!win) {
            // Fallback: descarga directa del HTML
            const a = document.createElement('a');
            a.href = url; a.download = `GJ_${capturedTipo}_${capturedPeriodo.replace(/\s+/g,'_')}.html`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
          }
          // La página HTML tiene <script>window.print()</script> al cargarse
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }

        // ── Agregar a historial de recientes ─────────────────────────────
        setAllRecents(prev => {
          const newId = 'Reporte ' + (prev.length + 1);
          return [{
            id:    newId,
            title: capturedSelectedType.name + ' · ' + capturedPeriodo,
            tipo:  capturedTipo,
            fmt:   capturedFormato.toUpperCase(),
            fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
            user:  (window.GJ_AUTH && window.GJ_AUTH.session() && window.GJ_AUTH.session().usuario) || 'admin',
            size:  '≈ ' + GJ.fmtNum(capturedSizeMb) + ' MB',
          }, ...prev];
        });

        if (window.showToast) window.showToast(
          'Reporte generado · ' + capturedFormato.toUpperCase() + ' · ' + pts.length.toLocaleString('es-CO') + ' registros',
          'success'
        );
        setGenerating('done');
        setTimeout(() => setGenerating(null), 3000);

      } catch (err) {
        console.error('generate():', err);
        if (window.showToast) window.showToast('Error: ' + err.message, 'error');
        setGenerating('error');
        setTimeout(() => setGenerating(null), 3000);
      }
    }, 30);
  }

  // ── Filtros de recientes ────────────────────────────────────────────────────
  const filterMap = { 'Todos': null, 'Calidad': 'calidad', 'Alertas': 'alertas', 'Sostenib.': 'sostenib', 'Cobertura': 'cobertura' };
  const recents   = recentFilter === 'Todos'
    ? allRecents
    : allRecents.filter(r => r.tipo === filterMap[recentFilter]);


  const canGenerate = generating !== 'progress' && variables.size > 0 && municipios.size > 0;
  const btnBg = generating === 'done' ? '#2e8b57' : generating === 'error' ? '#b5403d' : '#0f0f0f';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="grid" style={{gridTemplateColumns:'0.95fr 1.6fr', gap:16, marginBottom:16, alignItems:'stretch'}}>

      {/* LEFT — Recent reports */}
      <div className="card" style={{display:'flex', flexDirection:'column'}}>
        <div className="card-pad" style={{paddingBottom:14, borderBottom:'1px solid var(--border)'}}>
          <div className="flex between center">
            <div>
              <div className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.18em', textTransform:'uppercase'}}>
                ESTA SESIÓN
              </div>
              <h3 style={{margin:'4px 0 0', fontSize:18, fontWeight:500}}>Reportes generados</h3>
            </div>
            <span className="pill neut" style={{borderRadius:3}}>{recents.length} archivos</span>
          </div>
          <div className="flex center" style={{gap:6, marginTop:14}}>
            {Object.keys(filterMap).map(f => (
              <button key={f}
                className={'chip' + (recentFilter === f ? ' active' : '')}
                aria-pressed={recentFilter === f}
                style={{padding:'5px 10px', fontSize:11}}
                onClick={() => setRecentFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="scroll-y" style={{flex:1, overflowY:'auto'}}>
          {recents.map(r => {
            const t = REPORT_TYPES.find(x => x.id === r.tipo) || REPORT_TYPES[4];
            return (
              <div key={r.id}
                style={{padding:'14px 18px', borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background .15s ease'}}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.025)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="flex between center" style={{marginBottom:6}}>
                  <span className="mono" style={{fontSize:10.5, color:'var(--text-3)', letterSpacing:'0.06em'}}>{r.id}</span>
                  <span className="mono" style={{fontSize:9.5, color:'var(--text-3)', letterSpacing:'0.08em'}}>{r.fecha}</span>
                </div>
                <div style={{fontSize:13, color:'var(--text)', marginBottom:8, lineHeight:1.35}}>{r.title}</div>
                <div className="flex between center">
                  <div className="flex center" style={{gap:10}}>
                    <span className="flex center" style={{gap:6}}>
                      <span style={{width:6, height:6, borderRadius:'50%', background:t.color}}/>
                      <span className="mono" style={{fontSize:10.5, color:'var(--text-2)', letterSpacing:'0.04em'}}>{t.name.split(' ')[0]}</span>
                    </span>
                    <span className="mono" style={{fontSize:10, color:'var(--text-3)', padding:'1px 6px', border:'1px solid var(--border-2)', borderRadius:2, letterSpacing:'0.06em'}}>{r.fmt}</span>
                    <span className="mono tabular" style={{fontSize:10.5, color:'var(--text-3)'}}>{r.size}</span>
                  </div>

                </div>
                <div className="mono" style={{fontSize:9.5, color:'var(--text-3)', marginTop:8, letterSpacing:'0.04em'}}>
                  por <span style={{color:'var(--text-2)'}}>{r.user}</span>
                </div>
              </div>
            );
          })}
        </div>

        {allRecents.length === 0 && (
          <div className="card-pad" style={{color:'var(--text-2)', fontSize:13, lineHeight:1.5}}>
            Aún no has generado reportes en esta sesión. Los que generes aparecerán aquí; el archivo se descarga en el momento de generarlo.
          </div>
        )}
      </div>

      {/* RIGHT — Generator */}
      <div className="card" style={{display:'flex', flexDirection:'column'}}>
        <div className="card-pad" style={{paddingBottom:14, borderBottom:'1px solid var(--border)'}}>
          <div className="flex between center">
            <div>
              <div className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.18em', textTransform:'uppercase'}}>
                DM_CALIDAD · DM_SOSTENIB · DM_COBERTURA
              </div>
              <h3 style={{margin:'4px 0 0', fontSize:18, fontWeight:500}}>Generador de reportes</h3>
            </div>
            <span className="pill neut" style={{borderRadius:3}}>v2.4.1</span>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:0, flex:1}}>
          {/* LEFT pane — Configuration */}
          <div className="card-pad" style={{borderRight:'1px solid var(--border)'}}>

            <FormGroup label="01 · Tipo de reporte">
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                {REPORT_TYPES.map(t => {
                  const sel = tipo === t.id;
                  return (
                    <button key={t.id}
                      aria-pressed={sel}
                      onClick={() => selectType(t)}
                      style={{
                        textAlign:'left', padding:'12px 14px',
                        background: sel ? '#ffffff' : 'transparent',
                        border:'1px solid ' + (sel ? '#0f0f0f' : 'var(--border-2)'),
                        borderRadius:3, cursor:'pointer',
                        display:'flex', gap:10, alignItems:'flex-start',
                        boxShadow: sel ? '0 0 0 1px #0f0f0f inset' : 'none',
                        transition:'all .15s ease',
                      }}>
                      <span style={{width:10, height:10, borderRadius:'50%', background: sel ? t.color : 'transparent', boxShadow:'0 0 0 1px ' + t.color, marginTop:5, flexShrink:0}}/>
                      <span style={{flex:1}}>
                        <div style={{fontSize:12.5, color:'var(--text)', fontWeight: sel ? 500 : 400}}>{t.name}</div>
                        <div className="mono" style={{fontSize:10, color:'var(--text-3)', marginTop:3, lineHeight:1.4}}>{t.desc}</div>
                      </span>
                    </button>
                  );
                })}
              </div>
            </FormGroup>

            <FormGroup label="02 · Periodo de medición">
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {PERIODOS.map(p => (
                  <button key={p}
                    className={'chip' + (periodo === p ? ' active' : '')}
                    aria-pressed={periodo === p}
                    onClick={() => setPeriodo(p)}
                    style={{padding:'7px 12px', fontSize:12}}>
                    {p}
                  </button>
                ))}
              </div>
              {periodo === 'Personalizado' && (
                <div className="flex center" style={{gap:10, marginTop:10}}>
                  <DateField label="DESDE" value="2026-01-01" />
                  <span className="mono" style={{color:'var(--text-3)'}}>→</span>
                  <DateField label="HASTA" value="2026-04-05" />
                </div>
              )}
            </FormGroup>

            <FormGroup
              label="03 · Municipios"
              right={
                <button onClick={selectAllMunicipios} className="mono"
                  style={{background:'none', border:'none', fontSize:10, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer'}}>
                  {municipios.size === GJ.MUNICIPIOS.length ? 'DESELECCIONAR' : 'SELECCIONAR TODOS'} · {municipios.size}/{GJ.MUNICIPIOS.length}
                </button>
              }>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {GJ.MUNICIPIOS.map(m => (
                  <button key={m.id}
                    className={'chip' + (municipios.has(m.id) ? ' active' : '')}
                    aria-pressed={municipios.has(m.id)}
                    onClick={() => toggle(municipios, m.id, setMunicipios)}
                    style={{padding:'6px 10px', fontSize:11}}>
                    {m.name}
                  </button>
                ))}
              </div>
            </FormGroup>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
              <FormGroup label="04 · Variables">
                <div style={{display:'flex', flexDirection:'column', gap:6}}>
                  {VARIABLES.map(v => (
                    <CheckRow key={v} label={v} checked={variables.has(v)} onChange={() => toggle(variables, v, setVariables)} />
                  ))}
                </div>
              </FormGroup>
              <FormGroup label="05 · KPIs incluidos">
                <div style={{display:'flex', flexDirection:'column', gap:6}}>
                  {KPIS_ALL.map(k => (
                    <CheckRow key={k} label={k} checked={kpis.has(k)} onChange={() => toggle(kpis, k, setKpis)} />
                  ))}
                </div>
              </FormGroup>
            </div>

          </div>

          {/* RIGHT pane — Summary & Actions */}
          <div className="card-pad" style={{background:'var(--bg-2)', display:'flex', flexDirection:'column'}}>
            <div className="mono" style={{fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:14}}>
              RESUMEN DEL PAQUETE
            </div>

            <div style={{padding:'14px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', marginBottom:14}}>
              <div className="flex center" style={{gap:10, marginBottom:6}}>
                <span style={{width:8, height:8, borderRadius:'50%', background:selectedType.color}}/>
                <span style={{fontSize:14, fontWeight:500}}>{selectedType.name}</span>
              </div>
              <div className="mono" style={{fontSize:10.5, color:'var(--text-3)', lineHeight:1.5}}>{selectedType.desc}</div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, borderBottom:'1px solid var(--border)', marginBottom:14}}>
              <StatRow label="Periodo"       value={periodo} />
              <StatRow label="Municipios"    value={`${municipios.size}/${GJ.MUNICIPIOS.length}`} />
              <StatRow label="Variables"     value={variables.size} />
              <StatRow label="KPIs"          value={kpis.size} />
              <StatRow label="Filas est."    value={totalRows.toLocaleString('es-CO')} />
              <StatRow label="Páginas est."  value={pagesEst} />
            </div>

            <div className="mono" style={{fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:8}}>
              FORMATO DE SALIDA
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:14}}>
              {FORMATOS.map(f => {
                const sel = formato === f.id;
                return (
                  <button key={f.id}
                    aria-pressed={sel}
                    onClick={() => setFormato(f.id)}
                    style={{
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'10px 12px',
                      background: sel ? '#ffffff' : 'transparent',
                      border:'1px solid ' + (sel ? '#0f0f0f' : 'var(--border-2)'),
                      borderRadius:3, cursor:'pointer', textAlign:'left',
                    }}>
                    <div>
                      <div className="mono" style={{fontSize:12, fontWeight:600, letterSpacing:'0.06em', color:'var(--text)'}}>{f.name}</div>
                      <div className="mono" style={{fontSize:10, color:'var(--text-3)', marginTop:2}}>{f.desc}</div>
                    </div>
                    <span className="mono tabular" style={{fontSize:11, color: sel ? 'var(--text)' : 'var(--text-3)'}}>~{GJ.fmtNum(sizeMb)} MB</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={generate}
              disabled={!canGenerate}
              style={{
                marginTop:'auto', width:'100%',
                padding:'14px 16px',
                background: btnBg,
                border:'1px solid ' + btnBg,
                color:'#ffffff', fontSize:13, fontWeight:500,
                letterSpacing:'0.04em',
                cursor: canGenerate ? 'pointer' : 'not-allowed',
                opacity: (variables.size === 0 || municipios.size === 0) ? 0.4 : 1,
                borderRadius:3, transition:'all .2s ease',
              }}>
              {generating === 'progress' && <>↻ Generando reporte…</>}
              {generating === 'done'     && <>✓ Reporte generado · descargando</>}
              {generating === 'error'    && <>✕ Error · intenta de nuevo</>}
              {!generating               && <>↓ Generar reporte {formato.toUpperCase()}</>}
            </button>
            {generating === 'progress' && <div className="strip" style={{marginTop:10}}/>}

            <div className="mono" style={{fontSize:10, color:'var(--text-3)', marginTop:12, lineHeight:1.6, letterSpacing:'0.04em'}}>
              {formato === 'pdf'  && '↳ Se abre vista de impresión en nueva pestaña — Ctrl+P / ⌘P para guardar como PDF.'}
              {formato === 'csv'  && '↳ CSV con separador ; y BOM UTF-8 — compatible Excel/LibreOffice.'}
              {formato === 'xlsx' && '↳ Tres hojas: Datos · Resumen municipios · KPIs — generado con SheetJS.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────
function FormGroup({ label, right, children }) {
  return (
    <div style={{marginBottom:22}}>
      <div className="flex between center" style={{marginBottom:10}}>
        <span className="mono" style={{fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.18em'}}>{label}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

function CheckRow({ label, checked, onChange }) {
  return (
    <label className="check-row" style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:12.5, color:'var(--text)', padding:'2px 0'}}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span aria-hidden="true" style={{
        width:14, height:14,
        border:'1px solid ' + (checked ? '#0f0f0f' : 'var(--border-2)'),
        background: checked ? '#0f0f0f' : 'transparent',
        borderRadius:2, display:'inline-flex', alignItems:'center', justifyContent:'center',
        color:'#ffffff', fontSize:10, lineHeight:1, flexShrink:0,
      }}>
        {checked ? '✓' : ''}
      </span>
      {label}
    </label>
  );
}

function DateField({ label, value }) {
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <span className="mono" style={{fontSize:9, color:'var(--text-3)', letterSpacing:'0.18em', marginBottom:4}}>{label}</span>
      <input type="date" defaultValue={value} style={{
        background:'#ffffff', border:'1px solid var(--border-2)', borderRadius:3,
        padding:'7px 10px', color:'var(--text)', fontSize:12,
        fontFamily:'SF Mono, ui-monospace, JetBrains Mono, Menlo, Monaco, monospace',
      }}/>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', padding:'7px 0', borderTop:'1px solid var(--border)', alignItems:'baseline'}}>
      <span className="mono" style={{fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em'}}>{label}</span>
      <span className="mono tabular" style={{fontSize:12, color:'var(--text)'}}>{value}</span>
    </div>
  );
}


// SheetJS (≈ 900 KB) se descarga solo cuando se genera un XLSX
let _xlsxPromesa = null;
function cargarXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (!_xlsxPromesa) {
    _xlsxPromesa = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js';
      s.integrity = 'sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw';
      s.crossOrigin = 'anonymous';
      s.onload = () => (window.XLSX ? resolve(window.XLSX) : reject(new Error('SheetJS no disponible')));
      s.onerror = () => { _xlsxPromesa = null; reject(new Error('No se pudo descargar SheetJS. Revisa la conexión e intenta de nuevo.')); };
      document.head.appendChild(s);
    });
  }
  return _xlsxPromesa;
}

window.ReportGenerator = ReportGenerator;
