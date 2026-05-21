import { useRef, useState } from 'react'
import type { Article } from '../App'
import { useSwipe } from '../hooks/useSwipe'

interface ArticleCardProps {
  article: Article
  liked: boolean
  onSave: () => void
  onDismiss: () => void
  onScrollNext: () => void
}

const FALLBACK_GRADIENTS: Record<string, string> = {
  'World':        'linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'Tech':         'linear-gradient(160deg, #0d0d0d 0%, #1a0533 50%, #2d1b69 100%)',
  'Finance':      'linear-gradient(160deg, #0a1628 0%, #0d2b1e 50%, #0a3d2a 100%)',
  'Health':       'linear-gradient(160deg, #0d1b0d 0%, #1a2e1a 50%, #0a3321 100%)',
  'Sports':       'linear-gradient(160deg, #1a0505 0%, #3b0a0a 50%, #1a0a2e 100%)',
  'Boston Sports':'linear-gradient(160deg, #1a0000 0%, #3b0000 50%, #1a0005 100%)',
  'SD Sports':    'linear-gradient(160deg, #1a0a00 0%, #3b1e00 50%, #1a0800 100%)',
  'Boston':       'linear-gradient(160deg, #040d21 0%, #0a1a35 50%, #0a2145 100%)',
  'San Diego':    'linear-gradient(160deg, #0a0521 0%, #1a0a35 50%, #210535 100%)',
}

const DEFAULT_GRADIENT = 'linear-gradient(160deg, #0d0d0d 0%, #1a1a2e 50%, #16213e 100%)'

export default function ArticleCard({ article, liked, onSave, onDismiss, onScrollNext }: ArticleCardProps) {
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleSave = () => {
    setExiting('right')
    setTimeout(() => { onSave(); setExiting(null) }, 350)
  }

  const handleDismiss = () => {
    setExiting('left')
    setTimeout(() => { onDismiss(); setExiting(null) }, 350)
  }

  const { offsetX, handlers } = useSwipe({
    onSwipeRight: handleSave,
    onSwipeLeft: handleDismiss,
    threshold: 80,
  })

  const rotation = offsetX * 0.04
  const saveOpacity = Math.min(Math.max(offsetX / 80, 0), 1)
  const dismissOpacity = Math.min(Math.max(-offsetX / 80, 0), 1)

  const bg = FALLBACK_GRADIENTS[article.category] || DEFAULT_GRADIENT
  const hasImage = Boolean(article.imageUrl)

  let transform = `translateX(${offsetX}px) rotate(${rotation}deg)`
  let transition = 'none'
  if (exiting === 'right') {
    transform = `translateX(120vw) rotate(20deg)`
    transition = 'transform 0.35s ease-out'
  } else if (exiting === 'left') {
    transform = `translateX(-120vw) rotate(-20deg)`
    transition = 'transform 0.35s ease-out'
  } else if (offsetX === 0) {
    transition = 'transform 0.25s ease-out'
  }

  return (
    <div
      ref={cardRef}
      className="article-card"
      style={{ transform, transition }}
      {...handlers}
    >
      {/* Background */}
      <div className="card-bg" style={{ background: bg }}>
        {hasImage && (
          <img
            src={article.imageUrl!}
            alt=""
            className="card-bg-img"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
        <div className="card-bg-gradient" />
      </div>

      {/* Swipe indicators */}
      <div className="swipe-badge save-badge" style={{ opacity: saveOpacity }}>
        ♥ SAVE
      </div>
      <div className="swipe-badge skip-badge" style={{ opacity: dismissOpacity }}>
        SKIP ✕
      </div>

      {/* Content overlay */}
      <div className="card-content">
        <div className="card-meta-row">
          <span className="source-pill">{article.source}</span>
          <span className="time-pill">{formatTimeAgo(new Date(article.pubDate))}</span>
        </div>

        <h2 className="card-headline">{article.title}</h2>

        {(article.summary || article.excerpt) && (
          <p className="card-snippet">{(article.summary || article.excerpt).slice(0, 200)}</p>
        )}

        <div className="card-actions-row">
          <button
            className={`action-pill save-pill ${liked ? 'saved' : ''}`}
            onClick={e => { e.stopPropagation(); handleSave() }}
          >
            {liked ? '♥ Saved' : '♡ Save'}
          </button>

          <button
            className="action-pill read-pill"
            onClick={e => { e.stopPropagation(); window.open(article.link, '_blank', 'noopener') }}
          >
            Read →
          </button>

          <button
            className="action-pill dismiss-pill"
            onClick={e => { e.stopPropagation(); handleDismiss() }}
          >
            ✕
          </button>
        </div>

        <button className="scroll-hint" onClick={onScrollNext} aria-label="Next article">
          ↓
        </button>
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (isNaN(mins) || mins < 0) return 'recently'
  if (mins < 60) return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}
