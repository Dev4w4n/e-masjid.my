# Text Overlay Feature - Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CreateContent Page                          │
│                 (apps/hub/src/pages/content/)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌──────────────────────────┐
    │   Content Type Tabs   │   │   Form Fields (Title,    │
    │   • Upload Image      │   │   Description, Masjid)   │
    │   • Create Text       │   │                          │
    └───────────────────────┘   └──────────────────────────┘
                │
                │
      ┌─────────┴──────────┐
      │                    │
      ▼                    ▼
┌──────────────┐    ┌────────────────────────────────────┐
│ Upload Mode  │    │ Text Overlay Mode                  │
│              │    │                                    │
│ • File input │    │  ┌──────────────────────────────┐ │
│ • Preview    │    │  │   TextOverlayEditor          │ │
│ • Remove     │    │  │                              │ │
└──────────────┘    │  │  ┌────────────────────────┐ │ │
                    │  │  │ Canvas Preview Area    │ │ │
                    │  │  │ (1920x1080)            │ │ │
                    │  │  └────────────────────────┘ │ │
                    │  │                              │ │
                    │  │  ┌────────────────────────┐ │ │
                    │  │  │ Text Settings          │ │ │
                    │  │  │ • Input field          │ │ │
                    │  │  │ • Font size slider     │ │ │
                    │  │  │ • Color selector       │ │ │
                    │  │  │ • Alignment buttons    │ │ │
                    │  │  │ • Font weight toggle   │ │ │
                    │  │  └────────────────────────┘ │ │
                    │  │                              │ │
                    │  │  ┌────────────────────────┐ │ │
                    │  │  │ Background Selector    │ │ │
                    │  │  │ • Category chips       │ │ │
                    │  │  │ • Template grid        │ │ │
                    │  │  └────────────────────────┘ │ │
                    │  │           │                  │ │
                    │  │           ▼                  │ │
                    │  │  ┌────────────────────────┐ │ │
                    │  │  │ backgrounds.ts         │ │ │
                    │  │  │ (8 templates)          │ │ │
                    │  │  └────────────────────────┘ │ │
                    │  └──────────────────────────────┘ │
                    └────────────────────────────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │ Generate Button            │
                    │ → Canvas.toBlob()          │
                    │ → Create File              │
                    │ → Set Preview              │
                    └────────────────────────────┘
                                  │
                                  │
            ┌─────────────────────┴─────────────────────┐
            │                                           │
            ▼                                           ▼
┌────────────────────────┐              ┌────────────────────────┐
│ Submit Handler         │              │ Supabase Upload        │
│ • Validate form        │──────────────▶│ • Create blob          │
│ • Check file/canvas    │              │ • Upload to storage    │
│ • Upload to Supabase   │              │ • Get public URL       │
│ • Insert to DB         │              │ • Return URL           │
└────────────────────────┘              └────────────────────────┘
            │                                           │
            └─────────────────────┬─────────────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │ display_content table      │
                    │ • type: 'image'            │
                    │ • url: 'https://...'       │
                    │ • status: 'pending'        │
                    └────────────────────────────┘
```

## Data Flow

```
User Input
    │
    ├─► Text Content ──────────────┐
    │                              │
    ├─► Background Selection ──────┤
    │                              │
    └─► Text Settings ─────────────┤
                                   │
                                   ▼
                        ┌──────────────────┐
                        │ Canvas Rendering │
                        │ (1920x1080 px)   │
                        └──────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐
            │ Draw BG  │   │ Draw Text│   │ Add FX   │
            │ (image/  │   │ (wrapped │   │ (shadow) │
            │ gradient)│   │ & styled)│   │          │
            └──────────┘   └──────────┘   └──────────┘
                    │              │              │
                    └──────────────┼──────────────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │  Canvas Preview  │
                        │ (real-time sync) │
                        └──────────────────┘
                                   │
                        User clicks "Use This Design"
                                   │
                                   ▼
                        ┌──────────────────┐
                        │ Canvas.toBlob()  │
                        │ → PNG Blob       │
                        └──────────────────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │ File Constructor │
                        │ text-design.png  │
                        └──────────────────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │ Supabase Storage │
                        │ Upload + Get URL │
                        └──────────────────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │ Database Insert  │
                        │ display_content  │
                        └──────────────────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │ Success Screen   │
                        │ & Reset Form     │
                        └──────────────────┘
```

## State Management

```
CreateContent Component
│
├─► formData (ContentFormData)
│   ├─ title: string
│   ├─ description: string
│   ├─ type: "image" | "youtube_video"
│   ├─ url: string
│   ├─ textContent: string (deprecated)
│   └─ masjid_id: string
│
├─► imageCreationMode: "upload" | "text-overlay"
│
├─► selectedFile: File | null
│   (for upload mode)
│
├─► generatedCanvas: HTMLCanvasElement | null
│   (for text overlay mode)
│
├─► imagePreview: string
│   (data URL for preview)
│
├─► loading: boolean
├─► uploading: boolean
└─► error: string

TextOverlayEditor Component
│
├─► text: string
│   (announcement content)
│
├─► selectedBackground: BackgroundTemplate
│   (from backgrounds.ts)
│
├─► fontSize: number (24-120)
│
├─► textColor: string
│   (#ffffff | #000000 | #ffd700 | #c0c0c0 | #008080)
│
├─► textAlign: "left" | "center" | "right"
│
├─► fontWeight: "normal" | "bold"
│
├─► backgroundImage: HTMLImageElement | null
│   (loaded background)
│
└─► activeCategory: "islamic" | "solid" | "gradient"
    (for filtering templates)
```

## File Dependencies

```
CreateContent.tsx
  │
  ├─► @mui/material (UI components)
  │   ├─ Box, Paper, Typography
  │   ├─ TextField, Button, Select
  │   ├─ Grid, Divider, Alert
  │   ├─ Tabs, Tab
  │   └─ CircularProgress
  │
  ├─► @mui/icons-material
  │   ├─ CloudUpload
  │   ├─ Send
  │   ├─ Image (ImageIcon)
  │   └─ TextFields
  │
  ├─► @masjid-suite/auth
  │   └─ useUser
  │
  ├─► @masjid-suite/supabase-client
  │   ├─ supabase (client)
  │   └─ masjidService
  │
  └─► ./components/content/TextOverlayEditor
      (new component)

TextOverlayEditor.tsx
  │
  ├─► @mui/material
  │   ├─ Box, Paper, Typography
  │   ├─ TextField, Button, Select
  │   ├─ Grid, Slider, Card
  │   ├─ ToggleButtonGroup, ToggleButton
  │   └─ Chip
  │
  ├─► @mui/icons-material
  │   ├─ FormatBold
  │   ├─ FormatAlignLeft
  │   ├─ FormatAlignCenter
  │   └─ FormatAlignRight
  │
  └─► ../../config/backgrounds
      ├─ BACKGROUND_TEMPLATES
      ├─ BackgroundTemplate
      └─ getBackgroundsByCategory

backgrounds.ts
  │
  └─► (no dependencies - pure config)
```

## Canvas Rendering Pipeline

```
Text Input → Canvas Context
              │
              ▼
    ┌─────────────────────┐
    │ ctx.clearRect()     │ ← Clear previous render
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Draw Background     │
    ├─────────────────────┤
    │ IF image:           │
    │   drawImage()       │
    │ ELSE IF gradient:   │
    │   createLinear      │
    │   Gradient()        │
    │ ELSE:               │
    │   fillRect()        │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Text Wrapping       │
    ├─────────────────────┤
    │ Split into words    │
    │ Measure each line   │
    │ Break at maxWidth   │
    │ Return lines[]      │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Calculate Position  │
    ├─────────────────────┤
    │ x = based on align  │
    │ y = vertical center │
    │ spacing = lineHeight│
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Apply Text Effects  │
    ├─────────────────────┤
    │ shadowColor         │
    │ shadowBlur          │
    │ shadowOffset        │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Draw Each Line      │
    ├─────────────────────┤
    │ FOR line in lines:  │
    │   fillText(line)    │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Preview Updated     │
    │ (instant feedback)  │
    └─────────────────────┘
```

---

**Legend:**

- `┌─┐ └─┘` = Component boundaries
- `│` = Data flow direction
- `▼` = Sequential step
- `→` = Direct dependency
- `├─┤` = Details/breakdown
