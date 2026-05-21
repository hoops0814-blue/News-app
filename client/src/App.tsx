import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Header from './components/Header'
import CategoryTabs from './components/CategoryTabs'
import ArticleCard from './components/ArticleCard'
import { usePreferences } from './hooks/usePreferences'

export interface Article {
  id: string
  title: string
  link: string
  excerpt: string
  summary: string | null
  pubDate: string
  source: string
  category: string
  imageUrl: string | null
}

const CATEGORIES = ['All', 'World', 'Tech', 'Finance', 'Health', 'Sports', 'Boston', 'San Diego']

export default function App() {
  const [articles, setArticles] = useState<Article[]>([])
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { prefs, like, dislike, unlike, score } = usePreferences()
  const stackRef = useRef<HTMLDivElement>(null)

  const fetchArticles = useCallback(async (cat: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/news?category=${encodeURIComponent(cat)}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setArticles(data)
      setLastUpdated(new Date())
    } catch {
      setError('Could not load articles. Is the server running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles(category)
  }, [category, fetchArticles])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetch('/api/refresh').catch(() => {})
    setTimeout(() => { fetchArticles(category); setRefreshing(false) }, 4000)
  }

  const scrollNext = useCallback(() => {
    if (!stackRef.current) return
    stackRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }, [])

  const sortedArticles = useMemo(() => {
    return articles
      .filter(a => !prefs.dislikedIds.has(a.id))
      .sort((a, b) => {
        const diff = score(b.category, b.source) - score(a.category, a.source)
        if (diff !== 0) return diff
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      })
  }, [articles, prefs.dislikedIds, score])

  return (
    <div className="app">
      {/* Fixed overlay header */}
      <div className="top-overlay">
        <Header onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastUpdated} />
        <CategoryTabs categories={CATEGORIES} active={category} onChange={cat => { setCategory(cat); stackRef.current?.scrollTo({ top: 0 }) }} />
      </div>

      {/* Card stack */}
      <div ref={stackRef} className="card-stack">
        {loading && (
          <div className="full-screen-state">
            <div className="loading-spinner" />
            <p>Loading your feed…</p>
          </div>
        )}

        {error && !loading && (
          <div className="full-screen-state">
            <span className="state-icon">⚠️</span>
            <p>{error}</p>
            <button className="state-btn" onClick={() => fetchArticles(category)}>Retry</button>
          </div>
        )}

        {!loading && !error && sortedArticles.length === 0 && (
          <div className="full-screen-state">
            <span className="state-icon">📭</span>
            <p>No articles yet. Pull to refresh.</p>
            <button className="state-btn" onClick={handleRefresh}>Refresh</button>
          </div>
        )}

        {!loading && !error && sortedArticles.map(article => (
          <div key={article.id} className="card-snap-item">
            <ArticleCard
              article={article}
              liked={prefs.likedIds.has(article.id)}
              onSave={() => prefs.likedIds.has(article.id)
                ? unlike(article.id, article.category, article.source)
                : like(article.id, article.category, article.source)
              }
              onDismiss={() => { dislike(article.id, article.category, article.source); scrollNext() }}
              onScrollNext={scrollNext}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
