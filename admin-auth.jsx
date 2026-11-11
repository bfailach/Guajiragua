// Inicio de sesión administrativo — protege el panel institucional (#/panel)
//
// La validación real ocurre en el servidor (/api/auth/login y require_admin).
// Este componente solo decide qué mostrar según haya o no una sesión válida.

function AdminLogin({ onDone }) {
  const [usuario, setUsuario]       = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError]           = useState('');
  const [enviando, setEnviando]     = useState(false);
  const offline = !window.GJ_API_LIVE;

  async function submit(e) {
    e.preventDefault();
    if (!usuario.trim() || !contrasena) { setError('Ingrese usuario y contraseña.'); return; }
    setEnviando(true);
    setError('');
    try {
      await window.GJ_AUTH.login(usuario.trim(), contrasena);
      setContrasena('');
      if (window.showToast) window.showToast('Sesión iniciada', 'success');
      onDone && onDone();
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
      setContrasena('');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="app">
      <PageHead crumb="GUAJIRAGUA · ACCESO INSTITUCIONAL" title="Panel institucional"
                right={<a href="#/" style={{fontSize:12, color:'var(--text-2)'}}>← Volver al sitio público</a>} />
      <div style={{display:'flex', justifyContent:'center', padding:'32px 24px 48px'}}>
        <form className="card" onSubmit={submit} noValidate
              style={{width:'min(400px, 100%)', padding:0}}>
          <div className="modal-head">
            <h2>Acceso restringido</h2>
            <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em'}}>ADMIN</span>
          </div>
          <div className="modal-body">
            <p style={{fontSize:12, color:'var(--text-2)', margin:'0 0 18px', lineHeight:1.5}}>
              Acceso para entidades y técnicos: datos fisicoquímicos completos, tendencias,
              alertas, gestión de puntos de monitoreo y reportes.
            </p>
            {offline && (
              <p className="mono" style={{fontSize:10, color:'#b5403d', margin:'0 0 14px', lineHeight:1.5}}>
                El servidor no está disponible en este momento. El inicio de sesión requiere conexión con el API.
              </p>
            )}
            <div className="field">
              <label htmlFor="gj-user">Usuario</label>
              <input id="gj-user" type="text" autoComplete="username" autoFocus
                     value={usuario} onChange={e => setUsuario(e.target.value)}
                     className={error ? 'err-field' : ''} maxLength={100} />
            </div>
            <div className="field">
              <label htmlFor="gj-pass">Contraseña</label>
              <input id="gj-pass" type="password" autoComplete="current-password"
                     value={contrasena} onChange={e => setContrasena(e.target.value)}
                     className={error ? 'err-field' : ''} maxLength={256} />
              {error && <div className="err-msg" role="alert">{error}</div>}
            </div>
          </div>
          <div className="modal-foot">
            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando ? 'Verificando…' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
}

function AdminSessionBar({ session }) {
  const vence = new Date(session.expira * 1000)
    .toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex between center"
         style={{padding:'8px 24px', borderBottom:'1px solid var(--border)', background:'var(--surface)', gap:12, flexWrap:'wrap'}}>
      <span className="mono" style={{fontSize:10, color:'var(--text-3)', letterSpacing:'0.08em'}}>
        PANEL INSTITUCIONAL · SESIÓN {session.usuario} · vence {vence}
      </span>
      <a href="#/" style={{marginLeft:'auto', fontSize:11, color:'var(--text-2)'}}>Ver sitio público</a>
      <button className="btn-ghost" style={{padding:'5px 12px', fontSize:11}}
              onClick={() => {
                window.GJ_AUTH.logout();
                if (window.showToast) window.showToast('Sesión cerrada');
              }}>
        Cerrar sesión
      </button>
    </div>
  );
}

function AdminGate({ children }) {
  const [session, setSession]   = useState(() => window.GJ_AUTH.session());
  const [checking, setChecking] = useState(!!window.GJ_AUTH.session());

  // Verifica con el servidor la sesión guardada y escucha cambios (login/logout)
  useEffect(() => {
    let alive = true;
    if (window.GJ_AUTH.session()) {
      window.GJ_AUTH.verify().then(s => { if (alive) { setSession(s); setChecking(false); } });
    }
    const off = window.GJ_AUTH.onChange(s => { if (alive) setSession(s); });
    return () => { alive = false; off(); };
  }, []);

  // Cierra la sesión automáticamente cuando vence el token
  useEffect(() => {
    if (!session) return;
    const ms = session.expira * 1000 - Date.now();
    const t = setTimeout(() => {
      window.GJ_AUTH.logout();
      if (window.showToast) window.showToast('La sesión venció. Inicie sesión de nuevo.', 'error');
    }, Math.max(0, Math.min(ms, 2147483000)));
    return () => clearTimeout(t);
  }, [session]);

  if (checking) {
    return (
      <div className="mono" style={{padding:'48px 24px', textAlign:'center', fontSize:11, color:'var(--text-3)', letterSpacing:'0.12em'}}>
        VERIFICANDO SESIÓN…
      </div>
    );
  }

  if (!session) return <AdminLogin onDone={() => setSession(window.GJ_AUTH.session())} />;

  return (
    <>
      <AdminSessionBar session={session} />
      {children}
    </>
  );
}

window.AdminGate = AdminGate;
