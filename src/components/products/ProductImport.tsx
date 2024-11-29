import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileUpload } from './FileUpload';
import { FilePreview } from './FilePreview';
import type { FilePreviewData, FileUploadResponse } from '../../types/file';
import toast from 'react-hot-toast';

export const ProductImport: React.FC = () => {
  const [previewData, setPreviewData] = useState<FilePreviewData | null>(null);

  const parseFileMutation = useMutation({
    mutationFn: async (file: File): Promise<FileUploadResponse> => {
      // Simulated API call for file parsing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock preview data
      return {
        success: true,
        data: {
          headers: ['EAN', 'Title', 'Description', 'Price', 'Status'],
          rows: [
            ['1234567890123', 'Product 1', 'Description 1', '99.99', 'active'],
            ['9876543210987', 'Product 2', 'Description 2', '149.99', 'pending'],
          ],
          totalRows: 100,
          previewRows: 2,
        },
        message: 'File parsed successfully',
      };
    },
    onSuccess: (response) => {
      if (response.data) {
        setPreviewData(response.data);
        toast.success(response.message);
      }
    },
    onError: () => {
      toast.error('Failed to parse file');
    },
  });

  const importProductsMutation = useMutation({
    mutationFn: async (data: FilePreviewData) => {
      // Simulated API call for importing products
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, message: 'Products imported successfully' };
    },
    onSuccess: (response) => {
      toast.success(response.message);
      setPreviewData(null);
    },
    onError: () => {
      toast.error('Failed to import products');
    },
  });

  const handleFileSelect = (file: File) => {
    parseFileMutation.mutate(file);
  };

  const handleImport = () => {
    if (previewData) {
      importProductsMutation.mutate(previewData);
    }
  };

  return (
    <div className="space-y-6">
      {!previewData ? (
        <FileUpload
          onFileSelect={handleFileSelect}
          onFileAccept={() => {}}
          onFileReject={() => setPreviewData(null)}
          isLoading={parseFileMutation.isPending}
        />
      ) : (
        <FilePreview
          data={previewData}
          onAccept={handleImport}
          onReject={() => setPreviewData(null)}
          isLoading={importProductsMutation.isPending}
        />
      )}
    </div>
  );
};