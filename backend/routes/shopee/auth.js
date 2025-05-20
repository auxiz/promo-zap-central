
/**
 * Shopee authentication routes
 * Note: This module now uses direct API authentication instead of OAuth
 */
const express = require('express');
const router = express.Router();
const shopeeUtils = require('../../utils/shopee');

// Endpoint to test the API connection
router.post('/test-connection', async (req, res) => {
  try {
    // Test the connection with current credentials
    const isConnected = await shopeeUtils.testShopeeConnection();
    
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
        error: 'API connection failed'
      });
    }
  } catch (error) {
    console.error('Error testing Shopee API connection:', error);
    res.status(500).json({ 
      success: false, 
      status: 'offline',
      error: 'Failed to connect to Shopee API'
    });
  }
});

// Get Shopee connection status
router.get('/status', async (req, res) => {
  try {
    const credentials = shopeeUtils.getShopeeCredentials();
    res.json({
      appId: credentials.appId,
      status: credentials.status
    });
  } catch (error) {
    console.error('Error getting Shopee API status:', error);
    res.status(500).json({ error: 'Failed to get API status' });
  }
});

module.exports = router;
