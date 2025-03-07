import { OpenAI } from 'openai';
import { EdgeFunctionError, ERROR_CODES } from './errors.ts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

export async function generateText(
  prompt: string,
  model: string = 'gpt-4',
  maxTokens: number = 2000,
  temperature: number = 0.7
): Promise<string> {
  try {
    console.log('=== Generating Text with OpenAI ===');
    console.log('Prompt:', prompt);
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
      max_tokens: maxTokens,
      temperature: temperature,
    });

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
      `Failed to generate text: ${error.message}`
    );
  }
}

export async function refineText(
  originalText: string,
  stage: string,
  prompt: string,
  model: string = 'gpt-4'
): Promise<string> {
  try {
    console.log(`=== Refining Text (${stage}) ===`);
    console.log('Original Text Length:', originalText.length);
    console.log('Refinement Prompt:', prompt);
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are an expert at ${stage} refinement. Your task is to improve the provided text according to the refinement prompt while maintaining the original meaning and intent.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: Math.ceil(Math.max(originalText.length * 1.2, 2000)), // Ensure integer value
      temperature: 0.3, // Lower temperature for more focused refinements
    });

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
      `Failed to refine text (${stage}): ${error.message}`
    );
  }
} 