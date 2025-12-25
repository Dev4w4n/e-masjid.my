# API Contracts: Subscription Service

**Service**: `packages/subscription-management/src/services/SubscriptionService.ts`  
**Purpose**: Manage subscription lifecycle, tier changes, grace periods, soft-lock states

---

## 1. Create Subscription

### Request

```typescript
interface CreateSubscriptionRequest {
  masjidId: string; // UUID
  tier: "rakyat" | "pro" | "premium";
  billing_contact_name: string;
  billing_email: string;
  billing_phone: string;
}

interface CreateSubscriptionResponse {
  success: boolean;
  subscription: {
    id: string; // UUID
    masjid_id: string;
    tier: "rakyat" | "pro" | "premium";
    status: "active" | "pending_payment";
    price: number; // 0.00 for rakyat, 30.00 for pro, 300-500 for premium
    next_billing_date: string | null; // ISO 8601 date (null for rakyat)
    payment_url?: string; // ToyyibPay payment URL (for pro/premium)
  };
  errorMessage?: string;
}
```

### Example

```typescript
// Rakyat (Free) Tier
const rakyatRequest: CreateSubscriptionRequest = {
  masjidId: "11111111-1111-1111-1111-111111111111",
  tier: "rakyat",
  billing_contact_name: "Ahmad bin Abdullah",
  billing_email: "ahmad@masjid-al-falah.my",
  billing_phone: "0123456789",
};

const rakyatResponse: CreateSubscriptionResponse = {
  success: true,
  subscription: {
    id: "sub_550e8400-e29b-41d4-a716",
    masjid_id: "11111111-1111-1111-1111-111111111111",
    tier: "rakyat",
    status: "active", // Immediate activation
    price: 0.0,
    next_billing_date: null, // Free tier has no billing
  },
};

// Pro Tier (Requires Payment)
const proRequest: CreateSubscriptionRequest = {
  masjidId: "22222222-2222-2222-2222-222222222222",
  tier: "pro",
  billing_contact_name: "Fatimah binti Hassan",
  billing_email: "fatimah@masjid-ar-rahman.my",
  billing_phone: "0198765432",
};

const proResponse: CreateSubscriptionResponse = {
  success: true,
  subscription: {
    id: "sub_660e9511-f3ac-52e5-b827",
    masjid_id: "22222222-2222-2222-2222-222222222222",
    tier: "pro",
    status: "pending_payment", // Requires payment first
    price: 30.0,
    next_billing_date: "2025-01-24", // 1 month from creation
    payment_url: "https://toyyibpay.com/abc123xyz",
  },
};
```

---

## 2. Get Subscription

### Request

```typescript
interface GetSubscriptionRequest {
  subscriptionId?: string; // UUID (optional)
  masjidId?: string; // UUID (optional)
}

interface GetSubscriptionResponse {
  success: boolean;
  subscription: {
    id: string;
    masjid_id: string;
    tier: "rakyat" | "pro" | "premium";
    status: "active" | "grace-period" | "soft-locked" | "cancelled";
    price: number;

    // Billing dates
    next_billing_date: string | null; // ISO 8601 date
    current_period_start: string;
    current_period_end: string;

    // Grace period (if applicable)
    grace_period_start: string | null;
    grace_period_end: string | null;
    failed_payment_attempts: number;

    // Soft-lock (if applicable)
    soft_locked_at: string | null;
    soft_lock_reason: string | null;
  };
  errorMessage?: string;
}
```

### Example

```typescript
const request: GetSubscriptionRequest = {
  masjidId: "22222222-2222-2222-2222-222222222222",
};

// Active subscription
const activeResponse: GetSubscriptionResponse = {
  success: true,
  subscription: {
    id: "sub_660e9511-f3ac-52e5-b827",
    masjid_id: "22222222-2222-2222-2222-222222222222",
    tier: "pro",
    status: "active",
    price: 30.0,
    next_billing_date: "2025-01-24",
    current_period_start: "2024-12-24",
    current_period_end: "2025-01-23",
    grace_period_start: null,
    grace_period_end: null,
    failed_payment_attempts: 0,
    soft_locked_at: null,
    soft_lock_reason: null,
  },
};

// Grace period subscription
const gracePeriodResponse: GetSubscriptionResponse = {
  success: true,
  subscription: {
    id: "sub_660e9511-f3ac-52e5-b827",
    masjid_id: "22222222-2222-2222-2222-222222222222",
    tier: "pro",
    status: "grace-period",
    price: 30.0,
    next_billing_date: "2025-01-24",
    current_period_start: "2024-12-24",
    current_period_end: "2025-01-23",
    grace_period_start: "2025-01-24T00:00:00+08:00",
    grace_period_end: "2025-02-07T23:59:59+08:00", // 14 days later
    failed_payment_attempts: 1,
    soft_locked_at: null,
    soft_lock_reason: null,
  },
};

// Soft-locked subscription
const softLockedResponse: GetSubscriptionResponse = {
  success: true,
  subscription: {
    id: "sub_660e9511-f3ac-52e5-b827",
    masjid_id: "22222222-2222-2222-2222-222222222222",
    tier: "pro",
    status: "soft-locked",
    price: 30.0,
    next_billing_date: null, // Billing suspended
    current_period_start: "2024-12-24",
    current_period_end: "2025-01-23",
    grace_period_start: "2025-01-24T00:00:00+08:00",
    grace_period_end: "2025-02-07T23:59:59+08:00",
    failed_payment_attempts: 1,
    soft_locked_at: "2025-02-07T23:59:59+08:00",
    soft_lock_reason: "Grace period expired without payment",
  },
};
```

---

## 3. Upgrade/Downgrade Subscription

### Request

```typescript
interface ChangeSubscriptionTierRequest {
  subscriptionId: string; // UUID
  newTier: "rakyat" | "pro" | "premium";
  prorated?: boolean; // Default true (prorate first payment)
}

interface ChangeSubscriptionTierResponse {
  success: boolean;
  subscription: {
    id: string;
    tier: "rakyat" | "pro" | "premium";
    status: "active" | "pending_payment";
    price: number;
    next_billing_date: string | null;
    prorated_amount?: number; // First payment amount (if prorated)
    payment_url?: string; // ToyyibPay URL (if upgrading to paid tier)
  };
  errorMessage?: string;
}
```

### Example

```typescript
// Upgrade from Rakyat to Pro mid-month
const upgradeRequest: ChangeSubscriptionTierRequest = {
  subscriptionId: "sub_550e8400-e29b-41d4-a716",
  newTier: "pro",
  prorated: true,
};

const upgradeResponse: ChangeSubscriptionTierResponse = {
  success: true,
  subscription: {
    id: "sub_550e8400-e29b-41d4-a716",
    tier: "pro",
    status: "pending_payment",
    price: 30.0,
    next_billing_date: "2025-02-01", // Next month start
    prorated_amount: 15.0, // 15 days remaining * RM1/day
    payment_url: "https://toyyibpay.com/xyz789abc",
  },
};

// Downgrade from Pro to Rakyat (immediate)
const downgradeRequest: ChangeSubscriptionTierRequest = {
  subscriptionId: "sub_660e9511-f3ac-52e5-b827",
  newTier: "rakyat",
};

const downgradeResponse: ChangeSubscriptionTierResponse = {
  success: true,
  subscription: {
    id: "sub_660e9511-f3ac-52e5-b827",
    tier: "rakyat",
    status: "active", // Immediate activation
    price: 0.0,
    next_billing_date: null,
  },
};
```

---

## 4. Cancel Subscription

### Request

```typescript
interface CancelSubscriptionRequest {
  subscriptionId: string;
  reason?: string; // Optional cancellation reason
  effective_date?: "immediate" | "end_of_period"; // Default: immediate
}

interface CancelSubscriptionResponse {
  success: boolean;
  subscription: {
    id: string;
    status: "cancelled";
    cancelled_at: string; // ISO 8601 timestamp
    cancelled_reason?: string;
    access_until?: string; // ISO 8601 date (if end_of_period)
  };
  errorMessage?: string;
}
```

### Example

```typescript
const request: CancelSubscriptionRequest = {
  subscriptionId: "sub_660e9511-f3ac-52e5-b827",
  reason: "Switching to competitor",
  effective_date: "end_of_period",
};

const response: CancelSubscriptionResponse = {
  success: true,
  subscription: {
    id: "sub_660e9511-f3ac-52e5-b827",
    status: "cancelled",
    cancelled_at: "2025-12-24T15:30:00+08:00",
    cancelled_reason: "Switching to competitor",
    access_until: "2025-01-23", // End of current billing period
  },
};
```

---

## 5. Trigger Grace Period

### Request

```typescript
interface TriggerGracePeriodRequest {
  subscriptionId: string;
  failureReason: string; // Payment failure reason
}

interface TriggerGracePeriodResponse {
  success: boolean;
  subscription: {
    id: string;
    status: "grace-period";
    grace_period_start: string; // ISO 8601 timestamp
    grace_period_end: string; // ISO 8601 timestamp (14 days later)
    failed_payment_attempts: number;
    retry_payment_url: string; // ToyyibPay URL for retry
  };
  errorMessage?: string;
}
```

### Example

```typescript
const request: TriggerGracePeriodRequest = {
  subscriptionId: "sub_660e9511-f3ac-52e5-b827",
  failureReason: "Insufficient funds",
};

const response: TriggerGracePeriodResponse = {
  success: true,
  subscription: {
    id: "sub_660e9511-f3ac-52e5-b827",
    status: "grace-period",
    grace_period_start: "2025-12-24T00:00:00+08:00",
    grace_period_end: "2026-01-07T23:59:59+08:00", // 14 days later
    failed_payment_attempts: 1,
    retry_payment_url: "https://toyyibpay.com/retry-abc123xyz",
  },
};
```

---

## 6. Trigger Soft-Lock

### Request

```typescript
interface TriggerSoftLockRequest {
  subscriptionId: string;
  reason: string; // "Grace period expired"
}

interface TriggerSoftLockResponse {
  success: boolean;
  subscription: {
    id: string;
    status: "soft-locked";
    soft_locked_at: string; // ISO 8601 timestamp
    soft_lock_reason: string;
    features_disabled: string[]; // ["custom_branding", "scheduling", "data_export"]
    data_preserved: boolean; // true
  };
  errorMessage?: string;
}
```

### Example

```typescript
const request: TriggerSoftLockRequest = {
  subscriptionId: "sub_660e9511-f3ac-52e5-b827",
  reason: "Grace period expired without payment",
};

const response: TriggerSoftLockResponse = {
  success: true,
  subscription: {
    id: "sub_660e9511-f3ac-52e5-b827",
    status: "soft-locked",
    soft_locked_at: "2026-01-07T23:59:59+08:00",
    soft_lock_reason: "Grace period expired without payment",
    features_disabled: ["custom_branding", "scheduling", "data_export"],
    data_preserved: true,
  },
};
```

---

## 7. Reactivate Subscription (from Soft-Lock)

### Request

```typescript
interface ReactivateSubscriptionRequest {
  subscriptionId: string;
  paymentDetails: {
    refno: string; // ToyyibPay payment reference
    amount: number;
    paid_at: string; // ISO 8601 timestamp
  };
}

interface ReactivateSubscriptionResponse {
  success: boolean;
  subscription: {
    id: string;
    status: "active";
    tier: "rakyat" | "pro" | "premium";
    next_billing_date: string; // ISO 8601 date
    features_restored: string[]; // ["custom_branding", "scheduling", "data_export"]
  };
  errorMessage?: string;
}
```

### Example

```typescript
const request: ReactivateSubscriptionRequest = {
  subscriptionId: "sub_660e9511-f3ac-52e5-b827",
  paymentDetails: {
    refno: "TP241225000010",
    amount: 3000, // RM30.00
    paid_at: "2026-01-10T14:00:00+08:00",
  },
};

const response: ReactivateSubscriptionResponse = {
  success: true,
  subscription: {
    id: "sub_660e9511-f3ac-52e5-b827",
    status: "active",
    tier: "pro",
    next_billing_date: "2026-02-10",
    features_restored: ["custom_branding", "scheduling", "data_export"],
  },
};
```

---

## 8. List Subscriptions (Admin)

### Request

```typescript
interface ListSubscriptionsRequest {
  status?: "active" | "grace-period" | "soft-locked" | "cancelled"; // Filter by status
  tier?: "rakyat" | "pro" | "premium"; // Filter by tier
  limit?: number; // Default 50
  offset?: number; // Pagination
}

interface ListSubscriptionsResponse {
  success: boolean;
  subscriptions: Array<{
    id: string;
    masjid_id: string;
    masjid_name: string;
    tier: "rakyat" | "pro" | "premium";
    status: "active" | "grace-period" | "soft-locked" | "cancelled";
    next_billing_date: string | null;
    created_at: string;
  }>;
  total_count: number;
  errorMessage?: string;
}
```

### Example

```typescript
const request: ListSubscriptionsRequest = {
  status: "grace-period",
  limit: 10,
  offset: 0,
};

const response: ListSubscriptionsResponse = {
  success: true,
  subscriptions: [
    {
      id: "sub_660e9511-f3ac-52e5-b827",
      masjid_id: "22222222-2222-2222-2222-222222222222",
      masjid_name: "Masjid Ar-Rahman",
      tier: "pro",
      status: "grace-period",
      next_billing_date: "2025-01-24",
      created_at: "2024-12-24T10:00:00+08:00",
    },
    // ... more subscriptions
  ],
  total_count: 45,
};
```

---

## 9. Error Responses

### Common Error Codes

```typescript
interface SubscriptionErrorResponse {
  success: false;
  errorCode:
    | "SUBSCRIPTION_NOT_FOUND" // Subscription ID invalid
    | "MASJID_ALREADY_HAS_SUBSCRIPTION" // Duplicate subscription
    | "INVALID_TIER" // Tier not in [rakyat, pro, premium]
    | "INVALID_TIER_CHANGE" // Cannot downgrade Premium to Pro directly
    | "PAYMENT_REQUIRED" // Pro/Premium tier requires payment
    | "GRACE_PERIOD_ACTIVE" // Cannot cancel during grace period
    | "ALREADY_SOFT_LOCKED"; // Already in soft-lock state
  errorMessage: string;
}
```

---

## 10. Summary

**Endpoints**:

- `POST /api/subscription/create` - Create subscription
- `GET /api/subscription/:id` - Get subscription by ID
- `GET /api/subscription/masjid/:masjidId` - Get subscription by masjid ID
- `PUT /api/subscription/:id/change-tier` - Upgrade/downgrade tier
- `POST /api/subscription/:id/cancel` - Cancel subscription
- `POST /api/subscription/:id/grace-period` - Trigger grace period
- `POST /api/subscription/:id/soft-lock` - Trigger soft-lock
- `POST /api/subscription/:id/reactivate` - Reactivate from soft-lock
- `GET /api/subscription/list` - List all subscriptions (admin only)

**Business Logic**:

- Rakyat tier: Immediate activation, no billing
- Pro/Premium tier: Payment required, 14-day grace period after failure
- Soft-lock: Features disabled, data preserved indefinitely
