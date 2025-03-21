-- Add vector_store_id to grant_applications
ALTER TABLE grant_applications
ADD COLUMN vector_store_id TEXT,
ADD COLUMN vector_store_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN grant_applications.vector_store_id IS 'OpenAI vector store ID for document search';
COMMENT ON COLUMN grant_applications.vector_store_expires_at IS 'When the vector store will expire'; 