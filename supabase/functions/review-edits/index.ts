/**
 * Review Edits Edge Function
 * 
 * Reviews and improves manually edited grant application content using AI assistance.
 * Maintains user's intent while enhancing academic quality and style.
 * 
 * @module review-edits
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
    
    // Step 1: Spelling and grammar check
    console.log("\n=== Step 1: Spelling Check ===");
    console.log("Input text (first 100 chars):", latestField.ai_output.substring(0, 100));
    const spellingPrompt = `Act as a proofreading expert tasked with correcting grammatical, spelling and punctuation errors in the given text. Identify any mistakes, and make necessary corrections to ensure clarity, accuracy, enhance readability and flow. Text: ${latestField.ai_output}`;
    console.log("Spelling prompt length:", spellingPrompt.length);
    console.log('Starting spelling check...');
    const spellingCheck = await refineText(latestField.ai_output, 'spelling', spellingPrompt);
    if (!spellingCheck) {
      console.error('Spelling check failed - no text returned');
      throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'Failed to complete spelling check');
    }
    console.log('Spelling check complete. Output length:', spellingCheck.length);
    console.log("Output text (first 100 chars):", spellingCheck.substring(0, 100));
    
    // Step 2: Logical errors check
    console.log("\n=== Step 2: Logic Check ===");
    console.log("Input text (first 100 chars):", spellingCheck.substring(0, 100));
    const logicPrompt = `Review the following text for logical errors, contradictions, and inconsistencies. Identify any issues and provide corrected versions while maintaining the original meaning and intent of the text: ${spellingCheck}`;
    console.log("Logic prompt length:", logicPrompt.length);
    console.log('Starting logic check...');
    const logicCheck = await refineText(spellingCheck, 'logic', logicPrompt);
    if (!logicCheck) {
      console.error('Logic check failed - no text returned');
      throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'Failed to complete logic check');
    }
    console.log('Logic check complete. Output length:', logicCheck.length);
    console.log("Output text (first 100 chars):", logicCheck.substring(0, 100));
    
    // Step 3: Compliance check
    console.log("\n=== Step 3: Compliance Check ===");
    console.log("Input text (first 100 chars):", logicCheck.substring(0, 100));
    
    // Check if we have any requirements
    const hasRequirements = section.grant_application?.grant_opportunity?.requirements?.length > 0;
    console.log("Has requirements:", hasRequirements);

    let finalText;
    if (hasRequirements) {
      const requirements = section.grant_application.grant_opportunity.requirements.map(req => `- ${req.url}`).join('\n');
      console.log("Requirements:", requirements);
      const compliancePrompt = `Review the following text for compliance with the requirements specified below. Identify any non-compliant areas, explain the issues, and suggest corrections to ensure full compliance while maintaining the original intent of the text.\n\nRequirements:\n${requirements}\n\nText:\n${logicCheck}`;
      console.log("Compliance prompt length:", compliancePrompt.length);
      console.log('Starting compliance check...');
      finalText = await refineText(logicCheck, 'requirements', compliancePrompt);
      if (!finalText) {
        console.error('Compliance check failed - no text returned');
        throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'Failed to complete compliance check');
      }
      console.log('Compliance check complete. Output length:', finalText.length);
      console.log("Output text (first 100 chars):", finalText.substring(0, 100));
    } else {
      console.log('No requirements found, skipping compliance check');
      finalText = logicCheck;
    }

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
    console.error('Error in handler:', error);
    return handleError(error, { headers: corsHeaders });
  }
}); 