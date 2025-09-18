# GitHub Copilot Instructions for e-masjid.my

## Project Context

This is a monorepo for e-masjid.my, a comprehensive masjid management system for Malaysian mosques. The project uses TypeScript, React, and Supabase with a focus on Malaysian Islamic practices and Bahasa Malaysia localization.

## Current Development Focus: TV Display App (Feature 002)

### Overview

Building a fullscreen TV display app for masjids that shows:

- Content carousel with YouTube videos and images
- Floating prayer times overlay
- Masjid-specific content ranked by sponsorship funds
- Bahasa Malaysia interface
- 24/7 unattended operation capability

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Performance**: Framer Motion, React Query, optimization for 60fps
- **Database**: Supabase PostgreSQL with existing schema
- **Testing**: Vitest, React Testing Library, Playwright
- **Styling**: Tailwind CSS
- **APIs**: JAKIM prayer times API, YouTube Embed API

### Key Requirements

- Fullscreen kiosk mode for TV displays
- Performance optimized for 24/7 operation
- Top 10 content ranking by sponsorship amount
- Prayer times from Malaysian JAKIM API
- Offline graceful degradation
- Memory management for long-running operation
- TV browser compatibility

### Directory Structure

```
apps/tv-display/           # Main TV app (new)
├── src/
│   ├── components/        # TV-optimized React components
│   ├── hooks/            # Custom hooks for TV display logic
│   ├── services/         # API services and data fetching
│   └── types/            # TypeScript interfaces
packages/                  # Shared monorepo packages
├── supabase-client/      # Database operations
├── shared-types/         # Common TypeScript types
└── ui-components/        # Reusable UI components
```

### Database Schema Extensions

- `masjid_display_content` - Content items with sponsorship ranking
- `masjid_display_settings` - UI configuration per masjid
- `prayer_times_cache` - Cached JAKIM prayer times
- `masjids.prayer_zone_code` - Malaysian prayer zone integration

### Performance Targets

- 60fps smooth transitions
- <200ms content loading
- <50MB memory usage
- 24/7 stable operation

## Coding Guidelines

### React Patterns

- Use React 18 concurrent features for smooth UX
- Implement useMemo/useCallback for performance optimization
- Error boundaries for graceful failure handling
- Suspense for loading states
- Custom hooks for reusable TV display logic

### TypeScript Standards

- Strict mode enabled
- Interface definitions for all API contracts
- Proper typing for Supabase client operations
- Type-safe environment variable handling

### Performance Optimization

- Lazy loading for non-critical components
- Image optimization and preloading
- Memory cleanup for long-running carousel
- Service Worker for offline functionality
- Virtual DOM optimization techniques

### Malaysian/Islamic Context

- All user-facing text in Bahasa Malaysia
- Prayer time integration with JAKIM zones
- Malaysian Ringgit (RM) currency formatting
- Islamic date (Hijri) display support
- Malaysian address and postal code validation

### API Integration Patterns

- Supabase RLS policies for security
- Real-time subscriptions for content updates
- JAKIM API integration with caching
- Error handling for network failures
- Offline-first data strategies

## Recent Changes (Last 3 Features)

1. **002-create-a-tv**: TV display app with performance focus
2. **001-build-a-monorepo**: Initial monorepo setup
3. **Legacy migration**: Existing e-masjid.my 2.0 system

## Code Style Preferences

- Functional components with hooks
- TypeScript strict mode
- Tailwind for styling
- ESLint/Prettier for formatting
- Descriptive variable names in English
- Comments in English for technical details
- User-facing strings in Bahasa Malaysia

## Testing Strategy

- Unit tests for business logic
- Integration tests for API contracts
- E2E tests for TV display workflows
- Performance tests for memory/CPU usage
- TV hardware compatibility testing

## When Implementing TV Display Features:

1. Consider TV screen dimensions and viewing distance
2. Ensure 60fps performance for professional appearance
3. Handle network failures gracefully
4. Test on actual TV hardware when possible
5. Optimize for unattended 24/7 operation
6. Use appropriate font sizes for TV viewing
7. Implement proper error recovery mechanisms
