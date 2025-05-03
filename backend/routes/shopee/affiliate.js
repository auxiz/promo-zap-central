
const express = require('express');
const router = express.Router();
const shopeeUtils = require('../../utils/shopee');

// Get affiliate performance
router.get('/performance', async (req, res) => {
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

module.exports = router;
