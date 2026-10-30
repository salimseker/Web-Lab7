import { Link } from 'react-router'

function Home() {
  return (
    <section>
      <h1>Welcome to the Online Shop</h1>
      <p>Browse the catalogue, filter by category and add products to your cart.</p>
      <Link to="/products">Browse products</Link>
    </section>
  )
}

export default Home
