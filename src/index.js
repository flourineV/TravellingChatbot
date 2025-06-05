import { TravelChatbot } from './graph/travel-workflow.js';
import { config, validateConfig } from './config/index.js';
import { AgentFactory } from './agents/agent-factory.js';

/**
 * Main Travel Chatbot Application
 */

export class TravelChatbotApp {
  constructor() {
    this.chatbot = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the chatbot application
   */
  async initialize() {
    try {
      console.log('🚀 Initializing Travel Chatbot...');

      // Validate configuration
      validateConfig();

      // Initialize the chatbot
      this.chatbot = new TravelChatbot();
      this.isInitialized = true;

      console.log('✅ Travel Chatbot initialized successfully!');

      // Display provider info
      const providerInfo = AgentFactory.getProviderInfo();
      console.log(`🤖 LLM Provider: ${providerInfo.name}`);
      console.log(`📊 Model: ${config.gemini.model}`);
      console.log(`🌡️ Temperature: ${config.llm.temperature}`);

      return true;

    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      console.error('\n📝 Please check your .env file and ensure you have:');
      console.error('   - GEMINI_API_KEY: Your Gemini API key (FREE!)');
      console.error('   - TAVILY_API_KEY: Your Tavily Search API key');
      console.error('\n💡 Copy .env.example to .env and fill in your API keys');

      return false;
    }
  }

  /**
   * Process a user message with session support
   * @param {string} message - User message
   * @param {Array} history - Conversation history (optional, fallback only)
   * @param {string} sessionId - Session identifier for memory tracking
   * @returns {Promise<Object>} Response object
   */
  async processMessage(message, history = [], sessionId = 'default') {
    if (!this.isInitialized) {
      throw new Error('Chatbot not initialized. Call initialize() first.');
    }

    if (!message || message.trim().length === 0) {
      return {
        response: "Vui lòng nhập câu hỏi liên quan đến du lịch! Tôi có thể giúp bạn về nhà hàng, khách sạn, điểm tham quan, thời tiết và thông tin phương tiện di chuyển.",
        metadata: { error: 'Empty message', sessionId: sessionId }
      };
    }

    return await this.chatbot.chat(message.trim(), history, sessionId);
  }

  /**
   * Get conversation history
   * @returns {Array} Conversation history
   */
  getHistory() {
    if (!this.isInitialized) return [];
    return this.chatbot.getHistory();
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    if (this.isInitialized) {
      this.chatbot.clearHistory();
    }
  }

  /**
   * Get conversation summary
   * @returns {Object} Summary statistics
   */
  getSummary() {
    if (!this.isInitialized) return null;
    return this.chatbot.getSummary();
  }

  /**
   * Display welcome message
   */
  displayWelcome() {
    console.log('\n🧳 Welcome to the Travel Assistant Chatbot!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('I can help you with:');
    console.log('🍽️  Food & Dining recommendations');
    console.log('🏨  Hotels & Accommodation options');
    console.log('🗺️  Tourist attractions & Activities');
    console.log('🌤️  Weather information');
    console.log('🚗  Transportation options');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Examples:');
    console.log('   "Best restaurants in Tokyo"');
    console.log('   "Hotels near Times Square New York"');
    console.log('   "Things to do in Paris"');
    console.log('   "Weather in London today"');
    console.log('   "How to get from airport to downtown Bangkok"');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Type your question or "exit" to quit\n');
  }

  /**
   * Display conversation summary
   */
  displaySummary() {
    const summary = this.getSummary();
    if (!summary || summary.totalMessages === 0) {
      console.log('📊 No conversation history available.');
      return;
    }

    console.log('\n📊 Conversation Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`💬 Total messages: ${summary.totalMessages}`);
    console.log(`👤 User messages: ${summary.userMessages}`);
    console.log(`🤖 Assistant messages: ${summary.assistantMessages}`);

    if (summary.categoriesDiscussed.length > 0) {
      console.log(`📂 Categories discussed: ${summary.categoriesDiscussed.join(', ')}`);
    }

    if (summary.locationsDiscussed.length > 0) {
      console.log(`📍 Locations discussed: ${summary.locationsDiscussed.join(', ')}`);
    }

    if (summary.startTime) {
      console.log(`⏰ Session started: ${new Date(summary.startTime).toLocaleString()}`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Format and display a response
   * @param {Object} result - Response result
   */
  displayResponse(result) {
    console.log('\n🤖 Assistant:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(result.response);

    if (result.metadata) {
      const meta = result.metadata;
      let metaInfo = [];

      if (meta.category) metaInfo.push(`Category: ${meta.category}`);
      if (meta.location) metaInfo.push(`Location: ${meta.location}`);
      if (meta.searchResultsCount > 0) metaInfo.push(`Sources: ${meta.searchResultsCount} results`);

      if (metaInfo.length > 0) {
        console.log('\n📋 ' + metaInfo.join(' | '));
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

// Export for use in other modules
export { config } from './config/index.js';
export { TravelChatbot } from './graph/travel-workflow.js';
