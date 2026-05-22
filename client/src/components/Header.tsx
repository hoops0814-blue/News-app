interface HeaderProps {
  onRefresh: () => void
  refreshing: boolean
  lastUpdated: Date | null
  remaining: number
}

export default function Header({ onRefresh, refreshing, lastUpdated, remaining }: HeaderProps) {
  const timeAgo = lastUpdated ? formatTimeAgo(lastUpdated) : null
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">My<span style={{ color: 'var(--green)' }}>News</span></h1>
        {timeAgo && <span className="header-updated">Updated {timeAgo}</span>}
      </div>
      <div className="header-right">
        {remaining > 0 && (
          <span className="header-remaining">{remaining} left</span>
        )}
        <button
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh"
        >
          ↻
        </button>
      </div>
    </header>
  )
}

function formatTimeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}
