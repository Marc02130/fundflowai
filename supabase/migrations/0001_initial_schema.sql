-- Initial Schema Migration
-- 
-- Sets up the core database schema for the FundFlow AI application.
-- Creates all necessary tables, relationships, and constraints.
-- Implements the foundation for grant management and AI-assisted content generation.

-- Define supported document package types for grant submissions
create type public.document_package_type as enum (
  'Concept Outline',
  'Letter of Intent',
  'Preliminary Proposal',
  'Full Proposal'
);

-- Define allowed file types for document uploads and attachments
create type public.file_type as enum (
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'csv',
  'json',
  'xml',
  'png',
  'jpg',
  'jpeg',
  'tif',
  'tiff',
  'svg'
);

-- Clean up any existing tables to ensure clean migration
DROP TABLE IF EXISTS public.user_ai_prompts;
DROP TABLE IF EXISTS public.grant_application_section_fields;
DROP TABLE IF EXISTS public.grant_application_section_documents;
DROP TABLE IF EXISTS public.grant_application_section;
DROP TABLE IF EXISTS public.grant_application_documents;
DROP TABLE IF EXISTS public.grant_applications;
DROP TABLE IF EXISTS public.grant_opportunities;
DROP TABLE IF EXISTS public.grant_requirements;
DROP TABLE IF EXISTS public.grant_sections;
DROP TABLE IF EXISTS public.grant_type;
DROP TABLE IF EXISTS public.organization_grant_requirements;
DROP TABLE IF EXISTS public.grants;
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.organizations;

-- Organizations: Stores organization details and grant funder status
create table public.organizations (
  id uuid not null default gen_random_uuid (),
  name character varying(255) not null,
  description character varying(255) null,
  grant_funder boolean null default false,  -- Indicates if org funds grants
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  deleted_at timestamp without time zone null,
  url character varying(255) null,
  grant_opportunities_url text null,
  constraint organizations_pkey primary key (id)
) TABLESPACE pg_default;

-- User profiles: Extended user information and organization affiliations
create table public.user_profiles (
  id uuid not null,  -- Maps to auth.users.id
  first_name character varying(100) not null,
  last_name character varying(100) not null,
  organization_id uuid null,  -- Optional org affiliation
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  deleted_at timestamp without time zone null,
  role character varying(50) not null default 'user'::character varying,
  display_name text null,
  constraint user_profiles_pkey primary key (id),
  constraint fk_users_organization foreign KEY (organization_id) references organizations (id)
) TABLESPACE pg_default;

-- Grants: Base grant definitions and metadata
create table public.grants (
  id uuid not null default gen_random_uuid (),
  description text null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  active boolean not null default true,
  code character varying(25) null,
  organization_id uuid not null,  -- Funding organization
  name character varying null,
  url text null,
  constraint grants_pkey primary key (id),
  constraint grants_organization_id_fkey foreign KEY (organization_id) references organizations (id)
) TABLESPACE pg_default;
create index IF not exists idx_grants_organization_id on public.grants using btree (organization_id) TABLESPACE pg_default;

-- Organization requirements: Specific criteria for grant applications
create table public.organization_grant_requirements (
  id uuid not null default gen_random_uuid (),
  requirement character varying(255) not null,
  url character varying(255) not null,
  active boolean null default true,
  organization_id uuid null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint organization_grant_requirements_pkey primary key (id),
  constraint organization_grant_requirements_organization_id_fkey foreign KEY (organization_id) references organizations (id)
) TABLESPACE pg_default;

-- Grant types: Categories and classifications of grants
create table public.grant_type (
  id uuid not null default gen_random_uuid (),
  name character varying(255) not null,
  description text not null,
  active boolean null default true,
  organization_id uuid null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint grant_type_pkey primary key (id),
  constraint grant_type_organization_id_fkey foreign KEY (organization_id) references organizations (id)
) TABLESPACE pg_default;

-- Grant sections: Templates for grant application components
create table public.grant_sections (
  id uuid not null default gen_random_uuid (),
  grant_id uuid not null,
  name character varying(255) not null,
  description text null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  output_type character varying(10) not null default null::character varying,
  flow_order integer null,  -- Display Order in grant application view and workflow
  optional boolean null default false,  -- Whether section is required
  resubmission boolean null default false,  -- For resubmission applications
  ai_generator_prompt text null,  -- Prompt for AI content generation
  ai_visualizations_prompt text null,  -- Prompt for AI visualizations
  document_package public.document_package_type null default 'Full Proposal'::document_package_type,
  instructions text null,  -- Instructions to grant writer for section
  constraint grant_sections_pkey primary key (id),
  constraint grant_sections_grant_id_fkey foreign KEY (grant_id) references grants (id)
) TABLESPACE pg_default;

-- Grant requirements: Specific criteria for grant applications
create table public.grant_requirements (
  id uuid not null default gen_random_uuid (),
  requirement character varying(255) not null,
  url character varying(255) not null,
  active boolean null default true,
  grant_id uuid null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint grant_requirements_pkey primary key (id),
  constraint grant_requirements_grant_id_fkey foreign KEY (grant_id) references grants (id)
) TABLESPACE pg_default;

-- Grant opportunities: Active funding opportunities
create table public.grant_opportunities (
  id uuid not null default gen_random_uuid (),
  announcement_number character varying(50) not null,
  title text not null,
  release_date date not null,
  open_date date not null,
  expiration_date date not null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  deleted_at timestamp without time zone null,
  grant_id uuid not null,
  url text null,
  max_amount numeric(12, 2) null,  -- Maximum funding amount
  constraint grant_opportunities_pkey primary key (id),
  constraint grant_opportunities_announcement_number_unique unique (announcement_number),
  constraint grant_opportunities_grant_id_fkey foreign KEY (grant_id) references grants (id)
) TABLESPACE pg_default;
create index IF not exists idx_grant_opportunities_announcement_number on public.grant_opportunities using btree (announcement_number) TABLESPACE pg_default;
create index IF not exists idx_grant_opportunities_grant_id on public.grant_opportunities using btree (grant_id) TABLESPACE pg_default;

-- Grant applications: User submissions for grant opportunities
create table public.grant_applications (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,  -- Applicant
  title character varying(255) null,
  status character varying(50) not null default 'in-progress'::character varying,
  amount_requested numeric(12, 2) null,
  grant_type_id uuid null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  deleted_at timestamp without time zone null,
  resubmission boolean null default false,
  grant_opportunity_id uuid not null,
  description text null,
  constraint grant_applications_pkey primary key (id),
  constraint grant_applications_grant_opportunity_id_fkey foreign KEY (grant_opportunity_id) references grant_opportunities (id),
  constraint grant_applications_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;
create index IF not exists idx_grant_applications_opportunity_id on public.grant_applications using btree (grant_opportunity_id) TABLESPACE pg_default;

-- Application documents: Files attached to grant applications
create table public.grant_application_documents (
  id uuid not null default gen_random_uuid (),
  grant_application_id uuid not null,
  file_name character varying(255) null,
  file_type public.file_type not null,
  file_path character varying(1024) not null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint grant_application_documents_pkey primary key (id),
  constraint grant_application_doc_grant_application_id_fkey foreign KEY (grant_application_id) references grant_applications (id)
) TABLESPACE pg_default;

-- Application sections: Individual components of applications
create table public.grant_application_section (
  id uuid not null default gen_random_uuid (),
  grant_application_id uuid not null,
  grant_section_id uuid not null,
  is_completed boolean not null default false,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  flow_order integer null,  -- Order in application
  constraint grant_application_section_pkey primary key (id),
  constraint grant_application_section_grant_application_id_fkey foreign KEY (grant_application_id) references grant_applications (id),
  constraint grant_application_section_grant_section_id_fkey foreign KEY (grant_section_id) references grant_sections (id)
) TABLESPACE pg_default;

-- Section documents: Files specific to application sections
create table public.grant_application_section_documents (
  id uuid not null default gen_random_uuid (),
  grant_application_section_id uuid not null,
  file_name character varying(255) null,
  file_type public.file_type not null,
  file_path character varying(1024) not null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint grant_application_section_documents_pkey primary key (id),
  constraint grant_application_section_doc_grant_application_section_id_fkey foreign KEY (grant_application_section_id) references grant_application_section (id)
) TABLESPACE pg_default;

-- Section fields: Content and AI generation data for sections
create table public.grant_application_section_fields (
  id uuid not null default gen_random_uuid (),
  grant_application_section_id uuid not null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  user_instructions text null,  -- Custom instructions for AI from the grant writer
  user_comments_on_ai_output text null,  -- Feedback on AI output from the grant writer
  ai_output text null,  -- Generated content
  ai_model text null,  -- AI model used
  constraint grant_application_section_fields_pkey primary key (id),
  constraint grant_application_section_fie_grant_application_section_id_fkey foreign KEY (grant_application_section_id) references grant_application_section (id)
) TABLESPACE pg_default;

-- User AI prompts: Custom prompts for AI generation
create table public.user_ai_prompts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  name character varying(255) not null,
  description text null,
  prompt_text text not null,
  prompt_type character varying(50) not null default 'generator',
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  deleted_at timestamp without time zone null,
  constraint user_ai_prompts_pkey primary key (id),
  constraint user_ai_prompts_user_id_fkey foreign key (user_id) references public.user_profiles (id)
) TABLESPACE pg_default;

-- Performance optimization indices
create index idx_user_ai_prompts_user_id on public.user_ai_prompts using btree (user_id) TABLESPACE pg_default;
create index idx_user_ai_prompts_prompt_type on public.user_ai_prompts using btree (prompt_type) TABLESPACE pg_default;
create index idx_user_ai_prompts_is_default on public.user_ai_prompts using btree (is_default) TABLESPACE pg_default;

