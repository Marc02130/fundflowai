# Application Routes

## Overview
This directory contains all route components for the FundFlow AI application. The routing structure follows a nested pattern, with dashboard routes being the primary feature set.

## Route Structure

### Authentication
- `auth.tsx`: Handles user authentication
  - Login/Signup flows
  - Password reset
  - OAuth integrations
  - Session management

### Public Routes
- `home.tsx`: Landing page
  - Feature showcase
  - Value proposition
  - Call-to-action components

### Dashboard Routes
- `dashboard.tsx`: Main dashboard layout and navigation
  - Sidebar navigation
  - User menu
  - Notifications
  - Common layout elements

#### Dashboard Features
- `dashboard.home.tsx`: Dashboard home view
  - Welcome message
  - Quick actions
  - Recent activity

- `dashboard.new.tsx`: New application creation
  - Application form
  - Grant type selection
  - Section configuration

- `dashboard.applications.tsx`: Applications list
  - Application status
  - Sorting and filtering
  - Bulk actions
  - Search functionality

- `dashboard.applications.$id.tsx`: Single application view
  - Application details
  - Section management
  - Document handling
  - AI generation controls

- `dashboard.applications.$id.sections.$sectionId.tsx`: Section editor
  - Content editing
  - AI-assisted generation
  - Document attachments
  - Version history

- `dashboard.profile.tsx`: User profile management
  - Personal information
  - Preferences
  - Organization settings

## Route Parameters

### Dynamic Parameters
- `$id`: Application ID
- `$sectionId`: Section ID

## Common Features

### Authentication
- Protected routes require valid session
- Role-based access control
- Organization context

### Layout
- Consistent navigation
- Responsive design
- Error boundaries
- Loading states

### Data Management
- Server-side rendering
- Client-side caching
- Optimistic updates
- Real-time sync

## Best Practices

### Code Organization
- Consistent file naming
- Component co-location
- Shared utilities
- Type definitions

### Performance
- Code splitting
- Lazy loading
- Resource optimization
- Cache management

### Security
- Input validation
- CSRF protection
- XSS prevention
- Rate limiting

### Error Handling
- Graceful degradation
- User feedback
- Error logging
- Recovery strategies

## Testing
- Unit tests for components
- Integration tests for flows
- E2E tests for critical paths
- Accessibility testing

## Limitations
- Deep linking restrictions
- Loading state management
- Cache invalidation
- Real-time sync boundaries 