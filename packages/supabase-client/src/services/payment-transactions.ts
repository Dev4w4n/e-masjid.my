/**
 * Payment Transaction Service
 * Feature: 007-multi-tenant-saas
 * Task: T028
 *
 * Supabase client methods for payment transaction operations
 */

import { supabase } from "..";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@masjid-suite/shared-types";

// Type aliases for payment operations
type PaymentTransaction = Tables<"payment_transactions">;

interface SplitBillingDetails {
  masjid_admin_amount: number;
  masjid_admin_percentage: number;
  local_admin_amount: number;
  local_admin_percentage: number;
  total_amount: number;
}

type PaymentTransactionRow = Tables<"payment_transactions">;
type PaymentTransactionInsert = TablesInsert<"payment_transactions">;
type PaymentTransactionUpdate = TablesUpdate<"payment_transactions">;

/**
 * Create a new payment transaction
 */
export const createPaymentTransaction = async (
  transaction: Omit<PaymentTransaction, "id" | "created_at" | "updated_at">
): Promise<PaymentTransaction> => {
  const transactionData: PaymentTransactionInsert = {
    subscription_id: transaction.subscription_id,
    masjid_id: transaction.masjid_id,
    amount: transaction.amount,
    status: transaction.status || "pending",
    payment_method: transaction.payment_method || "online_banking",
    toyyibpay_billcode: transaction.toyyibpay_billcode || null,
    toyyibpay_refno: transaction.toyyibpay_refno || null,
    paid_at: transaction.paid_at || null,
    failure_reason: transaction.failure_reason || null,
    split_billing_details: transaction.split_billing_details || null,
  };

  const { data, error } = await supabase
    .from("payment_transactions")
    .insert(transactionData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment transaction: ${error.message}`);
  }

  return data as PaymentTransaction;
};

/**
 * Update payment transaction status
 */
export const updatePaymentStatus = async (
  transactionId: string,
  status: "pending" | "processing" | "completed" | "failed" | "refunded",
  updates: {
    provider_transaction_id?: string;
    provider_response?: any;
    paid_at?: string;
    failed_at?: string;
    failure_reason?: string;
    receipt_url?: string;
  }
): Promise<PaymentTransaction> => {
  const updateData: PaymentTransactionUpdate = {
    status,
    updated_at: new Date().toISOString(),
    ...updates,
  };

  const { data, error } = await supabase
    .from("payment_transactions")
    .update(updateData)
    .eq("id", transactionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update payment status: ${error.message}`);
  }

  return data as PaymentTransaction;
};

/**
 * Get payment history for a subscription
 */
export const getPaymentHistory = async (
  subscriptionId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
): Promise<PaymentTransaction[]> => {
  let query = supabase
    .from("payment_transactions")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get payment history: ${error.message}`);
  }

  return data as PaymentTransaction[];
};

/**
 * Record split billing for Premium tier
 * 50% to masjid admin, 50% to local admin
 */
export const recordSplitBilling = async (
  transactionId: string,
  splitDetails: SplitBillingDetails
): Promise<PaymentTransaction> => {
  // Validate split percentages add up to 100%
  const totalPercentage =
    splitDetails.masjid_admin_percentage + splitDetails.local_admin_percentage;
  if (totalPercentage !== 100) {
    throw new Error(
      `Split percentages must add up to 100%, got ${totalPercentage}%`
    );
  }

  const updateData: PaymentTransactionUpdate = {
    split_billing_details: splitDetails as any,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("payment_transactions")
    .update(updateData)
    .eq("id", transactionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record split billing: ${error.message}`);
  }

  return data as PaymentTransaction;
};

/**
 * Get payment transaction by ID
 */
export const getPaymentTransaction = async (
  transactionId: string
): Promise<PaymentTransaction | null> => {
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to get payment transaction: ${error.message}`);
  }

  return data as PaymentTransaction;
};

/**
 * Get payment transaction by provider transaction ID
 */
export const getPaymentByProviderId = async (
  providerTransactionId: string
): Promise<PaymentTransaction | null> => {
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("provider_transaction_id", providerTransactionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to get payment by provider ID: ${error.message}`);
  }

  return data as PaymentTransaction;
};

/**
 * Get all pending payments (for retry logic)
 */
export const getPendingPayments = async (): Promise<PaymentTransaction[]> => {
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to get pending payments: ${error.message}`);
  }

  return data as PaymentTransaction[];
};

/**
 * Get failed payments for a subscription (for admin review)
 */
export const getFailedPayments = async (
  subscriptionId: string
): Promise<PaymentTransaction[]> => {
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .eq("status", "failed")
    .order("failed_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get failed payments: ${error.message}`);
  }

  return data as PaymentTransaction[];
};
