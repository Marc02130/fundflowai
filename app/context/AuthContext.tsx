import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '~/lib/supabase';
import type { AuthError, User, UserResponse, AuthResponse, Session } from '@supabase/supabase-js';

type UserProfile = {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  organization_id?: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: { firstName?: string; lastName?: string }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }
      
      setLoading(false);
      
      // Listen for auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user || null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        }
      );
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    checkUser();
  }, []);

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      setProfile(data || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as AuthError };
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string, 
    userData?: { firstName?: string; lastName?: string }
  ) => {
    try {
      // First, sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.firstName && userData?.lastName 
              ? `${userData.firstName} ${userData.lastName}` 
              : undefined,
          },
        },
      });
      
      if (error) return { error };
      
      // If signup was successful and we have a user, create a profile
      if (data?.user) {
        const userId = data.user.id;
        
        // Create a new profile record
        const newProfile: UserProfile = {
          id: userId,
          email: email,
          first_name: userData?.firstName || '',
          last_name: userData?.lastName || '',
          display_name: userData?.firstName && userData?.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : email.split('@')[0],
        };
        
        // Insert the new profile into the user_profiles table
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(newProfile);
        
        if (profileError) {
          console.error('Error creating user profile during signup:', profileError);
          // We don't return this error as it would prevent the user from signing up
          // Instead, we log it and will attempt to create the profile again later
        } else {
          console.log('User profile created successfully during signup');
          setProfile(newProfile);
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile after update
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 