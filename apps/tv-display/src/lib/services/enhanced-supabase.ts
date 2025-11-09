/**
 * Enhanced Supabase Integration for TV Display
 * 
 * This service provides TV display-specific database operations with advanced
 * caching, offline support, and performance optimizations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase, databaseService } from '@masjid-suite/supabase-client';
import { 
  Database, 
  DisplayContent, 
  PrayerTimes,
  DisplayConfig
} from '@masjid-suite/shared-types';

// Type aliases for better clarity
type TVDisplay = Database['public']['Tables']['tv_displays']['Row'];
type TVDisplayInsert = Database['public']['Tables']['tv_displays']['Insert'];
type TVDisplayUpdate = Database['public']['Tables']['tv_displays']['Update'];

/**
 * Cache configuration for different data types
 */
interface CacheConfig {
  /** Cache duration in milliseconds */
  duration: number;
  /** Maximum number of entries to cache */
  maxEntries: number;
  /** Whether to persist cache to localStorage */
  persistent: boolean;
}

/**
 * Default cache configurations
 */
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  displays: { duration: 5 * 60 * 1000, maxEntries: 50, persistent: true }, // 5 minutes
  content: { duration: 10 * 60 * 1000, maxEntries: 100, persistent: true }, // 10 minutes
  prayerTimes: { duration: 60 * 60 * 1000, maxEntries: 30, persistent: true }, // 1 hour
  schedules: { duration: 15 * 60 * 1000, maxEntries: 50, persistent: true }, // 15 minutes
  configurations: { duration: 30 * 60 * 1000, maxEntries: 20, persistent: true } // 30 minutes
};

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

/**
 * Advanced caching service with persistence and LRU eviction
 */
class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Map<string, number>();
  private config: CacheConfig;
  private namespace: string;

  constructor(namespace: string, config: CacheConfig) {
    this.namespace = namespace;
    this.config = config;
    
    if (config.persistent && typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  /**
   * Set cache entry
   */
  set(key: string, data: T): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + this.config.duration,
      key
    };

    // Remove oldest entry if at capacity
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.accessOrder.set(key, now);

    if (this.config.persistent) {
      this.saveToStorage();
    }
  }

  /**
   * Get cache entry
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    
    // Check expiration
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      if (this.config.persistent) {
        this.saveToStorage();
      }
      return null;
    }

    // Update access order
    this.accessOrder.set(key, now);
    
    return entry.data;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove specific entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.accessOrder.delete(key);
    
    if (deleted && this.config.persistent) {
      this.saveToStorage();
    }
    
    return deleted;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    
    if (this.config.persistent && typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${this.namespace}`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hitRate: number; oldestEntry: number; newestEntry: number } {
    const timestamps = Array.from(this.accessOrder.values());
    
    return {
      size: this.cache.size,
      hitRate: 0, // Would need hit/miss tracking
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const serializable = Array.from(this.cache.entries()).map(([key, entry]) => ({
        cacheKey: key,
        ...entry
      }));
      
      localStorage.setItem(`cache_${this.namespace}`, JSON.stringify(serializable));
    } catch (error) {
      console.warn(`Failed to save cache ${this.namespace} to storage:`, error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(`cache_${this.namespace}`);
      if (!stored) return;

      const entries = JSON.parse(stored) as Array<CacheEntry<T> & { cacheKey: string }>;
      const now = Date.now();

      for (const entry of entries) {
        // Only load non-expired entries
        if (now <= entry.expiresAt) {
          this.cache.set(entry.cacheKey, {
            data: entry.data,
            timestamp: entry.timestamp,
            expiresAt: entry.expiresAt,
            key: entry.key
          });
          this.accessOrder.set(entry.cacheKey, entry.timestamp);
        }
      }
    } catch (error) {
      console.warn(`Failed to load cache ${this.namespace} from storage:`, error);
    }
  }
}

/**
 * Enhanced Supabase service for TV display operations
 */
export class EnhancedSupabaseService {
  private client: SupabaseClient<Database>;
  private caches: Map<string, AdvancedCache<any>>;
  private subscriptions: Map<string, () => void> = new Map();

  constructor(client: SupabaseClient<Database> = supabase) {
    this.client = client;
    this.caches = new Map();
    
    // Initialize caches
    for (const [namespace, config] of Object.entries(CACHE_CONFIGS)) {
      this.caches.set(namespace, new AdvancedCache(namespace, config));
    }
  }

  /**
   * Get cache instance for a namespace
   */
  private getCache<T>(namespace: string): AdvancedCache<T> {
    let cache = this.caches.get(namespace);
    if (!cache) {
      const cacheConfig = CACHE_CONFIGS[namespace] || CACHE_CONFIGS.displays!;
      cache = new AdvancedCache(namespace, cacheConfig);
      this.caches.set(namespace, cache);
    }
    return cache;
  }

  /**
   * TV Display Operations
   */

  /**
   * Get TV display by ID with caching
   */
  async getTVDisplay(displayId: string, useCache = true): Promise<TVDisplay | null> {
    const cacheKey = `display_${displayId}`;
    const cache = this.getCache<TVDisplay>('displays');

    if (useCache && cache.has(cacheKey)) {
      console.log(`[EnhancedSupabase] Cache hit for display ${displayId}`);
      return cache.get(cacheKey);
    }

    try {
      const { data, error } = await this.client
        .from('tv_displays')
        .select(`
          *,
          masjids (
            id,
            name,
            address,
            email,
            phone_number
          )
        `)
        .eq('id', displayId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw new Error(`Failed to fetch display: ${error.message}`);
      }

      const tvDisplay = data as TVDisplay;
      cache.set(cacheKey, tvDisplay);
      
      console.log(`[EnhancedSupabase] Fetched and cached display ${displayId}`);
      return tvDisplay;

    } catch (error) {
      console.error(`[EnhancedSupabase] Error fetching display ${displayId}:`, error);
      throw error;
    }
  }

  /**
   * Get displays for a masjid with caching
   */
  async getMasjidDisplays(masjidId: string, useCache = true): Promise<TVDisplay[]> {
    const cacheKey = `masjid_displays_${masjidId}`;
    const cache = this.getCache<TVDisplay[]>('displays');

    if (useCache && cache.has(cacheKey)) {
      console.log(`[EnhancedSupabase] Cache hit for masjid displays ${masjidId}`);
      return cache.get(cacheKey) || [];
    }

    try {
      const { data, error } = await this.client
        .from('tv_displays')
        .select('*')
        .eq('masjid_id', masjidId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch masjid displays: ${error.message}`);
      }

      const displays = (data || []) as TVDisplay[];
      cache.set(cacheKey, displays);
      
      console.log(`[EnhancedSupabase] Fetched and cached ${displays.length} displays for masjid ${masjidId}`);
      return displays;

    } catch (error) {
      console.error(`[EnhancedSupabase] Error fetching masjid displays:`, error);
      throw error;
    }
  }

  /**
   * Content Operations
   */

  /**
   * Get display content with advanced caching and scheduling
   */
  async getDisplayContent(
    displayId: string, 
    limit = 10, 
    offset = 0,
    useCache = true
  ): Promise<DisplayContent[]> {
    const cacheKey = `content_${displayId}_${limit}_${offset}`;
    const cache = this.getCache<DisplayContent[]>('content');

    if (useCache && cache.has(cacheKey)) {
      console.log(`[EnhancedSupabase] Cache hit for display content ${displayId}`);
      return cache.get(cacheKey) || [];
    }

    try {
      const { data, error } = await this.client
        .from('display_content')
        .select(`
          *,
          sponsors (
            id,
            name,
            logo_url
          )
        `)
        .eq('display_id', displayId)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch display content: ${error.message}`);
      }

      const content = (data || []) as DisplayContent[];
      cache.set(cacheKey, content);
      
      console.log(`[EnhancedSupabase] Fetched and cached ${content.length} content items for display ${displayId}`);
      return content;

    } catch (error) {
      console.error(`[EnhancedSupabase] Error fetching display content:`, error);
      throw error;
    }
  }

  /**
   * Prayer Times Operations
   */

  /**
   * Get prayer times with caching
   */
  async getPrayerTimes(
    masjidId: string, 
    date: string,
    useCache = true
  ): Promise<PrayerTimes | null> {
    const cacheKey = `prayer_${masjidId}_${date}`;
    const cache = this.getCache<PrayerTimes>('prayerTimes');

    if (useCache && cache.has(cacheKey)) {
      console.log(`[EnhancedSupabase] Cache hit for prayer times ${masjidId} ${date}`);
      return cache.get(cacheKey);
    }

    try {
      const { data, error } = await this.client
        .from('prayer_times')
        .select('*')
        .eq('masjid_id', masjidId)
        .eq('prayer_date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw new Error(`Failed to fetch prayer times: ${error.message}`);
      }

      const prayerTimes = data as PrayerTimes;
      cache.set(cacheKey, prayerTimes);
      
      console.log(`[EnhancedSupabase] Fetched and cached prayer times for ${masjidId} ${date}`);
      return prayerTimes;

    } catch (error) {
      console.error(`[EnhancedSupabase] Error fetching prayer times:`, error);
      throw error;
    }
  }

  /**
   * Store prayer times with cache invalidation
   */
  async storePrayerTimes(prayerTimes: Omit<PrayerTimes, 'id' | 'created_at' | 'updated_at'>): Promise<PrayerTimes> {
    try {
      const { data, error } = await this.client
        .from('prayer_times')
        .upsert({
          ...prayerTimes,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to store prayer times: ${error.message}`);
      }

      // Invalidate related cache entries
      const cache = this.getCache<PrayerTimes>('prayerTimes');
      const cacheKey = `prayer_${prayerTimes.masjid_id}_${prayerTimes.prayer_date}`;
      cache.set(cacheKey, data as PrayerTimes);
      
      console.log(`[EnhancedSupabase] Stored and cached prayer times for ${prayerTimes.masjid_id} ${prayerTimes.prayer_date}`);
      return data as PrayerTimes;

    } catch (error) {
      console.error(`[EnhancedSupabase] Error storing prayer times:`, error);
      throw error;
    }
  }

  /**
   * Real-time Subscriptions
   */

  /**
   * Subscribe to display configuration changes
   */
  subscribeToDisplayChanges(
    displayId: string,
    callback: (payload: any) => void
  ): () => void {
    const subscriptionKey = `display_${displayId}`;
    
    // Remove existing subscription if any
    const existingUnsub = this.subscriptions.get(subscriptionKey);
    if (existingUnsub) {
      existingUnsub();
    }

    const channel = this.client
      .channel(`display-${displayId}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tv_displays',
          filter: `id=eq.${displayId}`
        },
        (payload) => {
          console.log(`[EnhancedSupabase] Display ${displayId} changed:`, payload);
          
          // Invalidate cache
          const cache = this.getCache<TVDisplay>('displays');
          cache.delete(`display_${displayId}`);
          
          callback(payload);
        }
      )
      .subscribe();

    const unsubscribe = () => {
      this.client.removeChannel(channel);
      this.subscriptions.delete(subscriptionKey);
    };

    this.subscriptions.set(subscriptionKey, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to content changes
   * Subscribes to both display_content and display_content_assignments tables
   * to catch all content updates for a display
   */
  subscribeToContentChanges(
    displayId: string,
    callback: (payload: any) => void
  ): () => void {
    const subscriptionKey = `content_${displayId}`;
    
    // Remove existing subscription if any
    const existingUnsub = this.subscriptions.get(subscriptionKey);
    if (existingUnsub) {
      existingUnsub();
    }

    const channel = this.client
      .channel(`content-${displayId}-changes`)
      // Listen to display_content table changes for this display
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'display_content',
          filter: `display_id=eq.${displayId}`
        },
        (payload) => {
          console.log(`[EnhancedSupabase] Display content changed for display ${displayId}:`, payload);
          
          // Invalidate cache
          const cache = this.getCache<DisplayContent[]>('content');
          // Clear all content cache entries for this display
          for (const key of Array.from(cache['cache'].keys())) {
            if (key.startsWith(`content_${displayId}_`)) {
              cache.delete(key);
            }
          }
          
          callback(payload);
        }
      )
      // Also listen to display_content_assignments table changes
      // This catches when content is assigned/unassigned from this display
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'display_content_assignments',
          filter: `display_id=eq.${displayId}`
        },
        (payload) => {
          console.log(`[EnhancedSupabase] Content assignment changed for display ${displayId}:`, payload);
          
          // Invalidate cache
          const cache = this.getCache<DisplayContent[]>('content');
          // Clear all content cache entries for this display
          for (const key of Array.from(cache['cache'].keys())) {
            if (key.startsWith(`content_${displayId}_`)) {
              cache.delete(key);
            }
          }
          
          callback(payload);
        }
      )
      .subscribe();

    const unsubscribe = () => {
      this.client.removeChannel(channel);
      this.subscriptions.delete(subscriptionKey);
    };

    this.subscriptions.set(subscriptionKey, unsubscribe);
    return unsubscribe;
  }

  /**
   * Utility Methods
   */

  /**
   * Invalidate all caches
   */
  clearAllCaches(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
    console.log('[EnhancedSupabase] All caches cleared');
  }

  /**
   * Invalidate specific cache namespace
   */
  clearCache(namespace: string): void {
    const cache = this.caches.get(namespace);
    if (cache) {
      cache.clear();
      console.log(`[EnhancedSupabase] Cache ${namespace} cleared`);
    }
  }

  /**
   * Get cache statistics for all namespaces
   */
  getCacheStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [namespace, cache] of this.caches.entries()) {
      stats[namespace] = cache.getStats();
    }
    
    return stats;
  }

  /**
   * Prefetch data for offline usage
   */
  async prefetchDisplayData(displayId: string): Promise<void> {
    console.log(`[EnhancedSupabase] Prefetching data for display ${displayId}`);
    
    try {
      // Prefetch display info
      const display = await this.getTVDisplay(displayId, false);
      if (!display) {
        throw new Error(`Display ${displayId} not found`);
      }

      // Prefetch content
      await this.getDisplayContent(displayId, 50, 0, false);

      // Prefetch prayer times for today and tomorrow
      const today = new Date().toISOString().split('T')[0]!;
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;
      
      if (display.masjid_id) {
        await this.getPrayerTimes(display.masjid_id!, today, false);
        await this.getPrayerTimes(display.masjid_id!, tomorrow, false);
      }

      console.log(`[EnhancedSupabase] Successfully prefetched data for display ${displayId}`);

    } catch (error) {
      console.error(`[EnhancedSupabase] Error prefetching data for display ${displayId}:`, error);
      throw error;
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    try {
      const start = Date.now();
      const { data, error } = await this.client
        .from('masjids')
        .select('id')
        .limit(1);

      const duration = Date.now() - start;

      if (error) {
        return {
          status: 'unhealthy',
          details: { error: error.message, duration }
        };
      }

      return {
        status: duration > 1000 ? 'degraded' : 'healthy',
        details: { duration, cacheStats: this.getCacheStats() }
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();
    console.log('[EnhancedSupabase] All subscriptions cleaned up');
  }
}

// Create and export singleton instance
export const enhancedSupabase = new EnhancedSupabaseService();

// Export for testing
export { AdvancedCache };

// Export types
export type { CacheConfig, CacheEntry };