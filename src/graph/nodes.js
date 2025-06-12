import { AgentFactory } from '../agents/agent-factory.js';
import { TravelSearchTool } from '../tools/tavily-search.js';
import { TRAVEL_CATEGORIES } from '../types/index.js';

/**
 * Graph nodes for the travel chatbot workflow
 */

// Initialize tools and agents
const travelAgent = AgentFactory.createTravelAgent();
const searchTool = new TravelSearchTool();

/**
 * Node: Analyze user query
 * Extracts intent, category, and location from user input
 */
export async function analyzeQuery(state) {
  try {
    const userMessage = state.messages[state.messages.length - 1];
    const query = userMessage.content;
    const conversationHistory = state.conversationHistory || [];

    // Analyze the query using the travel agent with conversation context
    const analysis = await travelAgent.analyzeQuery(query, conversationHistory);

    return {
      ...state,
      currentQuery: {
        original: query,
        ...analysis
      },
      analysisResult: analysis
    };

  } catch (error) {
    console.error('❌ Error in analyzeQuery node:', error);

    // Check if it's a non-travel query
    if (error.message.includes('not travel-related')) {
      return {
        ...state,
        error: 'non_travel_query',
        finalResponse: `Tôi là trợ lý du lịch chuyên biệt và chỉ có thể giúp đỡ các câu hỏi liên quan đến du lịch.

Vui lòng hỏi tôi về:
🍽️ **Ẩm thực & Nhà hàng**: Nhà hàng, món ăn địa phương, gợi ý ẩm thực
🏨 **Chỗ ở**: Khách sạn, nhà nghỉ, cho thuê kỳ nghỉ
🗺️ **Điểm tham quan**: Địa điểm du lịch, hoạt động, tham quan
🌤️ **Thời tiết**: Điều kiện hiện tại, dự báo cho điểm đến
🚗 **Phương tiện di chuyển**: Di chuyển, giao thông công cộng, tuyến đường

Ví dụ: "Nhà hàng phở ngon nhất ở Hà Nội" hoặc "Khách sạn gần chợ Bến Thành"`
      };
    }

    // For other analysis errors, ask for clarification
    return {
      ...state,
      error: 'unclear_query',
      finalResponse: `Tôi không thể hiểu rõ câu hỏi du lịch của bạn.

Bạn có thể cụ thể hơn không? Ví dụ:
• Bao gồm điểm đến/địa điểm bạn đang hỏi về
• Chỉ rõ loại thông tin bạn cần (nhà hàng, khách sạn, điểm tham quan, v.v.)
• Chi tiết hơn về những gì bạn muốn biết

Thử hỏi như: "Nhà hàng sushi ngon nhất ở Tokyo" hoặc "Thời tiết Paris tuần này"`
    };
  }
}

/**
 * Node: Decide if search is needed
 * Determines whether to search for information or provide a direct response
 */
export async function decideSearchNeeded(state) {
  try {
    const { currentQuery } = state;

    // Categories that typically need real-time search
    const searchRequiredCategories = [
      TRAVEL_CATEGORIES.FOOD,
      TRAVEL_CATEGORIES.ACCOMMODATION,
      TRAVEL_CATEGORIES.ATTRACTIONS,
      TRAVEL_CATEGORIES.WEATHER,
      TRAVEL_CATEGORIES.TRANSPORTATION
    ];

    // Check if search is needed based on category and query content
    const needsSearch = searchRequiredCategories.includes(currentQuery.category) ||
                       currentQuery.urgency === 'high' ||
                       currentQuery.location ||
                       (currentQuery.keywords && currentQuery.keywords.some(keyword =>
                         ['current', 'latest', 'now', 'today', 'price', 'open', 'hours'].includes(keyword.toLowerCase())
                       ));

    return {
      ...state,
      needsSearch: needsSearch
    };

  } catch (error) {
    console.error('❌ Error in decideSearchNeeded node:', error);
    return {
      ...state,
      error: `Decision failed: ${error.message}`,
      needsSearch: true // Default to search on error
    };
  }
}

/**
 * Node: Search for information
 * Uses Tavily to search for real-time travel information
 */
export async function searchInformation(state) {
  try {
    const { currentQuery } = state;

    // Perform travel-specific search
    const searchResults = await searchTool.searchTravel(
      currentQuery.searchQuery || currentQuery.original,
      currentQuery.category,
      currentQuery.location
    );



    return {
      ...state,
      searchResults
    };

  } catch (error) {
    console.error('❌ Error in searchInformation node:', error);
    return {
      ...state,
      error: `Search failed: ${error.message}`,
      searchResults: []
    };
  }
}

/**
 * Node: Generate response
 * Creates the final response using search results or direct knowledge
 */
export async function generateResponse(state) {
  try {
    const { currentQuery, searchResults, needsSearch, conversationHistory } = state;
    let response;

    if (needsSearch && searchResults && searchResults.length > 0) {
      // Generate response based on search results with conversation context
      response = await travelAgent.generateResponse(
        currentQuery.original,
        searchResults,
        conversationHistory
      );
    } else if (needsSearch && (!searchResults || searchResults.length === 0)) {
      // Handle case where search was needed but no results found
      response = await travelAgent.generateSimpleResponse(currentQuery.original, conversationHistory);
      response += "\n\n⚠️ Tôi không thể tìm thấy thông tin hiện tại về chủ đề này. Phản hồi trên dựa trên kiến thức chung.";
    } else {
      // Generate simple response without search but with conversation context
      response = await travelAgent.generateSimpleResponse(currentQuery.original, conversationHistory);
    }

    return {
      ...state,
      finalResponse: response
    };

  } catch (error) {
    console.error('❌ Error in generateResponse node:', error);
    return {
      ...state,
      error: `Response generation failed: ${error.message}`,
      finalResponse: "Xin lỗi, tôi đang gặp khó khăn trong việc tạo phản hồi ngay bây giờ. Vui lòng thử lại."
    };
  }
}

/**
 * Node: Check for follow-up
 * Determines if the user might need additional information
 */
export async function checkFollowUp(state) {
  try {
    const { currentQuery, searchResults } = state;

    // Simple heuristics for determining if follow-up might be helpful
    let needsMoreInfo = false;

    // Check if the query was very broad
    if (currentQuery.category === TRAVEL_CATEGORIES.GENERAL &&
        (!currentQuery.keywords || currentQuery.keywords.length < 3)) {
      needsMoreInfo = true;
    }

    // Check if search results were limited
    if (searchResults && searchResults.length < 2) {
      needsMoreInfo = true;
    }

    // Check if no location was specified for location-dependent queries
    if ([TRAVEL_CATEGORIES.FOOD, TRAVEL_CATEGORIES.ACCOMMODATION, TRAVEL_CATEGORIES.ATTRACTIONS]
        .includes(currentQuery.category) && !currentQuery.location) {
      needsMoreInfo = true;
    }

    return {
      ...state,
      needsMoreInfo
    };

  } catch (error) {
    console.error('❌ Error in checkFollowUp node:', error);
    return {
      ...state,
      needsMoreInfo: false
    };
  }
}

/**
 * Node: Handle errors
 * Provides error handling and recovery
 */
export async function handleError(state) {
  const errorType = state.error;

  // If we already have a finalResponse from error handling, use it
  if (state.finalResponse) {
    return {
      ...state,
      error: null // Clear the error after handling
    };
  }

  // Handle unexpected errors
  const fallbackResponse = `Xin lỗi, tôi gặp phải sự cố kỹ thuật không mong muốn.

Vui lòng thử:
• Diễn đạt lại câu hỏi du lịch của bạn
• Cụ thể hơn về địa điểm và những gì bạn cần
• Hỏi về nhà hàng, khách sạn, điểm tham quan, thời tiết hoặc phương tiện di chuyển

Tôi ở đây để giúp bạn lập kế hoạch du lịch! 🧳`;

  return {
    ...state,
    finalResponse: fallbackResponse,
    error: null // Clear the error after handling
  };
}
