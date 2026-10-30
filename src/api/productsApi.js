const BASE_URL = 'https://dummyjson.com/products'
const PRODUCT_LIMIT = 100

// Error that keeps the HTTP status so callers can tell "not found" apart from other failures.
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

// fetch only rejects on network failure, so a non-2xx status is turned into an error here.
async function getJson(url, signal) {
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new HttpError(response.status, `Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function fetchProducts(signal) {
  const data = await getJson(`${BASE_URL}?limit=${PRODUCT_LIMIT}`, signal)

  if (!Array.isArray(data?.products)) {
    throw new Error('Unexpected response format for product list')
  }

  return data.products
}

export async function fetchProduct(id, signal) {
  return getJson(`${BASE_URL}/${encodeURIComponent(id)}`, signal)
}
