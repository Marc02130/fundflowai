Technical Requirements for Supabase Edge Function: "Generate Grant"
General Requirements

Platform: Supabase Edge Function, written in TypeScript.
Authentication: Validate the user’s session to ensure authorized access.
Error Handling: Return meaningful error messages (e.g., HTTP 400 for invalid inputs, 500 for server errors) and log failures for debugging.
Response Format: New record in grant_application_section_fields
    grant_application_section_fields.user_instructions = grant_applications.descriptions
    grant_application_section_fields.ai_output = text returned from openai.ts refineText 
AI Integration: Utilize the /shared/openai.ts module for AI interactions, configured with an OpenAI API key stored in environment variables.
Edge Function: "Generate Grant"

Purpose: Automatically generates and refines content for all grant application sections that have an ai_generator_prompt, using the grant application’s description and attached documents as context.
Endpoint: /generate-grant
HTTP Method: POST
Inputs (Request Body):
grant_application_id (UUID): Identifies the grant application to process, passed from the "Generate Grant" button on the Grant Application View page.
Processing Steps

Data Retrieval:
Grant Application Details:
Query grant_applications using grant_application_id.
Retrieve description (used as user instructions) and other relevant metadata (e.g., title, grant_opportunity_id).
Grant Application Documents:
Query grant_application_documents where grant_application_id matches the input.
Collect file_path and file_type for all attachments to use as context.
Grant Application Sections:
Query grant_application_section where grant_application_id matches the input.
Retrieve a list of grant_section_id values and their associated flow_order.
Grant Sections with AI Prompts:
For each grant_section_id from the previous step, query grant_sections.
Filter to sections where ai_generator_prompt is not null.
Collect ai_generator_prompt, name, and instructions for each qualifying section.
Content Generation Loop:
For Each Eligible Section (where ai_generator_prompt exists):
Prepare AI Input:
Construct the prompt by combining:
ai_generator_prompt from grant_sections.
description from grant_applications (as user instructions).
Include attachments from grant_application_documents as context (e.g., extract text from PDFs or include file metadata).
Generate Text:
Use the /shared/openai.ts module to call the OpenAI API.
Pass the constructed prompt and attachments to generate initial content.
Refine Text:
Spelling/Grammar Prompt: Act as a proofreading expert tasked with correcting grammatical, spelling and punctuation errors in the given text. Identify any mistakes, and make necessary corrections to ensure clarity, accuracy, enhance readability and flow. Text: [grant_application_section.ai_output (review edits) or text returned from AI]
Logic Prompt: Review the following text for logical errors, contradictions, and inconsistencies. Identify any issues and provide corrected versions while maintaining the original meaning and intent of the text: [grant_application_section.ai_output (review edits) or text returned from AI]
Requirements Prompt: Review the following text for compliance with the requirements specified in the provided links. Identify any non-compliant areas, explain the issues, and suggest corrections to ensure full compliance while maintaining the original intent of the text: '[grant_application_section.ai_output (review edits) or text returned from AI]'. Please refer to the following links for compliance requirements: [requirements from grant_requirements (based on grant funding org) and grant_opportunities.url in section 4 of the link]
Store Result:
Insert a new record into grant_application_section_fields:
grant_application_section_id: UUID of the processed section.
ai_output: The refined text.
ai_model: Name of the AI model used from env.
created_at/updated_at: Current timestamp.
Completion Check:
Optionally, update is_completed to true in grant_application_section for each processed section, depending on whether full automation is desired.
Output

Database Updates:
For each section with an ai_generator_prompt, a new record is added to grant_application_section_fields with the generated and refined ai_output.
Response:
Return JSON:
json

Collapse

Wrap

Copy
{
  "success": true,
  "data": [
    {
      "grant_application_section_id": "UUID",
      "field_id": "UUID",
      "ai_output": "string"
    },
    ...
  ]
}
Include an array of results for all processed sections.
Error Handling

Invalid Input:
If grant_application_id is missing or invalid, return { success: false, error: "Invalid grant application ID" }.
No Sections with Prompts:
If no sections have an ai_generator_prompt, return { success: false, error: "No sections with AI generator prompts found" }.
Missing Data:
If description or attachments are unavailable, return { success: false, error: "Description or documents required for generation" }.
AI Failure:
If the OpenAI API call fails, retry once, then return { success: false, error: "Failed to generate content" }.
Performance and Scalability

Concurrency: Process sections sequentially to avoid overwhelming the AI API, with a maximum timeout of 60 seconds per section.
Batching: Limit the number of API calls by combining smaller sections if feasible (e.g., under a character limit).
Caching: Cache attachment text extractions to avoid redundant processing within the same request.
Dependencies

Supabase Client: Use the Supabase JavaScript client to query tables (grant_applications, grant_application_documents, grant_application_section, grant_sections, grant_application_section_fields).
OpenAI Module: Leverage /shared/openai.ts for AI interactions, ensuring it supports text generation and refinement prompts.
File Handling: Include a utility to extract text from attachments (e.g., PDFs) if needed, either within /shared/openai.ts or as a separate helper.
UI Integration

Trigger: Invoked by the "Generate Grant" button on the Grant Application View page.
Input: Passes the grant_application_id as the sole parameter.
Feedback:
Display a loading indicator while the function runs.
On success, refresh the section list to show newly generated content.
On error, show a toast notification with the error message.
Summary

This edge function automates the generation of content for all eligible sections of a grant application when the "Generate Grant" button is clicked. It uses the grant’s description and documents as context, applies the ai_generator_prompt from each section, and refines the output for spelling, logic, and compliance. Results are stored in grant_application_section_fields for display in the UI, ensuring a seamless and efficient workflow for grant writers.