# Tasks: Public SEO-Friendly Content Display App

**Input**: Design documents from `/specs/006-create-a-new/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Summary

- **Feature**: Loginless public app for displaying all approved masjid content nationwide
- **Tech Stack**: Next.js 15+ (App Router), React 18+, TypeScript 5.2+, Tailwind CSS, Supabase
- **Structure**: New app at `apps/papan-info/` consuming existing packages
- **Testing**: Vitest (unit), Playwright (E2E), React Testing Library
- **Total Tasks**: 35 tasks (11 setup, 9 tests-first, 15 implementation, 5 polish)

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- All paths relative to `/Users/rohaizan/Codes/ai-gen/agent-1-emasjid-my`

---

## Phase 3.1: Setup & Configuration (T001-T011)

- [x] **T001** Create apps/papan-info directory structure following Next.js 15 App Router conventions
  - Create: `apps/papan-info/src/app/`, `apps/papan-info/src/components/`, `apps/papan-info/src/services/`, `apps/papan-info/src/lib/`, `apps/papan-info/src/styles/`, `apps/papan-info/tests/unit/`, `apps/papan-info/tests/contract/`, `apps/papan-info/tests/e2e/`, `apps/papan-info/public/`
  - No parallel marker - foundation for all other tasks

- [x] **T002** Initialize Next.js 15 project with TypeScript in apps/papan-info/
  - Create: `apps/papan-info/package.json` with dependencies: `next@^15.0.0`, `react@^18.0.0`, `react-dom@^18.0.0`, `typescript@^5.2.0`, `@masjid-suite/supabase-client`, `@masjid-suite/shared-types`, `@masjid-suite/i18n`
  - Add dev dependencies: `@types/react`, `@types/node`, `vitest`, `@vitejs/plugin-react`, `@playwright/test`, `@testing-library/react`, `@testing-library/jest-dom`
  - Add scripts: `dev`, `build`, `start`, `test`, `test:e2e`, `type-check`, `lint`
  - Depends on: T001

- [x] **T003 [P]** Configure TypeScript in apps/papan-info/tsconfig.json
  - Extend root tsconfig.json
  - Enable Next.js plugin, strict mode, App Router path aliases
  - Set target: ES2022, jsx: preserve, moduleResolution: bundler
  - No dependencies (different file from T002)

- [x] **T004 [P]** Configure Next.js in apps/papan-info/next.config.js
  - Enable: experimental SSR, image optimization
  - Configure ISR revalidation: `revalidate: 3600` (1 hour default)
  - Set environment variable prefix: `NEXT_PUBLIC_`
  - Configure redirects for `/tambah-iklan` → hub app URL
  - No dependencies (different file from T002)

- [x] **T005 [P]** Configure Tailwind CSS in apps/papan-info/tailwind.config.js
  - Import Islamic theme colors from masjidbro-mockup
  - Define colors: `islamic-green-*`, `islamic-gold-*`, `islamic-blue-*`
  - Configure content paths: `./src/**/*.{js,ts,jsx,tsx}`
  - Add custom fonts: Arabic typography support
  - No dependencies (different file from T002)

- [x] **T006 [P]** Create global styles in apps/papan-info/src/styles/globals.css
  - Import Tailwind directives
  - Define CSS variables for Islamic theme
  - Set base styles: Arabic typography, RTL support
  - Configure responsive breakpoints
  - No dependencies (different file from T005)

- [x] **T007 [P]** Port Islamic theme styles in apps/papan-info/src/styles/islamic-theme.css
  - Extract CSS from `legacy/masjidbro-mockup/`
  - Port: Islamic patterns, prayer time styles, header/footer styles
  - Adapt to Tailwind utility classes
  - No dependencies (different file from T006)

- [x] **T008 [P]** Create environment example file in apps/papan-info/.env.example
  - Add: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Add: `NEXT_PUBLIC_HUB_URL` (default: http://localhost:3000)
  - Add optional: `NEXT_PUBLIC_GA_ID`
  - Document required vs optional variables
  - No dependencies (standalone file)

- [x] **T009 [P]** Configure Vitest in apps/papan-info/vitest.config.ts
  - Setup React Testing Library
  - Configure test environment: jsdom
  - Add path aliases matching tsconfig
  - Setup global test utilities
  - No dependencies (different file from T003)

- [x] **T010 [P]** Configure Playwright in apps/papan-info/playwright.config.ts
  - Setup browsers: chromium, firefox, webkit
  - Configure base URL: http://localhost:3002
  - Set timeout: 30s, retries: 2
  - Enable screenshot on failure
  - No dependencies (different file from T009)

- [x] **T011 [P]** Create Supabase client in apps/papan-info/src/lib/supabase.ts
  - Import createClient from @masjid-suite/supabase-client
  - Initialize with environment variables
  - Export typed client instance
  - No dependencies (standalone utility)

---

## Phase 3.2: Tests First - TDD Red Phase (T012-T020)

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Services)

- [x] **T012 [P]** Contract test for contentService.getAllActiveContent() in apps/papan-info/tests/contract/contentService.test.ts
  - Test: Returns array of ContentWithMasjid
  - Test: Filters by status='approved'
  - Test: Filters by date range (start_date <= today, end_date >= today)
  - Test: Joins with masjids table
  - Test: Sorts by sponsorship_amount DESC, created_at DESC
  - Test: Returns empty array when no content
  - Test: Handles Supabase errors gracefully
  - Expected: ALL TESTS FAIL (service not implemented yet)

- [x] **T013 [P]** Contract test for contentService.getContentBySlug() in apps/papan-info/tests/contract/contentService.test.ts
  - Test: Extracts UUID from slug (format: title-kebab-case-{uuid})
  - Test: Returns single ContentWithMasjid or null
  - Test: Filters by status='approved'
  - Test: Joins with masjids table
  - Test: Returns null for non-existent UUID
  - Test: Returns null for malformed slug
  - Test: Handles Supabase errors gracefully
  - Expected: ALL TESTS FAIL (service not implemented yet)

- [x] **T014 [P]** Contract test for categoryService.getAllCategories() in apps/papan-info/tests/contract/categoryService.test.ts
  - Test: Returns array of Category
  - Test: Filters by is_active=true
  - Test: Sorts by display_order ASC
  - Test: Returns empty array when no categories
  - Test: Handles Supabase errors gracefully
  - Expected: ALL TESTS FAIL (service not implemented yet)

- [x] **T015 [P]** Contract test for seoService in apps/papan-info/tests/contract/seoService.test.ts
  - Test: generateMetadata() returns Metadata with title, description, openGraph
  - Test: Title under 60 characters
  - Test: Description under 160 characters
  - Test: OpenGraph includes image URL
  - Test: generateStructuredData() returns valid JSON-LD
  - Test: Organization schema includes name, url, logo
  - Test: ItemList schema for content listing
  - Test: Product schema for content detail
  - Test: generateSitemap() returns XML string
  - Test: Sitemap includes all content URLs
  - Expected: ALL TESTS FAIL (service not implemented yet)

### Component Unit Tests

- [x] **T016 [P]** Unit test for Header component in apps/papan-info/tests/unit/components/Header.test.tsx
  - Test: Renders "masjidbro.my" branding
  - Test: Renders "Tambah Iklan" link with correct href
  - Test: Link uses NEXT_PUBLIC_HUB_URL environment variable
  - Test: Islamic theme styles applied
  - Test: Responsive menu works on mobile
  - Expected: ALL TESTS FAIL (component not implemented yet)

- [x] **T017 [P]** Unit test for ContentCard component in apps/papan-info/tests/unit/components/ContentCard.test.tsx
  - Test: Renders title, description, image
  - Test: Renders masjid name and location
  - Test: Renders premium badge when sponsorship_amount > 0
  - Test: Renders creation date
  - Test: Links to /iklan/[slug] on click
  - Test: Image has alt text for accessibility
  - Expected: ALL TESTS FAIL (component not implemented yet)

- [x] **T018 [P]** Unit test for CategoryFilter component in apps/papan-info/tests/unit/components/CategoryFilter.test.tsx
  - Test: Renders "All" button by default
  - Test: Renders category buttons from props
  - Test: Highlights selected category
  - Test: Calls onChange with category ID on click
  - Test: Shows content count badge on each button
  - Expected: ALL TESTS FAIL (component not implemented yet)

- [x] **T019 [P]** Unit test for ContentGrid component in apps/papan-info/tests/unit/components/ContentGrid.test.tsx
  - Test: Renders content cards in grid layout
  - Test: Filters content by selected category
  - Test: Shows "Tiada iklan dalam kategori ini" when no content
  - Test: Top 3 premium content larger with badges
  - Test: Grid responsive (1 col mobile, 2 col tablet, 3-4 col desktop)
  - Expected: ALL TESTS FAIL (component not implemented yet)

### E2E Tests

- [x] **T020 [P]** E2E test for homepage in apps/papan-info/tests/e2e/homepage.spec.ts
  - Test: Page loads successfully
  - Test: Header with "Tambah Iklan" visible
  - Test: Content grid displays approved content
  - Test: Category filter buttons visible
  - Test: Content sorted by sponsorship amount
  - Test: Footer visible
  - Test: Page loads in <2 seconds
  - Expected: ALL TESTS FAIL (pages not implemented yet)

---

## Phase 3.3: Core Implementation - TDD Green Phase (T021-T030)

**ONLY after tests T012-T020 are written and failing**

### Service Layer

- [x] **T021** Implement contentService.getAllActiveContent() in apps/papan-info/src/services/contentService.ts
  - Import supabase client from lib/supabase
  - Query display_content with status='approved' filter
  - Add date range filter: start_date <= today, end_date >= today
  - Join with masjids table
  - Sort by sponsorship_amount DESC, created_at DESC
  - Return type: ContentWithMasjid[]
  - Handle errors with try/catch
  - **Verify: T012 tests now PASS**
  - Depends on: T011, T012

- [x] **T022** Implement contentService.getContentBySlug() in apps/papan-info/src/services/contentService.ts
  - Parse slug to extract UUID (last segment after last hyphen)
  - Query display_content by id=UUID
  - Filter by status='approved'
  - Join with masjids table
  - Return type: ContentWithMasjid | null
  - Handle malformed slug gracefully
  - Handle errors with try/catch
  - **Verify: T013 tests now PASS**
  - Depends on: T011, T013
  - Note: Same file as T021, so sequential (no [P])

- [x] **T023** Implement categoryService.getAllCategories() in apps/papan-info/src/services/categoryService.ts
  - Import supabase client from lib/supabase
  - Query categories with is_active=true filter
  - Sort by display_order ASC
  - Return type: Category[]
  - Handle errors with try/catch
  - **Verify: T014 tests now PASS**
  - Depends on: T011, T014

- [x] **T024** Implement seoService.generateMetadata() in apps/papan-info/src/lib/seo.ts
  - Accept params: title, description, image
  - Return Next.js Metadata object
  - Truncate title to 60 chars
  - Truncate description to 160 chars
  - Add OpenGraph tags (og:title, og:description, og:image)
  - Add Twitter card tags
  - Add canonical URL
  - **Verify: T015 metadata tests now PASS**
  - Depends on: T015

- [x] **T025** Implement seoService.generateStructuredData() in apps/papan-info/src/lib/seo.ts
  - Accept params: type ('Organization' | 'ItemList' | 'Product'), data
  - Generate JSON-LD schema.org markup
  - Organization: name, url, logo, contactPoint
  - ItemList: itemListElement with content items
  - Product: name, image, description, offers
  - Return stringified JSON for script tag
  - **Verify: T015 structured data tests now PASS**
  - Depends on: T015
  - Note: Same file as T024, so sequential

- [x] **T026** Implement seoService.generateSitemap() in apps/papan-info/src/lib/seo.ts
  - Fetch all approved content from contentService
  - Generate XML sitemap format
  - Include: homepage, all /iklan/[slug] URLs
  - Add lastmod, changefreq, priority
  - Return XML string
  - **Verify: T015 sitemap tests now PASS**
  - Depends on: T015, T021
  - Note: Same file as T024, T025, so sequential

### Component Layer

- [ ] **T027** Implement Header component in apps/papan-info/src/components/Header.tsx
  - Import Link from next/link
  - Render Islamic-themed header with green/gold colors
  - Add "masjidbro.my" logo/branding
  - Add "Tambah Iklan" Link with href={`${process.env.NEXT_PUBLIC_HUB_URL}/register`}
  - Add responsive hamburger menu for mobile
  - Use Tailwind Islamic theme classes
  - **Verify: T016 tests now PASS**
  - Depends on: T005, T006, T007, T016

- [ ] **T028 [P]** Implement Footer component in apps/papan-info/src/components/Footer.tsx
  - Render Islamic-themed footer
  - Add contact information
  - Add social media links
  - Add copyright notice
  - Use Tailwind Islamic theme classes
  - No test dependencies (simple presentational component)

- [ ] **T029** Implement ContentCard component in apps/papan-info/src/components/ContentCard.tsx
  - Accept props: content (ContentWithMasjid)
  - Render title, description (truncated to 150 chars)
  - Render image with next/image optimization
  - Render masjid name and location
  - Conditionally render PremiumBadge if sponsorship_amount > 0
  - Render creation date (formatted)
  - Wrap in Link to `/iklan/${slug}`
  - Add hover effects
  - **Verify: T017 tests now PASS**
  - Depends on: T005, T017

- [x] **T030** Implement PremiumBadge component in apps/papan-info/src/components/PremiumBadge.tsx
  - Accept props: sponsorshipAmount (number)
  - Render gold badge with "Premium" text
  - Use Islamic gold colors
  - Add icon (star or similar)
  - No test (simple presentational component)
  - Depends on: T005

- [x] **T031** Implement CategoryFilter component in apps/papan-info/src/components/CategoryFilter.tsx
  - Accept props: categories (Category[]), selectedId (string | null), onChange (function)
  - Render "All" button (always first)
  - Render button for each category
  - Highlight selected category
  - Show content count badge on each button
  - Horizontal scroll on mobile
  - **Verify: T018 tests now PASS**
  - Depends on: T005, T018

- [x] **T032** Implement ContentGrid component in apps/papan-info/src/components/ContentGrid.tsx
  - Accept props: content (ContentWithMasjid[]), selectedCategory (string | null)
  - Filter content by selectedCategory (client-side)
  - Render top 3 premium content (sponsorship_amount > 0) larger
  - Render remaining content in grid
  - Show "Tiada iklan dalam kategori ini" when filtered content empty
  - Responsive grid: 1 col (mobile), 2 col (tablet), 3-4 col (desktop)
  - Use ContentCard component
  - **Verify: T019 tests now PASS**
  - Depends on: T005, T019, T029

### Page Layer (Next.js App Router)

- [x] **T033** Implement root layout in apps/papan-info/src/app/layout.tsx
  - Import globals.css and islamic-theme.css
  - Add SEO meta tags (viewport, charset, language)
  - Add structured data for Organization
  - Render Header component
  - Render {children}
  - Render Footer component
  - Set HTML lang="ms" (Bahasa Malaysia)
  - Depends on: T006, T007, T024, T025, T027, T028

- [x] **T034** Implement homepage in apps/papan-info/src/app/page.tsx
  - Server Component with ISR: export const revalidate = 3600
  - Fetch content: getAllActiveContent()
  - Fetch categories: getAllCategories()
  - Add useState for selected category (client component wrapper)
  - Render CategoryFilter component
  - Render ContentGrid component
  - Generate metadata with generateMetadata()
  - Add structured data for ItemList
  - **Verify: T020 homepage E2E tests now PASS**
  - Depends on: T020, T021, T023, T024, T025, T031, T032

- [x] **T035** Implement content detail page in apps/papan-info/src/app/iklan/[slug]/page.tsx
  - Server Component with ISR: export const revalidate = 86400 (24 hours)
  - Fetch content: getContentBySlug(params.slug)
  - Return notFound() if content null
  - Render full content: title, description, large image or YouTube embed
  - Render masjid name and location
  - Render sponsorship info
  - Render creation/update dates
  - Generate metadata with generateMetadata() (dynamic)
  - Add structured data for Product
  - Depends on: T022, T024, T025

---

## Phase 3.4: Integration & Additional Features (T036-T040)

- [x] **T036** Implement sitemap route in apps/papan-info/src/app/sitemap.xml/route.ts
  - Export GET handler
  - Call generateSitemap()
  - Return Response with XML content-type
  - Add cache headers
  - Depends on: T026

- [x] **T037** Implement robots.txt route in apps/papan-info/src/app/robots.txt/route.ts
  - Export GET handler
  - Return robots.txt content: Allow all, link to sitemap
  - Add Disallow for private paths (if any)
  - Return Response with text/plain content-type
  - No dependencies (standalone)

- [x] **T038 [P]** Implement LoadingSpinner component in apps/papan-info/src/components/LoadingSpinner.tsx
  - Render Islamic-themed loading animation
  - Use green/gold colors
  - Add aria-label for accessibility
  - Export for use in loading.tsx files
  - Depends on: T005

- [x] **T039 [P]** Implement loading state in apps/papan-info/src/app/loading.tsx
  - Render LoadingSpinner component
  - Show during page transitions
  - Depends on: T038

- [x] **T040** Implement error boundary in apps/papan-info/src/app/error.tsx
  - Accept error and reset props
  - Render user-friendly error message in Bahasa Malaysia
  - Add "Cuba Lagi" button to reset
  - Use Islamic theme styling
  - Log error to console
  - Depends on: T005

---

## Phase 3.5: E2E Tests & Polish (T041-T046)

### E2E Tests (Complete Coverage)

- [x] **T041** E2E test for content detail page in apps/papan-info/tests/e2e/content-detail.spec.ts
  - Test: Navigate from homepage to detail page
  - Test: Detail page renders full content
  - Test: Back button navigates to homepage
  - Test: Meta tags include content-specific title/description
  - Test: Structured data includes Product schema
  - Depends on: T035

- [x] **T042** E2E test for category filtering in apps/papan-info/tests/e2e/category-filter.spec.ts
  - Test: Click category filter button
  - Test: Content grid updates instantly
  - Test: Only matching content displayed
  - Test: "Tiada iklan" message when no content
  - Test: "All" button shows all content
  - Depends on: T034

- [x] **T043** E2E test for SEO in apps/papan-info/tests/e2e/seo.spec.ts
  - Test: Meta tags present on homepage
  - Test: Meta tags present on detail page
  - Test: Structured data valid JSON-LD
  - Test: Sitemap accessible at /sitemap.xml
  - Test: Robots.txt accessible at /robots.txt
  - Test: Images have alt text
  - Depends on: T034, T035, T036, T037

- [x] **T044** E2E test for hub redirect in apps/papan-info/tests/e2e/hub-redirect.spec.ts
  - Test: Click "Tambah Iklan" link
  - Test: Redirects to hub app URL
  - Test: URL includes /register or /login path
  - Depends on: T027

### Polish & Performance

- [x] **T045 [P]** Performance optimization
  - Add image optimization config in next.config.js
  - Enable gzip/brotli compression
  - Add font preloading
  - Optimize bundle size
  - Verify: Lighthouse Performance score 90+
  - Depends on: T004, T034, T035

- [x] **T046 [P]** Accessibility audit
  - Run axe-core on all pages
  - Fix contrast issues
  - Add ARIA labels where missing
  - Test keyboard navigation
  - Verify: WCAG 2.1 AA compliance
  - Depends on: T034, T035

---

## Dependencies Graph

```
Setup (T001-T011)
  ↓
Tests First (T012-T020) [ALL PARALLEL]
  ↓
Services (T021-T026) [SEQUENTIAL - same files]
  ↓
Components (T027-T032) [MIXED - some parallel]
  ↓
Pages (T033-T035) [SEQUENTIAL - depends on all above]
  ↓
Integration (T036-T040) [MIXED]
  ↓
E2E & Polish (T041-T046) [MOSTLY PARALLEL]
```

**Critical Path**: T001 → T002 → T011 → T012 → T021 → T027 → T033 → T034 → T020

---

## Parallel Execution Examples

### Round 1: Setup Configuration

```bash
# Launch T003-T010 together (after T002 complete):
Task: "Configure TypeScript in apps/papan-info/tsconfig.json"
Task: "Configure Next.js in apps/papan-info/next.config.js"
Task: "Configure Tailwind in apps/papan-info/tailwind.config.js"
Task: "Create globals.css in apps/papan-info/src/styles/globals.css"
Task: "Port islamic-theme.css from masjidbro-mockup"
Task: "Create .env.example in apps/papan-info/"
Task: "Configure Vitest in apps/papan-info/vitest.config.ts"
Task: "Configure Playwright in apps/papan-info/playwright.config.ts"
```

### Round 2: Contract Tests (TDD Red Phase)

```bash
# Launch T012-T020 together (after T011 complete):
Task: "Contract test contentService.getAllActiveContent() in tests/contract/contentService.test.ts"
Task: "Contract test contentService.getContentBySlug() in tests/contract/contentService.test.ts"
Task: "Contract test categoryService in tests/contract/categoryService.test.ts"
Task: "Contract test seoService in tests/contract/seoService.test.ts"
Task: "Unit test Header in tests/unit/components/Header.test.tsx"
Task: "Unit test ContentCard in tests/unit/components/ContentCard.test.tsx"
Task: "Unit test CategoryFilter in tests/unit/components/CategoryFilter.test.tsx"
Task: "Unit test ContentGrid in tests/unit/components/ContentGrid.test.tsx"
Task: "E2E test homepage in tests/e2e/homepage.spec.ts"
```

### Round 3: E2E Tests & Polish

```bash
# Launch T041-T044, T046 together (after T035 complete):
Task: "E2E test content detail in tests/e2e/content-detail.spec.ts"
Task: "E2E test category filtering in tests/e2e/category-filter.spec.ts"
Task: "E2E test SEO in tests/e2e/seo.spec.ts"
Task: "E2E test hub redirect in tests/e2e/hub-redirect.spec.ts"
Task: "Accessibility audit with axe-core"
```

---

## Validation Checklist

_GATE: Verify before marking feature complete_

- [x] All contracts have corresponding tests (T012-T015)
- [x] All components have tests (T016-T019)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] TDD workflow enforced (red → green → refactor)
- [x] All user stories from spec.md have E2E tests
- [x] Quickstart scenarios covered in E2E tests

---

## Success Criteria

**All 46 tasks must complete** for feature to be production-ready:

- ✅ Project structure created
- ✅ All tests written first (TDD red phase)
- ✅ All tests passing (TDD green phase)
- ✅ Services fetch data from Supabase
- ✅ Components render with Islamic theme
- ✅ Pages implement SSR with ISR caching
- ✅ SEO optimization complete (meta tags, structured data, sitemap)
- ✅ E2E tests validate user stories
- ✅ Performance: Lighthouse score 90+
- ✅ Accessibility: WCAG 2.1 AA compliant

**Next Steps**: Execute tasks sequentially respecting dependencies, run quickstart.md validation after T046

---

_Generated from plan.md, data-model.md, contracts/, quickstart.md following Constitution v2.1.1_
