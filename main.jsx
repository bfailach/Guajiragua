// Main app — routes between pages

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

function App() {
  const [page, setPage] = useState('fisico');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Espera a que el API cargue los datos (o falle y use fallback)
    (window.GJ_API_READY || Promise.resolve(false)).then(() => {
      // Reconstruir window.GJ con los datos frescos del API si llegaron
      if (window.GJ_API_LIVE && window.GJ_REAL_POINTS && window.buildGJ) {
        window.buildGJ(window.GJ_REAL_POINTS);
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null; // El loader HTML ya está visible mientras tanto

  let body = null;
  if (page === 'fisico')  body = <PageFisicoquimica />;
  if (page === 'tend')    body = <PageTendencias />;
  if (page === 'alertas') body = <PageAlertas />;
  if (page === 'admin')   body = <AdminGate><PageAdmin /></AdminGate>;

  return (
    <div className="app" data-screen-label={'Guajiragua · ' + page}>
      <TopNav page={page} setPage={setPage} />
      {body}
      <AppFooter />
      <ToastStack />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
