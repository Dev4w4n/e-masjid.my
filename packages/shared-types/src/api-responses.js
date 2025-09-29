/**
 * Standardized API Response Types for Masjid Suite
 *
 * Provides consistent response wrappers, error handling, and pagination
 * types for all API endpoints across the application
 */
// ============================================================================
// Helper Functions and Utilities
// ============================================================================
export function isApiError(result) {
    return result.error !== null;
}
export function isApiSuccess(result) {
    return result.error === null;
}
export function createApiError(code, message, details, field) {
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
export function createApiResponse(data, meta, links) {
    return {
        data,
        ...(meta && { meta }),
        ...(links && { links }),
        error: null,
    };
}
export function createPaginatedResponse(data, pagination, totalCount) {
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
};
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_CACHE_TTL = 300; // 5 minutes
export const API_VERSION = "v1";
export const API_BASE_PATH = "/api/v1";
//# sourceMappingURL=api-responses.js.map