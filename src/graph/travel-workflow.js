import { StateGraph, END } from "@langchain/langgraph";
import {
  analyzeQuery,
  decideSearchNeeded,
  searchInformation,
  generateResponse,
  checkFollowUp,
  handleError
} from './nodes.js';
import { conversationMemory } from '../memory/conversation-memory.js';

/**
 * Travel Chatbot Workflow using LangGraph
 */

// Define the state schema
const graphState = {
  messages: {
    value: (x, y) => x.concat(y),
    default: () => []
  },
  currentQuery: {
    value: (x, y) => y ?? x,
    default: () => null
  },
  analysisResult: {
    value: (x, y) => y ?? x,
    default: () => null
  },
  searchResults: {
    value: (x, y) => y ?? x,
    default: () => []
  },
  finalResponse: {
    value: (x, y) => y ?? x,
    default: () => null
  },
  needsSearch: {
    value: (x, y) => y ?? x,
    default: () => false
  },
  needsMoreInfo: {
    value: (x, y) => y ?? x,
    default: () => false
  },
  error: {
    value: (x, y) => y ?? x,
    default: () => null
  },
  conversationHistory: {
    value: (x, y) => y ?? x,
    default: () => []
  }
};

/**
 * Conditional edge functions
 */

// Decide whether to search or respond directly
function shouldSearch(state) {
  // If there's an error with a response already prepared, go to end
  if (state.error && state.finalResponse) return END;

  // If there's an error without response, handle it
  if (state.error) return "handle_error";

  return state.needsSearch ? "search_information" : "generate_response";
}

// Decide whether to continue or end
function shouldContinue(state) {
  if (state.error) return "handle_error";
  return "generate_response";
}

// Final routing decision
function finalRoute(state) {
  if (state.error) return "handle_error";
  return "check_follow_up";
}

// Check follow up routing
function checkFollowUpRoute(state) {
  if (state.error) return "handle_error";
  return END;
}

/**
 * Create and configure the travel workflow graph
 */
export function createTravelWorkflow() {
  // Create the state graph
  const workflow = new StateGraph({
    channels: graphState
  });

  // Add nodes to the graph
  workflow.addNode("analyze_query", analyzeQuery);
  workflow.addNode("decide_search_needed", decideSearchNeeded);
  workflow.addNode("search_information", searchInformation);
  workflow.addNode("generate_response", generateResponse);
  workflow.addNode("check_follow_up", checkFollowUp);
  workflow.addNode("handle_error", handleError);

  // Set entry point
  workflow.setEntryPoint("analyze_query");

  // Add edges
  workflow.addEdge("analyze_query", "decide_search_needed");

  // Conditional edge: search or respond directly
  workflow.addConditionalEdges(
    "decide_search_needed",
    shouldSearch,
    {
      "search_information": "search_information",
      "generate_response": "generate_response",
      "handle_error": "handle_error",
      [END]: END
    }
  );

  // From search to response generation
  workflow.addConditionalEdges(
    "search_information",
    shouldContinue,
    {
      "generate_response": "generate_response",
      "handle_error": "handle_error"
    }
  );

  // From response generation to follow-up check
  workflow.addConditionalEdges(
    "generate_response",
    finalRoute,
    {
      "check_follow_up": "check_follow_up",
      "handle_error": "handle_error"
    }
  );

  // Final routing
  workflow.addConditionalEdges(
    "check_follow_up",
    checkFollowUpRoute,
    {
      [END]: END,
      "handle_error": "handle_error"
    }
  );

  // Error handling always goes to END
  workflow.addEdge("handle_error", END);

  // Compile the graph
  return workflow.compile();
}

/**
 * Travel Chatbot class that wraps the workflow
 */
export class TravelChatbot {
  constructor() {
    this.workflow = createTravelWorkflow();
    this.conversationHistory = [];
  }

  /**
   * Process a user message and return a response
   * @param {string} userMessage - User's message
   * @param {Array} externalHistory - External conversation history (optional)
   * @param {string} sessionId - Session identifier for memory tracking
   * @returns {Promise<Object>} Response object
   */
  async chat(userMessage, externalHistory = [], sessionId = 'default') {
    try {
      console.log(`\n🚀 Processing message: "${userMessage}" for session: ${sessionId}`);

      // Get comprehensive context from memory
      const recentContext = conversationMemory.getRecentContext(sessionId, 8);
      const contextSummary = conversationMemory.getContextSummary(sessionId);

      // Enhanced follow-up analysis with comprehensive context
      const followUpAnalysis = conversationMemory.analyzeFollowUpEnhanced(sessionId, userMessage);

      // Add user message to memory
      conversationMemory.addMessage(sessionId, userMessage, true);

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      // Use memory context instead of external history for better continuity
      const contextHistory = recentContext.length > 0 ? recentContext : externalHistory;

      // Combine context history with current message
      const allMessages = [
        ...contextHistory.map(msg => ({ role: msg.isUser ? 'user' : 'assistant', content: msg.text })),
        { role: 'user', content: userMessage }
      ];

      // Create initial state with comprehensive context
      const initialState = {
        messages: allMessages,
        conversationHistory: contextHistory,
        followUpAnalysis: followUpAnalysis,
        contextSummary: contextSummary,
        sessionId: sessionId,

        // Enhanced context for better AI responses
        comprehensiveContext: {
          primaryLocation: contextSummary.primaryLocation,
          budget: contextSummary.budget,
          duration: contextSummary.duration,
          groupType: contextSummary.groupType,
          preferences: contextSummary.preferences,
          conversationFlow: contextSummary.conversationFlow,
          lastItinerary: contextSummary.lastItinerary,
          pendingQuestions: contextSummary.pendingQuestions
        }
      };

      // Run the workflow
      const result = await this.workflow.invoke(initialState);

      // Extract the final response
      const response = result.finalResponse || "I'm sorry, I couldn't generate a response.";

      // Prepare comprehensive metadata for memory storage
      const responseMetadata = {
        category: result.currentQuery?.category,
        location: result.currentQuery?.location,
        searchResultsCount: result.searchResults?.length || 0,
        needsMoreInfo: result.needsMoreInfo,
        followUp: followUpAnalysis.isFollowUp,
        followUpType: followUpAnalysis.followUpType,

        // Extract additional context from response
        budget: this.extractBudgetFromResponse(response),
        duration: this.extractDurationFromResponse(response),
        groupType: this.extractGroupTypeFromResponse(response),
        topic: result.currentQuery?.category
      };

      // Add assistant response to memory
      conversationMemory.addMessage(sessionId, response, false, responseMetadata);

      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        metadata: responseMetadata
      });

      console.log('✅ Response generated successfully');

      return {
        response,
        metadata: {
          category: result.currentQuery?.category,
          location: result.currentQuery?.location,
          searchResultsCount: result.searchResults?.length || 0,
          needsMoreInfo: result.needsMoreInfo,
          conversationLength: this.conversationHistory.length,
          sessionId: sessionId,
          followUpDetected: followUpAnalysis.isFollowUp,
          contextUsed: contextHistory.length > 0
        }
      };

    } catch (error) {
      console.error('❌ Chat processing error:', error);

      const errorResponse = "Xin lỗi, tôi gặp phải lỗi không mong muốn. Vui lòng thử lại.";

      this.conversationHistory.push({
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date().toISOString(),
        metadata: { error: error.message }
      });

      return {
        response: errorResponse,
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Get conversation history
   * @returns {Array} Conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log('🗑️ Conversation history cleared');
  }

  /**
   * Get conversation summary
   * @param {string} sessionId - Session to get summary for
   * @returns {Object} Summary statistics
   */
  getSummary(sessionId = 'default') {
    const userMessages = this.conversationHistory.filter(msg => msg.role === 'user');
    const assistantMessages = this.conversationHistory.filter(msg => msg.role === 'assistant');

    const categories = assistantMessages
      .map(msg => msg.metadata?.category)
      .filter(Boolean);

    const locations = assistantMessages
      .map(msg => msg.metadata?.location)
      .filter(Boolean);

    // Get memory stats for this session
    const memoryContext = conversationMemory.getContextSummary(sessionId);
    const memoryStats = conversationMemory.getStats();

    return {
      totalMessages: this.conversationHistory.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      categoriesDiscussed: [...new Set(categories)],
      locationsDiscussed: [...new Set(locations)],
      startTime: this.conversationHistory[0]?.timestamp,
      lastActivity: this.conversationHistory[this.conversationHistory.length - 1]?.timestamp,
      memoryContext: memoryContext,
      memoryStats: memoryStats
    };
  }

  /**
   * Clear session memory
   * @param {string} sessionId - Session to clear
   */
  clearSessionMemory(sessionId = 'default') {
    conversationMemory.clearSession(sessionId);
    console.log(`🗑️ Cleared memory for session: ${sessionId}`);
  }

  /**
   * Get memory statistics
   * @returns {Object} Memory usage statistics
   */
  getMemoryStats() {
    return conversationMemory.getStats();
  }

  /**
   * Export session for debugging
   * @param {string} sessionId - Session to export
   * @returns {Object} Session data
   */
  exportSession(sessionId = 'default') {
    return conversationMemory.exportSession(sessionId);
  }

  /**
   * Helper methods to extract context from bot responses
   */
  extractBudgetFromResponse(response) {
    const text = response.toLowerCase();
    if (text.includes('giá rẻ') || text.includes('tiết kiệm') || text.includes('budget')) return 'budget';
    if (text.includes('cao cấp') || text.includes('luxury') || text.includes('sang trọng')) return 'luxury';
    if (text.includes('trung bình') || text.includes('vừa phải')) return 'mid-range';
    return null;
  }

  extractDurationFromResponse(response) {
    const durationMatch = response.match(/(\d+)\s*(ngày|đêm|days?|nights?)/i);
    return durationMatch ? durationMatch[0] : null;
  }

  extractGroupTypeFromResponse(response) {
    const text = response.toLowerCase();
    if (text.includes('gia đình') || text.includes('family')) return 'gia đình';
    if (text.includes('cặp đôi') || text.includes('couple')) return 'cặp đôi';
    if (text.includes('nhóm bạn') || text.includes('friends')) return 'nhóm bạn';
    if (text.includes('một mình') || text.includes('solo')) return 'một mình';
    return null;
  }
}
