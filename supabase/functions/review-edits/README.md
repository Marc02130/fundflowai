# Review Edits Edge Function

This Edge Function reviews and improves manually edited grant application content using AI assistance.

## Overview

The review-edits function analyzes user-edited grant content and provides improvements while maintaining the user's intent and key changes.

### Key Features
- Reviews user edits for grammar and style
- Maintains academic writing standards
- Preserves user's core changes and intent
- Integrates with grant application workflow

## Function Details

### Main Handler
- Validates user session and access
- Retrieves section and field data
- Processes content through AI review
- Updates field with improved content

### Key Components
- **Content Analysis**: Reviews changes between versions
- **AI Review**: Uses GPT-4 to suggest improvements
- **Quality Checks**: Ensures academic standards
- **Error Handling**: Uses shared error handling

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
    field_id: string;    // ID of the updated field
    ai_output: string;   // Improved content
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
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
- `../shared/openai.ts`: AI text processing
- `../shared/errors.ts`: Error handling
- `../shared/auth.ts`: Authentication
- `../shared/db.ts`: Database operations

### External
- OpenAI GPT-4 API
- Supabase Database

## Environment Variables

Required variables:
- `OPENAI_API_KEY`: OpenAI API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key

## Testing

Tests are located in the `tests/` directory and cover:
- Input validation
- Authentication
- Content processing
- Error handling

## Best Practices

1. Always validate user access before processing
2. Use shared error handling for consistency
3. Preserve user's core edits and intent
4. Maintain academic writing standards 