
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const logger = require('../../../utils/logger');
const { validateShopeeUrl } = require('../../../utils/shopee/validators');

// Shopee GraphQL API endpoint
const SHOPEE_GRAPHQL_API = 'https://open-api.affiliate.shopee.com.br/graphql';

/**
 * Generate HMAC-SHA256 signature for Shopee API
 * 
 * @param {string} appId - Shopee Application ID
 * @param {string} timestamp - Request timestamp in seconds
 * @param {string} bodyJson - JSON request body
 * @param {string} secretKey - Shopee Secret Key 
 * @returns {string} HMAC-SHA256 signature
 */
const generateSignature = (appId, timestamp, bodyJson, secretKey) => {
  const stringToSign = `${appId}${timestamp}${bodyJson}${secretKey}`;
  return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex');
};

/**
 * Format error response consistently
 * @param {Error} error - The error object
 * @returns {Object} Formatted error object
 */
const formatApiError = (error) => {
  if (error.response && error.response.data) {
    return {
      error: error.response.data.error || 'API Error',
      message: error.response.data.message || error.message,
      status: error.response.status
    };
  }
  
  return {
    error: 'Request Error',
    message: error.message,
    status: 500
  };
};

/**
 * Make a direct authenticated GraphQL request to Shopee API using user-provided credentials
 * 
 * @param {string} query - GraphQL query string
 * @param {Object} variables - GraphQL variables
 * @param {string} appId - User-provided Shopee App ID
 * @param {string} secretKey - User-provided Shopee Secret Key
 * @returns {Object} Response data or error object
 */
const makeDirectGraphQLRequest = async (query, variables, appId, secretKey) => {
  try {
    // Create request body
    const requestBody = JSON.stringify({
      query,
      variables
    });
    
    // Generate timestamp (seconds since epoch)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Generate signature
    const signature = generateSignature(appId, timestamp, requestBody, secretKey);
    
    // Create authorization header
    const authHeader = `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`;
    
    logger.info(`Making direct GraphQL request to Shopee API with user-provided credentials`);
    
    // Make the API request
    const response = await axios({
      url: SHOPEE_GRAPHQL_API,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      data: requestBody,
      validateStatus: function (status) {
        // Consider all status codes as resolved to handle them properly
        return true;
      }
    });
    
    // Check if the response is HTML (error page) instead of JSON
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      logger.error('Received HTML response instead of JSON from Shopee API');
      return {
        error: 'Received HTML response',
        message: 'The API returned an HTML page instead of JSON. This might indicate an issue with the API endpoint.',
        status: response.status,
        isHtml: true
      };
    }
    
    // Handle error status codes
    if (response.status >= 400) {
      logger.error(`Shopee API Error: ${response.status}`, response.data);
      return {
        error: `API Error: ${response.status}`,
        message: response.data?.message || 'An error occurred with the API request',
        status: response.status,
        data: response.data
      };
    }
    
    // Return the successful response data
    return response.data;
  } catch (error) {
    logger.error('Request error:', error.message);
    return formatApiError(error);
  }
};

/**
 * POST /api/v1/shopee/convert-direct
 * @description Convert a Shopee product URL to an affiliate link using user-provided credentials
 */
router.post('/convert-direct', async (req, res) => {
  try {
    const { app_id, secret_key, original_url } = req.body;
    
    // Log incoming request (without sensitive data)
    logger.info(`Received direct link conversion request for URL: ${original_url}`);
    
    // Validate input
    if (!app_id || !secret_key || !original_url) {
      logger.warn('Missing required parameters in direct conversion request');
      return res.status(400).json({ 
        status: 'error', 
        message: 'App ID, Secret Key and URL are required' 
      });
    }
    
    // Validate Shopee URL
    if (!validateShopeeUrl(original_url)) {
      logger.warn(`Invalid Shopee URL in direct conversion: ${original_url}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Shopee URL. The URL must be from Shopee.'
      });
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
      { url: original_url },
      app_id,
      secret_key
    );
    
    // Check for errors in the response
    if (result.error || !result.data) {
      logger.error('Failed to convert link with user credentials:', result.error || 'Unknown error');
      return res.status(result.status || 500).json({
        status: 'error',
        message: result.message || 'Failed to convert link',
        details: result.error
      });
    }
    
    // Extract the affiliate link from the response
    const affiliateUrl = result.data?.generateShortLink?.shortLink;
    
    if (!affiliateUrl) {
      logger.error('No affiliate link returned from Shopee API');
      return res.status(500).json({
        status: 'error',
        message: 'No affiliate link was returned by the API'
      });
    }
    
    // Log successful conversion
    logger.info(`Successfully converted URL to affiliate link using direct credentials`);
    
    // Return successful response with both links
    res.json({
      status: 'success',
      original_url: original_url,
      affiliate_url: affiliateUrl
    });
  } catch (error) {
    // Log and handle unexpected errors
    logger.error(`Error in direct link conversion: ${error.message}`, { error });
    
    // Check for rate limiting errors
    if (error.response && error.response.status === 429) {
      return res.status(429).json({
        status: 'error',
        message: 'Rate limit exceeded. Please try again later.',
        details: 'The Shopee API rate limit has been reached.'
      });
    }
    
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed',
        details: 'Credenciais inválidas ou autenticação expirada. Verifique seu App ID e Secret Key.'
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      status: 'error',
      message: 'Falha ao converter link',
      details: error.message 
    });
  }
});

module.exports = router;
