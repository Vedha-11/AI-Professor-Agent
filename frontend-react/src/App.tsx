import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ChatPage from '@/pages/ChatPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import UploadPage from '@/pages/UploadPage';
import AssignmentsPage from '@/pages/AssignmentsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <DashboardPage />
              </Layout>
            }
          />
          <Route
            path="/chat"
            element={
              <Layout>
                <ChatPage />
              </Layout>
            }
          />
          <Route
            path="/assignments"
            element={
              <Layout>
                <AssignmentsPage />
              </Layout>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <Layout>
                <LeaderboardPage />
              </Layout>
            }
          />
          <Route
            path="/recommendations"
            element={
              <Layout>
                <RecommendationsPage />
              </Layout>
            }
          />
          <Route
            path="/upload"
            element={
              <Layout>
                <UploadPage />
              </Layout>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
