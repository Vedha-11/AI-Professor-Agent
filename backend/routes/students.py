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


@router.get("/report/{course_id}/{user_id}")
def generate_student_report(
    course_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate comprehensive final report for a student (professor only)."""
    from sqlalchemy import func
    from ..models import Submission
    from ..services.llm import generate_response
    
    # Check if requester is professor
    if current_user.role != "professor":
        raise HTTPException(status_code=403, detail="Only professors can generate reports")
    
    # Get course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get target student
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get student progress
    progress = db.query(StudentProgress).filter(
        StudentProgress.user_id == user_id,
        StudentProgress.course_id == course_id
    ).first()
    
    # Get submissions
    submissions = db.query(Submission).filter(
        Submission.user_id == user_id,
        Submission.course_id == course_id
    ).all()
    
    # Calculate stats
    scores = [s.score for s in submissions if s.score is not None]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    # Determine grade
    if avg_score >= 90: grade = "A"
    elif avg_score >= 80: grade = "B"
    elif avg_score >= 70: grade = "C"
    elif avg_score >= 60: grade = "D"
    else: grade = "F"
    
    # Get question history
    questions = db.query(QuestionHistory).filter(
        QuestionHistory.user_id == user_id,
        QuestionHistory.course_id == course_id
    ).all()
    
    # Generate AI-powered insights
    report_prompt = f"""Generate a comprehensive student evaluation report.

Student: {student.username}
Course: {course.name}

Performance Data:
- Average Score: {avg_score:.1f}%
- Grade: {grade}
- Total Submissions: {len(submissions)}
- Questions Asked: {len(questions)}
- Weak Topics: {', '.join(progress.weak_topics) if progress and progress.weak_topics else 'None identified'}
- Strong Topics: {', '.join(progress.strong_topics) if progress and progress.strong_topics else 'None identified'}

Based on this data, provide:
1. 3-4 specific strengths
2. 3-4 areas needing improvement  
3. 3-4 actionable recommendations for future study

Format as JSON:
{{
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}}

Return ONLY the JSON."""

    try:
        response = generate_response(report_prompt)
        import json
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            insights = json.loads(json_match.group())
            strengths = insights.get("strengths", ["Completed course assignments", "Showed dedication"])
            weaknesses = insights.get("weaknesses", ["Could improve participation", "Review fundamentals"])
            recommendations = insights.get("recommendations", ["Continue practicing", "Review weak topics"])
        else:
            strengths = ["Completed assignments", "Active participation"]
            weaknesses = ["Needs more practice in weak areas"]
            recommendations = ["Review course materials regularly"]
    except:
        strengths = ["Completed course requirements", "Submitted assignments on time"]
        weaknesses = ["Areas for improvement identified in progress tracking"]
        recommendations = ["Continue practicing", "Focus on weak topics", "Ask more questions"]
    
    return {
        "student_id": user_id,
        "student_name": student.username,
        "course_id": course_id,
        "course_name": course.name,
        "final_grade": grade,
        "average_score": round(avg_score, 2),
        "total_submissions": len(submissions),
        "questions_asked": len(questions),
        "weak_topics": progress.weak_topics if progress else [],
        "strong_topics": progress.strong_topics if progress else [],
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "generated_at": __import__('datetime').datetime.utcnow().isoformat()
    }
