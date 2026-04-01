"""
Progress tracking and topic extraction service.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional, List
import re

from ..models import StudentProgress, QuestionHistory, Submission, Course, Material
from .llm import generate_response


def get_or_create_progress(db: Session, user_id: int, course_id: int) -> StudentProgress:
    """Get existing progress or create new one."""
    progress = db.query(StudentProgress).filter(
        StudentProgress.user_id == user_id,
        StudentProgress.course_id == course_id
    ).first()
    
    if not progress:
        progress = StudentProgress(
            user_id=user_id,
            course_id=course_id,
            total_questions_asked=0,
            weak_topics=[],
            strong_topics=[],
            performance_score=0.0
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    return progress


def extract_topic(question: str, course_name: str) -> str:
    """Extract the main topic from a question using LLM."""
    prompt = f"""Given this question about {course_name}, extract the main topic in 2-5 words.
Question: "{question}"

Return ONLY the topic name, nothing else. Examples: "linear regression", "neural networks", "data structures", "recursion"""

    try:
        topic = generate_response(prompt)
        # Clean up the response
        topic = topic.strip().strip('"').strip("'").lower()
        # Limit length
        if len(topic) > 50:
            topic = topic[:50]
        return topic if topic else "general"
    except Exception:
        # Fallback: extract keywords
        words = re.findall(r'\b[a-zA-Z]{4,}\b', question.lower())
        return words[0] if words else "general"


def update_progress_on_question(
    db: Session,
    user_id: int,
    course_id: int,
    question: str,
    topic: str
) -> StudentProgress:
    """Update student progress when a question is asked."""
    progress = get_or_create_progress(db, user_id, course_id)
    
    # Increment questions count
    progress.total_questions_asked += 1
    progress.last_activity = datetime.utcnow()
    
    # Track topic (repeated questions on same topic indicate weakness)
    weak_topics = list(progress.weak_topics) if progress.weak_topics else []
    
    # Add topic to weak areas if asked multiple times
    topic_count = db.query(QuestionHistory).filter(
        QuestionHistory.user_id == user_id,
        QuestionHistory.course_id == course_id,
        QuestionHistory.topic == topic
    ).count()
    
    if topic_count >= 2 and topic not in weak_topics:
        weak_topics.append(topic)
        progress.weak_topics = weak_topics
    
    # Record question history
    history = QuestionHistory(
        user_id=user_id,
        course_id=course_id,
        question=question,
        topic=topic
    )
    db.add(history)
    
    db.commit()
    db.refresh(progress)
    return progress


def update_progress_on_submission(
    db: Session,
    user_id: int,
    course_id: int,
    score: Optional[float]
) -> StudentProgress:
    """Update student progress when a submission is graded."""
    progress = get_or_create_progress(db, user_id, course_id)
    progress.last_activity = datetime.utcnow()
    
    if score is not None:
        # Calculate new performance score as weighted average
        submissions = db.query(Submission).filter(
            Submission.user_id == user_id,
            Submission.course_id == course_id,
            Submission.score.isnot(None)
        ).all()
        
        if submissions:
            total_score = sum(s.score for s in submissions)
            progress.performance_score = total_score / len(submissions)
        
        # Move topics from weak to strong if performance improves
        if score >= 80:
            weak = list(progress.weak_topics) if progress.weak_topics else []
            strong = list(progress.strong_topics) if progress.strong_topics else []
            
            # Get recent topics from questions
            recent_topics = db.query(QuestionHistory.topic).filter(
                QuestionHistory.user_id == user_id,
                QuestionHistory.course_id == course_id
            ).order_by(QuestionHistory.asked_at.desc()).limit(5).all()
            
            for (topic,) in recent_topics:
                if topic and topic in weak:
                    weak.remove(topic)
                    if topic not in strong:
                        strong.append(topic)
            
            progress.weak_topics = weak
            progress.strong_topics = strong
    
    db.commit()
    db.refresh(progress)
    return progress


def get_student_profile(db: Session, user_id: int, course_id: int) -> dict:
    """Get student profile for personalized responses."""
    progress = get_or_create_progress(db, user_id, course_id)
    
    return {
        "weak_topics": progress.weak_topics or [],
        "strong_topics": progress.strong_topics or [],
        "performance_score": progress.performance_score,
        "total_questions": progress.total_questions_asked
    }


def calculate_grade(score: float) -> str:
    """Calculate letter grade from score."""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"


def generate_recommendations(
    db: Session,
    user_id: int,
    course_id: int
) -> dict:
    """Generate personalized recommendations."""
    progress = get_or_create_progress(db, user_id, course_id)
    course = db.query(Course).filter(Course.id == course_id).first()
    
    weak_topics = progress.weak_topics or []
    
    # Get available materials
    materials = db.query(Material).filter(Material.course_id == course_id).all()
    material_names = [m.filename for m in materials]
    
    # Generate practice questions based on weak topics
    practice_questions = []
    if weak_topics and course:
        for topic in weak_topics[:3]:
            prompt = f"""Generate ONE practice question about "{topic}" for a {course.name} course.
Keep it concise. Return just the question."""
            try:
                q = generate_response(prompt)
                practice_questions.append(q.strip())
            except Exception:
                practice_questions.append(f"What are the key concepts of {topic}?")
    
    # Suggest materials
    suggested = []
    if material_names:
        suggested = material_names[:5]  # Suggest first 5 materials
    
    return {
        "course_id": course_id,
        "weak_topics": weak_topics,
        "suggested_materials": suggested,
        "practice_questions": practice_questions
    }


def generate_evaluation(
    db: Session,
    user_id: int,
    course_id: int
) -> dict:
    """Generate comprehensive performance evaluation."""
    progress = get_or_create_progress(db, user_id, course_id)
    
    score = progress.performance_score
    grade = calculate_grade(score)
    
    strengths = progress.strong_topics or []
    weaknesses = progress.weak_topics or []
    
    # Generate suggestions based on performance
    suggestions = []
    if score < 60:
        suggestions.append("Review fundamental concepts and practice more exercises")
        suggestions.append("Consider forming a study group for collaborative learning")
    elif score < 80:
        suggestions.append("Focus on weak areas identified above")
        suggestions.append("Try explaining concepts to others to reinforce understanding")
    else:
        suggestions.append("Challenge yourself with advanced topics")
        suggestions.append("Help peers who are struggling - teaching reinforces learning")
    
    if weaknesses:
        suggestions.append(f"Prioritize studying: {', '.join(weaknesses[:3])}")
    
    return {
        "course_id": course_id,
        "user_id": user_id,
        "score": round(score, 2),
        "grade": grade,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions
    }
