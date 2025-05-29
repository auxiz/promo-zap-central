
/**
 * Routes for handling Shopee affiliate link conversions
 */
const express = require('express');
const router = express.Router();
const { convertToAffiliateLink } = require('../../../utils/shopee/affiliate/linkConverter');
const { getShopeeCredentials } = require('../../../utils/shopee/credentials');
const { trackShopeeError } = require('../../../whatsapp/services/errorTracker');
const logger = require('../../../utils/logger');

// Convert a URL to Shopee affiliate link
router.post('/', async (req, res) => {
  try {
    const { url: originalUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }
    
    // Validate Shopee URL
    if (!originalUrl.includes('shopee')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Shopee URL. The URL must be from Shopee.'
      });
    }
    
    const credentials = getShopeeCredentials();
    if (!credentials.appId) {
      return res.status(400).json({ 
        success: false,
        error: 'Shopee credentials not configured' 
      });
    }
    
    logger.info('[Shopee Route] Converting link:', originalUrl);
    
    // Convert the URL using the improved conversion function
    const result = await convertToAffiliateLink(originalUrl);
    
    if (result.error) {
      logger.warn('[Shopee Route] Conversion failed:', result.error);
      
      // Determine appropriate status code based on error type
      let statusCode = 500;
      if (result.error.includes('credentials') || result.error.includes('Authentication')) {
        statusCode = 401;
      } else if (result.error.includes('Rate limit')) {
        statusCode = 429;
      } else if (result.error.includes('Invalid URL')) {
        statusCode = 400;
      }
      
      return res.status(statusCode).json({ 
        success: false,
        error: result.error,
        message: result.message
      });
    }
    
    if (!result.affiliateUrl) {
      return res.status(500).json({ 
        success: false,
        error: 'No affiliate URL returned',
        message: 'The conversion process completed but no affiliate URL was generated'
      });
    }
    
    logger.info('[Shopee Route] Conversion successful via:', result.source);
    
    res.json({ 
      success: true,
      affiliate_url: result.affiliateUrl,
      original_url: originalUrl,
      source: result.source
    });
  } catch (error) {
    logger.error('[Shopee Route] Error converting URL:', error.message);
    trackShopeeError('CONVERSION', 'Failed to convert URL', error);
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        error: 'Request timeout',
        message: 'The request to Shopee API timed out. Please try again.'
      });
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Unable to connect to Shopee API. Please try again later.'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while converting the URL'
    });
  }
});

module.exports = router;
