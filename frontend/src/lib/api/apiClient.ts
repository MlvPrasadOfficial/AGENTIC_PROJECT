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
import environmentService from '../services/environmentService';

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
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(config.defaultHeaders || {})
      }
    });

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
        config.meta = {
          ...config.meta,
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
        const requestTime = Date.now() - (response.config.meta?.requestStartTime || 0);
        
        // Format successful response
        return {
          data: response.data,
          success: true,
          meta: {
            timestamp: new Date().toISOString(),
            processingTime: requestTime,
            requestId: response.headers['x-request-id'] || '',
          }
        };
      },
      (error: AxiosError) => {
        // Handle errors
        const requestTime = Date.now() - (error.config?.meta?.requestStartTime || 0);
        
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
   * Upload a file with progress tracking
   * 
   * @param url - The URL to upload to
   * @param file - The file to upload
   * @param onProgress - Progress callback
   * @param additionalData - Additional form data
   * @returns Promise resolving to the response data
   */
  async uploadFile<T = any>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add any additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });
    }
    
    return this.client.post<T, ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        }
      }
    });
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
