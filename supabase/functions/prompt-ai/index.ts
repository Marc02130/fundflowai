import { createClient } from '@supabase/supabase-js';
import { handleError, EdgeFunctionError, ERROR_CODES } from '../shared/errors';
import { generateText, refineText } from '../shared/openai';
import { validateUserSession, validateUserAccess } from '../shared/auth';

// Create Supabase client
// @ts-ignore
const supabase = globalThis.supabase || (() => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  return createClient(supabaseUrl, supabaseAnonKey);
})();

// Get section data
async function getSectionData(sectionId: string) {
  const { data, error } = await supabase
    .from('grant_application_sections')
    .select('id, grant_application_id, grant_section_id, ai_generator_prompt, name as section_name, is_completed')
    .eq('id', sectionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Section not found');
    }
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section data: ${error.message}`);
  }

  if (!data) {
    throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Section not found');
  }

  return data;
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
  const { data, error } = await supabase
    .rpc('get_section_attachments', { section_id: sectionId });

  if (error) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section attachments: ${error.message}`);
  }

  return data;
}

// Get section context
async function getSectionContext(sectionId: string) {
  const { data, error } = await supabase
    .from('grant_application_section_fields')
    .select('user_instructions, user_comments_on_ai_output, ai_output')
    .eq('grant_application_section_id', sectionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section context: ${error.message}`);
  }

  return data || null;
}

// Save section field
async function saveSectionField(sectionId: string, aiOutput: string) {
  const { data, error } = await supabase
    .from('grant_application_section_fields')
    .insert({
      grant_application_section_id: sectionId,
      ai_output: aiOutput,
      ai_model: 'gpt-4'
    })
    .select('id')
    .single();

  if (error) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to save section field: ${error.message}`);
  }

  return data;
}

// Main handler
export async function handler(request: Request) {
  try {
    console.log("=== Starting handler execution ===");
    
    // Validate request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.log("Missing authorization header");
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Missing authorization header');
    }

    const body = await request.json();
    const { section_id, prompt_id } = body;
    console.log("Request body:", { section_id, prompt_id });

    if (!section_id) {
      console.log("Missing section_id");
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'section_id is required');
    }

    // Validate user session
    console.log("Validating user session...");
    const userId = await validateUserSession(authHeader);
    console.log("User session validated, userId:", userId);

    // Get section data
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

    // Get prompt
    console.log("Getting prompt...");
    let prompt = section.ai_generator_prompt;
    if (prompt_id) {
      console.log("Using custom prompt with ID:", prompt_id);
      const userPrompt = await getUserPrompt(prompt_id);
      prompt = userPrompt.prompt_text;
    }
    console.log("Final prompt:", prompt);

    // Get attachments and context
    console.log("Getting attachments and context...");
    const [attachments, context] = await Promise.all([
      getSectionAttachments(section_id),
      getSectionContext(section_id)
    ]);
    console.log("Attachments:", attachments);
    console.log("Context:", context);

    // Construct AI request
    console.log("Constructing AI request...");
    const aiRequest = {
      prompt,
      attachments: attachments.map(a => ({
        name: a.file_name,
        type: a.file_type,
        path: a.file_path
      })),
      context: context ? {
        instructions: context.user_instructions,
        comments: context.user_comments_on_ai_output,
        previousOutput: context.ai_output
      } : null
    };
    console.log("AI request constructed:", aiRequest);

    // Generate text
    console.log("Generating text...");
    const generatedText = await generateText(
      JSON.stringify(aiRequest),
      'gpt-4',
      2000,
      0.7
    );
    console.log("Text generated:", generatedText);

    // Refine text through multiple stages as per requirements
    console.log("Refining text...");
    let refinedText = generatedText;
    
    // First check spelling and grammar per requirements
    console.log("Checking spelling and grammar...");
    const spellingPrompt = `Act as a proofreading expert tasked with correcting grammatical, spelling and punctuation errors in the given text. Identify any mistakes, and make necessary corrections to ensure clarity, accuracy, enhance readability and flow. Text: ${refinedText}`;
    refinedText = await refineText(refinedText, 'spelling', spellingPrompt);
    console.log("Spelling and grammar checked:", refinedText);
    
    // Then check logic and consistency per requirements
    console.log("Checking logic and consistency...");
    const logicPrompt = `Review the following text for logical errors, contradictions, and inconsistencies. Identify any issues and provide corrected versions while maintaining the original meaning and intent of the text: ${refinedText}`;
    refinedText = await refineText(refinedText, 'logic', logicPrompt);
    console.log("Logic and consistency checked:", refinedText);
    
    // Finally ensure compliance with grant requirements per requirements
    console.log("Checking compliance with requirements...");
    const requirementsPrompt = `Review the following text for compliance with the requirements specified in the provided links. Identify any non-compliant areas, explain the issues, and suggest corrections to ensure full compliance while maintaining the original intent of the text: '${refinedText}'. Please refer to the following links for compliance requirements: ${section.grant_requirements || ''}`;
    refinedText = await refineText(refinedText, 'requirements', requirementsPrompt);
    console.log("Requirements compliance checked:", refinedText);

    // Save result
    console.log("Saving result...");
    const field = await saveSectionField(section_id, refinedText);
    console.log("Result saved, field:", field);

    console.log("=== Handler execution completed successfully ===");
    return new Response(JSON.stringify({
      field_id: field.id,
      ai_output: refinedText
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