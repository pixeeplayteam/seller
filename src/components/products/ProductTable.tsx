import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';
import { getProducts } from '../../services/products';
import type { Product, ProductFilters } from '../../types/product';

interface ProductTableProps {
  filters: ProductFilters;
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  selectedProducts: Product[];
  onProductSelect: (product: Product) => void;
  onSelectAll: (products: Product[]) => void;
  onDeleteSelected: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  filters,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  selectedProducts,
  onProductSelect,
  onSelectAll,
  onDeleteSelected,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-600">No products found</p>
      </div>
    );
  }

  const handleSelectAll = () => {
    if (data.data.length === selectedProducts.length) {
      onSelectAll([]);
    } else {
      onSelectAll(data.data);
    }
  };

  return (
    <div>
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 p-4 mb-4 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {selectedProducts.length} products selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteSelected}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={data.data.length === selectedProducts.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EAN Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.data.map((product) => (
              <tr key={product.id} className={selectedProducts.some(p => p.id === product.id) ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedProducts.some(p => p.id === product.id)}
                    onChange={() => onProductSelect(product)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {product.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{product.eanCode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{product.category || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {product.price.toFixed(2)} €
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${product.status === 'active' ? 'bg-green-100 text-green-800' : 
                      product.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProduct(product)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteProduct(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            className="rounded border-gray-300 text-sm"
            value={filters.limit}
            onChange={(e) => filters.limit = Number(e.target.value)}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-sm text-gray-700">entries</span>
        </div>

        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          onPageChange={(page) => filters.page = page}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};