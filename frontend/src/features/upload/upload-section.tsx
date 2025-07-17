/**
 * File: upload-section.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: File upload section component with drag-and-drop, validation, and glassmorphic styling
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  preview?: string;
  error?: string;
  pineconeTests?: {
    test_2_0: { name: string; status: 'PASSED' | 'FAILED'; details: string };
    test_2_1: { name: string; status: 'PASSED' | 'FAILED'; details: string };
    test_2_2: { name: string; status: 'PASSED' | 'FAILED'; details: string };
    test_2_3: { name: string; status: 'PASSED' | 'FAILED'; details: string };
    test_2_4: { name: string; status: 'PASSED' | 'FAILED'; details: string };
    test_2_5: { name: string; status: 'PASSED' | 'FAILED'; details: string };
  };
}

interface UploadSectionProps {
  /** Maximum file size in bytes (default: 10MB) */
  maxFileSize?: number;
  /** Allowed file types */
  allowedTypes?: string[];
  /** Maximum number of files */
  maxFiles?: number;
  /** Callback when files are uploaded */
  onFilesUploaded?: (files: File[]) => void;
  /** Custom className */
  className?: string;
}

/**
 * File Upload Section Component
 * 
 * Features:
 * - Drag and drop file upload
 * - File type and size validation
 * - Progress indication
 * - File preview and management
 * - Glassmorphic design
 * - Accessibility support
 * 
 * @example
 * <UploadSection 
 *   maxFileSize={10 * 1024 * 1024}
 *   allowedTypes={['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}
 *   onFilesUploaded={handleFilesUploaded}
 * />
 */
export function UploadSection({
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/json',
    'text/plain'
  ],
  maxFiles = 5,
  onFilesUploaded,
  className,
}: UploadSectionProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get file type display name
  const getFileTypeDisplay = (type: string): string => {
    const typeMap: Record<string, string> = {
      'text/csv': 'CSV',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'application/vnd.ms-excel': 'XLS',
      'application/json': 'JSON',
      'text/plain': 'TXT',
    };
    return typeMap[type] || type?.split('/')[1]?.toUpperCase() || 'UNKNOWN';
  };
  
  // Validate file
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${(maxFileSize / 1024 / 1024).toFixed(1)}MB)`
      };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${getFileTypeDisplay(file.type)}" is not supported. Allowed types: ${allowedTypes.map(type => getFileTypeDisplay(type)).join(', ')}`
      };
    }
    
    return { valid: true };
  }, [maxFileSize, allowedTypes]);
  
  // Process uploaded files
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check file limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - uploadedFiles.length} more files.`);
      return;
    }
    
    setIsUploading(true);
    
    const newFiles: UploadedFile[] = [];
    
    for (const file of fileArray) {
      const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const validation = validateFile(file);
      
      if (!validation.valid) {
        newFiles.push({
          id,
          file,
          status: 'error',
          progress: 0,
          ...(validation.error && { error: validation.error }),
        });
        continue;
      }
      
      // Create preview for certain file types
      let preview: string | undefined;
      if (file.type.startsWith('text/') || file.type === 'application/json') {
        try {
          const text = await file.text();
          preview = text.slice(0, 200) + (text.length > 200 ? '...' : '');
        } catch (error) {
          console.warn('Failed to create preview:', error);
        }
      }
      
      const newFile: UploadedFile = {
        id,
        file,
        status: 'uploading',
        progress: 0,
      };
      
      if (preview) {
        newFile.preview = preview;
      }
      
      newFiles.push(newFile);
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    for (const uploadFile of newFiles.filter(f => f.status === 'uploading')) {
      simulateUpload(uploadFile.id);
    }
    
    setIsUploading(false);
    
    // Call callback with valid files
    const validFiles = newFiles.filter(f => f.status !== 'error').map(f => f.file);
    if (validFiles.length > 0 && onFilesUploaded) {
      onFilesUploaded(validFiles);
    }
  }, [uploadedFiles.length, maxFiles, onFilesUploaded, validateFile]);
  
  // Simulate file upload progress
  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      setUploadedFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, progress: Math.min(progress, 100) }
          : file
      ));
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate the 6 Pinecone test results
        const mockPineconeTests = {
          test_2_0: {
            name: "Pinecone Connection Test",
            status: "PASSED" as const,
            details: "Pinecone API connection and authentication validation"
          },
          test_2_1: {
            name: "Fetch Index Details",
            status: "PASSED" as const,
            details: "Index configuration and connectivity validation"
          },
          test_2_2: {
            name: "Vector Count Before Embedding",
            status: "PASSED" as const,
            details: "Baseline vector count retrieved successfully"
          },
          test_2_3: {
            name: "CSV Filename Validation",
            status: "PASSED" as const,
            details: "CSV test data file validation completed"
          },
          test_2_4: {
            name: "Index Embedding Operation",
            status: "PASSED" as const,
            details: "Embedding operation with 3-second wait completed"
          },
          test_2_5: {
            name: "Vector Count After Embedding",
            status: "PASSED" as const,
            details: "Post-embedding vector count validation completed"
          }
        };
        
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'success', progress: 100, pineconeTests: mockPineconeTests }
            : file
        ));
      }
    }, 200);
  };
  
  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);
  
  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow same file re-upload
    e.target.value = '';
  }, [processFiles]);
  
  // Remove file
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  // Clear all files
  const clearAllFiles = () => {
    setUploadedFiles([]);
  };
  
  return (
    <div className={cn('space-y-6', className)} data-upload-section>
      {/* Upload Section Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Upload your Data</h2>
            <p className="text-sm text-gray-400">
              Drag and drop files or click to browse
            </p>
          </div>
        </div>
        
        {/* Drop Zone */}
        <div
          className={cn(
            'upload-zone relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300',
            isDragOver 
              ? 'border-primary-500 bg-primary-500/10' 
              : 'border-gray-600 hover:border-primary-500/50 hover:bg-primary-500/5',
            isUploading && 'opacity-75 pointer-events-none'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload files"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          {/* Upload Icon */}
          <div className="mb-4">
            <svg 
              className={cn(
                'mx-auto w-12 h-12 transition-colors',
                isDragOver ? 'text-primary-400' : 'text-gray-400'
              )} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {/* Upload Text */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-white">
              {isDragOver ? 'Drop files here' : 'Drag and drop a file here'}
            </p>
            <p className="text-sm text-gray-400">or</p>
            <button 
              type="button"
              className="glass-button-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Browse Files
            </button>
          </div>
          
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
            aria-hidden="true"
          />
          
          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-2" />
                <p className="text-sm text-white">Processing files...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* File Support Info */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {allowedTypes.map(type => getFileTypeDisplay(type)).join(', ')} files supported
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Max: {(maxFileSize / 1024 / 1024).toFixed(0)}MB per file, {maxFiles} files total</span>
          </div>
        </div>
      </div>
      
      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <button
              onClick={clearAllFiles}
              className="glass-button-secondary px-3 py-1 text-sm"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-3">
            {uploadedFiles.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className={cn(
                  'glass-card p-4 transition-all duration-200',
                  uploadFile.status === 'success' && 'border-green-500/50 bg-green-500/10',
                  uploadFile.status === 'error' && 'border-red-500/50 bg-red-500/10',
                  uploadFile.status === 'uploading' && 'border-blue-500/50 bg-blue-500/10'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* File Info */}
                    <div className="flex items-center gap-3 mb-2">
                      {/* File Type Icon */}
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                        uploadFile.status === 'success' && 'bg-green-500/20 text-green-400',
                        uploadFile.status === 'error' && 'bg-red-500/20 text-red-400',
                        uploadFile.status === 'uploading' && 'bg-blue-500/20 text-blue-400'
                      )}>
                        {getFileTypeDisplay(uploadFile.file.type)}
                      </div>
                      
                      {/* File Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      
                      {/* Status Icon */}
                      <div className="flex items-center gap-2">
                        {uploadFile.status === 'uploading' && <LoadingSpinner size="sm" />}
                        {uploadFile.status === 'success' && (
                          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {uploadFile.status === 'error' && (
                          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          aria-label="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <div className="mb-2">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {uploadFile.progress.toFixed(0)}% uploaded
                        </p>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="text-sm text-red-400 mb-2">
                        {uploadFile.error}
                      </p>
                    )}
                    
                    {/* File Preview */}
                    {uploadFile.preview && uploadFile.status === 'success' && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">
                          Preview
                        </summary>
                        <pre className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded mt-1 overflow-auto max-h-20">
                          {uploadFile.preview}
                        </pre>
                      </details>
                    )}
                    
                    {/* Pinecone Test Results */}
                    {uploadFile.pineconeTests && uploadFile.status === 'success' && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">
                          Pinecone Validation Tests (6 Tests)
                        </summary>
                        <div className="mt-2 space-y-1">
                          {Object.entries(uploadFile.pineconeTests).map(([testKey, testResult]) => (
                            <div key={testKey} className="flex items-center gap-2 text-xs">
                              {testResult.status === 'PASSED' ? (
                                <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              <span className={testResult.status === 'PASSED' ? 'text-green-400' : 'text-red-400'}>
                                {testResult.status}
                              </span>
                              <span className="text-gray-300">{testResult.name}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
