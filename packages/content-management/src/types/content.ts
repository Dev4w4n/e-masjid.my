/**
 * T021: Content Management Types
 *
 * Core types for content management and approval system
 */

import type { DisplayContent } from '@masjid-suite/shared-types';

// Re-export from shared-types for convenience
export type { DisplayContent, ContentStatus } from '@masjid-suite/shared-types';

// Content creation request type
export interface ContentCreateRequest {
  title: string;
  description?: string;
  content_type: 'image' | 'youtube';
  url: string;
  masjid_id: string;
  display_start?: string;
  display_end?: string;
}

// Content update request type
export interface ContentUpdateRequest {
  title?: string;
  description?: string;
  url?: string;
  display_start?: string;
  display_end?: string;
}

// Paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Content query options
export interface ContentQueryOptions {
  page: number;
  limit: number;
  status?: 'pending' | 'approved' | 'rejected' | 'expired';
  search?: string;
  content_type?: 'image' | 'youtube';
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
}

// Approval request type
export interface ApprovalRequest {
  approver_id: string;
  notes?: string;
}

// Rejection request type
export interface RejectionRequest {
  rejector_id: string;
  reason: string;
}

// Resubmission request type
export interface ResubmissionRequest {
  title?: string;
  description?: string;
  url?: string;
  notes?: string;
}

// Approval history item
export interface ApprovalHistoryItem {
  id: string;
  content_id: string;
  action_type: 'approved' | 'rejected' | 'resubmitted';
  performed_by: string;
  performed_at: Date;
  notes?: string;
  reason?: string;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// YouTube validation result
export interface YouTubeValidationResult extends ValidationResult {
  videoId?: string;
  title?: string;
  isAccessible?: boolean;
  error?: string;
}

// Image validation result
export interface ImageValidationResult extends ValidationResult {
  dimensions?: {
    width: number;
    height: number;
  };
}

// Content permission context
export interface ContentPermissionContext {
  user_id: string;
  content_id: string;
  masjid_id: string;
  action: 'read' | 'create' | 'edit' | 'delete' | 'approve' | 'reject';
}

// Permission check result
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

// Approval permission result
export interface ApprovalPermissionResult {
  canApprove: boolean;
  canReject: boolean;
  roles: string[];
}

// Masjid access result
export interface MasjidAccessResult {
  hasAccess: boolean;
  role: string | null;
  permissions: string[];
}

// User role information
export interface UserRole {
  masjid_id: string;
  role: string;
  permissions: string[];
}

// Notification event types
export interface NotificationEvent {
  id: string;
  type: 'content_approved' | 'content_rejected' | 'content_submitted';
  message: string;
  content_id: string;
  user_id: string;
  read_at: Date | null;
  created_at: Date;
}

// Content update event for real-time
export interface ContentUpdateEvent {
  content_id: string;
  masjid_id: string;
  old_status: string;
  new_status: string;
  updated_by: string;
  updated_at: Date;
  approved_by?: string;
  rejected_by?: string;
  approval_notes?: string;
  rejection_reason?: string;
}

// Bulk operation types
export interface BulkApprovalRequest {
  content_ids: string[];
  approver_id: string;
  notes?: string;
}

export interface BulkRejectionRequest {
  content_ids: string[];
  rejector_id: string;
  reason: string;
}

// Content schedule validation
export interface ContentSchedule {
  display_start: Date;
  display_end?: Date;
}

export interface ScheduleValidationResult extends ValidationResult {
  conflictingContent?: DisplayContent[];
}
