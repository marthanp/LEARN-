# Curriculum resource ingestion

This folder documents the offline/data workflow for approved curriculum material. It intentionally contains no textbook PDFs or copied textbook text.

1. Confirm the document is approved for storage and redistribution.
2. Upload the original file to Supabase Storage under `curriculum-materials/{level}/{subject}/`.
3. Create a `books` metadata record with `storage_path`, source attribution, licence, level, subject, curriculum, and `content_status`.
4. Extract text outside the frontend, preserve page references, and split it into chunks.
5. Store chunks and embeddings in a protected retrieval table when the grounded AI feature is enabled.
6. Mark the resource `available` only after the document and its permissions have been checked.

Until then, use `metadata_only` and keep `document_url` and `storage_path` empty. The learner UI must never imply that unavailable content can be read.