/**
 * API Utility Functions for TV Display App
 * 
 * Temporary utilities until shared-types package compilation is fixed
 */

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

  // Sponsorship errors
  | "SPONSORSHIP_PAYMENT_FAILED"
  | "SPONSORSHIP_AMOUNT_INVALID"
  | "SPONSORSHIP_TIER_MISMATCH"
  | "PAYMENT_REFERENCE_DUPLICATE"
  | "PAYMENT_VERIFICATION_FAILED"

  // Cache and network errors
  | "CACHE_MISS"
  | "CACHE_EXPIRED"
  | "NETWORK_TIMEOUT"
  | "EXTERNAL_API_ERROR"
  | "SERVICE_UNAVAILABLE";

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

export interface ApiResponse<T = any> {
  data: T;
  meta?: Record<string, any>;
  links?: Record<string, any>;
  error: null;
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
  meta?: Record<string, any>,
  links?: Record<string, any>
): ApiResponse<T> {
  return {
    data,
    ...(meta && { meta }),
    ...(links && { links }),
    error: null,
  };
}

export function isApiError(result: any): result is ApiError {
  return result.error !== null;
}

export function isApiSuccess<T>(result: any): result is ApiResponse<T> {
  return result.error === null;
}