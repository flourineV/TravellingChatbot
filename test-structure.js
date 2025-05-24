#!/usr/bin/env node

/**
 * Test script to verify project structure and imports
 * This tests the code structure without requiring API keys
 */

console.log('🔍 Testing project structure...\n');

async function testStructure() {
  try {
    // Test imports
    console.log('📦 Testing imports...');

    // Test config
    console.log('  ✓ Testing config...');
    const { config } = await import('./src/config/index.js');
    console.log('    - Config module loaded');

    // Test types
    console.log('  ✓ Testing types...');
    const { TRAVEL_CATEGORIES, createSearchResult } = await import('./src/types/index.js');
    console.log('    - Types module loaded');
    console.log('    - Travel categories:', Object.keys(TRAVEL_CATEGORIES));

    // Test prompts
    console.log('  ✓ Testing prompts...');
    const { TRAVEL_ASSISTANT_SYSTEM_PROMPT } = await import('./src/prompts/travel-assistant.js');
    console.log('    - Prompts module loaded');

    // Test tools (without API calls)
    console.log('  ✓ Testing tools...');
    const { TravelSearchTool } = await import('./src/tools/tavily-search.js');
    console.log('    - TravelSearchTool class loaded');

    // Test agents (without API calls)
    console.log('  ✓ Testing agents...');
    const { GeminiTravelAgent } = await import('./src/agents/gemini-agent.js');
    console.log('    - GeminiTravelAgent class loaded');

    // Test graph nodes
    console.log('  ✓ Testing graph nodes...');
    const nodes = await import('./src/graph/nodes.js');
    console.log('    - Graph nodes loaded');
    console.log('    - Available nodes:', Object.keys(nodes));

    // Test workflow
    console.log('  ✓ Testing workflow...');
    const { TravelChatbot, createTravelWorkflow } = await import('./src/graph/travel-workflow.js');
    console.log('    - TravelChatbot class loaded');
    console.log('    - createTravelWorkflow function loaded');

    // Test main app
    console.log('  ✓ Testing main app...');
    const { TravelChatbotApp } = await import('./src/index.js');
    console.log('    - TravelChatbotApp class loaded');

    console.log('\n✅ All modules loaded successfully!');

    // Test basic functionality without API calls
    console.log('\n🧪 Testing basic functionality...');

    // Test search result creation
    const searchResult = createSearchResult(
      'Test Title',
      'Test content',
      'https://example.com',
      'Test snippet'
    );
    console.log('  ✓ Search result creation works');

    // Test travel categories
    console.log('  ✓ Travel categories available:', Object.values(TRAVEL_CATEGORIES).join(', '));

    console.log('\n🎉 Structure test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Add your API keys to .env file');
    console.log('2. Run: npm test');
    console.log('3. Run: npm start');

  } catch (error) {
    console.error('❌ Structure test failed:', error.message);
    console.error('\nStack trace:', error.stack);

    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.log('\n💡 This might be a missing dependency. Try:');
      console.log('   npm install');
    }
  }
}

// Run the test
testStructure();
