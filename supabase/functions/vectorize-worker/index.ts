import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { RecursiveCharacterTextSplitter } from '@langchain/text-splitter'

// Deno types
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
    serve(handler: (req: Request) => Promise<Response>): void;
  };
}

// Constants
const BATCH_SIZE = 5;
const MAX_RETRIES = 3;
const CHUNK_SIZE = 4000; // ~4k tokens for text-embedding-ada-002
const CHUNK_OVERLAP = 200; // Overlap between chunks for context

// Initialize clients
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

interface QueueItem {
  id: string;
  document_id: string;
  document_type: 'application' | 'section';
  status: string;
  attempts: number;
  error?: string;
}

interface Document {
  id: string;
  extracted_text: string;
  grant_application_id?: string;
  grant_application_section_id?: string;
}

async function generateEmbedding(text: string): Promise<Array<{text: string, vector: number[]}>> {
  // Initialize text splitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ["\n\n", "\n", " ", ""], // From most to least preferred split points
    lengthFunction: (text) => Math.ceil(text.length * 0.75) // Approximate token count
  });

  // Split text into chunks
  const chunks = await splitter.splitText(text);
  console.log(`Split text into ${chunks.length} chunks`);

  // Generate embeddings for each chunk
  const embeddings = [];
  
  for (const chunk of chunks) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: chunk,
      encoding_format: 'float'
    });

    embeddings.push({
      text: chunk,
      vector: response.data[0].embedding
    });
  }

  return embeddings;
}

async function processDocument(queueItem: QueueItem): Promise<void> {
  const { document_id, document_type } = queueItem;
  
  try {
    // Get document with extracted text
    const table = document_type === 'application' 
      ? 'grant_application_documents' 
      : 'grant_application_section_documents';
    
    // Select appropriate columns based on document type
    const columns = document_type === 'application'
      ? 'id, extracted_text, grant_application_id'
      : 'id, extracted_text, grant_application_section_id';
    
    const { data: doc, error: docError } = await supabase
      .from(table)
      .select(columns)
      .eq('id', document_id)
      .single();

    if (docError || !doc) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    if (!doc.extracted_text) {
      throw new Error('No extracted text found for document');
    }

    console.log(`Generating embeddings for document ${document_id}`);

    // Generate embeddings for each chunk
    const embeddings = await generateEmbedding(doc.extracted_text);
    console.log(`Generated ${embeddings.length} chunk embeddings`);

    // Store vectors
    const vectorTable = document_type === 'application'
      ? 'grant_application_document_vectors'
      : 'grant_application_section_document_vectors';

    // Store each chunk's vector
    for (const { text, vector } of embeddings) {
      const { error: vectorError } = await supabase
        .from(vectorTable)
        .insert({
          document_id: doc.id,
          chunk_text: text,
          vector: vector,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (vectorError) {
        console.error(`Error storing vector for document ${document_id}:`, vectorError);
        throw vectorError;
      }
    }

    console.log(`Stored ${embeddings.length} vectors for document ${document_id}`);

    // Update document status
    const { error: updateError } = await supabase
      .from(table)
      .update({
        vectorization_status: 'completed',
        vectorization_error: null,
        last_vectorized_at: new Date().toISOString()
      })
      .eq('id', document_id);

    if (updateError) throw updateError;

    // Update queue status
    await supabase
      .from('document_processing_queue')
      .update({
        status: 'completed',
        error: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', queueItem.id);

    // Log success
    await supabase.rpc('log_processing_event', {
      p_document_id: document_id,
      p_document_type: document_type,
      p_event: 'Vector generation completed',
      p_details: { 
        vectors_stored: embeddings.length
      }
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

    // Update document status if max retries reached
    if (newStatus === 'failed') {
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
    }

    // Log error
    await supabase.rpc('log_processing_event', {
      p_document_id: document_id,
      p_document_type: document_type,
      p_event: 'Vector generation failed',
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
    // Get documents ready for vectorization from queue
    const { data: queueItems, error: queueError } = await supabase
      .from('document_processing_queue')
      .select('*')
      .eq('status', 'vectorizing')
      .lt('attempts', MAX_RETRIES)
      .order('created_at')
      .limit(BATCH_SIZE);

    if (queueError) throw queueError;

    if (!queueItems?.length) {
      return new Response(
        JSON.stringify({ message: 'No documents ready for vectorization' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${queueItems.length} documents for vectorization`);

    // Process each document in the batch
    await Promise.all(queueItems.map(processDocument));

    return new Response(
      JSON.stringify({ 
        message: 'Vector generation completed',
        processed: queueItems.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in vectorization worker:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 