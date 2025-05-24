/**
 * Type definitions for the Travel Chatbot
 */

// Travel query categories
export const TRAVEL_CATEGORIES = {
  FOOD: 'food',
  ACCOMMODATION: 'accommodation', 
  ATTRACTIONS: 'attractions',
  WEATHER: 'weather',
  TRANSPORTATION: 'transportation',
  GENERAL: 'general'
};

// Search result structure
export const createSearchResult = (title, content, url, snippet) => ({
  title,
  content,
  url,
  snippet,
  timestamp: new Date().toISOString()
});

// Chat message structure
export const createChatMessage = (role, content, metadata = {}) => ({
  role, // 'user', 'assistant', 'system'
  content,
  metadata: {
    timestamp: new Date().toISOString(),
    ...metadata
  }
});

// Travel query structure
export const createTravelQuery = (originalQuery, category, location, intent) => ({
  originalQuery,
  category,
  location,
  intent,
  timestamp: new Date().toISOString()
});

// Graph state structure
export const createGraphState = () => ({
  messages: [],
  currentQuery: null,
  searchResults: [],
  analysisResult: null,
  finalResponse: null,
  needsMoreInfo: false,
  error: null
});
