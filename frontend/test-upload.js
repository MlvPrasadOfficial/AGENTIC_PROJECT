/**
 * Quick test script to verify file upload functionality
 * Run this in the browser console to test upload
 */

async function testFileUpload() {
  console.log('🧪 Testing file upload...');
  
  // Create a test CSV file
  const csvContent = 'Name,Age,City\nJohn,25,New York\nJane,30,London\nBob,35,Paris';
  const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
  
  try {
    // Import the file service
    const { default: fileService } = await import('/src/lib/api/fileService.ts');
    
    // Test upload with progress tracking
    const result = await fileService.uploadFile(file, {
      onProgress: (progress) => {
        console.log(`📊 Upload progress: ${progress.progress}% (${progress.status})`);
      }
    });
    
    console.log('✅ Upload successful!', result);
    return result;
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

// Export for testing
window.testFileUpload = testFileUpload;
