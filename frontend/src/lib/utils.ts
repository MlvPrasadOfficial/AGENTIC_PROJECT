/**
 * File: utils.ts
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Utility functions for class name merging, formatting, validation, and common operations
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines and merges Tailwind CSS classes efficiently
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 * 
 * @param inputs - Array of class values (strings, objects, arrays)
 * @returns Merged and deduplicated class string
 * 
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats file size in bytes to human-readable format
 * 
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 * 
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats a relative time string from a date
 * 
 * @param date - Date to format
 * @returns Human-readable relative time string
 * 
 * @example
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 5)) // "5 minutes ago"
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

/**
 * Formats a duration in milliseconds to human-readable format
 * 
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 * 
 * @example
 * formatDuration(65000) // "1m 5s"
 * formatDuration(3661000) // "1h 1m 1s"
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);
  
  return parts.join(' ') || '0s';
}

/**
 * Formats a number with appropriate thousand separators
 * 
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 * 
 * @example
 * formatNumber(1234567.89) // "1,234,567.89"
 */
export function formatNumber(num: number, decimals?: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Formats a percentage with proper formatting
 * 
 * @param value - Decimal value (0.5 = 50%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 * 
 * @example
 * formatPercentage(0.856) // "85.6%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Validates if a file type is allowed
 * 
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Boolean indicating if file is valid
 * 
 * @example
 * isValidFileType(file, ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validates file size against maximum allowed size
 * 
 * @param file - File to validate
 * @param maxSizeInBytes - Maximum allowed size in bytes
 * @returns Boolean indicating if file size is valid
 * 
 * @example
 * isValidFileSize(file, 10 * 1024 * 1024) // 10MB limit
 */
export function isValidFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}

/**
 * Generates a random ID string
 * 
 * @param length - Length of the ID (default: 8)
 * @returns Random ID string
 * 
 * @example
 * generateId() // "a1b2c3d4"
 * generateId(12) // "a1b2c3d4e5f6"
 */
export function generateId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounces a function call
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 * 
 * @example
 * const debouncedSearch = debounce(handleSearch, 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Throttles a function call
 * 
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 * 
 * @example
 * const throttledScroll = throttle(handleScroll, 100);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Safely parses JSON with fallback
 * 
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 * 
 * @example
 * safeJSONParse('{"key": "value"}', {}) // { key: "value" }
 * safeJSONParse('invalid json', {}) // {}
 */
export function safeJSONParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

/**
 * Capitalizes the first letter of a string
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 * 
 * @example
 * capitalize('hello world') // "Hello world"
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncates text to specified length with ellipsis
 * 
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text with ellipsis
 * 
 * @example
 * truncateText('This is a long text', 10) // "This is a..."
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Creates a download link for data
 * 
 * @param data - Data to download (string or Blob)
 * @param filename - Name of the file
 * @param mimeType - MIME type of the file
 * 
 * @example
 * downloadData('Hello, World!', 'greeting.txt', 'text/plain');
 */
export function downloadData(
  data: string | Blob,
  filename: string,
  mimeType: string = 'application/octet-stream'
): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies text to clipboard
 * 
 * @param text - Text to copy
 * @returns Promise that resolves when copy is successful
 * 
 * @example
 * await copyToClipboard('Hello, World!');
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (error) {
      console.warn('Copy to clipboard failed:', error);
      throw new Error('Copy to clipboard failed');
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Sleep utility for async operations
 * 
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after specified time
 * 
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deep clones an object
 * 
 * @param obj - Object to clone
 * @returns Deep cloned object
 * 
 * @example
 * const cloned = deepClone(originalObject);
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}
