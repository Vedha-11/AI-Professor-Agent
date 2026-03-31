"""
Q&A routes - RAG-based tutoring with professor persona.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Course
from ..schemas import QuestionRequest, AnswerResponse
from ..services.embedding import search_course_materials
from ..services.llm import generate_with_context, check_ollama_available
from .auth import get_current_user

router = APIRouter(prefix="/qa", tags=["Q&A"])


@router.get("/status")
def qa_status():
    """Check if Q&A system is ready (Ollama available)."""
    return check_ollama_available()


@router.post("/ask", response_model=AnswerResponse)
def ask_question(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Ask the AI Professor a question about a course.
    
    Uses RAG to retrieve relevant course materials and generates
    a professor-like response using the local LLM.
    """
    # Get course
    course = db.query(Course).filter(Course.id == request.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check Ollama is available
    ollama_status = check_ollama_available()
    if not ollama_status.get("available"):
        raise HTTPException(
            status_code=503,
            detail="LLM service not available. Please ensure Ollama is running."
        )
    
    # Search for relevant context
    context_chunks = search_course_materials(
        course_id=request.course_id,
        query=request.question,
        n_results=3
    )
    
    if not context_chunks:
        raise HTTPException(
            status_code=404,
            detail="No course materials found. Please upload and ingest materials first."
        )
    
    # Generate response with professor persona
    try:
        answer = generate_with_context(
            question=request.question,
            context_chunks=context_chunks,
            course_name=course.name
        )
        
        # Extract source filenames
        sources = list(set([
            c["metadata"].get("filename", "unknown")
            for c in context_chunks
        ]))
        
        return AnswerResponse(
            question=request.question,
            answer=answer,
            course_name=course.name,
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}"
        )


@router.post("/ask-simple")
def ask_simple(
    request: QuestionRequest,
    db: Session = Depends(get_db)
):
    """
    Simple Q&A endpoint without authentication (for demo/testing).
    """
    course = db.query(Course).filter(Course.id == request.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Search for relevant context
    context_chunks = search_course_materials(
        course_id=request.course_id,
        query=request.question,
        n_results=3
    )
    
    if not context_chunks:
        return AnswerResponse(
            question=request.question,
            answer="I don't have any course materials to reference yet. Please upload some materials first.",
            course_name=course.name,
            sources=[]
        )
    
    try:
        answer = generate_with_context(
            question=request.question,
            context_chunks=context_chunks,
            course_name=course.name
        )
        
        sources = list(set([
            c["metadata"].get("filename", "unknown")
            for c in context_chunks
        ]))
        
        return AnswerResponse(
            question=request.question,
            answer=answer,
            course_name=course.name,
            sources=sources
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}"
        )
