import { useState, useEffect, useCallback, useMemo } from 'react'
import Header from './components/Header'
import CategoryTabs from './components/CategoryTabs'
import NewsCard from './components/NewsCard'
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
    setTimeout(() => {
      fetchArticles(category)
      setRefreshing(false)
    }, 4000)
  }

  // Filter out disliked articles, then sort by preference score (desc) then date (desc)
  const sortedArticles = useMemo(() => {
    return articles
      .filter(a => !prefs.dislikedIds.has(a.id))
      .sort((a, b) => {
        const scoreDiff = score(b.category, b.source) - score(a.category, a.source)
        if (scoreDiff !== 0) return scoreDiff
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      })
  }, [articles, prefs.dislikedIds, score])

  return (
    <div className="app">
      <Header onRefresh={handleRefresh} refreshing={refreshing} lastUpdated={lastUpdated} />
      <CategoryTabs categories={CATEGORIES} active={category} onChange={setCategory} />
      <main className="feed">
        {error && (
          <div className="error-state">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={() => fetchArticles(category)}>Retry</button>
          </div>
        )}
        {loading && !error && (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        )}
        {!loading && !error && sortedArticles.length === 0 && (
          <div className="empty-state">
            <p>No articles yet. Check back in a moment.</p>
            <button onClick={handleRefresh}>Refresh</button>
          </div>
        )}
        {!loading && !error && sortedArticles.map(article => (
          <NewsCard
            key={article.id}
            article={article}
            liked={prefs.likedIds.has(article.id)}
            disliked={prefs.dislikedIds.has(article.id)}
            onLike={() => prefs.likedIds.has(article.id)
              ? unlike(article.id, article.category, article.source)
              : like(article.id, article.category, article.source)
            }
            onDislike={() => dislike(article.id, article.category, article.source)}
          />
        ))}
      </main>
    </div>
  )
}
