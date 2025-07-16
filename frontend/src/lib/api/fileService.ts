/**
 * File: fileService.ts
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: File upload and management service for Enterprise Insights Copilot
 * 
 * This module provides functionality for file upload, validation, processing,
 * and management within the application. It handles the communication with
 * the backend API for all file-related operations.
 */

import apiClient from './apiClient';

/**
 * File metadata returned from the server
 */
export interface FileMetadata {
  /** Unique file ID */
  fileId: string;
  /** Original filename */
  filename: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
  /** Upload status */
  uploadStatus: 'processing' | 'completed' | 'failed';
  /** Creation timestamp */
  createdAt: string;
  /** User-provided metadata */
  metadata?: Record<string, any>;
  /** Processing information */
  processingInfo?: {
    /** Number of rows processed */
    rowsProcessed?: number;
    /** Number of columns detected */
    columnsDetected?: number;
    /** Detected data types */
    dataTypes?: Record<string, string>;
    /** Quality score (0-1) */
    qualityScore?: number;
    /** Processing errors */
    errors?: string[];
  };
}

/**
 * File upload progress information
 */
export interface FileUploadProgress {
  /** Progress percentage (0-100) */
  progress: number;
  /** Upload status */
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  /** Error message if upload failed */
  error?: string;
}

/**
 * File upload options
 */
export interface FileUploadOptions {
  /** User-provided metadata */
  metadata?: Record<string, any>;
  /** Progress callback */
  onProgress?: (progress: FileUploadProgress) => void;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * Sample data with column information
 */
export interface SampleData {
  /** Column information */
  columns: Array<{
    /** Column name */
    name: string;
    /** Column data type */
    type: string;
    /** Number of null values */
    nullCount: number;
    /** Number of unique values */
    uniqueCount?: number;
    /** Minimum value (for numeric columns) */
    min?: number;
    /** Maximum value (for numeric columns) */
    max?: number;
  }>;
  /** Sample rows */
  rows: Array<Record<string, any>>;
}

/**
 * File Service for Enterprise Insights Copilot
 * 
 * Provides methods for file upload, management, and processing.
 */
class FileService {
  /**
   * Upload a file to the server
   * 
   * @param file - The file to upload
   * @param options - Upload options
   * @returns Promise resolving to the uploaded file metadata
   */
  async uploadFile(file: File, options?: FileUploadOptions): Promise<FileMetadata> {
    // Validate file before upload
    this.validateFile(file);
    
    const { metadata = {}, onProgress, signal } = options || {};
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata as JSON string if provided
      if (Object.keys(metadata).length > 0) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      // Use real API endpoint
      const response = await apiClient.uploadFile<any>(
        '/api/v1/files/upload',
        file,
        (progress) => {
          onProgress?.({
            progress,
            status: progress < 100 ? 'uploading' : 'processing'
          });
        },
        signal
      );
      
      // File upload successful
      onProgress?.({
        progress: 100,
        status: 'completed'
      });

      return {
        fileId: response.data.file_id || response.data.fileId,
        filename: response.data.filename || file.name,
        size: response.data.size || file.size,
        mimeType: response.data.mime_type || file.type,
        uploadStatus: response.data.status || 'completed',
        createdAt: response.data.created_at || new Date().toISOString(),
        processingInfo: response.data.processing_info
      };
    } catch (error: any) {
      // Enhanced error handling
      let errorMessage = 'File upload failed';
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        errorMessage = 'Backend server is not available. Please ensure the server is running.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File is too large. Please select a smaller file.';
      } else if (error.response?.status === 415) {
        errorMessage = 'File type not supported. Please select a different file.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // File upload failed
      onProgress?.({
        progress: 0,
        status: 'failed',
        error: errorMessage
      });
      
      // Throw a more descriptive error
      const enhancedError = new Error(errorMessage);
      enhancedError.name = 'FileUploadError';
      throw enhancedError;
    }
  }
  
  /**
   * Get file upload status
   * 
   * @param fileId - The ID of the file
   * @returns Promise resolving to the file status
   */
  async getFileStatus(fileId: string): Promise<FileMetadata> {
    const response = await apiClient.get<FileMetadata>(`/upload/files/status/${fileId}`);
    return response.data;
  }
  
  /**
   * Get a list of uploaded files
   * 
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @param status - Filter by status
   * @param tags - Filter by tags
   * @returns Promise resolving to the list of files
   */
  async getFiles(page = 1, limit = 20, status?: string, tags?: string[]): Promise<{ 
    files: FileMetadata[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    }
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (status) {
      params.append('status', status);
    }
    
    if (tags?.length) {
      params.append('tags', tags.join(','));
    }
    
    const response = await apiClient.get(`/upload/files?${params.toString()}`);
    return response.data;
  }
  
  /**
   * Delete a file
   * 
   * @param fileId - The ID of the file
   * @returns Promise resolving when the file is deleted
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      // Use real API endpoint
      await apiClient.delete(`/files/${fileId}`);
      console.log(`File ${fileId} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting file ${fileId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get sample data from a file
   * 
   * @param fileId - The ID of the file
   * @param rows - Number of sample rows (default: 10)
   * @param columns - Specific columns to include
   * @returns Promise resolving to the sample data
   */
  async getSampleData(_fileId: string, rows = 10, _columns?: string[]): Promise<SampleData> {
    // For demo purposes, return mock data directly since we don't have a backend
    // This simulates the data preview functionality
    
    // Add a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock columns based on uploaded file type
    const mockColumns = [
      { name: 'id', type: 'integer', nullCount: 0, uniqueCount: 100, min: 1, max: 100 },
      { name: 'name', type: 'string', nullCount: 2, uniqueCount: 97 },
      { name: 'email', type: 'string', nullCount: 5, uniqueCount: 95 },
      { name: 'age', type: 'integer', nullCount: 3, uniqueCount: 45, min: 18, max: 65 },
      { name: 'department', type: 'string', nullCount: 0, uniqueCount: 5 }
    ];
    
    // Mock rows with realistic data
    const mockRows = Array.from({ length: Math.min(rows, 10) }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: Math.floor(Math.random() * 47) + 18,
      department: ['Engineering', 'Marketing', 'HR', 'Sales', 'Support'][Math.floor(Math.random() * 5)]
    }));
    
    // Return mock data structure
    return {
      columns: mockColumns,
      rows: mockRows
    };
    
    /*
    // Future implementation for real backend API
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('rows', rows.toString());
      
      if (columns?.length) {
        params.append('columns', columns.join(','));
      }
      
      // Use real API endpoint
      const response = await apiClient.get<SampleData>(`/data/preview/${fileId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch sample data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    */
  }
  
  /**
   * Validate a file before upload
   * 
   * @param file - The file to validate
   * @throws Error if the file is invalid
   * @private
   */
  private validateFile(file: File): void {
    // Check file size (50MB max)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`File size exceeds maximum allowed size (${Math.floor(MAX_SIZE / 1024 / 1024)}MB)`);
    }
    
    // Check file type
    const ALLOWED_TYPES = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
      'text/plain'
    ];
    
    const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.json', '.txt'];
    
    // Check MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      // If MIME type check fails, check file extension
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        throw new Error('Unsupported file type. Please upload CSV, Excel, JSON, or TXT files.');
      }
    }
  }
}

// Create and export the file service instance
const fileService = new FileService();
export default fileService;
