import { Link } from 'react-router'

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <img src={product.thumbnail} alt={product.title} width="200" height="200" loading="lazy" />
        <h2>{product.title}</h2>
      </Link>
      <p className="product-category">{product.category}</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
    </article>
  )
}

export default ProductCard
