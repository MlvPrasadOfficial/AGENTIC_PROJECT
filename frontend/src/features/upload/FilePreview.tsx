/**
 * File: frontend/src/features/upload/FilePreview.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: File preview component for uploaded files with data visualization
 * 
 * This component provides file preview functionality with:
 * - Support for multiple file types (CSV, JSON, Excel, etc.)
 * - Data table preview with column analysis
 * - File metadata and statistics display
 * - Glassmorphism styling with consistent design
 * 
 * Features:
 * - Automatic file type detection
 * - Column type inference and data preview
 * - File validation and error handling
 * - Interactive data exploration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  /**
   * File object to preview
   */
  readonly file?: File;
  
  /**
   * File content data (parsed)
   */
  readonly data?: Array<Record<string, unknown>>;
  
  /**
   * File upload status
   */
  readonly status?: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  
  /**
   * Error message if any
   */
  readonly error?: string;
  
  /**
   * Maximum rows to preview
   */
  readonly maxPreviewRows?: number;
  
  /**
   * Enable interactive features
   */
  readonly interactive?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * File remove callback
   */
  readonly onRemove?: () => void;
  
  /**
   * Data validation callback
   */
  readonly onValidate?: (isValid: boolean, errors?: string[]) => void;
}

/**
 * FilePreview Component
 * 
 * Displays uploaded file preview with data table, metadata, and validation
 * features. Provides interactive data exploration and file management
 * capabilities with glassmorphism styling.
 * 
 * @param file - File object to preview
 * @param data - Parsed file data
 * @param status - Upload/processing status
 * @param error - Error message
 * @param maxPreviewRows - Maximum rows to display
 * @param interactive - Enable interactive features
 * @param className - Additional CSS classes
 * @param onRemove - File remove handler
 * @param onValidate - Data validation handler
 * @returns {JSX.Element} The file preview component
 */
export function FilePreview({ 
  file,
  data,
  status = 'idle',
  error,
  maxPreviewRows = 10,
  interactive = true,
  className,
  onRemove,
  onValidate
}: FilePreviewProps) {
  const [previewData, setPreviewData] = useState<Array<Record<string, unknown>>>([]);
  const [columns, setColumns] = useState<Array<{ name: string; type: string; sample: unknown }>>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Process file data when available
  useEffect(() => {
    if (data && data.length > 0) {
      // Limit preview rows
      const limitedData = data.slice(0, maxPreviewRows);
      setPreviewData(limitedData);
      
      // Analyze columns
      const firstRow = data[0];
      if (!firstRow) {
        return;
      }
      const analyzedColumns = Object.keys(firstRow).map(key => {
        const values = data.slice(0, 100).map(row => row[key]).filter(val => val != null);
        const sample = values[0];
        
        // Infer column type
        let type = 'string';
        if (values.every(val => !isNaN(Number(val)))) {
          type = 'number';
        } else if (values.every(val => {
          const date = new Date(String(val));
          return !isNaN(date.getTime());
        })) {
          type = 'date';
        } else if (values.every(val => typeof val === 'boolean')) {
          type = 'boolean';
        }
        
        return { name: key, type, sample };
      });
      
      setColumns(analyzedColumns);
      
      // Validation
      const errors: string[] = [];
      if (data.length === 0) {
        errors.push('File contains no data rows');
      }
      if (analyzedColumns.length === 0) {
        errors.push('No columns detected');
      }
      
      setValidationErrors(errors);
      onValidate?.(errors.length === 0, errors);
    }
  }, [data, maxPreviewRows, onValidate]);

  // File type icon
  const getFileIcon = (fileName?: string) => {
    if (!fileName) return '📄';
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'csv': return '📊';
      case 'xlsx':
      case 'xls': return '📈';
      case 'json': return '📋';
      case 'txt': return '📝';
      default: return '📄';
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Status indicator
  const getStatusIndicator = () => {
    switch (status) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <div className="w-4 h-4 bg-green-500 rounded-full" />;
      case 'error':
        return <div className="w-4 h-4 bg-red-500 rounded-full" />;
      default:
        return <div className="w-4 h-4 bg-gray-500 rounded-full" />;
    }
  };

  if (!file && !data) {
    return null;
  }

  return (
    <div className={cn(
      'glass-card rounded-xl border border-white/10',
      'backdrop-blur-xl bg-black/20 p-4',
      className
    )}>
      {/* File Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getFileIcon(file?.name)}</span>
          <div>
            <h4 className="text-white font-medium">{file?.name ?? 'Data Preview'}</h4>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>{formatFileSize(file?.size)}</span>
              <span>•</span>
              <span>{data?.length ?? 0} rows</span>
              <span>•</span>
              <span>{columns.length} columns</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIndicator()}
          {interactive && onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Remove file"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <span>⚠️</span>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="text-yellow-400 text-sm">
            <div className="font-medium mb-1">Validation Issues:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Column Analysis */}
      {columns.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-400 mb-2">Column Analysis</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {columns.map(column => (
              <div
                key={column.name}
                className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg"
              >
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  column.type === 'number' && 'bg-blue-500',
                  column.type === 'string' && 'bg-green-500',
                  column.type === 'date' && 'bg-purple-500',
                  column.type === 'boolean' && 'bg-yellow-500'
                )} />
                <span className="text-sm text-white font-medium truncate">
                  {column.name}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {column.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Preview Table */}
      {previewData.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-400 mb-2">
            Data Preview ({previewData.length} of {data?.length ?? 0} rows)
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {columns.map(column => (
                    <th
                      key={column.name}
                      className="text-left p-2 text-gray-400 font-medium"
                    >
                      {column.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    {columns.map(column => (
                      <td
                        key={column.name}
                        className="p-2 text-gray-300 max-w-xs truncate"
                      >
                        {String(row[column.name] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {data && data.length > maxPreviewRows && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Showing first {maxPreviewRows} rows of {data.length} total
            </div>
          )}
        </div>
      )}
    </div>
  );
}
