
const axios = require('axios');
const crypto = require('crypto');
const { getFullCredentials, updateShopeeCredentials } = require('./credentials');
const { SHOPEE_API_BASE, generateSignature } = require('./utils');
const { verifyApiCredentialsDirect, makeDirectAuthRequest } = require('./directAuth');

// Function to verify API credentials
const verifyApiCredentials = async (appId, secretKey) => {
  // Use the direct authentication approach
  return verifyApiCredentialsDirect(appId, secretKey);
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

// Get shop information using direct authentication
const getShopInfo = async () => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      return { success: false, error: 'Missing Shopee API credentials' };
    }
    
    // Make the API request using direct authentication
    const response = await makeDirectAuthRequest('get', '/shop/get_shop_info');
    
    if (response && response.response) {
      return { success: true, shop_info: response.response };
    } else {
      console.error('Error getting shop info:', response);
      return { 
        success: false, 
        error: response?.error || 'Failed to get shop info' 
      };
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
