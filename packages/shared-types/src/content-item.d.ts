/**
 * ContentItem Model Types
 *
 * Represents displayable content (YouTube video or image) with sponsorship information
 * Used across TV display app, admin dashboard, and content management system
 */
/**
 * Content type enumeration
 */
export type ContentType = "youtube_video" | "image";
/**
 * Content status enumeration
 */
export type ContentStatus = "active" | "inactive" | "pending_approval";
/**
 * Main ContentItem entity
 * Represents displayable content with sponsorship information
 */
export interface ContentItem {
    /** Primary key - UUID */
    id: string;
    /** Content title in Bahasa Malaysia */
    title: string;
    /** Content type */
    type: ContentType;
    /** YouTube URL or image URL */
    url: string;
    /** Preview image URL */
    thumbnail_url: string;
    /** Total sponsorship funds in MYR */
    sponsorship_amount: number;
    /** Duration in seconds (for videos) or display time (for images) */
    duration: number;
    /** Content status */
    status: ContentStatus;
    /** Reference to admin who approved (UUID) */
    approved_by: string | null;
    /** Approval timestamp */
    approved_at: string | null;
    /** Record creation timestamp */
    created_at: string;
    /** Record last update timestamp */
    updated_at: string;
}
/**
 * Data for creating a new ContentItem
 * Omits auto-generated fields (id, timestamps, approval fields)
 */
export interface CreateContentRequest {
    /** Content title in Bahasa Malaysia */
    title: string;
    /** Content type */
    type: ContentType;
    /** YouTube URL or image URL */
    url: string;
    /** Preview image URL */
    thumbnail_url: string;
    /** Total sponsorship funds in MYR */
    sponsorship_amount: number;
    /** Duration in seconds (for videos) or display time (for images) */
    duration: number;
}
/**
 * Data for updating an existing ContentItem
 * All fields optional for partial updates
 */
export interface UpdateContentRequest {
    /** Content title in Bahasa Malaysia */
    title?: string;
    /** Content type */
    type?: ContentType;
    /** YouTube URL or image URL */
    url?: string;
    /** Preview image URL */
    thumbnail_url?: string;
    /** Total sponsorship funds in MYR */
    sponsorship_amount?: number;
    /** Duration in seconds (for videos) or display time (for images) */
    duration?: number;
    /** Content status */
    status?: ContentStatus;
}
/**
 * Content approval request
 */
export interface ApproveContentRequest {
    /** Reference to admin who approved (UUID) */
    approved_by: string;
    /** New status (should be 'active' or 'inactive') */
    status: Exclude<ContentStatus, "pending_approval">;
}
/**
 * Extended ContentItem information with related data
 * Used for admin dashboard and API responses with includes
 */
export interface ContentItemWithRelations extends ContentItem {
    /** Number of displays currently showing this content */
    active_displays_count: number;
    /** Total sponsorship records for this content */
    sponsorship_records_count: number;
    /** Content performance metrics */
    metrics?: {
        /** Total views across all displays */
        total_views: number;
        /** Average display duration */
        average_display_duration: number;
        /** Last displayed timestamp */
        last_displayed_at: string | null;
    };
    /** Approval information */
    approval_info?: {
        /** Admin who approved */
        approved_by_name: string;
        /** Approval timestamp */
        approved_at: string;
    };
}
/**
 * Validation constraints for ContentItem fields
 */
export declare const CONTENT_VALIDATION: {
    readonly title: {
        readonly minLength: 1;
        readonly maxLength: 200;
        readonly required: true;
        readonly pattern: RegExp;
    };
    readonly type: {
        readonly required: true;
        readonly allowedValues: ContentType[];
    };
    readonly url: {
        readonly minLength: 1;
        readonly maxLength: 2048;
        readonly required: true;
    };
    readonly thumbnail_url: {
        readonly minLength: 1;
        readonly maxLength: 2048;
        readonly required: true;
    };
    readonly sponsorship_amount: {
        readonly min: 0;
        readonly max: 99999.99;
        readonly required: true;
        readonly precision: 2;
    };
    readonly duration: {
        readonly min: 1;
        readonly max: 300;
        readonly required: true;
    };
    readonly status: {
        readonly required: true;
        readonly allowedValues: ContentStatus[];
        readonly default: ContentStatus;
    };
};
/**
 * URL validation patterns
 */
export declare const URL_PATTERNS: {
    readonly youtube: RegExp;
    readonly image: RegExp;
    readonly general: RegExp;
};
/**
 * Error codes specific to ContentItem operations
 */
export type ContentItemErrorCode = "CONTENT_NOT_FOUND" | "INVALID_CONTENT_TYPE" | "INVALID_URL_FORMAT" | "INVALID_YOUTUBE_URL" | "INVALID_IMAGE_URL" | "INVALID_SPONSORSHIP_AMOUNT" | "INVALID_DURATION" | "CONTENT_TITLE_REQUIRED" | "CONTENT_TITLE_TOO_LONG" | "CONTENT_URL_REQUIRED" | "CONTENT_THUMBNAIL_REQUIRED" | "CONTENT_ALREADY_APPROVED" | "CONTENT_ALREADY_REJECTED" | "INSUFFICIENT_SPONSORSHIP" | "CONTENT_DURATION_TOO_LONG" | "CONTENT_DURATION_TOO_SHORT" | "DUPLICATE_CONTENT_URL" | "CONTENT_HAS_ACTIVE_DISPLAYS";
/**
 * Content filtering options
 */
export interface ContentFilters {
    /** Filter by content status */
    status?: ContentStatus | ContentStatus[];
    /** Filter by content type */
    type?: ContentType | ContentType[];
    /** Filter by minimum sponsorship amount */
    min_sponsorship?: number;
    /** Filter by maximum sponsorship amount */
    max_sponsorship?: number;
    /** Search in title */
    search?: string;
    /** Filter by approval status */
    is_approved?: boolean;
    /** Filter by date range */
    date_range?: {
        start: string;
        end: string;
    };
    /** Filter by duration range */
    duration_range?: {
        min: number;
        max: number;
    };
}
/**
 * Content sorting options
 */
export type ContentSortField = "created_at" | "updated_at" | "title" | "sponsorship_amount" | "duration" | "approved_at";
export type ContentSortDirection = "asc" | "desc";
export interface ContentSort {
    field: ContentSortField;
    direction: ContentSortDirection;
}
/**
 * Validate YouTube URL format
 */
export declare function isValidYouTubeUrl(url: string): boolean;
/**
 * Validate image URL format
 */
export declare function isValidImageUrl(url: string): boolean;
/**
 * Validate URL based on content type
 */
export declare function isValidContentUrl(url: string, type: ContentType): boolean;
/**
 * Extract YouTube video ID from URL
 */
export declare function extractYouTubeVideoId(url: string): string | null;
/**
 * Generate YouTube thumbnail URL from video URL
 */
export declare function generateYouTubeThumbnail(url: string): string | null;
/**
 * Calculate content priority based on sponsorship amount
 */
export declare function calculateContentPriority(sponsorshipAmount: number): number;
/**
 * Format sponsorship amount for display
 */
export declare function formatSponsorshipAmount(amount: number): string;
/**
 * Format duration for display
 */
export declare function formatDuration(seconds: number): string;
/**
 * Get content type display name
 */
export declare function getContentTypeDisplayName(type: ContentType): string;
/**
 * Get content status display name in Bahasa Malaysia
 */
export declare function getContentStatusDisplayName(status: ContentStatus): string;
/**
 * Check if content item can be edited
 */
export declare function isContentEditable(content: ContentItem): boolean;
/**
 * Check if content item can be approved
 */
export declare function isContentApprovable(content: ContentItem): boolean;
/**
 * Check if content item can be deleted
 */
export declare function isContentDeletable(content: ContentItem): boolean;
/**
 * Type guard to check if object is a valid ContentItem
 */
export declare function isContentItem(obj: any): obj is ContentItem;
/**
 * Type guard to check if object is a valid CreateContentRequest
 */
export declare function isCreateContentRequest(obj: any): obj is CreateContentRequest;
/**
 * Type guard to check if object is a valid UpdateContentRequest
 */
export declare function isUpdateContentRequest(obj: any): obj is UpdateContentRequest;
/**
 * Available content types
 */
export declare const CONTENT_TYPES: readonly ContentType[];
/**
 * Available content statuses
 */
export declare const CONTENT_STATUSES: readonly ContentStatus[];
/**
 * Default content duration by type (in seconds)
 */
export declare const DEFAULT_CONTENT_DURATION: Record<ContentType, number>;
/**
 * Minimum sponsorship amounts by content type
 */
export declare const MIN_SPONSORSHIP_AMOUNT: Record<ContentType, number>;
/**
 * Maximum file sizes for content uploads (in bytes)
 */
export declare const MAX_FILE_SIZE: Record<ContentType, number>;
/**
 * Supported image formats
 */
export declare const SUPPORTED_IMAGE_FORMATS: readonly ["jpg", "jpeg", "png", "gif", "webp"];
/**
 * Helper function to create a new ContentItem with defaults
 */
export declare function createContentItem(data: CreateContentRequest): Omit<ContentItem, "id" | "created_at" | "updated_at" | "approved_by" | "approved_at">;
//# sourceMappingURL=content-item.d.ts.map