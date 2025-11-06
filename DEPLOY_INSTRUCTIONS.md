# Deploy Instructions for CORS Fix

## What Was Fixed
✅ Backend CORS configuration updated to allow ALL origins (like Google Analytics)
✅ This fixes the tracking issue on cyberbykayvon.com (and any other sites)

## Files Changed
- `backend/main.py` - Updated CORS to allow all origins

## Deploy to Railway (2 minutes)

### Option 1: Railway Dashboard (Fastest - Recommended)
1. Go to https://railway.app/
2. Login to your account
3. Click on your "ghosttrack-analytics-production" project
4. Click on the **backend service**
5. Click the **"Redeploy"** button (top right)
6. Wait 1-2 minutes for deployment to complete
7. Done! ✅

### Option 2: Railway CLI
If you prefer CLI:
```bash
cd backend
railway login
railway up
```

## How to Test After Deploy
1. Wait 1-2 minutes for Railway deployment
2. Visit your portfolio at https://cyberbykayvon.com
3. Open browser DevTools (F12) → Console tab
4. Refresh the page
5. You should see NO CORS errors
6. Check Dashboard at https://dashboard.ghosttrack.app
7. Switch to "Portfolio" - you should see tracking data appear!

## Verification
Once deployed, test with:
```bash
curl -X OPTIONS https://ghosttrack-analytics-production.up.railway.app/api/v1/events/track \
  -H "Origin: https://cyberbykayvon.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Look for: `Access-Control-Allow-Origin: *` in the response headers

---

Generated with Claude Code
