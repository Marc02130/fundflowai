/**
 * Vectorize Grant Requirements Edge Function
 * 
 * This function fetches grant requirement documents from URLs stored in various
 * tables, downloads them, and queues them for processing and vectorization.
 * 
 * It runs after the create-grant-assistant function during grant application creation.
 */

import { createClient } from '@supabase/supabase-js'
import { validateUserSession } from 'auth'
import { ERROR_CODES } from 'errors'

// CORS headers implemented directly in the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Document extensions to file types mapping
const extensionToFileType: Record<string, string> = {
  'pdf': 'pdf',
  'doc': 'doc',
  'docx': 'docx',
  'txt': 'txt',
  'md': 'md',
  'html': 'txt', // HTML will be saved as text after extraction
  'htm': 'txt',
  '': 'txt'  // Default for unknown/no extension
}

// Function to extract filename from URL
function extractFilenameFromUrl(url: string): string {
  try {
    // Try to extract filename from URL path
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const segments = pathname.split('/')
    const lastSegment = segments[segments.length - 1]
    
    // If there's a filename in the URL, use it
    if (lastSegment && lastSegment.includes('.')) {
      return lastSegment
    }
    
    // Otherwise, use the hostname plus a descriptive name
    return `${urlObj.hostname.replace(/\./g, '_')}_requirements`
  } catch (e) {
    // If URL parsing fails, return a fallback name
    return `requirement_document_${new Date().toISOString().slice(0, 10)}`
  }
}

// Function to extract file extension from filename/URL
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex !== -1) {
    return filename.slice(lastDotIndex + 1).toLowerCase()
  }
  return ''
}

// Function to determine content type from URL
function determineContentType(url: string): string {
  const extension = getFileExtension(url)
  return extensionToFileType[extension] || 'txt'
}

// Function to extract user from request
async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  
  try {
    // Use the shared validateUserSession function
    const userId = await validateUserSession(authHeader);
    if (!userId) return null;
    
    // Return a basic user object with the ID
    return { id: userId };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS for browser clients
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const { grant_application_id, vector_store_id } = await req.json()

    if (!grant_application_id) {
      return new Response(
        JSON.stringify({
          error: ERROR_CODES.INVALID_INPUT,
          message: 'Missing required parameter: grant_application_id'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Authenticate user
    const user = await getUserFromRequest(req)
    if (!user) {
      return new Response(
        JSON.stringify({
          error: ERROR_CODES.AUTH_ERROR,
          message: 'Unauthorized request'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false }
      }
    )

    // Get grant application details
    const { data: application, error: applicationError } = await supabaseClient
      .from('grant_applications')
      .select(`
        id,
        grant_opportunity_id,
        grant_opportunities:grant_opportunity_id (
          id, 
          url,
          grant_id,
          grants:grant_id (
            id,
            url,
            organization_id
          )
        )
      `)
      .eq('id', grant_application_id)
      .single()

    if (applicationError || !application) {
      return new Response(
        JSON.stringify({
          error: ERROR_CODES.NOT_FOUND,
          message: 'Grant application not found',
          details: applicationError
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Add type assertions to avoid TypeScript errors with nested objects
    type GrantOpportunity = {
      id: string;
      url: string | null;
      grant_id: string;
      grants: {
        id: string;
        url: string | null;
        organization_id: string;
      }
    }

    // Get IDs safely with type assertions
    // @ts-ignore - Suppressing type errors for the demo
    const grantOpportunity = application.grant_opportunities as unknown as GrantOpportunity;
    const grantId = grantOpportunity?.grants?.id;
    const organizationId = grantOpportunity?.grants?.organization_id;

    // Collect all URLs to process
    const urls: { url: string, source: string }[] = []

    // Add grant opportunity URL if available
    if (grantOpportunity?.url) {
      urls.push({
        url: grantOpportunity.url,
        source: 'grant_opportunity'
      })
    }

    // Add grant URL if available
    if (grantId && grantOpportunity?.grants?.url) {
      urls.push({
        url: grantOpportunity.grants.url,
        source: 'grant'
      })
    }

    // Fetch organization grant requirements
    if (organizationId) {
      const { data: orgRequirements, error: orgReqError } = await supabaseClient
        .from('organization_grant_requirements')
        .select('id, url')
        .eq('organization_id', organizationId)
        .eq('active', true)

      if (!orgReqError && orgRequirements) {
        orgRequirements.forEach((req: { id: string, url: string }) => {
          urls.push({
            url: req.url,
            source: 'org_requirement'
          })
        })
      }
    }

    // Fetch grant requirements
    if (grantId) {
      const { data: grantRequirements, error: grantReqError } = await supabaseClient
        .from('grant_requirements')
        .select('id, url')
        .eq('grant_id', grantId)
        .eq('active', true)

      if (!grantReqError && grantRequirements) {
        grantRequirements.forEach((req: { id: string, url: string }) => {
          urls.push({
            url: req.url,
            source: 'grant_requirement'
          })
        })
      }
    }

    // Process all URLs
    const results = []
    const errors = []

    for (const urlInfo of urls) {
      try {
        // Generate a unique document ID using native crypto API
        const documentId = crypto.randomUUID()
        const originalFilename = extractFilenameFromUrl(urlInfo.url)
        const fileType = determineContentType(urlInfo.url)
        const filePath = `${grant_application_id}/${documentId}.${fileType}`
        let content: Uint8Array | string

        // Fetch the document
        const response = await fetch(urlInfo.url, {
          headers: {
            'User-Agent': 'FundFlowAI/1.0'
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
        }

        // Handle different content types
        const contentType = response.headers.get('content-type') || ''
        
        if (contentType.includes('text/html')) {
          // For HTML, extract main content
          const html = await response.text()
          // Simple content extraction - in production, use a more robust solution
          content = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        } else if (
          contentType.includes('text/plain') || 
          contentType.includes('text/markdown') ||
          contentType.includes('application/json')
        ) {
          // For text-based content, just get the text
          content = await response.text()
        } else {
          // For binary content (PDFs, DOCs, etc.), get as ArrayBuffer
          const buffer = await response.arrayBuffer()
          content = new Uint8Array(buffer)
        }

        // Store the document in storage
        const { error: uploadError } = await supabaseClient
          .storage
          .from('grant-attachments')
          .upload(filePath, content, {
            contentType: contentType || `application/${fileType}`,
            upsert: true
          })

        if (uploadError) {
          throw new Error(`Storage upload error: ${uploadError.message}`)
        }

        // Create the document record
        const { data: docData, error: docError } = await supabaseClient
          .from('grant_application_documents')
          .insert({
            grant_application_id,
            file_name: originalFilename,
            file_type: fileType,
            file_path: filePath,
            vectorization_status: 'pending'
          })
          .select()
          .single()

        if (docError) {
          throw new Error(`Document record creation error: ${docError.message}`)
        }

        // Create processing queue entry
        const { data: queueData, error: queueError } = await supabaseClient
          .from('document_processing_queue')
          .insert({
            document_id: docData.id,
            document_type: 'application',
            status: 'pending',
            attempts: 0
          })
          .select()
          .single()

        if (queueError) {
          throw new Error(`Queue entry creation error: ${queueError.message}`)
        }

        // Record successful processing
        results.push({
          url: urlInfo.url,
          source: urlInfo.source,
          document_id: docData.id,
          file_path: filePath,
          status: 'pending'
        })
      } catch (error) {
        // Record error but continue with other URLs
        console.error(`Error processing URL ${urlInfo.url}:`, error)
        errors.push({
          url: urlInfo.url,
          source: urlInfo.source,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    // Return summary of processing
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} URLs with ${errors.length} errors`,
        grant_application_id,
        vector_store_id,
        processed: results,
        errors
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in vectorize-grant-requirements:', error)
    return new Response(
      JSON.stringify({
        error: ERROR_CODES.DB_ERROR,
        message: 'An unexpected error occurred while processing the request',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 