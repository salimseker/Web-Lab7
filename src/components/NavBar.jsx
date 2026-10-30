import { startTransition } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { selectItemCount, useCartStore } from '../store/cartStore.js'

function NavBar({ isDark, onToggleTheme }) {
  const { user, logout } = useAuth()
  // Primitive selector: NavBar re-renders only when the count changes, not on every cart update.
  const itemCount = useCartStore(selectItemCount)
  const navigate = useNavigate()

  // React Router v8 applies navigation inside a transition. Logging out in the same transition
  // makes both updates render together; otherwise a mounted protected page would see
  // "no user" first and ProtectedRoute would redirect to /login instead of home.
  function handleLogout() {
    startTransition(() => {
      navigate('/')
      logout()
    })
  }

  return (
    <header className="navbar">
      <nav className="navbar-links">
        {/* `end` keeps "Home" from staying active on every nested path */}
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/cart">Cart ({itemCount})</NavLink>
      </nav>

      <div className="navbar-auth">
        <button type="button" onClick={onToggleTheme} aria-pressed={isDark}>
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
        {user ? (
          <>
            <span className="navbar-user">{user.username}</span>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </header>
  )
}

export default NavBar
