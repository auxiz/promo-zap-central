
const fs = require('fs');
const path = require('path');

// Path to the credentials file
const CREDENTIALS_FILE = path.join(__dirname, '../../config/shopee.json');

// Initialize Shopee credentials
let shopeeCredentials = {
  appId: process.env.SHOPEE_APP_ID || '',
  secretKey: process.env.SHOPEE_SECRET_KEY || '',
  status: 'offline'
};

// Ensure config directory exists
const ensureConfigDir = () => {
  const configDir = path.dirname(CREDENTIALS_FILE);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
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
    // Save credentials
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(shopeeCredentials, null, 2));
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
  shopeeCredentials = { 
    ...shopeeCredentials,
    appId, 
    secretKey, 
    status 
  };
  // Save to file whenever updated
  saveCredentialsToFile();
};

// Function to get Shopee credentials (only appId for security and status)
const getShopeeCredentials = () => {
  return { 
    appId: shopeeCredentials.appId, 
    status: shopeeCredentials.status
  };
};

// Function to get full credentials (for internal use)
const getFullCredentials = () => {
  return { ...shopeeCredentials };
};

module.exports = {
  updateShopeeCredentials,
  getShopeeCredentials,
  getFullCredentials,
  shopeeCredentials
};
