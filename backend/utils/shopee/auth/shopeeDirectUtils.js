
const crypto = require('crypto');
const axios = require('axios');
const logger = require('../../../utils/logger');

// Shopee GraphQL API endpoint
const SHOPEE_GRAPHQL_API = 'https://open-api.affiliate.shopee.com.br/graphql';

/**
 * Generate HMAC-SHA256 signature for Shopee API
 * 
 * @param {string} appId - Shopee Application ID
 * @param {string} timestamp - Request timestamp in seconds
 * @param {string} bodyJson - JSON request body
 * @param {string} secretKey - Shopee Secret Key 
 * @returns {string} HMAC-SHA256 signature
 */
const generateDirectSignature = (appId, timestamp, bodyJson, secretKey) => {
  const stringToSign = `${appId}${timestamp}${bodyJson}${secretKey}`;
  return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex');
};

/**
 * Format error response consistently
 * @param {Error} error - The error object
 * @returns {Object} Formatted error object
 */
const formatDirectApiError = (error) => {
  if (error.response && error.response.data) {
    return {
      error: error.response.data.error || 'API Error',
      message: error.response.data.message || error.message,
      status: error.response.status
    };
  }
  
  return {
    error: 'Request Error',
    message: error.message,
    status: 500
  };
};

/**
 * Make a direct authenticated GraphQL request to Shopee API using user-provided credentials
 * 
 * @param {string} query - GraphQL query string
 * @param {Object} variables - GraphQL variables
 * @param {string} appId - User-provided Shopee App ID
 * @param {string} secretKey - User-provided Shopee Secret Key
 * @returns {Object} Response data or error object
 */
const makeDirectGraphQLRequest = async (query, variables, appId, secretKey) => {
  try {
    // Create request body
    const requestBody = JSON.stringify({
      query,
      variables
    });
    
    // Generate timestamp (seconds since epoch)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Generate signature
    const signature = generateDirectSignature(appId, timestamp, requestBody, secretKey);
    
    // Create authorization header
    const authHeader = `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`;
    
    logger.info(`Making direct GraphQL request to Shopee API with user-provided credentials`);
    
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
      logger.error('Received HTML response instead of JSON from Shopee API');
      return {
        error: 'Received HTML response',
        message: 'The API returned an HTML page instead of JSON. This might indicate an issue with the API endpoint.',
        status: response.status,
        isHtml: true
      };
    }
    
    // Handle error status codes
    if (response.status >= 400) {
      logger.error(`Shopee API Error: ${response.status}`, response.data);
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
    logger.error('Request error:', error.message);
    return formatDirectApiError(error);
  }
};

module.exports = {
  SHOPEE_GRAPHQL_API,
  generateDirectSignature,
  makeDirectGraphQLRequest,
  formatDirectApiError
};
