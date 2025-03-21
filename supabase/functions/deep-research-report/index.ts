import { createClient } from '@supabase/supabase-js'
import { validateUserSession, validateUserAccess } from 'auth'
import { EdgeFunctionError, ERROR_CODES, handleError } from 'errors'
import { assistantClient, createAssistant, addMessage, runAssistant, getMessages, type Message } from 'openai_assistant'

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
}

interface HandlerContext {
  userId: string;
  body: RequestBody;
}

// Main handler function that processes the validated request
async function handleRequest(context: HandlerContext): Promise<Response> {
  const { userId, body } = context;
  console.log('Processing report generation for user:', userId);

  try {
    // Get application data
    const { data: appData, error: appError } = await supabase
      .from('grant_applications')
      .select('openai_thread_id, research_assistant_id, description')
      .eq('id', body.application_id)
      .single();

    if (appError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to get application data', appError);
    }

    if (!appData.openai_thread_id || !appData.research_assistant_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'Research not initialized');
    }

    // Get all interactions in chronological order
    const { data: interactions, error: intError } = await supabase
      .from('grant_application_deep_research')
      .select('*')
      .eq('grant_application_id', body.application_id)
      .order('created_at', { ascending: true });

    if (intError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to get interactions', intError);
    }

    // Create report generation prompt
    const reportPrompt = `Based on our conversation about the grant, please generate a comprehensive report that provides ACTUAL CONTENT to fill in the gaps in the grant application. Don't give advice on how to improve - instead, provide ready-to-use text that can be directly copied into the grant application.

The report should:
1. Use information from our conversation
2. Elaborate with additional details where necessary
3. Present content organized by standard grant sections
4. Provide fully-formed, detailed paragraphs ready for inclusion in the grant

# GRANT APPLICATION CONTENT

## Methodology
[Provide detailed methodology text based on the conversation, addressing questions about methods, controls, confounding variables, etc. Include specific procedures, techniques, and approaches.]

## Preliminary Data
[Provide content describing the preliminary data, how it supports feasibility, and its relevance to the proposed work. Elaborate on existing pilot studies or preliminary results.]

## Significance and Impact
[Provide detailed text explaining the significance of the work, potential applications, and broader impacts on the field and society.]

## Technical Approach
[Provide specific technical details, including justification for chosen methods, alternative approaches considered, and contingency plans.]

## Resources and Timeline
[Provide concrete timeline details, resource allocation information, and personnel/equipment requirements.]

Note: This report should directly provide the CONTENT to fill in the application, not advice about what content to include. The goal is to generate text that can be copied directly into the grant application.

Here is the information to base your report on:

Application Description:
${appData.description}

Interaction History:
${interactions.map(int => `
[${int.interaction_type.toUpperCase()} - ${new Date(int.created_at).toISOString()}]
${int.content}
`).join('\n\n')}`;

    // Send report generation request to OpenAI
    await addMessage(appData.openai_thread_id, reportPrompt);
    await runAssistant(appData.openai_thread_id, appData.research_assistant_id);

    // Get assistant's response
    const messages = await getMessages(appData.openai_thread_id, { limit: 1, order: 'desc' });
    const reportMessage = messages.find((m: Message) => m.role === 'assistant');

    if (!reportMessage || reportMessage.content[0].type !== 'text') {
      throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'Failed to generate report');
    }

    const report = reportMessage.content[0].text.value;

    // Update application status and store report as document
    const { error: updateError } = await supabase
      .from('grant_applications')
      .update({
        research_status: 'completed'
      })
      .eq('id', body.application_id);

    if (updateError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to update application', updateError);
    }

    // Generate UUID for the document
    const documentId = crypto.randomUUID();
    const filePath = `${body.application_id}/${documentId}.md`;

    // Create document record
    const { error: docError } = await supabase
      .from('grant_application_documents')
      .upsert({
        id: documentId,
        grant_application_id: body.application_id,
        file_name: 'deep_research.md',
        file_type: 'md',
        file_path: filePath,
        vectorization_status: 'pending'
      });

    if (docError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to create document record', docError);
    }

    // Store report as document
    const { error: storageError } = await supabase.storage
      .from('grant-attachments')
      .upload(
        filePath,
        report,
        { contentType: 'text/markdown', upsert: true }
      );

    if (storageError) {
      throw new EdgeFunctionError(ERROR_CODES.STORAGE_ERROR, 'Failed to store report document', storageError);
    }

    // Queue document for processing
    try {
      console.log(`Queuing document ${documentId} for processing...`);
      const { error: queueError } = await supabase
        .rpc('queue_document_for_processing', {
          p_document_id: documentId,
          p_document_type: 'application'
        });

      if (queueError) {
        console.error('Failed to queue document for processing:', queueError);
        console.log('Continuing without document processing...');
      } else {
        console.log('Document successfully queued for processing');
      }
    } catch (queueError) {
      console.error('Error queuing document for processing:', queueError);
      console.log('Continuing without document processing...');
    }

    // Mark all interactions as having generated report
    const { error: markError } = await supabase
      .from('grant_application_deep_research')
      .update({ has_generated_report: true })
      .eq('grant_application_id', body.application_id);

    if (markError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to mark interactions', markError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Report generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in deep-research-report:', error);
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

    // Parse request body
    const body: RequestBody = await req.json();
    if (!body.application_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'No application ID provided');
    }

    // Validate user session and access
    const userId = await validateUserSession(authHeader);
    await validateUserAccess(userId, body.application_id);

    // Process the request with validated data
    return await handleRequest({ userId, body });

  } catch (error) {
    console.error('Error in deep-research-report:', error);
    return handleError(error, { headers: corsHeaders });
  }
}); 