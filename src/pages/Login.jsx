import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

const DEFAULT_REDIRECT = '/'

// ProtectedRoute stores the location the user wanted in navigation state as `from`.
function getRedirectTarget(location) {
  const from = location.state?.from
  if (!from?.pathname) return DEFAULT_REDIRECT
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}

function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (form.username.trim() === '' || form.password === '') {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await login(form.username, form.password)
      // replace: the login page should not stay in history, so "Back" does not return to it.
      navigate(getRedirectTarget(location), { replace: true })
    } catch (loginError) {
      setError(loginError.message)
      setLoading(false)
    }
  }

  if (user) {
    return <p>You are signed in as {user.username}.</p>
  }

  return (
    <section>
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <label>
          Username
          <input
            name="username"
            type="email"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            disabled={loading}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      {error && <p role="alert" className="error">{error}</p>}
    </section>
  )
}

export default Login
