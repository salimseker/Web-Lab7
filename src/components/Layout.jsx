import { Outlet } from 'react-router'
import NavBar from './NavBar.jsx'

function Layout() {
  return (
    <div className="app">
      <NavBar />
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
