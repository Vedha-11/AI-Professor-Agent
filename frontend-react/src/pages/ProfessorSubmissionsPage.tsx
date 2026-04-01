import { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';
import { courseAPI, submissionAPI } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';

interface Course {
  id: number;
  name: string;
}

interface Submission {
  id: number;
  user_id: number;
  username?: string;
  course_id: number;
  content: string;
  score: number | null;
  submitted_at: string;
  feedback?: string;
}

export default function ProfessorSubmissionsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'graded' | 'pending'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

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
    const fetchSubmissions = async () => {
      if (!selectedCourse) return;
      setIsLoading(true);
      try {
        // Get leaderboard data which includes submission info
        const data = await submissionAPI.getLeaderboard(selectedCourse);
        // Transform leaderboard data to submissions format (mock for now)
        const mockSubmissions: Submission[] = (data.leaderboard || []).flatMap((entry: any, idx: number) => 
          Array(entry.submissions || 1).fill(null).map((_, subIdx) => ({
            id: idx * 100 + subIdx + 1,
            user_id: entry.user_id || idx + 1,
            username: entry.username,
            course_id: selectedCourse,
            content: `Assignment submission by ${entry.username}`,
            score: entry.avg_score || null,
            submitted_at: entry.last_activity || new Date().toISOString(),
          }))
        );
        setSubmissions(mockSubmissions);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, [selectedCourse]);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sub.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                          (filterStatus === 'graded' && sub.score !== null) ||
                          (filterStatus === 'pending' && sub.score === null);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: submissions.length,
    graded: submissions.filter(s => s.score !== null).length,
    pending: submissions.filter(s => s.score === null).length,
    avgScore: submissions.filter(s => s.score !== null).length > 0
      ? Math.round(submissions.filter(s => s.score !== null).reduce((acc, s) => acc + (s.score || 0), 0) / submissions.filter(s => s.score !== null).length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Student Submissions</h1>
          <p className="text-dark-400">Review and grade student work</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-dark-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-dark-400 text-sm">Graded</p>
          <p className="text-2xl font-bold text-neon-green">{stats.graded}</p>
        </div>
        <div className="card p-4">
          <p className="text-dark-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="card p-4">
          <p className="text-dark-400 text-sm">Avg Score</p>
          <p className="text-2xl font-bold text-neon-blue">{stats.avgScore}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search by student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'graded', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-xl font-medium transition-all capitalize",
                filterStatus === status
                  ? "bg-neon-purple text-white"
                  : "bg-dark-800 text-dark-300 hover:text-white"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin"></div>
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-4 px-6 text-dark-400 font-medium">Student</th>
                  <th className="text-left py-4 px-6 text-dark-400 font-medium">Submission</th>
                  <th className="text-left py-4 px-6 text-dark-400 font-medium">Date</th>
                  <th className="text-left py-4 px-6 text-dark-400 font-medium">Score</th>
                  <th className="text-left py-4 px-6 text-dark-400 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-dark-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr 
                    key={submission.id} 
                    className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {submission.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-white">{submission.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-dark-300 truncate max-w-xs">{submission.content}</p>
                    </td>
                    <td className="py-4 px-6 text-dark-400">
                      {formatDate(submission.submitted_at)}
                    </td>
                    <td className="py-4 px-6">
                      {submission.score !== null ? (
                        <span className={cn(
                          "font-bold",
                          submission.score >= 80 ? "text-neon-green" :
                          submission.score >= 60 ? "text-yellow-400" :
                          "text-red-400"
                        )}>
                          {submission.score}%
                        </span>
                      ) : (
                        <span className="text-dark-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {submission.score !== null ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-neon-green/20 text-neon-green rounded-lg text-sm">
                          <CheckCircle className="w-3 h-3" />
                          Graded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-neon-blue"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No submissions found</p>
            <p className="text-dark-500 text-sm">Submissions will appear here when students submit work</p>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Submission Details</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-dark-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-dark-400 text-sm mb-1">Student</p>
                <p className="text-white font-medium">{selectedSubmission.username}</p>
              </div>
              <div>
                <p className="text-dark-400 text-sm mb-1">Submitted</p>
                <p className="text-white">{formatDate(selectedSubmission.submitted_at)}</p>
              </div>
              <div>
                <p className="text-dark-400 text-sm mb-1">Content</p>
                <div className="bg-dark-800 rounded-xl p-4">
                  <p className="text-dark-200 whitespace-pre-wrap">{selectedSubmission.content}</p>
                </div>
              </div>
              {selectedSubmission.score !== null && (
                <div>
                  <p className="text-dark-400 text-sm mb-1">Score</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    selectedSubmission.score >= 80 ? "text-neon-green" :
                    selectedSubmission.score >= 60 ? "text-yellow-400" :
                    "text-red-400"
                  )}>
                    {selectedSubmission.score}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
