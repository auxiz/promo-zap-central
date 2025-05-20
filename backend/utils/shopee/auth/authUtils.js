
/**
 * Common authentication utilities for Shopee API
 * This module centralizes authentication helpers for direct API communication
 */

const { getFullCredentials } = require('../credentials');
const { isTokenExpired, formatApiError } = require('../utils');
const { verifyApiCredentialsGraphQL } = require('./verifyCredentials');

/**
 * Test authentication status with current credentials
 * 
 * @returns {Promise<boolean>} True if authentication is valid
 */
const testAuthentication = async () => {
  try {
    const credentials = getFullCredentials();
    
    if (!credentials.appId || !credentials.secretKey) {
      return false;
    }
    
    return await verifyApiCredentialsGraphQL(
      credentials.appId, 
      credentials.secretKey
    );
  } catch (error) {
    console.error('Error testing authentication:', error.message);
    return false;
  }
};

/**
 * Format authentication error response
 * 
 * @param {Error} error - The error that occurred
 * @returns {Object} Formatted error response
 */
const formatAuthError = (error) => {
  const baseError = formatApiError(error);
  
  // Add authentication-specific context
  return {
    ...baseError,
    auth_error: true,
    auth_message: 'Authentication failed. Please verify your API credentials.'
  };
};

module.exports = {
  testAuthentication,
  formatAuthError
};
