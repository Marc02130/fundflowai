import { createClient } from '@supabase/supabase-js';
import { EdgeFunctionError, ERROR_CODES } from './errors.ts';

export interface DatabaseError extends Error {
  code: string;
  details?: Record<string, any>;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: DatabaseError | null;
}

export async function executeQuery<T>(
  table: string,
  params: Record<string, any>[] = []
): Promise<SupabaseResponse<T[]>> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .match(params[0]);

    if (error) throw error;
    return { data: data as T[], error: null };
  } catch (error) {
    throw new EdgeFunctionError(
      ERROR_CODES.DB_ERROR,
      'Failed to execute query',
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
}

export async function executeMutation<T>(
  table: string,
  params: Record<string, any>[] = []
): Promise<SupabaseResponse<T>> {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert(params[0])
      .select()
      .single();

    if (error) throw error;
    return { data: data as T, error: null };
  } catch (error) {
    throw new EdgeFunctionError(
      ERROR_CODES.DB_ERROR,
      'Failed to execute mutation',
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
}

// Use global mock client if available (for testing), otherwise create real client
// @ts-ignore
export const supabase = globalThis.supabase || (() => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  return createClient(supabaseUrl, supabaseAnonKey);
})(); 