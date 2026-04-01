import { useState, useEffect, useRef } from 'react';
import {
  FileQuestion,
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
  Award,
  BookOpen,
  Target,
  Zap,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Clock,
  Upload,
  FileText
} from 'lucide-react';
import { courseAPI, submissionAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Assignment {
  question: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface Course {
  id: number;
  name: string;
}

interface GradingResult {
  score: number;
  max_score: number;
  percentage: number;
  feedback: string;
  correct_answer: string;
  strengths: string[];
  improvements: string[];
}

interface SubmissionHistory {
  question: string;
  answer: string;
  result: GradingResult;
  timestamp: Date;
}

interface PDFResult {
  submission_id: number;
  filename: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  extracted_content_preview: string;
}

const difficultyColors = {
  easy: 'bg-neon-green/20 text-neon-green border-neon-green/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const difficultyIcons = {
  easy: Zap,
  medium: Target,
  hard: Award,
};

export default function AssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [history, setHistory] = useState<SubmissionHistory[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'quiz' | 'pdf'>('quiz');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [pdfResult, setPdfResult] = useState<PDFResult | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.list();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch assignments when course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments();
    }
  }, [selectedCourse]);

  const fetchAssignments = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await submissionAPI.getAssignments(selectedCourse, 5);
      setAssignments(data.assignments || []);
    } catch (err: any) {
      setError('Failed to load assignments');
      // Fallback assignments
      setAssignments([
        { question: 'What are the key concepts in this course?', topic: 'fundamentals', difficulty: 'easy', points: 5 },
        { question: 'Explain the main principles covered in the materials.', topic: 'principles', difficulty: 'medium', points: 10 },
        { question: 'How would you apply these concepts to solve real problems?', topic: 'application', difficulty: 'hard', points: 15 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !answer.trim() || !selectedCourse) return;
    
    setIsGrading(true);
    setGradingResult(null);
    
    try {
      const result = await submissionAPI.gradeAnswer(
        selectedCourse,
        selectedAssignment.question,
        answer,
        selectedAssignment.topic
      );
      setGradingResult(result);
      
      // Add to history
      setHistory(prev => [{
        question: selectedAssignment.question,
        answer: answer,
        result: result,
        timestamp: new Date()
      }, ...prev]);
      
    } catch (err: any) {
      setError('Failed to grade submission. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  const resetQuiz = () => {
    setSelectedAssignment(null);
    setAnswer('');
    setGradingResult(null);
  };

  const handlePdfUpload = async () => {
    if (!pdfFile || !selectedCourse) return;
    
    setIsUploadingPdf(true);
    setPdfResult(null);
    setError('');
    
    try {
      const result = await submissionAPI.uploadPDF(
        selectedCourse,
        pdfFile,
        assignmentTitle || 'General Assignment'
      );
      setPdfResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload and evaluate PDF');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const resetPdfUpload = () => {
    setPdfFile(null);
    setAssignmentTitle('');
    setPdfResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-neon-green';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradeLabel = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="gradient-text">Assignments</span> & Quizzes
          </h1>
          <p className="text-dark-400 text-lg">
            Test your knowledge with AI-graded assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(Number(e.target.value))}
            className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
          <button
            onClick={fetchAssignments}
            className="p-2.5 bg-dark-800 border border-dark-600 rounded-xl hover:border-neon-blue transition-colors"
          >
            <RefreshCw className={cn("w-5 h-5 text-dark-300", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-dark-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('quiz')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            activeTab === 'quiz'
              ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white"
              : "text-dark-400 hover:text-white"
          )}
        >
          <FileQuestion className="w-4 h-4" />
          Quiz Questions
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            activeTab === 'pdf'
              ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white"
              : "text-dark-400 hover:text-white"
          )}
        >
          <Upload className="w-4 h-4" />
          Upload PDF
        </button>
      </div>

      {activeTab === 'quiz' ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment List */}
        <div className="lg:col-span-1 card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neon-purple/20 rounded-xl flex items-center justify-center">
              <FileQuestion className="w-5 h-5 text-neon-purple" />
            </div>
            <h3 className="text-xl font-bold text-white">Questions</h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment, i) => {
                const DiffIcon = difficultyIcons[assignment.difficulty];
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setAnswer('');
                      setGradingResult(null);
                    }}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-200",
                      selectedAssignment === assignment
                        ? "bg-neon-blue/10 border-neon-blue/50"
                        : "bg-dark-800/50 border-dark-700 hover:border-dark-500"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                        difficultyColors[assignment.difficulty]
                      )}>
                        <DiffIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-dark-200 text-sm line-clamp-2 mb-2">
                          {assignment.question}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 bg-dark-700 rounded-md text-dark-300">
                            {assignment.topic}
                          </span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-md border",
                            difficultyColors[assignment.difficulty]
                          )}>
                            {assignment.difficulty} • {assignment.points}pts
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "w-5 h-5 text-dark-500 flex-shrink-0 transition-colors",
                        selectedAssignment === assignment && "text-neon-blue"
                      )} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Answer Section */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAssignment ? (
            <>
              {/* Question Card */}
              <div className="card">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {selectedAssignment.question}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm px-3 py-1 bg-dark-800 rounded-lg text-dark-300">
                        Topic: {selectedAssignment.topic}
                      </span>
                      <span className={cn(
                        "text-sm px-3 py-1 rounded-lg border",
                        difficultyColors[selectedAssignment.difficulty]
                      )}>
                        {selectedAssignment.points} points
                      </span>
                    </div>
                  </div>
                </div>

                {!gradingResult ? (
                  <>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-40 bg-dark-800 border border-dark-600 rounded-xl p-4 text-white placeholder-dark-500 resize-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-dark-500 text-sm">
                        {answer.length} characters
                      </p>
                      <button
                        onClick={handleSubmit}
                        disabled={!answer.trim() || isGrading}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                          answer.trim() && !isGrading
                            ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-glow"
                            : "bg-dark-700 text-dark-500 cursor-not-allowed"
                        )}
                      >
                        {isGrading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Grading...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Answer
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Grading Result */
                  <div className="space-y-6">
                    {/* Score Display */}
                    <div className="flex items-center justify-center py-6">
                      <div className="text-center">
                        <div className={cn(
                          "text-7xl font-bold mb-2",
                          getScoreColor(gradingResult.score)
                        )}>
                          {Math.round(gradingResult.score)}%
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className={cn(
                            "text-2xl font-bold px-4 py-1 rounded-lg",
                            gradingResult.score >= 60 
                              ? "bg-neon-green/20 text-neon-green" 
                              : "bg-red-500/20 text-red-400"
                          )}>
                            Grade: {getGradeLabel(gradingResult.score)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-neon-blue" />
                        AI Feedback
                      </h4>
                      <p className="text-dark-300 leading-relaxed">{gradingResult.feedback}</p>
                    </div>

                    {/* Correct Answer */}
                    <div className="bg-neon-green/5 rounded-xl p-5 border border-neon-green/20">
                      <h4 className="font-semibold text-neon-green mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Model Answer
                      </h4>
                      <p className="text-dark-300 leading-relaxed">{gradingResult.correct_answer}</p>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neon-blue/5 rounded-xl p-5 border border-neon-blue/20">
                        <h4 className="font-semibold text-neon-blue mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {gradingResult.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-dark-300 text-sm">
                              <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-yellow-500/5 rounded-xl p-5 border border-yellow-500/20">
                        <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Areas to Improve
                        </h4>
                        <ul className="space-y-2">
                          {gradingResult.improvements.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-dark-300 text-sm">
                              <XCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Try Another */}
                    <button
                      onClick={resetQuiz}
                      className="w-full py-3 border border-dark-600 rounded-xl text-dark-300 hover:text-white hover:border-neon-blue transition-colors"
                    >
                      Try Another Question
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="card flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-6">
                <FileQuestion className="w-10 h-10 text-dark-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Select a Question</h3>
              <p className="text-dark-400 text-center max-w-md">
                Choose a question from the list to start your assignment. Your answers will be automatically graded by AI.
              </p>
            </div>
          )}

          {/* Submission History */}
          {history.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-neon-green/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-neon-green" />
                </div>
                <h3 className="text-xl font-bold text-white">Recent Submissions</h3>
              </div>
              <div className="space-y-3">
                {history.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                    <div className="flex-1 min-w-0">
                      <p className="text-dark-200 text-sm truncate">{item.question}</p>
                      <p className="text-dark-500 text-xs mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className={cn(
                      "text-2xl font-bold ml-4",
                      getScoreColor(item.result.score)
                    )}>
                      {Math.round(item.result.score)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      ) : (
      /* PDF Upload Section */
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Upload PDF Assignment</h3>
              <p className="text-dark-400 text-sm">Submit your assignment as PDF for AI evaluation</p>
            </div>
          </div>

          {!pdfResult ? (
            <div className="space-y-4">
              {/* Assignment Title */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g., Machine Learning Assignment 1"
                  className="input w-full"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  PDF File
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                    pdfFile
                      ? "border-neon-green bg-neon-green/5"
                      : "border-dark-600 hover:border-neon-blue hover:bg-dark-800/50"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {pdfFile ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-neon-green mb-3" />
                      <p className="text-white font-medium">{pdfFile.name}</p>
                      <p className="text-dark-400 text-sm">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-dark-500 mb-3" />
                      <p className="text-dark-300">Click to upload or drag and drop</p>
                      <p className="text-dark-500 text-sm">PDF files only</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePdfUpload}
                disabled={!pdfFile || isUploadingPdf}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all",
                  pdfFile && !isUploadingPdf
                    ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-glow"
                    : "bg-dark-700 text-dark-500 cursor-not-allowed"
                )}
              >
                {isUploadingPdf ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit for Evaluation
                  </>
                )}
              </button>
            </div>
          ) : (
            /* PDF Evaluation Result */
            <div className="space-y-6">
              {/* Score Display */}
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <div className={cn(
                    "text-7xl font-bold mb-2",
                    getScoreColor(pdfResult.score)
                  )}>
                    {Math.round(pdfResult.score)}%
                  </div>
                  <p className="text-dark-400">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {pdfResult.filename}
                  </p>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-neon-blue" />
                  AI Feedback
                </h4>
                <p className="text-dark-300 leading-relaxed">{pdfResult.feedback}</p>
              </div>

              {/* Extracted Content Preview */}
              <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neon-purple" />
                  Extracted Content Preview
                </h4>
                <p className="text-dark-400 text-sm italic">{pdfResult.extracted_content_preview}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neon-green/5 rounded-xl p-5 border border-neon-green/20">
                  <h4 className="font-semibold text-neon-green mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {pdfResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-dark-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-yellow-500/5 rounded-xl p-5 border border-yellow-500/20">
                  <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {pdfResult.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-dark-300 text-sm">
                        <XCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Upload Another */}
              <button
                onClick={resetPdfUpload}
                className="w-full py-3 border border-dark-600 rounded-xl text-dark-300 hover:text-white hover:border-neon-blue transition-colors"
              >
                Upload Another Assignment
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
