
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
  // The string to sign format: appId + timestamp + payload + secretKey
  const stringToSign = `${appId}${timestamp}${payload}${secretKey}`;
  
  logger.debug('[Shopee GraphQL] Signature generation:', {
    appId: appId,
    timestamp: timestamp,
    payloadLength: payload.length,
    stringToSignLength: stringToSign.length,
    stringToSign: stringToSign.substring(0, 200) + '...' // Log first 200 chars for security
  });
  
  const signature = crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex');
  
  logger.debug('[Shopee GraphQL] Generated signature:', signature);
  
  return signature;
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
    
    // Create request body - ensure consistent JSON formatting
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
    
    // Create authorization header - exact format as per Shopee documentation
    const authHeader = `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`;
    
    logger.info(`[Shopee GraphQL] Making request to: ${SHOPEE_GRAPHQL_API}`);
    logger.debug('[Shopee GraphQL] Request details:', {
      timestamp: timestamp,
      authHeader: authHeader,
      bodyLength: requestBody.length
    });
    
    // Apply default options with timeout
    const requestOptions = {
      url: SHOPEE_GRAPHQL_API,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'User-Agent': 'Promozap-Backend/1.0',
        'Accept': 'application/json'
      },
      data: requestBody,
      timeout: options.timeout || 15000, // 15 second timeout
      validateStatus: function (status) {
        return true; // Handle all statuses manually
      },
      ...options
    };
    
    // Apply retry logic
    const maxRetries = options.maxRetries || 3;
    let lastError = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`[Shopee GraphQL] Attempt ${attempt + 1}/${maxRetries + 1}`);
        
        const response = await axios(requestOptions);
        
        logger.debug('[Shopee GraphQL] Response status:', response.status);
        logger.debug('[Shopee GraphQL] Response headers:', response.headers);
        
        // Check if the response is HTML (error page) instead of JSON
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
          const error = {
            error: 'Received HTML response',
            message: 'The API returned an HTML page instead of JSON. This might indicate an issue with the API endpoint.',
            status: response.status,
            isHtml: true
          };
          
          if (attempt < maxRetries) {
            logger.warn('[Shopee GraphQL] HTML response, retrying...');
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
            continue;
          }
          
          return error;
        }
        
        // Handle error status codes
        if (response.status >= 400) {
          const error = {
            error: `API Error: ${response.status}`,
            message: response.data?.message || response.data?.error || 'An error occurred with the API request',
            status: response.status,
            data: response.data
          };
          
          logger.error('[Shopee GraphQL] API Error:', error);
          
          // Don't retry 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500) {
            return error;
          }
          
          // Retry 5xx errors (server errors)
          if (attempt < maxRetries) {
            logger.warn('[Shopee GraphQL] Server error, retrying...');
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          
          return error;
        }
        
        // Log successful response
        logger.info('[Shopee GraphQL] Request successful');
        logger.debug('[Shopee GraphQL] Response data:', JSON.stringify(response.data).substring(0, 500) + '...');
        
        // Return the successful response data
        return response.data;
      } catch (requestError) {
        logger.error(`[Shopee GraphQL] Request error (attempt ${attempt + 1}):`, requestError.message);
        
        lastError = {
          error: 'Request Error',
          message: requestError.message || 'Network error occurred',
          status: requestError.code || 500,
          code: requestError.code
        };
        
        // Don't retry network errors on last attempt
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
      }
    }
    
    // If we get here, all retries failed
    return lastError || {
      error: 'Max retries exceeded',
      message: 'Failed to connect to Shopee API after multiple attempts'
    };
  } catch (error) {
    logger.error('[Shopee GraphQL] Unexpected error:', error.message);
    return {
      error: error.error || 'Unexpected Error',
      message: error.message || 'An unexpected error occurred while making the GraphQL request',
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
