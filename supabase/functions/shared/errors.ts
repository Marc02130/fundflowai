/**
 * Error handling module for Edge Functions.
 * @module errors
 */

/**
 * Standard error response format.
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Custom error class for Edge Function errors.
 */
export class EdgeFunctionError extends Error {
  /**
   * Creates a new EdgeFunctionError.
   * @param {string} code - Error code from ERROR_CODES
   * @param {string} message - Error message
   * @param {Record<string, any>} [details] - Additional error details
   * @param {number} [statusCode=400] - HTTP status code
   */
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
  }
}

/**
 * Standard error codes used across Edge Functions.
 */
export const ERROR_CODES = {
  AUTH_ERROR: 'auth/error',
  INVALID_INPUT: 'input/invalid',
  NOT_FOUND: 'resource/not-found',
  AI_ERROR: 'ai/error',
  DB_ERROR: 'database/error',
  NO_PROMPT: 'prompt/not-found',
  API_ERROR: 'api/error'
} as const;

/**
 * Handles errors and converts them to standardized responses.
 * @param {unknown} error - The error to handle
 * @param {object} [options] - Additional options
 * @param {Record<string, string>} [options.headers] - Additional response headers
 * @returns {Response} Standardized error response
 */
export function handleError(error: unknown, options?: { headers?: Record<string, string> }): Response {
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {})
  };

  if (error instanceof EdgeFunctionError) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    }), {
      status: error.statusCode,
      headers
    });
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: {
      code: ERROR_CODES.API_ERROR,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      details: {}
    }
  }), {
    status: 400,
    headers
  });
} 