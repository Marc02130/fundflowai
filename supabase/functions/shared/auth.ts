/**
 * Authentication module for Edge Functions.
 * @module auth
 */

import { EdgeFunctionError, ERROR_CODES } from './errors.ts';
import { supabase as defaultSupabase } from './db.ts';

/**
 * Authentication error interface.
 */
export interface AuthError extends Error {
  code: string;
  details?: Record<string, any>;
}

/**
 * Validates a user session token.
 * @param {string} authHeader - Authorization header containing the session token
 * @param {any} [supabaseClient=defaultSupabase] - Supabase client instance
 * @returns {Promise<string>} User ID from the validated session
 * @throws {EdgeFunctionError} If session is invalid or expired
 */
export async function validateUserSession(
  authHeader: string,
  supabaseClient = defaultSupabase
): Promise<string> {
  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      throw new EdgeFunctionError(
        ERROR_CODES.AUTH_ERROR,
        'Invalid or expired session'
      );
    }

    return user.id;
  } catch (error) {
    if (error instanceof EdgeFunctionError) {
      throw error;
    }
    throw new EdgeFunctionError(
      ERROR_CODES.AUTH_ERROR,
      'Failed to validate user session',
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
}

/**
 * Validates a user's access to a grant application.
 * @param {string} userId - User ID to validate
 * @param {string} grantApplicationId - Grant application ID to check access for
 * @param {any} [supabaseClient=defaultSupabase] - Supabase client instance
 * @returns {Promise<boolean>} Whether the user has access
 * @throws {EdgeFunctionError} If validation fails
 */
export async function validateUserAccess(
  userId: string,
  grantApplicationId: string,
  supabaseClient = defaultSupabase
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('grant_applications')
      .select('id')
      .eq('id', grantApplicationId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw error;
    }
    return !!data;
  } catch (error) {
    throw new EdgeFunctionError(
      ERROR_CODES.AUTH_ERROR,
      'Failed to validate user access',
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
} 