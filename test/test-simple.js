import { TravelChatbotApp } from '../src/index.js';

/**
 * Simple test to check if the chatbot can initialize and handle basic operations
 * without requiring external API calls
 */

async function testBasicInitialization() {
  console.log('🧪 Testing Basic Chatbot Initialization...\n');
  
  try {
    // Test 1: Create chatbot instance
    console.log('1️⃣ Creating TravelChatbotApp instance...');
    const chatbotApp = new TravelChatbotApp();
    console.log('✅ Instance created successfully');
    
    // Test 2: Check initial state
    console.log('\n2️⃣ Checking initial state...');
    console.log(`   - isInitialized: ${chatbotApp.isInitialized}`);
    console.log(`   - chatbot: ${chatbotApp.chatbot ? 'exists' : 'null'}`);
    console.log('✅ Initial state checked');
    
    // Test 3: Try to initialize (this might fail due to API issues)
    console.log('\n3️⃣ Attempting to initialize chatbot...');
    const initResult = await chatbotApp.initialize();
    
    if (initResult) {
      console.log('✅ Chatbot initialized successfully!');
      
      // Test 4: Check post-initialization state
      console.log('\n4️⃣ Checking post-initialization state...');
      console.log(`   - isInitialized: ${chatbotApp.isInitialized}`);
      console.log(`   - chatbot: ${chatbotApp.chatbot ? 'exists' : 'null'}`);
      
      // Test 5: Try basic operations
      console.log('\n5️⃣ Testing basic operations...');
      
      // Test empty message handling
      try {
        const emptyResult = await chatbotApp.processMessage('', [], 'test-session');
        console.log('✅ Empty message handled:', emptyResult.response.substring(0, 50) + '...');
      } catch (error) {
        console.log('❌ Empty message test failed:', error.message);
      }
      
      // Test whitespace message handling
      try {
        const whitespaceResult = await chatbotApp.processMessage('   ', [], 'test-session');
        console.log('✅ Whitespace message handled:', whitespaceResult.response.substring(0, 50) + '...');
      } catch (error) {
        console.log('❌ Whitespace message test failed:', error.message);
      }
      
      // Test history and summary functions
      try {
        const history = chatbotApp.getHistory();
        console.log(`✅ History retrieved: ${Array.isArray(history) ? history.length : 'not array'} items`);
        
        const summary = chatbotApp.getSummary();
        console.log(`✅ Summary retrieved: ${summary ? 'exists' : 'null'}`);
        
        chatbotApp.clearHistory();
        console.log('✅ History cleared');
        
      } catch (error) {
        console.log('❌ History/Summary operations failed:', error.message);
      }
      
    } else {
      console.log('❌ Chatbot initialization failed (likely due to API connectivity issues)');
      console.log('   This is expected if there are network issues or API key problems');
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('   Stack trace:', error.stack);
  }
}

async function testConfigValidation() {
  console.log('\n🔧 Testing Configuration Validation...\n');
  
  try {
    // Import config validation
    const { validateConfig, config } = await import('../src/config/index.js');
    
    console.log('1️⃣ Testing config validation...');
    validateConfig();
    console.log('✅ Config validation passed');
    
    console.log('\n2️⃣ Checking config values...');
    console.log(`   - LLM Provider: ${config.llm.provider}`);
    console.log(`   - Temperature: ${config.llm.temperature}`);
    console.log(`   - Gemini Model: ${config.gemini.model}`);
    console.log(`   - Gemini API Key: ${config.gemini.apiKey ? 'Set' : 'Not set'}`);
    console.log(`   - Tavily API Key: ${config.tavily.apiKey ? 'Set' : 'Not set'}`);
    console.log('✅ Config values checked');
    
  } catch (error) {
    console.log('❌ Config validation failed:', error.message);
  }
}

async function testMemorySystem() {
  console.log('\n🧠 Testing Memory System...\n');
  
  try {
    // Import memory system
    const { conversationMemory } = await import('../src/memory/conversation-memory.js');
    
    console.log('1️⃣ Testing memory operations...');
    
    const testSessionId = 'simple-test-session';
    
    // Add test messages
    conversationMemory.addMessage(testSessionId, 'Hello, I want to visit Tokyo', true, { location: 'Tokyo' });
    conversationMemory.addMessage(testSessionId, 'Tokyo is a great destination...', false, { location: 'Tokyo', category: 'attractions' });
    conversationMemory.addMessage(testSessionId, 'What about restaurants?', true);
    
    console.log('✅ Test messages added');
    
    // Test context retrieval
    const context = conversationMemory.getRecentContext(testSessionId, 3);
    console.log(`✅ Retrieved ${context.length} messages from memory`);
    
    // Test follow-up analysis
    const followUp = conversationMemory.analyzeFollowUp(testSessionId, 'How much does it cost?');
    console.log(`✅ Follow-up analysis: ${followUp.isFollowUp ? 'detected' : 'not detected'}`);
    
    // Test context summary
    const summary = conversationMemory.getContextSummary(testSessionId);
    console.log(`✅ Context summary: ${summary.hasContext ? 'has context' : 'no context'}`);
    console.log(`   - Locations: ${summary.recentLocations.join(', ')}`);
    console.log(`   - Categories: ${summary.recentCategories.join(', ')}`);
    
    // Clear test session
    conversationMemory.clearSession(testSessionId);
    console.log('✅ Test session cleared');
    
  } catch (error) {
    console.log('❌ Memory system test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Simple Chatbot Tests\n');
  console.log('=' .repeat(60));
  
  await testConfigValidation();
  console.log('\n' + '=' .repeat(60));
  
  await testMemorySystem();
  console.log('\n' + '=' .repeat(60));
  
  await testBasicInitialization();
  console.log('\n' + '=' .repeat(60));
  
  console.log('\n🎯 Test Summary:');
  console.log('- Configuration validation: Check above for results');
  console.log('- Memory system: Check above for results');
  console.log('- Basic initialization: Check above for results');
  console.log('\n💡 Note: API-related failures are expected if there are network issues');
  console.log('   The important thing is that the basic structure works correctly.');
}

// Run tests
runAllTests().catch(console.error);
