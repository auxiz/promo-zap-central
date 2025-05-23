
/**
 * Shopee Affiliate Client
 * A simplified interface for the Shopee Affiliate API
 */

const { convertToAffiliateLink, fetchOffers } = require('../../services/shopee/affiliateService');

/**
 * Main client class for Shopee Affiliate API
 */
class ShopeeAffiliateClient {
  /**
   * Create a new client instance
   * 
   * @param {Object} config - Client configuration
   * @param {string} config.appId - Shopee App ID
   * @param {string} config.secretKey - Shopee Secret Key 
   * @param {Object} config.options - Default request options
   */
  constructor(config = {}) {
    this.appId = config.appId || process.env.SHOPEE_APP_ID;
    this.secretKey = config.secretKey || process.env.SHOPEE_SECRET_KEY;
    this.options = config.options || {};
    
    // Validate credentials
    if (!this.appId || !this.secretKey) {
      console.warn('ShopeeAffiliateClient initialized without credentials. You must provide appId and secretKey for each request.');
    }
  }
  
  /**
   * Convert a regular Shopee URL to an affiliate link
   * 
   * @param {string} url - Original Shopee URL
   * @param {string} [appId] - Optional App ID (overrides instance setting)
   * @param {string} [secretKey] - Optional Secret Key (overrides instance setting)
   * @param {Object} [options] - Request options
   * @returns {Promise<Object>} Conversion result
   */
  async convertLink(url, appId, secretKey, options = {}) {
    const credentials = {
      appId: appId || this.appId,
      secretKey: secretKey || this.secretKey
    };
    
    if (!credentials.appId || !credentials.secretKey) {
      return {
        status: 'error',
        message: 'Missing credentials: appId and secretKey are required'
      };
    }
    
    return await convertToAffiliateLink(
      url, 
      credentials.appId, 
      credentials.secretKey,
      { ...this.options, ...options }
    );
  }
  
  /**
   * Fetch available offers from Shopee
   * 
   * @param {Object} params - Request parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Results per page
   * @param {string} [appId] - Optional App ID (overrides instance setting)
   * @param {string} [secretKey] - Optional Secret Key (overrides instance setting)
   * @param {Object} [options] - Request options
   * @returns {Promise<Object>} Offers result
   */
  async getOffers(params = {}, appId, secretKey, options = {}) {
    const credentials = {
      appId: appId || this.appId,
      secretKey: secretKey || this.secretKey
    };
    
    if (!credentials.appId || !credentials.secretKey) {
      return {
        status: 'error',
        message: 'Missing credentials: appId and secretKey are required'
      };
    }
    
    return await fetchOffers(
      params, 
      credentials.appId, 
      credentials.secretKey,
      { ...this.options, ...options }
    );
  }
}

// Factory function to create client instances
const createClient = (config) => {
  return new ShopeeAffiliateClient(config);
};

// Create a default client instance
const defaultClient = new ShopeeAffiliateClient();

// Export the client and factory function
module.exports = {
  ShopeeAffiliateClient,
  createClient,
  client: defaultClient,
  // Expose main functions directly for simpler usage
  convertLink: defaultClient.convertLink.bind(defaultClient),
  getOffers: defaultClient.getOffers.bind(defaultClient)
};
