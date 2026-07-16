# Cortex — free-tier deploy

## What’s free
| Piece | Host | Notes |
|-------|------|--------|
| Database | **Neon** (already) | Free |
| API | **Render** free web | Sleeps after idle; cold start ~30–60s |
| Website | **Vercel** Hobby | Free |
| APK | **EAS** free quota | ~15 Android builds / month |

No paid disk on Render free → uploaded files reset on redeploy. Seed recreates demo PDFs/animations.

## 1) Backend (Render free)
1. Open https://dashboard.render.com → New → Blueprint
2. Connect `ShanmukhaSatvik/Cortex` and select `render.yaml`
3. Fill env (from Neon / local `.env`):
   - `DATABASE_URL`, `DIRECT_URL`
   - `PLATFORM_ADMIN_PASSWORD`
4. Deploy → copy URL e.g. `https://cortex-api.onrender.com`

Optional once live:
```
curl -X POST https://YOUR-API/api/...   # or SSH/shell seed
```
From your machine against production DB:
```
cd backend
# with production DATABASE_URL in .env
npm run db:seed
```

## 2) Website (Vercel free)
```
cd frontend
$env:EXPO_PUBLIC_API_URL="https://YOUR-API.onrender.com/api"
npx vercel --yes
```

## 3) Rebuild APK pointing at production API
```
cd frontend
$env:EXPO_PUBLIC_API_URL="https://YOUR-API.onrender.com/api"
npx eas-cli build -p android --profile preview --non-interactive
```
