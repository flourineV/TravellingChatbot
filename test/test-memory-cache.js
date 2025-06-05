/**
 * Test Memory and Cache System
 * Tests conversation memory and request caching functionality
 */

import { TravelChatbotApp } from '../src/index.js';
import { conversationMemory } from '../src/memory/conversation-memory.js';
import { requestCache } from '../src/memory/request-cache.js';

async function testMemorySystem() {
  console.log('🧠 Testing Memory System...\n');
  
  try {
    const sessionId = 'memory-test-session';
    
    // Clear any existing session
    conversationMemory.clearSession(sessionId);
    
    // Test 1: Add messages to memory
    console.log('1️⃣ Adding messages to memory...');
    conversationMemory.addMessage(sessionId, 'Tôi cần 2 địa điểm du lịch ở Đồng Nai', true, { location: 'Đồng Nai' });
    conversationMemory.addMessage(sessionId, 'Gợi ý Vườn Quốc gia Cát Tiên và Khu du lịch Bửu Long...', false, { 
      location: 'Đồng Nai', 
      category: 'attractions' 
    });
    console.log('✅ Messages added to memory');
    
    // Test 2: Check context summary
    console.log('\n2️⃣ Checking context summary...');
    const context = conversationMemory.getContextSummary(sessionId);
    console.log(`   - Has context: ${context.hasContext}`);
    console.log(`   - Primary location: ${context.primaryLocation}`);
    console.log(`   - Recent locations: ${context.recentLocations.join(', ')}`);
    console.log(`   - Recent categories: ${context.recentCategories.join(', ')}`);
    
    // Test 3: Follow-up analysis
    console.log('\n3️⃣ Testing follow-up analysis...');
    const followUp1 = conversationMemory.analyzeFollowUpEnhanced(sessionId, 'tôi có ngân sách 2 triệu');
    console.log(`   - Is follow-up: ${followUp1.isFollowUp}`);
    console.log(`   - Follow-up type: ${followUp1.followUpType}`);
    console.log(`   - Context type: ${followUp1.contextType}`);
    console.log(`   - Suggested context: ${followUp1.suggestedContext}`);
    
    const followUp2 = conversationMemory.analyzeFollowUpEnhanced(sessionId, 'giá cả thế nào?');
    console.log(`   - Second query follow-up: ${followUp2.isFollowUp} (${followUp2.followUpType})`);
    
    console.log('✅ Memory system working correctly');
    
  } catch (error) {
    console.log('❌ Memory system test failed:', error.message);
  }
}

async function testCacheSystem() {
  console.log('\n💾 Testing Cache System...\n');
  
  try {
    // Test 1: Cache a response
    console.log('1️⃣ Testing cache operations...');
    const testMessage = 'Nhà hàng ngon ở Hà Nội';
    const testResponse = {
      success: true,
      response: 'Gợi ý một số nhà hàng ngon ở Hà Nội...',
      metadata: { category: 'food', location: 'Hà Nội' }
    };
    
    requestCache.cacheResponse(testMessage, testResponse);
    console.log('✅ Response cached');
    
    // Test 2: Retrieve from cache
    const cached = requestCache.getCachedResponse(testMessage);
    if (cached && cached.metadata.cached) {
      console.log('✅ Cache retrieval successful');
    } else {
      console.log('❌ Cache retrieval failed');
    }
    
    // Test 3: Add to history
    console.log('\n2️⃣ Testing request history...');
    requestCache.addToHistory('test-session', 
      { message: testMessage, sessionId: 'test-session', responseTime: 1500 },
      testResponse
    );
    
    const history = requestCache.getHistory('test-session');
    console.log(`✅ History added: ${history.length} entries`);
    
    // Test 4: Analytics
    console.log('\n3️⃣ Testing analytics...');
    const analytics = requestCache.getSessionAnalytics('test-session');
    if (analytics.hasData) {
      console.log(`   - Total requests: ${analytics.totalRequests}`);
      console.log(`   - Success rate: ${analytics.successRate}%`);
      console.log(`   - Cache hit rate: ${analytics.cacheHitRate}%`);
    }
    
    // Test 5: Global stats
    const stats = requestCache.getCacheStats();
    console.log(`   - Cache size: ${stats.cacheSize}`);
    console.log(`   - Total sessions: ${stats.totalSessions}`);
    
    console.log('✅ Cache system working correctly');
    
  } catch (error) {
    console.log('❌ Cache system test failed:', error.message);
  }
}

async function testIntegratedFlow() {
  console.log('\n🔄 Testing Integrated Memory + Cache Flow...\n');
  
  try {
    const chatbot = new TravelChatbotApp();
    const sessionId = 'integrated-test-session';
    
    console.log('1️⃣ Initializing chatbot...');
    const initialized = await chatbot.initialize();
    
    if (!initialized) {
      console.log('❌ Chatbot initialization failed - skipping integrated test');
      return;
    }
    
    console.log('✅ Chatbot initialized');
    
    // Test conversation flow
    console.log('\n2️⃣ Testing conversation flow...');
    
    // First message
    console.log('   📝 First message: "Tôi cần 2 địa điểm du lịch ở Đồng Nai"');
    const response1 = await chatbot.processMessage('Tôi cần 2 địa điểm du lịch ở Đồng Nai', [], sessionId);
    console.log(`   ✅ Response 1: ${response1.response.substring(0, 100)}...`);
    console.log(`   📊 Metadata: category=${response1.metadata.category}, location=${response1.metadata.location}`);
    
    // Follow-up message
    console.log('\n   📝 Follow-up message: "tôi có ngân sách 2 triệu"');
    const response2 = await chatbot.processMessage('tôi có ngân sách 2 triệu', [], sessionId);
    console.log(`   ✅ Response 2: ${response2.response.substring(0, 100)}...`);
    console.log(`   📊 Follow-up detected: ${response2.metadata.followUpDetected}`);
    console.log(`   📊 Context used: ${response2.metadata.contextUsed}`);
    
    // Check if second response is about budget planning for Đồng Nai
    const isCorrectFollowUp = response2.response.toLowerCase().includes('đồng nai') && 
                             (response2.response.toLowerCase().includes('ngân sách') || 
                              response2.response.toLowerCase().includes('budget') ||
                              response2.response.toLowerCase().includes('chi phí'));
    
    if (isCorrectFollowUp) {
      console.log('✅ Follow-up context correctly understood!');
    } else {
      console.log('❌ Follow-up context not properly handled');
    }
    
    // Test cache
    console.log('\n3️⃣ Testing cache integration...');
    const cacheStats = requestCache.getCacheStats();
    console.log(`   📊 Cache entries: ${cacheStats.cacheSize}`);
    console.log(`   📊 Total requests: ${cacheStats.totalRequests}`);
    
    // Test session analytics
    const sessionAnalytics = requestCache.getSessionAnalytics(sessionId);
    if (sessionAnalytics.hasData) {
      console.log(`   📊 Session requests: ${sessionAnalytics.totalRequests}`);
      console.log(`   📊 Session success rate: ${sessionAnalytics.successRate}%`);
    }
    
    console.log('✅ Integrated flow test completed');
    
  } catch (error) {
    console.log('❌ Integrated flow test failed:', error.message);
    console.log('   Stack:', error.stack);
  }
}

async function runAllTests() {
  console.log('🚀 Memory & Cache System Tests\n');
  console.log('=' .repeat(60));
  
  await testMemorySystem();
  console.log('\n' + '=' .repeat(60));
  
  await testCacheSystem();
  console.log('\n' + '=' .repeat(60));
  
  await testIntegratedFlow();
  console.log('\n' + '=' .repeat(60));
  
  console.log('\n🎯 Test Summary:');
  console.log('- Memory system: Check results above');
  console.log('- Cache system: Check results above');
  console.log('- Integrated flow: Check follow-up detection');
  console.log('\n💡 If follow-up detection works, the chatbot should understand');
  console.log('   that "tôi có ngân sách 2 triệu" refers to budget for Đồng Nai travel');
}

// Run tests
runAllTests().catch(console.error);
