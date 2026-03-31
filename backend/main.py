"""
AI Professor Agent - FastAPI Backend
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import create_tables
from .routes import auth, courses, materials, ingest, qa, submissions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    create_tables()
    yield


app = FastAPI(
    title="AI Professor Agent",
    description="Course-specific AI tutoring system",
    version="0.1.0",
    lifespan=lifespan
)

# Include routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(materials.router)
app.include_router(ingest.router)
app.include_router(qa.router)
app.include_router(submissions.router)

# CORS for Streamlit frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Health check endpoint."""
    import os
    db_path = os.path.join(os.path.dirname(__file__), "..", "data", "professor.db")
    db_exists = os.path.exists(db_path)
    return {
        "status": "healthy",
        "service": "ai-professor-backend",
        "database": "connected" if db_exists else "not initialized"
    }


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "AI Professor Agent API", "docs": "/docs"}
