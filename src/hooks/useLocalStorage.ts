import { useState, useEffect, useCallback, useRef } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  // Use a ref to track the latest value
  const valueRef = useRef(storedValue)

  // Update the ref whenever storedValue changes
  useEffect(() => {
    valueRef.current = storedValue
  }, [storedValue])

  // Save to localStorage whenever value changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Use the ref to get the latest value for function updates
      const valueToStore = value instanceof Function ? value(valueRef.current) : value
      setStoredValue(valueToStore)
      valueRef.current = valueToStore
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }, [key])

  return [storedValue, setValue]
}
