
const { makeShopeeGraphQLRequest } = require('../auth/shopeeGraphQLClient');
const { getFullCredentials } = require('../credentials');
const logger = require('../../../utils/logger');
const axios = require('axios');

// Alternative API for fallback
const ALTERNATIVE_API_URL = 'https://api-hook.diade.shop/webhook/amazonadmin';

/**
 * Convert a Shopee URL to affiliate link using GraphQL API
 * 
 * @param {string} originalUrl - The original Shopee URL
 * @returns {Object} Conversion result
 */
const convertToAffiliateLinkGraphQL = async (originalUrl) => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      return { 
        error: 'Missing Shopee API credentials',
        message: 'Please configure your Shopee API credentials'
      };
    }
    
    logger.info('[Shopee Convert] Converting URL using GraphQL API:', originalUrl);
    
    // GraphQL mutation for converting links
    const convertMutation = `
      mutation ConvertLink($url: String!) {
        affiliate {
          convertLink(originalUrl: $url) {
            affiliateUrl
            originalUrl
            success
            error
          }
        }
      }
    `;
    
    // Make the GraphQL request
    const response = await makeShopeeGraphQLRequest(
      convertMutation,
      { url: originalUrl },
      credentials.appId,
      credentials.secretKey,
      { timeout: 20000, maxRetries: 2 }
    );
    
    logger.debug('[Shopee Convert] GraphQL response:', response);
    
    // Check for errors in the response
    if (response.error) {
      logger.error('[Shopee Convert] GraphQL API error:', response.error);
      return {
        error: response.error,
        message: response.message || 'Failed to convert link using GraphQL API'
      };
    }
    
    // Check for GraphQL errors
    if (response.errors && response.errors.length > 0) {
      const errorMessage = response.errors[0].message || 'GraphQL error';
      logger.error('[Shopee Convert] GraphQL errors:', response.errors);
      
      return {
        error: 'GraphQL error',
        message: errorMessage
      };
    }
    
    // Extract the converted link from response
    if (response.data && 
        response.data.affiliate && 
        response.data.affiliate.convertLink) {
      const result = response.data.affiliate.convertLink;
      
      if (result.success && result.affiliateUrl) {
        logger.info('[Shopee Convert] Link converted successfully via GraphQL');
        return {
          affiliateUrl: result.affiliateUrl,
          originalUrl: result.originalUrl || originalUrl,
          source: 'graphql'
        };
      } else {
        logger.warn('[Shopee Convert] GraphQL conversion failed:', result.error);
        return {
          error: result.error || 'Conversion failed',
          message: 'The GraphQL API could not convert this link'
        };
      }
    }
    
    // If we reach here, the response format was unexpected
    logger.warn('[Shopee Convert] Unexpected GraphQL response format:', response);
    return {
      error: 'Invalid response format',
      message: 'The GraphQL API returned an unexpected response format'
    };
  } catch (error) {
    logger.error('[Shopee Convert] Error in GraphQL conversion:', error.message);
    return {
      error: 'GraphQL conversion error',
      message: error.message || 'An error occurred during GraphQL link conversion'
    };
  }
};

/**
 * Convert a Shopee URL to affiliate link using alternative API
 * 
 * @param {string} originalUrl - The original Shopee URL
 * @returns {Object} Conversion result
 */
const convertUsingAlternativeApi = async (originalUrl) => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      return { 
        error: 'Missing Shopee API credentials',
        message: 'Please configure your Shopee API credentials'
      };
    }
    
    logger.info('[Shopee Convert] Converting URL using alternative API:', originalUrl);
    
    // Make the API request
    const response = await axios({
      url: ALTERNATIVE_API_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        app_id: credentials.appId,
        secret_key: credentials.secretKey,
        product_url: originalUrl
      },
      timeout: 15000, // 15 second timeout
      validateStatus: function (status) {
        return status < 500; // Accept anything less than 500
      }
    });
    
    logger.debug('[Shopee Convert] Alternative API response status:', response.status);
    logger.debug('[Shopee Convert] Alternative API response data:', response.data);
    
    // Check if we got a successful response
    if (response.status === 200 && response.data) {
      // Try to extract affiliate URL from different possible response formats
      let affiliateUrl = null;
      
      if (typeof response.data === 'string') {
        // Sometimes the API returns just the URL as a string
        if (response.data.includes('shopee.com.br') && response.data.includes('affiliate')) {
          affiliateUrl = response.data.trim();
        }
      } else if (typeof response.data === 'object') {
        // Object response - check common field names
        affiliateUrl = response.data.affiliate_url || 
                      response.data.affiliateUrl || 
                      response.data.converted_url || 
                      response.data.url ||
                      response.data.link;
      }
      
      if (affiliateUrl && affiliateUrl !== originalUrl) {
        logger.info('[Shopee Convert] Link converted successfully via alternative API');
        return {
          affiliateUrl: affiliateUrl,
          originalUrl: originalUrl,
          source: 'alternative'
        };
      }
    }
    
    // If conversion failed or returned same URL
    logger.warn('[Shopee Convert] Alternative API conversion failed or returned same URL');
    return {
      error: 'Alternative API conversion failed',
      message: 'The alternative API could not convert this link'
    };
  } catch (error) {
    logger.error('[Shopee Convert] Error in alternative API conversion:', error.message);
    return {
      error: 'Alternative API error',
      message: error.message || 'An error occurred during alternative API link conversion'
    };
  }
};

/**
 * Main function to convert Shopee URL to affiliate link with fallback
 * 
 * @param {string} originalUrl - The original Shopee URL
 * @returns {Object} Conversion result
 */
const convertToAffiliateLink = async (originalUrl) => {
  try {
    logger.info('[Shopee Convert] Starting link conversion:', originalUrl);
    
    // Validate URL
    if (!originalUrl || !originalUrl.includes('shopee.com')) {
      return {
        error: 'Invalid URL',
        message: 'The provided URL is not a valid Shopee URL'
      };
    }
    
    // First try the alternative API (usually more reliable)
    const alternativeResult = await convertUsingAlternativeApi(originalUrl);
    
    if (alternativeResult && alternativeResult.affiliateUrl && !alternativeResult.error) {
      logger.info('[Shopee Convert] Conversion successful via alternative API');
      return alternativeResult;
    }
    
    logger.info('[Shopee Convert] Alternative API failed, trying GraphQL API');
    
    // Fallback to GraphQL API
    const graphqlResult = await convertToAffiliateLinkGraphQL(originalUrl);
    
    if (graphqlResult && graphqlResult.affiliateUrl && !graphqlResult.error) {
      logger.info('[Shopee Convert] Conversion successful via GraphQL API');
      return graphqlResult;
    }
    
    // If both methods failed, return the most informative error
    const error = graphqlResult.error || alternativeResult.error || 'Both conversion methods failed';
    const message = graphqlResult.message || alternativeResult.message || 'Unable to convert link using any available method';
    
    logger.error('[Shopee Convert] All conversion methods failed:', { error, message });
    
    return {
      error: error,
      message: message
    };
  } catch (error) {
    logger.error('[Shopee Convert] Unexpected error in conversion:', error.message);
    return {
      error: 'Conversion error',
      message: error.message || 'An unexpected error occurred during link conversion'
    };
  }
};

module.exports = {
  convertToAffiliateLink,
  convertToAffiliateLinkGraphQL,
  convertUsingAlternativeApi
};
