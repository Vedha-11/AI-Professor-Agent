# Roadmap: Acad AI

## Overview

This roadmap delivers a complete AI tutoring system in 10 phases: from project scaffolding through database setup, authentication, file upload, document ingestion, vector storage, RAG Q&A, submissions, frontend UI, and final integration. Each phase delivers a working, testable component that builds toward the full professor-like AI tutor experience. Frontend is React + TypeScript with Tailwind CSS.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Project Setup** - Initialize project structure, dependencies, and development environment
- [ ] **Phase 2: Database Schema** - Create SQLite tables for users, courses, materials, and submissions
- [ ] **Phase 3: Authentication Backend** - Implement user signup and login with JWT tokens
- [ ] **Phase 4: File Upload Backend** - Build APIs for uploading PDFs and text/markdown notes
- [ ] **Phase 5: Document Ingestion Pipeline** - Chunk documents and generate embeddings
- [ ] **Phase 6: Vector Store Integration** - Store and retrieve embeddings from ChromaDB
- [ ] **Phase 7: RAG Q&A Backend** - Implement context retrieval and Ollama-powered responses
- [ ] **Phase 8: Submission Backend** - Build assignment submission and tracking APIs
- [ ] **Phase 9: Frontend UI** - Create Streamlit interface for all features
- [ ] **Phase 10: Integration & Testing** - End-to-end validation and polish

## Phase Details

### Phase 1: Project Setup
**Goal**: Development environment is ready with all dependencies and project structure established
**Depends on**: Nothing (first phase)
**Requirements**: (foundation for all requirements)
**Success Criteria** (what must be TRUE):
  1. Python virtual environment created and activated
  2. All dependencies installed (FastAPI, Streamlit, ChromaDB, sentence-transformers, SQLite, etc.)
  3. Project directory structure established (backend/, frontend/, .planning/)
  4. FastAPI server starts without errors on localhost
  5. Ollama is installed and responds to test prompts
**Plans**: 1 plan
Plans:
- [ ] 01-01-PLAN.md — Project Environment and Structure Setup

### Phase 2: Database Schema
**Goal**: SQLite database with all tables needed for users, courses, materials, and submissions
**Depends on**: Phase 1
**Requirements**: (foundation for AUTH, MATL, SUBM requirements)
**Success Criteria** (what must be TRUE):
  1. SQLite database file exists and is accessible
  2. Users table stores username, hashed password, created_at
  3. Courses table stores course metadata
  4. Materials table tracks uploaded documents with course association
  5. Submissions table records student submissions with timestamps and scores
**Plans**: TBD

### Phase 3: Authentication Backend
**Goal**: Students can create accounts and securely log in to the system
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. POST /signup creates new user with hashed password
  2. POST /login validates credentials and returns JWT token
  3. Protected endpoints reject requests without valid token
  4. Duplicate username returns appropriate error
**Plans**: TBD

### Phase 4: File Upload Backend
**Goal**: Users can upload course materials (PDFs and text/markdown files) via API
**Depends on**: Phase 3
**Requirements**: MATL-01, MATL-02
**Success Criteria** (what must be TRUE):
  1. POST /materials/upload accepts PDF files and stores them
  2. POST /materials/upload accepts text/markdown files and stores them
  3. Uploaded files are associated with a course
  4. Upload returns material ID for tracking
**Plans**: TBD

### Phase 5: Document Ingestion Pipeline
**Goal**: Uploaded documents are chunked into segments with embeddings generated
**Depends on**: Phase 4
**Requirements**: MATL-03, MATL-04
**Success Criteria** (what must be TRUE):
  1. PDF content is extracted and split into text chunks
  2. Text/markdown content is split into chunks with proper boundaries
  3. Sentence-transformers generates embeddings for each chunk
  4. Chunks and embeddings are stored with source document reference
**Plans**: TBD

### Phase 6: Vector Store Integration
**Goal**: Embeddings are stored in ChromaDB and can be retrieved by similarity search
**Depends on**: Phase 5
**Requirements**: MATL-05
**Success Criteria** (what must be TRUE):
  1. ChromaDB collection exists for course materials
  2. Embeddings are stored with course and document metadata
  3. Similarity search returns relevant chunks for a query
  4. Search can filter by course
**Plans**: TBD

### Phase 7: RAG Q&A Backend
**Goal**: Students can ask questions and receive contextually accurate, professor-like responses
**Depends on**: Phase 6
**Requirements**: QNA-01, QNA-02, QNA-03, QNA-04
**Success Criteria** (what must be TRUE):
  1. POST /qa/ask accepts student question and course context
  2. System retrieves relevant chunks from ChromaDB for the question
  3. Ollama generates response using retrieved context as grounding
  4. Response uses professor persona (authoritative, educational tone)
  5. API returns both response and indicates context was used
**Plans**: TBD

### Phase 8: Submission Backend
**Goal**: Students can submit assignments and track their scores
**Depends on**: Phase 3
**Requirements**: SUBM-01, SUBM-02, SUBM-03
**Success Criteria** (what must be TRUE):
  1. POST /submissions creates submission record for student/course
  2. Submission records include timestamp automatically
  3. PUT /submissions/{id}/score allows adding score to submission
  4. GET /submissions returns student's submissions with scores
**Plans**: TBD

### Phase 9: Frontend UI
**Goal**: Complete React + TypeScript interface enabling students to interact with all features
**Depends on**: Phases 7, 8
**Requirements**: QNA-05
**Success Criteria** (what must be TRUE):
  1. Login/signup page authenticates user
  2. Material upload page allows PDF and text file uploads
  3. Q&A page shows question input and displays professor responses
  4. Submissions page shows submission history with scores
  5. Navigation allows switching between all features
**Plans**: TBD
**UI hint**: yes

### Phase 10: Integration & Testing
**Goal**: Full end-to-end flow works reliably with all components connected
**Depends on**: Phase 9
**Requirements**: (validates all requirements)
**Success Criteria** (what must be TRUE):
  1. User can sign up, log in, and navigate all pages
  2. User can upload a document and ask questions about its content
  3. AI professor responds with relevant, contextual answers
  4. User can submit assignment and see it tracked with score
  5. Full demo scenario works without errors
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Setup | 0/? | Not started | - |
| 2. Database Schema | 0/? | Not started | - |
| 3. Authentication Backend | 0/? | Not started | - |
| 4. File Upload Backend | 0/? | Not started | - |
| 5. Document Ingestion Pipeline | 0/? | Not started | - |
| 6. Vector Store Integration | 0/? | Not started | - |
| 7. RAG Q&A Backend | 0/? | Not started | - |
| 8. Submission Backend | 0/? | Not started | - |
| 9. Frontend UI | 0/? | Not started | - |
| 10. Integration & Testing | 0/? | Not started | - |

---
*Roadmap created: 2026-03-31*
*Last updated: 2026-03-31*
