console.log("=== Starting setup.ts ===");

// Mock environment variables
const originalEnv = Deno.env.toObject();
console.log("Setting up environment variables...");
Deno.env.set('SUPABASE_URL', 'https://test.supabase.co');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
Deno.env.set('OPENAI_API_KEY', 'test-key');
Deno.env.set('OPENAI_MODEL', 'gpt-4');

// Mock data
console.log("Defining mock data...");
const mockSection = {
  id: "test-section-id",
  grant_application_id: "test-application-id",
  grant_section_id: "test-grant-section-id",
  ai_generator_prompt: "Test section prompt",
  section_name: "Test Section",
  is_completed: false
};

const mockUserPrompt = {
  prompt_text: "Test custom prompt"
};

const mockAttachments = [
  { file_name: "test.pdf", file_type: "application/pdf", file_path: "test/path/test.pdf" }
];

const mockContext = {
  user_instructions: "Test instructions",
  user_comments_on_ai_output: "Test comments",
  ai_output: "Previous AI output"
};

// Mock Supabase client
console.log("Creating mock Supabase client...");
const mockSupabase = {
  auth: {
    getUser: async (token: string) => {
      console.log("Mock getUser called with token:", token);
      if (token === "test-token") {
        console.log("Token matches, returning test user");
        return {
          data: { user: { id: "test-user-id" } },
          error: null
        };
      }
      console.log("Token mismatch, returning error");
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
                  id: "test-application-id",
                  user_id: "test-user-id" 
                },
                error: null 
              };
            }
            if (table === "user_ai_prompts") {
              return { 
                data: {
                  prompt_text: "Test custom prompt"
                },
                error: null 
              };
            }
            if (table === "grant_application_sections") {
              if (value === "non-existent-section") {
                return {
                  data: null,
                  error: { code: "PGRST116", message: "Not found" }
                };
              }
              return { 
                data: {
                  id: "test-section-id",
                  grant_application_id: "test-application-id",
                  grant_section_id: "test-grant-section-id",
                  ai_generator_prompt: "Test section prompt",
                  section_name: "Test Section",
                  is_completed: false
                },
                error: null 
              };
            }
            if (table === "grant_application_section_fields") {
              return {
                data: mockContext,
                error: null
              };
            }
            return { data: null, error: { message: "Not found" } };
          }
        }),
        order: (column: string, options: any) => ({
          limit: (limit: number) => ({
            single: async () => {
              console.log(`Mock from(${table}).select(${columns}).eq(${column}, ${value}).order(${column}, ${JSON.stringify(options)}).limit(${limit}).single()`);
              if (table === "grant_application_section_fields") {
                return {
                  data: mockContext,
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
                id: "test-application-id",
                user_id: "test-user-id" 
              },
              error: null 
            };
          }
          if (table === "user_ai_prompts") {
            return { 
              data: {
                prompt_text: "Test custom prompt"
              },
              error: null 
            };
          }
          if (table === "grant_application_sections") {
            if (value === "non-existent-section") {
              return {
                data: null,
                error: { code: "PGRST116", message: "Not found" }
              };
            }
            return { 
              data: {
                id: "test-section-id",
                grant_application_id: "test-application-id",
                grant_section_id: "test-grant-section-id",
                ai_generator_prompt: "Test section prompt",
                section_name: "Test Section",
                is_completed: false
              },
              error: null 
            };
          }
          if (table === "grant_application_section_fields") {
            return {
              data: mockContext,
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
            data: { id: "test-field-id", ...data },
            error: null
          };
        }
      })
    })
  }),
  rpc: async (fn: string, params: any) => {
    console.log(`Mock rpc called with function: ${fn}, params:`, params);
    if (fn === "get_section_attachments") {
      return {
        data: mockAttachments,
        error: null
      };
    }
    return { data: null, error: { message: "Function not found" } };
  }
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