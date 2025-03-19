/**
 * Generate Grant Edge Function
 * 
 * Handles automated generation of complete grant applications by processing multiple sections
 * in parallel. Optimizes performance through single-pass generation and minimal database operations.
 * 
 * @module generate-grant
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
  'Content-Type': 'application/json',
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
      .select('*')
      .eq('id', applicationId)
      .single();

    if (applicationError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get application: ${applicationError.message}`);
    if (!application) throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Application not found');

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

    // Get documents and their vectors
    const { data: documents, error: documentsError } = await supabase
      .from('grant_application_documents')
      .select('id, file_name, file_type')
      .eq('grant_application_id', applicationId);

    if (documentsError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get documents: ${documentsError.message}`);

    // Get document vectors if documents exist
    let documentVectors = [];
    if (documents?.length) {
      const { data: vectors, error: vectorsError } = await supabase
        .from('grant_application_document_vectors')
        .select('document_id, chunk_text')
        .in('document_id', documents.map(d => d.id));

      if (vectorsError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get document vectors: ${vectorsError.message}`);
      documentVectors = vectors || [];
    }

    // Get section documents and their vectors
    const { data: sectionDocs, error: sectionDocsError } = await supabase
      .from('grant_application_section_documents')
      .select('id, file_name, file_type, grant_application_section_id')
      .in('grant_application_section_id', sections.map(s => s.id));

    if (sectionDocsError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section documents: ${sectionDocsError.message}`);

    // Get section document vectors if documents exist
    let sectionDocVectors = [];
    if (sectionDocs?.length) {
      const { data: vectors, error: vectorsError } = await supabase
        .from('grant_application_section_document_vectors')
        .select('document_id, chunk_text')
        .in('document_id', sectionDocs.map(d => d.id));

      if (vectorsError) throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section document vectors: ${vectorsError.message}`);
      sectionDocVectors = vectors || [];
    }

    // Combine the data
    return {
      ...application,
      grant_opportunity: {
        ...opportunity,
        requirements: requirements || []
      },
      sections: sections.map(section => ({
        ...section,
        grant_section: sectionDetails?.find(sd => sd.id === section.grant_section_id),
        documents: sectionDocs?.filter(d => d.grant_application_section_id === section.id) || [],
        document_vectors: sectionDocVectors.filter(v => 
          sectionDocs?.some(d => d.id === v.document_id && d.grant_application_section_id === section.id)
        )
      })),
      documents: documents || [],
      document_vectors: documentVectors
    };

  } catch (err) {
    console.error('Error in getApplicationData:', err);
    throw err;
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

    // Format prompt with application context and document chunks
    const formattedPrompt = `
Section Requirements:
${application.grant_opportunity.requirements?.map((req: any) => `- ${req.requirement_text}`).join('\n') || 'No specific requirements'}

Application Context:
${application.description || 'No application description provided'}

Relevant Document Content:
${application.document_vectors.map((v: any) => v.chunk_text).join('\n\n')}

Section-Specific Documents:
${section.document_vectors.map((v: any) => v.chunk_text).join('\n\n')}

${section.grant_section.ai_generator_prompt}

Please ensure your response:
1. Is free of spelling, grammar, and punctuation errors
2. Has no logical errors, contradictions, or inconsistencies
3. Fully complies with all grant requirements listed above
4. Incorporates relevant information from the provided document content where appropriate
`;

    // Generate text with all requirements incorporated
    const generatedText = await generateText(formattedPrompt);
    await updateField(
      field.id, 
      generatedText, 
      'complete', 
      application.description || 'No application description provided'
    );

    return {
      section_id: section.id,
      field_id: field.id,
      status: 'completed'
    };

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

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
}

/**
 * Main handler for the generate-grant Edge Function
 * 
 * Processes:
 * 1. Validates request and user session
 * 2. Processes all sections in parallel
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

    // Process sections in parallel
    const results = {
      successful_sections: [] as any[],
      failed_sections: [] as any[]
    };

    try {
      const sectionPromises = application.sections.map(section => {
        console.log(`Starting section: ${section.grant_section.name}`);
        return processSection(section, application);
      });

      const sectionResults = await Promise.all(sectionPromises);

      for (const result of sectionResults) {
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
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
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