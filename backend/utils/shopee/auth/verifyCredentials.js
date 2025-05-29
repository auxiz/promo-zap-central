
const { makeShopeeGraphQLRequest } = require('./shopeeGraphQLClient');
const { getFullCredentials } = require('../credentials');
const axios = require('axios');
const logger = require('../../../utils/logger');

// Alternative API for fallback
const ALTERNATIVE_API_URL = 'https://api-hook.diade.shop/webhook/amazonadmin';

/**
 * Verify API credentials by making a simple test GraphQL query
 * 
 * @param {string} appId - Shopee Application ID
 * @param {string} secretKey - Shopee Secret Key
 * @returns {boolean} True if credentials are valid
 */
const verifyApiCredentialsGraphQL = async (appId, secretKey) => {
  try {
    logger.info('[Shopee Verify] Starting credential verification');
    
    // Use a very simple test query to minimize chances of errors
    const testQuery = `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `;
    
    // Make the request using our helper with shorter timeout for verification
    const response = await makeShopeeGraphQLRequest(
      testQuery, 
      {}, 
      appId, 
      secretKey,
      { 
        timeout: 10000, // 10 second timeout for verification
        maxRetries: 1   // Only 1 retry for verification
      }
    );
    
    logger.debug('[Shopee Verify] Verification response:', response);
    
    // Check if the request was successful
    if (response && !response.error) {
      // Check for GraphQL-specific success indicators
      if (response.data || response.__schema || (response.errors && response.errors.length === 0)) {
        logger.info('[Shopee Verify] Credentials verified successfully');
        return true;
      }
    }
    
    // If we get a 401 or authentication error, credentials are definitely wrong
    if (response && (response.status === 401 || response.status === 403)) {
      logger.warn('[Shopee Verify] Authentication failed - invalid credentials');
      return false;
    }
    
    // For other errors, we can't be sure if it's credential or API issue
    logger.warn('[Shopee Verify] Verification failed:', response.error || 'Unknown error');
    
    // Try alternative verification method - simple introspection query
    const simpleQuery = `{ __type(name: "Query") { name } }`;
    const simpleResponse = await makeShopeeGraphQLRequest(
      simpleQuery, 
      {}, 
      appId, 
      secretKey,
      { timeout: 5000, maxRetries: 0 }
    );
    
    if (simpleResponse && !simpleResponse.error) {
      logger.info('[Shopee Verify] Simple verification successful');
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('[Shopee Verify] Error verifying API credentials:', error.message);
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
    logger.info('[Shopee Alternative] Testing alternative API credentials');
    
    // Use a test product URL to verify credentials
    const testUrl = 'https://shopee.com.br/product/123456/789012';
    
    // Make the API request with timeout
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
      timeout: 10000, // 10 second timeout
      validateStatus: function (status) {
        return true;  // Handle all status codes
      }
    });
    
    logger.debug('[Shopee Alternative] Response status:', response.status);
    
    // Consider successful if status code is in the 2xx range
    // or if we receive a JSON response even with an error code
    const contentType = response.headers['content-type'];
    if (response.status < 400 || (contentType && contentType.includes('application/json'))) {
      logger.info('[Shopee Alternative] Alternative API verification successful');
      return true;
    }
    
    logger.warn('[Shopee Alternative] Alternative API verification failed:', response.status, response.data);
    return false;
  } catch (error) {
    logger.error('[Shopee Alternative] Error verifying alternative API credentials:', error.message);
    return false;
  }
};

module.exports = {
  verifyApiCredentialsGraphQL,
  verifyAlternativeApiCredentials
};
