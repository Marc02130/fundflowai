# Create Visuals Edge Function

## Overview
The Create Visuals Edge Function is a Supabase Edge Function that handles the generation and management of AI-powered visualizations for grant applications. It processes images using OpenAI's image variation API to create enhanced visuals for grant sections.

## Features
- AI-powered image variation generation
- Secure file storage management
- Automatic document record creation
- Built-in error handling and validation
- Session-based authentication

## API Endpoint
```
POST /functions/v1/create-visuals
```

### Request Format
```json
{
  "section_id": "string",
  "image_path": "string"
}
```

### Response Format
```json
{
  "success": boolean,
  "document": {
    "id": "string",
    "file_path": "string",
    "file_name": "string",
    "file_type": "string"
  }
}
```

## Processing Flow
1. **Validation**
   - Authenticates user session
   - Validates request parameters
   - Checks user access to section

2. **Image Processing**
   - Downloads source image from storage
   - Generates image variation using OpenAI API
   - Uploads generated image to storage
   - Creates document record

3. **Error Handling**
   - Comprehensive error handling for each stage
   - Storage operation validation
   - API response validation

## Dependencies
- `@supabase/supabase-js`: Supabase client library
- Shared utilities:
  - `errors.ts`: Error handling utilities
  - `auth.ts`: Authentication functions
- External Services:
  - OpenAI API for image variations
  - Supabase Storage for file management

## Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `OPENAI_API_KEY`: OpenAI API key

## Best Practices
1. **File Management**
   - Validate file types before processing
   - Use consistent naming conventions
   - Maintain original file references

2. **Error Handling**
   - Validate API responses
   - Handle storage operations gracefully
   - Provide detailed error messages

3. **Security**
   - Validate user session for each request
   - Check user access permissions
   - Secure file storage operations

## Testing
- Test with various image types
- Verify storage operations
- Check error handling scenarios
- Validate response formats

## Limitations
- Maximum image size constraints
- Supported file formats (PNG)
- OpenAI API rate limits
- Storage quota limitations 