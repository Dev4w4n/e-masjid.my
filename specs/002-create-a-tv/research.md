# Research: Masjid Digital Display TV App

**Date**: September 18, 2025  
**Feature**: TV Display App for Masjids  
**Focus**: Performance-optimized React application for 24/7 TV displays

## Research Questions & Findings

### 1. Malaysian Prayer Times API Integration

**Decision**: Use JAKIM (Jabatan Kemajuan Islam Malaysia) official prayer times API  
**Rationale**:

- Official government source ensures accuracy and religious compliance
- Provides zone-based prayer times covering all Malaysian regions
- Free and reliable service for public religious applications
- Matches existing masjid profile zone code structure in database

**Alternatives considered**:

- Third-party Islamic APIs (less authoritative for Malaysia)
- Manual calculation (complex and error-prone)
- Local database storage (requires maintenance and updates)

**Implementation Notes**:

- API endpoint: `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=duration&zone={zone_code}`
- Zone codes align with Malaysian state/district divisions
- Caching strategy needed for offline scenarios
- Daily refresh sufficient for prayer time accuracy

### 2. YouTube Video Performance for TV Displays

**Decision**: Use YouTube Embed API with performance optimizations  
**Rationale**:

- Native iframe embed provides best compatibility across TV browsers
- YouTube's CDN ensures global content delivery performance
- Autoplay policies supported in kiosk/fullscreen mode
- Built-in error handling for unavailable content

**Alternatives considered**:

- YouTube Data API + external player (more complex, licensing issues)
- Direct video file hosting (storage and bandwidth costs)
- Video proxy services (added latency and complexity)

**Performance Optimizations**:

- Preload next video while current is playing
- Use `enablejsapi=1` for programmatic control
- Set `autoplay=1&mute=0` for kiosk environments
- Implement fallback for blocked/unavailable videos
- Monitor memory usage for long-running playback

### 3. React Performance Patterns for Kiosk Applications

**Decision**: React 18 with Concurrent Features + Memory Management  
**Rationale**:

- Concurrent rendering prevents UI blocking during content transitions
- Suspense boundaries for graceful loading states
- useMemo/useCallback for component optimization
- React Query for intelligent caching and background updates

**Key Patterns**:

- Virtual scrolling for large content lists (not needed for top 10)
- Intersection Observer for content visibility
- RAF-based animations for 60fps performance
- Memory cleanup for long-running carousel cycles
- Service Worker for offline content caching

**Alternatives considered**:

- Vue 3 (smaller bundle but less ecosystem for TV optimization)
- Vanilla JS (more control but higher development complexity)
- Svelte (good performance but limited TV browser support data)

### 4. Supabase Real-time for Content Updates

**Decision**: Supabase real-time subscriptions with polling fallback  
**Rationale**:

- Real-time updates for sponsorship ranking changes
- Existing database schema integration
- Built-in authentication and RLS policies
- WebSocket reliability with automatic reconnection

**Implementation Strategy**:

- Subscribe to content table changes for specific masjid
- Poll fallback every 15 minutes for connection issues
- Optimistic updates for smooth user experience
- Batch updates to prevent excessive re-renders

**Alternatives considered**:

- Periodic polling only (less responsive to changes)
- WebSocket custom implementation (more complex)
- Server-sent events (one-way communication limitation)

### 5. TV Browser Compatibility & Fullscreen

**Decision**: Progressive enhancement with fullscreen API  
**Rationale**:

- Modern smart TV browsers support standard web APIs
- Fallback gracefully on older TV systems
- Kiosk mode available on most commercial display solutions
- CSS-based fullscreen as universal fallback

**Browser Support Strategy**:

- Target: Chrome/Chromium-based TV browsers (Samsung, LG, Android TV)
- Fallback: CSS viewport units for older systems
- Test: Physical TV testing with common display hardware
- Features: Fullscreen API, autoplay, local storage, fetch API

**Implementation Notes**:

- Use `document.documentElement.requestFullscreen()`
- CSS: `html, body { margin: 0; padding: 0; overflow: hidden; }`
- Handle orientation changes and screen size variations
- Disable context menus and selection for kiosk mode

### 6. Offline-First Strategy for TV Displays

**Decision**: Service Worker with content prefetching  
**Rationale**:

- TV displays need 24/7 reliability despite network issues
- Content caching prevents blank screens during outages
- Prayer times can be cached for multiple days
- Graceful degradation maintains basic functionality

**Caching Strategy**:

- Cache shell application files (HTML, CSS, JS)
- Prefetch and cache image content items
- Store prayer times for 7 days ahead
- Cache YouTube video metadata and thumbnails
- Show cached content with "offline" indicator

**Network Recovery**:

- Retry failed requests with exponential backoff
- Update content in background when online
- Sync sponsorship rankings on reconnection
- Display connection status in prayer times overlay

## Technology Stack Summary

**Core Framework**: React 18 with TypeScript  
**Build Tool**: Vite (fastest dev/build performance)  
**State Management**: React Query + Zustand (minimal state)  
**Animations**: Framer Motion (60fps transitions)  
**Styling**: Tailwind CSS (utility-first, tree-shakeable)  
**Testing**: Vitest + React Testing Library + Playwright

**Performance Libraries**:

- React.memo for component memoization
- React.lazy for code splitting
- Intersection Observer API
- Web Workers for background processing

**Integration APIs**:

- Supabase client for database operations
- JAKIM e-solat API for prayer times
- YouTube Embed API for video content
- Service Worker for offline functionality

## Performance Targets Validation

| Metric                | Target | Strategy                       |
| --------------------- | ------ | ------------------------------ |
| Content Loading       | <200ms | Preloading, caching, CDN       |
| Transition Smoothness | 60fps  | CSS transforms, RAF animations |
| Memory Usage          | <50MB  | Cleanup cycles, lazy loading   |
| First Paint           | <1s    | Critical CSS, preload hints    |
| Bundle Size           | <500KB | Tree shaking, code splitting   |

## Risk Mitigation

**Network Dependency**: Service Worker caching, offline mode  
**Content Availability**: Fallback images, error boundaries  
**Browser Compatibility**: Progressive enhancement, polyfills  
**Memory Leaks**: Cleanup intervals, component unmounting  
**Prayer Time Accuracy**: JAKIM API reliability, daily refresh
