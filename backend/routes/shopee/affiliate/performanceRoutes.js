
/**
 * Routes for handling Shopee affiliate performance metrics
 */
const express = require('express');
const router = express.Router();
const shopeeUtils = require('../../../utils/shopee');
const { trackShopeeError } = require('../../../whatsapp/services/errorTracker');

/**
 * GET /api/shopee/affiliate/performance
 * @description Get affiliate performance metrics for a date range
 */
router.get('/', async (req, res) => {
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
    trackShopeeError('PERFORMANCE', 'Failed to get affiliate performance', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get affiliate performance',
      message: error.message
    });
  }
});

module.exports = router;
