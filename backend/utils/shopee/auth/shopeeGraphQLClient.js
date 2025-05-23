
const axios = require('axios');
const crypto = require('crypto');
const logger = require('../../../utils/logger');

// GraphQL API base URL
const SHOPEE_GRAPHQL_API = 'https://open-api.affiliate.shopee.com.br/graphql';

/**
 * Generate HMAC-SHA256 signature for Shopee GraphQL API
 * 
 * @param {string} appId - Shopee Application ID
 * @param {string} timestamp - Request timestamp in seconds
 * @param {string} payload - Stringified JSON payload
 * @param {string} secretKey - Shopee Secret Key 
 * @returns {string} HMAC-SHA256 signature
 */
const generateGraphQLSignature = (appId, timestamp, payload, secretKey) => {
  const stringToSign = `${appId}${timestamp}${payload}${secretKey}`;
  return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex');
};

/**
 * Format GraphQL query by removing extra whitespace and line breaks 
 * for more compact payloads
 * 
 * @param {string} query - GraphQL query string
 * @returns {string} Formatted query
 */
const formatGraphQLQuery = (query) => {
  return query
    .replace(/[\s]{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
};

/**
 * Make a GraphQL request to Shopee Affiliate API with proper authentication
 * 
 * @param {string} query - GraphQL query or mutation
 * @param {Object} variables - GraphQL variables
 * @param {string} appId - Shopee App ID
 * @param {string} secretKey - Shopee Secret Key
 * @param {Object} options - Additional request options
 * @returns {Promise<Object>} API response or error
 */
const makeShopeeGraphQLRequest = async (query, variables = {}, appId, secretKey, options = {}) => {
  try {
    // Validate required parameters
    if (!query || !appId || !secretKey) {
      return { 
        error: 'Missing required parameters',
        message: 'GraphQL query, App ID, and Secret Key are required'
      };
    }
    
    // Format the query to minimize payload size
    const formattedQuery = formatGraphQLQuery(query);
    
    // Create request body
    const requestBody = JSON.stringify({
      query: formattedQuery,
      variables
    });
    
    // Generate timestamp (seconds since epoch)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Generate signature
    const signature = generateGraphQLSignature(
      appId,
      timestamp,
      requestBody,
      secretKey
    );
    
    // Create authorization header
    const authHeader = `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`;
    
    logger.debug(`[Shopee GraphQL] Making request to: ${SHOPEE_GRAPHQL_API}`);
    
    // Apply default retry options
    const retryOptions = {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      currentRetry: 0
    };
    
    // Make the API request with retry support
    const makeRequest = async (retryCount) => {
      try {
        const response = await axios({
          url: SHOPEE_GRAPHQL_API,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          data: requestBody,
          validateStatus: function (status) {
            return true; // Handle all statuses manually
          },
          ...options
        });
        
        // Check if the response is HTML (error page) instead of JSON
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
          throw {
            error: 'Received HTML response',
            message: 'The API returned an HTML page instead of JSON. This might indicate an issue with the API endpoint.',
            status: response.status,
            isHtml: true
          };
        }
        
        // Handle error status codes
        if (response.status >= 400) {
          throw {
            error: `API Error: ${response.status}`,
            message: response.data?.message || 'An error occurred with the API request',
            status: response.status,
            data: response.data
          };
        }
        
        // Return the successful response data
        return response.data;
      } catch (error) {
        // Check if we should retry
        if (retryCount < retryOptions.maxRetries) {
          logger.debug(`[Shopee GraphQL] Retry ${retryCount + 1}/${retryOptions.maxRetries}`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryOptions.retryDelay));
          
          // Exponential backoff
          retryOptions.retryDelay *= 2;
          
          // Retry the request
          return makeRequest(retryCount + 1);
        }
        
        // Max retries reached, return error
        throw error;
      }
    };
    
    return await makeRequest(0);
  } catch (error) {
    logger.error('[Shopee GraphQL] Request error:', error.message);
    return {
      error: error.error || 'Request Error',
      message: error.message || 'An error occurred while making the GraphQL request',
      status: error.status || 500,
      data: error.data
    };
  }
};

module.exports = {
  SHOPEE_GRAPHQL_API,
  generateGraphQLSignature,
  formatGraphQLQuery,
  makeShopeeGraphQLRequest
};
