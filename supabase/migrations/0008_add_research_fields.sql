-- Add research fields to grant_applications
ALTER TABLE grant_applications
ADD COLUMN openai_thread_id TEXT,
ADD COLUMN research_assistant_id TEXT,
ADD COLUMN research_status TEXT CHECK (research_status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started';

-- Add comment for clarity
COMMENT ON COLUMN grant_applications.openai_thread_id IS 'OpenAI thread ID for deep research conversations';
COMMENT ON COLUMN grant_applications.research_assistant_id IS 'OpenAI assistant ID for deep research';
COMMENT ON COLUMN grant_applications.research_status IS 'Status of deep research process'; 