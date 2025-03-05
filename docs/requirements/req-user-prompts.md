Technical Requirements for User Prompts
1. Default Prompt Display

Requirement: The dropdown for selecting the AI generator prompt must always display the "Default Section Prompt," sourced from the grant_sections table.
Implementation:
On page load, retrieve the ai_generator_prompt from the grant_sections table for the current section.
Display this prompt in the dropdown, labeled as "Default Section Prompt".
This option must always appear in the dropdown and cannot be modified or removed by the user.
2. User-Added Prompts

Requirement: Users can create custom prompts, which are stored in the user_ai_prompts table and shown in the dropdown alongside the default prompt.
Implementation:
Query the user_ai_prompts table to fetch all records where:
user_id matches the current logged-in user.
is_active = true.
Display these custom prompts in the dropdown, using the name field as the label for each.
Order the dropdown with "Default Section Prompt" listed first, followed by the user’s active custom prompts.
3. Adding a New Prompt

Requirement: Users can add new custom prompts through a popup interface triggered by an "Add Prompt" button.
Implementation:
UI Element: Include an "Add Prompt" button next to the dropdown.
Popup Functionality:
Clicking the button opens a popup, pre-populated with the ai_generator_prompt from grant_sections as the starting point.
The popup includes:
Name: A required text field for the prompt’s name.
Prompt Text: A required text area for the prompt content (pre-filled with the default prompt).
Active: A checkbox (default: checked) to set is_active = true.
Save Action:
On save, insert a new record into user_ai_prompts with the provided name, prompt_text, user_id, and is_active status.
If is_active = true, refresh the dropdown to include the new prompt.
4. Editing User-Added Prompts

Requirement: Users can edit their custom prompts via an "Edit" button, but the "Default Section Prompt" cannot be edited.
Implementation:
UI Element: Include an "Edit" button next to the dropdown.
Behavior:
Enable the "Edit" button only when a user-added prompt is selected in the dropdown.
Disable or hide the "Edit" button when "Default Section Prompt" is selected.
Edit Popup:
Clicking "Edit" opens a popup pre-filled with the selected prompt’s name and prompt_text from user_ai_prompts.
Allow modifications to the name, prompt_text, and is_active status.
Save Action:
On save, update the corresponding record in user_ai_prompts using the prompt’s id.
If is_active is set to false, remove the prompt from the dropdown after saving.
5. Prompt Selection and Usage

Requirement: The prompt selected in the dropdown is used for AI content generation.
Implementation:
When the user selects a prompt and initiates AI generation (e.g., by clicking "Send to AI"), use the prompt_text of the selected prompt.
If "Default Section Prompt" is selected, use the ai_generator_prompt from grant_sections.
6. Data Validation and Error Handling

Validation:
Require non-empty name and prompt_text fields when adding or editing a prompt.
Show error messages in the popup if validation fails (e.g., "Name is required" or "Prompt text cannot be empty").
User Feedback:
Display a success message after adding or editing a prompt (e.g., "Prompt saved successfully").
Show an error message if the save action fails (e.g., "Failed to save prompt. Please try again").
7. UI and UX Considerations

Dropdown Labeling:
Label the dropdown clearly (e.g., "AI Prompt").
Use "Default Section Prompt" as the label for the default option.
Button States:
Disable the "Edit" button when "Default Section Prompt" is selected.
Keep the "Add Prompt" button always enabled.
Popup Design:
Ensure popups are intuitive, with clear labels (e.g., "Prompt Name", "Prompt Text") and a "Cancel" button to discard changes.
8. Database Interactions

Adding a Prompt:
Insert into user_ai_prompts: user_id, name, prompt_text, is_active, and other default fields (e.g., timestamps).
Editing a Prompt:
Update the record in user_ai_prompts based on the prompt’s id.
Fetching Prompts:
Query user_ai_prompts for the current user’s active prompts (is_active = true).
Combine with the ai_generator_prompt from grant_sections as the non-editable default option.
Summary
The dropdown always includes the non-editable "Default Section Prompt" from grant_sections.
Users can add custom prompts via the "Add Prompt" button, starting with the default prompt as a template.
The "Edit" button allows editing of user-added prompts only, remaining disabled for the default prompt.
The selected prompt drives AI content generation, with active custom prompts stored in user_ai_prompts.