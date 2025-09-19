# Research: Masjid Digital Display TV App

## Technology Stack Decisions

### Frontend Framework

**Decision**: React 19 with Next.js 15  
**Rationale**:

- React 19 introduces concurrent features and improved performance for smooth 60fps animations
- Next.js 15 provides excellent SSR/SSG capabilities for fast initial loads on TV displays
- Built-in optimization for video content and image handling
- Strong TypeScript support for better maintainability
- Excellent integration with existing turborepo workspace

**Alternatives considered**:

- Vue 3: Good performance but less ecosystem support for video handling
- Svelte Kit: Smaller bundle size but limited enterprise tooling
- Plain React: Would require manual routing and optimization setup

### Styling and UI

**Decision**: Tailwind CSS with Headless UI components  
**Rationale**:

- Utility-first approach enables rapid responsive design for different TV screen sizes
- Excellent support for animations and transitions needed for carousel
- Small bundle size when purged for production
- Easy to customize for Bahasa Malaysia text rendering
- Good integration with React 19 and Next.js 15

**Alternatives considered**:

- Styled Components: Runtime overhead not suitable for TV displays
- Material UI: Too opinionated for custom TV interface design
- CSS Modules: More verbose for responsive design requirements

### State Management

**Decision**: React Query (TanStack Query) + Zustand  
**Rationale**:

- React Query for server state management (prayer times, content data)
- Built-in caching and background refetching for prayer time updates
- Optimistic updates for smooth content transitions
- Zustand for client state (display configurations, current content index)
- Lightweight and performant for TV display requirements

**Alternatives considered**:

- Redux Toolkit: Overkill for display-only application
- SWR: Less feature-rich than React Query for complex caching needs
- Context API only: Would require manual optimization for performance

### Video and Media Handling

**Decision**: YouTube Embed API + React Player  
**Rationale**:

- React Player provides unified interface for YouTube videos and local images
- YouTube Embed API allows programmatic control over playback
- Built-in error handling for network connectivity issues
- Supports autoplay and mute policies required for public displays
- Lightweight alternative to full video.js implementation

**Alternatives considered**:

- video.js: Too heavy for YouTube-focused use case
- YouTube IFrame API directly: Would require more custom integration work
- Native HTML5 video: Limited YouTube support without conversion

### Prayer Times Integration

**Decision**: Direct JAKIM API integration with fallback local cache  
**Rationale**:

- JAKIM API provides official prayer times for Malaysia
- Zone-based lookup supports different masjid locations
- Implement retry logic (3 attempts) as specified in requirements
- Local cache ensures display continuity during network issues
- Background sync for seamless updates

**Alternatives considered**:

- Adhan npm package: Local calculation but may differ from official times
- Islamic Finder API: International but less accurate for Malaysia
- Manual entry: Not scalable for 1000+ masjids

### Testing Strategy

**Decision**: Playwright for E2E + Vitest for unit testing + React Testing Library  
**Rationale**:

- Playwright provides robust browser automation for TV display testing
- Can test video playback, content transitions, and multi-display scenarios
- Vitest offers fast unit testing with ESM support for React 19
- React Testing Library ensures component accessibility and user interaction testing
- All tools integrate well with TypeScript and modern tooling

**Alternatives considered**:

- Cypress: Less reliable for video testing and multi-tab scenarios
- Jest: Slower startup time compared to Vitest
- Selenium: More complex setup and maintenance overhead

## Architecture Patterns

### Display Layer Management

**Decision**: React Context + Custom Hooks pattern  
**Rationale**:

- Separate contexts for ContentLayer and PrayerTimeLayer
- Custom hooks (useContentCarousel, usePrayerTimes, useDisplayConfig)
- Enables independent configuration per display
- Clean separation of concerns for dual-layer architecture

### Content Prioritization

**Decision**: Server-side ranking with client-side caching  
**Rationale**:

- Server calculates top 10 sponsored content based on funding
- Client caches ranking for offline operation
- Background sync updates rankings without interrupting display
- Efficient for multiple displays per masjid (shared cache)

### Multi-Display Coordination

**Decision**: Display ID-based configuration with local storage  
**Rationale**:

- Each display has unique identifier within masjid
- Configuration stored in localStorage for persistence
- Real-time updates via WebSocket or Server-Sent Events
- Fallback to polling for network resilience

## Integration Requirements

### Existing Turborepo Integration

**Decision**: New app in apps/tv-display with shared packages  
**Rationale**:

- Leverages existing packages: @emasjid/ui-components, @emasjid/shared-types
- Inherits authentication patterns from @emasjid/auth
- Uses @emasjid/supabase-client for data layer
- Follows established workspace patterns

### Supabase Schema Extensions

**Decision**: Extend existing schema with new tables  
**Rationale**:

- masjid_displays: Display configurations and settings
- content_items: Sponsored content with funding amounts
- display_content_assignments: Many-to-many relationship
- prayer_schedules: Cached prayer times per masjid
- Maintains data consistency with existing masjid management

### Performance Optimization

**Decision**: Next.js App Router with streaming and caching  
**Rationale**:

- App Router enables streaming for faster content loads
- Built-in caching for prayer times and content metadata
- Image optimization for carousel images
- Code splitting for different display configurations
- Service worker for offline capability

## Development Workflow

### Project Structure

```
apps/tv-display/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   ├── components/
│   │   ├── layers/         # ContentLayer, PrayerTimeLayer
│   │   ├── carousel/       # ContentCarousel, ContentItem
│   │   └── ui/            # Shared UI components
│   ├── hooks/             # Custom hooks for display logic
│   ├── lib/               # Utilities and configurations
│   └── types/             # TypeScript definitions
├── tests/
│   ├── e2e/               # Playwright tests
│   ├── integration/       # API integration tests
│   └── unit/              # Component unit tests
└── playwright.config.ts   # Playwright configuration
```

### Deployment Strategy

**Decision**: Vercel deployment with environment-based configurations  
**Rationale**:

- Seamless Next.js 15 deployment and optimization
- Environment variables for different masjid configurations
- Edge functions for prayer time calculations
- CDN for optimal content delivery to TV displays
- Preview deployments for testing display configurations

## Risk Mitigation

### Network Connectivity

- Implement retry logic for JAKIM API (3 attempts as specified)
- Local cache for prayer times and content metadata
- Graceful degradation to cached content during outages
- Service worker for offline capability

### Video Playback Issues

- Fallback from YouTube to cached thumbnail for network issues
- Skip problematic content automatically
- User-configurable timeout for video loading
- Monitor and log playback errors for debugging

### Multi-Display Synchronization

- Independent display configurations to prevent cascading failures
- Conflict resolution for simultaneous configuration updates
- Backup configuration storage in Supabase
- Display health monitoring and alerting

### Performance on TV Hardware

- Optimize for limited TV browser capabilities
- Progressive enhancement for advanced features
- Memory usage monitoring and cleanup
- Frame rate monitoring for smooth animations

## Next Steps for Phase 1

1. **Data Model Definition**: Define entities for Masjid, ContentItem, DisplayConfiguration, etc.
2. **API Contracts**: Create OpenAPI specs for content management and prayer time endpoints
3. **Component Architecture**: Design React component hierarchy for dual-layer display
4. **Test Scenarios**: Convert user stories to Playwright test scenarios
5. **Quickstart Guide**: Create setup instructions for development and deployment
