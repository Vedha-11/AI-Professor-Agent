# Phase 2 Context: Database Schema

## Goal
Create SQLite database with tables for users, courses, materials, and submissions.

## Stack Decision
- **SQLite** via SQLAlchemy ORM (zero config, file-based)
- Database file: `data/professor.db`

## Tables Required

1. **users** - Student accounts
   - id, username, password_hash, created_at

2. **courses** - Course metadata  
   - id, name, description, created_at

3. **materials** - Uploaded documents
   - id, course_id (FK), filename, filepath, uploaded_at

4. **submissions** - Student work
   - id, user_id (FK), course_id (FK), content, score, submitted_at

## Design Decisions

- Use SQLAlchemy ORM for type safety and easier migrations
- Auto-create tables on app startup
- Foreign keys enabled for referential integrity
