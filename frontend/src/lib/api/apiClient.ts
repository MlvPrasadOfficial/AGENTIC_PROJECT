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
    // If we're in development mode and no explicit baseUrl is provided, use localhost
    const baseURL = process.env.NODE_ENV === 'development' && !config.baseUrl 
      ? 'http://localhost:8000/api/v1' 
      : config.baseUrl;
      
    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
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
        
        // Add meta information to response
        response.data = {
          ...response.data,
          _meta: {
            timestamp: new Date().toISOString(),
            processingTime: requestTime,
            requestId: response.headers['x-request-id'] || '',
          }
        };
        
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
  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data && typeof error.response.data === 'object') {
      // Try to get error message from response data
      const data = error.response.data as any;
      return data.message || data.error || data.errors?.[0] || 'Unknown error occurred';
    }
    
    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    
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
    return this.client.get<T, ApiResponse<T>>(url, config);
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
    return this.client.post<T, ApiResponse<T>>(url, data, config);
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
    return this.client.put<T, ApiResponse<T>>(url, data, config);
  }

  /**
   * Make a DELETE request
   * 
   * @param url - The URL to request
   * @param config - Additional request config
   * @returns Promise resolving to the response data
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.delete<T, ApiResponse<T>>(url, config);
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
    // Create FormData container for multipart upload
    // Required for file uploads with proper MIME boundary handling
    const formData = new FormData();
    
    // Attach the primary file with standard 'file' field name
    // Backend expects this specific field name for file processing
    formData.append('file', file);
    
    // Process additional metadata if provided
    // Converts objects to JSON strings for backend compatibility
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        // Serialize complex objects to JSON for form data transmission
        // Simple values are automatically stringified by FormData
        formData.append(key, JSON.stringify(value));
      });
    }
    
    // Execute the upload request with specialized configuration
    // multipart/form-data content type enables file upload handling
    return this.client.post<T, ApiResponse<T>>(url, formData, {
      headers: {
        // Let browser set Content-Type with proper boundary for multipart data
        // Manual setting would break boundary generation
        'Content-Type': 'multipart/form-data'
      },
      
      // Enable upload cancellation through AbortController
      // Allows users to cancel long-running uploads
      signal: signal,
      
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
    });
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
  baseUrl: environmentService.apiUrl,
  timeout: 30000,
  defaultHeaders: {
    'X-Client-Version': '1.0.0'
  }
});

export default apiClient;
