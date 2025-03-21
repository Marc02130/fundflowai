# Document Processing and Vectorization System Requirements

## Overview
This document outlines the requirements for a document processing system that handles file uploads, text extraction, and vector generation for grant applications. The system uses Supabase Edge Functions for processing and stores vectors for semantic search capabilities.

## Requirements

### 1. Queue Management
- **Objective**: Track the processing status of uploaded documents.
- **Details**:
  - Use `document_processing_queue` table in Supabase PostgreSQL with columns:
    - `id` (UUID, primary key, auto-generated)
    - `document_id` (UUID): Links to document tables
    - `document_type` (string): Either 'application' or 'section'
    - `status` (string): States include 'pending', 'extracting', 'extracted', 'vectorizing', 'completed', 'failed'
    - `attempts` (integer, default 0): For retry logic
    - `error` (string, nullable): Error messages
    - `created_at` (timestamp)
    - `updated_at` (timestamp)
  - **Workflow**: Document upload → Queue entry (status='pending') → Processing → Completion/Failure

### 2. Text Extraction Edge Function (`extract-text`)
- **Objective**: Extract text from uploaded documents.
- **Details**:
  - **Input**: 
    ```json
    {
      "document_id": "string",
      "document_type": "string"
    }
    ```
  - **Process**:
    - Download document from Supabase Storage
    - Support multiple file types:
      - PDF: Using `pdf-parse`
      - DOCX: Using `mammoth`
      - XLSX: Using `xlsx`
      - TXT: Direct reading
    - Store extracted text in document tables
  - **Output**:
    - Success: Update status to 'extracted'
    - Failure: Update status to 'failed', log error
  - **Error Handling**:
    - Retry up to 3 times
    - Log errors in `processing_logs`
  - **Limitations**:
    - Maximum file size: 50MB
    - Processing timeout: 60 seconds

### 3. Vector Generation Edge Function (`vectorize-worker`)
- **Objective**: Generate and store vector embeddings both in database and OpenAI vector store.
- **Details**:
  - **Input**:
    ```json
    {
      "document_id": "string",
      "document_type": "string"
    }
    ```
  - **Process**:
    - Use OpenAI's `text-embedding-ada-002` model
    - Split text into chunks using `@langchain/text-splitter`
    - Generate embeddings for each chunk
    - Validate vector dimensions (1536)
    - For application documents, add chunks to OpenAI vector store:
      - Check if vector store exists for application or create new one
      - Create OpenAI files from each text chunk
      - Add files to OpenAI vector store in batches
      - Link vector store to grant application
  - **Storage**:
    - Database tables:
      - `grant_application_document_vectors` table:
        - `id` (UUID)
        - `document_id` (UUID)
        - `vector` (vector(1536))
        - `chunk_text` (text)
      - `grant_application_section_document_vectors` table:
        - Same structure as above
    - OpenAI storage:
      - Vector store per application with 7-day expiration
      - Files for each chunk stored in OpenAI
  - **Limitations**:
    - Maximum chunk size: 8192 tokens
    - Maximum chunks per document: 100
    - Vector dimension: 1536
    - OpenAI file batch size: 500 files

### 4. Processing Flow
1. **Document Upload**:
   - File uploaded to Supabase Storage
   - Entry created in `document_processing_queue`

2. **Text Extraction**:
   - `extract-text` processes pending documents
   - Updates queue status
   - Triggers vectorization on success

3. **Vector Generation**:
   - `vectorize-worker` processes extracted documents
   - Generates and stores vectors in database
   - For application documents, adds chunks to OpenAI vector store
   - Updates final status

### 5. Error Handling and Logging
- **Processing Logs Table**:
  ```sql
  CREATE TABLE processing_logs (
    id UUID PRIMARY KEY,
    document_id UUID,
    event TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- Log key events:
  - Processing start/completion
  - Errors and retries
  - Status changes
  - Vector generation metrics
  - OpenAI vector store IDs

### 6. Performance and Security
- **Performance**:
  - Stream large files
  - Optimize chunk sizes
  - Batch vector operations
  - Monitor memory usage
  - Batch OpenAI file additions (500 files per batch)

- **Security**:
  - Validate file types and sizes
  - Secure API keys
  - Sanitize extracted text
  - Monitor usage limits
  - Proper error handling for OpenAI API calls

### 7. Testing Requirements
- Test file type support
- Verify extraction accuracy
- Validate vector dimensions
- Check error handling
- Test rate limiting
- Verify vector storage
- Monitor processing logs
- Validate OpenAI vector store creation and population

## Implementation Notes
- Use shared utilities for error handling and authentication
- Implement proper logging throughout the process
- Monitor OpenAI API usage and rate limits
- Ensure proper error handling and retries
- Maintain vector quality through proper chunking and validation
- Gracefully handle OpenAI service failures
- Prioritize database storage over OpenAI storage (continue processing if OpenAI operations fail)
