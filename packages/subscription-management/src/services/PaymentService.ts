/**
 * Payment Service
 * Feature: 007-multi-tenant-saas
 * Task: T047 (User Story 2)
 *
 * Handles payment bill creation and ToyyibPay integration
 */

import supabase from "@masjid-suite/supabase-client";
import type { Tier } from "@masjid-suite/tier-management";

/**
 * ToyyibPay bill creation request
 */
export interface CreateBillRequest {
  subscription_id: string;
  masjid_id: string;
  tier: Tier;
  billing_cycle: "monthly" | "yearly";
  amount: number;
  split_billing?: {
    masjid_admin_amount: number;
    local_admin_amount: number;
    local_admin_id: string;
  };
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  callback_url: string;
}

/**
 * ToyyibPay bill creation response
 */
export interface CreateBillResult {
  payment_transaction_id: string;
  bill_code: string;
  payment_url: string;
  amount: number;
  status: "pending";
}

/**
 * ToyyibPay configuration from environment
 */
interface ToyyibPayConfig {
  apiKey: string;
  categoryCode: string;
  baseUrl: string;
}

export class PaymentService {
  /**
   * Get ToyyibPay configuration
   */
  private static getToyyibPayConfig(): ToyyibPayConfig {
    const apiKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    const baseUrl =
      process.env.TOYYIBPAY_BASE_URL || "https://dev.toyyibpay.com";

    if (!apiKey || !categoryCode) {
      throw new Error(
        "ToyyibPay configuration missing. Set TOYYIBPAY_SECRET_KEY and TOYYIBPAY_CATEGORY_CODE"
      );
    }

    return {
      apiKey,
      categoryCode,
      baseUrl,
    };
  }

  /**
   * Create payment bill
   * Task: T047
   *
   * Business Rules:
   * - Rakyat: No payment required
   * - Pro: Direct payment to masjid admin
   * - Premium: Split billing (50/50 between masjid admin and local admin)
   */
  static async createBill(
    request: CreateBillRequest
  ): Promise<CreateBillResult> {
    // Use imported supabase client
    const config = this.getToyyibPayConfig();

    // Validate amount
    if (request.amount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    // Validate split billing for Premium tier
    if (request.tier === "premium" && !request.split_billing) {
      throw new Error("Premium tier requires split billing configuration");
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Create payment transaction record first
    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .insert([
        {
          subscription_id: request.subscription_id,
          masjid_id: request.masjid_id,
          amount: request.amount,
          currency: "MYR",
          payment_method: "toyyibpay",
          provider_name: "ToyyibPay",
          status: "pending",
          billing_period_start: new Date().toISOString(),
          billing_period_end: this.calculateBillingPeriodEnd(
            request.billing_cycle
          ),
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (transactionError) {
      throw new Error(
        `Failed to create payment transaction: ${transactionError.message}`
      );
    }

    // Prepare ToyyibPay bill details
    const billName = this.getBillName(request.tier, request.billing_cycle);
    const billDescription = this.getBillDescription(
      request.tier,
      request.billing_cycle
    );

    // Create bill with ToyyibPay API
    try {
      const billCode = await this.createToyyibPayBill({
        config,
        categoryCode: config.categoryCode,
        billName,
        billDescription,
        billAmount: request.amount,
        billReturnUrl: request.callback_url,
        billCallbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/toyyibpay`,
        billExternalReferenceNo: transaction.id,
        billTo: request.customer_name,
        billEmail: request.customer_email,
        billPhone: request.customer_phone,
        billSplitPayment: request.split_billing ? 1 : 0,
        billSplitPaymentArgs: request.split_billing
          ? JSON.stringify([
              {
                email: request.customer_email,
                amount: request.split_billing.masjid_admin_amount,
              },
              {
                email: await this.getLocalAdminEmail(
                  request.split_billing.local_admin_id
                ),
                amount: request.split_billing.local_admin_amount,
              },
            ])
          : undefined,
      });

      // Update payment transaction with bill code
      const { error: updateError } = await supabase
        .from("payment_transactions")
        .update({
          provider_transaction_id: billCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      if (updateError) {
        console.error(
          "Failed to update transaction with bill code:",
          updateError
        );
      }

      // Construct payment URL
      const paymentUrl = `${config.baseUrl}/${billCode}`;

      return {
        payment_transaction_id: transaction.id,
        bill_code: billCode,
        payment_url: paymentUrl,
        amount: request.amount,
        status: "pending",
      };
    } catch (error) {
      // Update transaction status to failed
      await supabase
        .from("payment_transactions")
        .update({
          status: "failed",
          failure_reason:
            error instanceof Error ? error.message : "Unknown error",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      throw error;
    }
  }

  /**
   * Create bill with ToyyibPay API
   */
  private static async createToyyibPayBill(params: {
    config: ToyyibPayConfig;
    categoryCode: string;
    billName: string;
    billDescription: string;
    billAmount: number;
    billReturnUrl: string;
    billCallbackUrl: string;
    billExternalReferenceNo: string;
    billTo: string;
    billEmail: string;
    billPhone: string;
    billSplitPayment: number;
    billSplitPaymentArgs?: string;
  }): Promise<string> {
    const { config, ...billParams } = params;

    const response = await fetch(`${config.baseUrl}/index.php/api/createBill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        userSecretKey: config.apiKey,
        categoryCode: billParams.categoryCode,
        billName: billParams.billName,
        billDescription: billParams.billDescription,
        billPriceSetting: "1", // Fixed price
        billPayorInfo: "1", // Required
        billAmount: billParams.billAmount.toFixed(2),
        billReturnUrl: billParams.billReturnUrl,
        billCallbackUrl: billParams.billCallbackUrl,
        billExternalReferenceNo: billParams.billExternalReferenceNo,
        billTo: billParams.billTo,
        billEmail: billParams.billEmail,
        billPhone: billParams.billPhone,
        billSplitPayment: billParams.billSplitPayment.toString(),
        ...(billParams.billSplitPaymentArgs && {
          billSplitPaymentArgs: billParams.billSplitPaymentArgs,
        }),
      }),
    });

    if (!response.ok) {
      throw new Error(`ToyyibPay API error: ${response.statusText}`);
    }

    const data = await response.json();

    // ToyyibPay returns array with [{ BillCode: "xxx" }]
    if (Array.isArray(data) && data[0]?.BillCode) {
      return data[0].BillCode;
    }

    throw new Error("Invalid response from ToyyibPay API");
  }

  /**
   * Get bill name based on tier and billing cycle
   */
  private static getBillName(
    tier: Tier,
    billingCycle: "monthly" | "yearly"
  ): string {
    const tierNames: Record<Tier, string> = {
      rakyat: "Rakyat",
      pro: "Pro",
      premium: "Premium",
    };

    const cycleName = billingCycle === "monthly" ? "Bulanan" : "Tahunan";
    return `e-Masjid ${tierNames[tier]} - ${cycleName}`;
  }

  /**
   * Get bill description
   */
  private static getBillDescription(
    tier: Tier,
    billingCycle: "monthly" | "yearly"
  ): string {
    const tierNames: Record<Tier, string> = {
      rakyat: "Rakyat (Percuma)",
      pro: "Pro",
      premium: "Premium",
    };

    const cycleName =
      billingCycle === "monthly" ? "langganan bulanan" : "langganan tahunan";
    return `Bayaran ${cycleName} untuk pelan ${tierNames[tier]} e-Masjid`;
  }

  /**
   * Calculate billing period end date
   */
  private static calculateBillingPeriodEnd(
    billingCycle: "monthly" | "yearly"
  ): string {
    const endDate = new Date();

    if (billingCycle === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    return endDate.toISOString().split("T")[0]; // Return date only (YYYY-MM-DD)
  }

  /**
   * Get local admin email for split billing
   */
  private static async getLocalAdminEmail(
    localAdminId: string
  ): Promise<string> {
    // Use imported supabase client

    const { data: localAdmin, error } = await supabase
      .from("local_admins")
      .select("user_id")
      .eq("id", localAdminId)
      .single();

    if (error || !localAdmin) {
      throw new Error("Local admin not found");
    }

    // Get user email from auth.users
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(localAdmin.user_id);

    if (userError || !user?.email) {
      throw new Error("Local admin email not found");
    }

    return user.email;
  }

  /**
   * Handle ToyyibPay callback (webhook)
   */
  static async handleToyyibPayCallback(payload: {
    billcode: string;
    order_id: string;
    status: string;
    amount: string;
    transaction_id: string;
  }): Promise<void> {
    // Use imported supabase client

    // Map ToyyibPay status to our status
    let status: "completed" | "failed";
    if (payload.status === "1") {
      status = "completed";
    } else {
      status = "failed";
    }

    // Update payment transaction
    const { data: transaction, error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status,
        provider_reference_id: payload.transaction_id,
        paid_at: status === "completed" ? new Date().toISOString() : null,
        failure_reason:
          status === "failed" ? "Payment failed or cancelled" : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.order_id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update payment transaction:", updateError);
      throw new Error("Failed to process payment callback");
    }

    // If payment completed, activate subscription
    if (status === "completed" && transaction.subscription_id) {
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          trial_end_date: null, // Remove trial
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.subscription_id);

      if (subError) {
        console.error("Failed to activate subscription:", subError);
      }
    }
  }

  /**
   * Get payment transaction by ID
   */
  static async getPaymentTransaction(transactionId: string) {
    // Use imported supabase client

    const { data, error } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch payment transaction: ${error.message}`);
    }

    return data;
  }

  /**
   * Get payment history for masjid
   */
  static async getPaymentHistory(masjidId: string, limit: number = 10) {
    // Use imported supabase client

    const { data, error } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("masjid_id", masjidId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch payment history: ${error.message}`);
    }

    return data;
  }

  /**
   * Get tier pricing
   */
  static getTierPricing(
    tier: Tier,
    billingCycle: "monthly" | "yearly"
  ): number {
    const pricing: Record<Tier, Record<string, number>> = {
      rakyat: { monthly: 0, yearly: 0 },
      pro: { monthly: 30, yearly: 300 }, // 2 months free
      premium: { monthly: 300, yearly: 3600 }, // 2 months free
    };

    return pricing[tier][billingCycle];
  }
}
