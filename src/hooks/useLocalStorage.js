import { useEffect, useState } from 'react'

function resolveInitial(initialValue) {
  return typeof initialValue === 'function' ? initialValue() : initialValue
}

// Missing, corrupted or inaccessible storage (e.g. private mode) falls back to the initial value.
function readStoredValue(key, initialValue) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? resolveInitial(initialValue) : JSON.parse(raw)
  } catch (error) {
    console.warn(`useLocalStorage: could not read "${key}", using default`, error)
    return resolveInitial(initialValue)
  }
}

// Same call shape as useState, but the value survives page reloads.
// Every component calling this hook gets its own independent state.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`useLocalStorage: could not save "${key}"`, error)
    }
  }, [key, value])

  return [value, setValue]
}
