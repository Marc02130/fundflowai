/**
 * Destroy Grant Assistants Edge Function
 * 
 * Cleans up OpenAI resources (assistants and vector store) when a grant application is submitted or cancelled.
 * Implementation of req-assistant-destruction.md
 * @see docs/req/req-assistant-destruction.md
 */

import { createClient } from '@supabase/supabase-js';
import { validateUserSession, validateUserAccess } from 'auth';
import { EdgeFunctionError, ERROR_CODES, handleError } from 'errors';
import { assistantClient, deleteAssistant, deleteVectorStore, deleteThread } from 'openai_assistant';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Request and response interfaces
interface DestroyAssistantsRequest {
  grant_application_id: string;
}

interface DestroyAssistantsResponse {
  success: boolean;
  deleted_assistants: number;
  deleted_threads: number;
  vector_store_deleted: boolean;
  error?: string;
}

interface HandlerContext {
  userId: string;
  body: DestroyAssistantsRequest;
}

/**
 * Main handler function for processing the validated request
 */
async function handleRequest(context: HandlerContext): Promise<Response> {
  const { userId, body } = context;
  console.log('Processing destroy assistants request for user:', userId);

  try {
    const { grant_application_id } = body;
    
    // Validate that the user has access to this grant application
    const hasAccess = await validateUserAccess(userId, grant_application_id);
    if (!hasAccess) {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Grant application not found or access denied');
    }
    
    let deletedAssistants = 0;
    let deletedThreads = 0;
    let vectorStoreDeleted = false;

    // Retrieve assistant IDs, thread IDs, and vector store ID from the database
    const { data: application, error: appError } = await supabase
      .from('grant_applications')
      .select(`
        research_assistant_id,
        writing_assistant_id,
        review_assistant_id,
        vector_store_id,
        openai_thread_id,
        deep_research_thread_id
      `)
      .eq('id', grant_application_id)
      .eq('user_id', userId)
      .single();

    if (appError) {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Grant application not found or access denied');
    }

    console.log('Retrieved application data:', application);

    // Delete research assistant if exists
    if (application.research_assistant_id) {
      try {
        console.log(`Deleting research assistant: ${application.research_assistant_id}`);
        await deleteAssistant(application.research_assistant_id);
        deletedAssistants++;
        console.log('Research assistant deleted successfully');
      } catch (assistantError) {
        console.error('Error deleting research assistant:', assistantError);
        // Continue with other deletions even if this one fails
      }
    }

    // Delete writing assistant if exists
    if (application.writing_assistant_id) {
      try {
        console.log(`Deleting writing assistant: ${application.writing_assistant_id}`);
        await deleteAssistant(application.writing_assistant_id);
        deletedAssistants++;
        console.log('Writing assistant deleted successfully');
      } catch (assistantError) {
        console.error('Error deleting writing assistant:', assistantError);
        // Continue with other deletions even if this one fails
      }
    }

    // Delete review assistant if exists
    if (application.review_assistant_id) {
      try {
        console.log(`Deleting review assistant: ${application.review_assistant_id}`);
        await deleteAssistant(application.review_assistant_id);
        deletedAssistants++;
        console.log('Review assistant deleted successfully');
      } catch (assistantError) {
        console.error('Error deleting review assistant:', assistantError);
        // Continue with other deletions even if this one fails
      }
    }

    // Delete main thread if exists
    if (application.openai_thread_id) {
      try {
        console.log(`Deleting main thread: ${application.openai_thread_id}`);
        await deleteThread(application.openai_thread_id);
        deletedThreads++;
        console.log('Main thread deleted successfully');
      } catch (threadError) {
        console.error('Error deleting main thread:', threadError);
        // Continue with other deletions even if this one fails
      }
    }

    // Delete deep research thread if exists
    if (application.deep_research_thread_id) {
      try {
        console.log(`Deleting deep research thread: ${application.deep_research_thread_id}`);
        await deleteThread(application.deep_research_thread_id);
        deletedThreads++;
        console.log('Deep research thread deleted successfully');
      } catch (threadError) {
        console.error('Error deleting deep research thread:', threadError);
        // Continue with other deletions even if this one fails
      }
    }

    // Delete vector store if exists
    if (application.vector_store_id) {
      try {
        console.log(`Deleting vector store: ${application.vector_store_id}`);
        await deleteVectorStore(application.vector_store_id);
        vectorStoreDeleted = true;
        console.log('Vector store deleted successfully');
      } catch (vectorError) {
        console.error('Error deleting vector store:', vectorError);
        // Continue with database update even if vector store deletion fails
      }
    }

    // Update grant application record to clear all IDs
    const { error: updateError } = await supabase
      .from('grant_applications')
      .update({
        research_assistant_id: null,
        writing_assistant_id: null,
        review_assistant_id: null,
        vector_store_id: null,
        vector_store_expires_at: null,
        openai_thread_id: null,
        deep_research_thread_id: null
      })
      .eq('id', grant_application_id);

    if (updateError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to update grant application');
    }

    return new Response(
      JSON.stringify({
        success: true,
        deleted_assistants: deletedAssistants,
        deleted_threads: deletedThreads,
        vector_store_deleted: vectorStoreDeleted
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in destroy-grant-assistants:', error);
    return handleError(error, { headers: corsHeaders });
  }
}

/**
 * Main entry point for the edge function
 */
Deno.serve(async (req) => {
  console.log('Received request:', req.method, req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'Method not allowed');
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'No authorization header');
    }

    // Parse request body
    const body: DestroyAssistantsRequest = await req.json();
    if (!body.grant_application_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'Missing grant_application_id field');
    }

    // Validate user session and access
    const userId = await validateUserSession(authHeader);
    
    // Process the request with validated data
    return await handleRequest({ userId, body });

  } catch (error) {
    console.error('Error in destroy-grant-assistants:', error);
    return handleError(error, { headers: corsHeaders });
  }
}); 