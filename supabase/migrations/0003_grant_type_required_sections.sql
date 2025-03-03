-- Create a junction table for many-to-many relationship between grant_type and grant_sections
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

-- Create indexes for better query performance
CREATE INDEX idx_grant_type_required_sections_grant_type_id ON public.grant_type_required_sections USING btree (grant_type_id) TABLESPACE pg_default;
CREATE INDEX idx_grant_type_required_sections_grant_section_id ON public.grant_type_required_sections USING btree (grant_section_id) TABLESPACE pg_default;

COMMENT ON TABLE public.grant_type_required_sections IS 'Junction table linking grant types to their required sections';
