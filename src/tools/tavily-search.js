import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { config } from '../config/index.js';

/**
 * Tavily Search Tool for real-time travel information
 */
export class TravelSearchTool {
  constructor() {
    this.tavilyTool = new TavilySearchResults({
      maxResults: config.app.maxSearchResults,
      apiKey: config.tavily.apiKey,
    });
  }

  /**
   * Search for travel-related information
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async search(query, options = {}) {
    try {
      console.log(`🔍 Searching for: "${query}"`);
      
      const searchOptions = {
        maxResults: options.maxResults || config.app.maxSearchResults,
        ...options
      };

      // Execute search
      const results = await this.tavilyTool.invoke(query);
      
      // Parse and format results
      const formattedResults = this.formatResults(results);
      
      console.log(`✅ Found ${formattedResults.length} results`);
      return formattedResults;
      
    } catch (error) {
      console.error('❌ Search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Search specifically for travel information with enhanced queries
   * @param {string} query - Original query
   * @param {string} category - Travel category (food, accommodation, etc.)
   * @param {string} location - Location context
   * @returns {Promise<Array>} Enhanced search results
   */
  async searchTravel(query, category, location) {
    try {
      // Enhance query based on category and location
      const enhancedQuery = this.enhanceQuery(query, category, location);
      
      // Perform search
      const results = await this.search(enhancedQuery);
      
      // Filter and rank results based on relevance
      return this.rankResults(results, category);
      
    } catch (error) {
      console.error('❌ Travel search error:', error);
      throw error;
    }
  }

  /**
   * Enhance search query based on travel context
   * @param {string} query - Original query
   * @param {string} category - Travel category
   * @param {string} location - Location
   * @returns {string} Enhanced query
   */
  enhanceQuery(query, category, location) {
    let enhancedQuery = query;
    
    // Add location context if provided
    if (location && !query.toLowerCase().includes(location.toLowerCase())) {
      enhancedQuery = `${query} in ${location}`;
    }
    
    // Add category-specific terms
    const categoryEnhancements = {
      food: 'restaurants dining cuisine food',
      accommodation: 'hotels booking stay accommodation',
      attractions: 'tourist attractions things to do sightseeing',
      weather: 'weather forecast climate temperature',
      transportation: 'transport public transit getting around'
    };
    
    if (categoryEnhancements[category]) {
      enhancedQuery += ` ${categoryEnhancements[category]}`;
    }
    
    // Add recency for time-sensitive queries
    if (['weather', 'events'].includes(category)) {
      enhancedQuery += ' current latest 2024';
    }
    
    return enhancedQuery;
  }

  /**
   * Format raw search results
   * @param {string} rawResults - Raw results from Tavily
   * @returns {Array} Formatted results
   */
  formatResults(rawResults) {
    try {
      // Parse results if they're in string format
      let results = rawResults;
      if (typeof rawResults === 'string') {
        results = JSON.parse(rawResults);
      }
      
      // Handle different result formats
      if (Array.isArray(results)) {
        return results.map(this.formatSingleResult);
      } else if (results.results) {
        return results.results.map(this.formatSingleResult);
      } else {
        return [this.formatSingleResult(results)];
      }
      
    } catch (error) {
      console.error('❌ Error formatting results:', error);
      return [];
    }
  }

  /**
   * Format a single search result
   * @param {Object} result - Single result object
   * @returns {Object} Formatted result
   */
  formatSingleResult(result) {
    return {
      title: result.title || 'No title',
      content: result.content || result.snippet || 'No content',
      url: result.url || '',
      snippet: result.snippet || result.content?.substring(0, 200) || '',
      score: result.score || 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Rank results based on travel category relevance
   * @param {Array} results - Search results
   * @param {string} category - Travel category
   * @returns {Array} Ranked results
   */
  rankResults(results, category) {
    const categoryKeywords = {
      food: ['restaurant', 'dining', 'cuisine', 'food', 'menu', 'eat'],
      accommodation: ['hotel', 'booking', 'stay', 'room', 'accommodation'],
      attractions: ['attraction', 'tourist', 'visit', 'sightseeing', 'museum'],
      weather: ['weather', 'temperature', 'forecast', 'climate'],
      transportation: ['transport', 'bus', 'train', 'metro', 'taxi']
    };
    
    const keywords = categoryKeywords[category] || [];
    
    return results
      .map(result => ({
        ...result,
        relevanceScore: this.calculateRelevance(result, keywords)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate relevance score for a result
   * @param {Object} result - Search result
   * @param {Array} keywords - Relevant keywords
   * @returns {number} Relevance score
   */
  calculateRelevance(result, keywords) {
    const text = `${result.title} ${result.content}`.toLowerCase();
    let score = result.score || 0;
    
    // Boost score based on keyword matches
    keywords.forEach(keyword => {
      const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
      score += matches * 0.1;
    });
    
    return score;
  }
}
