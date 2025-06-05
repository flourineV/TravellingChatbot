import { TravelChatbot } from './src/graph/travel-workflow.js';

/**
 * Test script for comprehensive travel assistant prompts
 * Tests various types of travel queries to ensure chatbot handles all aspects
 */

const chatbot = new TravelChatbot();

// Test cases covering all travel aspects
const testCases = [
  // 🍽️ Food & Dining
  {
    category: "Food",
    query: "Quán phở ngon ở Hà Nội",
    expectedResponse: "Should provide 3-5 pho restaurants with prices, addresses, specialties"
  },
  {
    category: "Food",
    query: "Đặc sản Đà Lạt phải thử",
    expectedResponse: "Should list local specialties with where to find them"
  },

  // 🏨 Accommodation
  {
    category: "Accommodation", 
    query: "Khách sạn 3 sao gần chợ Bến Thành",
    expectedResponse: "Should compare 3-4 hotels with prices, amenities, location"
  },
  {
    category: "Accommodation",
    query: "Homestay giá rẻ ở Sapa",
    expectedResponse: "Should suggest budget homestays with booking tips"
  },

  // 🗺️ Attractions & Activities
  {
    category: "Attractions",
    query: "Đà Lạt có gì hay?",
    expectedResponse: "Should list must-visit + hidden gems with ticket prices, tips"
  },
  {
    category: "Attractions",
    query: "Hoạt động vui cho gia đình ở Phú Quốc",
    expectedResponse: "Should suggest family-friendly activities"
  },

  // 🌤️ Weather
  {
    category: "Weather",
    query: "Thời tiết Sapa tháng 12",
    expectedResponse: "Should provide detailed forecast + clothing suggestions"
  },
  {
    category: "Weather",
    query: "Mùa nào đi Đà Nẵng đẹp nhất?",
    expectedResponse: "Should explain best seasons with weather details"
  },

  // 🚗 Transportation
  {
    category: "Transportation",
    query: "Từ Hà Nội đi Sapa bằng gì?",
    expectedResponse: "Should compare transport options with prices, time, pros/cons"
  },
  {
    category: "Transportation",
    query: "Di chuyển trong Hội An như thế nào?",
    expectedResponse: "Should suggest local transport options"
  },

  // 💰 Budget & Costs
  {
    category: "Budget",
    query: "Chi phí du lịch Phú Quốc 3 ngày",
    expectedResponse: "Should provide detailed cost breakdown"
  },
  {
    category: "Budget",
    query: "Du lịch Đà Lạt tiết kiệm nhất",
    expectedResponse: "Should give money-saving tips and budget options"
  },

  // ⚠️ Safety & Preparation
  {
    category: "Safety",
    query: "Cần chuẩn bị gì khi đi Sapa?",
    expectedResponse: "Should provide comprehensive packing checklist"
  },
  {
    category: "Safety",
    query: "Lưu ý an toàn khi du lịch một mình",
    expectedResponse: "Should give safety tips for solo travelers"
  },

  // 📋 Itinerary Planning
  {
    category: "Itinerary",
    query: "lộ trình du lịch ở Đồng Nai cho 2 người 2 đêm với mức giá rẻ",
    expectedResponse: "Should create detailed itinerary immediately without asking for more info"
  },
  {
    category: "Itinerary", 
    query: "kế hoạch 3 ngày ở Đà Lạt",
    expectedResponse: "Should create 3-day itinerary with activities and costs"
  },
  {
    category: "Itinerary",
    query: "tôi muốn đi Phú Quốc 4 ngày",
    expectedResponse: "Should create 4-day itinerary with smart assumptions"
  },

  // 👋 Greetings
  {
    category: "Greeting",
    query: "Xin chào, bạn có thể giúp gì?",
    expectedResponse: "Should introduce comprehensive travel capabilities"
  },
  {
    category: "Greeting",
    query: "Hi, what can you do?",
    expectedResponse: "Should list all travel assistance areas"
  },

  // 🎯 General Travel
  {
    category: "General",
    query: "Tips du lịch Việt Nam lần đầu",
    expectedResponse: "Should provide comprehensive first-time travel advice"
  }
];

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Travel Assistant Test\n');
  console.log('Testing improved prompts for all travel aspects...\n');

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    console.log(`\n📝 Test ${i + 1}/${totalTests}: ${testCase.category}`);
    console.log(`Query: "${testCase.query}"`);
    console.log(`Expected: ${testCase.expectedResponse}`);
    console.log('─'.repeat(80));

    try {
      const result = await chatbot.chat(testCase.query);
      
      console.log('✅ Response received:');
      console.log(result.response);
      console.log('\n📊 Metadata:', result.metadata);
      
      // Basic validation
      if (result.response && result.response.length > 50) {
        passedTests++;
        console.log('✅ Test PASSED - Response generated successfully');
      } else {
        console.log('❌ Test FAILED - Response too short or empty');
      }

    } catch (error) {
      console.log('❌ Test FAILED - Error:', error.message);
    }

    console.log('═'.repeat(80));
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎯 TEST SUMMARY:`);
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📊 Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Comprehensive travel assistant is working well.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the responses and improve prompts accordingly.');
  }
}

// Run the test
runComprehensiveTest().catch(console.error);
