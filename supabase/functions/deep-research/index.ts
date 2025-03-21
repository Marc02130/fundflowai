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
      
      // Get document vectors from database for this application
      const { data: documents, error: docError } = await supabase
        .from('grant_application_documents')
        .select(`
          id,
          file_name,
          file_type,
          extracted_text
        `)
        .eq('grant_application_id', body.application_id)
        .order('created_at', { ascending: true });

      if (docError) {
        throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to fetch documents', docError);
      }

      if (!documents?.length) {
        throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'No documents found for this application');
      }

      // Check if we have an existing valid vector store
      const { data: application, error: appError } = await supabase
        .from('grant_applications')
        .select('vector_store_id, vector_store_expires_at')
        .eq('id', body.application_id)
        .single();

      if (appError) {
        throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to fetch application', appError);
      }

      let vectorStoreId = application.vector_store_id;
      
      // Create new vector store if none exists or if expired
      if (!vectorStoreId || (application.vector_store_expires_at && new Date(application.vector_store_expires_at) <= new Date())) {
        console.log('Creating new vector store...');
        const vectorStore = await assistantClient.vectorStores.create({
          name: `grant-${body.application_id}-vectors`,
          expires_after: {
            anchor: "last_active_at",
            days: 7
          }
        });

        // Create OpenAI files from documents
        console.log('Creating OpenAI files from documents...');
        const filePromises = documents.map(async (doc) => {
          const file = await assistantClient.files.create({
            file: new File(
              [doc.extracted_text],
              doc.file_name || `file-${doc.id}.${doc.file_type}`,
              { type: getMimeType(doc.file_type) }
            ),
            purpose: 'assistants'
          });
          return file.id;
        });

        const fileIds = await Promise.all(filePromises);
        console.log(`Created ${fileIds.length} OpenAI files`);

        // Add files to vector store in batches
        console.log('Adding files to vector store...');
        const BATCH_SIZE = 500;
        for (let i = 0; i < fileIds.length; i += BATCH_SIZE) {
          const batch = fileIds.slice(i, i + BATCH_SIZE);
          await assistantClient.vectorStores.fileBatches.createAndPoll(
            vectorStore.id,
            { file_ids: batch }
          );
        }

        // Store the vector store ID and expiration
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        const { error: updateError } = await supabase
          .from('grant_applications')
          .update({
            vector_store_id: vectorStore.id,
            vector_store_expires_at: expiresAt.toISOString()
          })
          .eq('id', body.application_id);

        if (updateError) {
          throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to update vector store info', updateError);
        }

        vectorStoreId = vectorStore.id;
      }

      // Create assistant
      console.log('Creating OpenAI assistant...');
      const assistantParams: AssistantCreateParams = {
        name: "Grant Research Assistant",
        description: "Specialized assistant for grant application research",
        model: Deno.env.get('OPENAI_DEEP_MODEL') ?? 'gpt-4',
        tools: [
          { type: "code_interpreter" },
          { type: "file_search" },
          { 
            type: "function",
            function: {
              name: "search_literature",
              description: "Search scientific literature",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "Search query"
                  }
                },
                required: ["query"]
              }
            }
          }
        ],
        instructions: `You are a specialized research assistant focused on strengthening grant applications through targeted research and specific questions. Your role is to help improve the grant application through critical analysis and specific questions. Important: Do not make up or reference specific papers, authors, or years that you cannot verify.

1. METHODOLOGY ANALYSIS:
   - Identify gaps in the proposed methodology
   - Point out missing controls or validations
   - Request specific details about methods and procedures
   - Ask about statistical approaches and power analysis
   - Question how key variables will be measured

2. PRELIMINARY DATA:
   - Ask about existing data that supports feasibility
   - Identify which aspects need preliminary validation
   - Question how preliminary results inform the approach
   - Ask about pilot studies or proof-of-concept work

3. IMPACT AND SIGNIFICANCE:
   - Challenge assumptions about impact
   - Ask for specific examples of applications
   - Question how outcomes will be measured
   - Probe the broader implications of the work
   - Ask about potential beneficiaries

4. TECHNICAL APPROACH:
   - Question the rationale for chosen methods
   - Ask about alternative approaches considered
   - Probe for potential technical challenges
   - Request details about quality control measures
   - Ask about contingency plans

5. RESOURCES AND TIMELINE:
   - Question the feasibility of timelines
   - Ask about required facilities and equipment
   - Probe expertise and personnel needs
   - Question budget allocation for key activities

6. INTERACTION STYLE:
   - Focus on one aspect at a time for depth
   - Ask follow-up questions based on responses
   - Be specific and concrete in suggestions
   - Maintain a constructive, collaborative tone
   - Push for clarity and specificity in responses

Remember:
- DO NOT make up or reference papers/authors
- DO NOT claim knowledge of current trends
- DO focus on strengthening methodology
- DO ask specific, targeted questions
- DO probe for clarity and completeness
- DO suggest concrete improvements
- DO maintain focus on the specific aims and objectives`
      };

      try {
        // Create assistant
        const assistant = await createAssistant(assistantParams);
        
        // Configure file_search with the vector store
        console.log('Configuring assistant with vector store...');
        await assistantClient.beta.assistants.update(assistant.id, {
          tool_resources: {
            file_search: {
              vector_store_ids: [vectorStoreId]
            }
          }
        });

        const thread = await createThread();

        // Store thread and assistant IDs
        console.log('Storing thread and assistant IDs...');
        const { error: updateError } = await supabase
          .from('grant_applications')
          .update({
            openai_thread_id: thread.id,
            research_assistant_id: assistant.id,
            research_status: 'in_progress',
            deep_research_prompt: body.context.description,
            deep_research_model: assistant.model
          })
          .eq('id', body.application_id);

        if (updateError) {
          throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to update application', updateError);
        }

        // Send initial message and run assistant
        const initialMessage = `Please analyze this grant application and provide insights and questions.

Description:
${body.context.description}`;

        await addMessage(thread.id, initialMessage);
        await runAssistant(thread.id, assistant.id);

        // Get assistant's response
        const messages = await getMessages(thread.id, { limit: 1, order: 'desc' });
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

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Research generated successfully',
              assistant_id: assistant.id,
              thread_id: thread.id
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
        console.error('Error during research initialization:', error);
        throw error;
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