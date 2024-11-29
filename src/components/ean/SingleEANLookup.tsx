import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchAmazonProducts } from '../../services/amazon';
import { getAmazonCredentials } from '../../services/settings';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const SingleEANLookup: React.FC = () => {
  const [eanCode, setEanCode] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const lookupMutation = useMutation({
    mutationFn: async (code: string) => {
      const credentials = await getAmazonCredentials();
      const data = await fetchAmazonProducts([code], credentials);
      return data[code];
    },
    onSuccess: (data) => {
      setResult(JSON.stringify(data, null, 2));
      toast.success('Product data fetched successfully');
    },
    onError: (error) => {
      toast.error('Failed to fetch product data');
      console.error('Error fetching product:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eanCode.length !== 13) {
      toast.error('EAN code must be exactly 13 digits');
      return;
    }
    lookupMutation.mutate(eanCode);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Single EAN Lookup
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <Input
              type="text"
              value={eanCode}
              onChange={(e) => setEanCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 13-digit EAN code"
              pattern="\d{13}"
              maxLength={13}
              className="flex-1"
            />
            <Button
              type="submit"
              isLoading={lookupMutation.isPending}
              disabled={eanCode.length !== 13}
            >
              <Search className="h-4 w-4 mr-2" />
              Lookup
            </Button>
          </div>
        </form>

        {result && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Amazon Product Data
            </h3>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};