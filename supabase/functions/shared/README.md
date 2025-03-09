# Shared Functions Directory

This directory contains shared utilities and modules used across Edge Functions in the Fund Flow AI application.

## Files Overview

### `openai.ts`
Handles OpenAI API integration for text generation and refinement.

- **Key Functions:**
  - `generateText`: Generates text using GPT models with expert grant writing context. Uses a specialized system prompt to ensure high-quality grant writing style and academic tone.
  - `refineText`: Refines existing text through multiple stages (spelling, logic, requirements). Each stage uses specialized prompts to incrementally improve content quality while maintaining original meaning.
- **Usage:**
  ```typescript
  import { generateText, refineText } from '../shared/openai.ts';
  
  // Generate new text
  const text = await generateText(prompt, 'gpt-4');
  
  // Refine existing text
  const refined = await refineText(text, 'spelling', instructions);
  ```

### `errors.ts`
Provides standardized error handling across Edge Functions.

- **Key Components:**
  - `EdgeFunctionError`: Custom error class with code and status. Extends the base Error class to add API-specific fields for better error reporting.
  - `ERROR_CODES`: Standard error codes (auth, input, db, etc.). Provides a centralized enum of all possible error types for consistent error categorization.
  - `handleError`: Converts errors to standardized responses. Ensures all errors are returned in a consistent format with proper HTTP status codes and headers.
- **Usage:**
  ```typescript
  import { EdgeFunctionError, ERROR_CODES } from '../shared/errors.ts';
  
  throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Invalid session');
  ```

### `auth.ts`
Handles authentication and access validation.

- **Key Functions:**
  - `validateUserSession`: Validates user session tokens. Verifies JWT tokens against Supabase auth and ensures the session is active and valid.
  - `validateUserAccess`: Checks user access to grant applications. Implements row-level security by verifying the user has proper permissions for the requested grant.
- **Usage:**
  ```typescript
  import { validateUserSession, validateUserAccess } from '../shared/auth.ts';
  
  const userId = await validateUserSession(authHeader);
  const hasAccess = await validateUserAccess(userId, grantId);
  ```

### `db.ts`
Provides database utilities and standardized Supabase client.

- **Key Functions:**
  - `executeQuery`: Executes database queries with error handling. Provides a type-safe wrapper around Supabase queries with standardized error handling and response formatting.
  - `executeMutation`: Executes database mutations with error handling. Handles create, update, and delete operations with proper error handling and type safety.
  - `supabase`: Global Supabase client instance. Pre-configured with environment variables and proper timeout settings for consistent database access.
- **Usage:**
  ```typescript
  import { executeQuery, executeMutation } from '../shared/db.ts';
  
  const result = await executeQuery('table_name', [{ column: 'value' }]);
  ```

## Error Handling

All modules use standardized error handling through `EdgeFunctionError`. Errors include:
- Error codes for categorization
- HTTP status codes
- Optional additional details
- Standardized error response format

## Best Practices

1. Always use `EdgeFunctionError` for error handling
2. Use the shared Supabase client from `db.ts`
3. Validate user sessions and access using `auth.ts`
4. Use appropriate error codes from `ERROR_CODES`

## Environment Variables

Required environment variables:
- `OPENAI_API_KEY`: OpenAI API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key 