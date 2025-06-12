import { Redis } from '@upstash/redis';
import { config } from '../config/index.js';

/**
 * Upstash Redis Memory Manager for Travel Chatbot
 * Provides persistent conversation memory using Upstash Redis
 */

export class RedisMemoryManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Initialize Upstash Redis connection
   */
  async initialize() {
    try {
      console.log('🚀 Connecting to Upstash Redis...');

      if (!config.redis.upstashUrl || !config.redis.upstashToken) {
        console.error('❌ Upstash Redis credentials not found');
        console.error('💡 Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env');
        return false;
      }

      this.client = new Redis({
        url: config.redis.upstashUrl,
        token: config.redis.upstashToken,
      });

      // Test connection
      await this.client.ping();

      this.isConnected = true;
      console.log('✅ Upstash Redis connected successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to connect to Upstash Redis:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get session key for Redis
   * @param {string} sessionId - Session identifier
   * @returns {string} Redis key
   */
  getSessionKey(sessionId) {
    return `chat_session:${sessionId}`;
  }

  /**
   * Get conversation history for a session
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Array>} Conversation history
   */
  async getConversationHistory(sessionId) {
    try {
      if (!this.isConnected) {
        console.warn('⚠️ Redis not connected, returning empty history');
        return [];
      }

      const key = this.getSessionKey(sessionId);
      const historyJson = await this.client.get(key);

      if (!historyJson) {
        return [];
      }

      let history;
      if (typeof historyJson === 'string') {
        history = JSON.parse(historyJson);
      } else if (Array.isArray(historyJson)) {
        history = historyJson;
      } else {
        console.warn('⚠️ Unexpected data format from Redis, returning empty array');
        return [];
      }

      console.log(`📚 Retrieved ${history.length} messages for session: ${sessionId}`);

      return history;

    } catch (error) {
      console.error('❌ Error getting conversation history:', error.message);
      return [];
    }
  }

  /**
   * Add message to conversation history
   * @param {string} sessionId - Session identifier
   * @param {Object} message - Message object
   */
  async addMessage(sessionId, message) {
    try {
      if (!this.isConnected) {
        console.warn('⚠️ Redis not connected, message not saved');
        return false;
      }

      const key = this.getSessionKey(sessionId);
      const history = await this.getConversationHistory(sessionId);

      // Add new message
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString()
      };

      history.push(messageWithTimestamp);

      // Limit history size
      if (history.length > config.memory.maxMessagesPerSession) {
        history.splice(0, history.length - config.memory.maxMessagesPerSession);
      }

      // Save to Upstash Redis with TTL
      const dataToSave = JSON.stringify(history);
      await this.client.setex(key, config.memory.sessionTTL, dataToSave);

      console.log(`💾 Message saved to session: ${sessionId}`);
      return true;

    } catch (error) {
      console.error('❌ Error adding message:', error.message);
      return false;
    }
  }

  /**
   * Get context messages for LLM (limited window)
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Array>} Context messages
   */
  async getContextMessages(sessionId) {
    try {
      const history = await this.getConversationHistory(sessionId);
      
      // Return only recent messages for context
      const contextSize = config.memory.contextWindowSize;
      const contextMessages = history.slice(-contextSize);

      console.log(`🧠 Retrieved ${contextMessages.length} context messages for session: ${sessionId}`);
      return contextMessages;

    } catch (error) {
      console.error('❌ Error getting context messages:', error.message);
      return [];
    }
  }

  /**
   * Clear conversation history for a session
   * @param {string} sessionId - Session identifier
   */
  async clearSession(sessionId) {
    try {
      if (!this.isConnected) {
        console.warn('⚠️ Redis not connected, cannot clear session');
        return false;
      }

      const key = this.getSessionKey(sessionId);
      await this.client.del(key);

      console.log(`🗑️ Session cleared: ${sessionId}`);
      return true;

    } catch (error) {
      console.error('❌ Error clearing session:', error.message);
      return false;
    }
  }

  /**
   * Get session statistics
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object>} Session stats
   */
  async getSessionStats(sessionId) {
    try {
      const history = await this.getConversationHistory(sessionId);
      
      const userMessages = history.filter(msg => msg.role === 'user');
      const assistantMessages = history.filter(msg => msg.role === 'assistant');

      const categories = assistantMessages
        .map(msg => msg.metadata?.category)
        .filter(Boolean);

      const locations = assistantMessages
        .map(msg => msg.metadata?.location)
        .filter(Boolean);

      return {
        sessionId,
        totalMessages: history.length,
        userMessages: userMessages.length,
        assistantMessages: assistantMessages.length,
        categoriesDiscussed: [...new Set(categories)],
        locationsDiscussed: [...new Set(locations)],
        startTime: history[0]?.timestamp,
        lastActivity: history[history.length - 1]?.timestamp,
        isActive: this.isConnected
      };

    } catch (error) {
      console.error('❌ Error getting session stats:', error.message);
      return {
        sessionId,
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        categoriesDiscussed: [],
        locationsDiscussed: [],
        startTime: null,
        lastActivity: null,
        isActive: false,
        error: error.message
      };
    }
  }

  /**
   * Extend session TTL
   * @param {string} sessionId - Session identifier
   */
  async extendSession(sessionId) {
    try {
      if (!this.isConnected) {
        return false;
      }

      const key = this.getSessionKey(sessionId);
      await this.client.expire(key, config.memory.sessionTTL);

      return true;

    } catch (error) {
      console.error('❌ Error extending session:', error.message);
      return false;
    }
  }

  /**
   * Close Redis connection (Upstash doesn't need explicit close)
   */
  async close() {
    try {
      if (this.isConnected) {
        this.isConnected = false;
        console.log('👋 Upstash Redis connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing Redis connection:', error.message);
    }
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          message: 'Redis not connected'
        };
      }

      await this.client.ping();
      
      return {
        status: 'healthy',
        message: 'Upstash Redis connection is active',
        provider: 'Upstash Redis'
      };

    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}
