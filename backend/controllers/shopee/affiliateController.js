
const { convertToAffiliateLink, fetchOffers } = require('../../services/shopee/affiliateService');

/**
 * Controller for Shopee affiliate operations
 */
class ShopeeAffiliateController {
  /**
   * Convert a regular Shopee URL to an affiliate link using provided credentials
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object 
   */
  async convertLink(req, res) {
    try {
      const { app_id, secret_key, original_url } = req.body;
      
      if (!app_id || !secret_key || !original_url) {
        return res.status(400).json({
          status: 'error',
          message: 'App ID, Secret Key, and Original URL are required'
        });
      }
      
      const result = await convertToAffiliateLink(original_url, app_id, secret_key);
      
      // If there was an error, return the appropriate status code
      if (result.status === 'error') {
        const statusCode = result.details?.includes('Authentication failed') ? 401 : 
                           result.details?.includes('Rate limit') ? 429 : 400;
        
        return res.status(statusCode).json(result);
      }
      
      // Return successful response
      res.json(result);
    } catch (error) {
      // Handle unexpected errors
      res.status(500).json({ 
        status: 'error',
        message: 'Server error while processing link conversion',
        details: error.message 
      });
    }
  }
  
  /**
   * Fetch available offers from Shopee API using provided credentials
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOffers(req, res) {
    try {
      const { app_id, secret_key } = req.body;
      const { page = 1, limit = 10 } = req.query;
      
      if (!app_id || !secret_key) {
        return res.status(400).json({
          status: 'error',
          message: 'App ID and Secret Key are required'
        });
      }
      
      const result = await fetchOffers(
        { 
          page: parseInt(page), 
          limit: parseInt(limit) 
        }, 
        app_id, 
        secret_key
      );
      
      // If there was an error, return the appropriate status code
      if (result.status === 'error') {
        const statusCode = result.details?.includes('Authentication failed') ? 401 : 
                           result.details?.includes('Rate limit') ? 429 : 400;
        
        return res.status(statusCode).json(result);
      }
      
      // Return successful response
      res.json(result);
    } catch (error) {
      // Handle unexpected errors
      res.status(500).json({ 
        status: 'error',
        message: 'Server error while fetching offers',
        details: error.message 
      });
    }
  }
}

module.exports = new ShopeeAffiliateController();
