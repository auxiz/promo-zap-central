
const { getFullCredentials } = require('../credentials');
const { trackShopeeError } = require('../../../whatsapp/services/errorTracker');
const { makeGraphQLRequest } = require('./graphqlClient');

/**
 * Get affiliate performance data using GraphQL
 * 
 * @param {string} start_date - Start date for the performance data
 * @param {string} end_date - End date for the performance data
 * @returns {Promise<Object>} - Object containing the performance data or error details
 */
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
  getAffiliatePerformance
};
