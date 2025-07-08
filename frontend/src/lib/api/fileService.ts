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
import environmentService from '../services/environmentService';

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
    
    const { metadata = {}, onProgress } = options || {};
    
    try {
      const response = await apiClient.uploadFile<FileMetadata>(
        '/upload/files/upload',
        file,
        (progress) => {
          onProgress?.({
            progress,
            status: progress < 100 ? 'uploading' : 'processing'
          });
        },
        { metadata }
      );
      
      // File upload successful
      onProgress?.({
        progress: 100,
        status: 'completed'
      });
      
      return response.data;
    } catch (error: any) {
      // File upload failed
      onProgress?.({
        progress: 0,
        status: 'failed',
        error: error.error || 'File upload failed'
      });
      
      throw error;
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
    
    if (tags && tags.length) {
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
    await apiClient.delete(`/upload/files/${fileId}`);
  }
  
  /**
   * Get sample data from a file
   * 
   * @param fileId - The ID of the file
   * @param rows - Number of sample rows (default: 10)
   * @param columns - Specific columns to include
   * @returns Promise resolving to the sample data
   */
  async getSampleData(fileId: string, rows = 10, columns?: string[]): Promise<SampleData> {
    const params = new URLSearchParams();
    params.append('rows', rows.toString());
    
    if (columns && columns.length) {
      params.append('columns', columns.join(','));
    }
    
    const response = await apiClient.get<SampleData>(`/data/preview/${fileId}?${params.toString()}`);
    return response.data;
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
