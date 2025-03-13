/**
 * Prompt AI Edge Function
 * 
 * Generates and refines grant application content using AI assistance.
 * Uses OpenAI's GPT models with multiple refinement stages to ensure quality and compliance.
 * 
 * @module prompt-ai
 */

import { createClient } from '@supabase/supabase-js';
import { handleError, EdgeFunctionError, ERROR_CODES } from '../shared/errors.ts';
import { validateUserSession, validateUserAccess } from '../shared/auth.ts';
import { generateText, refineText } from '../shared/openai.ts';

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
 * Gets all attachments for a section.
 * @param {string} sectionId - ID of the grant section
 * @returns {Promise<Array<Object>>} List of attachments
 * @throws {EdgeFunctionError} If retrieval fails
 */
async function getSectionAttachments(sectionId: string) {
  console.log("=== Getting Section Attachments ===");
  const { data: attachments, error: attachmentsError } = await supabase
    .from('grant_application_section_documents')
    .select('*')
    .eq('grant_application_section_id', sectionId);

  if (attachmentsError) {
    console.error("Error getting attachments:", attachmentsError);
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section attachments: ${attachmentsError.message}`);
  }

  console.log("Section attachments:", attachments);
  return attachments;
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
 * Updates field with new AI-generated content.
 * @param {string} fieldId - ID of the field to update
 * @param {string} aiOutput - Generated content
 * @param {string} stage - Processing stage identifier
 * @throws {EdgeFunctionError} If update fails
 */
async function updateField(fieldId: string, aiOutput: string, stage: string) {
  const { error } = await supabase
    .from('grant_application_section_fields')
    .update({
      ai_output: aiOutput,
      ai_model: `${Deno.env.get('OPENAI_MODEL')}-${stage}`,
      updated_at: new Date().toISOString()
    })
    .eq('id', fieldId);

  if (error) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to update field: ${error.message}`);
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

    // Get attachments and context
    const attachments = await getSectionAttachments(section_id);

    // Get attachment contents
    const attachmentContents = await Promise.all(
      attachments.map(async (a) => {
        const { data, error } = await supabase
          .storage
          .from('grant-documents')
          .download(a.file_path);
        
        if (error) {
          console.error(`Failed to download attachment ${a.file_name}:`, error);
          return `[Failed to load ${a.file_name}]`;
        }

        try {
          switch(a.file_type) {
            case 'pdf':
            case 'doc':
            case 'docx':
            case 'xls':
            case 'xlsx':
            case 'ppt':
            case 'pptx':
            case 'txt':
            case 'json':
            case 'xml':
            case 'csv':
              const textContent = await data.text();
              return truncateText(textContent);
            
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'tif':
            case 'tiff':
            case 'svg':
              return `[Image file: ${a.file_name}]\n` +
                     `File size: ${data.size} bytes`;
            
            default:
              return `[Unsupported file type: ${a.file_type}]`;
          }
        } catch (e) {
          console.error(`Failed to process ${a.file_name}:`, e);
          return `[Failed to process ${a.file_name}: ${e.message}]`;
        }
      })
    );

    function truncateText(text: string, maxLength: number = 4000): string {
      if (text.length <= maxLength) return text;
      const halfLength = Math.floor(maxLength / 2);
      return text.substring(0, halfLength) + 
             "\n...[content truncated]...\n" + 
             text.substring(text.length - halfLength);
    }

    // Stage 1: Initial Generation
    console.log("\n=== STAGE 1: INITIAL GENERATION - START ===");
    console.log("Prompt Text:", promptText);
    console.log("Field Data:", field);
    console.log("Attachments:", attachments);

    const aiRequest = {
      prompt: promptText,
      attachments: attachments.map((a, i) => ({
        name: a.file_name,
        type: a.file_type,
        content: attachmentContents[i]
      })),
      context: {
        instructions: field.user_instructions,
        comments: field.user_comments_on_ai_output,
        content: field.ai_output
      }
    };
    console.log("AI Request:", aiRequest);
    
    // Format the prompt properly
    const formattedPrompt = `
Instructions: ${aiRequest.context.instructions || 'No specific instructions provided'}

Previous Comments: ${aiRequest.context.comments || 'No previous comments'}

Previous Content: ${aiRequest.context.content || 'No previous content'}

Reference Materials:
${aiRequest.attachments.map(a => `=== ${a.name} ===\n${a.content}\n`).join('\n')}

Prompt:
${aiRequest.prompt}
`;
    console.log("Formatted Prompt:", formattedPrompt);
    
    let generatedText = await generateText(
      formattedPrompt,
      0.7
    );
    console.log("=== STAGE 1: INITIAL GENERATION - COMPLETE ===");
    console.log("Generated Text:", generatedText);
    await updateField(field_id, generatedText, 'initial');
    
    // Stage 2: Spelling and Grammar Check
    console.log("\n=== STAGE 2: SPELLING & LOGIC CHECK - START ===");
    console.log("Input Text for Spelling and Logic Check:", generatedText);
    const spellingPrompt = `Act as a proofreading expert. Correct grammatical, spelling and punctuation errors in the given text. Identify any mistakes, and make necessary corrections to ensure clarity, accuracy, enhance readability and flow. If no changes are needed, return the original text. Text: ${generatedText}`;
    console.log("Spelling Prompt:", spellingPrompt);
    
    generatedText = await refineText(generatedText, 'spelling and logic', spellingPrompt);
    console.log("=== STAGE 2: SPELLING & LOGIC CHECK - COMPLETE ===");
    console.log("Text After Spelling and Logic Check:", generatedText);
    await updateField(field_id, generatedText, 'spelling and logic');
    
    // Stage 3: Logic Check
    console.log("\n=== STAGE 3: LOGIC CHECK - START ===");
    console.log("Input Text for Logic Check:", generatedText);
    const logicPrompt = `Review the following text for logical errors, contradictions, and inconsistencies. If no changes are needed, return the original text. Identify any issues and provide corrected versions while maintaining the original meaning and intent of the text: ${generatedText}`;
    console.log("Logic Prompt:", logicPrompt);
    
    generatedText = await refineText(generatedText, 'logic', logicPrompt);
    console.log("=== STAGE 3: LOGIC CHECK - COMPLETE ===");
    console.log("Text After Logic Check:", generatedText);
    await updateField(field_id, generatedText, 'logic');
    
    // Stage 4: Requirements Check
    console.log("\n=== STAGE 3: REQUIREMENTS CHECK - START ===");
    console.log("Input Text for Requirements Check:", generatedText);
    const requirementsPrompt = `Review the following text for compliance with grant requirements. If no changes are needed, return the complete original text. Make any necessary corrections while maintaining the original meaning and intent.

Content to Review:
${generatedText}

Grant Requirements:
${section.grant_application?.grant_opportunity?.requirements?.map(req => `- ${req.requirement}: ${req.url}`).join('\n') || 'No grant-specific requirements provided'}

Organization Requirements:
${section.grant_application?.grant_opportunity?.org_requirements?.map(req => `- ${req.requirement}: ${req.url}`).join('\n') || 'No organization-specific requirements provided'}`;
    console.log("Requirements Prompt:", requirementsPrompt);
    console.log("Grant Requirements:", section.grant_application?.grant_opportunity?.requirements);
    console.log("Organization Requirements:", section.grant_application?.grant_opportunity?.org_requirements);
    
    generatedText = await refineText(generatedText, 'requirements', requirementsPrompt);
    console.log("=== STAGE 4: REQUIREMENTS CHECK - COMPLETE ===");
    console.log("Text After Requirements Check:", generatedText);
    await updateField(field_id, generatedText, 'requirements');

    console.log("=== Handler execution completed successfully ===");
    return new Response(JSON.stringify({
      success: true,
      field_id: field_id
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error in handler:', error);
    return handleError(error, { headers: corsHeaders });
  }
}); 