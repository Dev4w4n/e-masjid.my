/**
 * Display Settings Types
 *
 * Types for managing display configuration and scheduling
 */

// Display configuration
export interface DisplaySettings {
  id: string;
  masjid_id: string;
  display_name: string;
  auto_approve_trusted_users: boolean;
  content_duration_minutes: number;
  max_queue_size: number;
  allowed_content_types: ('image' | 'youtube')[];
  business_hours_only: boolean;
  business_hours_start?: string; // HH:MM format
  business_hours_end?: string; // HH:MM format
  blackout_dates: string[]; // ISO date strings
  created_at: Date;
  updated_at: Date;
}

// Display settings update request
export interface DisplaySettingsUpdateRequest {
  display_name?: string;
  auto_approve_trusted_users?: boolean;
  content_duration_minutes?: number;
  max_queue_size?: number;
  allowed_content_types?: ('image' | 'youtube')[];
  business_hours_only?: boolean;
  business_hours_start?: string;
  business_hours_end?: string;
  blackout_dates?: string[];
}

// Content queue item
export interface ContentQueueItem {
  id: string;
  content_id: string;
  display_id: string;
  position: number;
  scheduled_start?: Date;
  scheduled_end?: Date;
  status: 'queued' | 'playing' | 'completed' | 'skipped';
  created_at: Date;
  updated_at: Date;
}

// Display status
export interface DisplayStatus {
  id: string;
  is_online: boolean;
  current_content_id?: string;
  queue_length: number;
  last_heartbeat: Date;
  next_content?: ContentQueueItem;
}

// Content display metrics
export interface ContentDisplayMetrics {
  content_id: string;
  total_displays: number;
  total_duration_minutes: number;
  last_displayed: Date | null;
  display_dates: Date[];
}
