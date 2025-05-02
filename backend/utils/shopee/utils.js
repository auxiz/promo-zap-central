
const crypto = require('crypto');
const url = require('url');

// Base URLs for Shopee API
const SHOPEE_AUTH_URL = 'https://partner.shopeemobile.com/api/v2/auth/token/get';
const SHOPEE_API_BASE = 'https://partner.shopeemobile.com/api/v2';

// Generate signature required for Shopee API v2
const generateSignature = (endpoint, partnerId, timestamp, accessToken = '', secretKey) => {
  const baseString = `${partnerId}${endpoint}${timestamp}${accessToken}${secretKey}`;
  return crypto.createHash('sha256').update(baseString).digest('hex');
};

// Check if token is expired
const isTokenExpired = (tokenExpiry) => {
  const currentTime = Date.now();
  // Consider token expired 5 minutes before actual expiry to be safe
  return !tokenExpiry || currentTime > (tokenExpiry - 300000); // 5 min buffer
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

module.exports = {
  SHOPEE_AUTH_URL,
  SHOPEE_API_BASE,
  generateSignature,
  isTokenExpired,
  extractShopeeUrls
};
