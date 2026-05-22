import { useState } from 'react'
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
  'World':         'linear-gradient(160deg, #0a1628 0%, #0d2a4a 45%, #0f3d6e 100%)',
  'Tech':          'linear-gradient(160deg, #0d001f 0%, #1f0547 45%, #3a0f82 100%)',
  'Finance':       'linear-gradient(160deg, #001a08 0%, #00331a 45%, #00522a 100%)',
  'Health':        'linear-gradient(160deg, #0a1f05 0%, #143d0a 45%, #1a5c0d 100%)',
  'Sports':        'linear-gradient(160deg, #1a0505 0%, #3d0a0a 45%, #5c0f0f 100%)',
  'Boston Sports': 'linear-gradient(160deg, #050d1f 0%, #0a1a3d 45%, #0f266b 100%)',
  'SD Sports':     'linear-gradient(160deg, #1a0f00 0%, #2e1a00 45%, #4a2d00 100%)',
  'Boston':        'linear-gradient(160deg, #050d1a 0%, #081a33 45%, #0a2652 100%)',
  'San Diego':     'linear-gradient(160deg, #001219 0%, #001f2e 45%, #003347 100%)',
  'Work':          'linear-gradient(160deg, #1a0500 0%, #3d0a00 45%, #5c1500 100%)',
}

const DEFAULT_GRADIENT = 'linear-gradient(160deg, #0d0d0d 0%, #1a1a2e 45%, #16213e 100%)'

const GLOW_COLORS: Record<string, string> = {
  'World':         'rgba(15, 90, 160, 0.4)',
  'Tech':          'rgba(90, 30, 180, 0.4)',
  'Finance':       'rgba(0, 120, 60, 0.4)',
  'Health':        'rgba(30, 140, 30, 0.4)',
  'Sports':        'rgba(180, 20, 20, 0.4)',
  'Boston Sports': 'rgba(20, 50, 160, 0.4)',
  'SD Sports':     'rgba(180, 110, 0, 0.4)',
  'Boston':        'rgba(15, 60, 140, 0.4)',
  'San Diego':     'rgba(0, 90, 140, 0.4)',
  'Work':          'rgba(200, 60, 0, 0.4)',
}

const CATEGORY_ICONS: Record<string, string> = {
  'World':         '🌍',
  'Tech':          '⚡',
  'Finance':       '📈',
  'Health':        '💪',
  'Sports':        '🏆',
  'Boston Sports': '🏈',
  'SD Sports':     '⚾',
  'Boston':        '🦞',
  'San Diego':     '🌊',
  'Work':          '🧱',
}

export default function ArticleCard({ article, liked, onSave, onDismiss, onScrollNext }: ArticleCardProps) {
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null)
  const [imgFailed, setImgFailed] = useState(false)

  const handleSave = () => {
    if (exiting) return
    setExiting('right')
  }

  const handleDismiss = () => {
    if (exiting) return
    setExiting('left')
  }

  // Fire the actual callback only when the CSS transition fully completes —
  // no setTimeout, no race condition
  const handleTransitionEnd = () => {
    if (exiting === 'left') onDismiss()
    else if (exiting === 'right') onSave()
  }

  const { offsetX, handlers } = useSwipe({
    onSwipeRight: handleSave,
    onSwipeLeft: handleDismiss,
    threshold: 60,
  })

  const rotation = offsetX * 0.04
  const saveOpacity = Math.min(Math.max(offsetX / 60, 0), 1)
  const dismissOpacity = Math.min(Math.max(-offsetX / 60, 0), 1)

  const bg = FALLBACK_GRADIENTS[article.category] || DEFAULT_GRADIENT
  const glowColor = GLOW_COLORS[article.category] || 'rgba(60, 60, 180, 0.3)'
  const icon = CATEGORY_ICONS[article.category] || '📰'
  const showFallback = !article.imageUrl || imgFailed

  let transform = `translateX(${offsetX}px) rotate(${rotation}deg)`
  let transition = 'none'
  if (exiting === 'right') {
    transform = `translateX(110vw) rotate(15deg)`
    transition = 'transform 0.28s ease-in'
  } else if (exiting === 'left') {
    transform = `translateX(-110vw) rotate(-15deg)`
    transition = 'transform 0.28s ease-in'
  } else if (offsetX === 0) {
    transition = 'transform 0.22s ease-out'
  }

  return (
    <div
      className="article-card"
      style={{ transform, transition }}
      onTransitionEnd={handleTransitionEnd}
      {...handlers}
    >
      <div className="card-bg" style={{ background: bg }}>
        {!showFallback && (
          <img
            src={article.imageUrl!}
            alt=""
            className="card-bg-img"
            onError={() => setImgFailed(true)}
          />
        )}
        {showFallback && (
          <div className="card-icon-layer">
            <div className="card-icon-glow" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }} />
            <span className="card-icon">{icon}</span>
            <span className="card-category-label">{article.category}</span>
          </div>
        )}
        <div className="card-bg-gradient" />
      </div>

      <div className="swipe-badge save-badge" style={{ opacity: saveOpacity }}>♥ SAVE</div>
      <div className="swipe-badge skip-badge" style={{ opacity: dismissOpacity }}>SKIP ✕</div>

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
        <button className="scroll-hint" onClick={onScrollNext} aria-label="Next article">↓</button>
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
