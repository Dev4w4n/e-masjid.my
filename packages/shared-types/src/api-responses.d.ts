/**
 * Standardized API Response Types for Masjid Suite
 *
 * Provides consistent response wrappers, error handling, and pagination
 * types for all API endpoints across the application
 */
import type { DisplayContent, PrayerTimes, DisplayConfig, DisplayStatus, Sponsorship, DisplayAnalytics, ContentType, ContentStatus, SponsorshipTier, PrayerTimePosition, DisplayResolution, DisplayOrientation } from "./tv-display";
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
export type ApiErrorCode = "INTERNAL_SERVER_ERROR" | "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "METHOD_NOT_ALLOWED" | "VALIDATION_ERROR" | "RATE_LIMIT_EXCEEDED" | "INVALID_TOKEN" | "TOKEN_EXPIRED" | "INSUFFICIENT_PERMISSIONS" | "USER_NOT_FOUND" | "MASJID_ACCESS_DENIED" | "DISPLAY_NOT_FOUND" | "DISPLAY_OFFLINE" | "DISPLAY_CONFIG_INVALID" | "CONTENT_NOT_FOUND" | "CONTENT_EXPIRED" | "CONTENT_REJECTED" | "CONTENT_UPLOAD_FAILED" | "CONTENT_FORMAT_UNSUPPORTED" | "CONTENT_SIZE_EXCEEDED" | "PRAYER_TIMES_UNAVAILABLE" | "JAKIM_API_ERROR" | "PRAYER_ZONE_INVALID" | "PRAYER_CONFIG_MISSING" | "SPONSORSHIP_PAYMENT_FAILED" | "SPONSORSHIP_AMOUNT_INVALID" | "SPONSORSHIP_TIER_MISMATCH" | "PAYMENT_REFERENCE_DUPLICATE" | "PAYMENT_VERIFICATION_FAILED" | "CACHE_MISS" | "CACHE_EXPIRED" | "NETWORK_TIMEOUT" | "EXTERNAL_API_ERROR" | "SERVICE_UNAVAILABLE";
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
export interface DisplayContentResponse extends ApiResponse {
    data: DisplayContent[];
    meta: ApiMeta & {
        carousel_interval: number;
        last_updated: string;
        next_refresh: string;
        total_active: number;
        total_pending: number;
        sponsorship_revenue: number;
    };
}
export interface SingleContentResponse extends ApiResponse {
    data: DisplayContent;
    meta: ApiMeta & {
        masjid_name: string;
        display_name?: string;
        sponsor_info?: {
            name: string;
            tier: string;
            message?: string;
        };
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
        next_heartbeat_in: number;
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
export interface SponsorshipResponse extends ApiResponse {
    data: Sponsorship;
    meta: ApiMeta & {
        payment_deadline?: string;
        tier_benefits: string[];
        next_tier_amount?: number;
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
export interface RevenueReportResponse extends ApiResponse {
    data: {
        period: string;
        total_revenue: number;
        transactions: number;
        top_sponsors: Array<{
            name: string;
            amount: number;
            content_count: number;
        }>;
        tier_breakdown: Record<SponsorshipTier, {
            count: number;
            revenue: number;
            avg_amount: number;
        }>;
    };
    meta: ApiMeta & {
        currency: "MYR";
        exchange_rate?: number;
        tax_info?: {
            rate: number;
            total_tax: number;
        };
    };
}
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
export interface SearchResponse<T> extends ApiResponse {
    data: T[];
    meta: ApiMeta & {
        query: string;
        search_time: number;
        suggestion?: string;
        facets?: Record<string, Array<{
            value: string;
            count: number;
        }>>;
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
        context: string;
        last_updated: string;
    };
}
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
export interface CacheInfo {
    cache_hit: boolean;
    cache_key: string;
    ttl: number;
    created_at: string;
    expires_at: string;
    version: string;
}
export interface CachedResponse<T> extends ApiResponse<T> {
    meta: ApiMeta & {
        cache: CacheInfo;
    };
}
export interface HealthCheckResponse extends ApiResponse {
    data: {
        status: "healthy" | "degraded" | "unhealthy";
        timestamp: string;
        uptime: number;
        version: string;
        environment: string;
        services: Record<string, {
            status: "up" | "down" | "unknown";
            response_time?: number;
            last_check: string;
            error?: string;
        }>;
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
        rate_limits: Record<string, {
            limit: number;
            window: number;
            current: number;
        }>;
    };
}
export declare function isApiError(result: ApiResult): result is ApiError;
export declare function isApiSuccess<T>(result: ApiResult<T>): result is ApiResponse<T>;
export declare function createApiError(code: ApiErrorCode, message: string, details?: string, field?: string): ApiError;
export declare function createApiResponse<T>(data: T, meta?: ApiMeta, links?: ApiLinks): ApiResponse<T>;
export declare function createPaginatedResponse<T>(data: T[], pagination: PaginationResponse, totalCount?: number): ApiResponse<T[]>;
export interface CreateContentRequest {
    title: string;
    description?: string;
    type: ContentType;
    file?: File | string;
    sponsorship_amount: number;
    duration: number;
    start_date: string;
    end_date: string;
    display_ids?: string[];
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
    min_sponsorship?: number;
    max_sponsorship?: number;
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
    show_sponsorship_amounts?: boolean;
    is_active?: boolean;
}
export interface CreateSponsorshipRequest {
    content_id: string;
    sponsor_name: string;
    sponsor_email?: string;
    sponsor_phone?: string;
    amount: number;
    payment_method: "fpx" | "credit_card" | "bank_transfer" | "cash";
    show_sponsor_name: boolean;
    sponsor_message?: string;
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
export declare const HTTP_STATUS_CODES: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly METHOD_NOT_ALLOWED: 405;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
    readonly GATEWAY_TIMEOUT: 504;
};
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare const DEFAULT_CACHE_TTL = 300;
export declare const API_VERSION = "v1";
export declare const API_BASE_PATH = "/api/v1";
//# sourceMappingURL=api-responses.d.ts.map