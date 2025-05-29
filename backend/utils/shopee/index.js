
// Main Shopee utilities export file
const { 
  updateShopeeCredentials, 
  getShopeeCredentials, 
  getFullCredentials 
} = require('./credentials');

const { 
  verifyApiCredentialsGraphQL,
  verifyAlternativeApiCredentials
} = require('./auth/verifyCredentials');

const { 
  convertToAffiliateLink,
  convertToAffiliateLinkGraphQL,
  convertUsingAlternativeApi
} = require('./affiliate/linkConverter');

const logger = require('../../utils/logger');

/**
 * Test Shopee connection using both verification methods
 * 
 * @returns {boolean} True if connection is successful
 */
const testShopeeConnection = async () => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      logger.warn('[Shopee] No credentials configured for connection test');
      return false;
    }
    
    logger.info('[Shopee] Testing connection with configured credentials');
    
    // Try GraphQL verification first
    const graphqlResult = await verifyApiCredentialsGraphQL(
      credentials.appId, 
      credentials.secretKey
    );
    
    if (graphqlResult) {
      logger.info('[Shopee] GraphQL connection test successful');
      updateShopeeCredentials(credentials.appId, credentials.secretKey, 'online');
      return true;
    }
    
    // Try alternative API verification
    const alternativeResult = await verifyAlternativeApiCredentials(
      credentials.appId,
      credentials.secretKey
    );
    
    if (alternativeResult) {
      logger.info('[Shopee] Alternative API connection test successful');
      updateShopeeCredentials(credentials.appId, credentials.secretKey, 'online');
      return true;
    }
    
    // Both methods failed
    logger.warn('[Shopee] Both connection test methods failed');
    updateShopeeCredentials(credentials.appId, credentials.secretKey, 'offline');
    return false;
  } catch (error) {
    logger.error('[Shopee] Error testing connection:', error.message);
    const credentials = getFullCredentials();
    updateShopeeCredentials(credentials.appId, credentials.secretKey, 'offline');
    return false;
  }
};

/**
 * Verify API credentials with specific appId and secretKey
 * 
 * @param {string} appId - Shopee Application ID
 * @param {string} secretKey - Shopee Secret Key
 * @returns {boolean} True if credentials are valid
 */
const verifyApiCredentials = async (appId, secretKey) => {
  try {
    logger.info('[Shopee] Verifying provided credentials');
    
    // Try GraphQL verification
    const graphqlResult = await verifyApiCredentialsGraphQL(appId, secretKey);
    
    if (graphqlResult) {
      logger.info('[Shopee] Credentials verified via GraphQL');
      return true;
    }
    
    // Try alternative API verification
    const alternativeResult = await verifyAlternativeApiCredentials(appId, secretKey);
    
    if (alternativeResult) {
      logger.info('[Shopee] Credentials verified via alternative API');
      return true;
    }
    
    logger.warn('[Shopee] Credential verification failed');
    return false;
  } catch (error) {
    logger.error('[Shopee] Error verifying credentials:', error.message);
    return false;
  }
};

module.exports = {
  // Credentials management
  updateShopeeCredentials,
  getShopeeCredentials,
  getFullCredentials,
  
  // Connection testing
  testShopeeConnection,
  verifyApiCredentials,
  verifyApiCredentialsGraphQL,
  
  // Link conversion
  convertToAffiliateLink,
  convertToAffiliateLinkGraphQL,
  convertUsingAlternativeApi
};
