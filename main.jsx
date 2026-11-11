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
          La Guajira, Colombia · {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}

// ── Rutas (definidas en components.jsx): #/, #/fisicoquimica, #/alertas, …
// Así funcionan el botón Atrás, recargar la página y compartir un enlace.
const RUTAS = window.GJ_RUTAS;

function paginaDesdeHash() {
  const h = (window.location.hash || '#/').replace(/\/+$/, '') || '#';
  const id = Object.keys(RUTAS).find(k => RUTAS[k].hash.replace(/\/+$/, '') === h);
  return id || 'inicio';
}

function App() {
  const [page, setPageState] = useState(paginaDesdeHash);

  // Cambiar de sección = cambiar la dirección; el historial del navegador
  // registra cada paso, así que Atrás vuelve a la sección anterior.
  function setPage(id) {
    const destino = RUTAS[id] ? RUTAS[id].hash : '#/';
    if (window.location.hash !== destino) window.location.hash = destino;
    else setPageState(id);
  }
  useEffect(() => {
    const alCambiar = () => setPageState(paginaDesdeHash());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  // Al cambiar de sección: título de la pestaña y volver al principio
  useEffect(() => {
    document.title = (RUTAS[page] || RUTAS.inicio).titulo;
    window.scrollTo(0, 0);
  }, [page]);

  // La app se muestra de inmediato con la copia de datos incluida (real-data.js);
  // no espera al servidor, que en el plan gratuito puede tardar hasta 35 s en despertar.
  useEffect(() => { if (window.GJ_HIDE_LOADER) window.GJ_HIDE_LOADER(); }, []);

  // Cuando el servidor responde, se actualizan los datos solo si cambiaron, para
  // no reiniciar lo que la persona está viendo.
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const firma = pts => pts.length + '|' + pts.reduce((h, p) =>
      (h * 31 + (p.id + p.estado + p.cond + p.ph + p.sal + p.temp + p.prof).length + (p.cond || 0)) % 1e9, 7);
    const firmaInicial = firma(GJ.ALL_POINTS);
    (window.GJ_API_READY || Promise.resolve(false)).then(() => {
      if (window.GJ_API_LIVE && window.GJ_REAL_POINTS && window.buildGJ && firma(window.GJ_REAL_POINTS) !== firmaInicial) {
        window.buildGJ(window.GJ_REAL_POINTS);
        setVersion(v => v + 1);
      }
    });
  }, []);

  let body = null;
  if (page === 'inicio')  body = <PageInicio setPage={setPage} />;
  if (page === 'fisico')  body = <PageFisicoquimica />;
  if (page === 'tend')    body = <PageTendencias />;
  if (page === 'alertas') body = <PageAlertas />;
  if (page === 'admin')   body = <AdminGate><PageAdmin /></AdminGate>;

  return (
    <div className="app" data-screen-label={'Guajiragua · ' + page}>
      <TopNav page={page} />
      <React.Fragment key={version}>{body}</React.Fragment>
      <AppFooter />
      <ToastStack />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
