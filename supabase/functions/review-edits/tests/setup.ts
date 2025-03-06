console.log("=== Starting review-edits setup.ts ===");

// Mock environment variables
const originalEnv = Deno.env.toObject();
console.log("Setting up environment variables...");
Deno.env.set('SUPABASE_URL', 'https://test.supabase.co');
Deno.env.set('SUPABASE_ANON_KEY', 'test-key');
Deno.env.set('OPENAI_API_KEY', 'test-key');
Deno.env.set('OPENAI_MODEL', 'gpt-4');

// Mock data
console.log("Defining mock data...");
const mockData = {
  section_id: 'test-section-id',
  grant_application_id: 'test-application-id',
  user_id: 'test-user-id',
  user_instructions: 'Test instructions',
  user_comments_on_ai_output: 'Test comments',
  ai_output: 'Test AI output',
  grant_requirements: 'Test requirements'
};

// Mock data for no AI output case
const mockDataNoAiOutput = {
  ...mockData,
  ai_output: null
};

// Mock Supabase client
console.log("Creating mock Supabase client...");
const mockSupabase = {
  auth: {
    getUser: async (token: string) => {
      console.log("Mock getUser called with token:", token);
      if (token === "test-token") {
        return {
          data: { user: { id: mockData.user_id } },
          error: null
        };
      }
      return {
        data: { user: null },
        error: { message: "Invalid token" }
      };
    }
  },
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: string) => ({
        eq: (column: string, value: string) => ({
          single: async () => {
            console.log(`Mock from(${table}).select(${columns}).eq(${column}, ${value}).eq(${column}, ${value}).single()`);
            if (table === "grant_applications") {
              return {
                data: {
                  id: mockData.grant_application_id,
                  user_id: mockData.user_id
                },
                error: null
              };
            }
            return { data: null, error: { message: "Not found" } };
          }
        }),
        order: (column: string, options: any) => ({
          limit: (limit: number, options: any) => ({
            single: async () => {
              console.log(`Mock from(${table}).select(${columns}).eq(${column}, ${value}).order(${column}, ${JSON.stringify(options)}).limit(${limit}, ${JSON.stringify(options)}).single()`);
              if (table === "grant_application_sections") {
                if (value === "non-existent-id") {
                  return {
                    data: null,
                    error: { code: "PGRST116", message: "Not found" }
                  };
                }
                // Return data with no AI output for the no AI output test
                if (value === "no-ai-output-id" && options?.foreignTable === "grant_application_section_fields") {
                  return {
                    data: {
                      id: mockData.section_id,
                      grant_application_id: mockData.grant_application_id,
                      grant_section_id: 'test-grant-section-id',
                      name: 'Test Section',
                      grant_requirements: mockData.grant_requirements,
                      grant_application_section_fields: [{
                        id: 'test-field-id',
                        ai_output: null,
                        user_instructions: mockData.user_instructions,
                        user_comments_on_ai_output: mockData.user_comments_on_ai_output,
                        ai_model: 'gpt-4'
                      }]
                    },
                    error: null
                  };
                }
                // Return data with AI output for successful test
                if (value === "test-section-id" && options?.foreignTable === "grant_application_section_fields") {
                  return {
                    data: {
                      id: mockData.section_id,
                      grant_application_id: mockData.grant_application_id,
                      grant_section_id: 'test-grant-section-id',
                      name: 'Test Section',
                      grant_requirements: mockData.grant_requirements,
                      grant_application_section_fields: [{
                        id: 'test-field-id',
                        ai_output: mockData.ai_output,
                        user_instructions: mockData.user_instructions,
                        user_comments_on_ai_output: mockData.user_comments_on_ai_output,
                        ai_model: 'gpt-4'
                      }]
                    },
                    error: null
                  };
                }
                return {
                  data: {
                    id: mockData.section_id,
                    grant_application_id: mockData.grant_application_id,
                    grant_section_id: 'test-grant-section-id',
                    name: 'Test Section',
                    grant_requirements: mockData.grant_requirements,
                    grant_application_section_fields: [{
                      id: 'test-field-id',
                      ai_output: mockData.ai_output,
                      user_instructions: mockData.user_instructions,
                      user_comments_on_ai_output: mockData.user_comments_on_ai_output,
                      ai_model: 'gpt-4'
                    }]
                  },
                  error: null
                };
              }
              return { data: null, error: { message: "Not found" } };
            }
          })
        }),
        single: async () => {
          console.log(`Mock from(${table}).select(${columns}).eq(${column}, ${value}).single()`);
          if (table === "grant_applications") {
            return {
              data: {
                id: mockData.grant_application_id,
                user_id: mockData.user_id
              },
              error: null
            };
          }
          if (table === "grant_application_sections") {
            if (value === "non-existent-id") {
              return {
                data: null,
                error: { code: "PGRST116", message: "Not found" }
              };
            }
            return {
              data: {
                id: mockData.section_id,
                grant_application_id: mockData.grant_application_id,
                grant_section_id: 'test-grant-section-id',
                name: 'Test Section',
                grant_requirements: mockData.grant_requirements,
                grant_application_section_fields: [{
                  id: 'test-field-id',
                  ai_output: mockData.ai_output,
                  user_instructions: mockData.user_instructions,
                  user_comments_on_ai_output: mockData.user_comments_on_ai_output,
                  ai_model: 'gpt-4'
                }]
              },
              error: null
            };
          }
          return { data: null, error: { message: "Not found" } };
        }
      })
    }),
    insert: (data: any) => ({
      select: (columns: string) => ({
        single: async () => {
          console.log(`Mock from(${table}).insert().select(${columns}).single()`);
          return {
            data: { id: 'test-field-id', ...data },
            error: null
          };
        }
      })
    })
  })
};

// Set up mock client
console.log("Setting up global mock client...");
// @ts-ignore
globalThis.supabase = mockSupabase;
console.log("Global mock client set:", !!globalThis.supabase);

// Mock fetch for OpenAI API
console.log("Setting up fetch mock...");
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url: string | URL | Request, options?: RequestInit) => {
  console.log("Mock fetch called with URL:", url.toString());
  if (url.toString().includes('api.openai.com')) {
    // Check if this is the no AI output test case
    const isNoAiOutputTest = new Error().stack?.includes("no AI output found");
    if (isNoAiOutputTest) {
      return new Response(JSON.stringify({
        error: { message: "OpenAI API error: Unauthorized" }
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({
      choices: [{ message: { content: 'Generated test text' } }]
    }));
  }
  return originalFetch(url, options);
};

console.log("=== Setup.ts complete ===");

// Export cleanup function
export function cleanup() {
  console.log("=== Starting cleanup ===");
  // Restore environment variables
  for (const [key, value] of Object.entries(originalEnv)) {
    Deno.env.set(key, value);
  }

  // Restore fetch
  globalThis.fetch = originalFetch;

  // Restore Supabase client
  // @ts-ignore
  delete globalThis.supabase;
  console.log("=== Cleanup complete ===");
} 