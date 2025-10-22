# QR Code Feature for Content Display

## Overview

The QR Code feature allows content creators to add interactive QR codes to their content when displayed on TV screens. When viewers scan the QR code with their smartphones, they can access additional information, registration forms, donation pages, or any custom URL.

## Implementation Date

October 15, 2025

## Database Schema Changes

### Migration: `024_add_qr_code_to_display_content.sql`

Added three new fields to the `display_content` table:

| Field              | Type        | Default        | Description                                                             |
| ------------------ | ----------- | -------------- | ----------------------------------------------------------------------- |
| `qr_code_enabled`  | BOOLEAN     | FALSE          | Toggle to show/hide QR code on TV display                               |
| `qr_code_url`      | TEXT        | NULL           | Custom URL for QR code. If NULL, defaults to public content detail page |
| `qr_code_position` | VARCHAR(20) | 'bottom-right' | Position on screen: top-left, top-right, bottom-left, bottom-right      |

### Constraints

- `qr_code_position` must be one of: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
- `qr_code_url` is optional (NULL allowed)
- When `qr_code_url` is NULL, the system uses the default public content page URL

## User Interface

### Content Creation Page Changes

#### New QR Code Settings Section

Located below the content type selection and before the submit button:

**Components:**

1. **Enable/Disable Toggle**
   - Switch control to enable QR code
   - Default: Enabled
   - Label: "Enable QR Code on TV Display"

2. **Custom URL Field** (Collapsible when enabled)
   - Text input for custom URL
   - Placeholder: "https://example.com/your-link"
   - Helper text explaining default behavior
   - Optional field

3. **Position Selector**
   - Dropdown menu with 4 options:
     - Top Left
     - Top Right
     - Bottom Left
     - Bottom Right (Default)

4. **Info Alert**
   - Shows QR code behavior preview
   - Dynamic text based on whether custom URL is provided

### User Experience

#### Creating Content with QR Code

1. User creates content (image, text design, or YouTube video)
2. In the QR Code Settings section:
   - Toggle "Enable QR Code" (ON by default)
   - Optionally enter custom URL
   - Select position on screen
3. See preview information about QR code behavior
4. Submit content for approval

#### Default Behavior (No Custom URL)

- QR code links to: `https://yourapp.com/iklan/{content-slug}`
- Viewers scan to see:
  - Content title and description
  - Masjid information
  - Sponsorship details (if applicable)
  - Related content

#### Custom URL Behavior

- QR code links to user-provided URL
- Use cases:
  - Event registration forms
  - Donation pages
  - External websites
  - Social media profiles
  - Google Forms
  - Payment links

## Technical Implementation

### Hub App Changes

#### File: `apps/hub/src/pages/content/CreateContent.tsx`

**Interface Updates:**

```typescript
interface ContentFormData {
  // ... existing fields
  qr_code_enabled: boolean;
  qr_code_url: string;
  qr_code_position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}
```

**State Initialization:**

```typescript
const [formData, setFormData] = useState<ContentFormData>({
  // ... existing defaults
  qr_code_enabled: true,
  qr_code_url: "",
  qr_code_position: "bottom-right",
});
```

**Database Insert:**

```typescript
await supabase.from("display_content").insert([
  {
    // ... existing fields
    qr_code_enabled: formData.qr_code_enabled,
    qr_code_url: formData.qr_code_url || null,
    qr_code_position: formData.qr_code_position,
  },
]);
```

### TV Display App Integration (To Be Implemented)

#### QR Code Generation

The TV Display app will need to:

1. **Check if QR code is enabled** for each content item
2. **Determine the URL**:
   ```typescript
   const qrUrl =
     content.qr_code_url || `${PUBLIC_APP_URL}/iklan/${content.slug}`;
   ```
3. **Generate QR code** using a library like `qrcode` or `react-qr-code`
4. **Position the QR code** according to `qr_code_position`
5. **Style the QR code**:
   - Semi-transparent background
   - Appropriate size (e.g., 150x150px)
   - Padding and border for visibility

#### Recommended Library

```bash
pnpm add qrcode.react
```

#### Example Implementation

```typescript
import QRCode from "qrcode.react";

const ContentDisplay = ({ content }) => {
  const qrUrl = content.qr_code_url ||
                `${process.env.NEXT_PUBLIC_APP_URL}/iklan/${content.slug}`;

  return (
    <div className="content-container">
      {/* Main content */}
      <img src={content.url} alt={content.title} />

      {/* QR Code Overlay */}
      {content.qr_code_enabled && (
        <div
          className={`qr-code-overlay ${content.qr_code_position}`}
          style={{
            position: 'absolute',
            [content.qr_code_position.split('-')[0]]: '20px',
            [content.qr_code_position.split('-')[1]]: '20px',
          }}
        >
          <QRCode
            value={qrUrl}
            size={150}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
      )}
    </div>
  );
};
```

## Use Cases

### 1. Event Registration

**Scenario:** Mosque hosting iftar event

- Content: Event poster with details
- QR Code URL: Google Form for registration
- Position: Bottom right
- Benefit: Easy sign-up for attendees

### 2. Donation Campaigns

**Scenario:** Fundraising for mosque renovation

- Content: Campaign image with progress
- QR Code URL: Online donation page
- Position: Bottom right
- Benefit: Instant donations via phone

### 3. Educational Resources

**Scenario:** Islamic lecture announcement

- Content: Speaker profile and topic
- QR Code URL: YouTube playlist or website
- Position: Top right
- Benefit: Access to additional resources

### 4. Community Feedback

**Scenario:** Mosque improvement survey

- Content: Announcement about feedback request
- QR Code URL: Google Form survey
- Position: Bottom left
- Benefit: Easy participation

### 5. Social Media Connection

**Scenario:** Building online community

- Content: Social media announcement
- QR Code URL: Instagram/Facebook page
- Position: Top left
- Benefit: Grow social media following

### 6. Default (No Custom URL)

**Scenario:** General announcements

- Content: Prayer time changes, events
- QR Code URL: (Default) Public content page
- Position: Bottom right
- Benefit: Detailed information without cluttering display

## Security Considerations

### URL Validation (Recommended for Future Enhancement)

1. **URL Format Validation**

   ```typescript
   const isValidUrl = (url: string) => {
     try {
       new URL(url);
       return true;
     } catch {
       return false;
     }
   };
   ```

2. **Protocol Whitelist**
   - Allow: `https://`, `http://`
   - Block: `javascript:`, `data:`, `file://`

3. **Malicious URL Checking**
   - Integration with URL safety APIs (Google Safe Browsing)
   - Blocklist of known malicious domains

### Privacy Considerations

1. **No Tracking by Default**
   - Default public pages don't track users
   - Custom URLs are user responsibility

2. **URL Shorteners**
   - Discourage use (hard to verify destination)
   - Add warning if detected

3. **User Consent**
   - Content creators responsible for their URLs
   - Add terms of service checkbox

## Admin Approval Workflow

### Admin Review Panel

When reviewing content with QR codes, admins should see:

1. **QR Code Status**
   - ✅ Enabled / ❌ Disabled

2. **Destination URL**
   - Custom URL or "Default (Public Content Page)"
   - Clickable link to verify

3. **Position**
   - Visual representation or text

4. **Security Warning**
   - If custom URL detected, show warning
   - Admin should verify URL is safe and appropriate

### Approval Checklist

Before approving content with QR codes:

- [ ] URL is appropriate for masjid audience
- [ ] URL is accessible and working
- [ ] URL doesn't violate terms of service
- [ ] URL destination is clear and trustworthy
- [ ] QR code position doesn't obstruct content

## Analytics (Future Enhancement)

### Metrics to Track

1. **QR Code Usage**
   - % of content with QR codes enabled
   - Most common positions
   - Custom URL vs default ratio

2. **Scan Statistics**
   - Total scans per content
   - Scan times (peak hours)
   - Unique vs repeat scans

3. **User Engagement**
   - Average scan duration
   - Actions taken after scan
   - Conversion rates (if applicable)

### Implementation Approach

- Add tracking pixel to public content pages
- Use URL shortener with analytics
- Generate unique QR code per content item
- Track via UTM parameters

## Testing Checklist

### Unit Tests

- [ ] QR code enabled/disabled toggle works
- [ ] Custom URL input saves correctly
- [ ] Position selector updates state
- [ ] Form validation for URLs
- [ ] Database insert includes QR fields

### Integration Tests

- [ ] Content created with QR code saves to database
- [ ] QR code settings persist after refresh
- [ ] Admin can see QR code settings in approval panel
- [ ] QR code displays correctly on TV app

### E2E Tests

- [ ] Create content with QR code enabled (default)
- [ ] Create content with custom URL
- [ ] Create content with QR code disabled
- [ ] Change QR code position
- [ ] Submit and verify in database
- [ ] Verify QR code appears on TV display
- [ ] Scan QR code and verify destination

### Manual Testing

- [ ] QR code size appropriate on TV screen
- [ ] QR code readable from typical viewing distance
- [ ] QR code doesn't obstruct important content
- [ ] All 4 positions work correctly
- [ ] QR code visible on light and dark content
- [ ] Mobile scanning works on iOS and Android

## Performance Considerations

### QR Code Generation

- Generate QR codes on-the-fly (recommended)
- Or cache generated QR code images
- Use appropriate error correction level (M or H)

### Bundle Size

- QR code library adds ~20-30KB
- Lazy load QR generation code
- Use lightweight library

### Display Performance

- QR code overlay shouldn't impact content rendering
- Use CSS transforms for positioning (GPU accelerated)
- Optimize QR code image size

## Future Enhancements

### Phase 2 Features

1. **QR Code Customization**
   - Custom colors (brand matching)
   - Logo in center of QR code
   - Custom size options
   - Border and shadow styles

2. **Advanced Analytics**
   - Scan tracking dashboard
   - Geographic distribution
   - Device types
   - Time-based analytics

3. **Dynamic QR Codes**
   - Update destination without regenerating
   - A/B testing different destinations
   - Timed redirects

4. **Multi-URL QR Codes**
   - Different URLs for different times/dates
   - Language-specific destinations
   - Device-specific redirects

5. **QR Code Templates**
   - Pre-designed styles
   - Industry best practices
   - Masjid-specific designs

## Documentation Updates

### User Guide

- Added QR code section to user guide
- Screenshots of QR code settings
- Best practices for QR code usage

### Admin Manual

- QR code review guidelines
- Security considerations for URL review
- How to handle inappropriate URLs

### Developer Docs

- TV Display app implementation guide
- QR code generation examples
- Styling guidelines

## Backward Compatibility

### Existing Content

- All existing content has `qr_code_enabled = FALSE`
- No QR codes shown on existing content by default
- Users can edit content to enable QR codes

### Database Migration

- Migration is additive (no data loss)
- Default values ensure safe rollout
- Reversible if needed

## Rollback Plan

If issues arise:

1. **Disable Feature in UI**
   - Hide QR code settings section
   - Don't save QR code fields

2. **Disable on TV Display**
   - Don't render QR code overlays
   - Keep data in database

3. **Rollback Migration** (if needed)
   ```sql
   ALTER TABLE display_content
   DROP COLUMN qr_code_enabled,
   DROP COLUMN qr_code_url,
   DROP COLUMN qr_code_position;
   ```

---

**Status**: ✅ Hub App Implemented, ⏳ TV Display App Pending
**Last Updated**: October 15, 2025
**Branch**: 006-create-a-new
**Related Migration**: 024_add_qr_code_to_display_content.sql
