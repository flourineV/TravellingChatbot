#!/usr/bin/env node

import { TravelChatbotApp } from './src/index.js';

/**
 * Simple test demo for the Travel Chatbot
 */

async function testChatbot() {
  console.log('🧪 Testing Travel Chatbot...\n');
  
  try {
    // Initialize the chatbot
    const app = new TravelChatbotApp();
    
    console.log('🔧 Initializing chatbot...');
    const initialized = await app.initialize();
    
    if (!initialized) {
      console.log('❌ Failed to initialize chatbot');
      console.log('💡 Make sure you have set up your API keys in .env file');
      return;
    }
    
    console.log('✅ Chatbot initialized successfully!\n');
    
    // Test queries
    const testQueries = [
      "Hello, can you help me with travel planning?",
      "Best restaurants in Tokyo",
      "Weather in Paris today"
    ];
    
    for (const query of testQueries) {
      console.log(`🧳 Testing query: "${query}"`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      try {
        const result = await app.processMessage(query);
        
        console.log('🤖 Response:');
        console.log(result.response);
        
        if (result.metadata) {
          console.log('\n📋 Metadata:');
          console.log(`   Category: ${result.metadata.category || 'N/A'}`);
          console.log(`   Location: ${result.metadata.location || 'N/A'}`);
          console.log(`   Search Results: ${result.metadata.searchResultsCount || 0}`);
        }
        
        console.log('\n✅ Query processed successfully!\n');
        
      } catch (error) {
        console.error('❌ Error processing query:', error.message);
        console.log('');
      }
    }
    
    // Display summary
    console.log('📊 Final Summary:');
    app.displaySummary();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('OPENAI_API_KEY')) {
      console.log('\n💡 Setup Instructions:');
      console.log('1. Copy .env.example to .env');
      console.log('2. Add your OpenAI API key to OPENAI_API_KEY');
      console.log('3. Add your Tavily API key to TAVILY_API_KEY');
      console.log('4. Run the test again');
    }
  }
}

// Run the test
testChatbot().catch(console.error);
