import { Link } from 'react-router'
import { selectTotalPrice, useCartStore } from '../store/cartStore.js'

function CartItemRow({ item }) {
  // Only actions are needed here; action references never change, so these never trigger re-renders.
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  return (
    <li className="cart-item">
      <Link to={`/products/${item.id}`}>{item.title}</Link>
      <span>${item.price.toFixed(2)}</span>
      <div className="cart-quantity">
        <button
          type="button"
          aria-label={`Decrease quantity of ${item.title}`}
          onClick={() => setQuantity(item.id, item.quantity - 1)}
        >
          −
        </button>
        <span>{item.quantity}</span>
        <button
          type="button"
          aria-label={`Increase quantity of ${item.title}`}
          onClick={() => setQuantity(item.id, item.quantity + 1)}
        >
          +
        </button>
      </div>
      <span>${(item.price * item.quantity).toFixed(2)}</span>
      <button type="button" onClick={() => removeItem(item.id)}>
        Remove
      </button>
    </li>
  )
}

function Cart() {
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore(selectTotalPrice)
  const clear = useCartStore((state) => state.clear)

  if (items.length === 0) {
    return (
      <section>
        <h1>Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/products">Browse products</Link>
      </section>
    )
  }

  return (
    <section>
      <h1>Cart</h1>
      <ul className="cart-list">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </ul>
      <p className="cart-total">Total: ${totalPrice.toFixed(2)}</p>
      <button type="button" onClick={clear}>
        Clear cart
      </button>
    </section>
  )
}

export default Cart
