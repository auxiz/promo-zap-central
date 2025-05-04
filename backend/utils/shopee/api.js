
const axios = require('axios');
const crypto = require('crypto');
const { getFullCredentials, updateShopeeCredentials } = require('./credentials');
const { SHOPEE_API_BASE, generateSignature } = require('./utils');
const { verifyApiCredentialsGraphQL, makeGraphQLRequest } = require('./directAuth');

// Function to verify API credentials
const verifyApiCredentials = async (appId, secretKey) => {
  // Use the GraphQL authentication approach
  return verifyApiCredentialsGraphQL(appId, secretKey);
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

// Get shop information using GraphQL
const getShopInfo = async () => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      return { success: false, error: 'Missing Shopee API credentials' };
    }
    
    // GraphQL query for shop info
    const query = `
      query {
        affiliate {
          shopInfo {
            name
            id
            region
            status
          }
        }
      }
    `;
    
    // Make the GraphQL request
    const response = await makeGraphQLRequest(query);
    
    if (!response || response.error) {
      console.error('[Shopee GraphQL] Shop Info Error:', response?.error || 'Unknown error');
      return { 
        success: false,
        error: response?.error || 'Failed to get shop info'
      };
    }
    
    // Check for GraphQL errors
    if (response.errors && response.errors.length > 0) {
      const errorMessage = response.errors[0].message || 'GraphQL error';
      console.error('[Shopee GraphQL] Shop Info GraphQL Error:', errorMessage);
      
      return {
        success: false,
        error: 'GraphQL error',
        message: errorMessage
      };
    }
    
    // Extract shop info from response
    if (response.data && 
        response.data.affiliate && 
        response.data.affiliate.shopInfo) {
      return { 
        success: true, 
        shop_info: response.data.affiliate.shopInfo 
      };
    }
    
    return { 
      success: false, 
      error: 'Invalid response format', 
      message: 'The API returned shop data in an unexpected format'
    };
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
