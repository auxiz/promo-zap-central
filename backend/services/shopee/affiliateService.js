
const logger = require('../../utils/logger');
const { validateShopeeUrl } = require('../../utils/shopee/validators');
const { makeShopeeGraphQLRequest } = require('../../utils/shopee/auth/shopeeGraphQLClient');

/**
 * Convert a Shopee product URL to an affiliate link 
 * 
 * @param {string} originalUrl - Original Shopee product URL
 * @param {string} appId - Shopee App ID
 * @param {string} secretKey - Shopee Secret Key
 * @param {Object} options - Additional options like cache settings
 * @returns {Promise<Object>} Conversion result
 */
const convertToAffiliateLink = async (originalUrl, appId, secretKey, options = {}) => {
  try {
    // Validate input
    if (!originalUrl) {
      return { 
        status: 'error', 
        message: 'URL is required' 
      };
    }
    
    // Validate Shopee URL
    if (!validateShopeeUrl(originalUrl)) {
      logger.warn(`Invalid Shopee URL: ${originalUrl}`);
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
    
    // Make the GraphQL request with provided credentials
    const result = await makeShopeeGraphQLRequest(
      generateLinkQuery,
      { url: originalUrl },
      appId,
      secretKey,
      options
    );
    
    // Check for errors in the response
    if (result.error || !result.data) {
      logger.error('Failed to convert link with provided credentials:', result.error || 'Unknown error');
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
      affiliate_url: affiliateUrl,
      source: 'graphql'
    };
  } catch (error) {
    // Log and handle unexpected errors
    logger.error(`Error in affiliate link conversion: ${error.message}`, { error });
    
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
        details: 'Invalid credentials or expired authentication.'
      };
    }
    
    // Generic error response
    return { 
      status: 'error',
      message: 'Failed to convert link',
      details: error.message 
    };
  }
};

/**
 * Get Shopee offers with pagination
 * 
 * @param {Object} params - Request parameters like page and limit
 * @param {string} appId - Shopee App ID 
 * @param {string} secretKey - Shopee Secret Key
 * @param {Object} options - Additional options like cache settings
 * @returns {Promise<Object>} List of offers
 */
const fetchOffers = async ({ page = 1, limit = 10 }, appId, secretKey, options = {}) => {
  try {
    // Validate input
    if (!appId || !secretKey) {
      return { 
        status: 'error', 
        message: 'App ID and Secret Key are required'
      };
    }

    // GraphQL query for fetching offers
    const offersQuery = `
      query getOffers($page: Int!, $limit: Int!) {
        offers(page: $page, limit: $limit) {
          total
          items {
            name
            url
            imageUrl
            price
            discountPrice
            startTime
            endTime
          }
        }
      }
    `;
    
    // Make the GraphQL request with provided credentials
    const result = await makeShopeeGraphQLRequest(
      offersQuery,
      { page, limit },
      appId,
      secretKey,
      options
    );
    
    // Check for errors in the response
    if (result.error || !result.data) {
      logger.error('Failed to fetch offers:', result.error || 'Unknown error');
      return {
        status: 'error',
        message: result.message || 'Failed to fetch offers',
        details: result.error
      };
    }
    
    // Extract offers from the response
    const offers = result.data?.offers;
    
    if (!offers) {
      logger.error('No offers data returned from Shopee API');
      return {
        status: 'error',
        message: 'No offers data was returned by the API'
      };
    }
    
    // Return successful response
    return {
      status: 'success',
      total: offers.total,
      offers: offers.items,
      page,
      limit
    };
  } catch (error) {
    // Log and handle unexpected errors
    logger.error(`Error in fetching offers: ${error.message}`, { error });
    
    // Generic error response
    return { 
      status: 'error',
      message: 'Failed to fetch offers',
      details: error.message 
    };
  }
};

module.exports = {
  convertToAffiliateLink,
  fetchOffers
};
