# AI IT Services Contract Tracker (Next.js)

## Features
- Role-based access (`admin`, `analyst`)
- Front-end contract search, list view, and heat maps
- AI extraction from press-release text (OpenAI with fallback rules)
- One-click historical prepopulation (2010+): Contracts, Financial Results, M&A, New Offerings, Partnerships
- Export to CSV (Excel-compatible)
- Database provider switch:
  - `file` (local JSON)
  - `supabase` (Postgres via Supabase REST)

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template:
   ```bash
   cp .env.example .env.local
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

Default local credentials:
- `admin / admin123` (ingestion + admin)
- `analyst / analyst123` (read-only)

## Supabase Setup (Postgres)
1. Set in `.env.local`:
   - `DATABASE_PROVIDER=supabase`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
2. Apply schema in Supabase SQL editor:
   - [db/schema.sql](/Users/michaelcook/Documents/Documents%20-%20Michael%E2%80%99s%20MacBook%20Air/Documents%202026/personal%20projects/latest%20v/b-yson-training-nextjs-branded/db/schema.sql)

## OpenAI Extraction
Set:
- `OPENAI_API_KEY`
- optional `OPENAI_MODEL` (default: `gpt-4o-mini`)
- optional `OPENAI_SUMMARY_MODEL` (default: `chatgpt-5.4`)

If OpenAI is unavailable, extraction falls back to rule-based parsing.

The article write-up engine uses OpenAI for:
- insightful summaries (hard-capped to 200 words)
- market/provider implications
- financial results comparison table (current period vs same period previous year)

## Historical Prepopulation API
`POST /api/contracts/prepopulate` (admin only), payload example:
```json
{
  "historical": true,
  "startYear": 2010,
  "categories": ["Contracts", "Financial Results", "M&A", "New Offerings", "Partnerships"],
  "maxPerCategoryPerYear": 2
}
```
