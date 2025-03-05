# Grant Application Section Workflow

1. Page Initialization

Trigger: The workflow begins when a grant writer clicks "edit" on a specific section from the grant application view page.
Data Fetching:
Retrieve the record from the grant_application_section table using the section's id.
Fetch related data from the grant_application_section_fields table (e.g., user inputs, AI outputs) for display.
Retrieve section-specific metadata (e.g., prompts, instructions) from the grant_sections table.
2. Display Elements

Always Displayed:
Editable user_instructions from grant_application_section_fields.
Editable is_completed (boolean) from grant_application_section, displayed as a checkbox.
Read-only instructions from grant_sections.
Conditionally Displayed (if ai_generator_prompt exists in grant_sections):
Editable user_comments_on_ai_output from grant_application_section_fields.
Read-only ai_output from grant_application_section_fields.
Checkboxes for AI functions:
Generate AI text (uses ai_generator_prompt).
AI editor (uses ai_editor_prompt).
AI error check (uses ai_error_prompt).
AI requirement check (uses ai_requirements_prompt).
AI visualization (uses ai_visualizations_prompt).
History Panel:
Show a list of previous versions from grant_application_section_fields, ordered by created_at and formatted as YYYYMMDD HH:MM:SS.
Clicking a timestamp loads that version's data into the page for review.
3. Page Layout

Two-Column Design (default when ai_generator_prompt exists):
Left Column:
Editable fields: user_instructions, user_comments_on_ai_output (if applicable).
is_completed checkbox.
AI function checkboxes (if applicable).
Right Column:
Editable ai_output (with rich text formatting).
Collapsible history panel showing latest 10 versions.
Single-Column Fallback:
Full width layout when ai_generator_prompt is null.
History panel remains on right side, collapsible.
MVP Scope:
Web-only implementation.
No mobile-specific optimizations.
Minimum supported width: 1024px.
4. User Interactions

Editing:
Users can modify user_instructions, user_comments_on_ai_output (if displayed), and toggle is_completed.
No auto-save functionality.
No character limits on input fields.

AI Processing:
Multiple AI functions can be selected and processed simultaneously.
Processing handled by edge functions.
Automatic saving of AI outputs when generated.
Fail-fast approach: if any AI function fails, halt processing.
Error messages include description and potential resolution steps.

Navigation:
Users can freely navigate between sections regardless of completion status.
"Next" button always enabled, allowing section skipping.
No warnings when leaving incomplete sections.
Access to any section available from main application view.

5. Data Management
Versioning:
Each "Save" or "Send to AI" action creates a new record in grant_application_section_fields.
Loading a historical version automatically saves current state first.
Display latest 10 versions in history panel.
"Load More" option for viewing older versions.
No distinction between AI-generated and user-edited versions.
No diff view between versions.
Version restoration through timestamp-based loading.

Storage Format:
AI output stored with rich text formatting.
All other fields stored as plain text.
No field size limitations.
Each record maintains full content (not just changes).

Record Creation Triggers:
Manual save action.
AI content generation.
Loading historical version (saves current first).

6. Error Handling
Network Issues:
Display error notification with retry option.
Preserve user input during retry attempts.
Clear error messaging with action items.

AI Processing Issues:
Timeout handling for long-running AI operations (implementation TBD).
Error details provided for failed AI operations.
Option to retry failed AI operations.

Browser Events:
Allow edge functions to complete if browser closes/refreshes.
No auto-save on browser events.
Local storage used for current session state.

7. Version History Panel
Display:
Collapsible panel on right side.
Shows latest 10 versions by default.
Load More button for older versions.
Each version shows timestamp in YYYYMMDD HH:MM:SS format.
Clickable timestamps load historical versions.

Version Loading:
Automatically save current state before loading historical version.
No warning when loading different version.
No comparison/diff view between versions.
Immediate display of loaded version content.

8. Validation
Completion Status:
Sections can be marked complete regardless of content.
No validation warnings for incomplete fields.
No validation warnings when marking section complete.

Content Guidelines:
Validation rules provided via linked prompts.
No enforced content validation for MVP.
No character limits on input fields.

Summary
The Grant Application Workflow enables grant writers to edit sections of a grant application efficiently, with optional AI assistance where configured. The system supports a dynamic layout that adapts to the section's configuration (via grant_sections), maintains a version history for auditing, and ensures data integrity through structured saving and validation processes. The provided table structure for grant_application_section aligns with these requirements, supporting key fields like is_completed, flow_order, and relationships to other tables.