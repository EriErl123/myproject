import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function App() {
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
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'freelancer',
  })

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    budget: 0,
  })

  const [proposalForm, setProposalForm] = useState({
    cover_letter: '',
    bid_amount: 0,
  })

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignee_id: '',
  })

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}

  const cards = useMemo(() => {
    if (!summary?.metrics) return []
    return Object.entries(summary.metrics).map(([key, value]) => ({
      title: key.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
      value: typeof value === 'number' ? value : String(value),
    }))
  }, [summary])

  const safeJson = async (res) => {
    try {
      return await res.json()
    } catch {
      return null
    }
  }

  const api = async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeaders,
        ...(options.headers || {}),
      },
    })
    const data = await safeJson(res)
    if (!res.ok) {
      throw new Error(data?.detail || `Request failed (${res.status})`)
    }
    return data
  }

  const loadSessionData = async () => {
    setLoading(true)
    setError('')
    try {
      const me = await api('/auth/me')
      setUser(me)

      const dashboard = await api('/dashboard/summary')
      setSummary(dashboard)

      const list = await api('/projects')
      setProjects(Array.isArray(list) ? list : [])

      if (me.role === 'freelancer') {
        const mine = await api('/projects/my-proposals')
        setMyProposals(Array.isArray(mine) ? mine : [])
      } else {
        setMyProposals([])
      }

      if (me.role === 'admin') {
        const users = await api('/admin/users')
        const stats = await api('/admin/stats')
        setAdminUsers(Array.isArray(users) ? users : [])
        setAdminStats(stats)
      } else {
        setAdminUsers([])
        setAdminStats(null)
      }
    } catch (e) {
      setError(e.message || 'Unable to load data.')
      localStorage.removeItem('token')
      setToken('')
      setUser(null)
      setSummary(null)
      setProjects([])
      setMyProposals([])
      setProposalMap({})
      setTaskMap({})
      setAdminUsers([])
      setAdminStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadSessionData()
    }
  }, [token])

  const onAuthChange = (event) => {
    const { name, value } = event.target
    setAuthForm((prev) => ({ ...prev, [name]: value }))
  }

  const onProjectChange = (event) => {
    const { name, value } = event.target
    setProjectForm((prev) => ({
      ...prev,
      [name]: name === 'budget' ? Number(value) : value,
    }))
  }

  const onProposalChange = (event) => {
    const { name, value } = event.target
    setProposalForm((prev) => ({
      ...prev,
      [name]: name === 'bid_amount' ? Number(value) : value,
    }))
  }

  const onTaskChange = (event) => {
    const { name, value } = event.target
    setTaskForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const onRegister = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const payload = {
      email: authForm.email,
      password: authForm.password,
      full_name: authForm.full_name,
      role: authForm.role,
    }

    try {
      await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        const data = await safeJson(res)
        if (!res.ok) throw new Error(data?.detail || 'Registration failed.')
      })

      setMessage('Registration successful. You can now login.')
      setAuthMode('login')
    } catch (e) {
      setError(e.message || 'Cannot reach API. Make sure backend is running on http://127.0.0.1:8000.')
    }
  }

  const onLogin = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const data = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password }),
      }).then(async (res) => {
        const json = await safeJson(res)
        if (!res.ok) throw new Error(json?.detail || 'Login failed.')
        return json
      })
      if (!data?.access_token) {
        setError('Login failed.')
        return
      }

      localStorage.setItem('token', data.access_token)
      setToken(data.access_token)
    } catch (e) {
      setError(e.message || 'Cannot reach API. Make sure backend is running on http://127.0.0.1:8000.')
    }
  }

  const onLogout = () => {
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
    setProjects([])
    setMyProposals([])
    setProposalMap({})
    setTaskMap({})
    setAdminUsers([])
    setAdminStats(null)
    setMessage('Logged out.')
  }

  const onCreateProject = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      await api('/projects', { method: 'POST', body: JSON.stringify(projectForm) })

      setProjectForm({ title: '', description: '', budget: 0 })
      setMessage('Project created.')
      loadSessionData()
    } catch (e) {
      setError(e.message || 'Cannot reach API. Make sure backend is running on http://127.0.0.1:8000.')
    }
  }

  const onUpdateProjectStatus = async (projectId, statusValue) => {
    setError('')
    setMessage('')
    try {
      await api(`/projects/${projectId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusValue }),
      })
      setMessage('Project status updated.')
      loadSessionData()
    } catch (e) {
      setError(e.message || 'Failed to update project status.')
    }
  }

  const onSubmitProposal = async (projectId) => {
    setError('')
    setMessage('')
    try {
      await api(`/projects/${projectId}/proposals`, {
        method: 'POST',
        body: JSON.stringify({
          project_id: projectId,
          cover_letter: proposalForm.cover_letter,
          bid_amount: proposalForm.bid_amount,
        }),
      })
      setProposalForm({ cover_letter: '', bid_amount: 0 })
      setMessage('Proposal submitted.')
      loadSessionData()
    } catch (e) {
      setError(e.message || 'Failed to submit proposal.')
    }
  }

  const loadProjectProposals = async (projectId) => {
    try {
      const data = await api(`/projects/${projectId}/proposals`)
      setProposalMap((prev) => ({ ...prev, [projectId]: data }))
    } catch (e) {
      setError(e.message || 'Failed to load proposals.')
    }
  }

  const onReviewProposal = async (proposalId, statusValue, projectId) => {
    setError('')
    setMessage('')
    try {
      await api(`/projects/proposals/${proposalId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusValue }),
      })
      setMessage(`Proposal ${statusValue}.`)
      await loadProjectProposals(projectId)
      await loadSessionData()
    } catch (e) {
      setError(e.message || 'Failed to review proposal.')
    }
  }

  const loadProjectTasks = async (projectId) => {
    try {
      const data = await api(`/projects/${projectId}/tasks`)
      setTaskMap((prev) => ({ ...prev, [projectId]: data }))
    } catch (e) {
      setError(e.message || 'Failed to load tasks.')
    }
  }

  const onCreateTask = async (projectId) => {
    setError('')
    setMessage('')
    try {
      await api(`/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description || null,
          assignee_id: taskForm.assignee_id ? Number(taskForm.assignee_id) : null,
        }),
      })
      setTaskForm({ title: '', description: '', assignee_id: '' })
      setMessage('Task created.')
      await loadProjectTasks(projectId)
    } catch (e) {
      setError(e.message || 'Failed to create task.')
    }
  }

  const onToggleTask = async (taskId, projectId, nextDone) => {
    setError('')
    try {
      await api(`/projects/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_done: nextDone }),
      })
      await loadProjectTasks(projectId)
    } catch (e) {
      setError(e.message || 'Failed to update task.')
    }
  }

  const onAdminSuspend = async (userId) => {
    try {
      await api(`/admin/users/${userId}/suspend`, { method: 'PATCH' })
      await loadSessionData()
    } catch (e) {
      setError(e.message || 'Failed to suspend user.')
    }
  }

  const onAdminActivate = async (userId) => {
    try {
      await api(`/admin/users/${userId}/activate`, { method: 'PATCH' })
      await loadSessionData()
    } catch (e) {
      setError(e.message || 'Failed to activate user.')
    }
  }

  const myProjectIds = useMemo(
    () => new Set(projects.filter((p) => p.client_id === user?.id).map((p) => p.id)),
    [projects, user]
  )

  const submittedProjectIds = useMemo(
    () => new Set(myProposals.map((p) => p.project_id)),
    [myProposals]
  )

  if (!token || !user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Freelancer PM Platform</h1>
          <p>Dark blue • Black • White theme</p>

          <div className="mode-switch">
            <button
              className={authMode === 'login' ? 'primary-btn' : 'ghost-btn'}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              className={authMode === 'register' ? 'primary-btn' : 'ghost-btn'}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={authMode === 'login' ? onLogin : onRegister} className="form-grid">
            {authMode === 'register' && (
              <label>
                Full name
                <input
                  name="full_name"
                  value={authForm.full_name}
                  onChange={onAuthChange}
                  placeholder="Juan Dela Cruz"
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={onAuthChange}
                placeholder="user@email.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={onAuthChange}
                required
              />
            </label>

            {authMode === 'register' && (
              <label>
                Role
                <select name="role" value={authForm.role} onChange={onAuthChange}>
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}

            <button className="primary-btn" type="submit">
              {authMode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>

          {message && <p className="ok-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Freelancer PM</h1>
        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Projects</a>
          <a href="#">Proposals</a>
          <a href="#">Tasks</a>
          <a href="#">Admin</a>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>Welcome, {user.full_name}</h2>
            <p>
              Role: <strong>{user.role}</strong>
            </p>
          </div>
          <button className="ghost-btn" onClick={onLogout}>
            Logout
          </button>
        </header>

        {loading ? <p>Loading...</p> : null}
        {message && <p className="ok-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <section className="card-grid">
          {cards.map((card) => (
            <article className="card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.value}</p>
            </article>
          ))}
        </section>

        {user.role === 'client' && (
          <section className="panel">
            <h3>Create Project</h3>
            <form onSubmit={onCreateProject} className="form-grid">
              <label>
                Title
                <input
                  name="title"
                  value={projectForm.title}
                  onChange={onProjectChange}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  value={projectForm.description}
                  onChange={onProjectChange}
                  required
                />
              </label>
              <label>
                Budget
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="budget"
                  value={projectForm.budget}
                  onChange={onProjectChange}
                  required
                />
              </label>
              <button className="primary-btn" type="submit">
                Create
              </button>
            </form>
          </section>
        )}

        {user.role === 'freelancer' && (
          <section className="panel">
            <h3>Submit Proposal</h3>
            <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
              <label>
                Cover letter
                <textarea
                  name="cover_letter"
                  value={proposalForm.cover_letter}
                  onChange={onProposalChange}
                  placeholder="Briefly explain your approach"
                  required
                />
              </label>
              <label>
                Bid amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="bid_amount"
                  value={proposalForm.bid_amount}
                  onChange={onProposalChange}
                  required
                />
              </label>
              <p className="hint-text">Pick an open project below and click Submit Proposal.</p>
            </form>
          </section>
        )}

        <section className="panel">
          <h3>Projects</h3>
          {!projects.length ? (
            <p>No projects yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Budget</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.title}</td>
                      <td>{project.status}</td>
                      <td>${Number(project.budget || 0).toFixed(2)}</td>
                      <td>
                        <div className="row-actions">
                          {user.role === 'client' && myProjectIds.has(project.id) && (
                            <>
                              <select
                                defaultValue={project.status}
                                onChange={(e) => onUpdateProjectStatus(project.id, e.target.value)}
                              >
                                <option value="open">open</option>
                                <option value="in_progress">in_progress</option>
                                <option value="completed">completed</option>
                              </select>
                              <button className="ghost-btn" onClick={() => loadProjectProposals(project.id)}>
                                Proposals
                              </button>
                              <button className="ghost-btn" onClick={() => loadProjectTasks(project.id)}>
                                Tasks
                              </button>
                            </>
                          )}

                          {user.role === 'freelancer' && project.status === 'open' && !submittedProjectIds.has(project.id) && (
                            <button className="primary-btn" onClick={() => onSubmitProposal(project.id)}>
                              Submit Proposal
                            </button>
                          )}

                          {user.role === 'freelancer' && (
                            <button className="ghost-btn" onClick={() => loadProjectTasks(project.id)}>
                              View Tasks
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {user.role === 'freelancer' && (
          <section className="panel">
            <h3>My Proposals</h3>
            {!myProposals.length ? (
              <p>No proposals submitted yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Project ID</th>
                      <th>Bid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProposals.map((proposal) => (
                      <tr key={proposal.id}>
                        <td>{proposal.project_id}</td>
                        <td>${Number(proposal.bid_amount || 0).toFixed(2)}</td>
                        <td>{proposal.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {Object.entries(proposalMap).map(([projectId, list]) => (
          <section className="panel" key={`proposals-${projectId}`}>
            <h3>Proposals for Project #{projectId}</h3>
            {!list.length ? (
              <p>No proposals yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Freelancer ID</th>
                      <th>Bid</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((proposal) => (
                      <tr key={proposal.id}>
                        <td>{proposal.freelancer_id}</td>
                        <td>${Number(proposal.bid_amount || 0).toFixed(2)}</td>
                        <td>{proposal.status}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="primary-btn"
                              onClick={() => onReviewProposal(proposal.id, 'approved', Number(projectId))}
                            >
                              Approve
                            </button>
                            <button
                              className="ghost-btn"
                              onClick={() => onReviewProposal(proposal.id, 'rejected', Number(projectId))}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        {Object.entries(taskMap).map(([projectId, list]) => (
          <section className="panel" key={`tasks-${projectId}`}>
            <h3>Tasks for Project #{projectId}</h3>

            {user.role === 'client' && myProjectIds.has(Number(projectId)) && (
              <form className="form-grid inline-form" onSubmit={(e) => e.preventDefault()}>
                <label>
                  Title
                  <input name="title" value={taskForm.title} onChange={onTaskChange} />
                </label>
                <label>
                  Description
                  <input name="description" value={taskForm.description} onChange={onTaskChange} />
                </label>
                <label>
                  Assignee ID
                  <input name="assignee_id" value={taskForm.assignee_id} onChange={onTaskChange} />
                </label>
                <button className="primary-btn" onClick={() => onCreateTask(Number(projectId))}>
                  Add Task
                </button>
              </form>
            )}

            {!list.length ? (
              <p>No tasks yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Assignee</th>
                      <th>Done</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((task) => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>{task.assignee_id ?? '-'}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={task.is_done}
                            onChange={(e) => onToggleTask(task.id, Number(projectId), e.target.checked)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        {user.role === 'admin' && (
          <section className="panel">
            <h3>Admin Panel</h3>
            {adminStats ? (
              <p className="hint-text">
                Users: {adminStats.users_total} • Active: {adminStats.users_active} • Projects:{' '}
                {adminStats.projects_total} • Proposals: {adminStats.proposals_total}
              </p>
            ) : null}

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.full_name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{String(u.is_active)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="ghost-btn" onClick={() => onAdminSuspend(u.id)}>
                            Suspend
                          </button>
                          <button className="primary-btn" onClick={() => onAdminActivate(u.id)}>
                            Activate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
