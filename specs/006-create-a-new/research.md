# Research: Public SEO-Friendly Content Display App

**Date**: 2025-10-10  
**Status**: Complete

## Overview

Research findings for implementing a public-facing, SEO-optimized Next.js application to display approved content from all masjids nationwide.

---

## 1. Next.js 15 for SEO Optimization

### Decision

Use Next.js 15 with App Router and Server-Side Rendering (SSR) for optimal SEO.

### Rationale

- **Server-Side Rendering**: Critical content (title, description, content cards) rendered on server before HTML sent to client
- **Static Site Generation**: Can pre-generate pages for better performance with ISR (Incremental Static Regeneration)
- **SEO-First Architecture**: Built-in support for meta tags, structured data, sitemap generation
- **App Router**: Modern routing system with layouts, loading states, and React Server Components
- **Image Optimization**: Automatic image optimization via `next/image` component
- **Performance**: Built-in code splitting, lazy loading, and optimization

### Alternatives Considered

- **Create React App**: Client-side only, poor SEO without complex workarounds
- **Gatsby**: Better for static sites but overkill for dynamic content; slower build times
- **Remix**: Good SSR but less mature ecosystem than Next.js
- **Plain React + Express SSR**: Too much manual configuration, reinventing Next.js features

### Implementation Notes

- Use Next.js 15+ App Router (not Pages Router)
- Enable SSR for content pages (dynamic routes)
- Use ISR with 1-24 hour revalidation for caching
- Implement `generateMetadata` for dynamic SEO meta tags
- Use React Server Components where possible

---

## 2. Tailwind CSS for Islamic Theme

### Decision

Use Tailwind CSS with custom configuration to implement Islamic theme from masjidbro-mockup.

### Rationale

- **Utility-First**: Rapid development with pre-defined classes
- **Customization**: Easy to define custom colors (islamic-green-_, islamic-gold-_)
- **Responsive**: Built-in responsive design utilities
- **Performance**: Purges unused CSS in production
- **Port Existing**: masjidbro-mockup already uses Tailwind, can port configuration directly

### Alternatives Considered

- **Material-UI**: Used in hub app, but overkill for public site and doesn't match masjidbro design
- **Styled Components**: More verbose, harder to maintain consistency
- **Plain CSS**: Manual work, no utility classes, harder responsive design

### Implementation Notes

- Port Islamic theme colors from masjidbro-mockup `tailwind.config.js`
- Define custom color palette: `islamic-green-*`, `islamic-gold-*`, `islamic-teal-*`
- Add custom animations for hover effects
- Include Arabic font support (e.g., Amiri for Arabic text)
- Create reusable component classes: `card-islamic`, `btn-islamic`, etc.

---

## 3. Supabase Data Fetching Strategy

### Decision

Use @masjid-suite/supabase-client package with Server Components for data fetching.

### Rationale

- **Existing Package**: Reuse battle-tested supabase-client from monorepo
- **Type Safety**: Shared types from @masjid-suite/shared-types
- **Server Components**: Fetch data on server, no client-side waterfall
- **Caching**: Next.js automatic request deduplication and caching
- **Read-Only**: Public app only needs read access (no mutations)

### Alternatives Considered

- **Client-Side Fetching**: Poor SEO, slower initial load, unnecessary client bundle size
- **GraphQL**: Overkill for simple read operations
- **REST API Wrapper**: Unnecessary abstraction, Supabase client already efficient

### Implementation Notes

- Create `contentService.ts` and `categoryService.ts` in `src/services/`
- Use Supabase client in React Server Components
- Implement caching with Next.js `revalidate` option (1-24 hours)
- Query filters:
  - `status = 'approved'`
  - `start_date <= CURRENT_DATE`
  - `end_date >= CURRENT_DATE`
- Sort by: `sponsorship_amount DESC, created_at DESC`
- Join with `masjids` table for location data

---

## 4. SEO Implementation Strategy

### Decision

Implement comprehensive SEO using Next.js Metadata API and structured data (JSON-LD).

### Rationale

- **Search Visibility**: Target organic traffic from Google/Bing
- **Social Sharing**: Open Graph tags for Facebook/WhatsApp sharing
- **Rich Snippets**: Schema.org structured data for rich search results
- **Semantic HTML**: Screen readers and search bots can understand content structure

### Implementation Approach

#### Meta Tags

```typescript
// app/page.tsx
export const metadata: Metadata = {
  title: "E-Masjid.My - Platform Iklan Digital Masjid",
  description: "Temui perniagaan halal dalam komuniti masjid...",
  keywords: ["masjid", "iklan", "halal", "komuniti", "Muslim"],
  openGraph: {
    title: "...",
    description: "...",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
};
```

#### Structured Data (JSON-LD)

```typescript
// Organization schema for homepage
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "E-Masjid.My",
  "url": "https://emasjid.my",
  "logo": "https://emasjid.my/emasjid-500x500.png"
}

// ItemList schema for content listing
const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [...]
}

// Product/Service schema for content detail
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": content.title,
  "description": content.description,
  "image": content.image_url
}
```

#### Semantic HTML

- Use `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>` tags
- Proper heading hierarchy: h1 → h2 → h3
- Alt text for all images
- ARIA labels where needed

#### Sitemap & Robots

```typescript
// app/sitemap.xml/route.ts
export async function GET() {
  const contents = await fetchAllContent();
  return new Response(generateSitemap(contents), {
    headers: { "Content-Type": "application/xml" },
  });
}

// app/robots.txt/route.ts
export async function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: https://emasjid.my/sitemap.xml`
  );
}
```

### Alternatives Considered

- **react-helmet**: Deprecated, Next.js Metadata API is better
- **Manual meta tags**: Error-prone, Metadata API is type-safe
- **Skip structured data**: Miss out on rich snippets in search results

---

## 5. Caching Strategy

### Decision

Implement 1-24 hour caching using Next.js ISR (Incremental Static Regeneration).

### Rationale

- **Performance**: Reduced database load, faster page loads
- **Acceptable Staleness**: Per clarifications, 1-24 hour delay acceptable
- **CDN-Friendly**: Static HTML cached at edge locations
- **Cost-Effective**: Fewer database queries = lower Supabase costs

### Implementation

```typescript
// app/page.tsx (homepage)
export const revalidate = 3600; // 1 hour

// app/iklan/[slug]/page.tsx (content detail)
export const revalidate = 86400; // 24 hours

// Force revalidation
export async function generateStaticParams() {
  const contents = await fetchAllContent();
  return contents.map((c) => ({ slug: c.slug }));
}
```

### Cache Invalidation

- ISR automatically revalidates after time expires
- Manual revalidation via API route if needed (e.g., webhook from hub app)
- CDN cache (Vercel Edge) respects ISR settings

### Alternatives Considered

- **No Caching**: Poor performance, high database load, expensive
- **Client-Side Caching**: Doesn't help SEO, slower initial load
- **Short Cache (1-5 min)**: More database load, minimal benefit over longer cache

---

## 6. Accessibility (WCAG 2.1 AA)

### Decision

Implement WCAG 2.1 AA compliance for inclusive access.

### Requirements

- **Keyboard Navigation**: All interactive elements accessible via Tab/Enter
- **Screen Reader Support**: Semantic HTML, ARIA labels, alt text
- **Color Contrast**: Ensure islamic-green-_ and islamic-gold-_ meet 4.5:1 ratio
- **Focus Indicators**: Visible focus states for all interactive elements
- **Responsive Design**: Works on mobile screen readers (VoiceOver, TalkBack)

### Implementation Checklist

- [ ] All images have alt text
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Form inputs have labels (for "Tambah Iklan" button)
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets 4.5:1 minimum
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (VoiceOver, NVDA)

### Testing

- Automated: axe-core with Playwright
- Manual: Keyboard navigation, screen reader testing

---

## 7. Content Filtering & Sorting

### Decision

Implement client-side category filtering with server-side sorted data.

### Rationale

- **Performance**: Fetch all content once (cached), filter in browser
- **UX**: Instant filter response, no loading states
- **Scale**: 1,000-10,000 items manageable in browser memory
- **SEO**: All content indexed by search engines (no client-side filtering blocking)

### Implementation

```typescript
// Server: Fetch sorted data
const contents = await supabase
  .from("display_content")
  .select("*, masjids(name, location, state)")
  .eq("status", "approved")
  .lte("start_date", new Date().toISOString())
  .gte("end_date", new Date().toISOString())
  .order("sponsorship_amount", { ascending: false })
  .order("created_at", { ascending: false });

// Client: Filter by category (React state)
const [selectedCategory, setSelectedCategory] = useState("all");
const filtered =
  selectedCategory === "all"
    ? contents
    : contents.filter((c) => c.category_id === selectedCategory);
```

### Alternatives Considered

- **Server-Side Filtering**: Extra requests, loading states, poor UX
- **GraphQL Subscriptions**: Overkill for read-only public site
- **Separate API Routes**: Unnecessary, SSR provides data efficiently

---

## 8. Masjid Context Display

### Decision

Display masjid name/location on each content card via Supabase join.

### Rationale

- **Transparency**: Users see which masjid posted content
- **Trust**: Local businesses visible to local community
- **SEO**: Rich content with location data

### Implementation

```typescript
// Fetch with join
const contents = await supabase
  .from('display_content')
  .select(`
    *,
    masjids!inner (
      id,
      name,
      location,
      state,
      district
    )
  `)
  .eq('status', 'approved')

// Display on card
<ContentCard
  title={content.title}
  description={content.description}
  masjidName={content.masjids.name}
  masjidLocation={`${content.masjids.location}, ${content.masjids.state}`}
  sponsorshipAmount={content.sponsorship_amount}
/>
```

---

## 9. "Tambah Iklan" Hub Integration

### Decision

Configurable hub app URL via environment variable, redirects to hub registration.

### Implementation

```typescript
// .env.local
NEXT_PUBLIC_HUB_URL=http://localhost:3000

// components/Header.tsx
<Link
  href={`${process.env.NEXT_PUBLIC_HUB_URL}/register`}
  className="btn-islamic-gold"
>
  Tambah Iklan
</Link>
```

### Production Configuration

- Development: `http://localhost:3000`
- Staging: `https://hub-staging.emasjid.my`
- Production: `https://hub.emasjid.my`

---

## 10. Testing Strategy

### Decision

Comprehensive TDD approach with unit, contract, and E2E tests.

### Test Layers

#### Unit Tests (Vitest)

- Component rendering (ContentCard, CategoryFilter)
- Service functions (contentService, categoryService)
- Utility functions (SEO helpers, slug generation)
- Mock Supabase responses with schema-synced data

#### Contract Tests

- Supabase query structure validation
- Response shape verification
- RLS policy compliance
- Data relationships (content → masjid join)

#### E2E Tests (Playwright)

- Homepage load and content display
- Category filtering interaction
- Content detail page navigation
- SEO meta tags presence
- "Tambah Iklan" redirect
- Mobile responsive behavior
- Accessibility (axe-core integration)

### Test Data

- Mock data generated from Supabase schema (@masjid-suite/shared-types)
- E2E tests retrieve IDs from live test database
- Use `./scripts/setup-supabase.sh` for test data setup

---

## Summary

**Key Technical Decisions**:

1. **Next.js 15 App Router** for SSR and SEO optimization
2. **Tailwind CSS** for Islamic theme from masjidbro-mockup
3. **Supabase Server Components** for efficient data fetching
4. **ISR Caching (1-24 hours)** for performance
5. **Comprehensive SEO** (meta tags, structured data, sitemap)
6. **WCAG 2.1 AA Accessibility** for inclusive access
7. **Client-Side Filtering** for instant category switching
8. **TDD Approach** with unit, contract, and E2E tests

**No Unresolved Questions** - All technical context clarified through research.
