Technical Requirements for Supabase Edge Functions
General Requirements

Platform: Supabase Edge Functions, written in TypeScript.
Authentication: Each function must validate the user's session using Supabase Auth.
Error Handling: Return standardized error responses with appropriate HTTP status codes.
Response Format: Return JSON objects with success status, data, and error messages where applicable.
AI Integration: Use OpenAI API for text and image generation, configured via environment variables.

Project Structure:
```
supabase/
├── functions/
│   ├── prompt-ai/
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tests/
│   │       ├── __init__.ts
│   │       ├── test_prompt_ai.ts
│   │       └── mocks/
│   │           ├── __init__.ts
│   │           ├── openai_mock.ts
│   │           └── db_mock.ts
│   ├── review-edits/
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tests/
│   │       ├── __init__.ts
│   │       ├── test_review_edits.ts
│   │       └── mocks/
│   │           ├── __init__.ts
│   │           ├── openai_mock.ts
│   │           └── db_mock.ts
│   └── create-visuals/
│       ├── index.ts
│       ├── package.json
│       └── tests/
│           ├── __init__.ts
│           ├── test_create_visuals.ts
│           └── mocks/
│               ├── __init__.ts
│               ├── openai_mock.ts
│               └── db_mock.ts
├── shared/
│   ├── __init__.ts
│   ├── auth.ts
│   ├── db.ts
│   ├── openai.ts
│   ├── errors.ts
│   └── utils.ts
└── tests/
    ├── __init__.ts
    ├── conftest.ts
    └── test_data/
        ├── applications/
        ├── sections/
        ├── documents/
        └── users/
```

Key Components:
1. Function-specific directories:
   - Each function has its own directory with:
     - Main function code (index.ts)
     - Dependencies (package.json)
     - Unit tests and mocks

2. Shared code:
   - Common utilities and helpers
   - Database connection handling
   - Authentication logic
   - OpenAI integration
   - Error handling
   - Shared constants

3. Test data:
   - Organized by entity type
   - Follows test data requirements
   - Includes both valid and invalid cases

4. Dependencies:
   - Each function's package.json includes:
     - TypeScript and Node.js packages needed
     - Version constraints
     - Development dependencies

Environment Variables:
- OPENAI_MODEL: Model for text generation
- OPENAI_IMAGE_MODEL: Model for image generation

Standardized Response Format:
Success Response:
```json
{
  "success": true,
  "data": {
    // Function-specific data
  }
}
```

Error Response:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional additional details
  }
}
```

Authentication:
- Use Supabase Auth for user session validation
- Return appropriate Supabase Auth error codes and messages
- Validate user has access to the requested grant application

Database:
- Use Supabase client for database operations
- Use TypeORM for type-safe database queries
- No transaction handling required
- Query patterns:
  - Use parameterized queries for all user input
  - Include proper JOIN conditions
  - Use appropriate indexes
  - Handle NULL values appropriately

Testing Requirements:
Unit Tests:
- Test each function independently
- Mock external dependencies (OpenAI, database)
- Test error scenarios
- Test input validation
- Test authentication
- Test database queries

Test Data Requirements:
1. Grant Application Data:
   - Valid application with all required fields
   - Application with missing optional fields
   - Application with invalid data
   - Multiple applications for same user
   - Applications for different users

2. Section Data:
   - Required sections
   - Optional sections
   - Sections with AI prompts
   - Sections without AI prompts
   - Sections with attachments
   - Sections without attachments

3. Document Data:
   - Valid image files in different formats
   - Invalid file types
   - Files exceeding size limits
   - Missing files
   - Corrupted files

4. User Data:
   - Authenticated users
   - Unauthenticated users
   - Users with different roles
   - Users with different permissions

Edge Function A: "Prompt AI" (Generate and Refine Text)

Purpose: Generates grant section text and refines it through spelling/grammar, logic, and requirements checks.
Endpoint: /prompt-ai
HTTP Method: POST
Inputs (Request Body):
```typescript
interface PromptAIRequest {
  grant_application_section_id: string;
  prompt_id?: string;
}
```

Processing Steps:
Data Retrieval:
- Fetch the section record from grant_application_section using grant_application_section_id.
- Retrieve the prompt:
  - If prompt_id is provided, query user_ai_prompts for prompt_text.
  - Otherwise, query grant_sections for ai_generator_prompt.
- Fetch attachments:
  - Check grant_application_section_documents first (section-specific).
  - Fall back to grant_application_documents (application-wide).
- Fetch context from grant_application_section_fields:
  - Latest user_instructions.
  - Latest user_comments_on_ai_output.
  - Most recent ai_output (if any).

Text Generation:
- Construct an AI request combining the prompt, attachments (as text or metadata), and context.
- Call OpenAI API to generate initial text.
- Perform spelling/grammar check using OpenAI.
- Perform logic check using OpenAI.
- Perform requirements check using OpenAI.

Output:
- Insert a new record into grant_application_section_fields:
  - grant_application_section_id: From input.
  - ai_output: Final refined text.
  - ai_model: Value of OPENAI_MODEL environment variable.
  - created_at/updated_at: Current timestamp.
- Return JSON: { success: true, data: { field_id: string, ai_output: string } }.

Error Handling:
- If no prompt is found, return { success: false, error: "No generator prompt available" }.
- If API calls fail, retry once and log the attempt before returning an error.
- Use standardized error response format.

Edge Function B: "Review Edits" (Check Manually Edited Text)

Purpose: Analyzes user-edited text for spelling/grammar, logical consistency, and compliance with funding agency requirements.
Endpoint: /review-edits
HTTP Method: POST
Inputs (Request Body):
```typescript
interface ReviewEditsRequest {
  grant_application_section_id: string;
  text: string;
}
```

Processing Steps:
Data Validation:
- Ensure text is non-empty; return an error if invalid.

Text Review:
- Use OpenAI API to:
  - Check and correct spelling and grammar.
    - Prompt: Act as a proofreading expert tasked with correcting grammatical, spelling and punctuation errors in the given text. Identify any mistakes, and make necessary corrections to ensure clarity, accuracy, enhance readability and flow. Text: [grant_application_section.ai_output (review edits) or text returned from AI]
  - Detect logical errors and inconsistencies.
    - Prompt: Review the following text for logical errors, contradictions, and inconsistencies. Identify any issues and provide corrected versions while maintaining the original meaning and intent of the text: [grant_application_section.ai_output (review edits) or text returned from AI]
  - Verify compliance with grant requirements.
    - Prompt: Review the following text for compliance with the requirements specified in the provided links. Identify any non-compliant areas, explain the issues, and suggest corrections to ensure full compliance while maintaining the original intent of the text: '[grant_application_section.ai_output (review edits) or text returned from AI]'. Please refer to the following links for compliance requirements: [requirements from grant_requirements (based on grant funding org) and grant_opportunities.url in section 4 of the link]

Output:
- Insert a new record into grant_application_section_fields:
  - grant_application_section_id: From input.
  - ai_output: Corrected text with fixes applied.
  - ai_model: Value of OPENAI_MODEL environment variable.
  - created_at/updated_at: Current timestamp.
- Return JSON: { success: true, data: { field_id: string, ai_output: string } }.

Error Handling:
- If text is empty, return { success: false, error: "Text input required" }.
- Use standardized error response format.

Edge Function C: "Create Visuals" (Generate Visuals from an Image)

Purpose: Creates visuals for a section based on an existing image.
Endpoint: /create-visuals
HTTP Method: POST
Inputs (Request Body):
```typescript
interface CreateVisualsRequest {
  grant_application_section_id: string;
  image_path: string;
  context?: string;
}
```

Processing Steps:
Data Retrieval:
- Verify the image_path exists in either grant_application_section_documents or grant_application_documents.
- Include context if provided.

Visual Generation:
- Use OpenAI image generation model (OPENAI_IMAGE_MODEL).
- Scale output to fit page size (7.5x10 inches) while maintaining aspect ratio.
- Convert output to PNG format.

Storage:
- Save the generated image as a new file in grant_application_section_documents.
- Insert a new record into grant_application_section_documents:
  - grant_application_id: Derived from grant_application_section.
  - file_path: Path to the new image.
  - file_type: 'png'.
  - created_at/updated_at: Current timestamp.

Output:
- Return JSON: { success: true, data: { document_id: string, file_path: string } }.

Error Handling:
- If image_path is invalid, return { success: false, error: "Image not found" }.
- If generation fails, return { success: false, error: "Visual creation failed" }.
- Use standardized error response format.

Additional Considerations

Logging:
- Use Supabase's built-in logging system.
- Log:
  - Function calls
  - Processing time
  - Errors
  - Retry attempts

Language Support:
- English only for MVP.

File Handling:
- Input image formats: png, jpg, jpeg, tif, tiff, svg
- Output format: png only
- Size limit: 10MB (handled at upload)
- Output dimensions: Must fit on a page (7.5x10 inches) with maintained aspect ratio
- No image optimization required

Summary
These requirements define three Supabase Edge Functions for the MVP:
- "Prompt AI": Generates and refines text using OpenAI
- "Review Edits": Checks and corrects user-edited text
- "Create Visuals": Produces section-specific visuals from images

Each function integrates with the UI via dedicated buttons, processes data from the database, and stores results appropriately, enhancing the grant writing workflow with AI capabilities.