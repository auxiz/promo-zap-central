
const crypto = require('crypto');
const url = require('url');

// Base URLs for Shopee API
const SHOPEE_API_BASE = 'https://partner.shopeemobile.com/api/v2';
const SHOPEE_GRAPHQL_API = 'https://open-api.affiliate.shopee.com.br/graphql';

// Generate signature required for Shopee API v2
const generateSignature = (endpoint, partnerId, timestamp, accessToken = '', secretKey) => {
  // Ensure timestamp is a number and convert to string for signature
  const timestampStr = String(timestamp);
  const baseString = `${partnerId}${endpoint}${timestampStr}${accessToken}${secretKey}`;
  return crypto.createHash('sha256').update(baseString).digest('hex');
};

// Check if token is expired with optional buffer time in seconds
const isTokenExpired = (tokenExpiry, bufferSeconds = 0) => {
  const currentTime = Date.now();
  const bufferMs = bufferSeconds * 1000;
  
  // Consider token expired if: 
  // 1. No expiry time exists
  // 2. Current time is past expiry (with buffer)
  return !tokenExpiry || currentTime > (tokenExpiry - bufferMs);
};

// Function to extract Shopee URLs from text
const extractShopeeUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  
  return matches.filter(match => {
    try {
      const parsedUrl = new URL(match);
      return parsedUrl.hostname.includes('shopee');
    } catch (e) {
      return false;
    }
  });
};

// Validate Shopee API parameters
const validateApiParams = (params) => {
  const requiredParams = ['partner_id', 'timestamp', 'sign'];
  const missingParams = [];
  
  for (const param of requiredParams) {
    if (!params[param]) {
      missingParams.push(param);
    }
  }
  
  if (missingParams.length > 0) {
    return {
      valid: false,
      error: `Missing required parameters: ${missingParams.join(', ')}`
    };
  }
  
  // Validate timestamp is a number
  const timestamp = params.timestamp;
  if (isNaN(Number(timestamp))) {
    return {
      valid: false,
      error: `Invalid timestamp format: ${timestamp}. Must be a number (Unix time in seconds)`
    };
  }
  
  return { valid: true };
};

// Format error response consistently
const formatApiError = (error) => {
  if (error.response && error.response.data) {
    return {
      error: error.response.data.error || 'API Error',
      message: error.response.data.message || error.message,
      status: error.response.status
    };
  }
  
  return {
    error: 'Request Error',
    message: error.message,
    status: 500
  };
};

module.exports = {
  SHOPEE_API_BASE,
  SHOPEE_GRAPHQL_API,
  generateSignature,
  isTokenExpired,
  extractShopeeUrls,
  validateApiParams,
  formatApiError
};
