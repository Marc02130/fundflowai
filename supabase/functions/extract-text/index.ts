import { createClient } from '@supabase/supabase-js'

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_RETRIES = 3;
const BATCH_SIZE = 5;

// Initialize Supabase client with auth header from request
function getSupabaseClient(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }

  return createClient(
    supabaseUrl,
    authHeader.replace('Bearer ', ''),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}

interface QueueItem {
  id: string;
  document_id: string;
  document_type: 'application' | 'section';
  status: string;
  attempts: number;
}

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_path: string;
}

// Simplified text extraction functions with dynamic imports
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const { default: pdfParse } = await import('npm:pdf-parse');
  const data = await pdfParse(new Uint8Array(arrayBuffer));
  return data.text;
}

async function extractTextFromDOCX(arrayBuffer: ArrayBuffer): Promise<string> {
  const { default: mammoth } = await import('npm:mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractTextFromSpreadsheet(arrayBuffer: ArrayBuffer): Promise<string> {
  const { default: XLSX } = await import('npm:xlsx');
  const workbook = XLSX.read(new Uint8Array(arrayBuffer));
  return workbook.SheetNames.map(name => {
    const sheet = workbook.Sheets[name];
    return `Sheet ${name}:\n${XLSX.utils.sheet_to_csv(sheet)}`;
  }).join('\n\n');
}

async function processDocument(queueItem: QueueItem, supabase: any): Promise<void> {
  const { document_id, document_type } = queueItem;
  
  try {
    // Update queue status to extracting
    await supabase
      .from('document_processing_queue')
      .update({ 
        status: 'extracting',
        updated_at: new Date().toISOString()
      })
      .eq('id', queueItem.id);

    // Get document details
    const table = document_type === 'application' 
      ? 'grant_application_documents' 
      : 'grant_application_section_documents';
    
    const { data: doc, error: docError } = await supabase
      .from(table)
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError || !doc) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('grant-attachments')
      .download(doc.file_path);

    if (downloadError) throw downloadError;
    if (fileData.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE} bytes`);
    }

    // Extract text based on file type
    const arrayBuffer = await fileData.arrayBuffer();
    let text: string;
    
    const fileType = doc.file_type.toLowerCase();
    switch (fileType) {
      case 'pdf':
        text = await extractTextFromPDF(arrayBuffer);
        break;
      case 'docx':
      case 'doc':
        text = await extractTextFromDOCX(arrayBuffer);
        break;
      case 'xlsx':
      case 'xls':
        text = await extractTextFromSpreadsheet(arrayBuffer);
        break;
      case 'txt':
      case 'md':
      case 'json':
      case 'csv':
        text = await fileData.text();
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Update document with extracted text
    const { error: updateError } = await supabase
      .from(table)
      .update({
        extracted_text: text,
        vectorization_status: 'extracted',
        vectorization_error: null,
        last_vectorized_at: new Date().toISOString()
      })
      .eq('id', document_id);

    if (updateError) throw updateError;

    // Update queue status to extracted
    await supabase
      .from('document_processing_queue')
      .update({
        status: 'extracted',
        error: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', queueItem.id);

    // Log success
    await supabase.rpc('log_processing_event', {
      p_document_id: document_id,
      p_document_type: document_type,
      p_event: 'Text extraction completed',
      p_details: { file_type: fileType }
    });

  } catch (error) {
    console.error(`Error processing document ${document_id}:`, error);

    // Increment attempts and update status
    const newStatus = queueItem.attempts + 1 >= MAX_RETRIES ? 'failed' : 'pending';
    
    await supabase
      .from('document_processing_queue')
      .update({
        status: newStatus,
        attempts: queueItem.attempts + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString()
      })
      .eq('id', queueItem.id);

    // Update document status
    const table = document_type === 'application' 
      ? 'grant_application_documents' 
      : 'grant_application_section_documents';

    await supabase
      .from(table)
      .update({
        vectorization_status: 'failed',
        vectorization_error: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', document_id);

    // Log error
    await supabase.rpc('log_processing_event', {
      p_document_id: document_id,
      p_document_type: document_type,
      p_event: 'Text extraction failed',
      p_details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts: queueItem.attempts + 1
      }
    });
  }
}

// Edge Function handler
Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Received request body:', body);
    
    // Validate request payload
    if (!body.id || !body.document_id || !body.document_type || !body.status) {
      throw new Error('Missing required fields: id, document_id, document_type, status');
    }

    // Only process documents in 'pending' status
    if (body.status !== 'pending') {
      return new Response(
        JSON.stringify({ 
          message: `Skipping document ${body.document_id} with status ${body.status}`,
          document_id: body.document_id,
          success: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const supabase = getSupabaseClient(req);
    console.log('Supabase client initialized');

    const queueItem: QueueItem = {
      id: body.id,
      document_id: body.document_id,
      document_type: body.document_type,
      status: body.status,
      attempts: body.attempts || 0
    };

    // Process the document
    await processDocument(queueItem, supabase);

    return new Response(
      JSON.stringify({ 
        message: 'Text extraction completed',
        document_id: body.document_id,
        success: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}); 