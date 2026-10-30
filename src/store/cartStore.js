import { create } from 'zustand'

const STORAGE_KEY = 'cart-items'
const MIN_QUANTITY = 1

function isValidItem(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    Number.isInteger(item.id) &&
    typeof item.title === 'string' &&
    Number.isFinite(item.price) &&
    Number.isInteger(item.quantity) &&
    item.quantity >= MIN_QUANTITY
  )
}

// Stored data is untrusted: missing, unparsable or wrongly shaped data falls back to an empty cart,
// and individual broken entries are dropped instead of crashing the app.
function loadItems() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isValidItem) : []
  } catch (error) {
    console.warn('cartStore: could not read saved cart, starting empty', error)
    return []
  }
}

function saveItems(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.warn('cartStore: could not save cart', error)
  }
}

export const useCartStore = create((set) => ({
  items: loadItems(),

  addItem: (product) =>
    set((state) => {
      const exists = state.items.some((item) => item.id === product.id)

      if (exists) {
        return {
          items: state.items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }

      const newItem = { id: product.id, title: product.title, price: product.price, quantity: 1 }
      return { items: [...state.items, newItem] }
    }),

  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

  setQuantity: (id, quantity) =>
    set((state) => {
      if (!Number.isFinite(quantity)) return state

      if (quantity < MIN_QUANTITY) {
        return { items: state.items.filter((item) => item.id !== id) }
      }

      const wholeQuantity = Math.floor(quantity)
      return {
        items: state.items.map((item) => (item.id === id ? { ...item, quantity: wholeQuantity } : item)),
      }
    }),

  clear: () => set({ items: [] }),
}))

// Persist from outside React: runs on every store change, but only writes when `items` changed.
useCartStore.subscribe((state, previousState) => {
  if (state.items !== previousState.items) {
    saveItems(state.items)
  }
})

// Derived values are computed from `items`, never stored. Both selectors return primitives,
// so a component re-renders only when the number itself changes.
export const selectItemCount = (state) => state.items.reduce((count, item) => count + item.quantity, 0)

export const selectTotalPrice = (state) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0)
