
const { getFullCredentials } = require('../credentials');
const { trackShopeeError } = require('../../../whatsapp/services/errorTracker');
const { convertUsingAlternativeApi } = require('../directAuth');

/**
 * Convert a Shopee URL to an affiliate link using GraphQL
 * 
 * @param {string} originalUrl - The original Shopee product URL to convert
 * @returns {Promise<Object>} - Object containing the affiliate URL or error details
 */
const convertToAffiliateLink = async (originalUrl) => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      console.error('[Shopee Affiliate] Missing credentials');
      return { error: 'Missing Shopee API credentials' };
    }
    
    console.log(`[Shopee Affiliate] Converting URL: ${originalUrl}`);
    
    // First try the alternative API 
    const alternativeResult = await convertUsingAlternativeApi(originalUrl);
    
    if (alternativeResult && alternativeResult.affiliateUrl) {
      return {
        affiliateUrl: alternativeResult.affiliateUrl,
        originalUrl: originalUrl,
        source: 'alternative',
        success: true
      };
    }
    
    console.log('[Shopee Affiliate] Alternative API failed, falling back to GraphQL API');
    
    // GraphQL query for link conversion
    const query = `
      mutation GenerateShortLink($shortLinkRequest: ShortLinkRequest!) {
        affiliate {
          generateShortLink(shortLinkRequest: $shortLinkRequest) {
            shortLink
            originalLink
            offerLink
          }
        }
      }
    `;
    
    // Query variables
    const variables = {
      shortLinkRequest: {
        originalLink: originalUrl
      }
    };
    
    // Make the GraphQL request
    const { makeGraphQLRequest } = require('./graphqlClient');
    const response = await makeGraphQLRequest(query, variables);
    
    return processGraphQLResponse(response, originalUrl);
  } catch (error) {
    return handleConversionError(error);
  }
};

/**
 * Process the GraphQL API response
 * 
 * @param {Object} response - Response from the GraphQL API
 * @param {string} originalUrl - The original Shopee product URL
 * @returns {Object} - Processed response object
 */
const processGraphQLResponse = (response, originalUrl) => {
  // Check if the response is valid
  if (!response || response.error) {
    console.error('[Shopee Affiliate] API Error:', response?.error || 'Unknown error');
    return { 
      error: response?.error || 'API returned an error',
      message: response?.message || 'Failed to convert link'
    };
  }
  
  // Check for GraphQL errors
  if (response.errors && response.errors.length > 0) {
    const errorMessage = response.errors[0].message || 'GraphQL error';
    console.error('[Shopee Affiliate] GraphQL Error:', errorMessage);
    
    return {
      error: 'GraphQL error',
      message: errorMessage
    };
  }
  
  // Extract the affiliate link from the response
  if (response.data &&
      response.data.affiliate &&
      response.data.affiliate.generateShortLink) {
    
    const linkData = response.data.affiliate.generateShortLink;
    
    // Prefer offerLink if available, otherwise use shortLink
    const affiliateUrl = linkData.offerLink || linkData.shortLink;
    
    if (!affiliateUrl) {
      return {
        error: 'No affiliate link in response',
        message: 'The API did not return an affiliate link'
      };
    }
    
    return {
      affiliateUrl: affiliateUrl,
      originalUrl: originalUrl,
      source: 'graphql',
      success: true
    };
  }
  
  console.log('Unexpected response format:', JSON.stringify(response));
  
  return { 
    error: 'Invalid response format from API',
    message: 'The API returned data in an unexpected format'
  };
};

/**
 * Handle errors that occur during link conversion
 * 
 * @param {Error} error - The error object
 * @returns {Object} - Error details object
 */
const handleConversionError = (error) => {
  console.error('Error converting to affiliate link:', error.message);
  
  // Check for specific types of errors
  if (error.response) {
    console.error('Error response status:', error.response.status);
    
    // Check if the response is HTML instead of JSON
    const contentType = error.response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML response instead of JSON');
      trackShopeeError('CONVERSION', 'Received HTML instead of JSON', error);
      return { 
        error: 'Received HTML response instead of JSON',
        message: 'The API returned an HTML page instead of the expected JSON response'
      };
    }
    
    // Log detailed error data for debugging
    if (error.response.data) {
      console.error('Error response data:', error.response.data);
    }
  }
  
  // Track the error for monitoring
  trackShopeeError('CONVERSION', error.message, error);
  
  return { 
    error: error.message,
    message: 'Failed to convert link'
  };
};

module.exports = {
  convertToAffiliateLink
};
