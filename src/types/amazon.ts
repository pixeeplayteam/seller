export interface AmazonCredentials {
  accessKey: string;
  secretKey: string;
  region: string;
  marketplaceId: string;
  merchantId: string;
}

export type AmazonRegion = 
  | 'NA' // North America
  | 'EU' // Europe
  | 'FE' // Far East
  | 'OCE'; // Oceania

export interface AmazonMarketplace {
  id: string;
  name: string;
  countryCode: string;
  region: AmazonRegion;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  timestamp: string;
  marketplace?: string;
  rateLimit?: {
    remaining: number;
    total: number;
    resetTime: string;
  };
}

export interface AmazonProductResponse {
  title: string;
  description: string;
  asin: string;
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
  images: string[];
  browseNodes: string[];
  salesRank: number;
  buyBox: {
    price: number;
    sellerId: string;
    sellerName: string;
    isAmazonFulfilled: boolean;
    isAmazonSelling: boolean;
    isPreorder: boolean;
    isBackordered: boolean;
    shippingCountry: string;
  };
  amazonPrice: number;
  lowestPrices: {
    fbaNew: number;
    new: number;
    used: number;
    collectible: number;
    refurbished: number;
  };
  listPrice: number;
  productGroup: string;
  productType: string;
  variationsCount: number;
  importCode: string;
  upc: string;
  partNumber: string;
  newOffersCount: number;
  usedOffersCount: number;
  collectibleOffersCount: number;
  refurbishedOffersCount: number;
  referralFeePercentage: number;
  prepFee: number;
  packageDimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm';
  };
  packageWeight: {
    value: number;
    unit: 'g';
  };
  packageQuantity: number;
  brand: string;
  manufacturer: string;
  contributors: string[];
  publicationDate: string;
  releaseDate: string;
  color: string;
  size: string;
  features: string[];
  itemsCount: number;
  pagesCount: number;
  isExchangeable: boolean;
  marketplace: string;
}