import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [feed, setFeed] = useState<Article[]>([])
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
      const data: Article[] = await res.json()
      const sorted = [...data].sort((a, b) => {
        const diff = score(b.category, b.source) - score(a.category, a.source)
        if (diff !== 0) return diff
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      })
      setFeed(sorted)
      setLastUpdated(new Date())
      stackRef.current?.scrollTo({ top: 0 })
    } catch {
      setError('Could not load articles. Is the server running?')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    stackRef.current?.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }, [])

  const handleSave = useCallback((article: Article) => {
    if (prefs.likedIds.has(article.id)) {
      unlike(article.id, article.category, article.source)
    } else {
      like(article.id, article.category, article.source)
    }
  }, [prefs.likedIds, like, unlike])

  const handlePass = useCallback((article: Article) => {
    dislike(article.id, article.category, article.source)
    scrollNext()
  }, [dislike, scrollNext])

  return (
    <div className="app">
      <div className="top-overlay">
        <Header
          onRefresh={handleRefresh}
          refreshing={refreshing}
          lastUpdated={lastUpdated}
          remaining={feed.length}
        />
        <CategoryTabs
          categories={CATEGORIES}
          active={category}
          onChange={cat => setCategory(cat)}
        />
      </div>

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
        {!loading && !error && feed.length === 0 && (
          <div className="full-screen-state">
            <span className="state-icon">📭</span>
            <p>No articles yet.</p>
            <button className="state-btn" onClick={handleRefresh}>Refresh</button>
          </div>
        )}
        {!loading && !error && feed.map(article => (
          <div key={article.id} className="card-snap-item">
            <ArticleCard
              article={article}
              liked={prefs.likedIds.has(article.id)}
              onSave={() => handleSave(article)}
              onPass={() => handlePass(article)}
              onNext={scrollNext}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
