# @masjid-suite/i18n

Internationalization package for Open E Masjid, providing Bahasa Malaysia (primary) and English (fallback) translations.

## Features

- 🇲🇾 Bahasa Malaysia as primary language (per project requirements)
- 🇬🇧 English as fallback language
- 🕌 Islamic terminology for prayer times in Bahasa Malaysia
- ⚛️ React hooks for seamless integration
- 📅 Locale-aware date and time formatting
- 🔤 Type-safe translation keys

## Prayer Time Names

In Bahasa Malaysia, we use standard Islamic terminology:

| English | Bahasa Malaysia |
| ------- | --------------- |
| Fajr    | Subuh           |
| Sunrise | Syuruk          |
| Dhuhr   | Zohor           |
| Asr     | Asar            |
| Maghrib | Maghrib         |
| Isha    | Isyak           |

## Installation

This package is part of the monorepo workspace. It's automatically available to other packages.

```json
{
  "dependencies": {
    "@masjid-suite/i18n": "workspace:*"
  }
}
```

## Usage

### In React Components (Hub App)

```tsx
import { useTranslation, useUserLocale } from "@masjid-suite/i18n";

function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <h1>{t("prayer.times")}</h1>
      <p>{t("prayer.fajr")}: 05:30</p>
      <p>{t("prayer.dhuhr")}: 13:15</p>

      <button onClick={() => setLocale("ms")}>Bahasa Malaysia</button>
      <button onClick={() => setLocale("en")}>English</button>
    </div>
  );
}
```

### With User Profile

```tsx
import { useUserLocale } from "@masjid-suite/i18n";

function ProfileComponent({ user }) {
  const { t, locale } = useUserLocale(user.preferred_language);

  return (
    <div>
      <h2>{t("profile.title")}</h2>
      <p>Current locale: {locale}</p>
    </div>
  );
}
```

### In Non-React Code

```typescript
import {
  translate,
  getPrayerName,
  getAllPrayerNames,
} from "@masjid-suite/i18n";

// Simple translation
const title = translate("prayer.times", "ms"); // "Waktu Solat"

// Get a specific prayer name
const fajr = getPrayerName("fajr", "ms"); // "Subuh"

// Get all prayer names
const prayerNames = getAllPrayerNames("ms");
// {
//   fajr: "Subuh",
//   sunrise: "Syuruk",
//   dhuhr: "Zohor",
//   asr: "Asar",
//   maghrib: "Maghrib",
//   isha: "Isyak"
// }
```

### Date and Time Formatting

```typescript
import { formatDate, formatTime, formatDateTime } from "@masjid-suite/i18n";

const date = new Date();

const formattedDate = formatDate(date, "ms");
// "2 Oktober 2025"

const formattedTime = formatTime(date, "ms");
// "18:30"

const formattedDateTime = formatDateTime(date, "ms");
// "2 Oktober 2025, 18:30"
```

### Translation with Placeholders

```typescript
import { translate } from "@masjid-suite/i18n";

const message = translate("validation.min_length", "en", { min: 8 });
// "Minimum length is 8 characters"

const messageMalay = translate("validation.min_length", "ms", { min: 8 });
// "Panjang minimum ialah 8 aksara"
```

## Available Translation Keys

### Common

- `common.loading`, `common.error`, `common.success`
- `common.save`, `common.cancel`, `common.delete`, `common.edit`
- `common.submit`, `common.back`, `common.next`, `common.search`

### Prayer

- `prayer.times`, `prayer.schedule`, `prayer.current`, `prayer.next`
- `prayer.fajr`, `prayer.sunrise`, `prayer.dhuhr`
- `prayer.asr`, `prayer.maghrib`, `prayer.isha`

### Masjid

- `masjid.name`, `masjid.location`, `masjid.address`
- `masjid.facilities`, `masjid.events`

### Content

- `content.title`, `content.create`, `content.upload`
- `content.pending`, `content.approved`, `content.rejected`

### Profile

- `profile.title`, `profile.edit`, `profile.name`
- `profile.email`, `profile.phone`, `profile.language`

### Admin

- `admin.dashboard`, `admin.approvals`, `admin.users`
- `admin.content_management`, `admin.display_management`

### Auth

- `auth.login`, `auth.logout`, `auth.register`
- `auth.email`, `auth.password`

### Messages

- `messages.save_success`, `messages.save_error`
- `messages.delete_success`, `messages.update_success`

See [src/locales/en.ts](./src/locales/en.ts) for the complete list.

## Adding New Translations

1. Add the key to `src/locales/en.ts`:

```typescript
export const en = {
  // ... existing translations
  newSection: {
    newKey: "New English Text",
  },
};
```

2. Add the same structure to `src/locales/ms.ts`:

```typescript
export const ms: TranslationKeys = {
  // ... existing translations
  newSection: {
    newKey: "Teks Bahasa Malaysia Baru",
  },
};
```

3. Use the new translation:

```typescript
const text = t("newSection.newKey");
```

## Type Safety

All translation keys are type-checked. TypeScript will error if you try to use a non-existent key:

```typescript
t("invalid.key"); // ❌ TypeScript error
t("prayer.fajr"); // ✅ Valid
```

## Default Locale

The default locale is **Bahasa Malaysia (`ms`)** as per project requirements. English is used as a fallback when:

- A translation is missing
- An error occurs during translation
- Explicitly specified

## Testing

```bash
pnpm test
```

## License

MIT
