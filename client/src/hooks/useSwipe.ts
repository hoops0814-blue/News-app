import { useRef, useState, useCallback } from 'react'

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 80 }: UseSwipeOptions) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const [offsetX, setOffsetX] = useState(0)
  const [isHorizontal, setIsHorizontal] = useState(false)
  const directionLocked = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    directionLocked.current = false
    setIsHorizontal(false)
    setOffsetX(0)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!start.current) return
    const dx = e.touches[0].clientX - start.current.x
    const dy = e.touches[0].clientY - start.current.y

    if (!directionLocked.current) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
        directionLocked.current = true
        setIsHorizontal(true)
      } else if (Math.abs(dy) > 6) {
        directionLocked.current = true
        setIsHorizontal(false)
      }
    }

    if (isHorizontal || (directionLocked.current && Math.abs(dx) > Math.abs(dy))) {
      e.preventDefault()
      setOffsetX(dx)
    }
  }, [isHorizontal])

  const onTouchEnd = useCallback(() => {
    if (offsetX > threshold) onSwipeRight?.()
    else if (offsetX < -threshold) onSwipeLeft?.()
    setOffsetX(0)
    setIsHorizontal(false)
    start.current = null
    directionLocked.current = false
  }, [offsetX, threshold, onSwipeLeft, onSwipeRight])

  return { offsetX, handlers: { onTouchStart, onTouchMove, onTouchEnd } as SwipeHandlers }
}
