Technical Requirements for AI Agent: Research Agent 
1. Feature Overview

The research agent is designed to enhance grant applications by automatically retrieving and attaching relevant research papers. Key aspects include:

Purpose: Automatically gather the top two relevant research papers that are not already attached to a grant application or a specific section.
Sources:
NCBI (PubMed, filtered for full-text availability in PubMed Central).
bioRxiv.
medRxiv.
Google Scholar (limited to papers with full-text PDFs available).
Attachment Context: Papers can be attached to either the entire grant application or a specific section, depending on the input provided.
2. Inputs

The feature requires specific inputs to determine the context and content for the search:

Required Input:
grant_application_id: A UUID identifying the grant application.
Optional Input:
grant_application_section_id: A UUID identifying a specific section of the grant application (if provided, the agent focuses on that section).
Text Source:
If grant_application_section_id is provided:
Use grant_application_section_fields.user_instructions as the primary text for generating the search query.
If no grant_application_section_id is provided:
Use grant_applications.description as the primary text.
Existing Attachments:
Retrieve existing documents from:
grant_application_documents (for application-level attachments).
grant_application_section_documents (for section-level attachments, if applicable).
3. AI Query Generation

An AI-generated search query will drive the research paper retrieval process:

Prompt Construction:
Combine the text source (either description or user_instructions) with metadata from existing attachments (e.g., file names).
Example prompt:
"Based on the following text and attached documents, suggest a search query for related current research papers: [text] Attached: [file names]."
OpenAI Integration:
Use the OpenAI API to generate a concise, targeted search query (e.g., "CRISPR cancer therapy clinical trials").
4. Searching Research Sources

The agent will search the specified sources using the AI-generated query:

Search Process:
Query each source: NCBI (PubMed), bioRxiv, medRxiv, and Google Scholar.
Limit results to papers with full-text PDFs available.
Filtering:
Exclude papers already attached by comparing their doi or title against records in grant_application_documents or grant_application_section_documents.
5. Selecting Top Papers

The agent will select the most relevant and recent papers:

Selection Criteria:
Relevance: Based on source-provided relevance scores or keyword matching with the search query.
Recency: Prioritize papers with the most recent publication dates.
Limit:
Retrieve up to 10 results per source.
Select the top two new papers across all sources (not already attached).
6. Downloading and Attaching Papers

Once selected, the papers will be downloaded and stored:

Downloading:
Use direct PDF links provided by the sources to download the full-text files.
Storage:
Upload PDFs to Supabase Storage in a research-papers bucket, organized by grant_application_id.
Database Insertion:
Insert records into the appropriate table based on context:
grant_application_documents (if no section ID is provided).
grant_application_section_documents (if a section ID is provided).
Fields to populate:
file_name: Derived from the paper’s title (e.g., "CRISPR_Therapy_2023.pdf").
file_type: Set to pdf.
file_path: Path in Supabase Storage (e.g., /research-papers/[grant_application_id]/[file_name]).
doi: The paper’s DOI (if available, for duplicate checking).
title: The paper’s title (for duplicate checking and display).
7. Output

The feature will return a response indicating the result of the operation:

Success Response:
Format: JSON.
Example:
json

Collapse

Wrap

Copy
{
  "success": true,
  "data": [
    {
      "document_id": "uuid-of-document",
      "file_name": "CRISPR_Therapy_2023.pdf",
      "file_path": "/research-papers/[grant_application_id]/CRISPR_Therapy_2023.pdf",
      "source": "PubMed"
    },
    {
      "document_id": "uuid-of-document",
      "file_name": "Gene_Editing_2022.pdf",
      "file_path": "/research-papers/[grant_application_id]/Gene_Editing_2022.pdf",
      "source": "bioRxiv"
    }
  ]
}
Error Responses:
No new papers found:
json

Collapse

Wrap

Copy
{ "success": false, "error": "No new papers found" }
Invalid inputs:
json

Collapse

Wrap

Copy
{ "success": false, "error": "Invalid grant application or section ID" }
8. Technical Implementation

The feature will be implemented as a server-side function with the following details:

Supabase Edge Function:
Endpoint: /gather-research-papers.
HTTP Method: POST.
Request Body:
json

Collapse

Wrap

Copy
{
  "grant_application_id": "uuid",
  "grant_application_section_id": "uuid" // optional
}
Dependencies:
Supabase Client: For database queries and storage uploads.
OpenAI API: For generating search queries.
Axios: For downloading PDFs from source URLs.
Source-specific APIs or Libraries:
PubMed API (NCBI).
bioRxiv/medRxiv APIs or scrapers.
Scholarly library (for Google Scholar).
Performance Considerations:
Limit searches to 10 results per source to manage response times.
Process downloads and uploads asynchronously to avoid timeouts.
9. UI Integration

The feature will be accessible through the user interface as follows:

Trigger:
A button labeled "Gather Research Papers" on:
The Grant Application View (application-level).
The Section Editor (section-level).
Behavior:
Pass grant_application_id and, if applicable, grant_application_section_id to the endpoint.
Display a loading indicator while the agent processes.
On success, refresh the document list to show newly attached papers.
On error, display a user-friendly message (e.g., "No new papers found").
Summary

These requirements outline a robust research agent feature that leverages AI to generate search queries, retrieves relevant papers from multiple sources, filters out duplicates, and attaches the top two papers to the grant application or section. The implementation ensures efficiency, scalability, and seamless integration with the existing database and UI.