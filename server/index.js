require('dotenv').config();
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const path = require('path');
const feeds = require('./feeds');
const { fetchFeed } = require('./rss');
const { summarizeBatch } = require('./summarize');

const app = express();
const cache = new NodeCache({ stdTTL: 1800 }); // 30 min cache

app.use(cors());
app.use(express.json());

let isRefreshing = false;

async function refreshArticles() {
  if (isRefreshing) return;
  isRefreshing = true;
  console.log('[News] Fetching feeds...');

  try {
    // Fetch all feeds in parallel
    const feedResults = await Promise.all(feeds.map(feed => fetchFeed(feed)));
    const allArticles = feedResults.flat();

    // Sort by date
    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Deduplicate by title similarity
    const seen = new Set();
    const unique = allArticles.filter(a => {
      const key = a.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`[News] ${unique.length} unique articles. Summarizing top 80...`);

    // Summarize in batches to avoid overwhelming the API
    const summarized = [];
    const batchSize = 10;
    for (let i = 0; i < Math.min(unique.length, 100); i += batchSize) {
      const batch = unique.slice(i, i + batchSize);
      const done = await summarizeBatch(batch);
      summarized.push(...done);
      console.log(`[News] Summarized ${summarized.length}/${Math.min(unique.length, 100)}`);
    }

    // Add unsummarized articles (beyond first 100)
    const rest = unique.slice(100).map(a => ({ ...a, summary: a.excerpt.slice(0, 200) }));

    cache.set('articles', [...summarized, ...rest]);
    console.log(`[News] Done. ${summarized.length + rest.length} articles ready.`);
  } catch (err) {
    console.error('[News] Refresh error:', err.message);
  } finally {
    isRefreshing = false;
  }
}

app.get('/api/news', (req, res) => {
  const articles = cache.get('articles') || [];
  const { category } = req.query;

  if (!category || category === 'All') {
    return res.json(articles);
  }

  // Category mapping for the tabs
  const categoryMap = {
    'World': ['World'],
    'Tech': ['Tech'],
    'Finance': ['Finance'],
    'Health': ['Health'],
    'Sports': ['Sports', 'Boston Sports', 'SD Sports'],
    'Boston': ['Boston', 'Boston Sports'],
    'San Diego': ['San Diego', 'SD Sports'],
  };

  const cats = categoryMap[category] || [category];
  const filtered = articles.filter(a => cats.includes(a.category));
  res.json(filtered);
});

app.get('/api/refresh', async (req, res) => {
  refreshArticles();
  res.json({ status: 'refreshing' });
});

app.get('/api/status', (req, res) => {
  const articles = cache.get('articles') || [];
  res.json({ count: articles.length, isRefreshing });
});

// Serve the built React app in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[News] Server running on http://localhost:${PORT}`);
  refreshArticles(); // Initial load on startup
  setInterval(refreshArticles, 30 * 60 * 1000); // Refresh every 30 min
});
