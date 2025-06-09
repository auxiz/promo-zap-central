
/**
 * Isolated reconnection manager for WhatsApp instances
 * Handles automatic reconnection with complete instance isolation
 */

const instanceModel = require('../../models/instance');
const errorTracker = require('../errorTracker');

// Store reconnection timers per instance to avoid conflicts
const reconnectionTimers = new Map();
const reconnectionCircuits = new Map();

// Circuit breaker states per instance
const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN', 
  HALF_OPEN: 'HALF_OPEN'
};

// Initialize circuit breaker for instance
const initInstanceCircuit = (instanceId) => {
  if (!reconnectionCircuits.has(instanceId)) {
    reconnectionCircuits.set(instanceId, {
      state: CIRCUIT_STATES.CLOSED,
      failures: 0,
      lastFailure: null,
      failureThreshold: 3,
      recoveryTimeout: 300000 // 5 minutes
    });
  }
};

// Check if instance can attempt reconnection
const canInstanceReconnect = (instanceId) => {
  initInstanceCircuit(instanceId);
  const circuit = reconnectionCircuits.get(instanceId);
  const now = Date.now();
  
  switch (circuit.state) {
    case CIRCUIT_STATES.CLOSED:
      return true;
    case CIRCUIT_STATES.OPEN:
      if (now - circuit.lastFailure >= circuit.recoveryTimeout) {
        circuit.state = CIRCUIT_STATES.HALF_OPEN;
        console.log(`Circuit breaker for instance ${instanceId} moved to HALF_OPEN`);
        return true;
      }
      return false;
    case CIRCUIT_STATES.HALF_OPEN:
      return true;
    default:
      return false;
  }
};

// Record reconnection success for instance
const recordInstanceSuccess = (instanceId) => {
  const circuit = reconnectionCircuits.get(instanceId);
  if (circuit) {
    circuit.state = CIRCUIT_STATES.CLOSED;
    circuit.failures = 0;
    circuit.lastFailure = null;
    console.log(`Circuit breaker for instance ${instanceId} reset to CLOSED`);
  }
};

// Record reconnection failure for instance
const recordInstanceFailure = (instanceId, error) => {
  initInstanceCircuit(instanceId);
  const circuit = reconnectionCircuits.get(instanceId);
  
  circuit.failures++;
  circuit.lastFailure = Date.now();
  
  if (circuit.failures >= circuit.failureThreshold) {
    circuit.state = CIRCUIT_STATES.OPEN;
    console.log(`Circuit breaker for instance ${instanceId} OPENED due to ${circuit.failures} failures`);
  }
  
  console.log(`Reconnection failure for instance ${instanceId}: ${circuit.failures}/${circuit.failureThreshold}`);
};

// Attempt reconnection for a specific instance (completely isolated)
const attemptInstanceReconnection = (instanceId) => {
  // Clear any existing timer for this instance
  if (reconnectionTimers.has(instanceId)) {
    clearTimeout(reconnectionTimers.get(instanceId));
    reconnectionTimers.delete(instanceId);
  }
  
  const instance = instanceModel.getInstance(instanceId);
  const sessionData = instance.sessionData;
  
  // Check circuit breaker
  if (!canInstanceReconnect(instanceId)) {
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
  
  const reconnect = async () => {
    const instance = instanceModel.getInstance(instanceId);
    const sessionData = instance.sessionData;
    
    // Double-check circuit breaker and attempt limits
    if (!canInstanceReconnect(instanceId) || 
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
    
    // Calculate delay with exponential backoff (minimum 15 seconds, max 5 minutes)
    const baseDelay = Math.max(sessionData.reconnectDelay, 15000);
    const delay = Math.min(baseDelay * Math.pow(2, currentAttempt - 1), 300000);
    
    console.log(`Attempting isolated reconnection ${currentAttempt}/${sessionData.maxReconnectAttempts} for instance ${instanceId} in ${delay}ms`);
    
    // Store timer to allow cancellation
    const timerId = setTimeout(async () => {
      reconnectionTimers.delete(instanceId);
      
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
        
        // Create new isolated client
        const clientInitializer = require('./clientInitializer');
        await clientInitializer.initializeClient(instanceId);
        
        // Record success
        recordInstanceSuccess(instanceId);
        
        // Reset reconnection state
        instanceModel.updateSessionData(instanceId, {
          isReconnecting: false,
          reconnectAttempts: 0
        });
        
        // Update instance as active
        instanceModel.updateInstanceConfig(instanceId, {
          isActive: true,
          lastReconnection: Date.now()
        });
        
        console.log(`Isolated reconnection successful for instance ${instanceId}`);
        
      } catch (error) {
        console.error(`Reconnection attempt ${currentAttempt} failed for instance ${instanceId}:`, error);
        
        // Record failure
        recordInstanceFailure(instanceId, error);
        
        errorTracker.trackError(
          instanceId,
          'ISOLATED_RECONNECTION',
          `Isolated reconnection attempt ${currentAttempt} failed`,
          error
        );
        
        // Only continue if circuit breaker allows and we haven't hit max attempts
        const updatedInstance = instanceModel.getInstance(instanceId);
        if (updatedInstance.sessionData.reconnectAttempts < updatedInstance.sessionData.maxReconnectAttempts &&
            canInstanceReconnect(instanceId)) {
          attemptInstanceReconnection(instanceId);
        } else {
          instanceModel.updateSessionData(instanceId, {
            isReconnecting: false
          });
          instanceModel.updateInstanceConfig(instanceId, {
            isActive: false,
            lastError: Date.now(),
            errorMessage: error.message
          });
          console.log(`Giving up isolated reconnection for instance ${instanceId}`);
        }
      }
    }, delay);
    
    reconnectionTimers.set(instanceId, timerId);
  };
  
  // Start the isolated reconnection process
  reconnect();
};

// Stop reconnection for a specific instance
const stopInstanceReconnection = (instanceId) => {
  if (reconnectionTimers.has(instanceId)) {
    clearTimeout(reconnectionTimers.get(instanceId));
    reconnectionTimers.delete(instanceId);
    console.log(`Stopped reconnection timer for instance ${instanceId}`);
  }
  
  instanceModel.updateSessionData(instanceId, {
    isReconnecting: false
  });
};

// Get reconnection status for an instance
const getInstanceReconnectionStatus = (instanceId) => {
  const instance = instanceModel.getInstance(instanceId);
  const circuit = reconnectionCircuits.get(instanceId) || { state: CIRCUIT_STATES.CLOSED, failures: 0 };
  
  return {
    isReconnecting: instance.sessionData.isReconnecting,
    reconnectAttempts: instance.sessionData.reconnectAttempts,
    maxReconnectAttempts: instance.sessionData.maxReconnectAttempts,
    circuitState: circuit.state,
    circuitFailures: circuit.failures,
    canReconnect: canInstanceReconnect(instanceId),
    hasActiveTimer: reconnectionTimers.has(instanceId)
  };
};

// Emergency stop all reconnections
const emergencyStopAllReconnections = () => {
  console.log('Emergency stop: Stopping all isolated reconnection attempts');
  
  // Clear all timers
  for (const [instanceId, timerId] of reconnectionTimers.entries()) {
    clearTimeout(timerId);
    console.log(`Cleared reconnection timer for instance ${instanceId}`);
  }
  reconnectionTimers.clear();
  
  // Stop all instance reconnections
  for (const instanceId of instanceModel.getAllInstanceIds()) {
    instanceModel.updateSessionData(instanceId, {
      isReconnecting: false,
      reconnectAttempts: instanceModel.getInstance(instanceId).sessionData.maxReconnectAttempts
    });
  }
  
  // Open all circuit breakers
  for (const [instanceId, circuit] of reconnectionCircuits.entries()) {
    circuit.state = CIRCUIT_STATES.OPEN;
    circuit.lastFailure = Date.now();
  }
};

module.exports = {
  attemptInstanceReconnection,
  stopInstanceReconnection,
  getInstanceReconnectionStatus,
  emergencyStopAllReconnections,
  canInstanceReconnect,
  recordInstanceSuccess,
  recordInstanceFailure
};
