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
  const [currentIndex, setCurrentIndex] = useState(0)
  const { prefs, like, dislike, unlike, score } = usePreferences()
  const stackRef = useRef<HTMLDivElement>(null)

  const fetchArticles = useCallback(async (cat: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/news?category=${encodeURIComponent(cat)}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data: Article[] = await res.json()
      // Sort once at load time using current preference scores — order is then frozen
      const sorted = [...data].sort((a, b) => {
        const diff = score(b.category, b.source) - score(a.category, a.source)
        if (diff !== 0) return diff
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      })
      setFeed(sorted)
      setCurrentIndex(0)
      setLastUpdated(new Date())
    } catch {
      setError('Could not load articles. Is the server running?')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // score intentionally excluded — preferences only affect next fetch

  useEffect(() => {
    fetchArticles(category)
  }, [category, fetchArticles])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetch('/api/refresh').catch(() => {})
    setTimeout(() => { fetchArticles(category); setRefreshing(false) }, 4000)
  }

  const goNext = useCallback(() => {
    setCurrentIndex(i => i + 1)
  }, [])

  const handleSave = useCallback((article: Article) => {
    if (prefs.likedIds.has(article.id)) {
      unlike(article.id, article.category, article.source)
    } else {
      like(article.id, article.category, article.source)
    }
    goNext()
  }, [prefs.likedIds, like, unlike, goNext])

  const handleDismiss = useCallback((article: Article) => {
    dislike(article.id, article.category, article.source)
    goNext()
  }, [dislike, goNext])

  const currentArticle = feed[currentIndex]
  const progress = feed.length > 0 ? Math.round((currentIndex / feed.length) * 100) : 0
  const remaining = Math.max(feed.length - currentIndex, 0)

  return (
    <div className="app">
      <div className="top-overlay">
        <Header
          onRefresh={handleRefresh}
          refreshing={refreshing}
          lastUpdated={lastUpdated}
          remaining={remaining}
        />
        <CategoryTabs
          categories={CATEGORIES}
          active={category}
          onChange={cat => setCategory(cat)}
        />
        {!loading && feed.length > 0 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
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
        {!loading && !error && feed.length > 0 && !currentArticle && (
          <div className="full-screen-state">
            <span className="state-icon">✓</span>
            <p>You're all caught up!</p>
            <button className="state-btn" onClick={handleRefresh}>Refresh Feed</button>
          </div>
        )}
        {!loading && !error && currentArticle && (
          <div key={currentArticle.id} className="card-snap-item card-enter">
            <ArticleCard
              article={currentArticle}
              liked={prefs.likedIds.has(currentArticle.id)}
              onSave={() => handleSave(currentArticle)}
              onDismiss={() => handleDismiss(currentArticle)}
              onScrollNext={goNext}
            />
          </div>
        )}
      </div>
    </div>
  )
}
