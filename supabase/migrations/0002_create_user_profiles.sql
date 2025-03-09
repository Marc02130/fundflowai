-- User Profiles Security Migration
--
-- Implements Row Level Security (RLS) policies for user profiles
-- Sets up automatic profile creation for new users
-- Ensures data privacy and access control

-- Enable RLS to restrict access to profile data
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own profile data
-- Matches auth.uid() with profile id for SELECT operations
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update only their own profile data
-- Matches auth.uid() with profile id for UPDATE operations
CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Function to automatically create user profile on registration
-- Triggered after new user creation in auth.users
-- Maps auth user data to profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute profile creation after user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 