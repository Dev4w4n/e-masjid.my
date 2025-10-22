# QR Code Feature - Visual UI Guide

## Content Creation Page - QR Code Section

### Full Section Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  🔲 QR Code Settings                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ☑️ Enable QR Code on TV Display                                 │
│                                                                  │
│  When enabled, a QR code will appear on the TV display. By      │
│  default, it links to this content's public detail page where   │
│  viewers can get more information.                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Custom QR Code URL (Optional)                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ https://example.com/your-link                        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  Leave empty to use default public content page. Enter a  │ │
│  │  custom URL to link to your website, registration form,   │ │
│  │  donation page, etc.                                       │ │
│  │                                                            │ │
│  │  QR Code Position                                          │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Bottom Right (Default)                            ▼  │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  • Top Left                                                │ │
│  │  • Top Right                                               │ │
│  │  • Bottom Left                                             │ │
│  │  • Bottom Right (Default)                                  │ │
│  │                                                            │ │
│  │  ℹ️ QR Code Preview:                                       │ │
│  │  The QR code will be generated and displayed on the TV    │ │
│  │  screen when your content is approved and shown. Viewers  │ │
│  │  can scan it with their phones to visit your custom link. │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## State: Disabled

```
┌──────────────────────────────────────────────────────────────────┐
│  🔲 QR Code Settings                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ☐ Enable QR Code on TV Display                                 │
│                                                                  │
│  When enabled, a QR code will appear on the TV display. By      │
│  default, it links to this content's public detail page where   │
│  viewers can get more information.                              │
│                                                                  │
│  [Collapsed - no additional options shown]                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## State: Enabled with Default URL

```
┌──────────────────────────────────────────────────────────────────┐
│  🔲 QR Code Settings                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ☑️ Enable QR Code on TV Display                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Custom QR Code URL (Optional)                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │                                                        │ │ ← Empty
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  QR Code Position                                          │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Bottom Right (Default)                            ▼  │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ℹ️ QR Code Preview:                                       │ │
│  │  The QR code will be generated and displayed on the TV    │ │
│  │  screen when your content is approved and shown. Viewers  │ │
│  │  can scan it with their phones to view detailed           │ │
│  │  information about this content.                          │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## State: Enabled with Custom URL

```
┌──────────────────────────────────────────────────────────────────┐
│  🔲 QR Code Settings                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ☑️ Enable QR Code on TV Display                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Custom QR Code URL (Optional)                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ https://forms.google.com/event-registration          │ │ │ ← Custom URL
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  QR Code Position                                          │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Top Right                                          ▼  │ │ │ ← Custom Position
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ℹ️ QR Code Preview:                                       │ │
│  │  The QR code will be generated and displayed on the TV    │ │
│  │  screen when your content is approved and shown. Viewers  │ │
│  │  can scan it with their phones to visit your custom link. │ │ ← Dynamic text
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Position Selector Dropdown

```
┌──────────────────────────────────────┐
│ QR Code Position                  ▼  │
└──────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│ Top Left                             │
├──────────────────────────────────────┤
│ Top Right                            │
├──────────────────────────────────────┤
│ Bottom Left                          │
├──────────────────────────────────────┤
│ ✓ Bottom Right (Default)             │ ← Selected
└──────────────────────────────────────┘
```

---

## Integration with Full Form

```
┌────────────────────────────────────────────────────────────────┐
│  Create Content                                                │
└────────────────────────────────────────────────────────────────┘

  Submit new content to any masjid for approval. Upload your own
  images or create beautiful text designs with Islamic-themed
  backgrounds. The masjid admin(s) will review your submission...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────────────────────────────────────┐
│  Select Masjid to Submit Content To              ▼             │
│  • Masjid Al-Falah - Kuala Lumpur, Selangor                   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Content Type                                     ▼             │
│  • Image/Text Design                                           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Content Title                                                 │
│  Friday Prayer Announcement                                    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Description (optional)                                        │
│  Special Friday prayer time for Ramadan                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Create Image Content                                          │
│  ┌──────────────────────────┬──────────────────────────────┐  │
│  │ [Upload Image] [Create Text Design]                     │  │
│  └──────────────────────────┴──────────────────────────────┘  │
│  ... [content creation UI] ...                                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  🔲 QR Code Settings                          ← NEW SECTION    │
├────────────────────────────────────────────────────────────────┤
│  ☑️ Enable QR Code on TV Display                               │
│  [QR code configuration panel]                                 │
└────────────────────────────────────────────────────────────────┘

                            [Submit for Approval]
```

---

## TV Display Preview (Future Implementation)

### QR Code at Bottom Right (Default)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│                                                          │
│          [Content Image/Video/Text]                      │
│                                                          │
│                                                          │
│                                                          │
│                                                  ┌────┐  │
│                                                  │ QR │  │
│                                                  │CODE│  │
│                                                  └────┘  │
└──────────────────────────────────────────────────────────┘
```

### QR Code at Top Left

```
┌──────────────────────────────────────────────────────────┐
│  ┌────┐                                                   │
│  │ QR │                                                   │
│  │CODE│                                                   │
│  └────┘                                                   │
│                                                          │
│          [Content Image/Video/Text]                      │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### QR Code at Top Right

```
┌──────────────────────────────────────────────────────────┐
│                                                  ┌────┐  │
│                                                  │ QR │  │
│                                                  │CODE│  │
│                                                  └────┘  │
│                                                          │
│          [Content Image/Video/Text]                      │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### QR Code at Bottom Left

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│                                                          │
│          [Content Image/Video/Text]                      │
│                                                          │
│                                                          │
│                                                          │
│  ┌────┐                                                  │
│  │ QR │                                                  │
│  │CODE│                                                  │
│  └────┘                                                  │
└──────────────────────────────────────────────────────────┘
```

---

## QR Code Styling Recommendations (TV Display)

### Visual Properties

```
┌─────────────────────┐
│  ┌───────────────┐  │ ← Padding: 10px
│  │ ███  █  ████  │  │
│  │ █ █ ███  █ ██ │  │ ← QR Code: 150x150px
│  │  ███  █ ██  █ │  │
│  │ █  ██ █  ████ │  │
│  │ ████  ███  ██ │  │
│  └───────────────┘  │
└─────────────────────┘
   ↑
   Semi-transparent white background
   RGBA(255, 255, 255, 0.9)
```

### CSS Styling Example

```css
.qr-code-overlay {
  position: absolute;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.qr-code-overlay.top-left {
  top: 20px;
  left: 20px;
}

.qr-code-overlay.top-right {
  top: 20px;
  right: 20px;
}

.qr-code-overlay.bottom-left {
  bottom: 20px;
  left: 20px;
}

.qr-code-overlay.bottom-right {
  bottom: 20px;
  right: 20px;
}
```

---

## Mobile Scanning Experience

### Step 1: Viewer sees content on TV

```
    📺 TV Display
┌──────────────────┐
│                  │
│   [Content]      │
│                  │
│            [QR]  │
└──────────────────┘
```

### Step 2: Viewer scans with phone

```
    📱 Phone Camera
┌──────────────────┐
│  ┌────────────┐  │
│  │  Scanning  │  │
│  │    QR      │  │
│  │   Code     │  │
│  └────────────┘  │
│                  │
│  [Tap to open]   │
└──────────────────┘
```

### Step 3: Browser opens link

```
    📱 Phone Browser
┌──────────────────┐
│  ← Back          │
├──────────────────┤
│                  │
│  Event Details   │
│                  │
│  Friday Prayer   │
│  Time: 1:00 PM   │
│                  │
│  [Register]      │
│                  │
└──────────────────┘
```

---

## Admin Review Panel (To Be Implemented)

```
┌──────────────────────────────────────────────────────────────┐
│  Content Approval - Friday Prayer Announcement               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Title: Friday Prayer Announcement                          │
│  Type: Image                                                │
│  Submitted by: John Doe                                     │
│                                                              │
│  [Content Preview]                                          │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  🔲 QR Code Settings                                         │
│  ├─ Status: ☑️ Enabled                                       │
│  ├─ Position: Bottom Right                                  │
│  └─ URL: https://forms.google.com/event-registration        │
│            [🔗 Test URL] [⚠️ Security Check]                 │
│                                                              │
│  ⚠️ Custom URL detected. Please verify this link is safe    │
│     and appropriate for masjid audience.                    │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  [Reject] [Request Changes] [Approve]                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Color Scheme

### Light Mode (Default)

- **Background**: White with slight transparency
- **Border**: Light gray (#e0e0e0)
- **Text**: Dark gray (#333333)
- **Icons**: Primary color (teal #008080)
- **QR Code**: Black on white

### Dark Mode (If Applicable)

- **Background**: Dark gray with slight transparency
- **Border**: Medium gray (#555555)
- **Text**: Light gray (#f5f5f5)
- **Icons**: Teal accent
- **QR Code**: Black on white (always high contrast)

---

## Responsive Design

### Desktop (> 960px)

- Full width form
- QR settings in 2 columns where applicable
- Large, clear labels

### Tablet (600px - 960px)

- Stacked layout
- Full width inputs
- Maintained spacing

### Mobile (< 600px)

- Single column
- Touch-friendly controls
- Compact spacing

---

**Note**: All measurements are approximate and may be adjusted based on actual implementation and design system requirements.
