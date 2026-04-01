import { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Star, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { courseAPI, submissionAPI } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avg_score: number;
  submissions: number;
  progress_percent: number;
  questions_asked: number;
  last_activity: string | null;
}

interface Course {
  id: number;
  name: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.list();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedCourse) return;
      
      setIsLoading(true);
      try {
        const data = await submissionAPI.getLeaderboard(selectedCourse);
        setLeaderboard(data.leaderboard);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedCourse]);

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Crown className="w-5 h-5 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center">
            <Medal className="w-5 h-5 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center">
            <Medal className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-dark-800 rounded-xl flex items-center justify-center">
            <span className="text-dark-300 font-bold">#{rank}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-dark-400 text-lg">See how you rank against other students</p>
        </div>

        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(Number(e.target.value))}
          className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-neon-blue/50 outline-none min-w-[200px]"
        >
          <option value="" disabled>Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Top 3 Podium */}
      {!isLoading && leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-3 ring-4 ring-gray-400/30">
              <span className="text-2xl font-bold text-white">
                {leaderboard[1]?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="font-semibold text-white mb-1">{leaderboard[1]?.username}</p>
            <p className="text-dark-400 text-sm">{leaderboard[1]?.avg_score} pts</p>
            <div className="mt-3 w-24 h-20 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-8">
            <Crown className="w-8 h-8 text-yellow-400 mb-2 animate-float" />
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mb-3 ring-4 ring-yellow-400/30 shadow-lg shadow-yellow-500/30">
              <span className="text-3xl font-bold text-white">
                {leaderboard[0]?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="font-bold text-white text-lg mb-1">{leaderboard[0]?.username}</p>
            <p className="text-yellow-400 font-semibold">{leaderboard[0]?.avg_score} pts</p>
            <div className="mt-3 w-28 h-28 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg flex items-center justify-center">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center mb-3 ring-4 ring-amber-600/30">
              <span className="text-2xl font-bold text-white">
                {leaderboard[2]?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="font-semibold text-white mb-1">{leaderboard[2]?.username}</p>
            <p className="text-dark-400 text-sm">{leaderboard[2]?.avg_score} pts</p>
            <div className="mt-3 w-24 h-16 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
              <p className="text-dark-400">Loading rankings...</p>
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-dark-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No rankings yet</h3>
            <p className="text-dark-400">Be the first to submit work and get ranked!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-4 px-4 font-semibold text-dark-400 text-sm uppercase tracking-wider">Rank</th>
                  <th className="text-left py-4 px-4 font-semibold text-dark-400 text-sm uppercase tracking-wider">Student</th>
                  <th className="text-left py-4 px-4 font-semibold text-dark-400 text-sm uppercase tracking-wider">Score</th>
                  <th className="text-left py-4 px-4 font-semibold text-dark-400 text-sm uppercase tracking-wider">Progress</th>
                  <th className="text-left py-4 px-4 font-semibold text-dark-400 text-sm uppercase tracking-wider">Activity</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={cn(
                      "border-b border-dark-700/50 transition-colors",
                      entry.username === user?.username 
                        ? 'bg-neon-blue/10' 
                        : 'hover:bg-dark-800/50'
                    )}
                  >
                    <td className="py-4 px-4">
                      {getRankDisplay(entry.rank)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white",
                          entry.rank === 1 ? "bg-gradient-to-br from-yellow-400 to-amber-500" :
                          entry.rank === 2 ? "bg-gradient-to-br from-gray-400 to-gray-500" :
                          entry.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-700" :
                          "bg-gradient-to-br from-neon-purple to-neon-pink"
                        )}>
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white flex items-center gap-2">
                            {entry.username}
                            {entry.username === user?.username && (
                              <span className="text-xs bg-neon-blue/20 text-neon-blue px-2 py-0.5 rounded-full font-normal">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-dark-400">{entry.submissions} submissions</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-xl font-bold text-white">{entry.avg_score}</span>
                        <span className="text-dark-400 text-sm">/ 100</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-32">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-dark-400">{entry.progress_percent}%</span>
                        </div>
                        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                            style={{ width: `${entry.progress_percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4 text-dark-400">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{entry.questions_asked}</span>
                        </div>
                        {entry.last_activity && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(entry.last_activity)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
