/**
 * Advanced Cache Manager
 * 
 * High-performance caching system with LRU eviction, TTL support, 
 * compression, persistence, and intelligent cache invalidation.
 */

import { defaultPerformanceConfig } from './performance-config';

interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number;
  accessCount: number;
  lastAccessed: number;
  size?: number;
  compressed?: boolean;
  tags?: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  totalSize: number;
  hitRate: number;
  averageAccessTime: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  enableCompression?: boolean;
  enablePersistence?: boolean;
  persistenceKey?: string;
  enableStats?: boolean;
  onEviction?: (entry: CacheEntry) => void;
}

class AdvancedCacheManager {
  private cache = new Map<string, CacheEntry>();
  private accessOrder: string[] = [];
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    entries: 0,
    totalSize: 0,
    hitRate: 0,
    averageAccessTime: 0
  };
  
  private readonly options: Required<CacheOptions>;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private compressionWorker: Worker | null = null;

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize ?? defaultPerformanceConfig.cache.maxSize,
      defaultTTL: options.defaultTTL ?? defaultPerformanceConfig.cache.ttl,
      enableCompression: options.enableCompression ?? defaultPerformanceConfig.cache.compressionEnabled,
      enablePersistence: options.enablePersistence ?? defaultPerformanceConfig.cache.enablePersistence,
      persistenceKey: options.persistenceKey ?? 'tv-display-cache',
      enableStats: options.enableStats ?? true,
      onEviction: options.onEviction ?? (() => {})
    };

    this.initializeCache();
    this.startPeriodicCleanup();
  }

  /**
   * Initialize cache with persistence support
   */
  private async initializeCache(): Promise<void> {
    if (this.options.enablePersistence && typeof window !== 'undefined') {
      try {
        const persistedData = localStorage.getItem(this.options.persistenceKey);
        if (persistedData) {
          const parsed = JSON.parse(persistedData);
          
          // Restore cache entries
          for (const [key, entry] of Object.entries(parsed.entries || {})) {
            const cacheEntry = entry as CacheEntry;
            
            // Check if entry is still valid
            if (this.isEntryValid(cacheEntry)) {
              this.cache.set(key, cacheEntry);
              this.accessOrder.push(key);
            }
          }
          
          // Restore stats
          if (parsed.stats) {
            this.stats = { ...this.stats, ...parsed.stats };
          }
          
          console.log(`🔄 Cache restored: ${this.cache.size} entries`);
        }
      } catch (error) {
        console.warn('Failed to restore cache from persistence:', error);
      }
    }

    // Initialize compression worker if needed
    if (this.options.enableCompression && typeof Worker !== 'undefined') {
      try {
        this.compressionWorker = new Worker(
          URL.createObjectURL(
            new Blob([this.getCompressionWorkerCode()], { type: 'application/javascript' })
          )
        );
      } catch (error) {
        console.warn('Compression worker not available:', error);
      }
    }
  }

  /**
   * Set cache entry with optional TTL and tags
   */
  async set<T>(
    key: string, 
    value: T, 
    ttl?: number, 
    tags?: string[]
  ): Promise<void> {
    const startTime = performance.now();
    
    // Compress value if enabled
    let processedValue = value;
    let compressed = false;
    
    if (this.options.enableCompression && this.shouldCompress(value)) {
      try {
        processedValue = await this.compressValue(value);
        compressed = true;
      } catch (error) {
        console.warn('Compression failed, storing uncompressed:', error);
      }
    }

    const entry: CacheEntry<T> = {
      key,
      value: processedValue,
      timestamp: Date.now(),
      ttl: ttl ?? this.options.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.calculateSize(processedValue),
      compressed,
      ...(tags ? { tags } : {})
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    // Add to cache
    if (this.cache.has(key)) {
      this.removeFromAccessOrder(key);
    }
    
    this.cache.set(key, entry);
    this.accessOrder.push(key);
    
    // Update stats
    this.updateStats('set', performance.now() - startTime);
    
    // Persist if enabled
    this.persistCache();
  }

  /**
   * Get cache entry with automatic decompression
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry is expired
    if (!this.isEntryValid(entry)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access information
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    // Move to end of access order (most recently used)
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);

    // Decompress if needed
    let value = entry.value;
    if (entry.compressed) {
      try {
        value = await this.decompressValue(entry.value);
      } catch (error) {
        console.warn('Decompression failed:', error);
        return null;
      }
    }

    // Update stats
    this.stats.hits++;
    this.updateStats('get', performance.now() - startTime);
    this.updateHitRate();

    return value as T;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.options.onEviction(entry);
      this.updateStats('delete', 0);
      this.persistCache();
      return true;
    }
    return false;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      entries: 0,
      totalSize: 0,
      hitRate: 0,
      averageAccessTime: 0
    };
    this.persistCache();
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? this.isEntryValid(entry) : false;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache entries by tag
   */
  getByTag(tag: string): Map<string, any> {
    const results = new Map();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag) && this.isEntryValid(entry)) {
        results.set(key, entry.compressed ? null : entry.value); // Don't decompress for tag searches
      }
    }
    
    return results;
  }

  /**
   * Invalidate entries by tag
   */
  invalidateByTag(tag: string): number {
    let invalidatedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.delete(key);
        invalidatedCount++;
      }
    }
    
    return invalidatedCount;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isEntryValid(entry)) {
        this.delete(key);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }

  /**
   * Optimize cache performance
   */
  optimize(): {
    cleaned: number;
    compressed: number;
    freed: number;
  } {
    const cleaned = this.cleanup();
    let compressed = 0;
    let freed = 0;

    // Compress uncompressed large entries
    if (this.options.enableCompression) {
      for (const [key, entry] of this.cache.entries()) {
        if (!entry.compressed && this.shouldCompress(entry.value)) {
          const originalSize = entry.size || 0;
          this.compressValue(entry.value).then(compressedValue => {
            entry.value = compressedValue;
            entry.compressed = true;
            const newSize = this.calculateSize(compressedValue);
            entry.size = newSize;
            freed += originalSize - newSize;
            compressed++;
          }).catch(() => {
            // Compression failed, keep original
          });
        }
      }
    }

    this.persistCache();
    
    return { cleaned, compressed, freed };
  }

  /**
   * Export cache data for debugging
   */
  export(): string {
    const data = {
      entries: Array.from(this.cache.entries()).map(([entryKey, entry]) => ({
        cacheKey: entryKey,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        size: entry.size,
        compressed: entry.compressed,
        tags: entry.tags,
        value: entry.compressed ? '[compressed]' : entry.value
      })),
      accessOrder: this.accessOrder,
      stats: this.stats,
      options: this.options
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
      this.compressionWorker = null;
    }
    
    this.clear();
  }

  /**
   * Check if cache entry is valid (not expired)
   */
  private isEntryValid(entry: CacheEntry): boolean {
    if (!entry.ttl) return true;
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;
    
    const lruKey = this.accessOrder[0];
    if (!lruKey) return;
    
    const entry = this.cache.get(lruKey);
    
    if (entry) {
      this.delete(lruKey);
      console.debug(`🗑️ Evicted LRU entry: ${lruKey}`);
    }
  }

  /**
   * Remove key from access order array
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Calculate size of value in bytes (approximate)
   */
  private calculateSize(value: any): number {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return JSON.stringify(value || '').length * 2; // Approximate UTF-16 size
    }
  }

  /**
   * Determine if value should be compressed
   */
  private shouldCompress(value: any): boolean {
    const size = this.calculateSize(value);
    return size > 1024; // Compress values larger than 1KB
  }

  /**
   * Compress value using compression worker or fallback
   */
  private async compressValue(value: any): Promise<any> {
    if (this.compressionWorker) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Compression timeout')), 5000);
        
        this.compressionWorker!.onmessage = (e) => {
          clearTimeout(timeout);
          resolve(e.data.compressed);
        };
        
        this.compressionWorker!.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
        
        this.compressionWorker!.postMessage({ action: 'compress', data: value });
      });
    }
    
    // Fallback: Simple string compression
    return this.simpleCompress(JSON.stringify(value));
  }

  /**
   * Decompress value
   */
  private async decompressValue(compressedValue: any): Promise<any> {
    if (this.compressionWorker) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Decompression timeout')), 5000);
        
        this.compressionWorker!.onmessage = (e) => {
          clearTimeout(timeout);
          resolve(e.data.decompressed);
        };
        
        this.compressionWorker!.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
        
        this.compressionWorker!.postMessage({ action: 'decompress', data: compressedValue });
      });
    }
    
    // Fallback: Simple string decompression
    const decompressed = this.simpleDecompress(compressedValue);
    return JSON.parse(decompressed);
  }

  /**
   * Simple compression algorithm (LZ-like)
   */
  private simpleCompress(str: string): string {
    const dict: Record<string, number> = {};
    const result: number[] = [];
    let dictSize = 256;
    let w = '';

    for (let i = 0; i < 256; i++) {
      dict[String.fromCharCode(i)] = i;
    }

    for (const c of str) {
      const wc = w + c;
      if (dict[wc] !== undefined) {
        w = wc;
      } else {
        const wCode = dict[w];
        if (wCode !== undefined) {
          result.push(wCode);
        }
        dict[wc] = dictSize++;
        w = c;
      }
    }

    if (w !== '') {
      const wCode = dict[w];
      if (wCode !== undefined) {
        result.push(wCode);
      }
    }

    return String.fromCharCode(...result);
  }

  /**
   * Simple decompression algorithm
   */
  private simpleDecompress(compressed: string): string {
    const dict: string[] = [];
    let dictSize = 256;
    let w = '';
    const result: string[] = [];

    for (let i = 0; i < 256; i++) {
      dict[i] = String.fromCharCode(i);
    }

    const codes = compressed.split('').map(c => c.charCodeAt(0));
    const firstCode = codes[0];
    if (firstCode === undefined) {
      return '';
    }
    
    w = String.fromCharCode(firstCode);
    result.push(w);

    for (let i = 1; i < codes.length; i++) {
      const k = codes[i];
      if (k === undefined) continue;
      
      let entry: string;

      if (dict[k] !== undefined) {
        entry = dict[k]!;
      } else if (k === dictSize) {
        entry = w + w.charAt(0);
      } else {
        throw new Error('Invalid compressed data');
      }

      result.push(entry);
      dict[dictSize++] = w + entry.charAt(0);
      w = entry;
    }

    return result.join('');
  }

  /**
   * Get compression worker code as string
   */
  private getCompressionWorkerCode(): string {
    return `
      self.onmessage = function(e) {
        const { action, data } = e.data;
        
        try {
          if (action === 'compress') {
            // Simple compression implementation
            const compressed = simpleCompress(JSON.stringify(data));
            self.postMessage({ compressed });
          } else if (action === 'decompress') {
            // Simple decompression implementation
            const decompressed = JSON.parse(simpleDecompress(data));
            self.postMessage({ decompressed });
          }
        } catch (error) {
          self.postMessage({ error: error.message });
        }
      };
      
      function simpleCompress(str) {
        // Implementation would go here
        return str; // Placeholder
      }
      
      function simpleDecompress(str) {
        // Implementation would go here
        return str; // Placeholder
      }
    `;
  }

  /**
   * Update cache statistics
   */
  private updateStats(operation: 'get' | 'set' | 'delete', duration: number): void {
    this.stats.entries = this.cache.size;
    this.stats.totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + (entry.size || 0), 0);
    
    if (operation === 'get' || operation === 'set') {
      const totalOperations = this.stats.hits + this.stats.misses;
      if (totalOperations > 0) {
        this.stats.averageAccessTime = 
          (this.stats.averageAccessTime * (totalOperations - 1) + duration) / totalOperations;
      }
    }
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Persist cache to storage
   */
  private persistCache(): void {
    if (this.options.enablePersistence && typeof window !== 'undefined') {
      try {
        const data = {
          entries: Object.fromEntries(this.cache.entries()),
          stats: this.stats,
          timestamp: Date.now()
        };
        
        localStorage.setItem(this.options.persistenceKey, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to persist cache:', error);
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  private startPeriodicCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0) {
        console.debug(`🧹 Periodic cleanup: removed ${cleaned} expired entries`);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}

// Create singleton instance
export const cacheManager = new AdvancedCacheManager();

export default AdvancedCacheManager;