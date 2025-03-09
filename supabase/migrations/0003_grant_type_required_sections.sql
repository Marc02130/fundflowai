-- Grant Type Required Sections Migration
--
-- Creates relationships between grant types and their required sections
-- Implements storage security for file management
-- Sets up access control for file operations

-- Junction table to manage many-to-many relationships
-- Links grant types with their required sections
-- Includes ordering and creation tracking
CREATE TABLE public.grant_type_required_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  grant_type_id uuid NOT NULL,
  grant_section_id uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT grant_type_required_sections_pkey PRIMARY KEY (id),
  CONSTRAINT grant_type_required_sections_grant_type_id_fkey FOREIGN KEY (grant_type_id) REFERENCES public.grant_type(id) ON DELETE CASCADE,
  CONSTRAINT grant_type_required_sections_grant_section_id_fkey FOREIGN KEY (grant_section_id) REFERENCES public.grant_sections(id) ON DELETE CASCADE,
  CONSTRAINT grant_type_required_sections_unique UNIQUE (grant_type_id, grant_section_id)
) TABLESPACE pg_default;

-- Performance optimization indices for relationship queries
CREATE INDEX idx_grant_type_required_sections_grant_type_id ON public.grant_type_required_sections USING btree (grant_type_id) TABLESPACE pg_default;
CREATE INDEX idx_grant_type_required_sections_grant_section_id ON public.grant_type_required_sections USING btree (grant_section_id) TABLESPACE pg_default;

COMMENT ON TABLE public.grant_type_required_sections IS 'Junction table linking grant types to their required sections';

-- Enable Row Level Security for storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to upload files to their applications
-- Validates that the upload path matches user's application
CREATE POLICY "Users can upload files to their own application folders" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  -- Extract application ID from path (format: {application_id}/{file_id}-{filename})
  SPLIT_PART(name, '/', 1) IN (
    SELECT id::text 
    FROM grant_applications 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Allow users to view their application files
-- Validates file path against user's applications
CREATE POLICY "Users can view files in their own application folders" ON storage.objects
FOR SELECT TO authenticated
USING (
  SPLIT_PART(name, '/', 1) IN (
    SELECT id::text 
    FROM grant_applications 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Allow users to delete their application files
-- Validates file path against user's applications
CREATE POLICY "Users can delete files in their own application folders" ON storage.objects
FOR DELETE TO authenticated
USING (
  SPLIT_PART(name, '/', 1) IN (
    SELECT id::text 
    FROM grant_applications 
    WHERE user_id = auth.uid()
  )
);
