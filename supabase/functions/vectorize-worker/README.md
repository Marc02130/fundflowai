# Vectorize Worker Edge Function

## Overview
The Vectorize Worker Edge Function is a Supabase Edge Function that handles document vectorization for grant applications. It processes extracted text into embeddings using OpenAI's text-embedding-ada-002 model, chunks text appropriately, and stores vectors for semantic search.

## Features
- Text chunking and preprocessing
- OpenAI embeddings generation
- Vector storage and management
- Queue-based processing system
- Error handling and retries
- Progress tracking and logging
- Support for both application and section documents

## API Endpoint
```
POST /functions/v1/vectorize-worker
```

### Request Format
```json
{
  "document_id": "string",
  "document_type": "string"  // 'application' or 'section'
}
```

### Response Format
```json
{
  "success": boolean,
  "document_id": "string",
  "status": "string",
  "chunks_processed": number
}
```

## Processing Flow
1. **Validation**
   - Validates request parameters
   - Checks document existence
   - Verifies text extraction completion

2. **Text Processing**
   - Retrieves extracted text
   - Splits text into appropriate chunks
   - Preprocesses chunks for vectorization

3. **Vector Generation**
   - Generates embeddings for each chunk
   - Validates vector dimensions (1536)
   - Stores vectors with corresponding chunks

4. **Status Updates**
   - Updates document status
   - Logs processing progress
   - Handles success/failure states

## Dependencies
- `@supabase/supabase-js`: Supabase client library
- `openai`: OpenAI API client
- `@langchain/text-splitter`: Text chunking utilities
- Shared utilities:
  - `errors.ts`: Error handling
  - `auth.ts`: Authentication

## Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key
- `OPENAI_MODEL`: text-embedding-ada-002

## Database Tables
- `grant_application_documents`: Application document metadata
- `grant_application_section_documents`: Section document metadata
- `grant_application_document_vectors`: Application document vectors
- `grant_application_section_document_vectors`: Section document vectors
- `document_processing_queue`: Processing queue and status tracking
- `processing_logs`: Detailed processing logs

## Best Practices
1. **Performance**
   - Optimize chunk sizes
   - Batch vector operations
   - Handle rate limits
   - Monitor memory usage

2. **Error Handling**
   - Validate vector dimensions
   - Handle API failures
   - Implement retries
   - Log processing errors

3. **Security**
   - Secure API keys
   - Validate input data
   - Handle sensitive information
   - Monitor usage limits

4. **Vector Quality**
   - Appropriate chunk sizing
   - Clean text preprocessing
   - Validate embeddings
   - Monitor vector quality

## Testing
- Test with various text lengths
- Verify vector dimensions
- Check error handling
- Validate chunk processing
- Test rate limiting
- Verify vector storage

## Limitations
- OpenAI API rate limits
- Maximum chunk size: 8192 tokens
- Vector dimension: 1536
- Processing timeout: 60 seconds
- Memory constraints of Edge Function environment
- Maximum chunks per document: 100 