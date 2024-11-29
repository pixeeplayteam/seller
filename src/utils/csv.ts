import { Product } from '../types/product';
import { supabase } from '../lib/supabase';

export const exportToCSV = async (products: Product[], selectedOnly = false) => {
  try {
    // If no products provided, fetch all products
    if (products.length === 0) {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      products = data.map(transformProductFromDB);
    }

    const headers = [
      'EAN',
      'ASIN',
      'Title',
      'Description',
      'Price',
      'Status',
      'Category',
      'Sales Rank',
      'Buy Box Price',
      'Buy Box Seller',
      'Amazon Price',
      'FBA New Price',
      'New Price',
      'Used Price',
      'List Price',
      'Product Group',
      'Product Type',
    ];

    const rows = products.map(product => [
      product.eanCode,
      product.asin || '',
      product.title,
      product.description,
      product.price,
      product.status,
      product.category || '',
      product.salesRank || '',
      product.buyBox?.price || '',
      product.buyBox?.sellerName || '',
      product.amazonPrice || '',
      product.lowestPrices?.fbaNew || '',
      product.lowestPrices?.new || '',
      product.lowestPrices?.used || '',
      product.listPrice || '',
      product.productGroup || '',
      product.productType || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting products:', error);
    throw error;
  }
};

const transformProductFromDB = (dbProduct: any): Product => ({
  id: dbProduct.id,
  title: dbProduct.title,
  description: dbProduct.description,
  eanCode: dbProduct.ean_code,
  asin: dbProduct.asin,
  category: dbProduct.category,
  price: parseFloat(dbProduct.price),
  dimensions: dbProduct.dimensions,
  weight: dbProduct.weight,
  images: dbProduct.images || [],
  status: dbProduct.status,
  browseNodes: dbProduct.browse_nodes || [],
  salesRank: dbProduct.sales_rank,
  buyBox: dbProduct.buy_box,
  amazonPrice: dbProduct.amazon_price ? parseFloat(dbProduct.amazon_price) : undefined,
  lowestPrices: dbProduct.lowest_prices,
  listPrice: dbProduct.list_price ? parseFloat(dbProduct.list_price) : undefined,
  productGroup: dbProduct.product_group,
  productType: dbProduct.product_type,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at,
});