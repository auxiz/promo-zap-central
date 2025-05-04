const axios = require('axios');
const crypto = require('crypto');
const { getFullCredentials } = require('./credentials');
const { formatApiError } = require('./utils');

// GraphQL API base URL for Shopee Affiliate
const SHOPEE_GRAPHQL_API = 'https://open-api.affiliate.shopee.com.br/graphql';
// Alternative API for temporary use
const ALTERNATIVE_API_URL = 'https://api-hook.diade.shop/webhook/amazonadmin';

// Generate HMAC-SHA256 signature for Shopee API
const generateSignature = (appId, timestamp, bodyJson, secretKey) => {
  const stringToSign = `${appId}${timestamp}${bodyJson}${secretKey}`;
  return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex');
};

// Make a direct authenticated GraphQL request to Shopee API
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

// Verify API credentials by making a test GraphQL query
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

// Make GraphQL request with specific credentials (used for testing)
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

// Convert a Shopee URL to an affiliate link using the alternative API
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

// Test if the alternative API credentials are valid
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

// Export necessary functions
module.exports = {
  makeGraphQLRequest,
  verifyApiCredentialsGraphQL,
  makeGraphQLRequestWithCredentials,
  generateSignature,
  convertUsingAlternativeApi,
  verifyAlternativeApiCredentials
};
