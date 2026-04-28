import { useEffect, useRef, useCallback } from 'react'

function debounce<T>(fn: (val: T) => Promise<void>, ms: number): (val: T) => void {
  let timer: ReturnType<typeof setTimeout>
  return (val: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => { void fn(val) }, ms)
  }
}

export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  delay = 500,
) {
  const savedRef = useRef<T>(value)
  const pendingRef = useRef(false)

  const debouncedSave = useCallback(
    debounce(async (val: T) => {
      if (JSON.stringify(val) === JSON.stringify(savedRef.current)) return
      pendingRef.current = true
      await onSave(val)
      savedRef.current = val
      pendingRef.current = false
    }, delay),
    [onSave, delay],
  )

  useEffect(() => {
    debouncedSave(value)
  }, [value, debouncedSave])

  return { isPending: pendingRef.current }
}
