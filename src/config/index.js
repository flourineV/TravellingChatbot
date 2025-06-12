import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // LLM Provider Configuration
  llm: {
    provider: 'gemini',
    temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
  },

  // Gemini Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },

  // Tavily Search Configuration
  tavily: {
    apiKey: process.env.TAVILY_API_KEY,
  },

  // LangSmith Configuration (optional)
  langsmith: {
    tracingEnabled: process.env.LANGCHAIN_TRACING_V2 === 'true',
    endpoint: process.env.LANGCHAIN_ENDPOINT,
    apiKey: process.env.LANGCHAIN_API_KEY,
    project: process.env.LANGCHAIN_PROJECT || 'travel-chatbot',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
  },

  // Memory Configuration
  memory: {
    sessionTTL: parseInt(process.env.SESSION_TTL) || 3600, // 1 hour in seconds
    maxMessagesPerSession: parseInt(process.env.MAX_MESSAGES_PER_SESSION) || 20,
    contextWindowSize: parseInt(process.env.CONTEXT_WINDOW_SIZE) || 10, // Messages to include in LLM context
  },

  // Redis Configuration (Upstash only)
  redis: {
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  },

  // Memory Configuration
  memory: {
    sessionTTL: parseInt(process.env.SESSION_TTL) || 3600, // 1 hour in seconds
    maxMessagesPerSession: parseInt(process.env.MAX_MESSAGES_PER_SESSION) || 20,
    contextWindowSize: parseInt(process.env.CONTEXT_WINDOW_SIZE) || 10, // Messages to include in LLM context
  },

  // Application Configuration
  app: {
    maxSearchResults: 5,
    maxTokens: 4000,
    searchTimeout: 30000, // 30 seconds
  }
};

// Validate required configuration
export function validateConfig() {
  const errors = [];

  if (!config.gemini.apiKey) {
    errors.push('GEMINI_API_KEY is required');
  }

  if (!config.tavily.apiKey) {
    errors.push('TAVILY_API_KEY is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
