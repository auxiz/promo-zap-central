
const axios = require('axios');
const { getFullCredentials } = require('./credentials');
const { SHOPEE_API_BASE, extractShopeeUrls } = require('./utils');
const { makeDirectAuthRequest } = require('./directAuth');

// Function to convert a Shopee URL to an affiliate link using direct authentication
const convertToAffiliateLink = async (originalUrl) => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      console.error('[Shopee Affiliate] Missing credentials');
      return null;
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
    
    // Check response
    if (response && 
        response.response && 
        response.response.urls && 
        response.response.urls[0] && 
        response.response.urls[0].affiliate_link) {
      return response.response.urls[0].affiliate_link;
    }

    console.log('Unexpected response format:', response);
    return null;
  } catch (error) {
    console.error('Error converting to affiliate link:', error.message);
    console.error('Error details:', error.response?.data || error.message);
    return null;
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
