import { TravelChatbot } from './src/graph/travel-workflow.js';

/**
 * Test script for specific location handling (universities, companies, landmarks)
 * Tests chatbot's ability to handle queries about specific places that need location clarification
 */

const chatbot = new TravelChatbot();

// Test cases for specific location queries
const specificLocationTests = [
  // Universities/Schools
  {
    category: "University",
    query: "địa điểm du lịch gần trường UIT",
    expectedBehavior: "Should ask for city/location of UIT, then provide suggestions"
  },
  {
    category: "University",
    query: "quán ăn ngon gần HCMUS",
    expectedBehavior: "Should ask for location clarification or assume Ho Chi Minh City"
  },
  {
    category: "University",
    query: "chỗ ở gần trường Bách Khoa",
    expectedBehavior: "Should ask which Bách Khoa (Hanoi/HCMC) or provide options for both"
  },

  // Companies/Buildings
  {
    category: "Company",
    query: "nhà hàng gần tòa nhà Bitexco",
    expectedBehavior: "Should recognize Bitexco as HCMC landmark and provide suggestions"
  },
  {
    category: "Company",
    query: "điểm tham quan gần công ty FPT",
    expectedBehavior: "Should ask which FPT location or provide general suggestions"
  },

  // Landmarks with clarification
  {
    category: "Landmark",
    query: "du lịch gần sân bay",
    expectedBehavior: "Should ask which airport or provide options for major airports"
  },
  {
    category: "Landmark",
    query: "khách sạn gần bến xe",
    expectedBehavior: "Should ask which city/bus station"
  },

  // Follow-up after clarification
  {
    category: "Follow-up",
    query: "UIT ở TP.HCM",
    expectedBehavior: "Should provide specific suggestions around UIT HCMC area"
  },
  {
    category: "Follow-up",
    query: "trường UIT thuộc Đại học Quốc gia TP.HCM",
    expectedBehavior: "Should provide detailed suggestions for Thu Duc area"
  }
];

async function testSpecificLocationHandling() {
  console.log('🎯 Testing Specific Location Handling\n');
  console.log('Testing chatbot ability to handle universities, companies, and specific landmarks...\n');

  let passedTests = 0;
  let totalTests = specificLocationTests.length;

  for (let i = 0; i < specificLocationTests.length; i++) {
    const testCase = specificLocationTests[i];
    
    console.log(`\n📍 Test ${i + 1}/${totalTests}: ${testCase.category}`);
    console.log(`Query: "${testCase.query}"`);
    console.log(`Expected: ${testCase.expectedBehavior}`);
    console.log('─'.repeat(80));

    try {
      const result = await chatbot.chat(testCase.query);
      
      console.log('✅ Response received:');
      console.log(result.response);
      console.log('\n📊 Metadata:', result.metadata);
      
      // Analyze response quality
      const response = result.response.toLowerCase();
      let testPassed = false;
      
      // Check if response appropriately handles the specific location query
      if (testCase.category === "University" || testCase.category === "Company") {
        // Should either ask for clarification or provide location-specific suggestions
        if (response.includes('thành phố nào') || 
            response.includes('ở đâu') || 
            response.includes('cho biết') ||
            response.includes('tp.hcm') ||
            response.includes('hà nội')) {
          testPassed = true;
        }
      } else if (testCase.category === "Follow-up") {
        // Should provide specific suggestions after clarification
        if (response.includes('gần') && 
            (response.includes('quán') || response.includes('điểm') || response.includes('khách sạn'))) {
          testPassed = true;
        }
      } else {
        // General check for meaningful response
        if (result.response && result.response.length > 100) {
          testPassed = true;
        }
      }

      if (testPassed) {
        passedTests++;
        console.log('✅ Test PASSED - Appropriate handling of specific location');
      } else {
        console.log('❌ Test FAILED - Response doesn\'t handle specific location well');
      }

    } catch (error) {
      console.log('❌ Test FAILED - Error:', error.message);
    }

    console.log('═'.repeat(80));
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\n🎯 SPECIFIC LOCATION TEST SUMMARY:`);
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📊 Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

  // Recommendations based on results
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (passedTests >= totalTests * 0.8) {
    console.log('✅ Chatbot handles specific locations well!');
    console.log('✅ Good at asking for clarification when needed');
    console.log('✅ Provides appropriate suggestions after getting location info');
  } else {
    console.log('⚠️ Need to improve specific location handling:');
    console.log('- Better recognition of university/company names');
    console.log('- More consistent clarification requests');
    console.log('- Improved search for specific landmarks');
  }
}

// Test conversation flow for UIT specifically
async function testUITConversationFlow() {
  console.log('\n🏫 Testing UIT Conversation Flow\n');
  
  // Clear previous conversation
  chatbot.clearHistory();
  
  console.log('Step 1: Initial vague query about UIT');
  const step1 = await chatbot.chat("địa điểm du lịch gần trường UIT");
  console.log('Response 1:', step1.response);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\nStep 2: Provide clarification');
  const step2 = await chatbot.chat("UIT ở TP.HCM");
  console.log('Response 2:', step2.response);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\nStep 3: Ask for more specific info');
  const step3 = await chatbot.chat("quán ăn ngon gần đó");
  console.log('Response 3:', step3.response);
  
  console.log('\n📊 Conversation Summary:');
  console.log('- Step 1 should ask for clarification');
  console.log('- Step 2 should provide specific suggestions for HCMC');
  console.log('- Step 3 should continue with food recommendations in the same area');
}

// Run tests
async function runAllTests() {
  await testSpecificLocationHandling();
  await testUITConversationFlow();
}

runAllTests().catch(console.error);
