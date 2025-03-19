Certainly! Below are the detailed requirements for setting up a document processing system in your Node.js and React Router application. This system uses two distinct Supabase Edge Functions—one for text extraction and another for vector generation—triggered by a cron job on the Supabase server. The setup ensures modularity, scalability, and efficient handling of document uploads, text extraction, and vectorization.

---

## Requirements

### 1. Queue Management
- **Objective**: Track the processing status of uploaded documents.
- **Details**:
  - Create a table in Supabase PostgreSQL called `document_processing_queue` with the following columns:
    - `id` (UUID, primary key, auto-generated): Unique identifier for each queue entry.
    - `document_id` (UUID): document id in tables like `grant_application_documents` or `grant_application_section_documents`.
    - `document_type` (string): Specifies the document's origin (e.g., `'application'` or `'section'`).
    - `status` (string): Tracks processing state (e.g., `'pending'`, `'extracting'`, `'extracted'`, `'vectorizing'`, `'completed'`, `'failed'`).
    - `attempts` (integer, default 0): Counts processing attempts for retry logic.
    - `error` (string, nullable): Stores error messages if processing fails.
    - `created_at` (timestamp, auto-generated): Records when the entry was created.
    - `updated_at` (timestamp, auto-generated): Tracks the last update time.
  - **Workflow**: When a document is uploaded to Supabase Storage, insert a record into this table with `status = 'pending'`.

---

### 2. Text Extraction Edge Function
- **Objective**: Extract text from uploaded documents and store it in the database.
- **Trigger**: Invoked by the cron job for documents with `status = 'pending'`.
- **Details**:
  - **Input**: Document ID and file path from the `document_processing_queue`.
  - **Process**:
    - Download the document from Supabase Storage using the provided file path.
    - Identify the file type (e.g., PDF, DOCX, TXT) from the document metadata.
    - Extract text using appropriate libraries:
      - **PDF**: Use `pdf-parse` or a lightweight alternative like `pdf-parse-wasm`.
      - **DOCX**: Use `mammoth` or `docx2txt`.
      - **TXT**: Read directly with standard file reading methods.
      - **Other Formats**: Extend support as needed (e.g., `xlsx` for Excel, `csv-parse` for CSV).
    - Store the extracted text in the corresponding document table (e.g., add an `extracted_text` column to `grant_application_documents`).
  - **Output**:
    - On success, update the queue `status` to `'extracted'`.
    - On failure, update `status` to `'failed'`, log the error in the `error` column, and increment `attempts`.
  - **Error Handling**:
    - Retry up to 3 times for transient errors (e.g., network timeouts).
    - If retries fail, mark as `'failed'` and skip to the next document.

---

### 3. Vector Generation Edge Function
- **Objective**: Generate vector embeddings from extracted text and store them in Supabase.
- **Trigger**: Invoked by the cron job for documents with `status = 'extracted'`.
- **Details**:
  - **Input**: Document ID and `extracted_text` from the document table.
  - **Process**:
    - Fetch the `extracted_text` for the document.
    - Generate vector embeddings using an embedding model (e.g., OpenAI's `text-embedding-ada-002`).
    - For large texts, split into chunks using a text splitter (e.g., `RecursiveCharacterTextSplitter`) and generate multiple vectors.
  - **Output**:
    - Store vectors in a dedicated table (e.g., `grant_application_document_vectors`) with columns:
      - `id` (UUID, primary key).
      - `document_id` (UUID, foreign key): Links to the original document.
      - `vector` (vector type, e.g., `vector(1536)` for OpenAI embeddings).
      - `chunk_index` (integer): Tracks chunk order if multiple vectors are created.
    - On success, update the queue `status` to `'completed'`.
    - On failure, update `status` to `'failed'`, log the error, and increment `attempts`.
  - **Error Handling**:
    - Retry up to 3 times for API or network errors.
    - Handle large texts by processing chunks incrementally.

---

### 4. Cron Job Configuration
- **Objective**: Periodically trigger document processing from the queue.
- **Details**:
  - Configure a cron job on the Supabase server (e.g., using `pg_cron`) to run every 2 minutes.
  - **Workflow**:
    - Query `document_processing_queue` for entries with `status = 'pending'` and invoke the Text Extraction Edge Function.
    - Query for entries with `status = 'extracted'` and invoke the Vector Generation Edge Function.
    - Process documents in batches (e.g., 5-10 per run) to manage server load.
  - Use HTTP requests or Supabase's internal mechanisms to trigger the Edge Functions.

---

### 5. Error Handling and Retries
- **Objective**: Ensure reliability by managing failures and retries.
- **Details**:
  - For both Edge Functions:
    - If an error occurs and `attempts < 3`, reset `status` to `'pending'` and increment `attempts`.
    - After 3 failed attempts, set `status` to `'failed'` and log the error.
  - Create a `processing_logs` table to store error details and key events, with columns:
    - `id` (UUID, primary key).
    - `document_id` (UUID).
    - `event` (string): Description of the event (e.g., "Extraction failed").
    - `details` (string): Additional info (e.g., error message).
    - `timestamp` (timestamp).

---

### 6. Performance and Scalability
- **Objective**: Optimize processing for efficiency and scalability.
- **Details**:
  - Limit batch sizes to 10 documents per cron run to avoid overloading resources.
  - Use streaming for downloading large files from Supabase Storage.
  - Optimize text extraction with fast, lightweight libraries.
  - Handle large texts in the Vector Generation Function by splitting them into chunks.

---

### 7. Monitoring and Logging
- **Objective**: Track progress and troubleshoot issues.
- **Details**:
  - Log key events (e.g., "Extraction started", "Vectorization completed") in the `processing_logs` table.
  - Include timestamps, document IDs, and error messages for each log entry.
  - Use Supabase's built-in logging or an external monitoring tool to analyze performance.

---

## Summary
This system separates document processing into two Edge Functions—text extraction and vector generation—triggered by a cron job. Documents are tracked via a queue table, processed in batches, and secured with Supabase authentication. Error handling, retries, and logging ensure reliability, while batching and chunking support scalability. These requirements provide a robust foundation for your grant writing application's document processing needs.
