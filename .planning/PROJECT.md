# AI Professor Agent

## What This Is

A course-agnostic AI tutoring system that acts as a virtual professor — answering student questions using RAG over course materials, tracking submissions, maintaining participation-based leaderboards, and providing rubric-based evaluation. Built entirely with free, open-source tools running locally for a college project demonstration.

## Core Value

Students can ask questions about any course and receive contextually accurate, professor-like responses from their course materials — no paid APIs, no cloud dependency.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Course material ingestion (PDFs, notes, syllabus) with chunking and embedding
- [ ] RAG-based Q&A system with professor persona
- [ ] Student authentication and course enrollment
- [ ] Assignment submission tracking
- [ ] Progress tracking per student per course
- [ ] Leaderboard based on participation (questions asked) + scores
- [ ] Rubric-based evaluation/grading module
- [ ] Basic dashboard showing progress and rankings
- [ ] Multi-course support via configurable course structure
- [ ] Local-only architecture (no external API calls)

### Out of Scope

- Plagiarism detection — Adds complexity, not core to professor Q&A value
- Real-time collaboration — Not needed for MVP demo
- Video/audio content processing — Text-only for simplicity
- Mobile app — Web-only for 1-day timeline
- OAuth/social login — Simple JWT auth sufficient
- Cloud deployment — Local demonstration only

## Context

**Project type:** College project demonstration
**Timeline:** 1 day (aggressive — focus on working MVP)
**Target users:** Students interacting with course-specific AI tutor
**Demo scenario:** Generic course structure that can be configured with any course materials

**Technical environment:**
- Must use 100% free, open-source tools
- Must run entirely locally (no paid APIs)
- College-level implementation (simple, not over-engineered)

**Key technical choices (from user requirements):**
- LLM: Ollama (Llama/Mistral/Phi-3)
- Embeddings: HuggingFace sentence-transformers
- Vector DB: ChromaDB
- Database: SQLite
- Backend: FastAPI or Node.js
- Frontend: React or Streamlit

## Constraints

- **Timeline**: 1 day — Must ruthlessly prioritize working end-to-end flow over polish
- **Cost**: $0 — All tools must be free and open-source
- **Environment**: Local only — No cloud services, no paid APIs
- **Complexity**: College-level — Prefer simple, understandable implementations
- **LLM**: Ollama — Smaller models (Phi-3, Mistral 7B) for speed on local hardware

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| FastAPI over Node.js | Python ecosystem better for ML/embeddings integration | — Pending |
| Streamlit over React | Faster to build for 1-day timeline, good for demos | — Pending |
| SQLite over PostgreSQL | Zero setup, file-based, sufficient for demo scale | — Pending |
| ChromaDB for vectors | Simple API, works well with sentence-transformers | — Pending |
| Participation + scores for leaderboard | User preference, balances engagement with performance | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after initialization*
