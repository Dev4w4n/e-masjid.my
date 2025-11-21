# TV Display URL Configuration

## Problem Fixed

Previously, clicking "Paparan TV" links in the hub app would redirect to the hardcoded production URL `https://tv.emasjid.my/display`, which was not suitable for local development. This caused confusion and made local testing difficult.

## Solution Implemented

Created a unified configuration system that automatically detects the environment and uses appropriate URLs for both local development and production.

### New Configuration System

#### Shared Configuration (`@masjid-suite/shared-types/src/config.ts`)

- **`getTvDisplayUrl()`**: Returns the base TV display URL based on environment
- **`getTvDisplayUrlForDisplay(displayId)`**: Returns the full URL for a specific display
- **`getHubUrl()`**: Returns the hub app URL
- **`getPublicUrl()`**: Returns the public app URL

#### Environment Detection Logic

1. **Vite Apps (Hub)**: Uses `VITE_TV_DISPLAY_BASE_URL` environment variable
2. **Next.js Apps (Public/TV Display)**: Uses `NEXT_PUBLIC_TV_DISPLAY_URL` environment variable
3. **Automatic Fallback**: Detects production vs development based on:
   - `NODE_ENV === 'production'`
   - `window.location.hostname !== 'localhost'` (browser)

#### Default URLs

| Environment | TV Display URL                  |
| ----------- | ------------------------------- |
| Development | `http://localhost:3001/display` |
| Production  | `https://tv.emasjid.my/display` |

### Apps Updated

#### Hub App (`apps/hub`)

- **File**: `src/pages/masjid/tv-display/TvDisplayList.tsx`
- **Change**: Replaced hardcoded `tvDisplayBaseUrl` with `getTvDisplayUrlForDisplay(display.id)`
- **Environment Variable**: `VITE_TV_DISPLAY_BASE_URL=http://localhost:3001/display`

#### Public App (`apps/public`)

- **File**: `src/app/masjid/[id]/page.tsx`
- **Change**: Replaced hardcoded URL with `getTvDisplayUrlForDisplay(display.id)`
- **Environment Variable**: `NEXT_PUBLIC_TV_DISPLAY_URL=http://localhost:3001/display`

### Environment Variables

#### Required Variables

```bash
# Hub App (.env.local)
VITE_TV_DISPLAY_BASE_URL=http://localhost:3001/display

# Public App (.env.local)
NEXT_PUBLIC_TV_DISPLAY_URL=http://localhost:3001/display

# Cross-app integration
NEXT_PUBLIC_HUB_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3002
```

#### Production Overrides

For production deployment, set these environment variables:

```bash
# Production values
VITE_TV_DISPLAY_BASE_URL=https://tv.emasjid.my/display
NEXT_PUBLIC_TV_DISPLAY_URL=https://tv.emasjid.my/display
NEXT_PUBLIC_HUB_URL=https://hub.emasjid.my
NEXT_PUBLIC_BASE_URL=https://emasjid.my
```

### Benefits

1. **Environment Aware**: Automatically uses correct URLs for dev/prod
2. **DRY Principle**: Single source of truth in shared package
3. **Type Safe**: Full TypeScript support with proper imports
4. **Maintainable**: Easy to update URLs from environment variables
5. **Consistent**: Same configuration system across all apps

### Usage Examples

```typescript
// Hub app - TV display list
import { getTvDisplayUrlForDisplay } from "@masjid-suite/shared-types";

const displayUrl = getTvDisplayUrlForDisplay(display.id);
// Development: http://localhost:3001/display/abc-123
// Production: https://tv.emasjid.my/display/abc-123

// Public app - masjid page
import { getTvDisplayUrlForDisplay } from "@masjid-suite/shared-types";

const displayUrl = getTvDisplayUrlForDisplay(display.id);
// Same behavior as above
```

### Testing

1. **Local Development**: All "Paparan TV" links now point to `http://localhost:3001/display/[id]`
2. **Production**: Links will automatically use `https://tv.emasjid.my/display/[id]`
3. **Cross-App Navigation**: Hub ↔ Public ↔ TV Display all work correctly

### File Changes Summary

#### New Files

- `packages/shared-types/src/config.ts` - Unified URL configuration

#### Modified Files

- `packages/shared-types/src/index.ts` - Export new config functions
- `apps/hub/src/pages/masjid/tv-display/TvDisplayList.tsx` - Use shared config
- `apps/public/src/app/masjid/[id]/page.tsx` - Use shared config
- `apps/public/.env.local` - Add NEXT_PUBLIC_TV_DISPLAY_URL
- `apps/public/.env.example` - Document new variable
- `apps/public/.env.local.example` - Document new variable
- `.env.local.template` - Add cross-app integration variables

### Troubleshooting

#### Issue: Links still point to production

**Solution**: Ensure environment variables are set correctly and restart dev servers

#### Issue: TypeScript errors

**Solution**: Run `pnpm run build:clean` to rebuild all packages

#### Issue: Environment variable not working

**Solution**: Check that variable names match exactly:

- Hub app: `VITE_TV_DISPLAY_BASE_URL`
- Public/TV Display apps: `NEXT_PUBLIC_TV_DISPLAY_URL`

### Future Improvements

1. Add support for custom domains per masjid
2. Implement URL shortening for easier sharing
3. Add QR code generation for display URLs
4. Support for preview/staging environments
