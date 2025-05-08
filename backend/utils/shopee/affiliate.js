
// Main export file for Shopee affiliate utilities
const { convertToAffiliateLink } = require('./affiliate/linkConverter');
const { getAffiliatePerformance } = require('./affiliate/performanceTracker');
const { extractShopeeUrls } = require('./affiliate/urlUtils');

module.exports = {
  convertToAffiliateLink,
  getAffiliatePerformance,
  extractShopeeUrls
};
