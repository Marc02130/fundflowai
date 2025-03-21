# Assistant and Vector Store Destruction

## User Requirements
- When a grant application is submitted or cancelled, the system must automatically clean up its OpenAI resources
- This cleanup should happen transparently without user intervention
- All three specialized assistants should be properly removed
- The shared vector store should be deleted to prevent unnecessary storage costs
- The cleanup process should not interfere with the normal application submission/cancellation flow

## Technical Requirements
- Create a dedicated edge function (`destroy-grant-assistants`) to handle cleanup of OpenAI resources
- The edge function should be called during the grant application status update process (submit/cancel)
- Integration with the dashboard application view to trigger assistant destruction
- The destruction process should include:
  - Deletion of all three specialized OpenAI assistants (research, writing, review)
  - Deletion of the shared OpenAI vector store
  - Clearing of assistant IDs and vector_store_id from the grant_applications record

### Implementation Details
- Edge Function:
  - Accept grant_application_id as parameter
  - Retrieve assistant IDs and vector store ID from the grant application record
  - Delete each assistant from OpenAI (research, writing, review)
  - Delete the vector store from OpenAI
  - Update the grant_applications record to clear:
    - research_assistant_id
    - writing_assistant_id
    - review_assistant_id
    - vector_store_id
    - vector_store_expires_at

### API Schema
```typescript
interface DestroyAssistantsRequest {
  grant_application_id: string;
}

interface DestroyAssistantsResponse {
  success: boolean;
  deleted_assistants: number;
  vector_store_deleted: boolean;
  error?: string;
}
```

### Dashboard Integration
- Modify the handleUpdateStatus function in dashboard.applications.$id.tsx
- Add calls to the destroy-grant-assistants edge function when:
  - Application status is changed to 'submitted'
  - Application status is changed to 'cancelled'
- Add error handling for assistant destruction failures
- Ensure the application status update proceeds even if assistant destruction fails

### Database Updates
- No schema changes needed (uses existing fields)
- During cleanup, the following fields will be set to null:
  - research_assistant_id
  - writing_assistant_id
  - review_assistant_id
  - vector_store_id
  - vector_store_expires_at

### Security Considerations
- Ensure proper authentication for edge function access
- Implement RLS policies to only allow destruction of assistants owned by the user
- Use service role key for OpenAI API calls within the edge function
- Add appropriate logging for audit purposes
