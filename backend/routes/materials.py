"""
Material upload routes.
"""
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Material, Course
from ..schemas import MaterialResponse
from .auth import get_current_user

router = APIRouter(prefix="/materials", tags=["Materials"])

# Upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "uploads")


@router.post("/upload/{course_id}", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
def upload_material(
    course_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Upload a material file (PDF, TXT, MD) for a course."""
    # Check course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Validate file type
    allowed_extensions = {".pdf", ".txt", ".md"}
    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {allowed_extensions}"
        )
    
    # Create course-specific upload directory
    course_dir = os.path.join(UPLOAD_DIR, str(course_id))
    os.makedirs(course_dir, exist_ok=True)
    
    # Save file
    filepath = os.path.join(course_dir, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create database record
    material = Material(
        course_id=course_id,
        filename=file.filename,
        filepath=filepath
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    
    return material


@router.get("/course/{course_id}", response_model=List[MaterialResponse])
def list_course_materials(course_id: int, db: Session = Depends(get_db)):
    """List all materials for a course."""
    return db.query(Material).filter(Material.course_id == course_id).all()


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a material."""
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Delete file if exists
    if os.path.exists(material.filepath):
        os.remove(material.filepath)
    
    db.delete(material)
    db.commit()
