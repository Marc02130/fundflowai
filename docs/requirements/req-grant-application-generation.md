# Grant Application Generation Requirements

## 1. Grant Application Creation Flow

### Multi-step Wizard
1. Organization & Opportunity Selection
   - Display organization dropdown (NIH, NSF)
   - Show searchable list of opportunities filtered by organization
   - Search by title and announcement number
   - Validate opportunity selection before proceeding

2. Grant Type & Basic Info
   - Display grant types filtered by selected organization
   - Required fields:
     - Title (will display in unsubmitted applications accordion)
     - Description
     - Grant Type
   - Optional field:
     - Resubmission checkbox
   - Validate required fields before proceeding

3. Optional Sections Selection
   - Display only optional sections for selection
   - Required sections are automatically included (not shown in selection)
   - Validate selection before proceeding

### Data Storage
- Create grant_applications record with:
  - Title
  - Description
  - Selected opportunity
  - Grant type
  - Resubmission status
  - Status: "in-progress"
- Create grant_application_sections records for:
  - All required sections
  - User-selected optional sections

## 2. Grant Application View

### Document Management
- File Upload Requirements:
  - Size limit: 10MB per file
  - Allowed file types: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv, json, xml, png, jpg, jpeg, tif, tiff, svg
  - Display warning when 5 or more files are uploaded
  - Show recommendation to attach files to specific sections

- Upload Interface:
  - List of uploaded files with:
    - File name
    - File type
    - File size
    - Remove button
  - Upload progress indicator
  - Error messages for invalid files

### Generate Grant Button
- Prerequisites:
  - Description must be entered
  - At least one document must be uploaded
- Display loading/progress indicator during generation
- Disable button if prerequisites not met

## 3. Error Handling

### Validation
- Validate required fields at each wizard step:
  - Organization
  - Opportunity
  - Title
  - Grant Type
- Show clear error messages for validation failures
- Prevent proceeding until errors are resolved

### Network Errors
- Implement retry mechanism for failed operations
- Display user-friendly error notifications
- Provide retry options where applicable

## 4. Performance Considerations

### Database
- Index foreign keys for quick lookups
- Optimize queries for opportunity and grant type filtering

### UI Performance
- Implement pagination for long lists
- Use proper loading states
- Handle large file uploads efficiently

## 5. Future Enhancements (Post-MVP)
- Auto-save functionality
- Section content management
- Grant application section fields
- AI content editing features