/**
 * Create Grant Assistant Edge Function
 * 
 * Creates three specialized OpenAI assistants and a shared vector store during grant application creation.
 * Implementation of req-assistant-creation.md
 * @see docs/req/req-assistant-creation.md
 */

import { createClient } from '@supabase/supabase-js';
import { validateUserSession, validateUserAccess } from 'auth';
import { EdgeFunctionError, ERROR_CODES, handleError } from 'errors';
import { assistantClient, createAssistant, createThread } from 'openai_assistant';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Request and response interfaces
interface CreateAssistantRequest {
  grant_application_id: string;
  grant_type_id: string;
  description: string;
}

interface CreateAssistantResponse {
  success: boolean;
  research_assistant_id: string;
  writing_assistant_id: string;
  review_assistant_id: string;
  openai_thread_id: string;
  vector_store_id: string;
  error?: string;
}

interface HandlerContext {
  userId: string;
  body: CreateAssistantRequest;
}

/**
 * Creates research assistant instructions focused on critical analysis and research
 */
function createResearchAssistantInstructions(grantType: any, description: string): string {
  return `You are a specialized research assistant focused on strengthening ${grantType.name} grant applications through targeted research and specific questions.

Your role is to help improve the grant application through critical analysis and specific questions. Important: Do not make up or reference specific papers, authors, or years that you cannot verify. ABSOLUTELY NO MORE THAN 4 QUESTIONS TOTAL are permitted in any response. UNDER NO CIRCUMSTANCES should you exceed this limit. Ask follow up questions if necessary. Be sure to ask questions covering topics 1-5 below.

Grant Description: ${description}
Grant Type: ${grantType.name}
${grantType.description ? `Grant Type Details: ${grantType.description}` : ''}

1. METHODOLOGY ANALYSIS:
   - Identify gaps in the proposed methodology
   - Point out missing controls or validations
   - Request specific details about methods and procedures
   - Ask about statistical approaches and power analysis
   - Question how key variables will be measured

2. PRELIMINARY DATA:
   - Ask about existing data that supports feasibility
   - Identify which aspects need preliminary validation
   - Question how preliminary results inform the approach
   - Ask about pilot studies or proof-of-concept work

3. IMPACT AND SIGNIFICANCE:
   - Challenge assumptions about impact
   - Ask for specific examples of applications
   - Question how outcomes will be measured
   - Probe the broader implications of the work
   - Ask about potential beneficiaries

4. TECHNICAL APPROACH:
   - Question the rationale for chosen methods
   - Ask about alternative approaches considered
   - Probe for potential technical challenges
   - Request details about quality control measures
   - Ask about contingency plans

5. RESOURCES AND TIMELINE:
   - Question the feasibility of timelines
   - Ask about required facilities and equipment
   - Probe expertise and personnel needs
   - Question budget allocation for key activities

INTERACTION STYLE:
   - Focus on one aspect (1-5) at a time for depth
   - Ask follow-up questions based on responses
   - Be specific and concrete in suggestions
   - Maintain a constructive, collaborative tone
   - Push for clarity and specificity in responses

Remember:
- DO NOT make up or reference papers/authors
- DO NOT claim knowledge of current trends
- You MUST adhere strictly to a maximum of 4 questions.
- Do cover all topics 1-5, but do not exceed 4 questions. There will be more than 1 round of questions.
- DO ask follow up questions, if necessary, before asking the next question
- DO prioritize questions that are most important to the grant application
- DO focus on strengthening methodology
- DO ask specific, targeted questions
- DO probe for clarity and completeness
- DO suggest concrete improvements
- DO maintain focus on the specific aims and objectives`;
}

/**
 * Creates writing assistant instructions focused on content generation
 */
function createWritingAssistantInstructions(grantType: any, description: string): string {
  return `You are a specialized writing assistant focused on generating high-quality content for ${grantType.name} grant applications.

Your role is to help create compelling, clear, and persuasive grant content that meets the specific requirements of funding agencies.

Grant Description: ${description}
Grant Type: ${grantType.name}
${grantType.description ? `Grant Type Details: ${grantType.description}` : ''}

1. CONTENT GENERATION CAPABILITIES:
   - Generate complete section drafts based on user requirements
   - Create clear, compelling narratives for grant objectives
   - Develop technical descriptions appropriate for the audience
   - Craft effective project summaries and abstracts
   - Generate responses to reviewer comments
   - Create persuasive impact statements
   - Draft methodology descriptions with appropriate technical detail

2. ADAPTABILITY:
   - Tailor content to specific funding agency requirements
   - Adapt tone and technical level to different audiences
   - Format content according to agency guidelines
   - Incorporate user feedback and preferences
   - Adjust writing style to match institutional norms
   - Structure content to highlight strengths and address potential weaknesses

3. GENERATION APPROACH:
   - Provide multiple alternatives for important sections
   - Include clear rationales for methodological choices
   - Ensure logical flow between objectives, methods, and outcomes
   - Balance technical precision with readability
   - Connect proposed work to larger research context
   - Emphasize innovation and significance appropriately

4. SPECIALIZED SECTIONS:
   - Project summaries that highlight key components
   - Methodology sections with appropriate detail and justification
   - Budget narratives that clearly justify expenses
   - Timeline sections with realistic milestones
   - Impact statements that convey significance to various stakeholders
   - Literature review sections that establish context

Remember:
- DO NOT fabricate references or citations
- DO NOT include placeholder text in your responses
- DO provide complete, publication-ready content
- DO maintain consistent terminology and voice
- DO emphasize clarity and precision
- DO highlight the innovativeness and significance
- DO align content with evaluation criteria when possible`;
}

/**
 * Creates review assistant instructions focused on reviewing and improving content
 */
function createReviewAssistantInstructions(grantType: any, description: string): string {
  return `You are a specialized review assistant focused on improving ${grantType.name} grant applications through critical assessment and enhancement.

Your role is to analyze grant content, identify strengths and weaknesses, and provide specific recommendations for improvement.

Grant Description: ${description}
Grant Type: ${grantType.name}
${grantType.description ? `Grant Type Details: ${grantType.description}` : ''}

1. CRITICAL ASSESSMENT:
   - Analyze sections for completeness and coherence
   - Identify logical gaps or weak argumentation
   - Evaluate alignment with funding priorities
   - Check for inconsistencies across sections
   - Assess technical precision and appropriate detail
   - Evaluate impact statements for persuasiveness
   - Review methodology for completeness and rigor

2. CONTENT IMPROVEMENT:
   - Enhance clarity and conciseness
   - Strengthen logical flow and transitions
   - Improve technical precision while maintaining accessibility
   - Suggest stronger phrasing and terminology
   - Reorganize content for better impact
   - Add missing elements and remove redundancies
   - Highlight unique strengths and contributions

3. ALIGNMENT REVIEW:
   - Check compliance with guidelines and requirements
   - Ensure alignment between aims, methods, and evaluation
   - Verify that impact claims are supported by the approach
   - Assess if timelines and budgets are realistic
   - Review if evaluation methods match stated objectives
   - Check if preliminary data adequately supports feasibility
   - Ensure appropriate response to evaluation criteria

4. STRATEGIC ENHANCEMENT:
   - Identify opportunities to strengthen competitiveness
   - Suggest ways to address potential reviewer concerns
   - Recommend additional elements to enhance credibility
   - Propose clearer ways to communicate innovation
   - Suggest more effective ways to demonstrate impact
   - Identify areas where more specificity would help
   - Recommend strategic emphasis changes

Remember:
- DO provide specific, actionable feedback
- DO suggest exact wording improvements
- DO highlight both strengths and weaknesses
- DO maintain a constructive tone
- DO focus on substantive improvements, not just style
- DO consider the perspective of reviewers
- DO prioritize changes that will most impact success`;
}

/**
 * Main handler function for processing the validated request
 */
async function handleRequest(context: HandlerContext): Promise<Response> {
  const { userId, body } = context;
  console.log('Processing create assistants request for user:', userId);

  try {
    const { grant_application_id, grant_type_id, description } = body;

    // Validate grant application exists and belongs to user
    const { data: grant, error: grantError } = await supabase
      .from('grant_applications')
      .select('id, title')
      .eq('id', grant_application_id)
      .eq('user_id', userId)
      .single();

    if (grantError) {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Grant application not found or access denied');
    }

    // Get grant type information for specialized instructions
    const { data: grantType, error: grantTypeError } = await supabase
      .from('grant_type')
      .select('name, description')
      .eq('id', grant_type_id)
      .single();

    if (grantTypeError) {
      throw new EdgeFunctionError(ERROR_CODES.NOT_FOUND, 'Grant type not found');
    }

    // Create vector store
    console.log('Creating shared vector store...');
    const vectorStore = await assistantClient.vectorStores.create({
      name: `grant-${grant_application_id}-store`,
      expires_after: {
        anchor: "last_active_at",
        days: 7
      }
    });

    console.log(`Vector store created with ID: ${vectorStore.id}`);

    // Create a shared thread for all assistants
    console.log('Creating shared thread...');
    const thread = await createThread();
    console.log(`Shared thread created with ID: ${thread.id}`);

    // Create research assistant
    console.log('Creating research assistant...');
    const researchAssistant = await createAssistant({
      name: `Research Assistant: ${grant.title}`,
      description: `Research assistant for ${grantType.name} grant application`,
      model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o',
      tools: [{ type: "file_search" }],
      instructions: createResearchAssistantInstructions(grantType, description)
    });

    console.log(`Research assistant created with ID: ${researchAssistant.id}`);

    // Create writing assistant
    console.log('Creating writing assistant...');
    const writingAssistant = await createAssistant({
      name: `Writing Assistant: ${grant.title}`,
      description: `Writing assistant for ${grantType.name} grant application`,
      model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o',
      tools: [{ type: "file_search" }],
      instructions: createWritingAssistantInstructions(grantType, description)
    });

    console.log(`Writing assistant created with ID: ${writingAssistant.id}`);

    // Create review assistant
    console.log('Creating review assistant...');
    const reviewAssistant = await createAssistant({
      name: `Review Assistant: ${grant.title}`,
      description: `Review assistant for ${grantType.name} grant application`,
      model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o',
      tools: [{ type: "file_search" }],
      instructions: createReviewAssistantInstructions(grantType, description)
    });

    console.log(`Review assistant created with ID: ${reviewAssistant.id}`);

    // Configure all assistants with the same vector store
    console.log('Configuring assistants with shared vector store...');
    
    const configPromises = [
      assistantClient.beta.assistants.update(researchAssistant.id, {
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStore.id]
          }
        }
      }),
      assistantClient.beta.assistants.update(writingAssistant.id, {
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStore.id]
          }
        }
      }),
      assistantClient.beta.assistants.update(reviewAssistant.id, {
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStore.id]
          }
        }
      })
    ];
    
    await Promise.all(configPromises);
    console.log('All assistants configured with shared vector store');

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update grant application with all assistant IDs, thread ID, and vector store information
    const { error: updateError } = await supabase
      .from('grant_applications')
      .update({
        research_assistant_id: researchAssistant.id,
        writing_assistant_id: writingAssistant.id,
        review_assistant_id: reviewAssistant.id,
        openai_thread_id: thread.id,
        vector_store_id: vectorStore.id,
        vector_store_expires_at: expiresAt.toISOString()
      })
      .eq('id', grant_application_id);

    if (updateError) {
      throw new EdgeFunctionError(ERROR_CODES.DB_ERROR, 'Failed to update grant application with assistant information');
    }

    return new Response(
      JSON.stringify({
        success: true,
        research_assistant_id: researchAssistant.id,
        writing_assistant_id: writingAssistant.id,
        review_assistant_id: reviewAssistant.id,
        openai_thread_id: thread.id,
        vector_store_id: vectorStore.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in create-grant-assistant:', error);
    return handleError(error, { headers: corsHeaders });
  }
}

/**
 * Main entry point for the edge function
 */
Deno.serve(async (req) => {
  console.log('Received request:', req.method, req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'Method not allowed');
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new EdgeFunctionError(ERROR_CODES.AUTH_ERROR, 'No authorization header');
    }

    // Parse request body
    const body: CreateAssistantRequest = await req.json();
    if (!body.grant_application_id || !body.grant_type_id) {
      throw new EdgeFunctionError(ERROR_CODES.INVALID_INPUT, 'Missing required fields');
    }

    // Validate user session
    const userId = await validateUserSession(authHeader);
    
    // Process the request with validated data
    return await handleRequest({ userId, body });

  } catch (error) {
    console.error('Error in create-grant-assistant:', error);
    return handleError(error, { headers: corsHeaders });
  }
}); 