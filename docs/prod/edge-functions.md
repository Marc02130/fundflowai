# Edge Functions Implementation

## Overview
The edge functions are implemented as Supabase Edge Functions in TypeScript. They provide AI-powered functionality for grant writing assistance, including text generation, review, and visualization creation.

## Project Structure
```
supabase/
├── functions/
│   ├── prompt-ai/          # Text generation and refinement
│   ├── review-edits/       # Text review and correction
│   └── create-visuals/     # Image-based visualization generation
├── shared/                 # Shared utilities and helpers
└── tests/                  # Test data and configuration
```

## Shared Components

### Error Handling
```typescript
// Standardized error response format
{
  success: false,
  error: {
    code: string,      // Error code (e.g., "auth/error", "input/invalid")
    message: string,   // Human-readable message
    details?: object   // Optional additional details
  }
}
```

### Authentication
- Uses Supabase Auth for user session validation
- Validates user access to grant applications
- Returns appropriate error codes and messages

### Database Operations
- Uses Supabase client for database operations
- Implements parameterized queries for security
- Handles NULL values appropriately
- Uses proper JOIN conditions

## Function Implementations

### 1. Prompt AI (`/prompt-ai`)
Generates and refines grant section text using OpenAI.

**Endpoint**: `POST /prompt-ai`

**Input**:
```typescript
{
  section_id: string;    // ID of the grant application section
  field_id: string;      // ID of the field to update
  prompt_id?: string;    // Optional custom prompt ID
}
```

**Process Flow**:
1. Validate user session and access:
   - Check authorization header
   - Validate user session via JWT
   - Verify user access to grant application
   
2. Data Retrieval:
   - Get section data (including grant section, application, opportunity, requirements)
   - Get field data
   - Get attachments
   - Get prompt text (custom or default from grant section)

3. Text Generation and Refinement:
   - Stage 1: Initial Generation
     - Format prompt with instructions, comments, attachments
     - Generate initial text using OpenAI GPT-4
   - Stage 2: Spelling/Grammar Check
     - Proofread and correct text
   - Stage 3: Logic Check
     - Check for contradictions and inconsistencies
   - Stage 4: Requirements Check (if requirements exist)
     - Verify compliance with grant requirements
     - Skip if no requirements found

4. Database Updates:
   - Update field after each stage with:
     - Generated/refined text
     - AI model version (gpt-4-[stage])
     - Timestamp

**Output**:
```typescript
{
  success: true,
  field_id: string;
}
```

**Error Responses**:
```typescript
{
  success: false,
  error: {
    code: string,      // e.g., "auth/error", "input/invalid"
    message: string,   // Human-readable message
    details?: object   // Additional error context
  }
}
```

**Error Codes**:
- `AUTH_ERROR`: Authentication/authorization failures
- `INVALID_INPUT`: Missing or invalid request parameters
- `DB_ERROR`: Database operation failures
- `NOT_FOUND`: Resource not found
- `NO_PROMPT`: Prompt text unavailable
- `AI_ERROR`: OpenAI API failures

**CORS Support**:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};
```

**Logging**:
- Function execution start/end
- User validation steps
- Data retrieval progress
- Generation stages
- Error details

### 2. Review Edits (`/review-edits`)
Reviews and refines user-edited text through multiple stages of AI processing.

**Endpoint**: `POST /review-edits`

**Input**:
```typescript
{
  section_id: string;    // ID of the grant application section
  field_id: string;      // ID of the field to review
}
```

**Process Flow**:
1. Validate user session and access:
   - Check authorization header
   - Validate user session via JWT
   - Verify user access to section

2. Data Retrieval:
   - Get section data including:
     - Base section information
     - Grant application data
     - Grant opportunity data
     - Requirements (if any)
   - Get field data with current text

3. Review Process:
   - Stage 1: Spelling/Grammar Check
     - Use proofreading expert prompt
     - Correct grammatical and spelling errors
   - Stage 2: Logic Check
     - Review for logical consistency
     - Fix contradictions and inconsistencies
   - Stage 3: Requirements Check (if requirements exist)
     - Verify compliance with grant requirements
     - Skip if no requirements found

4. Database Updates:
   - Create new field record with:
     - Reviewed text
     - AI model version
     - Timestamp

**Output**:
```typescript
{
  success: true,
  data: {
    field_id: string;
    ai_output: string;
  }
}
```

### 3. Create Visuals (`/create-visuals`)
Generates visuals from existing images.

**Endpoint**: `POST /create-visuals`

**Input**:
```typescript
{
  grant_application_section_id: string;
  image_path: string;
  context?: string;
}
```

**Process Flow**:
1. Validate user session and access
2. Verify and validate input image:
   - Check existence in database
   - Validate file format (png, jpg, jpeg, tif, tiff, svg)
   - Check file size (max 10MB)
3. Generate visualization using OpenAI
4. Validate output dimensions (7.5x10 inches)
5. Save to storage and database

**Output**:
```typescript
{
  success: true,
  data: {
    document_id: string;
    file_path: string;
  }
}
```

## Environment Variables
Required environment variables:
```bash
OPENAI_MODEL=string        # Model for text generation
OPENAI_IMAGE_MODEL=string  # Model for image generation
SUPABASE_URL=string       # Supabase project URL
SUPABASE_ANON_KEY=string  # Supabase anonymous key
```

## Testing
Each function includes comprehensive tests:
- Unit tests for core functionality
- Mocked external dependencies
- Error scenario testing
- Input validation testing
- Authentication testing
- Database operation testing

## Error Codes
Standard error codes used across functions:
```typescript
{
  AUTH_ERROR: 'auth/error',
  INVALID_INPUT: 'input/invalid',
  NOT_FOUND: 'resource/not-found',
  AI_ERROR: 'ai/error',
  DB_ERROR: 'database/error',
  NO_PROMPT: 'prompt/not-found',
  API_ERROR: 'api/error'
}
```

## Logging
Functions use Supabase's built-in logging system to track:
- Function calls
- Processing time
- Errors
- Retry attempts

## File Handling
Image processing specifications:
- Input formats: png, jpg, jpeg, tif, tiff, svg
- Output format: png only
- Size limit: 10MB
- Output dimensions: 7.5x10 inches (maintaining aspect ratio)

## Security Considerations
1. Authentication required for all endpoints
2. User access validation for grant applications
3. Parameterized database queries
4. File type validation
5. Size limits on uploads
6. Secure environment variable handling

## Performance Considerations
1. Efficient database queries with proper indexes
2. Optimized image processing
3. Caching where appropriate
4. Rate limiting for API calls
5. Error handling with retries

## Current Limitations
1. **Prompt AI**:
   - No support for multiple languages
   - No caching of generated text
   - No parallel processing of stages

2. **Review Edits**:
   - No partial text review (processes entire text)
   - No support for specific section targeting
   - No caching of review results

## Future Improvements
1. Performance Optimizations:
   - Add caching layer
   - Implement parallel processing
   - Add request queuing

2. Feature Enhancements:
   - Multiple language support
   - Partial text review
   - Enhanced error reporting
   - Real-time progress updates

3. Monitoring:
   - Performance metrics
   - Detailed logging
   - Usage analytics
