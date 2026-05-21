const Anthropic = require('@anthropic-ai/sdk');

let client;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

async function summarizeArticle(article) {
  if (!process.env.ANTHROPIC_API_KEY) return article.excerpt;
  if (!article.title && !article.excerpt) return '';

  try {
    const response = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `Summarize this news article in 2 sentences. Be factual and neutral. No filler phrases.

Title: ${article.title}
Content: ${article.excerpt}

Summary:`
      }]
    });
    return response.content[0].text.trim();
  } catch (err) {
    console.warn('Summary failed:', err.message);
    return article.excerpt.slice(0, 200);
  }
}

// Summarize a batch with small delays to avoid rate limits
async function summarizeBatch(articles) {
  const results = [];
  for (const article of articles) {
    const summary = await summarizeArticle(article);
    results.push({ ...article, summary });
    await new Promise(r => setTimeout(r, 150)); // small delay between calls
  }
  return results;
}

module.exports = { summarizeBatch };
