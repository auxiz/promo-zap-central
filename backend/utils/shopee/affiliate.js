
const axios = require('axios');
const { getFullCredentials } = require('./credentials');
const { SHOPEE_API_BASE, generateSignature, extractShopeeUrls } = require('./utils');
const { ensureValidToken } = require('./oauth');

// Function to convert a Shopee URL to an affiliate link
const convertToAffiliateLink = async (originalUrl) => {
  try {
    // Ensure we have a valid token
    const tokenStatus = await ensureValidToken();
    if (!tokenStatus.success) {
      return null;
    }
    
    const credentials = getFullCredentials();
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(credentials.appId, 10);
    const endpoint = '/api/v2/affiliate/link_generate';
    console.log(`[Shopee Affiliate] Converting URL with timestamp: ${timestamp}`);

    // Generate signature
    const signature = generateSignature(
      endpoint, 
      partnerId, 
      timestamp, 
      credentials.accessToken,
      credentials.secretKey
    );

    // Prepare request body
    const requestBody = {
      requests: [{ url: originalUrl }]
    };

    const requestParams = {
      partner_id: partnerId,
      timestamp,
      sign: signature,
      access_token: credentials.accessToken
    };
    
    console.log(`[Shopee Affiliate] Convert URL request params:`, requestParams);
    console.log(`[Shopee Affiliate] Convert URL request body:`, JSON.stringify(requestBody));

    // Make API call
    const response = await axios({
      method: 'post',
      url: `${SHOPEE_API_BASE}/affiliate/link_generate`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': credentials.accessToken
      },
      params: requestParams,
      data: requestBody
    });

    console.log(`[Shopee Affiliate] Convert URL response:`, JSON.stringify(response.data));

    // Check response
    if (response.data && 
        response.data.error === '' && 
        response.data.response && 
        response.data.response.urls && 
        response.data.response.urls[0] && 
        response.data.response.urls[0].affiliate_link) {
      return response.data.response.urls[0].affiliate_link;
    }

    console.log('Unexpected response format:', response.data);
    return null;
  } catch (error) {
    console.error('Error converting to affiliate link:', error.message);
    console.error('Error details:', error.response?.data || error.message);
    return null;
  }
};

// Get affiliate performance data
const getAffiliatePerformance = async (start_date, end_date) => {
  try {
    // Ensure we have a valid token
    const tokenStatus = await ensureValidToken();
    if (!tokenStatus.success) {
      return { success: false, error: tokenStatus.error };
    }
    
    const credentials = getFullCredentials();
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(credentials.appId, 10);
    const endpoint = '/api/v2/affiliate/get_report';
    console.log(`[Shopee Affiliate] Getting performance data with timestamp: ${timestamp}`);
    
    // Generate signature
    const signature = generateSignature(
      endpoint, 
      partnerId, 
      timestamp, 
      credentials.accessToken,
      credentials.secretKey
    );
    
    const requestParams = {
      partner_id: partnerId,
      timestamp,
      sign: signature,
      access_token: credentials.accessToken,
      start_date,
      end_date
    };
    
    console.log(`[Shopee Affiliate] Get performance request params:`, requestParams);
    
    // Make API call
    const response = await axios({
      method: 'get',
      url: `${SHOPEE_API_BASE}/affiliate/get_report`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': credentials.accessToken
      },
      params: requestParams
    });
    
    console.log(`[Shopee Affiliate] Get performance response:`, JSON.stringify(response.data));
    
    if (response.data && response.data.error === '') {
      return { success: true, performance_data: response.data.response };
    } else {
      console.error('Error getting affiliate performance:', response.data);
      return { success: false, error: response.data.error || 'Failed to get affiliate performance' };
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
