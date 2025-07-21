/**
 * File: api-url-test.js
 * Purpose: Test the API URL configuration using JavaScript
 */

// Import environment service configuration
const { environmentService } = require('./src/lib/services/environmentService');

// Test function
function testApiUrlConfiguration() {
  // Get the current API URL from environment service
  const apiUrl = environmentService.apiUrl;
  console.log('Current API URL:', apiUrl);
  
  // Test endpoint
  const endpoint = '/files/upload';
  
  // Construct full URL as it would be done in apiClient
  const fullUrl = `${apiUrl}/api/v1${endpoint}`;
  console.log('Full URL would be:', fullUrl);
  
  // Check if there are duplicate '/api/v1' segments
  const hasDuplicateApiV1 = fullUrl.includes('/api/v1/api/v1');
  console.log('Has duplicate /api/v1 paths?', hasDuplicateApiV1);
  
  // Check if the URL is correctly formed now
  const correctUrl = `${apiUrl}/api/v1${endpoint}`;
  const expectedUrl = 'http://localhost:8000/api/v1/files/upload';
  console.log('URL matches expected format?', correctUrl === expectedUrl);
  
  return {
    apiUrl,
    fullUrl,
    hasDuplicateApiV1,
    isCorrectFormat: correctUrl === expectedUrl
  };
}

// Run the test
const result = testApiUrlConfiguration();
console.log('Test result:', result);

module.exports = { testApiUrlConfiguration };
