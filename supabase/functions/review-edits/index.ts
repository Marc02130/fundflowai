/**
 * Review Edits Edge Function
 * 
 * Reviews and improves manually edited grant application content using AI assistance.
 * Maintains user's intent while enhancing academic quality and style.
 * 
 * @module review-edits
 */

import { createClient } from '@supabase/supabase-js';
import { handleError, EdgeFunctionError, ERROR_CODES } from 'errors';
import { validateUserSession, validateUserAccess } from 'auth';
import { assistantClient, addMessage, runAssistant, getMessages, type Message } from 'openai_assistant';

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

/**
 * Retrieves section data and related information for review.
 * Includes grant application, opportunity, requirements, and field data.
 * 
 * @param {string} sectionId - ID of the grant section to retrieve
 * @returns {Promise<Object>} Combined section data with related information
 * @throws {EdgeFunctionError} If data retrieval fails or section not found
 */
async function getSectionData(sectionId: string) {
  console.log("=== Getting Section Data ===");
  console.log("Section ID:", sectionId);

  try {
    // 1. Get base section data
    console.log("Fetching section data...");
    const { data: sectionData, error: sectionError } = await supabase
      .from('grant_application_section')
      .select('*')
      .eq('id', sectionId)
      .single();

    console.log("Section query result:", {
      error: sectionError?.message,
      hasData: !!sectionData
    });

    if (sectionError) {
      if (sectionError.code === 'PGRST116') {
        throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Section not found', undefined, 404);
      }
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section data: ${sectionError.message}`);
    }

    if (!sectionData) {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Section not found', undefined, 404);
    }

    // 2. Get grant application data
    console.log("Fetching grant application data...");
    const { data: grantApplication, error: grantAppError } = await supabase
      .from('grant_applications')
      .select('*')
      .eq('id', sectionData.grant_application_id)
      .single();

    if (grantAppError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get grant application: ${grantAppError.message}`);
    }

    // 3. Get grant opportunity data
    console.log("Fetching grant opportunity data...");
    const { data: grantOpportunity, error: grantOppError } = await supabase
      .from('grant_opportunities')
      .select('*, grant:grant_id(*)')
      .eq('id', grantApplication.grant_opportunity_id)
      .single();

    if (grantOppError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get grant opportunity: ${grantOppError.message}`);
    }

    // 4. Get requirements
    console.log("Fetching requirements...");
    const { data: requirements, error: requirementsError } = await supabase
      .from('grant_requirements')
      .select('*')
      .eq('grant_id', grantOpportunity.grant.id);

    if (requirementsError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get requirements: ${requirementsError.message}`);
    }

    // 5. Get latest field data
    console.log("Fetching latest field data...");
    const { data: fields, error: fieldsError } = await supabase
      .from('grant_application_section_fields')
      .select('*')
      .eq('grant_application_section_id', sectionId)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log("Fields query result:", {
      error: fieldsError?.message,
      hasData: !!fields,
      count: fields?.length
    });

    if (fieldsError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get field data: ${fieldsError.message}`);
    }

    if (!fields || fields.length === 0) {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'No fields found for this section', undefined, 404);
    }

    // Combine the data
    return {
      ...sectionData,
      grant_application: {
        ...grantApplication,
        grant_opportunity: {
          ...grantOpportunity,
          grant: {
            ...grantOpportunity.grant,
            requirements
          }
        }
      },
      grant_application_section_fields: fields
    };
  } catch (err) {
    console.error('Error in getSectionData:', err);
    throw err;
  }
}

/**
 * Saves a new section field with review results.
 * Creates a new version of the field with improved content.
 * 
 * @param {string} sectionId - ID of the grant section
 * @param {string} aiOutput - Improved content from AI review
 * @param {Object} previousField - Previous field data
 * @param {string} previousField.id - ID of the previous field
 * @param {string|null} previousField.user_instructions - User's instructions
 * @param {string|null} previousField.user_comments_on_ai_output - User's comments
 * @param {string|null} previousField.ai_model - AI model used
 * @returns {Promise<Object>} Newly created field data
 * @throws {EdgeFunctionError} If save operation fails
 */
async function saveNewSectionField(sectionId: string, aiOutput: string, previousField: {
  id: string;
  user_instructions: string | null;
  user_comments_on_ai_output: string | null;
  ai_model: string | null;
}) {
  const { data, error } = await supabase
    .from('grant_application_section_fields')
    .insert({
      grant_application_section_id: sectionId,
      ai_output: aiOutput,
      ai_model: Deno.env.get('OPENAI_MODEL') || 'gpt-4',
      user_instructions: previousField.user_instructions,
      user_comments_on_ai_output: previousField.user_comments_on_ai_output
    })
    .select('id')
    .single();

  if (error) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to save new section field: ${error.message}`);
  }

  return data;
}

/**
 * Gets application data including assistant IDs
 * @param {string} applicationId - ID of the grant application
 * @returns {Promise<Object>} Application data with assistant IDs
 * @throws {EdgeFunctionError} If application not found
 */
async function getApplicationData(applicationId: string) {
  const { data, error } = await supabase
    .from('grant_applications')
    .select(`
      *,
      writing_assistant_id,
      review_assistant_id,
      openai_thread_id,
      vector_store_id
    `)
    .eq('id', applicationId)
    .single();

  if (error) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get application data: ${error.message}`);
  }

  if (!data) {
    throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Application not found');
  }

  return data;
}

/**
 * Reviews and improves text using an OpenAI assistant
 * @param {string} threadId - OpenAI thread ID to use
 * @param {string} assistantId - OpenAI assistant ID for review
 * @param {string} content - Content to be reviewed
 * @param {Object} requirements - Optional requirements context
 * @returns {Promise<string>} Reviewed content
 * @throws {Error} If review fails
 */
async function reviewContentWithAssistant(
  threadId: string, 
  assistantId: string, 
  content: string,
  requirements?: string[]
): Promise<string> {
  try {
    // Format review prompt
    let reviewPrompt = `
Please review and improve the following grant application content:

${content}

Provide a complete revised version that:
1. Enhances clarity and conciseness
2. Strengthens logical flow and transitions
3. Improves technical precision and terminology
4. Fixes any grammatical or structural issues
5. Reorganizes content for better impact if needed
`;

    // Add requirements context if available
    if (requirements && requirements.length > 0) {
      reviewPrompt += `\n\nGrant Requirements:
${requirements.map(req => `- ${req}`).join('\n')}

Ensure the content fully complies with all requirements listed above.`;
    }

    reviewPrompt += '\n\nReturn only the complete, improved version of the text without additional comments.';

    // Send prompt to review assistant
    await addMessage(threadId, reviewPrompt);
    
    // Run the review assistant
    await runAssistant(threadId, assistantId);
    
    // Get the response
    const messages = await getMessages(threadId, { limit: 1, order: 'desc' });
    const assistantMessage = messages.find((m: Message) => m.role === 'assistant');
    
    if (!assistantMessage || assistantMessage.content[0].type !== 'text') {
      throw new Error('No valid response from review assistant');
    }
    
    return assistantMessage.content[0].text.value;
  } catch (error) {
    console.error('Error reviewing content with assistant:', error);
    throw error;
  }
}

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

/**
 * Main handler for the review-edits Edge Function.
 * Processes grant content through multiple review stages:
 * 1. Spelling and grammar check
 * 2. Logical errors check
 * 3. Requirements compliance check (if requirements exist)
 * 
 * @param {Request} request - HTTP request object
 * @returns {Promise<Response>} HTTP response with review results
 * @throws {EdgeFunctionError} For validation or processing errors
 */
Deno.serve(async (request) => {
  console.log("=== HANDLER START ===");
  console.log("Request method:", request.method);
  console.log("Request headers:", Object.fromEntries(request.headers.entries()));

  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    console.log("Handling CORS preflight");
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log("=== Starting review-edits handler execution ===");
    
    // Validate request
    console.log("Checking auth header...");
    const authHeader = request.headers.get('Authorization');
    console.log("Auth header present:", !!authHeader);
    if (!authHeader) {
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Missing authorization header');
    }

    console.log("Parsing request body...");
    const body = await request.json();
    console.log("Request body:", body);
    const { section_id, field_id } = body;
    console.log("Section ID:", section_id);
    console.log("Field ID:", field_id);

    if (!section_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'section_id is required');
    }
    if (!field_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'field_id is required');
    }

    // Validate user session
    console.log("\n=== Validating User Session ===");
    console.log("Starting session validation...");
    const userId = await validateUserSession(authHeader);
    console.log("Session validated. User ID:", userId);

    // Get section data with latest ai_output
    console.log("\n=== Getting Section Data ===");
    console.log("Fetching section data for ID:", section_id);
    const section = await getSectionData(section_id);
    console.log("Section data retrieved. Has fields:", !!section?.grant_application_section_fields);

    // Validate that field belongs to section
    const field = section.grant_application_section_fields.find(f => f.id === field_id);
    if (!field) {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Field not found in this section', undefined, 404);
    }

    // Validate user access
    console.log("\n=== Validating User Access ===");
    console.log("Checking access for user:", userId);
    console.log("Application ID:", section.grant_application_id);
    const hasAccess = await validateUserAccess(userId, section.grant_application_id);
    console.log("Access validation result:", hasAccess);
    if (!hasAccess) {
      console.log("Access denied for user");
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'User does not have access to this application');
    }

    // Get the latest field data
    const latestField = section.grant_application_section_fields[0];
    if (!latestField?.ai_output) {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'No AI output found for this section', undefined, 404);
    }

    console.log("=== Starting Review Process ===");
    console.log("Latest field:", {
      id: latestField.id,
      section_id: latestField.grant_application_section_id,
      ai_output_length: latestField.ai_output.length,
      ai_model: latestField.ai_model
    });
    
    // Get application data to access assistants
    console.log("\n=== Getting Application Data ===");
    const application = await getApplicationData(section.grant_application_id);
    console.log("Application data retrieved. Has review assistant:", !!application?.review_assistant_id);
    
    // Check if review assistant is available
    if (!application.review_assistant_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'No review assistant found for this application');
    }
    
    // Get or create a thread
    let threadId = application.openai_thread_id;
    if (!threadId) {
      try {
        console.log('Creating new thread for application');
        const thread = await assistantClient.beta.threads.create();
        threadId = thread.id;
        
        // Update application with thread ID
        const { error: updateError } = await supabase
          .from('grant_applications')
          .update({ openai_thread_id: threadId })
          .eq('id', application.id);
          
        if (updateError) {
          console.error('Failed to update application with thread ID:', updateError);
        }
      } catch (threadError) {
        console.error('Error creating thread:', threadError);
        throw new EdgeFunctionError(
          ERROR_CODES.AI_ERROR, 
          `Failed to create thread: ${threadError instanceof Error ? threadError.message : 'Unknown error'}`
        );
      }
    }
    
    console.log(`Using thread ID: ${threadId}`);
    
    // Prepare requirements if available
    const requirementUrls = section.grant_application?.grant_opportunity?.requirements?.map(req => req.url) || [];
    console.log(`Found ${requirementUrls.length} requirements`);

    try {
      // Use review assistant to improve content
      console.log("\n=== Using Review Assistant ===");
      console.log("Input text (first 100 chars):", latestField.ai_output.substring(0, 100));
      console.log('Starting review with assistant...');
      
      const finalText = await reviewContentWithAssistant(
        threadId,
        application.review_assistant_id,
        latestField.ai_output,
        requirementUrls
      );
      
      if (!finalText) {
        console.error('Review failed - no text returned');
        throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'Failed to complete review with assistant');
      }
      
      console.log('Review complete. Output length:', finalText.length);
      console.log("Output text (first 100 chars):", finalText.substring(0, 100));
    
      // Save the reviewed text
      console.log("Saving reviewed text...");
      const newField = await saveNewSectionField(section_id, finalText, latestField);
      console.log("New section field saved:", newField);

      console.log("=== Handler execution completed successfully ===");
      return new Response(JSON.stringify({
        success: true,
        data: {
          field_id: newField.id,
          ai_output: finalText
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        status: 200
      });
    } catch (error) {
      console.error('Error during review process:', error);
      
      // Create a new field with the error message
      try {
        const errorMessage = `[REVIEW FAILED]
Error: ${error instanceof Error ? error.message : 'Unknown error'}
Time: ${new Date().toISOString()}

Please try again or contact support if the issue persists.`;
        
        // Create a new field record with the error message
        const newField = await saveNewSectionField(section_id, errorMessage, latestField);
        
        // Return the error response
        return new Response(JSON.stringify({
          success: false,
          data: {
            field_id: newField.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
          status: 500
        });
      } catch (createError) {
        console.error('Failed to create error field record:', createError);
      }
      
      throw new EdgeFunctionError(
        ERROR_CODES.AI_ERROR,
        `Review failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

  } catch (error) {
    console.error('Error in handler:', error);
    return handleError(error, { headers: corsHeaders });
  }
}); 