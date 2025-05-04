
/**
 * Shopee Direct Authentication Utility
 * 
 * This module provides functions for direct authentication with Shopee API
 * using App ID and Secret Key, without requiring OAuth tokens.
 */

const crypto = require('crypto');
const axios = require('axios');
const { getFullCredentials } = require('./credentials');
const { SHOPEE_API_BASE } = require('./utils');
const { trackShopeeError } = require('../../whatsapp/services/errorTracker');

/**
 * Generate HMAC-SHA256 signature for Shopee API requests
 * 
 * @param {string} partnerId - Shopee partner ID (APP ID)
 * @param {string} apiPath - API endpoint path (e.g., "/api/v2/affiliate/link_generate")
 * @param {number} timestamp - Current Unix timestamp in seconds
 * @param {string} secretKey - Shopee API secret key
 * @returns {string} - HMAC-SHA256 signature
 */
const generateDirectSignature = (partnerId, apiPath, timestamp, secretKey) => {
  // Format: partner_id + api_path + timestamp
  const baseString = `${partnerId}${apiPath}${timestamp}`;
  console.log(`[Shopee Direct Auth] Signature base string: ${baseString}`);
  
  // Create HMAC-SHA256 hash using secret key
  const signature = crypto.createHmac('sha256', secretKey)
    .update(baseString)
    .digest('hex');
  
  return signature;
};

/**
 * Make a direct authenticated request to Shopee API
 * 
 * @param {string} method - HTTP method (get, post, etc.)
 * @param {string} endpoint - API endpoint (e.g., "/affiliate/link_generate")
 * @param {object} data - Request body for POST requests
 * @param {object} queryParams - Additional query parameters
 * @returns {Promise<object>} - API response
 */
const makeDirectAuthRequest = async (method, endpoint, data = null, queryParams = {}) => {
  const credentials = getFullCredentials();
  
  if (!credentials.appId || !credentials.secretKey) {
    console.error('[Shopee Direct Auth] Missing credentials');
    throw new Error('Missing Shopee API credentials');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const partnerId = parseInt(credentials.appId, 10);
  const apiPath = `/api/v2${endpoint}`;
  
  // Generate signature
  const signature = generateDirectSignature(
    partnerId, 
    apiPath, 
    timestamp, 
    credentials.secretKey
  );
  
  // Prepare request parameters
  const requestParams = {
    partner_id: partnerId,
    timestamp,
    sign: signature,
    ...queryParams
  };
  
  console.log(`[Shopee Direct Auth] Making ${method} request to ${endpoint}`);
  console.log(`[Shopee Direct Auth] Request params:`, requestParams);
  
  try {
    // Make API call with explicit content type validation
    const response = await axios({
      method: method.toLowerCase(),
      url: `${SHOPEE_API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: requestParams,
      data: data,
      validateStatus: false, // Handle HTTP errors ourselves
      timeout: 10000 // 10 second timeout
    });
    
    // Check for non-JSON response (HTML pages, etc.)
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[Shopee Direct Auth] Received non-JSON response: ${contentType}`);
      trackShopeeError('API', 'Received non-JSON response', { contentType });
      throw new Error(`Received non-JSON response: ${contentType}`);
    }
    
    // Log short response summary (for debugging)
    console.log(`[Shopee Direct Auth] Response status: ${response.status}`);
    console.log(`[Shopee Direct Auth] Response error: ${response.data.error || 'None'}`);
    
    // Check for API errors
    if (response.data && response.data.error !== '') {
      console.error(`[Shopee Direct Auth] API Error: ${response.data.error}`);
      trackShopeeError('API', response.data.error, response.data);
      throw new Error(response.data.error || 'Shopee API error');
    }
    
    // Check for HTTP errors
    if (response.status >= 400) {
      console.error(`[Shopee Direct Auth] HTTP Error: ${response.status}`);
      trackShopeeError('API', `HTTP Error ${response.status}`, response.data);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('[Shopee Direct Auth] Request failed:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      if (error.response.data) {
        console.error('Error data:', error.response.data);
      }
    }
    throw error;
  }
};

/**
 * Verify if the provided API credentials are valid
 * 
 * @param {string} appId - Shopee APP ID
 * @param {string} secretKey - Shopee Secret Key
 * @returns {Promise<boolean>} - True if credentials are valid
 */
const verifyApiCredentialsDirect = async (appId, secretKey) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(appId, 10);
    const apiPath = '/api/v2/public/get_merchant_id_list';
    
    // Generate signature
    const signature = crypto.createHmac('sha256', secretKey)
      .update(`${partnerId}${apiPath}${timestamp}`)
      .digest('hex');
    
    // Make test request to a public endpoint that doesn't require additional authentication
    const response = await axios({
      method: 'get',
      url: `${SHOPEE_API_BASE}/public/get_merchant_id_list`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        partner_id: partnerId,
        timestamp,
        sign: signature
      },
      timeout: 5000, // 5 seconds timeout for quick feedback
      validateStatus: false // Handle HTTP errors ourselves
    });
    
    // Check for non-JSON response
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[Shopee Direct Auth] Verification received non-JSON response: ${contentType}`);
      return false;
    }
    
    console.log(`[Shopee Direct Auth] Verification status: ${response.status}`);
    
    // If we get a successful response with no error, the credentials are valid
    return response.status === 200 && response.data && response.data.error === '';
  } catch (error) {
    console.error('[Shopee Direct Auth] Verification failed:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      if (error.response.data) {
        console.error('Error data:', error.response.data);
      }
    }
    return false;
  }
};

module.exports = {
  generateDirectSignature,
  makeDirectAuthRequest,
  verifyApiCredentialsDirect
};
