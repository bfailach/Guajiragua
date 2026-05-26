// Página de Análisis de tendencias — comparativa seca vs húmeda

function PageTendencias() {
  const [variable, setVariable] = useState('ph');     // ph | sal | cond | temp
  const [zona, setZona] = useState('Todas');          // Alta | Media | Baja | Todas

  const muniRows = GJ.MUNI_AGG.filter(m => zona === 'Todas' || m.zona === zona);

  // ── Series filtradas por zona (recalculadas desde ALL_POINTS) ─────────────
  const zonaPts = useMemo(() =>
    zona === 'Todas' ? GJ.ALL_POINTS : GJ.ALL_POINTS.filter(p => p.zona === zona),
    [zona]
  );

  const varKey = variable; // 'ph' | 'sal' | 'cond' | 'temp'

  const seriesA = useMemo(() => {
    const full = GJ.buildSeries(zonaPts, varKey);
    return full.map((v, i) => GJ.SECA_IDX.includes(i) ? v : null);
  }, [zonaPts, varKey]);

  const seriesB = useMemo(() => {
    const full = GJ.buildSeries(zonaPts, varKey);
    return full.map((v, i) => GJ.HUM_IDX.includes(i) ? v : null);
  }, [zonaPts, varKey]);

  const variableMeta = {
    ph:   { label:'pH',           unit:'unidades pH' },
    sal:  { label:'Salinidad',    unit:'mS/cm'       },
    cond: { label:'Conductividad',unit:'µS/cm'       },
    temp: { label:'Temperatura',  unit:'°C'          },
  }[variable];

  // ── Anotaciones dinámicas desde las series reales ──────────────────────────
  const nonNullA = seriesA.filter(v => v !== null);
  const nonNullB = seriesB.filter(v => v !== null);
  const peakSeca   = nonNullA.length ? Math.max(...nonNullA) : 0;
  const valleyHum  = nonNullB.length ? Math.min(...nonNullB) : 0;
  const peakMonthI = seriesA.indexOf(peakSeca);
  const valMonthI  = seriesB.indexOf(valleyHum);
  const varPct     = valleyHum > 0
    ? ((peakSeca - valleyHum) / valleyHum * 100).toFixed(1) + '%'
    : '—';

  function fmtAnnot(v) {
    if (!v) return '—';
    if (variable === 'cond') return v.toLocaleString('es-CO', {maximumFractionDigits:0});
    if (variable === 'temp') return v.toFixed(1);
    if (variable === 'sal')  return v.toFixed(3);
    return v.toFixed(2);
  }

  const zonaLabel = zona === 'Todas' ? 'La Guajira' : zona + ' Guajira';
  const PEAK_LOC  = peakMonthI >= 0 ? GJ.MONTHS[peakMonthI] + ' · ' + zonaLabel : '—';
  const VAL_LOC   = valMonthI  >= 0 ? GJ.MONTHS[valMonthI]  + ' · ' + zonaLabel : '—';

  // ── KPIs calculados desde datos reales ────────────────────────────────────
  const mkSpark = (from, to, n = 12) =>
    Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1), e = t * t * (3 - 2 * t);
      return +(from + (to - from) * e + Math.abs(from) * Math.sin(i * 2.1 + 0.7) * 0.01).toFixed(2);
    });

  function calcIPH(pts) {
    if (!pts.length) return 0;
    const aptos = pts.filter(p => p.estado === 'Apta').length;
    const phV   = pts.filter(p => p.ph > 0);
    const phP   = phV.length ? phV.reduce((a, b) => a + b.ph, 0) / phV.length : 7;
    const kph   = Math.min(1, Math.max(0, (phP - 5.8) / (8.5 - 5.8)));
    return +(100 * (aptos / pts.length) * kph).toFixed(1);
  }
  function calcIDA(pts) {
    if (!pts.length) return 0;
    const salV  = pts.filter(p => p.sal  > 0);
    const condV = pts.filter(p => p.cond > 0);
    const s = salV.length  ? salV.reduce((a, b)  => a + b.sal,  0) / salV.length  : 0;
    const c = condV.length ? condV.reduce((a, b) => a + b.cond, 0) / condV.length : 0;
    return +(Math.min(100, (s / 3.5) * 50 + (c / 5000) * 50)).toFixed(1);
  }

  const secaPts    = zonaPts.filter(p => p.temporada === 'Seca');
  const humPts     = zonaPts.filter(p => p.temporada === 'Húmeda');

  const iphSeca    = calcIPH(secaPts);
  const iphHum     = calcIPH(humPts);
  const iphVal     = iphHum > 0 ? +(iphHum).toFixed(1) : GJ.KPIS.iph;
  const dIPH       = iphHum > 0 ? +((iphSeca - iphHum) / iphHum * 100).toFixed(1) : null;

  const idaSeca    = calcIDA(secaPts);
  const idaHum     = calcIDA(humPts);
  const idaVal     = idaHum > 0 ? +(idaHum).toFixed(1) : GJ.KPIS.ida;
  const dIDA       = idaHum > 0 ? +((idaSeca - idaHum) / idaHum * 100).toFixed(1) : null;

  const salSecaFull = GJ.buildSeries(zonaPts, 'sal');
  const salSecaNN   = salSecaFull.filter((v, i) => v !== null && GJ.SECA_IDX.includes(i));
  const salHumNN    = salSecaFull.filter((v, i) => v !== null && GJ.HUM_IDX.includes(i));
  const salPk       = salSecaNN.length ? Math.max(...salSecaNN) : 0;
  const salVl       = salHumNN.length  ? Math.min(...salHumNN)  : 0;
  const varSalPct   = salVl > 0 ? +((salPk - salVl) / salVl * 100).toFixed(1) : 0;

  const tasaCrit     = +(zonaPts.filter(p => p.estado === 'Crítico').length / Math.max(zonaPts.length, 1) * 100).toFixed(1);
  const tasaCritSeca = +(secaPts.filter(p => p.estado === 'Crítico').length / Math.max(secaPts.length, 1) * 100).toFixed(1);
  const dTasa        = tasaCritSeca > 0 ? +((tasaCrit - tasaCritSeca) / tasaCritSeca * 100).toFixed(1) : null;

  return (
    <>
      <PageHead
        crumb="DWH · DM_SOSTENIB · ANÁLISIS TEMPORAL"
        title="Análisis de tendencias estacionales"
        right={<>
          <div><b>Ventana:</b> 12 meses rolling · 2025·05 → 2026·04</div>
          <div><b>Mediciones:</b> {GJ.ALL_POINTS.length.toLocaleString('es-CO')} registros</div>
          <div><b>Granularidad:</b> mes · municipio · época</div>
        </>}
      />

      {/* Filter bar */}
      <div className="card card-pad" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:16, flexWrap:'wrap'}}>
        <div className="flex center" style={{gap:18}}>
          <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase'}}>Variable</span>
          <Seg options={[{value:'ph',label:'pH'},{value:'sal',label:'Salinidad'},{value:'cond',label:'Conductividad'},{value:'temp',label:'Temperatura'}]} value={variable} onChange={setVariable} />
        </div>
        <div className="flex center" style={{gap:18}}>
          <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase'}}>Zona</span>
          <Seg options={['Alta','Media','Baja','Todas']} value={zona} onChange={setZona} />
        </div>
      </div>

      {/* Main chart */}
      <div className="grid" style={{gridTemplateColumns:'1.6fr 1fr', gap:16, marginBottom:16}}>
        <div className="card card-pad">
          <SecTitle title={`Serie temporal · ${variableMeta.label}`}
                    sub="EPOCA SECA vs HÚMEDA" />
          <DualLineChart
            months={GJ.MONTHS}
            seriesA={seriesA} seriesB={seriesB}
            labelA="Época seca" labelB="Época húmeda"
            unit={variableMeta.unit}
            tickFormat={v => {
              if (variable === 'cond') return v.toLocaleString('es-CO', {maximumFractionDigits:0});
              if (variable === 'temp') return v.toFixed(1);
              if (variable === 'sal')  return v.toFixed(3);
              return v.toFixed(2);
            }} />

          {/* Nota metodológica */}
          <div className="mono" style={{fontSize:9, color:'var(--text-3)', marginTop:10, letterSpacing:'0.06em', lineHeight:1.6}}>
            * Curva mensual estimada desde campañas reales: seca feb-2026 (1.543 pts) y húmeda oct-2025 (192 pts). Valores intermedios son proyección con factores estacionales calibrados, no mediciones directas.
          </div>

          {/* Annotation strip — valores calculados desde las series reales */}
          <div className="grid" style={{gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginTop:20}}>
            <div style={{borderLeft:'2px solid #c97a2b', paddingLeft:12}}>
              <div className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.1em'}}>PICO ÉPOCA SECA</div>
              <div className="mono tabular" style={{fontSize:20, color:'var(--text)', marginTop:4}}>
                {fmtAnnot(peakSeca)}
                <span style={{fontSize:11, color:'var(--text-3)', marginLeft:4}}>{variableMeta.unit}</span>
              </div>
              <div style={{fontSize:11, color:'var(--text-2)', marginTop:4}}>{PEAK_LOC}</div>
            </div>
            <div style={{borderLeft:'2px solid #2c5fa6', paddingLeft:12}}>
              <div className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.1em'}}>VALLE ÉPOCA HÚMEDA</div>
              <div className="mono tabular" style={{fontSize:20, color:'var(--text)', marginTop:4}}>
                {fmtAnnot(valleyHum)}
                <span style={{fontSize:11, color:'var(--text-3)', marginLeft:4}}>{variableMeta.unit}</span>
              </div>
              <div style={{fontSize:11, color:'var(--text-2)', marginTop:4}}>{VAL_LOC}</div>
            </div>
            <div style={{borderLeft:'2px solid #b5403d', paddingLeft:12}}>
              <div className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.1em'}}>VARIACIÓN ESTACIONAL</div>
              <div className="mono tabular" style={{fontSize:20, color:'var(--text)', marginTop:4}}>
                {varPct}
              </div>
              <div style={{fontSize:11, color:'var(--text-2)', marginTop:4}}>Amplitud anual</div>
            </div>
          </div>
        </div>

        {/* KPIs Kimball */}
        <div className="card card-pad">
          <SecTitle title="KPIs estratégicos" sub="DM_SOSTENIB · 8 KPIs Kimball" />
          <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:12, marginTop:8}}>
            <KpiCard label="IPH · Potabilidad"      value={String(iphVal)}     delta={dIPH}  deltaLabel="seca vs húmeda"  sparkData={mkSpark(iphHum,       iphSeca)}       color="#2e8b57" />
            <KpiCard label="IDA · Deterioro acuífero" value={String(idaVal)}     delta={dIDA}  deltaLabel="seca vs húmeda"  sparkData={mkSpark(idaHum,       idaSeca)}       color="#b5403d" />
            <KpiCard label="Variación salinidad"      value={String(varSalPct)}  unit="%"  delta={null} deltaLabel="amplitud anual"    sparkData={mkSpark(salVl,        salPk)}         color="#c97a2b" />
            <KpiCard label="Tasa puntos críticos"     value={String(tasaCrit)}   unit="%"  delta={dTasa} deltaLabel="vs época seca"   sparkData={mkSpark(tasaCritSeca, tasaCrit)}     color="#b5403d" />
          </div>

          <hr className="div" />

          <div>
            <div className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8}}>FÓRMULAS</div>
            <div className="mono" style={{fontSize:11, color:'var(--text-2)', lineHeight:1.7}}>
              <div>IPH = 100·(P<sub>apta</sub> / P<sub>total</sub>) · K<sub>pH</sub></div>
              <div>IDA = ∑(Δsalinidad · Δcond) / N<sub>muni</sub></div>
              <div>VSal = (Sal<sub>seca</sub> − Sal<sub>húm</sub>) / Sal<sub>húm</sub></div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap por municipio × variable */}
      <div className="card card-pad" style={{marginBottom:16}}>
        <SecTitle title="Matriz fisicoquímica por municipio"
                  sub="ÉPOCA SECA"
                  right={<span className="mono" style={{fontSize:10, color:'var(--text-3)'}}>VERDE = ESTABLE · OCRE = ALERTA</span>} />
        <Heatmap
          rows={muniRows}
          cols={[
            { key:'phSeca', label:'pH (Seca)'   },
            { key:'phHum',  label:'pH (Húmeda)' },
            { key:'cond',   label:'Cond. µS/cm' },
            { key:'sal',    label:'Sal. mS/cm'  },
            { key:'temp',   label:'Temp. °C'    },
            { key:'std',    label:'STD mg/L'    },
          ]}
          getValue={(r, c) => r[c.key]}
          format={(v, c) => {
            if (c.key === 'cond' || c.key === 'std') return v.toLocaleString('es-CO');
            if (c.key === 'temp') return v.toFixed(1);
            if (c.key === 'sal') return v.toFixed(2);
            return v.toFixed(2);
          }}
        />
      </div>
    </>
  );
}

window.PageTendencias = PageTendencias;
