/**
 * Request/Response Cache System for API tracing and performance
 * Caches API responses and tracks request patterns
 */

export class RequestCache {
  constructor(options = {}) {
    this.cache = new Map(); // requestKey -> response
    this.requestHistory = new Map(); // sessionId -> requests[]
    this.maxCacheSize = options.maxCacheSize || 1000;
    this.maxHistoryPerSession = options.maxHistoryPerSession || 50;
    this.cacheTimeout = options.cacheTimeout || 60 * 60 * 1000; // 1 hour
    this.cleanupInterval = options.cleanupInterval || 10 * 60 * 1000; // 10 minutes
    
    this.startCleanupTimer();
    console.log('💾 RequestCache initialized');
  }

  /**
   * Generate cache key from request parameters
   * @param {string} message - User message
   * @param {Object} metadata - Request metadata
   * @returns {string} Cache key
   */
  generateCacheKey(message, metadata = {}) {
    const normalizedMessage = message.toLowerCase().trim();
    const keyParts = [
      normalizedMessage,
      metadata.location || '',
      metadata.category || ''
    ];
    return keyParts.join('|');
  }

  /**
   * Check if response is cached
   * @param {string} message - User message
   * @param {Object} metadata - Request metadata
   * @returns {Object|null} Cached response or null
   */
  getCachedResponse(message, metadata = {}) {
    const key = this.generateCacheKey(message, metadata);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`💾 Cache HIT for: ${message.substring(0, 50)}...`);
      return {
        ...cached.response,
        metadata: {
          ...cached.response.metadata,
          cached: true,
          cacheTimestamp: cached.timestamp
        }
      };
    }
    
    if (cached) {
      // Remove expired cache
      this.cache.delete(key);
    }
    
    console.log(`💾 Cache MISS for: ${message.substring(0, 50)}...`);
    return null;
  }

  /**
   * Cache a response
   * @param {string} message - User message
   * @param {Object} response - Bot response
   * @param {Object} metadata - Request metadata
   */
  cacheResponse(message, response, metadata = {}) {
    const key = this.generateCacheKey(message, metadata);
    
    // Don't cache error responses
    if (!response.success) {
      return;
    }
    
    this.cache.set(key, {
      response: response,
      timestamp: Date.now(),
      metadata: metadata
    });
    
    // Cleanup if cache is too large
    if (this.cache.size > this.maxCacheSize) {
      this.cleanupOldestCache();
    }
    
    console.log(`💾 Cached response for: ${message.substring(0, 50)}...`);
  }

  /**
   * Add request to history for tracing
   * @param {string} sessionId - Session ID
   * @param {Object} request - Request details
   * @param {Object} response - Response details
   */
  addToHistory(sessionId, request, response) {
    if (!this.requestHistory.has(sessionId)) {
      this.requestHistory.set(sessionId, []);
    }
    
    const history = this.requestHistory.get(sessionId);
    
    const historyEntry = {
      id: this.generateRequestId(),
      timestamp: new Date().toISOString(),
      request: {
        message: request.message,
        sessionId: request.sessionId,
        metadata: request.metadata || {}
      },
      response: {
        success: response.success,
        responseLength: response.response ? response.response.length : 0,
        category: response.metadata?.category,
        location: response.metadata?.location,
        searchResultsCount: response.metadata?.searchResultsCount || 0,
        contextUsed: response.metadata?.contextUsed || false,
        followUpDetected: response.metadata?.followUpDetected || false,
        cached: response.metadata?.cached || false
      },
      performance: {
        responseTime: request.responseTime || 0,
        cacheHit: response.metadata?.cached || false
      }
    };
    
    history.push(historyEntry);
    
    // Trim history if too long
    if (history.length > this.maxHistoryPerSession) {
      history.splice(0, history.length - this.maxHistoryPerSession);
    }
    
    console.log(`📊 Added to history: ${sessionId} - ${request.message.substring(0, 30)}...`);
  }

  /**
   * Get request history for a session
   * @param {string} sessionId - Session ID
   * @param {number} limit - Max number of entries to return
   * @returns {Array} Request history
   */
  getHistory(sessionId, limit = 20) {
    const history = this.requestHistory.get(sessionId) || [];
    return history.slice(-limit);
  }

  /**
   * Get analytics for a session
   * @param {string} sessionId - Session ID
   * @returns {Object} Session analytics
   */
  getSessionAnalytics(sessionId) {
    const history = this.getHistory(sessionId);
    
    if (history.length === 0) {
      return { hasData: false };
    }
    
    const totalRequests = history.length;
    const successfulRequests = history.filter(h => h.response.success).length;
    const cacheHits = history.filter(h => h.performance.cacheHit).length;
    const avgResponseTime = history.reduce((sum, h) => sum + h.performance.responseTime, 0) / totalRequests;
    
    // Category distribution
    const categories = {};
    history.forEach(h => {
      const cat = h.response.category || 'unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    // Location distribution
    const locations = {};
    history.forEach(h => {
      const loc = h.response.location || 'unknown';
      locations[loc] = (locations[loc] || 0) + 1;
    });
    
    return {
      hasData: true,
      totalRequests,
      successfulRequests,
      successRate: (successfulRequests / totalRequests * 100).toFixed(1),
      cacheHits,
      cacheHitRate: (cacheHits / totalRequests * 100).toFixed(1),
      avgResponseTime: avgResponseTime.toFixed(0),
      categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
      locations: Object.entries(locations).sort((a, b) => b[1] - a[1]),
      sessionStart: history[0]?.timestamp,
      lastActivity: history[history.length - 1]?.timestamp
    };
  }

  /**
   * Get global cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const totalSessions = this.requestHistory.size;
    let totalRequests = 0;
    let totalCacheHits = 0;
    
    this.requestHistory.forEach(history => {
      totalRequests += history.length;
      totalCacheHits += history.filter(h => h.performance.cacheHit).length;
    });
    
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      totalSessions,
      totalRequests,
      totalCacheHits,
      globalCacheHitRate: totalRequests > 0 ? (totalCacheHits / totalRequests * 100).toFixed(1) : '0.0',
      memoryUsage: `${this.cache.size} cached responses, ${totalRequests} total requests`
    };
  }

  /**
   * Clear cache for specific patterns
   * @param {string} pattern - Pattern to match (optional)
   */
  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      console.log('💾 Cleared entire cache');
      return;
    }
    
    let cleared = 0;
    this.cache.forEach((value, key) => {
      if (key.includes(pattern.toLowerCase())) {
        this.cache.delete(key);
        cleared++;
      }
    });
    
    console.log(`💾 Cleared ${cleared} cache entries matching: ${pattern}`);
  }

  /**
   * Clear session history
   * @param {string} sessionId - Session to clear
   */
  clearSessionHistory(sessionId) {
    if (this.requestHistory.has(sessionId)) {
      this.requestHistory.delete(sessionId);
      console.log(`📊 Cleared history for session: ${sessionId}`);
    }
  }

  /**
   * Auto-cleanup expired cache entries
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, this.cleanupInterval);
  }

  /**
   * Remove expired cache entries
   */
  cleanupExpiredCache() {
    const now = Date.now();
    let cleaned = 0;
    
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`💾 Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Remove oldest cache entries when limit exceeded
   */
  cleanupOldestCache() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, Math.floor(this.maxCacheSize * 0.1)); // Remove 10%
    toRemove.forEach(([key]) => this.cache.delete(key));
    
    console.log(`💾 Cleaned up ${toRemove.length} oldest cache entries`);
  }

  /**
   * Generate unique request ID
   * @returns {string} Unique request identifier
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
export const requestCache = new RequestCache();
