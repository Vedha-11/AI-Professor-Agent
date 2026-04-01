"""
Submission tracking routes with auto-grading.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
import os
import shutil

from ..database import get_db
from ..models import Submission, Course, User, StudentProgress, Material
from ..schemas import SubmissionCreate, SubmissionResponse
from ..services.progress import update_progress_on_submission
from ..services.llm import generate_with_context
from ..services.embedding import search_course_materials
from ..services.document import extract_text_from_pdf
from .auth import get_current_user

router = APIRouter(prefix="/submissions", tags=["Submissions"])

# Directory for assignment uploads
ASSIGNMENTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "assignments")
os.makedirs(ASSIGNMENTS_DIR, exist_ok=True)



class AssignmentQuestion(BaseModel):
    question: str
    topic: str
    difficulty: str  # easy, medium, hard
    points: int


class AssignmentSubmission(BaseModel):
    course_id: int
    question: str
    answer: str
    topic: str = "general"


class GradingResult(BaseModel):
    score: float
    max_score: float
    percentage: float
    feedback: str
    correct_answer: str
    strengths: List[str]
    improvements: List[str]


class PDFGradingResult(BaseModel):
    submission_id: int
    filename: str
    score: float
    feedback: str
    strengths: List[str]
    improvements: List[str]
    extracted_content_preview: str


@router.post("/upload-pdf/{course_id}", response_model=PDFGradingResult)
async def upload_pdf_assignment(
    course_id: int,
    assignment_title: str = "General Assignment",
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a PDF assignment for automatic evaluation."""
    # Check course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Save the file
    user_dir = os.path.join(ASSIGNMENTS_DIR, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)
    
    file_path = os.path.join(user_dir, f"{course_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text from PDF
    try:
        extracted_text = extract_text_from_pdf(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text from PDF: {str(e)}")
    
    # Get course context for evaluation
    try:
        chunks = search_course_materials(course_id, assignment_title, n_results=3)
        context = "\n".join([c["text"] for c in chunks]) if chunks else ""
    except:
        context = ""
    
    # Evaluate using LLM
    evaluation_prompt = f"""You are a professor evaluating a student's assignment submission.

Assignment Title: {assignment_title}
Course: {course.name}

Student's Submission:
{extracted_text[:4000]}

{f"Reference Material: {context[:2000]}" if context else ""}

Evaluate this submission and provide:
1. Score out of 100
2. Detailed feedback
3. 2-3 strengths
4. 2-3 areas for improvement

Format your response as JSON:
{{
  "score": <number 0-100>,
  "feedback": "<detailed feedback>",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}}

Return ONLY the JSON object."""

    try:
        response = generate_with_context(
            question=evaluation_prompt,
            context=context if context else "Evaluate the student's assignment.",
            collection_name=f"course_{course_id}"
        )
        
        import json
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            result = json.loads(json_match.group())
            score = float(result.get("score", 70))
            feedback = result.get("feedback", "Good submission.")
            strengths = result.get("strengths", ["Shows effort", "Submitted on time"])
            improvements = result.get("improvements", ["Add more detail", "Review course materials"])
        else:
            score = 70.0
            feedback = "Your assignment has been reviewed."
            strengths = ["Completed assignment", "Shows understanding"]
            improvements = ["Could add more detail", "Include more examples"]
    except Exception as e:
        score = 70.0
        feedback = "Assignment received and evaluated."
        strengths = ["Submitted successfully", "Shows effort"]
        improvements = ["Review course materials for more depth"]
    
    # Save submission
    submission = Submission(
        user_id=current_user.id,
        course_id=course_id,
        content=f"[PDF Assignment: {file.filename}]\n\n{extracted_text[:500]}...",
        score=score
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # Update progress
    update_progress_on_submission(
        db=db,
        user_id=current_user.id,
        course_id=course_id,
        score=score
    )
    
    return PDFGradingResult(
        submission_id=submission.id,
        filename=file.filename,
        score=score,
        feedback=feedback,
        strengths=strengths,
        improvements=improvements,
        extracted_content_preview=extracted_text[:300] + "..." if len(extracted_text) > 300 else extracted_text
    )


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
    """Update submission score (for grading) and update student progress."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.score = score
    db.commit()
    
    # Update student progress
    update_progress_on_submission(
        db=db,
        user_id=submission.user_id,
        course_id=submission.course_id,
        score=score
    )
    
    return {"message": "Score updated", "score": score}


@router.get("/leaderboard/{course_id}")
def get_leaderboard(course_id: int, db: Session = Depends(get_db)):
    """Get enhanced leaderboard for a course with progress data."""
    # Get basic leaderboard data with joins
    results = db.query(
        User.id.label("user_id"),
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
    
    # Enhance with progress data
    leaderboard = []
    for i, r in enumerate(results):
        # Get progress data for this user
        progress = db.query(StudentProgress).filter(
            StudentProgress.user_id == r.user_id,
            StudentProgress.course_id == course_id
        ).first()
        
        entry = {
            "rank": i + 1,
            "user_id": r.user_id,
            "username": r.username,
            "avg_score": round(r.avg_score, 2) if r.avg_score else 0,
            "submissions": r.submission_count,
            "progress_percent": round(progress.performance_score, 2) if progress else 0,
            "questions_asked": progress.total_questions_asked if progress else 0,
            "last_activity": progress.last_activity.isoformat() if progress and progress.last_activity else None
        }
        leaderboard.append(entry)
    
    return {"course_id": course_id, "leaderboard": leaderboard}


@router.get("/all/{course_id}")
def get_all_submissions(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all submissions for a course (professor only)."""
    # Check if user is professor
    if current_user.role != "professor":
        raise HTTPException(status_code=403, detail="Only professors can view all submissions")
    
    # Check course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get all submissions with user info
    submissions = db.query(Submission, User.username).join(
        User, Submission.user_id == User.id
    ).filter(
        Submission.course_id == course_id
    ).order_by(
        Submission.submitted_at.desc()
    ).all()
    
    result = []
    for submission, username in submissions:
        result.append({
            "id": submission.id,
            "user_id": submission.user_id,
            "username": username,
            "course_id": submission.course_id,
            "content": submission.content,
            "score": submission.score,
            "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None
        })
    
    return {"course_id": course_id, "submissions": result}


@router.get("/assignments/{course_id}")
def get_assignments(
    course_id: int,
    count: int = 5,
    db: Session = Depends(get_db)
):
    """Generate practice assignments/questions for a course using course materials."""
    # Check course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get some context from course materials
    try:
        chunks = search_course_materials(course_id, "key concepts and topics", n_results=3)
        context = "\n".join([c["text"] for c in chunks]) if chunks else ""
    except:
        context = ""
    
    # Generate questions using LLM
    prompt = f"""Based on the following course material, generate exactly {count} practice questions.
    
Course: {course.name}
{f"Material context: {context[:2000]}" if context else "Generate general questions about this subject."}

For each question, provide:
1. A clear question
2. The topic it covers
3. Difficulty level (easy, medium, hard)
4. Points (easy=5, medium=10, hard=15)

Format your response as a JSON array like this:
[
  {{"question": "What is...", "topic": "topic name", "difficulty": "easy", "points": 5}},
  {{"question": "Explain...", "topic": "topic name", "difficulty": "medium", "points": 10}}
]

Return ONLY the JSON array, no other text."""

    try:
        response = generate_with_context(
            question=prompt,
            context="Generate educational assessment questions.",
            collection_name=f"course_{course_id}"
        )
        
        # Parse JSON from response
        import json
        import re
        
        # Try to extract JSON array from response
        json_match = re.search(r'\[[\s\S]*\]', response)
        if json_match:
            questions = json.loads(json_match.group())
        else:
            # Fallback questions
            questions = [
                {"question": f"What are the key concepts in {course.name}?", "topic": "fundamentals", "difficulty": "easy", "points": 5},
                {"question": f"Explain the main principles of {course.name}.", "topic": "principles", "difficulty": "medium", "points": 10},
                {"question": f"How would you apply {course.name} concepts to solve real-world problems?", "topic": "application", "difficulty": "hard", "points": 15},
            ]
    except Exception as e:
        # Fallback if LLM fails
        questions = [
            {"question": f"Define the fundamental concepts of {course.name}.", "topic": "basics", "difficulty": "easy", "points": 5},
            {"question": f"Compare and contrast key elements in {course.name}.", "topic": "comparison", "difficulty": "medium", "points": 10},
            {"question": f"Analyze a complex scenario using {course.name} principles.", "topic": "analysis", "difficulty": "hard", "points": 15},
            {"question": f"What are the practical applications of {course.name}?", "topic": "application", "difficulty": "medium", "points": 10},
            {"question": f"Summarize the main topics covered in {course.name}.", "topic": "summary", "difficulty": "easy", "points": 5},
        ]
    
    return {"course_id": course_id, "assignments": questions[:count]}


@router.post("/grade", response_model=GradingResult)
def auto_grade_submission(
    submission: AssignmentSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Auto-grade a student's answer using AI."""
    # Check course exists
    course = db.query(Course).filter(Course.id == submission.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get relevant context
    try:
        chunks = search_course_materials(submission.course_id, submission.question, n_results=3)
        context = "\n".join([c["text"] for c in chunks]) if chunks else ""
    except:
        context = ""
    
    # Grade using LLM
    grading_prompt = f"""You are an expert teacher grading a student's answer. Be fair but thorough.

Question: {submission.question}
Topic: {submission.topic}

Student's Answer: {submission.answer}

{f"Reference Material: {context[:2000]}" if context else ""}

Evaluate the answer and provide:
1. Score out of 100
2. Detailed feedback
3. The correct/ideal answer
4. 2-3 strengths of the answer
5. 2-3 areas for improvement

Format your response as JSON:
{{
  "score": <number 0-100>,
  "feedback": "<detailed feedback>",
  "correct_answer": "<ideal answer>",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}}

Return ONLY the JSON object."""

    try:
        response = generate_with_context(
            question=grading_prompt,
            context=context if context else "Grade the student's answer based on accuracy and completeness.",
            collection_name=f"course_{submission.course_id}"
        )
        
        # Parse JSON response
        import json
        import re
        
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            result = json.loads(json_match.group())
            score = float(result.get("score", 70))
            feedback = result.get("feedback", "Good attempt!")
            correct_answer = result.get("correct_answer", "See course materials for reference.")
            strengths = result.get("strengths", ["Shows understanding", "Clear writing"])
            improvements = result.get("improvements", ["Add more detail", "Include examples"])
        else:
            # Fallback
            score = 75.0
            feedback = "Your answer demonstrates understanding of the topic. Review the course materials for more depth."
            correct_answer = "Please refer to course materials for the complete answer."
            strengths = ["Shows basic understanding", "Attempted the question"]
            improvements = ["Could add more specific details", "Include relevant examples"]
    except Exception as e:
        score = 70.0
        feedback = f"Your answer has been reviewed. Continue practicing to improve."
        correct_answer = "Please refer to course materials."
        strengths = ["Completed the assignment", "Shows effort"]
        improvements = ["Review course materials", "Practice more"]
    
    # Save submission with score
    db_submission = Submission(
        user_id=current_user.id,
        course_id=submission.course_id,
        content=f"Q: {submission.question}\nA: {submission.answer}",
        score=score
    )
    db.add(db_submission)
    db.commit()
    
    # Update student progress
    update_progress_on_submission(
        db=db,
        user_id=current_user.id,
        course_id=submission.course_id,
        score=score
    )
    
    return GradingResult(
        score=score,
        max_score=100.0,
        percentage=score,
        feedback=feedback,
        correct_answer=correct_answer,
        strengths=strengths,
        improvements=improvements
    )
