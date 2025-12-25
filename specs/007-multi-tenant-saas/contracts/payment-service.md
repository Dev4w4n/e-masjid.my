# API Contracts: Payment Service

**Service**: `packages/subscription-management/src/services/PaymentService.ts`  
**Integration**: ToyyibPay Payment Gateway

---

## 1. ToyyibPay Bill Creation

### Request

```typescript
interface CreateBillRequest {
  // Authentication
  userSecretKey: string; // ToyyibPay API key (from environment)
  categoryCode: string; // ToyyibPay billing category

  // Bill details
  billName: string; // e.g., "Subscription - Pro Tier"
  billDescription: string; // e.g., "Monthly subscription for Masjid Al-Falah"
  billPriceSetting: 0; // Fixed amount (0 = fixed, 1 = dynamic)
  billAmount: number; // In cents (RM30.00 = 3000)

  // Customer details
  billTo: string; // Customer name
  billEmail: string; // Payment notification email
  billPhone: string; // Contact phone

  // Webhook configuration
  billCallbackUrl: string; // Webhook endpoint URL
  billReturnUrl: string; // Redirect after payment

  // Metadata
  billExternalReferenceNo: string; // subscription_id for tracking
  billExpiryDays: number; // 14 days for payment window
}

interface CreateBillResponse {
  success: boolean;
  billCode: string; // Bill identifier (e.g., "abc123xyz")
  billPaymentUrl: string; // Payment page URL
  errorMessage?: string;
}
```

### Example

```typescript
const billRequest: CreateBillRequest = {
  userSecretKey: process.env.TOYYIBPAY_SECRET_KEY,
  categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE,
  billName: "Subscription - Pro Tier",
  billDescription: "Monthly subscription for Masjid Al-Falah",
  billPriceSetting: 0,
  billAmount: 3000, // RM30.00
  billTo: "Ahmad bin Abdullah",
  billEmail: "ahmad@masjid-al-falah.my",
  billPhone: "0123456789",
  billCallbackUrl: "https://emasjid.my/api/payment/webhook",
  billReturnUrl: "https://emasjid.my/billing/success",
  billExternalReferenceNo: "sub_550e8400-e29b-41d4-a716",
  billExpiryDays: 14,
};

// Response
const billResponse: CreateBillResponse = {
  success: true,
  billCode: "abc123xyz",
  billPaymentUrl: "https://toyyibpay.com/abc123xyz",
};
```

---

## 2. ToyyibPay Webhook Payload

### Webhook Event

ToyyibPay sends POST request to `billCallbackUrl` after payment.

```typescript
interface ToyyibPayWebhook {
  refno: string; // Payment reference number (unique)
  status: "1" | "2" | "3"; // 1=success, 2=pending, 3=failed
  reason: string; // Status description
  billcode: string; // Bill identifier
  order_id: string; // billExternalReferenceNo (subscription_id)
  amount: string; // Payment amount in cents (e.g., "3000")
  transaction_time: string; // ISO 8601 timestamp
}
```

### Example

```typescript
// POST /api/payment/webhook
const webhookPayload: ToyyibPayWebhook = {
  refno: "TP241224000001",
  status: "1", // Success
  reason: "Payment successful",
  billcode: "abc123xyz",
  order_id: "sub_550e8400-e29b-41d4-a716",
  amount: "3000",
  transaction_time: "2025-12-24T10:30:00+08:00",
};
```

---

## 3. Get Bill Transactions (Polling Fallback)

### Request

```typescript
interface GetBillTransactionsRequest {
  billCode: string; // Bill identifier
  userSecretKey: string; // ToyyibPay API key
}

interface GetBillTransactionsResponse {
  success: boolean;
  transactions: Array<{
    billpaymentInvoiceNo: string; // Payment reference (refno)
    billpaymentStatus: "1" | "2" | "3"; // 1=success, 2=pending, 3=failed
    billpaymentAmount: number; // Amount in cents
    billpaymentDate: string; // ISO 8601 timestamp
    billpaymentSettlement: string; // Settlement status
    billpaymentSettlementDate: string; // Settlement date
  }>;
  errorMessage?: string;
}
```

### Example

```typescript
const request: GetBillTransactionsRequest = {
  billCode: "abc123xyz",
  userSecretKey: process.env.TOYYIBPAY_SECRET_KEY,
};

const response: GetBillTransactionsResponse = {
  success: true,
  transactions: [
    {
      billpaymentInvoiceNo: "TP241224000001",
      billpaymentStatus: "1",
      billpaymentAmount: 3000,
      billpaymentDate: "2025-12-24T10:30:00+08:00",
      billpaymentSettlement: "Settled",
      billpaymentSettlementDate: "2025-12-25T00:00:00+08:00",
    },
  ],
};
```

---

## 4. Internal Payment Processing

### Activate Subscription

```typescript
interface ActivateSubscriptionRequest {
  subscriptionId: string; // UUID from database
  paymentDetails: {
    refno: string; // ToyyibPay payment reference
    billcode: string; // ToyyibPay bill identifier
    amount: number; // Amount paid in cents
    paid_at: string; // ISO 8601 timestamp
  };
}

interface ActivateSubscriptionResponse {
  success: boolean;
  subscription: {
    id: string;
    tier: "rakyat" | "pro" | "premium";
    status: "active";
    next_billing_date: string; // ISO 8601 date
  };
  errorMessage?: string;
}
```

### Handle Failed Payment

```typescript
interface HandleFailedPaymentRequest {
  subscriptionId: string;
  failureReason: string;
}

interface HandleFailedPaymentResponse {
  success: boolean;
  subscription: {
    id: string;
    status: "grace-period";
    grace_period_end: string; // ISO 8601 timestamp (14 days from now)
    failed_payment_attempts: number;
  };
  errorMessage?: string;
}
```

---

## 5. Split Billing (Premium Tier)

### Process Split Payment

```typescript
interface ProcessSplitBillingRequest {
  transactionId: string; // Payment transaction UUID
  subscriptionId: string;
  totalAmount: number; // Total payment received (RM300-500)
  localAdminId: string; // Assigned Local Admin UUID
}

interface ProcessSplitBillingResponse {
  success: boolean;
  splitDetails: {
    local_admin_share: number; // Fixed RM150 (15000 cents)
    platform_share: number; // Remainder (totalAmount - 15000)
    transfer_status: "pending" | "transferred" | "failed";
    transferred_at?: string; // ISO 8601 timestamp
  };
  errorMessage?: string;
}
```

### Example

```typescript
const request: ProcessSplitBillingRequest = {
  transactionId: "txn_660e9511-f3ac-52e5-b827",
  subscriptionId: "sub_550e8400-e29b-41d4-a716",
  totalAmount: 30000, // RM300.00
  localAdminId: "la_770fa622-g4bd-63f6-c938",
};

const response: ProcessSplitBillingResponse = {
  success: true,
  splitDetails: {
    local_admin_share: 15000, // RM150.00
    platform_share: 15000, // RM150.00 (remainder)
    transfer_status: "transferred",
    transferred_at: "2025-12-24T10:35:00+08:00",
  },
};
```

---

## 6. Retry Split Billing Transfer

### Request

```typescript
interface RetrySplitBillingRequest {
  transactionId: string;
  retryAttempt: number; // Current retry count (max 3)
}

interface RetrySplitBillingResponse {
  success: boolean;
  transfer_status: "transferred" | "failed";
  retry_attempts: number;
  next_retry_at?: string; // ISO 8601 timestamp (if failed)
  errorMessage?: string;
}
```

---

## 7. Error Responses

### Common Error Codes

```typescript
interface PaymentErrorResponse {
  success: false;
  errorCode:
    | "INVALID_CREDENTIALS" // ToyyibPay API key invalid
    | "BILL_CREATION_FAILED" // Bill creation failed
    | "WEBHOOK_VALIDATION_FAILED" // Webhook signature invalid
    | "SUBSCRIPTION_NOT_FOUND" // Subscription ID not found
    | "SPLIT_TRANSFER_FAILED" // Local Admin transfer failed
    | "DUPLICATE_PAYMENT" // Payment reference already processed
    | "PAYMENT_EXPIRED"; // Bill expired before payment
  errorMessage: string;
  retryable: boolean; // Can user retry the operation?
}
```

### Example

```typescript
const errorResponse: PaymentErrorResponse = {
  success: false,
  errorCode: "SPLIT_TRANSFER_FAILED",
  errorMessage: "Failed to transfer RM150 to Local Admin after 3 retries",
  retryable: false,
};
```

---

## 8. Summary

**Endpoints**:

- `POST /api/payment/create-bill` - Create ToyyibPay bill
- `POST /api/payment/webhook` - Receive ToyyibPay webhook
- `POST /api/payment/activate-subscription` - Activate subscription after payment
- `POST /api/payment/handle-failed-payment` - Trigger grace period
- `POST /api/payment/split-billing` - Process Premium tier split payment
- `POST /api/payment/retry-split-billing` - Retry failed split transfer
- `GET /api/payment/poll-status/:billCode` - Polling fallback for payment status

**External Integration**: ToyyibPay API (https://toyyibpay.com/apireference/)  
**Security**: API keys in environment variables, webhook IP whitelisting, HTTPS only
