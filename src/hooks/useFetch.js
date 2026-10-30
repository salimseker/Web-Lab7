import { useEffect, useReducer } from 'react'

const initialState = { loading: true, error: null, data: null }

function fetchReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { loading: true, error: null, data: null }
    case 'FETCH_SUCCESS':
      return { loading: false, error: null, data: action.payload }
    case 'FETCH_ERROR':
      return { loading: false, error: action.payload, data: null }
    default:
      throw new Error(`Unknown useFetch action: ${action.type}`)
  }
}

// Runs fetchFn(signal) whenever one of `deps` changes and exposes { loading, error, data }.
// fetchFn itself is intentionally not a dependency: callers usually pass an inline arrow
// function, which is a new reference on every render and would refetch endlessly.
export function useFetch(fetchFn, deps = []) {
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  // The caller-supplied `deps` array is the dependency list on purpose (same contract as useEffect).
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const controller = new AbortController()
    dispatch({ type: 'FETCH_START' })

    fetchFn(controller.signal)
      .then((data) => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch((error) => {
        // A cancelled request is expected (inputs changed or component unmounted), not a failure.
        if (controller.signal.aborted) return
        dispatch({ type: 'FETCH_ERROR', payload: error })
      })

    return () => controller.abort()
  }, deps)
  /* eslint-enable react-hooks/exhaustive-deps */

  return state
}
