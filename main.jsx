// Punto de entrada: vista pública y panel institucional

function AppFooter() {
  const [apiLive, setApiLive] = useState(window.GJ_API_LIVE || false);

  // Actualiza el badge cuando cambie el estado del API
  useEffect(() => {
    (window.GJ_API_READY || Promise.resolve(false)).then(live => setApiLive(live));
  }, []);

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      marginTop: 32,
      padding: '14px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      <div style={{display:'flex', gap:20, flexWrap:'wrap', alignItems:'center'}}>
        {GJ.ACTORS.map(a => (
          <div key={a.code} style={{display:'flex', flexDirection:'column'}}>
            <span className="mono" style={{fontSize:9, color:'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase'}}>{a.code}</span>
            <span style={{fontSize:11, color:'var(--text-2)', marginTop:1}}>{a.name}</span>
          </div>
        ))}
      </div>
      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4}}>
        {/* Badge de conexión al backend */}
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: apiLive ? '#2e8b57' : '#888',
            boxShadow: apiLive ? '0 0 6px #2e8b57' : 'none',
            flexShrink: 0,
          }}/>
          <span className="mono" style={{fontSize:9, color: apiLive ? '#2e8b57' : 'var(--text-3)', letterSpacing:'0.08em'}}>
            {apiLive
              ? 'SUPABASE · LIVE'
              : 'OFFLINE · DATOS ESTÁTICOS'}
          </span>
        </div>
        <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.08em'}}>
          GUAJIRAGUA v1.0 · Sistema BI Hidrogeológico
        </span>
        <span className="mono" style={{fontSize:9, color:'var(--text-3)'}}>
          UMB · Ingeniería de Negocios · {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}

// ── Panel institucional: la vista técnica completa, detrás del inicio de sesión
function PanelInstitucional() {
  const [page, setPage] = useState('fisico');

  let body = null;
  if (page === 'fisico')  body = <PageFisicoquimica />;
  if (page === 'tend')    body = <PageTendencias />;
  if (page === 'alertas') body = <PageAlertas />;
  if (page === 'admin')   body = <PageAdmin />;

  return (
    <div className="app" data-screen-label={'Guajiragua · ' + page}>
      <TopNav page={page} setPage={setPage} />
      {body}
      <AppFooter />
    </div>
  );
}

// ── Raíz: vista pública por defecto; #/panel abre el panel institucional
function Root() {
  const ruta = useRuta();
  const [version, setVersion] = useState(0);

  // La app se muestra de inmediato con los datos estáticos; si el API responde,
  // se reconstruye con los datos en vivo sin bloquear la pantalla.
  useEffect(() => {
    (window.GJ_API_READY || Promise.resolve(false)).then(live => {
      if (live && window.GJ_REAL_POINTS && window.buildGJ) {
        window.buildGJ(window.GJ_REAL_POINTS);
        setVersion(v => v + 1);
      }
    });
  }, []);

  const panel = ruta.parts[0] === 'panel';
  useEffect(() => {
    document.title = panel ? 'Guajiragua · Panel institucional' : 'Guajiragua · Calidad del agua en La Guajira';
  }, [panel]);

  return (
    <>
      {panel
        ? <AdminGate><PanelInstitucional key={version} /></AdminGate>
        : <PublicApp key={version} ruta={ruta} />}
      <ToastStack />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root/>);
