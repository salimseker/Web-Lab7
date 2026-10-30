import { useSearchParams } from 'react-router'
import { fetchProducts } from '../api/productsApi.js'
import { useFetch } from '../hooks/useFetch.js'
import ProductCard from '../components/ProductCard.jsx'

const QUERY_PARAM = 'q'
const CATEGORY_PARAM = 'category'

// Derived from the loaded products, so the selector always matches what the API returns.
function getCategories(products) {
  return [...new Set(products.map((product) => product.category))].sort()
}

function filterProducts(products, query, category) {
  const normalizedQuery = query.trim().toLowerCase()

  return products.filter(
    (product) =>
      (category === '' || product.category === category) &&
      product.title.toLowerCase().includes(normalizedQuery),
  )
}

function ProductList() {
  const { loading, error, data: products } = useFetch(fetchProducts, [])
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get(QUERY_PARAM) ?? ''
  const category = searchParams.get(CATEGORY_PARAM) ?? ''

  // Copy the current params and change only one key, so the other filter is kept.
  function updateParam(key, value, options) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value === '') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      return next
    }, options)
  }

  if (loading) {
    return <p role="status">Loading products…</p>
  }

  if (error) {
    return <p role="alert">Could not load products: {error.message}</p>
  }

  const categories = getCategories(products)
  const visibleProducts = filterProducts(products, query, category)

  return (
    <section>
      <h1>Products</h1>

      <div className="filters">
        <label>
          Search
          <input
            type="search"
            value={query}
            placeholder="Search by title"
            // replace: typing should not add one history entry per keystroke
            onChange={(event) => updateParam(QUERY_PARAM, event.target.value, { replace: true })}
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(event) => updateParam(CATEGORY_PARAM, event.target.value)}>
            <option value="">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="empty-state">
          <p>No products match your filters.</p>
          <button type="button" onClick={() => setSearchParams({})}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductList
