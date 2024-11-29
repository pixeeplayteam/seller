import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { productCategories } from '../../data/categories';
import type { ProductFilters } from '../../types/product';

interface ProductFiltersProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          type="text"
          placeholder="Search products..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
        <select
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value as ProductFilters['status'] })}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        <select
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {productCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={() => onFilterChange({ search: '', status: undefined, category: undefined })}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};