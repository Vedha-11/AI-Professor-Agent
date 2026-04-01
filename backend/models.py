"""
SQLAlchemy models for the AI Professor system.
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    """Student/user account."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    submissions = relationship("Submission", back_populates="user")
    progress = relationship("StudentProgress", back_populates="user")
    question_history = relationship("QuestionHistory", back_populates="user")


class Course(Base):
    """Course metadata."""
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    materials = relationship("Material", back_populates="course")
    submissions = relationship("Submission", back_populates="course")
    student_progress = relationship("StudentProgress", back_populates="course")
    questions = relationship("QuestionHistory", back_populates="course")


class Material(Base):
    """Uploaded course material (PDF, notes, etc.)."""
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    course = relationship("Course", back_populates="materials")


class Submission(Base):
    """Student submission for a course."""
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    content = Column(Text, nullable=False)
    score = Column(Float, nullable=True)  # Optional until graded
    submitted_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="submissions")
    course = relationship("Course", back_populates="submissions")


class StudentProgress(Base):
    """Tracks student progress per course."""
    __tablename__ = "student_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    total_questions_asked = Column(Integer, default=0)
    weak_topics = Column(JSON, default=list)  # List of weak topic strings
    strong_topics = Column(JSON, default=list)  # List of strong topic strings
    performance_score = Column(Float, default=0.0)  # 0-100 percentage
    last_activity = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="progress")
    course = relationship("Course", back_populates="student_progress")


class QuestionHistory(Base):
    """History of questions asked by students."""
    __tablename__ = "question_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    question = Column(Text, nullable=False)
    topic = Column(String(100), nullable=True)  # Extracted topic
    asked_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="question_history")
    course = relationship("Course", back_populates="questions")
