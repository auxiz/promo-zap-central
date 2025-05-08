
/**
 * Extract Shopee URLs from a text message
 * Note: This function is moved from the original affiliate.js file
 * 
 * @param {string} text - The text message containing potential Shopee URLs
 * @returns {Array<string>} - Array of extracted Shopee URLs
 */
const extractShopeeUrls = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  
  // Filter for Shopee URLs
  return urls.filter(url => url.includes('shopee'));
};

module.exports = {
  extractShopeeUrls
};
