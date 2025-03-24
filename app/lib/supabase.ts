import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const clientOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 
      'x-my-custom-header': 'fundflowai',
      'Accept': 'application/json'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    autoConnect: false
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

// Handle visibility changes
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      try {
        // Only reconnect if there are active channels
        if (supabase.realtime.channels.length > 0) {
          // Instead of creating a new client, reset the connection of the existing one
          await supabase.realtime.disconnect();
          await supabase.realtime.connect();
          
          // Re-authenticate if needed
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.auth.refreshSession();
          }
        }
      } catch (error) {
        console.error('Error resetting Supabase connection:', error);
      }
    }
  });
}

// Helper function to create a user profile after signup
export async function createUserProfile(userId: string) {
  const { error } = await supabase
    .from('user_profiles')
    .insert({ 
      id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
} 