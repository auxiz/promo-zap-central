
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const crypto = require('crypto'); // For HMAC-SHA256 signing
const axios = require('axios'); // For making HTTP requests
const url = require('url'); // For URL parsing

// Initialize express app
const app = express();
const port = 4000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Initialize variables to store state
let qrCodeDataUrl = null;
let isConnected = false;
let device = null;
let monitoredGroups = []; // Store monitored group IDs
let sendGroups = []; // Store send group IDs

// Shopee credentials
let shopeeCredentials = {
  appId: process.env.SHOPEE_APP_ID || '',
  secretKey: process.env.SHOPEE_SECRET_KEY || ''
};

// Initialize WhatsApp client with LocalAuth and specific puppeteer options
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-gpu'
    ]
  }
});

// Event handler for QR code generation
client.on('qr', async (qrString) => {
  console.log(`QR generated: ${qrString}`);
  
  try {
    // Convert QR string to data URL
    qrCodeDataUrl = await qrcode.toDataURL(qrString);
  } catch (error) {
    console.error('Error generating QR code:', error);
    qrCodeDataUrl = null;
  }
});

// Event handler for ready state
client.on('ready', () => {
  isConnected = true;
  device = client.info.wid.user;
  console.log(`WhatsApp connected with device: ${device}`);
  qrCodeDataUrl = null; // Clear QR code after successful connection
});

// Handle incoming messages for affiliate link conversion
client.on('message', async (message) => {
  try {
    // Check if message is from a monitored group
    if (!monitoredGroups.includes(message.from)) {
      return; // Not from a monitored group, ignore
    }

    const originalText = message.body;
    console.log(`Message received from monitored group: ${message.from}`);

    // Skip if no Shopee credentials or no send groups configured
    if (!shopeeCredentials.appId || !shopeeCredentials.secretKey || sendGroups.length === 0) {
      console.log('Skipping message forwarding: missing credentials or send groups');
      return;
    }

    // Look for Shopee URLs in the message
    const shopeeUrls = extractShopeeUrls(originalText);
    if (shopeeUrls.length === 0) {
      console.log('No Shopee URLs found in message');
      return;
    }

    // Convert Shopee URLs to affiliate links
    let modifiedText = originalText;
    for (const shopeeUrl of shopeeUrls) {
      try {
        const affiliateUrl = await convertToAffiliateLink(shopeeUrl);
        if (affiliateUrl) {
          modifiedText = modifiedText.replace(shopeeUrl, affiliateUrl);
          console.log(`Converted URL: ${shopeeUrl} -> ${affiliateUrl}`);
        }
      } catch (error) {
        console.error(`Error converting URL ${shopeeUrl}:`, error);
      }
    }

    // Only forward if text was modified
    if (modifiedText !== originalText) {
      // Forward modified message to all send groups
      for (const groupId of sendGroups) {
        try {
          await client.sendMessage(groupId, modifiedText);
          console.log(`Message forwarded to group: ${groupId}`);
        } catch (error) {
          console.error(`Error forwarding message to group ${groupId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

// Function to extract Shopee URLs from text
function extractShopeeUrls(text) {
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
}

// Function to convert a Shopee URL to an affiliate link
async function convertToAffiliateLink(originalUrl) {
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
}

// Event handler for disconnected state
client.on('disconnected', () => {
  isConnected = false;
  device = null;
  console.log('WhatsApp disconnected');
});

// Initialize WhatsApp client
client.initialize().catch(error => {
  console.error('Error initializing WhatsApp client:', error);
});

// API endpoint to get QR code
app.get('/api/whatsapp/qrcode', (req, res) => {
  res.json({ qr: qrCodeDataUrl });
});

// API endpoint to get connection status
app.get('/api/whatsapp/status', (req, res) => {
  let status = 'DISCONNECTED';
  
  if (isConnected) {
    status = 'CONNECTED';
  } else if (qrCodeDataUrl) {
    status = 'PENDING';
  }
  
  res.json({ status, device });
});

// API endpoint to disconnect WhatsApp
app.post('/api/whatsapp/disconnect', async (req, res) => {
  try {
    if (isConnected) {
      await client.destroy();
      console.log('WhatsApp client destroyed');
    }
    
    // Reset state
    isConnected = false;
    device = null;
    qrCodeDataUrl = null;
    
    // Reinitialize the client
    setTimeout(() => {
      client.initialize().catch(error => {
        console.error('Error reinitializing WhatsApp client:', error);
      });
    }, 1000);
    
    res.json({ status: 'DISCONNECTED' });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
  }
});

// API endpoint to get all WhatsApp groups
app.get('/api/whatsapp/groups', async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    const chats = await client.getChats();
    const groups = chats
      .filter(chat => chat.isGroup)
      .map(group => ({
        id: group.id._serialized,
        name: group.name
      }));

    res.json({ groups });
  } catch (error) {
    console.error('Error fetching WhatsApp groups:', error);
    res.status(500).json({ error: 'Failed to fetch WhatsApp groups' });
  }
});

// API endpoint to get monitored groups
app.get('/api/whatsapp/monitored', (req, res) => {
  res.json({ monitored: monitoredGroups });
});

// API endpoint to add a group to monitored
app.post('/api/whatsapp/monitored', (req, res) => {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    if (!monitoredGroups.includes(groupId)) {
      monitoredGroups.push(groupId);
    }

    res.json({ monitored: monitoredGroups });
  } catch (error) {
    console.error('Error adding monitored group:', error);
    res.status(500).json({ error: 'Failed to add monitored group' });
  }
});

// API endpoint to remove a group from monitored
app.delete('/api/whatsapp/monitored/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    monitoredGroups = monitoredGroups.filter(id => id !== groupId);
    res.json({ monitored: monitoredGroups });
  } catch (error) {
    console.error('Error removing monitored group:', error);
    res.status(500).json({ error: 'Failed to remove monitored group' });
  }
});

// API endpoint to get send groups
app.get('/api/whatsapp/send', (req, res) => {
  res.json({ send: sendGroups });
});

// API endpoint to add a group to send list
app.post('/api/whatsapp/send', (req, res) => {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    if (!sendGroups.includes(groupId)) {
      sendGroups.push(groupId);
    }

    res.json({ send: sendGroups });
  } catch (error) {
    console.error('Error adding send group:', error);
    res.status(500).json({ error: 'Failed to add send group' });
  }
});

// API endpoint to remove a group from send list
app.delete('/api/whatsapp/send/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    sendGroups = sendGroups.filter(id => id !== groupId);
    res.json({ send: sendGroups });
  } catch (error) {
    console.error('Error removing send group:', error);
    res.status(500).json({ error: 'Failed to remove send group' });
  }
});

// Shopee API endpoints
// Get Shopee credentials (only returns app ID for security)
app.get('/api/shopee/credentials', (req, res) => {
  res.json({ 
    appId: shopeeCredentials.appId,
    // Not sending secretKey for security
  });
});

// Update Shopee credentials
app.post('/api/shopee/credentials', (req, res) => {
  try {
    const { appId, secretKey } = req.body;
    
    // Validate inputs
    if (!appId || !secretKey) {
      return res.status(400).json({ error: 'Both App ID and Secret Key are required' });
    }

    // Update credentials
    shopeeCredentials = { appId, secretKey };
    res.json({ success: true, appId });
  } catch (error) {
    console.error('Error updating Shopee credentials:', error);
    res.status(500).json({ error: 'Failed to update Shopee credentials' });
  }
});

// Convert a URL to Shopee affiliate link
app.post('/api/shopee/convert', async (req, res) => {
  try {
    const { url: originalUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!shopeeCredentials.appId || !shopeeCredentials.secretKey) {
      return res.status(400).json({ error: 'Shopee credentials not configured' });
    }
    
    const affiliateUrl = await convertToAffiliateLink(originalUrl);
    
    if (!affiliateUrl) {
      return res.status(500).json({ error: 'Failed to convert URL' });
    }
    
    res.json({ affiliate_url: affiliateUrl });
  } catch (error) {
    console.error('Error converting URL:', error);
    res.status(500).json({ error: 'Failed to convert URL' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`WhatsApp backend server running on port ${port}`);
});
