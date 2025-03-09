import { createClient } from '@supabase/supabase-js';
import { handleError, EdgeFunctionError, ERROR_CODES } from './errors';
import { validateUserSession, validateUserAccess } from './auth';

/**
 * Create Visuals Edge Function
 * 
 * Handles the generation and management of AI-powered visualizations for grant applications
 * using OpenAI's image variation API. Manages file storage and document records.
 * 
 * @module create-visuals
 */

// Create Supabase client
// @ts-ignore
const supabase = globalThis.supabase || (() => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
})();

/**
 * Retrieves section data including grant section details
 * @param {string} sectionId - ID of the section to fetch
 * @returns {Promise<Object>} Combined section and grant section data
 * @throws {EdgeFunctionError} If section or grant section not found
 */
async function getSectionData(sectionId: string) {
  // First get the section data
  const { data: sectionData, error: sectionError } = await supabase
    .from('grant_application_section')
    .select('id, grant_application_id, grant_section_id')
    .eq('id', sectionId)
    .single();

  if (sectionError) {
    if (sectionError.code === 'PGRST116') {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Section not found', undefined, 404);
    }
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get section data: ${sectionError.message}`);
  }

  if (!sectionData) {
    throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Section not found', undefined, 404);
  }

  // Then get the grant section data
  const { data: grantSectionData, error: grantSectionError } = await supabase
    .from('grant_sections')
    .select('id, ai_visualizations_prompt')
    .eq('id', sectionData.grant_section_id)
    .single();

  if (grantSectionError) {
    if (grantSectionError.code === 'PGRST116') {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Grant section not found', undefined, 404);
    }
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get grant section data: ${grantSectionError.message}`);
  }

  if (!grantSectionData) {
    throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Grant section not found', undefined, 404);
  }

  return {
    ...sectionData,
    grant_sections: grantSectionData
  };
}

/**
 * Retrieves document data for a specific image
 * @param {string} sectionId - ID of the section
 * @param {string} imagePath - Path to the image in storage
 * @returns {Promise<Object>} Document metadata
 * @throws {EdgeFunctionError} If document not found or database error
 */
async function getDocumentData(sectionId: string, imagePath: string) {
  // First check section-specific documents
  const { data: sectionDoc, error: sectionError } = await supabase
    .from('grant_application_section_documents')
    .select('*')
    .eq('grant_application_section_id', sectionId)
    .eq('file_path', imagePath)
    .single();

  if (sectionDoc) {
    return sectionDoc;
  }

  // If not found in section documents, check application-wide documents
  const { data: appDoc, error: appError } = await supabase
    .from('grant_application_documents')
    .select('*')
    .eq('grant_application_id', sectionId)
    .eq('file_path', imagePath)
    .single();

  if (appDoc) {
    return appDoc;
  }

  // If both queries return no data, throw NOT_FOUND error
  if ((sectionError && sectionError.code === 'PGRST116') || (appError && appError.code === 'PGRST116')) {
    throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Image not found', undefined, 404);
  }

  // If there's any other error, throw DB_ERROR
  if (sectionError) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get document data: ${sectionError.message}`);
  }
  if (appError) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to get document data: ${appError.message}`);
  }

  // If we get here, no data was found
  throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Image not found', undefined, 404);
}

/**
 * Generates and saves an AI visualization
 * @param {string} sectionId - ID of the section
 * @param {string} imagePath - Path to source image
 * @param {string} prompt - Generation prompt
 * @returns {Promise<Object>} Created document record
 * @throws {EdgeFunctionError} If generation, storage, or database operations fail
 */
async function generateAndSaveVisual(sectionId: string, imagePath: string, prompt: string) {
  console.log("Starting generateAndSaveVisual with:", { sectionId, imagePath, prompt });

  // Get the original document to get the actual file name
  const { data: originalDoc } = await supabase
    .from('grant_application_section_documents')
    .select('file_name')
    .eq('file_path', imagePath)
    .single();

  // Download the source image from storage
  console.log("Downloading source image from path:", imagePath);
  const { data: sourceImage, error: downloadError } = await supabase.storage
    .from('grant-attachments')
    .download(imagePath);

  if (downloadError) {
    console.error("Error downloading source image:", downloadError);
    throw new EdgeFunctionError(
      ERROR_CODES.STORAGE_ERROR, 
      `Failed to download source image: ${downloadError.message}`,
      { path: imagePath, error: downloadError }
    );
  }

  if (!sourceImage) {
    console.error("No image data received from storage");
    throw new EdgeFunctionError(ERROR_CODES.STORAGE_ERROR, 'No image data received from storage');
  }

  console.log("Successfully downloaded source image, size:", sourceImage.size);

  // Create form data for OpenAI API
  const formData = new FormData();
  formData.append('image', sourceImage);
  formData.append('n', '1');
  formData.append('size', '1024x1024');
  formData.append('response_format', 'url');

  // Call OpenAI API to generate visualization
  console.log("Calling OpenAI API to generate visualization");
  const response = await fetch('https://api.openai.com/v1/images/variations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("OpenAI API error:", error);
    throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'Failed to generate visualization', { error });
  }

  const { data } = await response.json();
  const generatedImageUrl = data[0].url;

  // Download the generated image
  const imageResponse = await fetch(generatedImageUrl);
  if (!imageResponse.ok) {
    throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'Failed to download generated image');
  }
  const imageBlob = await imageResponse.blob();

  // Upload to Supabase Storage
  const pathParts = imagePath.split('/');
  const originalFileName = originalDoc?.file_name || pathParts.pop() || 'visualization.png';
  const folderPath = pathParts.join('/');
  const newFileName = `ai_${originalFileName}`;
  const fileName = folderPath ? `${folderPath}/${newFileName}` : newFileName;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('grant-attachments')
    .upload(fileName, imageBlob, {
      contentType: 'image/png',
      upsert: false
    });

  if (uploadError) {
    throw new EdgeFunctionError(ERROR_CODES.STORAGE_ERROR, `Failed to upload visualization: ${uploadError.message}`);
  }

  // Save document record
  const { data: docData, error: docError } = await supabase
    .from('grant_application_section_documents')
    .insert({
      grant_application_section_id: sectionId,
      file_path: fileName,
      file_type: 'png',
      file_name: newFileName
    })
    .select()
    .single();

  if (docError) {
    throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, `Failed to save document record: ${docError.message}`);
  }

  return docData;
}

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

/**
 * Main handler for the create-visuals Edge Function
 * 
 * Processes:
 * 1. Validates request and user session
 * 2. Downloads and processes source image
 * 3. Generates AI variation
 * 4. Saves result and creates document record
 * 
 * @throws {EdgeFunctionError} For validation or processing errors
 */
Deno.serve(async (request) => {
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Add CORS headers to all responses
    const headers = {
      'Content-Type': 'application/json',
      ...corsHeaders,
    };

    console.log("=== Starting create-visuals handler execution ===");
    
    // Validate request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.log("Missing authorization header");
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Missing authorization header');
    }

    const body = await request.json();
    const { section_id, image_path } = body;
    console.log("Request body:", { section_id, image_path });

    if (!section_id || !image_path) {
      console.log("Missing required parameters");
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'section_id and image_path are required');
    }

    // Validate user session
    console.log("Validating user session...");
    const userId = await validateUserSession(authHeader);
    console.log("User session validated, userId:", userId);

    // Get section data
    console.log("Getting section data...");
    const section = await getSectionData(section_id);
    console.log("Section data retrieved:", section);

    if (!section.grant_sections?.ai_visualizations_prompt) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'Section does not have a visualization prompt configured');
    }

    // Validate user access
    console.log("Validating user access...");
    const hasAccess = await validateUserAccess(userId, section.grant_application_id);
    console.log("User access validation result:", hasAccess);
    if (!hasAccess) {
      console.log("User does not have access");
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'User does not have access to this application');
    }

    // Get document data
    console.log("Getting document data...");
    const document = await getDocumentData(section_id, image_path);
    console.log("Document data retrieved:", document);

    // Generate and save visualization
    console.log("Generating and saving visualization...");
    const result = await generateAndSaveVisual(section_id, image_path, section.grant_sections.ai_visualizations_prompt);
    console.log("Visualization saved:", result);

    console.log("=== Handler execution completed successfully ===");
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers,
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
    return handleError(error, { headers: corsHeaders });
  }
}); 