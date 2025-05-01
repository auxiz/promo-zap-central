
const express = require('express');
const cors = require('cors');
const whatsappRoutes = require('./routes/whatsapp');
const shopeeRoutes = require('./routes/shopee');
const whatsappClient = require('./whatsapp/client');
const shopeeUtils = require('./utils/shopeeUtils');

// Initialize express app
const app = express();
const port = 4000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/shopee', shopeeRoutes);

// Handle incoming messages for affiliate link conversion
whatsappClient.client.on('message', async (message) => {
  try {
    // Check if message is from a monitored group
    const monitoredGroups = whatsappClient.getMonitoredGroups();
    if (!monitoredGroups.includes(message.from)) {
      return; // Not from a monitored group, ignore
    }

    const originalText = message.body;
    console.log(`Message received from monitored group: ${message.from}`);

    // Get Shopee credentials and send groups
    const credentials = shopeeUtils.getShopeeCredentials();
    const sendGroups = whatsappClient.getSendGroups();
    
    // Skip if no Shopee credentials or no send groups configured
    if (!credentials.appId || sendGroups.length === 0) {
      console.log('Skipping message forwarding: missing credentials or send groups');
      return;
    }

    // Look for Shopee URLs in the message
    const shopeeUrls = shopeeUtils.extractShopeeUrls(originalText);
    if (shopeeUrls.length === 0) {
      console.log('No Shopee URLs found in message');
      return;
    }

    // Convert Shopee URLs to affiliate links
    let modifiedText = originalText;
    for (const shopeeUrl of shopeeUrls) {
      try {
        const affiliateUrl = await shopeeUtils.convertToAffiliateLink(shopeeUrl);
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
          await whatsappClient.client.sendMessage(groupId, modifiedText);
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

// Start the server
app.listen(port, () => {
  console.log(`WhatsApp backend server running on port ${port}`);
});
