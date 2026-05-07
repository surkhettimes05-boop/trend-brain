# TrendBrain Core

TrendBrain Core is a real backend-backed Nepal commerce trend detection system. The Vite frontend is served by the same Express process, and all dashboard data now comes from API endpoints backed by PostgreSQL and Prisma.

For free staging deployment, use Vercel + Neon. See [HOSTING.md](HOSTING.md).

## What Is Real

- PostgreSQL persistence through Prisma models for `Signal`, `ProductSignal`, `RetailerSignal`, `Trend`, `AIReport`, and `CollectorRun`.
- Retailer signal input is stored directly in PostgreSQL via `POST /api/retailer-signals`.
- Daraz collection fetches live Daraz Nepal category/search pages with polite headers and stores parsed products in `ProductSignal`.
- Google Trends collection calls a Python `pytrends` collector and stores returned keyword interest in `Signal`.
- Trend scoring uses the requested weighted formula and only uses collected database evidence.
- AI analysis supports OpenAI-compatible chat completions or Ollama-compatible local models. If neither is configured, the analyzer creates rule-based trend records from real collected data and marks the report with AI status.
- Collector status is based on `CollectorRun` rows, including failed, unavailable, active, and stale states.

## What Needs Setup

- PostgreSQL must be running and `DATABASE_URL` must point to a real database.
- Google Trends requires Python plus `pytrends`. Without it, the collector returns `unavailable` and keeps prior data.
- OpenAI or Ollama credentials are optional but required for AI-written strategic summaries. Without them, no AI intelligence is fabricated.
- Daraz selectors may need maintenance if Daraz changes page markup or blocks scraping.

## Windows PowerShell Setup

```powershell
Copy-Item .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

This workspace also has a local portable PostgreSQL setup under `.local/` using port `55432`. To restart it later:

```powershell
npm run db:start
npm run db:stop
```

Optional Google Trends setup:

```powershell
python -m pip install pytrends
npm run collect:google-trends
```

Manual collection and analysis:

```powershell
npm run collect:daraz
npm run analyze
```

## API Endpoints

- `GET /health` backend and database status.
- `GET /api/signals` latest collected Google Trends, Daraz, and retailer signals.
- `POST /api/retailer-signals` manual retailer input.
- `GET /api/trends` ranked trends by `finalScore`.
- `GET /api/trends/:id` trend detail plus supporting evidence.
- `POST /api/analyze` run scoring and AI/report generation.
- `GET /api/reports/latest` latest strategic report.
- `POST /api/collect/google-trends` run Google Trends collector.
- `POST /api/collect/daraz` run Daraz collector.
- `GET /api/collectors` collector last-run state.

## Testing Data

There is no mock seeding command in the default flow. For testing without external collectors, use the real retailer input endpoint:

```powershell
Invoke-RestMethod -Method Post http://localhost:3000/api/retailer-signals `
  -ContentType "application/json" `
  -Body '{"retailerName":"Test Retailer","location":"Kathmandu","signalType":"manual_observation","productName":"korean noodles","category":"FMCG","note":"Customers are asking for cheaper Korean noodles and faster restock.","urgency":8}'
```

This is manual test data, not simulated collector data.
