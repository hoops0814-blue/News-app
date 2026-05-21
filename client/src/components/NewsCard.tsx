import type { Article } from '../App'

interface NewsCardProps {
  article: Article
  liked: boolean
  disliked: boolean
  onLike: () => void
  onDislike: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  'World': '#3b82f6',
  'Tech': '#a78bfa',
  'Finance': '#1DB954',
  'Health': '#f59e0b',
  'Sports': '#ef4444',
  'Boston Sports': '#c41e3a',
  'SD Sports': '#f97316',
  'Boston': '#06b6d4',
  'San Diego': '#ec4899',
}

export default function NewsCard({ article, liked, onLike, onDislike }: NewsCardProps) {
  const color = CATEGORY_COLORS[article.category] || '#6b7280'
  const timeAgo = formatTimeAgo(new Date(article.pubDate))
  const displayText = article.summary || article.excerpt

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLike()
  }

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDislike()
  }

  return (
    <article className="news-card" onClick={() => window.open(article.link, '_blank', 'noopener')}>
      {article.imageUrl && (
        <div className="card-image-wrap">
          <img
            src={article.imageUrl}
            alt=""
            className="card-image"
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
          />
          <div className="card-image-overlay" />
        </div>
      )}
      <div className="card-body">
        <div className="card-meta">
          <span className="card-tag" style={{ background: color + '28', color, borderColor: color + '44' }}>
            {article.category}
          </span>
          <span className="card-source">{article.source}</span>
          <span className="card-time">{timeAgo}</span>
        </div>
        <h2 className="card-title">{article.title}</h2>
        {displayText && <p className="card-summary">{displayText}</p>}
        <div className="card-footer">
          <span className="card-read">Read article →</span>
          <div className="card-actions">
            <button
              className={`action-btn like-btn ${liked ? 'active' : ''}`}
              onClick={handleLike}
              aria-label="Like"
            >
              {liked ? '♥' : '♡'}
            </button>
            <button
              className="action-btn dislike-btn"
              onClick={handleDislike}
              aria-label="Not interested"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function formatTimeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (isNaN(mins) || mins < 0) return 'recently'
  if (mins < 60) return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}
