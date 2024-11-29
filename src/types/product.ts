import { z } from 'zod';

export interface Product {
  id: string;
  title: string;
  description: string;
  eanCode: string;
  asin?: string;
  category?: string;
  price: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  weight: {
    value: number;
    unit: 'kg' | 'lb';
  };
  images?: string[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  // Amazon specific fields
  browseNodes?: string[];
  salesRank?: number;
  buyBox?: {
    price?: number;
    sellerId?: string;
    sellerName?: string;
    isAmazonFulfilled?: boolean;
    isAmazonSelling?: boolean;
    isPreorder?: boolean;
    isBackordered?: boolean;
    shippingCountry?: string;
  };
  amazonPrice?: number;
  lowestPrices?: {
    fbaNew?: number;
    new?: number;
    used?: number;
    collectible?: number;
    refurbished?: number;
  };
  listPrice?: number;
  productGroup?: string;
  productType?: string;
}

export const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  eanCode: z.string().regex(/^\d{13}$/, 'EAN code must be 13 digits'),
  asin: z.string().optional(),
  category: z.string().optional(),
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

export interface ProductFilters {
  search?: string;
  status?: Product['status'];
  category?: string;
  sortBy?: keyof Product;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}