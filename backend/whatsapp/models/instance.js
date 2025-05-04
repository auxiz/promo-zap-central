
/**
 * Instance model for WhatsApp client
 * Handles the state and data for each WhatsApp client instance
 */

// Create instance object structure
const createInstanceObject = (instanceId) => ({
  qrCodeDataUrl: null,
  isConnected: false,
  device: null,
  connectionTime: null,
  disconnectionTime: null,
  monitoredGroups: [],
  sendGroups: [],
  client: null,
  // New fields for advanced session management
  sessionData: {
    lastActive: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 5000, // 5 seconds initial delay
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

module.exports = {
  getInstance,
  ensureInstance,
  instances,
  updateSessionData,
  getAllInstanceIds,
  instanceExists
};
