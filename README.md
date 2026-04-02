# 🎓 Acad AI - AI Professor Agent

A **next-generation AI tutoring system** with role-based access for students and professors. Features RAG-powered Q&A, automatic assignment grading, progress tracking, and leaderboards—all running 100% locally with free, open-source tools.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)

---

## ✨ Features

### 👨‍🎓 For Students
- **💬 AI Chat**: Ask questions and get professor-like responses from course materials
- **📝 Assignments**: Take auto-generated quizzes and submit PDF assignments
- **📊 Progress Tracking**: View scores, weak topics, and personalized recommendations
- **🏆 Leaderboard**: Compete with classmates based on performance

### 👨‍🏫 For Professors
- **📚 Material Upload**: Upload PDFs, notes, and syllabi per course
- **👥 Student Management**: View all students and their progress
- **📋 Submissions Review**: See all student submissions with scores
- **📈 Evaluations**: Generate comprehensive student reports with AI insights

### 🔒 Core Features
- **100% Local & Private**: No data leaves your machine
- **Role-Based Access**: Separate UIs for students and professors
- **RAG-Powered Q&A**: Context-aware answers from uploaded materials
- **Auto-Grading**: LLM-based assignment evaluation with feedback
- **Source Citations**: See which materials were used for each answer

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT + TYPESCRIPT FRONTEND                      │
│                 (Vite + Tailwind CSS + Lucide Icons)                │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐ │
│  │      STUDENT DASHBOARD       │  │     PROFESSOR DASHBOARD      │ │
│  │  • Chat with AI Professor    │  │  • Upload Course Materials   │ │
│  │  • Take Assignments          │  │  • View All Submissions      │ │
│  │  • View Progress & Scores    │  │  • Student Evaluations       │ │
│  │  • Leaderboard               │  │  • Generate Reports          │ │
│  └──────────────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTP/REST API
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │    Auth     │  │   Courses   │  │  Materials  │  │    Q&A     │ │
│  │  (JWT)      │  │   (CRUD)    │  │  (Upload)   │  │   (RAG)    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │   Ingest    │  │ Submissions │  │         SERVICES            │ │
│  │ (Embedding) │  │ (Grading)   │  │  • LLM (Ollama)             │ │
│  └─────────────┘  └─────────────┘  │  • Embeddings (ChromaDB)    │ │
│  ┌─────────────┐  ┌─────────────┐  │  • Progress Tracking        │ │
│  │  Students   │  │  Progress   │  │  • Document Processing      │ │
│  │ (Reports)   │  │ (Tracking)  │  └─────────────────────────────┘ │
│  └─────────────┘  └─────────────┘                                   │
└─────────────────────────┬────────────────────────┬──────────────────┘
                          │                        │
                          ▼                        ▼
              ┌─────────────────────┐   ┌─────────────────────┐
              │   SQLite Database   │   │   ChromaDB Vector   │
              │   (professor.db)    │   │       Store         │
              │                     │   │                     │
              │  • Users (roles)    │   │  • Course embeddings│
              │  • Courses          │   │  • Semantic search  │
              │  • Materials        │   └─────────────────────┘
              │  • Submissions      │              │
              │  • Progress         │              ▼
              │  • Question History │   ┌─────────────────────┐
              └─────────────────────┘   │    Ollama (LLM)     │
                                        │   phi3 / mistral    │
                                        └─────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18 + TypeScript | Modern, type-safe UI |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Build Tool** | Vite | Fast development & builds |
| **Backend** | FastAPI (Python) | High-performance REST API |
| **Database** | SQLite + SQLAlchemy | Relational data storage |
| **Vector Store** | ChromaDB | Semantic search over materials |
| **Embeddings** | sentence-transformers | Text to vector conversion |
| **LLM** | Ollama (phi3/mistral) | Local AI inference |
| **Auth** | JWT + bcrypt | Secure authentication |

---

## 📁 Project Structure

```
Acad-AI/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── database.py          # SQLAlchemy setup
│   ├── models.py            # User, Course, Material, Submission, Progress
│   ├── schemas.py           # Pydantic validation schemas
│   ├── auth.py              # JWT utilities
│   ├── routes/
│   │   ├── auth.py          # Login, signup, user info
│   │   ├── courses.py       # Course CRUD
│   │   ├── materials.py     # File upload & listing
│   │   ├── ingest.py        # Document processing & embedding
│   │   ├── qa.py            # RAG-powered Q&A
│   │   ├── submissions.py   # Assignment submission & grading
│   │   └── students.py      # Progress, recommendations, reports
│   └── services/
│       ├── llm.py           # Ollama integration
│       ├── embedding.py     # ChromaDB operations
│       ├── document.py      # PDF extraction & chunking
│       └── progress.py      # Student progress tracking
│
├── frontend-react/
│   ├── src/
│   │   ├── App.tsx          # Route definitions
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx        # Student dashboard
│   │   │   ├── ChatPage.tsx             # AI Q&A interface
│   │   │   ├── AssignmentsPage.tsx      # Take assignments
│   │   │   ├── LeaderboardPage.tsx      # Rankings
│   │   │   ├── ProfessorDashboardPage.tsx
│   │   │   ├── ProfessorSubmissionsPage.tsx
│   │   │   ├── ProfessorEvaluationsPage.tsx
│   │   │   └── UploadPage.tsx           # Material upload
│   │   ├── hooks/
│   │   │   └── useAuth.tsx  # Authentication context
│   │   └── lib/
│   │       ├── api.ts       # API client
│   │       └── utils.ts     # Utility functions
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── data/
│   ├── professor.db         # SQLite database
│   ├── chroma/              # Vector embeddings
│   ├── uploads/             # Course materials
│   └── assignments/         # Student submissions
│
├── requirements.txt         # Python dependencies
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Ollama** (for local LLM)

### 1. Clone the Repository

```bash
git clone https://github.com/Vedha-11/AI-Professor-Agent.git
cd AI-Professor-Agent
```

### 2. Install Ollama

Download from [ollama.ai](https://ollama.ai) and install, then pull a model:

```bash
ollama pull phi3
# or
ollama pull mistral
```

### 3. Setup Backend

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Setup Frontend

```bash
cd frontend-react
npm install
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
# From project root, with venv activated
uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend-react
npm run dev
```

### 6. Open the App

- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs

---

## 👤 Demo Accounts

Create your own account or use:

| Role | Username | Password |
|------|----------|----------|
| Student | `demo` | `demo123` |
| Student | `student` | `student123` |
| Professor | `prof` | `prof123` |

---

## 📖 Usage Guide

### As a Professor

1. **Login** with professor role
2. **Create a Course** from the Courses page
3. **Upload Materials** (PDFs, notes) to your course
4. **Ingest Materials** to generate embeddings
5. **View Submissions** and student progress
6. **Generate Reports** for student evaluations

### As a Student

1. **Login** or signup with student role
2. **Browse Courses** and view available materials
3. **Chat with AI** to ask questions about course content
4. **Take Assignments** and get instant feedback
5. **Track Progress** and view your scores
6. **Check Leaderboard** to see your ranking

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create new account |
| POST | `/auth/login` | Login and get JWT |
| GET | `/auth/me` | Get current user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses/` | List all courses |
| POST | `/courses/` | Create course |
| GET | `/courses/{id}` | Get course details |

### Materials
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/materials/upload/{course_id}` | Upload file |
| GET | `/materials/course/{course_id}` | List materials |
| POST | `/ingest/{material_id}` | Process & embed |

### Q&A
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/qa/ask` | Ask AI (authenticated) |
| POST | `/qa/ask-simple` | Ask AI (no auth) |
| GET | `/qa/status` | Check Ollama status |

### Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submissions/` | Create submission |
| POST | `/submissions/grade` | Auto-grade answer |
| POST | `/submissions/upload-pdf/{course_id}` | Submit PDF |
| GET | `/submissions/leaderboard/{course_id}` | Get rankings |
| GET | `/submissions/assignments/{course_id}` | Get questions |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students/dashboard` | Student dashboard data |
| GET | `/students/progress/{course_id}` | Get progress |
| GET | `/students/recommendations/{course_id}` | Get suggestions |
| GET | `/students/evaluate/{course_id}` | Get evaluation |
| GET | `/students/report/{course_id}/{user_id}` | Generate report (professor) |

---

## 🎨 Screenshots

### Login Page
Modern, role-based authentication with student/professor selection.

### Student Dashboard
View progress, recent activity, and quick access to all features.

### AI Chat Interface
Ask questions and get context-aware answers with source citations.

### Professor Evaluations
Generate comprehensive student reports with AI-powered insights.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai) - Local LLM inference
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

---

**Made with ❤️ for education**
