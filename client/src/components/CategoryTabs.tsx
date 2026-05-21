interface CategoryTabsProps {
  categories: string[]
  active: string
  onChange: (cat: string) => void
}

export default function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  return (
    <nav className="category-nav">
      <div className="category-scroll">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-tab ${active === cat ? 'active' : ''}`}
            onClick={() => onChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </nav>
  )
}
