import { TravelChatbot } from './src/graph/travel-workflow.js';
import { conversationMemory } from './src/memory/conversation-memory.js';

/**
 * Test comprehensive memory system
 * Verify that chatbot remembers all aspects of conversation, not just locations
 */

const chatbot = new TravelChatbot();

// Comprehensive conversation flows testing all context types
const comprehensiveFlows = [
  {
    name: "Complete Travel Planning Flow",
    description: "Test comprehensive context tracking through full planning process",
    messages: [
      {
        user: "lịch trình du lịch Đà Lạt 3 ngày cho gia đình với ngân sách tiết kiệm",
        expectedContext: "Should establish: Đà Lạt, 3 days, family, budget"
      },
      {
        user: "thời tiết ở đó thế nào?",
        expectedContext: "Should remember Đà Lạt location"
      },
      {
        user: "còn chỗ ở nào phù hợp với gia đình?",
        expectedContext: "Should remember Đà Lạt + family context"
      },
      {
        user: "giá cả bao nhiêu?",
        expectedContext: "Should remember accommodation + budget context"
      },
      {
        user: "có gì vui cho trẻ em không?",
        expectedContext: "Should remember Đà Lạt + family + kids context"
      }
    ]
  },

  {
    name: "Budget & Preference Evolution",
    description: "Test budget and preference tracking across conversation",
    messages: [
      {
        user: "du lịch TP.HCM 2 ngày cho cặp đôi",
        expectedContext: "Should establish: HCMC, 2 days, couple"
      },
      {
        user: "muốn ăn món ngon và chụp ảnh đẹp",
        expectedContext: "Should add food + photography preferences"
      },
      {
        user: "ngân sách khoảng 2 triệu",
        expectedContext: "Should add mid-range budget"
      },
      {
        user: "quán cà phê view đẹp gần đó",
        expectedContext: "Should use HCMC + couple + photography context"
      },
      {
        user: "giá cả có phù hợp không?",
        expectedContext: "Should reference 2 triệu budget"
      }
    ]
  },

  {
    name: "Multi-Location Context Switching",
    description: "Test handling multiple locations in conversation",
    messages: [
      {
        user: "so sánh du lịch Đà Nẵng và Nha Trang",
        expectedContext: "Should establish both locations for comparison"
      },
      {
        user: "Đà Nẵng có gì hay?",
        expectedContext: "Should focus on Da Nang from comparison"
      },
      {
        user: "còn Nha Trang thì sao?",
        expectedContext: "Should switch to Nha Trang context"
      },
      {
        user: "cái nào tốt hơn cho gia đình?",
        expectedContext: "Should compare both with family context"
      }
    ]
  },

  {
    name: "Itinerary Refinement Flow",
    description: "Test itinerary context and modification tracking",
    messages: [
      {
        user: "tạo lịch trình Hội An 2 ngày 1 đêm",
        expectedContext: "Should create and store itinerary"
      },
      {
        user: "thay đổi ngày 2 thành tham quan phố cổ",
        expectedContext: "Should reference stored itinerary for modification"
      },
      {
        user: "thêm quán ăn ngon vào lịch trình",
        expectedContext: "Should add to existing Hoi An itinerary"
      },
      {
        user: "tổng chi phí bao nhiêu?",
        expectedContext: "Should calculate based on modified itinerary"
      }
    ]
  },

  {
    name: "Complex Follow-up Patterns",
    description: "Test various follow-up question types",
    messages: [
      {
        user: "khách sạn gần sân bay Tân Sơn Nhất",
        expectedContext: "Should establish TSN airport location"
      },
      {
        user: "cách đi từ đó vào trung tâm thành phố",
        expectedContext: "Should use TSN as starting point"
      },
      {
        user: "mất bao lâu?",
        expectedContext: "Should reference TSN to city center route"
      },
      {
        user: "có phương tiện nào khác không?",
        expectedContext: "Should suggest alternatives for same route"
      },
      {
        user: "cái nào rẻ nhất?",
        expectedContext: "Should compare costs of transport options"
      }
    ]
  }
];

async function testComprehensiveMemory() {
  console.log('🧠 Testing Comprehensive Memory System\n');
  console.log('Testing all aspects: location, budget, duration, preferences, itineraries...\n');

  const allResults = [];

  for (let i = 0; i < comprehensiveFlows.length; i++) {
    const flow = comprehensiveFlows[i];
    const sessionId = `comprehensive_test_${i + 1}`;
    
    console.log(`\n🔄 Flow ${i + 1}/${comprehensiveFlows.length}: ${flow.name}`);
    console.log(`📝 ${flow.description}`);
    console.log('─'.repeat(80));

    // Clear session before starting
    chatbot.clearSessionMemory(sessionId);
    
    const flowResults = [];

    for (let j = 0; j < flow.messages.length; j++) {
      const message = flow.messages[j];
      
      console.log(`\n💬 Message ${j + 1}/${flow.messages.length}`);
      console.log(`User: "${message.user}"`);
      console.log(`Expected: ${message.expectedContext}`);

      try {
        // Get context before message
        const contextBefore = conversationMemory.getContextSummary(sessionId);
        const followUpAnalysis = conversationMemory.analyzeFollowUpEnhanced(sessionId, message.user);
        
        console.log(`🧠 Context before:`, {
          locations: contextBefore.recentLocations || [],
          budget: contextBefore.budget,
          duration: contextBefore.duration,
          groupType: contextBefore.groupType,
          preferences: contextBefore.preferences || [],
          conversationFlow: contextBefore.conversationFlow
        });

        // Send message
        const result = await chatbot.chat(message.user, [], sessionId);
        
        console.log(`🤖 Bot: ${result.response.substring(0, 150)}...`);
        
        // Get context after message
        const contextAfter = conversationMemory.getContextSummary(sessionId);
        
        console.log(`📊 Context after:`, {
          locations: contextAfter.recentLocations || [],
          budget: contextAfter.budget,
          duration: contextAfter.duration,
          groupType: contextAfter.groupType,
          preferences: contextAfter.preferences || [],
          lastItinerary: contextAfter.lastItinerary ? 'Present' : 'None'
        });

        // Analyze context quality
        let contextScore = 0;
        let analysis = [];

        // Check location tracking
        if (contextAfter.recentLocations && contextAfter.recentLocations.length > 0) {
          contextScore += 2;
          analysis.push('✅ Location tracking');
        }

        // Check follow-up detection
        if (j > 0 && followUpAnalysis.isFollowUp) {
          contextScore += 2;
          analysis.push(`✅ Follow-up detected (${followUpAnalysis.followUpType})`);
        }

        // Check comprehensive context
        if (contextAfter.budget || contextAfter.duration || contextAfter.groupType) {
          contextScore += 2;
          analysis.push('✅ Travel context tracked');
        }

        // Check preferences
        if (contextAfter.preferences && contextAfter.preferences.length > 0) {
          contextScore += 1;
          analysis.push('✅ Preferences tracked');
        }

        // Check conversation flow
        if (contextAfter.conversationFlow && contextAfter.conversationFlow !== 'initial') {
          contextScore += 1;
          analysis.push(`✅ Flow: ${contextAfter.conversationFlow}`);
        }

        flowResults.push({
          messageIndex: j + 1,
          userMessage: message.user,
          contextScore: contextScore,
          analysis: analysis,
          contextAfter: contextAfter
        });

        console.log(`📈 Context Score: ${contextScore}/8`);
        console.log(`🔍 Analysis: ${analysis.join(', ')}`);

      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        flowResults.push({
          messageIndex: j + 1,
          userMessage: message.user,
          error: error.message,
          contextScore: 0
        });
      }

      console.log('─'.repeat(40));
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Calculate flow score
    const totalScore = flowResults.reduce((sum, result) => sum + (result.contextScore || 0), 0);
    const maxScore = flowResults.length * 8;
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

    console.log('═'.repeat(80));
  }

  // Overall summary
  const overallScore = allResults.reduce((sum, flow) => sum + parseFloat(flow.score), 0) / allResults.length;
  
  console.log(`\n🎯 COMPREHENSIVE MEMORY TEST SUMMARY:`);
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

  // Context analysis
  console.log(`\n📋 Context Tracking Analysis:`);
  const contextTypes = ['location', 'budget', 'duration', 'groupType', 'preferences', 'itinerary'];
  contextTypes.forEach(type => {
    const successCount = allResults.reduce((count, flow) => {
      return count + flow.results.filter(result => 
        result.analysis && result.analysis.some(a => a.includes(type))
      ).length;
    }, 0);
    const totalMessages = allResults.reduce((count, flow) => count + flow.results.length, 0);
    const successRate = ((successCount / totalMessages) * 100).toFixed(1);
    console.log(`  ${type}: ${successRate}% success rate`);
  });

  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (overallScore >= 85) {
    console.log('✅ Excellent comprehensive memory! All context types tracked well.');
    console.log('✅ Strong follow-up detection and context continuity.');
    console.log('✅ Ready for production deployment.');
  } else if (overallScore >= 70) {
    console.log('⚠️ Good comprehensive memory with room for improvement:');
    console.log('- Enhance budget and preference tracking');
    console.log('- Improve itinerary context handling');
    console.log('- Better multi-location context switching');
  } else {
    console.log('❌ Comprehensive memory needs significant work:');
    console.log('- Context extraction algorithms need improvement');
    console.log('- Follow-up detection missing key patterns');
    console.log('- Memory integration not working effectively');
  }

  return allResults;
}

// Run comprehensive memory test
runComprehensiveMemoryTest().catch(console.error);

async function runComprehensiveMemoryTest() {
  await testComprehensiveMemory();
}
