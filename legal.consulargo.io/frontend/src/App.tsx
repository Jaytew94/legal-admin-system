import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RecordsList from './pages/RecordsList';
import Settings from './pages/Settings';
import AddRecord from './pages/AddRecord';
import EditRecord from './pages/EditRecord';
import UserManagement from './pages/UserManagement';
import VerificationPage from './pages/VerificationPage';
import MainLayout from './components/Layout/MainLayout';
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
              path="/records/edit/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EditRecord />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <UserManagement />
                  </MainLayout>
                </ProtectedRoute>
              }
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
