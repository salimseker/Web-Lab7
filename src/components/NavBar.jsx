import { NavLink } from 'react-router'

function NavBar() {
  return (
    <header className="navbar">
      <nav className="navbar-links">
        {/* `end` keeps "Home" from staying active on every nested path */}
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/cart">Cart</NavLink>
        <NavLink to="/login">Login</NavLink>
      </nav>
    </header>
  )
}

export default NavBar
