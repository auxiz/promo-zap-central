const crypto = require('crypto');
const axios = require('axios');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Path to the credentials file
const CREDENTIALS_FILE = path.join(__dirname, '../config/shopee.json');

// Ensure config directory exists
const ensureConfigDir = () => {
  const configDir = path.dirname(CREDENTIALS_FILE);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
};

// Initialize Shopee credentials
let shopeeCredentials = {
  appId: process.env.SHOPEE_APP_ID || '',
  secretKey: process.env.SHOPEE_SECRET_KEY || '',
  status: 'offline'
};

// Load credentials from file if it exists
const loadCredentialsFromFile = () => {
  try {
    ensureConfigDir();
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
      const savedCredentials = JSON.parse(data);
      
      // Update credentials with saved values
      shopeeCredentials = {
        ...shopeeCredentials,
        appId: savedCredentials.appId || shopeeCredentials.appId,
        secretKey: savedCredentials.secretKey || shopeeCredentials.secretKey,
        status: savedCredentials.status || 'offline'
      };
      
      console.log('Shopee credentials loaded from file');
      return true;
    }
  } catch (error) {
    console.error('Error loading credentials from file:', error);
  }
  return false;
};

// Save credentials to file
const saveCredentialsToFile = () => {
  try {
    ensureConfigDir();
    // Only save necessary fields (not status which is dynamic)
    const dataToSave = {
      appId: shopeeCredentials.appId,
      secretKey: shopeeCredentials.secretKey,
      status: shopeeCredentials.status
    };
    
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(dataToSave, null, 2));
    console.log('Shopee credentials saved to file');
    return true;
  } catch (error) {
    console.error('Error saving credentials to file:', error);
    return false;
  }
};

// Load credentials on startup
loadCredentialsFromFile();

// Function to update Shopee credentials
const updateShopeeCredentials = (appId, secretKey, status = 'offline') => {
  shopeeCredentials = { appId, secretKey, status };
  // Save to file whenever updated
  saveCredentialsToFile();
};

// Function to get Shopee credentials (only appId for security and status)
const getShopeeCredentials = () => {
  return { appId: shopeeCredentials.appId, status: shopeeCredentials.status };
};

// Function to get full credentials (for internal use)
const getFullCredentials = () => {
  return { ...shopeeCredentials };
};

// Function to verify API credentials
const verifyApiCredentials = async (appId, secretKey) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = parseInt(appId, 10);

    // Generate signature
    const baseString = `${partnerId}${timestamp}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(baseString)
      .digest('hex');

    // Make a simple API call to verify auth
    const response = await axios({
      method: 'get',
      url: 'https://partner.shopeemobile.com/api/v1/merchant/get_merchant_info',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': signature
      },
      params: {
        partner_id: partnerId,
        timestamp: timestamp
      },
      timeout: 5000 // 5 seconds timeout for quick feedback
    });

    // If we get here, the request was successful (no exception thrown)
    return true;
  } catch (error) {
    console.error('Error verifying API credentials:', error.message);
    return false;
  }
};

// Function to test Shopee connection
const testShopeeConnection = async () => {
  try {
    // Use the verify credentials function with current credentials
    const isConnected = await verifyApiCredentials(
      shopeeCredentials.appId, 
      shopeeCredentials.secretKey
    );
    
    // Update status based on the result
    if (isConnected) {
      updateShopeeCredentials(shopeeCredentials.appId, shopeeCredentials.secretKey, 'online');
      return true;
    }
    
    // If no result, connection failed
    updateShopeeCredentials(shopeeCredentials.appId, shopeeCredentials.secretKey, 'offline');
    return false;
  } catch (error) {
    console.error('Error testing Shopee connection:', error);
    updateShopeeCredentials(shopeeCredentials.appId, shopeeCredentials.secretKey, 'offline');
    return false;
  }
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
  getFullCredentials,
  extractShopeeUrls,
  convertToAffiliateLink,
  testShopeeConnection,
  verifyApiCredentials
};
