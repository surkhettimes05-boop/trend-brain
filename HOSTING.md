# Hosting TrendBrain Core

Recommended free demo setup: Vercel free tier + Neon free Postgres.

## 1. Create Neon Postgres

1. Go to Neon and create a free project.
2. Copy the pooled connection string.
3. It should look like:

```text
postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require
```

Use that as `DATABASE_URL`.

## 2. Import GitHub Repo Into Vercel

1. In Vercel, choose Add New Project.
2. Import `surkhettimes05-boop/trend-brain`.
3. Framework should be Vite.
4. Vercel will use `vercel.json`:
   - Build command: `npm run vercel:build`
   - Output directory: `dist`
   - Serverless API: `api/[...path].ts`

## 3. Set Vercel Environment Variables

Required:

```text
DATABASE_URL=postgresql://...neon.tech/...?...sslmode=require
ADMIN_API_TOKEN=choose-a-long-random-secret
NODE_ENV=production
DISABLE_CRON=true
```

Optional:

```text
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
ALLOWED_ORIGIN=https://YOUR-VERCEL-APP.vercel.app
```

Google Trends is not recommended on Vercel free because it needs Python dependencies and is often rate-limited by Google. The endpoint remains available, but expect it to return `unavailable` when Google blocks it.

## 4. Verify

After deployment:

```powershell
Invoke-RestMethod https://YOUR-VERCEL-APP.vercel.app/health
Invoke-RestMethod https://YOUR-VERCEL-APP.vercel.app/api/dashboard
```

Admin endpoints require a bearer token:

```powershell
$headers = @{ Authorization = "Bearer YOUR_ADMIN_API_TOKEN" }
Invoke-RestMethod -Method Post https://YOUR-VERCEL-APP.vercel.app/api/collect/daraz -Headers $headers
Invoke-RestMethod -Method Post https://YOUR-VERCEL-APP.vercel.app/api/analyze -Headers $headers
```

For dashboard buttons, open browser devtools and run:

```js
localStorage.setItem("trendbrain_admin_token", "YOUR_ADMIN_API_TOKEN")
```

## Exports

- Latest report JSON: `/api/export/report.json`
- Ranked trends CSV: `/api/export/trends.csv`
- Signals CSV: `/api/export/signals.csv`

## Limits On The Free Setup

- Vercel serverless functions are not ideal for long scraping jobs.
- Keep collectors manual and low frequency.
- For real scheduled collection, move collectors to a paid worker/VPS later.
- Neon free Postgres may sleep or have usage limits.
