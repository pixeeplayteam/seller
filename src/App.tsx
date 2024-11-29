import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { DashboardPage } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';
import { AuthGuard } from './components/auth/AuthGuard';
import { DashboardLayout } from './components/layouts/DashboardLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </AuthGuard>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;