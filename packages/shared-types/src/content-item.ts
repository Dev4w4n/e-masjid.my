/**
 * ContentItem Model Types
 *
 * Represents displayable content (YouTube video or image) with sponsorship information
 * Used across TV display app, admin dashboard, and content management system
 */

// ============================================================================
// Core ContentItem Types
// ============================================================================

/**
 * Content type enumeration
 */
export type ContentType = "youtube_video" | "image" | "text_announcement";

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

// ============================================================================
// Content Validation Types
// ============================================================================

/**
 * Validation constraints for ContentItem fields
 */
export const CONTENT_VALIDATION = {
  title: {
    minLength: 1,
    maxLength: 200,
    required: true,
    pattern: /^[\p{L}\p{N}\s\-.,()!?&]+$/u, // Unicode letters, numbers, spaces, and common punctuation
  },
  type: {
    required: true,
    allowedValues: [
      "youtube_video",
      "image",
      "text_announcement",
    ] as ContentType[],
  },
  url: {
    minLength: 1,
    maxLength: 2048,
    required: true,
  },
  thumbnail_url: {
    minLength: 1,
    maxLength: 2048,
    required: true,
  },
  sponsorship_amount: {
    min: 0,
    max: 99999.99,
    required: true,
    precision: 2, // Two decimal places for currency
  },
  duration: {
    min: 1,
    max: 300, // 5 minutes maximum
    required: true,
  },
  status: {
    required: true,
    allowedValues: [
      "active",
      "inactive",
      "pending_approval",
    ] as ContentStatus[],
    default: "pending_approval" as ContentStatus,
  },
} as const;

/**
 * URL validation patterns
 */
export const URL_PATTERNS = {
  youtube:
    /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+(\&[\w=]*)*$/,
  image: /^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?$/i,
  general: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
} as const;

/**
 * Error codes specific to ContentItem operations
 */
export type ContentItemErrorCode =
  | "CONTENT_NOT_FOUND"
  | "INVALID_CONTENT_TYPE"
  | "INVALID_URL_FORMAT"
  | "INVALID_YOUTUBE_URL"
  | "INVALID_IMAGE_URL"
  | "INVALID_SPONSORSHIP_AMOUNT"
  | "INVALID_DURATION"
  | "CONTENT_TITLE_REQUIRED"
  | "CONTENT_TITLE_TOO_LONG"
  | "CONTENT_URL_REQUIRED"
  | "CONTENT_THUMBNAIL_REQUIRED"
  | "CONTENT_ALREADY_APPROVED"
  | "CONTENT_ALREADY_REJECTED"
  | "INSUFFICIENT_SPONSORSHIP"
  | "CONTENT_DURATION_TOO_LONG"
  | "CONTENT_DURATION_TOO_SHORT"
  | "DUPLICATE_CONTENT_URL"
  | "CONTENT_HAS_ACTIVE_DISPLAYS";

// ============================================================================
// Content Filtering and Sorting
// ============================================================================

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
export type ContentSortField =
  | "created_at"
  | "updated_at"
  | "title"
  | "sponsorship_amount"
  | "duration"
  | "approved_at";

export type ContentSortDirection = "asc" | "desc";

export interface ContentSort {
  field: ContentSortField;
  direction: ContentSortDirection;
}

// ============================================================================
// Helper Functions and Utilities
// ============================================================================

/**
 * Validate YouTube URL format
 */
export function isValidYouTubeUrl(url: string): boolean {
  return URL_PATTERNS.youtube.test(url);
}

/**
 * Validate image URL format
 */
export function isValidImageUrl(url: string): boolean {
  return URL_PATTERNS.image.test(url);
}

/**
 * Validate URL based on content type
 */
export function isValidContentUrl(url: string, type: ContentType): boolean {
  switch (type) {
    case "youtube_video":
      return isValidYouTubeUrl(url);
    case "image":
      return isValidImageUrl(url);
    case "text_announcement":
      // For text announcements, we store the text content in the url field
      return url.length > 0 && url.length <= 5000; // Max 5000 characters
    default:
      return false;
  }
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : null;
}

/**
 * Generate YouTube thumbnail URL from video URL
 */
export function generateYouTubeThumbnail(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Calculate content priority based on sponsorship amount
 */
export function calculateContentPriority(sponsorshipAmount: number): number {
  // Higher sponsorship = higher priority
  // Returns a value between 0-100
  if (sponsorshipAmount <= 0) return 0;
  if (sponsorshipAmount >= 1000) return 100;
  return Math.floor((sponsorshipAmount / 1000) * 100);
}

/**
 * Format sponsorship amount for display
 */
export function formatSponsorshipAmount(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Get content type display name
 */
export function getContentTypeDisplayName(type: ContentType): string {
  switch (type) {
    case "youtube_video":
      return "Video YouTube";
    case "image":
      return "Imej";
    case "text_announcement":
      return "Pengumuman Teks";
    default:
      return type;
  }
}

/**
 * Get content status display name in Bahasa Malaysia
 */
export function getContentStatusDisplayName(status: ContentStatus): string {
  switch (status) {
    case "active":
      return "Aktif";
    case "inactive":
      return "Tidak Aktif";
    case "pending_approval":
      return "Menunggu Kelulusan";
    default:
      return status;
  }
}

/**
 * Check if content item can be edited
 */
export function isContentEditable(content: ContentItem): boolean {
  return content.status === "pending_approval" || content.status === "inactive";
}

/**
 * Check if content item can be approved
 */
export function isContentApprovable(content: ContentItem): boolean {
  return content.status === "pending_approval";
}

/**
 * Check if content item can be deleted
 */
export function isContentDeletable(content: ContentItem): boolean {
  return content.status !== "active";
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if object is a valid ContentItem
 */
export function isContentItem(obj: any): obj is ContentItem {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.type === "string" &&
    ["youtube_video", "image", "text_announcement"].includes(obj.type) &&
    typeof obj.url === "string" &&
    typeof obj.thumbnail_url === "string" &&
    typeof obj.sponsorship_amount === "number" &&
    typeof obj.duration === "number" &&
    typeof obj.status === "string" &&
    ["active", "inactive", "pending_approval"].includes(obj.status) &&
    typeof obj.created_at === "string" &&
    typeof obj.updated_at === "string"
  );
}

/**
 * Type guard to check if object is a valid CreateContentRequest
 */
export function isCreateContentRequest(obj: any): obj is CreateContentRequest {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.title === "string" &&
    typeof obj.type === "string" &&
    ["youtube_video", "image", "text_announcement"].includes(obj.type) &&
    typeof obj.url === "string" &&
    typeof obj.thumbnail_url === "string" &&
    typeof obj.sponsorship_amount === "number" &&
    typeof obj.duration === "number"
  );
}

/**
 * Type guard to check if object is a valid UpdateContentRequest
 */
export function isUpdateContentRequest(obj: any): obj is UpdateContentRequest {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (obj.title === undefined || typeof obj.title === "string") &&
    (obj.type === undefined ||
      ["youtube_video", "image", "text_announcement"].includes(obj.type)) &&
    (obj.url === undefined || typeof obj.url === "string") &&
    (obj.thumbnail_url === undefined ||
      typeof obj.thumbnail_url === "string") &&
    (obj.sponsorship_amount === undefined ||
      typeof obj.sponsorship_amount === "number") &&
    (obj.duration === undefined || typeof obj.duration === "number") &&
    (obj.status === undefined ||
      ["active", "inactive", "pending_approval"].includes(obj.status))
  );
}

// ============================================================================
// Constants and Defaults
// ============================================================================

/**
 * Available content types
 */
export const CONTENT_TYPES: readonly ContentType[] = [
  "youtube_video",
  "image",
  "text_announcement",
] as const;

/**
 * Available content statuses
 */
export const CONTENT_STATUSES: readonly ContentStatus[] = [
  "active",
  "inactive",
  "pending_approval",
] as const;

/**
 * Default content duration by type (in seconds)
 */
export const DEFAULT_CONTENT_DURATION: Record<ContentType, number> = {
  youtube_video: 30,
  image: 10,
  text_announcement: 15,
} as const;

/**
 * Minimum sponsorship amounts by content type
 */
export const MIN_SPONSORSHIP_AMOUNT: Record<ContentType, number> = {
  youtube_video: 50.0,
  image: 20.0,
  text_announcement: 10.0,
} as const;

/**
 * Maximum file sizes for content uploads (in bytes)
 */
export const MAX_FILE_SIZE: Record<ContentType, number> = {
  youtube_video: 0, // No file upload for YouTube videos
  image: 10 * 1024 * 1024, // 10MB for images
  text_announcement: 0, // No file upload for text announcements
} as const;

/**
 * Supported image formats
 */
export const SUPPORTED_IMAGE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
] as const;

/**
 * Helper function to create a new ContentItem with defaults
 */
export function createContentItem(
  data: CreateContentRequest
): Omit<
  ContentItem,
  "id" | "created_at" | "updated_at" | "approved_by" | "approved_at"
> {
  return {
    title: data.title.trim(),
    type: data.type,
    url: data.url.trim(),
    thumbnail_url: data.thumbnail_url.trim(),
    sponsorship_amount: Number(data.sponsorship_amount.toFixed(2)),
    duration: Math.max(1, data.duration),
    status: "pending_approval",
  };
}
