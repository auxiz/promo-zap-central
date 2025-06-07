
/**
 * Reconnection manager for WhatsApp with resource protection
 * Handles automatic reconnection with circuit breaker protection
 */

const instanceModel = require('../../models/instance');
const errorTracker = require('../errorTracker');
const circuitBreaker = require('./circuitBreaker');

// Automatic reconnection with circuit breaker protection
const attemptReconnection = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  const sessionData = instance.sessionData;
  
  // Check circuit breaker first
  if (!circuitBreaker.canAttemptConnection(instanceId)) {
    console.log(`Reconnection blocked by circuit breaker for instance ${instanceId}`);
    return;
  }
  
  // Don't attempt reconnection if already reconnecting
  if (sessionData.isReconnecting) {
    console.log(`Already reconnecting instance ${instanceId}`);
    return;
  }
  
  // Check if we've exceeded max reconnection attempts
  if (sessionData.reconnectAttempts >= sessionData.maxReconnectAttempts) {
    console.log(`Maximum reconnection attempts (${sessionData.maxReconnectAttempts}) reached for instance ${instanceId}`);
    instanceModel.updateSessionData(instanceId, {
      isReconnecting: false
    });
    return;
  }
  
  // Mark as reconnecting
  instanceModel.updateSessionData(instanceId, {
    isReconnecting: true
  });
  
  // Record connection attempt start
  circuitBreaker.recordConnectionStart(instanceId);
  
  const reconnect = async () => {
    const instance = instanceModel.getInstance(instanceId);
    const sessionData = instance.sessionData;
    
    // Double-check circuit breaker and attempt limits
    if (!circuitBreaker.canAttemptConnection(instanceId) || 
        sessionData.reconnectAttempts >= sessionData.maxReconnectAttempts) {
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
    
    // Calculate delay with exponential backoff (minimum 10 seconds, max 5 minutes)
    const baseDelay = Math.max(sessionData.reconnectDelay, 10000);
    const delay = Math.min(baseDelay * Math.pow(2, currentAttempt - 1), 300000);
    
    console.log(`Attempting reconnection ${currentAttempt}/${sessionData.maxReconnectAttempts} for instance ${instanceId} in ${delay}ms`);
    
    // Wait for delay then attempt reconnection
    setTimeout(async () => {
      try {
        // Check again if we should still reconnect
        const currentInstance = instanceModel.getInstance(instanceId);
        if (!currentInstance.sessionData.isReconnecting) {
          console.log(`Reconnection cancelled for instance ${instanceId}`);
          return;
        }
        
        // Clean up existing client
        if (instance.client) {
          try {
            await instance.client.close();
          } catch (error) {
            console.error(`Error closing client during reconnection for instance ${instanceId}:`, error);
          }
        }
        
        // Reset client state
        instance.client = null;
        instance.isConnected = false;
        
        // Create new client
        const clientInitializer = require('./clientInitializer');
        await clientInitializer.initializeClient(instanceId);
        
        // Record success
        circuitBreaker.recordConnectionSuccess(instanceId);
        
        // Reset reconnection state
        instanceModel.updateSessionData(instanceId, {
          isReconnecting: false,
          reconnectAttempts: 0
        });
        
        console.log(`Reconnection successful for instance ${instanceId}`);
        
      } catch (error) {
        console.error(`Reconnection attempt ${currentAttempt} failed for instance ${instanceId}:`, error);
        
        // Record failure
        circuitBreaker.recordConnectionFailure(instanceId, error);
        
        errorTracker.trackError(
          instanceId,
          'RECONNECTION',
          `Reconnection attempt ${currentAttempt} failed`,
          error
        );
        
        // Only continue if circuit breaker allows and we haven't hit max attempts
        const updatedInstance = instanceModel.getInstance(instanceId);
        if (updatedInstance.sessionData.reconnectAttempts < updatedInstance.sessionData.maxReconnectAttempts &&
            circuitBreaker.canAttemptConnection(instanceId)) {
          reconnect();
        } else {
          instanceModel.updateSessionData(instanceId, {
            isReconnecting: false
          });
          console.log(`Giving up reconnection for instance ${instanceId}`);
        }
      }
    }, delay);
  };
  
  // Start the reconnection process
  reconnect();
};

// Set configuration for reconnection with stricter limits
const configureReconnection = (instanceId = 'default', maxAttempts = 3, baseDelay = 15000) => {
  // Enforce stricter limits to prevent resource exhaustion
  const safeMaxAttempts = Math.min(Math.max(maxAttempts, 1), 5);
  const safeBaseDelay = Math.max(baseDelay, 15000); // Minimum 15 seconds
  
  instanceModel.updateSessionData(instanceId, {
    maxReconnectAttempts: safeMaxAttempts,
    reconnectDelay: safeBaseDelay
  });
  
  console.log(`Reconnection configured for ${instanceId}: ${safeMaxAttempts} attempts, ${safeBaseDelay}ms delay`);
};

// Get reconnection status for an instance
const getReconnectionStatus = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  const circuitStatus = circuitBreaker.getCircuitStatus(instanceId);
  
  return {
    isReconnecting: instance.sessionData.isReconnecting,
    reconnectAttempts: instance.sessionData.reconnectAttempts,
    maxReconnectAttempts: instance.sessionData.maxReconnectAttempts,
    circuitState: circuitStatus.state,
    canReconnect: circuitBreaker.canAttemptConnection(instanceId)
  };
};

// Emergency stop all reconnections
const emergencyStopReconnections = () => {
  console.log('Emergency stop: Stopping all reconnection attempts');
  circuitBreaker.emergencyStop();
  
  // Stop all instance reconnections
  for (const instanceId of instanceModel.getAllInstanceIds()) {
    instanceModel.updateSessionData(instanceId, {
      isReconnecting: false,
      reconnectAttempts: instanceModel.getInstance(instanceId).sessionData.maxReconnectAttempts
    });
  }
};

module.exports = {
  attemptReconnection,
  configureReconnection,
  getReconnectionStatus,
  emergencyStopReconnections
};
