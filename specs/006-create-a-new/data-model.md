# Data Model: Public SEO-Friendly Content Display App

**Date**: 2025-10-10  
**Status**: Complete

## Overview

Data model for the public app that reads from existing Supabase tables (no new migrations required).

---

## Existing Database Entities (Read-Only Access)

### 1. display_content

**Purpose**: Stores user-submitted advertisements/content approved by masjid admins.

**Schema**:

```typescript
interface DisplayContent {
  id: string; // UUID primary key
  masjid_id: string; // FK to masjids table
  title: string; // Content title (max 255 chars)
  description: string | null; // Full description
  type: "image" | "youtube"; // Content type enum
  url: string; // Image URL or YouTube URL
  thumbnail_url: string | null; // Thumbnail for YouTube videos
  sponsorship_amount: number; // Decimal(10,2), used for sorting
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  status: string; // 'approved', 'pending', 'rejected'
  submitted_by: string; // FK to users table
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
```

**Query Filters for Public App**:

```typescript
// Only show approved, currently active content
.eq('status', 'approved')
.lte('start_date', new Date().toISOString())
.gte('end_date', new Date().toISOString())
.order('sponsorship_amount', { ascending: false })
.order('created_at', { ascending: false })
```

**Relationships**:

- `masjid_id` → `masjids.id` (inner join required)
- `category_id` → `categories.id` (if exists, may be null)

**Validation Rules** (enforced by RLS/constraints):

- `start_date` <= `end_date`
- `sponsorship_amount` >= 0
- `type` in ('image', 'youtube')

**State Transitions** (not applicable to public app - read-only):

- Content goes through approval workflow in hub app
- Public app only displays `status='approved'`

---

### 2. categories

**Purpose**: Business/content categories for filtering.

**Schema**:

```typescript
interface Category {
  id: string; // UUID primary key
  name: string; // Category name (e.g., "Makanan & Minuman")
  icon: string; // Emoji or icon identifier
  color: string; // Hex color code
  is_active: boolean; // Only show active categories
  display_order: number; // Sort order for display
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
```

**Query Filters for Public App**:

```typescript
.eq('is_active', true)
.order('display_order', { ascending: true })
```

**Examples**:

- Makanan & Minuman (🍽️, #F59E0B)
- Pakaian & Aksesori (👗, #8B5CF6)
- Pendidikan & Kursus (📚, #10B981)
- Perkhidmatan Profesional (💼, #3B82F6)

---

### 3. masjids

**Purpose**: Mosque/surau information for context display.

**Schema**:

```typescript
interface Masjid {
  id: string; // UUID primary key
  name: string; // Masjid name
  location: string; // Street address/locality
  state: string; // Malaysian state
  district: string; // District name
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
```

**Usage in Public App**:

- Joined with display_content to show masjid context
- Displayed on each content card: `${masjid.name}, ${masjid.location}`
- No filtering by masjid (nationwide display per clarifications)

---

## Derived/Computed Data

### ContentWithMasjid

**Purpose**: Enriched content data with masjid information for display.

```typescript
interface ContentWithMasjid extends DisplayContent {
  masjids: {
    id: string;
    name: string;
    location: string;
    state: string;
    district: string;
  };
}
```

**Supabase Query**:

```typescript
const { data, error } = await supabase
  .from("display_content")
  .select(
    `
    *,
    masjids!inner (
      id,
      name,
      location,
      state,
      district
    )
  `
  )
  .eq("status", "approved")
  .lte("start_date", new Date().toISOString())
  .gte("end_date", new Date().toISOString())
  .order("sponsorship_amount", { ascending: false })
  .order("created_at", { ascending: false });
```

---

### ContentSlug

**Purpose**: SEO-friendly URL slugs for content detail pages.

```typescript
type ContentSlug = string; // Format: "title-kebab-case-{uuid}"

// Generation function
function generateSlug(title: string, id: string): ContentSlug {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Multiple hyphens to single
    .trim();

  return `${titleSlug}-${id}`;
}

// Example: "kedai-buku-islam-abc123-def456-..."
```

**Usage**:

- URL: `/iklan/[slug]`
- Parsing: Extract UUID from end of slug for database lookup

---

### CategoryWithCount

**Purpose**: Category with content count for filter buttons.

```typescript
interface CategoryWithCount extends Category {
  contentCount: number;
}

// Client-side computation
const categoriesWithCount = categories.map((cat) => ({
  ...cat,
  contentCount: contents.filter((c) => c.category_id === cat.id).length,
}));
```

---

## Data Relationships

```
display_content (many) → masjids (one)
  ↓
display_content.masjid_id = masjids.id

display_content (many) → categories (one) [optional]
  ↓
display_content.category_id = categories.id [nullable]

display_content (many) → users (one) [not exposed in public app]
  ↓
display_content.submitted_by = users.id
```

---

## Data Volume Assumptions

Based on clarifications:

- **Total Content Items**: 1,000 - 10,000
- **Active (Approved) Content**: ~500 - 5,000 (estimate 50% active at any time)
- **Categories**: ~10-20
- **Masjids**: ~100-500

**Memory Footprint**:

- Single content record: ~1-2 KB
- All active content: ~1-10 MB
- Acceptable for client-side filtering

---

## Caching Strategy

### Server-Side (ISR)

```typescript
// Homepage: 1 hour revalidation
export const revalidate = 3600;

// Content detail: 24 hour revalidation
export const revalidate = 86400;
```

### Client-Side

- No additional caching beyond Next.js automatic deduplication
- Category filtering happens in-memory (no cache needed)

---

## Data Access Patterns

### 1. Homepage - All Active Content

**Query**: Fetch all approved, currently active content with masjid data

```typescript
// contentService.ts
export async function getAllActiveContent(): Promise<ContentWithMasjid[]> {
  const { data, error } = await supabase
    .from("display_content")
    .select(
      `
      *,
      masjids!inner (id, name, location, state, district)
    `
    )
    .eq("status", "approved")
    .lte("start_date", new Date().toISOString())
    .gte("end_date", new Date().toISOString())
    .order("sponsorship_amount", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
```

**Frequency**: Once per page load (cached via ISR)
**Expected Rows**: 500-5,000

---

### 2. Content Detail - Single Content Item

**Query**: Fetch single content by ID with masjid data

```typescript
// contentService.ts
export async function getContentBySlug(
  slug: string
): Promise<ContentWithMasjid | null> {
  // Extract UUID from slug
  const uuid = slug.split("-").pop();

  const { data, error } = await supabase
    .from("display_content")
    .select(
      `
      *,
      masjids!inner (id, name, location, state, district)
    `
    )
    .eq("id", uuid)
    .eq("status", "approved")
    .single();

  if (error) return null;

  // Verify still active
  const now = new Date();
  if (new Date(data.start_date) > now || new Date(data.end_date) < now) {
    return null;
  }

  return data;
}
```

**Frequency**: Once per content detail page load (cached via ISR)
**Expected Rows**: 1

---

### 3. Categories - All Active

**Query**: Fetch all active categories

```typescript
// categoryService.ts
export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data;
}
```

**Frequency**: Once per page load (cached via ISR)
**Expected Rows**: 10-20

---

## Type Safety

### TypeScript Types

All types should be generated from Supabase schema:

```bash
# Generate types from Supabase
supabase gen types typescript --local > packages/shared-types/src/database.types.ts
```

**Usage**:

```typescript
import type { Database } from "@masjid-suite/shared-types";

type DisplayContent = Database["public"]["Tables"]["display_content"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Masjid = Database["public"]["Tables"]["masjids"]["Row"];
```

---

## Row Level Security (RLS)

**Public App Access**:

- Read-only access to public data
- No authentication required
- RLS policies allow SELECT on:
  - `display_content` (status='approved' only)
  - `categories` (is_active=true only)
  - `masjids` (all rows)

**Note**: RLS policies already exist in migrations. Public app relies on existing policies.

---

## Data Integrity

**Constraints** (enforced by database):

- `display_content.start_date` <= `display_content.end_date`
- `display_content.sponsorship_amount` >= 0
- `display_content.status` in allowed enum values
- Foreign key constraints for `masjid_id`, `category_id`

**Validation** (app-level, defensive):

- Check content.status === 'approved'
- Verify current date within start_date/end_date range
- Handle null category_id gracefully
- Validate slug format before parsing UUID

---

## Performance Considerations

### Indexing (existing in database)

- `display_content.masjid_id` (FK index)
- `display_content.status` (for filtering)
- `display_content.sponsorship_amount` (for sorting)
- `display_content.created_at` (for sorting)

### Query Optimization

- Use Supabase's automatic query caching
- Limit SELECT to needed columns only (but we need all for display)
- Inner join with masjids (required, not left join)
- No pagination needed for homepage (client-side filtering)

### Scalability

- Current data volume (1K-10K items) manageable
- If exceeds 10K, consider:
  - Implement pagination (10-50 items per page)
  - Lazy loading / infinite scroll
  - More aggressive caching (longer revalidation)

---

## Summary

**Data Sources**: 3 existing tables (display_content, categories, masjids)
**Access Pattern**: Read-only via @masjid-suite/supabase-client
**Data Volume**: 1,000-10,000 content items, 10-20 categories, 100-500 masjids
**Caching**: ISR with 1-24 hour revalidation
**Type Safety**: Generated from Supabase schema via supabase gen types
**RLS**: Existing policies enforced, no new policies needed
