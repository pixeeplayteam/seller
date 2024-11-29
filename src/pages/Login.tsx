import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { LoginCredentials } from '../types/auth';
import { useMutation } from '@tanstack/react-query';
import { signIn } from '../services/auth';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to login');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Lock className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm
            onSubmit={(data) => loginMutation.mutate(data)}
            isLoading={loginMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};