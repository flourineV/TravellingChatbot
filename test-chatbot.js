#!/usr/bin/env node

import { TravelChatbotApp } from './src/index.js';
import readline from 'readline';

/**
 * Interactive Travel Chatbot Test
 * Test conversation với memory context
 */

class ChatbotTester {
  constructor() {
    this.app = null;
    this.sessionId = null;
    this.isRunning = false;
    this.rl = null;
  }

  /**
   * Initialize chatbot
   */
  async initialize() {
    try {
      console.log('🚀 Khởi tạo Travel Chatbot...');
      
      this.app = new TravelChatbotApp();
      const success = await this.app.initialize();
      
      if (!success) {
        console.log('❌ Không thể khởi tạo chatbot');
        console.log('💡 Vui lòng kiểm tra:');
        console.log('   - GEMINI_API_KEY trong file .env');
        console.log('   - TAVILY_API_KEY trong file .env');
        console.log('   - UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN');
        return false;
      }

      // Generate session ID
      this.sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Chatbot đã sẵn sàng!');
      console.log(`📝 Session ID: ${this.sessionId}`);
      
      return true;
    } catch (error) {
      console.error('❌ Lỗi khởi tạo:', error.message);
      return false;
    }
  }

  /**
   * Display welcome message
   */
  displayWelcome() {
    console.log('\n🌟 TRAVEL CHATBOT TEST 🌟');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 Tôi là trợ lý du lịch AI với khả năng nhớ ngữ cảnh');
    console.log('💬 Hãy hỏi tôi về du lịch, tôi sẽ nhớ cuộc hội thoại!');
    console.log('');
    console.log('📝 Ví dụ câu hỏi:');
    console.log('   • "Tôi muốn đi du lịch Đà Nẵng"');
    console.log('   • "Có gì hay ở đó không?"');
    console.log('   • "Còn ăn gì ngon?"');
    console.log('   • "Thời tiết như thế nào?"');
    console.log('');
    console.log('⌨️  Gõ "exit" để thoát');
    console.log('⌨️  Gõ "clear" để xóa lịch sử hội thoại');
    console.log('⌨️  Gõ "history" để xem lịch sử');
    console.log('⌨️  Gõ "summary" để xem thống kê');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Process user message
   */
  async processMessage(message) {
    try {
      console.log('\n🤔 Đang suy nghĩ...');
      
      const startTime = Date.now();
      const result = await this.app.processMessage(message, this.sessionId);
      const endTime = Date.now();
      
      console.log(`\n🤖 Bot (${endTime - startTime}ms):`);
      console.log('─'.repeat(50));
      
      // Format response with better readability
      const formattedResponse = this.formatResponse(result.response);
      console.log(formattedResponse);
      
      // Display metadata
      if (result.metadata) {
        console.log('\n📊 Thông tin:');
        if (result.metadata.category) {
          console.log(`   📂 Danh mục: ${result.metadata.category}`);
        }
        if (result.metadata.location) {
          console.log(`   📍 Địa điểm: ${result.metadata.location}`);
        }
        if (result.metadata.searchResultsCount > 0) {
          console.log(`   🔍 Kết quả tìm kiếm: ${result.metadata.searchResultsCount}`);
        }
        console.log(`   🧠 Memory: ${result.metadata.memoryEnabled ? 'Hoạt động' : 'Tắt'}`);
      }
      
      console.log('─'.repeat(50));
      
    } catch (error) {
      console.error('\n❌ Lỗi xử lý tin nhắn:', error.message);
    }
  }

  /**
   * Format response for better readability
   */
  formatResponse(response) {
    return response
      .replace(/\n\n/g, '\n\n   ')
      .replace(/^/, '   ')
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .trim();
  }

  /**
   * Show conversation history
   */
  async showHistory() {
    try {
      const history = await this.app.getHistory(this.sessionId);
      
      if (history.length === 0) {
        console.log('\n📚 Chưa có lịch sử hội thoại');
        return;
      }
      
      console.log('\n📚 Lịch sử hội thoại:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      history.forEach((msg, index) => {
        const time = new Date(msg.timestamp).toLocaleTimeString('vi-VN');
        const role = msg.role === 'user' ? '👤 Bạn' : '🤖 Bot';
        const content = msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '');
        
        console.log(`${index + 1}. [${time}] ${role}: ${content}`);
      });
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.error('❌ Lỗi lấy lịch sử:', error.message);
    }
  }

  /**
   * Show conversation summary
   */
  async showSummary() {
    try {
      const summary = await this.app.getSummary(this.sessionId);
      
      console.log('\n📊 Thống kê hội thoại:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📝 Tổng tin nhắn: ${summary.totalMessages}`);
      console.log(`👤 Tin nhắn của bạn: ${summary.userMessages}`);
      console.log(`🤖 Tin nhắn của bot: ${summary.assistantMessages}`);
      
      if (summary.categoriesDiscussed.length > 0) {
        console.log(`📂 Chủ đề đã thảo luận: ${summary.categoriesDiscussed.join(', ')}`);
      }
      
      if (summary.locationsDiscussed.length > 0) {
        console.log(`📍 Địa điểm đã thảo luận: ${summary.locationsDiscussed.join(', ')}`);
      }
      
      if (summary.startTime) {
        const startTime = new Date(summary.startTime).toLocaleString('vi-VN');
        console.log(`⏰ Bắt đầu: ${startTime}`);
      }
      
      if (summary.lastActivity) {
        const lastTime = new Date(summary.lastActivity).toLocaleString('vi-VN');
        console.log(`⏰ Hoạt động cuối: ${lastTime}`);
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê:', error.message);
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory() {
    try {
      const success = await this.app.clearHistory(this.sessionId);
      
      if (success) {
        console.log('\n🗑️ Đã xóa lịch sử hội thoại');
        // Generate new session
        this.sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`📝 Session ID mới: ${this.sessionId}`);
      } else {
        console.log('\n❌ Không thể xóa lịch sử hội thoại');
      }
      
    } catch (error) {
      console.error('❌ Lỗi xóa lịch sử:', error.message);
    }
  }

  /**
   * Start interactive chat
   */
  async startChat() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\n💬 Bạn: '
    });

    this.isRunning = true;
    this.displayWelcome();

    this.rl.prompt();

    this.rl.on('line', async (input) => {
      const message = input.trim();

      if (!message) {
        this.rl.prompt();
        return;
      }

      // Handle special commands
      if (message.toLowerCase() === 'exit') {
        this.handleExit();
        return;
      }

      if (message.toLowerCase() === 'clear') {
        await this.clearHistory();
        this.rl.prompt();
        return;
      }

      if (message.toLowerCase() === 'history') {
        await this.showHistory();
        this.rl.prompt();
        return;
      }

      if (message.toLowerCase() === 'summary') {
        await this.showSummary();
        this.rl.prompt();
        return;
      }

      // Process normal message
      await this.processMessage(message);
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      this.handleExit();
    });
  }

  /**
   * Handle exit
   */
  handleExit() {
    if (this.isRunning) {
      console.log('\n👋 Cảm ơn bạn đã test Travel Chatbot!');
      console.log('🌟 Hẹn gặp lại! 🌟\n');

      if (this.rl) {
        this.rl.close();
      }

      this.isRunning = false;
      process.exit(0);
    }
  }

  /**
   * Run the test
   */
  async run() {
    const initialized = await this.initialize();
    if (!initialized) {
      console.log('❌ Không thể khởi động test. Vui lòng kiểm tra cấu hình.');
      process.exit(1);
    }

    await this.startChat();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Đang thoát...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Đang thoát...');
  process.exit(0);
});

// Start the test
const tester = new ChatbotTester();
tester.run().catch(error => {
  console.error('❌ Lỗi chạy test:', error.message);
  process.exit(1);
});
