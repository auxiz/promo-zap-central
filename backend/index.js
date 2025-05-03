const express = require('express');
const cors = require('cors');
const whatsappRoutes = require('./routes/whatsapp');
const shopeeRoutes = require('./routes/shopee');
const templatesRoutes = require('./routes/templates');
const activityModule = require('./routes/activity');
const whatsappClient = require('./whatsapp/client');
const shopeeUtils = require('./utils/shopee');

// Initialize express app
const app = express();
const port = 4000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Extract routes and activity functions
const activityRoutes = activityModule.router;
const { addActivity } = activityModule;

// Register routes
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/shopee', shopeeRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/activity', activityRoutes);

// Get the default client instance
const defaultInstance = 'default';
const connectionManager = require('./whatsapp/services/connectionManager');
const stateManager = require('./whatsapp/services/stateManager');
const instanceModel = require('./whatsapp/models/instance');

// Initialize default client
const defaultClient = connectionManager.initializeClient(defaultInstance);

// Handle incoming messages for affiliate link conversion
defaultClient.on('message', async (message) => {
  try {
    // Check if message is from a monitored group
    const monitoredGroups = stateManager.getMonitoredGroups(defaultInstance);
    if (!monitoredGroups.includes(message.from)) {
      return; // Not from a monitored group, ignore
    }

    const originalText = message.body;
    console.log(`Message received from monitored group: ${message.from}`);

    // Get Shopee credentials and send groups
    const credentials = shopeeUtils.getShopeeCredentials();
    const sendGroups = stateManager.getSendGroups(defaultInstance);
    
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
          
          // Record activity for this conversion
          const productTitle = shopeeUrl.split('/').pop() || 'Produto';
          addActivity('converted', productTitle);
        }
      } catch (error) {
        console.error(`Error converting URL ${shopeeUrl}:`, error);
      }
    }

    // Only forward if text was modified
    if (modifiedText !== originalText) {
      // Forward modified message to all send groups
      const defaultInstance = instanceModel.getInstance('default');
      if (defaultInstance.client && defaultInstance.isConnected) {
        // Forward modified message to all send groups
        for (const groupId of sendGroups) {
          try {
            await defaultInstance.client.sendMessage(groupId, modifiedText);
            console.log(`Message forwarded to group: ${groupId}`);
          } catch (error) {
            console.error(`Error forwarding message to group ${groupId}:`, error);
          }
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
