# Requirements for the Deep Research Feature

## Overview
The Deep Research feature provides an interactive AI-powered research process for grant applications. It includes a conversation-style interface, version history tracking, and final report generation.

## 1. User Requirements

### Initiate Deep Research
- Users can begin research from the grant application view via "Deep Research" button
- **Button States**:
  - **Disabled** when:
    - Grant application description is empty/null
    - No attachments present
    - `deep_research.md` already exists
  - **Enabled** when description and attachments exist, no `deep_research.md`
  - **Loading State**: Shows "Researching..." during processing

### Interactive Research Window
- Opens upon clicking "Deep Research" button
- Displays:
  - AI-generated research outputs
  - Follow-up questions
  - User responses
  - Research progress
- Supports:
  - User input for answering questions
  - Feedback submission
  - Research refinement requests

### Version History Sidebar
- Shows 10 most recent interaction records
- Includes:
  - Timestamps for each interaction
  - Type indicators (AI output/user response)
  - "Load More" link for older records
- Clicking timestamp shows full content in main window

### Final Report Generation
- "Generate Final Report" button in research window
- Creates comprehensive `deep_research.md`
- Includes all research findings without additional questions
- Automatically attaches to grant application

## 2. Technical Requirements

### Database Structure
```sql
CREATE TABLE grant_application_deep_research (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_application_id UUID REFERENCES grant_applications(id),
  interaction_type TEXT CHECK (interaction_type IN ('ai_output', 'user_response', 'ai_response')),
  content JSONB,
  parent_id UUID REFERENCES grant_application_deep_research(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### OpenAI Integration
- Use OpenAI Assistants API with `OPENAI_DEEP_MODEL`
- Configure research-specific assistant with:
  - Document analysis capabilities
  - Follow-up question generation
  - Research refinement logic
  - Code interpreter for data analysis
  - Retrieval for context awareness

### Processing Flow
1. **Research Initiation**:
   - Create new Thread
   - Upload grant description and attachments
   - Initialize with research instructions

2. **Interactive Research**:
   - AI generates initial research and questions
   - User provides responses
   - AI refines research based on feedback
   - Continue until research is complete

3. **Final Report**:
   - Compile all interactions
   - Generate comprehensive summary
   - Create and store `deep_research.md`
   - Update application documents

### Data Management
- Store all interactions in `grant_application_deep_research`
- Use parent_id to maintain conversation thread
- Track research progress and status
- Handle document versioning

## 3. UI Implementation

### Research Interface
- Clean, conversation-style layout
- Clear distinction between AI and user content
- Easy-to-use input mechanisms
- Progress indicators

### Version History
- Chronological list of interactions
- Visual indicators for interaction types
- Smooth pagination for older records
- Preview of interaction content

## 4. Error Handling
- Validate all user inputs
- Handle API timeouts and failures
- Provide clear error messages
- Support graceful degradation
- Implement retry mechanisms

## 5. Security
- Validate user sessions
- Check application access permissions
- Secure API key handling
- Sanitize all inputs/outputs
- Rate limit API calls

## 6. Performance
- Optimize large document handling
- Implement efficient pagination
- Cache frequent queries
- Monitor API usage
- Handle concurrent sessions

## 7. Testing Requirements
- Unit tests for core functionality
- Integration tests for API calls
- UI component testing
- Error handling verification
- Performance benchmarking

## Implementation Notes
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error boundaries
- Use shared utilities where possible
- Document all major components

## Limitations
- Maximum session duration: 60 minutes
- API rate limits per OpenAI quotas
- Maximum document size: 100MB
- Concurrent session limit: 5
- Maximum interactions per session: 50