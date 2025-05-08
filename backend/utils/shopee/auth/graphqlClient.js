
const axios = require('axios');
const { generateSignature } = require('./signature');
const { getFullCredentials } = require('../credentials');
const { formatApiError } = require('../utils');

// GraphQL API base URL for Shopee Affiliate
const SHOPEE_GRAPHQL_API = 'https://open-api.affiliate.shopee.com.br/graphql';

/**
 * Make a direct authenticated GraphQL request to Shopee API
 * 
 * @param {string} query - GraphQL query string
 * @param {Object} variables - GraphQL variables (optional)
 * @returns {Object} Response data or error object
 */
const makeGraphQLRequest = async (query, variables = {}) => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      return { error: 'Missing Shopee API credentials' };
    }
    
    // Create request body
    const requestBody = JSON.stringify({
      query,
      variables
    });
    
    // Generate timestamp (seconds since epoch)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Generate signature
    const signature = generateSignature(
      credentials.appId,
      timestamp,
      requestBody,
      credentials.secretKey
    );
    
    // Create authorization header
    const authHeader = `SHA256 Credential=${credentials.appId}, Timestamp=${timestamp}, Signature=${signature}`;
    
    console.log('[Shopee GraphQL] Making request to:', SHOPEE_GRAPHQL_API);
    
    // Make the API request
    const response = await axios({
      url: SHOPEE_GRAPHQL_API,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      data: requestBody,
      validateStatus: function (status) {
        // Consider all status codes as resolved to handle them properly
        return true;
      }
    });
    
    // Check if the response is HTML (error page) instead of JSON
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('[Shopee GraphQL] Received HTML response instead of JSON');
      return {
        error: 'Received HTML response',
        message: 'The API returned an HTML page instead of JSON. This might indicate an issue with the API endpoint.',
        status: response.status,
        isHtml: true
      };
    }
    
    // Handle error status codes
    if (response.status >= 400) {
      console.error(`[Shopee GraphQL] API Error: ${response.status}`, response.data);
      return {
        error: `API Error: ${response.status}`,
        message: response.data?.message || 'An error occurred with the API request',
        status: response.status,
        data: response.data
      };
    }
    
    // Return the successful response data
    return response.data;
  } catch (error) {
    console.error('[Shopee GraphQL] Request error:', error.message);
    return formatApiError(error);
  }
};

/**
 * Make GraphQL request with specific credentials (used for testing)
 * 
 * @param {string} query - GraphQL query string
 * @param {Object} variables - GraphQL variables
 * @param {string} appId - Shopee Application ID
 * @param {string} secretKey - Shopee Secret Key
 * @returns {Object} Response data or error object
 */
const makeGraphQLRequestWithCredentials = async (query, variables = {}, appId, secretKey) => {
  try {
    // Create request body
    const requestBody = JSON.stringify({
      query,
      variables
    });
    
    // Generate timestamp (seconds since epoch)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Generate signature
    const signature = generateSignature(appId, timestamp, requestBody, secretKey);
    
    // Create authorization header
    const authHeader = `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`;
    
    // Make the API request
    const response = await axios({
      url: SHOPEE_GRAPHQL_API,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      data: requestBody,
      validateStatus: function (status) {
        return true;  // Handle all status codes in the then clause
      }
    });
    
    // Check response content type
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      return {
        error: 'Received HTML response',
        message: 'The API returned an HTML page instead of JSON.',
        status: response.status
      };
    }
    
    if (response.status >= 400) {
      return {
        error: `API Error: ${response.status}`,
        message: response.data?.message || 'An error occurred with the API request',
        status: response.status,
        data: response.data
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error making GraphQL request with credentials:', error.message);
    return formatApiError(error);
  }
};

module.exports = {
  makeGraphQLRequest,
  makeGraphQLRequestWithCredentials,
  SHOPEE_GRAPHQL_API
};
