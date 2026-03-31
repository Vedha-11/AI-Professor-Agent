"""
AI Professor Agent - FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Professor Agent",
    description="Course-specific AI tutoring system",
    version="0.1.0"
)

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
    return {"status": "healthy", "service": "ai-professor-backend"}


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "AI Professor Agent API", "docs": "/docs"}
