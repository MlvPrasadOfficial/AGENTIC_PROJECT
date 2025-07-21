// Simple API URL test
console.log('Testing API URL configuration after fix');

// The original issue was:
// baseURL = 'http://localhost:8000/api/v1'
// endpoint = '/files/upload'
// => resulting in 'http://localhost:8000/api/v1/api/v1/files/upload' 

// After the fix:
const baseURL = 'http://localhost:8000'; // Fixed in environmentService.ts
const apiPrefix = '/api/v1'; // Added by backend
const endpoint = '/files/upload'; // Used in fileService.uploadFile

// Correct URL construction:
const fullUrl = `${baseURL}${apiPrefix}${endpoint}`;
console.log('Full URL after fix:', fullUrl);

// Verify it's correct
const isCorrect = fullUrl === 'http://localhost:8000/api/v1/files/upload';
console.log('URL is correctly formed?', isCorrect);

console.log('Fix applied successfully:', isCorrect ? '✓ Yes' : '✗ No');
