import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../../types/product';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const hasImages = product.images && product.images.length > 0;
  const totalImages = hasImages ? product.images.length : 0;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
    >
      <div className="space-y-6">
        <div className="relative">
          <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg bg-gray-100">
            {hasImages ? (
              <img
                src={product.images[currentImageIndex]}
                alt={`${product.title} - Image ${currentImageIndex + 1}`}
                className="object-contain w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=600&fit=crop&q=80';
                  target.onerror = null; // Prevent infinite loop
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
            {totalImages > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          {totalImages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="text-sm text-gray-900">{product.title}</dd>
              </div>
              {product.asin && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">ASIN</dt>
                  <dd className="text-sm text-gray-900">{product.asin}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">EAN Code</dt>
                <dd className="text-sm text-gray-900">{product.eanCode}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="text-sm text-gray-900">{product.price.toFixed(2)} €</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${product.status === 'active' ? 'bg-green-100 text-green-800' : 
                      product.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {product.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Amazon Information</h4>
            <dl className="space-y-2">
              {product.salesRank && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sales Rank</dt>
                  <dd className="text-sm text-gray-900">{product.salesRank.toLocaleString()}</dd>
                </div>
              )}
              {product.buyBox && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Buy Box Price</dt>
                    <dd className="text-sm text-gray-900">{product.buyBox.price?.toFixed(2)} €</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Buy Box Seller</dt>
                    <dd className="text-sm text-gray-900">{product.buyBox.sellerName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fulfillment</dt>
                    <dd className="text-sm text-gray-900">
                      {product.buyBox.isAmazonFulfilled ? 'Amazon FBA' : 'Merchant Fulfilled'}
                    </dd>
                  </div>
                </>
              )}
              {product.lowestPrices && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Lowest Prices</dt>
                  <dd className="text-sm space-y-1">
                    {product.lowestPrices.fbaNew && (
                      <div>FBA New: {product.lowestPrices.fbaNew.toFixed(2)} €</div>
                    )}
                    {product.lowestPrices.new && (
                      <div>New: {product.lowestPrices.new.toFixed(2)} €</div>
                    )}
                    {product.lowestPrices.used && (
                      <div>Used: {product.lowestPrices.used.toFixed(2)} €</div>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-600">{product.description}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Specifications</h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
              <dd className="text-sm text-gray-900">
                {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} {product.dimensions.unit}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Weight</dt>
              <dd className="text-sm text-gray-900">
                {product.weight.value} {product.weight.unit}
              </dd>
            </div>
            {product.productGroup && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Product Group</dt>
                <dd className="text-sm text-gray-900">{product.productGroup}</dd>
              </div>
            )}
            {product.productType && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Product Type</dt>
                <dd className="text-sm text-gray-900">{product.productType}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="text-xs text-gray-500">
          <p>Created: {new Date(product.createdAt).toLocaleString()}</p>
          <p>Last Updated: {new Date(product.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </Modal>
  );
};