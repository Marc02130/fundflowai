Technical Requirements for Supabase Edge Function: "Generate Grant"
General Requirements

Platform: Supabase Edge Function, written in TypeScript.
Authentication: Validate the user's session to ensure authorized access.
Error Handling: Return meaningful error messages (e.g., HTTP 400 for invalid inputs, 500 for server errors) and log failures for debugging.
Response Format: New record in grant_application_section_fields
    grant_application_section_fields.user_instructions = grant_applications.descriptions
    grant_application_section_fields.ai_output = text generated and reviewed by OpenAI assistants
AI Integration: Utilize the /shared/openai_assistant.ts module for AI interactions, configured with OpenAI assistants and vector stores.
Edge Function: "Generate Grant"

Purpose: Automatically generates and refines content for all grant application sections that have an ai_generator_prompt, using the grant application's description, OpenAI assistants, and vector stores as context.
Endpoint: /generate-grant
HTTP Method: POST
Inputs (Request Body):
grant_application_id (UUID): Identifies the grant application to process, passed from the "Generate Grant" button on the Grant Application View page.
Processing Steps

Data Retrieval:
Grant Application Details:
Query grant_applications using grant_application_id.
Retrieve description (used as user instructions), writing_assistant_id, review_assistant_id, vector_store_id, and other relevant metadata.
Grant Application Sections:
Query grant_application_section where grant_application_id matches the input.
Retrieve a list of sections with their grant_section_id values.
Grant Sections with AI Prompts:
For each grant_section_id, query grant_sections.
Collect ai_generator_prompt, name, and instructions for each section.
Content Generation Process:
Sequential Processing:
Process each section one at a time to avoid OpenAI thread conflicts.
For Each Section:
Create Field:
Insert a new record into grant_application_section_fields for the section.
Generate Content:
Use writing_assistant_id to generate initial content.
Construct a prompt combining:
- Section-specific ai_generator_prompt
- Grant requirements
- Application description as context
Wait for assistant to complete generation.
Review Content (if review_assistant_id exists):
Send generated content to review_assistant_id.
Review assistant improves clarity, coherence, and technical precision.
Wait for review assistant to complete refinement.
Fallback Handling:
If initial generation fails, attempt simplified generation.
If all attempts fail, log detailed error and mark section as failed.
Store Result:
Update the grant_application_section_fields record:
ai_output: The generated and reviewed text.
ai_model: Indicate which model and process was used (assistant, assistant-reviewed, fallback).
updated_at: Current timestamp.
Output

Database Updates:
For each processed section, a record in grant_application_section_fields is updated with the generated/reviewed content.
Response:
Return JSON:
```json
{
  "success": true,
  "results": {
    "successful_sections": [
      {
        "section_id": "string",
        "field_id": "string",
        "status": "string"  // completed_with_review, completed_no_review, or completed_fallback
      }
    ],
    "failed_sections": [
      {
        "section_id": "string",
        "field_id": "string",
        "error": "string",
        "attempts": number
      }
    ]
  }
}
```

Error Handling

Invalid Input:
If grant_application_id is missing or invalid, return error with appropriate error code.
Missing Assistants:
If writing_assistant_id is missing, return error indicating assistant not found.
Missing Vector Store:
If vector_store_id is missing, return error about missing vector store.
Thread Conflicts:
Process sections sequentially to avoid OpenAI thread conflicts.
AI Failures:
Implement retry mechanism (up to 2 attempts).
If generation fails, use simplified prompt as fallback.
If all attempts fail, log detailed error and return failure status.
Performance and Scalability

Concurrency: Process sections sequentially to avoid OpenAI thread conflicts.
Robustness: Include fallback mechanisms for error scenarios.
Timeout Handling: Monitor processing time and prevent exceeding Edge Function limits.
Dependencies

Supabase Client: Use the Supabase JavaScript client to query relevant tables.
OpenAI Assistant Module: Leverage /shared/openai_assistant.ts for interactions with:
- Writing Assistant: Initial content generation
- Review Assistant: Content refinement and improvement
- Vector Stores: Providing document context
UI Integration

Trigger: Invoked by the "Generate Grant" button on the Grant Application View page.
Input: Passes the grant_application_id as the sole parameter.
Feedback:
Display a loading indicator while the function runs.
On success, refresh the section list to show newly generated content.
On error, show a toast notification with the error message.
Summary

This edge function automates the generation of content for grant applications using specialized OpenAI assistants. It uses a writing assistant for initial content creation and a review assistant for refinement. The implementation processes sections sequentially to avoid thread conflicts, uses vector stores for document context, and includes robust fallback mechanisms for handling errors. Results are stored in grant_application_section_fields for display in the UI, ensuring a seamless and efficient workflow for grant writers.