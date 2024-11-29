import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AmazonCredentials } from '../../types/amazon';

export const AmazonCredentialsStorage: React.FC = () => {
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [credentials, setCredentials] = useState<AmazonCredentials>({
    accessKey: '',
    secretKey: '',
    region: 'EU',
    marketplaceId: 'A13V1IB3VIYZZH',
    merchantId: 'pixeeplay'
  });

  const { data: storedCredentials, isLoading } = useQuery({
    queryKey: ['amazonCredentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amazon_credentials')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (storedCredentials) {
      setCredentials({
        accessKey: storedCredentials.access_key || '',
        secretKey: storedCredentials.secret_key || '',
        region: storedCredentials.region || 'EU',
        marketplaceId: storedCredentials.marketplace_id || 'A13V1IB3VIYZZH',
        merchantId: storedCredentials.merchant_id || 'pixeeplay'
      });
    }
  }, [storedCredentials]);

  const saveMutation = useMutation({
    mutationFn: async (creds: AmazonCredentials) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('amazon_credentials')
        .upsert({
          user_id: user.id,
          access_key: creds.accessKey,
          secret_key: creds.secretKey,
          region: creds.region,
          marketplace_id: creds.marketplaceId,
          merchant_id: creds.merchantId
        });

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success('Amazon credentials saved successfully');
    },
    onError: () => {
      toast.error('Failed to save credentials');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(credentials);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Access Key"
          value={credentials.accessKey}
          onChange={(e) => setCredentials({ ...credentials, accessKey: e.target.value })}
        />

        <div className="relative">
          <Input
            label="Secret Key"
            type={showSecretKey ? 'text' : 'password'}
            value={credentials.secretKey}
            onChange={(e) => setCredentials({ ...credentials, secretKey: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowSecretKey(!showSecretKey)}
            className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
          >
            {showSecretKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select
            value={credentials.region}
            onChange={(e) => setCredentials({ ...credentials, region: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="NA">North America</option>
            <option value="EU">Europe</option>
            <option value="FE">Far East</option>
            <option value="OCE">Oceania</option>
          </select>

          <Input
            label="Merchant ID"
            value={credentials.merchantId}
            onChange={(e) => setCredentials({ ...credentials, merchantId: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          isLoading={saveMutation.isPending}
        >
          Save Credentials
        </Button>
      </div>
    </div>
  );
};