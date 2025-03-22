# Prompt AI Edge Function Requirements

## User Requirements

### Purpose
- Generate high-quality content for individual grant application sections using AI assistance
- Maintain version history for all generated content
- Allow for custom user prompts when specified

### User Experience
- Users can generate content for a specific section with a single click
- Content is automatically refined through a review process if a review assistant is available
- Version history is maintained through timestamps (created_at)
- User instructions and comments are preserved across generations

### Key Features
- Single-click generation of grant section content
- Support for custom user prompts
- Content version history
- Integration with vector store for context-aware generation
- Automatic content review (when review assistant is available)

## Technical Requirements

### API Endpoint
- Path: `/functions/v1/prompt-ai`
- Method: POST
- Authentication: Required (via Authorization header)

### Request Format
```json
{
  "section_id": "UUID",
  "field_id": "UUID",
  "prompt_id": "UUID" // Optional
}
```

### Response Format
```json
{
  "success": true,
  "field_id": "UUID",      // ID of the newly created field
  "previous_field_id": "UUID" // ID of the field used as reference
}
```

### Error Response Format
```json
{
  "success": false,
  "field_id": "UUID",      // May be included if a field was created with error message
  "previous_field_id": "UUID",
  "error": "Error message"
}
```

### Processing Flow
1. **Validation**
   - Validate user session and access permissions
   - Verify required fields (section_id, field_id)
   - Retrieve section and field data

2. **Prompt Preparation**
   - Use user-provided prompt if prompt_id is specified
   - Fall back to section.grant_section.ai_generator_prompt if no prompt_id
   - Include user instructions and comments from existing field
   - Include document vectors as context

3. **Content Generation**
   - Use writing_assistant_id from grant_applications table
   - Create or reuse openai_thread_id for communication
   - Generate content with writing assistant
   - Create a new field record with generated content

4. **Content Review (if available)**
   - If review_assistant_id exists in grant_applications
   - Submit generated content to review assistant
   - Create another new field record with reviewed content

5. **Version History**
   - Each generation creates a new record in the grant_application_section_fields table
   - History is tracked via created_at timestamps
   - Previous field data (instructions, comments) is preserved

### Data Storage
- New field records are created for each generation
- User instructions and comments are preserved
- Model information is stored as `${OPENAI_MODEL}-${stage}`
- No explicit version numbering; rely on created_at for ordering

### Error Handling
- Field-level errors are captured in new field records
- System-level errors return proper status codes
- All errors are logged for debugging

### Security
- Validate user session for each request
- Verify user has access to the specified section
- Sanitize all inputs before use in AI prompts

### Performance
- Optimize API calls to OpenAI
- Handle timeouts gracefully
- Process sections sequentially to avoid thread conflicts

## Implementation Details

### Dependencies
- OpenAI Assistants API
- Supabase Database
- Grant application context (application, sections, fields)
- Document vectors for context

### Environment Variables
- `OPENAI_API_KEY`: OpenAI API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_MODEL`: OpenAI model to use (defaults to model specified in assistant)

### Database Requirements
- grant_applications table with:
  - writing_assistant_id (OpenAI assistant ID)
  - review_assistant_id (OpenAI assistant ID)
  - openai_thread_id (OpenAI thread ID)
  - vector_store_id (OpenAI vector store ID)

- grant_application_section_fields table with:
  - grant_application_section_id (Section reference)
  - ai_output (Generated text)
  - ai_model (Model information)
  - user_instructions (User-provided instructions)
  - user_comments_on_ai_output (User feedback)
  - created_at (For version ordering)
