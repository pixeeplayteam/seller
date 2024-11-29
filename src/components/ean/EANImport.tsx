import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileUpload } from '../products/FileUpload';
import { FilePreview } from '../products/FilePreview';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Progress } from '../ui/Progress';
import { AlertCircle, Pause, Play, StopCircle } from 'lucide-react';
import type { FilePreviewData } from '../../types/file';
import type { Product } from '../../types/product';
import { createProduct } from '../../services/products';
import { fetchAmazonProducts } from '../../services/amazon';
import { getAmazonCredentials } from '../../services/settings';
import toast from 'react-hot-toast';

interface EANImportProps {
  isOpen: boolean;
  onClose: () => void;
}

const BATCH_SIZE = 10;

export const EANImport: React.FC<EANImportProps> = ({ isOpen, onClose }) => {
  const [previewData, setPreviewData] = useState<FilePreviewData | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const queryClient = useQueryClient();

  const parseFileMutation = useMutation({
    mutationFn: async (file: File): Promise<FilePreviewData> => {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const uniqueEanCodes = [...new Set(lines.map(line => line.trim()))];
      
      return {
        headers: ['EAN Code', 'Status'],
        rows: uniqueEanCodes.map(code => [code, 'pending']),
        totalRows: uniqueEanCodes.length,
        previewRows: Math.min(uniqueEanCodes.length, 1000),
      };
    },
    onSuccess: (data) => {
      setPreviewData(data);
      toast.success('File parsed successfully');
    },
    onError: () => {
      toast.error('Failed to parse file');
    },
  });

  const parseManualInput = () => {
    const lines = manualInput.split('\n').filter(line => line.trim());
    const uniqueEanCodes = [...new Set(lines.map(line => line.trim()))];

    const data: FilePreviewData = {
      headers: ['EAN Code', 'Status'],
      rows: uniqueEanCodes.map(code => [code, 'pending']),
      totalRows: uniqueEanCodes.length,
      previewRows: uniqueEanCodes.length,
    };

    setPreviewData(data);
    setManualInput('');
  };

  const importEANMutation = useMutation({
    mutationFn: async (data: FilePreviewData) => {
      setImportProgress(0);
      setIsStopped(false);
      setIsPaused(false);

      const eanCodes = data.rows.map(([code]) => code);
      const totalBatches = Math.ceil(eanCodes.length / BATCH_SIZE);
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      // Get Amazon credentials
      const credentials = await getAmazonCredentials();

      for (let i = 0; i < eanCodes.length; i += BATCH_SIZE) {
        if (isStopped) {
          toast.success(`Import stopped. Processed ${processedCount} products (${successCount} successful, ${errorCount} failed)`);
          break;
        }

        while (isPaused) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (isStopped) break;
        }

        const batch = eanCodes.slice(i, i + BATCH_SIZE);

        try {
          // Create basic products first
          const basicProducts = batch.map(eanCode => ({
            title: `Product ${eanCode}`,
            description: 'Fetching product details...',
            eanCode,
            price: 0,
            dimensions: { length: 0, width: 0, height: 0, unit: 'cm' as const },
            weight: { value: 0, unit: 'kg' as const },
            status: 'pending' as const,
          }));

          // Create products in database
          await Promise.all(
            basicProducts.map(async (product) => {
              try {
                await createProduct(product);
                successCount++;
              } catch (error) {
                console.error('Error creating product:', error);
                errorCount++;
              }
            })
          );

          // Fetch Amazon data
          const amazonData = await fetchAmazonProducts(batch, credentials);

          // Update products with Amazon data
          await Promise.all(
            Object.entries(amazonData).map(([eanCode, amazonProduct]) =>
              createProduct({
                ...basicProducts.find(p => p.eanCode === eanCode)!,
                ...amazonProduct,
                status: 'active',
              })
            )
          );
        } catch (error) {
          console.error(`Error processing batch ${i / BATCH_SIZE + 1}/${totalBatches}:`, error);
          toast.error(`Failed to process batch ${i / BATCH_SIZE + 1}. Continuing with next batch...`);
        }

        processedCount += batch.length;
        setImportProgress((processedCount / eanCodes.length) * 100);
        
        // Invalidate queries after each batch
        queryClient.invalidateQueries({ queryKey: ['products'] });

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return { processedCount, successCount, errorCount };
    },
    onSuccess: ({ processedCount, successCount, errorCount }) => {
      if (!isStopped) {
        toast.success(
          `Import completed: ${processedCount} processed, ${successCount} created, ${errorCount} failed`
        );
      }
      setPreviewData(null);
      setManualInput('');
      onClose();
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
      importEANMutation.mutate(previewData);
    }
  };

  const handleStop = () => {
    setIsStopped(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import EAN Codes"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload a CSV file containing EAN codes or paste them directly below. Each EAN code should be on a new line.
          Each EAN code must be exactly 13 digits.
        </p>

        {!previewData ? (
          <div className="space-y-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileAccept={() => {}}
              onFileReject={() => setPreviewData(null)}
              isLoading={parseFileMutation.isPending}
              acceptedFileTypes={['csv']}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-sm text-gray-500">Or paste EAN codes</span>
              </div>
            </div>

            <div>
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter EAN codes here, one per line..."
                rows={5}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  variant="outline"
                  onClick={parseManualInput}
                  disabled={!manualInput.trim()}
                >
                  Preview EAN Codes
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <FilePreview
              data={previewData}
              onAccept={handleImport}
              onReject={() => setPreviewData(null)}
              isLoading={importEANMutation.isPending}
            />

            {importEANMutation.isPending && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePauseResume}
                    >
                      {isPaused ? (
                        <Play className="h-4 w-4 mr-2" />
                      ) : (
                        <Pause className="h-4 w-4 mr-2" />
                      )}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStop}
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round(importProgress)}% Complete
                  </span>
                </div>

                <Progress value={importProgress} />

                {isPaused && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">Import paused. Click Resume to continue.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};