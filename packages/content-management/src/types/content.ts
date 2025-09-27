/**
 * Content management type definitions
 * Matches database schema from migration 009
 */

export type ContentType =
  | "image"
  | "youtube_video"
  | "text_announcement"
  | "event_poster";
export type ContentStatus = "pending" | "active" | "expired" | "rejected";
export type SponsorshipTier = "bronze" | "silver" | "gold" | "platinum";

/**
 * Main display content interface matching database schema
 */
export interface DisplayContent {
  id: string;
  masjid_id: string;
  display_id?: string;
  title: string;
  description?: string;
  type: ContentType;
  url: string;
  thumbnail_url?: string;

  // Approval workflow fields
  status: ContentStatus;
  submitted_by: string;
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  approval_notes?: string; // NEW in migration 009
  resubmission_of?: string; // NEW in migration 009

  // Display settings
  duration: number;
  start_date: string;
  end_date: string;

  // Sponsorship
  sponsorship_amount: number;
  sponsorship_tier?: SponsorshipTier;

  // File metadata
  file_size?: number;
  file_type?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Request interface for creating new content
 */
export interface CreateContentRequest {
  masjid_id: string;
  display_id?: string;
  title: string;
  description?: string;
  type: ContentType;
  url: string;
  thumbnail_url?: string;
  duration?: number;
  start_date?: string;
  end_date?: string;
  sponsorship_amount?: number;
  resubmission_of?: string;
}

/**
 * Request interface for updating existing content
 */
export interface UpdateContentRequest {
  title?: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  duration?: number;
  start_date?: string;
  end_date?: string;
  sponsorship_amount?: number;
}

/**
 * Request interface for approval actions
 */
export interface ApprovalRequest {
  content_id: string;
  action: "approve" | "reject";
  notes?: string;
  approved_by: string;
  rejection_reason?: string; // Required when action is 'reject'
}

/**
 * Interface for content filtering and queries
 */
export interface ContentFilters {
  masjid_id?: string;
  status?: ContentStatus[];
  type?: ContentType[];
  submitted_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Extended content interface with submitter information for admin views
 */
export interface ContentWithSubmitter extends DisplayContent {
  submitter: {
    id: string;
    email: string;
    full_name?: string;
  };
  resubmission_history?: DisplayContent[];
}

/**
 * Interface for content upload response
 */
export interface ContentUploadResponse {
  url: string;
  thumbnail_url?: string;
  file_size: number;
  file_type: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Interface for pagination metadata
 */
export interface PaginationMetadata {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: PaginationMetadata;
}

/**
 * Content management statistics for dashboards
 */
export interface ContentStatistics {
  total_content: number;
  pending_approval: number;
  active_content: number;
  rejected_content: number;
  resubmissions: number;
  avg_approval_time_hours?: number;
}

/**
 * YouTube video metadata interface
 */
export interface YouTubeVideoMetadata {
  video_id: string;
  title?: string;
  description?: string;
  thumbnail_url: string;
  duration_seconds?: number;
  is_public: boolean;
}

/**
 * File upload validation rules
 */
export interface FileUploadRules {
  max_file_size: number;
  allowed_mime_types: string[];
  required_dimensions?: {
    min_width: number;
    min_height: number;
    max_width: number;
    max_height: number;
  };
}

/**
 * Content validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}
