
/**
 * Client initializer for WhatsApp connections
 * Handles the initialization of WPPConnect clients
 */

const instanceModel = require('../../models/instance');
const { createClient } = require('../clientFactory');
const errorTracker = require('../errorTracker');
const metricsTracker = require('../metricsTracker');

// Initialize WhatsApp client for a specific instance
const initializeClient = async (instanceId = 'default') => {
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
  
  try {
    // Create and initialize new client
    const client = await createClient(instanceId);
    instance.client = client;
    
    // Record reconnection attempt in metrics
    metricsTracker.recordReconnection(instanceId);
    
    return client;
  } catch (error) {
    errorTracker.trackError(
      instanceId,
      'CONNECTION', 
      `Error initializing WPPConnect client for instance ${instanceId}`, 
      error
    );
    
    // Get reconnection manager and trigger reconnection flow
    const reconnectionManager = require('./reconnectionManager');
    
    // Trigger reconnection flow if this wasn't triggered by reconnection already
    if (!instance.sessionData.isReconnecting) {
      reconnectionManager.attemptReconnection(instanceId);
    }
    
    throw error;
  }
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
