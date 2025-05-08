
const { getFullCredentials } = require('./credentials');
const { extractShopeeUrls } = require('./utils');
const { makeGraphQLRequest } = require('./directAuth');
const { trackShopeeError } = require('../../whatsapp/services/errorTracker');
const { convertUsingAlternativeApi } = require('./directAuth');

// Function to convert a Shopee URL to an affiliate link using GraphQL
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
    const response = await makeGraphQLRequest(query, variables);
    
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
  } catch (error) {
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
  }
};

// Get affiliate performance data using GraphQL
const getAffiliatePerformance = async (start_date, end_date) => {
  try {
    const credentials = getFullCredentials();
    if (!credentials.appId || !credentials.secretKey) {
      return { success: false, error: 'Missing Shopee API credentials' };
    }
    
    console.log(`[Shopee Affiliate] Getting performance data for ${start_date} to ${end_date}`);
    
    // GraphQL query for performance data
    const query = `
      query AffiliatePerformance($startDate: String!, $endDate: String!) {
        affiliate {
          performance(startDate: $startDate, endDate: $endDate) {
            totalCommission
            totalClicks
            totalOrders
            totalSales
          }
        }
      }
    `;
    
    const variables = {
      startDate: start_date,
      endDate: end_date
    };
    
    // Make the GraphQL request
    const response = await makeGraphQLRequest(query, variables);
    
    if (!response || response.error) {
      console.error('[Shopee Affiliate] Performance Error:', response?.error || 'Unknown error');
      return { 
        success: false,
        error: response?.error || 'Failed to get affiliate performance'
      };
    }
    
    // Check for GraphQL errors
    if (response.errors && response.errors.length > 0) {
      const errorMessage = response.errors[0].message || 'GraphQL error';
      console.error('[Shopee Affiliate] Performance GraphQL Error:', errorMessage);
      
      return {
        success: false,
        error: 'GraphQL error',
        message: errorMessage
      };
    }
    
    // Extract performance data from response
    if (response.data && 
        response.data.affiliate && 
        response.data.affiliate.performance) {
      return { 
        success: true, 
        performance_data: response.data.affiliate.performance 
      };
    }
    
    return { 
      success: false, 
      error: 'Invalid response format', 
      message: 'The API returned data in an unexpected format'
    };
  } catch (error) {
    console.error('Error getting affiliate performance:', error.message);
    
    // Track the error
    trackShopeeError('PERFORMANCE', 'Failed to get performance data', error);
    
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
  convertToAffiliateLink,
  getAffiliatePerformance,
  extractShopeeUrls
};
