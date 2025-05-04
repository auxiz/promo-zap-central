
/**
 * Connection manager for WhatsApp
 * Handles the initialization and destruction of client connections
 */

const instanceModel = require('../models/instance');
const { createClient } = require('./clientFactory');
const errorTracker = require('./errorTracker');
const metricsTracker = require('./metricsTracker');

// Max reconnection attempts before giving up
const MAX_RECONNECT_ATTEMPTS = 5;
// Base reconnection delay in ms (will be multiplied by attempt count for exponential backoff)
const BASE_RECONNECT_DELAY = 5000;

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
    
    // Trigger reconnection flow if this wasn't triggered by reconnection already
    if (!instance.sessionData.isReconnecting) {
      attemptReconnection(instanceId);
    }
  });
  
  // Record reconnection attempt in metrics
  metricsTracker.recordReconnection(instanceId);
  
  return client;
};

// Automatic reconnection with exponential backoff
const attemptReconnection = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  const sessionData = instance.sessionData;
  
  // Don't attempt reconnection if already reconnecting
  if (sessionData.isReconnecting) {
    return;
  }
  
  // Mark as reconnecting
  instanceModel.updateSessionData(instanceId, {
    isReconnecting: true
  });
  
  // Implement exponential backoff for reconnection
  const reconnect = async () => {
    const instance = instanceModel.getInstance(instanceId);
    const sessionData = instance.sessionData;
    
    // Check if we've exceeded max reconnection attempts
    if (sessionData.reconnectAttempts >= sessionData.maxReconnectAttempts) {
      console.log(`Maximum reconnection attempts (${sessionData.maxReconnectAttempts}) reached for instance ${instanceId}. Giving up.`);
      
      // Reset reconnection state but don't attempt further reconnections
      instanceModel.updateSessionData(instanceId, {
        isReconnecting: false
      });
      
      return;
    }
    
    // Increment reconnection attempts
    const currentAttempt = sessionData.reconnectAttempts + 1;
    instanceModel.updateSessionData(instanceId, {
      reconnectAttempts: currentAttempt
    });
    
    // Calculate delay with exponential backoff (5s, 10s, 20s, 40s, 80s)
    const delay = sessionData.reconnectDelay * Math.pow(2, currentAttempt - 1);
    console.log(`Attempting reconnection ${currentAttempt}/${sessionData.maxReconnectAttempts} for instance ${instanceId} in ${delay}ms`);
    
    // Wait for delay then attempt reconnection
    setTimeout(async () => {
      try {
        // Destroy existing client if any
        if (instance.client) {
          try {
            await instance.client.destroy();
          } catch (error) {
            // Ignore errors during cleanup
            console.error(`Error destroying client during reconnection for instance ${instanceId}:`, error);
          }
        }
        
        // Reset client state
        instance.client = null;
        instance.isConnected = false;
        
        // Create new client
        initializeClient(instanceId);
      } catch (error) {
        errorTracker.trackError(
          instanceId,
          'RECONNECTION',
          `Error during reconnection attempt ${currentAttempt} for instance ${instanceId}`,
          error
        );
        
        // Continue reconnection attempts
        reconnect();
      }
    }, delay);
  };
  
  // Start the reconnection process
  reconnect();
};

// Destroy WhatsApp client for a specific instance
const destroyClient = async (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  
  // Stop any ongoing reconnection attempts
  instanceModel.updateSessionData(instanceId, {
    isReconnecting: false
  });
  
  if (instance.client) {
    try {
      // Record connection ended for metrics
      metricsTracker.recordConnectionEnd(instanceId);
      
      // Record disconnection time
      instance.disconnectionTime = Date.now();
      
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

// Check and restore all active instances (for application restart)
const restoreInstances = async () => {
  const instanceIds = instanceModel.getAllInstanceIds();
  console.log(`Attempting to restore ${instanceIds.length} WhatsApp instances on startup`);
  
  for (const instanceId of instanceIds) {
    try {
      initializeClient(instanceId);
      console.log(`Restored WhatsApp instance: ${instanceId}`);
    } catch (error) {
      console.error(`Failed to restore WhatsApp instance ${instanceId}:`, error);
    }
  }
};

// Set configuration for reconnection
const configureReconnection = (instanceId = 'default', maxAttempts = 5, baseDelay = 5000) => {
  instanceModel.updateSessionData(instanceId, {
    maxReconnectAttempts: maxAttempts,
    reconnectDelay: baseDelay
  });
};

// Get reconnection status for an instance
const getReconnectionStatus = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return {
    isReconnecting: instance.sessionData.isReconnecting,
    reconnectAttempts: instance.sessionData.reconnectAttempts,
    maxReconnectAttempts: instance.sessionData.maxReconnectAttempts
  };
};

module.exports = {
  initializeClient,
  destroyClient,
  clearQRCode,
  attemptReconnection,
  restoreInstances,
  configureReconnection,
  getReconnectionStatus
};
