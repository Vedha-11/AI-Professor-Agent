"""
SQLAlchemy models for the AI Professor system.
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
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
