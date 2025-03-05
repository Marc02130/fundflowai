# Technical Requirements for User Prompts

1. Default Prompt Display

Requirement: The dropdown for selecting the AI generator prompt must always display the "Default Section Prompt," sourced from the grant_sections table.
Implementation:
- On page load, retrieve the ai_generator_prompt from the grant_sections table for the current section
- If ai_generator_prompt is null or empty string:
  - Do not display the prompt selection dropdown
  - Do not display the Add/Edit buttons
  - Do not display the Prompt AI button
  - Exit implementation (remaining requirements only apply when ai_generator_prompt exists)
- Display this prompt in the dropdown, labeled as "Default Section Prompt"
- This option must always appear in the dropdown and cannot be modified or removed by the user

2. User-Added Prompts

Requirement: Users can create custom prompts, which are stored in the user_ai_prompts table and shown in the dropdown alongside the default prompt.
Implementation:
- Query the user_ai_prompts table to fetch all records where:
  - user_id matches the current logged-in user
  - is_active = true
  - deleted_at is null
- Display these custom prompts in the dropdown, using the name field as the label for each
- Order the dropdown with "Default Section Prompt" listed first, followed by the user's active custom prompts

3. Adding a New Prompt

Requirement: Users can add new custom prompts through a popup interface triggered by an "Add Prompt" button.
Implementation:
- UI Location: Replace existing "AI Functions" section with:
  - Dropdown for prompt selection
  - Small "Add Prompt" button directly next to the dropdown
  - Keep existing "Comments on AI Output" textarea below
- Popup Functionality:
  - Clicking "Add Prompt" opens a modal dialog with:
    - Name: Required text field
    - Description: Optional text field
    - Prompt Text: Required text area (pre-filled with current section's default prompt only when creating new)
    - Active: Checkbox (default: checked)
    - Type: Hidden field (default: 'generator')
- Save Action:
  - Insert new record into user_ai_prompts with:
    - provided name, description, prompt_text
    - user_id of current user
    - is_active status
    - prompt_type = 'generator'
  - If is_active = true, refresh the dropdown to include the new prompt

4. Editing User-Added Prompts

Requirement: Users can edit their custom prompts via an "Edit" button, but the "Default Section Prompt" cannot be edited.
Implementation:
- UI Element: Include an "Edit" button next to the dropdown
- Behavior:
  - Enable the "Edit" button only when a user-added prompt is selected
  - Disable or hide the "Edit" button when "Default Section Prompt" is selected
- Edit Popup:
  - Opens modal with selected prompt's current values
  - Allow modifications to name, description, prompt_text, and is_active status
  - No "Reset to Default" option needed
- Save Action:
  - Update the corresponding record in user_ai_prompts
  - If is_active is set to false, remove from dropdown
  - Support soft-delete via is_active flag

5. Prompt Selection and Usage

Implementation:
- Selected prompt persists only within the current section during the session
- When user navigates away and returns, default to the section's default prompt
- The selected prompt drives the "Prompt AI" button's behavior
- Keep existing "Prompt AI" button styling and position
- Prompts are available across all grant application sections

6. Data Validation and Error Handling

Implementation:
- Validation:
  - Require non-empty name and prompt_text fields
  - Show error messages in the popup for validation failures
- Error Handling:
  - For failed prompt loading:
    - Show error notification
    - Display default prompt in dropdown
    - Provide retry option
  - For failed save/edit:
    - Show error notification
    - Maintain current form state
    - Provide retry option
  - No auto-save required for prompt management

7. UI and UX Considerations

Implementation:
- Maintain existing UI layout and styling
- New dropdown + button replaces only the "AI Functions" checkbox section
- Keep all other existing UI elements and positioning:
  - "Comments on AI Output" textarea
  - "Prompt AI" button
  - Save and Complete actions
  - Version history
  - File attachments
- No keyboard shortcuts required for MVP

8. Database Schema

The implementation will use the existing user_ai_prompts table:
```sql
create table public.user_ai_prompts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  name character varying(255) not null,
  description text null,
  prompt_text text not null,
  prompt_type character varying(50) not null default 'generator',
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  deleted_at timestamp without time zone null,
  constraint user_ai_prompts_pkey primary key (id),
  constraint user_ai_prompts_user_id_fkey foreign key (user_id) references public.user_profiles (id)
)
```