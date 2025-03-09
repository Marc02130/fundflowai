# Database Migrations

## Overview
This directory contains the database migration files for the FundFlow AI application. Each migration represents a specific change to the database schema, applied in sequential order.

## Migration Files

### 0001_initial_schema.sql
Initial database schema setup that establishes the core tables and relationships.

**Key Components:**
- Custom enums: `document_package_type`, `file_type`
- Core tables:
  - `organizations`: Organization management
  - `user_profiles`: User profile data
  - `grants`: Grant definitions
  - `grant_type`: Grant type categorization
  - `grant_sections`: Section templates
  - `grant_requirements`: Grant-specific requirements
  - `grant_opportunities`: Available grant opportunities
  - `grant_applications`: User grant applications
  - `grant_application_documents`: Document management
  - `grant_application_section`: Section tracking
  - `grant_application_section_fields`: Section content
  - `user_ai_prompts`: Custom AI prompts

### 0002_create_user_profiles.sql
Implements Row Level Security (RLS) policies for user profiles.

**Features:**
- RLS policy enabling
- User-specific view permissions
- User-specific update permissions
- Automatic profile creation trigger

### 0003_grant_type_required_sections.sql
Establishes relationships between grant types and required sections.

**Features:**
- Junction table creation
- Performance optimizing indices
- Storage RLS policies
- File management permissions

## Best Practices

### Migration Naming
- Sequential numbering (0001, 0002, etc.)
- Descriptive names
- Underscore separation
- `.sql` extension

### Schema Design
- Clear table names
- Consistent column naming
- Appropriate data types
- Explicit constraints
- Proper indexing

### Security
- RLS policies
- Permission management
- Data access control
- File storage security

## Running Migrations

### Apply Migrations
```bash
supabase db push
```

### Reset Database
```bash
supabase db reset
```

### Create New Migration
```bash
supabase migration new migration_name
```

## Schema Guidelines

### Tables
- Use descriptive names
- Include timestamps
- Define primary keys
- Set up foreign keys
- Add appropriate indices

### Columns
- Use snake_case naming
- Include data types
- Set constraints
- Add default values
- Document special values

### Relationships
- Define cascading rules
- Set up proper indices
- Use consistent naming
- Document dependencies

## Security Considerations
- RLS policies for data access
- User-specific permissions
- File access controls
- Storage security
- Authentication integration

## Testing
- Test forward migrations
- Verify relationships
- Check constraints
- Validate indices
- Test RLS policies

## Limitations
- Sequential execution required
- Manual conflict resolution
- No automatic rollbacks
- Single transaction per file 