# GhostTrack Tracker Usage Guide

## Installation

### Silent Mode (Production) - Recommended for Live Sites

No console output - completely invisible to users:

```html
<script src="https://your-api.com/tracker/ghosttrack.js"
        data-ghosttrack
        data-site-id="kayvontennis-com"
        data-api-url="https://your-api.com">
</script>
```

**Console output:** *(none - completely silent)*

---

### Debug Mode (Development/Testing)

Shows console logs for debugging:

```html
<script src="https://your-api.com/tracker/ghosttrack.js"
        data-ghosttrack
        data-site-id="kayvontennis-com"
        data-api-url="https://your-api.com"
        data-debug="true">
</script>
```

**Console output:**
```
GhostTrack Analytics initialized
Site ID: kayvontennis-com
API Endpoint: https://your-api.com
Session ID: abc123-xyz789
```

---

## Configuration Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-ghosttrack` | ✅ Yes | - | Marks this as the GhostTrack script |
| `data-site-id` | Recommended | `'default-site'` | Your unique site identifier |
| `data-api-url` | Recommended | Railway production URL | Your GhostTrack API base URL |
| `data-debug` | No | `false` | Enable console logging (`true` or `false`) |

---

## Examples

### Example 1: Production on kayvontennis.com
```html
<!-- Completely silent - no console logs -->
<script src="https://ghosttrack-analytics-production.up.railway.app/tracker/ghosttrack.js"
        data-ghosttrack
        data-site-id="kayvontennis-com"
        data-api-url="https://ghosttrack-analytics-production.up.railway.app">
</script>
```

### Example 2: Local Development with Debugging
```html
<!-- Shows logs in console for debugging -->
<script src="http://localhost:8000/tracker/ghosttrack.js"
        data-ghosttrack
        data-site-id="local-test"
        data-api-url="http://localhost:8000"
        data-debug="true">
</script>
```

### Example 3: Multiple Sites (Different Configs)
```html
<!-- Site A: Production (silent) -->
<script src="https://api.ghosttrack.app/tracker/ghosttrack.js"
        data-ghosttrack
        data-site-id="site-a-com">
</script>

<!-- Site B: Staging with debug -->
<script src="https://staging.ghosttrack.app/tracker/ghosttrack.js"
        data-ghosttrack
        data-site-id="site-b-staging"
        data-api-url="https://staging.ghosttrack.app"
        data-debug="true">
</script>
```

---

## What Gets Tracked?

GhostTrack automatically tracks:

1. **Pageviews** - Every page load
2. **Clicks** - All user clicks with element details
3. **Heatmap Data** - Click coordinates for heatmap visualization
4. **Session Data** - Persistent session IDs via localStorage
5. **Device Info** - Screen size, viewport, user agent
6. **Bot Detection** - Automatically flags suspicious user agents
7. **Page Engagement** - Time on page, visibility changes
8. **Custom Events:**
   - Add to cart clicks (elements with `.add-to-cart` class)
   - Suspicious activity (rapid clicking)
   - Page exits

---

## Custom Event Tracking

GhostTrack exposes a global API for custom event tracking:

```javascript
// Track a custom event
window.ghostTrack.track('button_click', {
  button_name: 'Sign Up',
  location: 'header'
});

// Get the current session ID
const sessionId = window.ghostTrack.getSessionId();
console.log('Current session:', sessionId);
```

---

## Privacy & Security

- **Session Storage:** Uses localStorage (not cookies)
- **No PII:** Does not collect names, emails, or personal data
- **Bot-Aware:** Automatically detects and flags bot traffic
- **Rate Limited:** Backend enforces 100 requests/minute per IP
- **CORS Protected:** Only accepts requests from allowed origins

---

## Troubleshooting

### No data showing up in dashboard?

1. **Check console (debug mode):**
   ```html
   <script ... data-debug="true"></script>
   ```
   Look for error messages

2. **Verify API URL is correct:**
   - Local: `http://localhost:8000`
   - Production: Your deployed URL

3. **Check CORS settings** in `backend/main.py`:
   ```python
   allow_origins=[
       "https://yourdomain.com",  # Add your domain
       ...
   ]
   ```

4. **Test the API directly:**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy"}
   ```

### Console says "blocked by CORS"?

Add your website domain to the CORS whitelist in `backend/main.py`:
```python
allow_origins=[
    "https://yourdomain.com",
    "http://localhost:3000",
]
```

---

## Migration from Old Version

If you're updating from an older version:

**Old (hardcoded URLs):**
```html
<script src="/tracker/ghosttrack.js"></script>
```

**New (configurable, silent by default):**
```html
<script src="/tracker/ghosttrack.js"
        data-ghosttrack
        data-site-id="your-site"
        data-api-url="https://your-api.com">
</script>
```

---

## Best Practices

✅ **DO:**
- Use silent mode (no `data-debug`) on production sites
- Use unique `data-site-id` for each website you track
- Keep `data-api-url` pointing to your production API
- Test with `data-debug="true"` during development

❌ **DON'T:**
- Leave `data-debug="true"` on production sites (clutters user console)
- Use the default `data-site-id` ("default-site") for real sites
- Forget to add your domain to CORS whitelist
- Track sensitive user input (passwords, credit cards, etc.)

---

## Support

For issues or questions:
- Check `SECURITY_FIXES.md` for recent changes
- Check `CLAUDE.md` for architecture overview
- Review API docs at http://localhost:8000/docs
