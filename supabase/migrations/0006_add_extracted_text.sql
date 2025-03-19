-- Add extracted_text column to grant_application_documents
ALTER TABLE public.grant_application_documents
ADD COLUMN extracted_text text;

-- Add extracted_text column to grant_application_section_documents
ALTER TABLE public.grant_application_section_documents
ADD COLUMN extracted_text text; 