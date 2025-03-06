export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export class EdgeFunctionError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
  }

  toResponse(): Response {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details
      }
    }), {
      status: this.statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const ERROR_CODES = {
  AUTH_ERROR: 'auth/error',
  INVALID_INPUT: 'input/invalid',
  NOT_FOUND: 'resource/not-found',
  AI_ERROR: 'ai/error',
  DB_ERROR: 'database/error',
  NO_PROMPT: 'prompt/not-found',
  API_ERROR: 'api/error'
} as const;

export function handleError(error: unknown): Response {
  if (error instanceof EdgeFunctionError) {
    return error.toResponse();
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
    headers: { 'Content-Type': 'application/json' }
  });
} 