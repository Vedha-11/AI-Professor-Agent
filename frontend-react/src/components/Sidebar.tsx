import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Trophy, 
  Upload,
  Lightbulb,
  LogOut,
  Sparkles,
  ChevronRight,
  FileQuestion
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
  { icon: FileQuestion, label: 'Assignments', path: '/assignments' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Lightbulb, label: 'Recommendations', path: '/recommendations' },
  { icon: Upload, label: 'Upload Materials', path: '/upload' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-72 bg-dark-900/50 backdrop-blur-xl border-r border-dark-700/50 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700/50">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white">AcadAI</h1>
            <p className="text-xs text-dark-400">Intelligent Learning</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-4 px-3">
          Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white border border-neon-blue/30'
                      : 'text-dark-300 hover:bg-dark-800/50 hover:text-white'
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-neon-blue" : "text-dark-400 group-hover:text-neon-blue"
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-neon-blue" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-dark-700/50">
        <div className="glass rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center ring-2 ring-neon-purple/30">
              <span className="font-bold text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{user?.username}</p>
              <p className="text-xs text-dark-400">Student</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-dark-400 hover:text-red-400 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
