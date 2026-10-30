import { Link, useLocation } from 'react-router'

// Shown for URLs that match no route. An unknown product id (/products/999999) is not handled
// here: that route exists, so ProductDetail shows the API's "not found" error instead.
function NotFound() {
  const { pathname } = useLocation()

  return (
    <section>
      <h1>Page not found</h1>
      <p>
        There is no page at <code>{pathname}</code>.
      </p>
      <Link to="/">Back to home</Link>
    </section>
  )
}

export default NotFound
