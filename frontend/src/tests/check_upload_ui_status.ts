/**
 * File: check_upload_ui_status.ts
 * Author: GitHub Copilot
 * Date: 2025-07-19
 * Purpose: Test script to verify the upload UI functionality by sending a dummy CSV file
 *          and monitoring the response and status
 */

import fileService from '../lib/api/fileService';
import { environmentService } from '../lib/services/environmentService';
import fs from 'fs';
import path from 'path';

/**
 * Test result interface to capture comprehensive test results
 */
interface TestResult {
  status: 'SUCCESS' | 'FAILURE';
  message: string;
  responseData?: any;
  error?: Error | string;
  timeTaken: number;
  timestamp: string;
}

/**
 * Upload UI Status Test
 * 
 * This function tests the upload functionality by sending a test CSV file
 * to the backend and monitoring the response.
 */
async function checkUploadUIStatus(): Promise<TestResult> {
  console.log('========== UPLOAD UI STATUS TEST ==========');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`API URL: ${environmentService.apiUrl}`);
  
  const startTime = Date.now();
  
  try {
    // Check if we're in a Node.js environment
    if (typeof window === 'undefined') {
      // Create a test file using Node.js fs
      const csvContent = 'id,name,category,price\n1,Widget A,Electronics,29.99\n2,Widget B,Electronics,39.99';
      const tempFilePath = path.join(__dirname, 'temp_test.csv');
      fs.writeFileSync(tempFilePath, csvContent);
      
      // Convert to File object compatible with fileService
      const buffer = fs.readFileSync(tempFilePath);
      const testFile = new File([buffer], 'test_file.csv', { type: 'text/csv' });
      
      console.log(`Created test CSV file: ${testFile.name}, size: ${testFile.size} bytes`);
      
      // Log upload attempt
      console.log('Attempting to upload file to backend...');
      
      // Mock progress callback for detailed logging
      const onProgress = (progress: any) => {
        console.log(`Upload progress: ${progress.progress}%, Status: ${progress.status}`);
      };
      
      // Send file to backend via fileService
      const response = await fileService.uploadFile(testFile, { 
        onProgress,
        metadata: { 
          testSource: 'check_upload_ui_status',
          timestamp: new Date().toISOString()
        } 
      });
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      
      // Log successful response
      console.log('Upload successful!');
      console.log('Response data:', JSON.stringify(response, null, 2));
      
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      
      console.log(`Test completed in ${timeTaken}ms`);
      
      return {
        status: 'SUCCESS',
        message: `File upload succeeded. File ID: ${response.fileId}`,
        responseData: response,
        timeTaken,
        timestamp: new Date().toISOString()
      };
    } else {
      // Browser environment
      console.log('Running in browser environment - creating in-memory test file');
      
      // Create in-memory CSV file
      const csvContent = 'id,name,category,price\n1,Widget A,Electronics,29.99\n2,Widget B,Electronics,39.99';
      const testFile = new File([csvContent], 'test_file.csv', { type: 'text/csv' });
      
      console.log(`Created test CSV file: ${testFile.name}, size: ${testFile.size} bytes`);
      
      // Log upload attempt
      console.log('Attempting to upload file to backend...');
      
      // Mock progress callback for detailed logging
      const onProgress = (progress: any) => {
        console.log(`Upload progress: ${progress.progress}%, Status: ${progress.status}`);
      };
      
      // Send file to backend via fileService
      const response = await fileService.uploadFile(testFile, { 
        onProgress,
        metadata: { 
          testSource: 'check_upload_ui_status',
          timestamp: new Date().toISOString()
        } 
      });
      
      // Log successful response
      console.log('Upload successful!');
      console.log('Response data:', JSON.stringify(response, null, 2));
      
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      
      console.log(`Test completed in ${timeTaken}ms`);
      
      return {
        status: 'SUCCESS',
        message: `File upload succeeded. File ID: ${response.fileId}`,
        responseData: response,
        timeTaken,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    // Detailed error logging
    console.error('Upload test failed with error:');
    console.error(error);
    
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    // Log error details
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    console.log(`Test failed in ${timeTaken}ms`);
    
    return {
      status: 'FAILURE',
      message: 'File upload failed',
      error: error instanceof Error ? error : String(error),
      timeTaken,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run the test if executed directly
 */
if (typeof require !== 'undefined' && require.main === module) {
  checkUploadUIStatus()
    .then(result => {
      console.log('\n========== TEST RESULT ==========');
      console.log(`Status: ${result.status}`);
      console.log(`Message: ${result.message}`);
      console.log(`Time taken: ${result.timeTaken}ms`);
      
      if (result.status === 'FAILURE') {
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch(err => {
      console.error('Error running test:', err);
      process.exit(1);
    });
}

export { checkUploadUIStatus };
