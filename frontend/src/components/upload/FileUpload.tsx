/**
 * File: FileUpload.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-09
 * Purpose: File upload component with drag-and-drop and backend integration
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { fileService, FileUploadProgress } from '@/lib/api/fileService';
import { GlassCard } from '@/components/ui/GlassCard';
import { UploadIcon } from '@/components/icons/UploadIcon';
import { InfoIcon } from '@/components/icons/InfoIcon';
import { PreviewIcon } from '@/components/icons/PreviewIcon';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { toast } from '@/components/ui/toast';

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
  const [uploadError, setUploadError] = useState<string | null>(null);
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
      setUploadError(progress.error || 'Upload failed');
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
    setUploadError(null);
    
    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      
      // Upload file
      const response = await fileService.uploadFile(file, {
        onProgress: handleProgress,
        signal: abortControllerRef.current.signal
      });
      
      // Update state with uploaded file info
      setCurrentFile({
        name: file.name,
        id: response.fileId
      });
      
      // Notify parent
      onFileUploaded?.(response.fileId);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
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
    onDrop,
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
    <GlassCard size="md" variant="elevated" blurIntensity="strong" className="glass-card-primary">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300 text-lg">
          <UploadIcon className="icon text-blue-300" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Upload your Data</h2>
          <p className="text-sm text-blue-200/80">Drag and drop files or click to browse</p>
        </div>
      </div>
      
      {!currentFile && !isUploading ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-500/10' : 'border-blue-400/30 hover:border-blue-400/50 bg-blue-500/5'}`}
        >
          <input {...getInputProps()} />
          <div className="text-blue-200 mb-2">Drag and drop a file here,</div>
          <div className="text-blue-200 mb-4">or click to browse</div>
          <button className="glass-button-primary mt-4 px-6 py-3 bg-blue-500/25 border-blue-400/40 hover:bg-blue-500/35">
            📎 Browse Files
          </button>
        </div>
      ) : isUploading ? (
        <div className="border-2 border-blue-400/50 rounded-xl p-8 bg-blue-500/10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white">Uploading {uploadProgress.toFixed(0)}%</span>
            <button 
              onClick={handleCancelUpload} 
              className="text-red-300 hover:text-red-200 transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="w-full bg-blue-900/30 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      ) : null}
      
      {currentFile && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
            <span className="text-sm text-blue-100 flex items-center gap-1">
              <PreviewIcon className="icon text-blue-100" /> {currentFile.name}
            </span>
            <button 
              onClick={handleDeleteFile}
              className="text-red-300 hover:text-red-200 transition-colors"
            >
              <CloseIcon className="icon text-red-300" />
            </button>
          </div>
          
          <button 
            onClick={() => fileService.previewFile(currentFile.id).then(preview => console.log('File preview:', preview))}
            className="glass-button-secondary w-full py-2 mt-4 flex items-center justify-center gap-2"
          >
            <PreviewIcon className="icon text-blue-300" /> View Data Preview
          </button>
        </div>
      )}
      
      <div className="mt-6 space-y-3">
        <p className="text-sm text-blue-200/70 flex items-center gap-1">
          <InfoIcon className="icon text-blue-200" /> CSV, XLSX, JSON files supported
        </p>
      </div>
    </GlassCard>
  );
};

export default FileUpload;
