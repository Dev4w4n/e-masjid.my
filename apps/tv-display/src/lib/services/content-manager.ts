/**
 * Content Management Service
 * 
 * Advanced content management service with caching, retry logic, performance optimization,
 * and intelligent content scheduling for TV displays.
 */

import { enhancedSupabase } from './enhanced-supabase';
import { DisplayContent } from '@masjid-suite/shared-types';

/**
 * Content processing priorities
 */
export enum ContentPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4
}

/**
 * Content validation result
 */
interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Content processing options
 */
interface ContentProcessingOptions {
  /** Priority level for processing queue */
  priority: ContentPriority;
  /** Whether to skip cache and force fresh processing */
  skipCache: boolean;
  /** Maximum retries on failure */
  maxRetries: number;
  /** Timeout in milliseconds */
  timeout: number;
  /** Whether to generate thumbnails */
  generateThumbnails: boolean;
  /** Whether to optimize for TV display */
  optimizeForTV: boolean;
}

/**
 * Content metrics for analytics
 */
interface ContentMetrics {
  id: string;
  displayTime: number;
  viewCount: number;
  engagement: number;
  lastShown: Date;
  performance: 'poor' | 'average' | 'good' | 'excellent';
}

/**
 * Content queue item
 */
interface ContentQueueItem {
  content: DisplayContent;
  options: ContentProcessingOptions;
  timestamp: number;
  retryCount: number;
}

/**
 * Content scheduling rule
 */
interface SchedulingRule {
  id: string;
  name: string;
  condition: (content: DisplayContent, context: SchedulingContext) => boolean;
  weight: number;
  priority: number;
}

/**
 * Scheduling context for content decisions
 */
interface SchedulingContext {
  currentTime: Date;
  dayOfWeek: number;
  timeOfDay: 'fajr' | 'sunrise' | 'morning' | 'dhuhr' | 'afternoon' | 'asr' | 'evening' | 'maghrib' | 'night' | 'isha' | 'late-night';
  prayerTimeApproaching: boolean;
  displayUsage: 'low' | 'medium' | 'high';
  audienceSize: 'small' | 'medium' | 'large';
}

/**
 * Default processing options
 */
const DEFAULT_PROCESSING_OPTIONS: ContentProcessingOptions = {
  priority: ContentPriority.NORMAL,
  skipCache: false,
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  generateThumbnails: true,
  optimizeForTV: true
};

/**
 * Content Management Service Class
 */
export class ContentManagementService {
  private processingQueue: Map<string, ContentQueueItem> = new Map();
  private contentMetrics: Map<string, ContentMetrics> = new Map();
  private schedulingRules: SchedulingRule[] = [];
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSchedulingRules();
    this.startProcessingQueue();
  }

  /**
   * Get content for display with intelligent scheduling
   */
  async getDisplayContent(
    displayId: string,
    limit = 10,
    options: Partial<ContentProcessingOptions> = {}
  ): Promise<DisplayContent[]> {
    const processingOpts = { ...DEFAULT_PROCESSING_OPTIONS, ...options };
    
    try {
      console.log(`[ContentManager] Fetching content for display ${displayId} with options:`, processingOpts);

      // Get raw content from enhanced Supabase service
      const rawContent = await enhancedSupabase.getDisplayContent(
        displayId, 
        limit * 2, // Get more than needed for better filtering
        0,
        !processingOpts.skipCache
      );

      if (!rawContent || rawContent.length === 0) {
        console.log(`[ContentManager] No content found for display ${displayId}`);
        return [];
      }

      // Validate and filter content
      const validContent = await this.validateAndFilterContent(rawContent);
      
      // Apply intelligent scheduling
      const scheduledContent = await this.scheduleContent(validContent, displayId, limit);
      
      // Process content for TV display optimization
      if (processingOpts.optimizeForTV) {
        await this.optimizeContentForTV(scheduledContent);
      }

      // Update metrics
      this.updateContentMetrics(scheduledContent);

      console.log(`[ContentManager] Returning ${scheduledContent.length} optimized content items for display ${displayId}`);
      return scheduledContent;

    } catch (error) {
      console.error(`[ContentManager] Error fetching content for display ${displayId}:`, error);
      
      // Fallback to basic content retrieval
      return await this.getFallbackContent(displayId, limit);
    }
  }

  /**
   * Validate and filter content
   */
  private async validateAndFilterContent(content: DisplayContent[]): Promise<DisplayContent[]> {
    const validContent: DisplayContent[] = [];

    for (const item of content) {
      const validation = await this.validateContent(item);
      
      if (validation.isValid) {
        validContent.push(item);
      } else {
        console.warn(`[ContentManager] Content ${item.id} failed validation:`, validation.errors);
      }
    }

    return validContent;
  }

  /**
   * Validate individual content item
   */
  private async validateContent(content: DisplayContent): Promise<ContentValidationResult> {
    const result: ContentValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Basic validation
    if (!content.id || !content.title) {
      result.isValid = false;
      result.errors.push('Content missing required fields (id, title)');
    }

    if (!content.url) {
      result.isValid = false;
      result.errors.push('Content missing URL');
    }

    // Content type specific validation
    switch (content.type) {
      case 'youtube_video':
        if (!this.isValidYouTubeUrl(content.url)) {
          result.isValid = false;
          result.errors.push('Invalid YouTube URL format');
        }
        break;
        
      case 'image':
        if (!this.isValidImageUrl(content.url)) {
          result.isValid = false;
          result.errors.push('Invalid image URL format');
        }
        break;
        
      case 'text_announcement':
        if (!content.description || content.description.length < 10) {
          result.warnings.push('Text announcement should have meaningful description');
        }
        break;
    }

    // Check expiry
    if (content.end_date && new Date(content.end_date) < new Date()) {
      result.isValid = false;
      result.errors.push('Content has expired');
    }

    // Check schedule
    if (content.start_date && new Date(content.start_date) > new Date()) {
      result.isValid = false;
      result.errors.push('Content not yet scheduled to start');
    }

    // Performance suggestions
    if (content.type === 'youtube_video' && content.duration && content.duration > 300) {
      result.suggestions.push('Video longer than 5 minutes may impact display rotation');
    }

    return result;
  }

  /**
   * Apply intelligent content scheduling
   */
  private async scheduleContent(
    content: DisplayContent[], 
    displayId: string, 
    limit: number
  ): Promise<DisplayContent[]> {
    if (content.length <= limit) {
      return content;
    }

    const context = await this.getSchedulingContext(displayId);
    const scoredContent = content.map(item => ({
      content: item,
      score: this.calculateContentScore(item, context)
    }));

    // Sort by score (highest first) and take top items
    scoredContent.sort((a, b) => b.score - a.score);
    
    return scoredContent.slice(0, limit).map(item => item.content);
  }

  /**
   * Calculate content relevance score
   */
  private calculateContentScore(content: DisplayContent, context: SchedulingContext): number {
    let score = 0;

    // Base score from sponsorship amount
    score += Math.log(content.sponsorship_amount + 1) * 10;

    // Status-based priority (treating higher tier sponsorships as higher priority)
    const tierScore = content.sponsorship_tier === 'platinum' ? 40 : 
                     content.sponsorship_tier === 'gold' ? 30 :
                     content.sponsorship_tier === 'silver' ? 20 : 10;
    score += tierScore;

    // Freshness factor (newer content gets boost)
    const ageInDays = (Date.now() - new Date(content.created_at).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 50 - ageInDays * 2);

    // Apply scheduling rules
    for (const rule of this.schedulingRules) {
      if (rule.condition(content, context)) {
        score += rule.weight * rule.priority;
      }
    }

    // Performance factor
    const metrics = this.contentMetrics.get(content.id);
    if (metrics) {
      switch (metrics.performance) {
        case 'excellent': score += 30; break;
        case 'good': score += 15; break;
        case 'average': score += 0; break;
        case 'poor': score -= 20; break;
      }
    }

    return score;
  }

  /**
   * Get scheduling context
   */
  private async getSchedulingContext(displayId: string): Promise<SchedulingContext> {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: SchedulingContext['timeOfDay'] = 'morning';
    
    // Simplified time of day mapping
    if (hour >= 5 && hour < 7) timeOfDay = 'fajr';
    else if (hour >= 7 && hour < 9) timeOfDay = 'sunrise';
    else if (hour >= 9 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 14) timeOfDay = 'dhuhr';
    else if (hour >= 14 && hour < 16) timeOfDay = 'afternoon';
    else if (hour >= 16 && hour < 18) timeOfDay = 'asr';
    else if (hour >= 18 && hour < 20) timeOfDay = 'evening';
    else if (hour >= 20 && hour < 22) timeOfDay = 'maghrib';
    else if (hour >= 22 || hour < 2) timeOfDay = 'isha';
    else timeOfDay = 'late-night';

    return {
      currentTime: now,
      dayOfWeek: now.getDay(),
      timeOfDay,
      prayerTimeApproaching: false, // Would need prayer times data
      displayUsage: 'medium', // Would need analytics data
      audienceSize: 'medium' // Would need analytics data
    };
  }

  /**
   * Optimize content for TV display
   */
  private async optimizeContentForTV(content: DisplayContent[]): Promise<void> {
    for (const item of content) {
      try {
        // Generate thumbnails if missing
        if (!item.thumbnail_url && item.type === 'youtube_video') {
          item.thumbnail_url = this.generateYouTubeThumbnail(item.url);
        }

        // Optimize text for TV readability
        if (item.type === 'text_announcement') {
          item.description = this.optimizeTextForTV(item.description || '');
        }

        // Add cache busting for images
        if (item.type === 'image' && item.url) {
          item.url = this.addCacheBusting(item.url);
        }

      } catch (error) {
        console.warn(`[ContentManager] Failed to optimize content ${item.id}:`, error);
      }
    }
  }

  /**
   * Get fallback content in case of errors
   */
  private async getFallbackContent(displayId: string, limit: number): Promise<DisplayContent[]> {
    try {
      // Try to get cached content without validation
      return await enhancedSupabase.getDisplayContent(displayId, limit, 0, true);
    } catch (error) {
      console.error(`[ContentManager] Fallback content retrieval failed:`, error);
      return [];
    }
  }

  /**
   * Initialize default scheduling rules
   */
  private initializeSchedulingRules(): void {
    this.schedulingRules = [
      {
        id: 'friday-priority',
        name: 'Friday Priority Content',
        condition: (content, context) => 
          context.dayOfWeek === 5 && content.title.toLowerCase().includes('jumaat'),
        weight: 50,
        priority: 3
      },
      {
        id: 'prayer-time-relevant',
        name: 'Prayer Time Relevant',
        condition: (content, context) => 
          context.prayerTimeApproaching && (content.description?.toLowerCase().includes('solat') || false),
        weight: 40,
        priority: 4
      },
      {
        id: 'high-engagement',
        name: 'High Engagement Content',
        condition: (content) => {
          const metrics = this.contentMetrics.get(content.id);
          return (metrics?.engagement || 0) > 0.7;
        },
        weight: 30,
        priority: 2
      },
      {
        id: 'recent-content',
        name: 'Recent Content Boost',
        condition: (content) => {
          const ageInDays = (Date.now() - new Date(content.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return ageInDays <= 3;
        },
        weight: 20,
        priority: 2
      }
    ];
  }

  /**
   * Start background processing queue
   */
  private startProcessingQueue(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process the content queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const highPriorityItems = Array.from(this.processingQueue.values())
        .filter(item => item.options.priority >= ContentPriority.HIGH)
        .sort((a, b) => b.options.priority - a.options.priority);

      if (highPriorityItems.length > 0) {
        const firstHighPriorityItem = highPriorityItems[0];
        if (firstHighPriorityItem) {
          await this.processQueueItem(firstHighPriorityItem);
        }
      } else {
        // Process oldest normal priority item
        const oldestItem = Array.from(this.processingQueue.values())
          .sort((a, b) => a.timestamp - b.timestamp)[0];
        
        if (oldestItem) {
          await this.processQueueItem(oldestItem);
        }
      }
    } catch (error) {
      console.error('[ContentManager] Queue processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual queue item
   */
  private async processQueueItem(item: ContentQueueItem): Promise<void> {
    try {
      console.log(`[ContentManager] Processing content ${item.content.id}`);
      
      // Simulate content processing (thumbnail generation, optimization, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from queue on success
      this.processingQueue.delete(item.content.id);
      
    } catch (error) {
      item.retryCount++;
      
      if (item.retryCount >= item.options.maxRetries) {
        console.error(`[ContentManager] Content ${item.content.id} failed after ${item.retryCount} retries`);
        this.processingQueue.delete(item.content.id);
      } else {
        console.warn(`[ContentManager] Content ${item.content.id} failed, retry ${item.retryCount}/${item.options.maxRetries}`);
      }
    }
  }

  /**
   * Update content metrics
   */
  private updateContentMetrics(content: DisplayContent[]): void {
    for (const item of content) {
      const existing = this.contentMetrics.get(item.id);
      
      this.contentMetrics.set(item.id, {
        id: item.id,
        displayTime: (existing?.displayTime || 0) + 1,
        viewCount: (existing?.viewCount || 0) + 1,
        engagement: Math.random() * 0.5 + 0.5, // Mock engagement
        lastShown: new Date(),
        performance: this.calculatePerformance(item)
      });
    }
  }

  /**
   * Calculate content performance rating
   */
  private calculatePerformance(content: DisplayContent): 'poor' | 'average' | 'good' | 'excellent' {
    const metrics = this.contentMetrics.get(content.id);
    if (!metrics) return 'average';

    if (metrics.engagement > 0.8) return 'excellent';
    if (metrics.engagement > 0.6) return 'good';
    if (metrics.engagement > 0.4) return 'average';
    return 'poor';
  }

  /**
   * Utility methods
   */

  private isValidYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    return youtubeRegex.test(url);
  }

  private isValidImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith('data:image/');
  }

  private generateYouTubeThumbnail(url: string): string {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  }

  private optimizeTextForTV(text: string): string {
    // Limit text length for TV readability
    if (text.length > 200) {
      text = text.substring(0, 197) + '...';
    }
    
    // Ensure proper formatting
    return text
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .trim();
  }

  private addCacheBusting(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cb=${Date.now()}`;
  }

  /**
   * Public API methods
   */

  /**
   * Add content to processing queue
   */
  addToQueue(content: DisplayContent, options: Partial<ContentProcessingOptions> = {}): void {
    const processingOpts = { ...DEFAULT_PROCESSING_OPTIONS, ...options };
    
    this.processingQueue.set(content.id, {
      content,
      options: processingOpts,
      timestamp: Date.now(),
      retryCount: 0
    });
  }

  /**
   * Get content metrics
   */
  getContentMetrics(contentId?: string): ContentMetrics | ContentMetrics[] {
    if (contentId) {
      return this.contentMetrics.get(contentId) || {
        id: contentId,
        displayTime: 0,
        viewCount: 0,
        engagement: 0,
        lastShown: new Date(0),
        performance: 'average'
      };
    }
    
    return Array.from(this.contentMetrics.values());
  }

  /**
   * Clear all caches and metrics
   */
  clearCache(): void {
    this.contentMetrics.clear();
    this.processingQueue.clear();
    enhancedSupabase.clearCache('content');
  }

  /**
   * Get service statistics
   */
  getStats(): {
    queueSize: number;
    metricsCount: number;
    schedulingRules: number;
    cacheStats: any;
  } {
    return {
      queueSize: this.processingQueue.size,
      metricsCount: this.contentMetrics.size,
      schedulingRules: this.schedulingRules.length,
      cacheStats: enhancedSupabase.getCacheStats()
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    this.processingQueue.clear();
    this.contentMetrics.clear();
  }
}

// Create and export singleton instance
export const contentManager = new ContentManagementService();

// Export types for external use
export type { 
  ContentValidationResult, 
  ContentProcessingOptions, 
  ContentMetrics, 
  SchedulingRule, 
  SchedulingContext 
};