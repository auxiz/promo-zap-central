
const express = require('express');
const router = express.Router();
const shopeeUtils = require('../../utils/shopee');

// Get shop information
router.get('/info', async (req, res) => {
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

module.exports = router;
