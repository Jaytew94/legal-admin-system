import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RecordsList from './pages/RecordsList';
import Settings from './pages/Settings';
import AddRecord from './pages/AddRecord';
import VerificationPage from './pages/VerificationPage';
import MainLayout from './components/Layout/MainLayout';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './App.css';

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/sticker" element={<VerificationPage />} />
            <Route path="/check/sticker" element={<VerificationPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/records"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <RecordsList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/records/new"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AddRecord />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/records/add"
              element={<Navigate to="/records/new" replace />}
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <SpeedInsights />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
