console.log("=== Starting create-visuals setup.ts ===");

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
  grant_sections: {
    ai_visualizations_prompt: 'Test visualization prompt'
  }
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
  from: (table: string) => {
    console.log(`Mock from(${table}) called`);
    const mockClient = {
      select: (...fields: string[]) => {
        console.log(`Mock from(${table}).select(${fields.join(', ')}) called`);
        return {
          eq: (field: string, value: any) => {
            console.log(`Mock from(${table}).select(...).eq(${field}, ${value}) called`);
            return {
              eq: (field2: string, value2: any) => {
                console.log(`Mock from(${table}).select(...).eq(${field}, ${value}).eq(${field2}, ${value2}) called`);
                if (table === 'grant_applications' && field === 'id' && field2 === 'user_id') {
                  if (value === 'test-application-id' && value2 === 'test-user-id') {
                    return {
                      single: () => Promise.resolve({ data: { id: 'test-application-id' }, error: null })
                    };
                  }
                  return {
                    single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } })
                  };
                }
                if (table === 'grant_application_section_documents' && field === 'grant_application_section_id' && field2 === 'file_path') {
                  if (value === 'test-section-id' && value2 === 'test-image.png') {
                    return {
                      single: () => Promise.resolve({
                        data: {
                          id: 'test-doc-id',
                          file_path: 'test-image.png',
                          file_type: 'png'
                        },
                        error: null
                      })
                    };
                  }
                  return {
                    single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } })
                  };
                }
                if (table === 'grant_application_documents' && field === 'grant_application_id' && field2 === 'file_path') {
                  if (value === 'test-application-id' && value2 === 'test-image.png') {
                    return {
                      single: () => Promise.resolve({
                        data: {
                          id: 'test-doc-id',
                          file_path: 'test-image.png',
                          file_type: 'png'
                        },
                        error: null
                      })
                    };
                  }
                  return {
                    single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } })
                  };
                }
                return {
                  single: () => Promise.resolve({ data: null, error: null })
                };
              },
              single: () => {
                if (table === 'grant_application_sections') {
                  if (value === 'test-section-id') {
                    return Promise.resolve({
                      data: {
                        id: 'test-section-id',
                        grant_application_id: 'test-application-id',
                        grant_sections: { ai_visualizations_prompt: 'Test visualization prompt' }
                      },
                      error: null
                    });
                  }
                  if (value === 'non-existent-id') {
                    return Promise.resolve({
                      data: null,
                      error: { code: 'PGRST116' }
                    });
                  }
                }
                return Promise.resolve({ data: null, error: null });
              }
            };
          }
        };
      },
      insert: (data: any) => {
        console.log(`Mock from(${table}).insert(${JSON.stringify(data)}) called`);
        return {
          select: (...fields: string[]) => {
            console.log(`Mock from(${table}).insert().select(${fields.join(', ')}) called`);
            return {
              single: () => Promise.resolve({
                data: {
                  id: 'test-doc-id',
                  ...data
                },
                error: null
              })
            };
          }
        };
      }
    };
    return mockClient;
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: Blob, options: any) => {
        console.log(`Mock storage.from(${bucket}).upload(${path}, ${file.type}, ${JSON.stringify(options)})`);
        return {
          data: { path },
          error: null
        };
      }
    })
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
      data: [{
        url: 'https://example.com/generated-image.png'
      }]
    }));
  }
  if (url.toString().includes('generated-image.png')) {
    return new Response(new Blob(['test-image-data'], { type: 'image/png' }));
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