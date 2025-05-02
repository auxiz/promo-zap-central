
/**
 * Connection manager for WhatsApp
 * Handles the initialization and destruction of client connections
 */

const instanceModel = require('../models/instance');
const { createClient } = require('./clientFactory');
const errorTracker = require('./errorTracker');

// Initialize WhatsApp client for a specific instance
const initializeClient = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  
  // If client already exists, return it
  if (instance.client) {
    return instance.client;
  }
  
  // Create and initialize new client
  const client = createClient(instanceId);
  instance.client = client;
  
  client.initialize().catch(error => {
    errorTracker.trackError(
      instanceId,
      'CONNECTION', 
      `Error initializing WhatsApp client for instance ${instanceId}`, 
      error
    );
  });
  
  return client;
};

// Destroy WhatsApp client for a specific instance
const destroyClient = async (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  
  if (instance.client) {
    try {
      await instance.client.destroy();
      instance.client = null;
      instance.isConnected = false;
      instance.device = null;
      instance.connectionTime = null;
      instance.qrCodeDataUrl = null;
      console.log(`Client for instance ${instanceId} destroyed successfully`);
      errorTracker.resetRetryAttempts(instanceId);
      return true;
    } catch (error) {
      errorTracker.trackError(
        instanceId,
        'DISCONNECTION',
        `Error destroying client for instance ${instanceId}`,
        error
      );
      return false;
    }
  }
  
  return true; // No client to destroy
};

// Clear QR code for a specific instance
const clearQRCode = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  instance.qrCodeDataUrl = null;
};

module.exports = {
  initializeClient,
  destroyClient,
  clearQRCode
};
