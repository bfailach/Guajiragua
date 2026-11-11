// Shared UI components for Guajiragua

const { useState, useMemo, useEffect, useRef } = React;

// ── Top Navigation ───────────────────────────────────────────────
// Las unidades conservan su forma (µS/cm, mS/cm, mg/L) aunque el texto que las
// contiene se muestre en mayúsculas: "MS/CM" se leería como otra unidad.
const UNIDADES_RE = /(µS\/cm|mS\/cm|mg\/L)/;
function conMu(text) {
  if (typeof text !== 'string' || !UNIDADES_RE.test(text)) return text;
  return text.split(UNIDADES_RE).map((parte, i) => i % 2 ? <span key={i} className="mu">{parte}</span> : parte);
}
window.conMu = conMu;

// ── Rutas: cada sección tiene su propia dirección ────────────────────────────
window.GJ_RUTAS = {
  inicio:  { hash: '#/',               titulo: 'Guajiragua · Calidad del agua en La Guajira' },
  fisico:  { hash: '#/fisicoquimica',  titulo: 'Información fisicoquímica · Guajiragua' },
  tend:    { hash: '#/tendencias',     titulo: 'Análisis de tendencias · Guajiragua' },
  alertas: { hash: '#/alertas',        titulo: 'Alertas · Guajiragua' },
  admin:   { hash: '#/administracion', titulo: 'Administración · Guajiragua' },
};

function TopNav({ page }) {
  const left = [
    { id: 'fisico',    label: 'Información fisicoquímica' },
    { id: 'tend',      label: 'Análisis de tendencias' },
  ];
  const right = [
    { id: 'alertas',   label: 'Alertas' },
    { id: 'admin',     label: 'Administración' },
  ];
  // En el celular el menú es una fila deslizable: mantener visible la sección activa
  const navRef = useRef(null);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;
    const act = nav.querySelector('.nav-item.active');
    if (act) nav.scrollTo({ left: Math.max(0, act.offsetLeft - 16), behavior: 'smooth' });
    else nav.scrollTo({ left: 0, behavior: 'smooth' });
  }, [page]);

  const ruta = id => (window.GJ_RUTAS[id] || window.GJ_RUTAS.inicio).hash;
  const item = n => (
    <a key={n.id} href={ruta(n.id)}
       className={'nav-item' + (page === n.id ? ' active' : '')}
       aria-current={page === n.id ? 'page' : undefined}>
      {n.label}
    </a>
  );

  return (
    <nav className="topnav" ref={navRef} aria-label="Secciones">
      {left.map(item)}
      {/* El nombre lleva a la página de inicio */}
      <a href={ruta('inicio')}
         className={'brand' + (page === 'inicio' ? ' active' : '')}
         aria-label="Guajiragua, inicio"
         aria-current={page === 'inicio' ? 'page' : undefined}>
        <div className="brand-mark">
          <span className="brand-name">GUAJIRAGUA</span>
        </div>
      </a>
      {right.map(item)}
    </nav>
  );
}

function BrandGlyph() {
  // A water-drop + arid contour mark, deliberately simple
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="10.2" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.55"/>
      <path d="M11 4.2 C 8 7.5 6.7 9.5 6.7 11.8 a 4.3 4.3 0 0 0 8.6 0 C 15.3 9.5 14 7.5 11 4.2 Z"
            fill="#1a1a1a" opacity="0.18" stroke="#1a1a1a" strokeWidth="0.7"/>
      <line x1="2" y1="11.6" x2="20" y2="11.6" stroke="#555555" strokeWidth="0.5" opacity="0.5" strokeDasharray="0.6 1.2"/>
    </svg>
  );
}

// ── Page Head ────────────────────────────────────────────────────
function PageHead({ crumb, title, right }) {
  return (
    <div className="page-head">
      <div>
        <div className="crumb">{crumb}</div>
        <h1>{title}</h1>
      </div>
      <div className="meta">{right}</div>
    </div>
  );
}

// ── Section title bar ────────────────────────────────────────────
function SecTitle({ title, sub, right }) {
  return (
    <div className="sec-title">
      <div className="flex center" style={{gap:12}}>
        <h3>{title}</h3>
        {sub && <span className="sub">{sub}</span>}
      </div>
      <div>{right}</div>
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────
// subirEsMalo: en indicadores como puntos críticos o deterioro, una subida se
// muestra en rojo y una bajada en verde (la flecha sigue indicando la dirección).
function KpiCard({ label, value, unit, delta, deltaLabel, sparkData, color, subirEsMalo }) {
  const bueno = delta == null || delta === 0 ? null : (delta > 0) !== !!subirEsMalo;
  const stroke = color || '#2c5fa6';
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value tabular">
        {value}
        {unit && <span className="kpi-unit">{conMu(unit)}</span>}
      </div>
      {sparkData && <Spark data={sparkData} stroke={stroke} />}
      <div className="kpi-foot">
        <span className={'delta ' + (bueno === null ? 'flat' : bueno ? 'up' : 'down')}>
          {delta > 0 ? '▲' : delta < 0 ? '▼' : '—'} {delta != null ? GJ.fmtNum(Math.abs(delta)) + '%' : ''}
        </span>
        <span>{deltaLabel}</span>
      </div>
    </div>
  );
}

// ── Sparkline ────────────────────────────────────────────────────
function Spark({ data, stroke = '#2c5fa6', height = 28, fill = false }) {
  if (!data || !data.length) return null;
  const w = 240, h = height, pad = 2;
  const vals = data.filter(v => v != null);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const step = (w - pad*2) / (data.length - 1);
  const pts = data.map((v, i) => {
    if (v == null) return null;
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / range) * (h - pad*2);
    return [x, y];
  }).filter(Boolean);
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const area = d + ` L ${pts[pts.length-1][0]},${h} L ${pts[0][0]},${h} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <path d={area} fill={stroke} opacity="0.12" />}
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
}

// ── Chip ─────────────────────────────────────────────────────────
function Chip({ active, onClick, children, dot }) {
  return (
    <button className={'chip' + (active ? ' active' : '')} onClick={onClick} aria-pressed={!!active}>
      {dot && <span className="dot" style={{background: dot}} />}
      {children}
    </button>
  );
}

// ── Segmented tabs ───────────────────────────────────────────────
function Seg({ options, value, onChange }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o.value || o}
          className={value === (o.value || o) ? 'on' : ''}
          aria-pressed={value === (o.value || o)}
          onClick={() => onChange(o.value || o)}>
          {o.label || o}
        </button>
      ))}
    </div>
  );
}

// ── Status pill ──────────────────────────────────────────────────
function StatusPill({ estado }) {
  const map = { 'Apta':'good', 'Precaución':'warn', 'Crítico':'bad' };
  const c = map[estado] || 'neut';
  return <span className={'pill ' + c}>{estado}</span>;
}

// ── Distribution stacked bar (Apta / Precaución / Crítico) ───────
function StackBar({ apta, precaucion, critico, height = 12 }) {
  const total = apta + precaucion + critico;
  if (total === 0) return (
    <div style={{display:'flex', width:'100%', height, borderRadius:2, background:'rgba(0,0,0,0.05)', alignItems:'center', justifyContent:'center'}}>
      <span className="mono" style={{fontSize:9, color:'var(--text-3)', letterSpacing:'0.1em'}}>SIN DATOS</span>
    </div>
  );
  const a = (apta / total) * 100;
  const b = (precaucion / total) * 100;
  const c = (critico / total) * 100;
  return (
    <div style={{display:'flex', width:'100%', height, borderRadius:2, overflow:'hidden', background:'rgba(0,0,0,0.05)'}}>
      <div style={{width: a + '%', background: '#2e8b57'}} />
      <div style={{width: b + '%', background: '#c97a2b'}} />
      <div style={{width: c + '%', background: '#b5403d'}} />
    </div>
  );
}

// ── Horizontal grouped bars (per municipio) ──────────────────────
function MuniBars({ rows, valueKey = 'ph', max, format = v => v, color = '#2c5fa6', selectedId, onSelect }) {
  const m = max || Math.max(...rows.map(r => r[valueKey]));
  return (
    <div style={{display:'flex', flexDirection:'column', gap:6}}>
      {rows.map(r => {
        const w = (r[valueKey] / m) * 100;
        const sel = selectedId && r.id === selectedId;
        return (
          <div key={r.id}
            onClick={() => onSelect && onSelect(sel ? null : r.id)}
            style={{
              display:'grid', gridTemplateColumns:'88px 1fr 56px', alignItems:'center', gap:12,
              padding: sel ? '4px 6px' : '2px 0',
              background: sel ? 'rgba(44,95,166,0.07)' : 'transparent',
              borderRadius: sel ? 3 : 0,
              borderLeft: sel ? '2px solid ' + color : '2px solid transparent',
              transition: 'all .15s ease',
              cursor: onSelect ? 'pointer' : 'default',
            }}>
            <span className="mono" style={{fontSize:11, color: sel ? 'var(--text)' : 'var(--text-2)', fontWeight: sel ? 500 : 400}}>{r.name}</span>
            <div style={{height:6, background:'rgba(0,0,0,0.06)', borderRadius:1, overflow:'hidden'}}>
              <div style={{width: w + '%', height:'100%', background: color, opacity: sel ? 1 : 0.72, transition:'opacity .15s ease'}} />
            </div>
            <span className="mono tabular" style={{fontSize:11, color: sel ? 'var(--text)' : 'var(--text-2)', textAlign:'right', fontWeight: sel ? 500 : 400}}>{format(r[valueKey])}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Histogram (pH distribution) ──────────────────────────────────
function Histogram({ data, bins = 14, min = 5.5, max = 9.5, color = '#2c5fa6', height = 180, refLines = [] }) {
  if (!data || data.length === 0) return (
    <div style={{height, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.02)', borderRadius:2, gap:10}}>
      <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase'}}>Sin datos para el filtro actual</span>
      <span style={{fontSize:12, color:'var(--text-3)'}}>Cambia el tipo de captación, época o estado</span>
    </div>
  );
  const buckets = new Array(bins).fill(0);
  const step = (max - min) / bins;
  data.forEach(v => {
    const i = Math.max(0, Math.min(bins - 1, Math.floor((v - min) / step)));
    buckets[i]++;
  });
  const peak = Math.max(...buckets) || 1;
  return (
    <div>
      <div style={{display:'flex', alignItems:'flex-end', gap:3, height, padding:'0 2px'}}>
        {buckets.map((c, i) => {
          const h = (c / peak) * (height - 12);
          const mid = min + (i + 0.5) * step;
          const inSafe = mid >= 6.5 && mid <= 8.5;
          return (
            <div key={i} style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end', height:'100%'}}>
              <div title={`pH ≈ ${GJ.fmtNum(mid, 2)} · ${c} pts`}
                   style={{
                     height: Math.max(2, h),
                     background: inSafe ? color : '#c97a2b',
                     opacity: inSafe ? 0.9 : 0.85,
                     borderRadius: '1px 1px 0 0',
                   }} />
            </div>
          );
        })}
      </div>
      <div className="mono" style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--text-3)'}}>
        <span>pH {GJ.fmtNum(min, 1)}</span>
        <span style={{color:'#2c5fa6'}}>· · ·  rango óptimo 6,5–8,5  · · ·</span>
        <span>pH {GJ.fmtNum(max, 1)}</span>
      </div>
    </div>
  );
}

// ── Heatmap (municipio × variable) ───────────────────────────────
function useIsMobile(breakpoint = 780) {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w <= breakpoint;
}

function Heatmap({ rows, cols, getValue, format = v => v, scale }) {
  const isMobile = useIsMobile();

  const allVals = [];
  rows.forEach(r => cols.forEach(c => allVals.push(getValue(r, c))));
  const min = scale?.min ?? Math.min(...allVals);
  const max = scale?.max ?? Math.max(...allVals);
  // Texto blanco o negro según cuál contraste más con el color de la celda
  const tinta = (v) => {
    const [r, g, b] = lerp(v).match(/\d+/g).map(Number);
    const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    const L = 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    return 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#ffffff' : '#000000';
  };
  const lerp = (v) => {
    const t = (v - min) / (max - min || 1);
    const stops = [
      { p: 0,    r:0xf2, g:0xf5, b:0xfa },
      { p: 0.45, r:0x6e, g:0x8d, b:0xbd },
      { p: 0.70, r:0x9a, g:0x6a, b:0x8c },
      { p: 1.00, r:0xb5, g:0x40, b:0x3d },
    ];
    let i = 0;
    while (i < stops.length - 1 && t > stops[i+1].p) i++;
    const lo = stops[i], hi = stops[Math.min(i+1, stops.length-1)];
    const span = (hi.p - lo.p) || 1;
    const tt = (t - lo.p) / span;
    const r = Math.round(lo.r + (hi.r - lo.r) * tt);
    const g = Math.round(lo.g + (hi.g - lo.g) * tt);
    const bl = Math.round(lo.b + (hi.b - lo.b) * tt);
    return `rgb(${r},${g},${bl})`;
  };
  const shortLabel = (label) => label
    .replace(' (Seca)', ' S').replace(' (Húmeda)', ' H')
    .replace('Cond. µS/cm', 'Cond').replace('Sal. mS/cm', 'Sal')
    .replace('Temp. °C', 'Temp').replace('STD mg/L', 'STD');

  // ── Mobile: card layout, one card per municipality ─────────────
  if (isMobile) {
    return (
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {rows.map(r => (
          <div key={r.id} style={{border:'1px solid var(--border)', borderRadius:4, overflow:'hidden'}}>
            <div style={{
              padding:'7px 12px', background:'var(--bg-2)',
              borderBottom:'1px solid var(--border)',
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <span style={{fontSize:13, fontWeight:500, color:'var(--text)'}}>{r.name}</span>
              <span className="mono" style={{fontSize:9, color:'var(--text-3)', letterSpacing:'0.1em'}}>
                {r.zona?.toUpperCase()} GUAJIRA
              </span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:2, padding:2, background:'var(--border)'}}>
              {cols.map(c => {
                const v = getValue(r, c);
                const t = (v - min) / (max - min || 1);
                return (
                  <div key={c.key} style={{
                    background: lerp(v),
                    color: tinta(v),
                    padding:'10px 4px', textAlign:'center', borderRadius:2,
                  }}>
                    <div className="mono tabular" style={{fontSize:13, fontWeight:500, lineHeight:1}}>
                      {format(v, c)}
                    </div>
                    <div style={{fontSize:9, marginTop:4, opacity:0.75, fontFamily:'inherit'}}>
                      {shortLabel(c.label)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Desktop: table layout ──────────────────────────────────────
  return (
    <table className="tbl" style={{tableLayout:'fixed'}}>
      <thead>
        <tr>
          <th style={{width:120}}>Municipio</th>
          {cols.map(c => <th key={c.key} style={{textAlign:'center'}}>{conMu(c.label)}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td>
              <div style={{fontSize:12, color:'var(--text)'}}>{r.name}</div>
              <div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{r.zona} Guajira</div>
            </td>
            {cols.map(c => {
              const v = getValue(r, c);
              return (
                <td key={c.key} style={{textAlign:'center', padding:4}}>
                  <div style={{
                    background: lerp(v),
                    color: tinta(v),
                    padding: '12px 0',
                    fontFamily: 'SF Mono, ui-monospace, JetBrains Mono, Menlo, Monaco, monospace',
                    fontSize: 12,
                    borderRadius: 2,
                  }}>{format(v, c)}</div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Dual-line chart (seca vs húmeda) ─────────────────────────────
function DualLineChart({ months, seriesA, seriesB, labelA, labelB, colorA = '#c97a2b', colorB = '#2c5fa6', yMin, yMax, unit, tickFormat }) {
  const w = 760, h = 240, padL = 40, padR = 16, padT = 16, padB = 28;
  const clipId = useMemo(() => 'dlc-' + Math.random().toString(36).slice(2), []);
  const all = [...seriesA, ...seriesB].filter(v => v != null);
  if (!all.length) return null;
  // Auto-range from data if no fixed bounds provided, with 5% padding
  const dataMin = Math.min(...all);
  const dataMax = Math.max(...all);
  const pad = (dataMax - dataMin) * 0.08 || dataMin * 0.05;
  const min = yMin != null ? Math.min(yMin, dataMin - pad) : dataMin - pad;
  const max = yMax != null ? Math.max(yMax, dataMax + pad) : dataMax + pad;
  const step = (w - padL - padR) / (months.length - 1);
  const yScale = (v) => padT + (1 - (v - min) / (max - min)) * (h - padT - padB);
  function line(data, color) {
    const pts = data.map((v, i) => v == null ? null : [padL + i * step, yScale(v)]).filter(Boolean);
    if (pts.length < 2) return null;
    const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    return (
      <g>
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.4" fill="#0f1419" stroke={color} strokeWidth="1.2"/>)}
      </g>
    );
  }
  // y grid
  const ticks = 4;
  const grid = [];
  for (let i = 0; i <= ticks; i++) {
    const v = min + (max - min) * (i / ticks);
    const y = yScale(v);
    grid.push(
      <g key={i}>
        <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#d8d8d8" strokeWidth="0.5" strokeDasharray="2 4" />
        <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#6b6b6b">{tickFormat ? tickFormat(v) : GJ.fmtNum(v, 2)}</text>
      </g>
    );
  }
  return (
    <div>
      <div className="flex between center" style={{marginBottom:8}}>
        <div className="legend">
          <span><span className="sw" style={{background: colorA}}/>{labelA}</span>
          <span><span className="sw" style={{background: colorB}}/>{labelB}</span>
        </div>
        <div className="mono" style={{fontSize:10, color:'var(--text-3)'}}>{conMu(unit)}</div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{display:'block'}}>
        <defs>
          <clipPath id={clipId}>
            <rect x={padL} y={padT} width={w - padL - padR} height={h - padT - padB} />
          </clipPath>
        </defs>
        {grid}
        <g clipPath={`url(#${clipId})`}>
          {line(seriesA, colorA)}
          {line(seriesB, colorB)}
        </g>
        {months.map((m, i) => (
          <text key={m} x={padL + i * step} y={h - 8} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#6b6b6b">{m}</text>
        ))}
      </svg>
    </div>
  );
}

// ── Alert row ────────────────────────────────────────────────────
function AlertRow({ a }) {
  return (
    <div className="alert-row">
      <div className={'sev-dot ' + a.sev} />
      <div className="body">
        <div>{a.body}</div>
        <small>{a.point || a.id} · {a.muni} · {a.code}</small>
      </div>
      <div className="stamp">{a.time}</div>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────
function Modal({ title, crumb, children, onClose, size = 'md', footer }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal-${size}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            {crumb && <div className="crumb" style={{marginBottom:3}}>{crumb}</div>}
            <h2>{title}</h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ── Toast stack ──────────────────────────────────────────────
function ToastStack() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    window.showToast = (msg, type = 'default') => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, msg, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3600);
    };
    return () => { window.showToast = null; };
  }, []);

  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

Object.assign(window, {
  TopNav, PageHead, SecTitle, KpiCard, Spark, Chip, Seg, StatusPill,
  StackBar, MuniBars, Histogram, Heatmap, DualLineChart, AlertRow,
  Modal, ToastStack,
});
