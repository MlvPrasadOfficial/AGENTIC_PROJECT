// Quick test script to check the Data Profile Agent API response structure
// Run with: node test_api_response.js

const axios = require('axios');

async function testDataProfileAPI() {
  try {
    console.log('🧪 Testing Data Profile Agent API directly...');
    
    const response = await axios.post('http://localhost:8000/api/v1/agents/data_profile/run', {
      query: 'Test analysis',
      file_id: '1753708856_sample_data.csv', // Use the file ID from backend logs
      context_data: {}
    }, {
      timeout: 180000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📦 Response Headers:', response.headers);
    console.log('🔍 Response Data Structure:');
    console.log('- response.data keys:', Object.keys(response.data));
    console.log('- response.data.result keys:', Object.keys(response.data.result || {}));
    console.log('- response.data.result.output keys:', Object.keys(response.data.result?.output || {}));
    
    if (response.data?.result?.output?.real) {
      console.log('✅ Found real output!');
      console.log('📝 Real output preview:', response.data.result.output.real.substring(0, 200) + '...');
    } else {
      console.log('❌ Real output not found in expected location');
      console.log('🔍 Full response data:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error?.response?.data || error?.message || error);
  }
}

testDataProfileAPI();
