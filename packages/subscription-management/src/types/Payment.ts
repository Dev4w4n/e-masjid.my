/**
 * Payment Types
 * Feature: 007-multi-tenant-saas
 * Task: T023
 *
 * Type definitions for payment processing aligned with database schema
 * from migration 20251224000001_add_tier_and_subscription_tables.sql
 */

/**
 * Payment method options
 */
export type PaymentMethod = "toyyibpay" | "manual";

/**
 * Payment transaction status
 */
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

/**
 * Transfer status for split billing (Premium tier)
 */
export type TransferStatus = "pending" | "transferred" | "failed";

/**
 * Split billing details for Premium tier subscriptions
 */
export interface SplitBillingDetails {
  local_admin_share: number; // e.g., 150.00
  platform_share: number; // e.g., 150.00
  local_admin_id: string; // UUID
  transfer_status: TransferStatus;
  transferred_at: string | null; // ISO 8601 datetime
  retry_attempts: number;
}

/**
 * Complete payment transaction record from database
 */
export interface PaymentTransaction {
  id: string;
  subscription_id: string;
  masjid_id: string;

  // Payment details
  amount: number; // decimal(10,2) - Total amount received
  payment_method: PaymentMethod;
  status: PaymentStatus;

  // ToyyibPay integration
  toyyibpay_billcode: string | null; // Bill identifier
  toyyibpay_refno: string | null; // Payment reference number (unique per transaction)
  toyyibpay_transaction_time: string | null; // timestamptz

  // Split billing (Premium tier only)
  split_billing_details: SplitBillingDetails | null; // jsonb

  // Failure tracking
  failure_reason: string | null;
  retry_attempts: number;
  last_retry_at: string | null; // timestamptz

  // Audit
  paid_at: string | null; // timestamptz
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * ToyyibPay webhook payload structure
 * Based on ToyyibPay API documentation
 */
export interface ToyyibPayWebhook {
  refno: string; // Payment reference number
  billcode: string; // Bill code
  order_id: string; // Order identifier
  amount: string; // Payment amount (string format from ToyyibPay)
  status: string; // Payment status from ToyyibPay
  reason: string; // Failure reason if applicable
  transaction_time: string; // ISO 8601 datetime
  hash: string; // Security hash for verification
}

/**
 * Request payload for creating a ToyyibPay bill
 */
export interface CreateBillRequest {
  subscription_id: string;
  masjid_id: string;
  amount: number;
  billing_name: string;
  billing_email: string;
  billing_phone: string;
  description: string;
  callback_url: string;
  return_url: string;
}

/**
 * Response from ToyyibPay bill creation API
 */
export interface CreateBillResponse {
  success: boolean;
  billcode: string;
  payment_url: string;
  message?: string;
  error?: string;
}

/**
 * Request payload for processing webhook
 */
export interface ProcessWebhookRequest {
  webhook_data: ToyyibPayWebhook;
}

/**
 * Response after processing webhook
 */
export interface ProcessWebhookResponse {
  success: boolean;
  payment_transaction_id: string;
  message: string;
}

/**
 * Payment transaction with related subscription details
 */
export interface PaymentTransactionWithDetails extends PaymentTransaction {
  subscription: {
    tier: string;
    masjid_id: string;
  };
  masjid: {
    name: string;
    email: string | null;
  };
}
