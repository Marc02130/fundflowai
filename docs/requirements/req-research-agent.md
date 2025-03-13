Technical Requirements for AI Agent: Research Paper Gathering and Attachment
General Requirements

Purpose: Automate the collection of relevant research papers from external sources and attach them to grant applications or specific sections within the application.
Sources:
NCBI (PubMed): Access full-text papers via PubMed Central (PMC) where available.
bioRxiv: Preprint server for biology papers.
medRxiv: Preprint server for health sciences papers.
Google Scholar: Only papers with full-text download links (e.g., PDFs freely available).
Integration: Operate as a Supabase Edge Function invoked from the Grant Application UI.
Authentication: Use the user’s session or API key for secure access to the application.
Error Handling: Provide detailed error messages and log issues for debugging.
Performance: Limit concurrent requests to external APIs to avoid rate-limiting or bans (e.g., 5 requests/second).
Edge Function: "Gather Research Papers"

Endpoint: /gather-research-papers
HTTP Method: POST
Inputs (Request Body):
grant_application_id (UUID): Identifies the grant application.
grant_application_section_id (UUID, optional): Specifies a section if papers are section-specific; if null, papers attach to the application level.
search_query (string): User-defined keywords or terms to search for relevant papers (e.g., "CRISPR gene editing").
max_results (integer, default: 10): Limits the number of papers retrieved per source.
Processing Steps

Input Validation:
Ensure grant_application_id is valid by querying grant_applications.
If grant_application_section_id is provided, validate it against grant_application_section.
Check that search_query is non-empty; return { success: false, error: "Search query required" } if invalid.
Gather Context:
Query grant_applications for description and title to enrich the search query.
If grant_application_section_id is provided, fetch user_instructions and ai_output from grant_application_section_fields for additional context.
Combine context into a refined search query (e.g., search_query + " " + description).
Search External Sources:
NCBI (PubMed):
Use the PubMed API (e.g., Entrez E-Utilities) to search with the refined query.
Filter for papers with full-text available in PMC (check fullTextSources in API response).
Download PDFs from PMC using the elink and efetch utilities.
bioRxiv:
Query the bioRxiv API (or scrape if no API is available) with the refined query.
All bioRxiv papers are full-text; download PDFs from provided links.
medRxiv:
Query the medRxiv API (or scrape if no API is available) with the refined query.
All medRxiv papers are full-text; download PDFs from provided links.
Google Scholar:
Use a library like scholarly (Python) or a custom scraper to search with the refined query.
Filter results to only include papers with direct full-text download links (e.g., PDFs not behind paywalls).
Validate links by checking HTTP headers for Content-Type: application/pdf.
Download and Validate Papers:
For each source, download up to max_results papers as PDFs.
Validate each file:
Ensure it’s a valid PDF (check file signature).
Limit file size (e.g., < 20MB) to manage storage.
Attach Papers to Database:
Storage: Upload PDFs to Supabase Storage (e.g., bucket: research-papers).
Database Entry:
If grant_application_section_id is null:
Insert into grant_application_documents:
grant_application_id: From input.
file_name: Derived from paper title or URL (e.g., "paper-title.pdf").
file_type: Set to pdf.
file_path: Path in Supabase Storage (e.g., research-papers/{grant_application_id}/{uuid}.pdf).
created_at/updated_at: Current timestamp.
If grant_application_section_id is provided:
Insert into grant_application_section_documents (assuming this table exists or needs creation):
grant_application_section_id: From input.
file_name, file_type, file_path, created_at, updated_at: Same as above.
Generate a unique UUID for each document record.
Output

Database Updates:
New records in grant_application_documents or grant_application_section_documents for each downloaded paper.
Response:
Return JSON:
json

Collapse

Wrap

Copy
{
  "success": true,
  "data": [
    {
      "document_id": "UUID",
      "file_name": "string",
      "file_path": "string",
      "source": "string" // e.g., "NCBI", "bioRxiv"
    },
    ...
  ]
}
Include an array of attached documents with their metadata.
Error Handling

Invalid Inputs:
Return { success: false, error: "Invalid grant application or section ID" } if IDs don’t exist.
API Limits:
If rate-limited by a source, return { success: false, error: "Rate limit exceeded for [source]" } and log the attempt.
No Results:
If no full-text papers are found, return { success: false, error: "No full-text papers available for query" }.
Download Failure:
If a download fails, skip that paper and include in response: { partial_success: true, skipped: [{ source: "string", reason: "string" }] }.
Performance and Scalability

Rate Limiting: Implement delays between requests (e.g., 200ms) to comply with source API policies.
Concurrency: Process sources in parallel but cap at 4 concurrent downloads to balance speed and stability.
Storage: Ensure Supabase Storage bucket has sufficient capacity (e.g., 10GB initial limit).
Dependencies

Supabase Client: For querying tables and uploading to Storage.
External APIs/Libraries:
PubMed API: Use axios or fetch with Entrez E-Utilities for NCBI searches and downloads.
bioRxiv/medRxiv: Use their REST APIs or a scraping library (e.g., cheerio with axios) if APIs are limited.
Google Scholar: Use scholarly (Python) or a custom Node.js scraper with puppeteer for headless browsing.
File Handling: Use pdf-parse or similar to validate PDFs post-download.
UI Integration

Trigger: Invoked by the "Gather Research Papers" button (new or repurposed) on the Grant Application View page or Section Editor.
Input: Passes grant_application_id, optionally grant_application_section_id, and a user-entered search_query.
Feedback:
Show a loading spinner during execution.
On success, refresh the document list in the UI to display new attachments.
On error, display a toast notification with the error message.
Additional Table (If Needed)


Summary

This edge function automates the retrieval of full-text research papers from NCBI, bioRxiv, medRxiv, and Google Scholar based on a user-defined query, downloads them, and attaches them to either the grant application or a specific section. It ensures only freely available papers are collected, integrates with existing tables, and provides a robust response for UI updates. The AI agent enhances the application by enriching its document repository with relevant research materials.