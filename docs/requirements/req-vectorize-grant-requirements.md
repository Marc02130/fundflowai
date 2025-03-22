# Requirements for Grant Requirements Vectorization

## Overview
Create an edge function that automatically fetches, stores, and queues for processing all requirement documents related to a new grant application, making them available to AI assistants.

## Function Purpose
- Fetch requirement documents from URLs stored in the database
- Store document content in the system
- Queue documents for processing and vectorization
- Run automatically after grant assistant creation during new application setup

## Workflow

### 1. Trigger
- **When**: After `create-grant-assistant` edge function completes successfully
- **How**: Called directly from the grant application creation process
- **Input**:
  - Grant application ID
  - Authentication token

### 2. URL Collection
- Query the database to find all relevant requirement URLs:
  - `grants.url` where grant is linked to the grant opportunity
  - `organization_grant_requirements.url` where organization matches the grant's organization
  - `grant_requirements.url` where grant matches the grant opportunity's grant
  - `grant_opportunities.url` for the selected opportunity

### 3. Document Fetching
- For each URL:
  - Attempt to fetch the content
  - Handle different content types (HTML, PDF, DOCX, etc.)
  - For HTML: Extract main content using text extraction techniques
  - For documents: Download and store the binary content

### 4. Storage
- Store downloaded content in Supabase storage (storage container: `grant-attachments`)
  - Create a consistent naming pattern: `{grant_application_id}/{document_id}.{file_extension}`
  - Example path: `ea961f1d-c5e5-475a-bc35-3ff23c9ef9e9/6d8ec326-7ce9-4f4d-a060-e90a1c4cb726.pdf`

### 5. Database Recording
- For each document processed:
  - Insert record into `grant_application_documents` with:
    ```sql
    INSERT INTO grant_application_documents (
      grant_application_id,
      file_name,
      file_type,
      file_path,
      vectorization_status,
      created_at,
      updated_at
    ) VALUES (
      {grant_application_id},
      {original_filename_or_url_title},  -- Store original filename or title from URL
      {file_type},
      {file_path},                       -- Pattern: {grant_application_id}/{document_id}.{file_extension}
      'pending',
      NOW(),
      NOW()
    )
    ```

  - Insert record into `document_processing_queue` with:
    ```sql
    INSERT INTO document_processing_queue (
      document_id,
      document_type,
      status,
      attempts,
      created_at,
      updated_at
    ) VALUES (
      {new_document_id},  -- The UUID returned from the grant_application_documents insert
      'application',      -- Use the appropriate document_type enum value; examples show 'application'
      'pending',
      0,
      NOW(),
      NOW()
    )
    ```

    **Note**: Ensure the `document_type` value matches one of the defined enum values in the database schema. Based on examples in the system, 'application' appears to be used, but verify this is appropriate for requirement documents.

### 6. Processing Flow
- The system uses triggers to automate document processing:
  - `trigger_extract_document`: When a record is added to the queue with 'pending' status, it triggers document extraction
  - `trigger_vectorize_document`: When a document status is updated to 'extracted', it triggers vectorization
- The edge function only needs to insert the records - the existing triggers will handle the processing pipeline

## Technical Requirements

### Input
- Grant application ID (UUID)
- Authentication token (for Supabase operations)

### Output
- Success/failure status
- List of documents processed
- Any errors encountered

### Error Handling
- Graceful failure for each URL (continue to next URL if one fails)
- Detailed error logging
- Retry mechanism for transient failures (network issues)
- Maximum timeout to prevent hanging

### Security Considerations
- URL validation to prevent potential security issues
- Rate limiting for external requests
- Access control validation
- Proper sanitization of document content

## Integration

### Code Change Required
1. Add call to the new edge function after create-grant-assistants completes:

```typescript
// After successful assistant creation
try {
  const vectorizeResponse = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vectorize-grant-requirements`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        grant_application_id: applicationId
      })
    }
  );
  
  if (!vectorizeResponse.ok) {
    console.error('Failed to vectorize requirements:', await vectorizeResponse.json());
    // Non-blocking - continue even if this fails
  }
} catch (error) {
  console.error('Error vectorizing requirements:', error);
  // Non-blocking - continue even if this fails
}
```

2. Update WizardContainer.tsx to include this call after assistant creation

### Dependencies
- Puppeteer or similar for web scraping
- PDF.js or similar for PDF processing
- Document processing library for other file types
- Supabase client for database and storage operations

## Testing Considerations
- Test with various URL types (HTML, PDF, invalid links)
- Test with large documents
- Test error handling scenarios
- Verify database records are created correctly
- Verify documents are stored properly
