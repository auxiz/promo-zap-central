
import axios from 'axios';
import { SHOPEE_API_BASE_URL } from '@/utils/api-constants';

export interface ShopeeOffer {
  name: string;
  url: string;
  imageUrl: string;
  price: number;
  discountPrice: number;
  startTime: string;
  endTime: string;
}

export interface ShopeeOffersRequest {
  appId: string;
  secretKey: string;
  page?: number;
  limit?: number;
}

export interface ShopeeOffersResponse {
  status: 'success' | 'error';
  total?: number;
  offers?: ShopeeOffer[];
  page?: number;
  limit?: number;
  message?: string;
  details?: string;
}

/**
 * Fetches available Shopee offers using provided credentials
 * @param credentials API credentials and pagination options
 * @returns Promise with the offers result
 */
export const fetchShopeeOffers = async (
  credentials: ShopeeOffersRequest
): Promise<ShopeeOffersResponse> => {
  try {
    const { appId, secretKey, page = 1, limit = 10 } = credentials;
    
    const response = await axios.post<ShopeeOffersResponse>(
      `${SHOPEE_API_BASE_URL}/offers?page=${page}&limit=${limit}`,
      { 
        app_id: appId,
        secret_key: secretKey
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Shopee offers:', error);
    
    // Extract error message if available
    let message = 'Failed to fetch offers';
    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.message || message;
    }
    
    return {
      status: 'error',
      message,
    };
  }
};
