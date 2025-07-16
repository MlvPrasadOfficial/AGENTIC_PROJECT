/**
 * File: FileUpload.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: File upload component with drag-and-drop and backend integration
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import fileService, { FileUploadProgress } from '@/lib/api/fileService';
import { InfoIcon } from '@/components/icons/InfoIcon';
import { PreviewIcon } from '@/components/icons/PreviewIcon';
import { CloseIcon } from '@/components/icons/CloseIcon';

// Simple toast notification function
const toast = (props: { type: string; title: string; message: string }) => {
  console.log(`${props.type}: ${props.title} - ${props.message}`);
  // In a real app, this would show UI notifications
};

/**
 * FileUpload props
 */
interface FileUploadProps {
  /** Callback when a file is successfully uploaded */
  onFileUploaded?: (fileId: string) => void;
  /** Callback when a file is deleted */
  onFileDeleted?: (fileId: string) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * FileUpload component with drag-and-drop functionality and backend integration
 * Handles file uploads, validation, and preview functionality
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileDeleted,
  onError,
}) => {
  // State management
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFile, setCurrentFile] = useState<{ name: string; id: string } | null>(null);
  
  // Track upload controller for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  
  /**
   * Handle file upload progress updates
   * @param progress - Upload progress information
   */
  const handleProgress = useCallback((progress: FileUploadProgress) => {
    setUploadProgress(progress.progress);
    
    if (progress.status === 'failed') {
      onError?.(new Error(progress.error || 'Upload failed'));
      setIsUploading(false);
      toast({
        type: 'error',
        title: 'Upload Failed',
        message: progress.error || 'Failed to upload file. Please try again.'
      });
    }
    
    if (progress.status === 'completed') {
      setIsUploading(false);
      toast({
        type: 'success',
        title: 'Upload Complete',
        message: 'Your file was uploaded successfully!'
      });
    }
  }, []);
  
  /**
   * Handle file drop or selection
   * @param acceptedFiles - Files accepted by dropzone
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Reset state
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      
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
      
      // Notify parent
      onFileUploaded?.(response.fileId);
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
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 
                  ${isDragActive 
                    ? 'bg-blue-500/20 text-blue-400 scale-110' 
                    : 'bg-gray-700/30 text-gray-400'
                  }`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <div className={`text-lg font-medium mb-2 transition-colors duration-300 
                  ${isDragActive ? 'text-blue-300' : 'text-gray-200'}`}>
                  {isDragActive ? 'Drop your file here' : 'Upload your data file'}
                </div>
                
                <div className="text-sm text-gray-400 mb-4">
                  Drag and drop a file here, or click to browse
                </div>
              </div>
              
              {/* File Type Indicators */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                  <span className="text-green-400 text-xs">📊</span>
                  <span className="text-green-300 text-xs font-medium">CSV</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <span className="text-blue-400 text-xs">📈</span>
                  <span className="text-blue-300 text-xs font-medium">XLSX</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
                  <span className="text-purple-400 text-xs">🔗</span>
                  <span className="text-purple-300 text-xs font-medium">JSON</span>
                </div>
              </div>
              
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
              <button 
                onClick={() => {
                  onFileUploaded?.(currentFile.id);
                }}
                className="glass-button-secondary px-4 py-2 text-sm flex items-center gap-2 hover:bg-blue-600/20 transition-all duration-300"
              >
                <PreviewIcon className="icon text-white" /> Preview
              </button>
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
          <div className="flex gap-2">
            <button 
              onClick={() => {
                onFileUploaded?.(currentFile.id);
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
      
      {/* Enhanced File Support Info */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg border border-gray-600/10">
          <div className="flex items-center gap-2">
            <InfoIcon className="icon text-gray-400" />
            <span className="text-sm text-gray-300">Supported formats:</span>
          </div>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-300 rounded">CSV</span>
            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-300 rounded">XLSX</span>
            <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-300 rounded">JSON</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 px-3">
          💡 <span className="font-medium">Pro tip:</span> Upload your data to start the AI analysis workflow
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
