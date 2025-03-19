# Deep Research Requirements

## User Requirements

- Users can initiate deep research from the grant application view
- Deep research button is disabled when:
  - Application description is empty or null
  - No attachments are present
  - A deep_research.md file already exists
- Progress feedback is shown on the button during research generation
- Research output is attached as deep_research.md to the grant application

## Technical Requirements

### API Integration
https://platform.openai.com/docs/assistants/deep-dive#overview
https://platform.openai.com/docs/api-reference/assistants
- Use OpenAI's Assistants API with model specified by OPENAI_DEEP_MODEL environment variable
- Create a specialized research assistant with:
  1. Instructions for grant-focused research and APA citation requirements
  2. Code interpreter and retrieval tools enabled
  3. File handling capabilities for processing attachments
- Research process:
  1. Create a Thread when deep research is initiated
  2. Upload grant description and attachments as Thread Files
  3. Create a Message with research instructions
  4. Run the Assistant on the Thread
  5. Poll for completion using the Run status
  6. Retrieve the research output from the Thread Messages
- Store both assistant_id and thread_id in the database for traceability
- Track the model version used in grant_applications.deep_research_model

### Progress States
1. Creating Research Thread
2. Processing Documents
3. Generating Research
4. Retrieving Results
5. Saving Report

### Storage and Output
- Output Format: Markdown file (deep_research.md)
- Storage Location: Stored with other grant attachments
- No separate database table needed
- Store generated prompt in grant_applications.deep_research_prompt field
- Store model version in grant_applications.deep_research_model field

### Research Scope
- Research based solely on application description and attachments
- Grant and organization requirements not included in research context
- Citations must follow APA format
- Source metadata included in deep_research.md file
- Source validation performed by grant writer

### Performance and Error Handling
- Only one research request allowed at a time (cost consideration)
- No caching of results
- No cancellation functionality
- Progress feedback displayed on button during generation
- Edge function timeout handling to be determined after testing

### UI Integration
- Deep Research button in grant application view
- Button states:
  - Enabled: When description exists and has attachments
  - Disabled: When deep_research.md exists or missing requirements
  - Loading: Shows "Researching..." during generation
- Error messages displayed through existing error handling UI

### Model Updates
- Model version controlled via OPENAI_DEEP_MODEL environment variable
- No rerunning of research for model updates
- No tracking of model version per research output

## Implementation Notes

1. File Naming
   - Research output saved as deep_research.md
   - File name used as identifier (no document_type column needed)

2. Button State Logic
```typescript
const canDeepResearch = hasDescription && hasAttachments && 
                       !attachments.some(a => a.name === 'deep_research.md');
```

3. Progress Tracking
```typescript
enum ResearchState {
  GENERATING_PROMPT = 'Generating prompt...',
  RESEARCHING = 'Researching...',
  SAVING = 'Saving report...'
}
```

4. Error Scenarios
   - Missing description or attachments
   - API rate limits (to be tested)
   - Edge function timeout (to be tested)
   - Storage failures
   - Invalid research output

5. Security Considerations
   - Use existing file storage permissions
   - Validate user session before research
   - Rate limiting based on OpenAI API limits
