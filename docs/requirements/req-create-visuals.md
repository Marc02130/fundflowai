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
- SUPABASE_URL: Supabase project URL
- SUPABASE_ANON_KEY: Supabase anonymous key

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


"Create Visuals" (Generate Visuals from an Image)

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
- Validate input file format (supported: png, jpg, jpeg, tif, tiff, svg).
- Validate file size (max 10MB).
- Include context if provided.

Visual Generation:
- Use OpenAI image generation model (OPENAI_IMAGE_MODEL).
- Maximum output to fit page size (7.5x10 inches) while maintaining aspect ratio.
- Follow grant writers specifications for image size.
- Convert output to PNG format.
- Validate output dimensions before saving.

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
- If file format is unsupported, return { success: false, error: "Unsupported file format" }.
- If file size exceeds limit, return { success: false, error: "File size exceeds limit" }.
- If generation fails, return { success: false, error: "Visual creation failed" }.
- If output dimensions invalid, return { success: false, error: "Invalid output dimensions" }.
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