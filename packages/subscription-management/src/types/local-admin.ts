/**
 * Local Admin Types
 * Feature: 007-multi-tenant-saas
 * Task: T025
 *
 * Type definitions for local admin management aligned with database schema
 * from migration 20251224000002_add_local_admin_and_roles.sql
 */

/**
 * Local admin availability status
 */
export type AvailabilityStatus =
  | "available"
  | "at-capacity"
  | "on-leave"
  | "inactive";

/**
 * Monthly earnings breakdown entry
 */
export interface MonthlyEarnings {
  month: string; // Format: 'YYYY-MM' (e.g., '2025-12')
  amount: number; // Earnings for that month
}

/**
 * Earnings summary structure (stored as JSONB)
 */
export interface EarningsSummary {
  total_earnings: number; // Total lifetime earnings
  current_month: number; // Earnings for current month
  pending_transfers: number; // Pending transfers not yet processed
  last_payment_date: string | null; // ISO 8601 date of last payment
  monthly_breakdown: MonthlyEarnings[]; // Historical monthly earnings
}

/**
 * Complete local admin record from database
 */
export interface LocalAdmin {
  id: string;
  user_id: string;

  // Contact details
  full_name: string;
  whatsapp_number: string;
  email: string;

  // Capacity management
  max_capacity: number; // Default: 10, Max Premium masjids assignable
  availability_status: AvailabilityStatus;

  // Earnings tracking
  earnings_summary: EarningsSummary | null; // jsonb

  // Audit
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * Request payload for creating a local admin
 */
export interface CreateLocalAdminRequest {
  user_id: string;
  full_name: string;
  whatsapp_number: string;
  email: string;
  max_capacity?: number; // Default: 10
}

/**
 * Request payload for updating local admin details
 */
export interface UpdateLocalAdminRequest {
  local_admin_id: string;
  full_name?: string;
  whatsapp_number?: string;
  email?: string;
  max_capacity?: number;
  availability_status?: AvailabilityStatus;
}

/**
 * Local admin with assignment statistics
 * Based on local_admin_assignments view
 */
export interface LocalAdminWithAssignments extends LocalAdmin {
  assigned_count: number; // Number of masjids currently assigned
  remaining_capacity: number; // max_capacity - assigned_count
  is_at_capacity: boolean; // assigned_count >= max_capacity
}

/**
 * Masjid assignment details for local admin
 */
export interface MasjidAssignment {
  masjid_id: string;
  masjid_name: string;
  assigned_at: string; // ISO 8601 datetime
  subscription_status: string;
  last_payment_date: string | null;
}

/**
 * Local admin with full assignment details
 */
export interface LocalAdminWithMasjids extends LocalAdminWithAssignments {
  assigned_masjids: MasjidAssignment[];
}

/**
 * Request to assign local admin to masjid
 */
export interface AssignLocalAdminRequest {
  masjid_id: string;
  local_admin_id: string;
}

/**
 * Response after assigning local admin
 */
export interface AssignLocalAdminResponse {
  success: boolean;
  message: string;
  assignment: {
    masjid_id: string;
    local_admin_id: string;
    assigned_at: string;
  };
}

/**
 * Request to update local admin earnings
 */
export interface UpdateEarningsRequest {
  local_admin_id: string;
  payment_transaction_id: string;
  amount: number; // Amount to add to earnings
  month: string; // Format: 'YYYY-MM'
}

/**
 * Local admin earnings report
 */
export interface EarningsReport {
  local_admin_id: string;
  full_name: string;
  total_earnings: number;
  current_month_earnings: number;
  pending_transfers: number;
  last_payment_date: string | null;
  monthly_breakdown: MonthlyEarnings[];
  assigned_masjids_count: number;
}
