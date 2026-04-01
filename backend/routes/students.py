"""
Student progress, recommendations, and evaluation routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Course, User, StudentProgress, QuestionHistory
from ..schemas import (
    StudentProgressResponse,
    QuestionHistoryResponse,
    RecommendationResponse,
    EvaluationResponse
)
from ..services.progress import (
    get_or_create_progress,
    generate_recommendations,
    generate_evaluation
)
from .auth import get_current_user

router = APIRouter(prefix="/students", tags=["Student Progress"])


@router.get("/progress/{course_id}", response_model=StudentProgressResponse)
def get_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get student progress for a specific course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    progress = get_or_create_progress(db, current_user.id, course_id)
    return progress


@router.get("/progress", response_model=List[StudentProgressResponse])
def get_all_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get student progress for all enrolled courses."""
    progress_list = db.query(StudentProgress).filter(
        StudentProgress.user_id == current_user.id
    ).all()
    return progress_list


@router.get("/history/{course_id}", response_model=List[QuestionHistoryResponse])
def get_question_history(
    course_id: int,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get question history for a specific course."""
    history = db.query(QuestionHistory).filter(
        QuestionHistory.user_id == current_user.id,
        QuestionHistory.course_id == course_id
    ).order_by(QuestionHistory.asked_at.desc()).limit(limit).all()
    
    return history


@router.get("/recommendations/{course_id}", response_model=RecommendationResponse)
def get_recommendations(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get personalized recommendations for a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    recommendations = generate_recommendations(db, current_user.id, course_id)
    return recommendations


@router.get("/evaluate/{course_id}", response_model=EvaluationResponse)
def evaluate_performance(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive performance evaluation for a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    evaluation = generate_evaluation(db, current_user.id, course_id)
    return evaluation


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive dashboard data for the student."""
    from sqlalchemy import func
    from ..models import Submission
    
    # Get all progress records
    progress_list = db.query(StudentProgress).filter(
        StudentProgress.user_id == current_user.id
    ).all()
    
    # Calculate overall stats
    total_questions = sum(p.total_questions_asked for p in progress_list)
    avg_performance = (
        sum(p.performance_score for p in progress_list) / len(progress_list)
        if progress_list else 0
    )
    
    # Aggregate weak and strong topics
    all_weak = []
    all_strong = []
    for p in progress_list:
        all_weak.extend(p.weak_topics or [])
        all_strong.extend(p.strong_topics or [])
    
    # Get recent activity (last 10 questions)
    recent_questions = db.query(QuestionHistory).filter(
        QuestionHistory.user_id == current_user.id
    ).order_by(QuestionHistory.asked_at.desc()).limit(10).all()
    
    # Get submission stats
    submission_count = db.query(func.count(Submission.id)).filter(
        Submission.user_id == current_user.id
    ).scalar()
    
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "total_questions_asked": total_questions,
        "average_performance": round(avg_performance, 2),
        "courses_enrolled": len(progress_list),
        "total_submissions": submission_count,
        "weak_topics": list(set(all_weak)),
        "strong_topics": list(set(all_strong)),
        "recent_activity": [
            {
                "question": q.question[:100] + "..." if len(q.question) > 100 else q.question,
                "topic": q.topic,
                "asked_at": q.asked_at.isoformat()
            }
            for q in recent_questions
        ]
    }
