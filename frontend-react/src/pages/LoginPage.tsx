import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Sparkles, LogIn, UserPlus, Zap, Brain, Trophy, GraduationCap, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'professor'>('student');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, user, isProfessor } = useAuth();

  if (user) {
    return <Navigate to={isProfessor ? "/professor" : "/dashboard"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignup) {
        await signup(username, password, role);
      } else {
        await login(username, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-900 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-purple/10" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center shadow-glow animate-float">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AcadAI</h1>
              <p className="text-dark-400">Next-Gen Learning Platform</p>
            </div>
          </div>
          
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Learn Smarter,<br />
            <span className="gradient-text">Not Harder</span>
          </h2>
          
          <p className="text-dark-300 text-lg mb-12 max-w-md">
            Powered by AI to provide personalized learning experiences, 
            track your progress, and help you excel.
          </p>
          
          {/* Feature cards */}
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 flex items-center gap-4 max-w-sm">
              <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-neon-blue" />
              </div>
              <div>
                <p className="text-white font-medium">AI-Powered Tutoring</p>
                <p className="text-dark-400 text-sm">Get instant answers from course materials</p>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4 flex items-center gap-4 max-w-sm">
              <div className="w-10 h-10 bg-neon-purple/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-neon-purple" />
              </div>
              <div>
                <p className="text-white font-medium">Smart Recommendations</p>
                <p className="text-dark-400 text-sm">Personalized study suggestions</p>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4 flex items-center gap-4 max-w-sm">
              <div className="w-10 h-10 bg-neon-green/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <p className="text-white font-medium">Track Progress</p>
                <p className="text-dark-400 text-sm">Compete on the leaderboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">AcadAI</h1>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-dark-400">
              {isSignup 
                ? 'Start your learning journey today' 
                : 'Sign in to continue learning'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Role selector - only show on signup */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      role === 'student'
                        ? "border-neon-blue bg-neon-blue/10 text-neon-blue"
                        : "border-dark-700 text-dark-400 hover:border-dark-500"
                    )}
                  >
                    <User className="w-6 h-6" />
                    <span className="font-medium">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('professor')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      role === 'professor'
                        ? "border-neon-green bg-neon-green/10 text-neon-green"
                        : "border-dark-700 text-dark-400 hover:border-dark-500"
                    )}
                  >
                    <GraduationCap className="w-6 h-6" />
                    <span className="font-medium">Professor</span>
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignup ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-neon-blue hover:text-neon-purple transition-colors"
            >
              {isSignup
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-4 glass rounded-xl">
            <p className="text-dark-400 text-sm text-center mb-2">Demo Mode</p>
            <p className="text-dark-300 text-xs text-center">
              Create any account to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
