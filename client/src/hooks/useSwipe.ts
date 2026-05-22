import { useRef, useState, useCallback } from 'react'

interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 60 }: UseSwipeOptions) {
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const lockedDir = useRef<'h' | 'v' | null>(null)
  const latestDx = useRef(0)
  const [offsetX, setOffsetX] = useState(0)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    lockedDir.current = null
    latestDx.current = 0
    setOffsetX(0)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startX.current === null || startY.current === null) return

    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    // Wait for a clear movement before locking direction
    if (lockedDir.current === null) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
      lockedDir.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v'
    }

    if (lockedDir.current === 'h') {
      e.preventDefault()
      latestDx.current = dx
      setOffsetX(dx)
    }
  }, [])

  // Read from ref — never stale, no state dependency needed
  const onTouchEnd = useCallback(() => {
    if (lockedDir.current === 'h') {
      const dx = latestDx.current
      if (dx > threshold) onSwipeRight?.()
      else if (dx < -threshold) onSwipeLeft?.()
    }
    latestDx.current = 0
    lockedDir.current = null
    startX.current = null
    startY.current = null
    setOffsetX(0)
  }, [threshold, onSwipeLeft, onSwipeRight])

  return {
    offsetX,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  }
}
