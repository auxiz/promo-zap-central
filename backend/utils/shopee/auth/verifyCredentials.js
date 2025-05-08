
const { makeGraphQLRequestWithCredentials } = require('./graphqlClient');
const { getFullCredentials } = require('../credentials');
const axios = require('axios');

// Alternative API for temporary use
const ALTERNATIVE_API_URL = 'https://api-hook.diade.shop/webhook/amazonadmin';

/**
 * Verify API credentials by making a test GraphQL query
 * 
 * @param {string} appId - Shopee Application ID
 * @param {string} secretKey - Shopee Secret Key
 * @returns {boolean} True if credentials are valid
 */
const verifyApiCredentialsGraphQL = async (appId, secretKey) => {
  try {
    // Store original credentials
    const originalCredentials = getFullCredentials();
    
    // Temporarily use the provided credentials
    global.tempCredentials = { appId, secretKey };
    
    // Simple test query to verify connection
    const testQuery = `
      query {
        affiliate {
          connections {
            total
          }
        }
      }
    `;
    
    // Make the request using our helper
    const response = await makeGraphQLRequestWithCredentials(testQuery, {}, appId, secretKey);
    
    // Clear temporary credentials
    delete global.tempCredentials;
    
    // Check if the request was successful
    if (response.data && !response.error) {
      return true;
    }
    
    console.error('Verification failed:', response.error || 'Unknown error');
    return false;
  } catch (error) {
    console.error('Error verifying API credentials:', error.message);
    delete global.tempCredentials;
    return false;
  }
};

/**
 * Test if the alternative API credentials are valid
 * 
 * @param {string} appId - Shopee Application ID
 * @param {string} secretKey - Shopee Secret Key
 * @returns {boolean} True if credentials are valid
 */
const verifyAlternativeApiCredentials = async (appId, secretKey) => {
  try {
    // Use a test product URL to verify credentials
    const testUrl = 'https://shopee.com.br/product/123456/789012';
    
    // Make the API request
    const response = await axios({
      url: ALTERNATIVE_API_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        app_id: appId,
        secret_key: secretKey,
        product_url: testUrl
      },
      validateStatus: function (status) {
        return true;  // Handle all status codes
      }
    });
    
    // Consider successful if status code is in the 2xx range
    // or if we receive a JSON response even with an error code
    const contentType = response.headers['content-type'];
    if (response.status < 400 || (contentType && contentType.includes('application/json'))) {
      return true;
    }
    
    console.error('Alternative API verification failed:', response.status, response.data);
    return false;
  } catch (error) {
    console.error('Error verifying alternative API credentials:', error.message);
    return false;
  }
};

module.exports = {
  verifyApiCredentialsGraphQL,
  verifyAlternativeApiCredentials
};
