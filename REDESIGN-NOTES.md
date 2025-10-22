# E-Masjid.My Redesign Implementation

## Design System Analysis from https://e-masjid.my/

### Color Palette

- **Primary Blue**: #338CF5 (rgb(51, 140, 245))
- **Teal/Cyan**: #4FD1C5 (rgb(79, 209, 197))
- **Gradient**: `from-blue-500 to-teal-400`
- **Text Primary**: #191919 (Gray-900)
- **Text Secondary**: #666666 (Gray-600)
- **Background**: #FFFFFF (White)
- **Accent Blue-600**: #0070F4 (Buttons)

### Typography

- **Font Family**: Inter (Variable font, 100-900 weight)
- **Heading Styles**:
  - h1: 3.25rem (52px), font-weight: 800, letter-spacing: -0.02em
  - h2: 2.625rem (42px), font-weight: 800, letter-spacing: -0.02em
  - h3: 2rem (32px), font-weight: 700
  - h4: 1.5rem (24px), font-weight: 700, letter-spacing: -0.01em

- **Body Text**:
  - text-xl: 1.25rem (20px) for lead paragraphs
  - text-base: 1rem (16px) for body
  - line-height: 1.5

### Design Patterns

#### Gradient Text

```css
.bg-clip-text.text-transparent.bg-gradient-to-r.from-blue-500.to-teal-400
```

#### Buttons

- Border-radius: 0.25rem (4px)
- Padding: 0.75rem 2rem
- Font-weight: 500
- Shadow: 0 10px 15px -3px rgba(0,0,0,0.04)
- Transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)

#### Cards

- Border-radius: 0.25rem (4px)
- Box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)
- Hover shadow: 0 10px 15px -3px rgba(0,0,0,0.04)

#### SVG Icons

- Size: 64x64px for feature cards
- Rounded background with primary blue-600 fill
- Stroke-width: 2px
- White and light blue-300 strokes

### Spacing System

- Base: 8px (0.5rem)
- Scale: 0, 0.25rem, 0.5rem, 0.75rem, 1rem, 1.25rem, 1.5rem, 2rem, 2.5rem, 3rem, 4rem, 5rem, 8rem, 10rem

### Border Radius

- sm: 0.125rem (2px)
- default: 0.25rem (4px)
- lg: 0.5rem (8px)
- full: 9999px (circular)

## Implementation Plan

### Phase 1: Update Logos & Branding

✅ Use the images from `/images/` folder:

- emasjid-500x500.png - Main logo
- favicon icons for browser

### Phase 2: Hub App Redesign

- Update Inter font implementation
- Apply gradient text to headings
- Update button styles with proper shadows
- Implement card designs with hover effects
- Add SVG icon system

### Phase 3: Public App Redesign

- Match e-masjid.my landing page style
- Gradient hero section
- Feature cards with SVG icons
- Testimonial section
- CTA sections with gradients

### Phase 4: Typography Update

- Install Inter font (variable)
- Update all heading styles
- Adjust line-heights and letter-spacing
- Update text color hierarchy

### Phase 5: Component Library

- Button variants (primary, secondary, outline)
- Card components
- Icon system
- Gradient utilities
- Shadow utilities

## Key CSS Rules to Follow

### Text Gradient

```css
.text-gradient {
  background: linear-gradient(to right, #338cf5, #4fd1c5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

### Primary Button

```css
.btn-primary {
  background-color: #0070f4;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.25rem;
  font-weight: 500;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background-color: #0064da;
}
```

### Feature Card

```css
.feature-card {
  background: white;
  border-radius: 0.25rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  transition: all 150ms;
}

.feature-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
}
```

## Next Steps

1. Install Inter font via Google Fonts or local
2. Create shared components using these styles
3. Update existing components gradually
4. Test across both apps
5. Ensure responsive design
