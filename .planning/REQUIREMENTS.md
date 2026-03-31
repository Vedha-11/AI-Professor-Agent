# Requirements: AI Professor Agent

**Defined:** 2026-03-31
**Core Value:** Students can ask questions about any course and receive contextually accurate, professor-like responses from their course materials — no paid APIs, no cloud dependency.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: Student can sign up with username and password
- [ ] **AUTH-02**: Student can log in and receive session token

### Course Materials

- [ ] **MATL-01**: User can upload PDF files for a course
- [ ] **MATL-02**: User can upload text/markdown notes for a course
- [ ] **MATL-03**: System chunks uploaded documents into segments
- [ ] **MATL-04**: System generates embeddings for each chunk using sentence-transformers
- [ ] **MATL-05**: System stores embeddings in ChromaDB with course metadata

### RAG Q&A

- [ ] **QNA-01**: Student can ask a question about course content
- [ ] **QNA-02**: System retrieves relevant context from vector store
- [ ] **QNA-03**: System generates response using Ollama LLM with retrieved context
- [ ] **QNA-04**: Response uses professor persona (authoritative, educational tone)
- [ ] **QNA-05**: Student sees the AI professor's response in the UI

### Submissions

- [ ] **SUBM-01**: Student can submit assignment for a course
- [ ] **SUBM-02**: System records submission with timestamp
- [ ] **SUBM-03**: System tracks submission scores per student per course

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Authentication (Extended)

- **AUTH-03**: JWT token refresh mechanism
- **AUTH-04**: Role-based access (student vs instructor)
- **AUTH-05**: Course enrollment management

### Course Management

- **COUR-01**: Instructor can create course with metadata
- **COUR-02**: Instructor can configure course settings
- **COUR-03**: Multi-course support with isolation

### RAG Q&A (Extended)

- **QNA-06**: Conversation history persisted per student
- **QNA-07**: Source citations shown with responses
- **QNA-08**: Follow-up question context awareness

### Submissions (Extended)

- **SUBM-04**: Rubric-based automated evaluation
- **SUBM-05**: Instructor can define grading rubrics
- **SUBM-06**: Feedback generation for submissions

### Progress & Leaderboard

- **PROG-01**: Track questions asked per student
- **PROG-02**: Calculate leaderboard rankings (participation + scores)
- **PROG-03**: Progress dashboard showing student metrics
- **PROG-04**: Weak topic identification based on Q&A patterns
- **PROG-05**: Personalized study recommendations

## Out of Scope

| Feature | Reason |
|---------|--------|
| Plagiarism detection | Adds complexity, not core to professor Q&A value |
| Real-time collaboration | Not needed for MVP demo |
| Video/audio processing | Text-only for simplicity, 1-day timeline |
| Mobile app | Web-only for demo |
| OAuth/social login | Simple auth sufficient for college project |
| Cloud deployment | Local-only demonstration |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | TBD | Pending |
| AUTH-02 | TBD | Pending |
| MATL-01 | TBD | Pending |
| MATL-02 | TBD | Pending |
| MATL-03 | TBD | Pending |
| MATL-04 | TBD | Pending |
| MATL-05 | TBD | Pending |
| QNA-01 | TBD | Pending |
| QNA-02 | TBD | Pending |
| QNA-03 | TBD | Pending |
| QNA-04 | TBD | Pending |
| QNA-05 | TBD | Pending |
| SUBM-01 | TBD | Pending |
| SUBM-02 | TBD | Pending |
| SUBM-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 0
- Unmapped: 15 ⚠️

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
