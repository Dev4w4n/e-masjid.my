/**
 * Real-time notification types for content management system
 * Used with Supabase real-time subscriptions
 */

import { ContentStatus } from "./content";

/**
 * Base notification event interface
 */
export interface BaseNotificationEvent {
  id: string;
  timestamp: string;
  masjid_id: string;
}

/**
 * Content status change notification
 */
export interface ContentStatusChangeEvent extends BaseNotificationEvent {
  type: "content_status_changed";
  content_id: string;
  title: string;
  old_status: ContentStatus;
  new_status: ContentStatus;
  approved_by?: string;
  approval_notes?: string;
  rejection_reason?: string;
  submitted_by: string;
}

/**
 * New content submission notification
 */
export interface ContentSubmissionEvent extends BaseNotificationEvent {
  type: "content_submitted";
  content_id: string;
  title: string;
  content_type: string;
  submitted_by: string;
  submitter_name?: string;
  submitter_email: string;
}

/**
 * Content resubmission notification
 */
export interface ContentResubmissionEvent extends BaseNotificationEvent {
  type: "content_resubmitted";
  content_id: string;
  title: string;
  original_content_id: string;
  submitted_by: string;
  submitter_name?: string;
  submitter_email: string;
  previous_rejection_reason?: string;
}

/**
 * Bulk approval notification
 */
export interface BulkApprovalEvent extends BaseNotificationEvent {
  type: "bulk_approval_completed";
  approved_count: number;
  rejected_count: number;
  approved_by: string;
  content_ids: string[];
}

/**
 * Union type for all notification events
 */
export type NotificationEvent =
  | ContentStatusChangeEvent
  | ContentSubmissionEvent
  | ContentResubmissionEvent
  | BulkApprovalEvent;

/**
 * Notification subscription configuration
 */
export interface NotificationSubscription {
  masjid_ids: string[];
  event_types: NotificationEvent["type"][];
  user_id: string;
  callback: (event: NotificationEvent) => void;
}

/**
 * Toast notification configuration
 */
export interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

/**
 * Notification action (e.g., "View Content", "Approve Now")
 */
export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: "text" | "outlined" | "contained";
}

/**
 * Real-time connection status
 */
export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error?: string;
  last_connected?: string;
  reconnect_attempts: number;
}

/**
 * Notification preferences for users
 */
export interface NotificationPreferences {
  user_id: string;
  email_notifications: {
    content_approved: boolean;
    content_rejected: boolean;
    new_submissions: boolean;
    resubmissions: boolean;
  };
  push_notifications: {
    content_approved: boolean;
    content_rejected: boolean;
    new_submissions: boolean;
    resubmissions: boolean;
  };
  in_app_notifications: {
    content_approved: boolean;
    content_rejected: boolean;
    new_submissions: boolean;
    resubmissions: boolean;
  };
}

/**
 * Notification history item
 */
export interface NotificationHistoryItem {
  id: string;
  user_id: string;
  event: NotificationEvent;
  read: boolean;
  created_at: string;
  read_at?: string;
}

/**
 * Pagination for notification history
 */
export interface NotificationHistoryResponse {
  notifications: NotificationHistoryItem[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    unread_count: number;
  };
}

/**
 * Real-time subscription channel names
 */
export const NOTIFICATION_CHANNELS = {
  CONTENT_APPROVALS: "content-approvals",
  CONTENT_SUBMISSIONS: "content-submissions",
  DISPLAY_UPDATES: "display-updates",
} as const;

/**
 * Default notification durations (milliseconds)
 */
export const NOTIFICATION_DURATIONS = {
  SUCCESS: 4000,
  ERROR: 6000,
  WARNING: 5000,
  INFO: 4000,
} as const;
