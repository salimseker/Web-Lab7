import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

// UX only, not security: the protected page's code is still shipped to the browser.
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Remember where the user wanted to go so Login can send them back afterwards.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
