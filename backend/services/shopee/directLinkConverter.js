
const logger = require('../../utils/logger');
const { validateShopeeUrl } = require('../../utils/shopee/validators');
const { makeDirectGraphQLRequest } = require('../../utils/shopee/auth/shopeeDirectUtils');

/**
 * Convert a Shopee product URL to an affiliate link using user-provided credentials
 * 
 * @param {string} originalUrl - Original Shopee product URL
 * @param {string} appId - User-provided Shopee App ID
 * @param {string} secretKey - User-provided Shopee Secret Key
 * @returns {Object} Conversion result with status and affiliate URL
 */
const convertDirectLink = async (originalUrl, appId, secretKey) => {
  try {
    // Validate input
    if (!appId || !secretKey || !originalUrl) {
      return { 
        status: 'error', 
        message: 'App ID, Secret Key and URL are required' 
      };
    }
    
    // Validate Shopee URL
    if (!validateShopeeUrl(originalUrl)) {
      logger.warn(`Invalid Shopee URL in direct conversion: ${originalUrl}`);
      return {
        status: 'error',
        message: 'Invalid Shopee URL. The URL must be from Shopee.'
      };
    }

    // GraphQL query for generating affiliate link
    const generateLinkQuery = `
      mutation generateShortLink($url: String!) {
        generateShortLink(url: $url) {
          shortLink
          originLink
        }
      }
    `;
    
    // Make the GraphQL request with user-provided credentials
    const result = await makeDirectGraphQLRequest(
      generateLinkQuery,
      { url: originalUrl },
      appId,
      secretKey
    );
    
    // Check for errors in the response
    if (result.error || !result.data) {
      logger.error('Failed to convert link with user credentials:', result.error || 'Unknown error');
      return {
        status: 'error',
        message: result.message || 'Failed to convert link',
        details: result.error
      };
    }
    
    // Extract the affiliate link from the response
    const affiliateUrl = result.data?.generateShortLink?.shortLink;
    
    if (!affiliateUrl) {
      logger.error('No affiliate link returned from Shopee API');
      return {
        status: 'error',
        message: 'No affiliate link was returned by the API'
      };
    }
    
    // Return successful response with both links
    return {
      status: 'success',
      original_url: originalUrl,
      affiliate_url: affiliateUrl
    };
  } catch (error) {
    // Log and handle unexpected errors
    logger.error(`Error in direct link conversion: ${error.message}`, { error });
    
    // Check for rate limiting errors
    if (error.response && error.response.status === 429) {
      return {
        status: 'error',
        message: 'Rate limit exceeded. Please try again later.',
        details: 'The Shopee API rate limit has been reached.'
      };
    }
    
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return {
        status: 'error',
        message: 'Authentication failed',
        details: 'Credenciais inválidas ou autenticação expirada. Verifique seu App ID e Secret Key.'
      };
    }
    
    // Generic error response
    return { 
      status: 'error',
      message: 'Falha ao converter link',
      details: error.message 
    };
  }
};

module.exports = {
  convertDirectLink
};
