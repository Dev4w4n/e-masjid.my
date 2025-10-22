# Content Service API Contract

**Service**: contentService.ts  
**Purpose**: Fetch approved content from Supabase

---

## Contract: getAllActiveContent()

### Request

```typescript
// Function signature
getAllActiveContent(): Promise<ContentWithMasjid[]>

// No parameters
```

### Response Schema

```typescript
interface ContentWithMasjid {
  id: string;
  masjid_id: string;
  title: string;
  description: string | null;
  type: "image" | "youtube";
  url: string;
  thumbnail_url: string | null;
  sponsorship_amount: number;
  start_date: string; // ISO date
  end_date: string; // ISO date
  status: "approved"; // Always 'approved' for public
  submitted_by: string;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  masjids: {
    id: string;
    name: string;
    location: string;
    state: string;
    district: string;
  };
}
```

### Business Rules

1. MUST return only content where `status = 'approved'`
2. MUST return only content where `start_date <= NOW()`
3. MUST return only content where `end_date >= NOW()`
4. MUST sort by `sponsorship_amount DESC, created_at DESC`
5. MUST include inner join with `masjids` table
6. MUST NOT return content from inactive masjids (handled by inner join)

### Success Cases

- Empty array when no active content exists
- Array of 1-N content items with masjid data

### Error Cases

- Database connection error → throw Error
- RLS policy violation → throw Error (shouldn't happen for public read)
- Invalid masjid relationship → filtered out by inner join

---

## Contract: getContentBySlug(slug)

### Request

```typescript
// Function signature
getContentBySlug(slug: string): Promise<ContentWithMasjid | null>

// Slug format: "title-kebab-case-{uuid}"
// Example: "kedai-buku-islam-abc123-def456"
```

### Response Schema

```typescript
// Same as ContentWithMasjid above, or null if not found
```

### Business Rules

1. MUST extract UUID from end of slug
2. MUST return only if `status = 'approved'`
3. MUST verify `start_date <= NOW() <= end_date`
4. MUST include inner join with `masjids` table
5. MUST return `null` if not found or not active

### Success Cases

- Single content item with masjid data
- `null` if content not found, expired, or not approved

### Error Cases

- Invalid slug format → return `null`
- Database connection error → throw Error
- RLS policy violation → throw Error

---

## Contract Test Checklist

### getAllActiveContent()

- [ ] Returns array of ContentWithMasjid
- [ ] All items have status='approved'
- [ ] All items have valid date range (start <= now <= end)
- [ ] Items sorted by sponsorship_amount DESC, then created_at DESC
- [ ] All items include masjids object with required fields
- [ ] Handles empty result (no active content)
- [ ] Throws error on database connection failure

### getContentBySlug()

- [ ] Returns ContentWithMasjid for valid active slug
- [ ] Returns null for non-existent UUID
- [ ] Returns null for expired content (end_date < now)
- [ ] Returns null for future content (start_date > now)
- [ ] Returns null for non-approved content (status != 'approved')
- [ ] Correctly extracts UUID from slug
- [ ] Includes masjids object with required fields
- [ ] Throws error on database connection failure
