/**
 * File: manual-api-url-test.js
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Manually test the API URL configuration
 */

// Import the API client and environment service
import apiClient from './src/lib/api/apiClient';
import { environmentService } from './src/lib/services/environmentService';

// Log the current configuration
console.log('Environment API URL:', environmentService.apiUrl);
console.log('API Client Base URL:', apiClient.baseUrl);

// Test URL construction
const testUrl = '/files/upload';
console.log('Test endpoint:', testUrl);
console.log('Full URL would be:', `${environmentService.apiUrl}/api/v1${testUrl}`);

// Previously, the issue was:
// environmentService.apiUrl = 'http://localhost:8000/api/v1'
// Leading to: 'http://localhost:8000/api/v1/api/v1/files/upload'

// After fix:
// environmentService.apiUrl = 'http://localhost:8000'
// Leading to: 'http://localhost:8000/api/v1/files/upload'
