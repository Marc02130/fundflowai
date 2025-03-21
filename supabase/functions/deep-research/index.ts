/**
 * Deep Research Edge Function
 * 
 * Handles automated research generation for grant applications by analyzing provided documents
 * and generating comprehensive research reports.
 * 
 * @module deep-research
 */

import { createClient } from '@supabase/supabase-js'
import { validateUserSession, validateUserAccess } from 'auth'
import { EdgeFunctionError, ERROR_CODES, handleError } from 'errors'
import { assistantClient, createAssistant, createThread, addMessage, runAssistant, getMessages, type AssistantCreateParams, type Message } from 'openai_assistant'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface RequestBody {
  application_id: string;
  user_input?: string;
  generate_report?: boolean;
  initialize?: boolean;
  context?: {
    description: string;
    documents: Array<{
      id: string;
      vector: number[];
    }>;
  };
}

interface HandlerContext {
  userId: string;
  body: RequestBody;
}

// Main handler function that processes the validated request
async function handleRequest(context: HandlerContext): Promise<Response> {
  const { userId, body } = context;
  console.log('Processing request for user:', userId);

  try {
    // Initialize research if requested
    if (body.initialize && body.context) {
      console.log('Initializing research...');
      
      // Get application data with existing assistant and vector store
      const { data: application, error: appError } = await supabase
        .from('grant_applications')
        .select(`
          id, 
          research_assistant_id,
          vector_store_id,
          openai_thread_id
        `)
        .eq('id', body.application_id)
        .single();

      if (appError) {
        throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to fetch application', appError);
      }

      // Verify we have the required resources
      if (!application.research_assistant_id) {
        throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Research assistant not found for this application');
      }

      if (!application.vector_store_id) {
        throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Vector store not found for this application');
      }

      // Get or create a thread
      let threadId = application.openai_thread_id;
      if (!threadId) {
        console.log('Creating new thread...');
        const thread = await createThread();
        threadId = thread.id;
        
        // Update application with thread ID
        const { error: updateError } = await supabase
          .from('grant_applications')
          .update({
            openai_thread_id: threadId
          })
          .eq('id', body.application_id);
          
        if (updateError) {
          throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to update thread ID', updateError);
        }
      }

      // Send initial message and run assistant
      const initialMessage = `Please analyze this grant application and provide insights and questions.

Description:
${body.context.description}`;

      await addMessage(threadId, initialMessage);
      await runAssistant(threadId, application.research_assistant_id);

      // Get assistant's response
      const messages = await getMessages(threadId, { limit: 1, order: 'desc' });
      const assistantMessage = messages.find((m: Message) => m.role === 'assistant');
      
      if (assistantMessage && assistantMessage.content[0].type === 'text') {
        const response = assistantMessage.content[0].text.value;
        
        // Store interaction
        console.log('Storing interaction...');
        const { error: insertError } = await supabase
          .from('grant_application_deep_research')
          .insert({
            grant_application_id: body.application_id,
            content: response,
            interaction_type: 'ai_output',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to store interaction', insertError);
        }

        // Update research status
        const { error: statusError } = await supabase
          .from('grant_applications')
          .update({
            research_status: 'in_progress',
            deep_research_prompt: body.context.description
          })
          .eq('id', body.application_id);

        if (statusError) {
          console.error('Error updating research status:', statusError);
          // Continue despite error
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Research generated successfully',
            assistant_id: application.research_assistant_id,
            thread_id: threadId
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      } else {
        throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'No valid response from assistant');
      }
    }

    // Handle interactive research
    if (!body.initialize) {
      console.log('Processing interactive research');

      // Get application data
      const { data: appData, error: appError } = await supabase
        .from('grant_applications')
        .select('openai_thread_id, research_assistant_id')
        .eq('id', body.application_id)
        .single();

      if (appError) {
        throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to get application data', appError);
      }

      if (!appData.openai_thread_id || !appData.research_assistant_id) {
        throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'Research not initialized');
      }

      // Get the latest interaction
      const { data: latestInteraction, error: interactionError } = await supabase
        .from('grant_application_deep_research')
        .select('*')
        .eq('grant_application_id', body.application_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (interactionError) {
        throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to get latest interaction', interactionError);
      }

      if (latestInteraction.interaction_type !== 'user_response') {
        throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'Latest interaction must be a user response');
      }

      try {
        // Send user's message to the thread
        await addMessage(appData.openai_thread_id, latestInteraction.content);
        
        // Run the assistant
        await runAssistant(appData.openai_thread_id, appData.research_assistant_id);

        // Get assistant's response
        const messages = await getMessages(appData.openai_thread_id, { limit: 1, order: 'desc' });
        const assistantMessage = messages.find((m: Message) => m.role === 'assistant');
        
        if (assistantMessage && assistantMessage.content[0].type === 'text') {
          const response = assistantMessage.content[0].text.value;
          
          // Store new interaction
          console.log('Storing new interaction...');
          const { error: insertError } = await supabase
            .from('grant_application_deep_research')
            .insert({
              grant_application_id: body.application_id,
              content: response,
              interaction_type: 'ai_response',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to store interaction', insertError);
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Research response generated successfully'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        } else {
          throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'No valid response from assistant');
        }
      } catch (error) {
        console.error('Error during interactive research:', error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'No action required'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in deep-research function:', error);
    return handleError(error, { headers: corsHeaders });
  }
}

// Main entry point
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

    // Parse request body - do this ONCE
    console.log('Parsing request body...');
    const body: RequestBody = await req.json();
    console.log('Request body:', {
      applicationId: body.application_id,
      initialize: body.initialize,
      hasContext: !!body.context
    });

    if (!body.application_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'No application ID provided');
    }

    // Validate user session and access
    const userId = await validateUserSession(authHeader);
    await validateUserAccess(userId, body.application_id);

    // Process the request with validated data
    return await handleRequest({ userId, body });

  } catch (error) {
    console.error('Error in deep-research function:', error);
    return handleError(error, { headers: corsHeaders });
  }
});

// Helper function to get MIME type
function getMimeType(fileType: string): string {
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'md': 'text/markdown',
    'txt': 'text/plain',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return mimeTypes[fileType] || 'text/plain';
} 