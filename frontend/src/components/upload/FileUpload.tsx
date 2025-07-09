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
import { GlassCard } from '@/components/ui/GlassCard';
import { InfoIcon } from '@/components/icons/InfoIcon';
import { PreviewIcon } from '@/components/icons/PreviewIcon';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { UploadFolderIcon } from '@/components/icons/UploadFolderIcon';

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
      // Notify error through callback
      setIsUploading(false);
      onError?.(error instanceof Error ? error : new Error('Upload failed'));
      
      toast({
        type: 'error',
        title: 'Upload Error',
        message: error instanceof Error ? error.message : 'Failed to upload file'
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
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
    multiple: false
  });
  
  return (
    <GlassCard size="md" variant="elevated" blurIntensity="strong" className="glass-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gray-800/30 text-gray-300 text-lg">
          <UploadFolderIcon size={36} className="icon" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Upload your Data</h2>
        </div>
      </div>
      
      {(() => {
        if (!currentFile && !isUploading) {
          return (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
                ${isDragActive ? 'border-gray-400 bg-gray-800/20' : 'border-gray-500/30 hover:border-gray-400/50 bg-gray-800/10'}`}
            >
              <input {...getInputProps()} />
              <div className="text-gray-200 mb-4">Drag and drop a file here, or click to browse</div>
              <div className="glass-button mt-4 px-6 py-3 text-white cursor-pointer">
                📎 Browse Files
              </div>
            </div>
          );
        } else if (isUploading) {
          return (
            <div className="border-2 border-gray-500/30 rounded-xl p-8 bg-gray-900/30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white">Uploading {uploadProgress.toFixed(0)}%</span>
                <button 
                  onClick={handleCancelUpload} 
                  className="text-red-300 hover:text-red-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div className="w-full bg-gray-800/30 rounded-full h-2.5">
                <div 
                  className="bg-gray-400 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          );
        }
        return null;
      })()}
      
      {currentFile && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between bg-gray-800/20 border border-gray-600/20 rounded-lg p-3">
            <span className="text-sm text-gray-200 flex items-center gap-1">
              <PreviewIcon className="icon text-gray-300" /> {currentFile.name}
            </span>
            <button 
              onClick={handleDeleteFile}
              className="text-red-300 hover:text-red-200 transition-colors"
            >
              <CloseIcon className="icon text-red-300" />
            </button>
          </div>
          
          <button 
            onClick={() => {
              onFileUploaded?.(currentFile.id);
            }}
            className="glass-button w-full py-2 mt-4 flex items-center justify-center gap-2"
          >
            <PreviewIcon className="icon text-white" /> View Data Preview
          </button>
        </div>
      )}
      
      <div className="mt-6 space-y-3">
        <p className="text-sm text-gray-400 flex items-center gap-1">
          <InfoIcon className="icon text-gray-400" /> CSV, XLSX, JSON files supported
        </p>
      </div>
    </GlassCard>
  );
};

export default FileUpload;
