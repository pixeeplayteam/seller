import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Copy, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const apiSettingsSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  apiEndpoint: z.string().url('Must be a valid URL'),
});

type ApiSettingsData = z.infer<typeof apiSettingsSchema>;

export const ApiSettings: React.FC = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApiSettingsData>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      apiKey: localStorage.getItem('apiKey') || '',
      apiEndpoint: localStorage.getItem('apiEndpoint') || 'http://localhost:8000',
    },
  });

  const handleSaveSettings = (data: ApiSettingsData) => {
    localStorage.setItem('apiKey', data.apiKey);
    localStorage.setItem('apiEndpoint', data.apiEndpoint);
    toast.success('API settings saved successfully');
  };

  const generateApiKey = () => {
    setIsGenerating(true);
    // Simulate API key generation
    setTimeout(() => {
      const newApiKey = `pk_${Math.random().toString(36).substr(2, 32)}`;
      setValue('apiKey', newApiKey);
      setIsGenerating(false);
      toast.success('New API key generated');
    }, 1000);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(localStorage.getItem('apiKey') || '');
    toast.success('API key copied to clipboard');
  };

  return (
    <form onSubmit={handleSubmit(handleSaveSettings)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">API Key</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type={showApiKey ? 'text' : 'password'}
              {...register('apiKey')}
              className="block w-full pr-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showApiKey ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {errors.apiKey && (
            <p className="mt-1 text-sm text-red-600">{errors.apiKey.message}</p>
          )}
        </div>

        <Input
          label="API Endpoint"
          {...register('apiEndpoint')}
          error={errors.apiEndpoint?.message}
        />
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={generateApiKey}
          isLoading={isGenerating}
        >
          Generate New API Key
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={copyApiKey}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy API Key
        </Button>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Save Settings
        </Button>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900">API Documentation</h3>
        <div className="mt-2 prose prose-sm text-gray-500">
          <p>Use these endpoints to interact with your products:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>GET /api/products - List all products</li>
            <li>POST /api/products - Create a new product</li>
            <li>PUT /api/products/:id - Update a product</li>
            <li>DELETE /api/products/:id - Delete a product</li>
          </ul>
          <p className="mt-2">
            Include your API key in the Authorization header:
            <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </p>
        </div>
      </div>
    </form>
  );
};