/**
 * File: apiClient.ts
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Centralized API client for Enterprise Insights Copilot
 * 
 * This module provides a centralized API client for all backend communication.
 * It handles authentication, error handling, request formatting, and response parsing.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { environmentService } from '../services/environmentService';

/**
 * Configuration for the API client
 */
export interface ApiClientConfig {
  /** Base URL for the API */
  baseUrl: string;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Default headers to include in all requests */
  defaultHeaders?: Record<string, string>;
}

/**
 * API response with standardized structure
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Error message if request failed */
  error?: string;
  /** Request metadata */
  meta?: {
    /** Request timestamp */
    timestamp: string;
    /** Request processing time in ms */
    processingTime: number;
    /** Request ID for tracking */
    requestId: string;
  };
}

/**
 * Error response from API
 */
export interface ApiError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Detailed error information */
  details?: any;
}

/**
 * API Client for Enterprise Insights Copilot
 * 
 * Provides methods for interacting with the backend API including
 * request formatting, error handling, and response parsing.
 */
class ApiClient {
  private client: AxiosInstance;
  private requestInterceptors: number[] = [];
  private responseInterceptors: number[] = [];

  /**
   * Creates a new API client instance
   * 
   * @param config - Configuration for the API client
   */
  constructor(config: ApiClientConfig) {
    // Debug logging to track initialization
    console.log(`API Client constructor called with config.baseUrl: ${config.baseUrl}`);
    
    // Construct the base URL with API prefix
    // The environmentService.apiUrl provides the base URL without /api/v1
    // We need to add /api/v1 prefix to match the backend FastAPI router configuration
    // Ensure we don't double-add /api/v1 if it's already present
    let baseURL = config.baseUrl;
    if (!baseURL.endsWith('/api/v1')) {
      baseURL = `${baseURL}/api/v1`;
    }
      
    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 60000, // Increased to 60 seconds for Pinecone processing
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(config.defaultHeaders || {})
      }
    });

    console.log(`API Client initialized with baseURL: ${baseURL}`);
    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   * 
   * @private
   */
  private setupInterceptors(): void {
    // Request interceptor for auth headers, logging, etc.
    const requestInterceptor = this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Add request timestamp
        (config as any).meta = {
          ...(config as any).meta,
          requestStartTime: Date.now()
        };
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    this.requestInterceptors.push(requestInterceptor);

    // Response interceptor for error handling, logging, etc.
    const responseInterceptor = this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request time
        const requestTime = Date.now() - ((response.config as any).meta?.requestStartTime || 0);
        
        // Add meta information to response WITHOUT modifying original data structure
        // Store meta separately to avoid interfering with response parsing
        (response as any)._meta = {
          timestamp: new Date().toISOString(),
          processingTime: requestTime,
          requestId: response.headers['x-request-id'] || '',
        };
        
        // Return response without modifying data structure
        return response;
      },
      (error: AxiosError) => {
        // Handle errors
        const requestTime = Date.now() - ((error.config as any)?.meta?.requestStartTime || 0);
        
        // Format error response
        const errorResponse: ApiResponse = {
          data: null,
          success: false,
          error: this.getErrorMessage(error),
          meta: {
            timestamp: new Date().toISOString(),
            processingTime: requestTime,
            requestId: error.response?.headers?.['x-request-id'] || '',
          }
        };
        
        // Handle specific error scenarios
        if (error.response?.status === 401) {
          // Handle unauthorized (e.g., logout user, refresh token)
          console.warn('Unauthorized API request');
          // this.authService.logout();
        }
        
        if (error.response?.status === 429) {
          // Handle rate limiting
          console.warn('API rate limit exceeded');
        }
        
        return Promise.reject(errorResponse);
      }
    );
    
    this.responseInterceptors.push(responseInterceptor);
  }

  /**
   * Get a friendly error message from an error object
   * 
   * @param error - The error object
   * @returns A user-friendly error message
   * @private
   */
  /**
   * Extract meaningful error messages from API error responses
   * 
   * This method intelligently extracts error messages from various API response formats,
   * with special handling for FastAPI validation errors (422 status codes).
   * 
   * @param error - The Axios error object containing response information
   * @returns A user-friendly error message string
   * @private
   */
  private getErrorMessage(error: AxiosError): string {
    // Enhanced error logging for comprehensive debugging of API failures
    console.log('🔍 [ERROR ANALYSIS] Full error object:', error);
    console.log('🔍 [ERROR ANALYSIS] Response status:', error.response?.status);
    console.log('🔍 [ERROR ANALYSIS] Response data:', error.response?.data);
    console.log('🔍 [ERROR ANALYSIS] Response headers:', error.response?.headers);
    
    // Extract error message from structured API response
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      
      // Special handling for FastAPI validation errors (422 Unprocessable Entity)
      if (error.response.status === 422 && data.detail) {
        // FastAPI validation errors contain detailed field-level validation information
        if (Array.isArray(data.detail)) {
          // Convert array of validation errors to readable format
          const validationErrors = data.detail.map((err: any) => 
            `${err.loc?.join('.')} - ${err.msg}`
          ).join(', ');
          console.log('🔍 [422 VALIDATION] Extracted errors:', validationErrors);
          return `Validation error: ${validationErrors}`;
        } else if (typeof data.detail === 'string') {
          // Handle simple string detail messages  
          console.log('🔍 [422 VALIDATION] String detail:', data.detail);
          return `Validation error: ${data.detail}`;
        }
      }
      
      // Standard error message extraction with fallback hierarchy
      // Priority: message > error > detail > errors array > fallback
      const errorMsg = data.message || data.error || data.detail || data.errors?.[0] || 'Unknown error occurred';
      console.log('🔍 [ERROR ANALYSIS] Extracted message:', errorMsg);
      return errorMsg;
    }
    
    // Handle specific network-level errors with user-friendly messages
    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Handle timeout errors with actionable guidance
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    
    // Final fallback for unexpected error types
    console.log('🔍 [ERROR ANALYSIS] Final fallback message:', error.message);
    return error.message || 'Unknown error occurred';
  }

  /**
   * Make a GET request
   * 
   * @param url - The URL to request
   * @param config - Additional request config
   * @returns Promise resolving to the response data
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   * 
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Additional request config
   * @returns Promise resolving to the response data
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   * 
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Additional request config
   * @returns Promise resolving to the response data
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   * 
   * @param url - The URL to request
   * @param config - Additional request config
   * @returns Promise resolving to the response data
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * Upload a file with progress tracking and cancellation support
   * 
   * Handles multipart/form-data file uploads with real-time progress tracking,
   * additional metadata attachment, and upload cancellation capabilities.
   * 
   * Features:
   * - Progress tracking with percentage completion callbacks
   * - AbortSignal support for upload cancellation
   * - Additional form data attachment for metadata
   * - Automatic multipart/form-data content type handling
   * - Standardized ApiResponse wrapper for consistent error handling
   * 
   * @example
   * ```typescript
   * // Basic file upload
   * const response = await apiClient.uploadFile('/files/upload', selectedFile);
   * 
   * // Upload with progress tracking
   * const response = await apiClient.uploadFile(
   *   '/files/upload', 
   *   selectedFile,
   *   (progress) => console.log(`Upload: ${progress}%`)
   * );
   * 
   * // Upload with cancellation support
   * const controller = new AbortController();
   * const response = await apiClient.uploadFile(
   *   '/files/upload', 
   *   selectedFile,
   *   undefined,
   *   undefined,
   *   controller.signal
   * );
   * // Cancel: controller.abort();
   * 
   * // Upload with additional metadata
   * const response = await apiClient.uploadFile(
   *   '/files/upload', 
   *   selectedFile,
   *   (progress) => updateUI(progress),
   *   { category: 'documents', tags: ['important'] }
   * );
   * ```
   * 
   * @param url - The endpoint URL for file upload (relative to baseURL)
   * @param file - The File object to upload (from input or drag-drop)
   * @param onProgress - Optional callback for upload progress (0-100 percentage)
   * @param additionalData - Optional metadata to include in the form submission
   * @param signal - Optional AbortSignal for upload cancellation control
   * @returns Promise resolving to standardized ApiResponse with upload result
   * @throws {ApiError} When upload fails due to network, server, or validation errors
   */
  async uploadFile<T = any>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>,
    signal?: AbortSignal
  ): Promise<ApiResponse<T>> {
    // DETAILED LOGGING: Track API client upload start
    console.log('[API CLIENT] === UPLOAD REQUEST START ===');
    console.log('[API CLIENT] URL:', url);
    console.log('[API CLIENT] Full URL:', `${this.client.defaults.baseURL}${url}`);
    console.log('[API CLIENT] File:', { name: file.name, size: file.size, type: file.type });
    console.log('[API CLIENT] Additional data:', additionalData);
    
    // Create FormData container for multipart upload
    // Required for file uploads with proper MIME boundary handling
    const formData = new FormData();
    
    // Attach the primary file with standard 'file' field name
    // Backend expects this specific field name for file processing
    formData.append('file', file);
    console.log('[API CLIENT] Appended file to FormData');
    
    // Process additional metadata if provided
    // Send metadata as single JSON string field as expected by backend
    if (additionalData && Object.keys(additionalData).length > 0) {
      // Backend expects metadata as single JSON string in 'metadata' field
      const metadataJson = JSON.stringify(additionalData);
      formData.append('metadata', metadataJson);
      console.log('[API CLIENT] Appended metadata to FormData:', metadataJson);
    } else {
      console.log('[API CLIENT] No additional data to append');
    }
    
    // LOG FormData contents
    console.log('[API CLIENT] Final FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`[API CLIENT] ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`[API CLIENT] ${key}: ${value}`);
      }
    }
    
    // Execute the upload request with specialized configuration
    // multipart/form-data content type enables file upload handling
    console.log('[API CLIENT] Starting axios.post request...');
    
    try {
      // Create config without Content-Type to let browser set multipart/form-data boundary
      const config: AxiosRequestConfig = {
        // Enable upload cancellation through AbortController
        // Allows users to cancel long-running uploads
        ...(signal && { signal }),
        
        // Configure real-time progress tracking
        // Calculates percentage completion for UI feedback
        onUploadProgress: (event) => {
          // Ensure both progress callback and total size are available
          // Prevents division by zero and callback errors
          if (onProgress && event.total) {
            // Calculate percentage completion with rounding for clean UI display
            // Math.round ensures integer percentages for consistent progress bars
            const progress = Math.round((event.loaded * 100) / event.total);
            
            // Invoke progress callback with current upload percentage
            // UI can use this for progress bars, status messages, etc.
            onProgress(progress);
          }
        }
      };
      
      // Use a specific axios instance for file uploads without Content-Type header
      const uploadClient = axios.create({
        baseURL: this.client.defaults.baseURL || 'http://localhost:8000/api/v1',
        timeout: 120000, // Increased timeout for complex agent workflows and Pinecone operations
        headers: {
          // Only keep non-Content-Type headers for file uploads
          'Accept': 'application/json',
          'x-client-version': '1.0.0'
        }
      });
      
      const response = await uploadClient.post<ApiResponse<T>>(url, formData, config);
      
      console.log('[API CLIENT] Upload request completed successfully');
      return response.data;
      
    } catch (error) {
      console.error('[API CLIENT] Upload request failed:', error);
      // Re-throw the error to be handled by the calling code
      throw error;
    }
  }

  /**
   * Get the base URL for the API client
   */
  get baseUrl(): string {
    return this.client.defaults.baseURL || '';
  }
}

/**
 * Create API client instance with default configuration
 */
const apiClient = new ApiClient({
  baseUrl: (() => {
    const url = environmentService.apiUrl;
    console.log(`Environment service apiUrl: ${url}`);
    return url;
  })(),
  timeout: 120000, // Increased to 120 seconds for complex agent workflows and Pinecone operations
  defaultHeaders: {
    'X-Client-Version': '1.0.0'
  }
});

export default apiClient;
