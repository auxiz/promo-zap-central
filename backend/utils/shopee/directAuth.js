const axios = require('axios');
const crypto = require('crypto');
const { getFullCredentials } = require('./credentials');
const { formatApiError } = require('./utils');

// GraphQL API base URL for Shopee Affiliate
const SHOPEE_GRAPHQL_API = 'https://open-api.affiliate.shopee.com.br/graphql';

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

// Function to make a direct authenticated request to Shopee API
const makeDirectAuthRequest = async (method, endpoint, data = null, params = {}) => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      return { error: 'Missing Shopee API credentials' };
    }

    // Generate timestamp (seconds since epoch)
    const timestamp = Math.floor(Date.now() / 1000);

    // Generate signature
    const signature = generateSignature(
      credentials.appId,
      timestamp,
      JSON.stringify(data || {}), // Ensure data is stringified for signature
      credentials.secretKey
    );

    // Construct the URL with query parameters
    let apiUrl = `${SHOPEE_API_BASE}${endpoint}`;
    const queryParams = {
      partner_id: credentials.appId,
      timestamp: timestamp,
      sign: signature,
      ...params
    };

    // Append query parameters to the URL
    const urlWithParams = new URL(apiUrl);
    Object.keys(queryParams).forEach(key => urlWithParams.searchParams.append(key, queryParams[key]));
    apiUrl = urlWithParams.toString();

    console.log(`[Shopee API] Making ${method.toUpperCase()} request to: ${apiUrl}`);

    // Make the API request
    const response = await axios({
      method: method,
      url: apiUrl,
      data: data,
      validateStatus: function (status) {
        return status < 500;  // Resolve all status codes less than 500
      }
    });

    // Check if the response is HTML (error page) instead of JSON
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('[Shopee API] Received HTML response instead of JSON');
      return {
        error: 'Received HTML response',
        message: 'The API returned an HTML page instead of JSON. This might indicate an issue with the API endpoint.',
        status: response.status
      };
    }

    // Handle error status codes
    if (response.status >= 400) {
      console.error(`[Shopee API] API Error: ${response.status}`, response.data);
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
    console.error('[Shopee API] Request error:', error.message);
    return formatApiError(error);
  }
};

// Function to verify API credentials directly with Shopee API
const verifyApiCredentialsDirect = async (appId, secretKey) => {
  try {
    // Generate timestamp (seconds since epoch)
    const timestamp = Math.floor(Date.now() / 1000);

    // Generate signature
    const signature = generateSignature(
      appId,
      timestamp,
      JSON.stringify({}), // Empty data for verification
      secretKey
    );

    // Construct the URL with query parameters for the shop info endpoint
    let apiUrl = `${SHOPEE_API_BASE}/shop/get_shop_info`;
    const queryParams = {
      partner_id: appId,
      timestamp: timestamp,
      sign: signature
    };

    const urlWithParams = new URL(apiUrl);
    Object.keys(queryParams).forEach(key => urlWithParams.searchParams.append(key, queryParams[key]));
    apiUrl = urlWithParams.toString();

    console.log(`[Shopee API] Verifying credentials with: ${apiUrl}`);

    // Make the API request
    const response = await axios({
      method: 'GET',
      url: apiUrl,
      validateStatus: function (status) {
        return status < 500;  // Resolve all status codes less than 500
      }
    });

    // Check if the response is HTML (error page) instead of JSON
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('[Shopee API] Received HTML response instead of JSON');
      return false;
    }

    // Check for successful response
    if (response.status === 200 && response.data && response.data.response) {
      console.log('[Shopee API] Credentials verified successfully');
      return true;
    } else {
      console.error('[Shopee API] Credentials verification failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error verifying API credentials:', error.message);
    return false;
  }
};

module.exports = {
  makeDirectAuthRequest: makeGraphQLRequest, // Replace old REST API with GraphQL
  verifyApiCredentials: verifyApiCredentialsGraphQL, // Replace old verification with GraphQL
  makeGraphQLRequest,
  verifyApiCredentialsGraphQL,
  makeGraphQLRequestWithCredentials,
  verifyApiCredentialsDirect
};
