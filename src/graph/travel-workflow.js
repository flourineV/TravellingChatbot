import { StateGraph, END } from "@langchain/langgraph";
import {
  analyzeQuery,
  decideSearchNeeded,
  searchInformation,
  generateResponse,
  checkFollowUp,
  handleError
} from './nodes.js';

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
   * @returns {Promise<Object>} Response object
   */
  async chat(userMessage) {
    try {
      console.log(`\n🚀 Processing message: "${userMessage}"`);

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      // Create initial state
      const initialState = {
        messages: [{ role: 'user', content: userMessage }]
      };

      // Run the workflow
      const result = await this.workflow.invoke(initialState);

      // Extract the final response
      const response = result.finalResponse || "I'm sorry, I couldn't generate a response.";

      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        metadata: {
          category: result.currentQuery?.category,
          location: result.currentQuery?.location,
          searchResultsCount: result.searchResults?.length || 0,
          needsMoreInfo: result.needsMoreInfo
        }
      });

      console.log('✅ Response generated successfully');

      return {
        response,
        metadata: {
          category: result.currentQuery?.category,
          location: result.currentQuery?.location,
          searchResultsCount: result.searchResults?.length || 0,
          needsMoreInfo: result.needsMoreInfo,
          conversationLength: this.conversationHistory.length
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
   * @returns {Object} Summary statistics
   */
  getSummary() {
    const userMessages = this.conversationHistory.filter(msg => msg.role === 'user');
    const assistantMessages = this.conversationHistory.filter(msg => msg.role === 'assistant');

    const categories = assistantMessages
      .map(msg => msg.metadata?.category)
      .filter(Boolean);

    const locations = assistantMessages
      .map(msg => msg.metadata?.location)
      .filter(Boolean);

    return {
      totalMessages: this.conversationHistory.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      categoriesDiscussed: [...new Set(categories)],
      locationsDiscussed: [...new Set(locations)],
      startTime: this.conversationHistory[0]?.timestamp,
      lastActivity: this.conversationHistory[this.conversationHistory.length - 1]?.timestamp
    };
  }
}
