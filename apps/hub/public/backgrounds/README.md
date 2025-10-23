# Background Templates

This folder contains background templates used for creating text-based content in the Hub app.

## Current Templates

### Islamic Themed

- `islamic-lanterns-on-green.jpg` - Islamic lanterns on teal/green decorative background

### Solid Colors & Gradients

Solid colors and gradients are generated programmatically via CSS and don't require image files.

## Adding New Backgrounds

To add new background images:

1. Add the image file to this folder
2. Update `/apps/hub/src/config/backgrounds.ts` with the new template configuration
3. Ensure images are optimized for TV display (recommended: 1920x1080 or 16:9 aspect ratio)
4. File size should be kept under 500KB for optimal loading

## Image Guidelines

- **Aspect Ratio**: 16:9 (1920x1080, 1280x720, etc.)
- **Format**: JPG (for photos), PNG (for graphics with transparency)
- **File Size**: < 500KB
- **Content**: Should not contain text (text will be overlaid by users)
- **Colors**: Consider readability - both light and dark text should be visible with shadow effects
- **Theme**: Islamic, mosque, or neutral professional designs appropriate for masjid displays
