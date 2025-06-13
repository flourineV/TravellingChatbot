#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { TravelChatbotApp } from './src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS headers for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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
  try {
    if (!isInitialized) {
      return res.json({
        success: false,
        error: 'Chatbot chưa được khởi tạo. Vui lòng thử lại sau.'
      });
    }

    const { message, sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.json({
        success: false,
        error: 'Vui lòng cung cấp tin nhắn.'
      });
    }

    const result = await chatbotApp.processMessage(message, sessionId);

    res.json({
      success: true,
      response: result.response,
      sessionId: result.sessionId,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('❌ Chat API error:', error.message);
    res.json({
      success: false,
      error: 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.'
    });
  }
});

// Get conversation history
app.get('/api/history/:sessionId', async (req, res) => {
  try {
    if (!isInitialized) {
      return res.json({
        success: false,
        error: 'Chatbot chưa được khởi tạo.'
      });
    }

    const { sessionId } = req.params;
    const history = await chatbotApp.getHistory(sessionId);

    res.json({
      success: true,
      sessionId,
      history,
      count: history.length
    });

  } catch (error) {
    console.error('❌ History API error:', error.message);
    res.json({
      success: false,
      error: 'Không thể lấy lịch sử hội thoại.'
    });
  }
});

// Clear conversation history
app.delete('/api/history/:sessionId', async (req, res) => {
  try {
    if (!isInitialized) {
      return res.json({
        success: false,
        error: 'Chatbot chưa được khởi tạo.'
      });
    }

    const { sessionId } = req.params;
    const cleared = await chatbotApp.clearHistory(sessionId);

    res.json({
      success: cleared,
      sessionId,
      message: cleared ? 'Lịch sử đã được xóa' : 'Không thể xóa lịch sử'
    });

  } catch (error) {
    console.error('❌ Clear history API error:', error.message);
    res.json({
      success: false,
      error: 'Không thể xóa lịch sử hội thoại.'
    });
  }
});

// Get session summary
app.get('/api/summary/:sessionId', async (req, res) => {
  try {
    if (!isInitialized) {
      return res.json({
        success: false,
        error: 'Chatbot chưa được khởi tạo.'
      });
    }

    const { sessionId } = req.params;
    const summary = await chatbotApp.getSummary(sessionId);

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('❌ Summary API error:', error.message);
    res.json({
      success: false,
      error: 'Không thể lấy thống kê hội thoại.'
    });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      initialized: isInitialized,
      timestamp: new Date().toISOString()
    };

    if (isInitialized) {
      const memoryHealth = await chatbotApp.getMemoryHealth();
      health.memory = memoryHealth;
    }

    res.json(health);

  } catch (error) {
    res.json({
      status: 'error',
      initialized: isInitialized,
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API Info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Travel Chatbot API',
    version: '1.0.0',
    status: 'running',
    initialized: isInitialized,
    endpoints: {
      chat: 'POST /api/chat',
      history: 'GET /api/history/:sessionId',
      clearHistory: 'DELETE /api/history/:sessionId',
      summary: 'GET /api/summary/:sessionId',
      health: 'GET /api/health'
    },
    timestamp: new Date().toISOString()
  });
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
    console.log('\n🌟 Travel Chatbot API Server Started! 🌟');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Server running on port: ${PORT}`);
    console.log(`🤖 Chatbot: Ready and initialized`);
    console.log(`📊 API endpoint: POST /api/chat`);
    console.log(`🏥 Health check: GET /api/health`);
    console.log(`📚 API info: GET /`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Ready to serve API requests!');
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
