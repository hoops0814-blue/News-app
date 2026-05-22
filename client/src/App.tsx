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

const CATEGORIES = ['All', 'Work', 'World', 'Tech', 'Finance', 'Health', 'Sports', 'Boston', 'San Diego']

export default function App() {
  const [articles, setArticles] = useState<Article[]>([])
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { prefs, like, dislike, unlike, score } = usePreferences()
  const stackRef = useRef<HTMLDivElement>(null)
  // Stable feed order computed once per load — never reshuffles mid-session
  const [feedOrder, setFeedOrder] = useState<string[]>([])

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

  // Lock the order once when articles arrive — preferences only affect the next load
  useEffect(() => {
    if (articles.length === 0) return
    const sorted = [...articles].sort((a, b) => {
      const diff = score(b.category, b.source) - score(a.category, a.source)
      if (diff !== 0) return diff
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    })
    setFeedOrder(sorted.map(a => a.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles]) // intentionally excludes score — order freezes at load time

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetch('/api/refresh').catch(() => {})
    setTimeout(() => { fetchArticles(category); setRefreshing(false) }, 4000)
  }

  const scrollNext = useCallback(() => {
    if (!stackRef.current) return
    stackRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }, [])

  // During session: only remove dismissed cards, never reorder
  const articleMap = useMemo(() => new Map(articles.map(a => [a.id, a])), [articles])
  const sortedArticles = useMemo(() => {
    return feedOrder
      .filter(id => !prefs.dislikedIds.has(id))
      .map(id => articleMap.get(id))
      .filter((a): a is Article => Boolean(a))
  }, [feedOrder, articleMap, prefs.dislikedIds])

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
