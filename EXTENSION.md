# AI Professor Agent - Extended System

This document covers the new features added to the AI Professor system.

## New Backend Features

### 1. Student Progress Tracking
- **Model**: `StudentProgress` tracks per-course metrics
- **Fields**: `total_questions_asked`, `weak_topics`, `strong_topics`, `performance_score`, `last_activity`
- **Auto-updates** when questions are asked or submissions are graded

### 2. Personalized AI Responses
- Q&A endpoint now injects student profile into LLM prompts
- AI adapts explanations based on:
  - Weak/strong topics
  - Performance score
  - Learning patterns

### 3. Topic Extraction
- Each question is analyzed to extract the main topic
- Topics are tracked to identify patterns
- Repeated questions on same topic → marked as weak area

### 4. New API Endpoints

#### Student Progress
```
GET /students/progress/{course_id}    # Get progress for a course
GET /students/progress                # Get all progress records
GET /students/history/{course_id}     # Get question history
GET /students/dashboard               # Get comprehensive dashboard data
```

#### Recommendations
```
GET /students/recommendations/{course_id}
```
Returns:
- Weak topics to focus on
- Suggested materials
- AI-generated practice questions

#### Performance Evaluation
```
GET /students/evaluate/{course_id}
```
Returns:
- Score (0-100)
- Letter grade (A-F)
- Strengths list
- Weaknesses list
- Personalized suggestions

### 5. Enhanced Leaderboard
```
GET /submissions/leaderboard/{course_id}
```
Now includes:
- Rank
- Average score
- Progress percentage
- Questions asked
- Last activity timestamp

## New Database Models

### StudentProgress
```python
class StudentProgress(Base):
    id: int
    user_id: int (FK → users)
    course_id: int (FK → courses)
    total_questions_asked: int
    weak_topics: JSON (list of strings)
    strong_topics: JSON (list of strings)
    performance_score: float (0-100)
    last_activity: datetime
```

### QuestionHistory
```python
class QuestionHistory(Base):
    id: int
    user_id: int (FK → users)
    course_id: int (FK → courses)
    question: text
    topic: str (extracted topic)
    asked_at: datetime
```

## Setup Instructions

### Backend Setup

1. Navigate to project root:
```bash
cd LLM_Project
```

2. Activate virtual environment:
```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies (if not already installed):
```bash
pip install -r requirements.txt
```

4. Start backend server:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

The database will auto-migrate with new tables on startup.

### Frontend Setup (React)

1. Navigate to React frontend:
```bash
cd frontend-react
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on http://localhost:3000

### Ollama Setup
Ensure Ollama is running with phi3 model:
```bash
ollama run phi3
```

## Frontend Pages

### 1. Student Dashboard (`/dashboard`)
- Overall performance score with progress bar
- Stats cards (questions asked, courses, submissions)
- Weak/strong topics visualization
- Recent activity feed

### 2. AI Chat (`/chat`)
- ChatGPT-style interface
- Course selector dropdown
- Message bubbles with source citations
- Loading animation
- Personalized responses based on student profile

### 3. Leaderboard (`/leaderboard`)
- Ranked table with avatars
- Score, progress percentage, activity metrics
- Highlights current user
- Per-course filtering

### 4. Recommendations (`/recommendations`)
- Focus areas (weak topics)
- Suggested materials
- AI-generated practice questions
- Per-course filtering

### 5. Course Management (`/courses`)
- Create new courses
- Upload PDF/text materials
- Process/ingest materials for RAG
- View all course materials

## v0.dev Prompt

To regenerate or customize the UI, use this prompt on v0.dev:

```
Build a modern AI student dashboard with React and Tailwind CSS featuring:

1. Sidebar navigation with:
   - Dashboard, AI Chat, Leaderboard, Recommendations, Courses links
   - User profile section with logout

2. Dashboard page with:
   - Welcome header with username
   - 4 stat cards (performance, questions, courses, submissions) with gradients
   - Progress section with weak/strong topics badges
   - Recent activity feed

3. AI Chat page with:
   - ChatGPT-style message bubbles
   - Course selector dropdown
   - Input field with send button
   - Source citations on AI responses
   - Typing indicator animation

4. Leaderboard page with:
   - Table with rank icons (gold/silver/bronze)
   - User avatars
   - Score and progress bars
   - Activity metrics

5. Recommendations page with:
   - Focus areas card with topic badges
   - Suggested materials list
   - Practice questions with numbered cards

6. Course management page with:
   - Course list sidebar
   - File upload dropzone
   - Materials list with process buttons

Use a clean design with cards, shadows, and responsive layout.
Color scheme: Blue primary (#3b82f6), with green/red for success/error states.
```

## API Integration

The frontend uses axios with these features:
- Auto-attach JWT token to requests
- Base URL: http://localhost:8000
- Error handling with user feedback

See `frontend-react/src/lib/api.ts` for all API methods.

## File Structure

```
LLM_Project/
├── backend/
│   ├── main.py              # FastAPI app (updated)
│   ├── models.py            # SQLAlchemy models (updated)
│   ├── schemas.py           # Pydantic schemas (updated)
│   ├── routes/
│   │   ├── students.py      # NEW: Progress/recommendations/evaluation
│   │   ├── qa.py            # Updated: Personalized responses
│   │   └── submissions.py   # Updated: Enhanced leaderboard
│   └── services/
│       ├── progress.py      # NEW: Progress tracking service
│       └── llm.py           # Updated: Student profile in prompts
│
├── frontend-react/          # NEW: Modern React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks (useAuth)
│   │   ├── lib/             # API client, utilities
│   │   ├── App.tsx          # Routes configuration
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── frontend/                # Original Streamlit frontend (preserved)
└── data/                    # SQLite database & uploads
```
