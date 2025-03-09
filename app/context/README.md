# Application Context

## Overview
This directory contains React Context providers that manage global application state. Each context is focused on a specific domain of functionality.

## Contexts

### AuthContext
Manages authentication state and user session data.

**Features:**
- User authentication state
- Session management
- Profile data
- Authentication methods
  - Email/password sign in
  - Email/password sign up
  - Sign out
  - Session persistence

**Usage:**
```tsx
import { useAuth } from '~/context/AuthContext';

function MyComponent() {
  const { user, profile, signIn, signOut } = useAuth();
  // ...
}
```

**Provider Setup:**
```tsx
import { AuthProvider } from '~/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* App components */}
    </AuthProvider>
  );
}
```

## State Management

### Data Flow
1. Context providers wrap the application
2. Components access context via hooks
3. State updates trigger re-renders
4. Changes persist as needed

### Best Practices
1. **Context Usage**
   - Use contexts for truly global state
   - Keep context data minimal
   - Split contexts by domain

2. **Performance**
   - Memoize expensive computations
   - Split contexts to minimize re-renders
   - Use context selectors when possible

3. **Type Safety**
   - Define clear interfaces
   - Use TypeScript for type checking
   - Document expected types

4. **Error Handling**
   - Provide error states
   - Handle edge cases
   - Graceful degradation

## Security
- Secure session management
- Protected route access
- Data access control
- Input validation

## Testing
- Provider unit tests
- Integration testing
- Mock context for components
- Error case validation 