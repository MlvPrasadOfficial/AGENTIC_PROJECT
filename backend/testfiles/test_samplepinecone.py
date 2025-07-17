"""
Comprehensive Test Suite for Pinecone Vector Database Operations

This module provides extensive testing for Pinecone vector database operations
using sample CSV data. It validates all aspects of the vector storage pipeline
from data ingestion to embedding and retrieval.

File: test_samplepinecone.py
Author: GitHub Copilot
Date: 2025-07-17
Version: 2.0.0

Purpose:
    - Test Pinecone connection and authentication
    - Test Pinecone index configuration and connectivity
    - Validate vector count tracking before and after operations
    - Test CSV data file accessibility and structure
    - Verify embedding operations with proper error handling
    - Monitor vector count changes after embedding completion

Features:
    - Real-time Pinecone API integration (no fallback defaults)
    - Comprehensive error handling with detailed diagnostics
    - Detailed test output with success/failure indicators
    - 3-second wait time for embedding completion as required
    - Async/await pattern for modern Python practices
    - Professional logging and status reporting

Test Cases:
    2.0 - Pinecone Connection Test: Validates API key and connection
    2.1 - Fetch Index Details: Validates Pinecone index configuration
    2.2 - Vector Count Before: Gets baseline vector count
    2.3 - CSV Filename Validation: Verifies test data file accessibility
    2.4 - Index Embedding Operation: Tests embedding with 3-second wait
    2.5 - Vector Count After: Compares vector counts before/after embedding

Dependencies:
    - pandas: For CSV data manipulation
    - asyncio: For asynchronous operations
    - pinecone: Direct Pinecone SDK integration
    - PineconeVectorStore: Custom vector database interface
    - VectorDocument: Pydantic model for document structure

Usage:
    python test_samplepinecone.py
    
    The test suite will run all 6 test cases sequentially and provide
    comprehensive output showing success/failure status for each test.
"""

import os
import sys
import time
import pandas as pd
import asyncio
from typing import Dict, Any, Optional
from pathlib import Path

# Add the backend directory to Python path for imports
# This allows importing from the app module structure
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import Pinecone directly for connection testing
try:
    from pinecone import PineconeAsyncio
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False

# Import vector store components
from app.db.vector_store import PineconeVectorStore, VectorDocument
from app.core.config import settings

class TestSamplePinecone:
    """
    Comprehensive test class for Pinecone vector database operations.
    
    This class provides a complete test suite for validating Pinecone vector
    database functionality using sample CSV data. It includes tests for connection,
    index configuration, vector count tracking, data validation, embedding operations,
    and result verification.
    
    Attributes:
        vector_store (PineconeVectorStore): The vector database interface
        pinecone_client (PineconeAsyncio): Direct Pinecone client for connection testing
        csv_file_path (str): Path to the sample CSV test data file
        vector_count_before (int): Vector count before embedding operations
        embedding_success (bool): Status of embedding operation success
        
    Test Methods:
        test_pinecone_connection: Validates API key and connection
        test_fetch_index_details: Validates index configuration and connectivity
        test_fetch_vector_count_before_embedding: Gets baseline vector count
        test_csv_filename_validation: Verifies test data file accessibility
        test_index_embedding_operation: Tests embedding with required wait time
        test_vector_count_after_embedding: Compares vector counts before/after
        
    Error Handling:
        - Real-time API validation with no fallback defaults
        - Comprehensive exception handling with detailed error messages
        - Strict validation for all operations
        - Detailed logging for debugging and monitoring
    """
    
    def __init__(self):
        """
        Initialize the test environment and configuration.
        
        Sets up the vector store instance, Pinecone client, determines the CSV file path,
        and initializes tracking variables for test state management.
        """
        # Debug settings loading
        print(f"🔍 DEBUG: settings.PINECONE_API_KEY = {settings.PINECONE_API_KEY[:8] + '...' + settings.PINECONE_API_KEY[-4:] if settings.PINECONE_API_KEY else 'None'}")
        print(f"🔍 DEBUG: PINECONE_AVAILABLE = {PINECONE_AVAILABLE}")
        
        # Initialize the Pinecone vector store interface
        self.vector_store = PineconeVectorStore()
        
        # Initialize direct Pinecone client for connection testing
        self.pinecone_client = None
        
        # Construct path to the sample CSV test data file
        # Uses relative path from testfiles directory to csvfiles directory
        self.csv_file_path = os.path.join(
            os.path.dirname(__file__), '..', 'csvfiles', 'samplepinecone.csv'
        )
        
        # Initialize test state tracking variables
        self.vector_count_before = 0  # Baseline vector count
        self.embedding_success = False  # Embedding operation success status
        
    async def setup(self):
        """
        Setup method to initialize vector store connection and Pinecone client.
        
        Initializes the Pinecone vector store connection and sets up the direct
        Pinecone client for comprehensive testing.
        
        Returns:
            None
            
        Raises:
            Exception: If vector store initialization fails
        """
        print("🔧 Setting up test environment...")
        
        # Initialize the vector store connection
        try:
            init_success = await self.vector_store.initialize()
            print(f"✅ Vector store initialization: {'SUCCESS' if init_success else 'FAILED'}")
        except Exception as e:
            print(f"❌ Vector store initialization failed: {e}")
        
        # Initialize direct Pinecone client for connection testing
        if PINECONE_AVAILABLE and settings.PINECONE_API_KEY:
            try:
                self.pinecone_client = PineconeAsyncio(api_key=settings.PINECONE_API_KEY)
                print(f"✅ Pinecone client initialized with API key: {settings.PINECONE_API_KEY[:8]}...{settings.PINECONE_API_KEY[-4:]}")
            except Exception as e:
                print(f"❌ Pinecone client initialization failed: {e}")
        else:
            print("❌ Pinecone client not initialized - missing API key or library")
        
    async def test_pinecone_connection(self):
        """
        Test 2.0: Test Pinecone connection and authentication.
        
        This test validates the Pinecone API connection and authentication
        without using fallback defaults. It ensures real-time connectivity.
        
        Returns:
            bool: True if connection successful, False otherwise
            
        Output:
            - API key status (masked for security)
            - Connection status to Pinecone API
            - Available indexes list
            - Authentication validation
        """
        print("\n🔌 TEST 2.0: Pinecone Connection Test")
        try:
            # Check if Pinecone library is available
            if not PINECONE_AVAILABLE:
                print("❌ Pinecone library not available")
                return False
            
            # Check API key
            if not settings.PINECONE_API_KEY:
                print("❌ PINECONE_API_KEY not configured")
                return False
            
            # Mask API key for security
            masked_key = settings.PINECONE_API_KEY[:8] + "..." + settings.PINECONE_API_KEY[-4:]
            print(f"✅ API Key: {masked_key}")
            
            # Create a fresh client for this test
            fresh_client = PineconeAsyncio(api_key=settings.PINECONE_API_KEY)
            
            # Test connection with direct Pinecone client
            async with fresh_client as pc:
                indexes = await pc.list_indexes()
                print(f"✅ Connected to Pinecone API")
                print(f"✅ Available indexes: {indexes.names()}")
                
                # Verify our target index exists
                if settings.PINECONE_INDEX_NAME in indexes.names():
                    print(f"✅ Target index '{settings.PINECONE_INDEX_NAME}' found")
                    
                    # Test index access
                    index_desc = await pc.describe_index(settings.PINECONE_INDEX_NAME)
                    print(f"✅ Index status: {index_desc.status}")
                    print(f"✅ Index ready: {index_desc.status.get('ready', False)}")
                    
                    if index_desc.status.get('ready', False):
                        print("✅ SUCCESS: Pinecone connection and authentication validated")
                        return True
                    else:
                        print("❌ FAILED: Index not ready")
                        return False
                else:
                    print(f"❌ FAILED: Target index '{settings.PINECONE_INDEX_NAME}' not found")
                    return False
                    
        except Exception as e:
            print(f"❌ FAILED: Connection error - {str(e)}")
            return False
        
    async def test_fetch_index_details(self):
        """
        Test 2.1: Fetch the index details from Pinecone.
        
        Verifies that the index exists and returns proper configuration
        using real-time data without fallback defaults.
        
        Returns:
            bool: True if index details fetched successfully, False otherwise
            
        Output:
            - Index name and configuration
            - Index dimension and metric
            - Index status and readiness
            - Total vector count and namespaces
        """
        print("\n🔍 TEST 2.1: Fetching Index Details")
        try:
            # Create a fresh client for this test
            fresh_client = PineconeAsyncio(api_key=settings.PINECONE_API_KEY)
            
            async with fresh_client as pc:
                # Get index description
                index_desc = await pc.describe_index(settings.PINECONE_INDEX_NAME)
                
                # Get index statistics
                async with pc.IndexAsyncio(host=index_desc.host) as idx:
                    stats = await idx.describe_index_stats()
                    
                    # Print comprehensive index details
                    print(f"✅ Index Name: {index_desc.name}")
                    print(f"✅ Index Dimension: {index_desc.dimension}")
                    print(f"✅ Index Metric: {index_desc.metric}")
                    print(f"✅ Index Status: {index_desc.status}")
                    print(f"✅ Index Ready: {index_desc.status.get('ready', False)}")
                    print(f"✅ Total Vectors: {stats.total_vector_count}")
                    print(f"✅ Index Fullness: {stats.index_fullness}")
                    print(f"✅ Namespaces: {dict(stats.namespaces) if stats.namespaces else {}}")
                    
                    # Validate essential properties
                    if (index_desc.dimension == settings.PINECONE_DIMENSION and
                        index_desc.metric == settings.PINECONE_METRIC and
                        index_desc.status.get('ready', False)):
                        print("✅ SUCCESS: Index details validated successfully")
                        return True
                    else:
                        print("❌ FAILED: Index configuration mismatch")
                        return False
                        
        except Exception as e:
            print(f"❌ FAILED: Error fetching index details - {str(e)}")
            return False
    
    async def test_fetch_vector_count_before_embedding(self):
        """
        Test 2.2: Fetch vector count in the index before embedding.
        
        Gets the current number of vectors stored in the index using real-time data.
        This establishes the baseline for comparison after embedding operations.
        
        Returns:
            bool: True if vector count fetched successfully, False otherwise
            
        Output:
            - Current vector count in the index
            - Validation of count as valid number
        """
        print("\n📊 TEST 2.2: Fetching Vector Count Before Embedding")
        try:
            # Create a fresh client for this test
            fresh_client = PineconeAsyncio(api_key=settings.PINECONE_API_KEY)
            
            async with fresh_client as pc:
                # Get index description for host
                index_desc = await pc.describe_index(settings.PINECONE_INDEX_NAME)
                
                # Get real-time index statistics
                async with pc.IndexAsyncio(host=index_desc.host) as idx:
                    stats = await idx.describe_index_stats()
                    vector_count_before = stats.total_vector_count
                    
                    # Print vector count
                    print(f"✅ Vector Count Before Embedding: {vector_count_before}")
                    
                    # Store for comparison later
                    self.vector_count_before = vector_count_before
                    
                    # Validate count
                    if isinstance(vector_count_before, (int, float)) and vector_count_before >= 0:
                        print("✅ SUCCESS: Vector count fetched successfully")
                        return True
                    else:
                        print("❌ FAILED: Invalid vector count")
                        return False
                        
        except Exception as e:
            print(f"❌ FAILED: Error fetching vector count - {str(e)}")
            return False
    
    def test_csv_filename_validation(self):
        """
        Test 2.3: Validate the filename of the CSV file to be uploaded.
        Ensures the CSV file exists and is accessible.
        """
        print("\n📁 TEST 2.3: CSV Filename Validation")
        try:
            # Check if CSV file exists
            csv_exists = os.path.exists(self.csv_file_path)
            
            # Print filename information
            print(f"✅ CSV File Path: {self.csv_file_path}")
            print(f"✅ File Exists: {csv_exists}")
            
            if csv_exists:
                # Get file size
                file_size = os.path.getsize(self.csv_file_path)
                print(f"✅ File Size: {file_size} bytes")
                
                # Read and display basic info about the CSV
                df = pd.read_csv(self.csv_file_path)
                print(f"✅ CSV Rows: {len(df)}")
                print(f"✅ CSV Columns: {list(df.columns)}")
            
            # Assertions
            assert csv_exists, f"CSV file should exist at {self.csv_file_path}"
            assert file_size > 0, "CSV file should not be empty"
            
            print("✅ SUCCESS: CSV filename validation passed")
            return True
            
        except Exception as e:
            print(f"❌ FAILED: CSV filename validation error - {str(e)}")
            return False
    
    async def test_index_embedding_operation(self):
        """
        Test 2.4: Test index embedding success/fail with 3-second wait.
        
        Attempts to embed the CSV data into the Pinecone index using real-time
        operations without fallback modes. Includes required 3-second wait time.
        
        Returns:
            bool: True if embedding successful, False otherwise
            
        Output:
            - Document preparation status
            - Embedding operation results
            - 3-second wait confirmation
            - Success/failure status
        """
        print("\n🚀 TEST 2.4: Index Embedding Operation")
        try:
            # Read CSV data
            df = pd.read_csv(self.csv_file_path)
            
            # Prepare data for embedding
            documents = []
            import uuid
            for _, row in df.iterrows():
                # Combine all text fields for embedding
                text_content = f"{row['name']} {row['category']} {row['description']}"
                # Use unique IDs to ensure new vectors are added
                unique_id = f"test_{uuid.uuid4().hex[:8]}_{row['id']}"
                documents.append(VectorDocument(
                    id=unique_id,
                    content=text_content,
                    metadata={
                        'name': row['name'],
                        'category': row['category'],
                        'value': str(row['value']),
                        'description': row['description']
                    }
                ))
            
            print(f"✅ Prepared {len(documents)} documents for embedding")
            
            # Create a fresh client for this test
            fresh_client = PineconeAsyncio(api_key=settings.PINECONE_API_KEY)
            
            # Attempt to embed documents using real-time operations
            async with fresh_client as pc:
                # Get index description for host
                index_desc = await pc.describe_index(settings.PINECONE_INDEX_NAME)
                
                # Prepare vectors for direct upsert
                vectors = []
                async with pc.IndexAsyncio(host=index_desc.host) as idx:
                    for doc in documents:
                        # Generate embedding using vector store
                        embedding = await self.vector_store.generate_embedding(doc.content)
                        
                        # Prepare vector for upsert
                        vectors.append({
                            "id": doc.id,
                            "values": embedding,
                            "metadata": {
                                "content": doc.content,
                                **doc.metadata
                            }
                        })
                    
                    # Perform upsert operation
                    upsert_response = await idx.upsert(vectors=vectors)
                    
                    # Check upsert success
                    if upsert_response and upsert_response.upserted_count > 0:
                        print(f"✅ Successfully embedded {upsert_response.upserted_count} documents")
                        embedding_success = True
                    else:
                        print(f"❌ Embedding failed - upsert returned {upsert_response}")
                        embedding_success = False
            
            # Wait 3 seconds for embedding to complete as required
            print("⏳ Waiting 3 seconds for embedding to complete...")
            time.sleep(3)
            
            # Wait additional time for Pinecone to update statistics
            print("⏳ Waiting additional 2 seconds for index statistics to update...")
            time.sleep(2)
            
            # Print embedding result
            if embedding_success:
                print("✅ SUCCESS: Index embedding completed successfully")
            else:
                print("❌ FAILED: Index embedding failed")
            
            # Store result for next test
            self.embedding_success = embedding_success
            
            return embedding_success
            
        except Exception as e:
            print(f"❌ FAILED: Index embedding operation error - {str(e)}")
            return False
    
    async def test_vector_count_after_embedding(self):
        """
        Test 2.5: Fetch vector count after embedding is done.
        
        Compares the vector count before and after embedding using real-time data.
        This validates that the embedding operation actually changed the vector count.
        
        Returns:
            bool: True if vector count change validated, False otherwise
            
        Output:
            - Vector count before embedding
            - Vector count after embedding
            - Difference calculation
            - Validation of count change
        """
        print("\n📈 TEST 2.5: Vector Count After Embedding")
        try:
            # Create a fresh client for this test
            fresh_client = PineconeAsyncio(api_key=settings.PINECONE_API_KEY)
            
            async with fresh_client as pc:
                # Get index description for host
                index_desc = await pc.describe_index(settings.PINECONE_INDEX_NAME)
                
                # Get real-time index statistics
                async with pc.IndexAsyncio(host=index_desc.host) as idx:
                    stats = await idx.describe_index_stats()
                    vector_count_after = stats.total_vector_count
                    
                    # Print vector count comparison
                    print(f"✅ Vector Count Before: {self.vector_count_before}")
                    print(f"✅ Vector Count After: {vector_count_after}")
                    
                    # Calculate difference
                    difference = vector_count_after - self.vector_count_before
                    print(f"✅ Vector Count Difference: +{difference}")
                    
                    # Validate counts
                    if not isinstance(vector_count_after, (int, float)) or vector_count_after < 0:
                        print("❌ FAILED: Invalid vector count after embedding")
                        return False
                    
                    # Critical validation: if embedding was successful, count should have increased
                    if self.embedding_success:
                        if vector_count_after > self.vector_count_before:
                            print("✅ SUCCESS: Vector count increased after successful embedding")
                            return True
                        else:
                            print("❌ FAILED: Vector count did not increase after successful embedding")
                            return False
                    else:
                        # If embedding failed, count should remain the same
                        if vector_count_after == self.vector_count_before:
                            print("✅ SUCCESS: Vector count unchanged after failed embedding")
                            return True
                        else:
                            print("❌ FAILED: Vector count changed despite failed embedding")
                            return False
                            
        except Exception as e:
            print(f"❌ FAILED: Error fetching vector count after embedding - {str(e)}")
            return False

async def run_comprehensive_test():
    """
    Execute the complete Pinecone test suite with comprehensive reporting.
    
    This function orchestrates the execution of all test cases in the correct
    sequence, providing detailed output for each test and comprehensive final
    results. It includes proper error handling and status reporting.
    
    Test Execution Order:
        1. Initialize test environment and vector store connection
        2. Test 2.0: Validate Pinecone connection and authentication
        3. Test 2.1: Fetch and validate index details
        4. Test 2.2: Get baseline vector count before embedding
        5. Test 2.3: Validate CSV test data file accessibility
        6. Test 2.4: Execute embedding operation with 3-second wait
        7. Test 2.5: Compare vector counts after embedding completion
        
    Returns:
        bool: True if all tests passed, False if any tests failed
        
    Output:
        Provides detailed console output for each test case including:
        - Test case identification and purpose
        - Success/failure status with visual indicators
        - Detailed error messages for failed tests
        - Final summary with overall test suite status
        
    Error Handling:
        - Real-time Pinecone API validation with no fallback modes
        - Comprehensive exception handling with detailed error reporting
        - Strict validation for all operations
    """
    # Display test suite header with visual separator
    print("🧪 STARTING COMPREHENSIVE PINECONE TEST SUITE")
    print("=" * 60)
    
    # Initialize test instance and setup environment
    test_instance = TestSamplePinecone()
    await test_instance.setup()
    
    # Execute all test cases in sequence and collect results
    results = []
    
    # Test 2.0: Validate Pinecone connection and authentication
    # Critical test - must pass for others to work
    results.append(await test_instance.test_pinecone_connection())
    
    # Test 2.1: Fetch and validate index details
    # Verifies Pinecone index configuration and connectivity
    results.append(await test_instance.test_fetch_index_details())
    
    # Test 2.2: Get baseline vector count before embedding
    # Establishes baseline for comparison after embedding
    results.append(await test_instance.test_fetch_vector_count_before_embedding())
    
    # Test 2.3: Validate CSV test data file accessibility
    # Ensures test data file exists and is properly formatted
    results.append(test_instance.test_csv_filename_validation())
    
    # Test 2.4: Execute embedding operation with required wait time
    # Tests the core embedding functionality with 3-second wait
    results.append(await test_instance.test_index_embedding_operation())
    
    # Test 2.5: Compare vector counts after embedding completion
    # Verifies that embedding operation affected vector count appropriately
    results.append(await test_instance.test_vector_count_after_embedding())
    
    # Generate comprehensive final results report
    print("\n" + "=" * 60)
    print("🏁 FINAL TEST RESULTS")
    print("=" * 60)
    
    # Define test case names for results display
    test_names = [
        "2.0 Pinecone Connection Test",
        "2.1 Fetch Index Details",
        "2.2 Vector Count Before Embedding", 
        "2.3 CSV Filename Validation",
        "2.4 Index Embedding Operation",
        "2.5 Vector Count After Embedding"
    ]
    
    # Display individual test results with status indicators
    for i, (test_name, result) in enumerate(zip(test_names, results), 1):
        # Use visual indicators for success/failure status
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"Test {test_name}: {status}")
    
    # Calculate and display overall test suite status
    overall_success = all(results)
    overall_status = "✅ ALL TESTS PASSED" if overall_success else "❌ SOME TESTS FAILED"
    print(f"\nOverall Test Suite: {overall_status}")
    
    # Special validation for connection test
    if not results[0]:  # First test (connection) failed
        print("\n⚠️  CRITICAL: Pinecone connection test failed - configure API key and index")
        
    return overall_success

if __name__ == "__main__":
    """
    Main execution block for the Pinecone test suite.
    
    This block executes when the script is run directly (not imported).
    It runs the comprehensive test suite using asyncio and provides
    appropriate exit codes for automated testing environments.
    
    Execution Flow:
        1. Run the comprehensive test suite using asyncio
        2. Collect the overall success/failure status
        3. Exit with appropriate code (0 for success, 1 for failure)
        
    Exit Codes:
        0: All tests passed successfully
        1: One or more tests failed
        
    Usage:
        python test_samplepinecone.py
        
    Output:
        Comprehensive test results with detailed status for each test case
    """
    # Execute the comprehensive test suite using asyncio
    # This handles the async nature of the vector store operations
    success = asyncio.run(run_comprehensive_test())
    
    # Exit with appropriate code for automated testing environments
    # 0 indicates success, 1 indicates failure
    sys.exit(0 if success else 1)
