/**
 * Generate Grant Edge Function
 * 
 * Handles automated generation of complete grant applications by processing multiple sections
 * in parallel using pre-created OpenAI assistants. Uses dedicated assistants for writing and review.
 * 
 * @module generate-grant
 */

import { createClient } from '@supabase/supabase-js';
import { handleError, EdgeFunctionError, ERROR_CODES } from 'errors';
import { validateUserSession, validateUserAccess } from 'auth';
import { assistantClient, addMessage, runAssistant, getMessages, type Message } from 'openai_assistant'

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

/**
 * Creates a field for a grant application section
 * @param {string} sectionId - ID of the section to create field for
 * @returns {Promise<Object>} Created field data
 * @throws {EdgeFunctionError} If field creation fails
 */
async function createField(sectionId: string) {
  const { data: field, error } = await supabase
    .from('grant_application_section_fields')
    .insert({
      grant_application_section_id: sectionId
    })
    .select()
    .single();

  if (error) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to create field: ${error.message}`);
  }

  return field;
}

/**
 * Updates a field with AI generation results
 * @param {string} fieldId - ID of the field to update
 * @param {string} aiOutput - Generated content
 * @param {string} stage - Processing stage identifier
 * @param {string} userInstructions - User instructions/context for the field
 * @param {boolean} [failed=false] - Whether generation failed
 * @throws {EdgeFunctionError} If update fails
 */
async function updateField(
  fieldId: string, 
  aiOutput: string, 
  stage: string, 
  userInstructions: string,
  failed: boolean = false
) {
  const { error } = await supabase
    .from('grant_application_section_fields')
    .update({
      ai_output: aiOutput,
      ai_model: failed ? 'failed' : `${Deno.env.get('OPENAI_MODEL')}-${stage}`,
      user_instructions: userInstructions,
      updated_at: new Date().toISOString()
    })
    .eq('id', fieldId);

  if (error) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to update field: ${error.message}`);
  }
}

/**
 * Retrieves complete application data including sections and attachments
 * @param {string} applicationId - ID of the grant application
 * @returns {Promise<Object>} Combined application data with sections and attachments
 * @throws {EdgeFunctionError} If data retrieval fails
 */
async function getApplicationData(applicationId: string) {
  try {
    // Get base application
    const { data: application, error: applicationError } = await supabase
      .from('grant_applications')
      .select(`
        *,
        writing_assistant_id,
        review_assistant_id,
        vector_store_id,
        openai_thread_id
      `)
      .eq('id', applicationId)
      .single();

    if (applicationError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get application: ${applicationError.message}`);
    if (!application) throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Application not found');

    // Validate required resources
    if (!application.writing_assistant_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'No writing assistant found for this application');
    }

    if (!application.vector_store_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'No vector store found for this application');
    }

    // Get opportunity details
    const { data: opportunity, error: opportunityError } = await supabase
      .from('grant_opportunities')
      .select('*')
      .eq('id', application.grant_opportunity_id)
      .single();

    if (opportunityError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get opportunity: ${opportunityError.message}`);

    // Get requirements
    const { data: requirements, error: requirementsError } = await supabase
      .from('grant_requirements')
      .select('*')
      .eq('grant_id', opportunity.grant_id);

    if (requirementsError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get requirements: ${requirementsError.message}`);

    // Get sections
    const { data: sections, error: sectionsError } = await supabase
      .from('grant_application_section')
      .select('*')
      .eq('grant_application_id', applicationId);

    if (sectionsError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get sections: ${sectionsError.message}`);

    // Get section details
    const sectionIds = sections.map(s => s.grant_section_id);
    const { data: sectionDetails, error: sectionDetailsError } = await supabase
      .from('grant_sections')
      .select('*')
      .in('id', sectionIds);

    if (sectionDetailsError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section details: ${sectionDetailsError.message}`);

    // Combine the data
    return {
      ...application,
      grant_opportunity: {
        ...opportunity,
        requirements: requirements || []
      },
      sections: sections.map(section => ({
        ...section,
        grant_section: sectionDetails?.find(sd => sd.id === section.grant_section_id)
      }))
    };

  } catch (err) {
    console.error('Error in getApplicationData:', err);
    throw err;
  }
}

/**
 * Uses a writing assistant to generate content for a specific section
 * @param {string} threadId - OpenAI thread ID to use
 * @param {string} assistantId - OpenAI assistant ID to use
 * @param {string} prompt - Prompt for content generation
 * @returns {Promise<string>} Generated content
 */
async function generateSectionWithAssistant(threadId: string, assistantId: string, prompt: string) {
  try {
    // Send prompt to assistant
    await addMessage(threadId, prompt);
    
    // Run the assistant
    await runAssistant(threadId, assistantId);
    
    // Get the response
    const messages = await getMessages(threadId, { limit: 1, order: 'desc' });
    const assistantMessage = messages.find((m: Message) => m.role === 'assistant');
    
    if (!assistantMessage || assistantMessage.content[0].type !== 'text') {
      throw new Error('No valid response from assistant');
    }
    
    return assistantMessage.content[0].text.value;
  } catch (error) {
    console.error('Error generating section with assistant:', error);
    throw error;
  }
}

/**
 * Uses a review assistant to improve content for a specific section
 * @param {string} threadId - OpenAI thread ID to use
 * @param {string} assistantId - OpenAI assistant ID to use
 * @param {string} content - Content to be reviewed
 * @returns {Promise<string>} Reviewed content
 */
async function reviewSectionWithAssistant(threadId: string, assistantId: string, content: string) {
  try {
    // Format review prompt
    const reviewPrompt = `
Please review and improve the following grant application content:

${content}

Provide a complete revised version that:
1. Enhances clarity and conciseness
2. Strengthens logical flow and transitions
3. Improves technical precision and terminology
4. Fixes any grammatical or structural issues
5. Reorganizes content for better impact if needed

Return only the complete, improved version of the text without additional comments.
`;

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
    console.error('Error reviewing section with assistant:', error);
    throw error;
  }
}

/**
 * Processes a single section of the grant application
 * @param {Object} section - Section data to process
 * @param {Object} application - Parent application data
 * @param {number} [retryCount=1] - Number of remaining retry attempts
 * @returns {Promise<Object>} Processing result with status
 * @throws {EdgeFunctionError} If processing fails
 */
async function processSection(section: any, application: any, retryCount: number = 1) {
  try {
    // Create field
    const field = await createField(section.id);

    // Check if we need to create a thread for this section
    let threadId = application.openai_thread_id;
    
    // If no thread exists yet, create one
    if (!threadId) {
      console.log('No thread found, creating new thread for section', section.id);
      try {
        const thread = await assistantClient.beta.threads.create();
        threadId = thread.id;
        
        // Update application with thread ID (this allows reuse for other sections)
        const { error: updateError } = await supabase
          .from('grant_applications')
          .update({ openai_thread_id: threadId })
          .eq('id', application.id);
          
        if (updateError) {
          console.error('Failed to update application with thread ID:', updateError);
        }
      } catch (threadError) {
        console.error('Error creating thread:', threadError);
        throw threadError;
      }
    }

    // Format prompt with application context and section-specific prompt
    // The assistant will automatically search the vector store for relevant document content
    const formattedPrompt = `
Generate a comprehensive, publication-ready section for a grant application.

SECTION: ${section.grant_section.name}

GRANT REQUIREMENTS:
${application.grant_opportunity.requirements?.map((req: any) => `- ${req.requirement_text}`).join('\n') || 'No specific requirements'}

APPLICATION CONTEXT:
${application.description || 'No application description provided'}

SECTION-SPECIFIC INSTRUCTIONS:
${section.grant_section.ai_generator_prompt || 'No specific instructions provided for this section.'}

Your task is to generate publication-ready content for this section. 
You have access to a vector store with uploaded documents relevant to this grant application.
Search for and incorporate relevant information from these documents where appropriate.

The content should:
1. Be free of spelling, grammar, and punctuation errors
2. Have no logical errors, contradictions, or inconsistencies
3. Fully comply with all grant requirements listed above
4. Incorporate relevant information from the application documents
5. Follow the specific instructions for this section
6. Be ready to be submitted without further editing
`;

    try {
      // Generate text with writing assistant
      const generatedText = await generateSectionWithAssistant(
        threadId,
        application.writing_assistant_id,
        formattedPrompt
      );
      
      // Log that we're moving to review phase
      console.log(`Generated text for section ${section.id}, now reviewing with review assistant`);
      
      // Check if we have a review assistant ID
      if (!application.review_assistant_id) {
        console.log('No review assistant found, using original generated text');
        await updateField(
          field.id, 
          generatedText, 
          'assistant', 
          application.description || 'No application description provided'
        );
        
        return {
          section_id: section.id,
          field_id: field.id,
          status: 'completed_no_review'
        };
      }
      
      // Review the generated text
      const reviewedText = await reviewSectionWithAssistant(
        threadId,
        application.review_assistant_id,
        generatedText
      );
      
      // Update the field with the reviewed text
      await updateField(
        field.id, 
        reviewedText, 
        'assistant-reviewed', 
        application.description || 'No application description provided'
      );

      return {
        section_id: section.id,
        field_id: field.id,
        status: 'completed_with_review'
      };
    } catch (assistantError) {
      console.error('Error with assistant generation, falling back to direct generation:', assistantError);
      
      // Fallback to direct generation - try to use the writing assistant again with simplified prompt
      const simplifiedPrompt = `
Generate content for the following grant section: ${section.grant_section.name}

Context: ${application.description || 'No application description provided'}
`;
      
      try {
        const fallbackText = await generateSectionWithAssistant(
          threadId,
          application.writing_assistant_id,
          simplifiedPrompt
        );
        
        await updateField(
          field.id, 
          fallbackText, 
          'fallback', 
          application.description || 'No application description provided'
        );
        
        return {
          section_id: section.id,
          field_id: field.id,
          status: 'completed_fallback'
        };
      } catch (fallbackError) {
        // If all assistant attempts fail, provide error message
        console.error('All assistant attempts failed:', fallbackError);
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error(`Error processing section ${section.id}:`, error);
    
    if (retryCount > 0) {
      console.log(`Retrying section ${section.id}, attempts remaining: ${retryCount}`);
      return processSection(section, application, retryCount - 1);
    }

    const failureMessage = `
[GENERATION FAILED]
This section failed to generate after 2 attempts.
Last error: ${error instanceof Error ? error.message : 'Unknown error'}
Time of failure: ${new Date().toISOString()}
Please try regenerating this section or contact support if the issue persists.
`;

    const field = await createField(section.id);
    await updateField(
      field.id, 
      failureMessage, 
      'failed', 
      application.description || 'No application description provided',
      true
    );

    return {
      section_id: section.id,
      field_id: field.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      attempts: 2
    };
  }
}

/**
 * Handle CORS preflight requests
 */
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

/**
 * Main handler for the generate-grant Edge Function
 * 
 * Processes:
 * 1. Validates request and user session
 * 2. Processes all sections in parallel using writing assistant
 * 3. Updates section statuses
 * 4. Returns consolidated results
 * 
 * @throws {EdgeFunctionError} For validation or processing errors
 */
Deno.serve({
  onListen: ({ port, hostname }) => {
    console.log(`Server started at http://${hostname}:${port}`);
  },
  onError: (error) => {
    console.error('Server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  },
  port: 54321,
  hostname: "0.0.0.0",
  reusePort: true,
  reuseAddress: true,
}, async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'Only POST method is allowed', undefined, 405);
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Missing authorization header', undefined, 401);
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'Invalid JSON in request body');
    }

    const { application_id } = body;
    if (!application_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'application_id is required');
    }

    // Validate user session
    const userId = await validateUserSession(authHeader);

    // Get application data and validate access
    const application = await getApplicationData(application_id);
    
    // Validate user has access
    if (application.user_id !== userId) {
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'User does not have access to this application');
    }

    // Process sections sequentially to avoid thread conflicts
    const results = {
      successful_sections: [] as any[],
      failed_sections: [] as any[]
    };

    try {
      // Process each section sequentially
      for (const section of application.sections) {
        console.log(`Starting section: ${section.grant_section.name}`);
        const result = await processSection(section, application);
        
        if ('error' in result) {
          results.failed_sections.push(result);
        } else {
          results.successful_sections.push(result);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        results
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });

    } catch (error) {
      console.error('Error in handler:', error);
      return handleError(error, { headers: corsHeaders });
    }

  } catch (error) {
    console.error('Error in handler:', error);
    return handleError(error, { headers: corsHeaders });
  }
}); 