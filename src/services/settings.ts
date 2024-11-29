import { supabase } from '../lib/supabase';
import type { AmazonCredentials } from '../types/amazon';

export const saveAmazonCredentials = async (credentials: AmazonCredentials) => {
  const { data, error } = await supabase
    .from('amazon_credentials')
    .upsert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      access_key: credentials.accessKey,
      secret_key: credentials.secretKey,
      region: credentials.region,
      marketplace_id: credentials.marketplaceId,
      merchant_id: credentials.merchantId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getAmazonCredentials = async () => {
  const { data, error } = await supabase
    .from('amazon_credentials')
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    accessKey: data.access_key,
    secretKey: data.secret_key,
    region: data.region,
    marketplaceId: data.marketplace_id,
    merchantId: data.merchant_id,
  };
};