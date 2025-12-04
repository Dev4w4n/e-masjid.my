/**
 * Standardized API Response Types for Masjid Suite
 *
 * Provides consistent response wrappers, error handling, and pagination
 * types for all API endpoints across the application
 */

// Import required types from tv-display.ts
import type {
  DisplayContent,
  PrayerTimes,
  DisplayConfig,
  DisplayStatus,
  DisplayAnalytics,
  ContentType,
  ContentStatus,
  PrayerTimePosition,
  DisplayResolution,
  DisplayOrientation,
} from "./tv-display";

// ============================================================================
// Core API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  data: T;
  meta?: ApiMeta;
  links?: ApiLinks;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code: string;
    details?: string;
    hint?: string;
    field?: string;
    timestamp: string;
    request_id?: string;
  };
  meta?: null;
  links?: null;
}

export type ApiResult<T = any> = ApiResponse<T> | ApiError;

export interface ApiMeta {
  total?: number;
  page?: number;
  limit?: number;
  offset?: number;
  has_more?: boolean;
  next_page?: number | null;
  prev_page?: number | null;
  last_updated?: string;
  cache_expires?: string;
  version?: string;
  filters_applied?: Record<string, any>;
}

export interface ApiLinks {
  self?: string;
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
  related?: Record<string, string>;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationRequest {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  next_page: number | null;
  prev_page: number | null;
}

export interface CursorPaginationRequest {
  cursor?: string;
  limit?: number;
}

export interface CursorPaginationResponse {
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
  limit: number;
}

// ============================================================================
// Error Types and Codes
// ============================================================================

export type ApiErrorCode =
  // General errors
  | "INTERNAL_SERVER_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT_EXCEEDED"

  // Authentication errors
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "INSUFFICIENT_PERMISSIONS"
  | "USER_NOT_FOUND"
  | "MASJID_ACCESS_DENIED"

  // TV Display specific errors
  | "DISPLAY_NOT_FOUND"
  | "DISPLAY_OFFLINE"
  | "DISPLAY_CONFIG_INVALID"
  | "CONTENT_NOT_FOUND"
  | "CONTENT_EXPIRED"
  | "CONTENT_REJECTED"
  | "CONTENT_UPLOAD_FAILED"
  | "CONTENT_FORMAT_UNSUPPORTED"
  | "CONTENT_SIZE_EXCEEDED"

  // Prayer times errors
  | "PRAYER_TIMES_UNAVAILABLE"
  | "JAKIM_API_ERROR"
  | "PRAYER_ZONE_INVALID"
  | "PRAYER_CONFIG_MISSING"

  // Cache and network errors
  | "CACHE_MISS"
  | "CACHE_EXPIRED"
  | "NETWORK_TIMEOUT"
  | "EXTERNAL_API_ERROR"
  | "SERVICE_UNAVAILABLE";

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationErrorResponse extends ApiError {
  error: ApiError["error"] & {
    code: "VALIDATION_ERROR";
    validation_errors: ValidationError[];
  };
}

// ============================================================================
// TV Display API Response Types
// ============================================================================

export interface DisplayContentResponse extends ApiResponse {
  data: DisplayContent[];
  meta: ApiMeta & {
    carousel_interval: number;
    last_updated: string;
    next_refresh: string;
    total_active: number;
    total_pending: number;
  };
}

export interface SingleContentResponse extends ApiResponse {
  data: DisplayContent;
  meta: ApiMeta & {
    masjid_name: string;
    display_name?: string;
  };
}

export interface PrayerTimesResponse extends ApiResponse {
  data: PrayerTimes;
  meta: ApiMeta & {
    position: PrayerTimePosition;
    next_prayer: {
      name: string;
      time: string;
      countdown_minutes: number;
    };
    source: "JAKIM_API" | "MANUAL_ENTRY" | "CACHED_FALLBACK";
    zone_info: {
      code: string;
      name: string;
    };
  };
}

export interface DisplayConfigResponse extends ApiResponse {
  data: DisplayConfig;
  meta: ApiMeta & {
    masjid_name: string;
    total_displays: number;
    config_version: string;
    last_heartbeat?: string;
    status: "online" | "offline" | "unknown";
  };
}

export interface DisplayStatusResponse extends ApiResponse {
  data: DisplayStatus;
  meta: ApiMeta & {
    uptime_percentage: number;
    last_error?: string;
    performance_grade: "A" | "B" | "C" | "D" | "F";
  };
}

export interface HeartbeatResponse extends ApiResponse {
  data: {
    acknowledged: boolean;
    next_heartbeat_in: number; // seconds
    config_updated: boolean;
    force_refresh: boolean;
    server_time: string;
    display_status: "active" | "maintenance" | "disabled";
  };
  meta: ApiMeta & {
    performance_feedback?: {
      load_time_grade: string;
      suggestions: string[];
    };
  };
}

export interface ContentUploadResponse extends ApiResponse {
  data: {
    content_id: string;
    upload_url?: string;
    processing_status: "pending" | "processing" | "completed" | "failed";
    estimated_approval_time?: string;
  };
  meta: ApiMeta & {
    file_restrictions: {
      max_size: number;
      allowed_formats: string[];
      max_duration?: number;
    };
  };
}

// ============================================================================
// Analytics and Reporting Response Types
// ============================================================================

export interface AnalyticsResponse extends ApiResponse {
  data: DisplayAnalytics[];
  meta: ApiMeta & {
    date_range: {
      start: string;
      end: string;
    };
    aggregation: "daily" | "weekly" | "monthly";
    totals: {
      views: number;
      revenue: number;
      uptime_hours: number;
      error_count: number;
    };
  };
}

// ============================================================================
// Bulk Operations Response Types
// ============================================================================

export interface BulkOperationResponse extends ApiResponse {
  data: {
    operation_id: string;
    status: "pending" | "processing" | "completed" | "failed" | "partial";
    total_items: number;
    processed_items: number;
    successful_items: number;
    failed_items: number;
    errors?: Array<{
      item_id: string;
      error_code: string;
      error_message: string;
    }>;
    created_at: string;
    completed_at?: string;
  };
}

export interface BatchContentResponse extends ApiResponse {
  data: {
    accepted: Array<{
      id: string;
      title: string;
      status: "pending" | "approved";
    }>;
    rejected: Array<{
      title: string;
      reason: string;
      error_code: string;
    }>;
  };
  meta: ApiMeta & {
    processing_time: number;
    batch_id: string;
  };
}

// ============================================================================
// Search and Filter Response Types
// ============================================================================

export interface SearchResponse<T> extends ApiResponse {
  data: T[];
  meta: ApiMeta & {
    query: string;
    search_time: number;
    suggestion?: string;
    facets?: Record<
      string,
      Array<{
        value: string;
        count: number;
      }>
    >;
    highlighting?: Record<string, Record<string, string[]>>;
  };
}

export interface FilterOptions {
  field: string;
  values: Array<{
    value: string;
    label: string;
    count?: number;
  }>;
}

export interface FilterOptionsResponse extends ApiResponse {
  data: FilterOptions[];
  meta: ApiMeta & {
    context: string; // e.g., 'content', 'displays', 'sponsorships'
    last_updated: string;
  };
}

// ============================================================================
// Webhook and Event Response Types
// ============================================================================

export interface WebhookEventResponse extends ApiResponse {
  data: {
    event_id: string;
    event_type: string;
    timestamp: string;
    payload: Record<string, any>;
    delivery_attempts: number;
    status: "pending" | "delivered" | "failed";
  };
}

export interface EventSubscriptionResponse extends ApiResponse {
  data: {
    subscription_id: string;
    endpoint: string;
    events: string[];
    secret: string;
    is_active: boolean;
    created_at: string;
  };
}

// ============================================================================
// Cache Control Types
// ============================================================================

export interface CacheInfo {
  cache_hit: boolean;
  cache_key: string;
  ttl: number; // seconds
  created_at: string;
  expires_at: string;
  version: string;
}

export interface CachedResponse<T> extends ApiResponse<T> {
  meta: ApiMeta & {
    cache: CacheInfo;
  };
}

// ============================================================================
// Health Check and Status Types
// ============================================================================

export interface HealthCheckResponse extends ApiResponse {
  data: {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime: number; // seconds
    version: string;
    environment: string;
    services: Record<
      string,
      {
        status: "up" | "down" | "unknown";
        response_time?: number;
        last_check: string;
        error?: string;
      }
    >;
  };
}

export interface SystemInfoResponse extends ApiResponse {
  data: {
    api_version: string;
    database_version: string;
    node_version: string;
    environment: string;
    feature_flags: Record<string, boolean>;
    maintenance_mode: boolean;
    rate_limits: Record<
      string,
      {
        limit: number;
        window: number; // seconds
        current: number;
      }
    >;
  };
}

// ============================================================================
// Helper Functions and Utilities
// ============================================================================

export function isApiError(result: ApiResult): result is ApiError {
  return result.error !== null;
}

export function isApiSuccess<T>(
  result: ApiResult<T>
): result is ApiResponse<T> {
  return result.error === null;
}

export function createApiError(
  code: ApiErrorCode,
  message: string,
  details?: string,
  field?: string
): ApiError {
  return {
    data: null,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(field && { field }),
      timestamp: new Date().toISOString(),
    },
  };
}

export function createApiResponse<T>(
  data: T,
  meta?: ApiMeta,
  links?: ApiLinks
): ApiResponse<T> {
  return {
    data,
    ...(meta && { meta }),
    ...(links && { links }),
    error: null,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationResponse,
  totalCount?: number
): ApiResponse<T[]> {
  return {
    data,
    meta: {
      ...pagination,
      total: totalCount ?? pagination.total,
    },
    error: null,
  };
}

// ============================================================================
// Request Types for API Endpoints
// ============================================================================

export interface CreateContentRequest {
  title: string;
  description?: string;
  type: ContentType;
  file?: File | string; // File for upload or URL for YouTube
  duration: number;
  start_date: string;
  end_date: string;
  display_ids?: string[]; // Optional: specific displays, null = all displays
}

export interface UpdateContentRequest {
  title?: string;
  description?: string;
  duration?: number;
  start_date?: string;
  end_date?: string;
  status?: ContentStatus;
}

export interface ContentFiltersRequest {
  status?: ContentStatus[];
  type?: ContentType[];
  masjid_id?: string;
  display_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface UpdateDisplayConfigRequest {
  display_name?: string;
  description?: string;
  resolution?: DisplayResolution;
  orientation?: DisplayOrientation;
  carousel_interval?: number;
  max_content_items?: number;
  prayer_time_position?: PrayerTimePosition;
  prayer_time_font_size?: string;
  is_active?: boolean;
}

export interface PrayerTimeAdjustmentRequest {
  adjustments: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_CACHE_TTL = 300; // 5 minutes

export const API_VERSION = "v1";
export const API_BASE_PATH = "/api/v1";
