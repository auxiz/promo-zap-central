
const axios = require('axios');
const { getFullCredentials, updateOAuthTokens } = require('./credentials');
const { SHOPEE_AUTH_URL, SHOPEE_API_BASE, generateSignature, isTokenExpired } = require('./utils');

// Get OAuth authorization URL
const getAuthorizationUrl = (redirectUri) => {
  try {
    const credentials = getFullCredentials();
    const partnerId = parseInt(credentials.appId, 10);
    
    if (!partnerId) {
      throw new Error('App ID must be configured before OAuth authorization');
    }
    
    // Include timestamp for every request to avoid Shopee API errors
    const timestamp = Math.floor(Date.now() / 1000);
    
    const authUrl = `https://partner.shopeemobile.com/api/v2/shop/auth_partner?partner_id=${partnerId}&redirect=${encodeURIComponent(redirectUri)}&timestamp=${timestamp}`;
    console.log(`[Shopee OAuth] Generated auth URL with timestamp: ${timestamp}`);
    
    return authUrl;
  } catch (error) {
    console.error('[Shopee OAuth] Error generating auth URL:', error.message);
    throw error;
  }
};

// Exchange authorization code for access token
const exchangeAuthCode = async (code, redirectUri) => {
  try {
    const credentials = getFullCredentials();
    const timestamp = Math.floor(Date.now() / 1000);
    console.log(`[Shopee OAuth] Exchange auth code timestamp: ${timestamp}`);
    
    const partnerId = parseInt(credentials.appId, 10);
    const endpoint = '/api/v2/auth/token/get';
    
    if (!partnerId) {
      throw new Error('Invalid Partner ID');
    }
    
    if (!code) {
      throw new Error('Authorization code is required');
    }
    
    // Generate signature
    const signature = generateSignature(endpoint, partnerId, timestamp, '', credentials.secretKey);
    
    const requestData = {
      code,
      partner_id: partnerId,
      shop_id: 0, // Will be returned from auth response
      timestamp
    };
    
    const requestParams = {
      partner_id: partnerId,
      timestamp,
      sign: signature
    };
    
    console.log(`[Shopee OAuth] Auth token request params:`, JSON.stringify(requestParams));
    console.log(`[Shopee OAuth] Auth token request data:`, JSON.stringify(requestData));
    
    // Make API call to get access token
    const response = await axios({
      method: 'post',
      url: SHOPEE_AUTH_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      params: requestParams, // Include timestamp in URL params
      data: requestData
    });
    
    console.log(`[Shopee OAuth] Auth token response:`, JSON.stringify(response.data));
    
    if (response.data && response.data.error === '') {
      const { access_token, refresh_token, expire_in, shop_id } = response.data;
      
      if (!access_token || !refresh_token || !expire_in) {
        throw new Error('Invalid OAuth response: missing required tokens');
      }
      
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
      console.error('[Shopee OAuth] Error exchanging auth code:', response.data);
      return { 
        success: false, 
        error: response.data.error || 'Failed to exchange authorization code',
        message: response.data.message || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('[Shopee OAuth] Error exchanging auth code:', error.message);
    if (error.response) {
      console.error('[Shopee OAuth] Error response:', error.response.data);
      return { 
        success: false, 
        error: error.response.data.error || error.message,
        message: error.response.data.message || 'API Error'
      };
    }
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
    console.log(`[Shopee OAuth] Refresh token timestamp: ${timestamp}`);
    
    const partnerId = parseInt(credentials.appId, 10);
    const endpoint = '/api/v2/auth/access_token/get';
    
    if (!partnerId) {
      throw new Error('Invalid Partner ID');
    }
    
    // Generate signature
    const signature = generateSignature(endpoint, partnerId, timestamp, '', credentials.secretKey);
    
    const requestData = {
      refresh_token: credentials.refreshToken,
      partner_id: partnerId,
      timestamp
    };
    
    const requestParams = {
      partner_id: partnerId,
      timestamp,
      sign: signature
    };
    
    console.log(`[Shopee OAuth] Refresh token request params:`, JSON.stringify(requestParams));
    console.log(`[Shopee OAuth] Refresh token request data:`, JSON.stringify(requestData));
    
    // Make API call to refresh token
    const response = await axios({
      method: 'post',
      url: `${SHOPEE_API_BASE}/auth/access_token/get`,
      headers: {
        'Content-Type': 'application/json'
      },
      params: requestParams,
      data: requestData
    });
    
    console.log(`[Shopee OAuth] Refresh token response:`, JSON.stringify(response.data));
    
    if (response.data && response.data.error === '') {
      const { access_token, refresh_token, expire_in } = response.data;
      
      if (!access_token || !refresh_token || !expire_in) {
        throw new Error('Invalid OAuth response: missing required tokens');
      }
      
      // Calculate expiry time in milliseconds
      const expiryTime = Date.now() + (expire_in * 1000);
      
      // Update tokens in credentials
      updateOAuthTokens(access_token, refresh_token, expiryTime);
      
      return { 
        success: true, 
        expires_in: expire_in,
        token_expiry: new Date(expiryTime).toISOString() 
      };
    } else {
      console.error('[Shopee OAuth] Error refreshing token:', response.data);
      return { 
        success: false, 
        error: response.data.error || 'Failed to refresh token',
        message: response.data.message || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('[Shopee OAuth] Error refreshing token:', error.message);
    if (error.response) {
      console.error('[Shopee OAuth] Error response:', error.response.data);
      return { 
        success: false, 
        error: error.response.data.error || error.message,
        message: error.response.data.message || 'API Error' 
      };
    }
    return { success: false, error: error.message };
  }
};

// Proactively check if token needs refresh (before it expires)
const checkAndRefreshToken = async () => {
  try {
    const credentials = getFullCredentials();
    
    // If no token or close to expiry (less than 5 minutes), refresh it
    if (!credentials.accessToken || isTokenExpired(credentials.tokenExpiry, 300)) { // 5 minutes buffer
      if (credentials.refreshToken) {
        console.log('[Shopee OAuth] Token expired or close to expiry, refreshing...');
        return await refreshAccessToken();
      } else {
        return { success: false, error: 'No refresh token available. Re-authentication required' };
      }
    }
    
    // Token is still valid
    return { 
      success: true,
      token_expiry: new Date(credentials.tokenExpiry).toISOString() 
    };
  } catch (error) {
    console.error('[Shopee OAuth] Error checking token status:', error.message);
    return { success: false, error: error.message };
  }
};

// Ensure valid token is available before making API calls
const ensureValidToken = async () => {
  try {
    const result = await checkAndRefreshToken();
    return result;
  } catch (error) {
    console.error('[Shopee OAuth] Error ensuring valid token:', error.message);
    return { success: false, error: 'Authentication error: ' + error.message };
  }
};

module.exports = {
  getAuthorizationUrl,
  exchangeAuthCode,
  ensureValidToken,
  refreshAccessToken,
  checkAndRefreshToken
};
