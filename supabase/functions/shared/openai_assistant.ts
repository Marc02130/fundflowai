/**
 * OpenAI Assistants API integration module.
 * Provides a configured client and utilities for working with the Assistants API v2.
 * @module openai_assistant
 */

import OpenAI from 'openai';
import type { AssistantCreateParams } from 'openai/resources/beta/assistants.mjs';
import type { Message } from 'openai/resources/beta/threads/messages.mjs';
import { EdgeFunctionError, ERROR_CODES } from './errors.ts';

// Re-export types
export type { AssistantCreateParams, Message };

// Initialize OpenAI client with v2 Assistants API support
export const assistantClient = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
  maxRetries: 2,
  timeout: 120000, // 2 minute timeout
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v2'
  }
}) as OpenAI & {
  beta: {
    assistants: {
      create: (params: AssistantCreateParams) => Promise<any>;
      files: {
        create: (assistantId: string, params: { file_id: string }) => Promise<any>;
      };
    };
    threads: {
      create: () => Promise<any>;
      messages: {
        create: (threadId: string, params: any) => Promise<any>;
        list: (threadId: string, params?: any) => Promise<{ data: any[] }>;
      };
      runs: {
        create: (threadId: string, params: any) => Promise<any>;
        retrieve: (threadId: string, runId: string) => Promise<any>;
        submitToolOutputs: (threadId: string, runId: string, params: any) => Promise<any>;
      };
    };
  };
};

/**
 * Creates an assistant with specified parameters.
 * @param {AssistantCreateParams} params - Parameters for creating the assistant
 * @returns {Promise<Assistant>} Created assistant
 * @throws {EdgeFunctionError} If assistant creation fails
 */
export async function createAssistant(params: AssistantCreateParams) {
  try {
    console.log('Creating assistant with params:', JSON.stringify(params, null, 2));
    const assistant = await assistantClient.beta.assistants.create(params);
    console.log('Assistant created successfully:', assistant.id);
    return assistant;
  } catch (error) {
    console.error('Assistant creation error:', error);
    throw new EdgeFunctionError(
      ERROR_CODES.AI_ERROR,
      `Failed to create assistant: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Creates a new thread for assistant interactions.
 * @returns {Promise<Thread>} Created thread
 * @throws {EdgeFunctionError} If thread creation fails
 */
export async function createThread() {
  try {
    console.log('Creating new thread');
    const thread = await assistantClient.beta.threads.create();
    console.log('Thread created successfully:', thread.id);
    return thread;
  } catch (error) {
    console.error('Thread creation error:', error);
    throw new EdgeFunctionError(
      ERROR_CODES.AI_ERROR,
      `Failed to create thread: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Adds a message to a thread.
 * @param {string} threadId - ID of the thread
 * @param {string} content - Message content
 * @param {string} role - Message role (default: 'user')
 * @returns {Promise<ThreadMessage>} Created message
 * @throws {EdgeFunctionError} If message creation fails
 */
export async function addMessage(
  threadId: string,
  content: string,
  role: 'user' | 'assistant' = 'user'
) {
  try {
    console.log(`Adding message to thread ${threadId}`);
    const message = await assistantClient.beta.threads.messages.create(threadId, {
      role,
      content
    });
    console.log('Message added successfully:', message.id);
    return message;
  } catch (error) {
    console.error('Message creation error:', error);
    throw new EdgeFunctionError(
      ERROR_CODES.AI_ERROR,
      `Failed to add message: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Performs a literature search using various sources.
 * @param {string} query - Search query
 * @returns {Promise<Array<Object>>} Search results
 */
async function searchLiterature(query: string) {
  try {
    console.log('Searching literature for:', query);
    // For now, return a basic response indicating the search was attempted
    // TODO: Implement actual literature search using PubMed/Google Scholar APIs
    return {
      results: [{
        message: `Literature search was attempted for: "${query}". Integration with academic search APIs is pending.`
      }]
    };
  } catch (error) {
    console.error('Literature search error:', error);
    return { results: [] };
  }
}

/**
 * Runs an assistant on a thread and waits for completion.
 * @param {string} threadId - ID of the thread
 * @param {string} assistantId - ID of the assistant
 * @param {number} [pollInterval=1000] - Interval in ms to check run status
 * @returns {Promise<Run>} Completed run
 * @throws {EdgeFunctionError} If run fails or times out
 */
export async function runAssistant(
  threadId: string,
  assistantId: string,
  pollInterval: number = 1000
) {
  try {
    console.log(`Running assistant ${assistantId} on thread ${threadId}`);
    const run = await assistantClient.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    console.log('Run created:', run.id);

    // Poll for completion
    while (true) {
      const status = await assistantClient.beta.threads.runs.retrieve(threadId, run.id);
      console.log('Run status:', status.status);

      if (status.status === 'completed') {
        return status;
      }
      if (status.status === 'failed') {
        throw new Error(`Run failed: ${status.last_error?.message}`);
      }
      if (status.status === 'expired') {
        throw new Error('Run timed out');
      }
      if (status.status === 'requires_action' && status.required_action?.submit_tool_outputs) {
        console.log('Tool calls requested:', status.required_action.submit_tool_outputs.tool_calls);
        const toolCalls = status.required_action.submit_tool_outputs.tool_calls;
        
        // Process each tool call
        const toolOutputs = await Promise.all(toolCalls.map(async (call) => {
          if (call.function.name === 'search_literature') {
            const query = JSON.parse(call.function.arguments).query;
            const results = await searchLiterature(query);
            return {
              tool_call_id: call.id,
              output: JSON.stringify(results)
            };
          }
          // Default empty response for unknown tools
          return {
            tool_call_id: call.id,
            output: JSON.stringify({ results: [] })
          };
        }));

        await assistantClient.beta.threads.runs.submitToolOutputs(threadId, run.id, {
          tool_outputs: toolOutputs
        });
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  } catch (error) {
    console.error('Assistant run error:', error);
    throw new EdgeFunctionError(
      ERROR_CODES.AI_ERROR,
      `Failed to run assistant: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Gets the latest messages from a thread.
 * @param {string} threadId - ID of the thread
 * @param {object} [options] - Options for listing messages
 * @returns {Promise<Array<ThreadMessage>>} Thread messages
 * @throws {EdgeFunctionError} If message retrieval fails
 */
export async function getMessages(
  threadId: string,
  options: { limit?: number; order?: 'asc' | 'desc' } = {}
) {
  try {
    console.log(`Getting messages from thread ${threadId}`);
    const messages = await assistantClient.beta.threads.messages.list(threadId, options);
    return messages.data;
  } catch (error) {
    console.error('Message retrieval error:', error);
    throw new EdgeFunctionError(
      ERROR_CODES.AI_ERROR,
      `Failed to get messages: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Uploads files to an assistant.
 * @param {string} assistantId - ID of the assistant
 * @param {Array<{ id: string, content: string, name: string }>} files - Array of file objects to upload
 * @returns {Promise<Array>} Uploaded files
 * @throws {EdgeFunctionError} If file upload fails
 */
export async function uploadFilesToAssistant(
  assistantId: string,
  files: Array<{ id: string; content: string; name: string }>
) {
  try {
    console.log(`Uploading ${files.length} files to assistant ${assistantId}`);
    
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        // Create a File object from the content
        const fileBlob = new File(
          [file.content],
          file.name,
          { type: 'text/markdown' }
        );

        // Upload file to OpenAI
        const uploadedFile = await assistantClient.files.create({
          file: fileBlob,
          purpose: 'assistants'
        });

        // Attach file to assistant using the create method
        await assistantClient.beta.assistants.files.create(
          assistantId,
          { file_id: uploadedFile.id }
        );

        return uploadedFile;
      })
    );

    console.log('Files uploaded successfully:', uploadedFiles.map(f => f.id));
    return uploadedFiles;
  } catch (error) {
    console.error('File upload error:', error);
    throw new EdgeFunctionError(
      ERROR_CODES.AI_ERROR,
      `Failed to upload files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
} 