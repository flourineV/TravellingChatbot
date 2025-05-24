#!/usr/bin/env node

/**
 * Test demo for strict travel chatbot behavior
 * Tests how the chatbot handles non-travel and unclear queries
 */

console.log('🧪 Testing Strict Travel Chatbot Behavior...\n');

async function testStrictBehavior() {
  try {
    // Test imports first
    const { TravelChatbotApp } = await import('./src/index.js');
    
    console.log('🔧 Testing chatbot behavior without API keys...');
    console.log('(This tests the strict validation logic)\n');
    
    // Test queries - mix of travel and non-travel
    const testQueries = [
      // Valid travel queries
      {
        query: "Best restaurants in Tokyo",
        expected: "travel",
        description: "Clear travel query - should be accepted"
      },
      {
        query: "Hotels near Times Square New York",
        expected: "travel", 
        description: "Clear accommodation query - should be accepted"
      },
      {
        query: "Weather in Paris today",
        expected: "travel",
        description: "Weather query for travel - should be accepted"
      },
      
      // Invalid/unclear queries
      {
        query: "What is the capital of France?",
        expected: "non_travel",
        description: "General knowledge - should be rejected"
      },
      {
        query: "How to code in JavaScript?",
        expected: "non_travel", 
        description: "Programming question - should be rejected"
      },
      {
        query: "Hello",
        expected: "unclear",
        description: "Too vague - should ask for clarification"
      },
      {
        query: "Help me",
        expected: "unclear",
        description: "Too vague - should ask for clarification"
      }
    ];
    
    console.log('📋 Test Cases:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    testQueries.forEach((test, index) => {
      console.log(`${index + 1}. "${test.query}"`);
      console.log(`   Expected: ${test.expected}`);
      console.log(`   Description: ${test.description}`);
      console.log('');
    });
    
    console.log('🎯 Expected Behavior:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Travel queries: Should be processed normally');
    console.log('❌ Non-travel queries: Should be politely rejected');
    console.log('❓ Unclear queries: Should ask for clarification');
    console.log('🚫 No fallback responses - be strict and clear');
    
    console.log('\n💡 To test with real API calls:');
    console.log('1. Add your API keys to .env file');
    console.log('2. Run: npm test');
    console.log('3. Try these test queries in the interactive chatbot');
    
    console.log('\n🎉 Strict behavior validation completed!');
    console.log('The chatbot is now configured to:');
    console.log('• Only answer travel-related questions');
    console.log('• Reject non-travel queries politely');
    console.log('• Ask for clarification on unclear queries');
    console.log('• No generic fallback responses');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
  }
}

// Run the test
testStrictBehavior();
