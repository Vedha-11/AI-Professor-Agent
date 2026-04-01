import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ChatPage from '@/pages/ChatPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import UploadPage from '@/pages/UploadPage';
import AssignmentsPage from '@/pages/AssignmentsPage';
import ProfessorDashboardPage from '@/pages/ProfessorDashboardPage';
import ProfessorSubmissionsPage from '@/pages/ProfessorSubmissionsPage';
import ProfessorEvaluationsPage from '@/pages/ProfessorEvaluationsPage';
import ProfessorStudentsPage from '@/pages/ProfessorStudentsPage';

// Protected route wrapper for role-based access
function RoleRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: ('student' | 'professor')[] }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'professor' ? '/professor' : '/dashboard'} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Student Routes */}
      <Route
        path="/dashboard"
        element={
          <RoleRoute allowedRoles={['student']}>
            <Layout>
              <DashboardPage />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <RoleRoute allowedRoles={['student']}>
            <Layout>
              <ChatPage />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <RoleRoute allowedRoles={['student']}>
            <Layout>
              <AssignmentsPage />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/recommendations"
        element={
          <RoleRoute allowedRoles={['student']}>
            <Layout>
              <RecommendationsPage />
            </Layout>
          </RoleRoute>
        }
      />
      
      {/* Shared Routes */}
      <Route
        path="/leaderboard"
        element={
          <RoleRoute allowedRoles={['student', 'professor']}>
            <Layout>
              <LeaderboardPage />
            </Layout>
          </RoleRoute>
        }
      />
      
      {/* Professor Routes */}
      <Route
        path="/professor"
        element={
          <RoleRoute allowedRoles={['professor']}>
            <Layout>
              <ProfessorDashboardPage />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <RoleRoute allowedRoles={['professor']}>
            <Layout>
              <UploadPage />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/professor/students"
        element={
          <RoleRoute allowedRoles={['professor']}>
            <Layout>
              <ProfessorStudentsPage />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/professor/submissions"
        element={
          <RoleRoute allowedRoles={['professor']}>
            <Layout>
              <ProfessorSubmissionsPage />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/professor/evaluations"
        element={
          <RoleRoute allowedRoles={['professor']}>
            <Layout>
              <ProfessorEvaluationsPage />
            </Layout>
          </RoleRoute>
        }
      />
      
      {/* Default redirect based on role */}
      <Route 
        path="/" 
        element={
          user?.role === 'professor' 
            ? <Navigate to="/professor" replace />
            : <Navigate to="/dashboard" replace />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
