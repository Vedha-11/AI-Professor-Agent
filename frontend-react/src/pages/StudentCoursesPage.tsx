import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  FileText,
  ChevronRight
} from 'lucide-react';
import { courseAPI, studentAPI, materialAPI } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';

interface Course {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface CourseProgress {
  course_id: number;
  total_questions_asked: number;
  weak_topics: string[];
  strong_topics: string[];
  performance_score: number;
  last_activity: string;
}

interface Material {
  id: number;
  filename: string;
  uploaded_at: string;
}

export default function StudentCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, CourseProgress>>({});
  const [materialsMap, setMaterialsMap] = useState<Record<number, Material[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all courses
        const courseList = await courseAPI.list();
        setCourses(courseList);

        // Fetch progress for all courses
        const allProgress = await studentAPI.getAllProgress();
        const progressRecord: Record<number, CourseProgress> = {};
        for (const p of allProgress) {
          progressRecord[p.course_id] = p;
        }
        setProgressMap(progressRecord);

        // Fetch materials for each course
        const materialsRecord: Record<number, Material[]> = {};
        for (const course of courseList) {
          try {
            const materials = await materialAPI.list(course.id);
            materialsRecord[course.id] = materials;
          } catch {
            materialsRecord[course.id] = [];
          }
        }
        setMaterialsMap(materialsRecord);

        if (courseList.length > 0) {
          setSelectedCourse(courseList[0]);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'text-neon-green bg-neon-green/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">My Courses</h1>
        <p className="text-dark-400">View your enrolled courses and track your progress</p>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">No Courses Available</h3>
          <p className="text-dark-400">Your professor hasn't created any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-neon-purple" />
              Available Courses
            </h2>
            <div className="space-y-3">
              {courses.map((course) => {
                const progress = progressMap[course.id];
                const score = progress?.performance_score || 0;

                return (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={cn(
                      "w-full card text-left transition-all hover:border-neon-purple/50",
                      selectedCourse?.id === course.id && "border-neon-purple"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{course.name}</h3>
                        {course.description && (
                          <p className="text-dark-400 text-sm line-clamp-1 mt-1">
                            {course.description}
                          </p>
                        )}
                      </div>
                      {progress && (
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-xs font-medium",
                          getProgressColor(score)
                        )}>
                          {Math.round(score)}%
                        </span>
                      )}
                    </div>

                    {progress && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              score >= 80 ? "bg-neon-green" :
                              score >= 60 ? "bg-yellow-400" :
                              "bg-red-400"
                            )}
                            style={{ width: `${Math.min(score, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Course Details */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCourse ? (
              <>
                {/* Course Info */}
                <div className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedCourse.name}</h2>
                      {selectedCourse.description && (
                        <p className="text-dark-400 mt-1">{selectedCourse.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate('/chat')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Ask Questions
                    </button>
                  </div>

                  {/* Progress Stats */}
                  {progressMap[selectedCourse.id] && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-dark-800 rounded-xl p-4 text-center">
                        <p className="text-dark-400 text-sm">Performance</p>
                        <p className={cn(
                          "text-2xl font-bold",
                          getProgressColor(progressMap[selectedCourse.id].performance_score).split(' ')[0]
                        )}>
                          {Math.round(progressMap[selectedCourse.id].performance_score)}%
                        </p>
                      </div>
                      <div className="bg-dark-800 rounded-xl p-4 text-center">
                        <p className="text-dark-400 text-sm">Questions</p>
                        <p className="text-2xl font-bold text-neon-blue">
                          {progressMap[selectedCourse.id].total_questions_asked}
                        </p>
                      </div>
                      <div className="bg-dark-800 rounded-xl p-4 text-center">
                        <p className="text-dark-400 text-sm">Materials</p>
                        <p className="text-2xl font-bold text-neon-purple">
                          {materialsMap[selectedCourse.id]?.length || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Weak Topics */}
                {progressMap[selectedCourse.id]?.weak_topics?.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-red-400" />
                      Topics to Review
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {progressMap[selectedCourse.id].weak_topics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strong Topics */}
                {progressMap[selectedCourse.id]?.strong_topics?.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-neon-green" />
                      Your Strengths
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {progressMap[selectedCourse.id].strong_topics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-neon-green/10 text-neon-green rounded-lg text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Materials */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-neon-blue" />
                    Course Materials
                  </h3>
                  
                  {materialsMap[selectedCourse.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {materialsMap[selectedCourse.id].map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl"
                        >
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{material.filename}</p>
                            <p className="text-dark-500 text-sm">
                              Uploaded {formatDate(material.uploaded_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-dark-500 text-center py-4">
                      No materials uploaded yet
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/assignments')}
                    className="card hover:border-neon-green/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neon-green/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-neon-green" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Practice</p>
                          <p className="text-dark-400 text-sm">Take assignments</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-neon-green transition-colors" />
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/leaderboard')}
                    className="card hover:border-neon-purple/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neon-purple/20 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Leaderboard</p>
                          <p className="text-dark-400 text-sm">See rankings</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-neon-purple transition-colors" />
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="card text-center py-12">
                <BookOpen className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">Select a course to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
