
/**
 * Central export file for Shopee direct authentication modules
 */

// Import all modules
const { generateSignature } = require('./auth/signature');
const { 
  makeGraphQLRequest, 
  makeGraphQLRequestWithCredentials 
} = require('./auth/graphqlClient');
const { 
  verifyApiCredentialsGraphQL,
  verifyAlternativeApiCredentials 
} = require('./auth/verifyCredentials');
const { convertUsingAlternativeApi } = require('./auth/alternativeApi');
const { 
  makeDirectGraphQLRequest,
  generateDirectSignature 
} = require('./auth/shopeeDirectUtils');

// Re-export all modules
module.exports = {
  generateSignature,
  makeGraphQLRequest,
  verifyApiCredentialsGraphQL,
  makeGraphQLRequestWithCredentials,
  convertUsingAlternativeApi,
  verifyAlternativeApiCredentials,
  makeDirectGraphQLRequest,
  generateDirectSignature
};
