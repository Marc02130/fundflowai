# Grant Sections

## Overview
Grant sections are modular components of a grant application that allow users to organize and manage different parts of their grant submission. Each section provides specific functionality for content creation, AI assistance, and document management.

## Section Structure

### Core Components
1. Section Metadata
- ID
- Grant Application ID
- Grant Section ID
- Completion Status
- Flow Order
- Creation/Update Timestamps

2. Section Content
- User Instructions
- AI Generator Prompt (optional)
- AI Visualizations Prompt (optional)
- Content History

### Features

#### Rich Text Editor
- Full-featured content editor
- Content versioning
- Manual edit review capability
- AI-assisted content generation

#### AI Integration
1. Generator Functions
   - Default section prompts
   - Custom user prompts
   - Prompt management (add/edit/delete)
   - AI output review and modification

2. Visualization Support
   - AI-powered visualization generation
   - Visual content integration

#### Document Management
- File attachments support
- Multiple file type handling
- Document operations:
  - Upload
  - Download
  - Delete
- Storage integration with Supabase

#### Version Control
- Automatic version history
- Version comparison
- Restore previous versions
- Timestamp tracking

## User Interface

### Layout
1. Left Column
   - Section instructions
   - User input fields
   - AI function controls
   - Document management

2. Center Column
   - Rich text editor
   - Content display
   - Edit review controls

3. Right Column
   - Version history
   - Collapsible sidebar

### Controls
1. Main Actions
   - Save & Close
   - Save & Complete
   - Prompt AI
   - Create Visuals

2. AI Functions
   - Prompt selection
   - Custom prompt creation
   - Prompt editing

3. Document Controls
   - Upload attachments
   - Download files
   - Delete attachments

## Data Model

### Tables
1. `grant_application_section`
   - Primary section metadata
   - Completion status
   - Flow order

2. `grant_application_section_fields`
   - Content versions
   - User instructions
   - AI output
   - User comments

3. `grant_application_section_documents`
   - Document metadata
   - File paths
   - Creation timestamps

4. `user_ai_prompts`
   - Custom prompt definitions
   - Prompt metadata
   - Active status

## State Management
- Section data loading
- Content synchronization
- File upload status
- AI processing state
- Modal controls
- Version history display

## Error Handling
- Section loading errors
- Save operation failures
- File operation errors
- AI processing errors
- Version control issues

## Security
- User authentication required
- Document access control
- AI prompt ownership
- Version history protection

## Performance Considerations
- Lazy loading of version history
- Efficient file handling
- Optimized AI processing
- Responsive UI updates
