/**
 * In-memory conversation storage for chatbot context tracing
 * Separate from website database - purely for chatbot intelligence
 */

export class ConversationMemory {
  constructor(options = {}) {
    this.sessions = new Map(); // sessionId -> messages[]
    this.maxMessagesPerSession = options.maxMessages || 8; // 4 Q&A pairs
    this.sessionTimeout = options.sessionTimeout || 30 * 60 * 1000; // 30 minutes
    this.cleanupInterval = options.cleanupInterval || 5 * 60 * 1000; // 5 minutes
    
    // Auto-cleanup old sessions
    this.startCleanupTimer();
    
    console.log('🧠 ConversationMemory initialized');
  }

  /**
   * Add a message to session history
   * @param {string} sessionId - Unique session identifier
   * @param {string} message - Message content
   * @param {boolean} isUser - True if user message, false if bot response
   * @param {Object} metadata - Additional context (location, category, etc.)
   */
  addMessage(sessionId, message, isUser, metadata = {}) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        messages: [],
        lastActivity: Date.now(),
        sessionStart: Date.now()
      });
    }

    const session = this.sessions.get(sessionId);
    
    // Add new message
    session.messages.push({
      id: this.generateMessageId(),
      text: message,
      isUser: isUser,
      timestamp: new Date().toISOString(),
      metadata: metadata
    });

    // Update last activity
    session.lastActivity = Date.now();

    // Trim to max messages (keep most recent)
    if (session.messages.length > this.maxMessagesPerSession) {
      session.messages = session.messages.slice(-this.maxMessagesPerSession);
    }

    console.log(`💬 Added message to session ${sessionId}: ${isUser ? 'User' : 'Bot'} - ${message.substring(0, 50)}...`);
  }

  /**
   * Get recent conversation context for a session
   * @param {string} sessionId - Session identifier
   * @param {number} messageCount - Number of recent messages to return
   * @returns {Array} Recent messages in conversation format
   */
  getRecentContext(sessionId, messageCount = 6) {
    if (!this.sessions.has(sessionId)) {
      return [];
    }

    const session = this.sessions.get(sessionId);
    const recentMessages = session.messages.slice(-messageCount);
    
    console.log(`🔍 Retrieved ${recentMessages.length} recent messages for session ${sessionId}`);
    return recentMessages;
  }

  /**
   * Get comprehensive contextual information for smart responses
   * @param {string} sessionId - Session identifier
   * @returns {Object} Comprehensive context summary
   */
  getContextSummary(sessionId) {
    const recentMessages = this.getRecentContext(sessionId, 8);

    if (recentMessages.length === 0) {
      return { hasContext: false };
    }

    // Extract comprehensive context information
    const locations = new Set();
    const categories = new Set();
    const topics = new Set();
    const budgetKeywords = new Set();
    const timeKeywords = new Set();
    const groupKeywords = new Set();
    const preferences = new Set();

    // Analyze message content and metadata
    recentMessages.forEach(msg => {
      const text = msg.text.toLowerCase();

      // Extract from metadata
      if (msg.metadata) {
        if (msg.metadata.location) locations.add(msg.metadata.location);
        if (msg.metadata.category) categories.add(msg.metadata.category);
        if (msg.metadata.topic) topics.add(msg.metadata.topic);
        if (msg.metadata.budget) budgetKeywords.add(msg.metadata.budget);
        if (msg.metadata.duration) timeKeywords.add(msg.metadata.duration);
        if (msg.metadata.groupType) groupKeywords.add(msg.metadata.groupType);
      }

      // Extract from message text
      this.extractContextFromText(text, {
        locations, categories, budgetKeywords,
        timeKeywords, groupKeywords, preferences
      });
    });

    // Build comprehensive context
    const context = {
      hasContext: true,
      messageCount: recentMessages.length,
      lastActivity: this.sessions.get(sessionId).lastActivity,

      // Location context
      recentLocations: Array.from(locations),
      primaryLocation: this.getPrimaryLocation(locations),

      // Topic context
      recentCategories: Array.from(categories),
      recentTopics: Array.from(topics),
      conversationFlow: this.analyzeConversationFlow(recentMessages),

      // Travel context
      budget: this.extractBudgetContext(budgetKeywords),
      duration: this.extractDurationContext(timeKeywords),
      groupType: this.extractGroupContext(groupKeywords),
      preferences: Array.from(preferences),

      // Conversation state
      lastItinerary: this.extractLastItinerary(recentMessages),
      pendingQuestions: this.extractPendingQuestions(recentMessages),
      clarificationNeeded: this.checkClarificationNeeded(recentMessages)
    };

    return context;
  }

  /**
   * Extract context information from message text
   * @param {string} text - Message text
   * @param {Object} contextSets - Sets to populate with extracted context
   */
  extractContextFromText(text, contextSets) {
    // Budget indicators
    const budgetPatterns = {
      'giá rẻ': ['giá rẻ', 'tiết kiệm', 'budget', 'rẻ nhất'],
      'trung bình': ['trung bình', 'vừa phải', 'bình thường'],
      'cao cấp': ['cao cấp', 'luxury', 'sang trọng', 'đắt tiền']
    };

    // Duration indicators
    const durationPatterns = [
      /(\d+)\s*(ngày|đêm|days?|nights?)/gi,
      /(nửa ngày|buổi sáng|buổi chiều|buổi tối)/gi
    ];

    // Group type indicators
    const groupPatterns = {
      'gia đình': ['gia đình', 'family', 'trẻ em', 'bố mẹ'],
      'cặp đôi': ['cặp đôi', 'couple', 'hai người', '2 người'],
      'nhóm bạn': ['nhóm bạn', 'friends', 'bạn bè', 'đi chơi'],
      'một mình': ['một mình', 'solo', 'du lịch bụi']
    };

    // Preference indicators
    const preferencePatterns = {
      'ẩm thực': ['ăn uống', 'món ngon', 'quán ăn', 'food'],
      'tham quan': ['tham quan', 'sightseeing', 'check in'],
      'nghỉ dưỡng': ['nghỉ dưỡng', 'relax', 'spa', 'resort'],
      'mạo hiểm': ['mạo hiểm', 'adventure', 'thể thao'],
      'văn hóa': ['văn hóa', 'lịch sử', 'museum', 'temple']
    };

    // Extract budget context
    Object.entries(budgetPatterns).forEach(([budget, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        contextSets.budgetKeywords.add(budget);
      }
    });

    // Extract duration context
    durationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => contextSets.timeKeywords.add(match));
      }
    });

    // Extract group context
    Object.entries(groupPatterns).forEach(([group, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        contextSets.groupKeywords.add(group);
      }
    });

    // Extract preferences
    Object.entries(preferencePatterns).forEach(([pref, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        contextSets.preferences.add(pref);
      }
    });
  }

  /**
   * Check if current query is a follow-up to previous conversation
   * @param {string} sessionId - Session identifier
   * @param {string} currentQuery - Current user query
   * @returns {Object} Follow-up analysis
   */
  analyzeFollowUp(sessionId, currentQuery) {
    const context = this.getContextSummary(sessionId);
    
    if (!context.hasContext) {
      return { isFollowUp: false };
    }

    const query = currentQuery.toLowerCase();
    
    // Check for follow-up indicators
    const followUpIndicators = [
      'gần đó', 'ở đó', 'khu vực đó', 'around there',
      'thế nào', 'như thế nào', 'how about',
      'còn gì', 'gì khác', 'what else',
      'giá cả', 'chi phí', 'cost', 'price',
      'thời gian', 'giờ mở cửa', 'hours',
      'cách đi', 'di chuyển', 'how to get'
    ];

    const isFollowUp = followUpIndicators.some(indicator => 
      query.includes(indicator)
    );

    return {
      isFollowUp,
      contextLocations: context.recentLocations,
      contextCategories: context.recentCategories,
      suggestedContext: isFollowUp ? context.recentLocations[0] : null
    };
  }

  /**
   * Clear session history
   * @param {string} sessionId - Session to clear
   */
  clearSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      console.log(`🗑️ Cleared session ${sessionId}`);
    }
  }

  /**
   * Get session statistics
   * @returns {Object} Memory usage stats
   */
  getStats() {
    const totalSessions = this.sessions.size;
    let totalMessages = 0;
    let activeSessions = 0;
    const now = Date.now();

    this.sessions.forEach(session => {
      totalMessages += session.messages.length;
      if (now - session.lastActivity < this.sessionTimeout) {
        activeSessions++;
      }
    });

    return {
      totalSessions,
      activeSessions,
      totalMessages,
      memoryUsage: `${totalSessions} sessions, ${totalMessages} messages`
    };
  }

  /**
   * Auto-cleanup expired sessions
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.cleanupInterval);
  }

  /**
   * Remove expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    this.sessions.forEach((session, sessionId) => {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  /**
   * Helper methods for comprehensive context analysis
   */

  getPrimaryLocation(locations) {
    // Return the most recently mentioned location
    return locations.size > 0 ? Array.from(locations)[locations.size - 1] : null;
  }

  extractBudgetContext(budgetKeywords) {
    if (budgetKeywords.has('giá rẻ')) return 'budget';
    if (budgetKeywords.has('cao cấp')) return 'luxury';
    if (budgetKeywords.has('trung bình')) return 'mid-range';
    return null;
  }

  extractDurationContext(timeKeywords) {
    const durations = Array.from(timeKeywords);
    // Return the most specific duration mentioned
    return durations.length > 0 ? durations[durations.length - 1] : null;
  }

  extractGroupContext(groupKeywords) {
    // Return the most recently mentioned group type
    return groupKeywords.size > 0 ? Array.from(groupKeywords)[groupKeywords.size - 1] : null;
  }

  analyzeConversationFlow(messages) {
    if (messages.length < 2) return 'initial';

    const categories = messages.map(msg => msg.metadata?.category).filter(Boolean);
    const lastCategories = categories.slice(-3);

    // Detect conversation patterns
    if (lastCategories.includes('itinerary')) return 'itinerary_planning';
    if (lastCategories.includes('food') && lastCategories.includes('attractions')) return 'comprehensive_planning';
    if (lastCategories.every(cat => cat === lastCategories[0])) return 'focused_topic';

    return 'exploratory';
  }

  extractLastItinerary(messages) {
    // Find the most recent itinerary in the conversation
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (!msg.isUser && msg.metadata?.category === 'itinerary') {
        return {
          content: msg.text,
          timestamp: msg.timestamp,
          metadata: msg.metadata
        };
      }
    }
    return null;
  }

  extractPendingQuestions(messages) {
    const pendingQuestions = [];

    // Look for bot questions that haven't been answered
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (!msg.isUser && msg.text.includes('?')) {
        // Check if there's a user response after this question
        const hasResponse = messages.slice(i + 1).some(m => m.isUser);
        if (!hasResponse) {
          pendingQuestions.push(msg.text);
        }
      }
    }

    return pendingQuestions;
  }

  checkClarificationNeeded(messages) {
    const lastBotMessage = messages.filter(m => !m.isUser).pop();
    if (!lastBotMessage) return false;

    // Check if last bot message asked for clarification
    const clarificationIndicators = [
      'bạn có thể cho biết',
      'thành phố nào',
      'cụ thể hơn',
      'which',
      'where exactly'
    ];

    return clarificationIndicators.some(indicator =>
      lastBotMessage.text.toLowerCase().includes(indicator)
    );
  }

  /**
   * Enhanced follow-up analysis with comprehensive context
   * @param {string} sessionId - Session identifier
   * @param {string} currentQuery - Current user query
   * @returns {Object} Enhanced follow-up analysis
   */
  analyzeFollowUpEnhanced(sessionId, currentQuery) {
    const context = this.getContextSummary(sessionId);

    if (!context.hasContext) {
      return { isFollowUp: false, contextType: 'none' };
    }

    const query = currentQuery.toLowerCase();

    // Enhanced follow-up indicators
    const followUpPatterns = {
      location: ['gần đó', 'ở đó', 'khu vực đó', 'around there', 'nearby'],
      topic: ['thế nào', 'như thế nào', 'how about', 'what about'],
      continuation: ['còn gì', 'gì khác', 'what else', 'anything else'],
      details: ['giá cả', 'chi phí', 'cost', 'price', 'bao nhiêu'],
      budget: ['ngân sách', 'budget', 'triệu', 'nghìn', 'tiền', 'giá rẻ', 'tiết kiệm', 'ít tiền'],
      timing: ['thời gian', 'giờ mở cửa', 'hours', 'when'],
      transport: ['cách đi', 'di chuyển', 'how to get', 'transportation'],
      clarification: ['đúng không', 'phải không', 'right?', 'correct?']
    };

    let followUpType = null;
    let confidence = 0;

    // Detect follow-up type
    Object.entries(followUpPatterns).forEach(([type, patterns]) => {
      const matches = patterns.filter(pattern => query.includes(pattern)).length;
      if (matches > 0) {
        followUpType = type;
        confidence = matches;
      }
    });

    let isFollowUp = followUpType !== null;

    // Special case: Budget follow-up detection
    // If previous conversation mentioned travel destinations and current query mentions budget
    if (!isFollowUp && context.recentLocations.length > 0) {
      const budgetIndicators = ['triệu', 'nghìn', 'ngân sách', 'budget', 'tiền', 'chi phí'];
      const hasBudgetMention = budgetIndicators.some(indicator => query.includes(indicator));

      if (hasBudgetMention) {
        followUpType = 'budget';
        confidence = 1;
        isFollowUp = true;
      }
    }

    return {
      isFollowUp,
      followUpType,
      confidence,
      contextType: this.determineContextType(context),
      suggestedContext: this.buildSuggestedContext(context, followUpType),
      conversationState: {
        primaryLocation: context.primaryLocation,
        budget: context.budget,
        duration: context.duration,
        groupType: context.groupType,
        preferences: context.preferences,
        lastItinerary: context.lastItinerary,
        pendingQuestions: context.pendingQuestions
      }
    };
  }

  determineContextType(context) {
    if (context.lastItinerary) return 'itinerary_context';
    if (context.primaryLocation) return 'location_context';
    if (context.budget || context.duration) return 'planning_context';
    if (context.preferences.length > 0) return 'preference_context';
    return 'general_context';
  }

  buildSuggestedContext(context, followUpType) {
    const suggestions = {
      location: context.primaryLocation,
      budget: context.budget,
      duration: context.duration,
      groupType: context.groupType,
      preferences: context.preferences.join(', '),
      lastTopic: context.recentCategories[context.recentCategories.length - 1]
    };

    // Build context string based on follow-up type
    switch (followUpType) {
      case 'location':
        return `Location context: ${suggestions.location}`;
      case 'details':
        return `Budget context: ${suggestions.budget || 'not specified'}`;
      case 'budget':
        return `Budget planning for: ${suggestions.location || 'previous destination'}`;
      case 'continuation':
        return `Topic context: ${suggestions.lastTopic}`;
      default:
        return `General context: ${suggestions.location || 'various topics discussed'}`;
    }
  }

  /**
   * Generate unique message ID
   * @returns {string} Unique message identifier
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export session for debugging
   * @param {string} sessionId - Session to export
   * @returns {Object} Session data
   */
  exportSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      return null;
    }

    const session = this.sessions.get(sessionId);
    return {
      sessionId,
      messageCount: session.messages.length,
      sessionStart: new Date(session.sessionStart).toISOString(),
      lastActivity: new Date(session.lastActivity).toISOString(),
      messages: session.messages
    };
  }
}

// Singleton instance for the chatbot
export const conversationMemory = new ConversationMemory({
  maxMessages: 8,        // 4 Q&A pairs
  sessionTimeout: 30 * 60 * 1000,  // 30 minutes
  cleanupInterval: 5 * 60 * 1000   // 5 minutes cleanup
});

export default conversationMemory;
