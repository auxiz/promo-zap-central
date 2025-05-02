
const express = require('express');
const router = express.Router();
const shopeeUtils = require('../utils/shopeeUtils');

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

// Convert a URL to Shopee affiliate link
router.post('/convert', async (req, res) => {
  try {
    const { url: originalUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const credentials = shopeeUtils.getShopeeCredentials();
    if (!credentials.appId) {
      return res.status(400).json({ error: 'Shopee credentials not configured' });
    }
    
    const affiliateUrl = await shopeeUtils.convertToAffiliateLink(originalUrl);
    
    if (!affiliateUrl) {
      return res.status(500).json({ error: 'Failed to convert URL' });
    }
    
    res.json({ affiliate_url: affiliateUrl });
  } catch (error) {
    console.error('Error converting URL:', error);
    res.status(500).json({ error: 'Failed to convert URL' });
  }
});

module.exports = router;
