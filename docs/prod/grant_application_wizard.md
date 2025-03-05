# Grant Application Creation Process

## Overview
The grant application creation process is a multi-step wizard that guides users through creating a new grant application, selecting optional sections, and managing attachments.

## Wizard Steps

### 1. Organization & Opportunity Selection
- User selects an organization from available grant funders
- User can search for grant opportunities within the selected organization
- Search requires minimum 3 characters
- Opportunities are filtered in real-time based on search term
- Each opportunity displays:
  - Title
  - Announcement number
  - Expiration date
- Selected opportunity's grant_id is stored for later use

### 2. Grant Type & Basic Info
- User selects a grant type specific to the organization
- User enters:
  - Application title
  - Description
  - Amount requested (formatted as USD)
  - Resubmission flag (boolean)
- Grant type selection shows associated description
- All fields except amount requested are required

### 3. Optional Sections Selection
- Displays available optional sections for the grant
- Required sections are automatically included (not shown in selection)
- User can select which optional sections to include
- Sections are ordered by flow_order
- Selected sections will be included in the final application

## Application Creation
Upon wizard completion:
1. Creates grant_application record with:
   - user_profiles_id
   - title
   - description
   - status ('in-progress')
   - grant_type_id
   - resubmission flag
   - grant_opportunity_id
   - amount_requested

2. Creates grant_application_section records for:
   - All required sections
   - Selected optional sections
   - Preserves flow_order from grant_sections

## Application View

### Header Information
- Title
- Creation date
- Last updated date
- Status
- Resubmission status
- Amount requested

### Action Buttons
1. Generate Grant (disabled until requirements met):
   - Requires description
   - Requires at least one attachment
   - Shows tooltip explaining requirements when disabled

2. Add Attachments:
   - Supports multiple file upload
   - Accepts .pdf, .doc, .docx, .txt
   - Shows upload progress
   - Files stored in Supabase Storage under grant-attachments bucket
   - Enforces RLS policies for file access

### Sections List
- Displays all application sections in flow_order
- Shows completion status for each section
- Provides edit button for each section

### Attachments List
- Lists all uploaded files with:
  - File name
  - File size
  - Upload timestamp
- Allows file deletion
- Shows "No attachments yet" when empty

## Security
### Storage Policies
- Users can only:
  - Upload to their own application folders
  - View files in their own application folders
  - Delete files from their own application folders
- Paths follow pattern: {application_id}/{file_id}-{filename}

## State Management
- Wizard state persisted in localStorage
- Application data saved to database on completion
- File metadata tracked in component state