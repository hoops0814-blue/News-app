import { useState, useCallback } from 'react'

interface Preferences {
  categoryScores: Record<string, number>
  sourceScores: Record<string, number>
  likedIds: Set<string>
  dislikedIds: Set<string>
}

const STORAGE_KEY = 'news-preferences'

function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    return {
      categoryScores: parsed.categoryScores || {},
      sourceScores: parsed.sourceScores || {},
      likedIds: new Set(parsed.likedIds || []),
      dislikedIds: new Set(parsed.dislikedIds || []),
    }
  } catch {
    return empty()
  }
}

function empty(): Preferences {
  return { categoryScores: {}, sourceScores: {}, likedIds: new Set(), dislikedIds: new Set() }
}

function savePrefs(prefs: Preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    categoryScores: prefs.categoryScores,
    sourceScores: prefs.sourceScores,
    likedIds: [...prefs.likedIds],
    dislikedIds: [...prefs.dislikedIds],
  }))
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs)

  const like = useCallback((id: string, category: string, source: string) => {
    setPrefs(prev => {
      const next: Preferences = {
        categoryScores: { ...prev.categoryScores, [category]: (prev.categoryScores[category] || 0) + 2 },
        sourceScores: { ...prev.sourceScores, [source]: (prev.sourceScores[source] || 0) + 1 },
        likedIds: new Set([...prev.likedIds, id]),
        dislikedIds: new Set([...prev.dislikedIds].filter(x => x !== id)),
      }
      savePrefs(next)
      return next
    })
  }, [])

  const dislike = useCallback((id: string, category: string, source: string) => {
    setPrefs(prev => {
      const next: Preferences = {
        categoryScores: { ...prev.categoryScores, [category]: (prev.categoryScores[category] || 0) - 2 },
        sourceScores: { ...prev.sourceScores, [source]: (prev.sourceScores[source] || 0) - 1 },
        likedIds: new Set([...prev.likedIds].filter(x => x !== id)),
        dislikedIds: new Set([...prev.dislikedIds, id]),
      }
      savePrefs(next)
      return next
    })
  }, [])

  const unlike = useCallback((id: string, category: string, source: string) => {
    setPrefs(prev => {
      const next: Preferences = {
        categoryScores: { ...prev.categoryScores, [category]: (prev.categoryScores[category] || 0) - 2 },
        sourceScores: { ...prev.sourceScores, [source]: (prev.sourceScores[source] || 0) - 1 },
        likedIds: new Set([...prev.likedIds].filter(x => x !== id)),
        dislikedIds: prev.dislikedIds,
      }
      savePrefs(next)
      return next
    })
  }, [])

  const score = useCallback((category: string, source: string) => {
    return (prefs.categoryScores[category] || 0) + (prefs.sourceScores[source] || 0)
  }, [prefs])

  return { prefs, like, dislike, unlike, score }
}
