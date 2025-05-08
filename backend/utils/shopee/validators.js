
/**
 * Utility functions for validating Shopee-related inputs
 */

/**
 * Validates if a URL is a valid Shopee product URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is a valid Shopee URL, false otherwise
 */
const validateShopeeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    // Parse the URL to check its validity
    const parsedUrl = new URL(url);
    
    // Check if the hostname contains 'shopee'
    if (!parsedUrl.hostname.includes('shopee')) {
      return false;
    }
    
    return true;
  } catch (error) {
    // Invalid URL format
    return false;
  }
};

module.exports = {
  validateShopeeUrl
};
