import type { Article } from '../App'

interface NewsCardProps {
  article: Article
}

const CATEGORY_COLORS: Record<string, string> = {
  'World': '#3b82f6',
  'Tech': '#8b5cf6',
  'Finance': '#10b981',
  'Health': '#f59e0b',
  'Sports': '#ef4444',
  'Boston Sports': '#ef4444',
  'SD Sports': '#f97316',
  'Boston': '#06b6d4',
  'San Diego': '#ec4899',
}

export default function NewsCard({ article }: NewsCardProps) {
  const color = CATEGORY_COLORS[article.category] || '#6b7280'
  const timeAgo = formatTimeAgo(new Date(article.pubDate))
  const displayText = article.summary || article.excerpt

  return (
    <article className="news-card" onClick={() => window.open(article.link, '_blank')}>
      {article.imageUrl && (
        <div className="card-image-wrap">
          <img
            src={article.imageUrl}
            alt=""
            className="card-image"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
      <div className="card-body">
        <div className="card-meta">
          <span className="card-tag" style={{ background: color + '22', color }}>
            {article.category}
          </span>
          <span className="card-source">{article.source}</span>
          <span className="card-time">{timeAgo}</span>
        </div>
        <h2 className="card-title">{article.title}</h2>
        {displayText && <p className="card-summary">{displayText}</p>}
        <div className="card-footer">
          <span className="card-read">Read article →</span>
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
