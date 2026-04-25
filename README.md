# Pulse — Social Portfolio Intelligence for Bags

> The social finance layer that transforms Bags.fm creator token trading into a multiplayer community experience.

[![Bags API](https://img.shields.io/badge/Bags-API%20Integrated-14B8A6)](https://bags.fm)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e)](https://supabase.com)

## 🔥 Features

### Live Token Heatmap (F1)
Real-time momentum visualization of all Bags creator tokens. Color-coded from teal (bullish) to coral (bearish) using a multi-factor momentum algorithm.

### 🏆 Social Leaderboard (F2)
Top curator wallets ranked by prediction accuracy. Who spots the winners early?

### 👥 Squad Portfolios (F3)
Team up with friends. See combined holdings, shared picks, and collective alpha.

### 🤖 AI Market Briefs (F4)
Gemini-powered 3-sentence market analysis for every token. Fast, free, insightful.

### 💰 Fee-Share Display (F5)
Real-time fee earnings visualization using Bags claimable-positions API.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| Bags | REST API (`public-api-v2.bags.fm`) |
| AI | Google Gemini 2.0 Flash (free tier) |
| Market Data | DexScreener API (free) |
| Deployment | Vercel |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/pulse.git
cd pulse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Pulse.

## 🔑 Environment Variables

| Variable | Required | Source |
|---|---|---|
| `BAGS_API_KEY` | ✅ | [dev.bags.fm](https://dev.bags.fm) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard |
| `GEMINI_API_KEY` | Optional | [aistudio.google.com](https://aistudio.google.com) |

## 📊 Data Pipeline

```
Bags API (token launches) → DexScreener (price/volume) → Momentum Algorithm → Heatmap UI
```

## 📁 Project Structure

```
pulse/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   │   ├── tokens/   # Token data + momentum
│   │   │   ├── token/    # Single token detail
│   │   │   ├── leaderboard/
│   │   │   ├── squads/
│   │   │   ├── ai-brief/
│   │   │   └── fee-share/
│   │   ├── leaderboard/  # Leaderboard page
│   │   ├── squad/        # Squad pages
│   │   ├── token/        # Token detail page
│   │   └── profile/      # User profile page
│   ├── components/
│   │   └── layout/       # Header, navigation
│   ├── lib/
│   │   ├── bags.ts       # Bags API client
│   │   ├── supabase.ts   # Database client
│   │   ├── momentum.ts   # Scoring algorithm
│   │   ├── dex-data.ts   # DexScreener integration
│   │   ├── cache.ts      # TTL cache
│   │   └── token-aggregator.ts
│   └── types/            # TypeScript interfaces
└── supabase/
    └── schema.sql        # Database schema
```

## 🏗️ Hackathon

Built for the **Bags Hackathon** on DoraHacks.

- **Track**: Social Finance
- **API**: Bags REST API integration
- **Deadline**: June 1, 2026

## 📄 License

MIT
