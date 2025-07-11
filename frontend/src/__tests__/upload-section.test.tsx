/**
 * File: upload-section.test.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Comprehensive test suite for UploadSection component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UploadSection } from '@/features/upload/upload-section';

// Mock file for testing
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Mock drag and drop events
const createDragEvent = (type: string, files: File[] = []) => {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      files,
      setData: jest.fn(),
      getData: jest.fn(),
    },
  });
  return event;
};

describe('UploadSection Component', () => {
  beforeEach(() => {
    // Clear any previous state
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders upload section with correct title', () => {
      render(<UploadSection />);
      
      expect(screen.getByText('📤 Upload your Data')).toBeInTheDocument();
    });

    it('displays drag and drop instructions', () => {
      render(<UploadSection />);
      
      expect(screen.getByText('Drag and drop a file here, or click to browse')).toBeInTheDocument();
    });

    it('shows supported file types', () => {
      render(<UploadSection />);
      
      expect(screen.getByText(/CSV and XLSX files are supported/)).toBeInTheDocument();
    });

    it('renders browse button', () => {
      render(<UploadSection />);
      
      expect(screen.getByText('📎 Browse Files')).toBeInTheDocument();
    });
  });

  describe('File Upload Interactions', () => {
    it('handles file selection via input', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      expect(fileInput.files).toHaveLength(1);
      expect(fileInput.files![0]).toBe(testFile);
    });

    it('handles drag and drop file upload', async () => {
      render(<UploadSection />);

      const dropZone = screen.getByText('Drag and drop a file here, or click to browse').closest('div');
      const testFile = createMockFile('test.xlsx', 2048, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const dragEnterEvent = createDragEvent('dragenter', [testFile]);
      const dropEvent = createDragEvent('drop', [testFile]);

      fireEvent(dropZone!, dragEnterEvent);
      fireEvent(dropZone!, dropEvent);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });
    });

    it('prevents default behavior on drag events', () => {
      render(<UploadSection />);

      const dropZone = screen.getByText('Drag and drop a file here, or click to browse').closest('div');
      const dragOverEvent = createDragEvent('dragover');
      const preventDefaultSpy = jest.spyOn(dragOverEvent, 'preventDefault');

      fireEvent(dropZone!, dragOverEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('File Validation', () => {
    it('accepts valid CSV files', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const csvFile = createMockFile('data.csv', 1024, 'text/csv');

      await user.upload(fileInput, csvFile);

      await waitFor(() => {
        expect(screen.getByText('data.csv')).toBeInTheDocument();
      });
    });

    it('accepts valid XLSX files', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const xlsxFile = createMockFile('data.xlsx', 2048, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      await user.upload(fileInput, xlsxFile);

      await waitFor(() => {
        expect(screen.getByText('data.xlsx')).toBeInTheDocument();
      });
    });

    it('rejects unsupported file types', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const txtFile = createMockFile('data.txt', 1024, 'text/plain');

      await user.upload(fileInput, txtFile);

      await waitFor(() => {
        expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
      });
    });

    it('rejects files exceeding size limit', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const largeFile = createMockFile('large.csv', 11 * 1024 * 1024, 'text/csv'); // 11MB

      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(screen.getByText(/File size exceeds 10MB limit/)).toBeInTheDocument();
      });
    });

    it('handles empty files', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const emptyFile = createMockFile('empty.csv', 0, 'text/csv');

      await user.upload(fileInput, emptyFile);

      await waitFor(() => {
        expect(screen.getByText(/File is empty/)).toBeInTheDocument();
      });
    });
  });

  describe('Upload Progress', () => {
    it('shows progress during upload', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    it('displays upload percentage', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText(/\d+%/)).toBeInTheDocument();
      });
    });

    it('shows completion state', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText('✅ Upload Complete')).toBeInTheDocument();
      });
    });
  });

  describe('File Preview', () => {
    it('displays file metadata after upload', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText('test.csv')).toBeInTheDocument();
        expect(screen.getByText('1 KB')).toBeInTheDocument();
        expect(screen.getByText('CSV')).toBeInTheDocument();
      });
    });

    it('shows remove button for uploaded files', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText('❌ Remove')).toBeInTheDocument();
      });
    });

    it('removes file when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText('test.csv')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('❌ Remove');
      await user.click(removeButton);

      expect(screen.queryByText('test.csv')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message for network failures', async () => {
      // Mock fetch to simulate network error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText(/Upload failed: Network error/)).toBeInTheDocument();
      });
    });

    it('shows retry button on upload failure', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Upload failed'));

      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText('🔄 Retry')).toBeInTheDocument();
      });
    });

    it('allows retry after failure', async () => {
      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Upload failed'));
        }
        return Promise.resolve(new Response('OK'));
      });

      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText('🔄 Retry')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('🔄 Retry');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('✅ Upload Complete')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<UploadSection />);

      expect(screen.getByLabelText(/browse files/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /browse files/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const browseButton = screen.getByRole('button', { name: /browse files/i });
      
      await user.tab();
      expect(browseButton).toHaveFocus();

      await user.keyboard('{Enter}');
      // File dialog should open (can't test actual dialog in jsdom)
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      await user.tab();
      expect(screen.getByRole('button', { name: /browse files/i })).toHaveFocus();
    });

    it('provides screen reader announcements', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const testFile = createMockFile('test.csv', 1024, 'text/csv');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Files', () => {
    it('handles multiple file selection', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const file1 = createMockFile('test1.csv', 1024, 'text/csv');
      const file2 = createMockFile('test2.csv', 2048, 'text/csv');

      await user.upload(fileInput, [file1, file2]);

      await waitFor(() => {
        expect(screen.getByText('test1.csv')).toBeInTheDocument();
        expect(screen.getByText('test2.csv')).toBeInTheDocument();
      });
    });

    it('shows total upload progress for multiple files', async () => {
      const user = userEvent.setup();
      render(<UploadSection />);

      const fileInput = screen.getByLabelText(/browse files/i);
      const file1 = createMockFile('test1.csv', 1024, 'text/csv');
      const file2 = createMockFile('test2.csv', 2048, 'text/csv');

      await user.upload(fileInput, [file1, file2]);

      await waitFor(() => {
        expect(screen.getByText('Uploading 2 files...')).toBeInTheDocument();
      });
    });
  });
});

/**
 * Integration tests for UploadSection with other components
 */
describe('UploadSection Integration', () => {
  it('integrates with agent workflow after upload', async () => {
    const user = userEvent.setup();
    render(<UploadSection />);

    const fileInput = screen.getByLabelText(/browse files/i);
    const testFile = createMockFile('test.csv', 1024, 'text/csv');

    await user.upload(fileInput, testFile);

    await waitFor(() => {
      // Should trigger data agent in the pipeline
      expect(screen.getByText('✅ Upload Complete')).toBeInTheDocument();
    });

    // Verify that upload completion triggers next steps
    // This would integrate with the agent workflow component
  });

  it('passes file data to parent components', async () => {
    const onFilesUploaded = jest.fn();
    const user = userEvent.setup();
    
    render(<UploadSection onFilesUploaded={onFilesUploaded} />);

    const fileInput = screen.getByLabelText(/browse files/i);
    const testFile = createMockFile('test.csv', 1024, 'text/csv');

    await user.upload(fileInput, testFile);

    await waitFor(() => {
      expect(onFilesUploaded).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.csv',
          size: 1024,
          type: 'text/csv'
        })
      );
    });
  });
});
