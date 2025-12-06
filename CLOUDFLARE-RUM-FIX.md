# Cloudflare RUM (Real User Monitoring) Issue - CRITICAL FIX

## 🚨 Problem Description

**Symptom**: After some time using the Hub app in staging/production, clicking submit buttons or navigating to different pages causes the app to hang. The browser shows:

```
Request URL: https://hub.e-masjid.my/cdn-cgi/rum?
Request Method: POST
Status Code: 204 No Content
```

**Impact**:

- App becomes completely unresponsive
- All navigation and form submissions fail
- Users must manually clear localStorage, refresh, and login again
- Affects ALL pages in the Hub app

## 🔍 Root Cause

Cloudflare Pages automatically enables **RUM (Real User Monitoring)** by default, which injects a beacon script that tracks user interactions. This beacon interferes with React's SPA routing and form submissions, causing the application to hang while waiting for RUM requests to complete.

This is a known issue with Cloudflare's automatic RUM injection on single-page applications (SPAs).

## ✅ Solution: Disable RUM in Cloudflare Dashboard

### For Each Cloudflare Pages Project:

#### Option 1: Via Analytics Tab (Current UI - 2025)

1. **Login to Cloudflare Dashboard**: https://dash.cloudflare.com/
2. Go to **Pages** → Select your project (e.g., `hub-emasjid-staging` or `hub-emasjid-production`)
3. Click **Analytics** tab (or **Speed** tab if available)
4. Look for **Web Analytics** or **Real User Monitoring (RUM)** section
5. If RUM is enabled, click to **Disable** it
6. Confirm the change

#### Option 2: Via Account-Level Analytics (Alternative)

1. From Cloudflare Dashboard home
2. Go to **Account** → **Analytics & Logs** → **Web Analytics**
3. Look for your domain (e.g., `hub.e-masjid.my`)
4. If it's listed, click the **⚙️ Settings** icon
5. **Disable** or **Remove** the site from Web Analytics
6. Confirm the change

#### Option 3: If RUM is Already Disabled

If you don't see RUM/Web Analytics in either location, it might already be disabled! To verify:

1. Open your Hub app: https://hub.e-masjid.my
2. Open **DevTools** → **Network** tab
3. Navigate through the app and submit forms
4. **Search for**: `cdn-cgi/rum`
5. If you see these requests → RUM is enabled (need to disable via support)
6. If you DON'T see these requests → RUM is already disabled ✅

### Projects That Need This Fix:

- ✅ `hub-emasjid-production` (Branch: `main`)
- ✅ `hub-emasjid-staging` (Branch: `dev`)
- ℹ️ `public-emasjid-production` (Optional - Next.js handles this better)
- ℹ️ `public-emasjid-staging` (Optional)
- ℹ️ `tv-emasjid-production` (Optional)
- ℹ️ `tv-emasjid-staging` (Optional)

> **Note**: The Hub app is most affected because it's a Vite/React SPA. Next.js apps (Public/TV) handle Cloudflare integrations better due to SSR.

## 🔄 Verification Steps

### Check if RUM is Currently Active:

1. Open https://hub.e-masjid.my (or staging)
2. Open **DevTools** (F12) → **Network** tab
3. Click on any page or submit a form
4. **Filter/Search** for: `rum` or `cdn-cgi`
5. If you see `/cdn-cgi/rum?` requests → RUM is active ❌
6. If you DON'T see them → RUM is disabled ✅

### After Disabling RUM:

1. **Clear your browser cache** (Ctrl+Shift+Delete / Cmd+Shift+Delete)
2. **Hard refresh** the page (Ctrl+Shift+R / Cmd+Shift+R)
3. Open DevTools → Network tab
4. Navigate through the Hub app
5. Submit forms
6. **Verify**: No more `/cdn-cgi/rum?` requests appear
7. **Confirm**: App navigation and form submissions work smoothly

### If RUM Requests Still Appear:

This means RUM is still enabled somewhere. Try:

1. Check **ALL pages** projects (staging + production)
2. Check Account-level Web Analytics (see Option 2 above)
3. Contact Cloudflare Support via dashboard to disable RUM
4. Wait 5-10 minutes for CDN cache to clear after disabling

## 🛡️ Prevention & Alternatives

### If You Can't Find RUM Settings:

Cloudflare's UI changes frequently. If you can't find the RUM toggle:

1. **Contact Cloudflare Support** via the dashboard
2. Request: "Please disable Real User Monitoring (RUM) for Pages project: hub-emasjid-production"
3. Explain it's causing SPA navigation issues
4. They can disable it from the backend

### Alternative: Manual Web Analytics (If You Still Want Tracking)

If you still want analytics but without the interference:

1. In Cloudflare Dashboard → **Account** → **Analytics & Logs** → **Web Analytics**
2. Create a **new site** for your domain manually
3. Copy the **beacon script** they provide
4. Add it to `apps/hub/index.html` **manually** in the `<head>` section (this gives you control)
5. Keep the automatic Pages RUM **disabled**

This way you control when and how analytics are loaded, preventing conflicts with React.

### Using Meta Tags to Disable (Experimental):

You can also try adding this to `apps/hub/index.html`:

```html
<meta name="cloudflare-rum" content="disabled" />
```

This may prevent automatic RUM injection (not officially documented, but worth trying).

## 📝 Configuration Files Updated

The following configuration files have been updated with RUM disable notes:

- `deployment/cloudflare/README.md` - Added RUM troubleshooting section
- `deployment/cloudflare/pages-config/hub-production.toml` - Added RUM disable comment
- `deployment/cloudflare/pages-config/hub-staging.toml` - Added RUM disable comment

## 🔧 Technical Details

### Why RUM Causes Hangs in SPAs:

1. **Automatic Injection**: Cloudflare injects RUM script at the edge before content reaches the browser
2. **Beacon Conflicts**: RUM beacon intercepts navigation events and form submissions
3. **Async Blocking**: React's state updates wait for RUM beacon responses
4. **Storage Pollution**: RUM stores data in localStorage/sessionStorage, conflicting with app state
5. **No Graceful Failure**: If RUM beacon fails/hangs, it blocks the entire app

### Why This Doesn't Affect Development:

- Local development (`localhost:3000`) bypasses Cloudflare edge
- Preview deployments may have RUM disabled by default
- Only production/staging domains served through Cloudflare Pages are affected

## 📚 References

- [Cloudflare RUM Documentation](https://developers.cloudflare.com/analytics/web-analytics/)
- [Known Issues with SPAs](https://community.cloudflare.com/t/rum-breaking-spa-navigation/)
- [Alternative: Self-host Analytics](https://developers.cloudflare.com/analytics/web-analytics/getting-started/)

## ✅ Checklist

After applying this fix:

- [ ] Disabled RUM in `hub-emasjid-production` Cloudflare project
- [ ] Disabled RUM in `hub-emasjid-staging` Cloudflare project
- [ ] Cleared browser cache on test devices
- [ ] Verified no `/cdn-cgi/rum?` requests in DevTools Network tab
- [ ] Confirmed form submissions work without hanging
- [ ] Confirmed page navigation works smoothly
- [ ] Tested on multiple pages (content creation, admin, profile, etc.)
- [ ] Monitored for 24 hours to ensure issue doesn't recur
- [ ] Documented the fix date and person who applied it

---

**Fix Applied**: [Date]  
**Applied By**: [Your Name]  
**Status**: [ ] Pending / [ ] Completed / [ ] Verified
