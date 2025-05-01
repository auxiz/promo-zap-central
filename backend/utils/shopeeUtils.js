
const crypto = require('crypto');
const axios = require('axios');
const url = require('url');

// Initialize Shopee credentials
let shopeeCredentials = {
  appId: process.env.SHOPEE_APP_ID || '',
  secretKey: process.env.SHOPEE_SECRET_KEY || ''
};

// Function to update Shopee credentials
const updateShopeeCredentials = (appId, secretKey) => {
  shopeeCredentials = { appId, secretKey };
};

// Function to get Shopee credentials (only appId for security)
const getShopeeCredentials = () => {
  return { appId: shopeeCredentials.appId };
};

// Function to extract Shopee URLs from text
const extractShopeeUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  
  return matches.filter(match => {
    try {
      const parsedUrl = new URL(match);
      return parsedUrl.hostname.includes('shopee');
    } catch (e) {
      return false;
    }
  });
};

// Function to convert a Shopee URL to an affiliate link
const convertToAffiliateLink = async (originalUrl) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(shopeeCredentials.appId, 10);

    // Prepare request body
    const requestBody = {
      partner_id: partnerId,
      timestamp: timestamp,
      requests: [{ url: originalUrl }]
    };

    // Generate signature
    const baseString = `${partnerId}${timestamp}`;
    const signature = crypto
      .createHmac('sha256', shopeeCredentials.secretKey)
      .update(baseString)
      .digest('hex');

    // Make API call
    const response = await axios({
      method: 'post',
      url: 'https://partner.shopeemobile.com/api/v1/affiliate/link_generate',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': signature
      },
      data: requestBody
    });

    // Check response
    if (response.data && response.data.responses && response.data.responses[0] && response.data.responses[0].affiliate_link) {
      return response.data.responses[0].affiliate_link;
    }

    console.log('Unexpected response format:', response.data);
    return null;
  } catch (error) {
    console.error('Error converting to affiliate link:', error);
    console.error('Error details:', error.response?.data || error.message);
    return null;
  }
};

module.exports = {
  updateShopeeCredentials,
  getShopeeCredentials,
  extractShopeeUrls,
  convertToAffiliateLink
};
