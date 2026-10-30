import { Link, useNavigate, useParams } from 'react-router'
import { HttpError, fetchProduct } from '../api/productsApi.js'
import { useFetch } from '../hooks/useFetch.js'

const NOT_FOUND_STATUS = 404

function ProductDetail() {
  // Route params are always strings: "3", not 3.
  const { id } = useParams()
  const navigate = useNavigate()
  const { loading, error, data: product } = useFetch((signal) => fetchProduct(id, signal), [id])

  // Convert before doing arithmetic, otherwise "3" + 1 would give "31".
  const numericId = Number(id)
  const hasNumericId = Number.isInteger(numericId)

  function renderBody() {
    if (loading) {
      return <p role="status">Loading product…</p>
    }

    if (error) {
      const isNotFound = error instanceof HttpError && error.status === NOT_FOUND_STATUS
      return (
        <p role="alert">
          {isNotFound ? `Product "${id}" was not found.` : `Could not load product: ${error.message}`}
        </p>
      )
    }

    return (
      <article className="product-detail">
        <img src={product.thumbnail} alt={product.title} width="300" height="300" />
        <div>
          <h1>{product.title}</h1>
          <p className="product-category">{product.category}</p>
          <p>{product.description}</p>
          <p className="product-price">${product.price.toFixed(2)}</p>
        </div>
      </article>
    )
  }

  return (
    <section>
      <button type="button" onClick={() => navigate('/products')}>
        ← Back to products
      </button>

      {renderBody()}

      {hasNumericId && (
        <nav className="product-pager">
          {numericId > 1 && <Link to={`/products/${numericId - 1}`}>← Previous product</Link>}
          <Link to={`/products/${numericId + 1}`}>Next product →</Link>
        </nav>
      )}
    </section>
  )
}

export default ProductDetail
