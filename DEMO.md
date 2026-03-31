# AI Professor Agent - Demo Script

This demonstrates the complete workflow of the AI Professor system.

## Prerequisites

1. **Ollama** installed and running with phi3 model:
   ```bash
   ollama pull phi3
   ```

2. **Python dependencies** installed:
   ```bash
   pip install -r requirements.txt
   ```

## Start the System

### Terminal 1: Backend
```bash
cd LLM_Project
python -m uvicorn backend.main:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd LLM_Project
streamlit run frontend/app.py
```

## Demo Flow

### 1. Create a Course (via API)
```bash
# Login first
curl -X POST "http://localhost:8000/auth/login" \
  -d "username=testuser&password=testpass123" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Save the token, then create course
curl -X POST "http://localhost:8000/courses/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Machine Learning 101", "description": "Introduction to ML concepts"}'
```

### 2. Upload Course Materials
```bash
curl -X POST "http://localhost:8000/materials/upload/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@your_notes.pdf"
```

### 3. Ingest Materials (Create Embeddings)
```bash
curl -X POST "http://localhost:8000/ingest/course/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Ask Questions (via Frontend or API)
```bash
curl -X POST "http://localhost:8000/qa/ask-simple" \
  -H "Content-Type: application/json" \
  -d '{"course_id": 1, "question": "What is machine learning?"}'
```

### 5. Submit Work
```bash
curl -X POST "http://localhost:8000/submissions/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"course_id": 1, "content": "My assignment submission..."}'
```

### 6. Check Leaderboard
```bash
curl "http://localhost:8000/submissions/leaderboard/1"
```

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Register new user |
| `/auth/login` | POST | Login, get JWT token |
| `/auth/me` | GET | Get current user |
| `/courses/` | GET/POST | List/create courses |
| `/materials/upload/{course_id}` | POST | Upload material |
| `/materials/course/{course_id}` | GET | List materials |
| `/ingest/material/{id}` | POST | Process single material |
| `/ingest/course/{id}` | POST | Process all course materials |
| `/qa/ask` | POST | Ask question (auth required) |
| `/qa/ask-simple` | POST | Ask question (no auth) |
| `/qa/status` | GET | Check Ollama status |
| `/submissions/` | POST | Create submission |
| `/submissions/my` | GET | My submissions |
| `/submissions/leaderboard/{course_id}` | GET | Course leaderboard |
| `/health` | GET | Backend health check |

## Frontend Features

- **Course Selection**: Choose from available courses
- **Chat Interface**: Ask questions, see professor responses
- **Source Citations**: See which materials were used
- **System Status**: Backend and Ollama health indicators

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: Streamlit
- **Database**: SQLite
- **Vector Store**: ChromaDB
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2)
- **LLM**: Ollama (phi3/mistral)

All components run **100% locally** with no external API calls!
