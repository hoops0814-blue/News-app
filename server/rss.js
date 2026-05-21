const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsApp/1.0)' },
  customFields: { item: ['media:content', 'media:thumbnail', 'enclosure'] }
});

async function fetchFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // last 24 hours

    return parsed.items
      .filter(item => {
        const pubDate = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
        return pubDate > cutoff;
      })
      .slice(0, 8) // max 8 per feed
      .map(item => ({
        id: Buffer.from(item.link || item.title || Math.random().toString()).toString('base64').slice(0, 16),
        title: item.title || '',
        link: item.link || '',
        excerpt: stripHtml(item.contentSnippet || item.content || item.summary || '').slice(0, 400),
        pubDate: item.pubDate || new Date().toISOString(),
        source: feed.source,
        category: feed.category,
        imageUrl: extractImage(item),
        summary: null, // filled in by summarizer
      }));
  } catch (err) {
    console.warn(`Failed to fetch ${feed.source}: ${err.message}`);
    return [];
  }
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractImage(item) {
  if (item['media:content']?.$?.url) return item['media:content'].$.url;
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url;
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) return item.enclosure.url;
  const imgMatch = (item.content || '').match(/<img[^>]+src="([^"]+)"/);
  if (imgMatch) return imgMatch[1];
  return null;
}

module.exports = { fetchFeed };
