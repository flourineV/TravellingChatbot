/**
 * Debug test for memory follow-up detection
 */

import { conversationMemory } from '../src/memory/conversation-memory.js';

async function debugFollowUp() {
  console.log('🔍 Debug Follow-up Detection\n');
  
  const sessionId = 'debug-session';
  
  // Clear session
  conversationMemory.clearSession(sessionId);
  
  // Add messages
  console.log('1️⃣ Adding messages...');
  conversationMemory.addMessage(sessionId, 'Tôi cần 2 địa điểm du lịch ở Đồng Nai', true, { location: 'Đồng Nai' });
  conversationMemory.addMessage(sessionId, 'Gợi ý Vườn Quốc gia Cát Tiên...', false, { 
    location: 'Đồng Nai', 
    category: 'attractions' 
  });
  
  // Get context
  console.log('\n2️⃣ Getting context...');
  const context = conversationMemory.getContextSummary(sessionId);
  console.log('Context:', JSON.stringify(context, null, 2));
  
  // Test follow-up analysis step by step
  console.log('\n3️⃣ Testing follow-up analysis...');
  
  try {
    const query = 'tôi có ngân sách 2 triệu';
    console.log(`Query: "${query}"`);
    
    // Manual analysis
    const queryLower = query.toLowerCase();
    console.log(`Query lower: "${queryLower}"`);
    
    const budgetIndicators = ['triệu', 'nghìn', 'ngân sách', 'budget', 'tiền', 'chi phí'];
    const hasBudgetMention = budgetIndicators.some(indicator => queryLower.includes(indicator));
    console.log(`Has budget mention: ${hasBudgetMention}`);
    console.log(`Recent locations: ${context.recentLocations}`);
    console.log(`Should be follow-up: ${context.recentLocations.length > 0 && hasBudgetMention}`);
    
    // Call the actual function
    const result = conversationMemory.analyzeFollowUpEnhanced(sessionId, query);
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

debugFollowUp().catch(console.error);
