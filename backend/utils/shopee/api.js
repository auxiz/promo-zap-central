
const axios = require('axios');
const crypto = require('crypto');
const { getFullCredentials, updateShopeeCredentials } = require('./credentials');
const { SHOPEE_API_BASE, generateSignature } = require('./utils');
const { ensureValidToken } = require('./oauth');

// Function to verify API credentials
const verifyApiCredentials = async (appId, secretKey) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(appId, 10);
    const endpoint = '/api/v2/shop/get_activation_status';
    console.log(`[Shopee API] Verifying credentials with timestamp: ${timestamp}`);

    // Generate signature for authentication test
    const baseString = `${partnerId}${endpoint}${timestamp}${secretKey}`;
    const signature = crypto.createHash('sha256').update(baseString).digest('hex');

    console.log(`[Shopee API] Verification request params:`, {
      partner_id: partnerId,
      timestamp,
      sign: signature
    });

    // Make a simple API call to verify auth
    const response = await axios({
      method: 'get',
      url: `${SHOPEE_API_BASE}/shop/get_activation_status`,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        partner_id: partnerId,
        timestamp,
        sign: signature
      },
      timeout: 5000 // 5 seconds timeout for quick feedback
    });

    console.log(`[Shopee API] Verification response:`, JSON.stringify(response.data));
    
    // If we get here without an exception, credentials are valid
    return true;
  } catch (error) {
    console.error('Error verifying API credentials:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return false;
  }
};

// Function to test Shopee connection
const testShopeeConnection = async () => {
  try {
    const credentials = getFullCredentials();
    // Use the verify credentials function with current credentials
    const isConnected = await verifyApiCredentials(
      credentials.appId, 
      credentials.secretKey
    );
    
    // Update status based on the result
    if (isConnected) {
      updateShopeeCredentials(credentials.appId, credentials.secretKey, 'online');
      return true;
    }
    
    // If no result, connection failed
    updateShopeeCredentials(credentials.appId, credentials.secretKey, 'offline');
    return false;
  } catch (error) {
    console.error('Error testing Shopee connection:', error);
    const credentials = getFullCredentials();
    updateShopeeCredentials(credentials.appId, credentials.secretKey, 'offline');
    return false;
  }
};

// Get shop information
const getShopInfo = async () => {
  try {
    // Ensure we have a valid token
    const tokenStatus = await ensureValidToken();
    if (!tokenStatus.success) {
      return { success: false, error: tokenStatus.error };
    }
    
    const credentials = getFullCredentials();
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(credentials.appId, 10);
    const endpoint = '/api/v2/shop/get_shop_info';
    console.log(`[Shopee API] Getting shop info with timestamp: ${timestamp}`);
    
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
      access_token: credentials.accessToken
    };
    console.log(`[Shopee API] Get shop info request params:`, requestParams);
    
    // Make API call
    const response = await axios({
      method: 'get',
      url: `${SHOPEE_API_BASE}/shop/get_shop_info`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': credentials.accessToken
      },
      params: requestParams
    });
    
    console.log(`[Shopee API] Get shop info response:`, JSON.stringify(response.data));
    
    if (response.data && response.data.error === '') {
      return { success: true, shop_info: response.data.response };
    } else {
      console.error('Error getting shop info:', response.data);
      return { success: false, error: response.data.error || 'Failed to get shop info' };
    }
  } catch (error) {
    console.error('Error getting shop info:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
  verifyApiCredentials,
  testShopeeConnection,
  getShopInfo
};
