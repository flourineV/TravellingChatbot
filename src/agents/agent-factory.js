import { GeminiTravelAgent } from './gemini-agent.js';

/**
 * Factory for creating travel agents
 */
export class AgentFactory {
  /**
   * Create a Gemini travel agent
   * @returns {GeminiTravelAgent} Travel agent instance
   */
  static createTravelAgent() {
    return new GeminiTravelAgent();
  }

  /**
   * Get provider information
   * @returns {Object} Provider information
   */
  static getProviderInfo() {
    return {
      name: 'Google Gemini',
      models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'],
      pricing: 'Free tier available',
      description: 'Free tier with generous limits, excellent for development'
    };
  }
}
