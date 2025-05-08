
import axios from 'axios';
import { SHOPEE_API_BASE_URL } from '@/utils/api-constants';

interface LinkConversionRequest {
  original_url: string;
}

interface LinkConversionResponse {
  status: 'success' | 'error';
  affiliate_url?: string;
  original_url?: string;
  source?: 'alternative' | 'graphql';
  message?: string;
  details?: string;
}

/**
 * Converts a regular Shopee URL to an affiliate link
 * @param url The original Shopee URL to convert
 * @returns Promise with the conversion result
 */
export const convertShopeeLink = async (url: string): Promise<LinkConversionResponse> => {
  try {
    const response = await axios.post<LinkConversionResponse>(
      `${SHOPEE_API_BASE_URL}/convert-link`,
      { original_url: url }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error converting Shopee link:', error);
    
    // Extract error message if available
    let message = 'Failed to convert link';
    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.message || message;
    }
    
    return {
      status: 'error',
      message,
    };
  }
};
