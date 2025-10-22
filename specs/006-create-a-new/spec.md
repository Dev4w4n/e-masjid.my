# Feature Specification: Public SEO-Friendly Content Display App

**Feature Branch**: `006-create-a-new`  
**Created**: 2025-10-10  
**Status**: Draft  
**Input**: User description: "create a new public app for loginless SEO-friendly content display"

## Execution Flow (main)

```
1. Parse user description from Input
   → Feature: Create new public app for SEO-friendly content display
2. Extract key concepts from description
   → Actors: Public users (no login), content viewers, potential advertisers
   → Actions: View content, navigate categories, click "Tambah Iklan" to register
   → Data: Approved display_content from database, categories
   → Constraints: SEO-friendly, based on masjidbro-mockup UI, loginless
3. For each unclear aspect:
   → ✓ All aspects clarified through masjidbro-mockup reference
4. Fill User Scenarios & Testing section
   → ✓ Complete user flows defined
5. Generate Functional Requirements
   → ✓ All requirements are testable
6. Identify Key Entities (if data involved)
   → ✓ Entities identified: Content, Categories, Masjids
7. Run Review Checklist
   → ✓ No implementation details, focused on user value
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Clarifications

### Session 2025-10-10

- Q: How should the public app determine which masjid's content to display? → A: Display all contents without masjid filter
- Q: What is the exact URL or routing path for the "Tambah Iklan" button to redirect users to the hub app? → A: Make it configurable in the .env where currently it is on localhost:3000
- Q: What is the expected concurrent user scale and data volume for performance planning? → A: Medium scale - 100-1,000 concurrent users, 1,000-10,000 content items
- Q: Should the public app implement rate limiting or abuse prevention mechanisms for public access? → A: No rate limiting needed, rely on infrastructure/CDN protection
- Q: Should the public app implement content caching, and if so, what is the acceptable content freshness delay? → A: Long cache - 1-24 hours (optimized for performance)

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

A member of the public visits the E-Masjid.My public site to discover halal businesses and community advertisements from all masjids nationwide. They can browse all approved content without needing to log in, filter by categories, and view detailed information about each advertisement. When they want to add their own advertisement, they click "Tambah Iklan" which directs them to the hub app for registration and login.

### Acceptance Scenarios

1. **Given** a user visits the public site homepage, **When** the page loads, **Then** they see:
   - An Islamic-themed header with "masjidbro.my" branding
   - A "Tambah Iklan" (Add Advertisement) link in the header that routes to the hub app
   - All approved content from all masjids nationwide displayed in a grid/carousel
   - Category filter options to browse by business type
   - SEO-optimized meta tags, structured data, and semantic HTML

2. **Given** a user is viewing the content listing, **When** they select a category filter, **Then** only content matching that category is displayed

3. **Given** a user clicks on a content card, **When** the detail page loads, **Then** they see:
   - Full content details including title, description, images/videos
   - Sponsorship information if applicable
   - Contact information or business details
   - SEO-optimized content with proper schema markup

4. **Given** a user clicks "Tambah Iklan" in the header, **When** they are not logged in, **Then** they are redirected to the hub app's registration/login page

5. **Given** a search engine bot crawls the public site, **When** it indexes the pages, **Then** the bot can properly:
   - Read all meta tags (title, description, keywords)
   - Parse structured data (JSON-LD schema)
   - Index all content without JavaScript execution requirements
   - Follow semantic HTML structure

### Edge Cases

- What happens when no approved content exists across all masjids?
  - Display a friendly message: "Tiada iklan tersedia pada masa ini. Sila kembali semula nanti."
- What happens when a user tries to access content that has been removed or expired?
  - Show a 404 page with navigation back to home
- How does the system display masjid context for content?
  - Display masjid name/location on each content card
  - Show all approved content from all masjids in nationwide listing
- What happens with very slow network connections?
  - Show loading states with Islamic-themed spinners
  - Implement image lazy loading for performance
  - Leverage long-term caching (1-24 hours) to reduce repeated data fetches
- How are different content types (images vs YouTube videos) displayed?
  - Both types are displayed in the same grid format
  - YouTube videos show thumbnail with play icon overlay

---

## Requirements _(mandatory)_

### Functional Requirements

#### Content Display

- **FR-001**: System MUST display all approved (status='approved') content from the display_content table
- **FR-002**: System MUST show content sorted by sponsorship amount (highest first), then by creation date (newest first)
- **FR-003**: System MUST display content in a responsive grid layout that works on mobile, tablet, and desktop devices
- **FR-004**: System MUST show premium content (top 3 by sponsorship) with larger, more prominent cards
- **FR-005**: System MUST display each content card with: title, description, image/thumbnail, and creation date
- **FR-006**: System MUST provide a detail view for each content item showing full information

#### Category Filtering

- **FR-007**: System MUST display category filter buttons for all active categories
- **FR-008**: System MUST show content count for each category
- **FR-009**: System MUST allow users to filter content by selecting a category
- **FR-010**: System MUST provide an "All" category option to show all content
- **FR-011**: System MUST display appropriate message when no content exists for selected category

#### Navigation & User Flow

- **FR-012**: System MUST display a header with "masjidbro.my" branding and Islamic design elements
- **FR-013**: System MUST provide a "Tambah Iklan" link in the header that redirects to the hub app registration page using a configurable URL from environment configuration (default: localhost:3000 for development)
- **FR-014**: System MUST show masjid name and location on each content card
- **FR-015**: System MUST provide navigation between listing and detail views
- **FR-016**: System MUST include a footer with contact information and links

#### SEO Optimization

- **FR-017**: System MUST generate unique, descriptive page titles for each page
- **FR-018**: System MUST include meta descriptions under 160 characters for all pages
- **FR-019**: System MUST implement structured data (JSON-LD) for:
  - Organization information
  - ItemList for content listings
  - Product/Service for individual content items
- **FR-020**: System MUST use semantic HTML5 elements (header, nav, main, article, footer, etc.)
- **FR-021**: System MUST generate SEO-friendly URLs (e.g., /iklan/kedai-buku-islam-12345)
- **FR-022**: System MUST include Open Graph meta tags for social media sharing
- **FR-023**: System MUST provide sitemap.xml for search engine crawling
- **FR-024**: System MUST implement robots.txt with proper crawling directives
- **FR-025**: System MUST use proper heading hierarchy (h1, h2, h3, etc.)
- **FR-026**: System MUST include alt text for all images
- **FR-027**: System MUST load critical content without requiring JavaScript execution (server-side rendering)

#### Performance & Accessibility

- **FR-028**: System MUST implement image lazy loading for non-critical images
- **FR-029**: System MUST show loading states during data fetching
- **FR-030**: System MUST be accessible to screen readers (WCAG 2.1 AA compliance)
- **FR-031**: System MUST support keyboard navigation
- **FR-032**: System MUST provide Arabic text for Islamic greetings and blessings
- **FR-033-SCALE**: System MUST support 100-1,000 concurrent users without performance degradation
- **FR-034-SCALE**: System MUST handle 1,000-10,000 total content items efficiently
- **FR-045-CACHE**: System MUST implement content caching with 1-24 hour freshness window
- **FR-046-CACHE**: System MUST optimize for performance over real-time content updates

#### Security & Protection

- **FR-042**: System MUST rely on infrastructure/CDN layer for rate limiting and DDoS protection
- **FR-043**: System MUST NOT implement application-level rate limiting for public content access
- **FR-044**: System MUST serve content in read-only mode with no user data collection beyond standard web analytics

#### Design Requirements

- **FR-035**: System MUST use the Islamic-themed design from masjidbro-mockup:
  - Green color scheme (islamic-green-\*)
  - Gold accents (islamic-gold-\*)
  - Islamic patterns and decorative elements
  - Arabic typography for greetings
- **FR-036**: System MUST display premium badges for top-sponsored content
- **FR-037-DESIGN**: System MUST show ranking numbers (#1, #2, #3, etc.) based on sponsorship amount
- **FR-038**: System MUST use card-based layouts with hover effects

#### Masjid Context

- **FR-039**: System MUST display content from all masjids nationwide (no masjid_id filtering)
- **FR-040**: System MUST display the masjid name and location on each content card from the masjids table
- **FR-041**: System MUST only show content that is currently active (within start_date and end_date range)

### Key Entities _(include if feature involves data)_

- **DisplayContent**: Represents approved advertisements/content created by users
  - Attributes: title, description, type (image/youtube), url, thumbnail_url, sponsorship_amount, start_date, end_date, status, masjid_id
  - Must have status='approved' to be visible on public site
  - Associated with a specific masjid
- **Category**: Represents business/content categories for filtering
  - Attributes: name, icon, color, is_active
  - Used for organizing content by business type
  - Examples: Food & Beverage, Clothing, Education, etc.
- **Masjid**: Represents the mosque/surau context
  - Attributes: name, location, state, district
  - Content is filtered and displayed per masjid
  - Provides geographical and community context

---

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (none found)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Dependencies & Assumptions

### Dependencies

- Depends on existing `display_content` table in Supabase with approval workflow
- Depends on existing `categories` table in Supabase
- Depends on existing `masjids` table in Supabase
- Depends on hub app for user registration and login flows (URL must be configurable via environment variable)
- Depends on UI design patterns from masjidbro-mockup
- Depends on infrastructure/CDN layer (e.g., Cloudflare, Vercel Edge) for rate limiting and DDoS protection

### Assumptions

- Content approval workflow is already implemented in hub app
- Only approved content (status='approved') should be visible on public site
- Users do not need accounts to view content
- Hub app handles all authentication and content creation
- Public app is read-only for content display
- All approved content from all masjids nationwide is displayed without filtering
- Content freshness delay of 1-24 hours is acceptable (newly approved content may not appear immediately)

---

## Success Metrics

- Public site loads without requiring user authentication
- All approved content is visible and browsable by category
- SEO score of 90+ on Google Lighthouse
- "Tambah Iklan" button successfully redirects to hub app
- Search engines can index all content pages
- Page load time under 2 seconds on 3G connection
- Mobile-responsive design works on all screen sizes
- WCAG 2.1 AA accessibility compliance
