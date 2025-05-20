
const express = require('express');
const router = express.Router();
const logger = require('../../../utils/logger');
const { convertDirectLink } = require('../../../services/shopee/directLinkConverter');

/**
 * POST /api/v1/shopee/convert-direct
 * @description Convert a Shopee product URL to an affiliate link using user-provided credentials
 */
router.post('/convert-direct', async (req, res) => {
  try {
    const { app_id, secret_key, original_url } = req.body;
    
    // Log incoming request (without sensitive data)
    logger.info(`Received direct link conversion request for URL: ${original_url}`);
    
    // Use the conversion service to handle the request
    const result = await convertDirectLink(original_url, app_id, secret_key);
    
    // If there was an error, return the appropriate status code
    if (result.status === 'error') {
      const statusCode = result.details?.includes('Authentication failed') ? 401 : 
                         result.details?.includes('Rate limit') ? 429 : 400;
      
      return res.status(statusCode).json(result);
    }
    
    // Log successful conversion
    logger.info(`Successfully converted URL to affiliate link using direct credentials`);
    
    // Return successful response
    res.json(result);
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

module.exports = router;
