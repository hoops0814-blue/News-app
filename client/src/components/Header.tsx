interface HeaderProps {
  onRefresh: () => void
  refreshing: boolean
  lastUpdated: Date | null
}

export default function Header({ onRefresh, refreshing, lastUpdated }: HeaderProps) {
  const timeAgo = lastUpdated ? formatTimeAgo(lastUpdated) : null

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">My News</h1>
        {timeAgo && <span className="header-updated">Updated {timeAgo}</span>}
      </div>
      <button
        className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
        onClick={onRefresh}
        disabled={refreshing}
        aria-label="Refresh feed"
      >
        ↻
      </button>
    </header>
  )
}

function formatTimeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}
