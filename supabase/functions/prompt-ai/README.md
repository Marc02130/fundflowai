# Prompt AI Edge Function

This Edge Function generates and refines grant application content using AI assistance.

## Overview

The prompt-ai function generates high-quality grant content using OpenAI's GPT models, with multiple refinement stages to ensure quality and compliance.

### Key Features
- Initial content generation based on section requirements
- Multi-stage refinement process
- Grant requirement compliance checks
- Academic writing standards enforcement
- Contextual awareness of grant applications

## Function Details

### Main Handler
- Validates user session and access
- Retrieves section and application context
- Processes content through generation and refinement
- Updates field with generated content

### Processing Stages
1. **Initial Generation**
   - Uses section context and requirements
   - Follows academic writing standards
   - Incorporates user instructions

2. **Refinement Stages**
   - Spelling and grammar check
   - Logical consistency review
   - Requirements compliance verification

## Usage

### API Endpoint
```typescript
POST /functions/v1/prompt-ai
```

### Request Body
```typescript
{
  section_id: string;    // ID of the grant section
  field_id: string;      // ID of the field to update
  prompt_id?: string;    // Optional custom prompt ID
}
```

### Response Format
```typescript
{
  success: boolean;
  data?: {
    field_id: string;    // ID of the updated field
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
- `no_prompt`: Missing or invalid prompt

## Dependencies

### Internal
- `../shared/openai.ts`: AI text generation
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
- `OPENAI_MODEL`: OpenAI model to use (defaults to 'gpt-4')

## Testing

Tests are located in the `tests/` directory and cover:
- Input validation
- Authentication
- Content generation
- Error handling
- Refinement stages

## Best Practices

1. Always validate user access before processing
2. Use shared error handling for consistency
3. Include all relevant context in prompts
4. Follow academic writing standards
5. Verify requirement compliance 