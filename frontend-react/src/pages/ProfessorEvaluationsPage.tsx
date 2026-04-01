import { useEffect, useState } from 'react';
import {
  GraduationCap,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Award,
  Target
} from 'lucide-react';
import { courseAPI, studentAPI, submissionAPI } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';

interface Course {
  id: number;
  name: string;
}

interface StudentEvaluation {
  username: string;
  user_id: number;
  score: number;
  grade: string;
  submissions: number;
  questionsAsked: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  lastActivity: string;
}

interface LeaderboardEntry {
  username: string;
  avg_score: number;
  submissions: number;
  questions_asked: number;
  last_activity: string;
}

export default function ProfessorEvaluationsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentEvaluation | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseList = await courseAPI.list();
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourse(courseList[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!selectedCourse) return;
      setIsLoading(true);
      try {
        const data = await submissionAPI.getLeaderboard(selectedCourse);
        
        // Transform leaderboard data to evaluations
        const evals: StudentEvaluation[] = (data.leaderboard || []).map((entry: LeaderboardEntry) => {
          const score = entry.avg_score || 0;
          const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
          
          return {
            username: entry.username,
            user_id: 0,
            score: Math.round(score),
            grade,
            submissions: entry.submissions || 0,
            questionsAsked: entry.questions_asked || 0,
            strengths: score >= 70 ? ['Consistent submissions', 'Active participation'] : ['Shows effort'],
            weaknesses: score < 70 ? ['Needs more practice', 'Review fundamentals'] : [],
            suggestions: score < 80 ? ['Focus on weak areas', 'Ask more questions'] : ['Keep up the good work'],
            lastActivity: entry.last_activity || new Date().toISOString()
          };
        });
        
        setEvaluations(evals);
      } catch (err) {
        console.error('Failed to fetch evaluations:', err);
        setEvaluations([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvaluations();
  }, [selectedCourse]);

  const generateReports = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert('Reports generated successfully! (Demo)');
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-neon-green bg-neon-green/20';
      case 'B': return 'text-blue-400 bg-blue-400/20';
      case 'C': return 'text-yellow-400 bg-yellow-400/20';
      case 'D': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-red-400 bg-red-400/20';
    }
  };

  const stats = {
    totalStudents: evaluations.length,
    avgScore: evaluations.length > 0 
      ? Math.round(evaluations.reduce((acc, e) => acc + e.score, 0) / evaluations.length) 
      : 0,
    passing: evaluations.filter(e => e.score >= 60).length,
    excellent: evaluations.filter(e => e.score >= 90).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Student Evaluations</h1>
          <p className="text-dark-400">Generate comprehensive performance reports</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(Number(e.target.value))}
            className="input bg-dark-800"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <button
            onClick={generateReports}
            disabled={isGenerating || evaluations.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Generate Reports
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neon-blue/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Students</p>
              <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neon-purple/20 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Avg Score</p>
              <p className="text-2xl font-bold text-neon-purple">{stats.avgScore}%</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neon-green/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Passing</p>
              <p className="text-2xl font-bold text-neon-green">{stats.passing}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Excellent</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.excellent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluations Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin"></div>
        </div>
      ) : evaluations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluations.map((evaluation, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedStudent(evaluation)}
              className="card cursor-pointer hover:border-neon-purple/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {evaluation.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{evaluation.username}</h3>
                    <p className="text-dark-400 text-sm">{evaluation.submissions} submissions</p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-lg font-bold text-lg",
                  getGradeColor(evaluation.grade)
                )}>
                  {evaluation.grade}
                </span>
              </div>

              {/* Score bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-400">Score</span>
                  <span className={cn(
                    "font-medium",
                    evaluation.score >= 80 ? "text-neon-green" :
                    evaluation.score >= 60 ? "text-yellow-400" :
                    "text-red-400"
                  )}>{evaluation.score}%</span>
                </div>
                <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      evaluation.score >= 80 ? "bg-neon-green" :
                      evaluation.score >= 60 ? "bg-yellow-400" :
                      "bg-red-400"
                    )}
                    style={{ width: `${evaluation.score}%` }}
                  />
                </div>
              </div>

              {/* Quick insights */}
              <div className="flex flex-wrap gap-2">
                {evaluation.strengths.slice(0, 2).map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-neon-green/10 text-neon-green text-xs rounded-lg flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {s}
                  </span>
                ))}
                {evaluation.weaknesses.slice(0, 1).map((w, i) => (
                  <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-lg flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <GraduationCap className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No evaluations available</p>
          <p className="text-dark-500 text-sm">Students need to submit work first</p>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {selectedStudent.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedStudent.username}</h2>
                    <p className="text-dark-400">Student Evaluation Report</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-dark-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Grade & Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-800 rounded-xl p-4 text-center">
                  <p className="text-dark-400 text-sm mb-2">Final Grade</p>
                  <span className={cn(
                    "text-4xl font-bold px-4 py-2 rounded-xl inline-block",
                    getGradeColor(selectedStudent.grade)
                  )}>
                    {selectedStudent.grade}
                  </span>
                </div>
                <div className="bg-dark-800 rounded-xl p-4 text-center">
                  <p className="text-dark-400 text-sm mb-2">Score</p>
                  <p className={cn(
                    "text-4xl font-bold",
                    selectedStudent.score >= 80 ? "text-neon-green" :
                    selectedStudent.score >= 60 ? "text-yellow-400" :
                    "text-red-400"
                  )}>
                    {selectedStudent.score}%
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-800 rounded-xl p-4">
                  <p className="text-dark-400 text-sm">Submissions</p>
                  <p className="text-2xl font-bold text-white">{selectedStudent.submissions}</p>
                </div>
                <div className="bg-dark-800 rounded-xl p-4">
                  <p className="text-dark-400 text-sm">Questions Asked</p>
                  <p className="text-2xl font-bold text-white">{selectedStudent.questionsAsked}</p>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                  Strengths
                </h3>
                <div className="space-y-2">
                  {selectedStudent.strengths.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 bg-neon-green/10 text-neon-green p-3 rounded-xl">
                      <CheckCircle className="w-4 h-4" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              {selectedStudent.weaknesses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-2">
                    {selectedStudent.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-center gap-2 bg-red-500/10 text-red-400 p-3 rounded-xl">
                        <AlertCircle className="w-4 h-4" />
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-neon-blue" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedStudent.suggestions.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 bg-neon-blue/10 text-neon-blue p-3 rounded-xl">
                      <FileText className="w-4 h-4" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-dark-700">
              <button
                onClick={() => {
                  alert(`Report for ${selectedStudent.username} downloaded! (Demo)`);
                }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
