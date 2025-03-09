/**
 * Authentication context for managing user sessions and profile data.
 * Integrates with Supabase auth and database for persistent storage.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '~/lib/supabase';
import type { AuthError, User, UserResponse, AuthResponse, Session } from '@supabase/supabase-js';

/**
 * User profile data stored in the database.
 * Extends basic auth user data with application-specific fields.
 */
type UserProfile = {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  organization_id?: string;
  role?: string;
};

/**
 * Authentication context interface defining available
 * state and methods for auth operations.
 */
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

/**
 * Provider component that wraps the app and makes auth available to all child components.
 * Handles session persistence and real-time auth state updates.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }
      
      setLoading(false);
      
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

  /**
   * Fetches user profile data from the database.
   * Called automatically when auth state changes.
   */
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

  /**
   * Authenticates user with email and password.
   * Updates auth state on successful login.
   */
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

  /**
   * Creates new user account and profile.
   * Handles both auth signup and profile creation in database.
   */
  const signUp = async (
    email: string, 
    password: string, 
    userData?: { firstName?: string; lastName?: string }
  ) => {
    try {
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
      
      if (data?.user) {
        const userId = data.user.id;
        
        const newProfile: UserProfile = {
          id: userId,
          email: email,
          first_name: userData?.firstName || '',
          last_name: userData?.lastName || '',
          display_name: userData?.firstName && userData?.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : email.split('@')[0],
        };
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(newProfile);
        
        if (profileError) {
          console.error('Error creating user profile during signup:', profileError);
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

  /**
   * Ends the current user session and clears auth state.
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  /**
   * Updates user profile data in the database.
   * Requires authenticated user session.
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
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

/**
 * Hook that provides access to the auth context.
 * Must be used within an AuthProvider component.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 