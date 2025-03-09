# Generate Grant Edge Function

## Overview
The Generate Grant Edge Function is a Supabase Edge Function that handles the automated generation of complete grant applications. It processes multiple sections in parallel to optimize performance and stay within execution time limits.

## Features
- Parallel processing of grant application sections
- Single-pass content generation using AI
- Efficient database operations with minimal updates
- Built-in error handling and validation
- Session-based authentication

## API Endpoint
```
POST /functions/v1/generate-grant
```

### Request Format
```json
{
  "application_id": "string",
  "sections": ["string"]  // Array of section IDs to process
}
```

### Response Format
```json
{
  "success": boolean,
  "sections": [
    {
      "id": "string",
      "status": "string"
    }
  ]
}
```

## Processing Flow
1. **Validation**
   - Authenticates user session
   - Validates request parameters
   - Checks user access to application

2. **Section Processing**
   - Processes all sections in parallel using Promise.all()
   - Each section is generated in a single pass
   - Results are stored with minimal database operations

3. **Error Handling**
   - Comprehensive error handling for each stage
   - Standardized error responses
   - Detailed error logging

## Dependencies
- `@supabase/supabase-js`: Supabase client library
- Shared utilities:
  - `errors.ts`: Error handling utilities
  - `auth.ts`: Authentication functions
  - `openai.ts`: AI text generation functions

## Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_MODEL`: OpenAI model to use for generation

## Best Practices
1. **Performance**
   - Use parallel processing for multiple sections
   - Minimize database operations
   - Optimize AI prompt construction

2. **Error Handling**
   - Always validate input parameters
   - Use standardized error responses
   - Include detailed error messages for debugging

3. **Security**
   - Validate user session for each request
   - Check user access permissions
   - Sanitize input data

## Testing
- Test with various section combinations
- Verify parallel processing behavior
- Check error handling scenarios
- Validate response formats

## Limitations
- Maximum execution time of 60 seconds
- Memory constraints of Edge Function environment
- Rate limits from OpenAI API 