/**
 * Deep Research Edge Function
 * 
 * Handles automated research generation for grant applications by analyzing provided documents
 * and generating comprehensive research reports.
 * 
 * @module deep-research
 */

import { createClient } from '@supabase/supabase-js'
import { handleError, EdgeFunctionError, ERROR_CODES } from '../shared/errors.ts'
import { validateUserSession, validateUserAccess } from '../shared/auth.ts'
import { OpenAI } from 'openai'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

interface RequestBody {
  application_id: string
}

interface ApplicationDocument {
  id: string
  file_name: string
  file_path: string
}

interface Application {
  id: string
  description: string | null
  grant_application_documents: ApplicationDocument[]
}

interface ThreadMessage {
  role: 'user' | 'assistant'
  content: Array<{
    type: 'text'
    text: { value: string }
  }>
}

export async function handleRequest(req: Request) {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Validate user session and access
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'Missing authorization header')
    }

    const userId = await validateUserSession(authHeader)

    // Get request JSON
    const { application_id } = await req.json() as RequestBody

    // Validate user has access to this application
    await validateUserAccess(userId, application_id)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Debug Supabase configuration
    console.log('[DEBUG] Supabase storage configuration:', {
      url: Deno.env.get('SUPABASE_URL'),
      storageUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1`,
      bucket: 'grant-attachments',
      serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'present' : 'missing',
      anonKey: Deno.env.get('SUPABASE_ANON_KEY') ? 'present' : 'missing'
    })

    // Try multiple methods to verify bucket access
    console.log('[DEBUG] Verifying bucket access...')
    
    // Method 1: List buckets with full error details
    const { data: buckets, error: bucketsError } = await supabaseClient.storage
      .listBuckets()

    if (bucketsError) {
      console.error('[DEBUG] Failed to list buckets:', {
        error: bucketsError,
        // @ts-ignore - Access error details
        status: bucketsError?.status,
        // @ts-ignore - Access error details
        message: bucketsError?.message,
        // @ts-ignore - Access error details
        details: bucketsError?.details,
        // Log auth details
        auth: {
          hasAuthHeader: !!supabaseClient.auth.headers,
          headers: supabaseClient.auth.headers
        }
      })
    } else {
      console.log('[DEBUG] Available buckets:', buckets.map(b => ({
        name: b.name,
        public: b.public,
        created_at: b.created_at,
        id: b.id
      })))
    }

    // Method 2: Try to list root of grant-attachments bucket with auth details
    const { data: rootFiles, error: rootError } = await supabaseClient.storage
      .from('grant-attachments')
      .list('', {
        limit: 1,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (rootError) {
      console.error('[DEBUG] Failed to list grant-attachments bucket:', {
        error: rootError,
        // @ts-ignore - Access error details
        status: rootError?.status,
        // @ts-ignore - Access error details
        message: rootError?.message,
        // @ts-ignore - Access error details
        details: rootError?.details,
        // Log auth details
        auth: {
          hasAuthHeader: !!supabaseClient.auth.headers,
          headers: supabaseClient.auth.headers
        }
      })
    } else {
      console.log('[DEBUG] Grant attachments bucket is accessible, contains:', {
        fileCount: rootFiles.length,
        sample: rootFiles.slice(0, 1).map(f => ({
          name: f.name,
          type: f.metadata?.mimetype,
          id: f.id
        }))
      })
    }

    // Method 3: Try to get bucket details
    const { data: bucketInfo, error: bucketError } = await supabaseClient.storage
      .getBucket('grant-attachments')

    if (bucketError) {
      console.error('[DEBUG] Failed to get grant-attachments bucket info:', {
        error: bucketError,
        // @ts-ignore - Access error details
        status: bucketError?.status,
        // @ts-ignore - Access error details
        message: bucketError?.message,
        // @ts-ignore - Access error details
        details: bucketError?.details
      })
    } else {
      console.log('[DEBUG] Grant attachments bucket info:', {
        name: bucketInfo.name,
        public: bucketInfo.public,
        created_at: bucketInfo.created_at,
        id: bucketInfo.id
      })
    }

    // If all methods fail, we have a serious problem
    if (bucketsError && rootError && bucketError) {
      console.error('[DEBUG] All bucket access methods failed')
      throw new Error('Cannot access storage bucket. Please verify storage configuration and permissions.')
    }

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
      maxRetries: 2,
      timeout: 120000, // 2 minute timeout
    })

    // Common request options with v2 header
    const v2RequestOptions = {
      headers: {
        'OpenAI-Beta': 'assistants=v2'
      }
    }

    // Debug OpenAI configuration
    console.log('[DEBUG] OpenAI client configuration:', {
      baseURL: openai.baseURL,
      maxRetries: openai.maxRetries,
      timeout: openai.timeout,
      defaultHeaders: v2RequestOptions.headers
    })

    console.log('Fetching application data...')
    // Get application data
    const { data: application, error: applicationError } = await supabaseClient
      .from('grant_applications')
      .select(`
        id,
        description,
        grant_application_documents (
          id,
          file_name,
          file_path
        )
      `)
      .eq('id', application_id)
      .single()

    if (applicationError) throw applicationError
    if (!application) throw new Error('Application not found')
    if (!application.description) throw new Error('Application description is required')
    if (!application.grant_application_documents?.length) throw new Error('Application must have attachments')

    console.log('Creating assistant...')
    // Create or get existing assistant
    let assistant;
    let thread;
    try {
      // Debug the request before sending
      console.log('[DEBUG] Assistant creation params:', {
        name: "Grant Research Assistant",
        model: Deno.env.get('OPENAI_DEEP_MODEL') ?? 'gpt-4o',
        tools: [{ type: "code_interpreter" }, { type: "file_search" }],
        headers: v2RequestOptions.headers
      })

      assistant = await openai.beta.assistants.create(
        {
          name: "Grant Research Assistant",
          description: "Specialized assistant for grant application research",
          model: Deno.env.get('OPENAI_DEEP_MODEL') ?? 'gpt-4o',
          tools: [
            { type: "code_interpreter" },
            { type: "file_search" }
          ],
          instructions: `You are a specialized research assistant for grant applications. Your task is to:
1. Analyze the provided grant application description and attachments
2. Conduct thorough research based on the content
3. Generate a comprehensive research report in markdown format
4. Include relevant citations in APA format
5. Structure the output with clear sections
6. Include source metadata for validation
7. Focus on supporting the grant application's goals`
        },
        v2RequestOptions
      )

      // Debug successful creation
      console.log('[DEBUG] Assistant created successfully:', {
        id: assistant.id,
        model: assistant.model,
        tools: assistant.tools
      })
    } catch (error) {
      // Enhanced error logging
      console.error('[DEBUG] Assistant creation error:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        // @ts-ignore - OpenAI error properties
        status: error?.status,
        // @ts-ignore - OpenAI error properties 
        headers: error?.headers,
        // @ts-ignore - OpenAI error properties
        error: error?.error,
        // Log the full error for debugging
        fullError: error
      })
      throw error
    }

    console.log('Creating thread...')
    // Create a thread
    try {
      thread = await openai.beta.threads.create(v2RequestOptions)
      console.log('[DEBUG] Thread created:', {
        id: thread.id,
        created_at: thread.created_at
      })
    } catch (error) {
      console.error('[DEBUG] Thread creation error:', {
        error: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          // @ts-ignore - OpenAI error properties
          status: error?.status,
          // @ts-ignore - OpenAI error properties
          headers: error?.headers,
          // @ts-ignore - OpenAI error properties
          error: error?.error
        }
      })
      throw error
    }

    console.log('Processing attachments...')
    // Download and process attachments
    const attachmentFiles = []
    for (const doc of application.grant_application_documents) {
      // Debug file info
      console.log('[DEBUG] Processing document:', {
        id: doc.id,
        filename: doc.file_name,
        filepath: doc.file_path
      })

      // Normalize the file path
      const normalizedPath = doc.file_path
        .split('/')
        .map(segment => segment.trim())
        .filter(Boolean)
        .join('/')

      // Create multiple path variants to try
      const pathVariants = [
        normalizedPath,
        encodeURIComponent(normalizedPath),
        normalizedPath.split('/').map(segment => encodeURIComponent(segment)).join('/'),
        doc.file_path.replace(/\s+/g, '_'),
        doc.file_path
      ]

      console.log('[DEBUG] Path variants:', {
        original: doc.file_path,
        normalized: normalizedPath,
        variants: pathVariants
      })

      let fileData = null
      let lastError = null

      // Try each path variant
      for (const path of pathVariants) {
        try {
          console.log(`[DEBUG] Attempting download with path: ${path}`)
          const { data, error } = await supabaseClient.storage
            .from('grant-attachments')
            .download(path)

          if (error) {
            console.error('[DEBUG] Download error for path variant:', {
              path,
              error,
              // @ts-ignore - Access error details
              status: error?.originalError?.status,
              // @ts-ignore - Access error details
              statusText: error?.originalError?.statusText,
              // @ts-ignore - Access error details
              responseBody: await error?.originalError?.text?.()
            })
            lastError = error
            continue
          }

          if (data) {
            fileData = data
            console.log('[DEBUG] Successfully downloaded file using path:', path)
            break
          }
        } catch (error) {
          console.error('[DEBUG] Unexpected error for path variant:', {
            path,
            error: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            } : 'Unknown error'
          })
          lastError = error
          continue
        }
      }

      if (!fileData) {
        console.error('[DEBUG] All download attempts failed:', {
          filename: doc.file_name,
          originalPath: doc.file_path,
          triedPaths: pathVariants,
          lastError
        })
        throw new Error(`Failed to download file ${doc.file_name} after trying multiple path variants`)
      }

      // Debug successful download
      console.log('[DEBUG] File downloaded successfully:', {
        filename: doc.file_name,
        size: fileData.size,
        type: fileData.type
      })

      // Convert file to text
      try {
        const fileContent = await fileData.text()
        console.log('[DEBUG] File content length:', fileContent.length)
        attachmentFiles.push({
          content: fileContent,
          filename: doc.file_name
        })
      } catch (error: unknown) {
        console.error('[DEBUG] File processing error:', {
          filename: doc.file_name,
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : 'Unknown error'
        })
        throw new Error(`Failed to process file ${doc.file_name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log('Uploading files to OpenAI...')
    // Upload files to thread
    const fileIds = []
    for (const file of attachmentFiles) {
      try {
        const threadFile = await openai.beta.threads.files.create(
          thread.id,
          {
            file: new File([file.content], file.filename, { type: 'text/plain' }),
            purpose: 'assistants'
          }
        )
        fileIds.push(threadFile.id)
      } catch (error: unknown) {
        console.error(`Error uploading file ${file.filename} to OpenAI:`, error)
        if (error instanceof Error) {
          throw new Error(`Failed to upload file ${file.filename} to OpenAI: ${error.message}`)
        }
        throw new Error(`Failed to upload file ${file.filename} to OpenAI: Unknown error`)
      }
    }

    console.log('Creating research request...')
    // Create message with application description and research request
    await openai.beta.threads.messages.create(
      thread.id,
      {
        role: 'user',
        content: `Please conduct research based on this grant application description and attachments:

Description:
${application.description}

Requirements:
1. Generate a comprehensive research report
2. Use APA format for citations
3. Include source metadata
4. Focus on supporting the grant application
5. Structure the output in markdown format`
      },
      v2RequestOptions
    )

    console.log('Running assistant...')
    // Run the assistant
    const run = await openai.beta.threads.runs.create(
      thread.id,
      {
        assistant_id: assistant.id
      },
      v2RequestOptions
    )

    console.log('Waiting for completion...')
    // Poll for completion
    let completedRun
    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
      console.log('Run status:', runStatus.status)
      
      if (runStatus.status === 'completed') {
        completedRun = runStatus
        break
      } else if (runStatus.status === 'failed') {
        console.error('Run failed:', runStatus.last_error)
        throw new Error(`Research generation failed: ${runStatus.last_error?.message}`)
      } else if (runStatus.status === 'expired') {
        throw new Error('Research generation timed out')
      }
      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('Retrieving research content...')
    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id)
    const researchContent = messages.data
      .filter((msg) => msg.role === 'assistant')
      .map((msg) => msg.content)
      .flat()
      .filter((content: any) => content.type === 'text')
      .map((content: any) => content.text.value)
      .join('\n\n')

    if (!researchContent) {
      throw new Error('No research content generated')
    }

    console.log('Saving research output...')
    // Save research output
    const researchFileName = 'deep_research.md'
    const researchFilePath = `${application_id}/${crypto.randomUUID()}-${researchFileName}`

    // Upload to storage
    const { error: uploadError } = await supabaseClient.storage
      .from('grant-attachments')
      .upload(researchFilePath, researchContent)

    if (uploadError) {
      console.error('Error uploading research:', uploadError)
      throw uploadError
    }

    // Create document record
    const { error: documentError } = await supabaseClient
      .from('grant_application_documents')
      .insert({
        grant_application_id: application_id,
        file_name: researchFileName,
        file_type: 'md',
        file_path: researchFilePath
      })

    if (documentError) {
      console.error('Error creating document record:', documentError)
      throw documentError
    }

    // Update application with prompt and model
    const { error: updateError } = await supabaseClient
      .from('grant_applications')
      .update({
        deep_research_prompt: application.description,
        deep_research_model: assistant.model
      })
      .eq('id', application_id)

    if (updateError) {
      console.error('Error updating application:', updateError)
      throw updateError
    }

    console.log('Research generation completed successfully')
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Research generated successfully',
        assistant_id: assistant.id,
        thread_id: thread.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: unknown) {
    console.error('Error in deep-research function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

// Use Deno.serve instead of exporting
Deno.serve(async (req) => {
  try {
    return await handleRequest(req)
  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 