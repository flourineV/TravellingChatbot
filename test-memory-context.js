#!/usr/bin/env node

import { TravelChatbotApp } from './src/index.js';

/**
 * Test Persistent Memory Context
 * Kiểm tra chatbot có nhớ ngữ cảnh qua các câu hỏi không
 */

async function testMemoryContext() {
  console.log('🧪 Testing Persistent Memory Context...\n');
  
  try {
    // Initialize the chatbot
    const app = new TravelChatbotApp();
    
    console.log('🔧 Initializing chatbot...');
    const initialized = await app.initialize();
    
    if (!initialized) {
      console.log('❌ Failed to initialize chatbot');
      console.log('💡 Make sure you have:');
      console.log('   - GEMINI_API_KEY in .env file');
      console.log('   - TAVILY_API_KEY in .env file');
      console.log('   - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
      return;
    }
    
    console.log('✅ Chatbot initialized successfully!\n');
    
    // Test session ID
    const testSessionId = `memory_test_${Date.now()}`;
    console.log(`📝 Using test session: ${testSessionId}\n`);
    
    // Test conversation sequence to check memory context
    const conversationFlow = [
      {
        step: 1,
        query: "Tôi muốn đi du lịch Đà Nẵng",
        expectContext: "Chatbot should learn about Đà Nẵng destination"
      },
      {
        step: 2, 
        query: "Có gì hay ở đó không?",
        expectContext: "Should understand 'ở đó' refers to Đà Nẵng"
      },
      {
        step: 3,
        query: "Còn ăn gì ngon?", 
        expectContext: "Should know we're asking about food in Đà Nẵng"
      },
      {
        step: 4,
        query: "Thời tiết như thế nào?",
        expectContext: "Should know we're asking about weather in Đà Nẵng"
      },
      {
        step: 5,
        query: "Khách sạn nào tốt?",
        expectContext: "Should recommend hotels in Đà Nẵng"
      }
    ];
    
    console.log('🗣️ Testing conversation flow with memory context...\n');
    
    for (const conversation of conversationFlow) {
      console.log(`📍 Step ${conversation.step}: Testing context memory`);
      console.log(`👤 User: "${conversation.query}"`);
      console.log(`🎯 Expected: ${conversation.expectContext}`);
      
      const startTime = Date.now();
      const result = await app.processMessage(conversation.query, testSessionId);
      const endTime = Date.now();
      
      if (result.response) {
        // Check if response contains context clues
        const response = result.response.toLowerCase();
        const hasLocationContext = response.includes('đà nẵng') || response.includes('da nang');
        
        console.log(`🤖 Bot (${endTime - startTime}ms):`);
        console.log(`   ${result.response.substring(0, 150)}...`);
        console.log(`🧠 Memory Status: ${result.metadata.memoryEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`📍 Location Context: ${hasLocationContext ? '✅ Found' : '❌ Missing'}`);
        
        if (conversation.step > 1 && !hasLocationContext) {
          console.log(`⚠️  WARNING: Bot may not be using context from previous messages!`);
        }
        
      } else {
        console.log(`❌ Error: ${result.metadata?.error || 'Unknown error'}`);
      }
      
      console.log('─'.repeat(80));
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test memory retrieval
    console.log('\n📚 Testing memory retrieval...');
    const history = await app.getHistory(testSessionId);
    console.log(`Retrieved ${history.length} messages from memory`);
    
    if (history.length > 0) {
      console.log('\n📝 Conversation History:');
      history.forEach((msg, index) => {
        const role = msg.role === 'user' ? '👤' : '🤖';
        const content = msg.content.substring(0, 80) + (msg.content.length > 80 ? '...' : '');
        console.log(`${index + 1}. ${role} ${content}`);
      });
    }
    
    // Test session summary
    console.log('\n📊 Testing session summary...');
    const summary = await app.getSummary(testSessionId);
    console.log('Session Summary:');
    console.log(`  📝 Total messages: ${summary.totalMessages}`);
    console.log(`  👤 User messages: ${summary.userMessages}`);
    console.log(`  🤖 Bot messages: ${summary.assistantMessages}`);
    console.log(`  📂 Categories: ${summary.categoriesDiscussed?.join(', ') || 'None'}`);
    console.log(`  📍 Locations: ${summary.locationsDiscussed?.join(', ') || 'None'}`);
    console.log(`  🧠 Memory enabled: ${summary.memoryEnabled !== false}`);
    
    // Test memory health
    console.log('\n🏥 Testing memory health...');
    const health = await app.getMemoryHealth();
    console.log(`Memory Status: ${health.status}`);
    console.log(`Message: ${health.message}`);
    
    // Analysis
    console.log('\n🔍 MEMORY CONTEXT ANALYSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (summary.totalMessages >= 10) {
      console.log('✅ PASS: All messages were saved to memory');
    } else {
      console.log('❌ FAIL: Some messages were not saved');
    }
    
    if (summary.locationsDiscussed?.includes('Đà Nẵng') || summary.locationsDiscussed?.includes('Da Nang')) {
      console.log('✅ PASS: Location context was extracted and saved');
    } else {
      console.log('❌ FAIL: Location context was not properly extracted');
    }
    
    if (health.status === 'healthy') {
      console.log('✅ PASS: Memory system is healthy');
    } else {
      console.log('❌ FAIL: Memory system has issues');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Cleanup test data
    console.log('\n🗑️ Cleaning up test data...');
    const cleared = await app.clearHistory(testSessionId);
    console.log(`Test session cleared: ${cleared ? 'Success' : 'Failed'}`);
    
    console.log('\n✅ Memory context test completed!');
    
    // Final recommendation
    if (summary.totalMessages >= 10 && health.status === 'healthy') {
      console.log('🎉 RESULT: Persistent memory is working correctly!');
      console.log('🚀 Ready for production deployment!');
    } else {
      console.log('⚠️  RESULT: Memory system needs attention');
      console.log('🔧 Check Redis connection and configuration');
    }
    
  } catch (error) {
    console.error('❌ Memory context test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down memory context test...');
  process.exit(0);
});

// Run the test
testMemoryContext();
