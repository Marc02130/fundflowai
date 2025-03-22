# Requirements for the Deep Research Feature

## Overview
The Deep Research feature provides an interactive AI-powered research process for grant applications. It includes a conversation-style interface, version history tracking, and final report generation. It depends on previously created AI assistants and vector stores.

## 1. User Requirements

### Initiate Deep Research
- Users can begin research from the grant application view via "Deep Research" button
- **Button States**:  
  - **Disabled** when:
    - Grant application description is empty/null
    - No document vectors present
    - `deep_research.md` already exists
  - **Enabled** when description and document vectors exist, no `deep_research.md`
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
- Shows chronological list of AI interactions by creation date (most recent first)
- Each entry shows:
  - Interaction type (AI Output, User Response, AI Response)
  - Creation timestamp
- Clicking an entry:
  - Loads the specific record in the textarea
  - For AI outputs:
    - Shows parsed message content from JSON
    - Allows editing if no report has been generated
  - For user responses and AI responses:
    - Shows raw content
    - Read-only view

### Final Report Generation
- "Generate Final Report" button in research window
- Triggers the `deep-research-report` edge function
- Creates comprehensive `deep_research.md`
- Includes all research findings without additional questions
- Automatically attaches to grant application

### Edge Functions

#### deep-research
- Handles interactive research flow:
  - Uses pre-created assistants from create-grant-assistant
  - Uses pre-created vector store from vectorize-worker
  - Creates thread if needed
  - Manages Q&A interactions
  - Handles research state
- Endpoints:
  - `POST /deep-research`
    - `initialize: true` - Start new research
    - `application_id` - Required for all operations
    - `context` - Required for initialization
    - Body contains user responses for Q&A

#### deep-research-report
- Handles final report generation:
  - `POST /deep-research-report`
    - `application_id` - Required
- Processing:
  1. Fetches all interactions in chronological order
  2. Analyzes interaction history
  3. Generates structured markdown report
  4. Updates application status
- Report Structure:
  ```markdown
  # Deep Research Report
  
  ## Executive Summary
  - Key findings and recommendations
  
  ## Research Process
  - Timeline of interactions
  - Major insights discovered
  
  ## Detailed Analysis
  - Methodology review
  - Technical approach evaluation
  - Resource assessment
  
  ## Recommendations
  - Specific improvements
  - Action items
  
  ## Supporting Evidence
  - Key responses and insights
  ```
- Updates:
  - Sets `has_generated_report = true` in `grant_application_deep_research`
  - Creates `deep_research.md` in application documents
  - Updates `research_status = 'completed'` in `grant_applications`

## 2. Technical Requirements

### Database Structure
```sql
CREATE TABLE grant_application_deep_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_application_id UUID NOT NULL REFERENCES grant_applications(id) ON DELETE CASCADE,
  content text NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('ai_output', 'user_response', 'ai_response')),
  has_generated_report boolean DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Interaction Types
- **ai_output**: Initial AI message or follow-up questions
- **user_response**: User's answers to AI questions, stored as raw text
- **ai_response**: AI's response to user input

### System Dependencies
- **create-grant-assistant**: Creates the research assistant during application creation
- **vectorize-worker**: Creates vector store and processes documents for semantic search
- **openai_assistant**: Shared module providing OpenAI client and helper functions

### OpenAI Integration
- Use existing OpenAI Assistant created during application creation
- Use gpt-4o model via OPENAI_DEEP_MODEL environment variable
- Leverage existing vector store populated by vectorize-worker
- Create thread if needed, otherwise reuse existing thread

### Processing Flow
1. **Initial Load Check**:
   - Verify existence of research assistant and vector store
   - If research assistant or vector store missing, return appropriate error
   - If no thread exists:
     - Create new Thread
     - Update application with thread ID
   - If thread exists:
     - Reuse existing thread

2. **Research Initiation**:
   - Use existing Research Assistant:
     - Model: gpt-4o (from OPENAI_DEEP_MODEL env var)
     - Already configured with appropriate vector store
   - Thread Management:
     - Create or reuse thread
     - Store thread_id with application
     - Maintain thread context across sessions

3. **Research Scope**:
   - Initial Context:
     - `grant_applications.description`: Starting point for research
     - Already processed document vectors in the vector store
   - Extended Research:
     - Use assistant's file_search capability to search documents
     - Generate targeted questions for deeper exploration

4. **Interactive Research**:
   - AI analyzes available documents via vector store
   - Presents findings and insights
   - Asks clarifying questions
   - Synthesizes user responses with research
   - Explores new research directions
   - Continue until research is comprehensive

5. **Final Report**:
   - Compile all interactions
   - Generate comprehensive summary
   - Create and store `deep_research.md`
   - Mark interactions as having generated report
   - Update application research status to 'completed'

### Data Management
- Store all interactions in `grant_application_deep_research`
- Track research progress and status
- Handle document versioning
- Maintain OpenAI thread context between sessions

### Additional Database Fields Used
```sql
-- These fields should already exist in grant_applications
-- Added by various system components
openai_thread_id TEXT,
research_assistant_id TEXT,
research_status TEXT CHECK (research_status IN ('not_started', 'in_progress', 'completed')),
deep_research_prompt TEXT,
vector_store_id TEXT
vector_store_expires_at TIMESTAMPTZ
```

## 3. UI Implementation

### Research Interface
- Clean, conversation-style layout
- Clear distinction between AI and user content
- Easy-to-use input mechanisms
- Progress indicators
- Disable/enable logic for document prerequisites

### Version History
- Chronological list of interactions
- Visual indicators for interaction types
- Smooth pagination for older records
- Preview of interaction content

## 4. Error Handling
- Validate all user inputs
- Handle API timeouts and failures
- Provide clear error messages when dependencies are missing:
  - Research assistant not found
  - Vector store not found
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
- Verify dependency validation:
  - Test behavior when assistant is missing
  - Test behavior when vector store is missing

## Implementation Notes
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error boundaries
- Use shared utilities from openai_assistant module
- Document all major components
- Respect separation of concerns:
  - vectorize-worker: document processing
  - create-grant-assistant: assistant creation
  - deep-research: research interaction
  - deep-research-report: report generation

## Limitations
- Maximum session duration: 60 minutes
- API rate limits per OpenAI quotas
- Maximum document size: 100MB
- Concurrent session limit: 5
- Maximum interactions per session: 50