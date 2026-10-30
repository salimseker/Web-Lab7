import { Link } from 'react-router'
import { useCartStore } from '../store/cartStore.js'

function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <img src={product.thumbnail} alt={product.title} width="200" height="200" loading="lazy" />
        <h2>{product.title}</h2>
      </Link>
      <p className="product-category">{product.category}</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <button type="button" onClick={() => addItem(product)}>
        Add to cart
      </button>
    </article>
  )
}

export default ProductCard
