
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
  monitoredGroups: [],
  sendGroups: [],
  client: null
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

module.exports = {
  getInstance,
  ensureInstance,
  instances
};
