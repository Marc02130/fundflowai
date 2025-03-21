-- Create enum for interaction types
CREATE TYPE interaction_type AS ENUM ('ai_output', 'user_response', 'ai_response');

-- Create grant_application_deep_research table
CREATE TABLE IF NOT EXISTS grant_application_deep_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_application_id UUID NOT NULL REFERENCES grant_applications(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL DEFAULT 'ai_output',
  content text NOT NULL,
  has_generated_report boolean not null default false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_deep_research_grant_app_id ON grant_application_deep_research(grant_application_id);
CREATE INDEX IF NOT EXISTS idx_deep_research_created_at ON grant_application_deep_research(created_at DESC);

-- Add RLS policies
ALTER TABLE grant_application_deep_research ENABLE ROW LEVEL SECURITY;

-- Policy for select: users can view research for applications they own
CREATE POLICY "Users can view research for their applications" ON grant_application_deep_research
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM grant_applications ga
      WHERE ga.id = grant_application_id
      AND ga.user_id = auth.uid()
    )
  );

-- Policy for insert: users can add research to applications they own
CREATE POLICY "Users can add research to their applications" ON grant_application_deep_research
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM grant_applications ga
      WHERE ga.id = grant_application_id
      AND ga.user_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON grant_application_deep_research
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 