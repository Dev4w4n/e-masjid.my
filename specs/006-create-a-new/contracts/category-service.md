# Category Service API Contract

**Service**: categoryService.ts  
**Purpose**: Fetch active categories from Supabase

---

## Contract: getAllCategories()

### Request

```typescript
// Function signature
getAllCategories(): Promise<Category[]>

// No parameters
```

### Response Schema

```typescript
interface Category {
  id: string;
  name: string;
  icon: string; // Emoji or icon identifier
  color: string; // Hex color code (e.g., "#F59E0B")
  is_active: boolean; // Always true for returned items
  display_order: number;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
```

### Business Rules

1. MUST return only categories where `is_active = true`
2. MUST sort by `display_order ASC`
3. MUST return all fields for display

### Success Cases

- Empty array when no active categories exist
- Array of 1-N category items

### Error Cases

- Database connection error → throw Error
- RLS policy violation → throw Error (shouldn't happen for public read)

---

## Contract Test Checklist

### getAllCategories()

- [ ] Returns array of Category objects
- [ ] All items have is_active=true
- [ ] Items sorted by display_order ASC
- [ ] All required fields present (id, name, icon, color, display_order)
- [ ] Color values are valid hex codes (format: #RRGGBB)
- [ ] Handles empty result (no active categories)
- [ ] Throws error on database connection failure
