import { Outlet } from 'react-router'
import NavBar from './NavBar.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const THEME_STORAGE_KEY = 'theme'

function getPreferredTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function Layout() {
  // Owned here (the element that receives the class) and passed down to NavBar: calling the hook
  // again in NavBar would create a second, independent piece of state.
  const [theme, setTheme] = useLocalStorage(THEME_STORAGE_KEY, getPreferredTheme)
  // Anything other than "dark" (including a tampered stored value) is treated as light.
  const isDark = theme === 'dark'

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div className={`app ${isDark ? 'theme-dark' : 'theme-light'}`}>
      <NavBar isDark={isDark} onToggleTheme={toggleTheme} />
      <main className="content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>Online Shop &middot; CMP309 Assignment 7</p>
      </footer>
    </div>
  )
}

export default Layout
