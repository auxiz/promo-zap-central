
const axios = require('axios');
const { getFullCredentials, updateOAuthTokens } = require('./credentials');
const { SHOPEE_AUTH_URL, SHOPEE_API_BASE, generateSignature, isTokenExpired } = require('./utils');

// Get OAuth authorization URL
const getAuthorizationUrl = (redirectUri) => {
  const credentials = getFullCredentials();
  const partnerId = parseInt(credentials.appId, 10);
  
  if (!partnerId) {
    throw new Error('App ID must be configured before OAuth authorization');
  }
  
  return `https://partner.shopeemobile.com/api/v2/shop/auth_partner?partner_id=${partnerId}&redirect=` + 
         encodeURIComponent(redirectUri);
};

// Exchange authorization code for access token
const exchangeAuthCode = async (code, redirectUri) => {
  try {
    const credentials = getFullCredentials();
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(credentials.appId, 10);
    const endpoint = '/api/v2/auth/token/get';
    
    // Generate signature
    const signature = generateSignature(endpoint, partnerId, timestamp, '', credentials.secretKey);
    
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
    const credentials = getFullCredentials();
    
    if (!credentials.refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(credentials.appId, 10);
    const endpoint = '/api/v2/auth/access_token/get';
    
    // Generate signature
    const signature = generateSignature(endpoint, partnerId, timestamp, '', credentials.secretKey);
    
    // Make API call to refresh token
    const response = await axios({
      method: 'post',
      url: `${SHOPEE_API_BASE}/auth/access_token/get`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        refresh_token: credentials.refreshToken,
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
  const credentials = getFullCredentials();
  
  if (isTokenExpired(credentials.tokenExpiry)) {
    if (credentials.refreshToken) {
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

module.exports = {
  getAuthorizationUrl,
  exchangeAuthCode,
  ensureValidToken,
  refreshAccessToken
};
