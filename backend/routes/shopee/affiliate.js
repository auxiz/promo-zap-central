
const express = require('express');
const router = express.Router();
const shopeeUtils = require('../../utils/shopee');
const { trackShopeeError } = require('../../whatsapp/services/errorTracker');
const { convertUsingAlternativeApi } = require('../../utils/shopee/directAuth');

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
    trackShopeeError('PERFORMANCE', 'Failed to get affiliate performance', error);
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
    
    // Validate Shopee URL
    if (!originalUrl.includes('shopee')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Shopee URL. The URL must be from Shopee.'
      });
    }
    
    const credentials = shopeeUtils.getShopeeCredentials();
    if (!credentials.appId) {
      return res.status(400).json({ 
        success: false,
        error: 'Shopee credentials not configured' 
      });
    }
    
    // Get the full credentials for secure conversion
    const fullCredentials = shopeeUtils.getFullCredentials();
    if (!fullCredentials.secretKey) {
      return res.status(400).json({ 
        success: false,
        error: 'Shopee Secret Key not configured' 
      });
    }
    
    // First try the alternative API 
    const alternativeResult = await convertUsingAlternativeApi(originalUrl);
    
    if (alternativeResult && alternativeResult.affiliateUrl) {
      return res.json({ 
        success: true,
        affiliate_url: alternativeResult.affiliateUrl,
        original_url: originalUrl,
        source: 'alternative'
      });
    }
    
    console.log('Alternative API failed, falling back to original implementation');
    
    // Fall back to the original GraphQL API if the alternative API fails
    // Check connection status before proceeding
    if (credentials.status !== 'online') {
      // Try to verify credentials first
      const isConnected = await shopeeUtils.verifyApiCredentialsGraphQL(
        fullCredentials.appId, 
        fullCredentials.secretKey
      );
      
      if (!isConnected) {
        return res.status(401).json({
          success: false,
          error: 'Shopee API connection failed. Please verify your credentials.'
        });
      }
    }
    
    // Try to convert the URL using GraphQL
    const result = await shopeeUtils.convertToAffiliateLink(originalUrl);
    
    if (!result || !result.affiliateUrl) {
      return res.status(500).json({ 
        success: false,
        error: result?.error || 'Failed to convert URL. The API might be experiencing issues.' 
      });
    }
    
    res.json({ 
      success: true,
      affiliate_url: result.affiliateUrl,
      original_url: originalUrl,
      source: 'graphql'
    });
  } catch (error) {
    console.error('Error converting URL:', error);
    trackShopeeError('CONVERSION', 'Failed to convert URL', error);
    
    // Check for rate limiting errors
    if (error.response && error.response.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        message: 'The Shopee API rate limit has been reached. Please wait before making more requests.'
      });
    }
    
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid credentials or expired authentication. Please update your Shopee API credentials.'
      });
    }
    
    // Handle HTML responses (non-JSON)
    if (error.response && error.response.headers && 
        error.response.headers['content-type'] && 
        error.response.headers['content-type'].includes('text/html')) {
      return res.status(502).json({
        success: false,
        error: 'Received HTML response instead of JSON',
        message: 'The Shopee API returned an HTML page instead of JSON. This might indicate a network issue or API endpoint problem.'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to convert URL',
      message: error.message 
    });
  }
});

module.exports = router;
