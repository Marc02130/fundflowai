import { EdgeFunctionError, ERROR_CODES } from './errors';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

export async function validateUserSession(authHeader: string): Promise<string> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (error) {
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, `Invalid session: ${error.message}`);
    }
    
    if (!user) {
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'No user found in session');
    }
    
    return user.id;
  } catch (error) {
    console.error('Session validation error:', error);
    throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Failed to validate user session');
  }
}

export async function validateUserAccess(userId: string, applicationId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('grant_applications')
      .select('id')
      .eq('id', applicationId)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to check access: ${error.message}`);
    }
    
    return !!data;
  } catch (error) {
    console.error('Access validation error:', error);
    throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Failed to validate user access');
  }
} 