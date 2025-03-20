# Extract Text Edge Function

## Overview
The Extract Text Edge Function is a Supabase Edge Function that handles document text extraction for grant applications. It processes various document types (PDF, DOCX, XLSX, etc.) and prepares them for vectorization.

## Features
- Multi-format document support (PDF, DOCX, XLSX, etc.)
- Automatic text extraction and preprocessing
- Queue-based processing system
- Built-in error handling and retries
- Progress tracking and logging
- Trigger-based vectorization initiation

## API Endpoint
```
POST /functions/v1/extract-text
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
  "extracted_text": "string"
}
```

## Processing Flow
1. **Validation**
   - Validates request parameters
   - Checks document existence
   - Verifies file type support

2. **Text Extraction**
   - Downloads document from storage
   - Determines file type
   - Extracts text using appropriate parser:
     - PDF: pdf-parse
     - DOCX: mammoth
     - XLSX: xlsx
   - Preprocesses extracted text

3. **Status Updates**
   - Updates document status
   - Logs processing progress
   - Triggers vectorization on success

4. **Error Handling**
   - Handles extraction failures
   - Provides detailed error messages
   - Updates status on failure

## Dependencies
- `@supabase/supabase-js`: Supabase client library
- Document parsers:
  - `pdf-parse`: PDF text extraction
  - `mammoth`: DOCX processing
  - `xlsx`: Spreadsheet handling
- Shared utilities:
  - `errors.ts`: Error handling
  - `auth.ts`: Authentication

## Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `STORAGE_BUCKET`: Document storage bucket name

## Database Tables
- `grant_application_documents`: Application document metadata
- `grant_application_section_documents`: Section document metadata
- `document_processing_queue`: Processing queue and status tracking
- `processing_logs`: Detailed processing logs

## Best Practices
1. **Performance**
   - Stream large files when possible
   - Clean up temporary files
   - Optimize text preprocessing
   - Handle memory efficiently

2. **Error Handling**
   - Validate file types early
   - Provide detailed error messages
   - Log processing failures
   - Implement retry logic

3. **Security**
   - Validate file sizes
   - Check file types
   - Sanitize extracted text
   - Handle sensitive data appropriately

4. **Processing**
   - Clean and normalize text
   - Remove irrelevant content
   - Preserve important formatting
   - Prepare text for vectorization

## Testing
- Test with various file types
- Verify extraction accuracy
- Check error handling
- Validate queue processing
- Test large files
- Verify trigger functions

## Limitations
- Maximum file size: 50MB
- Supported file types:
  - PDF (.pdf)
  - Word (.docx)
  - Excel (.xlsx)
  - Text (.txt)
- Processing timeout: 60 seconds
- Memory constraints of Edge Function environment 