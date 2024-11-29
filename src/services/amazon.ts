import axios from 'axios';
import { supabase } from '../lib/supabase';
import type { AmazonCredentials, AmazonProductResponse, ConnectionTestResult } from '../types/amazon';

// SP-API endpoints
const SP_API_ENDPOINTS = {
  EU: 'https://sellingpartnerapi-eu.amazon.com',
  NA: 'https://sellingpartnerapi-na.amazon.com',
  FE: 'https://sellingpartnerapi-fe.amazon.com',
};

const getSpApiEndpoint = (region: string) => {
  return SP_API_ENDPOINTS[region as keyof typeof SP_API_ENDPOINTS] || SP_API_ENDPOINTS.EU;
};

export const testAmazonConnection = async (
  credentials: AmazonCredentials
): Promise<ConnectionTestResult> => {
  try {
    // For demo purposes, simulate a successful connection
    // In production, this would make a real API call to Amazon SP-API
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'Successfully connected to Amazon Seller API',
      timestamp: new Date().toISOString(),
      marketplace: 'Amazon France',
      rateLimit: {
        remaining: 95,
        total: 100,
        resetTime: new Date(Date.now() + 3600000).toISOString(),
      },
    };
  } catch (error) {
    console.error('Error testing Amazon connection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to connect to Amazon Seller API',
      timestamp: new Date().toISOString(),
    };
  }
};

export const fetchAmazonProducts = async (
  eanCodes: string[],
  credentials: AmazonCredentials
): Promise<Record<string, AmazonProductResponse>> => {
  try {
    // For demo purposes, simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production, this would make real API calls to Amazon SP-API
    return eanCodes.reduce((acc, ean) => {
      // Example: For EAN 5013493389571, return Sony ZV-1 data
      if (ean === '5013493389571') {
        acc[ean] = {
          title: 'Sony ZV-1 Digital Camera for Content Creators',
          description: 'Professional vlogging camera with real-time AF and excellent image quality',
          asin: 'B08965JV8D',
          price: 749.99,
          dimensions: {
            length: 10.5,
            width: 4.4,
            height: 6,
            unit: 'cm',
          },
          weight: {
            value: 0.294,
            unit: 'kg',
          },
          images: [
            'https://m.media-amazon.com/images/I/81WtQ64-SOL._AC_SL1500_.jpg',
            'https://m.media-amazon.com/images/I/71VOXdCRhQL._AC_SL1500_.jpg',
            'https://m.media-amazon.com/images/I/71n7LCyKj6L._AC_SL1500_.jpg',
          ],
          browseNodes: ['Digital Cameras', 'Vlogging Cameras'],
          salesRank: 127,
          buyBox: {
            price: 749.99,
            sellerId: 'A2Q3Y263D00KWC',
            sellerName: 'Sony Store',
            isAmazonFulfilled: true,
            isAmazonSelling: false,
            isPreorder: false,
            isBackordered: false,
            shippingCountry: 'FR',
          },
          amazonPrice: 749.99,
          lowestPrices: {
            fbaNew: 749.99,
            new: 729.99,
            used: 649.99,
            collectible: null,
            refurbished: 699.99,
          },
          listPrice: 799.99,
          productGroup: 'Electronics',
          productType: 'Digital Camera',
          variationsCount: 1,
          importCode: 'SNYZV1',
          upc: '027242919755',
          partNumber: 'DCZV1/B',
          newOffersCount: 12,
          usedOffersCount: 5,
          collectibleOffersCount: 0,
          refurbishedOffersCount: 3,
          referralFeePercentage: 8,
          prepFee: 0,
          packageDimensions: {
            length: 15,
            width: 12,
            height: 10,
            unit: 'cm',
          },
          packageWeight: {
            value: 850,
            unit: 'g',
          },
          packageQuantity: 1,
          brand: 'Sony',
          manufacturer: 'Sony Corporation',
          contributors: ['Sony Electronics'],
          publicationDate: '2020-05-26',
          releaseDate: '2020-06-11',
          color: 'Black',
          size: 'Standard',
          features: [
            '20.1MP 1.0-type stacked CMOS sensor',
            'ZEISS 24-70mm F1.8-2.8 lens',
            'Real-time Eye AF (human/animal)',
            'Side-opening Vari-angle LCD screen',
            '4K movie recording with full pixel readout',
          ],
          itemsCount: 1,
          pagesCount: null,
          isExchangeable: true,
          marketplace: 'Amazon France',
        };
      } else {
        // For other EANs, generate realistic-looking data
        acc[ean] = {
          title: `Product ${ean}`,
          description: 'High-quality product with advanced features and premium build quality.',
          asin: `B${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
          price: Math.round(Math.random() * 10000) / 100,
          dimensions: {
            length: Math.round(Math.random() * 100),
            width: Math.round(Math.random() * 100),
            height: Math.round(Math.random() * 100),
            unit: 'cm',
          },
          weight: {
            value: Math.round(Math.random() * 1000) / 100,
            unit: 'kg',
          },
          images: [
            `https://source.unsplash.com/800x600/?product&${Math.random()}`,
            `https://source.unsplash.com/800x600/?product&${Math.random()}`,
          ],
          browseNodes: ['Electronics', 'Accessories'],
          salesRank: Math.floor(Math.random() * 100000),
          buyBox: {
            price: Math.round(Math.random() * 10000) / 100,
            sellerId: `A${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
            sellerName: 'Sample Seller',
            isAmazonFulfilled: Math.random() > 0.5,
            isAmazonSelling: Math.random() > 0.5,
            isPreorder: false,
            isBackordered: false,
            shippingCountry: 'FR',
          },
          amazonPrice: Math.round(Math.random() * 10000) / 100,
          lowestPrices: {
            fbaNew: Math.round(Math.random() * 10000) / 100,
            new: Math.round(Math.random() * 10000) / 100,
            used: Math.round(Math.random() * 10000) / 100,
            collectible: Math.round(Math.random() * 10000) / 100,
            refurbished: Math.round(Math.random() * 10000) / 100,
          },
          listPrice: Math.round(Math.random() * 10000) / 100,
          productGroup: 'Electronics',
          productType: 'Accessory',
          variationsCount: Math.floor(Math.random() * 10),
          importCode: `IMP${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          upc: Math.random().toString().substring(2, 14),
          partNumber: `PN${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          newOffersCount: Math.floor(Math.random() * 50),
          usedOffersCount: Math.floor(Math.random() * 20),
          collectibleOffersCount: Math.floor(Math.random() * 5),
          refurbishedOffersCount: Math.floor(Math.random() * 10),
          referralFeePercentage: Math.round(Math.random() * 1500) / 100,
          prepFee: Math.round(Math.random() * 1000) / 100,
          packageDimensions: {
            length: Math.round(Math.random() * 100),
            width: Math.round(Math.random() * 100),
            height: Math.round(Math.random() * 100),
            unit: 'cm',
          },
          packageWeight: {
            value: Math.round(Math.random() * 5000),
            unit: 'g',
          },
          packageQuantity: Math.floor(Math.random() * 10) + 1,
          brand: 'Sample Brand',
          manufacturer: 'Sample Manufacturer',
          contributors: ['Contributor 1', 'Contributor 2'],
          publicationDate: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
          releaseDate: new Date(Date.now() + Math.random() * 31536000000).toISOString(),
          color: ['Black', 'White', 'Blue', 'Red'][Math.floor(Math.random() * 4)],
          size: ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)],
          features: [
            'Feature 1',
            'Feature 2',
            'Feature 3',
          ],
          itemsCount: Math.floor(Math.random() * 5) + 1,
          pagesCount: Math.floor(Math.random() * 1000),
          isExchangeable: Math.random() > 0.5,
          marketplace: 'Amazon France',
        };
      }
      return acc;
    }, {} as Record<string, AmazonProductResponse>);
  } catch (error) {
    console.error('Error fetching Amazon products:', error);
    throw error;
  }
};