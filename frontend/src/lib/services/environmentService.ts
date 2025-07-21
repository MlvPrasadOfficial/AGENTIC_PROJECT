/**
 * File: environmentService.ts
 * Author: GitHub Copilot
 * Date: 2025-07-08
 * Purpose: Environment configuration service for the frontend
 */

/**
 * Environment configuration service
 * Provides access to environment variables with type safety and default values
 */
export const environmentService = {
  /**
   * API base URL
   * Note: This should not include the /api/v1 path suffix as it's added by the backend
   * Fixed to avoid duplicate /api/v1/api/v1 paths in requests
   */
  get apiUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  },

  /**
   * WebSocket URL for real-time updates
   */
  get wsUrl(): string {
    return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
  },

  /**
   * Feature flags
   */
  features: {
    /**
     * Enable file upload feature
     */
    get enableFileUpload(): boolean {
      return process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD !== 'false';
    },
    
    /**
     * Enable data preview feature
     */
    get enableDataPreview(): boolean {
      return process.env.NEXT_PUBLIC_ENABLE_DATA_PREVIEW !== 'false';
    },
    
    /**
     * Enable AI agents feature
     */
    get enableAiAgents(): boolean {
      return process.env.NEXT_PUBLIC_ENABLE_AI_AGENTS !== 'false';
    },
    
    /**
     * Enable RAG feature
     */
    get enableRag(): boolean {
      return process.env.NEXT_PUBLIC_ENABLE_RAG !== 'false';
    },
    
    /**
     * Enable analytics feature
     */
    get enableAnalytics(): boolean {
      return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false';
    },
  },

  /**
   * UI configuration
   */
  ui: {
    /**
     * Maximum file size in bytes
     */
    get maxFileSize(): number {
      return parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '100000000', 10);
    },
    
    /**
     * Allowed file extensions
     */
    get allowedExtensions(): string[] {
      return (process.env.NEXT_PUBLIC_ALLOWED_EXTENSIONS || 'csv,xlsx,json')
        .split(',')
        .map(ext => ext.trim());
    },
  },

  /**
   * Is development environment
   */
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  },

  /**
   * Is production environment
   */
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
  
  /**
   * Layout configuration
   */
  layout: {
    /**
     * Enable responsive layout
     */
    get enableResponsiveLayout(): boolean {
      return process.env.NEXT_PUBLIC_ENABLE_RESPONSIVE_LAYOUT !== 'false';
    },
    
    /**
     * Force two-column layout regardless of screen size
     */
    get forceTwoColumn(): boolean {
      return process.env.NEXT_PUBLIC_FORCE_TWO_COLUMN === 'true';
    },
  },
};

export default environmentService;
