import { TravelChatbot } from './src/graph/travel-workflow.js';

/**
 * Comprehensive test for all types of specific locations
 * Universities, companies, malls, hospitals, airports, etc.
 */

const chatbot = new TravelChatbot();

const comprehensiveLocationTests = [
  // 🏫 Universities
  {
    category: "University",
    query: "địa điểm du lịch gần trường UIT",
    expectedBehavior: "Should recognize UIT in HCMC and suggest nearby attractions"
  },
  {
    category: "University", 
    query: "quán ăn ngon gần HCMUS",
    expectedBehavior: "Should suggest food near HCMUS in Thu Duc"
  },

  // 🏢 Companies & Tech Parks
  {
    category: "Company",
    query: "nhà hàng gần FPT Software",
    expectedBehavior: "Should ask which FPT (HCMC or Hanoi) or provide options for both"
  },
  {
    category: "Company",
    query: "điểm tham quan gần Bitexco",
    expectedBehavior: "Should recognize Bitexco in HCMC District 1 and suggest nearby attractions"
  },
  {
    category: "Company",
    query: "khách sạn gần Viettel",
    expectedBehavior: "Should ask which Viettel location or provide options"
  },

  // 🛍️ Shopping Malls
  {
    category: "Mall",
    query: "quán cà phê gần Vincom",
    expectedBehavior: "Should ask which Vincom or suggest options for major Vincom centers"
  },
  {
    category: "Mall",
    query: "địa điểm vui chơi gần Crescent Mall",
    expectedBehavior: "Should recognize Crescent Mall in District 7 and suggest nearby entertainment"
  },
  {
    category: "Mall",
    query: "ăn gì gần Lotte Center Hanoi",
    expectedBehavior: "Should suggest restaurants near Lotte Center in Ba Dinh, Hanoi"
  },

  // 🏥 Hospitals
  {
    category: "Hospital",
    query: "khách sạn gần bệnh viện Chợ Rẫy",
    expectedBehavior: "Should suggest hotels near Cho Ray Hospital in District 5"
  },
  {
    category: "Hospital",
    query: "quán ăn gần Bạch Mai",
    expectedBehavior: "Should ask which Bach Mai (HCMC or Hanoi) or provide options"
  },
  {
    category: "Hospital",
    query: "điểm tham quan gần bệnh viện Việt Đức",
    expectedBehavior: "Should suggest attractions near Viet Duc Hospital in Hanoi Old Quarter"
  },

  // ✈️ Transportation Hubs
  {
    category: "Airport",
    query: "khách sạn gần sân bay Tân Sơn Nhất",
    expectedBehavior: "Should suggest hotels near TSN Airport in Tan Binh District"
  },
  {
    category: "Airport",
    query: "quán ăn gần sân bay Nội Bài",
    expectedBehavior: "Should suggest restaurants near Noi Bai Airport"
  },
  {
    category: "Transport",
    query: "chỗ ở gần bến xe Miền Đông",
    expectedBehavior: "Should suggest accommodation near Mien Dong Bus Station"
  },

  // 🔄 Mixed and Complex Queries
  {
    category: "Mixed",
    query: "từ sân bay đi FPT Software bằng gì?",
    expectedBehavior: "Should ask for clarification on which airport and which FPT location"
  },
  {
    category: "Mixed",
    query: "lộ trình 1 ngày từ UIT đến Bitexco",
    expectedBehavior: "Should create itinerary from UIT (Thu Duc) to Bitexco (District 1)"
  },

  // 🌟 General Location Queries
  {
    category: "General",
    query: "địa điểm du lịch gần trung tâm thương mại",
    expectedBehavior: "Should ask which mall or suggest popular malls with nearby attractions"
  },
  {
    category: "General",
    query: "quán ăn ngon gần công ty công nghệ",
    expectedBehavior: "Should ask for specific company or suggest tech hubs with food options"
  }
];

async function testComprehensiveLocations() {
  console.log('🌟 Testing Comprehensive Location Recognition\n');
  console.log('Testing universities, companies, malls, hospitals, airports...\n');

  let passedTests = 0;
  let totalTests = comprehensiveLocationTests.length;
  const results = [];

  for (let i = 0; i < comprehensiveLocationTests.length; i++) {
    const testCase = comprehensiveLocationTests[i];
    
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
      let analysis = '';
      
      // Check for appropriate location handling
      if (testCase.category === "University" || testCase.category === "Company" || 
          testCase.category === "Mall" || testCase.category === "Hospital") {
        
        // Should either provide specific suggestions or ask for clarification
        if (response.includes('gần') || 
            response.includes('khu vực') ||
            response.includes('thành phố nào') ||
            response.includes('cho biết') ||
            response.includes('địa chỉ') ||
            response.includes('quận')) {
          testPassed = true;
          analysis = 'Good location handling';
        }
      } else if (testCase.category === "Mixed") {
        // Should handle complex multi-location queries
        if (response.length > 100 && 
            (response.includes('di chuyển') || response.includes('lộ trình') || response.includes('từ'))) {
          testPassed = true;
          analysis = 'Good complex query handling';
        }
      } else {
        // General check for meaningful response
        if (result.response && result.response.length > 100) {
          testPassed = true;
          analysis = 'Meaningful response generated';
        }
      }

      results.push({
        test: testCase.query,
        category: testCase.category,
        passed: testPassed,
        analysis: analysis,
        responseLength: result.response.length
      });

      if (testPassed) {
        passedTests++;
        console.log(`✅ Test PASSED - ${analysis}`);
      } else {
        console.log('❌ Test FAILED - Response doesn\'t handle location appropriately');
      }

    } catch (error) {
      console.log('❌ Test FAILED - Error:', error.message);
      results.push({
        test: testCase.query,
        category: testCase.category,
        passed: false,
        analysis: `Error: ${error.message}`,
        responseLength: 0
      });
    }

    console.log('═'.repeat(80));
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Summary and analysis
  console.log(`\n🎯 COMPREHENSIVE LOCATION TEST SUMMARY:`);
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📊 Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

  // Category breakdown
  const categoryStats = {};
  results.forEach(result => {
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = { passed: 0, total: 0 };
    }
    categoryStats[result.category].total++;
    if (result.passed) categoryStats[result.category].passed++;
  });

  console.log(`\n📊 CATEGORY BREAKDOWN:`);
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const rate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`${category}: ${stats.passed}/${stats.total} (${rate}%)`);
  });

  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (passedTests >= totalTests * 0.8) {
    console.log('✅ Excellent comprehensive location handling!');
    console.log('✅ Good recognition of various location types');
    console.log('✅ Appropriate clarification requests');
  } else if (passedTests >= totalTests * 0.6) {
    console.log('⚠️ Good but needs improvement:');
    console.log('- Better recognition of company/mall names');
    console.log('- More consistent location context usage');
    console.log('- Improved handling of ambiguous locations');
  } else {
    console.log('❌ Needs significant improvement:');
    console.log('- Expand location database');
    console.log('- Improve location detection algorithms');
    console.log('- Better integration with search functionality');
  }

  return results;
}

// Run the comprehensive test
testComprehensiveLocations().catch(console.error);
