import { StateGraph, END } from "@langchain/langgraph";
import {
  analyzeQuery,
  decideSearchNeeded,
  searchInformation,
  generateResponse,
  checkFollowUp,
  handleError
} from './nodes.js';
import { RedisMemoryManager } from '../memory/redis-memory.js';

/**
 * Travel Chatbot Workflow using LangGraph
 */

// Define the state schema
const graphState = {
  messages: {
    value: (x, y) => x.concat(y),
    default: () => []
  },
  sessionId: {
    value: (x, y) => y ?? x,
    default: () => null
  },
  conversationHistory: {
    value: (x, y) => y ?? x,
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
    this.memoryManager = new RedisMemoryManager();
    this.isMemoryInitialized = false;
  }

  /**
   * Initialize Redis memory
   */
  async initializeMemory() {
    if (!this.isMemoryInitialized) {
      this.isMemoryInitialized = await this.memoryManager.initialize();
      if (!this.isMemoryInitialized) {
        console.warn('⚠️ Redis memory not available, using fallback mode');
      }
    }
    return this.isMemoryInitialized;
  }

  /**
   * Process a user message and return a response
   * @param {string} userMessage - User's message
   * @param {string} sessionId - Session identifier (optional, will generate if not provided)
   * @returns {Promise<Object>} Response object
   */
  async chat(userMessage, sessionId = null) {
    try {
      console.log(`\n🚀 Processing message: "${userMessage}"`);

      // Initialize memory if not done
      await this.initializeMemory();

      // Generate session ID if not provided
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // Get conversation history from Redis
      const conversationHistory = await this.memoryManager.getContextMessages(sessionId);

      // Add user message to Redis
      const userMessage_obj = {
        role: 'user',
        content: userMessage
      };
      await this.memoryManager.addMessage(sessionId, userMessage_obj);

      // Create initial state with conversation history
      const initialState = {
        messages: [{ role: 'user', content: userMessage }],
        sessionId,
        conversationHistory
      };

      // Run the workflow
      const result = await this.workflow.invoke(initialState);

      // Extract the final response
      const response = result.finalResponse || "Xin lỗi, tôi không thể tạo phản hồi cho câu hỏi này. Vui lòng thử lại hoặc hỏi câu khác.";

      // Add assistant response to Redis
      const assistantMessage = {
        role: 'assistant',
        content: response,
        metadata: {
          category: result.currentQuery?.category,
          location: result.currentQuery?.location,
          searchResultsCount: result.searchResults?.length || 0,
          needsMoreInfo: result.needsMoreInfo
        }
      };
      await this.memoryManager.addMessage(sessionId, assistantMessage);

      // Extend session TTL
      await this.memoryManager.extendSession(sessionId);

      console.log('✅ Response generated successfully');

      return {
        response,
        sessionId,
        metadata: {
          category: result.currentQuery?.category,
          location: result.currentQuery?.location,
          searchResultsCount: result.searchResults?.length || 0,
          needsMoreInfo: result.needsMoreInfo,
          memoryEnabled: this.isMemoryInitialized
        }
      };

    } catch (error) {
      console.error('❌ Chat processing error:', error);

      const errorResponse = "Xin lỗi, tôi gặp phải lỗi không mong muốn. Vui lòng thử lại.";

      // Save error response to Redis if possible
      if (sessionId && this.isMemoryInitialized) {
        const errorMessage = {
          role: 'assistant',
          content: errorResponse,
          metadata: { error: error.message }
        };
        await this.memoryManager.addMessage(sessionId, errorMessage);
      }

      return {
        response: errorResponse,
        sessionId,
        metadata: {
          error: error.message,
          memoryEnabled: this.isMemoryInitialized
        }
      };
    }
  }

  /**
   * Get conversation history for a session
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Array>} Conversation history
   */
  async getHistory(sessionId) {
    if (!sessionId || !this.isMemoryInitialized) {
      return [];
    }
    return await this.memoryManager.getConversationHistory(sessionId);
  }

  /**
   * Clear conversation history for a session
   * @param {string} sessionId - Session identifier
   */
  async clearHistory(sessionId) {
    if (!sessionId) {
      console.log('⚠️ Cannot clear history: no session ID provided');
      return false;
    }

    if (!this.isMemoryInitialized) {
      console.log('⚠️ Cannot clear history: memory not initialized');
      return false;
    }

    const result = await this.memoryManager.clearSession(sessionId);
    if (result) {
      console.log(`✅ History cleared for session: ${sessionId}`);
    } else {
      console.log(`❌ Failed to clear history for session: ${sessionId}`);
    }
    return result;
  }

  /**
   * Get conversation summary for a session
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object>} Summary statistics
   */
  async getSummary(sessionId) {
    if (!sessionId) {
      return {
        sessionId: 'unknown',
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        categoriesDiscussed: [],
        locationsDiscussed: [],
        startTime: null,
        lastActivity: null,
        memoryEnabled: this.isMemoryInitialized,
        error: 'No session ID provided'
      };
    }

    if (!this.isMemoryInitialized) {
      return {
        sessionId,
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        categoriesDiscussed: [],
        locationsDiscussed: [],
        startTime: null,
        lastActivity: null,
        memoryEnabled: false,
        error: 'Memory not initialized'
      };
    }

    return await this.memoryManager.getSessionStats(sessionId);
  }

  /**
   * Get memory health status
   * @returns {Promise<Object>} Memory health status
   */
  async getMemoryHealth() {
    if (!this.isMemoryInitialized) {
      return {
        status: 'disabled',
        message: 'Memory not initialized'
      };
    }
    return await this.memoryManager.healthCheck();
  }

  /**
   * Close memory connections
   */
  async close() {
    if (this.isMemoryInitialized) {
      await this.memoryManager.close();
      this.isMemoryInitialized = false;
    }
  }
}
