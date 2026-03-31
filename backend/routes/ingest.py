"""
Document ingestion routes - process and embed course materials.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Material
from ..schemas import IngestionResult
from ..services.document import extract_text_from_file, chunk_text
from ..services.embedding import add_chunks_to_collection, delete_material_chunks
from .auth import get_current_user

router = APIRouter(prefix="/ingest", tags=["Ingestion"])


@router.post("/material/{material_id}", response_model=IngestionResult)
def ingest_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Process a material file: extract text, chunk it, and create embeddings.
    """
    # Get material from database
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    try:
        # Extract text from file
        text = extract_text_from_file(material.filepath)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text content found in file")
        
        # Chunk the text
        chunks = chunk_text(text, chunk_size=500, overlap=50)
        
        # Add to vector store
        chunks_created = add_chunks_to_collection(
            course_id=material.course_id,
            material_id=material.id,
            chunks=chunks,
            filename=material.filename
        )
        
        return IngestionResult(
            material_id=material.id,
            filename=material.filename,
            chunks_created=chunks_created
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ingestion failed: {str(e)}"
        )


@router.post("/course/{course_id}", response_model=List[IngestionResult])
def ingest_all_course_materials(
    course_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Process all materials for a course.
    """
    materials = db.query(Material).filter(Material.course_id == course_id).all()
    
    if not materials:
        raise HTTPException(status_code=404, detail="No materials found for course")
    
    results = []
    for material in materials:
        try:
            text = extract_text_from_file(material.filepath)
            chunks = chunk_text(text, chunk_size=500, overlap=50)
            chunks_created = add_chunks_to_collection(
                course_id=course_id,
                material_id=material.id,
                chunks=chunks,
                filename=material.filename
            )
            results.append(IngestionResult(
                material_id=material.id,
                filename=material.filename,
                chunks_created=chunks_created
            ))
        except Exception as e:
            results.append(IngestionResult(
                material_id=material.id,
                filename=material.filename,
                chunks_created=0,
                status=f"failed: {str(e)}"
            ))
    
    return results


@router.delete("/material/{material_id}")
def delete_material_embeddings(
    material_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete embeddings for a material."""
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    deleted = delete_material_chunks(material.course_id, material_id)
    return {"deleted_chunks": deleted}
