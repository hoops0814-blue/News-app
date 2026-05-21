import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import CategoryTabs from './components/CategoryTabs'
import NewsCard from './components/NewsCard'

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

  const fetchArticles = useCallback(async (cat: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/news?category=${encodeURIComponent(cat)}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setArticles(data)
      setLastUpdated(new Date())
    } catch (e) {
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
    await fetch('/api/refresh')
    // Wait a moment then refetch
    setTimeout(() => {
      fetchArticles(category)
      setRefreshing(false)
    }, 3000)
  }

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
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="empty-state">
            <p>No articles found. Try refreshing.</p>
            <button onClick={handleRefresh}>Refresh Feed</button>
          </div>
        )}

        {!loading && !error && articles.map(article => (
          <NewsCard key={article.id} article={article} />
        ))}
      </main>
    </div>
  )
}
