import { TravelChatbot } from './src/graph/travel-workflow.js';
import { conversationMemory } from './src/memory/conversation-memory.js';

/**
 * Test conversation memory and context tracing
 * Verify that chatbot remembers previous 3-4 exchanges
 */

const chatbot = new TravelChatbot();

// Test conversation flows that require memory
const conversationFlows = [
  {
    name: "Location Follow-up Flow",
    description: "Test location continuity with follow-up questions",
    messages: [
      {
        user: "địa điểm du lịch gần trường UIT",
        expectedContext: "Should establish UIT location context"
      },
      {
        user: "quán ăn ngon gần đó",
        expectedContext: "Should remember UIT location and suggest food nearby"
      },
      {
        user: "giá cả thế nào?",
        expectedContext: "Should remember food context near UIT"
      },
      {
        user: "cách đi từ sân bay đến đó",
        expectedContext: "Should remember UIT as destination"
      }
    ]
  },
  
  {
    name: "Topic Continuation Flow", 
    description: "Test topic memory across multiple questions",
    messages: [
      {
        user: "lịch trình du lịch Đà Lạt 3 ngày",
        expectedContext: "Should create Da Lat itinerary"
      },
      {
        user: "thời tiết ở đó thế nào?",
        expectedContext: "Should remember Da Lat location"
      },
      {
        user: "còn chỗ ở nào tốt?",
        expectedContext: "Should suggest accommodation in Da Lat"
      },
      {
        user: "chi phí tổng cộng bao nhiêu?",
        expectedContext: "Should calculate costs for Da Lat trip"
      }
    ]
  },

  {
    name: "Company Location Flow",
    description: "Test company location memory",
    messages: [
      {
        user: "nhà hàng gần FPT Software",
        expectedContext: "Should ask which FPT location"
      },
      {
        user: "FPT ở TP.HCM",
        expectedContext: "Should remember FPT HCMC context"
      },
      {
        user: "khách sạn gần đó",
        expectedContext: "Should suggest hotels near FPT HCMC"
      }
    ]
  },

  {
    name: "Mixed Context Flow",
    description: "Test complex context switching",
    messages: [
      {
        user: "quán cà phê gần Bitexco",
        expectedContext: "Should establish Bitexco (District 1) context"
      },
      {
        user: "từ đó đi UIT bằng gì?",
        expectedContext: "Should remember Bitexco as starting point"
      },
      {
        user: "mất bao lâu?",
        expectedContext: "Should remember Bitexco to UIT route"
      }
    ]
  }
];

async function testConversationFlow(flow, sessionId) {
  console.log(`\n🔄 Testing: ${flow.name}`);
  console.log(`📝 ${flow.description}`);
  console.log('─'.repeat(80));

  const results = [];

  for (let i = 0; i < flow.messages.length; i++) {
    const message = flow.messages[i];
    
    console.log(`\n💬 Message ${i + 1}/${flow.messages.length}`);
    console.log(`User: "${message.user}"`);
    console.log(`Expected: ${message.expectedContext}`);

    try {
      // Get context before sending message
      const contextBefore = conversationMemory.getContextSummary(sessionId);
      const followUpAnalysis = conversationMemory.analyzeFollowUp(sessionId, message.user);
      
      console.log(`🧠 Context before: ${contextBefore.hasContext ? 
        `${contextBefore.recentLocations.join(', ')} | ${contextBefore.recentCategories.join(', ')}` : 
        'No context'}`);
      console.log(`🔍 Follow-up detected: ${followUpAnalysis.isFollowUp}`);

      // Send message
      const result = await chatbot.chat(message.user, [], sessionId);
      
      console.log(`🤖 Bot: ${result.response.substring(0, 200)}...`);
      console.log(`📊 Metadata:`, {
        category: result.metadata.category,
        location: result.metadata.location,
        followUpDetected: result.metadata.followUpDetected,
        contextUsed: result.metadata.contextUsed
      });

      // Analyze result quality
      const response = result.response.toLowerCase();
      let qualityScore = 0;
      let analysis = [];

      // Check for context usage
      if (i > 0) {
        // Should use context from previous messages
        if (result.metadata.contextUsed) {
          qualityScore += 2;
          analysis.push('✅ Used conversation context');
        } else {
          analysis.push('❌ Did not use conversation context');
        }

        // Check for follow-up detection
        if (followUpAnalysis.isFollowUp && result.metadata.followUpDetected) {
          qualityScore += 2;
          analysis.push('✅ Correctly detected follow-up');
        } else if (followUpAnalysis.isFollowUp) {
          analysis.push('⚠️ Missed follow-up detection');
        }
      }

      // Check response relevance
      if (result.response.length > 100) {
        qualityScore += 1;
        analysis.push('✅ Generated substantial response');
      }

      results.push({
        messageIndex: i + 1,
        userMessage: message.user,
        botResponse: result.response.substring(0, 100),
        qualityScore: qualityScore,
        analysis: analysis,
        metadata: result.metadata
      });

      console.log(`📈 Quality Score: ${qualityScore}/5`);
      console.log(`🔍 Analysis: ${analysis.join(', ')}`);

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({
        messageIndex: i + 1,
        userMessage: message.user,
        error: error.message,
        qualityScore: 0
      });
    }

    console.log('─'.repeat(40));
    
    // Add delay between messages
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  return results;
}

async function runConversationMemoryTests() {
  console.log('🧠 Testing Conversation Memory & Context Tracing\n');
  console.log('Testing chatbot ability to remember 3-4 previous exchanges...\n');

  const allResults = [];
  
  for (let i = 0; i < conversationFlows.length; i++) {
    const flow = conversationFlows[i];
    const sessionId = `test_session_${i + 1}`;
    
    // Clear session before starting
    chatbot.clearSessionMemory(sessionId);
    
    const flowResults = await testConversationFlow(flow, sessionId);
    
    // Calculate flow score
    const totalScore = flowResults.reduce((sum, result) => sum + (result.qualityScore || 0), 0);
    const maxScore = flowResults.length * 5;
    const flowScore = ((totalScore / maxScore) * 100).toFixed(1);
    
    console.log(`\n📊 Flow "${flow.name}" Score: ${totalScore}/${maxScore} (${flowScore}%)`);
    
    allResults.push({
      flowName: flow.name,
      sessionId: sessionId,
      results: flowResults,
      score: flowScore,
      totalScore: totalScore,
      maxScore: maxScore
    });

    // Export session for debugging
    const sessionData = chatbot.exportSession(sessionId);
    console.log(`💾 Session exported: ${sessionData ? sessionData.messageCount : 0} messages`);
    
    console.log('═'.repeat(80));
  }

  // Overall summary
  const overallScore = allResults.reduce((sum, flow) => sum + parseFloat(flow.score), 0) / allResults.length;
  
  console.log(`\n🎯 CONVERSATION MEMORY TEST SUMMARY:`);
  console.log(`📊 Overall Score: ${overallScore.toFixed(1)}%`);
  
  allResults.forEach(flow => {
    console.log(`  ${flow.flowName}: ${flow.score}%`);
  });

  // Memory statistics
  const memoryStats = chatbot.getMemoryStats();
  console.log(`\n🧠 Memory Statistics:`);
  console.log(`  Total Sessions: ${memoryStats.totalSessions}`);
  console.log(`  Active Sessions: ${memoryStats.activeSessions}`);
  console.log(`  Total Messages: ${memoryStats.totalMessages}`);

  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (overallScore >= 80) {
    console.log('✅ Excellent conversation memory! Context tracing works well.');
    console.log('✅ Good follow-up detection and context usage.');
  } else if (overallScore >= 60) {
    console.log('⚠️ Good but needs improvement:');
    console.log('- Better follow-up question detection');
    console.log('- More consistent context usage');
    console.log('- Improved location/topic continuity');
  } else {
    console.log('❌ Conversation memory needs significant work:');
    console.log('- Context not being used effectively');
    console.log('- Follow-up detection failing');
    console.log('- Memory integration issues');
  }

  return allResults;
}

// Test memory system directly
async function testMemorySystem() {
  console.log('\n🔧 Testing Memory System Directly...');
  
  const testSessionId = 'direct_test';
  
  // Add some test messages
  conversationMemory.addMessage(testSessionId, 'địa điểm gần UIT', true, { location: 'UIT' });
  conversationMemory.addMessage(testSessionId, 'UIT ở TP.HCM, Thủ Đức...', false, { location: 'TP.HCM', category: 'attractions' });
  conversationMemory.addMessage(testSessionId, 'quán ăn gần đó', true);
  
  // Test context retrieval
  const context = conversationMemory.getRecentContext(testSessionId, 4);
  console.log(`📝 Retrieved ${context.length} messages from memory`);
  
  // Test follow-up analysis
  const followUp = conversationMemory.analyzeFollowUp(testSessionId, 'giá cả thế nào?');
  console.log(`🔍 Follow-up analysis:`, followUp);
  
  // Test context summary
  const summary = conversationMemory.getContextSummary(testSessionId);
  console.log(`📊 Context summary:`, summary);
  
  console.log('✅ Memory system direct test completed');
}

// Run all tests
async function runAllTests() {
  await testMemorySystem();
  await runConversationMemoryTests();
}

runAllTests().catch(console.error);
