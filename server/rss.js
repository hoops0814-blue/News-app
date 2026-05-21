const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsApp/1.0)' },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['media:group', 'mediaGroup'],
    ]
  }
});

async function fetchFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    return parsed.items
      .filter(item => {
        const pubDate = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
        return pubDate > cutoff;
      })
      .slice(0, 8)
      .map(item => ({
        id: Buffer.from((item.link || item.title || Math.random().toString()).slice(0, 64)).toString('base64').slice(0, 16),
        title: item.title || '',
        link: item.link || '',
        excerpt: stripHtml(item.contentSnippet || item.content || item.description || item.summary || '').slice(0, 400),
        pubDate: item.pubDate || new Date().toISOString(),
        source: feed.source,
        category: feed.category,
        imageUrl: extractImage(item),
        summary: null,
      }));
  } catch (err) {
    console.warn(`[RSS] Failed ${feed.source}: ${err.message}`);
    return [];
  }
}

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function extractImage(item) {
  // media:content (single or array)
  if (item.mediaContent) {
    if (item.mediaContent.$?.url) return item.mediaContent.$.url;
    if (Array.isArray(item.mediaContent)) {
      const found = item.mediaContent.find(m => m.$?.url && (!m.$.medium || m.$.medium === 'image'));
      if (found) return found.$.url;
    }
  }

  // media:thumbnail
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;

  // media:group (ESPN uses this structure)
  const group = item.mediaGroup;
  if (group) {
    const content = group['media:content'];
    if (Array.isArray(content) && content[0]?.$?.url) return content[0].$.url;
    if (content?.$?.url) return content.$.url;
  }

  // enclosure — don't require image type, ESPN often omits it
  if (item.enclosure?.url) return item.enclosure.url;

  // img tag in description or content HTML
  const html = item.content || item.description || item['content:encoded'] || '';
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && !match[1].startsWith('data:')) return match[1];

  return null;
}

module.exports = { fetchFeed };
