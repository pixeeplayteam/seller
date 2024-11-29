import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { amazonMarketplaces } from '../../data/amazon-marketplaces';
import type { AmazonCredentials, ConnectionTestResult } from '../../types/amazon';
import toast from 'react-hot-toast';

const credentialsSchema = z.object({
  accessKey: z.string().min(1, 'Access Key is required'),
  secretKey: z.string().min(40, 'Secret Key must be at least 40 characters'),
  region: z.string().min(1, 'Region is required'),
  marketplaceId: z.string().min(1, 'Marketplace is required'),
  merchantId: z.string().min(1, 'Merchant ID is required'),
});

interface AmazonCredentialsFormProps {
  initialData?: Partial<AmazonCredentials>;
  onSubmit: (data: AmazonCredentials) => void;
  isLoading?: boolean;
}

export const AmazonCredentialsForm: React.FC<AmazonCredentialsFormProps> = ({
  initialData = {
    merchantId: 'pixeeplay',
    marketplaceId: 'A13V1IB3VIYZZH', // Amazon France
    region: 'EU'
  },
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<AmazonCredentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const selectedRegion = watch('region');

  const testConnectionMutation = useMutation({
    mutationFn: async (credentials: AmazonCredentials): Promise<ConnectionTestResult> => {
      // Simulated API call for testing connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (credentials.secretKey.length < 40) {
        throw new Error('Invalid Secret Key length. Must be at least 40 characters');
      }

      // Validate marketplace and region match
      const marketplace = amazonMarketplaces.find(m => m.id === credentials.marketplaceId);
      if (!marketplace) {
        throw new Error('Invalid Marketplace ID');
      }

      if (marketplace.region !== credentials.region) {
        throw new Error(`Marketplace ${marketplace.name} is not in the selected region`);
      }

      // If all validations pass, return success
      return {
        success: true,
        message: `Successfully connected to Amazon Seller API for ${marketplace.name}`,
        timestamp: new Date().toISOString(),
      };
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Connection test failed');
    },
  });

  const handleTestConnection = async (data: AmazonCredentials) => {
    testConnectionMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Access Key"
          type="text"
          {...register('accessKey')}
          error={errors.accessKey?.message}
        />
        <Input
          label="Secret Key"
          type="password"
          {...register('secretKey')}
          error={errors.secretKey?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Merchant ID"
          type="text"
          {...register('merchantId')}
          error={errors.merchantId?.message}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            {...register('region')}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select Region</option>
            <option value="NA">North America</option>
            <option value="EU">Europe</option>
            <option value="FE">Far East</option>
            <option value="OCE">Oceania</option>
          </select>
          {errors.region && (
            <p className="text-sm text-red-600 mt-1">{errors.region.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marketplace
        </label>
        <select
          {...register('marketplaceId')}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select Marketplace</option>
          {amazonMarketplaces
            .filter(marketplace => !selectedRegion || marketplace.region === selectedRegion)
            .map(marketplace => (
              <option key={marketplace.id} value={marketplace.id}>
                {marketplace.name} ({marketplace.countryCode})
              </option>
            ))}
        </select>
        {errors.marketplaceId && (
          <p className="text-sm text-red-600 mt-1">{errors.marketplaceId.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleSubmit(handleTestConnection)}
          isLoading={testConnectionMutation.isPending}
          disabled={isLoading || !isValid}
        >
          Test Connection
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={testConnectionMutation.isPending || !isValid}
        >
          Save Credentials
        </Button>
      </div>
    </form>
  );
};