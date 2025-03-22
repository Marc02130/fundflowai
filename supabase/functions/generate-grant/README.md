# Generate Grant Edge Function

## Overview
The Generate Grant Edge Function is a Supabase Edge Function that handles the automated generation of complete grant applications. It processes sections sequentially using dedicated OpenAI Assistants for writing and review to optimize quality while staying within execution time limits.

## Features
- Sequential processing of grant application sections
- Two-phase content generation using specialized OpenAI Assistants:
  - Writing Assistant for initial content creation
  - Review Assistant for content refinement and improvement
- Efficient database operations with minimal updates
- Built-in error handling and validation
- Session-based authentication
- Vector store integration for context-aware generation
- Robust fallback mechanisms for handling errors

## API Endpoint
```
POST /functions/v1/generate-grant
```

### Request Format
```json
{
  "application_id": "string"
}
```

### Response Format
```json
{
  "success": boolean,
  "results": {
    "successful_sections": [
      {
        "section_id": "string",
        "field_id": "string",
        "status": "string" // "completed_with_review", "completed_no_review", or "completed_fallback"
      }
    ],
    "failed_sections": [
      {
        "section_id": "string",
        "field_id": "string",
        "error": "string",
        "attempts": number
      }
    ]
  }
}
```

## Processing Flow
1. **Validation**
   - Authenticates user session
   - Validates request parameters
   - Checks user access to application

2. **Data Gathering**
   - Retrieves application and section data
   - Verifies assistant IDs (writing_assistant_id and review_assistant_id)
   - Validates vector store access

3. **Section Processing**
   - Processes sections sequentially to avoid thread conflicts
   - Each section generation includes:
     - Create a field to store the result
     - Use OpenAI thread for assistant communication
     - Generate content with writing assistant
     - Review and improve content with review assistant (if available)
     - Fallback mechanisms for handling errors
   - Results are stored with minimal database operations

4. **Error Handling**
   - Comprehensive error handling for each stage
   - Retry logic for failed generations
   - Standardized error responses
   - Detailed error logging

## Dependencies
- `@supabase/supabase-js`: Supabase client library
- Shared utilities:
  - `errors.ts`: Error handling utilities
  - `auth.ts`: Authentication functions
  - `openai_assistant.ts`: OpenAI Assistants API integration

## Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_MODEL`: OpenAI model to use for generation

## Database Tables
- `grant_applications`: Stores application metadata and assistant IDs
  - `writing_assistant_id`: ID of the OpenAI writing assistant
  - `review_assistant_id`: ID of the OpenAI review assistant
  - `vector_store_id`: ID of the vector store for document context
- `grant_application_section`: Links sections to applications
- `grant_sections`: Stores section details and prompts
- `grant_application_section_fields`: Stores generated content and metadata

## Best Practices
1. **Performance**
   - Process sections sequentially to avoid thread conflicts
   - Leverage pre-configured OpenAI assistants for specialized tasks
   - Use vector stores for document context
   - Minimize database operations
   - Optimize AI prompt construction

2. **Error Handling**
   - Always validate input parameters
   - Include retry mechanisms
   - Use standardized error responses
   - Include detailed error messages for debugging

3. **Security**
   - Validate user session for each request
   - Check user access permissions
   - Sanitize input data

4. **Content Generation**
   - Use specialized assistants for writing and review
   - Include context from vector stores
   - Focus on grant-specific requirements and structure
   - Implement graceful fallbacks for error handling

## Testing
- Test with various section combinations
- Verify sequential processing behavior
- Check error handling and retry mechanisms
- Validate the review process
- Test fallback strategies
- Verify response formats
- Test vector store integration

## Limitations
- Maximum execution time constraint for Edge Functions
- Memory constraints of Edge Function environment
- Rate limits from OpenAI API
- OpenAI thread limitations (can't add messages while a run is active) 