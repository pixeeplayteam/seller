import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductTable } from '../components/products/ProductTable';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductDetail } from '../components/products/ProductDetail';
import { ProductForm } from '../components/products/ProductForm';
import { EANImport } from '../components/ean/EANImport';
import { AmazonFetchButton } from '../components/products/AmazonFetchButton';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Button } from '../components/ui/Button';
import { Plus, Upload } from 'lucide-react';
import { createProduct, updateProduct, deleteProduct } from '../services/products';
import { fetchAmazonProducts } from '../services/amazon';
import { getAmazonCredentials } from '../services/settings';
import type { Product, ProductFilters as ProductFiltersType } from '../types/product';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 25,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEANImportOpen, setIsEANImportOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isDeleteSelectedOpen, setIsDeleteSelectedOpen] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
      setIsFormOpen(false);
    },
    onError: () => {
      toast.error('Failed to create product');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
      setIsFormOpen(false);
      setProductToEdit(null);
    },
    onError: () => {
      toast.error('Failed to update product');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
      setProductToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });

  const deleteSelectedMutation = useMutation({
    mutationFn: async (products: Product[]) => {
      await Promise.all(products.map(product => deleteProduct(product.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Selected products deleted successfully');
      setSelectedProducts([]);
      setIsDeleteSelectedOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete selected products');
    },
  });

  const amazonFetchMutation = useMutation({
    mutationFn: async (products: Product[]) => {
      const credentials = await getAmazonCredentials();
      let processedCount = 0;
      const results = [];

      for (const product of products) {
        try {
          const amazonData = await fetchAmazonProducts([product.eanCode], credentials);
          const productData = amazonData[product.eanCode];

          if (productData) {
            const updatedProduct = {
              ...product,
              asin: productData.asin,
              title: productData.title,
              description: productData.description,
              images: productData.images,
              browseNodes: productData.browseNodes,
              salesRank: productData.salesRank,
              buyBox: productData.buyBox,
              amazonPrice: productData.amazonPrice,
              lowestPrices: productData.lowestPrices,
              listPrice: productData.listPrice,
              productGroup: productData.productGroup,
              productType: productData.productType,
              status: 'active' as const,
            };

            await updateProduct(product.id, updatedProduct);
            results.push(updatedProduct);
          }

          processedCount++;
          setFetchProgress((processedCount / products.length) * 100);
        } catch (error) {
          console.error(`Error fetching data for product ${product.eanCode}:`, error);
          toast.error(`Failed to fetch data for ${product.eanCode}`);
        }
      }

      return results;
    },
    onSuccess: (updatedProducts) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Successfully updated ${updatedProducts.length} products`);
      setSelectedProducts([]);
      setFetchProgress(0);
    },
    onError: (error) => {
      toast.error('Failed to fetch Amazon data');
      setFetchProgress(0);
    },
  });

  const handleFormSubmit = (data: Partial<Product>) => {
    if (productToEdit) {
      updateProductMutation.mutate({ id: productToEdit.id, data });
    } else {
      createProductMutation.mutate(data as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.length > 0) {
      setIsDeleteSelectedOpen(true);
    }
  };

  const handleConfirmDeleteSelected = () => {
    deleteSelectedMutation.mutate(selectedProducts);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <div className="flex space-x-3">
          <AmazonFetchButton
            onFetch={() => amazonFetchMutation.mutate(selectedProducts)}
            isLoading={amazonFetchMutation.isPending}
            selectedProducts={selectedProducts}
            progress={fetchProgress}
          />
          <Button
            variant="outline"
            onClick={() => setIsEANImportOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import EAN Codes
          </Button>
          <Button
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      <ProductFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      <div className="bg-white shadow rounded-lg">
        <ProductTable
          filters={filters}
          onViewProduct={setSelectedProduct}
          onEditProduct={(product) => {
            setProductToEdit(product);
            setIsFormOpen(true);
          }}
          onDeleteProduct={setProductToDelete}
          selectedProducts={selectedProducts}
          onProductSelect={(product) => {
            setSelectedProducts(prev => {
              const isSelected = prev.some(p => p.id === product.id);
              return isSelected
                ? prev.filter(p => p.id !== product.id)
                : [...prev, product];
            });
          }}
          onSelectAll={setSelectedProducts}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setProductToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={productToEdit}
        isLoading={createProductMutation.isPending || updateProductMutation.isPending}
      />

      <EANImport
        isOpen={isEANImportOpen}
        onClose={() => setIsEANImportOpen(false)}
      />

      <ConfirmationDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) {
            deleteProductMutation.mutate(productToDelete.id);
          }
        }}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteProductMutation.isPending}
      />

      <ConfirmationDialog
        isOpen={isDeleteSelectedOpen}
        onClose={() => setIsDeleteSelectedOpen(false)}
        onConfirm={handleConfirmDeleteSelected}
        title="Delete Selected Products"
        message={`Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`}
        confirmLabel="Delete All"
        isLoading={deleteSelectedMutation.isPending}
      />
    </div>
  );
};