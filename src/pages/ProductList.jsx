import { fetchProducts } from '../api/productsApi.js'
import { useFetch } from '../hooks/useFetch.js'
import ProductCard from '../components/ProductCard.jsx'

function ProductList() {
  const { loading, error, data: products } = useFetch(fetchProducts, [])

  if (loading) {
    return <p role="status">Loading products…</p>
  }

  if (error) {
    return <p role="alert">Could not load products: {error.message}</p>
  }

  return (
    <section>
      <h1>Products</h1>
      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductList
