/**
 * ContentItem Model Types
 *
 * Represents displayable content (YouTube video or image) with sponsorship information
 * Used across TV display app, admin dashboard, and content management system
 */
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
        allowedValues: ["youtube_video", "image"],
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
        ],
        default: "pending_approval",
    },
};
/**
 * URL validation patterns
 */
export const URL_PATTERNS = {
    youtube: /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+(\&[\w=]*)*$/,
    image: /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
    general: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
};
// ============================================================================
// Helper Functions and Utilities
// ============================================================================
/**
 * Validate YouTube URL format
 */
export function isValidYouTubeUrl(url) {
    return URL_PATTERNS.youtube.test(url);
}
/**
 * Validate image URL format
 */
export function isValidImageUrl(url) {
    return URL_PATTERNS.image.test(url);
}
/**
 * Validate URL based on content type
 */
export function isValidContentUrl(url, type) {
    switch (type) {
        case "youtube_video":
            return isValidYouTubeUrl(url);
        case "image":
            return isValidImageUrl(url);
        default:
            return false;
    }
}
/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
}
/**
 * Generate YouTube thumbnail URL from video URL
 */
export function generateYouTubeThumbnail(url) {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId)
        return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
/**
 * Calculate content priority based on sponsorship amount
 */
export function calculateContentPriority(sponsorshipAmount) {
    // Higher sponsorship = higher priority
    // Returns a value between 0-100
    if (sponsorshipAmount <= 0)
        return 0;
    if (sponsorshipAmount >= 1000)
        return 100;
    return Math.floor((sponsorshipAmount / 1000) * 100);
}
/**
 * Format sponsorship amount for display
 */
export function formatSponsorshipAmount(amount) {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 2,
    }).format(amount);
}
/**
 * Format duration for display
 */
export function formatDuration(seconds) {
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
export function getContentTypeDisplayName(type) {
    switch (type) {
        case "youtube_video":
            return "Video YouTube";
        case "image":
            return "Imej";
        default:
            return type;
    }
}
/**
 * Get content status display name in Bahasa Malaysia
 */
export function getContentStatusDisplayName(status) {
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
export function isContentEditable(content) {
    return content.status === "pending_approval" || content.status === "inactive";
}
/**
 * Check if content item can be approved
 */
export function isContentApprovable(content) {
    return content.status === "pending_approval";
}
/**
 * Check if content item can be deleted
 */
export function isContentDeletable(content) {
    return content.status !== "active";
}
// ============================================================================
// Type Guards
// ============================================================================
/**
 * Type guard to check if object is a valid ContentItem
 */
export function isContentItem(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        typeof obj.id === "string" &&
        typeof obj.title === "string" &&
        typeof obj.type === "string" &&
        ["youtube_video", "image"].includes(obj.type) &&
        typeof obj.url === "string" &&
        typeof obj.thumbnail_url === "string" &&
        typeof obj.sponsorship_amount === "number" &&
        typeof obj.duration === "number" &&
        typeof obj.status === "string" &&
        ["active", "inactive", "pending_approval"].includes(obj.status) &&
        typeof obj.created_at === "string" &&
        typeof obj.updated_at === "string");
}
/**
 * Type guard to check if object is a valid CreateContentRequest
 */
export function isCreateContentRequest(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        typeof obj.title === "string" &&
        typeof obj.type === "string" &&
        ["youtube_video", "image"].includes(obj.type) &&
        typeof obj.url === "string" &&
        typeof obj.thumbnail_url === "string" &&
        typeof obj.sponsorship_amount === "number" &&
        typeof obj.duration === "number");
}
/**
 * Type guard to check if object is a valid UpdateContentRequest
 */
export function isUpdateContentRequest(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        (obj.title === undefined || typeof obj.title === "string") &&
        (obj.type === undefined || ["youtube_video", "image"].includes(obj.type)) &&
        (obj.url === undefined || typeof obj.url === "string") &&
        (obj.thumbnail_url === undefined ||
            typeof obj.thumbnail_url === "string") &&
        (obj.sponsorship_amount === undefined ||
            typeof obj.sponsorship_amount === "number") &&
        (obj.duration === undefined || typeof obj.duration === "number") &&
        (obj.status === undefined ||
            ["active", "inactive", "pending_approval"].includes(obj.status)));
}
// ============================================================================
// Constants and Defaults
// ============================================================================
/**
 * Available content types
 */
export const CONTENT_TYPES = [
    "youtube_video",
    "image",
];
/**
 * Available content statuses
 */
export const CONTENT_STATUSES = [
    "active",
    "inactive",
    "pending_approval",
];
/**
 * Default content duration by type (in seconds)
 */
export const DEFAULT_CONTENT_DURATION = {
    youtube_video: 30,
    image: 10,
};
/**
 * Minimum sponsorship amounts by content type
 */
export const MIN_SPONSORSHIP_AMOUNT = {
    youtube_video: 50.0,
    image: 20.0,
};
/**
 * Maximum file sizes for content uploads (in bytes)
 */
export const MAX_FILE_SIZE = {
    youtube_video: 0, // No file upload for YouTube videos
    image: 10 * 1024 * 1024, // 10MB for images
};
/**
 * Supported image formats
 */
export const SUPPORTED_IMAGE_FORMATS = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
];
/**
 * Helper function to create a new ContentItem with defaults
 */
export function createContentItem(data) {
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
//# sourceMappingURL=content-item.js.map