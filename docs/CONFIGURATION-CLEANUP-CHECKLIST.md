# Configuration Cleanup Verification Checklist

## ✅ Quick Verification Steps

Run through these steps to verify the configuration cleanup was successful:

### 1. Check Environment File

```bash
cat apps/tv-display/.env.local
```

**Expected**: Should NOT contain these variables:

- [ ] ❌ NEXT_PUBLIC_DISPLAY_NAME
- [ ] ❌ NEXT_PUBLIC_MASJID_ID
- [ ] ❌ NEXT_PUBLIC_FULLSCREEN_MODE
- [ ] ❌ NEXT_PUBLIC_KIOSK_MODE
- [ ] ❌ NEXT_PUBLIC_AUTO_REFRESH
- [ ] ❌ NEXT_PUBLIC_REFRESH_INTERVAL
- [ ] ❌ NEXT_PUBLIC_PRAYER_LOCATION
- [ ] ❌ NEXT_PUBLIC_PRAYER_ZONE
- [ ] ❌ NEXT_PUBLIC_PRAYER_UPDATE_INTERVAL
- [ ] ❌ NEXT_PUBLIC_CONTENT_REFRESH_INTERVAL

**Expected**: Should ONLY contain:

- [ ] ✅ NEXT_PUBLIC_SUPABASE_URL
- [ ] ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] ✅ SUPABASE_SERVICE_ROLE_KEY
- [ ] ✅ NODE_ENV
- [ ] ✅ NEXT_PUBLIC_APP_URL
- [ ] ✅ NEXT_PUBLIC_APP_ENV
- [ ] ✅ NEXT_PUBLIC_ENABLE_DEV_TOOLS
- [ ] ✅ NEXT_PUBLIC_SHOW_LOGGER

### 2. Check Setup Script

```bash
grep -A 20 "TV Display specific configuration" scripts/setup-supabase.sh
```

**Expected**: Should show comment about database-first approach, not env vars

- [ ] ✅ Contains note about database configuration
- [ ] ❌ Does NOT set NEXT_PUBLIC_DISPLAY_NAME
- [ ] ❌ Does NOT set NEXT_PUBLIC_MASJID_ID
- [ ] ❌ Does NOT set display-specific settings

### 3. Check Configuration Files

```bash
# Check env.ts has been cleaned up
grep -E "DISPLAY_CONFIG|PRAYER_CONFIG|CONTENT_CONFIG" apps/tv-display/src/config/env.ts
```

**Expected**:

- [ ] ✅ DISPLAY_CONFIG = {} (empty/deprecated)
- [ ] ✅ PRAYER_CONFIG = {} (empty/deprecated)
- [ ] ✅ CONTENT_CONFIG = {} (empty/deprecated)
- [ ] ✅ Contains documentation about database-first approach

### 4. Test Application Still Works

```bash
# Build the TV display app
pnpm build --filter @masjid-suite/tv-display
```

**Expected**:

- [ ] ✅ Build completes successfully
- [ ] ✅ No TypeScript errors
- [ ] ✅ No missing variable warnings

### 5. Test Display Functionality

```bash
# Start development servers
pnpm dev
```

Then:

1. [ ] ✅ Open TV Display: `http://localhost:3001/display/{display_id}`
2. [ ] ✅ Display loads configuration from API
3. [ ] ✅ Check browser console - should see config fetch
4. [ ] ✅ Display renders correctly with database settings

### 6. Test Real-Time Updates

With TV Display open:

1. [ ] ✅ Open Hub App: `http://localhost:3000`
2. [ ] ✅ Change a display setting (e.g., carousel interval)
3. [ ] ✅ TV Display updates within 1 second
4. [ ] ✅ Console shows real-time event

### 7. Verify Database is Source of Truth

In browser console (TV Display):

```javascript
// Should NOT see these in window
console.log(window.env?.NEXT_PUBLIC_MASJID_ID); // undefined or not exist
console.log(window.env?.NEXT_PUBLIC_PRAYER_ZONE); // undefined or not exist

// Configuration should come from API
// Check Network tab for: /api/displays/{id}/config
```

**Expected**:

- [ ] ✅ No hardcoded display configuration in browser
- [ ] ✅ API call to `/api/displays/[id]/config` visible in Network tab
- [ ] ✅ Response contains all display settings from database

### 8. Check Documentation

Verify new documentation files exist:

```bash
ls -la docs/ | grep -E "TV-DISPLAY-CONFIGURATION|CONFIGURATION-CLEANUP"
```

**Expected**:

- [ ] ✅ `TV-DISPLAY-CONFIGURATION-ARCHITECTURE.md` exists
- [ ] ✅ `CONFIGURATION-CLEANUP-SUMMARY.md` exists
- [ ] ✅ Files contain clear architecture explanation

### 9. Multi-Display Test (Optional)

Test with multiple displays to verify each has unique config:

```bash
# Get display IDs from database
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c \
  "SELECT id, name, masjid_id FROM tv_displays LIMIT 3;"
```

Then open each display:

1. [ ] ✅ Display 1: Different settings from database
2. [ ] ✅ Display 2: Different settings from database
3. [ ] ✅ All displays work independently
4. [ ] ✅ No shared configuration between displays

### 10. Clean Reinstall Test (Final Verification)

```bash
# Clean everything
rm -rf apps/tv-display/.env.local
rm -rf node_modules
rm -rf apps/*/dist

# Reinstall and regenerate
pnpm install
./scripts/setup-supabase.sh --test
pnpm build:clean
pnpm dev
```

**Expected**:

- [ ] ✅ New .env.local generated correctly
- [ ] ✅ No display-specific vars in .env.local
- [ ] ✅ Application builds and runs successfully
- [ ] ✅ Display fetches config from database

## 🎯 Success Criteria

All checkboxes above should be checked (✅) for successful verification.

### Critical Items (Must Pass)

- ✅ No display-specific env vars in .env.local
- ✅ TV Display fetches config from API/database
- ✅ Real-time updates work (<1 second)
- ✅ Application builds without errors
- ✅ Multiple displays can have different configs

### Nice to Have (Documentation)

- ✅ Documentation files created
- ✅ Clear architecture explanation
- ✅ Migration guide available

## 🐛 If Something Fails

### Build Errors

```bash
# Clear build cache and rebuild
pnpm clean
pnpm install
pnpm build:clean
```

### Configuration Not Loading

```bash
# Check API endpoint
curl http://localhost:3001/api/displays/{display_id}/config

# Should return JSON with display configuration
```

### Real-Time Not Working

```bash
# Verify real-time is enabled
./scripts/verify-realtime-setup.sh
```

### Environment Variables Issue

```bash
# Regenerate env files
./scripts/setup-supabase.sh --test
```

## 📊 Verification Result

Once all items are checked:

- **Date Verified**: ********\_********
- **Verified By**: ********\_********
- **Status**: [ ] ✅ All Passed [ ] ⚠️ Issues Found
- **Notes**: ********\_********

---

**Checklist Version**: 1.0  
**Last Updated**: October 17, 2025  
**Purpose**: Verify TV Display configuration cleanup
