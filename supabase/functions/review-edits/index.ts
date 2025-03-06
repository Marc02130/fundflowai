import { createClient } from '@supabase/supabase-js';
import { handleError, EdgeFunctionError, ERROR_CODES } from '../shared/errors';
import { refineText } from '../shared/openai';
import { validateUserSession, validateUserAccess } from '../shared/auth';

// Create Supabase client
// @ts-ignore
const supabase = globalThis.supabase || (() => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  return createClient(supabaseUrl, supabaseAnonKey);
})();

// Get section data with latest ai_output
async function getSectionData(sectionId: string) {
  const { data, error } = await supabase
    .from('grant_application_sections')
    .select(`
      id, 
      grant_application_id, 
      grant_section_id, 
      name as section_name, 
      grant_requirements,
      grant_application_section_fields!inner (
        id,
        ai_output,
        user_instructions,
        user_comments_on_ai_output
      )
    `)
    .eq('id', sectionId)
    .order('created_at', { foreignTable: 'grant_application_section_fields', ascending: false })
    .limit(1, { foreignTable: 'grant_application_section_fields' })
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Section not found', undefined, 404);
    }
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section data: ${error.message}`);
  }

  if (!data) {
    throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Section not found', undefined, 404);
  }

  return data;
}

// Save new section field with review results
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
      ai_model: previousField.ai_model || 'gpt-4',
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

// Main handler
export async function handler(request: Request) {
  try {
    console.log("=== Starting review-edits handler execution ===");
    
    // Validate request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.log("Missing authorization header");
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Missing authorization header');
    }

    const body = await request.json();
    const { section_id } = body;
    console.log("Request body:", { section_id });

    if (!section_id) {
      console.log("Missing required parameters");
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'section_id is required');
    }

    // Validate user session
    console.log("Validating user session...");
    const userId = await validateUserSession(authHeader);
    console.log("User session validated, userId:", userId);

    // Get section data with latest ai_output
    console.log("Getting section data...");
    const section = await getSectionData(section_id);
    console.log("Section data retrieved:", section);

    // Validate user access
    console.log("Validating user access...");
    const hasAccess = await validateUserAccess(userId, section.grant_application_id);
    console.log("User access validation result:", hasAccess);
    if (!hasAccess) {
      console.log("User does not have access");
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'User does not have access to this application');
    }

    // Get the latest field data
    const latestField = section.grant_application_section_fields[0];
    if (!latestField?.ai_output) {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'No AI output found for this section', undefined, 404);
    }

    // Perform all three reviews in sequence
    console.log("Starting comprehensive review...");
    let reviewedText = latestField.ai_output;
    const reviewResults = [];

    // 1. Spelling and Grammar Review
    console.log("Performing spelling and grammar review...");
    const spellingPrompt = `Act as a proofreading expert tasked with correcting grammatical, spelling and punctuation errors in the given text. Identify any mistakes, and make necessary corrections to ensure clarity, accuracy, enhance readability and flow. Text: ${reviewedText}`;
    reviewedText = await refineText(reviewedText, 'spelling', spellingPrompt);
    reviewResults.push({ type: 'spelling', output: reviewedText });
    console.log("Spelling and grammar review completed");

    // 2. Logic Review
    console.log("Performing logic review...");
    const logicPrompt = `Review the following text for logical errors, contradictions, and inconsistencies. Identify any issues and provide corrected versions while maintaining the original meaning and intent of the text: ${reviewedText}`;
    reviewedText = await refineText(reviewedText, 'logic', logicPrompt);
    reviewResults.push({ type: 'logic', output: reviewedText });
    console.log("Logic review completed");

    // 3. Requirements Review
    console.log("Performing requirements review...");
    const requirementsPrompt = `Review the following text for compliance with the requirements specified in the provided links. Identify any non-compliant areas, explain the issues, and suggest corrections to ensure full compliance while maintaining the original intent of the text: '${reviewedText}'. Please refer to the following links for compliance requirements: ${section.grant_requirements || ''}`;
    reviewedText = await refineText(reviewedText, 'requirements', requirementsPrompt);
    reviewResults.push({ type: 'requirements', output: reviewedText });
    console.log("Requirements review completed");

    // Save new section field with review results, preserving all field values
    console.log("Saving new section field...");
    const newField = await saveNewSectionField(section_id, reviewedText, latestField);
    console.log("New section field saved:", newField);

    console.log("=== Handler execution completed successfully ===");
    return new Response(JSON.stringify({
      review_results: reviewResults,
      field_id: newField.id,
      ai_output: reviewedText
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.log("=== Error caught in handler ===");
    console.log("Error type:", error.constructor.name);
    console.log("Error message:", error.message);
    if (error instanceof EdgeFunctionError) {
      console.log("Error code:", error.code);
      console.log("Error details:", error.details);
    }
    console.log("=== End error details ===");
    return handleError(error);
  }
} 