/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

interface RequestData {
  prompt: string
  user_text?: string
  attachments?: string[]
}

interface ReplicateResponse {
  id: string
  version: string
  urls: {
    get: string
    cancel: string
  }
  created_at: string
  started_at?: string
  completed_at?: string
  status: string
  input: Record<string, any>
  output?: string[] | null
  error?: string
  logs?: string
  metrics?: Record<string, any>
}

// Function to generate a unique filename
function generateUniqueFilename(): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  return `${timestamp}_${randomString}.png`;
}

// Function to download an image from a URL
async function downloadImage(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Function to upload an image to Supabase Storage
async function uploadImageToStorage(imageData: Uint8Array, filename: string): Promise<string> {
  const supabase = createClient(
    Deno.env.get('SERVICE_ROLE_URL') || '',
    Deno.env.get('SERVICE_ROLE_KEY') || ''
  );
  
  const { data, error } = await supabase.storage
    .from('ai-generated-images')
    .upload(filename, imageData, {
      contentType: 'image/png',
      upsert: false
    });
  
  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('ai-generated-images')
    .getPublicUrl(filename);
  
  return urlData.publicUrl;
}

// Main function to generate an image using Replicate
async function generateImage(prompt: string, userText?: string, attachments?: string[]): Promise<string> {
  console.log(`Generating image with prompt: ${prompt}`);
  
  // Combine prompt with user text for better context
  let fullPrompt = prompt;
  if (userText) {
    fullPrompt += `\n\nAdditional context: ${userText}`;
  }
  
  // Initialize Replicate API call
  const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN environment variable is not set');
  }
  
  // Call Replicate API to start the prediction
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2", // luma/ray model version
      input: {
        prompt: fullPrompt,
        width: 1200,
        height: 1200,
        num_outputs: 1
      }
    })
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Replicate API error: ${response.status} ${response.statusText} - ${errorData}`);
  }
  
  const prediction: ReplicateResponse = await response.json();
  console.log(`Prediction started with ID: ${prediction.id}`);
  
  // Poll for completion
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  let attempts = 0;
  let completedPrediction: ReplicateResponse | null = null;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Wait 5 seconds between polling attempts
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check prediction status
    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!statusResponse.ok) {
      console.error(`Error checking prediction status: ${statusResponse.status} ${statusResponse.statusText}`);
      continue;
    }
    
    const statusData: ReplicateResponse = await statusResponse.json();
    console.log(`Prediction status: ${statusData.status}`);
    
    if (statusData.status === 'succeeded') {
      completedPrediction = statusData;
      break;
    } else if (statusData.status === 'failed') {
      throw new Error(`Image generation failed: ${statusData.error}`);
    }
    
    // If still processing, continue polling
  }
  
  if (!completedPrediction || !completedPrediction.output || completedPrediction.output.length === 0) {
    throw new Error('Failed to generate image or timed out');
  }
  
  // Get the image URL from the prediction output
  const imageUrl = completedPrediction.output[0];
  console.log(`Image generated: ${imageUrl}`);
  
  // Download the image
  const imageData = await downloadImage(imageUrl);
  
  // Generate a unique filename
  const filename = generateUniqueFilename();
  
  // Upload to Supabase Storage
  const storedImageUrl = await uploadImageToStorage(imageData, filename);
  console.log(`Image stored at: ${storedImageUrl}`);
  
  return storedImageUrl;
}

// Serve the HTTP requests
serve(async (req) => {
  // Set CORS headers for all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400"
      },
      status: 204
    });
  }

  try {
    // Parse the request
    const requestData: RequestData = await req.json();
    const { prompt, user_text, attachments } = requestData;
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }
    
    console.log(`Processing image generation request with prompt: ${prompt.substring(0, 50)}...`);
    
    // Generate the image
    const imageUrl = await generateImage(prompt, user_text, attachments);
    
    // Return the result with CORS headers
    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    
    // Return error with CORS headers
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 500
      }
    );
  }
}); 