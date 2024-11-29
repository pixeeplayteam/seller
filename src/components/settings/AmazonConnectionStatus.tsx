import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getAmazonCredentials } from '../../services/settings';
import { testAmazonConnection } from '../../services/amazon';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export const AmazonConnectionStatus: React.FC = () => {
  const { data: credentials, isLoading: isLoadingCredentials } = useQuery({
    queryKey: ['amazonCredentials'],
    queryFn: getAmazonCredentials,
  });

  const { data: connectionStatus, isLoading: isTestingConnection, refetch } = useQuery({
    queryKey: ['amazonConnectionStatus', credentials],
    queryFn: async () => {
      if (!credentials) return null;
      return testAmazonConnection(credentials);
    },
    enabled: !!credentials,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleTestConnection = async () => {
    try {
      await refetch();
      toast.success('Connection test completed');
    } catch (error) {
      toast.error('Failed to test connection');
    }
  };

  if (isLoadingCredentials) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!credentials) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-yellow-500" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">No Credentials Found</h3>
            <p className="text-sm text-yellow-600 mt-1">
              Please add your Amazon Seller API credentials to enable connection status monitoring.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Connection Status</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestConnection}
          isLoading={isTestingConnection}
        >
          Test Connection
        </Button>
      </div>

      {connectionStatus && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {connectionStatus.success ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <div>
              <h4 className={`text-sm font-medium ${connectionStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                {connectionStatus.success ? 'Connected' : 'Connection Failed'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {connectionStatus.message}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Checked</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(connectionStatus.timestamp).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Marketplace</dt>
                <dd className="text-sm text-gray-900">
                  {connectionStatus.marketplace}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">API Rate Limit</dt>
                <dd className="text-sm text-gray-900">
                  {connectionStatus.rateLimit?.remaining || 'N/A'} / {connectionStatus.rateLimit?.total || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rate Limit Reset</dt>
                <dd className="text-sm text-gray-900">
                  {connectionStatus.rateLimit?.resetTime
                    ? new Date(connectionStatus.rateLimit.resetTime).toLocaleString()
                    : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};