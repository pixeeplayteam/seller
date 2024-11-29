import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { Product } from '../../types/product';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  eanCode: z.string().regex(/^\d{13}$/, 'EAN code must be 13 digits'),
  asin: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  dimensions: z.object({
    length: z.number().min(0, 'Length must be positive'),
    width: z.number().min(0, 'Width must be positive'),
    height: z.number().min(0, 'Height must be positive'),
    unit: z.enum(['cm', 'in']),
  }),
  weight: z.object({
    value: z.number().min(0, 'Weight must be positive'),
    unit: z.enum(['kg', 'lb']),
  }),
  status: z.enum(['active', 'inactive', 'pending']),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  browseNodes: z.array(z.string()).optional(),
  salesRank: z.number().optional(),
  buyBox: z.object({
    price: z.number().optional(),
    sellerId: z.string().optional(),
    sellerName: z.string().optional(),
    isAmazonFulfilled: z.boolean().optional(),
    isAmazonSelling: z.boolean().optional(),
    isPreorder: z.boolean().optional(),
    isBackordered: z.boolean().optional(),
    shippingCountry: z.string().optional(),
  }).optional(),
  amazonPrice: z.number().optional(),
  lowestPrices: z.object({
    fbaNew: z.number().optional(),
    new: z.number().optional(),
    used: z.number().optional(),
    collectible: z.number().optional(),
    refurbished: z.number().optional(),
  }).optional(),
  listPrice: z.number().optional(),
  productGroup: z.string().optional(),
  productType: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<Product>;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      eanCode: initialData?.eanCode || '',
      asin: initialData?.asin || '',
      price: initialData?.price || 0,
      dimensions: {
        length: initialData?.dimensions?.length || 0,
        width: initialData?.dimensions?.width || 0,
        height: initialData?.dimensions?.height || 0,
        unit: initialData?.dimensions?.unit || 'cm',
      },
      weight: {
        value: initialData?.weight?.value || 0,
        unit: initialData?.weight?.unit || 'kg',
      },
      images: initialData?.images || [],
      status: initialData?.status || 'pending',
      browseNodes: initialData?.browseNodes || [],
      salesRank: initialData?.salesRank || 0,
      buyBox: initialData?.buyBox || {},
      amazonPrice: initialData?.amazonPrice || 0,
      lowestPrices: initialData?.lowestPrices || {},
      listPrice: initialData?.listPrice || 0,
      productGroup: initialData?.productGroup || '',
      productType: initialData?.productType || '',
    },
  });

  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const images = watch('images') || [];

  const handleAddImage = () => {
    setValue('images', [...images, '']);
  };

  const handleRemoveImage = (index: number) => {
    setValue('images', images.filter((_, i) => i !== index));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Product' : 'Add New Product'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <Input
              label="Title"
              {...register('title')}
              error={errors.title?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="EAN Code"
                {...register('eanCode')}
                error={errors.eanCode?.message}
              />
              <Input
                label="ASIN"
                {...register('asin')}
                error={errors.asin?.message}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                error={errors.price?.message}
              />
              <Input
                label="List Price"
                type="number"
                step="0.01"
                {...register('listPrice', { valueAsNumber: true })}
                error={errors.listPrice?.message}
              />
            </div>
          </div>

          {/* Amazon Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Amazon Information</h3>
            <Input
              label="Sales Rank"
              type="number"
              {...register('salesRank', { valueAsNumber: true })}
              error={errors.salesRank?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Product Group"
                {...register('productGroup')}
                error={errors.productGroup?.message}
              />
              <Input
                label="Product Type"
                {...register('productType')}
                error={errors.productType?.message}
              />
            </div>
          </div>

          {/* Dimensions and Weight */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Dimensions</h3>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Length"
                type="number"
                step="0.1"
                {...register('dimensions.length', { valueAsNumber: true })}
                error={errors.dimensions?.length?.message}
              />
              <Input
                label="Width"
                type="number"
                step="0.1"
                {...register('dimensions.width', { valueAsNumber: true })}
                error={errors.dimensions?.width?.message}
              />
              <Input
                label="Height"
                type="number"
                step="0.1"
                {...register('dimensions.height', { valueAsNumber: true })}
                error={errors.dimensions?.height?.message}
              />
            </div>
            <select
              {...register('dimensions.unit')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="cm">Centimeters (cm)</option>
              <option value="in">Inches (in)</option>
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Weight</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Value"
                type="number"
                step="0.01"
                {...register('weight.value', { valueAsNumber: true })}
                error={errors.weight?.value?.message}
              />
              <select
                {...register('weight.unit')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
            )}
          </div>

          {/* Images */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Images (Optional)</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddImage}
              >
                Add Image
              </Button>
            </div>
            {images.map((_, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Image URL"
                  {...register(`images.${index}`)}
                  error={errors.images?.[index]?.message}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveImage(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            {initialData ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};