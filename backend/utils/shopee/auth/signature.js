
const crypto = require('crypto');

/**
 * Generate HMAC-SHA256 signature for Shopee API
 * 
 * @param {string} appId - Shopee Application ID
 * @param {string} timestamp - Request timestamp in seconds
 * @param {string} bodyJson - JSON request body
 * @param {string} secretKey - Shopee Secret Key 
 * @returns {string} HMAC-SHA256 signature
 */
const generateSignature = (appId, timestamp, bodyJson, secretKey) => {
  const stringToSign = `${appId}${timestamp}${bodyJson}${secretKey}`;
  return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex');
};

module.exports = {
  generateSignature
};
