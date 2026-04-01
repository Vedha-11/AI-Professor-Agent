# 🎓 AI Professor Agent

A **course-specific AI tutoring system** that runs 100% locally on your machine. Upload your course materials (PDFs, notes, syllabi), and get intelligent, context-aware answers from an AI professor powered by local LLMs.

---

## ✨ Features

- **📚 Course-Specific RAG**: Upload materials per course; the AI answers questions using only relevant course content
- **🔒 100% Local & Private**: All processing happens on your machine—no data leaves your computer
- **🤖 Professor Persona**: The AI responds in a warm, educational tone like a real professor
- **📄 Source Citations**: See which course materials were used to generate each answer
- **👥 Multi-User Support**: User authentication with JWT tokens
- **📝 Submissions & Leaderboard**: Students can submit work and track scores
- **💬 Chat Interface**: Intuitive Streamlit-based chat UI

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STREAMLIT FRONTEND                         │
│                    (app.py - Chat Interface)                       │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │    Auth     │  │   Courses   │  │  Materials  │  │    Q&A     │ │
│  │   Routes    │  │   Routes    │  │   Routes    │  │   Routes   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │   Ingest    │  │ Submissions │  │          SERVICES           │ │
│  │   Routes    │  │   Routes    │  │  • LLM (Ollama)             │ │
│  └─────────────┘  └─────────────┘  │  • Embeddings (ChromaDB)    │ │
│                                     │  • Document Processing      │ │
│                                     └─────────────────────────────┘ │
└─────────────────────────┬────────────────────────┬──────────────────┘
                          │                        │
                          ▼                        ▼
              ┌─────────────────────┐   ┌─────────────────────┐
              │   SQLite Database   │   │   ChromaDB Vector   │
              │   (professor.db)    │   │       Store         │
              │                     │   │   (embeddings)      │
              │  • Users            │   │                     │
              │  • Courses          │   └─────────────────────┘
              │  • Materials        │              │
              │  • Submissions      │              ▼
              └─────────────────────┘   ┌─────────────────────┐
                                        │    Ollama (LLM)     │
                                        │   phi3 / mistral    │
                                        └─────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | FastAPI (Python) | REST API server |
| **Frontend** | Streamlit | Interactive chat UI |
| **Database** | SQLite + SQLAlchemy | User, course, and submission data |
| **Vector Store** | ChromaDB | Semantic search over course materials |
| **Embeddings** | sentence-transformers (all-MiniLM-L6-v2) | Convert text to vectors |
| **LLM** | Ollama (phi3/mistral) | Local language model inference |
| **Authentication** | JWT + bcrypt | Secure user authentication |
| **Document Processing** | PyPDF | Extract text from PDF files |

---

## 📁 Project Structure

```
LLM_Project/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # SQLAlchemy database setup
│   ├── models.py            # ORM models (User, Course, Material, Submission)
│   ├── schemas.py           # Pydantic schemas for validation
│   ├── auth.py              # JWT authentication utilities
│   ├── routes/
│   │   ├── auth.py          # /auth/* endpoints (signup, login)
│   │   ├── courses.py       # /courses/* endpoints (CRUD)
│   │   ├── materials.py     # /materials/* endpoints (upload, list)
│   │   ├── ingest.py        # /ingest/* endpoints (process & embed)
│   │   ├── qa.py            # /qa/* endpoints (ask questions)
│   │   └── submissions.py   # /submissions/* endpoints (submit work)
│   └── services/
│       ├── llm.py           # Ollama LLM integration
│       ├── embedding.py     # ChromaDB vector operations
│       └── document.py      # PDF text extraction & chunking
├── frontend/
│   └── app.py               # Streamlit chat interface
├── data/
│   ├── professor.db         # SQLite database (auto-created)
│   ├── chroma/              # ChromaDB vector store
│   └── uploads/             # Uploaded course materials
├── requirements.txt         # Python dependencies
├── DEMO.md                  # Demo script and API examples
└── README.md                # This file
```

---

## 🚀 Complete Installation Guide (Any PC)

> **One-click launcher included!** After setup, just double-click `start.bat` (Windows) or run `./start.sh` (Mac/Linux) to launch everything.

---

### 📋 Prerequisites — Install These First

You need **3 things** installed on your PC before running this project:

#### 1. Python 3.10 or higher

| OS | How to Install |
|---|---|
| **Windows** | Download from [python.org/downloads](https://www.python.org/downloads/) → Run installer → ⚠️ **CHECK "Add Python to PATH"** at the bottom of the installer! |
| **Mac** | `brew install python3` (install [Homebrew](https://brew.sh) first if needed) |
| **Linux (Ubuntu/Debian)** | `sudo apt update && sudo apt install python3 python3-venv python3-pip` |

**Verify it works:** Open a terminal and run:
```bash
python --version
# Should show: Python 3.10.x or higher
```

> ⚠️ On Mac/Linux, use `python3` instead of `python` if `python` doesn't work.

#### 2. Git (to clone the project)

| OS | How to Install |
|---|---|
| **Windows** | Download from [git-scm.com](https://git-scm.com/downloads) → Run installer with defaults |
| **Mac** | `xcode-select --install` (or `brew install git`) |
| **Linux** | `sudo apt install git` |

#### 3. Ollama (Local AI Engine)

| OS | How to Install |
|---|---|
| **Windows** | Download from [ollama.com/download](https://ollama.com/download) → Run installer |
| **Mac** | Download from [ollama.com/download](https://ollama.com/download) → Drag to Applications |
| **Linux** | `curl -fsSL https://ollama.com/install.sh | sh` |

**After installing Ollama**, download the AI model (~2.2 GB):
```bash
ollama pull phi3
```

> 💡 This is a one-time download. The model stays on your PC forever.

---

### 🔧 Step-by-Step Installation

#### Step 1: Get the Project

```bash
# Clone the repository
git clone <your-repo-url>
cd LLM_Project
```

Or if you already have the folder, just navigate to it:
```bash
cd path/to/LLM_Project
```

#### Step 2: Create a Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac / Linux
python3 -m venv venv
source venv/bin/activate
```

> You should see `(venv)` appear at the beginning of your terminal prompt.

#### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

> ⏱️ This will take 2-5 minutes (downloads ~1 GB of ML libraries on first run).

#### Step 4: Download the AI Model (if not done already)

```bash
ollama pull phi3
```

#### Step 5: Run!

**Option A: One-Click Launcher (Recommended)**

| OS | Command |
|---|---|
| **Windows** | Double-click `start.bat` or run `.\start.bat` in terminal |
| **Mac/Linux** | `chmod +x start.sh && ./start.sh` |

The launcher automatically:
- ✅ Checks all prerequisites
- ✅ Activates virtual environment
- ✅ Installs any missing dependencies
- ✅ Starts the backend server
- ✅ Starts the frontend UI
- ✅ Opens everything for you

**Option B: Manual Start (Two Terminals)**

**Terminal 1 — Backend:**
```bash
# Activate venv first
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

python -m uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
# Activate venv first (same as above)

streamlit run frontend/app.py
```

#### Step 6: Open in Browser

| Service | URL |
|---|---|
| **Frontend (Chat UI)** | [http://localhost:8501](http://localhost:8501) |
| **Backend API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **Health Check** | [http://localhost:8000/health](http://localhost:8000/health) |

---

### ✅ Quick Verification Checklist

After starting, verify everything works:

| Check | What to Look For |
|---|---|
| Open http://localhost:8501 | You see the AI Professor chat UI |
| Sidebar shows **✅ Backend: Connected** | Backend is running correctly |
| Sidebar shows **✅ Ollama: Running** | LLM engine is ready |

---

## 📖 Usage Guide

### Step 1: Create a Course

```bash
# First, signup/login to get a token
curl -X POST "http://localhost:8000/auth/signup" \
  -d "username=professor&password=securepass123" \
  -H "Content-Type: application/x-www-form-urlencoded"

curl -X POST "http://localhost:8000/auth/login" \
  -d "username=professor&password=securepass123" \
  -H "Content-Type: application/x-www-form-urlencoded"
# Save the returned access_token

# Create a course
curl -X POST "http://localhost:8000/courses/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Machine Learning 101", "description": "Introduction to ML concepts"}'
```

> 💡 **Tip:** You can also use the interactive API docs at http://localhost:8000/docs to do all of this through a web UI instead of curl!

### Step 2: Upload Course Materials

```bash
curl -X POST "http://localhost:8000/materials/upload/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@lecture_notes.pdf"
```

Supported file types: **PDF**, **TXT**, **MD** (Markdown)

### Step 3: Process Materials (Create Embeddings)

```bash
# Process all materials in a course
curl -X POST "http://localhost:8000/ingest/course/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

> This extracts text, chunks it, and creates vector embeddings. Takes 10-60 seconds depending on document size.

### Step 4: Ask Questions!

**Via the Chat UI (Recommended):**
1. Open http://localhost:8501
2. Select your course from the sidebar
3. Type your question in the chat input
4. Receive an answer with source citations!

**Via API:**
```bash
curl -X POST "http://localhost:8000/qa/ask-simple" \
  -H "Content-Type: application/json" \
  -d '{"course_id": 1, "question": "What is gradient descent?"}'
```

---

## 🔌 API Reference

### Authentication

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/signup` | POST | Register new user | No |
| `/auth/login` | POST | Login, returns JWT token | No |
| `/auth/me` | GET | Get current user info | Yes |

### Courses

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/courses/` | GET | List all courses | No |
| `/courses/` | POST | Create new course | Yes |
| `/courses/{id}` | GET | Get course details | No |

### Materials

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/materials/upload/{course_id}` | POST | Upload material (PDF) | Yes |
| `/materials/course/{course_id}` | GET | List course materials | No |

### Ingestion

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/ingest/material/{id}` | POST | Process single material | Yes |
| `/ingest/course/{id}` | POST | Process all course materials | Yes |

### Q&A

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/qa/ask` | POST | Ask question (authenticated) | Yes |
| `/qa/ask-simple` | POST | Ask question (no auth) | No |
| `/qa/status` | GET | Check Ollama LLM status | No |

### Submissions

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/submissions/` | POST | Submit work | Yes |
| `/submissions/my` | GET | Get my submissions | Yes |
| `/submissions/leaderboard/{course_id}` | GET | Course leaderboard | No |

### System

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Backend health check |
| `/docs` | GET | Swagger API documentation |

---

## 🧠 How RAG Works

The system uses **Retrieval-Augmented Generation (RAG)** to provide accurate, course-specific answers:

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. DOCUMENT INGESTION                                            │
│                                                                  │
│    PDF Upload → Extract Text → Chunk Text → Generate Embeddings │
│                                      │                           │
│                                      ▼                           │
│                              Store in ChromaDB                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ 2. QUESTION ANSWERING                                            │
│                                                                  │
│    User Question → Embed Query → Semantic Search → Get Chunks   │
│                                                          │       │
│                                                          ▼       │
│    Generate Answer ← LLM (Ollama) ← Build Prompt + Context      │
└──────────────────────────────────────────────────────────────────┘
```

1. **Ingestion**: PDFs are chunked into ~500 character segments, converted to vectors using `all-MiniLM-L6-v2`, and stored in ChromaDB
2. **Query**: User questions are embedded and matched against stored chunks using cosine similarity
3. **Generation**: The top 3 most relevant chunks are passed to Ollama with a professor-persona prompt
4. **Response**: The LLM generates an educational answer citing the source materials

---

## ⚙️ Configuration

### Change the LLM Model

Edit `backend/services/llm.py`:
```python
DEFAULT_MODEL = "phi3"  # Change to "mistral", "llama3", etc.
```

Available models (install via `ollama pull <model>`):
| Model | Size | Best For |
|---|---|---|
| `phi3` (default) | ~2.2 GB | Fast responses, low-end hardware |
| `mistral` | ~4 GB | Good balance of speed & quality |
| `llama3` | ~4.7 GB | Highest quality, needs decent hardware |
| `codellama` | ~3.8 GB | Programming/code-related courses |

### Adjust Chunk Size

Edit `backend/services/document.py` to change how documents are split:
```python
CHUNK_SIZE = 500      # Characters per chunk
CHUNK_OVERLAP = 50    # Overlap between chunks
```

### Number of Retrieved Chunks

Edit `backend/services/embedding.py`:
```python
n_results = 3  # Number of chunks to retrieve per question
```

---

## 🐛 Troubleshooting

### ❌ `python` is not recognized

- **Windows**: Reinstall Python and **check "Add Python to PATH"**
- **Mac/Linux**: Use `python3` instead of `python`

### ❌ Backend won't start

```bash
# Check if port 8000 is already in use
# Windows:
netstat -an | findstr 8000
# Mac/Linux:
lsof -i :8000

# Use a different port if needed:
python -m uvicorn backend.main:app --port 8001
```

### ❌ Ollama not responding

```bash
# Check if Ollama is running
ollama list

# If not running, start it (Windows: Ollama starts automatically as a service)
# Mac/Linux:
ollama serve

# If model is missing, pull it
ollama pull phi3
```

### ❌ `pip install` fails

```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Try again
pip install -r requirements.txt

# On Linux, you may need:
sudo apt install python3-dev build-essential
```

### ❌ ChromaDB errors

```bash
# Delete and recreate the vector store
# Windows:
rmdir /s /q data\chroma
# Mac/Linux:
rm -rf data/chroma

# Then re-ingest your materials via the API
```

### 🐌 Slow responses

- Use a smaller model: change to `phi3` in `backend/services/llm.py`
- Close other heavy applications (games, video editors, etc.)
- Reduce `n_results` to `2` in `backend/services/embedding.py`
- Minimum recommended: **8 GB RAM**, **4-core CPU**

### ❌ "No course materials found"

You need to complete all 3 steps in order:
1. **Create a course** → via API or Swagger docs
2. **Upload materials** → `.pdf`, `.txt`, or `.md` files
3. **Ingest the materials** → this creates the searchable embeddings

---

## 💻 System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| **OS** | Windows 10 / macOS 12 / Ubuntu 20.04 | Latest version |
| **RAM** | 8 GB | 16 GB |
| **CPU** | 4 cores | 8 cores |
| **Disk Space** | 5 GB free | 10 GB free |
| **GPU** | Not required | NVIDIA GPU speeds up Ollama |
| **Python** | 3.10 | 3.11+ |

---

## 🛣️ Roadmap

- [ ] Support more document formats (Word, Markdown, HTML)
- [ ] Add conversation memory for follow-up questions
- [ ] Implement streaming responses
- [ ] Add admin dashboard for course management
- [ ] Support for image-based questions
- [ ] Integration with learning management systems (LMS)

---

## 📄 License

This project is provided as-is for educational purposes.

---

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) for local LLM inference
- [ChromaDB](https://www.trychroma.com/) for vector storage
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Streamlit](https://streamlit.io/) for the frontend UI
- [sentence-transformers](https://www.sbert.net/) for embeddings

---

**Built with ❤️ for students and educators everywhere**
