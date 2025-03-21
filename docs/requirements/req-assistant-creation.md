# Assistant and Vector Store Creation

## User Requirements
- During grant creation, the system must automatically create three specialized AI assistants for the grant:
  - Research Assistant: For deep research and critical analysis
  - Writing Assistant: For content generation and writing help
  - Review Assistant: For reviewing and improving content
- Users should not need to manually configure the assistants
- Each grant should have its own dedicated assistants, shared vector store, and shared thread
- The assistants creation should happen transparently without disrupting the grant creation flow
- Each assistant should be specialized for its specific purpose and the grant type selected

## Technical Requirements
- Create a dedicated edge function (`create-grant-assistant`) to handle assistants, vector store, and thread creation
- The edge function should be called during the final step of the grant creation wizard
- Integration with the WizardContainer to trigger assistants creation on completion
- The assistants creation should include:
  - Creation of three specialized OpenAI assistants with appropriate instructions based on grant type and purpose
  - Creation of a shared OpenAI vector store with proper expiration policy
  - Creation of a shared OpenAI thread for maintaining conversation context across assistants
  - Configuration of all assistants with the same vector store
  - Storage of assistant IDs, thread_id, and vector_store_id in the grant_applications record

### Implementation Details
- Edge Function:
  - Accept grant_application_id, grant_type_id, and description as parameters
  - Create three specialized OpenAI assistants with appropriate model (e.g., gpt-4o):
    - Research Assistant: For deep research and critical analysis
    - Writing Assistant: For content generation and writing help  
    - Review Assistant: For reviewing and improving content
  - Configure all assistants with file_search tool
  - Create a shared OpenAI vector store with 7-day expiration after last activity
  - Create a shared OpenAI thread for conversation continuity across assistants
  - Update the grant_applications record with:
    - research_assistant_id
    - writing_assistant_id
    - review_assistant_id
    - openai_thread_id
    - vector_store_id
    - vector_store_expires_at

### API Schema
```typescript
interface CreateAssistantRequest {
  grant_application_id: string;
  grant_type_id: string;
  description: string;
}

interface CreateAssistantResponse {
  success: boolean;
  research_assistant_id: string;
  writing_assistant_id: string;
  review_assistant_id: string;
  openai_thread_id: string;
  vector_store_id: string;
  error?: string;
}
```

### WizardContainer Integration
- Modify WizardContainer's onComplete handler to call the edge function
- Add error handling for assistants creation failures
- Update database schema to include new fields in grant_applications table

### Database Updates
- Add following columns to grant_applications table:
  - research_assistant_id: text
  - writing_assistant_id: text
  - review_assistant_id: text
  - openai_thread_id: text
  - vector_store_id: text  
  - vector_store_expires_at: timestamptz

### Security Considerations
- Ensure proper authentication for edge function access
- Implement RLS policies for accessing assistant and vector store IDs
- Use service role key for OpenAI API calls within the edge function
- Add appropriate validation and cleaning when switching between assistants on the same thread
