"use strict";
/**
 * Standardized API Response Types for Masjid Suite
 *
 * Provides consistent response wrappers, error handling, and pagination
 * types for all API endpoints across the application
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_BASE_PATH = exports.API_VERSION = exports.DEFAULT_CACHE_TTL = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.HTTP_STATUS_CODES = void 0;
exports.isApiError = isApiError;
exports.isApiSuccess = isApiSuccess;
exports.createApiError = createApiError;
exports.createApiResponse = createApiResponse;
exports.createPaginatedResponse = createPaginatedResponse;
// ============================================================================
// Helper Functions and Utilities
// ============================================================================
function isApiError(result) {
    return result.error !== null;
}
function isApiSuccess(result) {
    return result.error === null;
}
function createApiError(code, message, details, field) {
    return {
        data: null,
        error: __assign(__assign(__assign({ code: code, message: message }, (details && { details: details })), (field && { field: field })), { timestamp: new Date().toISOString() }),
    };
}
function createApiResponse(data, meta, links) {
    return __assign(__assign(__assign({ data: data }, (meta && { meta: meta })), (links && { links: links })), { error: null });
}
function createPaginatedResponse(data, pagination, totalCount) {
    return {
        data: data,
        meta: __assign(__assign({}, pagination), { total: totalCount !== null && totalCount !== void 0 ? totalCount : pagination.total }),
        error: null,
    };
}
// ============================================================================
// Constants
// ============================================================================
exports.HTTP_STATUS_CODES = {
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
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
exports.DEFAULT_CACHE_TTL = 300; // 5 minutes
exports.API_VERSION = "v1";
exports.API_BASE_PATH = "/api/v1";
