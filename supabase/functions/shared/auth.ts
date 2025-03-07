import { EdgeFunctionError, ERROR_CODES } from './errors.ts';
import { supabase as defaultSupabase } from './db.ts';

export interface AuthError extends Error {
  code: string;
  details?: Record<string, any>;
}

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