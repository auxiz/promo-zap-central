
/**
 * Client initializer for WhatsApp connections
 * Handles the initialization of WhatsApp clients
 */

const instanceModel = require('../../models/instance');
const { createClient } = require('../clientFactory');
const errorTracker = require('../errorTracker');
const metricsTracker = require('../metricsTracker');

// Initialize WhatsApp client for a specific instance
const initializeClient = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  
  // If client already exists and is connected, return it
  if (instance.client && instance.isConnected) {
    return instance.client;
  }
  
  // Reset reconnection state if initializing manually
  instanceModel.updateSessionData(instanceId, {
    reconnectAttempts: 0,
    isReconnecting: false,
    lastActive: Date.now()
  });
  
  // Create and initialize new client
  const client = createClient(instanceId);
  instance.client = client;
  
  // Initialize client with proper error handling
  client.initialize().catch(error => {
    errorTracker.trackError(
      instanceId,
      'CONNECTION', 
      `Error initializing WhatsApp client for instance ${instanceId}`, 
      error
    );
    
    // Get reconnection manager and trigger reconnection flow
    const reconnectionManager = require('./reconnectionManager');
    
    // Trigger reconnection flow if this wasn't triggered by reconnection already
    if (!instance.sessionData.isReconnecting) {
      reconnectionManager.attemptReconnection(instanceId);
    }
  });
  
  // Record reconnection attempt in metrics
  metricsTracker.recordReconnection(instanceId);
  
  return client;
};

// Clear QR code for a specific instance
const clearQRCode = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  instance.qrCodeDataUrl = null;
};

module.exports = {
  initializeClient,
  clearQRCode
};
