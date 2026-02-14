/**
 * Simple in-memory cache service with TTL (Time To Live) expiry
 * 
 * Features:
 * - Key-value storage
 * - Automatic expiration based on TTL
 * - Manual cache invalidation
 * - Cache statistics
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 60)
   * @returns {void}
   */
  set(key, value, ttlSeconds = 60) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
    this.stats.sets++;
  }

  /**
   * Delete a specific key from cache
   * @param {string} key - Cache key to delete
   * @returns {boolean} - True if key was deleted, false if not found
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   * @returns {void}
   */
  clear() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Remove expired entries (cleanup)
   * @returns {number} - Number of expired entries removed
   */
  cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache stats
   */
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Generate cache key from prefix and params
   * @param {string} prefix - Key prefix
   * @param {object} params - Parameters to include in key
   * @returns {string} - Generated cache key
   */
  generateKey(prefix, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return paramString ? `${prefix}:${paramString}` : prefix;
  }
}

// Export singleton instance
const cacheService = new CacheService();

// Optional: Run cleanup every 5 minutes to remove expired entries
setInterval(() => {
  cacheService.cleanup();
}, 5 * 60 * 1000);

module.exports = cacheService;

