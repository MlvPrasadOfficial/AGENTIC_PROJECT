/**
 * File: upload-test.js
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Test the upload functionality to verify fix for duplicate API paths issue
 */

import { fileService } from '../lib/api/fileService';
import apiClient from '../lib/api/apiClient';

// Mock dependencies
jest.mock('../lib/api/apiClient', () => ({
  __esModule: true,
  default: {
    uploadFile: jest.fn(),
    baseUrl: 'http://localhost:8000'
  }
}));

describe('File Upload Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call the API with the correct URL path (no duplicate /api/v1 prefix)', async () => {
    // Setup
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const mockResponse = {
      data: {
        file_id: '12345',
        filename: 'test.txt',
        size: 12,
        mime_type: 'text/plain',
        status: 'completed',
        created_at: '2025-07-07T12:00:00Z'
      }
    };
    
    apiClient.uploadFile.mockResolvedValue(mockResponse);
    
    // Execute
    await fileService.uploadFile(mockFile);
    
    // Assert
    expect(apiClient.uploadFile).toHaveBeenCalledTimes(1);
    // The first argument should be the URL path, verify it's exactly '/files/upload'
    // and doesn't contain duplicate '/api/v1' prefixes
    expect(apiClient.uploadFile.mock.calls[0][0]).toBe('/files/upload');
  });

  it('should handle upload progress correctly', async () => {
    // Setup
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const mockResponse = {
      data: {
        file_id: '12345',
        filename: 'test.txt',
        size: 12,
        mime_type: 'text/plain',
        status: 'completed',
        created_at: '2025-07-07T12:00:00Z'
      }
    };
    
    apiClient.uploadFile.mockImplementation((url, file, progressCallback) => {
      // Simulate progress events
      if (progressCallback) {
        progressCallback(25);
        progressCallback(50);
        progressCallback(75);
        progressCallback(100);
      }
      return Promise.resolve(mockResponse);
    });
    
    const progressSpy = jest.fn();
    
    // Execute
    await fileService.uploadFile(mockFile, {
      onProgress: progressSpy
    });
    
    // Assert
    // Should have called the progress callback for each progress update (4 times)
    // plus once at the end to set status to 'completed'
    expect(progressSpy).toHaveBeenCalledTimes(5);
    
    // Check the final call has status 'completed'
    expect(progressSpy.mock.calls[4][0]).toEqual({
      progress: 100,
      status: 'completed'
    });
  });

  it('should return properly transformed file metadata', async () => {
    // Setup
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const mockResponse = {
      data: {
        file_id: '12345',
        filename: 'test.txt',
        size: 12,
        mime_type: 'text/plain',
        status: 'completed',
        created_at: '2025-07-07T12:00:00Z',
        processing_info: {
          rowsProcessed: 100,
          columnsDetected: 5
        }
      }
    };
    
    apiClient.uploadFile.mockResolvedValue(mockResponse);
    
    // Execute
    const result = await fileService.uploadFile(mockFile);
    
    // Assert
    expect(result).toEqual({
      fileId: '12345',
      filename: 'test.txt',
      size: 12,
      mimeType: 'text/plain',
      uploadStatus: 'completed',
      createdAt: '2025-07-07T12:00:00Z',
      processingInfo: {
        rowsProcessed: 100,
        columnsDetected: 5
      }
    });
  });
});
