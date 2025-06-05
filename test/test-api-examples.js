/**
 * API Testing Examples for Travel Chatbot
 * Run this after starting the server with: npm start
 */

const BASE_URL = 'http://localhost:5000';

// Example 1: Simple health check
async function testHealth() {
  console.log('🏥 Testing Health Endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    console.log('✅ Health Response:', data);
    return data.status === 'ok' && data.initialized;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

// Example 2: Single chat message
async function testSingleMessage() {
  console.log('\n💬 Testing Single Message...');
  
  const message = "Nhà hàng phở ngon ở Hà Nội";
  
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        sessionId: 'example-session-1'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Question:', message);
      console.log('🤖 Response:', data.response.substring(0, 200) + '...');
      console.log('📊 Metadata:', data.metadata);
    } else {
      console.log('❌ Error:', data.error);
    }
    
    return data;
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
}

// Example 3: Conversation with context
async function testConversation() {
  console.log('\n🔄 Testing Conversation Flow...');
  
  const sessionId = `conversation-${Date.now()}`;
  const messages = [
    "Tôi muốn du lịch Đà Lạt 3 ngày",
    "Có nhà hàng nào ngon không?",
    "Giá cả thế nào?",
    "Cách đi từ TP.HCM đến đó?"
  ];
  
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    console.log(`\n💬 Message ${i + 1}: "${message}"`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('🤖 Response:', data.response.substring(0, 150) + '...');
        console.log('🧠 Context Used:', data.metadata?.contextUsed || false);
        console.log('🔍 Follow-up Detected:', data.metadata?.followUpDetected || false);
      } else {
        console.log('❌ Error:', data.error);
      }
      
      // Wait between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }
}

// Example 4: Error handling
async function testErrorHandling() {
  console.log('\n⚠️ Testing Error Handling...');
  
  const testCases = [
    { message: '', description: 'Empty message' },
    { message: '   ', description: 'Whitespace only' },
    { message: 'a'.repeat(10000), description: 'Very long message' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.description}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testCase.message,
          sessionId: 'error-test'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Handled gracefully:', data.response.substring(0, 100) + '...');
      } else {
        console.log('⚠️ Expected error:', data.error);
      }
      
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Travel Chatbot API Testing Examples\n');
  console.log('Make sure the server is running: npm start\n');
  console.log('=' .repeat(60));
  
  // Test 1: Health check
  const isHealthy = await testHealth();
  
  if (!isHealthy) {
    console.log('\n❌ Server is not healthy. Please check:');
    console.log('1. Server is running: npm start');
    console.log('2. API keys are configured in .env');
    console.log('3. No firewall blocking port 5000');
    return;
  }
  
  // Test 2: Single message
  await testSingleMessage();
  
  // Test 3: Conversation flow
  await testConversation();
  
  // Test 4: Error handling
  await testErrorHandling();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 Testing Complete!');
  console.log('\n💡 Integration Tips:');
  console.log('- Use unique sessionId for each user');
  console.log('- Handle both success and error responses');
  console.log('- Add retry logic for network failures');
  console.log('- Check metadata for context information');
  console.log('\n📚 See README.md for more integration examples');
}

// Export functions for use in other modules
export { testHealth, testSingleMessage, testConversation, testErrorHandling };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}
