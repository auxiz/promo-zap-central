
const crypto = require('crypto');
const axios = require('axios');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Path to the credentials file
const CREDENTIALS_FILE = path.join(__dirname, '../config/shopee.json');

// Base URLs for Shopee API
const SHOPEE_AUTH_URL = 'https://partner.shopeemobile.com/api/v2/auth/token/get';
const SHOPEE_API_BASE = 'https://partner.shopeemobile.com/api/v2';

// Ensure config directory exists
const ensureConfigDir = () => {
  const configDir = path.dirname(CREDENTIALS_FILE);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
};

// Initialize Shopee credentials
let shopeeCredentials = {
  appId: process.env.SHOPEE_APP_ID || '',
  secretKey: process.env.SHOPEE_SECRET_KEY || '',
  status: 'offline',
  accessToken: '',
  refreshToken: '',
  tokenExpiry: 0
};

// Load credentials from file if it exists
const loadCredentialsFromFile = () => {
  try {
    ensureConfigDir();
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
      const savedCredentials = JSON.parse(data);
      
      // Update credentials with saved values
      shopeeCredentials = {
        ...shopeeCredentials,
        appId: savedCredentials.appId || shopeeCredentials.appId,
        secretKey: savedCredentials.secretKey || shopeeCredentials.secretKey,
        status: savedCredentials.status || 'offline',
        accessToken: savedCredentials.accessToken || '',
        refreshToken: savedCredentials.refreshToken || '',
        tokenExpiry: savedCredentials.tokenExpiry || 0
      };
      
      console.log('Shopee credentials loaded from file');
      return true;
    }
  } catch (error) {
    console.error('Error loading credentials from file:', error);
  }
  return false;
};

// Save credentials to file
const saveCredentialsToFile = () => {
  try {
    ensureConfigDir();
    // Save all credentials including tokens
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(shopeeCredentials, null, 2));
    console.log('Shopee credentials saved to file');
    return true;
  } catch (error) {
    console.error('Error saving credentials to file:', error);
    return false;
  }
};

// Load credentials on startup
loadCredentialsFromFile();

// Function to update Shopee credentials
const updateShopeeCredentials = (appId, secretKey, status = 'offline') => {
  shopeeCredentials = { 
    ...shopeeCredentials,
    appId, 
    secretKey, 
    status 
  };
  // Save to file whenever updated
  saveCredentialsToFile();
};

// Function to update OAuth tokens
const updateOAuthTokens = (accessToken, refreshToken, expiry) => {
  shopeeCredentials = {
    ...shopeeCredentials,
    accessToken,
    refreshToken,
    tokenExpiry: expiry,
    status: 'online'
  };
  saveCredentialsToFile();
};

// Function to get Shopee credentials (only appId for security and status)
const getShopeeCredentials = () => {
  return { 
    appId: shopeeCredentials.appId, 
    status: shopeeCredentials.status,
    hasToken: !!shopeeCredentials.accessToken && shopeeCredentials.tokenExpiry > Date.now()
  };
};

// Function to get full credentials (for internal use)
const getFullCredentials = () => {
  return { ...shopeeCredentials };
};

// Generate signature required for Shopee API v2
const generateSignature = (endpoint, partnerId, timestamp, accessToken = '') => {
  const baseString = `${partnerId}${endpoint}${timestamp}${accessToken}${shopeeCredentials.secretKey}`;
  return crypto.createHash('sha256').update(baseString).digest('hex');
};

// Check if token is expired
const isTokenExpired = () => {
  const currentTime = Date.now();
  // Consider token expired 5 minutes before actual expiry to be safe
  return !shopeeCredentials.accessToken || 
         !shopeeCredentials.tokenExpiry || 
         currentTime > (shopeeCredentials.tokenExpiry - 300000); // 5 min buffer
};

// Get OAuth authorization URL
const getAuthorizationUrl = (redirectUri) => {
  const partnerId = parseInt(shopeeCredentials.appId, 10);
  if (!partnerId) {
    throw new Error('App ID must be configured before OAuth authorization');
  }
  
  return `https://partner.shopeemobile.com/api/v2/shop/auth_partner?partner_id=${partnerId}&redirect=` + 
         encodeURIComponent(redirectUri);
};

// Exchange authorization code for access token
const exchangeAuthCode = async (code, redirectUri) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(shopeeCredentials.appId, 10);
    const endpoint = '/api/v2/auth/token/get';
    
    // Generate signature
    const signature = generateSignature(endpoint, partnerId, timestamp);
    
    // Make API call to get access token
    const response = await axios({
      method: 'post',
      url: SHOPEE_AUTH_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        code,
        partner_id: partnerId,
        shop_id: 0, // Will be returned from auth response
        timestamp
      }
    });
    
    if (response.data && response.data.error === '') {
      const { access_token, refresh_token, expire_in, shop_id } = response.data;
      
      // Calculate expiry time in milliseconds
      const expiryTime = Date.now() + (expire_in * 1000);
      
      // Update tokens in credentials
      updateOAuthTokens(access_token, refresh_token, expiryTime);
      
      return {
        success: true,
        shop_id,
        expires_in: expire_in,
        token_expiry: new Date(expiryTime).toISOString()
      };
    } else {
      console.error('Error exchanging auth code:', response.data);
      return { success: false, error: response.data.error || 'Failed to exchange authorization code' };
    }
  } catch (error) {
    console.error('Error exchanging auth code:', error);
    return { success: false, error: error.message };
  }
};

// Refresh the access token
const refreshAccessToken = async () => {
  try {
    if (!shopeeCredentials.refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(shopeeCredentials.appId, 10);
    const endpoint = '/api/v2/auth/access_token/get';
    
    // Generate signature
    const signature = generateSignature(endpoint, partnerId, timestamp);
    
    // Make API call to refresh token
    const response = await axios({
      method: 'post',
      url: `${SHOPEE_API_BASE}/auth/access_token/get`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        refresh_token: shopeeCredentials.refreshToken,
        partner_id: partnerId,
        timestamp
      }
    });
    
    if (response.data && response.data.error === '') {
      const { access_token, refresh_token, expire_in } = response.data;
      
      // Calculate expiry time in milliseconds
      const expiryTime = Date.now() + (expire_in * 1000);
      
      // Update tokens in credentials
      updateOAuthTokens(access_token, refresh_token, expiryTime);
      
      return { success: true, expires_in: expire_in };
    } else {
      console.error('Error refreshing token:', response.data);
      return { success: false, error: response.data.error || 'Failed to refresh token' };
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, error: error.message };
  }
};

// Ensure valid token is available before making API calls
const ensureValidToken = async () => {
  if (isTokenExpired()) {
    if (shopeeCredentials.refreshToken) {
      const result = await refreshAccessToken();
      if (!result.success) {
        return { success: false, error: 'Failed to refresh token' };
      }
    } else {
      return { success: false, error: 'No valid token available. Authorization required' };
    }
  }
  return { success: true };
};

// Function to verify API credentials
const verifyApiCredentials = async (appId, secretKey) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(appId, 10);
    const endpoint = '/api/v2/shop/get_activation_status';

    // Generate signature for authentication test
    const baseString = `${partnerId}${endpoint}${timestamp}${secretKey}`;
    const signature = crypto.createHash('sha256').update(baseString).digest('hex');

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

    // If we get here without an exception, credentials are valid
    return true;
  } catch (error) {
    console.error('Error verifying API credentials:', error.message);
    return false;
  }
};

// Function to test Shopee connection
const testShopeeConnection = async () => {
  try {
    // Use the verify credentials function with current credentials
    const isConnected = await verifyApiCredentials(
      shopeeCredentials.appId, 
      shopeeCredentials.secretKey
    );
    
    // Update status based on the result
    if (isConnected) {
      updateShopeeCredentials(shopeeCredentials.appId, shopeeCredentials.secretKey, 'online');
      return true;
    }
    
    // If no result, connection failed
    updateShopeeCredentials(shopeeCredentials.appId, shopeeCredentials.secretKey, 'offline');
    return false;
  } catch (error) {
    console.error('Error testing Shopee connection:', error);
    updateShopeeCredentials(shopeeCredentials.appId, shopeeCredentials.secretKey, 'offline');
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
    
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(shopeeCredentials.appId, 10);
    const endpoint = '/api/v2/shop/get_shop_info';
    
    // Generate signature
    const signature = generateSignature(
      endpoint, 
      partnerId, 
      timestamp, 
      shopeeCredentials.accessToken
    );
    
    // Make API call
    const response = await axios({
      method: 'get',
      url: `${SHOPEE_API_BASE}/shop/get_shop_info`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': shopeeCredentials.accessToken
      },
      params: {
        partner_id: partnerId,
        timestamp,
        sign: signature,
        access_token: shopeeCredentials.accessToken
      }
    });
    
    if (response.data && response.data.error === '') {
      return { success: true, shop_info: response.data.response };
    } else {
      console.error('Error getting shop info:', response.data);
      return { success: false, error: response.data.error || 'Failed to get shop info' };
    }
  } catch (error) {
    console.error('Error getting shop info:', error);
    return { success: false, error: error.message };
  }
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

// Function to convert a Shopee URL to an affiliate link
const convertToAffiliateLink = async (originalUrl) => {
  try {
    // Ensure we have a valid token
    const tokenStatus = await ensureValidToken();
    if (!tokenStatus.success) {
      return null;
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(shopeeCredentials.appId, 10);
    const endpoint = '/api/v2/affiliate/link_generate';

    // Generate signature
    const signature = generateSignature(
      endpoint, 
      partnerId, 
      timestamp, 
      shopeeCredentials.accessToken
    );

    // Prepare request body
    const requestBody = {
      requests: [{ url: originalUrl }]
    };

    // Make API call
    const response = await axios({
      method: 'post',
      url: `${SHOPEE_API_BASE}/affiliate/link_generate`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': shopeeCredentials.accessToken
      },
      params: {
        partner_id: partnerId,
        timestamp,
        sign: signature,
        access_token: shopeeCredentials.accessToken
      },
      data: requestBody
    });

    // Check response
    if (response.data && 
        response.data.error === '' && 
        response.data.response && 
        response.data.response.urls && 
        response.data.response.urls[0] && 
        response.data.response.urls[0].affiliate_link) {
      return response.data.response.urls[0].affiliate_link;
    }

    console.log('Unexpected response format:', response.data);
    return null;
  } catch (error) {
    console.error('Error converting to affiliate link:', error);
    console.error('Error details:', error.response?.data || error.message);
    return null;
  }
};

// Get affiliate performance data
const getAffiliatePerformance = async (start_date, end_date) => {
  try {
    // Ensure we have a valid token
    const tokenStatus = await ensureValidToken();
    if (!tokenStatus.success) {
      return { success: false, error: tokenStatus.error };
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(shopeeCredentials.appId, 10);
    const endpoint = '/api/v2/affiliate/get_report';
    
    // Generate signature
    const signature = generateSignature(
      endpoint, 
      partnerId, 
      timestamp, 
      shopeeCredentials.accessToken
    );
    
    // Make API call
    const response = await axios({
      method: 'get',
      url: `${SHOPEE_API_BASE}/affiliate/get_report`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': shopeeCredentials.accessToken
      },
      params: {
        partner_id: partnerId,
        timestamp,
        sign: signature,
        access_token: shopeeCredentials.accessToken,
        start_date,
        end_date
      }
    });
    
    if (response.data && response.data.error === '') {
      return { success: true, performance_data: response.data.response };
    } else {
      console.error('Error getting affiliate performance:', response.data);
      return { success: false, error: response.data.error || 'Failed to get affiliate performance' };
    }
  } catch (error) {
    console.error('Error getting affiliate performance:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  updateShopeeCredentials,
  getShopeeCredentials,
  getFullCredentials,
  extractShopeeUrls,
  convertToAffiliateLink,
  testShopeeConnection,
  verifyApiCredentials,
  getAuthorizationUrl,
  exchangeAuthCode,
  getShopInfo,
  getAffiliatePerformance
};
