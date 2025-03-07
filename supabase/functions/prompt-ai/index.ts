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

// Custom error response function
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

// Get section data step by fucking step
async function getSectionData(sectionId: string) {
  console.log('=== Getting Section Data ===');
  console.log('Section ID:', sectionId);
  
  try {
    // 1. Get the fucking base section
    const { data: sectionData, error: sectionError } = await supabase
      .from('grant_application_section')
      .select('*')
      .eq('id', sectionId)
      .single();

    if (sectionError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section: ${sectionError.message}`);
    if (!sectionData) throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Section not found');
    
    // 2. Get the fucking grant section
    const { data: grantSection, error: grantSectionError } = await supabase
      .from('grant_sections')
      .select('*')
      .eq('id', sectionData.grant_section_id)
      .single();
      
    if (grantSectionError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get grant section: ${grantSectionError.message}`);
    
    // 3. Get the fucking application
    const { data: application, error: applicationError } = await supabase
      .from('grant_applications')
      .select('*')
      .eq('id', sectionData.grant_application_id)
      .single();
      
    if (applicationError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get application: ${applicationError.message}`);
    
    // 4. Get the fucking grant opportunity
    const { data: opportunity, error: opportunityError } = await supabase
      .from('grant_opportunities')
      .select('*')
      .eq('id', application.grant_opportunity_id)
      .single();
      
    if (opportunityError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get opportunity: ${opportunityError.message}`);
    
    // 5. Get the fucking requirements
    const { data: requirements, error: requirementsError } = await supabase
      .from('grant_requirements')
      .select('*')
      .eq('grant_id', opportunity.grant_id);
      
    if (requirementsError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get requirements: ${requirementsError.message}`);

    // Put this shit together
    const result = {
      ...sectionData,
      grant_section: grantSection,
      grant_application: {
        ...application,
        grant_opportunity: {
          ...opportunity,
          requirements: requirements
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

// Get user prompt
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

// Get section attachments
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

// Get field data
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

// Update field with new content and stage
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

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log("=== Starting handler execution ===");
    
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

    const { section_id, field_id, prompt_id } = body;
    console.log("Request body:", { section_id, field_id, prompt_id });

    if (!section_id || !field_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'section_id and field_id are required');
    }

    // Validate user session
    console.log("=== User Validation ===");
    console.log("Auth Header:", authHeader);
    const userId = await validateUserSession(authHeader);
    console.log("User ID from session:", userId);

    // Get section and field data
    console.log("=== Getting Data ===");
    console.log("Getting section and field data...");
    const [section, field] = await Promise.all([
      getSectionData(section_id),
      getFieldData(field_id)
    ]);
    console.log("Section data:", section);
    console.log("Field data:", field);

    // Validate user access
    console.log("=== Access Check ===");
    console.log("Raw auth header:", authHeader);
    console.log("User ID from JWT:", userId);
    console.log("Section data:", JSON.stringify(section, null, 2));
    console.log("Application ID:", section.grant_application.id);
    
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
      console.log("Direct DB access check result:", hasAccess);
      
      if (!hasAccess) {
        console.error("Access denied for user", userId, "to application", section.grant_application.id);
        throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'User does not have access to this application');
      }
      console.log("Access check passed");
    } catch (err) {
      console.error("Error during access check:", err);
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Failed to validate user access');
    }

    // Get prompt text
    console.log("Getting prompt...");
    let promptText = section.grant_section?.ai_generator_prompt;
    if (prompt_id) {
      const userPrompt = await getUserPrompt(prompt_id);
      promptText = userPrompt.prompt_text;
    }

    // Get attachments and context
    console.log("Getting attachments and context...");
    const attachments = await getSectionAttachments(section_id);

    // Stage 1: Initial Generation
    console.log("Stage 1: Initial Generation...");
    const aiRequest = {
      prompt: promptText,
      attachments: attachments.map(a => ({
        name: a.file_name,
        type: a.file_type,
        path: a.file_path
      })),
      context: {
        instructions: field.user_instructions,
        comments: field.user_comments_on_ai_output
      }
    };
    
    // Format the prompt properly
    const formattedPrompt = `
Instructions: ${aiRequest.context.instructions || 'No specific instructions provided'}

Previous Comments: ${aiRequest.context.comments || 'No previous comments'}

Attachments:
${aiRequest.attachments.map(a => `- ${a.name} (${a.type}): ${a.path}`).join('\n')}

Prompt:
${aiRequest.prompt}
`;
    
    let generatedText = await generateText(
      formattedPrompt,
      'gpt-4',
      2000,
      0.7
    );
    await updateField(field_id, generatedText, 'initial');
    
    // Stage 2: Spelling and Grammar Check
    console.log("Stage 2: Spelling and Grammar Check...");
    const spellingPrompt = `Act as a proofreading expert tasked with correcting grammatical, spelling and punctuation errors in the given text. Identify any mistakes, and make necessary corrections to ensure clarity, accuracy, enhance readability and flow. Text: ${generatedText}`;
    generatedText = await refineText(generatedText, 'spelling', spellingPrompt);
    await updateField(field_id, generatedText, 'spelling');
    
    // Stage 3: Logic Check
    console.log("Stage 3: Logic Check...");
    const logicPrompt = `Review the following text for logical errors, contradictions, and inconsistencies. Identify any issues and provide corrected versions while maintaining the original meaning and intent of the text: ${generatedText}`;
    generatedText = await refineText(generatedText, 'logic', logicPrompt);
    await updateField(field_id, generatedText, 'logic');
    
    // Stage 4: Requirements Check
    console.log("Stage 4: Requirements Check...");
    const requirementsPrompt = `Review the following text for compliance with grant requirements:

Content to Review:
${generatedText}

Requirements to Check Against:
${section.grant_application?.grant_opportunity?.requirements?.map(req => `- ${req.requirement_text}`).join('\n') || 'No specific requirements provided'}`;
    
    generatedText = await refineText(generatedText, 'requirements', requirementsPrompt);
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