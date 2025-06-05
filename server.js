#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { TravelChatbotApp } from './src/index.js';
import { requestCache } from './src/memory/request-cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize chatbot
let chatbotApp;
let isInitialized = false;

async function initializeChatbot() {
  try {
    console.log('🚀 Initializing Travel Chatbot Server...');

    chatbotApp = new TravelChatbotApp();
    const success = await chatbotApp.initialize();

    if (success) {
      isInitialized = true;
      console.log('✅ Chatbot initialized successfully!');
      return true;
    } else {
      console.error('❌ Failed to initialize chatbot');
      return false;
    }
  } catch (error) {
    console.error('❌ Chatbot initialization error:', error.message);
    return false;
  }
}

// API Routes
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();

  try {
    if (!isInitialized) {
      return res.json({
        success: false,
        error: 'Chatbot chưa được khởi tạo. Vui lòng thử lại sau.'
      });
    }

    const { message, history = [], sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.json({
        success: false,
        error: 'Vui lòng cung cấp tin nhắn.'
      });
    }

    // Generate session ID if not provided (for web clients)
    const clientSessionId = sessionId || `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check cache first
    const cachedResponse = requestCache.getCachedResponse(message, { sessionId: clientSessionId });
    if (cachedResponse) {
      const responseTime = Date.now() - startTime;

      // Add to history for tracing
      requestCache.addToHistory(clientSessionId,
        { message, sessionId: clientSessionId, responseTime },
        cachedResponse
      );

      return res.json(cachedResponse);
    }

    // Process message
    const result = await chatbotApp.processMessage(message, history, clientSessionId);
    const responseTime = Date.now() - startTime;

    // Cache successful responses
    if (result.success) {
      requestCache.cacheResponse(message, result, { sessionId: clientSessionId });
    }

    // Add to history for tracing
    requestCache.addToHistory(clientSessionId,
      { message, sessionId: clientSessionId, responseTime },
      result
    );

    res.json({
      success: true,
      response: result.response,
      metadata: {
        ...result.metadata,
        sessionId: clientSessionId,
        responseTime: responseTime
      }
    });

  } catch (error) {
    console.error('❌ Chat API error:', error.message);
    const responseTime = Date.now() - startTime;

    const errorResponse = {
      success: false,
      error: 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.'
    };

    // Add error to history
    const { message, sessionId } = req.body;
    if (message && sessionId) {
      requestCache.addToHistory(sessionId,
        { message, sessionId, responseTime },
        errorResponse
      );
    }

    res.json(errorResponse);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const cacheStats = requestCache.getCacheStats();
  res.json({
    status: 'ok',
    initialized: isInitialized,
    timestamp: new Date().toISOString(),
    cache: cacheStats
  });
});

// Cache statistics
app.get('/api/cache/stats', (req, res) => {
  res.json(requestCache.getCacheStats());
});

// Session analytics
app.get('/api/session/:sessionId/analytics', (req, res) => {
  const { sessionId } = req.params;
  const analytics = requestCache.getSessionAnalytics(sessionId);
  res.json(analytics);
});

// Session history
app.get('/api/session/:sessionId/history', (req, res) => {
  const { sessionId } = req.params;
  const { limit = 20 } = req.query;
  const history = requestCache.getHistory(sessionId, parseInt(limit));
  res.json({ sessionId, history });
});

// Clear cache
app.post('/api/cache/clear', (req, res) => {
  const { pattern } = req.body;
  requestCache.clearCache(pattern);
  res.json({ success: true, message: 'Cache cleared' });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Start server
async function startServer() {
  const initialized = await initializeChatbot();

  if (!initialized) {
    console.error('❌ Cannot start server without chatbot initialization');
    console.error('📝 Please check your .env file and ensure you have:');
    console.error('   - GEMINI_API_KEY: Your Gemini API key');
    console.error('   - TAVILY_API_KEY: Your Tavily Search API key');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('\n🌟 Travel Chatbot Server Started! 🌟');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`🤖 Chatbot: Ready and initialized`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Open your browser and start chatting!');
    console.log('🛑 Press Ctrl+C to stop the server\n');
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Travel Chatbot Server...');
  console.log('Thank you for using Travel Chatbot! 🌟\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down Travel Chatbot Server...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
