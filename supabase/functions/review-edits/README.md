# Review Edits Edge Function

This Edge Function reviews and improves grant application content using OpenAI Assistants.

## Overview

The review-edits function analyzes grant content and provides improvements through the OpenAI Assistants API, ensuring high-quality academic standards while preserving user intent.

### Key Features
- Content review using specialized review assistants
- Academic writing style enhancement
- Integration with vector store for contextual awareness
- Grant requirements compliance verification

## Function Details

### Main Handler
- Validates user session and access
- Retrieves section, field, and application context
- Retrieves or creates OpenAI thread
- Uses review assistant for content refinement
- Creates new field record with improved content

### Processing Flow
1. **Content Review**
   - Uses review assistant with context from:
     - User's edited content
     - Grant requirements
     - Application context
   - Creates a new field record with reviewed content

## Usage

### API Endpoint
```typescript
POST /functions/v1/review-edits
```

### Request Body
```typescript
{
  section_id: string;    // ID of the grant section
  field_id: string;      // ID of the field to review
}
```

### Response Format
```typescript
{
  success: boolean;
  data?: {
    field_id: string;    // ID of the new field with improved content
    ai_output: string;   // Improved content
  };
  error?: string;        // Present only when success=false
}
```

## Error Handling

Uses shared error handling with specific codes:
- `auth/error`: Authentication errors
- `input/invalid`: Invalid input data
- `ai/error`: AI processing errors
- `db/error`: Database operation errors

## Dependencies

### Internal
- `../shared/openai_assistant.ts`: OpenAI Assistants API integration
- `../shared/errors.ts`: Error handling
- `../shared/auth.ts`: Authentication

### External
- OpenAI Assistants API
- Supabase Database

## Environment Variables

Required variables:
- `OPENAI_API_KEY`: OpenAI API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_MODEL`: Base model name for tracking (actual model is specified in the assistant)

## Testing

Tests are located in the `tests/` directory and cover:
- Input validation
- Authentication
- Content processing
- Error handling

## Best Practices

1. Always validate user access before processing
2. Use the review assistant for complex content improvement
3. Preserve user's core intent while improving presentation
4. Include grant requirements context for compliance review 