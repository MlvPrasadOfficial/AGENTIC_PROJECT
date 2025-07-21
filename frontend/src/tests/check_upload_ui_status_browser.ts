/**
 * File: check_upload_ui_status_browser.ts
 * Author: GitHub Copilot
 * Date: 2025-07-19
 * Purpose: Browser-compatible test script for upload UI functionality
 */

import fileService from '../lib/api/fileService';
import { environmentService } from '../lib/services/environmentService';

/**
 * Upload UI Status Test - Browser Version
 * 
 * This function creates an in-memory CSV file and attempts to upload it to the backend,
 * reporting detailed status and results. It's designed to be executed in a browser environment.
 */
export async function checkUploadUIStatusBrowser() {
  console.log('========== UPLOAD UI STATUS TEST (BROWSER) ==========');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`API URL: ${environmentService.apiUrl}`);
  
  const startTime = Date.now();
  const logElement = document.getElementById('test-log');
  const statusElement = document.getElementById('test-status');
  
  const log = (message: string) => {
    console.log(message);
    if (logElement) {
      logElement.innerHTML += `${message}<br>`;
      logElement.scrollTop = logElement.scrollHeight;
    }
  };
  
  const setStatus = (status: string, isError = false) => {
    if (statusElement) {
      statusElement.textContent = status;
      statusElement.className = isError ? 'error' : 'success';
    }
  };
  
  try {
    log('Creating test CSV file...');
    
    // Create in-memory CSV file
    const csvContent = 'id,name,category,price\n1,Widget A,Electronics,29.99\n2,Widget B,Electronics,39.99';
    const testFile = new File([csvContent], 'test_file.csv', { type: 'text/csv' });
    
    log(`Created test file: ${testFile.name}, size: ${testFile.size} bytes`);
    setStatus('File created, attempting upload...');
    
    // Log upload attempt
    log('Attempting to upload file to backend...');
    
    // Track progress
    const onProgress = (progress: any) => {
      log(`Upload progress: ${progress.progress}%, Status: ${progress.status}`);
      setStatus(`Uploading: ${progress.progress}%`);
    };
    
    // Send file to backend via fileService
    const response = await fileService.uploadFile(testFile, { 
      onProgress,
      metadata: { 
        testSource: 'check_upload_ui_status_browser',
        timestamp: new Date().toISOString()
      } 
    });
    
    // Log successful response
    log('Upload successful!');
    log('Response data: ' + JSON.stringify(response, null, 2));
    
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    log(`Test completed in ${timeTaken}ms`);
    setStatus(`Success! Completed in ${timeTaken}ms`, false);
    
    return {
      status: 'SUCCESS',
      message: `File upload succeeded. File ID: ${response.fileId}`,
      responseData: response,
      timeTaken,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    // Detailed error logging
    log('Upload test failed with error:');
    console.error(error);
    
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    // Log error details
    if (error instanceof Error) {
      log(`Error name: ${error.name}`);
      log(`Error message: ${error.message}`);
      log(`Error stack: ${error.stack}`);
    } else {
      log(`Error: ${String(error)}`);
    }
    
    log(`Test failed in ${timeTaken}ms`);
    setStatus(`Failed! ${error instanceof Error ? error.message : String(error)}`, true);
    
    return {
      status: 'FAILURE',
      message: 'File upload failed',
      error: error instanceof Error ? error : String(error),
      timeTaken,
      timestamp: new Date().toISOString()
    };
  }
}
