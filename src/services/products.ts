import { supabase } from '../lib/supabase';
import type { Product, ProductFilters } from '../types/product';

export const getProducts = async (filters: ProductFilters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,ean_code.ilike.%${filters.search}%`);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.sortBy) {
      query = query.order(filters.sortBy, {
        ascending: filters.sortOrder === 'asc',
      });
    } else {
      // Default sorting by created_at desc
      query = query.order('created_at', { ascending: false });
    }

    // Get total count first
    const { count } = await query;
    const totalCount = count || 0;

    // Calculate pagination
    const limit = filters.limit || 25;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const page = Math.min(Math.max(1, filters.page || 1), totalPages);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get paginated data
    const { data, error } = await query
      .range(from, to);

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return {
      data: data?.map(transformProductFromDB) || [],
      total: totalCount,
      page,
      totalPages,
      limit,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if product exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('ean_code', product.eanCode)
      .single();

    if (existingProduct) {
      // If product exists, update it instead
      const { data, error } = await supabase
        .from('products')
        .update({
          ...transformProductToDB(product),
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProduct.id)
        .select()
        .single();

      if (error) throw error;
      return transformProductFromDB(data);
    }

    // Create new product
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...transformProductToDB(product),
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return transformProductFromDB(data);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        ...transformProductToDB(product),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return transformProductFromDB(data);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
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

const transformProductToDB = (product: Partial<Product>) => ({
  title: product.title,
  description: product.description,
  ean_code: product.eanCode,
  asin: product.asin,
  category: product.category,
  price: product.price,
  dimensions: product.dimensions,
  weight: product.weight,
  images: product.images,
  status: product.status,
  browse_nodes: product.browseNodes,
  sales_rank: product.salesRank,
  buy_box: product.buyBox,
  amazon_price: product.amazonPrice,
  lowest_prices: product.lowestPrices,
  list_price: product.listPrice,
  product_group: product.productGroup,
  product_type: product.productType,
});