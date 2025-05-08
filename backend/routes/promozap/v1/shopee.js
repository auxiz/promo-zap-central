
const express = require('express');
const router = express.Router();
const { convertToAffiliateLink } = require('../../../utils/shopee/affiliate');
const { validateShopeeUrl } = require('../../../utils/shopee/validators');
const logger = require('../../../utils/logger');

/**
 * POST /api/v1/shopee/convert-link
 * @description Convert a Shopee product URL to an affiliate link
 */
router.post('/convert-link', async (req, res) => {
  try {
    const { original_url } = req.body;
    
    // Log incoming request
    logger.info(`Promozap: Received link conversion request for URL: ${original_url}`);
    
    // Validate input
    if (!original_url) {
      logger.warn('Promozap: Missing original_url in request body');
      return res.status(400).json({ 
        status: 'error', 
        message: 'URL is required' 
      });
    }
    
    // Validate Shopee URL
    if (!validateShopeeUrl(original_url)) {
      logger.warn(`Promozap: Invalid Shopee URL: ${original_url}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Shopee URL. The URL must be from Shopee.'
      });
    }
    
    // Convert the URL using existing affiliate conversion method
    const result = await convertToAffiliateLink(original_url);
    
    // Check for conversion success
    if (!result || !result.affiliateUrl) {
      const errorMessage = result?.error || 'Failed to convert URL';
      logger.error(`Promozap: Link conversion failed: ${errorMessage}`);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to convert link',
        details: errorMessage
      });
    }
    
    // Log successful conversion
    logger.info(`Promozap: Successfully converted URL to affiliate link`);
    
    // Return successful response with both links
    res.json({
      status: 'success',
      original_url: original_url,
      affiliate_url: result.affiliateUrl,
      source: result.source || 'graphql'
    });
  } catch (error) {
    // Log and handle unexpected errors
    logger.error(`Promozap: Error in link conversion: ${error.message}`, { error });
    
    // Check for rate limiting errors
    if (error.response && error.response.status === 429) {
      return res.status(429).json({
        status: 'error',
        message: 'Rate limit exceeded. Please try again later.',
        details: 'The Shopee API rate limit has been reached.'
      });
    }
    
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed',
        details: 'Invalid credentials or expired authentication.'
      });
    }
    
    // Handle HTML responses (non-JSON)
    if (error.response && error.response.headers && 
        error.response.headers['content-type'] && 
        error.response.headers['content-type'].includes('text/html')) {
      return res.status(502).json({
        status: 'error',
        message: 'Received HTML response instead of JSON',
        details: 'The Shopee API returned an HTML page instead of JSON. This might indicate a network issue or API endpoint problem.'
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to convert link',
      details: error.message 
    });
  }
});

module.exports = router;
