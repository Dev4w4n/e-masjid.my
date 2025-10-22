# Public SEO App - E-Masjid.My

> **Public-facing, SEO-optimized website displaying approved masjid content nationwide**

## 🎯 Purpose

Display all approved advertisements and announcements from masjids across Malaysia on a public, SEO-friendly website. No authentication required - pure static/ISR content delivery optimized for Google Search.

## ✨ Features

- ✅ **ISR (Incremental Static Regeneration)**: 1-hour cache for homepage, 24-hour for detail pages
- ✅ **Full SEO Support**: Metadata, OpenGraph, Twitter Cards, JSON-LD structured data
- ✅ **Islamic Theme**: Ported from masjidbro-mockup with green/gold color scheme
- ✅ **Category Filtering**: Browse content by category with live counts
- ✅ **Premium/Free Sections**: Sponsored content highlighted first
- ✅ **Responsive Design**: Mobile-first with hamburger menu
- ✅ **XML Sitemap**: Auto-generated at `/sitemap.xml`
- ✅ **Robots.txt**: SEO crawler instructions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_BASE_URL=https://masjidbro.my
NEXT_PUBLIC_HUB_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
pnpm dev
# Open http://localhost:3002
```

### 4. Build for Production

```bash
pnpm build
pnpm start
```

## 🧪 Testing

### Run Unit + Contract Tests

```bash
pnpm test
```

### Run E2E Tests (Playwright)

```bash
# Start dev server first
pnpm dev

# In another terminal
pnpm test:e2e
```

### Type Check

```bash
pnpm type-check
```

### Lint

```bash
pnpm lint
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (Header + Footer)
│   ├── page.tsx            # Homepage (ISR 1h)
│   ├── loading.tsx         # Loading state
│   ├── error.tsx           # Error boundary
│   ├── iklan/[slug]/       # Content detail pages (ISR 24h)
│   ├── sitemap.xml/        # XML sitemap route
│   └── robots.txt/         # Robots.txt route
├── components/             # React components
│   ├── Header.tsx          # Site header with "Tambah Iklan"
│   ├── Footer.tsx          # Site footer
│   ├── ContentCard.tsx     # Content display card
│   ├── ContentGrid.tsx     # Grid with category filtering
│   ├── CategoryFilter.tsx  # Category selection UI
│   ├── PremiumBadge.tsx    # Premium content badge
│   └── LoadingSpinner.tsx  # Loading animation
├── services/               # Data layer
│   ├── contentService.ts   # Content queries (read-only)
│   └── categoryService.ts  # Category queries
├── lib/                    # Utilities
│   ├── supabase.ts         # Supabase client init
│   └── seo.ts              # SEO metadata generators
└── styles/                 # CSS
    ├── globals.css         # Global + Tailwind
    └── islamic-theme.css   # Islamic design system
```

## 🎨 Islamic Theme

### Colors

- **Islamic Green**: Primary brand color (#2D5F3E - #E8F5E9)
- **Islamic Gold**: Premium accents (#B8860B - #FFF9E6)
- **Islamic Blue**: Links and CTAs (#1E40AF - #DBEAFE)

### Typography

- **Arabic Font**: Amiri (Google Fonts)
- **Body**: System font stack

### Components

- `.card-islamic`: White cards with subtle shadows
- `.header-islamic`: Gradient green header
- `.footer-islamic`: Dark green footer
- `.btn-primary`: Islamic green buttons
- `.premium-badge`: Gold premium indicators

## 📊 Data Schema

### Content Table (`display_content`)

```sql
- id (uuid)
- title (text)
- description (text, nullable)
- type (enum: 'image' | 'youtube')
- url (text)
- thumbnail_url (text, nullable)
- category_id (uuid, nullable)
- masjid_id (uuid)
- status (enum: 'pending' | 'approved' | 'rejected')
- start_date (date, nullable)
- end_date (date, nullable)
- sponsorship_amount (numeric, default 0)
- contact_number (text, nullable)
- contact_email (text, nullable)
- created_at (timestamptz)
```

### Queries

- **Homepage**: `status='approved'` + date range filter + sort by `sponsorship_amount DESC`
- **Detail Page**: By slug (extracts UUID from `title-kebab-case-{uuid}`)
- **Categories**: `is_active=true` sorted by `display_order ASC`

## 🔍 SEO Implementation

### Metadata

- **Title**: <60 characters
- **Description**: <160 characters
- **OpenGraph**: Full image/title/description
- **Twitter Cards**: Summary with image

### Structured Data (JSON-LD)

- **Organization**: Homepage
- **ItemList**: Content listing
- **Product**: Content detail pages

### Sitemap

- Auto-generated from active content
- Includes lastmod, changefreq, priority
- Cached 1 hour

### Robots.txt

- Allows all crawlers
- Points to sitemap.xml

## ⚡ Performance

### ISR Strategy

- **Homepage**: Revalidate every 1 hour
- **Detail Pages**: Revalidate every 24 hours
- Static generation at build time

### Image Optimization

- Next.js Image component with automatic WebP
- Lazy loading below fold
- Proper sizing attributes

### Code Splitting

- Dynamic imports for heavy components
- Route-based code splitting (Next.js default)

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast WCAG AA compliant
- Alt text on all images

## 🛠️ Configuration Files

### `next.config.js`

- ISR staleTimes configuration
- Image domain allowlisting (Supabase, YouTube)
- Redirects (`/tambah-iklan` → hub app)

### `tailwind.config.js`

- Islamic color palette
- Arabic font configuration
- Custom spacing/borders

### `tsconfig.json`

- Path aliases (`@/*` → `./src/*`)
- Strict mode enabled
- Next.js plugin

## 🐛 Troubleshooting

### Build fails with "Cannot find module"

Clear Next.js cache:

```bash
rm -rf .next
pnpm build
```

### Supabase connection error

Check `.env.local` has correct credentials:

```bash
# Verify env vars are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### Images not loading

1. Check image URLs are from allowed domains in `next.config.js`
2. Verify Supabase Storage bucket is public

### TypeScript errors

Run type check:

```bash
pnpm type-check
```

## 📚 Related Documentation

- [Main Project README](../../README.md)
- [Feature Spec](./FEATURE_SPEC.md)
- [Plan Document](./plan.md)
- [Tasks Checklist](./tasks.md)
- [Implementation Summary](./IMPLEMENTATION_COMPLETE.md)

## 🔗 Links

- **Dev Server**: http://localhost:3002
- **Hub App**: http://localhost:3000 (for "Tambah Iklan" link)
- **Supabase Dashboard**: https://app.supabase.com

## 📝 License

Part of E-Masjid.My monorepo. See root LICENSE file.

---

**Status**: ✅ Core implementation complete (87%)  
**Last Updated**: January 5, 2025
