/**
 * Subscription Management Service
 * Feature: 007-multi-tenant-saas
 * Task: T027
 *
 * Supabase client methods for subscription operations
 */

import { supabase } from "..";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@masjid-suite/shared-types";

// Type aliases for subscription operations
type Subscription = Tables<"subscriptions">;

interface CreateSubscriptionRequest {
  masjid_id: string;
  tier: "rakyat" | "pro" | "premium";
  billing_cycle?: string;
  price: number;
}

interface CreateSubscriptionResponse {
  subscription: Subscription;
  message: string;
}

interface UpdateSubscriptionStatusRequest {
  masjid_id: string;
  status: string;
  grace_period_end?: string;
  soft_locked_at?: string;
  soft_lock_reason?: string;
}

type SubscriptionRow = Tables<"subscriptions">;
type SubscriptionInsert = TablesInsert<"subscriptions">;
type SubscriptionUpdate = TablesUpdate<"subscriptions">;

/**
 * Get subscription by masjid ID
 */
export const getSubscription = async (
  masjidId: string
): Promise<Subscription | null> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("masjid_id", masjidId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No subscription found
      return null;
    }
    throw new Error(`Failed to get subscription: ${error.message}`);
  }

  return data as Subscription;
};

/**
 * Create a new subscription for a masjid
 */
export const createSubscription = async (
  request: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> => {
  const now = new Date().toISOString();

  // Calculate trial end date (14 days from now)
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  const subscriptionData: SubscriptionInsert = {
    masjid_id: request.masjid_id,
    tier: request.tier,
    status: "trial",
    billing_cycle: request.billing_cycle || "monthly",
    price: request.price,
    current_period_start: now,
    current_period_end: trialEndDate.toISOString(),
    next_billing_date: trialEndDate.toISOString(),
  };

  const { data, error } = await supabase
    .from("subscriptions")
    .insert(subscriptionData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create subscription: ${error.message}`);
  }

  return {
    subscription: data as Subscription,
    message: "Subscription created successfully with 14-day trial period",
  };
};

/**
 * Update subscription status
 */
export const updateSubscriptionStatus = async (
  request: UpdateSubscriptionStatusRequest
): Promise<Subscription> => {
  const now = new Date().toISOString();

  const updateData: SubscriptionUpdate = {
    status: request.status,
    updated_at: now,
  };

  // Add status-specific fields
  if (request.status === "grace_period" && request.grace_period_end) {
    updateData.grace_period_end = request.grace_period_end;
    updateData.grace_period_start = now;
  }

  if (request.status === "soft_locked") {
    updateData.soft_locked_at = request.soft_locked_at || now;
    updateData.soft_lock_reason = request.soft_lock_reason || null;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("masjid_id", request.masjid_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update subscription status: ${error.message}`);
  }

  return data as Subscription;
};

/**
 * Trigger grace period for a subscription (7 days after payment failure)
 */
export const triggerGracePeriod = async (
  masjidId: string
): Promise<Subscription> => {
  const now = new Date();
  const gracePeriodEnd = new Date(now);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7); // 7-day grace period

  const updateData: SubscriptionUpdate = {
    status: "grace_period",
    grace_period_end: gracePeriodEnd.toISOString(),
    updated_at: now.toISOString(),
  };

  const { data, error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("masjid_id", masjidId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to trigger grace period: ${error.message}`);
  }

  return data as Subscription;
};

/**
 * Trigger soft lock for a subscription (after grace period expires)
 */
export const triggerSoftLock = async (
  masjidId: string
): Promise<Subscription> => {
  const now = new Date().toISOString();

  const updateData: SubscriptionUpdate = {
    status: "soft_locked",
    soft_locked_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("masjid_id", masjidId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to trigger soft lock: ${error.message}`);
  }

  return data as Subscription;
};

/**
 * Get all subscriptions (admin only)
 */
export const getAllSubscriptions = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get all subscriptions: ${error.message}`);
  }

  return data as Subscription[];
};

/**
 * Get subscriptions by tier
 */
export const getSubscriptionsByTier = async (
  tier: "rakyat" | "pro" | "premium"
): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("tier", tier)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get subscriptions by tier: ${error.message}`);
  }

  return data as Subscription[];
};

/**
 * Get subscriptions by status
 */
export const getSubscriptionsByStatus = async (
  status: string
): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get subscriptions by status: ${error.message}`);
  }

  return data as Subscription[];
};
