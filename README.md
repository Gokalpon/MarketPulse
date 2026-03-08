# Market Pulse

Real-time market insights, AI-powered trend analysis, and community-driven sentiment for market professionals.

## Features

- **Live Market Dashboard** — Interactive charts with AI consensus bubbles and news alerts
- **AI Market Pulse** — Gemini-powered real-time analysis for any asset
- **Community** — Trending comments, win rates, and social trading insights
- **Watchlist** — Personalized asset tracking with list/grid views
- **Multi-language** — English, Turkish, and 6 more languages
- **Mobile-first** — iOS-style glassmorphic design

## Setup

**Prerequisites:** Node.js 20+

```bash
npm install
```

Create a `.env` file in the project root:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the development server:

```bash
npm run dev
```

## Deploy

### Vercel

1. Push this repo to GitHub
2. Import on [vercel.com](https://vercel.com) → Select the repo
3. Framework Preset: **Vite**
4. Add environment variable: `GEMINI_API_KEY`
5. Deploy

### Cloudflare Pages

1. Connect repo on Cloudflare Dashboard → Workers & Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable: `GEMINI_API_KEY`
5. Deploy

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Motion (Framer Motion)
- Gemini API (@google/genai)
- Lucide React Icons
