/**
 * OpenAI integration module for text generation and refinement.
 * @module openai
 */

import { OpenAI } from 'openai';
import { EdgeFunctionError, ERROR_CODES } from './errors.ts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
  timeout: 120000, // 2 minute timeout
  maxRetries: 2,
  maxTokens: 4000
});

/**
 * Generates text using OpenAI's GPT model.
 * @param {string} prompt - The input prompt for text generation
 * @param {string} content - Previous content for context
 * @param {number} [maxTokens=2000] - Maximum tokens in the response
 * @param {number} [temperature=0.7] - Randomness of the output (0-1)
 * @returns {Promise<string>} Generated text
 * @throws {EdgeFunctionError} If text generation fails
 */
export async function generateText(
  prompt: string,
  temperature: number = 0.7
): Promise<string> {
  try {
    console.log('=== Generating Text with OpenAI ===');
    console.log('Prompt:', prompt);
    
    const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4';
    console.log('Model:', model);
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert grant writer with deep knowledge of academic and research writing. Your task is to generate high-quality, professional content based on the provided prompt and context.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: openai.maxTokens,
      temperature: temperature,
    });

    console.log('=== Complete OpenAI Response ===');
    console.log(JSON.stringify(completion, null, 2));
    
    const generatedText = completion.choices[0]?.message?.content;
    if (!generatedText) {
      throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'No text was generated');
    }

    console.log('Generated Text Length:', generatedText.length);
    return generatedText;

  } catch (error) {
    console.error('OpenAI Generation Error:', error);
    throw new EdgeFunctionError(
      ERROR_CODES.AI_ERROR,
      `Failed to generate text: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Refines text based on specific refinement stage and instructions.
 * @param {string} originalText - The text to be refined
 * @param {string} stage - The refinement stage (e.g., 'spelling', 'logic')
 * @param {string} prompt - Instructions for refinement
 * @returns {Promise<string>} Refined text
 * @throws {EdgeFunctionError} If text refinement fails
 */
export async function refineText(
  originalText: string,
  stage: string,
  prompt: string,
): Promise<string> {
  try {
    console.log(`=== Refining Text (${stage}) ===`);
    console.log('Original Text Length:', originalText.length);
    console.log('Refinement Prompt:', prompt);
    
    const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4';
    console.log('Model:', model);

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are an expert at ${stage} refinement. Your task is to improve the provided text according to the refinement prompt while maintaining the original meaning and intent. If no changes are needed, return the original text.`
        },
        {
          role: 'user',
          content: `Original Text:\n${originalText}\n\nRefinement Instructions:\n${prompt}`
        }
      ],
      max_completion_tokens: Math.max(Math.ceil(originalText.length * 1.2), openai.maxTokens), // Ensure integer value
      temperature: 0.3, // Lower temperature for more focused refinements
    });

    console.log('=== Complete OpenAI Refine (${stage}) TextResponse ===');
    console.log(JSON.stringify(completion, null, 2));
    
    const refinedText = completion.choices[0]?.message?.content;
    if (!refinedText) {
      throw new EdgeFunctionError(ERROR_CODES.AI_ERROR, 'No refined text was generated');
    }

    console.log('Refined Text Length:', refinedText.length);
    return refinedText;

  } catch (error) {
    console.error('OpenAI Refinement Error:', error);
    throw new EdgeFunctionError(
      ERROR_CODES.AI_ERROR,
      `Failed to refine text (${stage}): ${error instanceof Error ? error.message : String(error)}`
    );
  }
} 