/**
 * Subscription Service
 * Feature: 007-multi-tenant-saas
 * Tasks: T046 (User Story 2)
 *
 * Handles subscription CRUD operations, grace period management, and soft-lock functionality
 */

import supabase from "@masjid-suite/supabase-client";
import type { Tier } from "@masjid-suite/tier-management";

/**
 * Subscription creation request
 */
export interface CreateSubscriptionRequest {
  masjid_id: string;
  tier: Tier;
  billing_cycle: "monthly" | "yearly";
  payment_method?: "toyyibpay" | "manual";
  local_admin_id?: string; // Required for Premium tier
}

/**
 * Subscription creation result
 */
export interface CreateSubscriptionResult {
  subscription_id: string;
  status: "active" | "grace-period" | "soft-locked" | "cancelled";
  payment_required: boolean;
  payment_url?: string;
}

export class SubscriptionService {
  /**
   * Create subscription
   * Task: T046
   *
   * Business Rules:
   * - Rakyat: Immediate activation (free tier)
   * - Pro: Pending payment, 14-day trial
   * - Premium: Pending payment, requires local admin, split billing
   */
  static async createSubscription(
    request: CreateSubscriptionRequest
  ): Promise<CreateSubscriptionResult> {
    // Use imported supabase client

    // Validate Premium tier requires local admin
    if (request.tier === "premium" && !request.local_admin_id) {
      throw new Error("Premium tier requires local admin assignment");
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Calculate dates
    const now = new Date();
    const currentPeriodStart = new Date(now);
    const currentPeriodEnd = new Date(now);

    if (request.billing_cycle === "monthly") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    // Calculate price based on tier
    let price = 0;
    if (request.tier === "pro") {
      price = request.billing_cycle === "monthly" ? 30 : 300;
    } else if (request.tier === "premium") {
      price = request.billing_cycle === "monthly" ? 300 : 3600;
    }

    // Determine status and payment requirement
    let status: "active" | "grace-period" | "soft-locked" | "cancelled";
    let paymentRequired: boolean;

    if (request.tier === "rakyat") {
      status = "active";
      paymentRequired = false;
    } else {
      // Pro/Premium start active, payment triggers separately
      status = "active";
      paymentRequired = true;
    }

    // Create subscription record
    const { data: subscription, error: createError } = await supabase
      .from("subscriptions")
      .insert([
        {
          masjid_id: request.masjid_id,
          tier: request.tier,
          status,
          price,
          billing_cycle: request.billing_cycle,
          current_period_start: currentPeriodStart.toISOString().split("T")[0], // date only
          current_period_end: currentPeriodEnd.toISOString().split("T")[0], // date only
          next_billing_date: currentPeriodEnd.toISOString().split("T")[0], // date only
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ])
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create subscription: ${createError.message}`);
    }

    // Note: Premium tier local admin assignment is MANUAL per spec FR-030-031
    // Super admin assigns local admin through admin dashboard after subscription creation

    return {
      subscription_id: subscription.id,
      status: subscription.status as
        | "active"
        | "grace-period"
        | "soft-locked"
        | "cancelled",
      payment_required: paymentRequired,
      payment_url: undefined, // Will be set by PaymentService
    };
  }

  /**
   * Get subscription by masjid ID
   */
  static async getSubscriptionByMasjid(masjidId: string) {
    // Use imported supabase client

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("masjid_id", masjidId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }

    return data;
  }

  /**
   * Update subscription status
   */
  static async updateSubscriptionStatus(
    subscriptionId: string,
    status:
      | "active"
      | "pending_payment"
      | "trial"
      | "grace_period"
      | "soft_locked"
      | "expired"
      | "cancelled"
  ) {
    // Use imported supabase client

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update subscription status: ${error.message}`);
    }

    return data;
  }

  /**
   * Trigger grace period (7 days after payment failure)
   */
  static async triggerGracePeriod(subscriptionId: string) {
    // Use imported supabase client

    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "grace_period",
        grace_period_end: gracePeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to trigger grace period: ${error.message}`);
    }

    return data;
  }

  /**
   * Trigger soft lock (after grace period expires)
   */
  static async triggerSoftLock(subscriptionId: string) {
    // Use imported supabase client

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "soft_locked",
        soft_locked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to trigger soft lock: ${error.message}`);
    }

    return data;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string, reason?: string) {
    // Use imported supabase client

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        cancellation_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }

    return data;
  }

  /**
   * Renew subscription
   */
  static async renewSubscription(subscriptionId: string) {
    // Use imported supabase client

    // Get current subscription
    const { data: currentSub, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch subscription: ${fetchError.message}`);
    }

    // Calculate new period end date
    const currentEnd = new Date(currentSub.current_period_end || new Date());
    const newPeriodEnd = new Date(currentEnd);
    if (currentSub.billing_cycle === "monthly") {
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
    } else {
      newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        current_period_end: newPeriodEnd.toISOString().split("T")[0],
        next_billing_date: newPeriodEnd.toISOString().split("T")[0],
        grace_period_start: null,
        grace_period_end: null,
        soft_locked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to renew subscription: ${error.message}`);
    }

    return data;
  }

  /**
   * Upgrade/downgrade tier
   */
  static async changeTier(
    subscriptionId: string,
    newTier: Tier,
    localAdminId?: string
  ) {
    // Use imported supabase client

    // Validate Premium tier requires local admin
    if (newTier === "premium" && !localAdminId) {
      throw new Error("Premium tier requires local admin assignment");
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to change tier: ${error.message}`);
    }

    // Note: Premium tier local admin assignment is MANUAL per spec FR-030-031
    // Super admin must manually assign local admin through admin dashboard
    // localAdminId parameter kept for future manual assignment workflow

    return data;
  }

  /**
   * Check if subscription is active and not expired
   */
  static isSubscriptionActive(subscription: any): boolean {
    if (!subscription) return false;

    const activeStatuses = ["active", "grace-period"];
    if (!activeStatuses.includes(subscription.status)) {
      return false;
    }

    // Check if not expired
    if (subscription.current_period_end) {
      const endDate = new Date(subscription.current_period_end);
      const now = new Date();
      if (now > endDate) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get days until expiry
   */
  static getDaysUntilExpiry(subscription: any): number | null {
    if (!subscription?.current_period_end) return null;

    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}
