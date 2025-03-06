import { EdgeFunctionError, ERROR_CODES } from './errors';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const openaiModel = Deno.env.get('OPENAI_MODEL') || 'gpt-4';

if (!openaiApiKey) {
  throw new Error('Missing OpenAI API key');
}

export interface OpenAIError extends Error {
  code: string;
  details?: Record<string, any>;
}

export async function generateText(
  prompt: string,
  model: string = openaiModel,
  maxTokens: number = 2000,
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    throw new EdgeFunctionError(
      ERROR_CODES.AI_ERROR,
      'Failed to generate text',
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
}

export async function refineText(
  text: string,
  refinementType: 'spelling' | 'logic' | 'requirements',
  model: string = openaiModel
): Promise<string> {
  const prompts = {
    spelling: 'Correct spelling and grammar in this text:',
    logic: 'Check for logical errors, contradictions, or inconsistencies in this text:',
    requirements: 'Ensure this text complies with grant requirements:'
  };

  if (!(refinementType in prompts)) {
    throw new EdgeFunctionError(
      ERROR_CODES.INVALID_INPUT,
      `Invalid refinement type: ${refinementType}`
    );
  }

  const prompt = `${prompts[refinementType]}\n\n${text}`;
  return generateText(prompt, model);
} 