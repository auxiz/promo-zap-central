/**
 * Instance model for WhatsApp client with complete isolation support
 * Handles the state and data for each WhatsApp client instance independently
 */

const fs = require('fs');
const path = require('path');

// Ensure instance configurations directory exists
const INSTANCE_CONFIG_DIR = path.join(process.cwd(), 'whatsapp-instance-configs');
if (!fs.existsSync(INSTANCE_CONFIG_DIR)) {
  fs.mkdirSync(INSTANCE_CONFIG_DIR, { recursive: true });
}

// Create instance object structure with complete isolation
const createInstanceObject = (instanceId) => ({
  id: instanceId,
  qrCodeDataUrl: null,
  isConnected: false,
  device: null,
  connectionTime: null,
  disconnectionTime: null,
  monitoredGroups: [],
  sendGroups: [],
  client: null,
  // Instance-specific session management
  sessionData: {
    lastActive: Date.now(),
    reconnectAttempts: 0,
    maxReconnectAttempts: 3,
    reconnectDelay: 15000,
    isReconnecting: false,
    persistentSession: true,
    sessionPath: path.join(process.cwd(), 'whatsapp-sessions', instanceId),
    configPath: path.join(INSTANCE_CONFIG_DIR, `${instanceId}.json`)
  },
  // Instance configuration
  config: {
    name: instanceId === 'default' ? 'Principal' : `Instância ${instanceId}`,
    autoReconnect: true,
    monitorGroups: true,
    createdAt: Date.now(),
    isActive: false
  }
});

// Store instances state
const instances = {};

// Load instance configuration from disk
const loadInstanceConfig = (instanceId) => {
  const configPath = path.join(INSTANCE_CONFIG_DIR, `${instanceId}.json`);
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      console.log(`Loaded configuration for instance ${instanceId}`);
      return config;
    }
  } catch (error) {
    console.error(`Error loading config for instance ${instanceId}:`, error);
  }
  return null;
};

// Save instance configuration to disk
const saveInstanceConfig = (instanceId, config) => {
  const configPath = path.join(INSTANCE_CONFIG_DIR, `${instanceId}.json`);
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`Saved configuration for instance ${instanceId}`);
  } catch (error) {
    console.error(`Error saving config for instance ${instanceId}:`, error);
  }
};

// Initialize an instance if it doesn't exist
const ensureInstance = (instanceId) => {
  if (!instances[instanceId]) {
    instances[instanceId] = createInstanceObject(instanceId);
    
    // Load existing configuration if available
    const savedConfig = loadInstanceConfig(instanceId);
    if (savedConfig) {
      instances[instanceId].config = { ...instances[instanceId].config, ...savedConfig };
      instances[instanceId].monitoredGroups = savedConfig.monitoredGroups || [];
      instances[instanceId].sendGroups = savedConfig.sendGroups || [];
    }
    
    console.log(`Created/restored instance ${instanceId} with isolated session`);
  }
};

// Get instance state or create if doesn't exist
const getInstance = (instanceId = 'default') => {
  ensureInstance(instanceId);
  return instances[instanceId];
};

// Update instance configuration and persist to disk
const updateInstanceConfig = (instanceId, configUpdates) => {
  const instance = getInstance(instanceId);
  instance.config = { ...instance.config, ...configUpdates };
  
  // Save configuration to disk
  const configToSave = {
    ...instance.config,
    monitoredGroups: instance.monitoredGroups,
    sendGroups: instance.sendGroups,
    lastUpdated: Date.now()
  };
  saveInstanceConfig(instanceId, configToSave);
  
  return instance;
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

// Get all active instances with their status
const getAllInstancesStatus = () => {
  const status = {};
  for (const instanceId of Object.keys(instances)) {
    const instance = instances[instanceId];
    status[instanceId] = {
      id: instanceId,
      name: instance.config.name,
      isConnected: instance.isConnected,
      device: instance.device,
      connectionTime: instance.connectionTime,
      disconnectionTime: instance.disconnectionTime,
      isReconnecting: instance.sessionData.isReconnecting,
      reconnectAttempts: instance.sessionData.reconnectAttempts,
      isActive: instance.config.isActive,
      monitoredGroupsCount: instance.monitoredGroups.length,
      sendGroupsCount: instance.sendGroups.length
    };
  }
  return status;
};

// Check if an instance exists
const instanceExists = (instanceId) => {
  return !!instances[instanceId];
};

// Delete an instance completely (cleanup sessions and configs)
const deleteInstance = (instanceId) => {
  if (instanceId === 'default') {
    console.log('Cannot delete default instance');
    return false;
  }
  
  const instance = instances[instanceId];
  if (instance) {
    // Clean up client if exists
    if (instance.client) {
      try {
        instance.client.close();
      } catch (error) {
        console.error(`Error closing client during deletion for ${instanceId}:`, error);
      }
    }
    
    // Clean up session directory
    const sessionPath = instance.sessionData.sessionPath;
    if (fs.existsSync(sessionPath)) {
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`Cleaned up session directory for ${instanceId}`);
      } catch (error) {
        console.error(`Error cleaning session directory for ${instanceId}:`, error);
      }
    }
    
    // Remove configuration file
    const configPath = instance.sessionData.configPath;
    if (fs.existsSync(configPath)) {
      try {
        fs.unlinkSync(configPath);
        console.log(`Removed configuration file for ${instanceId}`);
      } catch (error) {
        console.error(`Error removing config file for ${instanceId}:`, error);
      }
    }
    
    // Remove from memory
    delete instances[instanceId];
    console.log(`Instance ${instanceId} deleted completely`);
    return true;
  }
  
  return false;
};

// Restore all saved instances on startup
const restoreAllInstances = () => {
  console.log('Restoring all saved instances...');
  
  if (!fs.existsSync(INSTANCE_CONFIG_DIR)) {
    console.log('No instance configurations to restore');
    return;
  }
  
  const configFiles = fs.readdirSync(INSTANCE_CONFIG_DIR).filter(file => file.endsWith('.json'));
  
  for (const configFile of configFiles) {
    const instanceId = path.basename(configFile, '.json');
    try {
      ensureInstance(instanceId);
      console.log(`Restored instance configuration: ${instanceId}`);
    } catch (error) {
      console.error(`Error restoring instance ${instanceId}:`, error);
    }
  }
  
  console.log(`Restored ${configFiles.length} instance configurations`);
};

// Clean up inactive instances to free memory (but preserve configs)
const cleanupInactiveInstances = () => {
  const now = Date.now();
  const inactiveThreshold = 2 * 60 * 60 * 1000; // 2 hours instead of 30 minutes for better persistence
  
  for (const instanceId of Object.keys(instances)) {
    const instance = instances[instanceId];
    
    // Don't cleanup default instance or active instances
    if (instanceId === 'default' || instance.isConnected) continue;
    
    // Check if instance is inactive
    if (instance.sessionData.lastActive && 
        now - instance.sessionData.lastActive > inactiveThreshold) {
      
      console.log(`Cleaning up inactive instance from memory: ${instanceId}`);
      
      // Save current state before cleanup
      updateInstanceConfig(instanceId, { 
        isActive: false, 
        lastCleanup: now 
      });
      
      // Clean up client if exists but keep configuration
      if (instance.client) {
        try {
          instance.client.close();
        } catch (error) {
          console.error(`Error closing client during cleanup for ${instanceId}:`, error);
        }
      }
      
      // Remove from memory but keep config files
      delete instances[instanceId];
    }
  }
};

// Auto cleanup every 30 minutes but keep configs
setInterval(cleanupInactiveInstances, 30 * 60 * 1000);

// Initialize default instance
ensureInstance('default');

// Restore all instances on startup
restoreAllInstances();

module.exports = {
  getInstance,
  ensureInstance,
  instances,
  updateSessionData,
  updateInstanceConfig,
  getAllInstanceIds,
  getAllInstancesStatus,
  instanceExists,
  deleteInstance,
  restoreAllInstances,
  cleanupInactiveInstances
};
