import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Trophy,
  Upload,
  TrendingUp,
  BookOpen,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { courseAPI, submissionAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Course {
  id: number;
  name: string;
  description: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  avg_score: number;
  submissions: number;
}

export default function ProfessorDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubmissions: 0,
    averageScore: 0,
    pendingReviews: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseList = await courseAPI.list();
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourse(courseList[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedCourse) return;
      try {
        const data = await submissionAPI.getLeaderboard(selectedCourse);
        setLeaderboard(data.leaderboard || []);
        
        // Calculate stats from leaderboard
        const totalStudents = data.leaderboard?.length || 0;
        const totalSubmissions = data.leaderboard?.reduce((acc: number, e: LeaderboardEntry) => acc + e.submissions, 0) || 0;
        const avgScore = totalStudents > 0 
          ? data.leaderboard.reduce((acc: number, e: LeaderboardEntry) => acc + e.avg_score, 0) / totalStudents 
          : 0;
        
        setStats({
          totalStudents,
          totalSubmissions,
          averageScore: Math.round(avgScore),
          pendingReviews: 0
        });
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, [selectedCourse]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin"></div>
          <p className="text-dark-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      gradient: 'from-neon-blue to-cyan-400',
      bgGlow: 'bg-neon-blue/20',
    },
    {
      label: 'Submissions',
      value: stats.totalSubmissions,
      icon: FileText,
      gradient: 'from-neon-purple to-violet-400',
      bgGlow: 'bg-neon-purple/20',
    },
    {
      label: 'Avg Score',
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      gradient: 'from-neon-green to-emerald-400',
      bgGlow: 'bg-neon-green/20',
    },
    {
      label: 'Courses',
      value: courses.length,
      icon: BookOpen,
      gradient: 'from-neon-pink to-rose-400',
      bgGlow: 'bg-neon-pink/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Professor Dashboard
          </h1>
          <p className="text-dark-400 text-lg">
            Welcome back, <span className="text-neon-green">{user?.username}</span>! Manage your courses and students.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Course selector */}
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
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="card-hover group">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bgGlow)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-dark-500 group-hover:text-neon-green transition-colors" />
            </div>
            <p className="text-dark-400 text-sm mb-1">{stat.label}</p>
            <p className={cn("text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent", stat.gradient)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/upload" className="card-hover group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-neon-blue/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7 text-neon-blue" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-neon-blue transition-colors">
                Upload Materials
              </h3>
              <p className="text-dark-400 text-sm">Add course content</p>
            </div>
          </div>
        </Link>

        <Link to="/professor/submissions" className="card-hover group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-neon-purple/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7 text-neon-purple" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-neon-purple transition-colors">
                View Submissions
              </h3>
              <p className="text-dark-400 text-sm">Review student work</p>
            </div>
          </div>
        </Link>

        <Link to="/professor/evaluations" className="card-hover group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-neon-green/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7 text-neon-green" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-neon-green transition-colors">
                Evaluations
              </h3>
              <p className="text-dark-400 text-sm">Generate reports</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neon-green/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-neon-green" />
              </div>
              <h3 className="text-xl font-bold text-white">Top Students</h3>
            </div>
            <Link to="/leaderboard" className="text-neon-blue hover:text-neon-purple transition-colors text-sm">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {leaderboard.length > 0 ? (
              leaderboard.slice(0, 5).map((entry, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl transition-colors",
                    i === 0 ? "bg-yellow-500/10 border border-yellow-500/30" :
                    i === 1 ? "bg-gray-400/10 border border-gray-400/30" :
                    i === 2 ? "bg-amber-600/10 border border-amber-600/30" :
                    "bg-dark-800/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                    i === 0 ? "bg-yellow-500 text-black" :
                    i === 1 ? "bg-gray-400 text-black" :
                    i === 2 ? "bg-amber-600 text-white" :
                    "bg-dark-700 text-dark-300"
                  )}>
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{entry.username}</p>
                    <p className="text-xs text-dark-400">{entry.submissions} submissions</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold",
                      entry.avg_score >= 80 ? "text-neon-green" :
                      entry.avg_score >= 60 ? "text-yellow-400" :
                      "text-red-400"
                    )}>
                      {entry.avg_score}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No students yet</p>
                <p className="text-dark-500 text-sm">Students will appear here after submitting work</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity / Course Overview */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neon-purple/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-neon-purple" />
            </div>
            <h3 className="text-xl font-bold text-white">Your Courses</h3>
          </div>

          <div className="space-y-3">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer hover:border-neon-purple/50",
                    selectedCourse === course.id
                      ? "bg-neon-purple/10 border-neon-purple/30"
                      : "bg-dark-800/50 border-dark-700"
                  )}
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{course.name}</h4>
                      <p className="text-sm text-dark-400 line-clamp-1">
                        {course.description || 'No description'}
                      </p>
                    </div>
                    {selectedCourse === course.id && (
                      <CheckCircle className="w-5 h-5 text-neon-purple" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No courses yet</p>
                <Link to="/upload" className="text-neon-blue hover:text-neon-purple transition-colors text-sm">
                  Create your first course →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
