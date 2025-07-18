/**
 * File: test-upload-functionality.js
 * Author: GitHub Copilot  
 * Date: 2025-07-18
 * Purpose: Node.js script to test upload functionality using real files
 * 
 * This script:
 * 1. Tests backend connectivity
 * 2. Tests file upload with real test files
 * 3. Validates error handling
 * 4. Reports comprehensive results
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

/**
 * Upload Functionality Test Runner
 * Tests real file upload scenarios
 */
class UploadTestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:8000'; // Backend server URL
    this.results = [];
  }

  /**
   * Run all upload tests
   */
  async runTests() {
    console.log('🧪 Starting Upload Functionality Tests');
    console.log('=====================================');
    
    await this.testBackendHealth();
    await this.testSmallFileUpload();
    await this.testLargeFileUpload();
    await this.testInvalidFileType();
    
    this.printResults();
  }

  /**
   * Test 1: Backend Health Check
   */
  async testBackendHealth() {
    const startTime = Date.now();
    
    try {
      console.log('📡 Testing backend connectivity...');
      
      const response = await fetch(`${this.baseUrl}/health`);
      const executionTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        this.results.push({
          test: 'Backend Health Check',
          status: 'PASSED',
          details: `Backend accessible - Status: ${data.status}`,
          time: executionTime
        });
        console.log('✅ Backend health check PASSED');
      } else {
        this.results.push({
          test: 'Backend Health Check',
          status: 'FAILED',
          details: `Backend returned status ${response.status}`,
          time: executionTime
        });
        console.log('❌ Backend health check FAILED');
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.results.push({
        test: 'Backend Health Check',
        status: 'FAILED',
        details: `Cannot connect to backend: ${error.message}`,
        time: executionTime
      });
      console.log('❌ Backend health check FAILED:', error.message);
    }
  }

  /**
   * Test 2: Small File Upload
   */
  async testSmallFileUpload() {
    const startTime = Date.now();
    
    try {
      console.log('📤 Testing small file upload...');
      
      // Check if test file exists
      const testFilePath = path.join(__dirname, '../../test_upload.csv');
      
      if (!fs.existsSync(testFilePath)) {
        const executionTime = Date.now() - startTime;
        this.results.push({
          test: 'Small File Upload',
          status: 'SKIPPED',
          details: 'Test file not found: test_upload.csv',
          time: executionTime
        });
        console.log('⏭️ Small file upload test SKIPPED - File not found');
        return;
      }

      // Create form data
      const form = new FormData();
      form.append('file', fs.createReadStream(testFilePath));
      form.append('metadata', JSON.stringify({ testType: 'small_file_test' }));

      const response = await fetch(`${this.baseUrl}/api/v1/files/upload`, {
        method: 'POST',
        body: form
      });

      const executionTime = Date.now() - startTime;

      if (response.ok) {
        const result = await response.json();
        this.results.push({
          test: 'Small File Upload',
          status: 'PASSED',
          details: `File uploaded successfully - ID: ${result.file_id || result.fileId}`,
          time: executionTime
        });
        console.log('✅ Small file upload test PASSED');
      } else {
        const error = await response.text();
        this.results.push({
          test: 'Small File Upload',
          status: 'FAILED',
          details: `Upload failed with status ${response.status}: ${error}`,
          time: executionTime
        });
        console.log('❌ Small file upload test FAILED');
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.results.push({
        test: 'Small File Upload',
        status: 'FAILED',
        details: `Upload error: ${error.message}`,
        time: executionTime
      });
      console.log('❌ Small file upload test FAILED:', error.message);
    }
  }

  /**
   * Test 3: Large File Upload
   */
  async testLargeFileUpload() {
    const startTime = Date.now();
    
    try {
      console.log('📦 Testing large file upload...');
      
      // Check if large test file exists
      const testFilePath = path.join(__dirname, '../../test_large.csv');
      
      if (!fs.existsSync(testFilePath)) {
        const executionTime = Date.now() - startTime;
        this.results.push({
          test: 'Large File Upload',
          status: 'SKIPPED',
          details: 'Test file not found: test_large.csv',
          time: executionTime
        });
        console.log('⏭️ Large file upload test SKIPPED - File not found');
        return;
      }

      // Create form data
      const form = new FormData();
      form.append('file', fs.createReadStream(testFilePath));
      form.append('metadata', JSON.stringify({ testType: 'large_file_test' }));

      const response = await fetch(`${this.baseUrl}/api/v1/files/upload`, {
        method: 'POST',
        body: form
      });

      const executionTime = Date.now() - startTime;

      if (response.ok) {
        const result = await response.json();
        const fileStats = fs.statSync(testFilePath);
        this.results.push({
          test: 'Large File Upload',
          status: 'PASSED',
          details: `Large file (${fileStats.size} bytes) uploaded successfully - ID: ${result.file_id || result.fileId}`,
          time: executionTime
        });
        console.log('✅ Large file upload test PASSED');
      } else {
        const error = await response.text();
        this.results.push({
          test: 'Large File Upload',
          status: 'FAILED',
          details: `Upload failed with status ${response.status}: ${error}`,
          time: executionTime
        });
        console.log('❌ Large file upload test FAILED');
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.results.push({
        test: 'Large File Upload',
        status: 'FAILED',
        details: `Upload error: ${error.message}`,
        time: executionTime
      });
      console.log('❌ Large file upload test FAILED:', error.message);
    }
  }

  /**
   * Test 4: Invalid File Type
   */
  async testInvalidFileType() {
    const startTime = Date.now();
    
    try {
      console.log('🚫 Testing invalid file type rejection...');
      
      // Create temporary invalid file
      const invalidContent = 'This is a text file that should be rejected';
      const tempFilePath = path.join(__dirname, 'temp_invalid.txt');
      
      fs.writeFileSync(tempFilePath, invalidContent);

      // Create form data
      const form = new FormData();
      form.append('file', fs.createReadStream(tempFilePath));
      form.append('metadata', JSON.stringify({ testType: 'invalid_file_test' }));

      const response = await fetch(`${this.baseUrl}/api/v1/files/upload`, {
        method: 'POST',
        body: form
      });

      const executionTime = Date.now() - startTime;

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      if (response.ok) {
        this.results.push({
          test: 'Invalid File Type Rejection',
          status: 'FAILED',
          details: 'Invalid file type was accepted when it should have been rejected',
          time: executionTime
        });
        console.log('❌ Invalid file type test FAILED - File was accepted');
      } else {
        this.results.push({
          test: 'Invalid File Type Rejection',
          status: 'PASSED',
          details: `Invalid file type correctly rejected with status ${response.status}`,
          time: executionTime
        });
        console.log('✅ Invalid file type test PASSED - File correctly rejected');
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.results.push({
        test: 'Invalid File Type Rejection',
        status: 'FAILED',
        details: `Test error: ${error.message}`,
        time: executionTime
      });
      console.log('❌ Invalid file type test FAILED:', error.message);
    }
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('\n📊 Upload Functionality Test Results');
    console.log('====================================');
    
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const skipped = this.results.filter(r => r.status === 'SKIPPED').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`📈 Total: ${this.results.length}`);
    
    console.log('\nDetailed Results:');
    this.results.forEach((result, index) => {
      let icon = '⏭️';
      if (result.status === 'PASSED') icon = '✅';
      if (result.status === 'FAILED') icon = '❌';
      
      console.log(`${index + 1}. ${icon} ${result.test} (${result.time}ms)`);
      console.log(`   ${result.details}`);
      console.log('');
    });

    // Return summary for further processing
    return {
      total: this.results.length,
      passed,
      failed,
      skipped,
      details: this.results
    };
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const testRunner = new UploadTestRunner();
  testRunner.runTests()
    .then(() => {
      console.log('🎯 Upload functionality testing completed!');
    })
    .catch(error => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = UploadTestRunner;
