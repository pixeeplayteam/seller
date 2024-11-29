import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import type { Product } from '../../types/product';

interface AmazonFetchButtonProps {
  onFetch: () => void;
  isLoading: boolean;
  selectedProducts: Product[];
  progress?: number;
}

export const AmazonFetchButton: React.FC<AmazonFetchButtonProps> = ({
  onFetch,
  isLoading,
  selectedProducts,
  progress
}) => {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={onFetch}
        isLoading={isLoading}
        disabled={isLoading || selectedProducts.length === 0}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Fetch from Amazon ({selectedProducts.length})
      </Button>
      
      {isLoading && typeof progress === 'number' && (
        <div className="w-full">
          <Progress value={progress} />
          <p className="text-xs text-gray-500 mt-1 text-center">
            Fetching product data: {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
};