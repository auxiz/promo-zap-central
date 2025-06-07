
/**
 * Instance model for WhatsApp client with resource optimization
 * Handles the state and data for each WhatsApp client instance
 */

// Create instance object structure with conservative defaults
const createInstanceObject = (instanceId) => ({
  qrCodeDataUrl: null,
  isConnected: false,
  device: null,
  connectionTime: null,
  disconnectionTime: null,
  monitoredGroups: [],
  sendGroups: [],
  client: null,
  // Conservative session management to reduce resource usage
  sessionData: {
    lastActive: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 3,     // Reduced from 5 to 3
    reconnectDelay: 15000,       // Increased from 5s to 15s
    isReconnecting: false
  }
});

// Store instances state
const instances = {
  default: createInstanceObject('default')
};

// Initialize an instance if it doesn't exist
const ensureInstance = (instanceId) => {
  if (!instances[instanceId]) {
    instances[instanceId] = createInstanceObject(instanceId);
    console.log(`Created new instance ${instanceId} with conservative settings`);
  }
};

// Get instance state or create if doesn't exist
const getInstance = (instanceId = 'default') => {
  ensureInstance(instanceId);
  return instances[instanceId];
};

// Update session data for an instance
const updateSessionData = (instanceId, updates) => {
  const instance = getInstance(instanceId);
  instance.sessionData = {
    ...instance.sessionData,
    ...updates
  };
  return instance;
};

// Get all instance IDs
const getAllInstanceIds = () => {
  return Object.keys(instances);
};

// Check if an instance exists
const instanceExists = (instanceId) => {
  return !!instances[instanceId];
};

// Clean up inactive instances to free memory
const cleanupInactiveInstances = () => {
  const now = Date.now();
  const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
  
  for (const instanceId of Object.keys(instances)) {
    const instance = instances[instanceId];
    
    // Don't cleanup default instance
    if (instanceId === 'default') continue;
    
    // Check if instance is inactive
    if (!instance.isConnected && 
        instance.sessionData.lastActive && 
        now - instance.sessionData.lastActive > inactiveThreshold) {
      
      console.log(`Cleaning up inactive instance: ${instanceId}`);
      
      // Clean up client if exists
      if (instance.client) {
        try {
          instance.client.close();
        } catch (error) {
          console.error(`Error closing client during cleanup for ${instanceId}:`, error);
        }
      }
      
      // Remove from memory
      delete instances[instanceId];
    }
  }
};

// Auto cleanup every 10 minutes
setInterval(cleanupInactiveInstances, 10 * 60 * 1000);

module.exports = {
  getInstance,
  ensureInstance,
  instances,
  updateSessionData,
  getAllInstanceIds,
  instanceExists,
  cleanupInactiveInstances
};
