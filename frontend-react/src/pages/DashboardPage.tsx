import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  MessageSquare, 
  Trophy, 
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle,
  Zap,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { studentAPI } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface DashboardData {
  username: string;
  total_questions_asked: number;
  average_performance: number;
  courses_enrolled: number;
  total_submissions: number;
  weak_topics: string[];
  strong_topics: string[];
  recent_activity: Array<{
    question: string;
    topic: string;
    asked_at: string;
  }>;
}

// Example data for when API has no data
const getExampleData = (username: string): DashboardData => ({
  username,
  total_questions_asked: 24,
  average_performance: 78,
  courses_enrolled: 3,
  total_submissions: 12,
  weak_topics: ['Neural Networks', 'Backpropagation', 'Regularization'],
  strong_topics: ['Linear Regression', 'Data Preprocessing', 'Classification'],
  recent_activity: [
    { question: 'What is the difference between supervised and unsupervised learning?', topic: 'ML Basics', asked_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { question: 'How does gradient descent work?', topic: 'Optimization', asked_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { question: 'Explain overfitting and how to prevent it', topic: 'Model Evaluation', asked_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    { question: 'What are the main types of neural network architectures?', topic: 'Deep Learning', asked_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  ]
});

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingExampleData, setUsingExampleData] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await studentAPI.getDashboard();
        // Check if we have meaningful data
        if (result.total_questions_asked === 0 && result.total_submissions === 0) {
          // Use example data if no activity yet
          setData(getExampleData(result.username || user?.username || 'Student'));
          setUsingExampleData(true);
        } else {
          setData(result);
          setUsingExampleData(false);
        }
      } catch (err: any) {
        // On error, show example data
        setData(getExampleData(user?.username || 'Student'));
        setUsingExampleData(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
          <p className="text-dark-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const performanceColor = data.average_performance >= 80 
    ? 'from-neon-green to-emerald-400' 
    : data.average_performance >= 60 
    ? 'from-yellow-400 to-orange-400' 
    : 'from-red-400 to-rose-500';

  const stats = [
    {
      label: 'Performance',
      value: `${data.average_performance}%`,
      icon: TrendingUp,
      gradient: 'from-neon-blue to-cyan-400',
      bgGlow: 'bg-neon-blue/20',
    },
    {
      label: 'Questions Asked',
      value: data.total_questions_asked,
      icon: MessageSquare,
      gradient: 'from-neon-purple to-violet-400',
      bgGlow: 'bg-neon-purple/20',
    },
    {
      label: 'Courses',
      value: data.courses_enrolled,
      icon: BookOpen,
      gradient: 'from-neon-pink to-rose-400',
      bgGlow: 'bg-neon-pink/20',
    },
    {
      label: 'Submissions',
      value: data.total_submissions,
      icon: Trophy,
      gradient: 'from-neon-green to-emerald-400',
      bgGlow: 'bg-neon-green/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Example Data Notice */}
      {usingExampleData && (
        <div className="bg-neon-blue/10 border border-neon-blue/30 text-neon-blue p-4 rounded-xl flex items-center gap-3">
          <Zap className="w-5 h-5" />
          <span>Showing example data. Start using AcadAI to see your real progress!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">{data.username}</span>! 👋
          </h1>
          <p className="text-dark-400 text-lg">
            Here's your learning progress overview
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 glass rounded-xl">
          <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
          <span className="text-dark-300 text-sm">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card-hover group">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bgGlow)}>
                <stat.icon className={cn("w-6 h-6 bg-gradient-to-r bg-clip-text", stat.gradient)} style={{ color: 'transparent', backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                <stat.icon className={cn("w-6 h-6 absolute")} style={{ 
                  background: `linear-gradient(135deg, ${stat.gradient.includes('blue') ? '#00d4ff' : stat.gradient.includes('purple') ? '#a855f7' : stat.gradient.includes('pink') ? '#ec4899' : '#22c55e'}, ${stat.gradient.includes('blue') ? '#22d3ee' : stat.gradient.includes('purple') ? '#8b5cf6' : stat.gradient.includes('pink') ? '#fb7185' : '#34d399'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-dark-500 group-hover:text-neon-blue transition-colors" />
            </div>
            <p className="text-dark-400 text-sm mb-1">{stat.label}</p>
            <p className={cn("text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent", stat.gradient)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Section */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neon-blue/20 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-neon-blue" />
            </div>
            <h3 className="text-xl font-bold text-white">Learning Progress</h3>
          </div>
          
          {/* Performance Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <span className="text-dark-300">Overall Performance</span>
              <span className={cn("font-bold bg-gradient-to-r bg-clip-text text-transparent", performanceColor)}>
                {data.average_performance}%
              </span>
            </div>
            <div className="h-4 bg-dark-800 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", performanceColor)}
                style={{ width: `${data.average_performance}%` }}
              />
            </div>
          </div>
          
          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neon-green/5 border border-neon-green/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-neon-green" />
                <h4 className="font-semibold text-white">Strong Topics</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.strong_topics.length > 0 ? (
                  data.strong_topics.map((topic) => (
                    <span 
                      key={topic}
                      className="px-3 py-1.5 bg-neon-green/20 text-neon-green rounded-lg text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <p className="text-dark-400 text-sm">Keep learning to identify your strengths!</p>
                )}
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h4 className="font-semibold text-white">Needs Improvement</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.weak_topics.length > 0 ? (
                  data.weak_topics.map((topic) => (
                    <span 
                      key={topic}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <p className="text-dark-400 text-sm">No weak areas identified yet! 🎉</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neon-purple/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-neon-purple" />
            </div>
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {data.recent_activity.length > 0 ? (
              data.recent_activity.slice(0, 5).map((activity, i) => (
                <div 
                  key={i} 
                  className="relative pl-4 border-l-2 border-dark-700 hover:border-neon-blue transition-colors py-2"
                >
                  <p className="text-dark-200 text-sm line-clamp-2 mb-2">{activity.question}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {activity.topic && (
                      <span className="text-xs bg-dark-800 px-2 py-1 rounded-md text-dark-300">
                        {activity.topic}
                      </span>
                    )}
                    <span className="text-xs text-dark-500">
                      {formatDate(activity.asked_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No recent activity</p>
                <p className="text-dark-500 text-sm">Start asking questions!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
