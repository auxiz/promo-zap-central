
const axios = require('axios');
const { getFullCredentials } = require('../credentials');
const { formatApiError } = require('../utils');

// Alternative API for temporary use
const ALTERNATIVE_API_URL = 'https://api-hook.diade.shop/webhook/amazonadmin';

/**
 * Convert a Shopee URL to an affiliate link using the alternative API
 * 
 * @param {string} productUrl - Original Shopee product URL
 * @returns {Object} Object containing success status and affiliate URL
 */
const convertUsingAlternativeApi = async (productUrl) => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      return { error: 'Missing API credentials' };
    }
    
    console.log('[Alternative API] Converting URL:', productUrl);
    
    // Make the API request to the alternative service
    const response = await axios({
      url: ALTERNATIVE_API_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        app_id: credentials.appId,
        secret_key: credentials.secretKey,
        product_url: productUrl
      },
      validateStatus: function (status) {
        // Consider all status codes as resolved to handle them properly
        return true;
      }
    });
    
    // Check if the response is HTML (error page) instead of JSON
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('[Alternative API] Received HTML response instead of JSON');
      return {
        error: 'Received HTML response',
        message: 'The API returned an HTML page instead of JSON. This might indicate an issue with the API endpoint.',
        status: response.status,
        isHtml: true
      };
    }
    
    // Handle error status codes
    if (response.status >= 400) {
      console.error(`[Alternative API] Error: ${response.status}`, response.data);
      return {
        error: `API Error: ${response.status}`,
        message: response.data?.message || 'An error occurred with the API request',
        status: response.status,
        data: response.data
      };
    }
    
    console.log('[Alternative API] Response:', response.data);
    
    // Extract the affiliate link from the response
    const affiliateUrl = response.data?.affiliate_url || response.data?.data?.affiliate_url;
    
    if (!affiliateUrl) {
      return {
        error: 'No affiliate URL in response',
        message: 'The API did not return an affiliate URL',
        data: response.data
      };
    }
    
    return {
      success: true,
      affiliateUrl: affiliateUrl,
      originalUrl: productUrl,
      data: response.data
    };
  } catch (error) {
    console.error('[Alternative API] Request error:', error.message);
    return formatApiError(error);
  }
};

module.exports = {
  convertUsingAlternativeApi,
  ALTERNATIVE_API_URL
};
