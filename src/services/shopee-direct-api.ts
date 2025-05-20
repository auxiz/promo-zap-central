
import axios from 'axios';
import { API_BASE } from '@/utils/api-constants';

// Define the endpoint for Shopee direct conversion
const SHOPEE_DIRECT_CONVERSION_ENDPOINT = `${API_BASE}/api/v1/shopee/convert-direct`;

export interface ShopeeDirectConversionRequest {
  appId: string;
  secretKey: string;
  originalUrl: string;
}

export interface ShopeeDirectConversionResponse {
  status: 'success' | 'error';
  affiliate_url?: string;
  original_url?: string;
  message?: string;
  details?: string;
}

/**
 * Converts a regular Shopee URL to an affiliate link using user-provided credentials
 * @param data Request data containing appId, secretKey and originalUrl
 * @returns Promise with the conversion result
 */
export const convertShopeeDirectLink = async (
  data: ShopeeDirectConversionRequest
): Promise<ShopeeDirectConversionResponse> => {
  try {
    const response = await axios.post<ShopeeDirectConversionResponse>(
      SHOPEE_DIRECT_CONVERSION_ENDPOINT,
      {
        app_id: data.appId,
        secret_key: data.secretKey,
        original_url: data.originalUrl
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error converting Shopee link with direct credentials:', error);
    
    // Extract error message if available
    let message = 'Falha ao converter link';
    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.message || message;
    }
    
    return {
      status: 'error',
      message
    };
  }
};
