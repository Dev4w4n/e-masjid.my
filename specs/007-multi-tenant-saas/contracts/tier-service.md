# API Contracts: Tier Management Service

**Service**: `packages/tier-management/src/services/TierService.ts`  
**Purpose**: Tier feature validation, access control, tier feature matrix

---

## 1. Get Tier Features

### Request

```typescript
interface GetTierFeaturesRequest {
  tier: "rakyat" | "pro" | "premium";
}

interface GetTierFeaturesResponse {
  success: boolean;
  tier: "rakyat" | "pro" | "premium";
  features: {
    unlimited_tv_displays: boolean;
    custom_branding: boolean;
    smart_scheduling: boolean;
    data_export: boolean;
    private_database: boolean;
    whatsapp_support: boolean;
    local_admin_service: boolean;
  };
  pricing: {
    monthly_price: number; // In MYR (0.00, 30.00, 300-500)
    setup_fee: number; // One-time fee (0 for all tiers)
  };
}
```

### Example

```typescript
// Rakyat (Free) Tier
const rakyatRequest: GetTierFeaturesRequest = { tier: "rakyat" };
const rakyatResponse: GetTierFeaturesResponse = {
  success: true,
  tier: "rakyat",
  features: {
    unlimited_tv_displays: true,
    custom_branding: false,
    smart_scheduling: false,
    data_export: false,
    private_database: false,
    whatsapp_support: false,
    local_admin_service: false,
  },
  pricing: {
    monthly_price: 0.0,
    setup_fee: 0.0,
  },
};

// Pro Tier
const proRequest: GetTierFeaturesRequest = { tier: "pro" };
const proResponse: GetTierFeaturesResponse = {
  success: true,
  tier: "pro",
  features: {
    unlimited_tv_displays: true,
    custom_branding: true, // Custom logo and colors
    smart_scheduling: true, // Time-based automation
    data_export: true, // PDF/Excel reports
    private_database: false,
    whatsapp_support: false,
    local_admin_service: false,
  },
  pricing: {
    monthly_price: 30.0,
    setup_fee: 0.0,
  },
};

// Premium Tier
const premiumRequest: GetTierFeaturesRequest = { tier: "premium" };
const premiumResponse: GetTierFeaturesResponse = {
  success: true,
  tier: "premium",
  features: {
    unlimited_tv_displays: true,
    custom_branding: true,
    smart_scheduling: true,
    data_export: true,
    private_database: true, // Isolated Supabase instance
    whatsapp_support: true, // 1-hour response during business hours
    local_admin_service: true, // Dedicated Local Admin
  },
  pricing: {
    monthly_price: 300.0, // Can vary 300-500
    setup_fee: 0.0,
  },
};
```

---

## 2. Check Feature Access

### Request

```typescript
interface CheckFeatureAccessRequest {
  masjidId: string; // UUID
  feature:
    | "custom_branding"
    | "smart_scheduling"
    | "data_export"
    | "private_database"
    | "whatsapp_support"
    | "local_admin_service";
}

interface CheckFeatureAccessResponse {
  success: boolean;
  masjid_id: string;
  current_tier: "rakyat" | "pro" | "premium";
  feature: string;
  has_access: boolean;
  reason?: string; // Explanation if has_access = false
  upgrade_required?: "pro" | "premium"; // Which tier unlocks feature
}
```

### Example

```typescript
// Rakyat tier trying to access custom branding
const request1: CheckFeatureAccessRequest = {
  masjidId: "11111111-1111-1111-1111-111111111111",
  feature: "custom_branding",
};

const response1: CheckFeatureAccessResponse = {
  success: true,
  masjid_id: "11111111-1111-1111-1111-111111111111",
  current_tier: "rakyat",
  feature: "custom_branding",
  has_access: false,
  reason: "Custom branding is not available on Rakyat tier",
  upgrade_required: "pro",
};

// Pro tier accessing custom branding
const request2: CheckFeatureAccessRequest = {
  masjidId: "22222222-2222-2222-2222-222222222222",
  feature: "custom_branding",
};

const response2: CheckFeatureAccessResponse = {
  success: true,
  masjid_id: "22222222-2222-2222-2222-222222222222",
  current_tier: "pro",
  feature: "custom_branding",
  has_access: true,
};

// Pro tier trying to access private database
const request3: CheckFeatureAccessRequest = {
  masjidId: "22222222-2222-2222-2222-222222222222",
  feature: "private_database",
};

const response3: CheckFeatureAccessResponse = {
  success: true,
  masjid_id: "22222222-2222-2222-2222-222222222222",
  current_tier: "pro",
  feature: "private_database",
  has_access: false,
  reason: "Private database is only available on Premium tier",
  upgrade_required: "premium",
};
```

---

## 3. Validate Tier Constraint

### Request

```typescript
interface ValidateTierConstraintRequest {
  masjidId: string;
  action:
    | "create_display"
    | "upload_custom_logo"
    | "create_schedule"
    | "export_data";
}

interface ValidateTierConstraintResponse {
  success: boolean;
  masjid_id: string;
  current_tier: "rakyat" | "pro" | "premium";
  action: string;
  is_allowed: boolean;
  constraint_violated?: string; // Explanation if not allowed
  upgrade_suggestion?: string; // Which tier to upgrade to
}
```

### Example

```typescript
// Rakyat tier creating unlimited displays (ALLOWED)
const request1: ValidateTierConstraintRequest = {
  masjidId: "11111111-1111-1111-1111-111111111111",
  action: "create_display",
};

const response1: ValidateTierConstraintResponse = {
  success: true,
  masjid_id: "11111111-1111-1111-1111-111111111111",
  current_tier: "rakyat",
  action: "create_display",
  is_allowed: true, // FR-017: Unlimited TV displays
};

// Rakyat tier uploading custom logo (NOT ALLOWED)
const request2: ValidateTierConstraintRequest = {
  masjidId: "11111111-1111-1111-1111-111111111111",
  action: "upload_custom_logo",
};

const response2: ValidateTierConstraintResponse = {
  success: true,
  masjid_id: "11111111-1111-1111-1111-111111111111",
  current_tier: "rakyat",
  action: "upload_custom_logo",
  is_allowed: false,
  constraint_violated:
    "Custom branding is not available on Rakyat tier. Displays must show 'Powered by e-Masjid' watermark.",
  upgrade_suggestion:
    "Upgrade to Pro tier (RM30/month) to unlock custom branding",
};

// Rakyat tier creating schedule (NOT ALLOWED)
const request3: ValidateTierConstraintRequest = {
  masjidId: "11111111-1111-1111-1111-111111111111",
  action: "create_schedule",
};

const response3: ValidateTierConstraintResponse = {
  success: true,
  masjid_id: "11111111-1111-1111-1111-111111111111",
  current_tier: "rakyat",
  action: "create_schedule",
  is_allowed: false,
  constraint_violated: "Smart scheduling is not available on Rakyat tier",
  upgrade_suggestion:
    "Upgrade to Pro tier (RM30/month) to unlock smart scheduling",
};
```

---

## 4. Get Tier Comparison Matrix

### Request

```typescript
interface GetTierComparisonRequest {}

interface GetTierComparisonResponse {
  success: boolean;
  tiers: Array<{
    tier: "rakyat" | "pro" | "premium";
    name: {
      en: string;
      ms: string; // Bahasa Malaysia
    };
    tagline: {
      en: string;
      ms: string;
    };
    price: {
      monthly: number; // In MYR
      display: string; // "Free Forever", "RM30/month", "RM300-500/month"
    };
    features: Array<{
      name: {
        en: string;
        ms: string;
      };
      description: {
        en: string;
        ms: string;
      };
      included: boolean;
      highlighted?: boolean; // Key differentiator
    }>;
  }>;
}
```

### Example

```typescript
const request: GetTierComparisonRequest = {};

const response: GetTierComparisonResponse = {
  success: true,
  tiers: [
    {
      tier: "rakyat",
      name: {
        en: "Rakyat (Free)",
        ms: "Rakyat (Percuma)",
      },
      tagline: {
        en: "Perfect for getting started",
        ms: "Sesuai untuk bermula",
      },
      price: {
        monthly: 0.0,
        display: "Free Forever",
      },
      features: [
        {
          name: { en: "Unlimited TV Displays", ms: "Paparan TV Tanpa Had" },
          description: {
            en: "Create as many displays as you need",
            ms: "Cipta paparan sebanyak yang anda perlukan",
          },
          included: true,
          highlighted: true,
        },
        {
          name: { en: "DIY Content Management", ms: "Urus Kandungan Sendiri" },
          description: {
            en: "Manage all content yourself",
            ms: "Urus semua kandungan sendiri",
          },
          included: true,
        },
        {
          name: {
            en: "Powered by e-Masjid Branding",
            ms: "Jenama 'Powered by e-Masjid'",
          },
          description: {
            en: "Mandatory watermark on all displays",
            ms: "Tera air wajib pada semua paparan",
          },
          included: true,
        },
        {
          name: { en: "Custom Branding", ms: "Jenama Khas" },
          description: {
            en: "Upload custom logo and colors",
            ms: "Muat naik logo dan warna khas",
          },
          included: false,
        },
        {
          name: { en: "Smart Scheduling", ms: "Penjadualan Pintar" },
          description: {
            en: "Automated content scheduling",
            ms: "Penjadualan kandungan automatik",
          },
          included: false,
        },
      ],
    },
    {
      tier: "pro",
      name: {
        en: "Pro",
        ms: "Pro",
      },
      tagline: {
        en: "Professional features for modern mosques",
        ms: "Ciri profesional untuk masjid moden",
      },
      price: {
        monthly: 30.0,
        display: "RM30/month",
      },
      features: [
        {
          name: { en: "Everything in Rakyat", ms: "Semua dalam Rakyat" },
          description: {
            en: "Includes all free tier features",
            ms: "Termasuk semua ciri percuma",
          },
          included: true,
        },
        {
          name: { en: "Custom Branding", ms: "Jenama Khas" },
          description: {
            en: "Upload custom logo and set brand colors",
            ms: "Muat naik logo khas dan tetapkan warna jenama",
          },
          included: true,
          highlighted: true,
        },
        {
          name: { en: "Smart Scheduling", ms: "Penjadualan Pintar" },
          description: {
            en: "Automate content based on time and events",
            ms: "Automatikkan kandungan berdasarkan masa dan acara",
          },
          included: true,
          highlighted: true,
        },
        {
          name: { en: "Data Export", ms: "Eksport Data" },
          description: {
            en: "Generate PDF/Excel reports for audits",
            ms: "Jana laporan PDF/Excel untuk audit",
          },
          included: true,
        },
        {
          name: { en: "Private Database", ms: "Pangkalan Data Peribadi" },
          description: {
            en: "Isolated database for maximum security",
            ms: "Pangkalan data terpencil untuk keselamatan maksimum",
          },
          included: false,
        },
      ],
    },
    {
      tier: "premium",
      name: {
        en: "Premium",
        ms: "Premium",
      },
      tagline: {
        en: "Enterprise-grade service with dedicated support",
        ms: "Perkhidmatan gred perusahaan dengan sokongan khusus",
      },
      price: {
        monthly: 300.0,
        display: "RM300-500/month",
      },
      features: [
        {
          name: { en: "Everything in Pro", ms: "Semua dalam Pro" },
          description: {
            en: "Includes all Pro tier features",
            ms: "Termasuk semua ciri Pro",
          },
          included: true,
        },
        {
          name: { en: "Private Database", ms: "Pangkalan Data Peribadi" },
          description: {
            en: "Isolated Supabase instance for your masjid only",
            ms: "Pangkalan data Supabase terpencil untuk masjid anda sahaja",
          },
          included: true,
          highlighted: true,
        },
        {
          name: { en: "WhatsApp Support", ms: "Sokongan WhatsApp" },
          description: {
            en: "1-hour response during business hours",
            ms: "Respons 1 jam semasa waktu perniagaan",
          },
          included: true,
          highlighted: true,
        },
        {
          name: { en: "Dedicated Local Admin", ms: "Local Admin Khusus" },
          description: {
            en: "Personal assistant for content creation and management",
            ms: "Pembantu peribadi untuk penciptaan dan pengurusan kandungan",
          },
          included: true,
          highlighted: true,
        },
      ],
    },
  ],
};
```

---

## 5. Get Soft-Lock Feature State

### Request

```typescript
interface GetSoftLockFeatureStateRequest {
  masjidId: string;
}

interface GetSoftLockFeatureStateResponse {
  success: boolean;
  masjid_id: string;
  subscription_status: "active" | "grace-period" | "soft-locked" | "cancelled";
  features: {
    custom_branding: {
      available: boolean;
      reason?: string; // "Soft-locked: Rakyat branding re-enabled"
    };
    smart_scheduling: {
      available: boolean;
      reason?: string; // "Soft-locked: Scheduling disabled"
    };
    data_export: {
      available: boolean;
      reason?: string; // "Soft-locked: Export disabled"
    };
    private_database: {
      available: boolean;
      reason?: string; // "Data preserved on private database"
    };
  };
}
```

### Example

```typescript
// Active subscription
const request1: GetSoftLockFeatureStateRequest = {
  masjidId: "22222222-2222-2222-2222-222222222222",
};

const response1: GetSoftLockFeatureStateResponse = {
  success: true,
  masjid_id: "22222222-2222-2222-2222-222222222222",
  subscription_status: "active",
  features: {
    custom_branding: { available: true },
    smart_scheduling: { available: true },
    data_export: { available: true },
    private_database: { available: false },
  },
};

// Soft-locked Pro subscription (FR-055)
const request2: GetSoftLockFeatureStateRequest = {
  masjidId: "22222222-2222-2222-2222-222222222222",
};

const response2: GetSoftLockFeatureStateResponse = {
  success: true,
  masjid_id: "22222222-2222-2222-2222-222222222222",
  subscription_status: "soft-locked",
  features: {
    custom_branding: {
      available: false,
      reason: "Soft-locked: 'Powered by e-Masjid' branding re-enabled",
    },
    smart_scheduling: {
      available: false,
      reason: "Soft-locked: Smart scheduling disabled until payment",
    },
    data_export: {
      available: false,
      reason: "Soft-locked: Data export disabled until payment",
    },
    private_database: {
      available: false,
      reason: "Pro tier does not include private database",
    },
  },
};

// Soft-locked Premium subscription (FR-057)
const request3: GetSoftLockFeatureStateRequest = {
  masjidId: "33333333-3333-3333-3333-333333333333",
};

const response3: GetSoftLockFeatureStateResponse = {
  success: true,
  masjid_id: "33333333-3333-3333-3333-333333333333",
  subscription_status: "soft-locked",
  features: {
    custom_branding: {
      available: false,
      reason: "Soft-locked: Rakyat branding re-enabled",
    },
    smart_scheduling: {
      available: false,
      reason: "Soft-locked: Scheduling disabled",
    },
    data_export: {
      available: false,
      reason: "Soft-locked: Export disabled",
    },
    private_database: {
      available: true, // FR-057: Data remains on private DB indefinitely
      reason: "Data preserved on private database (read-only during soft-lock)",
    },
  },
};
```

---

## 6. Error Responses

### Common Error Codes

```typescript
interface TierErrorResponse {
  success: false;
  errorCode:
    | "MASJID_NOT_FOUND" // Invalid masjid ID
    | "SUBSCRIPTION_NOT_FOUND" // No active subscription
    | "INVALID_TIER" // Tier not in [rakyat, pro, premium]
    | "FEATURE_NOT_RECOGNIZED"; // Unknown feature name
  errorMessage: string;
}
```

---

## 7. Summary

**Endpoints**:

- `GET /api/tier/features/:tier` - Get features for specific tier
- `POST /api/tier/check-access` - Check if masjid has access to feature
- `POST /api/tier/validate-constraint` - Validate if action is allowed
- `GET /api/tier/comparison` - Get full tier comparison matrix
- `GET /api/tier/soft-lock-state/:masjidId` - Get feature availability during soft-lock

**Tier Feature Matrix**:

| Feature                | Rakyat | Pro | Premium |
| ---------------------- | ------ | --- | ------- |
| Unlimited TV Displays  | ✅     | ✅  | ✅      |
| DIY Content Management | ✅     | ✅  | ✅      |
| Custom Branding        | ❌     | ✅  | ✅      |
| Smart Scheduling       | ❌     | ✅  | ✅      |
| Data Export            | ❌     | ✅  | ✅      |
| Private Database       | ❌     | ❌  | ✅      |
| WhatsApp Support       | ❌     | ❌  | ✅      |
| Dedicated Local Admin  | ❌     | ❌  | ✅      |
| Powered by e-Masjid    | ✅     | ❌  | ❌      |

**Soft-Lock Behavior**:

- Pro tier: Custom branding → Rakyat branding, scheduling disabled, export disabled, data preserved
- Premium tier: Same as Pro + data remains on private DB indefinitely (FR-057a)
