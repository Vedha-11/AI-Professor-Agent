"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============ Auth Schemas ============

class UserCreate(BaseModel):
    """Schema for user registration."""
    username: str
    password: str


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str
    password: str


class UserResponse(BaseModel):
    """Schema for user response (no password)."""
    id: int
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded token data."""
    username: Optional[str] = None
    user_id: Optional[int] = None


# ============ Course Schemas ============

class CourseCreate(BaseModel):
    """Schema for course creation."""
    name: str
    description: Optional[str] = None


class CourseResponse(BaseModel):
    """Schema for course response."""
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ Material Schemas ============

class MaterialResponse(BaseModel):
    """Schema for material response."""
    id: int
    course_id: int
    filename: str
    filepath: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


# ============ Ingestion Schemas ============

class IngestionResult(BaseModel):
    """Schema for ingestion result."""
    material_id: int
    filename: str
    chunks_created: int
    status: str = "success"


# ============ Q&A Schemas ============

class QuestionRequest(BaseModel):
    """Schema for asking a question."""
    course_id: int
    question: str


class AnswerResponse(BaseModel):
    """Schema for professor's answer."""
    question: str
    answer: str
    course_name: str
    sources: list[str] = []


# ============ Submission Schemas ============

class SubmissionCreate(BaseModel):
    """Schema for submission creation."""
    course_id: int
    content: str


class SubmissionResponse(BaseModel):
    """Schema for submission response."""
    id: int
    user_id: int
    course_id: int
    content: str
    score: Optional[float]
    submitted_at: datetime
    
    class Config:
        from_attributes = True
