/**
 * Prompt AI Edge Function
 * 
 * Generates grant application content using AI assistance.
 * Uses OpenAI's Assistants API for writing and review.
 * 
 * @module prompt-ai
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

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

/**
 * Creates a standardized error response with CORS headers.
 * @param {Error} error - Error object to format
 * @param {number} status - HTTP status code
 * @returns {Response} Formatted error response
 */
function errorResponse(error: Error, status: number = 400) {
  return new Response(
    JSON.stringify({
      error: {
        message: error.message,
        ...(error instanceof EdgeFunctionError && { code: error.code, details: error.details })
      }
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}

/**
 * Retrieves complete section data including related information.
 * Fetches base section, grant section, application, opportunity, and requirements.
 * @param {string} sectionId - ID of the grant section
 * @returns {Promise<Object>} Combined section data
 * @throws {EdgeFunctionError} If any data retrieval fails
 */
async function getSectionData(sectionId: string) {
  console.log('=== Getting Section Data ===');
  console.log('Section ID:', sectionId);
  
  try {
    // 1. Get the  base section
    const { data: sectionData, error: sectionError } = await supabase
      .from('grant_application_section')
      .select('*')
      .eq('id', sectionId)
      .single();

    if (sectionError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section: ${sectionError.message}`);
    if (!sectionData) throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Section not found');
    
    // 2. Get the  grant section
    const { data: grantSection, error: grantSectionError } = await supabase
      .from('grant_sections')
      .select('*')
      .eq('id', sectionData.grant_section_id)
      .single();
      
    if (grantSectionError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get grant section: ${grantSectionError.message}`);
    
    // 3. Get the  application
    const { data: application, error: applicationError } = await supabase
      .from('grant_applications')
      .select('*')
      .eq('id', sectionData.grant_application_id)
      .single();
      
    if (applicationError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get application: ${applicationError.message}`);
    
    // 4. Get the  grant opportunity with grant details
    const { data: opportunity, error: opportunityError } = await supabase
      .from('grant_opportunities')
      .select(`
        *,
        grant:grants (
          id,
          organization_id
        )
      `)
      .eq('id', application.grant_opportunity_id)
      .single();
      
    if (opportunityError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get opportunity: ${opportunityError.message}`);
    
    // 5. Get the grant requirements
    const { data: grant_requirements, error: requirementsError } = await supabase
      .from('grant_requirements')
      .select('*')
      .eq('grant_id', opportunity.grant_id);
      
    if (requirementsError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get requirements: ${requirementsError.message}`);

    // 6. Get the organization requirements
    const { data: org_grant_requirements, error: orgRequirementsError } = await supabase
      .from('organization_grant_requirements')
      .select('*')
      .eq('organization_id', opportunity.grant.organization_id);
      
    if (orgRequirementsError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get organization requirements: ${orgRequirementsError.message}`);

    // Put this shit together
    const result = {
      ...sectionData,
      grant_section: grantSection,
      grant_application: {
        ...application,
        grant_opportunity: {
          ...opportunity,
          grant: opportunity.grant,
          requirements: grant_requirements,
          org_requirements: org_grant_requirements
        }
      }
    };

    console.log('Final Data:', result);
    return result;

  } catch (err) {
    console.error('Error in getSectionData:', err);
    throw err;
  }
}

/**
 * Retrieves a user's custom prompt.
 * @param {string} promptId - ID of the custom prompt
 * @returns {Promise<{prompt_text: string}>} Prompt data
 * @throws {EdgeFunctionError} If prompt not found or inactive
 */
async function getUserPrompt(promptId: string) {
  const { data, error } = await supabase
    .from('user_ai_prompts')
    .select('prompt_text')
    .eq('id', promptId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new EdgeFunctionError(ERROR_CODES.NO_PROMPT, 'User prompt not found');
    }
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get user prompt: ${error.message}`);
  }

  if (!data) {
    throw new EdgeFunctionError(ERROR_CODES.NO_PROMPT, 'User prompt not found');
  }

  return data;
}

/**
 * Gets all document vectors for a section.
 * @param {string} sectionId - ID of the grant section
 * @returns {Promise<Array<Object>>} List of document vectors
 * @throws {EdgeFunctionError} If retrieval fails
 */
async function getSectionVectors(sectionId: string) {
  console.log("=== Getting Section Document Vectors ===");
  
  // Get section documents first
  const { data: documents, error: documentsError } = await supabase
    .from('grant_application_section_documents')
    .select('id')
    .eq('grant_application_section_id', sectionId);

  if (documentsError) {
    console.error("Error getting section documents:", documentsError);
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section documents: ${documentsError.message}`);
  }

  if (!documents?.length) {
    console.log("No documents found for section");
    return [];
  }

  // Get vectors for these documents
  const { data: vectors, error: vectorsError } = await supabase
    .from('grant_application_section_document_vectors')
    .select('document_id, chunk_text')
    .in('document_id', documents.map(d => d.id));

  if (vectorsError) {
    console.error("Error getting document vectors:", vectorsError);
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get document vectors: ${vectorsError.message}`);
  }

  console.log("Section vectors:", vectors);
  return vectors || [];
}

/**
 * Retrieves field data for content generation.
 * @param {string} fieldId - ID of the field
 * @returns {Promise<Object>} Field data
 * @throws {EdgeFunctionError} If field not found
 */
async function getFieldData(fieldId: string) {
  const { data, error } = await supabase
    .from('grant_application_section_fields')
    .select('*')
    .eq('id', fieldId)
    .single();

  if (error) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get field data: ${error.message}`);
  }

  if (!data) {
    throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Field not found');
  }

  return data;
}

/**
 * Creates a new field with AI-generated content
 * @param {string} sectionId - ID of the section
 * @param {string} aiOutput - Generated content
 * @param {string} stage - Processing stage identifier
 * @param {string} userInstructions - User instructions to preserve
 * @param {string | null} userComments - User comments to preserve
 * @returns {Promise<{id: string}>} Newly created field data
 * @throws {EdgeFunctionError} If creation fails
 */
async function createNewField(
  sectionId: string,
  aiOutput: string,
  stage: string,
  userInstructions: string | null,
  userComments: string | null
) {
  // Insert new field record
  const { data, error } = await supabase
    .from('grant_application_section_fields')
    .insert({
      grant_application_section_id: sectionId,
      ai_output: aiOutput,
      ai_model: `${Deno.env.get('OPENAI_MODEL')}-${stage}`,
      user_instructions: userInstructions,
      user_comments_on_ai_output: userComments
    })
    .select('id')
    .single();

  if (error) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to create new field: ${error.message}`);
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
 * Generates text using an OpenAI assistant
 * @param {string} threadId - OpenAI thread ID to use
 * @param {string} assistantId - OpenAI assistant ID for generation
 * @param {string} prompt - Prompt for content generation
 * @returns {Promise<string>} Generated content
 * @throws {Error} If generation fails
 */
async function generateContentWithAssistant(threadId: string, assistantId: string, prompt: string): Promise<string> {
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
    console.error('Error generating content with assistant:', error);
    throw error;
  }
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
  requirements?: { 
    grant?: any[], 
    org?: any[] 
  }
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
    if (requirements) {
      reviewPrompt += `\n\nGrant Requirements:
${requirements.grant?.map((req: any) => `- ${req.requirement}: ${req.url}`).join('\n') || 'No grant-specific requirements provided'}

Organization Requirements:
${requirements.org?.map((req: any) => `- ${req.requirement}: ${req.url}`).join('\n') || 'No organization-specific requirements provided'}

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

/**
 * Main handler for content generation.
 * Processes content through multiple stages:
 * 1. Initial generation with context
 * 2. Spelling and grammar check
 * 3. Logical consistency review
 * 4. Requirements compliance verification
 * 
 * @throws {EdgeFunctionError} For validation or processing errors
 */
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

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

    const { section_id, field_id, prompt_id } = body;;

    if (!section_id || !field_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'section_id and field_id are required');
    }

    // Validate user session
    const userId = await validateUserSession(authHeader);

    // Get section and field data
    const [section, field] = await Promise.all([
      getSectionData(section_id),
      getFieldData(field_id)
    ]);

    try {
      // Check access directly in the database using user_id (links to auth.users)
      const { data: accessData, error: accessError } = await supabase
        .from('grant_applications')
        .select('id')
        .eq('id', section.grant_application.id)
        .eq('user_id', userId)  // This is correct - links to auth.users
        .single();

      if (accessError) {
        console.error("Database error during access check:", accessError);
        throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to check access: ${accessError.message}`);
      }

      const hasAccess = !!accessData;
      
      if (!hasAccess) {
        throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'User does not have access to this application');
      }
    } catch (err) {
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Failed to validate user access');
    }

    // Get prompt text
    let promptText = section.grant_section?.ai_generator_prompt;
    if (prompt_id) {
      const userPrompt = await getUserPrompt(prompt_id);
      promptText = userPrompt.prompt_text;
    }

    // Get document vectors
    const documentVectors = await getSectionVectors(section_id);

    // Get application data for assistants
    const application = await getApplicationData(section.grant_application.id);
    
    // Check if we have assistants configured
    if (!application.writing_assistant_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'No writing assistant found for this application');
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

    // Format the prompt for the assistant
    const formattedPrompt = `
Instructions: ${field.user_instructions || 'No specific instructions provided'}

Previous Comments: ${field.user_comments_on_ai_output || 'No previous comments'}

Previous Content: ${field.ai_output || 'No previous content'}

Reference Materials:
${documentVectors.map(v => v.chunk_text).join('\n\n') || 'No reference materials available'}

Prompt:
${promptText}

Please ensure your response:
1. Is free of spelling, grammar, and punctuation errors
2. Has no logical errors, contradictions, or inconsistencies
3. Fully complies with all grant requirements
4. Incorporates relevant information from the provided document content where appropriate
`;

    try {
      console.log("\n=== GENERATING CONTENT WITH WRITING ASSISTANT ===");
      console.log("Using writing assistant ID:", application.writing_assistant_id);
      
      if (!application.writing_assistant_id) {
        throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'No writing assistant configured for this application');
      }
      
      // Generate content with writing assistant
      let generatedText = await generateContentWithAssistant(
        threadId,
        application.writing_assistant_id,
        formattedPrompt
      );
      
      console.log("=== Writing assistant content generation complete ===");
      
      // Create new field with generated content
      let newField = await createNewField(
        section_id, 
        generatedText, 
        'assistant', 
        field.user_instructions, 
        field.user_comments_on_ai_output
      );
      
      let currentFieldId = newField.id;
      
      // Review with review assistant if available
      if (application.review_assistant_id) {
        console.log("\n=== REVIEWING CONTENT WITH REVIEW ASSISTANT ===");
        console.log("Using review assistant ID:", application.review_assistant_id);
        
        // Gather requirements for review
        const requirements = {
          grant: section.grant_application?.grant_opportunity?.requirements,
          org: section.grant_application?.grant_opportunity?.org_requirements
        };
        
        // Review the content
        generatedText = await reviewContentWithAssistant(
          threadId,
          application.review_assistant_id,
          generatedText,
          requirements
        );
        
        console.log("=== Review assistant content review complete ===");
        
        // Create another field with reviewed content
        newField = await createNewField(
          section_id, 
          generatedText, 
          'assistant-reviewed', 
          field.user_instructions, 
          field.user_comments_on_ai_output
        );
        
        currentFieldId = newField.id;
      } else {
        console.log("No review assistant configured for this application, skipping review step");
      }
      
      console.log("=== Handler execution completed successfully ===");
      return new Response(JSON.stringify({
        success: true,
        field_id: currentFieldId,
        previous_field_id: field_id
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } catch (error) {
      console.error('Error during content generation:', error);
      
      // Create a new field with the error message
      try {
        const errorMessage = `[GENERATION FAILED]
Error: ${error instanceof Error ? error.message : 'Unknown error'}
Time: ${new Date().toISOString()}

Please try again or contact support if the issue persists.`;
        
        // Create a new field record with the error message
        const newField = await createNewField(
          section_id, 
          errorMessage, 
          'failed', 
          field.user_instructions, 
          field.user_comments_on_ai_output
        );
        
        // Return the error response
        return new Response(JSON.stringify({
          success: false,
          field_id: newField.id,
          previous_field_id: field_id,
          error: error instanceof Error ? error.message : 'Unknown error'
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
      
      // If error field creation fails, throw the original error
      throw new EdgeFunctionError(
        ERROR_CODES.AI_ERROR,
        `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

  } catch (error) {
    console.error('Error in handler:', error);
    return handleError(error, { headers: corsHeaders });
  }
}); 