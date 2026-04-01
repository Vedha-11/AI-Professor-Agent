import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  TrendingUp,
  MessageSquare,
  FileText,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { courseAPI, submissionAPI } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';

interface Course {
  id: number;
  name: string;
}

interface Student {
  username: string;
  avgScore: number;
  submissions: number;
  questionsAsked: number;
  progressPercent: number;
  lastActivity: string;
  weakTopics: string[];
  strongTopics: string[];
}

export default function ProfessorStudentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
    const fetchStudents = async () => {
      if (!selectedCourse) return;
      setIsLoading(true);
      try {
        const data = await submissionAPI.getLeaderboard(selectedCourse);
        
        const studentList: Student[] = (data.leaderboard || []).map((entry: any) => ({
          username: entry.username,
          avgScore: Math.round(entry.avg_score || 0),
          submissions: entry.submissions || 0,
          questionsAsked: entry.questions_asked || 0,
          progressPercent: Math.round(entry.progress_percent || 0),
          lastActivity: entry.last_activity || new Date().toISOString(),
          weakTopics: ['Topic analysis coming soon'],
          strongTopics: ['Topic analysis coming soon']
        }));
        
        setStudents(studentList);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedCourse]);

  const filteredStudents = students.filter(s =>
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Students</h1>
          <p className="text-dark-400">Monitor student progress and activity</p>
        </div>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(Number(e.target.value))}
          className="input bg-dark-800 w-full md:w-64"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full md:w-96"
        />
      </div>

      {/* Students List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedStudent(student)}
              className="card cursor-pointer hover:border-neon-blue/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-white">
                    {student.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white truncate">{student.username}</h3>
                    <ChevronRight className="w-4 h-4 text-dark-500 group-hover:text-neon-blue transition-colors" />
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2 mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-dark-400">Progress</span>
                      <span className={cn(
                        "font-medium",
                        student.avgScore >= 80 ? "text-neon-green" :
                        student.avgScore >= 60 ? "text-yellow-400" :
                        "text-red-400"
                      )}>{student.avgScore}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          student.avgScore >= 80 ? "bg-neon-green" :
                          student.avgScore >= 60 ? "bg-yellow-400" :
                          "bg-red-400"
                        )}
                        style={{ width: `${student.avgScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-dark-400">
                      <FileText className="w-3 h-3" />
                      {student.submissions}
                    </div>
                    <div className="flex items-center gap-1 text-dark-400">
                      <MessageSquare className="w-3 h-3" />
                      {student.questionsAsked}
                    </div>
                    <div className="flex items-center gap-1 text-dark-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(student.lastActivity)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No students found</p>
          <p className="text-dark-500 text-sm">Students will appear here after they start learning</p>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 max-w-xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {selectedStudent.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedStudent.username}</h2>
                    <p className="text-dark-400">Student Profile</p>
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
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-neon-green" />
                    <span className="text-dark-400 text-sm">Avg Score</span>
                  </div>
                  <p className={cn(
                    "text-2xl font-bold",
                    selectedStudent.avgScore >= 80 ? "text-neon-green" :
                    selectedStudent.avgScore >= 60 ? "text-yellow-400" :
                    "text-red-400"
                  )}>
                    {selectedStudent.avgScore}%
                  </p>
                </div>
                <div className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-neon-blue" />
                    <span className="text-dark-400 text-sm">Submissions</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedStudent.submissions}</p>
                </div>
                <div className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-neon-purple" />
                    <span className="text-dark-400 text-sm">Questions</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedStudent.questionsAsked}</p>
                </div>
                <div className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-neon-pink" />
                    <span className="text-dark-400 text-sm">Last Active</span>
                  </div>
                  <p className="text-sm text-white">{formatDate(selectedStudent.lastActivity)}</p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Overall Progress</h3>
                <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      selectedStudent.avgScore >= 80 ? "bg-gradient-to-r from-neon-green to-emerald-400" :
                      selectedStudent.avgScore >= 60 ? "bg-gradient-to-r from-yellow-400 to-orange-400" :
                      "bg-gradient-to-r from-red-400 to-rose-500"
                    )}
                    style={{ width: `${selectedStudent.avgScore}%` }}
                  />
                </div>
              </div>

              {/* Topics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon-green" />
                    Strong Topics
                  </h3>
                  <div className="space-y-1">
                    {selectedStudent.strongTopics.map((t, i) => (
                      <div key={i} className="text-sm text-neon-green bg-neon-green/10 px-3 py-1.5 rounded-lg">
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Weak Topics
                  </h3>
                  <div className="space-y-1">
                    {selectedStudent.weakTopics.map((t, i) => (
                      <div key={i} className="text-sm text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
