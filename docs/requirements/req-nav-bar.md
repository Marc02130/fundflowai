# Navigation Bar Requirements

## Overview
The navigation bar provides the main navigation structure for the application, displaying key sections and unsubmitted applications.

## User Requirements

### Layout and Structure
- Navigation bar should be positioned on the left side of the application
- All items should have consistent styling and spacing
- Navigation items should be clearly readable with sufficient contrast

### Navigation Items
1. Primary Navigation
   - Home: Links to dashboard home
   - New: Links to new application creation
   - Submitted: Links to submitted applications view

2. Dynamic Sections
   - Unsubmitted Applications
     - Displays as an expandable accordion
     - Shows all applications with status "in-progress"
     - Each application entry shows the application title
     - Clicking an application navigates to its edit view
     - Title is not editable from the navigation bar
     - Applications appear as soon as they are created with "in-progress" status

3. User Section
   - Profile: Links to user profile
   - Sign Out: Triggers sign out action

## Technical Requirements

### State Management
- Navigation state should persist across page refreshes
- Accordion expand/collapse state should be maintained during session
- Active route should be visually indicated

### Data Requirements
- Unsubmitted applications should be fetched from the database
- Query should filter for:
  - status = 'in-progress'
  - current user's applications only
- Real-time updates when new applications are created or status changes

### Styling
- All navigation items should use consistent padding and spacing
- Hover states should be clearly visible
- Active route should be visually distinct
- Accordion expansion indicator should clearly show state

### Performance
- Unsubmitted applications list should be paginated if exceeds 20 items
- Navigation bar should not cause layout shifts when loading data

### Accessibility
- All navigation items must be keyboard accessible
- Proper ARIA labels for accordion and interactive elements
- Focus states must be visible
- Proper heading structure for navigation sections

## Implementation Notes
- Use Next.js Link components for client-side navigation
- Implement real-time updates using Supabase subscriptions
- Maintain consistent styling with application theme
- Ensure mobile responsiveness
