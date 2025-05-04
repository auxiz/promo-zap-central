
/**
 * Instance restorer for WhatsApp
 * Handles restoring WhatsApp instances during application startup
 */

const instanceModel = require('../../models/instance');

// Check and restore all active instances (for application restart)
const restoreInstances = async () => {
  const instanceIds = instanceModel.getAllInstanceIds();
  console.log(`Attempting to restore ${instanceIds.length} WhatsApp instances on startup`);
  
  for (const instanceId of instanceIds) {
    try {
      // Get client initializer
      const clientInitializer = require('./clientInitializer');
      clientInitializer.initializeClient(instanceId);
      console.log(`Restored WhatsApp instance: ${instanceId}`);
    } catch (error) {
      console.error(`Failed to restore WhatsApp instance ${instanceId}:`, error);
    }
  }
};

module.exports = {
  restoreInstances
};
