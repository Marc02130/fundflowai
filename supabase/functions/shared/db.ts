/**
 * Database utilities module for Edge Functions.
 * @module db
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { EdgeFunctionError, ERROR_CODES } from './errors.ts';

/**
 * Database error interface.
 */
export interface DatabaseError extends Error {
  code: string;
  details?: Record<string, any>;
}

/**
 * Standard Supabase response format.
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: DatabaseError | null;
}

/**
 * Executes a database query with error handling.
 * @param {string} table - Table name to query
 * @param {Record<string, any>[]} [params=[]] - Query parameters
 * @returns {Promise<SupabaseResponse<T[]>>} Query results
 * @throws {EdgeFunctionError} If query fails
 */
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

/**
 * Executes a database mutation with error handling.
 * @param {string} table - Table name to mutate
 * @param {Record<string, any>[]} [params=[]] - Mutation parameters
 * @returns {Promise<SupabaseResponse<T>>} Mutation result
 * @throws {EdgeFunctionError} If mutation fails
 */
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

/**
 * Global Supabase client instance.
 * Uses mock client in test environment, real client in production.
 */
// @ts-ignore
export const supabase = globalThis.supabase || (() => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  return createClient(supabaseUrl, supabaseAnonKey);
})(); 