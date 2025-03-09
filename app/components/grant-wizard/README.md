# Grant Wizard Components

## Overview
The Grant Wizard provides a step-by-step interface for creating grant applications. It guides users through selecting grant types, providing basic information, choosing optional sections, and managing application content.

## Component Structure

### WizardContainer.tsx
Core container managing wizard state and step progression.
- Handles step navigation
- Maintains form state
- Provides step validation
- Manages wizard completion

### GrantTypeBasicInfoStep.tsx
Initial step for basic grant application setup.
- Grant type selection
- Title input
- Description fields
- Amount requested
- Resubmission status

### OrganizationOpportunityStep.tsx
Organization and opportunity selection step.
- Organization selection
- Grant opportunity browsing
- Opportunity details display
- Deadline management

### OptionalSectionsStep.tsx
Configuration of optional grant sections.
- Section selection interface
- Required vs optional sections
- Section ordering
- Section dependencies

### SectionEditor.tsx
Rich editor for grant section content.
- AI-assisted content generation
- Rich text editing
- Document attachments
- Version history
- Real-time collaboration

## State Management

### Form Data
- Persistent form state across steps
- Validation per step
- Error handling
- Progress tracking

### Navigation
- Forward/backward movement
- Step completion tracking
- Conditional step access
- Progress persistence

### Validation Rules
- Required fields per step
- Cross-step dependencies
- Data format validation
- Deadline constraints

## Data Flow

### Step Progression
1. Grant Type & Basic Info
2. Organization & Opportunity
3. Optional Sections
4. Section Content Editing

### Data Persistence
- Automatic saving
- Draft state management
- Progress recovery
- Error recovery

## UI/UX Guidelines

### Layout
- Consistent step layout
- Clear navigation
- Progress indication
- Error feedback

### Interactions
- Smooth transitions
- Immediate feedback
- Loading states
- Error states

### Accessibility
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management

## Integration Points

### Database
- Grant type data
- Organization data
- Application storage
- Section content

### AI Services
- Content generation
- Content refinement
- Section suggestions
- Quality checks

### File Storage
- Document uploads
- Attachment management
- File validation
- Storage quotas

## Error Handling

### Validation Errors
- Field-level validation
- Step-level validation
- Cross-step validation
- Data consistency

### System Errors
- Network failures
- Service unavailability
- Data corruption
- Recovery procedures

### User Feedback
- Clear error messages
- Recovery suggestions
- Progress preservation
- Support contact

## Performance

### Optimization
- Lazy loading
- State management
- Resource caching
- Network efficiency

### Monitoring
- Load times
- Error rates
- Completion rates
- User friction points

## Security

### Data Protection
- Input sanitization
- Access control
- Data validation
- Session management

### File Safety
- Upload validation
- Virus scanning
- Size limits
- Format restrictions 