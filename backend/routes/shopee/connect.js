
const express = require('express');
const router = express.Router();
const shopeeUtils = require('../../utils/shopee');

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

module.exports = router;
