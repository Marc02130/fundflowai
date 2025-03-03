import type { Session, User } from "@supabase/supabase-js";

export namespace Route {
  export interface MetaArgs {
    [key: string]: any;
  }
}

export interface AuthFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends AuthFormData {
  firstName?: string;
  lastName?: string;
  confirmPassword: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  organization_id?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

export type AuthAction = 
  | { type: 'SET_USER'; payload: { user: User | null; session: Session | null } }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SIGN_OUT' }; 