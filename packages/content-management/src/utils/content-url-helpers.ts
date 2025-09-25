/**
 * T026: Content URL Helpers
 *
 * Utilities for handling content URLs, thumbnails, and media processing
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 */
export function generateYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'
): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Get YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  autoplay = false,
  loop = false
): string {
  const params = new URLSearchParams();

  if (autoplay) params.set('autoplay', '1');
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }

  params.set('rel', '0'); // Don't show related videos
  params.set('modestbranding', '1'); // Modest YouTube branding

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Validate if URL is a valid image URL (by extension)
 */
export function isValidImageUrl(url: string): boolean {
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.bmp',
  ];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Validate if URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Generate content display URL based on type
 */
export function getContentDisplayUrl(type: string, url: string): string {
  if (type === 'youtube_video') {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return getYouTubeEmbedUrl(videoId, true, true);
    }
  }

  return url; // For images and other content, use original URL
}

/**
 * Generate thumbnail URL for content
 */
export function getContentThumbnail(
  type: string,
  url: string,
  thumbnailUrl?: string
): string {
  // If explicit thumbnail provided, use it
  if (thumbnailUrl) {
    return thumbnailUrl;
  }

  // For YouTube videos, generate thumbnail from video ID
  if (type === 'youtube_video') {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return generateYouTubeThumbnail(videoId, 'medium');
    }
  }

  // For images, use the image itself as thumbnail
  if (type === 'image') {
    return url;
  }

  // Default placeholder for other types
  return '/placeholder-thumbnail.jpg';
}

/**
 * Get content dimensions for different display types
 */
export function getContentDimensions(
  type: string,
  displayType: 'card' | 'full' | 'thumbnail' = 'card'
): { width: number; height: number } {
  const dimensions = {
    card: {
      image: { width: 400, height: 300 },
      youtube_video: { width: 400, height: 225 }, // 16:9 aspect ratio
      text_announcement: { width: 400, height: 200 },
      event_poster: { width: 300, height: 400 },
    },
    full: {
      image: { width: 1200, height: 900 },
      youtube_video: { width: 1280, height: 720 },
      text_announcement: { width: 1200, height: 600 },
      event_poster: { width: 900, height: 1200 },
    },
    thumbnail: {
      image: { width: 150, height: 100 },
      youtube_video: { width: 150, height: 85 },
      text_announcement: { width: 150, height: 75 },
      event_poster: { width: 100, height: 150 },
    },
  };

  return (
    dimensions[displayType][type as keyof typeof dimensions.card] ||
    dimensions[displayType].image
  );
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  if (bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(1)} ${sizes[i]}`;
}

/**
 * Get content duration display string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

/**
 * Generate content preview data
 */
export interface ContentPreview {
  displayUrl: string;
  thumbnailUrl: string;
  dimensions: { width: number; height: number };
  duration: string;
  type: string;
}

export function generateContentPreview(
  type: string,
  url: string,
  duration: number = 10,
  thumbnailUrl?: string,
  displayType: 'card' | 'full' | 'thumbnail' = 'card'
): ContentPreview {
  return {
    displayUrl: getContentDisplayUrl(type, url),
    thumbnailUrl: getContentThumbnail(type, url, thumbnailUrl),
    dimensions: getContentDimensions(type, displayType),
    duration: formatDuration(duration),
    type,
  };
}
