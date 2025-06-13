import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import {
  TRAVEL_ASSISTANT_SYSTEM_PROMPT,
  QUERY_ANALYSIS_PROMPT,
  RESPONSE_GENERATION_PROMPT
} from '../prompts/travel-assistant.js';

/**
 * Travel Assistant Agent using Google Gemini
 */
export class GeminiTravelAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: config.gemini.model,
      generationConfig: {
        temperature: config.llm.temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: config.app.maxTokens,
      }
    });
  }

  /**
   * Analyze user query to extract travel intent and context
   * @param {string} query - User's travel query
   * @param {Array} conversationHistory - Previous conversation messages
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeQuery(query, conversationHistory = []) {
    try {
      // Build context from conversation history
      const contextPrompt = this.buildContextPrompt(conversationHistory);

      const prompt = `${contextPrompt}

${QUERY_ANALYSIS_PROMPT.replace('{query}', query)}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      const analysis = this.parseAnalysisResult(text);
      return analysis;

    } catch (error) {
      console.error('❌ Query analysis error:', error);

      // Return error instead of fallback
      throw new Error(`Failed to analyze query: ${error.message}`);
    }
  }

  /**
   * Generate response based on search results
   * @param {string} originalQuery - Original user query
   * @param {Array} searchResults - Search results from Tavily
   * @param {Array} conversationHistory - Previous conversation messages
   * @returns {Promise<string>} Generated response
   */
  async generateResponse(originalQuery, searchResults, conversationHistory = []) {
    try {
      // Build context from conversation history
      const contextPrompt = this.buildContextPrompt(conversationHistory);

      // Format search results for the prompt
      const formattedResults = this.formatSearchResultsForPrompt(searchResults);

      const prompt = `${TRAVEL_ASSISTANT_SYSTEM_PROMPT}

${contextPrompt}

${RESPONSE_GENERATION_PROMPT
  .replace('{originalQuery}', originalQuery)
  .replace('{searchResults}', formattedResults)}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log('✅ Response generated');
      return text;

    } catch (error) {
      console.error('❌ Response generation error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Generate a simple response without search (for basic queries)
   * @param {string} query - User query
   * @param {Array} conversationHistory - Previous conversation messages
   * @returns {Promise<string>} Simple response
   */
  async generateSimpleResponse(query, conversationHistory = []) {
    try {
      // Build context from conversation history
      const contextPrompt = this.buildContextPrompt(conversationHistory);

      const prompt = `${TRAVEL_ASSISTANT_SYSTEM_PROMPT}

${contextPrompt}

User: ${query}

Assistant:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return text;

    } catch (error) {
      console.error('❌ Simple response error:', error);
      throw new Error(`Failed to generate simple response: ${error.message}`);
    }
  }

  /**
   * Parse analysis result from Gemini response
   * @param {string} content - Gemini response content
   * @returns {Object} Parsed analysis
   */
  parseAnalysisResult(content) {
    try {
      console.log('🔍 Parsing analysis content:', content.substring(0, 200) + '...');

      let jsonStr = content;

      // Remove markdown code blocks
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Fix double braces (common Gemini issue)
      jsonStr = jsonStr.replace(/\{\{/g, '{').replace(/\}\}/g, '}');

      // Extract JSON object
      let jsonMatch = jsonStr.match(/\{[\s\S]*?\}/);

      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      jsonStr = jsonMatch[0];

      // Clean up common issues
      jsonStr = jsonStr.replace(/'/g, '"'); // Replace single quotes
      jsonStr = jsonStr.replace(/(\w+):/g, '"$1":'); // Add quotes to keys
      jsonStr = jsonStr.replace(/,\s*}/g, '}'); // Remove trailing commas
      jsonStr = jsonStr.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

      console.log('🔧 Cleaned JSON:', jsonStr);

      const parsed = JSON.parse(jsonStr);

        // Validate that it's a travel-related query
        if (!this.isValidTravelQuery(parsed)) {
          throw new Error('Query is not travel-related');
        }

        console.log('✅ Parsed analysis:', parsed);
        return parsed;

    } catch (error) {
      console.error('❌ Could not parse analysis result:', error.message);
      console.error('❌ Original content:', content);

      // Fallback for non-travel queries
      if (content.includes('non_travel') || content.includes('not_travel_related')) {
        throw new Error('Query is not travel-related');
      }

      throw new Error(`Invalid query analysis: ${error.message}`);
    }
  }

  /**
   * Validate if the query is travel-related
   * @param {Object} analysis - Parsed analysis object
   * @returns {boolean} True if valid travel query
   */
  isValidTravelQuery(analysis) {
    // Check if analysis has required fields
    if (!analysis.category || !analysis.intent) {
      return false;
    }

    // Explicitly reject non-travel queries
    if (analysis.category === 'non_travel' || analysis.intent === 'not_travel_related') {
      return false;
    }

    // Valid travel categories
    const validCategories = ['food', 'accommodation', 'attractions', 'weather', 'transportation', 'general'];

    // Check if category is travel-related
    if (!validCategories.includes(analysis.category)) {
      return false;
    }

    return true;
  }



  /**
   * Format search results for prompt
   * @param {Array} searchResults - Search results
   * @returns {string} Formatted results
   */
  formatSearchResultsForPrompt(searchResults) {
    if (!searchResults || searchResults.length === 0) {
      return 'No search results available.';
    }

    return searchResults
      .slice(0, 5) // Limit to top 5 results
      .map((result, index) =>
        `Result ${index + 1}:
Title: ${result.title}
Content: ${result.content}
URL: ${result.url}
---`
      )
      .join('\n\n');
  }

  /**
   * Build context prompt from conversation history
   * @param {Array} conversationHistory - Previous conversation messages
   * @returns {string} Context prompt
   */
  buildContextPrompt(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return '';
    }

    const recentMessages = conversationHistory.slice(-6); // Last 6 messages for context
    const contextMessages = recentMessages.map(msg => {
      const role = msg.role === 'user' ? 'Người dùng' : 'Trợ lý';
      return `${role}: ${msg.content}`;
    }).join('\n');

    return `NGỮ CẢNH CUỘC HỘI THOẠI TRƯỚC:
${contextMessages}

---`;
  }
}