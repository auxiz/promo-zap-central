
const axios = require('axios');
const { getFullCredentials } = require('./credentials');
const { SHOPEE_API_BASE, extractShopeeUrls } = require('./utils');
const { makeDirectAuthRequest } = require('./directAuth');
const { trackShopeeError } = require('../../whatsapp/services/errorTracker');

// Function to convert a Shopee URL to an affiliate link using direct authentication
const convertToAffiliateLink = async (originalUrl) => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      console.error('[Shopee Affiliate] Missing credentials');
      return { error: 'Missing Shopee API credentials' };
    }
    
    console.log(`[Shopee Affiliate] Converting URL: ${originalUrl}`);
    
    // Prepare request body
    const requestBody = {
      requests: [{ url: originalUrl }]
    };
    
    // Make the API request using direct authentication
    const response = await makeDirectAuthRequest(
      'post', 
      '/affiliate/link_generate', 
      requestBody
    );
    
    // Check if the response is valid
    if (!response || response.error) {
      console.error('[Shopee Affiliate] API Error:', response?.error || 'Unknown error');
      return { 
        error: response?.error || 'API returned an error',
        message: response?.message || 'Failed to convert link'
      };
    }
    
    // Check response structure
    if (response.response && 
        response.response.urls && 
        response.response.urls[0] && 
        response.response.urls[0].affiliate_link) {
      return {
        affiliateUrl: response.response.urls[0].affiliate_link,
        originalUrl: originalUrl,
        success: true
      };
    }

    console.log('Unexpected response format:', JSON.stringify(response));
    
    return { 
      error: 'Invalid response format from API',
      message: 'The API returned data in an unexpected format'
    };
  } catch (error) {
    console.error('Error converting to affiliate link:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      
      // Check if the response is HTML instead of JSON
      const contentType = error.response.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        console.error('Received HTML response instead of JSON');
        trackShopeeError('CONVERSION', 'Received HTML instead of JSON', error);
        return { 
          error: 'Received HTML response instead of JSON',
          message: 'The API returned an HTML page instead of the expected JSON response'
        };
      }
      
      // Log detailed error data for debugging
      if (error.response.data) {
        console.error('Error response data:', error.response.data);
      }
    }
    
    // Track the error for monitoring
    trackShopeeError('CONVERSION', error.message, error);
    
    return { 
      error: error.message,
      message: 'Failed to convert link'
    };
  }
};

// Get affiliate performance data using direct authentication
const getAffiliatePerformance = async (start_date, end_date) => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      return { success: false, error: 'Missing Shopee API credentials' };
    }
    
    console.log(`[Shopee Affiliate] Getting performance data for ${start_date} to ${end_date}`);
    
    // Make the API request using direct authentication with additional query parameters
    const response = await makeDirectAuthRequest(
      'get', 
      '/affiliate/get_report', 
      null, 
      { start_date, end_date }
    );
    
    if (response && response.response) {
      return { success: true, performance_data: response.response };
    } else {
      console.error('Error getting affiliate performance:', response);
      return { 
        success: false, 
        error: response?.error || 'Failed to get affiliate performance' 
      };
    }
  } catch (error) {
    console.error('Error getting affiliate performance:', error.message);
    
    // Track the error
    trackShopeeError('PERFORMANCE', 'Failed to get performance data', error);
    
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
  convertToAffiliateLink,
  getAffiliatePerformance,
  extractShopeeUrls
};
