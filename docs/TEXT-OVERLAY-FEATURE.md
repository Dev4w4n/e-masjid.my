# Content Creation with Text Overlay Feature

## Overview

The Hub app now supports a combined content creation experience that allows users to:

1. Upload their own images
2. Create professional text announcements with customizable backgrounds

This feature merges the functionality of text announcements and image content into a single, unified "Image/Text Design" content type.

## Architecture

### Components

#### 1. TextOverlayEditor (`/apps/hub/src/components/content/TextOverlayEditor.tsx`)

A rich text overlay editor that allows users to:

- Enter announcement text (up to 500 characters)
- Select from various background templates (Islamic themes, solid colors, gradients)
- Customize text appearance (size, color, alignment, font weight)
- Preview the design in real-time on a 16:9 canvas (1920x1080)
- Generate the final image as a canvas element

**Key Features:**

- Real-time canvas rendering
- Text wrapping with proper line breaks
- Text shadow for better readability on any background
- Background image loading with cross-origin support
- Gradient background generation from CSS strings

#### 2. Updated CreateContent Page (`/apps/hub/src/pages/content/CreateContent.tsx`)

Enhanced with tabbed interface for image creation:

- **Upload Image Tab**: Traditional image file upload
- **Create Text Design Tab**: Text overlay editor integration

**Flow:**

1. User selects "Image/Text Design" content type
2. User chooses between "Upload Image" or "Create Text Design"
3. For text design:
   - User creates design in TextOverlayEditor
   - Canvas is converted to PNG blob
   - Blob is uploaded to Supabase storage
   - Public URL is stored in display_content table

### Configuration

#### Background Templates (`/apps/hub/src/config/backgrounds.ts`)

Centralized configuration for all background templates:

```typescript
export interface BackgroundTemplate {
  id: string;
  name: string;
  thumbnail: string; // Path to thumbnail image
  file: string; // Path to full-size image
  category: "islamic" | "solid" | "gradient";
  primaryColor?: string; // CSS color or gradient string
}
```

**Categories:**

- **Islamic**: Islamic-themed backgrounds with decorative patterns (e.g., lanterns, geometric patterns)
- **Solid**: Single solid colors (e.g., teal, blue, purple)
- **Gradient**: CSS linear gradients (e.g., teal-to-cyan, green-to-blue)

### Storage

#### Background Images

Location: `/apps/hub/public/backgrounds/`

This folder contains:

- Islamic-themed background images
- README.md with guidelines for adding new backgrounds

**Current Templates:**

- `islamic-lanterns-on-green.jpg` - Islamic lanterns on decorative teal/green background

#### Generated Content

Generated text designs are uploaded to Supabase Storage:

- Bucket: `content-images`
- Path: `content-images/{masjid_id}/{timestamp}-{random}.png`
- Format: PNG (for quality and transparency support)

## User Experience

### Creating Text-Based Content

1. Navigate to "Create Content" page
2. Select "Image/Text Design" as content type
3. Click "Create Text Design" tab
4. Enter text announcement
5. Customize appearance:
   - Adjust font size (24-120px)
   - Choose text color (white, black, gold, silver, teal)
   - Set text alignment (left, center, right)
   - Toggle font weight (normal, bold)
6. Select background from categories:
   - Islamic (decorative backgrounds)
   - Solid Colors (single colors)
   - Gradients (color transitions)
7. Preview updates in real-time
8. Click "Use This Design"
9. Add title and description
10. Select masjid
11. Submit for approval

### Canvas Rendering Details

The TextOverlayEditor uses HTML5 Canvas API to create the final image:

**Specifications:**

- Canvas size: 1920x1080 (16:9 aspect ratio, TV display standard)
- Font: Arial with fallback to sans-serif
- Text shadow: RGBA(0, 0, 0, 0.7) with 10px blur for readability
- Text wrapping: Automatic with 200px horizontal margins
- Vertical centering: Calculated based on line count and height

**Background Rendering:**

1. For image backgrounds: Draw image stretched to canvas size
2. For solid colors: Fill rectangle with specified color
3. For gradients: Parse CSS gradient string and create canvas gradient

## Technical Implementation

### Canvas to Blob Conversion

```typescript
const blob = await new Promise<Blob>((resolve) => {
  generatedCanvas.toBlob((blob) => {
    resolve(blob!);
  }, "image/png");
});

const fileToUpload = new File([blob], "text-design.png", {
  type: "image/png",
});
```

### Text Wrapping Algorithm

```typescript
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word!;
    }
  }
  lines.push(currentLine);
  return lines;
};
```

### Gradient Parsing

CSS gradient strings are parsed to create canvas gradients:

```typescript
// Parse: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)
const match = gradientString.match(
  /linear-gradient\((\d+)deg,\s*(#[0-9a-f]+)\s+\d+%,\s*(#[0-9a-f]+)\s+\d+%\)/i
);

if (match) {
  const angle = parseInt(match[1]);
  const color1 = match[2];
  const color2 = match[3];

  // Calculate gradient endpoints based on angle
  const angleRad = (angle * Math.PI) / 180;
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
}
```

## Future Enhancements

### Potential Additions

1. **More Background Templates**
   - Add more Islamic patterns (mosque silhouettes, calligraphy borders)
   - Add seasonal themes (Ramadan, Eid, Hajj)
   - Add time-based themes (Fajr, Maghrib)

2. **Advanced Text Styling**
   - Custom fonts (Islamic/Arabic calligraphy fonts)
   - Text effects (outline, glow, 3D)
   - Multiple text blocks with independent styling
   - Rich text formatting (bold, italic, underline)

3. **Layout Templates**
   - Pre-designed layouts with placeholders
   - Multiple text zones (title, body, footer)
   - Logo/badge placement areas

4. **Image Manipulation**
   - Crop and resize uploaded images
   - Apply filters and effects
   - Overlay text on uploaded images

5. **Export Options**
   - Download preview before submission
   - Save draft designs
   - Template favorites

## Accessibility

- All controls have proper labels
- Keyboard navigation supported
- Color contrast meets WCAG 2.1 AA standards
- Preview updates automatically for screen reader announcements

## Performance Considerations

- Canvas rendering is optimized with minimal re-renders
- Background images are cached after first load
- Large images are handled efficiently via blob conversion
- Preview scales down for UI display while maintaining full resolution

## Testing

### Unit Tests (Recommended)

- Test canvas rendering with different text lengths
- Test background image loading and errors
- Test gradient parsing and rendering
- Test text wrapping algorithm

### E2E Tests (Recommended)

- Test complete flow: select background → enter text → generate → submit
- Test switching between upload and text overlay modes
- Test form validation
- Test upload success with generated canvas

## Database Schema

No changes required to existing schema. Generated images are uploaded as regular image content:

```sql
display_content (
  type: 'image',  -- Same as uploaded images
  url: 'https://...storage.supabase.co/.../text-design.png'
)
```

## Backward Compatibility

- Existing content types remain unchanged
- Old "text_announcement" type is deprecated in favor of "image" with text overlay
- Legacy text announcements will continue to work as-is
- No migration required

---

**Last Updated**: October 15, 2025
**Feature Branch**: 006-create-a-new
**Status**: ✅ Implemented and tested
