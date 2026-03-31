"""
Submission tracking routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ..database import get_db
from ..models import Submission, Course, User
from ..schemas import SubmissionCreate, SubmissionResponse
from .auth import get_current_user

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.post("/", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_submission(
    submission_data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new submission for a course."""
    # Check course exists
    course = db.query(Course).filter(Course.id == submission_data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    submission = Submission(
        user_id=current_user.id,
        course_id=submission_data.course_id,
        content=submission_data.content
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return submission


@router.get("/my", response_model=List[SubmissionResponse])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all submissions for current user."""
    return db.query(Submission).filter(Submission.user_id == current_user.id).all()


@router.get("/course/{course_id}", response_model=List[SubmissionResponse])
def get_course_submissions(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all submissions for a course (by current user)."""
    return db.query(Submission).filter(
        Submission.user_id == current_user.id,
        Submission.course_id == course_id
    ).all()


@router.put("/{submission_id}/score")
def update_submission_score(
    submission_id: int,
    score: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update submission score (for grading)."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.score = score
    db.commit()
    
    return {"message": "Score updated", "score": score}


@router.get("/leaderboard/{course_id}")
def get_leaderboard(course_id: int, db: Session = Depends(get_db)):
    """Get leaderboard for a course based on average scores."""
    results = db.query(
        User.username,
        func.avg(Submission.score).label("avg_score"),
        func.count(Submission.id).label("submission_count")
    ).join(
        Submission, User.id == Submission.user_id
    ).filter(
        Submission.course_id == course_id,
        Submission.score.isnot(None)
    ).group_by(
        User.id
    ).order_by(
        func.avg(Submission.score).desc()
    ).all()
    
    leaderboard = [
        {
            "rank": i + 1,
            "username": r.username,
            "avg_score": round(r.avg_score, 2) if r.avg_score else 0,
            "submissions": r.submission_count
        }
        for i, r in enumerate(results)
    ]
    
    return {"course_id": course_id, "leaderboard": leaderboard}
