/**
 * Subscription Types
 * Feature: 007-multi-tenant-saas
 * Task: T022
 *
 * Type definitions for subscription management aligned with database schema
 * from migration 20251224000001_add_tier_and_subscription_tables.sql
 */

/**
 * Subscription tier options
 */
export type Tier = "rakyat" | "pro" | "premium";

/**
 * Subscription status states
 */
export type SubscriptionStatus =
  | "active"
  | "grace-period"
  | "soft-locked"
  | "cancelled";

/**
 * Billing cycle options
 */
export type BillingCycle = "monthly" | "yearly";

/**
 * Complete subscription record from database
 */
export interface Subscription {
  id: string;
  masjid_id: string;
  tier: Tier;
  status: SubscriptionStatus;
  price: number; // decimal(10,2) - RM0.00 for Rakyat, RM30.00 for Pro, RM300-500 for Premium
  billing_cycle: BillingCycle;

  // Grace period tracking
  grace_period_start: string | null; // timestamptz
  grace_period_end: string | null; // timestamptz
  failed_payment_attempts: number;
  last_failed_at: string | null; // timestamptz

  // Soft-lock tracking
  soft_locked_at: string | null; // timestamptz
  soft_lock_reason: string | null;

  // Billing dates
  next_billing_date: string | null; // date
  current_period_start: string | null; // date
  current_period_end: string | null; // date

  // Payment method
  toyyibpay_category_code: string | null;
  billing_contact_name: string | null;
  billing_email: string | null;
  billing_phone: string | null;

  // Audit
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * Request payload for creating a new subscription
 */
export interface CreateSubscriptionRequest {
  masjid_id: string;
  tier: Tier;
  price: number;
  billing_cycle: BillingCycle;
  billing_contact_name: string;
  billing_email: string;
  billing_phone: string;
  toyyibpay_category_code?: string;
}

/**
 * Response after creating a subscription
 */
export interface CreateSubscriptionResponse {
  subscription: Subscription;
  message: string;
  success: boolean;
}

/**
 * Request payload for updating subscription status
 */
export interface UpdateSubscriptionStatusRequest {
  subscription_id: string;
  status: SubscriptionStatus;
  reason?: string; // Required for soft-locked status
}

/**
 * Subscription with masjid details (for listing views)
 */
export interface SubscriptionWithMasjid extends Subscription {
  masjid: {
    id: string;
    name: string;
    email: string | null;
    phone_number: string | null;
  };
}
