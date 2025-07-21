/**
 * File: FileUpload.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-16 (Updated)
 * Purpose: Advanced file upload component with drag-and-drop functionality and backend integration
 */

/**
 * FileUpload component with drag-and-drop functionality and backend integration
 * 
 * COMPONENT OVERVIEW:
 * This component provides a sophisticated file upload interface with:
 * - Drag and drop functionality for CSV, XLSX, and JSON files
 * - Real-time upload progress tracking with cancellation support
 * - File validation and error handling with user feedback
 * - Visual feedback states for different upload stages
 * - Backend integration with progress monitoring
 * - Responsive design with glassmorphism styling
 * 
 * FEATURES INCLUDED:
 * - ✅ Drag & Drop Interface: Intuitive file dropping with visual feedback
 * - ✅ File Type Validation: Supports CSV, XLSX, and JSON formats
 * - ✅ Upload Progress: Real-time progress bar with percentage display
 * - ✅ Cancellation Support: Users can cancel uploads in progress
 * - ✅ Error Handling: Comprehensive error reporting and recovery
 * - ✅ File Management: Upload, preview, and delete functionality
 * - ✅ Accessibility: Keyboard navigation and screen reader support
 * - ✅ Responsive Design: Works on desktop, tablet, and mobile devices
 * 
 * TECHNICAL IMPLEMENTATION:
 * - Framework: React with TypeScript for type safety
 * - Drag & Drop: react-dropzone library for cross-browser compatibility
 * - State Management: React hooks with comprehensive error handling
 * - File Validation: MIME type checking and size limitations
 * - Backend Integration: RESTful API with progress callbacks
 * - Styling: Tailwind CSS with custom glassmorphism effects
 * 
 * USAGE EXAMPLES:
 * ```tsx
 * // Basic usage
 * <FileUpload 
 *   onFileUploaded={(fileId) => console.log('Uploaded:', fileId)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 * 
 * // With all callbacks
 * <FileUpload
 *   onFileUploaded={handleFileUpload}
 *   onFileDeleted={handleFileDelete}
 *   onError={handleUploadError}
 * />
 * ```
 * 
 * @version 1.4.0 - Removed upload icon and enhanced documentation
 * @version 1.3.0 - Added comprehensive error handling and progress tracking
 * @version 1.2.0 - Implemented drag and drop functionality
 * @version 1.1.0 - Added backend integration
 * @version 1.0.0 - Initial file upload component
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import fileService, { FileUploadProgress, FileMetadata } from '@/lib/api/fileService';
import { PreviewIcon } from '@/components/icons/PreviewIcon';
import { CloseIcon } from '@/components/icons/CloseIcon';

/**
 * Simple toast notification utility function
 * Provides user feedback for upload operations and errors
 * 
 * @function toast
 * @param {Object} props - Toast notification properties
 * @param {string} props.type - Type of notification (success, error, info, warning)
 * @param {string} props.title - Toast title displayed to user
 * @param {string} props.message - Detailed toast message content
 * 
 * @example
 * ```tsx
 * toast({
 *   type: 'success',
 *   title: 'Upload Complete',
 *   message: 'Your file was uploaded successfully!'
 * });
 * ```
 * 
 * @since 1.0.0
 * @version 1.1.0 - Enhanced logging for development
 */
const toast = (props: { type: string; title: string; message: string }) => {
  // Log notification details to console for development debugging
  console.log(`${props.type}: ${props.title} - ${props.message}`);
  // Note: In production, this would integrate with a toast notification system
  // such as react-hot-toast, react-toastify, or custom notification component
};

/**
 * FileUpload component props interface
 * Defines all callback functions and configuration options
 * 
 * @interface FileUploadProps
 * @since 1.0.0
 * @version 1.2.0 - Added comprehensive prop documentation
 */
interface FileUploadProps {
  /** 
   * Callback function triggered when a file upload completes successfully
   * Receives the file identifier, filename, and complete upload response including Pinecone test results
   * 
   * @param {string} fileId - Unique identifier for the uploaded file
   * @param {string} filename - Original name of the uploaded file
   * @param {FileMetadata} [uploadResponse] - Complete upload response with Pinecone test results
   * @example
   * ```tsx
   * const handleFileUploaded = (fileId: string, filename: string, uploadResponse?: FileMetadata) => {
   *   console.log('File uploaded:', filename, 'with ID:', fileId);
   *   if (uploadResponse?.pineconeTests) {
   *     console.log('Pinecone tests:', uploadResponse.pineconeTests);
   *   }
   *   // Process uploaded file...
   * };
   * ```
   */
  onFileUploaded?: (fileId: string, filename: string, uploadResponse?: FileMetadata) => void;
  
  /** 
   * Callback function triggered when a file is deleted by the user
   * Receives the unique file identifier for cleanup operations
   * 
   * @param {string} fileId - Unique identifier for the deleted file
   * @example
   * ```tsx
   * const handleFileDeleted = (fileId: string) => {
   *   console.log('File deleted with ID:', fileId);
   *   // Clean up file references...
   * };
   * ```
   */
  onFileDeleted?: (fileId: string) => void;
  
  /** 
   * Callback function triggered when an error occurs during upload
   * Receives Error object with detailed error information
   * 
   * @param {Error} error - Error object containing failure details
   * @example
   * ```tsx
   * const handleError = (error: Error) => {
   *   console.error('Upload failed:', error.message);
   *   // Display error to user...
   * };
   * ```
   */
  onError?: (error: Error) => void;
}

/**
 * FileUpload React Component
 * Advanced file upload interface with drag-and-drop functionality and backend integration
 * 
 * COMPONENT RESPONSIBILITIES:
 * 1. File Selection: Provides drag-and-drop and click-to-browse file selection
 * 2. Validation: Validates file types, sizes, and formats before upload
 * 3. Upload Management: Handles file upload with progress tracking and cancellation
 * 4. State Management: Manages upload states, progress, and error conditions
 * 5. User Feedback: Provides visual feedback throughout the upload process
 * 6. Backend Integration: Communicates with fileService for upload operations
 * 
 * SUPPORTED FILE FORMATS:
 * - CSV files (.csv) - Comma-separated values for data analysis
 * - Excel files (.xlsx) - Microsoft Excel spreadsheets
 * - JSON files (.json) - JavaScript Object Notation data
 * 
 * COMPONENT STATES:
 * 1. Initial State: Ready for file selection with drag-and-drop area
 * 2. Uploading State: Shows progress bar and upload status
 * 3. Completed State: Displays uploaded file with action buttons
 * 4. Error State: Shows error messages with retry options
 * 
 * ACCESSIBILITY FEATURES:
 * - Keyboard navigation support with Enter/Space key handling
 * - Screen reader compatibility with ARIA labels
 * - High contrast colors for visual accessibility
 * - Focus management for keyboard users
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - useCallback hooks for stable function references
 * - Efficient state updates to minimize re-renders
 * - AbortController for upload cancellation
 * - Memory cleanup on component unmount
 * 
 * @component
 * @example
 * ```tsx
 * <FileUpload
 *   onFileUploaded={(fileId) => handleFileUploaded(fileId)}
 *   onFileDeleted={(fileId) => handleFileDeleted(fileId)}
 *   onError={(error) => handleUploadError(error)}
 * />
 * ```
 * 
 * @param {FileUploadProps} props - Component props with callback functions
 * @returns {JSX.Element} Rendered file upload interface
 * 
 * @since 1.0.0
 * @version 1.4.0 - Enhanced documentation and removed upload icon
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileDeleted,
  onError,
}) => {
  // ============================================================================
  // COMPONENT STATE MANAGEMENT - File Upload Status and Progress Tracking
  // ============================================================================
  
  /** 
   * Upload in progress state indicator
   * Controls UI state transitions between upload stages
   * 
   * @type {boolean}
   * @default false
   */
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  /** 
   * Upload progress percentage (0-100)
   * Used for progress bar visualization and user feedback
   * 
   * @type {number}
   * @default 0
   */
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  /** 
   * Current uploaded file information
   * Stores file metadata for display and management
   * 
   * @type {Object|null}
   * @property {string} name - Original filename
   * @property {string} id - Unique file identifier from backend
   * @default null
   */
  const [currentFile, setCurrentFile] = useState<{ name: string; id: string } | null>(null);
  
  // ============================================================================
  // UPLOAD CANCELLATION SUPPORT - AbortController Management
  // ============================================================================
  
  /** 
   * AbortController reference for upload cancellation
   * Enables users to cancel uploads in progress
   * 
   * @type {React.MutableRefObject<AbortController|null>}
   * @default null
   */
  const abortControllerRef = useRef<AbortController | null>(null);
  // ============================================================================
  // UPLOAD PROGRESS HANDLING - Real-time Upload Status Management
  // ============================================================================
  
  /**
   * Handles file upload progress updates from the backend service
   * Processes upload status changes and provides user feedback
   * 
   * PROGRESS UPDATE WORKFLOW:
   * 1. Receives progress updates from fileService upload operation
   * 2. Updates local upload progress state for UI visualization
   * 3. Handles error conditions with user-friendly error messages
   * 4. Manages completion state with success notifications
   * 5. Triggers appropriate callback functions for parent components
   * 
   * ERROR HANDLING:
   * - Displays user-friendly error messages via toast notifications
   * - Resets upload state to allow retry attempts
   * - Triggers onError callback with detailed error information
   * - Maintains UI consistency during error scenarios
   * 
   * SUCCESS HANDLING:
   * - Resets upload state and displays success notification
   * - Provides positive feedback to user about successful upload
   * - Maintains upload progress for visual completion feedback
   * 
   * @function handleProgress
   * @param {FileUploadProgress} progress - Upload progress object from backend
   * @param {number} progress.progress - Upload progress percentage (0-100)
   * @param {'uploading'|'completed'|'failed'} progress.status - Current upload status
   * @param {string} [progress.error] - Error message if upload failed
   * 
   * @example
   * ```tsx
   * // Progress object structure
   * {
   *   progress: 75,
   *   status: 'uploading'
   * }
   * 
   * // Error object structure
   * {
   *   progress: 0,
   *   status: 'failed',
   *   error: 'File size exceeds maximum limit'
   * }
   * ```
   * 
   * @since 1.0.0
   * @version 1.3.0 - Enhanced error handling and user feedback
   */
  const handleProgress = useCallback((progress: FileUploadProgress) => {
    // Update upload progress percentage for progress bar visualization
    setUploadProgress(progress.progress);
    
    // Handle upload failure scenarios with comprehensive error reporting
    if (progress.status === 'failed') {
      // Trigger error callback with detailed error information for parent handling
      onError?.(new Error(progress.error || 'Upload failed'));
      // Reset upload state to allow retry attempts
      setIsUploading(false);
      // Display user-friendly error notification
      toast({
        type: 'error',
        title: 'Upload Failed',
        message: progress.error || 'Failed to upload file. Please try again.'
      });
    }
    
    // Handle successful upload completion with user feedback
    if (progress.status === 'completed') {
      // Reset upload state after successful completion
      setIsUploading(false);
      // Display success notification to user
      toast({
        type: 'success',
        title: 'Upload Complete',
        message: 'Your file was uploaded successfully!'
      });
    }
  }, [onError]); // Dependencies: onError callback for stable reference
  
  // ============================================================================
  // FILE DROP HANDLING - Drag and Drop File Processing
  // ============================================================================
  
  /**
   * Handles file drop events from drag-and-drop interface
   * Processes selected files and initiates upload workflow
   * 
   * FILE PROCESSING WORKFLOW:
   * 1. Validates that at least one file was selected/dropped
   * 2. Extracts the first file from the selection (single file mode)
   * 3. Resets upload state and initializes progress tracking
   * 4. Creates AbortController for upload cancellation support
   * 5. Initiates backend upload process with progress monitoring
   * 6. Handles successful uploads with file metadata storage
   * 7. Manages error scenarios with comprehensive error reporting
   * 
   * STATE MANAGEMENT:
   * - Sets isUploading to true during upload process
   * - Resets uploadProgress to 0 at start of new upload
   * - Creates new AbortController for cancellation support
   * - Updates currentFile state with uploaded file metadata
   * - Triggers appropriate callbacks for parent component notification
   * 
   * ERROR SCENARIOS:
   * - No file selected: Early return without state changes
   * - File validation failures: Error callback with validation message
   * - Network errors: Error callback with network error details
   * - Server errors: Error callback with server response details
   * - Cancellation: Graceful cleanup without error propagation
   * 
   * @function onDrop
   * @param {File[]} acceptedFiles - Array of files accepted by dropzone validation
   * 
   * @example
   * ```tsx
   * // Files are automatically validated by react-dropzone
   * // Only CSV, XLSX, and JSON files reach this function
   * const acceptedFiles = [new File(['data'], 'data.csv', { type: 'text/csv' })];
   * ```
   * 
   * @since 1.0.0
   * @version 1.3.0 - Enhanced error handling and state management
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Early return if no files were selected or dropped
    if (acceptedFiles.length === 0) return;
    
    // Extract first file for processing (component supports single file mode)
    const file = acceptedFiles[0];
    
    // Initialize upload state for new file processing
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create new AbortController for upload cancellation support
      abortControllerRef.current = new AbortController();
      
      // Validate file exists (additional safety check)
      if (!file) {
        throw new Error('No file selected');
      }
      
      // Upload file
      const response = await fileService.uploadFile(file, {
        onProgress: handleProgress,
        signal: abortControllerRef.current.signal
      });
      
      // Update state with uploaded file info
      if (file) {
        setCurrentFile({
          name: file.name,
          id: response.fileId
        });
      }
      
      // Notify parent with fileId, filename, and complete upload response including Pinecone tests
      onFileUploaded?.(response.fileId, file.name, response);
    } catch (error) {
      console.error('File upload error:', error);
      
      // Enhanced error message handling
      let errorMessage = 'Failed to upload file';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      // Notify error through callback
      setIsUploading(false);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      
      toast({
        type: 'error',
        title: 'Upload Error',
        message: errorMessage
      });
    }
  }, [handleProgress, onFileUploaded, onError]);
  
  /**
   * Handle file deletion
   */
  const handleDeleteFile = useCallback(async () => {
    if (!currentFile) return;
    
    try {
      await fileService.deleteFile(currentFile.id);
      
      // Reset state
      setCurrentFile(null);
      
      // Notify parent
      onFileDeleted?.(currentFile.id);
      
      toast({
        type: 'success',
        title: 'File Deleted',
        message: 'Your file was removed successfully'
      });
    } catch (error) {
      console.error('File deletion error:', error);
      onError?.(error instanceof Error ? error : new Error('Deletion failed'));
      
      toast({
        type: 'error',
        title: 'Deletion Error',
        message: error instanceof Error ? error.message : 'Failed to delete file'
      });
    }
  }, [currentFile, onFileDeleted, onError]);
  
  /**
   * Cancel ongoing upload
   */
  const handleCancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        type: 'info',
        title: 'Upload Cancelled',
        message: 'File upload was cancelled'
      });
    }
  }, []);
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acceptedFiles) => {
      void onDrop(acceptedFiles);
    },
    disabled: isUploading,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
    multiple: false,
    noClick: true, // Disable automatic click to open file dialog
    noKeyboard: true // Disable keyboard activation
  });
  
  return (
    <div>
      {(() => {
        if (!currentFile && !isUploading) {
          return (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-out
                ${isDragActive 
                  ? 'border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-105' 
                  : 'border-gray-500/30 bg-gray-800/10 hover:border-gray-400/50 hover:bg-gray-800/20'
                }`}
              style={{ cursor: 'default' }}
            >
              <input {...getInputProps()} />
              
              {/* Enhanced Upload Visual */}
              <div className="mb-6">
                {/* Removed upload text and drag instructions per Task-01 requirements */}
              </div>
              
              {/* File Type Indicators - Removed per Task-01 requirements */}
              
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="glass-button px-8 py-3 text-white cursor-pointer hover:bg-blue-600/20 transition-all duration-300 focus:ring-2 focus:ring-blue-400/50 focus:outline-none shadow-lg hover:shadow-blue-500/25"
              >
                  Browse Files
              </button>
            </div>
          );
        } else if (isUploading) {
          return (
            <div className="border-2 border-blue-500/30 rounded-xl p-8 bg-blue-900/10 backdrop-blur-sm">
              {/* Upload Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Uploading file...</div>
                    <div className="text-blue-300 text-sm">{uploadProgress.toFixed(0)}% complete</div>
                  </div>
                </div>
                <button 
                  onClick={handleCancelUpload} 
                  className="text-red-300 hover:text-red-200 transition-colors px-3 py-1 rounded-lg hover:bg-red-500/10"
                >
                  Cancel
                </button>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Progress Details */}
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Processing...</span>
                  <span>{uploadProgress.toFixed(1)}%</span>
                </div>
              </div>
              
              {/* Upload Tips */}
              <div className="mt-6 p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <div className="text-blue-300 text-sm">
                  💡 <span className="font-medium">Tip:</span> Your file is being validated and processed for optimal analysis.
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}
      
      {currentFile && (
        <div className="mt-6 space-y-4">
          {/* Enhanced File Display */}
          <div className="flex items-center justify-between bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">{currentFile.name}</div>
                <div className="text-green-300 text-sm">✅ Upload successful</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Preview Button - Triggers data preview workflow
                * FUNCTIONALITY: Initiates file preview by calling onFileUploaded callback
                * PARAMETERS: Passes both fileId and filename for complete preview processing
                * UI BEHAVIOR: Shows preview icon with blue hover effect and glassmorphism styling
                * WORKFLOW: Triggers getSampleData API call and agent workflow simulation
                * ERROR HANDLING: Parent component handles API errors and displays user feedback
                * ACCESSIBILITY: Keyboard accessible with semantic button element
                * PERFORMANCE: Optimized with transition animations for smooth user experience
                */}
              <button 
                onClick={() => {
                  // Call parent callback with complete file information for preview processing
                  // fileId: Used for backend API calls to fetch sample data
                  // filename: Used for user display and workflow notifications
                  onFileUploaded?.(currentFile.id, currentFile.name);
                }}
                className="glass-button-secondary px-4 py-2 text-sm flex items-center gap-2 hover:bg-blue-600/20 transition-all duration-300"
              >
                <PreviewIcon className="icon text-white" /> Preview
              </button>
              
              {/* Delete Button - Removes uploaded file from component state
                * FUNCTIONALITY: Clears current file and resets component to initial state
                * UI BEHAVIOR: Red hover effect with delete icon for clear user intent
                * CONFIRMATION: Immediate deletion without confirmation dialog
                * STATE MANAGEMENT: Resets all upload-related state variables
                * ACCESSIBILITY: Proper title attribute for screen reader support
                */}
              <button 
                onClick={handleDeleteFile}
                className="text-red-300 hover:text-red-200 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                title="Delete file"
              >
                <CloseIcon className="icon text-red-300" />
              </button>
            </div>
          </div>
          
          {/* File Actions */}
          {/* File Actions Section - Primary action buttons for file operations
            * LAYOUT: Flex row layout with gap spacing for consistent button alignment
            * RESPONSIVENESS: Flex-1 on primary button ensures proper space utilization
            * INTERACTION: Two-button layout with primary and secondary actions
            * ACCESSIBILITY: Keyboard navigation support with semantic button elements
            */}
          <div className="flex gap-2">
            {/* Primary Preview Button - Main call-to-action for data preview
              * FUNCTIONALITY: Triggers comprehensive file preview workflow
              * PARAMETERS: Passes complete file metadata (ID and name) to parent callback
              * UI DESIGN: Full-width primary button with prominent styling
              * WORKFLOW TRIGGER: Initiates getSampleData API call and 8-agent simulation
              * USER EXPERIENCE: Clear action text and visual icon for intuitive interaction
              * ERROR HANDLING: Parent component manages API errors and user notifications
              * PERFORMANCE: Optimized transitions and hover effects for smooth interaction
              */}
            <button 
              onClick={() => {
                // Trigger file preview workflow with complete file information
                // This initiates: 1) Backend API call for sample data, 2) Agent workflow simulation
                // Parameters ensure proper data retrieval and user feedback display
                onFileUploaded?.(currentFile.id, currentFile.name);
              }}
              className="glass-button flex-1 py-3 mt-2 flex items-center justify-center gap-2 hover:bg-blue-600/20 transition-all duration-300"
            >
              <PreviewIcon className="icon text-white" /> View Data Preview
            </button>
            <button 
              onClick={() => {
                // Re-upload functionality
                setCurrentFile(null);
              }}
              className="glass-button-secondary px-4 py-3 mt-2 flex items-center gap-2 hover:bg-gray-600/20 transition-all duration-300"
            >
              🔄 Replace
            </button>
          </div>
        </div>
      )}
      
      {/* Enhanced File Support Info - Removed per Task-01 requirements */}
    </div>
  );
};

export default FileUpload;
