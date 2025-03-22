# Prompt AI Edge Function

This Edge Function generates grant application content using OpenAI Assistants.

## Overview

The prompt-ai function generates high-quality grant content using OpenAI's Assistants API, with specialized writing and review assistants to ensure quality and compliance.

### Key Features
- Content generation using dedicated writing assistants
- Content review using specialized review assistants (when available)
- Version history through new record creation
- Vector store integration for context-aware generation
- Custom user prompt support

## Function Details

### Main Handler
- Validates user session and access
- Retrieves section, field, and application context
- Retrieves or creates OpenAI thread
- Uses writing assistant for initial content generation
- Uses review assistant for content refinement (when available)
- Creates new field records for version history
- Returns detailed success/error responses with field IDs

### Processing Stages
1. **Initial Generation**
   - Uses writing assistant with context from:
     - Section requirements
     - User instructions
     - Previous content
     - Document vectors
   - Creates a new field record with generated content

2. **Content Review (when available)**
   - Uses review assistant to improve initial content
   - Focuses on clarity, structure, and requirement compliance
   - Creates another new field record with reviewed content

## Usage

### API Endpoint
```typescript
POST /functions/v1/prompt-ai
```

### Request Body
```typescript
{
  section_id: string;    // ID of the grant section
  field_id: string;      // ID of the field to use as reference
  prompt_id?: string;    // Optional custom prompt ID
}
```

### Response Format
```typescript
{
  success: boolean;
  field_id: string;          // ID of the newly created field
  previous_field_id: string; // ID of the reference field
  error?: string;            // Present only when success=false
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

## Version History

All generations are stored as new records in the `grant_application_section_fields` table. Version history can be retrieved by querying:

```sql
SELECT * FROM grant_application_section_fields
WHERE grant_application_section_id = '{section_id}'
ORDER BY created_at DESC
```

No explicit version numbering is used; records are ordered by creation timestamp.

## Best Practices

1. Always validate user access before processing
2. Preserve user instructions and comments across generations
3. Create new records instead of updating existing ones
4. Use specialized assistants for specific tasks (writing vs. review)
5. Include all relevant context in prompts 