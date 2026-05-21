const feeds = [
  // World & Politics
  { category: 'World', source: 'BBC News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
  { category: 'World', source: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml' },
  { category: 'World', source: 'AP News', url: 'https://news.google.com/rss/search?q=world+news+site:apnews.com&hl=en-US&gl=US&ceid=US:en' },

  // Tech & Science
  { category: 'Tech', source: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { category: 'Tech', source: 'Ars Technica', url: 'http://feeds.arstechnica.com/arstechnica/index' },
  { category: 'Tech', source: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { category: 'Tech', source: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },

  // Finance & Economy
  { category: 'Finance', source: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
  { category: 'Finance', source: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/' },
  { category: 'Finance', source: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },

  // Health & Wellness
  { category: 'Health', source: 'WebMD', url: 'https://www.webmd.com/news/rss.aspx' },
  { category: 'Health', source: 'Health News', url: 'https://news.google.com/rss/search?q=health+medical+news&hl=en-US&gl=US&ceid=US:en' },

  // Sports - General
  { category: 'Sports', source: 'ESPN NFL', url: 'https://www.espn.com/espn/rss/nfl/news' },
  { category: 'Sports', source: 'ESPN MLB', url: 'https://www.espn.com/espn/rss/mlb/news' },
  { category: 'Sports', source: 'ESPN NBA', url: 'https://www.espn.com/espn/rss/nba/news' },

  // Sports - Boston Teams (using Google News RSS search)
  { category: 'Boston Sports', source: 'Red Sox News', url: 'https://news.google.com/rss/search?q=Boston+Red+Sox&hl=en-US&gl=US&ceid=US:en' },
  { category: 'Boston Sports', source: 'Patriots News', url: 'https://news.google.com/rss/search?q=New+England+Patriots&hl=en-US&gl=US&ceid=US:en' },
  { category: 'Boston Sports', source: 'Celtics News', url: 'https://news.google.com/rss/search?q=Boston+Celtics&hl=en-US&gl=US&ceid=US:en' },

  // Sports - San Diego Team
  { category: 'SD Sports', source: 'Padres News', url: 'https://news.google.com/rss/search?q=San+Diego+Padres&hl=en-US&gl=US&ceid=US:en' },

  // Boston Local
  { category: 'Boston', source: 'WBUR', url: 'https://www.wbur.org/rss' },
  { category: 'Boston', source: 'Boston Globe', url: 'https://news.google.com/rss/search?q=Boston+local+news&hl=en-US&gl=US&ceid=US:en' },

  // San Diego Local
  { category: 'San Diego', source: 'KPBS', url: 'https://www.kpbs.org/feeds/news.rss' },
  { category: 'San Diego', source: 'SD Union Tribune', url: 'https://news.google.com/rss/search?q=San+Diego+local+news&hl=en-US&gl=US&ceid=US:en' },

  // Work — Databricks & Industry
  { category: 'Work', source: 'Databricks Blog', url: 'https://www.databricks.com/feed' },
  { category: 'Work', source: 'Databricks News', url: 'https://news.google.com/rss/search?q=Databricks&hl=en-US&gl=US&ceid=US:en' },
  { category: 'Work', source: 'Snowflake', url: 'https://news.google.com/rss/search?q=Snowflake+data+cloud&hl=en-US&gl=US&ceid=US:en' },
  { category: 'Work', source: 'AWS', url: 'https://aws.amazon.com/blogs/aws/feed/' },
  { category: 'Work', source: 'Azure', url: 'https://azure.microsoft.com/en-us/blog/feed/' },
  { category: 'Work', source: 'Google Cloud', url: 'https://news.google.com/rss/search?q=Google+Cloud+Platform+announcement&hl=en-US&gl=US&ceid=US:en' },
  { category: 'Work', source: 'OpenAI', url: 'https://news.google.com/rss/search?q=OpenAI&hl=en-US&gl=US&ceid=US:en' },
  { category: 'Work', source: 'Anthropic', url: 'https://news.google.com/rss/search?q=Anthropic+AI&hl=en-US&gl=US&ceid=US:en' },
  { category: 'Work', source: 'Cerebras', url: 'https://news.google.com/rss/search?q=Cerebras+Systems&hl=en-US&gl=US&ceid=US:en' },
  { category: 'Work', source: 'SpaceX', url: 'https://news.google.com/rss/search?q=SpaceX&hl=en-US&gl=US&ceid=US:en' },
  { category: 'Work', source: 'NVIDIA', url: 'https://news.google.com/rss/search?q=NVIDIA+AI+GPU&hl=en-US&gl=US&ceid=US:en' },
];

module.exports = feeds;
