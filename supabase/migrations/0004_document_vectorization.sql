-- Document Vectorization Infrastructure Migration
--
-- Enables pgvector extension
-- Creates vector storage
-- Adds status tracking to documents

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vectorization status to document tables
ALTER TABLE public.grant_application_documents
ADD COLUMN vectorization_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN vectorization_error TEXT,
ADD COLUMN last_vectorized_at TIMESTAMPTZ;

ALTER TABLE public.grant_application_section_documents
ADD COLUMN vectorization_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN vectorization_error TEXT,
ADD COLUMN last_vectorized_at TIMESTAMPTZ;

-- Create vector storage tables
CREATE TABLE public.grant_application_document_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES grant_application_documents(id) ON DELETE CASCADE,
    vector vector(1536), -- OpenAI's ada-002 dimension
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.grant_application_section_document_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES grant_application_section_documents(id) ON DELETE CASCADE,
    vector vector(1536), -- OpenAI's ada-002 dimension
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indices for performance
CREATE INDEX idx_app_doc_vectors_document_id ON grant_application_document_vectors(document_id);
CREATE INDEX idx_section_doc_vectors_document_id ON grant_application_section_document_vectors(document_id);

-- Enable RLS
ALTER TABLE grant_application_document_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_application_section_document_vectors ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for vectors
CREATE POLICY "Users can view their own document vectors" 
ON grant_application_document_vectors
FOR SELECT 
USING (
    document_id IN (
        SELECT d.id 
        FROM grant_application_documents d
        JOIN grant_applications a ON d.grant_application_id = a.id
        WHERE a.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own document vectors" 
ON grant_application_document_vectors
FOR DELETE 
USING (
    document_id IN (
        SELECT d.id 
        FROM grant_application_documents d
        JOIN grant_applications a ON d.grant_application_id = a.id
        WHERE a.user_id = auth.uid()
    )
);

CREATE POLICY "Users can view their own section document vectors" 
ON grant_application_section_document_vectors
FOR SELECT 
USING (
    document_id IN (
        SELECT d.id 
        FROM grant_application_section_documents d
        JOIN grant_application_section s ON d.grant_application_section_id = s.id
        JOIN grant_applications a ON s.grant_application_id = a.id
        WHERE a.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own section document vectors" 
ON grant_application_section_document_vectors
FOR DELETE 
USING (
    document_id IN (
        SELECT d.id 
        FROM grant_application_section_documents d
        JOIN grant_application_section s ON d.grant_application_section_id = s.id
        JOIN grant_applications a ON s.grant_application_id = a.id
        WHERE a.user_id = auth.uid()
    )
); 