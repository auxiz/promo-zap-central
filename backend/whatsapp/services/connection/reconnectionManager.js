
/**
 * Reconnection manager for WhatsApp
 * Handles automatic reconnection with exponential backoff
 * Optimized for WPPConnect's session persistence
 */

const instanceModel = require('../../models/instance');
const errorTracker = require('../errorTracker');

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
        // WPPConnect handles token restoration automatically
        // We only need to destroy the existing client if it exists
        if (instance.client) {
          try {
            await instance.client.close();
          } catch (error) {
            // Ignore errors during cleanup
            console.error(`Error closing client during reconnection for instance ${instanceId}:`, error);
          }
        }
        
        // Reset client state
        instance.client = null;
        instance.isConnected = false;
        
        // Create new client with WPPConnect
        const clientInitializer = require('./clientInitializer');
        await clientInitializer.initializeClient(instanceId);
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
  attemptReconnection,
  configureReconnection,
  getReconnectionStatus
};
