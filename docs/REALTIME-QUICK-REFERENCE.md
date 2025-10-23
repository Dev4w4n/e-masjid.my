# Real-Time Updates - Quick Reference

## 🚀 Quick Start

```bash
# 1. Apply migration (if not already done)
./scripts/setup-supabase.sh --test

# 2. Build and start
pnpm build:clean && pnpm dev

# 3. Test
# Open: http://localhost:3001/display/{displayId}
# Change settings in Hub App
# Watch TV Display update instantly!
```

## 📝 Console Commands for Verification

```bash
# Verify real-time setup
./scripts/verify-realtime-setup.sh

# Check publication
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c \
  "SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';"

# Expected output:
#   tv_displays
#   display_content
```

## 🔍 What to Look For

### In TV Display Console:

```javascript
// On page load:
[DisplayPage] Setting up real-time subscriptions for display: abc-123
[ContentCarousel] Setting up real-time subscription for display content: abc-123

// On update from Hub:
[DisplayPage] Display config updated via real-time: {eventType: "UPDATE", ...}
[ContentCarousel] Content updated via real-time: {eventType: "INSERT", ...}
```

### Expected Behavior:

- **Config Change**: TV updates within 1 second
- **Content Add/Remove**: Carousel updates immediately
- **No Page Reload**: Updates happen seamlessly

## 🎯 Test Scenarios

### Test 1: Display Config

1. Change carousel interval: 10s → 15s
2. TV should transition slower **immediately**

### Test 2: Prayer Times Position

1. Change position: bottom_left → top_right
2. Overlay moves **within 1 second**

### Test 3: Content Assignment

1. Add new content in Hub
2. TV carousel includes it **immediately**

### Test 4: Content Removal

1. Remove content in Hub
2. TV carousel excludes it **right away**

## 📊 Architecture at a Glance

```
Hub App ──UPDATE──> Supabase Database
                         │
                         ├─ RLS Check ✓
                         │
                         ├─ Real-time Publication
                         │
                         ├─ WebSocket Broadcast
                         │
                         ↓
TV Display <──SUBSCRIBE── Real-time Channel
    │
    ├─ Receive Event (<1s)
    │
    ├─ Invalidate Cache
    │
    └─ Reload Data (Silent)
```

## 🐛 Quick Troubleshooting

| Issue              | Solution                                      |
| ------------------ | --------------------------------------------- |
| No updates         | Check console for subscription setup messages |
| WebSocket error    | Verify Supabase is running: `supabase status` |
| Updates delayed    | Check network tab for WebSocket connection    |
| Subscription fails | Re-apply migration: `supabase db reset`       |

## 📁 Key Files

```
Implementation:
├── apps/tv-display/src/app/display/[id]/page.tsx    (Display subscriptions)
├── apps/tv-display/src/components/ContentCarousel.tsx (Content subscriptions)
└── apps/tv-display/src/lib/services/enhanced-supabase.ts (Service methods)

Database:
└── supabase/migrations/025_enable_realtime_for_tv_displays.sql

Documentation:
├── docs/REALTIME-UPDATES-IMPLEMENTATION.md (Detailed guide)
├── docs/REALTIME-IMPLEMENTATION-SUMMARY.md (Complete summary)
└── docs/REALTIME-QUICK-REFERENCE.md (This file)

Scripts:
└── scripts/verify-realtime-setup.sh (Verification tool)
```

## 💡 Pro Tips

1. **Keep Console Open**: Watch for real-time events during testing
2. **Test Network Issues**: Disable WiFi briefly - fallback polling takes over
3. **Multiple Displays**: Each TV only receives its own updates (filtered by display_id)
4. **Performance**: Real-time adds minimal overhead - WebSocket is very efficient
5. **Debugging**: Look for `[EnhancedSupabase]` log entries for detailed info

## 🔧 Common Commands

```bash
# Reset database and reapply migrations
supabase db reset

# Check Supabase status
supabase status

# View real-time logs (from Supabase Studio)
# Open: http://127.0.0.1:54323
# Navigate to: Database > Replication

# Build and dev mode
pnpm build:clean && pnpm dev
```

## 📞 Need Help?

1. Check detailed guide: `docs/REALTIME-UPDATES-IMPLEMENTATION.md`
2. Run verification: `./scripts/verify-realtime-setup.sh`
3. Check console logs for error messages
4. Verify WebSocket connection in Network tab

---

**Last Updated**: October 17, 2025  
**Implementation Status**: ✅ Complete
