import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, User, ArrowLeft, Download } from 'lucide-react';
import { signOut } from '../../services/auth';
import { Button } from '../ui/Button';
import { exportToCSV } from '../../utils/csv';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isNotDashboard = location.pathname !== '/dashboard';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {isNotDashboard && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
              <span className="text-xl font-bold text-blue-600">
                {isNotDashboard ? 'Settings' : 'Dashboard'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {!isNotDashboard && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV([], false)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Products
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};