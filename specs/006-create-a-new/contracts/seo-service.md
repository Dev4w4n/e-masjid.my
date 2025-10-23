# SEO Service API Contract

**Service**: lib/seo.ts  
**Purpose**: Generate SEO metadata and structured data

---

## Contract: generateMetadata(content?, category?)

### Request

```typescript
// Function signature
generateMetadata(
  content?: ContentWithMasjid,
  category?: string
): Metadata

// Used for:
// - Homepage: generateMetadata()
// - Content detail: generateMetadata(content)
// - Category filter: generateMetadata(null, category)
```

### Response Schema

```typescript
interface Metadata {
  title: string; // Max 60 chars
  description: string; // Max 160 chars
  keywords?: string[];
  openGraph?: {
    title: string;
    description: string;
    type: "website";
    images: Array<{ url: string }>;
    locale: "ms_MY";
  };
  twitter?: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
}
```

### Business Rules

1. Title MUST be under 60 characters for Google display
2. Description MUST be under 160 characters
3. OpenGraph image MUST be absolute URL
4. Keywords MUST include relevant Bahasa Malaysia terms
5. Twitter card MUST default to 'summary_large_image'

### Success Cases

**Homepage**:

```typescript
{
  title: "E-Masjid.My - Platform Iklan Digital Masjid",
  description: "Temui perniagaan halal dalam komuniti masjid...",
  keywords: ["masjid", "iklan", "halal", "komuniti", "Muslim"],
  openGraph: { ... }
}
```

**Content Detail**:

```typescript
{
  title: "{content.title} - E-Masjid.My",
  description: content.description.substring(0, 160),
  openGraph: {
    images: [{ url: content.image_url }]
  }
}
```

### Error Cases

- Missing content parameter → use fallback homepage metadata
- Invalid image URL → use default OG image

---

## Contract: generateStructuredData(type, data)

### Request

```typescript
// Function signature
generateStructuredData(
  type: 'Organization' | 'ItemList' | 'Product',
  data: any
): string  // JSON-LD string

// Used for:
// - Homepage: generateStructuredData('Organization', { ... })
// - Content listing: generateStructuredData('ItemList', contents)
// - Content detail: generateStructuredData('Product', content)
```

### Response Schema

```typescript
// Returns JSON-LD string to be inserted in <script type="application/ld+json">
string; // Valid JSON
```

### Business Rules

1. MUST follow schema.org specification
2. MUST use absolute URLs
3. MUST include @context: "https://schema.org"
4. MUST be valid JSON (parseable)

### Success Cases

**Organization Schema**:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "E-Masjid.My",
  "url": "https://emasjid.my",
  "logo": "https://emasjid.my/emasjid-500x500.png"
}
```

**ItemList Schema**:

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "Product",
      "position": 1,
      "name": "...",
      "description": "...",
      "image": "..."
    }
  ]
}
```

**Product Schema**:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "description": "...",
  "image": "..."
}
```

### Error Cases

- Invalid type → return empty object
- Missing required fields → throw Error

---

## Contract: generateSitemap(contents)

### Request

```typescript
// Function signature
generateSitemap(contents: ContentWithMasjid[]): string

// Returns XML string for sitemap.xml
```

### Response Schema

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://emasjid.my/</loc>
    <lastmod>2025-10-10</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://emasjid.my/iklan/{slug}</loc>
    <lastmod>{content.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Business Rules

1. MUST include homepage with priority 1.0
2. MUST include all content detail pages with priority 0.8
3. MUST use absolute URLs
4. MUST be valid XML
5. MUST include lastmod timestamp

### Success Cases

- Valid XML sitemap with all content pages

### Error Cases

- Empty contents → return sitemap with homepage only

---

## Contract Test Checklist

### generateMetadata()

- [ ] Homepage metadata has valid title/description
- [ ] Content detail metadata includes content title
- [ ] Descriptions under 160 characters
- [ ] Titles under 60 characters
- [ ] OpenGraph includes required fields
- [ ] Twitter card defaults to summary_large_image
- [ ] Keywords include Bahasa Malaysia terms

### generateStructuredData()

- [ ] Organization schema valid per schema.org
- [ ] ItemList schema includes position field
- [ ] Product schema includes name, description, image
- [ ] All schemas have @context
- [ ] Returned string is valid JSON
- [ ] Absolute URLs used throughout

### generateSitemap()

- [ ] Returns valid XML
- [ ] Includes homepage with priority 1.0
- [ ] Includes all content pages with priority 0.8
- [ ] Uses absolute URLs
- [ ] Includes lastmod timestamps
- [ ] Handles empty content array
