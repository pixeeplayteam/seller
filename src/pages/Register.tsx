import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { RegisterCredentials } from '../types/auth';
import { useMutation } from '@tanstack/react-query';
import { signUp } from '../services/auth';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      toast.success(
        'Registration successful! Please check your email to verify your account.',
        { duration: 6000 }
      );
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to register');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <UserPlus className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm
            onSubmit={(data) => registerMutation.mutate(data)}
            isLoading={registerMutation.isPending}
          />
          
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              By registering, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};