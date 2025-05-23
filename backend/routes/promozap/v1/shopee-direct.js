
const express = require('express');
const router = express.Router();
const logger = require('../../../utils/logger');
const shopeeAffiliateController = require('../../../controllers/shopee/affiliateController');

/**
 * POST /api/v1/shopee/convert-direct
 * @description Convert a Shopee product URL to an affiliate link using user-provided credentials
 */
router.post('/convert-direct', async (req, res) => {
  try {
    // Log incoming request (without sensitive data)
    logger.info(`Received direct link conversion request for URL: ${req.body.original_url}`);
    
    // Use the controller to handle the request
    await shopeeAffiliateController.convertLink(req, res);
  } catch (error) {
    // Log and handle unexpected errors
    logger.error(`Unexpected error in direct link conversion route: ${error.message}`);
    
    // Generic error response
    res.status(500).json({ 
      status: 'error',
      message: 'Falha ao converter link',
      details: error.message 
    });
  }
});

/**
 * POST /api/v1/shopee/offers
 * @description Get Shopee offers using user-provided credentials
 */
router.post('/offers', async (req, res) => {
  try {
    // Log incoming request (without sensitive data)
    logger.info(`Received offers request with page: ${req.query.page || 1}, limit: ${req.query.limit || 10}`);
    
    // Use the controller to handle the request
    await shopeeAffiliateController.getOffers(req, res);
  } catch (error) {
    // Log and handle unexpected errors
    logger.error(`Unexpected error in offers route: ${error.message}`);
    
    // Generic error response
    res.status(500).json({ 
      status: 'error',
      message: 'Falha ao buscar ofertas',
      details: error.message 
    });
  }
});

module.exports = router;
