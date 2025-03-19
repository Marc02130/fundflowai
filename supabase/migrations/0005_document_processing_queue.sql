-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "net";
GRANT USAGE ON SCHEMA "net" TO "postgres";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "net" TO "postgres";

-- Create private schema for sensitive configuration
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

-- Create config table in private schema
CREATE TABLE IF NOT EXISTS private.config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies for config table
ALTER TABLE private.config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only service_role can access config" ON private.config
    USING (auth.role() = 'service_role');

-- Function to get config value
CREATE OR REPLACE FUNCTION private.get_config(config_key TEXT)
RETURNS TEXT AS $$
  SELECT value FROM private.config WHERE key = config_key;
$$ LANGUAGE sql SECURITY DEFINER;

-- Add extracted_text column to document tables
ALTER TABLE public.grant_application_documents
ADD COLUMN IF NOT EXISTS extracted_text text;

ALTER TABLE public.grant_application_section_documents
ADD COLUMN IF NOT EXISTS extracted_text text;

-- Create enums for document types and processing status
CREATE TYPE document_type AS ENUM ('application', 'section');
CREATE TYPE processing_status AS ENUM (
  'pending',
  'extracting',
  'extracted',
  'vectorizing',
  'completed',
  'failed'
);

-- Create tables
DROP TABLE IF EXISTS document_processing_queue;
CREATE TABLE IF NOT EXISTS document_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  document_type document_type NOT NULL,
  status processing_status NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_active_document 
    UNIQUE (document_id, document_type)
);

DROP TABLE IF EXISTS processing_logs;
CREATE TABLE IF NOT EXISTS processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  document_type document_type NOT NULL,
  event TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_queue_status ON document_processing_queue(status);
CREATE INDEX idx_queue_document ON document_processing_queue(document_id);
CREATE INDEX idx_queue_created_at ON document_processing_queue(created_at);
CREATE INDEX idx_logs_document ON processing_logs(document_id);
CREATE INDEX idx_logs_created_at ON processing_logs(created_at);

-- Create utility functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION log_processing_event(
  p_document_id UUID,
  p_document_type document_type,
  p_event TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO processing_logs (document_id, document_type, event, details)
  VALUES (p_document_id, p_document_type, p_event, p_details);
END;
$$ LANGUAGE plpgsql;

-- Create edge function notification functions
CREATE OR REPLACE FUNCTION notify_edge_function()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url text;
  payload jsonb;
  request_id bigint;
  response record;
BEGIN
  edge_function_url := 'https://lzzqttfkqbskoqxwpair.functions.supabase.co/extract-text';

  payload := jsonb_build_object(
    'id', NEW.id,
    'document_id', NEW.document_id,
    'document_type', NEW.document_type,
    'status', NEW.status
  );

  SELECT net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || private.get_config('service_role_key')
    ),
    body := payload
  ) INTO request_id;

  -- Wait for response
  PERFORM pg_sleep(0.5);
  
  SELECT * INTO response
  FROM net._http_response
  WHERE id = request_id;

  -- Log the response
  PERFORM log_processing_event(
    NEW.document_id,
    NEW.document_type,
    'Edge function response',
    jsonb_build_object(
      'request_id', request_id,
      'status_code', COALESCE(response.status_code, 0),
      'content', response.content,
      'error', response.error_msg
    )
  );

  -- Handle errors
  IF response.status_code >= 400 OR response.error_msg IS NOT NULL OR response.timed_out THEN
    UPDATE document_processing_queue
    SET status = CASE 
          WHEN attempts >= 3 THEN 'failed'
          ELSE 'pending'
        END,
        error = COALESCE(response.error_msg, 'HTTP ' || response.status_code)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_vectorize_function()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url text;
  payload jsonb;
  request_id bigint;
  response record;
  v_extracted_text text;
BEGIN
  -- Update status to vectorizing
  UPDATE document_processing_queue
  SET status = 'vectorizing',
      updated_at = NOW()
  WHERE id = NEW.id;

  -- Get the extracted text based on document type
  IF NEW.document_type = 'application' THEN
    SELECT extracted_text INTO v_extracted_text
    FROM grant_application_documents
    WHERE id = NEW.document_id;
  ELSE
    SELECT extracted_text INTO v_extracted_text
    FROM grant_application_section_documents
    WHERE id = NEW.document_id;
  END IF;

  edge_function_url := 'https://lzzqttfkqbskoqxwpair.functions.supabase.co/vectorize-worker';
  
  payload := jsonb_build_object(
    'type', 'DOCUMENT_EXTRACTED',
    'document_id', NEW.document_id,
    'document_type', NEW.document_type,
    'status', 'vectorizing',
    'extracted_text', v_extracted_text
  );

  SELECT net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || private.get_config('service_role_key')
    ),
    body := payload
  ) INTO request_id;

  -- Wait up to 5 seconds for response
  PERFORM pg_sleep(0.5);
  
  SELECT * INTO response
  FROM net._http_response
  WHERE id = request_id;

  -- Log the response
  PERFORM log_processing_event(
    NEW.document_id,
    NEW.document_type,
    'Edge function response',
    jsonb_build_object(
      'request_id', request_id,
      'status_code', response.status_code,
      'content', response.content,
      'error', response.error_msg
    )
  );

  -- Handle errors
  IF response.status_code >= 400 OR response.error_msg IS NOT NULL OR response.timed_out THEN
    UPDATE document_processing_queue
    SET status = 'failed',
        error = COALESCE(response.error_msg, 'HTTP ' || response.status_code)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check pg_net responses
CREATE OR REPLACE FUNCTION check_edge_function_response(p_request_id bigint)
RETURNS TABLE (
  status_code integer,
  content_type text,
  content text,
  error_msg text
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.status_code, r.content_type, r.content, r.error_msg
  FROM net._http_response r
  WHERE r.id = p_request_id;
END;
$$ LANGUAGE plpgsql;

-- Create queue management function
CREATE OR REPLACE FUNCTION queue_document_for_processing(
  p_document_id UUID,
  p_document_type document_type
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_table_name text;
  v_user_id uuid;
  v_document_exists boolean;
BEGIN
  -- Get the user ID
  v_user_id := auth.uid();
  
  -- Check if document exists in the appropriate table
  IF p_document_type = 'application' THEN
    SELECT EXISTS (
      SELECT 1 FROM grant_application_documents gad
      JOIN grant_applications ga ON gad.grant_application_id = ga.id
      WHERE gad.id = p_document_id AND ga.user_id = v_user_id
    ) INTO v_document_exists;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM grant_application_section_documents gasd
      JOIN grant_application_section gas ON gasd.grant_application_section_id = gas.id
      JOIN grant_applications ga ON gas.grant_application_id = ga.id
      WHERE gasd.id = p_document_id AND ga.user_id = v_user_id
    ) INTO v_document_exists;
  END IF;

  -- Raise exception if document doesn't exist or user doesn't have access
  IF NOT v_document_exists THEN
    RAISE EXCEPTION 'Document not found or access denied';
  END IF;

  -- Determine which table to update based on document type
  v_table_name := CASE p_document_type
    WHEN 'application' THEN 'grant_application_documents'
    WHEN 'section' THEN 'grant_application_section_documents'
  END;

  -- Insert or update queue entry
  INSERT INTO document_processing_queue (document_id, document_type)
  VALUES (p_document_id, p_document_type)
  ON CONFLICT (document_id, document_type)
  DO UPDATE SET
    status = 'pending',
    attempts = 0,
    error = NULL,
    updated_at = NOW();

  -- Update document status
  EXECUTE format('
    UPDATE public.%I 
    SET vectorization_status = $1,
        vectorization_error = NULL,
        last_vectorized_at = NULL
    WHERE id = $2', 
    v_table_name
  ) USING 'pending', p_document_id;

  -- Log the event
  PERFORM log_processing_event(
    p_document_id,
    p_document_type,
    'Document queued for processing'
  );
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS update_document_queue_updated_at
  ON document_processing_queue;

CREATE TRIGGER update_document_queue_updated_at
  BEFORE UPDATE ON document_processing_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for text extraction when status is pending
DROP TRIGGER IF EXISTS trigger_extract_document
  ON document_processing_queue;

CREATE TRIGGER trigger_extract_document
  AFTER INSERT OR UPDATE OF status ON document_processing_queue
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_edge_function();

-- Trigger for vectorization when status is extracted
DROP TRIGGER IF EXISTS trigger_vectorize_document
  ON document_processing_queue;

CREATE TRIGGER trigger_vectorize_document
  AFTER UPDATE OF status ON document_processing_queue
  FOR EACH ROW
  WHEN (NEW.status = 'extracted')
  EXECUTE FUNCTION notify_vectorize_function();

-- Set up cron jobs
SELECT cron.unschedule('cleanup-old-queue-entries');

SELECT cron.schedule(
  'cleanup-old-queue-entries',
  '0 0 * * *', -- Run daily at midnight
  $$
    DELETE FROM document_processing_queue
    WHERE (status = 'completed' OR status = 'failed')
      AND updated_at < NOW() - INTERVAL '7 days'
  $$
);

-- Set up RLS policies
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;

-- Service role policies
DROP POLICY IF EXISTS "Service role full access to queue"
  ON document_processing_queue;

CREATE POLICY "Service role full access to queue"
  ON document_processing_queue
  FOR ALL
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Service role full access to logs"
  ON processing_logs;

CREATE POLICY "Service role full access to logs"
  ON processing_logs
  FOR ALL
  TO service_role
  USING (true);

-- User policies
DROP POLICY IF EXISTS "Users can view their documents queue status"
  ON document_processing_queue;

CREATE POLICY "Users can view their documents queue status"
  ON document_processing_queue
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM grant_application_documents gad
      JOIN grant_applications ga ON gad.grant_application_id = ga.id
      WHERE gad.id = document_id
      AND ga.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM grant_application_section_documents gasd
      JOIN grant_application_section gas ON gasd.grant_application_section_id = gas.id
      JOIN grant_applications ga ON gas.grant_application_id = ga.id
      WHERE gasd.id = document_id
      AND ga.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their documents from queue"
  ON document_processing_queue;

CREATE POLICY "Users can delete their documents from queue"
  ON document_processing_queue
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM grant_application_documents gad
      JOIN grant_applications ga ON gad.grant_application_id = ga.id
      WHERE gad.id = document_id
      AND ga.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM grant_application_section_documents gasd
      JOIN grant_application_section gas ON gasd.grant_application_section_id = gas.id
      JOIN grant_applications ga ON gas.grant_application_id = ga.id
      WHERE gasd.id = document_id
      AND ga.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can queue their own documents"
  ON document_processing_queue;

CREATE POLICY "Users can queue their own documents"
  ON document_processing_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM grant_application_documents gad
      JOIN grant_applications ga ON gad.grant_application_id = ga.id
      WHERE gad.id = document_id
      AND ga.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM grant_application_section_documents gasd
      JOIN grant_application_section gas ON gasd.grant_application_section_id = gas.id
      JOIN grant_applications ga ON gas.grant_application_id = ga.id
      WHERE gasd.id = document_id
      AND ga.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view their documents processing logs"
  ON processing_logs;

CREATE POLICY "Users can view their documents processing logs"
  ON processing_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM grant_application_documents gad
      JOIN grant_applications ga ON gad.grant_application_id = ga.id
      WHERE gad.id = document_id
      AND ga.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM grant_application_section_documents gasd
      JOIN grant_application_section gas ON gasd.grant_application_section_id = gas.id
      JOIN grant_applications ga ON gas.grant_application_id = ga.id
      WHERE gasd.id = document_id
      AND ga.user_id = auth.uid()
    )
  );

-- Reset any stuck documents back to pending
UPDATE document_processing_queue
SET status = 'pending',
    attempts = 0,
    error = NULL,
    updated_at = NOW()
WHERE status = 'extracting'
  AND updated_at < NOW() - INTERVAL '5 minutes';

-- Add chunk_text column to vector tables
ALTER TABLE public.grant_application_document_vectors
ADD COLUMN IF NOT EXISTS chunk_text TEXT;

ALTER TABLE public.grant_application_section_document_vectors
ADD COLUMN IF NOT EXISTS chunk_text TEXT;

-- Make chunk_text NOT NULL after adding it
ALTER TABLE public.grant_application_document_vectors
ALTER COLUMN chunk_text SET NOT NULL;

ALTER TABLE public.grant_application_section_document_vectors
ALTER COLUMN chunk_text SET NOT NULL; 