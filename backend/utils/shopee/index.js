
// Main export file for Shopee utilities
const credentials = require('./credentials');
const oauth = require('./oauth');
const api = require('./api');
const affiliate = require('./affiliate');

// Export all modules
module.exports = {
  ...credentials,
  ...oauth,
  ...api,
  ...affiliate
};
