
const express = require('express');
const router = express.Router();
const shopeeUtils = require('../utils/shopee');

// Get Shopee credentials (returns app ID and status for security)
router.get('/credentials', (req, res) => {
  res.json(shopeeUtils.getShopeeCredentials());
});

// Update Shopee credentials
router.post('/credentials', async (req, res) => {
  try {
    const { appId, secretKey } = req.body;
    
    // Validate inputs
    if (!appId || !secretKey) {
      return res.status(400).json({ error: 'Both App ID and Secret Key are required' });
    }

    // Update credentials with offline status initially
    shopeeUtils.updateShopeeCredentials(appId, secretKey, 'offline');
    
    // Test the connection
    const isConnected = await shopeeUtils.testShopeeConnection();
    
    // Return the updated credentials
    const credentials = shopeeUtils.getShopeeCredentials();
    res.json({ 
      success: true, 
      appId: credentials.appId,
      status: credentials.status
    });
  } catch (error) {
    console.error('Error updating Shopee credentials:', error);
    res.status(500).json({ error: 'Failed to update Shopee credentials' });
  }
});

// Get OAuth authorization URL
router.get('/auth/url', (req, res) => {
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
router.post('/auth/token', async (req, res) => {
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
router.get('/auth/status', async (req, res) => {
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
router.post('/auth/refresh', async (req, res) => {
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

// Add a dedicated endpoint for testing connection
router.post('/test', async (req, res) => {
  try {
    const { appId, secretKey } = req.body;
    
    // Validate inputs
    if (!appId || !secretKey) {
      return res.status(400).json({ error: 'Both App ID and Secret Key are required' });
    }
    
    // Test the connection with provided credentials (temporarily)
    const isConnected = await shopeeUtils.verifyApiCredentials(appId, secretKey);
    
    if (isConnected) {
      res.json({ 
        success: true,
        status: 'online',
        message: 'Successfully connected to Shopee API'
      });
    } else {
      res.status(401).json({ 
        success: false, 
        status: 'offline',
        error: 'Invalid credentials or API connection failed'
      });
    }
  } catch (error) {
    console.error('Error testing Shopee connection:', error);
    res.status(500).json({ 
      success: false,
      status: 'offline',
      error: 'Failed to connect to Shopee API'
    });
  }
});

// Get shop information
router.get('/shop/info', async (req, res) => {
  try {
    const result = await shopeeUtils.getShopInfo();
    
    if (result.success) {
      res.json(result.shop_info);
    } else {
      res.status(401).json({ 
        success: false,
        error: result.error,
        message: result.message || 'Failed to get shop information'
      });
    }
  } catch (error) {
    console.error('Error getting shop info:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get shop information',
      message: error.message
    });
  }
});

// Get affiliate performance
router.get('/affiliate/performance', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        success: false,
        error: 'Start date and end date are required' 
      });
    }
    
    const result = await shopeeUtils.getAffiliatePerformance(start_date, end_date);
    
    if (result.success) {
      res.json(result.performance_data);
    } else {
      res.status(401).json({ 
        success: false,
        error: result.error,
        message: result.message || 'Failed to get affiliate performance'
      });
    }
  } catch (error) {
    console.error('Error getting affiliate performance:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get affiliate performance',
      message: error.message
    });
  }
});

// Convert a URL to Shopee affiliate link
router.post('/convert', async (req, res) => {
  try {
    const { url: originalUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }
    
    const credentials = shopeeUtils.getShopeeCredentials();
    if (!credentials.appId) {
      return res.status(400).json({ 
        success: false,
        error: 'Shopee credentials not configured' 
      });
    }
    
    const affiliateUrl = await shopeeUtils.convertToAffiliateLink(originalUrl);
    
    if (!affiliateUrl) {
      return res.status(500).json({ 
        success: false,
        error: 'Failed to convert URL' 
      });
    }
    
    res.json({ 
      success: true,
      affiliate_url: affiliateUrl 
    });
  } catch (error) {
    console.error('Error converting URL:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to convert URL',
      message: error.message 
    });
  }
});

// Manual login endpoint for Shopee
router.post('/manual-login', async (req, res) => {
  try {
    const { headless, loginUrl } = req.body;
    
    // Process the manual login request
    // This is a placeholder for your actual implementation
    // You might want to store session information or cookies here
    
    res.json({ 
      success: true,
      message: 'Manual login process initiated'
    });
  } catch (error) {
    console.error('Error initiating manual login:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to initiate manual login',
      message: error.message 
    });
  }
});

// Check login status endpoint
router.get('/login-status', (req, res) => {
  // This would check if there's an active session or login cookies
  // Placeholder implementation
  const mockStatus = {
    isLoggedIn: true,
    username: "ShopeeAffiliate",
    lastLogin: new Date().toISOString()
  };
  
  res.json(mockStatus);
});

module.exports = router;
