import { useEffect, useMemo, useState, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

/* ── Helpers ──────────────────────────────────────────────── */
const Badge = ({ value }) => <span className={`badge badge-${value}`}>{value?.replace('_', ' ')}</span>
const Money = ({ value }) => <span className="cell-money">${Number(value || 0).toFixed(2)}</span>
const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

function App() {
  /* ── State ────────────────────────────────────────────── */
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [summary, setSummary] = useState(null)
  const [projects, setProjects] = useState([])
  const [myProposals, setMyProposals] = useState([])
  const [proposalMap, setProposalMap] = useState({})
  const [taskMap, setTaskMap] = useState({})
  const [adminUsers, setAdminUsers] = useState([])
  const [adminStats, setAdminStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ email: '', password: '', full_name: '', role: 'freelancer' })
  const [projectForm, setProjectForm] = useState({ title: '', description: '', budget: 0 })
  const [proposalForm, setProposalForm] = useState({ cover_letter: '', bid_amount: 0 })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee_id: '' })

  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  /* ── Auto-clear toasts ─────────────────────────────────── */
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 4000); return () => clearTimeout(t) } }, [msg])
  useEffect(() => { if (err) { const t = setTimeout(() => setErr(''), 6000); return () => clearTimeout(t) } }, [err])

  /* ── API helper ────────────────────────────────────────── */
  const api = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: { ...(opts.body ? { 'Content-Type': 'application/json' } : {}), ...headers, ...(opts.headers || {}) },
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.detail || `Request failed (${res.status})`)
    return data
  }, [token])

  /* ── Load session ──────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const me = await api('/auth/me')
      setUser(me)
      const dash = await api('/dashboard/summary')
      setSummary(dash)
      const proj = await api('/projects')
      setProjects(Array.isArray(proj) ? proj : [])

      if (me.role === 'freelancer') {
        const mine = await api('/projects/my-proposals')
        setMyProposals(Array.isArray(mine) ? mine : [])
      } else setMyProposals([])

      if (me.role === 'admin') {
        const [u, s] = await Promise.all([api('/admin/users'), api('/admin/stats')])
        setAdminUsers(Array.isArray(u) ? u : [])
        setAdminStats(s)
      } else { setAdminUsers([]); setAdminStats(null) }
    } catch (e) {
      setErr(e.message)
      localStorage.removeItem('token'); setToken(''); setUser(null)
      setSummary(null); setProjects([]); setMyProposals([])
      setProposalMap({}); setTaskMap({}); setAdminUsers([]); setAdminStats(null)
    } finally { setLoading(false) }
  }, [api])

  useEffect(() => { if (token) load() }, [token])

  /* ── Derived data ──────────────────────────────────────── */
  const cards = useMemo(() => {
    if (!summary?.metrics) return []
    return Object.entries(summary.metrics).map(([k, v]) => ({
      label: k.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: typeof v === 'number' && k.includes('earning') ? `$${v.toFixed(2)}` : v,
    }))
  }, [summary])

  const myProjectIds = useMemo(() => new Set(projects.filter(p => p.client_id === user?.id).map(p => p.id)), [projects, user])
  const submittedIds = useMemo(() => new Set(myProposals.map(p => p.project_id)), [myProposals])

  /* ── Nav pages per role ────────────────────────────────── */
  const navItems = useMemo(() => {
    const items = [{ id: 'dashboard', icon: '◫', label: 'Dashboard' }]
    if (user?.role === 'client') {
      items.push({ id: 'create-project', icon: '+', label: 'New Project' })
    }
    items.push({ id: 'projects', icon: '▦', label: 'Projects' })
    if (user?.role === 'freelancer') {
      items.push({ id: 'proposals', icon: '◧', label: 'My Proposals' })
    }
    if (user?.role === 'admin') {
      items.push({ id: 'admin', icon: '⚙', label: 'Admin Panel' })
    }
    return items
  }, [user])

  /* ── Auth handlers ─────────────────────────────────────── */
  const handleAuth = (e) => { const { name, value } = e.target; setAuthForm(p => ({ ...p, [name]: value })) }

  const onRegister = async (e) => {
    e.preventDefault(); setErr(''); setMsg('')
    try {
      const res = await fetch(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: authForm.email, password: authForm.password, full_name: authForm.full_name, role: authForm.role }) })
      const d = await res.json().catch(() => null)
      if (!res.ok) throw new Error(d?.detail || 'Registration failed')
      setMsg('Account created! Sign in below.'); setAuthMode('login')
    } catch (e) { setErr(e.message) }
  }

  const onLogin = async (e) => {
    e.preventDefault(); setErr(''); setMsg('')
    try {
      const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: authForm.email, password: authForm.password }) })
      const d = await res.json().catch(() => null)
      if (!res.ok) throw new Error(d?.detail || 'Login failed')
      if (!d?.access_token) { setErr('Login failed'); return }
      localStorage.setItem('token', d.access_token); setToken(d.access_token)
    } catch (e) { setErr(e.message) }
  }

  const onLogout = () => {
    localStorage.removeItem('token'); setToken(''); setUser(null)
    setProjects([]); setMyProposals([]); setProposalMap({}); setTaskMap({})
    setAdminUsers([]); setAdminStats(null); setPage('dashboard')
  }

  /* ── Project handlers ──────────────────────────────────── */
  const onCreateProject = async (e) => {
    e.preventDefault(); setErr(''); setMsg('')
    try {
      await api('/projects', { method: 'POST', body: JSON.stringify(projectForm) })
      setProjectForm({ title: '', description: '', budget: 0 })
      setMsg('Project created'); setPage('projects'); load()
    } catch (e) { setErr(e.message) }
  }

  const onStatusChange = async (id, status) => {
    try { await api(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setMsg('Status updated'); load() }
    catch (e) { setErr(e.message) }
  }

  /* ── Proposal handlers ─────────────────────────────────── */
  const onSubmitProposal = async (pid) => {
    setErr(''); setMsg('')
    try {
      await api(`/projects/${pid}/proposals`, { method: 'POST', body: JSON.stringify({ project_id: pid, cover_letter: proposalForm.cover_letter, bid_amount: proposalForm.bid_amount }) })
      setProposalForm({ cover_letter: '', bid_amount: 0 }); setMsg('Proposal submitted'); load()
    } catch (e) { setErr(e.message) }
  }

  const loadProposals = async (pid) => {
    try { const d = await api(`/projects/${pid}/proposals`); setProposalMap(p => ({ ...p, [pid]: d })) }
    catch (e) { setErr(e.message) }
  }

  const onReview = async (propId, status, pid) => {
    try { await api(`/projects/proposals/${propId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setMsg(`Proposal ${status}`); await loadProposals(pid); load() }
    catch (e) { setErr(e.message) }
  }

  /* ── Task handlers ─────────────────────────────────────── */
  const loadTasks = async (pid) => {
    try { const d = await api(`/projects/${pid}/tasks`); setTaskMap(p => ({ ...p, [pid]: d })) }
    catch (e) { setErr(e.message) }
  }

  const onCreateTask = async (pid) => {
    try {
      await api(`/projects/${pid}/tasks`, { method: 'POST', body: JSON.stringify({ title: taskForm.title, description: taskForm.description || null, assignee_id: taskForm.assignee_id ? Number(taskForm.assignee_id) : null }) })
      setTaskForm({ title: '', description: '', assignee_id: '' }); setMsg('Task added'); await loadTasks(pid)
    } catch (e) { setErr(e.message) }
  }

  const onToggleTask = async (tid, pid, done) => {
    try { await api(`/projects/tasks/${tid}`, { method: 'PATCH', body: JSON.stringify({ is_done: done }) }); await loadTasks(pid) }
    catch (e) { setErr(e.message) }
  }

  /* ── Admin handlers ────────────────────────────────────── */
  const onSuspend = async (uid) => { try { await api(`/admin/users/${uid}/suspend`, { method: 'PATCH' }); load() } catch (e) { setErr(e.message) } }
  const onActivate = async (uid) => { try { await api(`/admin/users/${uid}/activate`, { method: 'PATCH' }); load() } catch (e) { setErr(e.message) } }

  /* ================================================================== */
  /*  AUTH SCREEN                                                       */
  /* ================================================================== */
  if (!token || !user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo">
            <h1>Freelancer PM</h1>
            <p>Project management for modern teams</p>
          </div>

          <div className="tab-bar">
            <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Sign In</button>
            <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Create Account</button>
          </div>

          <form onSubmit={authMode === 'login' ? onLogin : onRegister} className="form-stack">
            {authMode === 'register' && (
              <label>Full Name<input name="full_name" value={authForm.full_name} onChange={handleAuth} placeholder="Jane Doe" required /></label>
            )}
            <label>Email<input type="email" name="email" value={authForm.email} onChange={handleAuth} placeholder="you@email.com" required /></label>
            <label>Password<input type="password" name="password" value={authForm.password} onChange={handleAuth} placeholder="••••••••" required /></label>
            {authMode === 'register' && (
              <label>Role
                <select name="role" value={authForm.role} onChange={handleAuth}>
                  <option value="freelancer">Freelancer</option>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}
            <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 4 }}>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {msg && <div className="toast toast-ok" style={{ marginTop: 14 }}>{msg}</div>}
          {err && <div className="toast toast-err" style={{ marginTop: 14 }}>{err}</div>}
        </div>
      </div>
    )
  }

  /* ================================================================== */
  /*  MAIN APP                                                          */
  /* ================================================================== */
  return (
    <div className="app-shell">
      {/* Mobile hamburger */}
      <button className="mobile-toggle" onClick={() => setSidebarOpen(o => !o)}>☰</button>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">F</div>
          <span>Freelancer PM</span>
        </div>

        <div className="sidebar-label">Navigation</div>
        {navItems.map(n => (
          <button key={n.id} className={`nav-link${page === n.id ? ' active' : ''}`} onClick={() => { setPage(n.id); setSidebarOpen(false) }}>
            <span className="nav-icon">{n.icon}</span>{n.label}
          </button>
        ))}

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{initials(user.full_name)}</div>
            <div className="user-detail">
              <div className="user-name">{user.full_name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="nav-link" onClick={onLogout}>
            <span className="nav-icon">⏻</span>Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="main">
        <header className="topbar">
          <div>
            <h2>{page === 'dashboard' ? 'Dashboard' : page === 'projects' ? 'Projects' : page === 'proposals' ? 'My Proposals' : page === 'create-project' ? 'New Project' : page === 'admin' ? 'Admin Panel' : 'Dashboard'}</h2>
            <div className="topbar-sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={load}>↻ Refresh</button>
        </header>

        {/* Toasts */}
        {msg && <div className="toast toast-ok">{msg}</div>}
        {err && <div className="toast toast-err">{err}</div>}

        {loading && <div className="loader"><div className="spinner" /> Loading…</div>}

        {/* ════════════ DASHBOARD ════════════════════════ */}
        {page === 'dashboard' && !loading && (
          <>
            <section className="card-grid">
              {cards.map(c => (
                <article className="metric-card" key={c.label}>
                  <h3>{c.label}</h3>
                  <div className="metric-value">{c.value}</div>
                </article>
              ))}
            </section>

            {/* Quick project list */}
            <div className="section">
              <div className="section-header"><h3>Recent Projects</h3></div>
              <div className="section-body no-pad">
                {!projects.length ? <div className="empty">No projects yet</div> : (
                  <div className="table-wrap">
                    <table className="tbl">
                      <thead><tr><th>Title</th><th>Status</th><th>Budget</th></tr></thead>
                      <tbody>
                        {projects.slice(0, 5).map(p => (
                          <tr key={p.id}>
                            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{p.title}</td>
                            <td><Badge value={p.status} /></td>
                            <td><Money value={p.budget} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ════════════ CREATE PROJECT ═══════════════════ */}
        {page === 'create-project' && user.role === 'client' && (
          <div className="section">
            <div className="section-header"><h3>Create New Project</h3></div>
            <div className="section-body">
              <form onSubmit={onCreateProject} className="form-stack" style={{ maxWidth: 520 }}>
                <label>Project Title<input name="title" value={projectForm.title} onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Website Redesign" required /></label>
                <label>Description<textarea name="description" value={projectForm.description} onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the project scope…" required /></label>
                <label>Budget ($)<input type="number" min="0" step="0.01" name="budget" value={projectForm.budget} onChange={e => setProjectForm(p => ({ ...p, budget: Number(e.target.value) }))} required /></label>
                <button className="btn btn-primary" type="submit">Create Project</button>
              </form>
            </div>
          </div>
        )}

        {/* ════════════ PROJECTS ═════════════════════════ */}
        {page === 'projects' && (
          <>
            {/* Freelancer proposal form */}
            {user.role === 'freelancer' && (
              <div className="section" style={{ marginBottom: 12 }}>
                <div className="section-header"><h3>Proposal Details</h3></div>
                <div className="section-body">
                  <div className="form-row" style={{ maxWidth: 640 }}>
                    <label>Cover Letter<textarea name="cover_letter" value={proposalForm.cover_letter} onChange={e => setProposalForm(p => ({ ...p, cover_letter: e.target.value }))} placeholder="Your approach…" rows={2} /></label>
                    <label>Bid ($)<input type="number" min="0" step="0.01" name="bid_amount" value={proposalForm.bid_amount} onChange={e => setProposalForm(p => ({ ...p, bid_amount: Number(e.target.value) }))} /></label>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 8 }}>Fill in above, then click "Bid" on an open project below.</p>
                </div>
              </div>
            )}

            {/* Projects table */}
            <div className="section">
              <div className="section-header">
                <h3>All Projects ({projects.length})</h3>
                {user.role === 'client' && <button className="btn btn-primary btn-sm" onClick={() => setPage('create-project')}>+ New</button>}
              </div>
              <div className="section-body no-pad">
                {!projects.length ? <div className="empty">No projects found</div> : (
                  <div className="table-wrap">
                    <table className="tbl">
                      <thead><tr><th>Title</th><th>Status</th><th>Budget</th><th>Actions</th></tr></thead>
                      <tbody>
                        {projects.map(p => (
                          <tr key={p.id}>
                            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{p.title}</td>
                            <td><Badge value={p.status} /></td>
                            <td><Money value={p.budget} /></td>
                            <td>
                              <div className="cell-actions">
                                {user.role === 'client' && myProjectIds.has(p.id) && (
                                  <>
                                    <select defaultValue={p.status} onChange={e => onStatusChange(p.id, e.target.value)} style={{ width: 'auto', padding: '3px 24px 3px 8px', fontSize: '0.75rem' }}>
                                      <option value="open">Open</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                    <button className="btn btn-ghost btn-sm" onClick={() => loadProposals(p.id)}>Proposals</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => loadTasks(p.id)}>Tasks</button>
                                  </>
                                )}
                                {user.role === 'freelancer' && p.status === 'open' && !submittedIds.has(p.id) && (
                                  <button className="btn btn-primary btn-sm" onClick={() => onSubmitProposal(p.id)}>Bid</button>
                                )}
                                {user.role === 'freelancer' && (
                                  <button className="btn btn-ghost btn-sm" onClick={() => loadTasks(p.id)}>Tasks</button>
                                )}
                                {user.role === 'admin' && (
                                  <>
                                    <button className="btn btn-ghost btn-sm" onClick={() => loadProposals(p.id)}>Proposals</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => loadTasks(p.id)}>Tasks</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Proposal sub-panels */}
            {Object.entries(proposalMap).map(([pid, list]) => (
              <div className="section" key={`prop-${pid}`}>
                <div className="section-header"><h3>Proposals — Project #{pid}</h3></div>
                <div className="section-body no-pad">
                  {!list.length ? <div className="empty">No proposals yet</div> : (
                    <div className="table-wrap">
                      <table className="tbl">
                        <thead><tr><th>Freelancer</th><th>Bid</th><th>Status</th>{user.role === 'client' && <th>Actions</th>}</tr></thead>
                        <tbody>
                          {list.map(pr => (
                            <tr key={pr.id}>
                              <td>#{pr.freelancer_id}</td>
                              <td><Money value={pr.bid_amount} /></td>
                              <td><Badge value={pr.status} /></td>
                              {user.role === 'client' && (
                                <td>
                                  <div className="cell-actions">
                                    {pr.status === 'pending' && <>
                                      <button className="btn btn-success btn-sm" onClick={() => onReview(pr.id, 'approved', +pid)}>Approve</button>
                                      <button className="btn btn-danger btn-sm" onClick={() => onReview(pr.id, 'rejected', +pid)}>Reject</button>
                                    </>}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Task sub-panels */}
            {Object.entries(taskMap).map(([pid, list]) => (
              <div className="section" key={`task-${pid}`}>
                <div className="section-header"><h3>Tasks — Project #{pid}</h3></div>
                <div className="section-body">
                  {user.role === 'client' && myProjectIds.has(+pid) && (
                    <div className="form-row" style={{ marginBottom: 12 }}>
                      <label>Title<input name="title" value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} placeholder="Task name" /></label>
                      <label>Description<input name="description" value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional" /></label>
                      <label>Assignee ID<input name="assignee_id" value={taskForm.assignee_id} onChange={e => setTaskForm(p => ({ ...p, assignee_id: e.target.value }))} placeholder="User ID" /></label>
                      <button className="btn btn-primary btn-sm" onClick={() => onCreateTask(+pid)}>+ Add</button>
                    </div>
                  )}
                  {!list.length ? <div className="empty">No tasks yet</div> : (
                    <div className="table-wrap">
                      <table className="tbl">
                        <thead><tr><th>Task</th><th>Assignee</th><th>Done</th></tr></thead>
                        <tbody>
                          {list.map(t => (
                            <tr key={t.id}>
                              <td style={{ color: t.is_done ? 'var(--muted)' : 'var(--text)', textDecoration: t.is_done ? 'line-through' : 'none' }}>{t.title}</td>
                              <td>{t.assignee_id ?? '—'}</td>
                              <td><input type="checkbox" checked={t.is_done} onChange={e => onToggleTask(t.id, +pid, e.target.checked)} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ════════════ MY PROPOSALS (freelancer) ════════ */}
        {page === 'proposals' && user.role === 'freelancer' && (
          <div className="section">
            <div className="section-header"><h3>My Proposals ({myProposals.length})</h3></div>
            <div className="section-body no-pad">
              {!myProposals.length ? <div className="empty">No proposals submitted yet</div> : (
                <div className="table-wrap">
                  <table className="tbl">
                    <thead><tr><th>Project</th><th>Bid</th><th>Status</th></tr></thead>
                    <tbody>
                      {myProposals.map(pr => (
                        <tr key={pr.id}>
                          <td>Project #{pr.project_id}</td>
                          <td><Money value={pr.bid_amount} /></td>
                          <td><Badge value={pr.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════ ADMIN ════════════════════════════ */}
        {page === 'admin' && user.role === 'admin' && (
          <>
            {adminStats && (
              <section className="card-grid">
                <article className="metric-card"><h3>Total Users</h3><div className="metric-value">{adminStats.users_total}</div></article>
                <article className="metric-card"><h3>Active Users</h3><div className="metric-value">{adminStats.users_active}</div></article>
                <article className="metric-card"><h3>Projects</h3><div className="metric-value">{adminStats.projects_total}</div></article>
                <article className="metric-card"><h3>Proposals</h3><div className="metric-value">{adminStats.proposals_total}</div></article>
              </section>
            )}

            <div className="section">
              <div className="section-header"><h3>User Management ({adminUsers.length})</h3></div>
              <div className="section-body no-pad">
                {!adminUsers.length ? <div className="empty">No users found</div> : (
                  <div className="table-wrap">
                    <table className="tbl">
                      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {adminUsers.map(u => (
                          <tr key={u.id}>
                            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{u.full_name}</td>
                            <td>{u.email}</td>
                            <td><span className="badge badge-role">{u.role}</span></td>
                            <td><Badge value={u.is_active ? 'active' : 'suspended'} /></td>
                            <td>
                              <div className="cell-actions">
                                {u.is_active
                                  ? <button className="btn btn-danger btn-sm" onClick={() => onSuspend(u.id)}>Suspend</button>
                                  : <button className="btn btn-success btn-sm" onClick={() => onActivate(u.id)}>Activate</button>
                                }
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
