
const express = require('express');
const router = express.Router();
const shopeeUtils = require('../../utils/shopee');

// Get OAuth authorization URL
router.get('/url', (req, res) => {
  try {
    const { redirect_uri } = req.query;
    
    if (!redirect_uri) {
      return res.status(400).json({ error: 'Redirect URI is required' });
    }
    
    // Use the updated getAuthorizationUrl function with timestamp
    const authUrl = shopeeUtils.getAuthorizationUrl(redirect_uri);
    res.json({ auth_url: authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate authorization URL',
      message: error.message 
    });
  }
});

// Exchange authorization code for access token
router.post('/token', async (req, res) => {
  try {
    const { code, redirect_uri, shop_id } = req.body;
    
    if (!code || !redirect_uri) {
      return res.status(400).json({ 
        success: false,
        error: 'Code and redirect URI are required' 
      });
    }
    
    const result = await shopeeUtils.exchangeAuthCode(code, redirect_uri, shop_id);
    
    if (result.success) {
      res.json({
        success: true,
        status: 'online',
        expires_in: result.expires_in,
        token_expiry: result.token_expiry,
        shop_id: result.shop_id
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error,
        message: result.message || 'Failed to exchange code for token'
      });
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to exchange code for token',
      message: error.message 
    });
  }
});

// Get OAuth token status
router.get('/status', async (req, res) => {
  try {
    const tokenStatus = await shopeeUtils.checkAndRefreshToken();
    
    res.json(tokenStatus);
  } catch (error) {
    console.error('Error getting token status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get token status',
      message: error.message 
    });
  }
});

// Refresh OAuth token
router.post('/refresh', async (req, res) => {
  try {
    const result = await shopeeUtils.refreshAccessToken();
    
    if (result.success) {
      res.json({
        success: true,
        token_expiry: result.token_expiry
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: result.error,
        message: result.message || 'Failed to refresh token'
      });
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to refresh token',
      message: error.message
    });
  }
});

module.exports = router;
