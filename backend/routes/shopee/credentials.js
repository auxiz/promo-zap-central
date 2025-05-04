
const express = require('express');
const router = express.Router();
const shopeeUtils = require('../../utils/shopee');

// Get Shopee credentials (returns app ID and status for security)
router.get('/', (req, res) => {
  res.json(shopeeUtils.getShopeeCredentials());
});

// Update Shopee credentials
router.post('/', async (req, res) => {
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

// Add a dedicated endpoint for testing connection
router.post('/test', async (req, res) => {
  try {
    const { appId, secretKey } = req.body;
    
    // Validate inputs
    if (!appId || !secretKey) {
      return res.status(400).json({ error: 'Both App ID and Secret Key are required' });
    }
    
    // Test the connection with provided credentials using GraphQL
    const isConnected = await shopeeUtils.verifyApiCredentialsGraphQL(appId, secretKey);
    
    if (isConnected) {
      res.json({ 
        success: true,
        status: 'online',
        message: 'Successfully connected to Shopee GraphQL API'
      });
    } else {
      res.status(401).json({ 
        success: false, 
        status: 'offline',
        error: 'Invalid credentials or GraphQL API connection failed'
      });
    }
  } catch (error) {
    console.error('Error testing Shopee connection:', error);
    res.status(500).json({ 
      success: false,
      status: 'offline',
      error: 'Failed to connect to Shopee GraphQL API'
    });
  }
});

module.exports = router;
