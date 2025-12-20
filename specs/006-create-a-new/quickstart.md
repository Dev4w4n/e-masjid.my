# Quickstart Guide: Public SEO-Friendly Content Display App

**Purpose**: Validate core user stories and technical functionality  
**Duration**: ~15 minutes  
**Prerequisites**: Development environment set up, test database seeded

---

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Supabase local instance running or connection to test database
- [ ] Test data seeded via `./scripts/setup-supabase.sh`
- [ ] Hub app URL configured (default: `http://localhost:3000`)

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/rohaizan/Codes/ai-gen/agent-1-emasjid-my

# Install all monorepo dependencies
pnpm install

# Build packages in correct order
pnpm run build:clean
```

**Expected Result**: All packages built successfully, no TypeScript errors

---

### 2. Configure Environment

```bash
cd apps/papan-info

# Create environment file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

**Required Environment Variables**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Hub App Integration
NEXT_PUBLIC_HUB_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=  # Leave empty for development
```

**Expected Result**: `.env.local` file created with valid values

---

### 3. Run Development Server

```bash
cd apps/papan-info

# Start Next.js dev server
pnpm dev
```

**Expected Result**:

```
▲ Next.js 15.x.x
- Local:        http://localhost:3002
- Environments: .env.local

✓ Ready in 2.5s
```

---

## User Story Validation

### Story 1: Browse All Content (Homepage)

**Scenario**: Public user views all approved content from all masjids

**Steps**:

1. Open browser to `http://localhost:3002`
2. Observe page load

**Expected Results**:

- [ ] Islamic-themed header with "masjidbro.my" branding visible
- [ ] "Tambah Iklan" link present in header
- [ ] Content grid displays approved content (if any exists)
- [ ] Content sorted by sponsorship amount (highest first)
- [ ] Top 3 premium content cards larger with premium badges
- [ ] Each content card shows:
  - Title
  - Description
  - Image/thumbnail
  - Masjid name and location
  - Creation date
- [ ] Category filter buttons visible at top
- [ ] "All" category selected by default
- [ ] Footer with contact information visible
- [ ] Page loads in <2 seconds
- [ ] No JavaScript errors in console

**Acceptance**: All checkboxes checked

---

### Story 2: Filter by Category

**Scenario**: User filters content by selecting a category

**Steps**:

1. Click on a category filter button (e.g., "Makanan & Minuman")
2. Observe content grid update

**Expected Results**:

- [ ] Only content matching selected category displayed
- [ ] Selected category button highlighted
- [ ] Content count badge shows number of items in category
- [ ] If no content in category, friendly message displayed: "Tiada iklan dalam kategori ini"
- [ ] Filtering happens instantly (no loading state)
- [ ] URL does NOT change (client-side filtering)

**Acceptance**: All checkboxes checked

---

### Story 3: View Content Detail

**Scenario**: User clicks on content card to view full details

**Steps**:

1. Click on any content card from homepage
2. Observe navigation to detail page

**Expected Results**:

- [ ] Navigates to `/iklan/[slug]` URL
- [ ] Slug format: `title-kebab-case-{uuid}`
- [ ] Page displays full content details:
  - Title
  - Full description
  - Large image or YouTube video player
  - Masjid name and location
  - Sponsorship information (if applicable)
  - Creation/update dates
- [ ] SEO meta tags include content-specific title and description
- [ ] Back navigation works (browser back button)
- [ ] Page loads via SSR (view source shows full HTML content)

**Acceptance**: All checkboxes checked

---

### Story 4: Redirect to Hub App

**Scenario**: User wants to add their own advertisement

**Steps**:

1. Click "Tambah Iklan" link in header
2. Observe redirect

**Expected Results**:

- [ ] Redirects to hub app URL (from environment variable)
- [ ] Redirects to registration/login page
- [ ] URL should be: `${NEXT_PUBLIC_HUB_URL}/register` or similar
- [ ] No errors during redirect

**Acceptance**: All checkboxes checked

---

## Technical Validation

### Test 1: SEO Optimization

**Check Meta Tags**:

```bash
curl -s http://localhost:3002 | grep -E '<meta|<title|<link'
```

**Expected Results**:

- [ ] `<title>` tag present with descriptive text
- [ ] `<meta name="description">` present, under 160 chars
- [ ] `<meta property="og:title">` present (Open Graph)
- [ ] `<meta property="og:description">` present
- [ ] `<meta property="og:image">` present with absolute URL
- [ ] `<meta name="twitter:card">` present

**Check Structured Data**:

```bash
curl -s http://localhost:3002 | grep 'application/ld+json'
```

**Expected Results**:

- [ ] JSON-LD script tag present
- [ ] Contains Organization schema
- [ ] Contains ItemList schema for content listing
- [ ] Valid JSON (no syntax errors)

**Acceptance**: All checkboxes checked

---

### Test 2: Server-Side Rendering

**Check Source HTML**:

1. Open `http://localhost:3002` in browser
2. View page source (Ctrl+U or Cmd+Option+U)
3. Search for content card titles

**Expected Results**:

- [ ] Content card HTML present in source (not generated by JavaScript)
- [ ] Content titles visible in source HTML
- [ ] Images have `src` attributes in source HTML
- [ ] No "Loading..." placeholders in source

**Acceptance**: Search engines can index content without executing JavaScript

---

### Test 3: Performance

**Run Lighthouse Audit**:

1. Open Chrome DevTools
2. Navigate to Lighthouse tab
3. Run audit (Desktop, Performance + SEO)

**Expected Results**:

- [ ] Performance score: 90+ (green)
- [ ] SEO score: 90+ (green)
- [ ] Accessibility score: 90+ (green)
- [ ] Best Practices: 90+ (green)
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s

**Acceptance**: All core web vitals in "Good" range

---

### Test 4: Accessibility

**Keyboard Navigation**:

1. Press Tab key repeatedly
2. Navigate through all interactive elements

**Expected Results**:

- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible on all elements
- [ ] Can activate "Tambah Iklan" with Enter key
- [ ] Can navigate between content cards with Tab
- [ ] No focus trap issues

**Screen Reader Test** (Optional):

1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate through page

**Expected Results**:

- [ ] All content announced correctly
- [ ] Images have alt text
- [ ] Headings announced with proper hierarchy
- [ ] Links announced as links

**Acceptance**: All checkboxes checked

---

### Test 5: Responsive Design

**Test Different Viewports**:

1. Open Chrome DevTools
2. Toggle device toolbar (Cmd+Shift+M)
3. Test these viewports:
   - Mobile: 375x667 (iPhone SE)
   - Tablet: 768x1024 (iPad)
   - Desktop: 1920x1080

**Expected Results**:

- [ ] Mobile: Single column layout
- [ ] Mobile: Header hamburger menu works
- [ ] Mobile: Category filters scroll horizontally
- [ ] Tablet: 2-column grid
- [ ] Desktop: 3-4 column grid
- [ ] Images scale properly on all viewports
- [ ] Text readable on all viewports (min 16px font size)
- [ ] No horizontal scroll on any viewport

**Acceptance**: All checkboxes checked

---

## Data Validation

### Test 6: Content Filtering Rules

**Check Database Query**:

```bash
# Verify only approved content displayed
# (Check in Supabase Studio or via SQL)
SELECT status, COUNT(*) FROM display_content
WHERE status = 'approved'
AND start_date <= CURRENT_DATE
AND end_date >= CURRENT_DATE
GROUP BY status;
```

**Expected Results**:

- [ ] Only content with `status='approved'` displayed
- [ ] Only content within date range displayed
- [ ] Content sorted by `sponsorship_amount DESC, created_at DESC`
- [ ] Masjid name/location displayed on each card (from join)

**Acceptance**: All checkboxes checked

---

### Test 7: Caching Behavior

**Check ISR Headers**:

```bash
curl -I http://localhost:3002
```

**Expected Results**:

- [ ] `Cache-Control` header present
- [ ] `s-maxage` or `stale-while-revalidate` present
- [ ] Homepage: ~1 hour cache
- [ ] Content detail: ~24 hour cache

**Test Cache Invalidation**:

1. Note current content displayed
2. Update content in hub app (approve new content)
3. Wait for revalidation period OR trigger manual revalidation
4. Refresh public site

**Expected Results**:

- [ ] New content appears after revalidation period
- [ ] Old content still served during revalidation window (acceptable)

**Acceptance**: Caching works as specified (1-24 hour window)

---

## Troubleshooting

### Issue: No content displayed

**Check**:

1. Run `./scripts/setup-supabase.sh` to seed test data
2. Verify Supabase connection in `.env.local`
3. Check browser console for errors
4. Verify RLS policies allow public read access

---

### Issue: "Tambah Iklan" redirect fails

**Check**:

1. Verify `NEXT_PUBLIC_HUB_URL` in `.env.local`
2. Ensure hub app is running on specified port
3. Check browser console for CORS errors

---

### Issue: SEO score low in Lighthouse

**Check**:

1. Verify all images have alt text
2. Check meta descriptions under 160 chars
3. Ensure semantic HTML (`<header>`, `<nav>`, `<main>`)
4. Verify structured data valid JSON

---

### Issue: Slow page load

**Check**:

1. Verify ISR caching enabled (`revalidate` export)
2. Check image optimization (`next/image` component used)
3. Verify no unnecessary client-side data fetching
4. Check network tab for large bundle sizes

---

## Success Criteria

**All 7 test sections must pass** for quickstart validation to succeed:

- [x] Story 1: Browse All Content
- [x] Story 2: Filter by Category
- [x] Story 3: View Content Detail
- [x] Story 4: Redirect to Hub App
- [x] Test 1: SEO Optimization
- [x] Test 2: Server-Side Rendering
- [x] Test 3: Performance
- [x] Test 4: Accessibility
- [x] Test 5: Responsive Design
- [x] Test 6: Content Filtering Rules
- [x] Test 7: Caching Behavior

**Next Steps**: If all tests pass, proceed to automated test suite execution (unit + E2E)

---

## Quick Commands Reference

```bash
# Start development
cd apps/papan-info && pnpm dev

# Run tests
pnpm test                  # Unit tests
pnpm test:e2e             # E2E tests
pnpm test:contract        # Contract tests

# Build for production
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint
```
