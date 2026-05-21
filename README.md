# My News — Personal PWA News Feed

A mobile-first progressive web app that aggregates RSS feeds across 8 categories, with AI-powered summaries via Claude.

## Setup

1. Copy the env file and add your Anthropic API key:
   ```bash
   cp .env.example .env
   # Edit .env and set ANTHROPIC_API_KEY=your_key_here
   ```

2. Install all dependencies (root + client):
   ```bash
   npm run install:all
   ```

3. Start the dev server (runs both backend and frontend):
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

> **Note:** The API key is optional. Without it, the app shows raw article excerpts instead of AI summaries.

---

## Access on iPhone (Add to Home Screen)

1. Find your Mac's local IP address:
   ```bash
   ipconfig getifaddr en0
   ```
   Example output: `192.168.1.42`

2. Make sure your iPhone is on the same Wi-Fi network as your Mac.

3. Open Safari on your iPhone and navigate to:
   ```
   http://192.168.1.42:5173
   ```

4. Tap the **Share** button (box with arrow) → **Add to Home Screen** → **Add**

The app will install as a standalone PWA with a dark theme, no browser chrome, and iOS safe-area support.

---

## Categories

| Tab | What's included |
|-----|----------------|
| **All** | Everything combined |
| **World** | BBC News, NPR, Reuters |
| **Tech** | The Verge, Ars Technica, Wired, MIT Tech Review |
| **Finance** | CNBC, MarketWatch, Yahoo Finance |
| **Health** | WebMD, Harvard Health |
| **Sports** | ESPN (NFL/MLB/NBA) + Boston teams (Red Sox, Patriots, Celtics) + SD Padres |
| **Boston** | WBUR, Boston Globe local + Boston Sports teams |
| **San Diego** | KPBS, SD Union Tribune local + Padres |

---

## Adding Custom RSS Feeds

Edit `server/feeds.js` and add an entry to the `feeds` array:

```javascript
{ category: 'Tech', source: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
```

Valid categories: `'World'`, `'Tech'`, `'Finance'`, `'Health'`, `'Sports'`, `'Boston Sports'`, `'SD Sports'`, `'Boston'`, `'San Diego'`

The server refreshes feeds automatically every 30 minutes. Hit the ↻ button in the app to force an immediate refresh.

---

## Architecture

- **Backend:** Node.js + Express, RSS parsing via `rss-parser`, 30-minute in-memory cache via `node-cache`
- **AI Summaries:** Claude Haiku via `@anthropic-ai/sdk` — first 100 articles per refresh cycle get 2-sentence summaries
- **Frontend:** React 18 + TypeScript + Vite, served as a PWA via `vite-plugin-pwa`
- **Proxy:** Vite dev server proxies `/api` requests to port 3001, so no CORS issues in development
