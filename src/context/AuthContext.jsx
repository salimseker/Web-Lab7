import { createContext, useContext, useMemo, useReducer } from 'react'
import { login as loginRequest } from '../api/authApi.js'

const AuthContext = createContext(null)

const initialState = { user: null }

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGGED_IN':
      return { ...state, user: action.payload }
    case 'LOGGED_OUT':
      return { ...state, user: null }
    default:
      throw new Error(`Unknown auth action: ${action.type}`)
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Memoised so consumers only re-render when the user actually changes.
  // dispatch is stable, so login/logout never need to be recreated.
  const value = useMemo(() => {
    async function login(username, password) {
      const user = await loginRequest(username, password)
      dispatch({ type: 'LOGGED_IN', payload: user })
      return user
    }

    function logout() {
      dispatch({ type: 'LOGGED_OUT' })
    }

    return { user: state.user, login, logout }
  }, [state.user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components -- the assignment requires the hook to live next to its provider
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error('useAuth must be used inside an <AuthProvider>. Wrap your app with <AuthProvider> in main.jsx.')
  }

  return context
}
